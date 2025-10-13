import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, FileText, Layout, Lightbulb, MessageSquare, ChevronLeft, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import Container from "@/components/ui/Container";
import { useToast } from "@/hooks/use-toast";
import { ChapterType, CourseType, FlashcardType, McqType, QnaType } from "@/types";
import NotebookPanel from "@/components/course/NotebookPanel";
import CourseLayout from "@/components/course/CourseLayout";
import { courseService, CourseResource, CourseNotebook } from "@/api/services/courseService";
import { useAuth } from "@/hooks/useAuth";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

const CourseDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<CourseType | null>(null);
  const [chapters, setChapters] = useState<ChapterType[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [mcqs, setMcqs] = useState<McqType[]>([]);
  const [qnas, setQnas] = useState<QnaType[]>([]);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [notebook, setNotebook] = useState<CourseNotebook | null>(null);
  const [activeTab, setActiveTab] = useState("chapters");
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id && user) {
      loadCourseData();
    }
  }, [id, user]);

  const loadCourseData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      // Load course data in parallel
      const [
        courseData,
        chaptersData,
        flashcardsData,
        mcqsData,
        qnasData,
        resourcesData,
        notebookData
      ] = await Promise.all([
        courseService.getCourse(id),
        courseService.getCourseChapters(id),
        courseService.getCourseFlashcards(id),
        courseService.getCourseMcqs(id),
        courseService.getCourseQnas(id),
        courseService.getCourseResources(id),
        courseService.getCourseNotebook(id)
      ]);

      setCourse(courseData);
      setChapters(chaptersData);
      setFlashcards(flashcardsData);
      setMcqs(mcqsData);
      setQnas(qnasData);
      setResources(resourcesData);
      setNotebook(notebookData);
      
    } catch (error) {
      console.error('Error loading course data:', error);
      toast({
        title: "Error",
        description: "Failed to load course data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateContent = async (contentType: 'flashcards' | 'mcqs' | 'qnas' | 'notebook' | 'resources') => {
    if (!course || !user) return;

    try {
      setIsGenerating(prev => ({ ...prev, [contentType]: true }));
      
      const topic = course.title;
      const chapterContent = chapters.map(ch => ch.content).join('\n\n');
      
      await courseService.generateContent(course.id, contentType, topic, {
        difficulty: 'medium',
        count: contentType === 'resources' ? 8 : 5,
        chapterContent
      });

      // Reload the specific content type
      switch (contentType) {
        case 'flashcards':
          const newFlashcards = await courseService.getCourseFlashcards(course.id);
          setFlashcards(newFlashcards);
          break;
        case 'mcqs':
          const newMcqs = await courseService.getCourseMcqs(course.id);
          setMcqs(newMcqs);
          break;
        case 'qnas':
          const newQnas = await courseService.getCourseQnas(course.id);
          setQnas(newQnas);
          break;
        case 'notebook':
          const newNotebook = await courseService.getCourseNotebook(course.id);
          setNotebook(newNotebook);
          break;
        case 'resources':
          const newResources = await courseService.getCourseResources(course.id);
          setResources(newResources);
          break;
      }

      toast({
        title: "Content Generated",
        description: `New ${contentType} have been generated successfully!`
      });
      
    } catch (error) {
      console.error(`Error generating ${contentType}:`, error);
      toast({
        title: "Generation Failed",
        description: `Failed to generate ${contentType}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(prev => ({ ...prev, [contentType]: false }));
    }
  };

  const toggleAnswer = (id: string) => {
    setShowAnswer(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAnswer = (mcqId: string, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [mcqId]: answer }));
    
    if (user) {
      // Track progress
      courseService.trackProgress({
        user_id: user.id,
        course_id: id!,
        mcq_id: mcqId,
        progress_type: 'mcq_answered',
        score: mcqs.find(m => m.id === mcqId)?.correct_answer === answer ? 100 : 0
      });
    }
  };

  const markChapterAsRead = (chapterId: string) => {
    if (user) {
      courseService.trackProgress({
        user_id: user.id,
        course_id: id!,
        chapter_id: chapterId,
        progress_type: 'chapter_read'
      });
    }
  };

  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mb-4 mt-6">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold mb-3 mt-5">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium mb-2 mt-4">{line.substring(4)}</h3>;
      } else if (line.startsWith('```')) {
        return null; // Handle code blocks separately
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="mb-2 leading-relaxed">{line}</p>;
      }
    });
  };

  if (isLoading) {
    return <LoadingOverlay isLoading={true} message="Loading course content..." />;
  }

  if (!course) {
    return (
      <Container>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Course not found</h2>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/courses">
            <Button>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <CourseLayout 
      courseTitle={course.title}
      chapterName="Course Overview"
      contentSummary={course.summary || ''}
      progress={course.content?.progress || 0}
    >
      <Container>
        <div className="mb-6">
          <Link to="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Courses
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary">{course.difficulty}</Badge>
                <Badge variant="outline">{course.purpose.replace('_', ' ')}</Badge>
                <span className="text-sm text-muted-foreground">
                  {course.content?.progress || 0}% Complete
                </span>
              </div>
              {course.summary && (
                <p className="text-muted-foreground max-w-3xl">{course.summary}</p>
              )}
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chapters" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Chapters ({chapters.length})
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Flashcards ({flashcards.length})
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Quizzes ({mcqs.length})
            </TabsTrigger>
            <TabsTrigger value="qna" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Q&A ({qnas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chapters" className="mt-6">
            {chapters.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No chapters available</h3>
                  <p className="text-muted-foreground">This course doesn't have any chapters yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {chapters.map((chapter) => (
                    <Card key={chapter.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                              {chapter.order_number}
                            </span>
                            {chapter.title}
                          </CardTitle>
                          <Button 
                            size="sm" 
                            onClick={() => markChapterAsRead(chapter.id)}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Complete
                          </Button>
                        </div>
                        {chapter.estimated_reading_time && (
                          <CardDescription>
                            Estimated reading time: {chapter.estimated_reading_time} minutes
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none">
                          {renderMarkdown(chapter.content)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="lg:col-span-1">
                  {notebook ? (
                    <NotebookPanel 
                      notebook={{
                        keyConcepts: notebook.key_concepts,
                        analogy: notebook.analogy || '',
                        studyGuide: notebook.study_guide || ''
                      }}
                      mindMap={notebook.mind_map || { root: { name: course.title, children: [] } }}
                      resources={resources}
                      onGenerateContent={generateContent}
                      isGenerating={isGenerating}
                    />
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Learning Notebook</CardTitle>
                        <CardDescription>AI-powered study materials</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center py-6">
                        <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <Button 
                          onClick={() => generateContent('notebook')}
                          disabled={isGenerating.notebook}
                          className="flex items-center gap-2"
                        >
                          {isGenerating.notebook ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          Generate Study Materials
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="flashcards" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Flashcards</h2>
              <Button 
                onClick={() => generateContent('flashcards')}
                disabled={isGenerating.flashcards}
                size="sm"
                className="flex items-center gap-2"
              >
                {isGenerating.flashcards ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Generate More
              </Button>
            </div>
            
            {flashcards.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No flashcards available</h3>
                  <p className="text-muted-foreground mb-4">Generate flashcards to start studying!</p>
                  <Button 
                    onClick={() => generateContent('flashcards')}
                    disabled={isGenerating.flashcards}
                  >
                    {isGenerating.flashcards ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Generate Flashcards
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flashcards.map((flashcard) => (
                  <Card key={flashcard.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="min-h-[120px]">
                        <p className="font-medium mb-4">{flashcard.question}</p>
                        {showAnswer[flashcard.id] && (
                          <div className="border-t pt-4 text-sm text-muted-foreground">
                            {flashcard.answer}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleAnswer(flashcard.id)}
                        className="w-full mt-4"
                      >
                        {showAnswer[flashcard.id] ? 'Hide Answer' : 'Show Answer'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quizzes" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Multiple Choice Questions</h2>
              <Button 
                onClick={() => generateContent('mcqs')}
                disabled={isGenerating.mcqs}
                size="sm"
                className="flex items-center gap-2"
              >
                {isGenerating.mcqs ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Generate More
              </Button>
            </div>
            
            {mcqs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Layout className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No quizzes available</h3>
                  <p className="text-muted-foreground mb-4">Generate quiz questions to test your knowledge!</p>
                  <Button 
                    onClick={() => generateContent('mcqs')}
                    disabled={isGenerating.mcqs}
                  >
                    {isGenerating.mcqs ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Generate Quizzes
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {mcqs.map((mcq, index) => (
                  <Card key={mcq.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <CardDescription>{mcq.question}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {mcq.options.map((option, optIndex) => {
                          const isSelected = selectedAnswers[mcq.id] === option;
                          const isCorrect = option === mcq.correct_answer;
                          const showResult = selectedAnswers[mcq.id];
                          
                          return (
                            <Button
                              key={optIndex}
                              variant={
                                showResult
                                  ? isCorrect
                                    ? "default"
                                    : isSelected
                                    ? "destructive"
                                    : "outline"
                                  : isSelected
                                  ? "secondary"
                                  : "outline"
                              }
                              className="w-full justify-start h-auto p-3"
                              onClick={() => handleSelectAnswer(mcq.id, option)}
                              disabled={!!selectedAnswers[mcq.id]}
                            >
                              <span className="font-medium mr-2">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              {option}
                              {showResult && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 ml-auto" />
                              )}
                            </Button>
                          );
                        })}
                      </div>
                      
                      {selectedAnswers[mcq.id] && mcq.explanation && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Explanation:</p>
                          <p className="text-sm text-muted-foreground">{mcq.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="qna" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Questions & Answers</h2>
              <Button 
                onClick={() => generateContent('qnas')}
                disabled={isGenerating.qnas}
                size="sm"
                className="flex items-center gap-2"
              >
                {isGenerating.qnas ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Generate More
              </Button>
            </div>
            
            {qnas.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Q&A available</h3>
                  <p className="text-muted-foreground mb-4">Generate questions and answers for deeper understanding!</p>
                  <Button 
                    onClick={() => generateContent('qnas')}
                    disabled={isGenerating.qnas}
                  >
                    {isGenerating.qnas ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Generate Q&A
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {qnas.map((qna, index) => (
                  <AccordionItem key={qna.id} value={qna.id}>
                    <AccordionTrigger className="text-left">
                      <span className="font-medium">Q{index + 1}: {qna.question}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-sm max-w-none pt-2">
                        {qna.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>
        </Tabs>
      </Container>
    </CourseLayout>
  );
};

export default CourseDetail;