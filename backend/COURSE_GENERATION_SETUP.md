# Oboe-Style Course Generation Backend Setup

## Quick Start

### 1. Install Dependencies
```bash
cd backend/agents/course-generation
pip install -r requirements.txt
```

### 2. Configure Environment
Copy `.env.example` to `.env` and add your API keys:

```bash
# Required for AI content generation
GEMINI_API_KEY=your_gemini_api_key_here

# Optional but recommended for better features
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
BRAVE_SEARCH_API_KEY=your_brave_search_api_key_here

# Supabase configuration
SUPABASE_URL=https://jwmsgrodliegekbrhvgt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Database Migration
Go to your Supabase SQL Editor and run: `oboe_course_migration.sql`

### 4. Start Services

**Option A: Start All Services**
```bash
cd backend/scripts
start-all-services.bat
```

**Option B: Start Course Generation Only**
```bash
cd backend/scripts
start-course-generation.bat
```

The service will be available at: `http://localhost:8008`

### 5. Test the Service
```bash
# Health check
curl http://localhost:8008/health

# Generate a course
curl -X POST http://localhost:8000/courses/generate-parallel \
  -H "Content-Type: application/json" \
  -d '{"topic": "React Hooks", "userId": "your-user-id"}'
```

## Architecture

### Parallel AI Agent System
```
User Input → API Gateway (8000) → Course Generation Service (8008)
                                    ↓
                            Parallel Generation (~40s)
                            ├── Outline Agent (5s)
                            ├── Chapter Agent (30s)
                            ├── Flashcard Agent (30s)
                            ├── MCQ Agent (30s)
                            ├── Article Agent (30s)
                            ├── Word Game Agent (30s)
                            └── Audio Script Agent (30s)
                                    ↓
                            TTS Generation (15s) [if ElevenLabs key]
                                    ↓
                            Resource Finding (5s) [if Brave key]
                                    ↓
                            Suggestions (5s)
                                    ↓
                            Finalize & Save
```

### Features
- ✅ 40-second course generation (vs 3 minutes)
- ✅ Real AI content (no dummy data)
- ✅ TTS audio podcasts (short + long)
- ✅ Interactive quizzes and flashcards
- ✅ Word vocabulary games
- ✅ Deep dive articles + FAQ
- ✅ Continue learning suggestions
- ✅ Real-time progress updates

### Free API Tiers
- **Gemini API**: 1,500 requests/day → 100 courses/day FREE
- **ElevenLabs**: 10,000 chars/month → 2 courses with audio/month FREE
- **Brave Search**: 2,000 queries/month → 2,000 courses/month FREE

## Troubleshooting

### Service won't start
- Check if port 8008 is available
- Verify Python environment is activated
- Check API keys are set in .env

### Course generation fails
- Check `GEMINI_API_KEY` is valid
- Check Supabase connection
- Check logs in service console window

### Audio not generating
- Verify `ELEVENLABS_API_KEY` is set
- Check ElevenLabs free tier limits (10,000 chars/month)
- Course will still work without audio

### No resources showing
- Verify `BRAVE_SEARCH_API_KEY` is set
- Course will still work without resources

## API Endpoints

### POST /generate-course-parallel
Generate a course with parallel AI agents.

**Request:**
```json
{
  "topic": "React Hooks",
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "courseId": "course-uuid",
  "jobId": "job-uuid",
  "estimatedTime": 40
}
```

### GET /health
Check service health and configuration.

**Response:**
```json
{
  "status": "healthy",
  "service": "course-generation",
  "has_gemini": true,
  "has_elevenlabs": true,
  "has_brave": true
}
```

## Monitoring

Watch the console window for real-time logs:
- 🚀 Course generation started
- ✅ Outline generated
- ✅ Content generated
- ✅ Audio generated
- ✅ Course ready

## Next Steps

After setup, you can:
1. Generate courses via frontend at `/course-generator`
2. View courses at `/course/{id}`
3. Monitor generation in real-time
4. Explore Listen/Read/Interact tabs
