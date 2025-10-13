#!/usr/bin/env python3
"""
Course Service - AI-Powered Course Management
============================================

This service provides comprehensive course management with AI-powered content generation,
YouTube integration, and progress tracking capabilities.

Features:
- Course CRUD operations
- AI-powered content generation using Groq
- YouTube video integration and recommendations
- Progress tracking and analytics
- Notebook generation (concepts, analogies, mind maps)

Author: StudyMate Platform
Version: 1.0.0
"""

import os
import json
import logging
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend root
backend_root = Path(__file__).parent.parent.parent
env_path = backend_root / ".env"
load_dotenv(dotenv_path=env_path)

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import httpx

# Import shared database utilities
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from shared.database.supabase_connection import (
    SupabaseManager, init_database, close_database, health_check as db_health_check
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global database manager
supabase_manager = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan with proper startup and shutdown."""
    global supabase_manager
    
    # Startup
    try:
        supabase_manager = SupabaseManager()
        await asyncio.to_thread(supabase_manager.connect)
        logger.info("🚀 Course Service started successfully")
    except Exception as e:
        logger.warning(f"⚠️ Database not available, running in offline mode: {e}")
        supabase_manager = None
    
    yield
    
    # Shutdown
    try:
        if supabase_manager:
            await asyncio.to_thread(supabase_manager.disconnect)
        logger.info("🛑 Course Service shutdown complete")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

# Initialize FastAPI app
app = FastAPI(
    title="Course Service",
    description="AI-Powered Course Management Service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class CourseCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    purpose: str = Field(..., pattern="^(exam|job_interview|practice|coding_preparation|other)$")
    difficulty: str = Field(..., pattern="^(beginner|intermediate|advanced|expert)$")
    summary: Optional[str] = Field(None, max_length=1000)
    user_id: str = Field(..., description="User UUID")

class CourseUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    purpose: Optional[str] = Field(None, pattern="^(exam|job_interview|practice|coding_preparation|other)$")
    difficulty: Optional[str] = Field(None, pattern="^(beginner|intermediate|advanced|expert)$")
    summary: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = Field(None, pattern="^(draft|generating|ready|published)$")

class ChapterCreateRequest(BaseModel):
    course_id: str
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    order_number: int = Field(..., ge=1)
    estimated_reading_time: Optional[int] = Field(None, ge=1)

class ProgressTrackRequest(BaseModel):
    user_id: str
    course_id: str
    chapter_id: Optional[str] = None
    flashcard_id: Optional[str] = None
    mcq_id: Optional[str] = None
    progress_type: str = Field(..., pattern="^(chapter_read|flashcard_reviewed|mcq_answered|resource_viewed)$")
    score: Optional[int] = Field(None, ge=0, le=100)
    time_spent: Optional[int] = Field(None, ge=0)

class AIContentGenerationRequest(BaseModel):
    course_id: str
    content_type: str = Field(..., pattern="^(flashcards|mcqs|qnas|notebook|resources)$")
    topic: str = Field(..., min_length=1)
    difficulty: Optional[str] = Field("medium", pattern="^(easy|medium|hard)$")
    count: Optional[int] = Field(5, ge=1, le=20)

# Database dependency
async def get_db():
    """Get database connection dependency."""
    if not supabase_manager:
        raise HTTPException(
            status_code=503,
            detail="Database service unavailable"
        )
    return supabase_manager

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Try to get database status if available
        if supabase_manager:
            try:
                db_status = {
                    "status": "connected",
                    "database": "supabase_postgresql",
                    "timestamp": datetime.utcnow().isoformat()
                }
            except Exception as e:
                db_status = {
                    "status": "error",
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                }
        else:
            db_status = {
                "status": "offline",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        return {
            "status": "healthy",
            "service": "course-service",
            "database": db_status,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy", 
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

# Course CRUD endpoints
@app.post("/courses")
async def create_course(request: CourseCreateRequest, db: SupabaseManager = Depends(get_db)):
    """Create a new course."""
    try:
        logger.info(f"📚 Creating course: {request.title}")
        
        # Insert course into database
        query = """
        INSERT INTO courses (user_id, title, purpose, difficulty, summary)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id, user_id, title, purpose, difficulty, summary, status, 
                  progress_percentage, created_at, updated_at
        """
        
        result = await asyncio.to_thread(
            db.execute_query,
            query,
            request.user_id,
            request.title,
            request.purpose,
            request.difficulty,
            request.summary
        )
        
        if not result:
            raise HTTPException(status_code=500, detail="Failed to create course")
        
        course = result[0]
        logger.info(f"✅ Course created successfully: {course['id']}")
        
        return {
            "success": True,
            "course": course,
            "message": "Course created successfully"
        }
        
    except Exception as e:
        logger.error(f"💥 Error creating course: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/courses")
async def get_user_courses(user_id: str, db: SupabaseManager = Depends(get_db)):
    """Get all courses for a user."""
    try:
        logger.info(f"📖 Fetching courses for user: {user_id}")
        
        query = """
        SELECT id, user_id, title, purpose, difficulty, summary, status, 
               progress_percentage, completion_time_estimate, created_at, updated_at
        FROM courses 
        WHERE user_id = %s 
        ORDER BY created_at DESC
        """
        
        courses = await asyncio.to_thread(db.execute_query, query, user_id)
        
        logger.info(f"✅ Retrieved {len(courses)} courses")
        return {
            "success": True,
            "courses": courses
        }
        
    except Exception as e:
        logger.error(f"💥 Error fetching courses: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/courses/{course_id}")
async def get_course(course_id: str, db: SupabaseManager = Depends(get_db)):
    """Get a specific course by ID."""
    try:
        logger.info(f"📖 Fetching course: {course_id}")
        
        query = """
        SELECT c.*, 
               COUNT(DISTINCT ch.id) as chapter_count,
               COUNT(DISTINCT f.id) as flashcard_count,
               COUNT(DISTINCT m.id) as mcq_count,
               COUNT(DISTINCT q.id) as qna_count
        FROM courses c
        LEFT JOIN course_chapters ch ON ch.course_id = c.id
        LEFT JOIN course_flashcards f ON f.course_id = c.id
        LEFT JOIN course_mcqs m ON m.course_id = c.id
        LEFT JOIN course_qnas q ON q.course_id = c.id
        WHERE c.id = %s
        GROUP BY c.id
        """
        
        result = await asyncio.to_thread(db.execute_query, query, course_id)
        
        if not result:
            raise HTTPException(status_code=404, detail="Course not found")
        
        course = result[0]
        logger.info(f"✅ Course retrieved successfully")
        
        return {
            "success": True,
            "course": course
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Error fetching course: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/courses/{course_id}/chapters")
async def get_course_chapters(course_id: str, db: SupabaseManager = Depends(get_db)):
    """Get all chapters for a course."""
    try:
        logger.info(f"📖 Fetching chapters for course: {course_id}")
        
        query = """
        SELECT * FROM course_chapters 
        WHERE course_id = %s 
        ORDER BY order_number ASC
        """
        
        chapters = await asyncio.to_thread(db.execute_query, query, course_id)
        
        logger.info(f"✅ Retrieved {len(chapters)} chapters")
        return {
            "success": True,
            "chapters": chapters
        }
        
    except Exception as e:
        logger.error(f"💥 Error fetching chapters: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/courses/{course_id}/flashcards")
async def get_course_flashcards(course_id: str, db: SupabaseManager = Depends(get_db)):
    """Get all flashcards for a course."""
    try:
        logger.info(f"📖 Fetching flashcards for course: {course_id}")
        
        query = """
        SELECT * FROM course_flashcards 
        WHERE course_id = %s 
        ORDER BY created_at DESC
        """
        
        flashcards = await asyncio.to_thread(db.execute_query, query, course_id)
        
        logger.info(f"✅ Retrieved {len(flashcards)} flashcards")
        return {
            "success": True,
            "flashcards": flashcards
        }
        
    except Exception as e:
        logger.error(f"💥 Error fetching flashcards: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/courses/{course_id}/mcqs")
async def get_course_mcqs(course_id: str, db: SupabaseManager = Depends(get_db)):
    """Get all MCQs for a course."""
    try:
        logger.info(f"📖 Fetching MCQs for course: {course_id}")
        
        query = """
        SELECT * FROM course_mcqs 
        WHERE course_id = %s 
        ORDER BY created_at DESC
        """
        
        mcqs = await asyncio.to_thread(db.execute_query, query, course_id)
        
        logger.info(f"✅ Retrieved {len(mcqs)} MCQs")
        return {
            "success": True,
            "mcqs": mcqs
        }
        
    except Exception as e:
        logger.error(f"💥 Error fetching MCQs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/courses/{course_id}/qnas")
async def get_course_qnas(course_id: str, db: SupabaseManager = Depends(get_db)):
    """Get all Q&As for a course."""
    try:
        logger.info(f"📖 Fetching Q&As for course: {course_id}")
        
        query = """
        SELECT * FROM course_qnas 
        WHERE course_id = %s 
        ORDER BY created_at DESC
        """
        
        qnas = await asyncio.to_thread(db.execute_query, query, course_id)
        
        logger.info(f"✅ Retrieved {len(qnas)} Q&As")
        return {
            "success": True,
            "qnas": qnas
        }
        
    except Exception as e:
        logger.error(f"💥 Error fetching Q&As: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/courses/{course_id}/resources")
async def get_course_resources(course_id: str, db: SupabaseManager = Depends(get_db)):
    """Get all resources for a course."""
    try:
        logger.info(f"📖 Fetching resources for course: {course_id}")
        
        query = """
        SELECT * FROM course_resources 
        WHERE course_id = %s 
        ORDER BY created_at DESC
        """
        
        resources = await asyncio.to_thread(db.execute_query, query, course_id)
        
        logger.info(f"✅ Retrieved {len(resources)} resources")
        return {
            "success": True,
            "resources": resources
        }
        
    except Exception as e:
        logger.error(f"💥 Error fetching resources: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/courses/{course_id}/notebook")
async def get_course_notebook(course_id: str, chapter_id: Optional[str] = None, db: SupabaseManager = Depends(get_db)):
    """Get notebook content for a course or specific chapter."""
    try:
        logger.info(f"📖 Fetching notebook for course: {course_id}, chapter: {chapter_id}")
        
        if chapter_id:
            query = """
            SELECT * FROM course_notebooks 
            WHERE course_id = %s AND chapter_id = %s
            """
            result = await asyncio.to_thread(db.execute_query, query, course_id, chapter_id)
        else:
            query = """
            SELECT * FROM course_notebooks 
            WHERE course_id = %s AND chapter_id IS NULL
            """
            result = await asyncio.to_thread(db.execute_query, query, course_id)
        
        notebook = result[0] if result else None
        
        logger.info(f"✅ Notebook retrieved")
        return {
            "success": True,
            "notebook": notebook
        }
        
    except Exception as e:
        logger.error(f"💥 Error fetching notebook: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/courses/{course_id}/progress")
async def track_progress(course_id: str, request: ProgressTrackRequest, db: SupabaseManager = Depends(get_db)):
    """Track user progress for course content."""
    try:
        logger.info(f"📈 Tracking progress for course: {course_id}")
        
        # Insert or update progress
        query = """
        INSERT INTO course_progress 
        (user_id, course_id, chapter_id, flashcard_id, mcq_id, progress_type, score, time_spent)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (user_id, course_id, chapter_id, flashcard_id, mcq_id)
        DO UPDATE SET 
            score = EXCLUDED.score,
            time_spent = EXCLUDED.time_spent,
            completed_at = now()
        RETURNING *
        """
        
        result = await asyncio.to_thread(
            db.execute_query,
            query,
            request.user_id,
            course_id,
            request.chapter_id,
            request.flashcard_id,
            request.mcq_id,
            request.progress_type,
            request.score,
            request.time_spent
        )
        
        if not result:
            raise HTTPException(status_code=500, detail="Failed to track progress")
        
        logger.info(f"✅ Progress tracked successfully")
        return {
            "success": True,
            "progress": result[0]
        }
        
    except Exception as e:
        logger.error(f"💥 Error tracking progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("SERVICE_HOST", "0.0.0.0")
    port = int(os.getenv("SERVICE_PORT", "8007"))
    
    # Run the service
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info",
        access_log=True
    )