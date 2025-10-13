import Layout from '@/components/layout/Layout';
import { AnalysisHistory } from '@/components/resume/AnalysisHistory';
import { EnhancedAnalysisResults } from '@/components/resume/EnhancedAnalysisResults';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Brain,
  Briefcase,
  ChevronRight,
  FileText,
  History,
  Loader2,
  Sparkles,
  TrendingUp,
  Upload
} from 'lucide-react';
import React, { useState } from 'react';

interface AnalysisStep {
  id: 'job-role' | 'upload' | 'results';
  title: string;
  completed: boolean;
}

interface ProfileResume {
  id: string;
  filename: string;
  file_path: string;
  upload_date: string;
  processing_status: string;
  analysis_count?: number;
  last_analyzed_at?: string;
  file_size?: number;
}

const ResumeAnalyzer = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'job-role' | 'upload' | 'results'>('job-role');
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProfileResume, setSelectedProfileResume] = useState<ProfileResume | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [existingResumes, setExistingResumes] = useState<ProfileResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [showResumeSelector, setShowResumeSelector] = useState(true);

  const steps: AnalysisStep[] = [
    { id: 'job-role', title: 'Job Details', completed: !!jobRole },
    { id: 'upload', title: 'Upload Resume', completed: !!(selectedFile || selectedResumeId) },
    { id: 'results', title: 'Analysis Results', completed: !!analysisResults }
  ];

  // Load existing resumes when component mounts
  const loadExistingResumes = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`http://localhost:8003/user-resumes/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setExistingResumes(data.resumes || []);
        if (data.resumes && data.resumes.length > 0) {
          console.log(`✅ Loaded ${data.resumes.length} existing resumes`);
        }
      }
    } catch (error) {
      console.error('Failed to load existing resumes:', error);
    }
  };

  React.useEffect(() => {
    loadExistingResumes();
  }, [user]);

  const handleJobRoleNext = () => {
    if (!jobRole.trim()) {
      toast({
        title: "Job Role Required",
        description: "Please enter the job role you're applying for",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Step Complete!",
      description: "Job details saved. Now upload your resume.",
    });
    setCurrentStep('upload');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedProfileResume(null);
      setSelectedResumeId(null);
      toast({
        title: "File Selected!",
        description: `${file.name} is ready for analysis`,
      });
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !selectedResumeId) {
      toast({
        title: "Resume Required",
        description: "Please upload a resume or select an existing one",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      toast({
        title: "Analysis Starting...",
        description: "AI is analyzing your resume with advanced techniques",
      });
      
      const formData = new FormData();
      
      if (selectedFile) {
        formData.append('resume', selectedFile);
      } else if (selectedResumeId) {
        formData.append('resume_id', selectedResumeId);
      }
      
      formData.append('job_role', jobRole);
      formData.append('job_description', jobDescription);
      if (user?.id) {
        formData.append('user_id', user.id);
      }

      const response = await fetch('http://localhost:8003/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysisResults(data.analysis);
      setCurrentStep('results');
      
      // Reload existing resumes to update analysis count
      await loadExistingResumes();
      
      toast({
        title: "🎉 Analysis Complete!",
        description: "Your resume has been analyzed with action words and STAR methodology",
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "There was an error analyzing your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisSelect = async (analysisId: string) => {
    try {
      setLoading(true);
      toast({
        title: "Loading Analysis...",
        description: "Retrieving your previous analysis results",
      });
      
      const response = await fetch(`http://localhost:8003/analysis/${analysisId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }
      
      const data = await response.json();
      const analysis = data.analysis;
      
      setAnalysisResults(JSON.parse(analysis.analysis_results));
      setJobRole(analysis.job_role);
      setJobDescription(analysis.job_description || '');
      setSelectedAnalysisId(analysisId);
      setCurrentStep('results');
      
      toast({
        title: "Analysis Loaded!",
        description: "Previous analysis results are now displayed",
      });
      
    } catch (error) {
      console.error('Error fetching analysis:', error);
      toast({
        title: "Error",
        description: "Failed to load analysis details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startNewAnalysis = () => {
    setCurrentStep('job-role');
    setJobRole('');
    setJobDescription('');
    setSelectedFile(null);
    setSelectedProfileResume(null);
    setAnalysisResults(null);
    setSelectedAnalysisId('');
    toast({
      title: "New Analysis Started",
      description: "Ready to analyze another resume!",
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-4">
          {/* Enhanced Header with History Toggle */}
          <div className="mb-4 flex items-start justify-between">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="relative">
                  <Brain className="h-10 w-10 text-primary" />
                  <Sparkles className="h-4 w-4 text-primary absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Resume Analyzer
                </h1>
              </div>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-4">
                Enhanced AI-powered analysis with action words and STAR methodology scoring
              </p>
              
              {/* Progress Indicator */}
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-2">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        currentStep === step.id 
                          ? 'bg-primary text-primary-foreground' 
                          : step.completed 
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-16 h-0.5 mx-2 transition-all ${
                          steps[index + 1].completed ? 'bg-primary' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  {steps.map((step) => (
                    <span key={step.id} className={currentStep === step.id ? 'text-primary font-medium' : ''}>
                      {step.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2"
            >
              <History className="h-5 w-5" />
              {showHistory ? 'Hide History' : 'Show History'}
            </Button>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className={`grid gap-6 ${showHistory ? 'lg:grid-cols-4' : 'grid-cols-1'}`}>
              {/* History Sidebar - Conditionally Rendered */}
              {showHistory && (
                <div className="lg:col-span-1">
                  <AnalysisHistory 
                    onSelectAnalysis={handleAnalysisSelect}
                    selectedAnalysisId={selectedAnalysisId}
                  />
                </div>
              )}

              {/* Main Content */}
              <div className={showHistory ? 'lg:col-span-3' : 'col-span-1'}>
                <div className="space-y-6">
                  {currentStep === 'job-role' && (
                    <Card className="border border-border bg-card">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                          Job Information
                        </CardTitle>
                        <p className="text-muted-foreground">
                          Tell us about the position you're applying for
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="jobRole" className="text-sm font-medium">
                            Job Role / Position *
                          </Label>
                          
                          {/* Popular Role Suggestions */}
                          {!jobRole && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'Software Engineer'].map((role) => (
                                <Badge
                                  key={role}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                                  onClick={() => setJobRole(role)}
                                >
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <Input
                            id="jobRole"
                            placeholder="e.g., Software Engineer, Product Manager"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            className="h-11"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="jobDescription" className="text-sm font-medium">
                            Job Description (Optional)
                          </Label>
                          
                          {/* Quick Suggestions */}
                          {!jobDescription && (
                            <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-muted-foreground/20">
                              <p className="text-xs font-medium text-muted-foreground">Quick Start Templates:</p>
                              <div className="flex flex-wrap gap-2">
                                <Badge 
                                  variant="outline" 
                                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                  onClick={() => setJobDescription("We are looking for a skilled developer with strong experience in modern web technologies. Responsibilities include developing scalable applications, collaborating with cross-functional teams, and implementing best practices.")}
                                >
                                  General Developer
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                  onClick={() => setJobDescription("Seeking a frontend developer proficient in React, TypeScript, and modern CSS frameworks. Experience with responsive design, state management, and performance optimization required. Build user-friendly interfaces and collaborate with designers.")}
                                >
                                  Frontend Developer
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                  onClick={() => setJobDescription("Backend developer needed with expertise in API development, database design, and server-side technologies. Experience with Python/Node.js, RESTful APIs, microservices, and cloud platforms (AWS/Azure) required.")}
                                >
                                  Backend Developer
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                  onClick={() => setJobDescription("Full stack developer to build and maintain web applications. Required skills: JavaScript/TypeScript, React/Vue, Node.js, databases (SQL/NoSQL), Git, CI/CD. Experience with agile methodologies and cloud deployment preferred.")}
                                >
                                  Full Stack Developer
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                  onClick={() => setJobDescription("Data Scientist to analyze complex datasets and build ML models. Required: Python, SQL, pandas, scikit-learn, TensorFlow/PyTorch. Experience with statistical analysis, data visualization, and big data technologies. Strong communication skills essential.")}
                                >
                                  Data Scientist
                                </Badge>
                              </div>
                            </div>
                          )}
                          
                          <Textarea
                            id="jobDescription"
                            placeholder="Paste the job description here for more targeted analysis..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows={6}
                            className="resize-none"
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              Including the job description will provide more accurate keyword matching
                            </p>
                            {jobDescription && (
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm"
                                onClick={() => setJobDescription('')}
                                className="text-xs h-7"
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          onClick={handleJobRoleNext} 
                          className="w-full h-11"
                          disabled={!jobRole.trim()}
                        >
                          Continue to Upload
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {currentStep === 'upload' && (
                    <div className="space-y-6">
                      <Card className="border border-border bg-card">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2 text-xl">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Upload className="h-6 w-6 text-primary" />
                                </div>
                                Upload Resume
                              </CardTitle>
                              <p className="text-muted-foreground mt-1">
                                Choose a resume file to analyze
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentStep('job-role')}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              Back
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors bg-primary/5">
                            <div className="flex flex-col items-center">
                              <div className="p-4 rounded-full bg-primary/10 mb-4">
                                <Upload className="h-8 w-8 text-primary" />
                              </div>
                              <h3 className="font-semibold mb-2">Drop your resume here</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Supports PDF and DOCX files up to 10MB
                              </p>
                              <input
                                type="file"
                                accept=".pdf,.docx"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="resume-upload"
                              />
                              <Label htmlFor="resume-upload" className="cursor-pointer">
                                <Button variant="outline" className="h-11" asChild>
                                  <span>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Choose File
                                  </span>
                                </Button>
                              </Label>
                            </div>
                            
                            {selectedFile && (
                              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                                <div className="flex items-center justify-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium text-primary">
                                    {selectedFile.name}
                                  </span>
                                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                    Ready
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {selectedFile && (
                            <Button 
                              onClick={handleAnalyze} 
                              className="w-full mt-6 h-11"
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Analyzing Resume...
                                </>
                              ) : (
                                <>
                                  <Brain className="h-4 w-4 mr-2" />
                                  Analyze Resume with AI
                                </>
                              )}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                      
                      {/* Existing Resumes Selector */}
                      {existingResumes.length > 0 && showResumeSelector && (
                        <>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-muted" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">Or Select from Existing</span>
                            </div>
                          </div>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Your Uploaded Resumes
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Select a previously uploaded resume to analyze
                              </p>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {existingResumes.map((resume) => (
                                  <div
                                    key={resume.id}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                      selectedResumeId === resume.id
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                    onClick={() => {
                                      setSelectedResumeId(resume.id);
                                      setSelectedFile(null);
                                      toast({
                                        title: "Resume Selected",
                                        description: `Using ${resume.filename}`,
                                      });
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3 flex-1">
                                        <div className={`p-2 rounded-lg ${
                                          selectedResumeId === resume.id 
                                            ? 'bg-primary/20' 
                                            : 'bg-muted'
                                        }`}>
                                          <FileText className={`h-5 w-5 ${
                                            selectedResumeId === resume.id 
                                              ? 'text-primary' 
                                              : 'text-muted-foreground'
                                          }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium truncate">{resume.filename}</p>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                            <span>Uploaded {new Date(resume.upload_date).toLocaleDateString()}</span>
                                            {resume.analysis_count && resume.analysis_count > 0 && (
                                              <>
                                                <span>•</span>
                                                <Badge variant="secondary" className="text-xs">
                                                  Analyzed {resume.analysis_count} {resume.analysis_count === 1 ? 'time' : 'times'}
                                                </Badge>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      {selectedResumeId === resume.id && (
                                        <div className="flex items-center gap-2">
                                          <Badge variant="default" className="bg-primary">
                                            Selected
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {selectedResumeId && (
                                <Button 
                                  onClick={handleAnalyze} 
                                  className="w-full mt-4 h-11"
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Analyzing Resume...
                                    </>
                                  ) : (
                                    <>
                                      <Brain className="h-4 w-4 mr-2" />
                                      Analyze Selected Resume with AI
                                    </>
                                  )}
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                className="w-full mt-2"
                                onClick={() => setShowResumeSelector(false)}
                              >
                                Hide Existing Resumes
                              </Button>
                            </CardContent>
                          </Card>
                        </>
                      )}
                      
                      {existingResumes.length > 0 && !showResumeSelector && (
                        <Card className="bg-muted/30">
                          <CardContent className="pt-6">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => setShowResumeSelector(true)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Show My Uploaded Resumes ({existingResumes.length})
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {currentStep === 'results' && analysisResults && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex items-center justify-between p-6 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <TrendingUp className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-semibold">Analysis Complete</h2>
                            <p className="text-muted-foreground">
                              for {jobRole}
                            </p>
                          </div>
                        </div>
                        <Button onClick={startNewAnalysis} variant="outline">
                          <Sparkles className="h-4 w-4 mr-2" />
                          New Analysis
                        </Button>
                      </div>

                      <EnhancedAnalysisResults 
                        analysisData={analysisResults}
                        jobRole={jobRole}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResumeAnalyzer;
