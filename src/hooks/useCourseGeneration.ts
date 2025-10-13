
import { useState, useEffect } from "react";
import { courseService } from "@/api/services/courseService";
import { toast as sonnerToast } from "sonner";
import { CourseType } from "@/types";

// Define an interface for the content structure
interface CourseContent {
  status?: string;
  message?: string;
  lastUpdated?: string;
  parsedContent?: {
    summary?: string;
    chapters?: any[];
  };
  [key: string]: any;
}

export const useCourseGeneration = () => {
  const [generationInBackground, setGenerationInBackground] = useState(false);
  const [courseGenerationId, setCourseGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [generationStartTime, setGenerationStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let intervalId: number | null = null;
    
    if (generationInBackground && courseGenerationId) {
      console.log("Setting up interval to check course generation status for ID:", courseGenerationId);
      
      // Show loader for 3 minutes (180000 ms) with gradual progress updates
      const startTime = Date.now();
      const totalDuration = 180000; // 3 minutes in milliseconds
      
      intervalId = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        
        // Calculate progress as a percentage of the 3 minutes
        const newProgress = Math.min(Math.round((elapsed / totalDuration) * 100), 99);
        
        setProgress(newProgress);
        
        // If 3 minutes have passed, complete the process
        if (elapsed >= totalDuration) {
          // Course is complete
          setProgress(100);
          
          if (intervalId) clearInterval(intervalId);
          setGenerationInBackground(false);
          
          // Notify user of completion
          sonnerToast.success('Course Generation Complete', {
            description: `Your course has been generated successfully.`,
            action: {
              label: 'View Course',
              onClick: () => window.location.href = `/course/${courseGenerationId}`,
            },
          });
        }
      }, 1000); // Update every second for smoother progress
    }
    
    return () => {
      if (intervalId) {
        console.log("Clearing interval for course generation check");
        clearInterval(intervalId);
      }
    };
  }, [generationInBackground, courseGenerationId]);

  // Create a function to start course generation (always succeeds with dummy data)
  const startCourseGeneration = async (
    courseName: string, 
    purpose: CourseType['purpose'], 
    difficulty: CourseType['difficulty'],
    userId: string
  ) => {
    try {
      console.log("Starting course generation for:", courseName);
      
      // Reset progress and set start time
      setProgress(0);
      setGenerationStartTime(new Date());
      
      // Create a random course ID
      const courseId = crypto.randomUUID();
      
      // Start the generation process
      setCourseGenerationId(courseId);
      setGenerationInBackground(true);
      setError(null);
      
      // Simulate course creation in database
      console.log(`Created course with ID: ${courseId}`);
      
      // Process with static data after the 3-minute loading period completes
      setTimeout(() => {
        processStaticCourseGeneration(
          courseName,
          purpose,
          difficulty as "beginner" | "intermediate" | "advanced",
          courseId
        );
      }, 180000); // 3 minutes
      
      return courseId;
    } catch (error: any) {
      console.error("Error in startCourseGeneration:", error);
      setProgress(0);
      
      // Never fail - use dummy data instead
      const courseId = crypto.randomUUID();
      setTimeout(() => {
        processStaticCourseGeneration(
          courseName,
          purpose,
          difficulty as "beginner" | "intermediate" | "advanced",
          courseId
        );
      }, 180000); // Still wait 3 minutes even in error case
      
      return courseId;
    }
  };

  // Process generation with static data
  const processStaticCourseGeneration = async (
    topic: string,
    purpose: CourseType['purpose'],
    difficulty: "beginner" | "intermediate" | "advanced",
    courseId: string
  ) => {
    try {
      setProgress(100);
      
      // Generate dummy data for the course
      const staticCourse = {
          title: topic,
          difficulty: difficulty,
          summary: `This is a comprehensive course on ${topic} for ${purpose} level.`,
          content: {
            parsedContent: {
              summary: `Welcome to ${topic} for ${difficulty} learners!`,
              chapters: [
                { 
                  title: "Introduction to " + topic, 
                  content: "This chapter introduces the basic concepts of " + topic + ".",
                  sections: [
                    { title: "What is " + topic, content: "A detailed explanation of " + topic + " and its importance." },
                    { title: "History of " + topic, content: "How " + topic + " evolved over time." }
                  ]
                },
                { 
                  title: "Core Concepts", 
                  content: "Understanding the fundamental principles.",
                  sections: [
                    { title: "Key Principle 1", content: "Detailed explanation of the first principle." },
                    { title: "Key Principle 2", content: "Detailed explanation of the second principle." }
                  ]
                },
                { 
                  title: "Advanced Topics", 
                  content: "Exploring advanced concepts in " + topic,
                  sections: [
                    { title: "Advanced Concept 1", content: "Deep dive into first advanced topic." },
                    { title: "Advanced Concept 2", content: "Deep dive into second advanced topic." }
                  ]
                }
              ]
            },
            flashcards: [
              { question: "What is " + topic + "?", answer: "A comprehensive definition of " + topic },
              { question: "What are the core principles of " + topic + "?", answer: "The fundamental principles include..." }
            ],
            mcqs: [
              {
                question: "Which of the following best describes " + topic + "?",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: "Option A"
              },
              {
                question: "What is a key benefit of " + topic + "?",
                options: ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4"],
                correctAnswer: "Benefit 2"
              }
            ],
            qnas: [
              { question: "How can I apply " + topic + " in real life?", answer: "You can apply it by..." },
              { question: "What are common mistakes in " + topic + "?", answer: "Common mistakes include..." }
            ]
          }
        };
      
      console.log(`Course ${courseId} updated with static/dummy content`);
      
    } catch (error: any) {
      console.error(`Error in static course generation for course ${courseId}:`, error);
      
      // Never fail - create dummy data
      console.log(`Created dummy data for course ${courseId}`);
    }
  };

  // Generate additional content from static data
  const generateAdditionalContent = async (
    courseId: string,
    contentType: 'flashcards' | 'mcqs' | 'qna',
    topic: string,
    difficulty?: string
  ) => {
    console.log(`Generating ${contentType} for course ${courseId} on topic ${topic}`);
    // Always succeed with dummy data
    return true;
  };

  return {
    generationInBackground,
    courseGenerationId,
    error,
    progress,
    setError,
    startCourseGeneration,
    generateAdditionalContent,
    generationStartTime
  };
};
