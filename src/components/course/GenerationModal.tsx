import { useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress";
import { Headphones, BookOpen, Gamepad2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface GenerationModalProps {
  topic: string;
  progress: number;
  currentStep: string;
  onComplete?: () => void;
}

interface SectionProgress {
  listening: number;
  reading: number;
  interacting: number;
}

const GenerationModal = ({ topic, progress, currentStep, onComplete }: GenerationModalProps) => {
  const [sectionProgress, setSectionProgress] = useState<SectionProgress>({
    listening: 0,
    reading: 0,
    interacting: 0
  });

  useEffect(() => {
    // Map backend steps to section progress
    const step = currentStep.toLowerCase();
    
    if (step.includes('podcast') || step.includes('audio') || step.includes('lecture')) {
      setSectionProgress(prev => ({ ...prev, listening: Math.min(100, prev.listening + 20) }));
    }
    
    if (step.includes('chapter') || step.includes('article') || step.includes('outline')) {
      setSectionProgress(prev => ({ ...prev, reading: Math.min(100, prev.reading + 20) }));
    }
    
    if (step.includes('quiz') || step.includes('flashcard') || step.includes('game') || step.includes('mcq')) {
      setSectionProgress(prev => ({ ...prev, interacting: Math.min(100, prev.interacting + 20) }));
    }

    // When overall progress is complete
    if (progress >= 100) {
      setSectionProgress({ listening: 100, reading: 100, interacting: 100 });
      setTimeout(() => {
        onComplete?.();
      }, 1000);
    }
  }, [currentStep, progress, onComplete]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Creating Your Course</h2>
          <p className="text-lg text-muted-foreground">Topic: {topic}</p>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-muted-foreground">We are generating content in 3 ways:</p>
        </div>

        <div className="space-y-6">
          {/* Learn by Listening */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Headphones className="w-5 h-5 text-primary" />
              <span className="font-medium">Learn by Listening</span>
              <span className="ml-auto text-sm text-muted-foreground">{sectionProgress.listening}%</span>
            </div>
            <Progress value={sectionProgress.listening} className="h-2" />
            <p className="text-xs text-muted-foreground pl-8">Podcast, Lecture</p>
          </div>

          {/* Learn by Reading */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-medium">Learn by Reading</span>
              <span className="ml-auto text-sm text-muted-foreground">{sectionProgress.reading}%</span>
            </div>
            <Progress value={sectionProgress.reading} className="h-2" />
            <p className="text-xs text-muted-foreground pl-8">Articles, Notes, FAQ</p>
          </div>

          {/* Learn by Interacting */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-5 h-5 text-primary" />
              <span className="font-medium">Learn by Interacting</span>
              <span className="ml-auto text-sm text-muted-foreground">{sectionProgress.interacting}%</span>
            </div>
            <Progress value={sectionProgress.interacting} className="h-2" />
            <p className="text-xs text-muted-foreground pl-8">Quizzes, Games, Flashcards</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {currentStep}
        </div>
      </Card>
    </div>
  );
};

export default GenerationModal;
