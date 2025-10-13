# Removed Components Documentation

This document tracks the architecture and components that were removed during the backend simplification. This serves as a reference for future development when we want to re-implement these features.

## Removed Services & Architecture

### Original Microservices Architecture (Before Cleanup)

The original backend had a complex microservices setup with the following components:

#### Removed Services:
1. **Course Generation Service** (Port 8001)
   - Location: `backend/agents/course-generation/`
   - Purpose: AI-powered course creation using Gemini/Groq APIs
   - Status: Placeholder implementation only
   - Docker Container: `studymate_course_generation`

2. **Interview Coach Service** (Port 8002)
   - Location: `backend/agents/interview-coach/`
   - Purpose: Mock interview system with AI feedback
   - Status: Placeholder implementation only
   - Docker Container: `studymate_interview_coach`

3. **Chat Mentor Service** (Port 8003)
   - Location: `backend/agents/chat-mentor/`
   - Purpose: AI tutoring and chat assistance
   - Status: Referenced but not implemented

4. **Progress Analyst Service** (Port 8004)
   - Location: `backend/agents/progress-analyst/`
   - Purpose: Learning analytics and progress tracking
   - Status: Referenced but not implemented

5. **Orchestrator Service**
   - Location: `backend/orchestrator/`
   - Purpose: Service coordination and workflow management
   - Status: Not actively used

#### Removed Database Components:
1. **MongoDB Integration**
   - Collections: `users`, `profiles`, `courses`, `chapters`, `mock_interviews`, `progress_tracking`
   - Connection: Via `pymongo` and `motor` drivers
   - Docker Container: `mongodb`

2. **Redis Integration**
   - Purpose: Caching and session management
   - Docker Container: `redis`

### Dependencies Removed
From various `requirements.txt` files:
- `pymongo==4.6.0`
- `motor==3.3.2` (async MongoDB driver)
- `redis==5.0.1`
- `python-jose[cryptography]==3.3.0` (JWT handling, now managed by Supabase)
- `passlib[bcrypt]==1.7.4` (password hashing, now managed by Supabase)

### Environment Variables Removed
- `MONGODB_URL`
- `REDIS_URL`
- `COURSE_GENERATION_URL`
- `INTERVIEW_COACH_URL`
- `CHAT_MENTOR_URL`
- `PROGRESS_ANALYST_URL`

## Current Working Architecture (Post-Cleanup)

### Retained Services:
1. **API Gateway** (Port 8000)
   - Central routing and authentication
   - Supabase integration
   - Working implementation

2. **Resume Analyzer Service** (Port 8003)
   - AI-powered resume analysis using Groq
   - PDF/DOCX parsing
   - Supabase database integration
   - Working implementation

3. **Profile Service** (Port 8006)
   - User profile management
   - Resume data extraction
   - Supabase integration
   - Working implementation

4. **Shared Database Module**
   - Location: `backend/shared/database/`
   - Supabase connection utilities
   - Working implementation

### Current Database: Supabase PostgreSQL
- Authentication: Supabase Auth
- Database: PostgreSQL with RLS
- File Storage: Supabase Storage
- Real-time: Supabase Realtime

## Why These Components Were Removed

1. **Incomplete Implementation**: Most services were placeholder implementations without actual business logic
2. **Database Migration**: Moved from MongoDB to Supabase PostgreSQL for better integration
3. **Simplification**: Focus on core profile builder functionality first
4. **Better Debugging**: Simplified architecture easier to debug and test
5. **Gradual Development**: Build one feature at a time properly rather than multiple incomplete services

## Future Re-Implementation Plan

When ready to add these features back:

### Phase 1: Course Generation
- Re-implement using the current Supabase + FastAPI pattern
- Use Groq/Gemini APIs for AI generation
- Store course data in Supabase PostgreSQL
- Reference: Original placeholder in `agents/course-generation/`

### Phase 2: Interview Coach
- Build mock interview system
- Integrate with existing profile data
- Use AI for feedback generation
- Reference: Original placeholder in `agents/interview-coach/`

### Phase 3: Chat Mentor
- Implement AI chat assistant
- Context-aware conversations
- Integration with course progress
- Build from scratch (was never implemented)

### Phase 4: Progress Analytics
- Learning analytics dashboard
- Progress tracking
- Performance insights
- Build from scratch (was never implemented)

## Migration Notes

### Database Migration Process:
1. **From MongoDB to Supabase**: All user data, profiles, and resume analysis now stored in Supabase PostgreSQL
2. **Authentication**: Migrated from custom JWT to Supabase Auth
3. **File Storage**: Resume uploads now use Supabase Storage instead of local file handling

### API Changes:
- All services now use Supabase client instead of MongoDB
- Authentication handled by Supabase JWT tokens
- Removed custom user management (handled by Supabase Auth)

### Docker Changes:
- Removed MongoDB and Redis containers
- Simplified docker-compose.yml to essential services only
- All services now connect to external Supabase instance

This documentation ensures we can rebuild these features properly when needed, following the current clean architecture pattern.