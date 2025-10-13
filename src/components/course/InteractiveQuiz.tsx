import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  onComplete?: (score: number) => void;
}

export const InteractiveQuiz = ({ questions, onComplete }: InteractiveQuizProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correct_answer;
  const progress = ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || showResult) return;
    
    setShowResult(true);
    
    if (selectedAnswer === currentQuestion.correct_answer) {
      setScore(prev => prev + 1);
    }
    
    setAnsweredQuestions(prev => new Set(prev).add(currentIndex));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz complete
      if (onComplete) {
        onComplete(score);
      }
    }
  };

  if (!currentQuestion) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">Quiz Complete! 🎉</h3>
        <p className="text-lg mb-2">
          Your Score: {score} / {questions.length}
        </p>
        <p className="text-muted-foreground">
          {Math.round((score / questions.length) * 100)}% Correct
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium">
            Score: {score}/{answeredQuestions.size}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">{currentQuestion.question}</h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectAnswer = option === currentQuestion.correct_answer;
            
            let variantClass = 'border-border hover:border-primary';
            
            if (showResult) {
              if (isCorrectAnswer) {
                variantClass = 'border-green-500 bg-green-50 dark:bg-green-950';
              } else if (isSelected && !isCorrect) {
                variantClass = 'border-red-500 bg-red-50 dark:bg-red-950';
              }
            } else if (isSelected) {
              variantClass = 'border-primary bg-primary/5';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
                className={cn(
                  'w-full p-4 border-2 rounded-lg text-left transition-all',
                  variantClass,
                  !showResult && 'cursor-pointer'
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && (
                    <>
                      {isCorrectAnswer && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {isSelected && !isCorrect && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {showResult && currentQuestion.explanation && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Explanation:</p>
            <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex gap-3">
          {!showResult ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="flex-1"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {currentIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                'View Results'
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
