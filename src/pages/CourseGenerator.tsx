
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Container from "@/components/ui/Container";
import CourseForm from "@/components/course/CourseForm";
import HowItWorks from "@/components/course/HowItWorks";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import ContentGenerationStatus from "@/components/course/ContentGenerationStatus";
import { useAuth } from '@/hooks/useAuth';
import { toast as sonnerToast } from "sonner";
import { useCourseGeneration } from "@/hooks/useCourseGeneration";
import { CourseType } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { courseService } from "@/api/services/courseService";

const CourseGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationInBackground, setGenerationInBackground] = useState(false);
  const [generationStartTime, setGenerationStartTime] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);
  const [recentCourses, setRecentCourses] = useState<CourseType[]>([
    // Dummy recent courses that always show up
    {
      id: "dummy-course-1",
      title: "React Hooks Masterclass",
      purpose: "practice",
      difficulty: "intermediate",
      created_at: new Date().toISOString(),
      user_id: "user-123",
      content: { status: 'complete' }
    },
    {
      id: "dummy-course-2",
      title: "Python for Data Science",
      purpose: "job_interview",
      difficulty: "beginner",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      user_id: "user-123",
      content: { status: 'complete' }
    },
    {
      id: "dummy-course-3",
      title: "Advanced TypeScript",
      purpose: "other",
      difficulty: "advanced",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      user_id: "user-123",
      content: { status: 'complete' }
    }
  ]);
    
  const handleSubmit = async (courseName: string, purpose: CourseType['purpose'], difficulty: CourseType['difficulty'], customPrompt?: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const courseId = await courseService.generateCourse(courseName, purpose, difficulty, user.id);
      setGenerationInBackground(true);
      setGenerationStartTime(new Date());
      navigate(`/course/${courseId}`);
    } catch (error) {
      console.error('Course generation failed:', error);
      setError('Failed to generate course. Please try again.');
      toast({
        title: "Error",
        description: "Failed to generate course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Course Generator</h1>
        <p className="text-muted-foreground max-w-2xl">
          Create customized courses on any topic with our AI-powered course generator.
          Only notes will be generated initially - you can add flashcards, MCQs, and Q&A later.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ContentGenerationStatus
        isGenerating={generationInBackground}
        title="Generating your course notes..."
        startTime={generationStartTime}
        progress={progress}
        estimatedTime={180} // 3 minutes in seconds
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CourseForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
        
        <div>
          <HowItWorks generationInBackground={generationInBackground} />
        </div>
      </div>

      {/* Display recent courses */}
      {recentCourses.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Recent Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="flex justify-between">
                    <span>{course.difficulty}</span>
                    <span>{new Date(course.created_at).toLocaleDateString()}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mt-2">
                    {course.content && typeof course.content === 'object' && course.content.status === 'generating' ? (
                      <div className="space-y-2">
                        <div className="flex items-center text-amber-500 text-sm mb-2">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          <span>Generating...</span>
                        </div>
                        <Progress value={40} className="h-1.5" />
                      </div>
                    ) : (
                      <div className="flex items-center text-green-500 text-sm mb-2">
                        <span>Ready</span>
                      </div>
                    )}
                    <button 
                      onClick={() => navigate(`/course/${course.id}`)}
                      className="w-full mt-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                    >
                      View Course
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <LoadingOverlay 
          isLoading={true}
          message="Starting Course Generation"
          subMessage="We're preparing your course notes. This will take about 3 minutes. Once started, you can navigate away and we'll notify you when it's ready."
          minimal={true}
          autoDismiss={3000} // Auto dismiss after 3 seconds
        />
      )}
    </Container>
  );
};

export default CourseGenerator;
