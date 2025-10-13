
# StudyMate AI Learning Platform

An AI-powered learning platform with course generation, flashcards, quizzes, mock interview preparation, and AI-powered resume analysis.

## Environment Setup

This application requires the following environment variables:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=AIzaSyBr964zVyQutiRjAUId0l767TyfaAiPEuE
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy the API key and paste it into your `.env` file as `VITE_GEMINI_API_KEY`

## Running the Application

### Backend Setup (FastAPI + MongoDB)

#### Option 1: Quick Setup (Recommended)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the setup script:
   
   **Linux/macOS:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   
   **Windows:**
   ```cmd
   setup.bat
   ```

#### Option 2: Manual Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Make sure you have Docker and Docker Compose installed

3. Start the backend services:
   ```bash
   docker-compose up --build
   ```

   This will start:
   - **API Gateway** on port 8000
   - **Resume Analyzer Agent** on port 8001
   - **Course Generation Agent** on port 8002
   - **Interview Coach Agent** on port 8003
   - **Chat Mentor Agent** on port 8004
   - **Progress Analyst Agent** on port 8005
   - **MongoDB** on port 27017

4. The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root directory and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Start the frontend application:
   ```bash
   npm run dev
   ```

## Backend Architecture

The backend is built with **FastAPI** and uses a microservices architecture:

### Services:
- **API Gateway** (port 8000): Main entry point, routes requests to appropriate agents
- **Resume Analyzer** (port 8001): AI-powered resume parsing and analysis using Gemini API
- **Course Generation** (port 8002): Generates personalized courses
- **Interview Coach** (port 8003): Mock interview preparation
- **Chat Mentor** (port 8004): AI-powered chat assistance
- **Progress Analyst** (port 8005): Learning progress tracking

### Database:
- **MongoDB**: Stores user profiles, resume data, courses, and analytics
- **Collections**: users, profiles, resumes, courses, interviews, chat_sessions

### Key Features:
- **Resume Upload & Analysis**: PDF/DOCX parsing with AI-powered insights
- **Profile Auto-Population**: Automatically fills profile from resume data
- **Job-Specific Analysis**: Tailored resume feedback based on job role
- **ATS Compatibility Scoring**: Checks resume compatibility with ATS systems

## Available Static Courses

StudyMate supports the following course topics with static data for demonstration purposes:

### Network Security
- **Topics**: Any topic containing "network" will generate Network Security content
- **Difficulties**: beginner, intermediate, advanced
- **Example**: "Network Security Fundamentals", "Cyber Network Protection"

### Machine Learning
- **Topics**: Any topic containing "machine" will generate Machine Learning content
- **Difficulties**: beginner, intermediate, advanced
- **Example**: "Machine Learning Basics", "Deep Machine Learning"

### Data Mining
- **Topics**: Any topic containing "data" will generate Data Mining content
- **Difficulties**: beginner, intermediate, advanced
- **Example**: "Data Mining Techniques", "Big Data Analytics"

### Full Stack Development
- **Topics**: Any topic containing "stack" will generate Full Stack Development content
- **Difficulties**: beginner, intermediate, advanced
- **Example**: "Full Stack Web Development", "MERN Stack Development"

## How Gemini API Calls Work

StudyMate uses direct calls to the Gemini API from the frontend:

- All API calls are handled in `src/services/geminiService.ts`
- Calls are made directly to Google's Generative AI endpoints
- The application uses the VITE_GEMINI_API_KEY environment variable for authentication
- A fallback mechanism exists for generating content when API calls fail

## Course Generation Process

The course generation happens in the background:

1. When a user submits a request, it creates an entry in the database with "generating" status
2. The application shows a progress indicator with an estimated time remaining
3. Initially, only course notes are generated
4. Additional content like flashcards, MCQs, and Q&A sections can be generated separately after the course is created
5. All generation runs in the background, allowing users to navigate away from the page

## Troubleshooting

### API Authentication Issues
If you see a 403 error related to the Gemini API:
1. Check that your `VITE_GEMINI_API_KEY` is correctly set in the `.env` file
2. Make sure your API key is valid and has not expired
3. Verify that you have enabled the Generative Language API in your Google Cloud Console

### Browser Extension Conflicts
If you experience message channel errors:
1. Try disabling browser extensions, especially ad blockers or privacy tools
2. Refresh the page and try again
3. If the issue persists in one browser, try another browser

### Supabase Connection Issues
If you experience issues with Supabase:
1. Check that your Supabase URL and API key are correctly configured
2. Ensure your database schema matches the expected structure
3. Verify that Row Level Security (RLS) policies are correctly set up
