
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import InterviewTypeSelector from "@/components/interview/InterviewTypeSelector";
import TechnicalInterviewSetup from "@/components/interview/TechnicalInterviewSetup";
import InterviewSetup from "@/components/interview/InterviewSetup";
import VideoRecorder from "@/components/interview/VideoRecorder";
import Container from "@/components/ui/Container";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CourseForm from "@/components/course/CourseForm";
import { useToast } from "@/hooks/use-toast";

const staticQuestions = {
  "Software Engineer": [
    "Tell me about your experience with agile development methodologies.",
    "How do you approach debugging complex issues in your code?",
    "Describe a time when you had to design a scalable web application.",
    "How do you use version control in your workflow?",
    "Tell me about a challenging project you've worked on and how you handled it."
  ],
  "Frontend Developer": [
    "Explain how React hooks work and their advantages over class components.",
    "How do you optimize website performance?",
    "What strategies do you use for responsive design?",
    "How do you approach testing frontend applications?",
    "How do you ensure cross-browser compatibility in your web applications?"
  ],
  "Backend Developer": [
    "How do you design database schemas for scalability?",
    "What security measures do you implement in your APIs?",
    "How have you implemented microservices architecture?",
    "Explain your approach to error handling in a backend application.",
    "How do you handle API versioning?"
  ],
  "Data Scientist": [
    "How do you handle data preparation and cleaning?",
    "Which machine learning algorithms have you used and in what contexts?",
    "How do you validate your models?",
    "How do you translate business problems into data science solutions?",
    "How do you communicate technical findings to non-technical stakeholders?"
  ],
  "DevOps Engineer": [
    "Describe your experience setting up CI/CD pipelines.",
    "How do you approach infrastructure automation?",
    "What monitoring and logging practices do you implement?",
    "How do you ensure security in your DevOps processes?",
    "How do you handle incident response in a production environment?"
  ],
  "ML Engineer": [
    "Explain your experience with deploying machine learning models to production.",
    "How do you ensure the quality and reliability of machine learning systems?",
    "Describe your approach to feature engineering and selection.",
    "How do you handle the challenges of training models on large datasets?",
    "How do you keep up with the rapidly evolving field of machine learning?"
  ],
  "Full Stack Developer": [
    "How do you manage the frontend and backend parts of an application?",
    "What's your approach to ensuring data consistency across the stack?",
    "Tell me about a full stack project you've worked on from inception to deployment.",
    "How do you handle authentication and authorization in a full stack app?",
    "What strategies do you use for state management across the entire application?"
  ],
  "Cloud Architect": [
    "How do you approach designing multi-region, highly available cloud architectures?",
    "Describe your experience with cloud cost optimization.",
    "How do you implement security in cloud environments?",
    "Explain how you manage cloud infrastructure at scale.",
    "How do you approach migrating legacy applications to the cloud?"
  ],
  "Default": [
    "Tell me about your background and experience.",
    "What are your strengths and weaknesses?",
    "How do you stay updated with the latest technologies?",
    "How do you approach problem-solving?",
    "Where do you see yourself in 5 years?"
  ]
};

enum InterviewStage {
  TypeSelection = "type_selection",
  Setup = "setup", 
  Questions = "questions",
  Recording = "recording",
  Complete = "complete",
}

const MockInterview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<InterviewStage>(InterviewStage.TypeSelection);
  const [selectedInterviewType, setSelectedInterviewType] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCourseTabActive, setCourseTabActive] = useState(false);
  const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [interviewId, setInterviewId] = useState<string>("mock-001");

  // Static mock interviews data
  const recentInterviews = [
    { id: "mock-001", job_role: "Frontend Developer", tech_stack: "React, TypeScript", experience: "3-5", created_at: new Date().toISOString(), user_id: "mock-user", completed: true },
    { id: "mock-002", job_role: "Full Stack Engineer", tech_stack: "Node.js, Express, MongoDB", experience: "1-3", created_at: new Date().toISOString(), user_id: "mock-user", completed: false },
    { id: "mock-003", job_role: "Data Scientist", tech_stack: "Python, TensorFlow, PyTorch", experience: "5+", created_at: new Date().toISOString(), user_id: "mock-user", completed: true },
  ];

  // Static mock courses data
  const recentCourses = [
    {
      title: "React Fundamentals",
      purpose: "job_interview",
      difficulty: "intermediate",
      date: "15 minutes ago",
      status: "Generated",
      progress: 100,
      id: "mock1"
    },
    {
      title: "Data Structures and Algorithms",
      purpose: "exam",
      difficulty: "advanced",
      date: "2 hours ago",
      status: "Generated",
      progress: 100,
      id: "mock2"
    },
    {
      title: "Machine Learning Basics",
      purpose: "practice",
      difficulty: "beginner",
      date: "Yesterday",
      status: "Generated",
      progress: 100,
      id: "mock3"
    }
  ];

  const handleTypeSelection = (type: string) => {
    setSelectedInterviewType(type);
    setStage(InterviewStage.Setup);
  };
    const handleInterviewSetup = (role: string, techStack: string, experience: string) => {
    
    // Generate a mock interview ID
    const mockId = `mock-${Date.now()}`;
    setInterviewId(mockId);
    
    // Get questions based on role
    const jobType = role.includes("Frontend") ? "Frontend Developer" :
                    role.includes("Backend") ? "Backend Developer" :
                    role.includes("Full") ? "Full Stack Developer" :
                    role.includes("Data") ? "Data Scientist" :
                    role.includes("DevOps") ? "DevOps Engineer" :
                    role.includes("ML") ? "ML Engineer" :
                    role.includes("Cloud") ? "Cloud Architect" : "Default";
    
    const interviewQuestions = staticQuestions[jobType as keyof typeof staticQuestions] || staticQuestions["Default"];
    
    // Set up the questions
    setQuestions(interviewQuestions);
    setCurrentQuestionIndex(0);
    
    // Update UI
    toast({
      title: "Interview Created",
      description: "Your mock interview has been set up successfully.",
    });
    
    setIsLoading(false);
    setStage(InterviewStage.Questions);
  };

  const handleAnswerSubmitted = () => {
    setRecordingComplete(true);
    toast({
      title: "Answer Recorded",
      description: "Your answer has been recorded successfully.",
    });
  };

  const handleNextQuestion = () => {
    setRecordingComplete(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setStage(InterviewStage.Questions);
    } else {
      // Interview is complete, navigate directly to results
      navigate(`/interview-result/mock-001`);
    }
  };

  const handleSubmitCourse = (courseName: string, purpose: string, difficulty: string) => {
    setIsGeneratingCourse(true);
    
    // Simulate course generation
    setTimeout(() => {
      toast({
        title: "Course Generation Complete",
        description: "Your course has been generated successfully.",
      });
      
      setIsGeneratingCourse(false);
      navigate(`/course/mock1`);
    }, 2000);
  };

  const startRecording = () => {
    setIsRecording(true);
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    handleAnswerSubmitted(); // Auto-submit when recording stops
  };
  
  const handleCancel = () => {
    setStage(InterviewStage.Questions);
  };

  const handleDownloadInterview = () => {
    toast({
      title: "Interview Downloaded",
      description: "Your interview has been downloaded successfully.",
    });
  };

  const resumeInterview = (interview: any) => {
    // Set up with static interview questions
    const jobType = interview.job_role.includes("Frontend") ? "Frontend Developer" :
                    interview.job_role.includes("Backend") ? "Backend Developer" :
                    interview.job_role.includes("Full") ? "Full Stack Developer" :
                    interview.job_role.includes("Data") ? "Data Scientist" :
                    interview.job_role.includes("DevOps") ? "DevOps Engineer" :
                    interview.job_role.includes("ML") ? "ML Engineer" :
                    interview.job_role.includes("Cloud") ? "Cloud Architect" : "Default";
    
    const interviewQuestions = staticQuestions[jobType as keyof typeof staticQuestions] || staticQuestions["Default"];
    
    setQuestions(interviewQuestions);
    setCurrentQuestionIndex(0);
    setInterviewId(interview.id);
    setStage(InterviewStage.Questions);
  };

  const renderStage = () => {
    switch (stage) {
      case InterviewStage.Questions:
        if (questions.length === 0) {
          return (
            <div className="text-center py-12">
              <p>No questions available. Please set up a new interview.</p>
            </div>
          );
        }
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="mb-6 flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStage(InterviewStage.TypeSelection)}
                  className="text-muted-foreground"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Cancel Interview
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                  <CardDescription>
                    Take a moment to think about your answer before recording.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-md text-lg">
                    {questions[currentQuestionIndex]}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-center mt-4">
                <Button 
                  size="lg"
                  onClick={() => setStage(InterviewStage.Recording)}
                >
                  Ready to Answer
                </Button>
              </div>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Interview Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                      <span>Speak clearly and at a moderate pace</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                      <span>Maintain eye contact with the camera</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                      <span>Structure your answers using the STAR method</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                      <span>Take a brief pause before answering to collect your thoughts</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Camera Preview</CardTitle>
                  <CardDescription>
                    Check your camera and microphone before starting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VideoRecorder 
                    onRecordingComplete={() => {}}
                    isRecording={false}
                    startRecording={() => {}}
                    stopRecording={() => {}}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Save Your Interview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Download your interview session for future reference or to share with mentors.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleDownloadInterview}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Interview
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case InterviewStage.Recording:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  Question {currentQuestionIndex + 1}:
                </h2>
                <div className="p-4 bg-muted rounded-md text-lg mb-4">
                  {questions[currentQuestionIndex]}
                </div>
                <p className="text-muted-foreground">
                  When you're ready, click "Start Recording" and begin your answer. We'll analyze both your verbal response and facial expressions.
                </p>
              </div>
              
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Answering Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                      <span>Use specific examples from your experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                      <span>Avoid filler words like "um" and "uh"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                      <span>Speak confidently and maintain good posture</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <VideoRecorder 
                onRecordingComplete={handleAnswerSubmitted}
                isRecording={isRecording}
                startRecording={startRecording}
                stopRecording={stopRecording}
              />
              
              <div className="mt-6 flex justify-center space-x-4">
                {recordingComplete ? (
                  <Button 
                    onClick={handleNextQuestion}
                    className="px-6 py-3 bg-primary text-white rounded-lg flex items-center space-x-2"
                  >
                    <span>Next Question</span>
                    <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderRecentInterviews = () => {
    return (
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Recent Mock Interviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentInterviews.map((interview) => (
            <Card key={interview.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{interview.job_role}</CardTitle>
                    <CardDescription>{new Date(interview.created_at).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                    interview.completed ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                  }`}>
                    {interview.completed ? "Completed" : "In Progress"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  {interview.tech_stack.split(',').map((tech, i) => (
                    <div key={i} className="px-2 py-1 text-xs font-medium rounded-full bg-secondary">
                      {tech.trim()}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      if (interview.completed) {
                        navigate(`/interview-result/${interview.id}`);
                      } else {
                        resumeInterview(interview);
                      }
                    }}
                  >
                    {interview.completed ? "View Results" : "Resume Interview"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Container className="py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {isCourseTabActive ? "Course Generator" : "Mock Interview"}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {isCourseTabActive 
              ? "Create customized courses on any topic with our AI-powered course generator."
              : "Practice your interview skills with our AI-powered mock interview simulator."}
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant={isCourseTabActive ? "outline" : "default"} 
            onClick={() => setCourseTabActive(false)}
          >
            Mock Interview
          </Button>
          <Button 
            variant={isCourseTabActive ? "default" : "outline"} 
            onClick={() => setCourseTabActive(true)}
          >
            Course Generator
          </Button>
        </div>
      </div>

      {isCourseTabActive ? (
        <div className="space-y-8">
          <CourseForm onSubmit={handleSubmitCourse} isLoading={isGeneratingCourse} />
          
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Recent Course Generations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCourses.map((course, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription>{course.date}</CardDescription>
                      </div>
                      <div className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                        {course.purpose.replace('_', ' ')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{course.difficulty}</span>
                      <span className="text-sm text-muted-foreground">{course.status}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        View Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {stage === InterviewStage.TypeSelection && (
            <div className="space-y-8">
              <InterviewTypeSelector onSelectType={handleTypeSelection} selectedType={selectedInterviewType} />
              {renderRecentInterviews()}
            </div>
          )}
          
          {stage === InterviewStage.Setup && (
            <div className="space-y-8">
              {selectedInterviewType === 'technical' ? (
                <TechnicalInterviewSetup 
                  onSubmit={handleInterviewSetup} 
                  onBack={() => setStage(InterviewStage.TypeSelection)}
                  isLoading={isLoading} 
                />
              ) : (
                <InterviewSetup 
                  onSubmit={handleInterviewSetup} 
                  isLoading={isLoading} 
                />
              )}
              {selectedInterviewType !== 'technical' && renderRecentInterviews()}
            </div>
          )}
          
          {stage !== InterviewStage.TypeSelection && stage !== InterviewStage.Setup && renderStage()}
        </>
      )}
    </Container>
  );
};

export default MockInterview;
