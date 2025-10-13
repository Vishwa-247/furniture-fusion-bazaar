import io
import json
import logging
import os
import sys
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any, Dict, Optional

import docx
import PyPDF2
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

# Load environment variables from backend root
from dotenv import load_dotenv
backend_root = Path(__file__).parent.parent.parent
env_path = backend_root / ".env"
load_dotenv(dotenv_path=env_path)

# Add the backend directory to the path for shared module imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from shared.database.supabase_connection import (
    SupabaseManager,
    close_database,
    create_user_profile,
    get_user_certifications,
    get_user_education,
    get_user_experience,
    get_user_profile,
    get_user_projects,
    get_user_skills
)
from shared.database.supabase_connection import health_check as db_health_check
from shared.database.supabase_connection import (
    init_database,
    save_user_certifications,
    save_user_education,
    save_user_experience,
    save_user_projects,
    save_user_skills,
    update_user_profile
)

# Create a SupabaseManager instance  
supabase_manager = SupabaseManager()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    try:
        await supabase_manager.connect()
        logger.info("🚀 Profile Service started successfully")
    except Exception as e:
        logger.warning(f"⚠️ Database not available, running in offline mode: {e}")
    
    yield
    
    await supabase_manager.disconnect()
    logger.info("🛑 Profile Service shutdown complete")

# Create FastAPI app with lifespan
app = FastAPI(title="Profile Service - Supabase Edition", lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Configuration
GROQ_API_KEY = os.getenv("PROFILE_SERVICE_GROQ_KEY", os.getenv("GROQ_API_KEY", ""))

# Initialize Groq client
groq_client = None
if GROQ_API_KEY:
    try:
        from groq import Groq
        # Use the method that works (from successful test)
        groq_client = Groq(api_key=GROQ_API_KEY)
        logger.info("✅ Groq client initialized successfully")
        logger.info(f"🔑 Using API key: {GROQ_API_KEY[:10]}...{GROQ_API_KEY[-4:]}")
    except ImportError as e:
        logger.error(f"⚠️ Groq library not installed: {e}")
        logger.error("Run: pip install groq")
    except Exception as e:
        logger.error(f"⚠️ Failed to initialize Groq client: {e}")
        logger.error("Run: pip install --upgrade groq")
else:
    logger.error("❌ GROQ_API_KEY not found in environment variables")
    logger.error("Please set GROQ_API_KEY in your .env file")

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting PDF text: {e}")
        return ""

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(io.BytesIO(file_content))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting DOCX text: {e}")
        return ""

async def extract_profile_with_groq(resume_text: str) -> dict:
    """Extract profile data using Groq AI"""
    if not groq_client:
        logger.error("❌ Groq client not available")
        logger.error("Possible issues:")
        logger.error("1. GROQ_API_KEY not set in .env file")
        logger.error("2. Groq library not installed (run: pip install groq)")
        logger.error("3. Invalid API key")
        raise Exception("Groq client not available - check API key and installation")
    
    if not resume_text or len(resume_text.strip()) < 10:
        raise Exception("Resume text is too short or empty")
    
    try:
        prompt = f"""
        Extract structured profile information from this resume text. Be precise and only extract information that is clearly present.
        
        Resume Text:
        {resume_text}
        
        Please provide a JSON response with the following structure:
        {{
            "personal_info": {{
                "name": "Full name (only if clearly stated)",
                "email": "Email address (only if found)",
                "phone": "Phone number (only if found)",
                "location": "Location/Address (only if found)",
                "linkedin": "LinkedIn URL (only if found)",
                "github": "GitHub URL (only if found)",
                "portfolio": "Portfolio URL (only if found)"
            }},
            "professional_summary": "Professional summary or objective (only if present)",
            "skills": [
                {{
                    "name": "Skill name",
                    "level": "Beginner|Intermediate|Advanced|Expert",
                    "category": "Technical|Soft|Language|Framework|Tool"
                }}
            ],
            "experience": [
                {{
                    "company": "Company name",
                    "position": "Job title",
                    "location": "Work location",
                    "startDate": "Start date (YYYY-MM format if possible)",
                    "endDate": "End date (YYYY-MM format if possible)",
                    "current": false,
                    "description": "Job description and achievements",
                    "technologies": ["List of technologies used"]
                }}
            ],
            "education": [
                {{
                    "institution": "University/School name",
                    "degree": "Degree name",
                    "field": "Field of study",
                    "startYear": "Start year",
                    "endYear": "End year",
                    "grade": "GPA or grade if mentioned",
                    "description": "Additional details"
                }}
            ],
            "projects": [
                {{
                    "title": "Project name",
                    "description": "Project description",
                    "technologies": ["Technologies used"],
                    "startDate": "Start date if available",
                    "endDate": "End date if available",
                    "githubUrl": "GitHub URL if found",
                    "liveUrl": "Live demo URL if found",
                    "highlights": ["Key achievements or features"]
                }}
            ],
            "certifications": [
                {{
                    "name": "Certification name",
                    "issuer": "Issuing organization",
                    "issueDate": "Issue date",
                    "expiryDate": "Expiry date if applicable",
                    "credentialId": "Credential ID if available",
                    "credentialUrl": "Credential URL if available"
                }}
            ]
        }}
        
        Only return valid JSON, no additional text. If information is not found, use empty strings or empty arrays.
        """
        
        response = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert at extracting structured data from resumes. Always return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.1,
            max_tokens=3000
        )
        
        extracted_data = json.loads(response.choices[0].message.content.strip())
        return extracted_data
        
    except Exception as e:
        logger.error(f"Groq extraction failed: {e}")
        raise e

@app.post("/extract-profile")
async def extract_profile_data(
    resume: UploadFile = File(...),
    user_id: str = Form(...)
):
    """Extract profile data from resume and store in Supabase"""
    try:
        logger.info(f"🔍 Starting profile extraction for user: {user_id}")
        
        # Read file content
        file_content = await resume.read()
        
        # Store resume file in Supabase Storage
        file_ext = resume.filename.split('.')[-1] if '.' in resume.filename else 'pdf'
        storage_filename = f"{user_id}/{int(datetime.now().timestamp())}.{file_ext}"
        
        try:
            # Upload file to Supabase storage
            storage_result = supabase_manager.supabase.storage.from_('resume-files').upload(
                storage_filename,
                file_content,
                file_options={"content-type": resume.content_type}
            )
            logger.info(f"📁 File uploaded to storage: {storage_filename}")
        except Exception as storage_error:
            logger.warning(f"⚠️ Storage upload failed: {storage_error}")
            # Continue with extraction even if storage fails
        
        # Extract text based on file type
        if resume.content_type == "application/pdf":
            resume_text = extract_text_from_pdf(file_content)
        elif resume.content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
            resume_text = extract_text_from_docx(file_content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF or DOCX.")
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from resume. Please check file format.")
        
        logger.info(f"📄 Extracted {len(resume_text)} characters from resume")
        
        # Save resume metadata to database
        try:
            resume_record = {
                "user_id": user_id,
                "filename": resume.filename,
                "file_path": storage_filename,
                "file_size": len(file_content),
                "extracted_text": resume_text[:10000],  # Store first 10k chars
                "processing_status": "completed",
                "extraction_status": "processing"
            }
            
            supabase_manager.supabase.table('user_resumes').insert(resume_record).execute()
            logger.info("💾 Resume metadata saved to database")
        except Exception as db_error:
            logger.warning(f"⚠️ Failed to save resume metadata: {db_error}")
        
        # Extract structured data using Groq
        if not groq_client:
            raise HTTPException(status_code=503, detail="AI extraction service not available")
        
        logger.info("🧠 Extracting profile data with Groq AI...")
        extracted_data = await extract_profile_with_groq(resume_text)
        
        # Transform extracted data to match frontend format
        formatted_data = {
            "personalInfo": {
                "fullName": extracted_data.get("personal_info", {}).get("name", ""),
                "email": extracted_data.get("personal_info", {}).get("email", ""),
                "phone": extracted_data.get("personal_info", {}).get("phone", ""),
                "location": extracted_data.get("personal_info", {}).get("location", ""),
                "linkedin": extracted_data.get("personal_info", {}).get("linkedin", ""),
                "github": extracted_data.get("personal_info", {}).get("github", ""),
                "portfolio": extracted_data.get("personal_info", {}).get("portfolio", ""),
            },
            "education": extracted_data.get("education", []),
            "experience": extracted_data.get("experience", []),
            "projects": extracted_data.get("projects", []),
            "skills": extracted_data.get("skills", []),
            "certifications": extracted_data.get("certifications", []),
            "summary": extracted_data.get("professional_summary", "")
        }
        
        # Calculate confidence score
        confidence_score = 0.0
        total_fields = 0
        filled_fields = 0
        
        # Check personal info completeness
        personal_info = formatted_data["personalInfo"]
        for field in ["fullName", "email", "phone", "location"]:
            total_fields += 1
            if personal_info.get(field) and personal_info.get(field).strip():
                filled_fields += 1
        
        # Check other sections
        sections = ["skills", "experience", "education", "projects", "certifications"]
        for section in sections:
            total_fields += 1
            if formatted_data.get(section) and len(formatted_data.get(section, [])) > 0:
                filled_fields += 1
        
        confidence_score = (filled_fields / total_fields) * 100 if total_fields > 0 else 0
        
        # Store extraction result
        try:
            extraction_record = {
                "user_id": user_id,
                "extracted_data": formatted_data,
                "confidence_score": confidence_score,
                "status": "completed",
                "extraction_type": "groq_ai"
            }
            
            supabase_manager.supabase.table('resume_extractions').insert(extraction_record).execute()
            logger.info("💾 Extraction result saved to database")
        except Exception as db_error:
            logger.warning(f"⚠️ Failed to save extraction result: {db_error}")
        
        # Prepare response
        result = {
            "success": True,
            "extraction_id": f"extraction_{user_id}_{int(datetime.now().timestamp())}",
            "extracted_data": formatted_data,
            "confidence_score": round(confidence_score, 2),
            "message": f"Successfully extracted profile data with {confidence_score:.1f}% completeness",
            "metadata": {
                "filename": resume.filename,
                "file_size": len(file_content),
                "extraction_date": datetime.now().isoformat(),
                "ai_provider": "groq",
                "storage_path": storage_filename
            }
        }
        
        logger.info(f"✅ Profile extraction completed successfully with {confidence_score:.1f}% confidence")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Critical error in extract_profile: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/profile/{user_id}/apply-extraction")
async def apply_extracted_data(user_id: str, extracted_data: Dict[str, Any]):
    """Apply extracted resume data to user profile"""
    try:
        logger.info(f"🔄 Applying extracted data for user: {user_id}")
        
        # Apply the extracted data using the existing update endpoint
        await update_profile(user_id, extracted_data)
        
        # Mark extraction as applied
        try:
            supabase_manager.supabase.table('resume_extractions')\
                .update({"applied_at": datetime.now().isoformat(), "applied_by": user_id})\
                .eq('user_id', user_id)\
                .order('created_at', desc=True)\
                .limit(1)\
                .execute()
        except Exception as db_error:
            logger.warning(f"⚠️ Failed to mark extraction as applied: {db_error}")
        
        logger.info(f"✅ Extracted data applied successfully for user: {user_id}")
        return {
            "success": True,
            "message": "Profile updated successfully with extracted data"
        }
        
    except Exception as e:
        logger.error(f"💥 Error applying extracted data: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/profile/{user_id}/resume")
async def get_user_resume(user_id: str):
    """Get user's resume information"""
    try:
        result = supabase_manager.supabase.table('user_resumes')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('upload_date', desc=True)\
            .limit(1)\
            .execute()
        
        if result.data:
            return {"resume": result.data[0]}
        else:
            return {"resume": None}
            
    except Exception as e:
        logger.error(f"💥 Error fetching resume: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.delete("/profile/{user_id}/resume")
async def delete_user_resume(user_id: str):
    """Delete user's resume"""
    try:
        # Get resume info first
        result = supabase_manager.supabase.table('user_resumes')\
            .select('file_path')\
            .eq('user_id', user_id)\
            .execute()
        
        # Delete from storage
        if result.data:
            for resume in result.data:
                try:
                    supabase_manager.supabase.storage.from_('resume-files').remove([resume['file_path']])
                except Exception as storage_error:
                    logger.warning(f"⚠️ Failed to delete from storage: {storage_error}")
        
        # Delete from database
        supabase_manager.supabase.table('user_resumes').delete().eq('user_id', user_id).execute()
        supabase_manager.supabase.table('resume_extractions').delete().eq('user_id', user_id).execute()
        
        logger.info(f"✅ Resume deleted successfully for user: {user_id}")
        return {"success": True, "message": "Resume deleted successfully"}
        
    except Exception as e:
        logger.error(f"💥 Error deleting resume: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/profile/{user_id}")
async def get_profile(user_id: str):
    """Get complete user profile"""
    try:
        logger.info(f"📖 Fetching profile for user: {user_id}")
        
        # Check if database is available
        if not supabase_manager or not supabase_manager.supabase:
            logger.warning("Database not connected, returning empty profile")
            return {
                "user_id": user_id,
                "full_name": "",
                "email": "",
                "phone": "",
                "location": "",
                "professional_summary": "",
                "linkedin_url": "",
                "github_url": "",
                "portfolio_url": "",
                "completion_percentage": 0,
                "education": [],
                "experience": [],
                "projects": [],
                "skills": [],
                "certifications": [],
                "_offline_mode": True
            }
        
        # Get main profile
        profile = await get_user_profile(user_id)
        if not profile:
            # Create empty profile structure
            return {
                "user_id": user_id,
                "full_name": "",
                "email": "",
                "phone": "",
                "location": "",
                "professional_summary": "",
                "linkedin_url": "",
                "github_url": "",
                "portfolio_url": "",
                "completion_percentage": 0,
                "education": [],
                "experience": [],
                "projects": [],
                "skills": [],
                "certifications": []
            }
        
        # Get related data
        education = await get_user_education(user_id)
        experience = await get_user_experience(user_id)
        projects = await get_user_projects(user_id)
        skills = await get_user_skills(user_id)
        certifications = await get_user_certifications(user_id)
        
        # Combine all data
        complete_profile = {
            **profile,
            "education": education,
            "experience": experience,
            "projects": projects,
            "skills": skills,
            "certifications": certifications
        }
        
        logger.info(f"✅ Profile fetched successfully for user: {user_id}")
        return complete_profile
        
    except Exception as e:
        logger.error(f"💥 Error fetching profile: {e}")
        # Return empty profile instead of 500 error
        return {
            "user_id": user_id,
            "full_name": "",
            "email": "",
            "phone": "",
            "location": "",
            "professional_summary": "",
            "linkedin_url": "",
            "github_url": "",
            "portfolio_url": "",
            "completion_percentage": 0,
            "education": [],
            "experience": [],
            "projects": [],
            "skills": [],
            "certifications": [],
            "_error": str(e)
        }

@app.put("/profile/{user_id}")
async def update_profile(user_id: str, profile_data: Dict[str, Any]):
    """Update user profile with all sections"""
    try:
        logger.info(f"💾 Updating profile for user: {user_id}")
        
        # Update main profile
        if "personalInfo" in profile_data:
            personal_info = profile_data["personalInfo"]
            main_profile_data = {
                "full_name": personal_info.get("fullName"),
                "email": personal_info.get("email"),
                "phone": personal_info.get("phone"),
                "location": personal_info.get("location"),
                "linkedin_url": personal_info.get("linkedin"),
                "github_url": personal_info.get("github"),
                "portfolio_url": personal_info.get("portfolio"),
                "professional_summary": profile_data.get("summary", "")
            }
            
            # Check if profile exists
            existing_profile = await get_user_profile(user_id)
            if existing_profile:
                await update_user_profile(user_id, main_profile_data)
            else:
                await create_user_profile(user_id, main_profile_data)
        
        # Update related sections
        if "education" in profile_data:
            await save_user_education(user_id, profile_data["education"])
        
        if "experience" in profile_data:
            await save_user_experience(user_id, profile_data["experience"])
        
        if "projects" in profile_data:
            await save_user_projects(user_id, profile_data["projects"])
        
        if "skills" in profile_data:
            await save_user_skills(user_id, profile_data["skills"])
        
        if "certifications" in profile_data:
            await save_user_certifications(user_id, profile_data["certifications"])
        
        # Return updated profile
        updated_profile = await get_profile(user_id)
        
        logger.info(f"✅ Profile updated successfully for user: {user_id}")
        return updated_profile
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"💥 Error updating profile: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint with database status"""
    try:
        db_status = await db_health_check()
        
        ai_status = {
            "groq_available": groq_client is not None
        }
        
        return {
            "status": "healthy",
            "service": "profile-service-supabase",
            "database": db_status,
            "ai_providers": ai_status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "profile-service-supabase",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "StudyMate Profile Service",
        "version": "2.0.0",
        "database": "supabase_postgresql",
        "ai_providers": ["groq"],
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
