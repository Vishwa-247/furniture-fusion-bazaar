# Vision Shopper - AI-Powered Career Development Platform

## Project Documentation for Academic Submission

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Problem Statement](#problem-statement)
4. [Objectives](#objectives)
5. [System Architecture](#system-architecture)
6. [Technology Stack](#technology-stack)
7. [Features & Modules](#features--modules)
8. [Database Design](#database-design)
9. [API Documentation](#api-documentation)
10. [Implementation Details](#implementation-details)
11. [Security & Authentication](#security--authentication)
12. [AI Integration](#ai-integration)
13. [Installation & Setup](#installation--setup)
14. [Testing & Validation](#testing--validation)
15. [Challenges & Solutions](#challenges--solutions)
16. [Future Enhancements](#future-enhancements)
17. [Conclusion](#conclusion)
18. [References](#references)

---

## Executive Summary

**Vision Shopper** is an AI-powered career development platform designed to help students and professionals advance their careers through intelligent resume analysis, personalized learning paths, interview preparation, and skill development. The platform leverages cutting-edge AI technologies including Groq API and Google Gemini to provide actionable insights and recommendations.

**Key Highlights:**
- Microservices-based architecture with 6+ independent services
- Real-time AI-powered resume analysis and feedback
- Personalized course generation based on skill gaps
- Interactive interview coaching with AI
- Data Structures & Algorithms practice platform
- Unified profile management with cloud storage

**Technologies:** React, TypeScript, FastAPI, Python, Supabase (PostgreSQL), MongoDB, Groq API, Gemini API, JWT Authentication

---

## Project Overview

Vision Shopper is a comprehensive career development ecosystem that addresses the challenges faced by job seekers in today's competitive market. The platform integrates multiple AI agents working together to provide:

1. **Resume Intelligence** - Analyze resumes against job descriptions and provide improvement suggestions
2. **Skill Assessment** - Identify skill gaps and recommend learning paths
3. **Course Generation** - Create personalized courses with structured modules and topics
4. **Interview Preparation** - AI-powered mock interviews with feedback
5. **DSA Practice** - Curated data structures and algorithms problems
6. **Profile Management** - Centralized profile with resume storage and extraction

### Target Audience
- College students preparing for placements
- Fresh graduates entering the job market
- Professionals looking to switch careers
- Anyone seeking to improve their technical skills

---

## Problem Statement

Job seekers face several challenges in today's market:

1. **Lack of Resume Feedback** - No immediate feedback on resume quality and relevance
2. **Skill Gap Identification** - Difficulty identifying what skills to learn for target roles
3. **Fragmented Learning** - Scattered resources make learning paths unclear
4. **Interview Anxiety** - Limited practice opportunities for real interviews
5. **DSA Preparation** - Need for structured problem-solving practice
6. **Profile Management** - No centralized system to manage career documents

### Our Solution

Vision Shopper provides an integrated platform that:
- Uses AI to analyze resumes and provide instant, actionable feedback
- Identifies skill gaps by comparing resumes with job descriptions
- Generates personalized courses with structured learning paths
- Offers AI-powered interview coaching with realistic scenarios
- Provides curated DSA problems with solutions
- Maintains a unified profile with intelligent document management

---

## Objectives

### Primary Objectives
1. Develop an AI-powered resume analysis system with 90%+ accuracy
2. Create a microservices architecture supporting independent service scaling
3. Implement secure user authentication and data protection
4. Integrate multiple AI APIs (Groq, Gemini) for diverse use cases
5. Build a responsive, modern UI with excellent user experience
6. Design a scalable database schema supporting future growth

### Secondary Objectives
1. Achieve sub-2-second response time for AI analysis
2. Support multiple resume formats (PDF, DOCX)
3. Implement real-time updates and notifications
4. Create comprehensive API documentation
5. Ensure cross-browser compatibility
6. Implement error handling and graceful degradation

---

## System Architecture

### Architecture Overview

Vision Shopper follows a **microservices architecture** with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│                  http://localhost:5173                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ REST API Calls
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   API Gateway (Port 8080)                   │
│              - JWT Authentication                           │
│              - Request Routing                              │
│              - Service Discovery                            │
└───────┬───────┬────────┬────────┬────────┬─────────────────┘
        │       │        │        │        │
        │       │        │        │        │
┌───────▼───┐ ┌▼──────┐ ┌▼──────┐ ┌▼─────┐ ┌▼──────────┐
│  Resume   │ │Profile│ │Course │ │Inter-│ │    DSA    │
│ Analyzer  │ │Service│ │ Gen   │ │view  │ │  Service  │
│ (8003)    │ │(8006) │ │(8007) │ │Coach │ │  (8004)   │
│           │ │       │ │       │ │(8002)│ │           │
└─────┬─────┘ └───┬───┘ └───┬───┘ └──┬───┘ └─────┬─────┘
      │           │         │         │           │
      │           │         │         │           │
┌─────▼───────────▼─────────▼─────────▼───────────▼─────┐
│              Supabase (PostgreSQL)                     │
│           - User data                                  │
│           - Resume metadata         ┌────────────────┐ │
│           - Analysis history        │   MongoDB      │ │
│           - Course data             │  (DSA Problems)│ │
│           - Interview history       └────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Service Responsibilities

#### 1. **API Gateway** (Port 8080)
- Central entry point for all client requests
- JWT token validation and user authentication
- Request routing to appropriate microservices
- CORS handling
- Rate limiting and throttling

#### 2. **Resume Analyzer Service** (Port 8003)
- Resume parsing (PDF, DOCX)
- AI-powered analysis using Groq API
- Skill extraction and gap identification
- Resume scoring and recommendations
- Analysis history management
- Supabase Storage integration for resume files

#### 3. **Profile Service** (Port 8006)
- User profile management
- Resume upload and storage
- AI-powered resume data extraction
- Profile information parsing
- Education, experience, skills management

#### 4. **Course Generation Service** (Port 8007)
- AI-powered course creation using Gemini API
- Personalized learning path generation
- Module and topic structuring
- Course progress tracking
- Resource recommendation

#### 5. **Interview Coach Service** (Port 8002)
- AI-powered interview question generation
- Answer evaluation and feedback
- Interview session management
- Performance analytics
- Industry-specific interview scenarios

#### 6. **DSA Service** (Port 8004)
- Data structures and algorithms problems
- MongoDB-based problem storage
- Difficulty-based problem filtering
- Solution viewing
- Topic-wise categorization

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library for building interactive interfaces |
| **TypeScript** | 5.5.3 | Type-safe JavaScript development |
| **Vite** | 5.4.2 | Fast build tool and dev server |
| **React Router DOM** | 6.26.1 | Client-side routing |
| **TanStack React Query** | 5.53.1 | Data fetching and caching |
| **Tailwind CSS** | 3.4.10 | Utility-first CSS framework |
| **Radix UI** | Latest | Accessible UI primitives |
| **ShadCN UI** | Latest | Pre-built component library |
| **Lucide React** | Latest | Icon library |
| **Recharts** | 2.12.7 | Data visualization |
| **Framer Motion** | 11.5.4 | Animation library |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.8+ | Backend programming language |
| **FastAPI** | 0.115.0 | High-performance async web framework |
| **Uvicorn** | 0.31.0 | ASGI server |
| **asyncpg** | 0.29.0 | PostgreSQL async driver |
| **PyJWT** | 2.9.0 | JWT token handling |
| **PyPDF2** | 3.0.1 | PDF parsing |
| **python-docx** | 1.1.2 | DOCX parsing |
| **Groq** | 0.32.0 | AI API for resume analysis |
| **google-generativeai** | 0.8.3 | Gemini API for course generation |
| **pymongo** | 4.10.1 | MongoDB driver |
| **python-multipart** | 0.0.12 | File upload handling |

### Database & Storage

| Technology | Purpose |
|------------|---------|
| **Supabase (PostgreSQL)** | Primary database for structured data |
| **Supabase Storage** | Cloud storage for resume files |
| **MongoDB** | Document database for DSA problems |

### AI & ML Services

| Service | Purpose |
|---------|---------|
| **Groq API** | Fast LLM inference for resume analysis |
| **Google Gemini API** | Course generation and content creation |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **npm/pip** | Package management |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **VS Code** | IDE |

---

## Features & Modules

### 1. Resume Analyzer Module

**Description:** AI-powered resume analysis that provides instant feedback and recommendations.

**Key Features:**
- **Multi-format Support** - Upload PDF or DOCX resumes
- **Job Role Matching** - Analyze resume against specific job descriptions
- **Skill Extraction** - Automatically identify technical and soft skills
- **Gap Analysis** - Compare resume skills with job requirements
- **Scoring System** - Quantitative scoring across multiple dimensions
- **Improvement Suggestions** - Actionable recommendations for enhancement
- **Analysis History** - Track previous analyses and improvements
- **Resume Library** - Select from previously uploaded resumes

**Technical Implementation:**
```python
# Resume analysis using Groq API
async def analyze_with_groq(resume_text, job_role, job_description):
    response = groq_client.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=[{
            "role": "user",
            "content": f"Analyze resume for {job_role}..."
        }],
        temperature=0.7
    )
    return json.loads(response.choices[0].message.content)
```

**Analysis Dimensions:**
- Content Quality (0-100)
- Formatting & Structure (0-100)
- Keyword Optimization (0-100)
- Experience Relevance (0-100)
- Achievement Impact (0-100)

### 2. Profile Builder Module

**Description:** Centralized profile management with AI-powered data extraction.

**Key Features:**
- **Resume Upload** - Drag-and-drop resume upload to Supabase Storage
- **AI Extraction** - Automatically extract name, email, phone, skills
- **Manual Editing** - Edit extracted information
- **Education Management** - Add/edit educational qualifications
- **Experience Tracking** - Manage work experience and projects
- **Skills Repository** - Organize technical and soft skills
- **Profile Completeness** - Track profile completion percentage

**Data Flow:**
```
User uploads resume → Supabase Storage → AI extraction (Groq) → 
Parse structured data → Save to PostgreSQL → Display in UI
```

### 3. Course Generation Module

**Description:** AI-generated personalized courses based on skill gaps.

**Key Features:**
- **Intelligent Course Creation** - Uses Gemini AI to generate course structure
- **Skill Gap Analysis** - Identifies missing skills from job descriptions
- **Structured Learning Paths** - Organized modules and topics
- **Duration Estimation** - Realistic time estimates for each module
- **Resource Links** - Curated external resources
- **Progress Tracking** - Track course completion
- **Multiple Formats** - Video, reading, practice problems

**Course Structure:**
```
Course
├── Module 1
│   ├── Topic 1.1
│   ├── Topic 1.2
│   └── Topic 1.3
├── Module 2
│   └── ...
└── Module N
```

**AI Prompt Example:**
```python
prompt = f"""Create a comprehensive course for {course_title}
to help someone transition to {job_role}.

Include:
- 5-7 modules
- 3-5 topics per module
- Duration estimates
- Difficulty progression"""
```

### 4. Interview Coach Module

**Description:** AI-powered mock interviews with real-time feedback.

**Key Features:**
- **Role-Specific Questions** - Questions tailored to job role
- **Answer Evaluation** - AI assessment of answer quality
- **Feedback & Scoring** - Detailed feedback on each answer
- **Interview History** - Review past interview sessions
- **Multiple Rounds** - Technical, HR, behavioral rounds
- **Performance Analytics** - Track improvement over time

**Interview Flow:**
```
Select Role → Generate Questions → Record Answers → 
AI Evaluation → Feedback & Score → Performance Report
```

### 5. DSA Practice Module

**Description:** Curated data structures and algorithms problems.

**Key Features:**
- **Problem Library** - 100+ DSA problems
- **Difficulty Levels** - Easy, Medium, Hard
- **Topic Categories** - Arrays, Strings, Trees, Graphs, DP, etc.
- **Solution Access** - View solutions after attempt
- **Code Templates** - Starter code for quick practice
- **MongoDB Storage** - Flexible document-based storage

**Problem Structure:**
```json
{
  "title": "Two Sum",
  "difficulty": "Easy",
  "category": "Arrays",
  "description": "Find two numbers that add up to target",
  "examples": [...],
  "constraints": [...],
  "solution": {...}
}
```

### 6. Authentication & Authorization

**Description:** Secure JWT-based authentication system.

**Key Features:**
- **User Registration** - Email/password signup
- **Login System** - JWT token generation
- **Token Validation** - Middleware for protected routes
- **Password Hashing** - Secure password storage
- **Session Management** - Token expiry and refresh
- **Role-Based Access** - User roles and permissions

**Authentication Flow:**
```
Login → Validate credentials → Generate JWT → 
Store in localStorage → Include in API headers → 
Validate on each request
```

---

## Database Design

### Supabase PostgreSQL Schema

#### 1. **users** table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. **user_resumes** table
```sql
CREATE TABLE user_resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    filename VARCHAR(500) NOT NULL,
    file_path TEXT NOT NULL,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    file_size INTEGER,
    processing_status VARCHAR(50) DEFAULT 'pending',
    analysis_count INTEGER DEFAULT 0,
    last_analyzed_at TIMESTAMPTZ,
    latest_analysis_id UUID
);
```

#### 3. **resume_analysis_history** table
```sql
CREATE TABLE resume_analysis_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    job_description TEXT,
    resume_filename VARCHAR(500),
    resume_file_path TEXT,
    overall_score DECIMAL(5,2),
    content_quality INTEGER,
    formatting_structure INTEGER,
    keyword_optimization INTEGER,
    experience_relevance INTEGER,
    missing_skills TEXT[],
    improvement_suggestions TEXT[],
    resume_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. **user_profiles** table
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    summary TEXT,
    skills TEXT[],
    experience JSONB,
    education JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. **courses** table
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    job_role VARCHAR(255),
    course_content JSONB,
    total_duration_weeks INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. **interview_sessions** table
```sql
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    interview_type VARCHAR(100),
    questions JSONB,
    answers JSONB,
    overall_score DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### MongoDB Schema (DSA Service)

#### **problems** collection
```json
{
  "_id": ObjectId,
  "title": String,
  "slug": String,
  "difficulty": "Easy|Medium|Hard",
  "category": String,
  "tags": [String],
  "description": String,
  "examples": [{
    "input": String,
    "output": String,
    "explanation": String
  }],
  "constraints": [String],
  "solution": {
    "approach": String,
    "complexity": {
      "time": String,
      "space": String
    },
    "code": String
  },
  "created_at": Date,
  "updated_at": Date
}
```

### Database Relationships

```
users (1) ──→ (N) user_resumes
users (1) ──→ (N) resume_analysis_history
users (1) ──→ (1) user_profiles
users (1) ──→ (N) courses
users (1) ──→ (N) interview_sessions

user_resumes (1) ──→ (N) resume_analysis_history
resume_analysis_history (1) ──→ (1) user_resumes (via resume_id)
```

---

## API Documentation

### Authentication Endpoints

#### POST `/auth/register`
Register a new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "user_id": "uuid"
}
```

#### POST `/auth/login`
Login existing user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

### Resume Analyzer Endpoints

#### POST `/resume-analyzer/analyze-resume`
Analyze resume against job description

**Request (multipart/form-data):**
```
resume: File (optional if resume_id provided)
resume_id: string (optional if resume provided)
job_role: string (required)
job_description: string
user_id: string
```

**Response:**
```json
{
  "status": "success",
  "analysis_id": "uuid",
  "results": {
    "overall_score": 75.5,
    "scoring": {
      "content_quality": 80,
      "formatting_structure": 75,
      "keyword_optimization": 70,
      "experience_relevance": 78
    },
    "missing_skills": ["React", "TypeScript"],
    "improvement_suggestions": [
      "Add more quantifiable achievements",
      "Include relevant keywords"
    ]
  }
}
```

#### GET `/resume-analyzer/user-resumes/{user_id}`
Get all resumes for a user

**Response:**
```json
{
  "status": "success",
  "resumes": [
    {
      "id": "uuid",
      "filename": "resume.pdf",
      "file_path": "user_123/resume.pdf",
      "upload_date": "2024-10-12T10:00:00Z",
      "analysis_count": 3,
      "last_analyzed_at": "2024-10-12T15:30:00Z"
    }
  ]
}
```

#### GET `/resume-analyzer/analysis-history/{user_id}`
Get analysis history for a user

**Response:**
```json
{
  "status": "success",
  "history": [
    {
      "id": "uuid",
      "job_role": "Frontend Developer",
      "overall_score": 75.5,
      "created_at": "2024-10-12T15:30:00Z"
    }
  ]
}
```

### Profile Service Endpoints

#### POST `/profile-service/profile/upload-resume`
Upload resume and extract data

**Request (multipart/form-data):**
```
file: File
user_id: string
```

**Response:**
```json
{
  "status": "success",
  "resume_id": "uuid",
  "extracted_data": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "skills": ["React", "Python", "FastAPI"]
  }
}
```

#### GET `/profile-service/profile/{user_id}`
Get user profile

**Response:**
```json
{
  "status": "success",
  "profile": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "skills": ["React", "Python"],
    "experience": [...],
    "education": [...]
  }
}
```

### Course Generation Endpoints

#### POST `/course-generation/generate-course`
Generate personalized course

**Request:**
```json
{
  "user_id": "uuid",
  "job_role": "Full Stack Developer",
  "current_skills": ["HTML", "CSS"],
  "target_skills": ["React", "Node.js", "MongoDB"]
}
```

**Response:**
```json
{
  "status": "success",
  "course_id": "uuid",
  "course": {
    "title": "Full Stack Developer Path",
    "duration_weeks": 12,
    "modules": [
      {
        "title": "Frontend with React",
        "duration_hours": 40,
        "topics": [...]
      }
    ]
  }
}
```

### Interview Coach Endpoints

#### POST `/interview-coach/start-interview`
Start interview session

**Request:**
```json
{
  "user_id": "uuid",
  "job_role": "Software Engineer",
  "interview_type": "technical"
}
```

**Response:**
```json
{
  "status": "success",
  "session_id": "uuid",
  "questions": [
    {
      "id": "q1",
      "question": "Explain closures in JavaScript",
      "type": "technical"
    }
  ]
}
```

### DSA Service Endpoints

#### GET `/dsa/problems?difficulty={difficulty}&category={category}`
Get DSA problems

**Response:**
```json
{
  "status": "success",
  "problems": [
    {
      "id": "objectid",
      "title": "Two Sum",
      "difficulty": "Easy",
      "category": "Arrays"
    }
  ]
}
```

---

## Implementation Details

### Frontend Architecture

#### Component Structure
```
src/
├── components/
│   ├── ui/              # ShadCN UI components
│   ├── layout/          # Layout components
│   └── shared/          # Shared components
├── pages/
│   ├── ResumeAnalyzer.tsx
│   ├── ProfileBuilder.tsx
│   ├── CourseGeneration.tsx
│   ├── InterviewCoach.tsx
│   └── DSAPractice.tsx
├── contexts/
│   └── AuthContext.tsx  # Auth state management
├── hooks/
│   ├── useAuth.ts
│   ├── useProfile.ts
│   └── useToast.ts
├── api/
│   └── services/        # API service functions
└── lib/
    └── utils.ts         # Utility functions
```

#### State Management
- **React Context** for global state (auth, user)
- **TanStack Query** for server state and caching
- **useState/useReducer** for local component state

#### Routing
```typescript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Protected Routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
    <Route path="/profile-builder" element={<ProfileBuilder />} />
    <Route path="/courses" element={<CourseGeneration />} />
    <Route path="/interview-coach" element={<InterviewCoach />} />
    <Route path="/dsa-practice" element={<DSAPractice />} />
  </Route>
</Routes>
```

### Backend Architecture

#### Service Structure
```
backend/
├── api-gateway/
│   └── main.py          # Gateway routing
├── agents/
│   ├── resume-analyzer/
│   │   ├── main.py
│   │   └── requirements.txt
│   ├── profile-service/
│   │   ├── main.py
│   │   └── requirements.txt
│   ├── course-generation/
│   │   ├── main.py
│   │   └── requirements.txt
│   ├── interview-coach/
│   │   ├── main.py
│   │   └── requirements.txt
│   └── dsa-service/
│       ├── main.py
│       └── requirements.txt
└── requirements.txt
```

#### Middleware & Error Handling
```python
# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )
```

#### Database Connection Pooling
```python
# PostgreSQL Connection Pool
db_pool = await asyncpg.create_pool(
    host=os.getenv("SUPABASE_HOST"),
    port=5432,
    database="postgres",
    user="postgres",
    password=os.getenv("SUPABASE_PASSWORD"),
    min_size=5,
    max_size=20
)
```

---

## Security & Authentication

### JWT Token System

#### Token Generation
```python
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        SECRET_KEY, 
        algorithm="HS256"
    )
    return encoded_jwt
```

#### Token Validation
```python
def verify_token(token: str):
    try:
        payload = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")
```

### Security Best Practices

1. **Password Hashing** - bcrypt with salt rounds
2. **HTTPS Only** - Enforce secure connections in production
3. **CORS Configuration** - Whitelist specific origins
4. **Input Validation** - Pydantic models for request validation
5. **SQL Injection Prevention** - Parameterized queries
6. **XSS Protection** - Content Security Policy headers
7. **Rate Limiting** - Prevent abuse and DDoS attacks
8. **Environment Variables** - Sensitive data in .env files

### Data Privacy

- User data encrypted at rest (Supabase encryption)
- Secure file upload with virus scanning
- GDPR compliance considerations
- Data retention policies
- User consent management

---

## AI Integration

### Groq API Integration

**Purpose:** Fast LLM inference for resume analysis

**Model:** `llama-3.1-70b-versatile`

**Configuration:**
```python
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

response = groq_client.chat.completions.create(
    model="llama-3.1-70b-versatile",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.7,
    max_tokens=4000
)
```

**Use Cases:**
- Resume content analysis
- Skill extraction from text
- Gap analysis
- Improvement recommendations

### Google Gemini API Integration

**Purpose:** Content generation for courses

**Model:** `gemini-1.5-flash`

**Configuration:**
```python
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

response = model.generate_content(prompt)
```

**Use Cases:**
- Course structure generation
- Module and topic creation
- Learning resource recommendations
- Interview question generation

### AI Prompt Engineering

**Resume Analysis Prompt Structure:**
```
You are an expert resume analyst and career coach.

Analyze the following resume for the {job_role} position:

Resume Content:
{resume_text}

Job Description:
{job_description}

Provide analysis in JSON format:
{
  "overall_score": 0-100,
  "scoring": {
    "content_quality": 0-100,
    "formatting_structure": 0-100,
    ...
  },
  "missing_skills": [...],
  "improvement_suggestions": [...]
}
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL (via Supabase)
- MongoDB (optional for DSA service)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/vision-shopper.git
cd vision-shopper
```

### Step 2: Frontend Setup
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add environment variables
VITE_API_URL=http://localhost:8080
```

### Step 3: Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

### Step 4: Environment Variables

Create `backend/.env`:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_PASSWORD=your-db-password
SUPABASE_HOST=db.your-project.supabase.co

# AI API Keys
GROQ_API_KEY=your-groq-api-key
GEMINI_API_KEY=your-gemini-api-key

# JWT Configuration
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256

# MongoDB (for DSA Service)
MONGODB_URI=mongodb://localhost:27017/vision-shopper

# Service URLs
RESUME_ANALYZER_URL=http://localhost:8003
PROFILE_SERVICE_URL=http://localhost:8006
COURSE_GENERATION_URL=http://localhost:8007
INTERVIEW_COACH_URL=http://localhost:8002
DSA_SERVICE_URL=http://localhost:8004
```

### Step 5: Database Setup

Run Supabase migrations:
```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/20251012_unified_resume_system.sql

ALTER TABLE user_resumes
ADD COLUMN IF NOT EXISTS analysis_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_analyzed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS latest_analysis_id UUID;

ALTER TABLE resume_analysis_history
ADD COLUMN IF NOT EXISTS resume_id UUID;

CREATE INDEX IF NOT EXISTS idx_resume_analysis_resume_id 
ON resume_analysis_history(resume_id);
```

### Step 6: Start Services

**Option 1: Manual Start**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - API Gateway
cd backend/api-gateway
uvicorn main:app --port 8080 --reload

# Terminal 3 - Resume Analyzer
cd backend/agents/resume-analyzer
uvicorn main:app --port 8003 --reload

# Terminal 4 - Profile Service
cd backend/agents/profile-service
uvicorn main:app --port 8006 --reload

# Continue for other services...
```

**Option 2: Batch Script (Windows)**
```bash
.\start_all_services.bat
```

### Step 7: Access Application
- Frontend: http://localhost:5173
- API Gateway: http://localhost:8080
- API Docs: http://localhost:8080/docs

---

## Testing & Validation

### Manual Testing Checklist

#### Authentication Flow
- [ ] User registration with email/password
- [ ] User login and JWT token generation
- [ ] Protected route access with valid token
- [ ] Token expiration handling
- [ ] Logout functionality

#### Resume Analyzer
- [ ] Upload PDF resume
- [ ] Upload DOCX resume
- [ ] Analyze resume without job description
- [ ] Analyze resume with job description
- [ ] View analysis results
- [ ] Check analysis history
- [ ] Select existing resume for analysis
- [ ] View resume list

#### Profile Builder
- [ ] Upload resume to Supabase Storage
- [ ] AI extraction of profile data
- [ ] Manual edit of extracted data
- [ ] Add education entries
- [ ] Add experience entries
- [ ] Update skills
- [ ] View profile completeness

#### Course Generation
- [ ] Generate course based on skill gap
- [ ] View course modules and topics
- [ ] Check duration estimates
- [ ] Access course materials
- [ ] Track progress

#### Interview Coach
- [ ] Start interview session
- [ ] Answer interview questions
- [ ] Receive AI feedback
- [ ] View interview history
- [ ] Check performance scores

#### DSA Practice
- [ ] View problem list
- [ ] Filter by difficulty
- [ ] Filter by category
- [ ] View problem details
- [ ] Access solution

### API Testing

Use tools like Postman or curl:

```bash
# Test Resume Analyzer
curl -X POST http://localhost:8003/analyze-resume \
  -F "resume=@resume.pdf" \
  -F "job_role=Software Engineer" \
  -F "user_id=test-user-123"

# Test Health Endpoints
curl http://localhost:8003/health
curl http://localhost:8006/health
curl http://localhost:8007/health
```

### Performance Testing

Key metrics to monitor:
- API response time < 2 seconds
- AI analysis time < 5 seconds
- Page load time < 1 second
- Database query time < 100ms

---

## Challenges & Solutions

### Challenge 1: Groq API Initialization Error

**Problem:**
```
Client.__init__() got an unexpected keyword argument 'proxies'
```

**Root Cause:**
- Incompatibility between Groq library version and httpx version
- Old Groq version (0.4.1) passing unsupported parameters

**Solution:**
- Upgraded Groq to version 0.32.0
- Updated requirements.txt
- Added error handling and initialization logging

```python
try:
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        groq_client = Groq(api_key=groq_api_key)
        print("✅ Groq client initialized")
except Exception as e:
    print(f"❌ Failed to initialize Groq: {e}")
```

### Challenge 2: Unified Resume Storage

**Problem:**
- Profile Builder and Resume Analyzer using separate storage
- No way to reuse uploaded resumes
- Duplicate storage of files

**Solution:**
- Created unified `user_resumes` table
- Single Supabase Storage bucket for all resumes
- Added `resume_id` linking in analysis history
- Frontend dropdown to select existing resumes

### Challenge 3: Database Schema Migration

**Problem:**
```
asyncpg.exceptions.UndefinedColumnError: column r.analysis_count does not exist
```

**Root Cause:**
- New columns referenced in code but not in database

**Solution:**
- Created SQL migration script
- Added `analysis_count`, `last_analyzed_at`, `latest_analysis_id`
- Added indexes for performance
- Manual execution in Supabase SQL Editor

### Challenge 4: File Upload Duplicate Error

**Problem:**
```
Storage upload failed: The resource already exists (409)
```

**Root Cause:**
- Uploading files with same name overwrites existing files
- No versioning or unique naming

**Solution:**
- Added timestamp to filename: `{timestamp}_{filename}`
- Graceful error handling for duplicates
- Allow analysis to continue even if upload fails

### Challenge 5: Cross-Service Communication

**Problem:**
- Services need to communicate with each other
- No service discovery mechanism

**Solution:**
- API Gateway as central routing hub
- Environment variables for service URLs
- Consistent error handling across services

---

## Future Enhancements

### Short-term (1-3 months)

1. **Real-time Collaboration**
   - WebSocket integration for live updates
   - Collaborative resume editing
   - Real-time interview coaching

2. **Advanced Analytics**
   - Dashboard with charts and graphs
   - Progress tracking over time
   - Skill gap visualization

3. **Mobile Application**
   - React Native mobile app
   - Push notifications
   - Offline mode support

4. **Enhanced AI Features**
   - Multiple AI model support
   - Custom fine-tuned models
   - Voice-based interview practice

### Medium-term (3-6 months)

1. **Social Features**
   - User communities
   - Peer resume review
   - Mentor matching

2. **Premium Features**
   - Subscription model
   - Advanced analytics
   - Priority AI processing
   - Expert human review

3. **Integration Ecosystem**
   - LinkedIn integration
   - GitHub profile import
   - ATS (Applicant Tracking System) export
   - Calendar integration for interview prep

4. **Content Management**
   - Admin dashboard
   - Course management system
   - Problem bank management
   - User management

### Long-term (6-12 months)

1. **AI-Powered Job Matching**
   - Automated job recommendations
   - Application tracking
   - Interview scheduling
   - Salary negotiation assistance

2. **Enterprise Features**
   - White-label solution
   - Bulk user management
   - Company-specific customization
   - Analytics for recruiters

3. **Global Expansion**
   - Multi-language support
   - Region-specific job markets
   - Currency localization
   - Time zone handling

4. **Advanced Learning**
   - Video course integration
   - Live coding practice
   - Peer programming sessions
   - Certification programs

---

## Conclusion

Vision Shopper represents a comprehensive solution to the challenges faced by job seekers in today's competitive market. By leveraging cutting-edge AI technologies, microservices architecture, and modern web development practices, the platform provides:

### Key Achievements

1. **Technical Excellence**
   - Scalable microservices architecture
   - Fast AI-powered analysis (sub-5-second response)
   - Secure authentication and data handling
   - Modern, responsive UI/UX

2. **User Value**
   - Instant resume feedback
   - Personalized learning paths
   - Realistic interview practice
   - Comprehensive skill development

3. **Innovation**
   - Integration of multiple AI models (Groq, Gemini)
   - Unified resume management system
   - Real-time analysis and feedback
   - Data-driven insights

### Learning Outcomes

Through this project, I gained expertise in:
- Full-stack web development with modern frameworks
- Microservices architecture and design patterns
- AI API integration and prompt engineering
- Database design and optimization
- Cloud storage and deployment
- Security best practices
- API design and documentation

### Project Impact

Vision Shopper has the potential to:
- Help thousands of job seekers improve their applications
- Reduce time spent on resume preparation by 70%
- Increase interview success rate through practice
- Provide personalized learning paths for skill development
- Bridge the gap between education and employment

### Acknowledgments

This project was developed as part of my academic curriculum at [Your College Name]. I would like to thank:
- My project guide for valuable feedback and guidance
- The open-source community for excellent tools and libraries
- API providers (Groq, Google) for AI capabilities
- My peers for testing and suggestions

### Final Thoughts

Building Vision Shopper has been an incredible learning journey, combining technical skills with real-world problem-solving. The platform demonstrates how AI can be leveraged to create meaningful solutions that help people advance their careers. As the job market continues to evolve, tools like Vision Shopper will become increasingly important in helping candidates stand out and succeed.

---

## References

### Technologies & Frameworks
1. React Documentation - https://react.dev
2. FastAPI Documentation - https://fastapi.tiangolo.com
3. Supabase Documentation - https://supabase.com/docs
4. MongoDB Documentation - https://www.mongodb.com/docs
5. TailwindCSS Documentation - https://tailwindcss.com/docs

### AI & ML
6. Groq API Documentation - https://groq.com/docs
7. Google Gemini API - https://ai.google.dev/docs
8. Prompt Engineering Guide - https://www.promptingguide.ai

### Best Practices
9. JWT Authentication - https://jwt.io
10. RESTful API Design - https://restfulapi.net
11. Microservices Patterns - https://microservices.io

### Tools & Libraries
12. Vite - https://vitejs.dev
13. asyncpg - https://github.com/MagicStack/asyncpg
14. ShadCN UI - https://ui.shadcn.com
15. Radix UI - https://www.radix-ui.com

---

## Appendix

### A. Environment Setup Scripts

**start_all_services.bat (Windows)**
```batch
@echo off
echo Starting Vision Shopper Services...

start cmd /k "cd frontend && npm run dev"
start cmd /k "cd backend\api-gateway && ..\venv\Scripts\activate && uvicorn main:app --port 8080"
start cmd /k "cd backend\agents\resume-analyzer && ..\venv\Scripts\activate && uvicorn main:app --port 8003"
start cmd /k "cd backend\agents\profile-service && ..\venv\Scripts\activate && uvicorn main:app --port 8006"
start cmd /k "cd backend\agents\course-generation && ..\venv\Scripts\activate && uvicorn main:app --port 8007"

echo All services started!
pause
```

### B. API Response Examples

See API Documentation section for detailed examples.

### C. Database ERD

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │
       ├────────┬────────────┬────────────┬───────────────┐
       │        │            │            │               │
┌──────▼──────┐ ┌▼──────────┐ ┌▼─────────┐ ┌▼────────────┐ ┌▼──────────┐
│user_resumes │ │user_       │ │courses   │ │interview_   │ │resume_    │
│             │ │profiles    │ │          │ │sessions     │ │analysis_  │
│             │ │            │ │          │ │             │ │history    │
└──────┬──────┘ └────────────┘ └──────────┘ └─────────────┘ └───────────┘
       │
       │ resume_id
       │
┌──────▼──────┐
│resume_      │
│analysis_    │
│history      │
└─────────────┘
```

### D. Code Snippets

**JWT Middleware Example:**
```python
async def verify_jwt_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    request.state.user_id = payload.get("user_id")
```

**File Upload Handler:**
```python
async def handle_file_upload(file: UploadFile, user_id: str):
    # Read file content
    content = await file.read()
    
    # Generate unique filename
    timestamp = int(time.time())
    filename = f"{timestamp}_{file.filename}"
    
    # Upload to Supabase Storage
    file_path = f"{user_id}/{filename}"
    supabase.storage.from_("resume-files").upload(
        file_path, content
    )
    
    return file_path
```

### E. Troubleshooting Guide

**Common Issues:**

1. **Port Already in Use**
   ```bash
   # Windows
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F
   ```

2. **Database Connection Failed**
   - Check Supabase credentials in .env
   - Verify network connectivity
   - Ensure IP is whitelisted in Supabase

3. **AI API Rate Limit**
   - Implement request queuing
   - Add retry logic with exponential backoff
   - Monitor API usage

---

**Project Repository:** https://github.com/yourusername/vision-shopper  
**Documentation Version:** 1.0  
**Last Updated:** October 12, 2024  
**Author:** [Your Name]  
**College:** [Your College Name]  
**Department:** [Your Department]  
**Academic Year:** [Year]

---

*This documentation is created for academic purposes as part of the final year project submission.*
