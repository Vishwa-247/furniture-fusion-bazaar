import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import { API_GATEWAY_URL } from '@/configs/environment';
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import Container from "@/components/ui/Container";
import GenerationModal from "@/components/course/GenerationModal";
import { cseSuggestions } from "@/data/cseSuggestions";
import { supabase } from "@/integrations/supabase/client";

const CourseGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [courseId, setCourseId] = useState<string | null>(null);

  // Subscribe to realtime progress
  useEffect(() => {
    if (!courseId) return;

    const channel = supabase
      .channel('course-generation-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'course_generation_jobs',
          filter: `course_id=eq.${courseId}`
        },
        (payload: any) => {
          const progress = payload.new.progress || 0;
          const status = payload.new.status;
          const step = payload.new.current_step || "";

          setGenerationProgress(progress);
          setCurrentStep(step);

          if (status === 'completed' && progress >= 100) {
            setTimeout(() => {
              navigate(`/course/${courseId}`);
            }, 1500);
          } else if (status === 'failed') {
            toast.error("Course generation failed");
            setShowModal(false);
            setIsGenerating(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId, navigate]);

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Please sign in to generate courses");
      navigate('/auth');
      return;
    }

    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    setShowModal(true);
    setGenerationProgress(0);
    setCurrentStep("Initializing...");

    try {
      const response = await fetch(`${API_GATEWAY_URL}/courses/generate-parallel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topic.trim(), userId: user.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate course');
      }

      const data = await response.json();
      setCourseId(data.courseId);

      toast.success("Course generation started!");

    } catch (error: any) {
      console.error('Generation failed:', error);
      toast.error("Failed to generate course", {
        description: error.message || "Please try again"
      });
      setShowModal(false);
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestionTitle: string) => {
    setTopic(suggestionTitle);
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <Container className="py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              What do you want to learn?
            </h1>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="e.g., React Hooks, Machine Learning, Quantum Physics..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
                className="h-14 text-lg"
                disabled={isGenerating}
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                size="lg"
                className="h-14 px-8"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Create Course
              </Button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <p className="text-center text-muted-foreground mb-6">📚 Suggested CSE Topics:</p>
            <div className="grid md:grid-cols-3 gap-4">
              {cseSuggestions.map((suggestion) => (
                <Card 
                  key={suggestion.title}
                  className="p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                  onClick={() => handleSuggestionClick(suggestion.title)}
                >
                  <div className="text-center space-y-3">
                    <div className="text-4xl">{suggestion.icon}</div>
                    <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {suggestion.category}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {showModal && (
        <GenerationModal
          topic={topic}
          progress={generationProgress}
          currentStep={currentStep}
          onComplete={() => {
            if (courseId) {
              navigate(`/course/${courseId}`);
            }
          }}
        />
      )}
    </>
  );
};

export default CourseGenerator;
