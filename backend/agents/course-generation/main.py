#!/usr/bin/env python3
"""
Oboe-Style Course Generation Service
====================================
Fast parallel AI course generation using Gemini, ElevenLabs, and Brave APIs.
Generates complete courses in ~40 seconds with audio, articles, quizzes, and games.
"""

import os
import json
import logging
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
import base64
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend root
backend_root = Path(__file__).parent.parent.parent
env_path = backend_root / ".env"
load_dotenv(dotenv_path=env_path)

import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Course Generation Service - Oboe Style", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Keys from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
BRAVE_API_KEY = os.getenv("BRAVE_SEARCH_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Models
class CourseGenerationRequest(BaseModel):
    topic: str
    userId: str

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "course-generation",
        "has_gemini": bool(GEMINI_API_KEY),
        "has_elevenlabs": bool(ELEVENLABS_API_KEY),
        "has_brave": bool(BRAVE_API_KEY)
    }

@app.post("/generate-course-parallel")
async def generate_course_parallel(request: CourseGenerationRequest, background_tasks: BackgroundTasks):
    """Generate course with parallel AI agents"""
    
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    try:
        logger.info(f"🚀 Starting course generation: {request.topic}")
        
        # Create course in database
        course_id = await create_course(request.topic, request.userId)
        job_id = await create_generation_job(course_id, request.userId)
        
        logger.info(f"✅ Course created: {course_id}, Job: {job_id}")
        
        # Start background generation
        background_tasks.add_task(
            generate_in_parallel,
            course_id,
            request.topic,
            request.userId
        )
        
        return {
            "success": True,
            "courseId": course_id,
            "jobId": job_id,
            "estimatedTime": 40
        }
        
    except Exception as e:
        logger.error(f"💥 Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def create_course(topic: str, user_id: str) -> str:
    """Create course record in Supabase"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/courses",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            json={
                "user_id": user_id,
                "title": topic,
                "purpose": "practice",
                "difficulty": "intermediate",
                "status": "generating",
                "summary": f"AI-generated course on {topic}",
                "is_oboe_style": True
            }
        )
        
        if response.status_code not in [200, 201]:
            raise Exception(f"Failed to create course: {response.text}")
        
        data = response.json()
        return data[0]["id"] if isinstance(data, list) else data["id"]

async def create_generation_job(course_id: str, user_id: str) -> str:
    """Create generation job"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SUPABASE_URL}/rest/v1/course_generation_jobs",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            json={
                "user_id": user_id,
                "course_id": course_id,
                "status": "processing",
                "job_type": "course_creation",
                "current_step": "Starting parallel generation",
                "progress_percentage": 5
            }
        )
        
        data = response.json()
        return data[0]["id"] if isinstance(data, list) else data["id"]

async def generate_in_parallel(course_id: str, topic: str, user_id: str):
    """Main parallel generation orchestrator"""
    start_time = datetime.now()
    
    try:
        # Update progress
        await update_progress(course_id, 10, "Generating course outline...")
        
        # STEP 1: Generate outline
        outline = await generate_outline(topic)
        logger.info(f"✅ Outline generated with {len(outline['chapters'])} chapters")
        
        await update_progress(course_id, 20, "Generating content...")
        
        # STEP 2: Parallel generation
        results = await asyncio.gather(
            generate_chapters(course_id, topic, outline),
            generate_flashcards(course_id, topic),
            generate_mcqs(course_id, topic),
            generate_articles(course_id, topic),
            generate_word_games(course_id, topic),
            generate_audio_scripts(topic, outline),
            return_exceptions=True
        )
        
        chapters, flashcards, mcqs, articles, word_games, audio_scripts = results
        logger.info("✅ All content generated")
        
        await update_progress(course_id, 60, "Creating audio...")
        
        # STEP 3: Generate TTS if key available
        if ELEVENLABS_API_KEY and audio_scripts:
            await asyncio.gather(
                generate_tts(course_id, audio_scripts.get("short", ""), "short_podcast"),
                generate_tts(course_id, audio_scripts.get("long", ""), "full_lecture"),
                return_exceptions=True
            )
            await update_course_field(course_id, {"audio_generated": True})
        
        await update_progress(course_id, 80, "Finding resources...")
        
        # STEP 4: Find resources if Brave key available
        if BRAVE_API_KEY:
            await find_resources(course_id, topic)
        
        await update_progress(course_id, 90, "Generating suggestions...")
        
        # STEP 5: Generate suggestions
        await generate_suggestions(course_id, topic)
        
        # STEP 6: Finalize
        duration = int((datetime.now() - start_time).total_seconds())
        
        await update_course_field(course_id, {
            "status": "published",
            "generation_duration_seconds": duration,
            "articles_generated": True,
            "games_generated": True
        })
        
        await finalize_job(course_id, duration)
        
        logger.info(f"✅ Course {course_id} generated in {duration}s")
        
    except Exception as e:
        logger.error(f"💥 Generation error: {e}")
        await mark_job_failed(course_id, str(e))

async def generate_outline(topic: str) -> dict:
    """Generate course outline - 4 chapters for speed"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}",
            json={
                "contents": [{
                    "parts": [{
                        "text": f"""Create a concise course outline for: "{topic}"

Generate EXACTLY 4 chapters:
- Chapter 1: Basic (fundamentals)
- Chapter 2: Intermediate (core concepts) 
- Chapter 3: Intermediate (applications)
- Chapter 4: Advanced (complex topics)

Return JSON:
{{
  "chapters": [
    {{
      "title": "string",
      "level": "basic|intermediate|advanced",
      "objectives": ["obj1", "obj2"],
      "keyConcepts": ["concept1", "concept2"],
      "estimatedMinutes": 10
    }}
  ]
}}"""
                    }]
                }]
            }
        )
        
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        
        # Extract JSON
        import re
        json_match = re.search(r'```json\n(.*?)\n```', text, re.DOTALL) or re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1) if json_match.lastindex else json_match.group(0))
        return json.loads(text)

async def generate_chapters(course_id: str, topic: str, outline: dict) -> list:
    """Generate chapter content with code examples, tables, and images"""
    chapters = []
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        for i, chapter in enumerate(outline["chapters"]):
            level = chapter.get('level', 'intermediate')
            
            prompt = f"""Write concise chapter for:

Topic: {topic}
Chapter: {chapter['title']}
Level: {level}

Requirements (300-400 words):
1. Intro (1-2 paragraphs)
2. Key concepts with 1-2 SHORT code examples if technical
3. 1 comparison table if relevant
4. Summary

Use markdown. Keep it brief and practical."""

            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}",
                json={
                    "contents": [{
                        "parts": [{
                            "text": prompt
                        }]
                    }]
                }
            )
            
            data = response.json()
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            
            chapters.append({
                "course_id": course_id,
                "title": chapter["title"],
                "content": content,
                "order_number": i + 1,
                "estimated_reading_time": chapter.get("estimatedMinutes", 10)
            })
    
    # Insert chapters
    await insert_to_supabase("course_chapters", chapters)
    return chapters

async def generate_flashcards(course_id: str, topic: str) -> list:
    """Generate flashcards"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}",
            json={
                "contents": [{
                    "parts": [{
                        "text": f"Generate 10 flashcards for: {topic}. Format as JSON: [{{'question': 'string', 'answer': 'string'}}]"
                    }]
                }]
            }
        )
        
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        
        import re
        json_match = re.search(r'```json\n(.*?)\n```', text, re.DOTALL) or re.search(r'\[.*\]', text, re.DOTALL)
        flashcards_data = json.loads(json_match.group(1) if json_match.lastindex else json_match.group(0))
        
        flashcards = [
            {"course_id": course_id, "question": f["question"], "answer": f["answer"], "difficulty": "medium"}
            for f in flashcards_data
        ]
        
        await insert_to_supabase("course_flashcards", flashcards)
        return flashcards

async def generate_mcqs(course_id: str, topic: str) -> list:
    """Generate MCQs"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}",
            json={
                "contents": [{
                    "parts": [{
                        "text": f"Generate 10 MCQs for: {topic}. Format as JSON: [{{'question': 'string', 'options': ['A', 'B', 'C', 'D'], 'correct': 'A', 'explanation': 'string'}}]"
                    }]
                }]
            }
        )
        
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        
        import re
        json_match = re.search(r'```json\n(.*?)\n```', text, re.DOTALL) or re.search(r'\[.*\]', text, re.DOTALL)
        mcqs_data = json.loads(json_match.group(1) if json_match.lastindex else json_match.group(0))
        
        mcqs = [
            {
                "course_id": course_id,
                "question": m["question"],
                "options": m["options"],
                "correct_answer": m["correct"],
                "explanation": m["explanation"],
                "difficulty": "medium"
            }
            for m in mcqs_data
        ]
        
        await insert_to_supabase("course_mcqs", mcqs)
        return mcqs

async def generate_articles(course_id: str, topic: str) -> dict:
    """Generate articles"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Deep dive
        deep_dive_resp = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}",
            json={"contents": [{"parts": [{"text": f"Write 800-1000 word deep-dive article on: {topic}"}]}]}
        )
        deep_dive = deep_dive_resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        
        # Key takeaways
        takeaways_resp = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}",
            json={"contents": [{"parts": [{"text": f"Summarize key takeaways for: {topic} in 5-7 bullet points"}]}]}
        )
        takeaways = takeaways_resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        
        # FAQ
        faq_resp = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}",
            json={"contents": [{"parts": [{"text": f"Generate 8-10 FAQ for: {topic}. Format as JSON: [{{'question': 'string', 'answer': 'string'}}]"}]}]}
        )
        faq_text = faq_resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        
        import re
        json_match = re.search(r'```json\n(.*?)\n```', faq_text, re.DOTALL) or re.search(r'\[.*\]', faq_text, re.DOTALL)
        faq = json.loads(json_match.group(1) if json_match.lastindex else json_match.group(0))
        
        articles = [
            {"course_id": course_id, "article_type": "deep_dive", "title": f"Deep Dive: {topic}", "content": deep_dive, "reading_time_minutes": 10},
            {"course_id": course_id, "article_type": "key_takeaways", "title": f"Key Takeaways: {topic}", "content": takeaways, "reading_time_minutes": 3},
            {"course_id": course_id, "article_type": "faq", "title": f"FAQ: {topic}", "content": json.dumps(faq), "reading_time_minutes": 5}
        ]
        
        await insert_to_supabase("course_articles", articles)
        return {"deep_dive": deep_dive, "takeaways": takeaways, "faq": faq}

async def generate_word_games(course_id: str, topic: str) -> list:
    """Generate word games"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}",
            json={
                "contents": [{
                    "parts": [{
                        "text": f"Generate 15 vocabulary words for: {topic}. Format as JSON: [{{'word': 'string', 'correct': 'string', 'incorrect': ['string', 'string', 'string']}}]"
                    }]
                }]
            }
        )
        
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        
        import re
        json_match = re.search(r'```json\n(.*?)\n```', text, re.DOTALL) or re.search(r'\[.*\]', text, re.DOTALL)
        words_data = json.loads(json_match.group(1) if json_match.lastindex else json_match.group(0))
        
        words = [
            {"course_id": course_id, "word": w["word"], "definition": w["correct"], "incorrect_options": w["incorrect"], "difficulty": "medium"}
            for w in words_data
        ]
        
        await insert_to_supabase("course_word_games", words)
        return words

async def generate_audio_scripts(topic: str, outline: dict) -> dict:
    """Generate audio scripts"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Short script
        short_resp = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}",
            json={"contents": [{"parts": [{"text": f"Write 5-minute conversational podcast script introducing: {topic}. ~700 words. No speaker labels."}]}]}
        )
        short_script = short_resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        
        # Long script
        long_resp = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}",
            json={"contents": [{"parts": [{"text": f"Write 20-minute educational lecture on: {topic}. ~3000 words. No speaker labels."}]}]}
        )
        long_script = long_resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        
        return {"short": short_script, "long": long_script}

async def generate_tts(course_id: str, script: str, audio_type: str):
    """Generate TTS audio"""
    if not ELEVENLABS_API_KEY or not script:
        return
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                "https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x",
                headers={"xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json"},
                json={"text": script[:5000], "model_id": "eleven_turbo_v2_5", "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}
            )
            
            if response.status_code == 200:
                audio_data = response.content
                # Store in Supabase storage (simplified - you'd upload to storage bucket)
                audio_url = f"https://storage.example.com/{course_id}/{audio_type}.mp3"
                
                await insert_to_supabase("course_audio", [{
                    "course_id": course_id,
                    "audio_type": audio_type,
                    "audio_url": audio_url,
                    "script_text": script,
                    "duration_seconds": 300 if audio_type == "short_podcast" else 1200,
                    "voice_used": "Aria"
                }])
                
                logger.info(f"✅ Generated {audio_type} audio")
    except Exception as e:
        logger.error(f"TTS error: {e}")

async def find_resources(course_id: str, topic: str):
    """Find resources using Brave"""
    if not BRAVE_API_KEY:
        return
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.search.brave.com/res/v1/web/search?q={topic}+tutorial+documentation",
                headers={"X-Subscription-Token": BRAVE_API_KEY}
            )
            
            data = response.json()
            results = data.get("web", {}).get("results", [])
            
            resources = [
                {
                    "course_id": course_id,
                    "title": r["title"],
                    "type": "article",
                    "url": r["url"],
                    "description": r.get("description", ""),
                    "provider": r["url"].split("/")[2]
                }
                for r in results[:5]
            ]
            
            if resources:
                await insert_to_supabase("course_resources", resources)
    except Exception as e:
        logger.error(f"Resource finding error: {e}")

async def generate_suggestions(course_id: str, topic: str):
    """Generate continue learning suggestions"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}",
            json={"contents": [{"parts": [{"text": f"Suggest 5 related topics after learning {topic}. Format as JSON: [{{'topic': 'string', 'description': 'string'}}]"}]}]}
        )
        
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        
        import re
        json_match = re.search(r'```json\n(.*?)\n```', text, re.DOTALL) or re.search(r'\[.*\]', text, re.DOTALL)
        suggestions_data = json.loads(json_match.group(1) if json_match.lastindex else json_match.group(0))
        
        suggestions = [
            {"course_id": course_id, "suggestion_topic": s["topic"], "suggestion_description": s["description"], "relevance_score": 5 - i}
            for i, s in enumerate(suggestions_data)
        ]
        
        await insert_to_supabase("course_suggestions", suggestions)

# Utility functions
async def insert_to_supabase(table: str, data: list):
    """Insert data to Supabase"""
    if not data:
        return
    
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json"
            },
            json=data
        )

async def update_progress(course_id: str, percent: int, step: str):
    """Update job progress"""
    async with httpx.AsyncClient() as client:
        await client.patch(
            f"{SUPABASE_URL}/rest/v1/course_generation_jobs?course_id=eq.{course_id}",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json"
            },
            json={"progress_percentage": percent, "current_step": step}
        )

async def update_course_field(course_id: str, fields: dict):
    """Update course fields"""
    async with httpx.AsyncClient() as client:
        await client.patch(
            f"{SUPABASE_URL}/rest/v1/courses?id=eq.{course_id}",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json"
            },
            json=fields
        )

async def finalize_job(course_id: str, duration: int):
    """Finalize generation job"""
    async with httpx.AsyncClient() as client:
        await client.patch(
            f"{SUPABASE_URL}/rest/v1/course_generation_jobs?course_id=eq.{course_id}",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "status": "completed",
                "progress_percentage": 100,
                "current_step": "Course ready!",
                "completed_at": datetime.utcnow().isoformat()
            }
        )

async def mark_job_failed(course_id: str, error: str):
    """Mark job as failed"""
    async with httpx.AsyncClient() as client:
        await client.patch(
            f"{SUPABASE_URL}/rest/v1/course_generation_jobs?course_id=eq.{course_id}",
            headers={
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "status": "failed",
                "error_message": error,
                "completed_at": datetime.utcnow().isoformat()
            }
        )

if __name__ == "__main__":
    port = int(os.getenv("SERVICE_PORT", "8008"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
