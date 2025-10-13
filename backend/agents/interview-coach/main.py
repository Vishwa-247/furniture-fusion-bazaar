#!/usr/bin/env python3
"""
Interview Coach Service - AI-Powered Interview Preparation
=========================================================

This service provides AI-powered interview coaching with question generation,
answer analysis, and personalized feedback.

Features:
- Technical and behavioral interview questions
- Real-time answer analysis and feedback
- Interview session management
- Progress tracking and improvement suggestions

Author: StudyMate Platform
Version: 1.0.0
"""

import os
import json
import logging
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend root
backend_root = Path(__file__).parent.parent.parent
env_path = backend_root / ".env"
load_dotenv(dotenv_path=env_path)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Interview Coach Service",
    description="AI-Powered Interview Preparation Service",
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
class InterviewStartRequest(BaseModel):
    user_id: str = Field(..., description="User UUID")
    interview_type: str = Field(..., description="technical, behavioral, system_design, coding")
    job_role: str = Field(..., description="Target job role")
    difficulty: str = Field("medium", description="easy, medium, hard")
    duration: int = Field(30, description="Interview duration in minutes")
    topics: Optional[List[str]] = Field([], description="Specific topics to focus on")

class QuestionResponse(BaseModel):
    question_id: str
    answer: str
    thinking_time: Optional[int] = None  # seconds

class InterviewSession(BaseModel):
    id: str
    user_id: str
    interview_type: str
    job_role: str
    difficulty: str
    status: str  # active, completed, paused
    questions: List[Dict[str, Any]]
    current_question: int
    start_time: str
    duration: int

# In-memory storage for demo
interview_sessions = {}
question_bank = {
    "aptitude": {
        "easy": [
            {"question": "If A is taller than B, and B is taller than C, who is the shortest?", "category": "logical_reasoning", "difficulty": "easy", "expected_points": ["Logic", "Comparison"]},
            {"question": "A train travels 60 km in 1 hour. How far will it travel in 3 hours at the same speed?", "category": "quantitative", "difficulty": "easy", "expected_points": ["Speed calculation", "Basic math"]},
            {"question": "Complete the series: 2, 4, 8, 16, __", "category": "pattern", "difficulty": "easy", "expected_points": ["Pattern recognition", "Multiplication"]},
        ],
        "medium": [
            {"question": "In a group of 50 people, 30 like tea, 25 like coffee, and 10 like both. How many like neither?", "category": "logical_reasoning", "difficulty": "medium", "expected_points": ["Set theory", "Venn diagram"]},
            {"question": "A person buys 5 pens for Rs. 25 and sells them for Rs. 30. What is the profit percentage?", "category": "quantitative", "difficulty": "medium", "expected_points": ["Profit calculation", "Percentage"]},
        ],
        "hard": [
            {"question": "Five people (A, B, C, D, E) are sitting in a row. A is to the left of B but to the right of E. C is to the right of B but to the left of D. Who is in the middle?", "category": "logical_reasoning", "difficulty": "hard", "expected_points": ["Complex logic", "Arrangement"]},
        ]
    },
    "hr": {
        "easy": [
            {"question": "Tell me about yourself.", "category": "behavioral", "difficulty": "easy", "expected_points": ["Background", "Experience", "Goals"]},
            {"question": "Why do you want to work for our company?", "category": "motivation", "difficulty": "easy", "expected_points": ["Research", "Company knowledge", "Career goals"]},
            {"question": "What are your strengths and weaknesses?", "category": "self_assessment", "difficulty": "easy", "expected_points": ["Self-awareness", "Honesty", "Growth mindset"]},
        ],
        "medium": [
            {"question": "Describe a challenging situation you faced and how you handled it.", "category": "behavioral", "difficulty": "medium", "expected_points": ["STAR method", "Problem-solving", "Learning"]},
            {"question": "Where do you see yourself in 5 years?", "category": "career_goals", "difficulty": "medium", "expected_points": ["Career planning", "Ambition", "Alignment"]},
        ],
        "hard": [
            {"question": "How do you handle conflict with a team member?", "category": "behavioral", "difficulty": "hard", "expected_points": ["Conflict resolution", "Communication", "Leadership"]},
        ]
    },
    "technical": {
        "easy": [
            {
                "id": "tech_001",
                "question": "What is the difference between == and === in JavaScript?",
                "category": "JavaScript",
                "expected_points": ["Type coercion", "Strict equality", "Performance"]
            },
            {
                "id": "tech_002", 
                "question": "Explain what a REST API is and its key principles.",
                "category": "Web Development",
                "expected_points": ["HTTP methods", "Stateless", "Resource-based URLs"]
            }
        ],
        "medium": [
            {
                "id": "tech_003",
                "question": "How would you optimize a slow database query?",
                "category": "Database",
                "expected_points": ["Indexing", "Query optimization", "Caching"]
            },
            {
                "id": "tech_004",
                "question": "Explain the concept of closures in JavaScript with an example.",
                "category": "JavaScript",
                "expected_points": ["Lexical scoping", "Function context", "Memory management"]
            }
        ],
        "hard": [
            {
                "id": "tech_005",
                "question": "Design a distributed caching system like Redis.",
                "category": "System Design",
                "expected_points": ["Consistency", "Partitioning", "Replication"]
            }
        ]
    },
    "behavioral": {
        "easy": [
            {
                "id": "behav_001",
                "question": "Tell me about a time when you had to work with a difficult team member.",
                "category": "Teamwork",
                "expected_points": ["Conflict resolution", "Communication", "Outcome"]
            }
        ],
        "medium": [
            {
                "id": "behav_002",
                "question": "Describe a situation where you had to learn a new technology quickly.",
                "category": "Learning",
                "expected_points": ["Learning approach", "Challenges", "Application"]
            }
        ]
    }
}

@app.get("/")
async def root():
    return {
        "service": "Interview Coach Service",
        "version": "1.0.0",
        "status": "running",
        "features": ["question_generation", "answer_analysis", "feedback", "progress_tracking"]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "interview-coach-service",
        "timestamp": datetime.utcnow().isoformat(),
        "active_interviews": len(interview_sessions),
        "question_bank_size": sum(len(questions) for category in question_bank.values() for questions in category.values())
    }

@app.post("/start")
async def start_interview(request: InterviewStartRequest):
    """Start a new interview session."""
    try:
        logger.info(f"🎤 Starting interview for user {request.user_id}")
        
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Get questions for the interview
        questions = generate_questions(request.interview_type, request.difficulty, request.topics)
        
        # Create interview session
        session = InterviewSession(
            id=session_id,
            user_id=request.user_id,
            interview_type=request.interview_type,
            job_role=request.job_role,
            difficulty=request.difficulty,
            status="active",
            questions=questions,
            current_question=0,
            start_time=datetime.utcnow().isoformat(),
            duration=request.duration
        )
        
        # Store session
        interview_sessions[session_id] = session.dict()
        
        logger.info(f"✅ Interview session created: {session_id}")
        
        return {
            "success": True,
            "session_id": session_id,
            "interview": session.dict(),
            "first_question": questions[0] if questions else None,
            "total_questions": len(questions)
        }
        
    except Exception as e:
        logger.error(f"💥 Error starting interview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/interviews")
async def get_interviews(user_id: str):
    """Get all interviews for a user."""
    try:
        user_interviews = [
            session for session in interview_sessions.values()
            if session["user_id"] == user_id
        ]
        
        return {
            "success": True,
            "interviews": user_interviews
        }
        
    except Exception as e:
        logger.error(f"💥 Error fetching interviews: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/interviews/{interview_id}")
async def get_interview(interview_id: str):
    """Get specific interview session."""
    try:
        if interview_id not in interview_sessions:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        session = interview_sessions[interview_id]
        
        return {
            "success": True,
            "interview": session
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Error fetching interview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interviews/{interview_id}/answer")
async def submit_answer(interview_id: str, response: QuestionResponse):
    """Submit an answer to the current question."""
    try:
        if interview_id not in interview_sessions:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        session = interview_sessions[interview_id]
        
        # Analyze the answer (simplified)
        feedback = analyze_answer(
            session["questions"][session["current_question"]],
            response.answer
        )
        
        # Update session with answer and feedback
        session["questions"][session["current_question"]]["answer"] = response.answer
        session["questions"][session["current_question"]]["feedback"] = feedback
        session["questions"][session["current_question"]]["thinking_time"] = response.thinking_time
        
        # Move to next question
        session["current_question"] += 1
        
        # Check if interview is complete
        if session["current_question"] >= len(session["questions"]):
            session["status"] = "completed"
            session["end_time"] = datetime.utcnow().isoformat()
        
        interview_sessions[interview_id] = session
        
        next_question = None
        if session["current_question"] < len(session["questions"]):
            next_question = session["questions"][session["current_question"]]
        
        return {
            "success": True,
            "feedback": feedback,
            "next_question": next_question,
            "progress": {
                "current": session["current_question"],
                "total": len(session["questions"]),
                "completed": session["status"] == "completed"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Error submitting answer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interviews/{interview_id}/analyze")
async def analyze_interview(interview_id: str, analysis_data: dict):
    """Analyze completed interview and provide overall feedback."""
    try:
        if interview_id not in interview_sessions:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        session = interview_sessions[interview_id]
        
        if session["status"] != "completed":
            raise HTTPException(status_code=400, detail="Interview not completed")
        
        # Generate overall analysis
        overall_analysis = generate_overall_analysis(session)
        
        return {
            "success": True,
            "analysis": overall_analysis
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Error analyzing interview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_questions(interview_type: str, difficulty: str, topics: List[str]) -> List[Dict[str, Any]]:
    """Generate questions for the interview."""
    if interview_type not in question_bank:
        return []
    
    if difficulty not in question_bank[interview_type]:
        difficulty = "medium"
    
    questions = question_bank[interview_type][difficulty].copy()
    
    # Add some randomization and filtering based on topics
    # For now, return first 5 questions
    return questions[:5]

def analyze_answer(question: Dict[str, Any], answer: str) -> Dict[str, Any]:
    """Analyze user's answer and provide feedback."""
    # Simplified analysis - in real implementation, use AI
    word_count = len(answer.split())
    
    # Basic scoring
    score = min(100, max(0, word_count * 2))  # 2 points per word, max 100
    
    feedback = {
        "score": score,
        "word_count": word_count,
        "strengths": [],
        "improvements": [],
        "overall_feedback": ""
    }
    
    if word_count < 10:
        feedback["improvements"].append("Try to provide more detailed answers")
        feedback["overall_feedback"] = "Your answer is quite brief. Consider elaborating with examples and explanations."
    elif word_count > 100:
        feedback["improvements"].append("Try to be more concise")
        feedback["overall_feedback"] = "Good detail, but try to be more concise in your explanations."
    else:
        feedback["strengths"].append("Good answer length")
        feedback["overall_feedback"] = "Well-structured answer with appropriate detail."
    
    # Check for technical terms (basic implementation)
    if any(term in answer.lower() for term in ["algorithm", "database", "api", "framework"]):
        feedback["strengths"].append("Good use of technical terminology")
    
    return feedback

def generate_overall_analysis(session: Dict[str, Any]) -> Dict[str, Any]:
    """Generate overall interview analysis."""
    answered_questions = [q for q in session["questions"] if "answer" in q]
    
    if not answered_questions:
        return {"error": "No answers to analyze"}
    
    total_score = sum(q.get("feedback", {}).get("score", 0) for q in answered_questions)
    average_score = total_score / len(answered_questions)
    
    analysis = {
        "overall_score": round(average_score, 1),
        "questions_answered": len(answered_questions),
        "total_questions": len(session["questions"]),
        "completion_rate": round((len(answered_questions) / len(session["questions"])) * 100, 1),
        "interview_type": session["interview_type"],
        "job_role": session["job_role"],
        "difficulty": session["difficulty"],
        "feedback": {
            "strengths": ["Completed the interview", "Provided detailed answers"],
            "improvements": ["Practice more technical questions", "Work on conciseness"],
            "overall": f"You scored {average_score:.1f}/100. {'Great job!' if average_score >= 70 else 'Keep practicing to improve your performance.'}"
        },
        "recommendations": [
            "Practice more behavioral questions",
            "Review system design concepts",
            "Work on communication skills"
        ]
    }
    
    return analysis

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("SERVICE_HOST", "0.0.0.0")
    port = int(os.getenv("SERVICE_PORT", "8002"))
    
    # Run the service
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )