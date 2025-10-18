import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UnifiedInterviewSetupProps {
  type: 'technical' | 'aptitude' | 'hr';
  onSubmit: (data: any) => void;
}

const UnifiedInterviewSetup = ({ type, onSubmit }: UnifiedInterviewSetupProps) => {
  const [difficulty, setDifficulty] = useState("medium");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState("30");
  const [questionCount, setQuestionCount] = useState("15");
  const [industry, setIndustry] = useState("");
  const [positionLevel, setPositionLevel] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'aptitude') {
      onSubmit({
        difficulty,
        focusAreas: focusAreas.join(', '),
        timeLimit,
        questionCount
      });
    } else if (type === 'hr') {
      onSubmit({
        industry,
        positionLevel,
        companySize,
        experienceLevel
      });
    }
  };

  const toggleFocusArea = (area: string) => {
    setFocusAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const aptitudeTips = [
    { icon: "🎯", text: "Practice time management - aim to spend equal time on each question" },
    { icon: "📊", text: "Read questions carefully - aptitude tests often contain trick elements" },
    { icon: "💡", text: "Use elimination strategy for multiple choice questions" },
    { icon: "⚡", text: "Don't spend too much time on difficult questions - move on and return later" }
  ];

  const hrTips = [
    { icon: "🤝", text: "Use the STAR method: Situation, Task, Action, Result" },
    { icon: "💬", text: "Be honest and authentic - share real experiences" },
    { icon: "🎯", text: "Research the company culture and values beforehand" },
    { icon: "🌟", text: "Prepare examples that showcase your soft skills and teamwork" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {type === 'aptitude' ? 'Aptitude Test Setup' : 'HR Interview Setup'}
          </CardTitle>
          <CardDescription>
            {type === 'aptitude' 
              ? 'Configure your aptitude test parameters'
              : 'Set up your HR interview session'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {type === 'aptitude' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Focus Areas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Logical Reasoning', 'Quantitative', 'Verbal', 'Data Interpretation'].map(area => (
                      <Button
                        key={area}
                        type="button"
                        variant={focusAreas.includes(area) ? 'default' : 'outline'}
                        onClick={() => toggleFocusArea(area)}
                        className="justify-start"
                      >
                        {area}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Select value={timeLimit} onValueChange={setTimeLimit}>
                    <SelectTrigger id="timeLimit">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionCount">Number of Questions</Label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger id="questionCount">
                      <SelectValue placeholder="Select count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 questions</SelectItem>
                      <SelectItem value="15">15 questions</SelectItem>
                      <SelectItem value="20">20 questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">Information Technology</SelectItem>
                      <SelectItem value="finance">Finance & Banking</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="positionLevel">Position Level</Label>
                  <Select value={positionLevel} onValueChange={setPositionLevel}>
                    <SelectTrigger id="positionLevel">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="lead">Lead / Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger id="companySize">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-50)</SelectItem>
                      <SelectItem value="midsize">Mid-size (51-500)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (500+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Your Experience</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger id="experienceLevel">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="5+">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" size="lg">
              Start {type === 'aptitude' ? 'Test' : 'Interview'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Right: Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Success</CardTitle>
          <CardDescription>
            {type === 'aptitude' 
              ? 'Maximize your aptitude test performance'
              : 'Ace your HR interview'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(type === 'aptitude' ? aptitudeTips : hrTips).map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span className="text-2xl">{tip.icon}</span>
                <p className="text-sm">{tip.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedInterviewSetup;
