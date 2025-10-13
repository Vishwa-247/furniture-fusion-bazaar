from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import os
import logging
from typing import Optional
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend root folder
backend_root = Path(__file__).parent.parent
env_path = backend_root / ".env"
load_dotenv(dotenv_path=env_path)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="StudyMate API Gateway - Supabase Edition", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000", 
        "http://localhost:8080",  # Add support for Vite dev server on port 8080
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Agent service URLs - Local development setup
AGENT_SERVICES = {
    "resume-analyzer": os.getenv("RESUME_ANALYZER_URL", "http://localhost:8003"),
    "profile-service": os.getenv("PROFILE_SERVICE_URL", "http://localhost:8006"),
    "course-generation": os.getenv("COURSE_GENERATION_URL", "http://localhost:8008"),
    "interview-coach": os.getenv("INTERVIEW_COACH_URL", "http://localhost:8002"),
}

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def forward_to_agent(agent_name: str, path: str, method: str = "GET", data: dict = None, headers: dict = None):
    """Forward request to specific agent service"""
    if agent_name not in AGENT_SERVICES:
        raise HTTPException(status_code=404, detail=f"Agent {agent_name} not found")
    
    agent_url = AGENT_SERVICES[agent_name]
    url = f"{agent_url}{path}"
    
    async with httpx.AsyncClient() as client:
        if method == "GET":
            response = await client.get(url, headers=headers)
        elif method == "POST":
            response = await client.post(url, json=data, headers=headers)
        elif method == "PUT":
            response = await client.put(url, json=data, headers=headers)
        elif method == "DELETE":
            response = await client.delete(url, headers=headers)
        else:
            raise HTTPException(status_code=405, detail="Method not allowed")
    
    return response.json()

@app.get("/")
async def root():
    return {
        "message": "StudyMate API Gateway - Supabase Edition", 
        "version": "2.0.0",
        "database": "supabase_postgresql",
        "services": list(AGENT_SERVICES.keys())
    }

@app.get("/health")
async def health_check():
    """Health check with service status"""
    service_health = {}
    
    # Check each service health
    for service_name, service_url in AGENT_SERVICES.items():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{service_url}/health")
                service_health[service_name] = {
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "response_code": response.status_code
                }
        except Exception as e:
            service_health[service_name] = {
                "status": "unhealthy",
                "error": str(e)
            }
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": service_health,
        "database": "supabase_postgresql"
    }

# Authentication endpoints
@app.post("/auth/signin")
async def sign_in(credentials: dict):
    # For demo purposes, accept any email/password
    email = credentials.get("email")
    password = credentials.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    # Create access token
    access_token = create_access_token(data={"sub": email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": email,
            "email": email,
            "name": email.split("@")[0].title()
        }
    }

@app.post("/auth/signup")
async def sign_up(user_data: dict):
    # For demo purposes, accept any registration
    email = user_data.get("email")
    password = user_data.get("password")
    name = user_data.get("name", email.split("@")[0].title() if email else "User")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    # Create access token
    access_token = create_access_token(data={"sub": email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": email,
            "email": email,
            "name": name
        }
    }

@app.post("/auth/signout")
async def sign_out(user_id: str = Depends(verify_token)):
    return {"message": "Signed out successfully"}

# Course Generation Routes
@app.post("/courses/generate")
async def generate_course(course_data: dict, user_id: str = Depends(verify_token)):
    course_data["user_id"] = user_id
    return await forward_to_agent("course-generation", "/generate", "POST", course_data)

@app.post("/courses/generate-parallel")
async def generate_course_parallel(course_data: dict):
    """Generate course with parallel AI agents (Oboe-style)"""
    return await forward_to_agent("course-generation", "/generate-course-parallel", "POST", course_data)

@app.get("/courses")
async def get_courses(user_id: str = Depends(verify_token)):
    return await forward_to_agent("course-generation", f"/courses?user_id={user_id}", "GET")

@app.get("/courses/{course_id}")
async def get_course(course_id: str, user_id: str = Depends(verify_token)):
    return await forward_to_agent("course-generation", f"/courses/{course_id}", "GET")

@app.get("/courses/{course_id}/content")
async def get_course_content(course_id: str, user_id: str = Depends(verify_token)):
    return await forward_to_agent("course-generation", f"/courses/{course_id}/content", "GET")

# Interview Routes
@app.post("/interviews/start")
async def start_interview(interview_data: dict, user_id: str = Depends(verify_token)):
    interview_data["user_id"] = user_id
    return await forward_to_agent("interview-coach", "/start", "POST", interview_data)

@app.get("/interviews")
async def get_interviews(user_id: str = Depends(verify_token)):
    return await forward_to_agent("interview-coach", f"/interviews?user_id={user_id}", "GET")

@app.get("/interviews/{interview_id}")
async def get_interview(interview_id: str, user_id: str = Depends(verify_token)):
    return await forward_to_agent("interview-coach", f"/interviews/{interview_id}", "GET")

@app.post("/interviews/{interview_id}/analyze")
async def analyze_interview(interview_id: str, analysis_data: dict, user_id: str = Depends(verify_token)):
    return await forward_to_agent("interview-coach", f"/interviews/{interview_id}/analyze", "POST", analysis_data)

# Chat Routes
@app.post("/chat/message")
async def send_message(message_data: dict, user_id: str = Depends(verify_token)):
    message_data["user_id"] = user_id
    return await forward_to_agent("chat-mentor", "/message", "POST", message_data)

# Progress Routes
@app.get("/progress")
async def get_progress(user_id: str = Depends(verify_token)):
    return await forward_to_agent("progress-analyst", f"/progress?user_id={user_id}", "GET")

# Resume Analyzer Routes
@app.post("/resume/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_role: str = Form(...),
    job_description: str = Form(""),
    user_id: Optional[str] = Form(None)
):
    """Analyze resume for specific job role"""
    async with httpx.AsyncClient(timeout=120.0) as client:
        files = {"resume": (resume.filename, await resume.read(), resume.content_type)}
        data = {
            "job_role": job_role,
            "job_description": job_description,
            "user_id": user_id or "demo"
        }
        response = await client.post(f"{AGENT_SERVICES['resume-analyzer']}/analyze-resume", files=files, data=data)
        return response.json()

# Profile Service Routes
@app.post("/api/profile/extract-profile")
async def extract_profile(
    resume: UploadFile = File(...),
    user_id: str = Form(...),
    user_id_verified: str = Depends(verify_token)
):
    """Extract profile data from resume using Groq AI"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        files = {"resume": (resume.filename, await resume.read(), resume.content_type)}
        data = {"user_id": user_id}
        response = await client.post(f"{AGENT_SERVICES['profile-service']}/extract-profile", files=files, data=data)
        return response.json()

@app.get("/api/profile/{user_id}")
async def get_profile(user_id: str, user_id_verified: str = Depends(verify_token)):
    """Get user profile"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{AGENT_SERVICES['profile-service']}/profile/{user_id}")
        return response.json()

@app.put("/api/profile/{user_id}")
async def update_profile(user_id: str, profile_data: dict, user_id_verified: str = Depends(verify_token)):
    """Update user profile"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.put(f"{AGENT_SERVICES['profile-service']}/profile/{user_id}", json=profile_data)
        return response.json()

@app.post("/resume/extract-profile")
async def extract_profile_data(
    resume: UploadFile = File(...),
    user_id: str = Form(...)
):
    """Extract profile data from resume (legacy endpoint)"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        files = {"resume": (resume.filename, await resume.read(), resume.content_type)}
        data = {"user_id": user_id}
        response = await client.post(f"{AGENT_SERVICES['resume-analyzer']}/extract-profile-data", files=files, data=data)
        return response.json()

# Groq Resume Analyzer Routes
@app.post("/api/resume-groq/analyze-resume")
async def analyze_resume_groq(
    resume: UploadFile = File(...),
    job_role: str = Form(...),
    job_description: str = Form(""),
    user_id: Optional[str] = Form(None)
):
    """Analyze resume using Groq AI"""
    async with httpx.AsyncClient(timeout=120.0) as client:
        files = {"resume": (resume.filename, await resume.read(), resume.content_type)}
        data = {
            "job_role": job_role,
            "job_description": job_description,
            "user_id": user_id or "demo"
        }
        response = await client.post(f"{AGENT_SERVICES['resume-analyzer-groq']}/analyze-resume", files=files, data=data)
        return response.json()

@app.post("/api/resume-groq/quick-suggestions")
async def get_quick_suggestions_groq(job_role: str = Form(...)):
    """Get quick suggestions for job role"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        data = {"job_role": job_role}
        response = await client.post(f"{AGENT_SERVICES['resume-analyzer-groq']}/quick-suggestions", data=data)
        return response.json()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)