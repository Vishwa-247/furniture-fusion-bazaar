# 🚀 Quick Start Guide - StudyMate Profile Service

## ⚡ 30-Second Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Run setup script
python scripts/setup.py

# 3. Edit .env with your keys
# Get Groq API key: https://groq.com/
# Get Supabase keys: Your project dashboard

# 4. Start the service
./scripts/start-profile-service.sh    # Linux/macOS
scripts/start-profile-service.bat     # Windows

# 5. Test it works
python test_service.py
```

## ✅ Service URLs

- **Health Check:** http://localhost:8006/health
- **API Docs:** http://localhost:8006/docs
- **Service Info:** http://localhost:8006/

## 🔑 Required Environment Variables

```env
GROQ_API_KEY=your_groq_api_key_here
SUPABASE_URL=https://jwmsgrodliegekbrhvgt.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
SUPABASE_DB_URL=postgresql://postgres:[password]@db.jwmsgrodliegekbrhvgt.supabase.co:5432/postgres
```

## 🧪 Test Commands

```bash
# Health check
curl http://localhost:8006/health

# Test resume upload (replace with your file)
curl -X POST "http://localhost:8006/extract-profile" \
  -F "resume=@resume.pdf" \
  -F "user_id=test-123"

# Get user profile
curl http://localhost:8006/profile/test-123
```

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 8006 in use | `pkill -f "main.py"` or restart |
| Missing packages | `pip install -r requirements.txt` |
| Database error | Check Supabase credentials |
| Groq error | Verify API key validity |

---

**Need help?** Check the full [README.md](README.md) for detailed instructions.