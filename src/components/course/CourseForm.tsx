import { useState } from "react";
import { Loader2 } from "lucide-react";
import GlassMorphism from "../ui/GlassMorphism";
import { CourseType } from "@/types";

interface CourseFormProps {
  onSubmit: (courseName: string, purpose: CourseType['purpose'], difficulty: CourseType['difficulty'], customPrompt?: string) => void;
  isLoading: boolean;
}

const CourseForm = ({ onSubmit, isLoading }: CourseFormProps) => {
  const [courseName, setCourseName] = useState("");
  const [purpose, setPurpose] = useState<CourseType['purpose']>("exam");
  const [difficulty, setDifficulty] = useState<CourseType['difficulty']>("intermediate");
  const [customPrompt, setCustomPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseName.trim()) {
      onSubmit(courseName, purpose, difficulty, customPrompt.trim() || undefined);
    }
  };

  const purposeOptions = [
    { value: "exam" as const, label: "Exam" },
    { value: "job_interview" as const, label: "Interview" },
    { value: "practice" as const, label: "Practice" },
    { value: "coding_preparation" as const, label: "Coding" },
    { value: "other" as const, label: "Other" },
  ];

  const difficultyOptions = [
    { value: "beginner" as const, label: "Beginner" },
    { value: "intermediate" as const, label: "Intermediate" },
    { value: "advanced" as const, label: "Advanced" },
  ];

  return (
    <GlassMorphism className="p-6 max-w-2xl mx-auto" intensity="medium">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="courseName"
            className="block text-sm font-medium text-foreground"
          >
            Course Topic
          </label>
          <input
            id="courseName"
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Enter a topic to learn"
            className="w-full px-4 py-2 bg-white/20 dark:bg-black/20 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="purpose"
            className="block text-sm font-medium text-foreground"
          >
            Purpose
          </label>
          <div className="grid grid-cols-5 gap-2">
            {purposeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPurpose(option.value)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  purpose === option.value
                    ? "bg-primary text-white"
                    : "bg-white/20 dark:bg-black/20 text-foreground hover:bg-white/30 dark:hover:bg-black/30"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="difficulty"
            className="block text-sm font-medium text-foreground"
          >
            Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDifficulty(option.value)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  difficulty === option.value
                    ? "bg-primary text-white"
                    : "bg-white/20 dark:bg-black/20 text-foreground hover:bg-white/30 dark:hover:bg-black/30"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="customPrompt"
            className="block text-sm font-medium text-foreground"
          >
            Custom Requirements (Optional)
          </label>
          <textarea
            id="customPrompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Add specific requirements or focus areas for your course..."
            rows={3}
            className="w-full px-4 py-2 bg-white/20 dark:bg-black/20 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !courseName.trim()}
          className={`w-full px-4 py-2 flex items-center justify-center text-white font-medium bg-primary rounded-lg transition-all ${
            isLoading || !courseName.trim()
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-primary/90"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Generate Course"
          )}
        </button>
      </form>
    </GlassMorphism>
  );
};

export default CourseForm;