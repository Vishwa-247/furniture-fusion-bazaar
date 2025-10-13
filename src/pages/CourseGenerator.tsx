import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import { API_GATEWAY_URL } from '@/configs/environment';
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import Container from "@/components/ui/Container";

const CourseGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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

      toast.success("Course generation started!", {
        description: "Your course will be ready in ~40 seconds"
      });

      navigate(`/course/${data.courseId}`);

    } catch (error: any) {
      console.error('Generation failed:', error);
      toast.error("Failed to generate course", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Container className="py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            What do you want to learn?
          </h1>
          <p className="text-xl text-muted-foreground">
            Generate a complete AI-powered course in 40 seconds
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="e.g., React Hooks, Machine Learning, Quantum Physics..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              className="h-14 text-lg"
              disabled={isGenerating}
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              size="lg"
              className="h-14 px-8"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Course
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <FeatureCard
            icon="🎙️"
            title="Learn by Listening"
            description="AI-generated podcasts and lectures"
          />
          <FeatureCard
            icon="📚"
            title="Learn by Reading"
            description="Deep dive articles and key takeaways"
          />
          <FeatureCard
            icon="🎮"
            title="Learn by Playing"
            description="Interactive quizzes and word games"
          />
        </div>
      </Container>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="bg-card p-6 rounded-xl shadow-sm border border-border text-center hover:shadow-md transition-shadow">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default CourseGenerator;
