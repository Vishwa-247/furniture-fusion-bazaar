#!/usr/bin/env python3
"""
Run the unified resume system database migration
"""
import asyncio
import os

import asyncpg
from dotenv import load_dotenv

load_dotenv()

MIGRATION_SQL = """
-- Migration: Unified Resume System
-- Add analysis tracking columns to user_resumes table
-- Link resume_analysis_history to user_resumes

-- Add analysis tracking columns to user_resumes
ALTER TABLE user_resumes
ADD COLUMN IF NOT EXISTS analysis_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_analyzed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS latest_analysis_id UUID;

-- Add resume_id column to resume_analysis_history to link back to the resume
ALTER TABLE resume_analysis_history
ADD COLUMN IF NOT EXISTS resume_id UUID;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_resume_analysis_resume_id 
ON resume_analysis_history(resume_id);

CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id 
ON user_resumes(user_id);

CREATE INDEX IF NOT EXISTS idx_user_resumes_latest_analysis 
ON user_resumes(latest_analysis_id);

-- Add comments for documentation
COMMENT ON COLUMN user_resumes.analysis_count IS 'Number of times this resume has been analyzed';
COMMENT ON COLUMN user_resumes.last_analyzed_at IS 'Timestamp of the most recent analysis';
COMMENT ON COLUMN user_resumes.latest_analysis_id IS 'Foreign key to the most recent analysis in resume_analysis_history';
COMMENT ON COLUMN resume_analysis_history.resume_id IS 'Foreign key linking back to the resume file in user_resumes';
"""

async def run_migration():
    """Run the database migration"""
    db_url = os.getenv("SUPABASE_DB_URL")
    
    if not db_url:
        print("❌ SUPABASE_DB_URL not found in .env file")
        return False
    
    try:
        print("🔄 Connecting to database...")
        conn = await asyncpg.connect(db_url)
        
        print("🚀 Running migration...")
        await conn.execute(MIGRATION_SQL)
        
        print("✅ Migration completed successfully!")
        print("\nNew columns added:")
        print("  - user_resumes.analysis_count")
        print("  - user_resumes.last_analyzed_at")
        print("  - user_resumes.latest_analysis_id")
        print("  - resume_analysis_history.resume_id")
        print("\nIndexes created:")
        print("  - idx_resume_analysis_resume_id")
        print("  - idx_user_resumes_user_id")
        print("  - idx_user_resumes_latest_analysis")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(run_migration())
    exit(0 if success else 1)
