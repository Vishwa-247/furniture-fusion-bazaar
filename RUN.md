# Agentic StudyMate - Development Setup

## 🚀 Overview
Agentic StudyMate is an AI-powered learning platform with intelligent profile building, course generation, mock interviews, and DSA practice features.

## 📋 Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **Git**
- **Code Editor** (VS Code recommended)

### Required Accounts & API Keys
1. **Supabase Account** (Database & Authentication)
2. **Groq API Key** (AI Resume Processing)

## 🔧 Environment Setup

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd agentic-studymate
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (Already configured)
VITE_SUPABASE_URL=https://jwmsgrodliegekbrhvgt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3bXNncm9kbGllZ2VrYnJodmd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzU3OTEsImV4cCI6MjA3MjA1MTc5MX0.Nk7JTZQx6Z5tKiVLHeZXUvy8Zkqk3Lc6pftr3H_25RY
```

### 3. Backend Services Setup

The backend consists of microservices that need to be configured:

#### Required Environment Variables for Backend:
Create `backend/.env` file:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Supabase Configuration
SUPABASE_URL=https://jwmsgrodliegekbrhvgt.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Service URLs (for local development)
PROFILE_SERVICE_URL=http://localhost:8006
RESUME_ANALYZER_URL=http://localhost:8005
```

#### How to get API Keys:

1. **Groq API Key**:
   - Visit [https://console.groq.com/](https://console.groq.com/)
   - Sign up for free account
   - Navigate to API Keys section
   - Create new API key
   - Copy the key to `GROQ_API_KEY`

2. **Supabase Service Key**:
   - Go to your Supabase dashboard
   - Navigate to Settings > API
   - Copy the `service_role` key (NOT the anon key)
   - Add to `SUPABASE_SERVICE_KEY`

## 🏃‍♂️ Running the Application

### Frontend Only (Recommended for UI testing)
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

### Full Stack (Frontend + Backend Services)

#### Option 1: Using Docker (Recommended)
```bash
cd backend
docker-compose up -d
```

#### Option 2: Manual Service Startup
Each service needs to be run separately:

```bash
# Terminal 1 - Profile Service
cd backend/agents/profile-service
pip install -r requirements.txt
python main.py

# Terminal 2 - Resume Analyzer
cd backend/agents/resume-analyzer-groq  
pip install -r requirements.txt
python main.py

# Terminal 3 - Frontend
npm run dev
```

## 🗄️ Database Setup

The database is already configured in Supabase with all necessary tables:

### Current Tables:
- `profiles` - User basic profiles
- `user_profiles` - Detailed user information
- `user_education` - Education records
- `user_experience` - Work experience
- `user_projects` - Project portfolio
- `user_skills` - Skills and competencies
- `user_certifications` - Certifications
- `user_resumes` - Resume files and metadata
- `resume_extractions` - AI-extracted data from resumes
- `profile_analytics` - User interaction tracking

### Database Functions:
- `calculate_profile_completion(user_id)` - Calculates profile completion percentage
- `handle_new_user()` - Automatically creates profile on user signup

## 🔐 Authentication Setup

### Supabase Auth Configuration:
1. Go to Supabase Dashboard > Authentication > Settings
2. Set Site URL: `http://localhost:5173` (for development)
3. Add Redirect URLs:
   - `http://localhost:5173/**`
   - Your production URL when deployed

### Enable Auth Providers:
Currently configured for email/password. To add social providers:
1. Go to Authentication > Providers
2. Enable desired providers (Google, GitHub, etc.)
3. Configure with your OAuth credentials

## 🎯 Key Features

### 1. Agentic Profile Builder
- **AI Resume Parsing**: Upload resume → AI extracts structured data
- **Smart Auto-fill**: Review and apply extracted data to profile sections
- **Profile Completion Tracking**: Real-time completion percentage
- **AI Suggestions**: Intelligent recommendations for profile improvement

### 2. Course Generation
- AI-powered course creation based on user requirements
- Adaptive learning paths
- Progress tracking

### 3. Mock Interviews
- Video-based interview practice
- AI feedback and analysis
- Performance tracking

### 4. DSA Practice
- Curated problem sets
- Company-wise problem filtering
- Progress tracking

## 🐛 Troubleshooting

### Common Issues:

1. **Build Errors**:
   ```bash
   npm run build
   # Check console for specific errors
   ```

2. **Database Connection Issues**:
   - Verify Supabase URL and keys
   - Check if tables exist in Supabase dashboard

3. **Authentication Issues**:
   - Verify Site URL and Redirect URLs in Supabase
   - Check browser console for auth errors

4. **Resume Upload Issues**:
   - Ensure Groq API key is valid
   - Check if `resume-files` bucket exists in Supabase Storage
   - Verify backend services are running

### Debug Mode:
```bash
# Enable verbose logging
DEBUG=* npm run dev
```

## 🚀 Deployment

### Frontend Deployment:
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

### Backend Deployment:
- Use Docker images for each service
- Set up proper environment variables
- Ensure services can communicate

## 📊 Monitoring

### Development Tools:
- **Supabase Dashboard**: Database and auth monitoring
- **Browser DevTools**: Frontend debugging
- **Backend Logs**: Check service logs for API issues

### Profile Analytics:
The app tracks user interactions for improving the experience:
- Profile section views
- Auto-fill usage
- Feature adoption

## 🔒 Security Notes

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Enable Row Level Security** in Supabase (already configured)
4. **Regularly rotate API keys**

## 📝 Development Workflow

1. **Feature Development**:
   - Create feature branch
   - Develop with frontend-only mode first
   - Test with backend services
   - Create PR

2. **Database Changes**:
   - Use Supabase migrations
   - Test locally before applying to production
   - Update type definitions

3. **AI Features**:
   - Test with different resume formats
   - Validate extraction accuracy
   - Handle edge cases gracefully

## 🆘 Support

- Check the browser console for frontend errors
- Monitor Supabase logs for database issues
- Use Groq dashboard for AI service monitoring
- Check service health endpoints: `http://localhost:8006/health`

---

**Happy Coding! 🎉**