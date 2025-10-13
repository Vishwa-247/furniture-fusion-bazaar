#!/usr/bin/env python3
"""
Simple Course Service for Course Generation
==========================================

A simplified course service that focuses on AI-powered course generation
without complex database dependencies.
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Course Generation Service",
    description="AI-Powered Course Generation Service",
    version="1.0.0"
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
class CourseGenerationRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    purpose: str = Field(..., description="Purpose: exam, job_interview, practice, coding_preparation, other")
    difficulty: str = Field(..., description="Difficulty: beginner, intermediate, advanced, expert")
    summary: Optional[str] = Field(None, max_length=1000)
    user_id: str = Field(..., description="User UUID")
    target_duration: Optional[str] = Field("1-2 weeks", description="Expected completion time")
    topics: Optional[List[str]] = Field([], description="Specific topics to cover")

class CourseResponse(BaseModel):
    id: str
    title: str
    purpose: str
    difficulty: str
    summary: str
    status: str
    chapters: List[Dict[str, Any]]
    estimated_duration: str
    created_at: str

# In-memory storage for demo purposes
courses_db = {}

@app.get("/")
async def root():
    return {
        "service": "Course Generation Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": ["/health", "/generate", "/courses"]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "course-generation-service",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "in-memory",
        "ai_providers": ["groq", "openai"]
    }

@app.post("/generate")
async def generate_course(request: CourseGenerationRequest):
    """Generate a new course with AI-powered content."""
    try:
        logger.info(f"🎓 Generating course: {request.title}")
        
        # Generate unique course ID
        course_id = f"course_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        # Simulate AI course generation
        logger.info(f"🤖 AI generating course structure for: {request.title}")
        
        # Generate course chapters based on topic and difficulty
        chapters = generate_course_chapters(request)
        
        # Create course object
        course = {
            "id": course_id,
            "title": request.title,
            "purpose": request.purpose,
            "difficulty": request.difficulty,
            "summary": request.summary or f"AI-generated course on {request.title}",
            "status": "generated",
            "user_id": request.user_id,
            "chapters": chapters,
            "estimated_duration": request.target_duration,
            "topics": request.topics,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Store course
        courses_db[course_id] = course
        
        logger.info(f"✅ Course generated successfully: {course_id}")
        
        return {
            "success": True,
            "course": course,
            "message": f"Course '{request.title}' generated successfully!"
        }
        
    except Exception as e:
        logger.error(f"💥 Error generating course: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/courses")
async def get_courses(user_id: str):
    """Get all courses for a user."""
    try:
        logger.info(f"📚 Fetching courses for user: {user_id}")
        
        user_courses = [
            course for course in courses_db.values() 
            if course.get("user_id") == user_id
        ]
        
        logger.info(f"✅ Retrieved {len(user_courses)} courses")
        return {
            "success": True,
            "courses": user_courses
        }
        
    except Exception as e:
        logger.error(f"💥 Error fetching courses: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/courses/{course_id}")
async def get_course(course_id: str):
    """Get a specific course by ID."""
    try:
        logger.info(f"📖 Fetching course: {course_id}")
        
        if course_id not in courses_db:
            raise HTTPException(status_code=404, detail="Course not found")
        
        course = courses_db[course_id]
        
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

@app.get("/courses/{course_id}/content")
async def get_course_content(course_id: str):
    """Get detailed content for a course."""
    try:
        logger.info(f"📖 Fetching content for course: {course_id}")
        
        if course_id not in courses_db:
            raise HTTPException(status_code=404, detail="Course not found")
        
        course = courses_db[course_id]
        
        # Generate detailed content for each chapter
        detailed_content = generate_detailed_content(course)
        
        logger.info(f"✅ Course content retrieved successfully")
        return {
            "success": True,
            "course_id": course_id,
            "content": detailed_content
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Error fetching course content: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_course_chapters(request: CourseGenerationRequest) -> List[Dict[str, Any]]:
    """Generate course chapters based on request parameters."""
    
    # Base chapter templates based on purpose and difficulty
    chapter_templates = {
        "beginner": [
            {"title": "Introduction and Fundamentals", "duration": "2-3 hours", "type": "introduction"},
            {"title": "Basic Concepts and Terminology", "duration": "3-4 hours", "type": "concepts"},
            {"title": "Hands-on Practice", "duration": "4-5 hours", "type": "practice"},
            {"title": "Common Patterns and Examples", "duration": "3-4 hours", "type": "examples"},
            {"title": "Assessment and Review", "duration": "2-3 hours", "type": "assessment"}
        ],
        "intermediate": [
            {"title": "Advanced Concepts", "duration": "3-4 hours", "type": "concepts"},
            {"title": "Implementation Patterns", "duration": "4-5 hours", "type": "implementation"},
            {"title": "Best Practices", "duration": "3-4 hours", "type": "practices"},
            {"title": "Real-world Applications", "duration": "5-6 hours", "type": "applications"},
            {"title": "Performance and Optimization", "duration": "4-5 hours", "type": "optimization"},
            {"title": "Final Assessment", "duration": "2-3 hours", "type": "assessment"}
        ],
        "advanced": [
            {"title": "Expert-level Concepts", "duration": "4-5 hours", "type": "concepts"},
            {"title": "Complex Implementation", "duration": "6-8 hours", "type": "implementation"},
            {"title": "System Design Considerations", "duration": "5-6 hours", "type": "design"},
            {"title": "Advanced Optimization", "duration": "5-6 hours", "type": "optimization"},
            {"title": "Industry Standards", "duration": "4-5 hours", "type": "standards"},
            {"title": "Capstone Project", "duration": "8-10 hours", "type": "project"}
        ]
    }
    
    # Select appropriate template
    templates = chapter_templates.get(request.difficulty, chapter_templates["intermediate"])
    
    # Generate chapters
    chapters = []
    for i, template in enumerate(templates):
        chapter = {
            "id": f"chapter_{i+1}",
            "title": template["title"],
            "description": f"Learn {template['title'].lower()} for {request.title}",
            "duration": template["duration"],
            "type": template["type"],
            "order": i + 1,
            "content_types": ["text", "examples", "exercises"],
            "learning_objectives": [
                f"Understand {template['title'].lower()}",
                f"Apply concepts in practice",
                f"Complete hands-on exercises"
            ]
        }
        chapters.append(chapter)
    
    return chapters

def generate_detailed_content(course: Dict[str, Any]) -> Dict[str, Any]:
    """Generate detailed content for course chapters."""
    
    content = {
        "course_overview": {
            "title": course["title"],
            "description": course["summary"],
            "total_chapters": len(course["chapters"]),
            "estimated_time": course["estimated_duration"]
        },
        "chapters": [],
        "resources": [
            {"type": "documentation", "title": "Official Documentation", "url": "#"},
            {"type": "tutorial", "title": "Interactive Tutorial", "url": "#"},
            {"type": "practice", "title": "Practice Exercises", "url": "#"}
        ],
        "assessments": [
            {"type": "quiz", "title": "Knowledge Check", "questions": 10},
            {"type": "project", "title": "Practical Application", "duration": "2-3 hours"}
        ]
    }
    
    # Generate detailed content for each chapter
    for chapter in course["chapters"]:
        detailed_chapter = {
            "id": chapter["id"],
            "title": chapter["title"],
            "description": chapter["description"],
            "sections": [
                {
                    "id": f"{chapter['id']}_intro",
                    "title": "Introduction",
                    "content": f"Welcome to {chapter['title']}. In this chapter, you will learn...",
                    "type": "text"
                },
                {
                    "id": f"{chapter['id']}_theory",
                    "title": "Theory and Concepts",
                    "content": f"The fundamental concepts of {chapter['title']} include...",
                    "type": "text"
                },
                {
                    "id": f"{chapter['id']}_examples",
                    "title": "Examples",
                    "content": f"Here are practical examples of {chapter['title']}...",
                    "type": "examples"
                },
                {
                    "id": f"{chapter['id']}_practice",
                    "title": "Practice Exercises",
                    "content": f"Test your understanding with these exercises...",
                    "type": "exercises"
                }
            ],
            "duration": chapter["duration"],
            "learning_objectives": chapter["learning_objectives"]
        }
        content["chapters"].append(detailed_chapter)
    
    return content

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("SERVICE_HOST", "0.0.0.0")
    port = int(os.getenv("SERVICE_PORT", "8007"))
    
    # Run the service
    uvicorn.run(
        "simple_main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )