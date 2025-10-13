# 🚀 Quick Start - Oboe Course Generator

## 1️⃣ Setup API Keys (2 minutes)

Open `backend/agents/course-generation/.env` and add your keys:

```bash
GEMINI_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here  # Optional
BRAVE_SEARCH_API_KEY=your_key_here  # Optional
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

## 2️⃣ Run Database Migration

Go to Supabase SQL Editor and run: `oboe_course_migration.sql`

## 3️⃣ Start Backend Services

```bash
cd backend/scripts
start-all-services.bat
```

This starts:
- API Gateway (port 8000)
- Profile Service (port 8006)
- Resume Analyzer (port 8003)
- **Course Generation (port 8008)** ← NEW!

## 4️⃣ Test It!

1. Go to `/course-generator`
2. Type: "React Hooks"
3. Click "Create Course"
4. Wait ~40 seconds
5. Enjoy your AI-generated course! 🎉

## Features

✅ **40-second generation** (vs 3 minutes)
✅ **Real AI content** using Gemini
✅ **Audio podcasts** via ElevenLabs TTS
✅ **Quizzes & flashcards**
✅ **Word games**
✅ **Continue learning suggestions**
✅ **100% FREE** using API free tiers!

## Troubleshooting

**Error: "Failed to fetch"**
- Make sure all backend services are running
- Check `backend/agents/course-generation/.env` has API keys
- Verify port 8008 is not in use

**No audio generated**
- Add `ELEVENLABS_API_KEY` to `.env`
- Note: Course still works without audio

**Slow generation**
- First generation might be slower (cold start)
- Subsequent generations are faster
- Target: 40 seconds per course
