# StudyMate Backend - Unified Setup

## 🚀 Quick Start (Windows)

Simply double-click `quick_start.bat` and follow the prompts!

## 📋 Manual Setup

### 1. Run Setup Script

```bash
cd backend
python setup_backend.py
```

This will:

- ✅ Create one virtual environment for all services
- 📦 Install all dependencies from `unified_requirements.txt`
- 📝 Create `.env` configuration file
- 🔧 Generate service runner scripts
- 🧪 Create test scripts

### 2. Configure API Keys

Edit `backend/.env` with your actual credentials:

```env
# Required for resume parsing and profile auto-fill
GROQ_API_KEY=your_groq_api_key_here

# Required for database operations
SUPABASE_URL=https://jwmsgrodliegekbrhvgt.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
SUPABASE_DB_URL=postgresql://postgres:[password]@db.jwmsgrodliegekbrhvgt.supabase.co:5432/postgres
```

Get your API keys:

- **Groq API**: https://groq.com/ (free tier available)
- **Supabase**: Your project dashboard (Settings → API)

### 3. Start Services

**All Services:**

```bash
# Windows
scripts\start_all_services.bat

# Linux/macOS
./scripts/start_all_services.sh
```

**Individual Services:**

```bash
# Profile Service (for resume upload)
scripts\start_profile_service.bat

# Resume Analyzer
scripts\start_resume_analyzer.bat

# API Gateway
scripts\start_api_gateway.bat
```

### 4. Test Resume Upload & Profile Auto-Fill

```bash
# Using virtual environment python
venv\Scripts\python.exe test_complete_workflow.py

# Or if services are running
python test_complete_workflow.py
```

## 🔧 Service Architecture

| Service             | Port | Purpose                            |
| ------------------- | ---- | ---------------------------------- |
| **API Gateway**     | 8000 | Central routing and authentication |
| **Profile Service** | 8006 | Resume upload & profile auto-fill  |
| **Resume Analyzer** | 8003 | Resume analysis & job matching     |
| **Course Service**  | 8007 | Course generation and management   |
| **DSA Service**     | 8004 | Algorithm practice tracking        |

## 📄 Resume Upload Flow

1. **Upload Resume** → Profile Service (`/extract-profile`)
2. **AI Parsing** → Groq API extracts structured data
3. **Auto-Fill Profile** → Data automatically populates user profile
4. **Confidence Score** → Shows extraction accuracy
5. **Profile Complete** → User can review and edit

### Supported File Types

- 📄 PDF files (`.pdf`)
- 📝 Word documents (`.docx`)
- 📋 Text files (`.txt`)

## 🧪 Testing

### Health Checks

- http://localhost:8000/health (API Gateway)
- http://localhost:8006/health (Profile Service)
- http://localhost:8003/health (Resume Analyzer)

### API Documentation

- http://localhost:8000/docs (API Gateway Swagger)
- http://localhost:8006/docs (Profile Service Swagger)
- http://localhost:8003/docs (Resume Analyzer Swagger)

### Complete Workflow Test

The `test_complete_workflow.py` script tests:

- ✅ Service connectivity
- ✅ Resume upload
- ✅ AI extraction
- ✅ Profile auto-filling
- ✅ Data validation

## 🔍 Troubleshooting

### Common Issues

| Problem                     | Solution                                              |
| --------------------------- | ----------------------------------------------------- |
| **Services won't start**    | Check `.env` file exists and has correct API keys     |
| **Import errors**           | Activate virtual environment: `venv\Scripts\activate` |
| **Database errors**         | Verify Supabase credentials in `.env`                 |
| **Resume extraction fails** | Check Groq API key is valid                           |
| **Port conflicts**          | Kill existing processes or restart terminal           |

### Debug Commands

```bash
# Check service status
python scripts/check-services.py

# Test individual service
curl http://localhost:8006/health

# View service logs
# Check terminal windows where services are running
```

## 🌟 Key Features

- 🧠 **AI-Powered**: Uses Groq API for intelligent resume parsing
- 🔄 **Auto-Fill**: Automatically populates profile from resume data
- 📊 **Confidence Scoring**: Shows extraction accuracy percentage
- 🎯 **Job Matching**: Analyzes resumes for specific job roles
- 📈 **Progress Tracking**: Monitors profile completion
- 🔐 **Secure**: JWT authentication and environment-based config
- 🚀 **Scalable**: Microservices architecture for independent scaling

## 🎯 Frontend Integration

The backend is designed to work with the React frontend. Key endpoints:

```javascript
// Upload resume and auto-fill profile
POST /api/profile/extract-profile
FormData: {resume: File, user_id: string}

// Get user profile
GET /api/profile/{user_id}

// Update profile
PUT /api/profile/{user_id}
Body: {personalInfo, education, experience, skills, ...}
```

## 📞 Support

If you encounter issues:

1. Check the service logs in terminal windows
2. Verify `.env` configuration
3. Test API keys are valid
4. Run the test script for diagnostics

Happy coding! 🎉
