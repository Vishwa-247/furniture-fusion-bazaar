from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import csv
import io
import os
from pymongo import MongoClient
from bson import ObjectId
import motor.motor_asyncio
from contextlib import asynccontextmanager

# Database connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "coding_interview_prep")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
progress_collection = db.dsa_progress
preferences_collection = db.dsa_preferences
analytics_collection = db.dsa_analytics

# Pydantic models
class DSAProgress(BaseModel):
    user_id: str
    topic_id: str
    problem_name: str
    completed: bool
    completed_at: Optional[datetime] = None
    difficulty: Optional[str] = None
    category: Optional[str] = None

class DSAFilters(BaseModel):
    difficulty: List[str] = []
    category: List[str] = []
    companies: List[str] = []
    search_query: Optional[str] = None

class DSAUserPreferences(BaseModel):
    user_id: str
    filters: DSAFilters
    favorites: List[str] = []
    last_visited: List[str] = []
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DSAAnalytics(BaseModel):
    user_id: str
    total_problems: int = 0
    solved_problems: int = 0
    difficulty: Dict[str, int] = {}
    category: Dict[str, int] = {}
    streak_days: int = 0
    last_activity: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# FastAPI app
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("DSA Service starting up...")
    
    # Create indexes
    await progress_collection.create_index([("user_id", 1), ("topic_id", 1), ("problem_name", 1)], unique=True)
    await preferences_collection.create_index("user_id", unique=True)
    await analytics_collection.create_index("user_id", unique=True)
    
    yield
    
    # Shutdown
    print("DSA Service shutting down...")

app = FastAPI(
    title="DSA Service",
    description="Service for managing DSA progress, filters, and analytics",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper functions
async def update_analytics(user_id: str):
    """Update user analytics after progress change"""
    progress_items = await progress_collection.find({"user_id": user_id}).to_list(None)
    
    total_problems = len(progress_items)
    solved_problems = len([p for p in progress_items if p.get("completed", False)])
    
    difficulty_stats = {}
    category_stats = {}
    
    for item in progress_items:
        if item.get("completed", False):
            diff = item.get("difficulty", "Unknown")
            cat = item.get("category", "Unknown")
            
            difficulty_stats[diff] = difficulty_stats.get(diff, 0) + 1
            category_stats[cat] = category_stats.get(cat, 0) + 1
    
    # Calculate streak
    streak_days = await calculate_streak(user_id)
    
    # Update analytics
    await analytics_collection.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "total_problems": total_problems,
                "solved_problems": solved_problems,
                "difficulty": difficulty_stats,
                "category": category_stats,
                "streak_days": streak_days,
                "last_activity": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        },
        upsert=True
    )

async def calculate_streak(user_id: str) -> int:
    """Calculate current streak of consecutive days with activity"""
    now = datetime.utcnow()
    streak = 0
    current_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    while True:
        next_date = current_date + timedelta(days=1)
        
        # Check if there's activity on this date
        activity = await progress_collection.find_one({
            "user_id": user_id,
            "completed_at": {
                "$gte": current_date,
                "$lt": next_date
            }
        })
        
        if activity:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
    
    return streak

# Routes
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "dsa-service"}

# Progress management
@app.post("/progress", response_model=DSAProgress)
async def update_progress(progress: DSAProgress):
    """Update user's progress on a specific problem"""
    try:
        # Update or insert progress
        result = await progress_collection.update_one(
            {
                "user_id": progress.user_id,
                "topic_id": progress.topic_id,
                "problem_name": progress.problem_name
            },
            {
                "$set": {
                    "completed": progress.completed,
                    "completed_at": progress.completed_at or datetime.utcnow(),
                    "difficulty": progress.difficulty,
                    "category": progress.category
                }
            },
            upsert=True
        )
        
        # Update analytics
        await update_analytics(progress.user_id)
        
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/progress/{user_id}")
async def get_progress(user_id: str):
    """Get all progress for a user"""
    try:
        progress_items = await progress_collection.find({"user_id": user_id}).to_list(None)
        
        # Convert ObjectId to string for JSON serialization
        for item in progress_items:
            item["_id"] = str(item["_id"])
        
        return progress_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/progress/{user_id}/{topic_id}")
async def get_topic_progress(user_id: str, topic_id: str):
    """Get progress for a specific topic"""
    try:
        progress_items = await progress_collection.find({
            "user_id": user_id,
            "topic_id": topic_id
        }).to_list(None)
        
        for item in progress_items:
            item["_id"] = str(item["_id"])
        
        return progress_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/progress/bulk")
async def bulk_update_progress(progress_items: List[DSAProgress]):
    """Bulk update multiple progress items"""
    try:
        operations = []
        user_ids = set()
        
        for progress in progress_items:
            user_ids.add(progress.user_id)
            operations.append({
                "updateOne": {
                    "filter": {
                        "user_id": progress.user_id,
                        "topic_id": progress.topic_id,
                        "problem_name": progress.problem_name
                    },
                    "update": {
                        "$set": {
                            "completed": progress.completed,
                            "completed_at": progress.completed_at or datetime.utcnow(),
                            "difficulty": progress.difficulty,
                            "category": progress.category
                        }
                    },
                    "upsert": True
                }
            })
        
        if operations:
            await progress_collection.bulk_write(operations)
            
            # Update analytics for all affected users
            for user_id in user_ids:
                await update_analytics(user_id)
        
        return {"updated": len(operations)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Filter preferences
@app.post("/filters")
async def save_filters(user_id: str, filters: DSAFilters):
    """Save user's filter preferences"""
    try:
        await preferences_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "filters": filters.dict(),
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        return {"message": "Filters saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/filters/{user_id}")
async def get_filters(user_id: str):
    """Get user's filter preferences"""
    try:
        preferences = await preferences_collection.find_one({"user_id": user_id})
        
        if preferences and "filters" in preferences:
            return preferences["filters"]
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# User preferences
@app.post("/preferences")
async def save_preferences(preferences: DSAUserPreferences):
    """Save user's complete preferences"""
    try:
        await preferences_collection.update_one(
            {"user_id": preferences.user_id},
            {"$set": preferences.dict()},
            upsert=True
        )
        return {"message": "Preferences saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/preferences/{user_id}")
async def get_preferences(user_id: str):
    """Get user's complete preferences"""
    try:
        preferences = await preferences_collection.find_one({"user_id": user_id})
        
        if preferences:
            preferences["_id"] = str(preferences["_id"])
            return preferences
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Favorites
@app.post("/favorites")
async def add_to_favorites(user_id: str, item_id: str):
    """Add item to user's favorites"""
    try:
        await preferences_collection.update_one(
            {"user_id": user_id},
            {
                "$addToSet": {"favorites": item_id},
                "$set": {"updated_at": datetime.utcnow()}
            },
            upsert=True
        )
        return {"message": "Added to favorites"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/favorites/{user_id}/{item_id}")
async def remove_from_favorites(user_id: str, item_id: str):
    """Remove item from user's favorites"""
    try:
        await preferences_collection.update_one(
            {"user_id": user_id},
            {
                "$pull": {"favorites": item_id},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        return {"message": "Removed from favorites"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/favorites/{user_id}")
async def get_favorites(user_id: str):
    """Get user's favorites"""
    try:
        preferences = await preferences_collection.find_one({"user_id": user_id})
        
        if preferences and "favorites" in preferences:
            return preferences["favorites"]
        return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analytics
@app.get("/analytics/{user_id}")
async def get_analytics(user_id: str):
    """Get user's analytics"""
    try:
        analytics = await analytics_collection.find_one({"user_id": user_id})
        
        if analytics:
            analytics["_id"] = str(analytics["_id"])
            return analytics
        
        # Return default analytics if none exist
        return {
            "user_id": user_id,
            "total_problems": 0,
            "solved_problems": 0,
            "difficulty": {},
            "category": {},
            "streak_days": 0,
            "last_activity": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Export/Import
@app.get("/export/{user_id}")
async def export_progress(user_id: str):
    """Export user's progress as CSV"""
    try:
        progress_items = await progress_collection.find({"user_id": user_id}).to_list(None)
        
        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            "topic_id", "problem_name", "completed", "completed_at", 
            "difficulty", "category"
        ])
        
        # Write data
        for item in progress_items:
            writer.writerow([
                item.get("topic_id", ""),
                item.get("problem_name", ""),
                item.get("completed", False),
                item.get("completed_at", ""),
                item.get("difficulty", ""),
                item.get("category", "")
            ])
        
        output.seek(0)
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=dsa_progress_{user_id}.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/import")
async def import_progress(user_id: str = Form(...), file: UploadFile = File(...)):
    """Import user's progress from CSV"""
    try:
        content = await file.read()
        csv_data = csv.DictReader(io.StringIO(content.decode()))
        
        imported = 0
        errors = []
        
        for row in csv_data:
            try:
                progress = DSAProgress(
                    user_id=user_id,
                    topic_id=row.get("topic_id", ""),
                    problem_name=row.get("problem_name", ""),
                    completed=row.get("completed", "").lower() == "true",
                    completed_at=datetime.fromisoformat(row.get("completed_at")) if row.get("completed_at") else None,
                    difficulty=row.get("difficulty", ""),
                    category=row.get("category", "")
                )
                
                await progress_collection.update_one(
                    {
                        "user_id": progress.user_id,
                        "topic_id": progress.topic_id,
                        "problem_name": progress.problem_name
                    },
                    {"$set": progress.dict()},
                    upsert=True
                )
                
                imported += 1
            except Exception as e:
                errors.append(f"Row {imported + 1}: {str(e)}")
        
        # Update analytics
        await update_analytics(user_id)
        
        return {
            "imported": imported,
            "errors": errors
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8007)