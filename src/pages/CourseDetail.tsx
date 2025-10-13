import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ChevronLeft } from 'lucide-react';
import Container from '@/components/ui/Container';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [chapters, setChapters] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [audio, setAudio] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [mcqs, setMCQs] = useState<any[]>([]);
  const [wordGames, setWordGames] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    loadCourse();
    subscribeToProgress();
  }, [id]);

  const loadCourse = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      if (courseData.status === 'published') {
        await loadCourseContent();
      }
    } catch (error: any) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseContent = async () => {
    try {
      const [chaptersRes, articlesRes, audioRes, flashcardsRes, mcqsRes, wordGamesRes, suggestionsRes] = await Promise.all([
        supabase.from('course_chapters').select('*').eq('course_id', id).order('order_number'),
        (supabase as any).from('course_articles').select('*').eq('course_id', id),
        (supabase as any).from('course_audio').select('*').eq('course_id', id),
        supabase.from('course_flashcards').select('*').eq('course_id', id),
        supabase.from('course_mcqs').select('*').eq('course_id', id),
        (supabase as any).from('course_word_games').select('*').eq('course_id', id),
        (supabase as any).from('course_suggestions').select('*').eq('course_id', id).order('relevance_score', { ascending: false })
      ]);

      if (chaptersRes.data) setChapters(chaptersRes.data);
      if (articlesRes.data) setArticles(articlesRes.data);
      if (audioRes.data) setAudio(audioRes.data);
      if (flashcardsRes.data) setFlashcards(flashcardsRes.data);
      if (mcqsRes.data) setMCQs(mcqsRes.data);
      if (wordGamesRes.data) setWordGames(wordGamesRes.data);
      if (suggestionsRes.data) setSuggestions(suggestionsRes.data);
    } catch (error) {
      console.error('Error loading course content:', error);
    }
  };

  const subscribeToProgress = () => {
    const channel = supabase
      .channel('course-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'course_generation_jobs',
          filter: `course_id=eq.${id}`
        },
        (payload) => {
          setProgress(payload.new.progress_percentage);
          setCurrentStep(payload.new.current_step);
          
          if (payload.new.status === 'completed') {
            loadCourse();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleGenerateNewCourse = (topic: string) => {
    navigate('/course-generator', { state: { topic } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (course?.status === 'generating') {
    return (
      <Container className="py-20">
        <Card className="p-8 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Generating Your Course</h2>
          <p className="text-muted-foreground mb-6">{currentStep}</p>
          <Progress value={progress} className="mb-4" />
          <p className="text-sm text-muted-foreground">{progress}% complete</p>
        </Card>
      </Container>
    );
  }

  const deepDive = articles.find(a => a.article_type === 'deep_dive');
  const keyTakeaways = articles.find(a => a.article_type === 'key_takeaways');
  const faq = articles.find(a => a.article_type === 'faq');
  const shortPodcast = audio.find(a => a.audio_type === 'short_podcast');
  const fullLecture = audio.find(a => a.audio_type === 'full_lecture');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Container className="py-10">
        <Link to="/course-generator" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Generator
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{course?.title}</h1>
          <p className="text-muted-foreground">{course?.summary}</p>
        </div>

        <Tabs defaultValue="listen" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="listen">🎙️ Listen</TabsTrigger>
            <TabsTrigger value="read">📚 Read</TabsTrigger>
            <TabsTrigger value="interact">🎮 Interact</TabsTrigger>
            <TabsTrigger value="continue">🚀 Continue</TabsTrigger>
          </TabsList>

          <TabsContent value="listen">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Learn by Listening</h3>
                {shortPodcast && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Short Episode (5 min)</h4>
                    <audio controls className="w-full">
                      <source src={shortPodcast.audio_url} type="audio/mpeg" />
                    </audio>
                  </div>
                )}
                {fullLecture && (
                  <div>
                    <h4 className="font-medium mb-2">Full Lecture (20 min)</h4>
                    <audio controls className="w-full">
                      <source src={fullLecture.audio_url} type="audio/mpeg" />
                    </audio>
                  </div>
                )}
                {!shortPodcast && !fullLecture && (
                  <p className="text-muted-foreground">Audio content not available for this course.</p>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="read">
            <Tabs defaultValue="deep-dive">
              <TabsList>
                <TabsTrigger value="deep-dive">Deep Dive</TabsTrigger>
                <TabsTrigger value="takeaways">Key Takeaways</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>
              <TabsContent value="deep-dive">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{deepDive?.title}</h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{deepDive?.content}</p>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="takeaways">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{keyTakeaways?.title}</h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{keyTakeaways?.content}</p>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="faq">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{faq?.title}</h3>
                  <div className="space-y-4">
                    {faq && JSON.parse(faq.content).map((item: any, idx: number) => (
                      <div key={idx} className="border-b pb-4">
                        <h4 className="font-medium mb-2">{item.question}</h4>
                        <p className="text-muted-foreground">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="interact">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Multiple Choice Quiz</h3>
                <p className="text-muted-foreground mb-4">{mcqs.length} questions available</p>
                {mcqs.length > 0 && (
                  <div className="space-y-4">
                    {mcqs.slice(0, 3).map((mcq: any, idx: number) => (
                      <div key={mcq.id} className="border-b pb-4">
                        <p className="font-medium mb-2">{idx + 1}. {mcq.question}</p>
                        <div className="space-y-2">
                          {mcq.options.map((option: string, optIdx: number) => (
                            <div key={optIdx} className="text-sm text-muted-foreground">
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Flashcards</h3>
                <p className="text-muted-foreground mb-4">{flashcards.length} flashcards</p>
                {flashcards.length > 0 && (
                  <div className="space-y-4">
                    {flashcards.slice(0, 3).map((card: any) => (
                      <div key={card.id} className="border-b pb-4">
                        <p className="font-medium mb-2">{card.question}</p>
                        <p className="text-sm text-muted-foreground">{card.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Word Game</h3>
                <p className="text-muted-foreground mb-4">{wordGames.length} vocabulary terms</p>
                {wordGames.length > 0 && (
                  <div className="space-y-4">
                    {wordGames.slice(0, 3).map((word: any) => (
                      <div key={word.id} className="border-b pb-4">
                        <p className="font-medium mb-2">{word.word}</p>
                        <p className="text-sm text-muted-foreground">{word.definition}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="continue">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Continue Learning</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {suggestions.map((suggestion) => (
                  <Card 
                    key={suggestion.id} 
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleGenerateNewCourse(suggestion.suggestion_topic)}
                  >
                    <h4 className="font-semibold mb-2">{suggestion.suggestion_topic}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{suggestion.suggestion_description}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Generate Course
                    </Button>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
};

export default CourseDetail;
