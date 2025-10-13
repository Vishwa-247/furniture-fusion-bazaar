import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Star,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import React from 'react';

interface AnalysisData {
  overall_score: number;
  action_verb_score: number;
  star_methodology_score: number;
  ats_score: number;
  action_verb_analysis?: {
    score: number;
    found_verbs: Array<{
      verb: string;
      category: string;
      strength_score: number;
      alternatives: string[];
    }>;
    categories: Record<string, number>;
    recommendations: string[];
  };
  star_analysis?: {
    score: number;
    bullet_analysis: Array<{
      bullet: string;
      star_score: number;
      improvements: string[];
    }>;
    recommendations: string[];
  };
  sections_analysis?: Record<string, { score: number; feedback: string }>;
  recommendations?: string[];
  keyword_analysis?: {
    matching_keywords: string[];
    missing_keywords: string[];
    keyword_density: number;
  };
}

interface EnhancedAnalysisResultsProps {
  analysisData: AnalysisData;
  jobRole: string;
}

export const EnhancedAnalysisResults: React.FC<EnhancedAnalysisResultsProps> = ({
  analysisData,
  jobRole
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 text-green-600 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    return 'bg-red-500/10 text-red-600 border-red-500/20';
  };

  const ScoreCard: React.FC<{ 
    title: string; 
    score: number; 
    icon: React.ReactNode; 
    description: string 
  }> = ({ title, score, icon, description }) => (
    <Card className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              {icon}
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          <Badge variant="outline" className={`${getScoreBadgeColor(score)} font-semibold`}>
            {Math.round(score)}%
          </Badge>
        </div>
        <Progress value={score} className="mb-3 h-2" />
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Overall Score Header */}
      <Card className="border border-border bg-card bg-primary/5 border-primary/20">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/20">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Resume Analysis Complete
              </h2>
            </div>
            <p className="text-muted-foreground mb-6 text-lg">
              Analysis for <Badge variant="outline" className="mx-1 bg-primary/10 text-primary border-primary/20">{jobRole}</Badge> position
            </p>
            <div className="relative">
              <div className={`text-6xl font-bold ${getScoreColor(analysisData.overall_score)} mb-2`}>
                {Math.round(analysisData.overall_score)}%
              </div>
              <Progress 
                value={analysisData.overall_score} 
                className="w-32 mx-auto h-2 mb-2"
              />
              <p className="text-sm text-muted-foreground font-medium">Overall Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 max-w-full">
        <ScoreCard
          title="Action Verbs"
          score={analysisData.action_verb_score}
          icon={<Zap className="h-5 w-5 text-yellow-600" />}
          description="Strength and diversity of action verbs"
        />
        <ScoreCard
          title="STAR Method"
          score={analysisData.star_methodology_score}
          icon={<Star className="h-5 w-5 text-blue-600" />}
          description="Achievement structure quality"
        />
        <ScoreCard
          title="ATS Score"
          score={analysisData.ats_score}
          icon={<Target className="h-5 w-5 text-green-600" />}
          description="Applicant Tracking System compatibility"
        />
        <ScoreCard
          title="Keywords"
          score={analysisData.keyword_analysis?.keyword_density || 0}
          icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
          description="Job-relevant keyword density"
        />
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="action-verbs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="action-verbs">Action Verbs</TabsTrigger>
          <TabsTrigger value="star-analysis">STAR Analysis</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="action-verbs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Action Verbs Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisData.action_verb_analysis && (
                <div className="space-y-4">
                  {/* Categories Breakdown */}
                  <div>
                    <h4 className="font-semibold mb-2">Categories Found:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(analysisData.action_verb_analysis.categories).map(([category, count]) => (
                        <Badge key={category} variant="outline">
                          {category}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Strong Verbs Found */}
                  <div>
                    <h4 className="font-semibold mb-2">Strong Action Verbs Found:</h4>
                    <ScrollArea className="h-32 max-w-full overflow-hidden">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-full">
                        {analysisData.action_verb_analysis.found_verbs
                          .filter(verb => verb.strength_score >= 4)
                          .map((verb, index) => (
                          <Badge key={index} variant="outline" className="justify-start">
                            {verb.verb} ({verb.strength_score}/5)
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {analysisData.action_verb_analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="star-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                STAR Methodology Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Analyzing {analysisData.star_analysis?.bullet_analysis.length || 0} bullet points
              </p>
            </CardHeader>
            <CardContent>
              {analysisData.star_analysis && (
                <div className="space-y-4">
                  {/* Bullet Points Analysis */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Bullet Points Analysis:</h4>
                      <Badge variant="outline" className="text-xs">
                        Scroll to view all →
                      </Badge>
                    </div>
                    {/* IMPROVED SCROLL AREA - Responsive Height */}
                    <ScrollArea className="h-[300px] md:h-[400px] lg:h-[500px] pr-4 border rounded-lg bg-muted/20 max-w-full overflow-hidden">
                      <div className="space-y-3 p-4">
                        {analysisData.star_analysis.bullet_analysis.map((bullet, index) => (
                          <Card key={index} className="p-4 bg-card hover:shadow-md transition-shadow">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <Badge 
                                  variant="outline" 
                                  className={`flex-shrink-0 ${getScoreBadgeColor(bullet.star_score * 100)}`}
                                >
                                  {Math.round(bullet.star_score * 100)}%
                                </Badge>
                                <p className="text-sm leading-relaxed flex-1 break-words max-w-full">{bullet.bullet}</p>
                              </div>
                              
                              {bullet.improvements.length > 0 && (
                                <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200">
                                  <p className="text-xs font-semibold text-orange-800 dark:text-orange-400 mb-2 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4" />
                                    Specific Improvements:
                                  </p>
                                  <ul className="space-y-2">
                                     {bullet.improvements.map((improvement, idx) => (
                                       <li key={idx} className="text-sm text-orange-900 dark:text-orange-300 flex items-start gap-2 leading-relaxed">
                                         <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                         <span className="break-words max-w-full">{improvement}</span>
                                       </li>
                                     ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* STAR Recommendations */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                    <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-400">Overall STAR Recommendations:</h4>
                    <ul className="space-y-2">
                      {analysisData.star_analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-300">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="break-words max-w-full">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Perfect STAR Example */}
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-300">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-900 dark:text-green-300">Perfect STAR Example (100% Score)</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-white dark:bg-green-900/10 rounded border border-green-200">
                        <p className="text-green-800 dark:text-green-300 leading-relaxed">
                          <strong className="text-green-700">Situation:</strong> During Q2 2023, when the e-commerce platform experienced a 40% increase in traffic, 
                          <strong className="text-green-700 ml-1">Task:</strong> I was tasked with optimizing the checkout system to handle peak loads. 
                          <strong className="text-green-700 ml-1">Action:</strong> I implemented Redis caching, optimized database queries, and introduced load balancing across 5 servers. 
                          <strong className="text-green-700 ml-1">Result:</strong> Reduced checkout time by 65% (from 8s to 2.8s), increased conversion rate by 23%, and handled 50K concurrent users without downtime, generating an additional $2.3M in revenue.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          ✓ Situation with timeframe
                        </Badge>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          ✓ Clear task/challenge
                        </Badge>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          ✓ Strong action verbs
                        </Badge>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          ✓ Quantified results (%)
                        </Badge>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          ✓ Business impact ($)
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Keyword Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {analysisData.keyword_analysis 
                  ? `Found ${analysisData.keyword_analysis.matching_keywords.length} matching keywords`
                  : 'No keyword analysis available'
                }
              </p>
            </CardHeader>
            <CardContent>
              {analysisData.keyword_analysis && 
               (analysisData.keyword_analysis.matching_keywords.length > 0 || 
                analysisData.keyword_analysis.missing_keywords.length > 0) ? (
                <div className="space-y-6">
                  {/* Keyword Density Score */}
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Keyword Match Rate</span>
                      <span className="text-2xl font-bold text-primary">
                        {analysisData.keyword_analysis.keyword_density}%
                      </span>
                    </div>
                    <Progress value={analysisData.keyword_analysis.keyword_density} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Matching Keywords ({analysisData.keyword_analysis.matching_keywords.length})
                      </h4>
                    <ScrollArea className="h-48 max-w-full overflow-hidden">
                      <div className="flex flex-wrap gap-2 pr-4 max-w-full">
                          {analysisData.keyword_analysis.matching_keywords.map((keyword, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400"
                            >
                              ✓ {keyword}
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Missing Keywords ({analysisData.keyword_analysis.missing_keywords.length})
                      </h4>
                      <ScrollArea className="h-48">
                        <div className="flex flex-wrap gap-2 pr-4">
                          {analysisData.keyword_analysis.missing_keywords.map((keyword, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400"
                            >
                              + {keyword}
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Tip:</strong> Add missing keywords naturally throughout your resume in the context of your achievements and experience.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-2">No keyword analysis available</p>
                  <p className="text-sm text-muted-foreground">
                    Add a job description to get keyword matching insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {/* Priority Recommendations - Dynamic based on scores */}
            <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <AlertCircle className="h-5 w-5" />
                  High Priority Improvements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Action Verbs Recommendation */}
                  {analysisData.action_verb_score < 70 && (
                    <div className="flex items-start gap-3 p-3 bg-orange-100/50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                      <Lightbulb className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Strengthen Action Verbs (Score: {Math.round(analysisData.action_verb_score)}%)</p>
                        <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                          {analysisData.action_verb_analysis?.recommendations[0] || "Use stronger action verbs like 'developed', 'implemented', 'optimized' instead of weak verbs"}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* STAR Methodology Recommendation */}
                  {analysisData.star_methodology_score < 70 && (
                    <div className="flex items-start gap-3 p-3 bg-orange-100/50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                      <Lightbulb className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Improve STAR Methodology (Score: {Math.round(analysisData.star_methodology_score)}%)</p>
                        <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                          {analysisData.star_analysis?.recommendations[0] || "Add quantifiable results and structure achievements using Situation, Task, Action, Result format"}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* ATS Score Recommendation */}
                  {analysisData.ats_score < 70 && (
                    <div className="flex items-start gap-3 p-3 bg-orange-100/50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                      <Lightbulb className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Optimize for ATS Systems (Score: {Math.round(analysisData.ats_score)}%)</p>
                        <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">Use standard section headers, avoid images/tables, include relevant keywords, and use simple formatting</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Keywords Recommendation */}
                  {analysisData.keyword_analysis && analysisData.keyword_analysis.keyword_density < 60 && (
                    <div className="flex items-start gap-3 p-3 bg-orange-100/50 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                      <Lightbulb className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Add More Relevant Keywords (Match Rate: {analysisData.keyword_analysis.keyword_density}%)</p>
                        <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">Include {analysisData.keyword_analysis.missing_keywords.length} missing keywords naturally in your experience and skills sections</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Show success message if all scores are good */}
                  {analysisData.action_verb_score >= 70 && 
                   analysisData.star_methodology_score >= 70 && 
                   analysisData.ats_score >= 70 && 
                   (!analysisData.keyword_analysis || analysisData.keyword_analysis.keyword_density >= 60) && (
                    <div className="flex items-start gap-3 p-3 bg-green-100/50 dark:bg-green-900/20 rounded-lg border border-green-200">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">Great Job! Your Resume is Strong</p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">All major areas are performing well. Continue refining based on the detailed recommendations below.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills & Keywords - Dynamic from analysis */}
            {analysisData.keyword_analysis && analysisData.keyword_analysis.missing_keywords.length > 0 && (
              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Target className="h-5 w-5" />
                    Missing Keywords to Add
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                      Add these {analysisData.keyword_analysis.missing_keywords.length} keywords to improve your match rate from {analysisData.keyword_analysis.keyword_density}% to 100%:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysisData.keyword_analysis.missing_keywords.slice(0, 15).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300">
                          + {keyword}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-3 p-2 bg-blue-100/50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-400">
                      <strong>Tip:</strong> Incorporate these keywords naturally in your experience descriptions, skills section, and project details.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Verbs Recommendations - Dynamic */}
            {analysisData.action_verb_analysis && analysisData.action_verb_analysis.recommendations.length > 0 && (
              <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <Zap className="h-5 w-5" />
                    Action Verb Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisData.action_verb_analysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-purple-100/50 dark:bg-purple-900/20 rounded">
                        <ArrowRight className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-purple-800 dark:text-purple-300">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STAR Method Recommendations - Dynamic */}
            {analysisData.star_analysis && analysisData.star_analysis.recommendations.length > 0 && (
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Star className="h-5 w-5" />
                    STAR Methodology Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisData.star_analysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-green-100/50 dark:bg-green-900/20 rounded">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-800 dark:text-green-300">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI-Generated Recommendations */}
            {analysisData.recommendations && analysisData.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    AI-Powered Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2 pr-4">
                      {analysisData.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* General Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  General Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 bg-muted/20 rounded text-sm">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Keep your resume to 1-2 pages for optimal readability</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-muted/20 rounded text-sm">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Include a "Projects" or "Portfolio" section to showcase practical work</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-muted/20 rounded text-sm">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Add relevant certifications and include completion dates</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-muted/20 rounded text-sm">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Tailor your resume for each job application</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
