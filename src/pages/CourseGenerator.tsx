import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import { API_GATEWAY_URL } from '@/configs/environment';
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import Container from "@/components/ui/Container";
import GlassMorphism from "@/components/ui/GlassMorphism";
import { cseSuggestions } from "@/data/cseSuggestions";
import { supabase } from "@/integrations/supabase/client";

const CourseGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    listening: 0,
    reading: 0,
    interacting: 0,
    overall: 0
  });
  const [currentStep, setCurrentStep] = useState('');
  const [courseId, setCourseId] = useState<string | null>(null);

  // Subscribe to realtime progress updates
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

          // Map backend steps to learning modes
          const stepLower = step.toLowerCase();
          let updatedProgress = { ...generationProgress };

          if (stepLower.includes('podcast') || stepLower.includes('audio') || stepLower.includes('lecture')) {
            updatedProgress.listening = Math.min(progress, 100);
          } else if (stepLower.includes('article') || stepLower.includes('chapter') || stepLower.includes('notes')) {
            updatedProgress.reading = Math.min(progress, 100);
          } else if (stepLower.includes('quiz') || stepLower.includes('flashcard') || stepLower.includes('game')) {
            updatedProgress.interacting = Math.min(progress, 100);
          }

          updatedProgress.overall = progress;
          setGenerationProgress(updatedProgress);
          setCurrentStep(step);

          if (status === 'completed' && progress >= 100) {
            toast.success("Course ready!");
            setTimeout(() => {
              navigate(`/course/${courseId}`);
            }, 1000);
          } else if (status === 'failed') {
            toast.error("Course generation failed");
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

    setLoading(true);
    setIsGenerating(true);
    setCurrentStep('Initializing course generation...');

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
      toast.error(error instanceof Error ? error.message : "Failed to generate course");
      setIsGenerating(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestionTitle: string) => {
    setTopic(suggestionTitle);
  };

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground/90">
              What do you want to learn?
            </h1>
          </div>

          <GlassMorphism className="p-8">
            <div className="space-y-6">
              <div className="flex gap-3">
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Machine Learning, Web Development, Data Structures..."
                  className="flex-1 text-lg py-6"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && topic.trim()) {
                      handleGenerate();
                    }
                  }}
                />
                <Button 
                  onClick={handleGenerate}
                  disabled={!topic.trim() || loading}
                  size="lg"
                  className="px-8"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {loading ? "Creating..." : "Create Course"}
                </Button>
              </div>

              {/* CSE Topic Suggestions */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">📚 Suggested CSE Topics:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {cseSuggestions.map((suggestion, index) => (
                    <Card 
                      key={index}
                      className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                      onClick={() => handleSuggestionClick(suggestion.title)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{suggestion.icon}</span>
                          <h3 className="font-semibold text-sm">{suggestion.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {suggestion.category}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Inline Progress Display */}
              {isGenerating && (
                <div className="mt-6 p-6 border rounded-lg bg-muted/30 space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Creating Your Course</h3>
                    <p className="text-sm text-muted-foreground">{currentStep}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          🎧 Learn by Listening
                        </span>
                        <span className="text-muted-foreground">{Math.round(generationProgress.listening)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${generationProgress.listening}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          📚 Learn by Reading
                        </span>
                        <span className="text-muted-foreground">{Math.round(generationProgress.reading)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${generationProgress.reading}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          🎮 Learn by Interacting
                        </span>
                        <span className="text-muted-foreground">{Math.round(generationProgress.interacting)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${generationProgress.interacting}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>Overall Progress</span>
                        <span>{Math.round(generationProgress.overall)}%</span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden mt-2">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                          style={{ width: `${generationProgress.overall}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassMorphism>
        </div>
      </Container>
    </div>
  );
};

export default CourseGenerator;
