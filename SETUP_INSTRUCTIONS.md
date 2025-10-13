# StudyMate Local Setup Instructions

This document provides step-by-step instructions to run the StudyMate application locally without Docker.

## Files Created/Modified

1. **[backend/.env](file://c:\Users\VISHWA%20TEJA%20THOUTI\Downloads\Vishwa7799-LMS\Profile-builder-ver-9\backend\.env)** - Environment configuration file
2. **[backend/install_dependencies.py](file://c:\Users\VISHWA%20TEJA%20THOUTI\Downloads\Vishwa7799-LMS\Profile-builder-ver-9\backend\install_dependencies.py)** - Dependency installation script
3. **[backend/start_resume_analyzer.py](file://c:\Users\VISHWA%20TEJA%20THOUTI\Downloads\Vishwa7799-LMS\Profile-builder-ver-9\backend\start_resume_analyzer.py)** - Resume analyzer startup script
4. **[backend/start_course_service.py](file://c:\Users\VISHWA%20TEJA%20THOUTI\Downloads\Vishwa7799-LMS\Profile-builder-ver-9\backend\start_course_service.py)** - Course service startup script
5. **[backend/start_dsa_service.py](file://c:\Users\VISHWA%20TEJA%20THOUTI\Downloads\Vishwa7799-LMS\Profile-builder-ver-9\backend\start_dsa_service.py)** - DSA service startup script
6. **[RUNNING_SERVICES.md](file://c:\Users\VISHWA%20TEJA%20THOUTI\Downloads\Vishwa7799-LMS\Profile-builder-ver-9\RUNNING_SERVICES.md)** - Detailed running instructions
7. **[SETUP_INSTRUCTIONS.md](file://c:\Users\VISHWA%20TEJA%20THOUTI\Downloads\Vishwa7799-LMS\Profile-builder-ver-9\SETUP_INSTRUCTIONS.md)** - This file

## Modified Files

1. **[backend/start_profile_service.py](file://c:\Users\VISHWA%20TEJA%20THOUTI\Downloads\Vishwa7799-LMS\Profile-builder-ver-9\backend\start_profile_service.py)** - Fixed import statement
2. **[backend/start_api_gateway.py](file://c:\Users\VISHWA%20TEJA%20THOUTI\Downloads\Vishwa7799-LMS\Profile-builder-ver-9\backend\start_api_gateway.py)** - Fixed import statement

## Setup Steps

### 1. Environment Configuration

Update the [backend/.env](file://c:\Users\VISHWA%20TEJA%20THOUTI\Downloads\Vishwa7799-LMS\Profile-builder-ver-9\backend\.env) file with your actual credentials:

```env
# Default API Keys (fallback if service-specific keys not provided)
GROQ_API_KEY=your_default_groq_api_key_here
GEMINI_API_KEY=your_default_gemini_api_key_here

# Service-specific API Keys (optional, for using different keys per service)
RESUME_ANALYZER_GROQ_KEY=your_resume_analyzer_groq_key_here
RESUME_ANALYZER_GEMINI_KEY=your_resume_analyzer_gemini_key_here
PROFILE_SERVICE_GROQ_KEY=your_profile_service_groq_key_here
PROFILE_SERVICE_GEMINI_KEY=your_profile_service_gemini_key_here
COURSE_SERVICE_GROQ_KEY=your_course_service_groq_key_here
COURSE_SERVICE_GEMINI_KEY=your_course_service_gemini_key_here

# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_actual_supabase_service_role_key_here

# Database Configuration (Supabase PostgreSQL)
SUPABASE_DB_URL=postgresql://postgres:your_password@your-project-ref.supabase.co:5432/postgres

# JWT Configuration (for internal service communication)
JWT_SECRET=your_secure_jwt_secret_here

# Service URLs (Local development)
RESUME_ANALYZER_URL=http://localhost:8003
PROFILE_SERVICE_URL=http://localhost:8006
COURSE_GENERATION_URL=http://localhost:8001
INTERVIEW_COACH_URL=http://localhost:8002
```

### 2. Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Run the installation script
python install_dependencies.py
```

### 3. Run Services

Each service needs to be run in a separate terminal:

**Terminal 1 - Profile Service:**
```bash
cd backend
python start_profile_service.py
```

**Terminal 2 - Resume Analyzer:**
```bash
cd backend
python start_resume_analyzer.py
```

**Terminal 3 - Course Service:**
```bash
cd backend
python start_course_service.py
```

**Terminal 4 - DSA Service:**
```bash
cd backend
python start_dsa_service.py
```

**Terminal 5 - API Gateway:**
```bash
cd backend
python start_api_gateway.py
```

## Service Ports

- **API Gateway**: http://localhost:8000
- **Profile Service**: http://localhost:8006
- **Resume Analyzer**: http://localhost:8003
- **Course Service**: http://localhost:8001
- **DSA Service**: http://localhost:8002

## Verification

Check that each service is running by visiting their `/health` endpoints:

- http://localhost:8000/health
- http://localhost:8006/health
- http://localhost:8003/health
- http://localhost:8001/health
- http://localhost:8002/health

## Frontend Setup

To run the frontend:

```bash
# Install dependencies
npm install

# Create .env file in root directory
echo "VITE_GEMINI_API_KEY=your_gemini_api_key" > .env

# Run development server
npm run dev
```

Frontend will be available at http://localhost:5173

## Troubleshooting

If you encounter issues:

1. **Import Errors**: Ensure you're in the correct directory when running scripts
2. **Port Conflicts**: Check that required ports are not in use
3. **Database Connection**: Verify Supabase credentials are correct
4. **Missing Dependencies**: Run individual pip install commands for each service

For detailed troubleshooting, refer to [RUNNING_SERVICES.md](file://c:\Users\VISHWA%20TEJA%20THOUTI\Downloads\Vishwa7799-LMS\Profile-builder-ver-9\RUNNING_SERVICES.md)
