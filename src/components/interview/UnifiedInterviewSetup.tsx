import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Users, Target, Clock, BookOpen, Lightbulb } from "lucide-react";

interface UnifiedInterviewSetupProps {
  type: 'technical' | 'aptitude' | 'hr';
  onSubmit: (data: any) => void;
}

const UnifiedInterviewSetup = ({ type, onSubmit }: UnifiedInterviewSetupProps) => {
  const [formData, setFormData] = useState({
    jobRole: '',
    experience: 'intermediate',
    techStack: '',
    questionCount: 5,
    duration: 30
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getTips = () => {
    switch (type) {
      case 'technical':
        return {
          icon: Brain,
          title: "Technical Interview Tips",
          tips: [
            "Think out loud while solving problems",
            "Ask clarifying questions before answering",
            "Explain your thought process step by step",
            "Consider edge cases and optimization"
          ]
        };
      case 'aptitude':
        return {
          icon: Target,
          title: "Aptitude Test Tips",
          tips: [
            "Read questions carefully before answering",
            "Manage your time effectively",
            "Use elimination method for multiple choice",
            "Show your working for calculations"
          ]
        };
      case 'hr':
        return {
          icon: Users,
          title: "HR Interview Tips",
          tips: [
            "Use the STAR method (Situation, Task, Action, Result)",
            "Be authentic and honest in your responses",
            "Prepare specific examples from your experience",
            "Show enthusiasm and cultural fit"
          ]
        };
    }
  };

  const tips = getTips();
  const TipIcon = tips.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TipIcon className="h-5 w-5" />
            {type === 'technical' && 'Technical Interview Setup'}
            {type === 'aptitude' && 'Aptitude Test Setup'}
            {type === 'hr' && 'HR Interview Setup'}
          </CardTitle>
          <CardDescription>
            Configure your {type} interview preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobRole">Job Role</Label>
              <Input
                id="jobRole"
                placeholder={type === 'technical' ? "e.g., Software Engineer" : "e.g., Marketing Manager"}
                value={formData.jobRole}
                onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select
                value={formData.experience}
                onValueChange={(value) => setFormData({ ...formData, experience: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                  <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === 'technical' && (
              <div className="space-y-2">
                <Label htmlFor="techStack">Tech Stack</Label>
                <Input
                  id="techStack"
                  placeholder="e.g., React, Node.js, Python"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="questionCount" className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  Questions
                </Label>
                <Input
                  id="questionCount"
                  type="number"
                  min="3"
                  max="10"
                  value={formData.questionCount}
                  onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Duration (min)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="60"
                  step="15"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Start Interview
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Right: Tips */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            {tips.title}
          </CardTitle>
          <CardDescription>
            Best practices for a successful interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {tips.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary mt-0.5">
                  {index + 1}
                </div>
                <span className="text-sm text-muted-foreground leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedInterviewSetup;
