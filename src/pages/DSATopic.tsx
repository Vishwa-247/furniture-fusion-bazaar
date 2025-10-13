import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Container from "@/components/ui/Container";
import { Progress } from "@/components/ui/progress";
import { dsaTopics } from "@/data/dsaProblems";
import { CheckCircle2, ChevronLeft, Circle, ExternalLink, Star } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import InlineFeedback from "@/components/course/InlineFeedback";
import RouteFilters from "@/components/dsa/RouteFilters";
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { dsaService } from "@/api/services/dsaService";
import { toast } from "sonner";

const DSATopic = () => {
  const { topicId } = useParams();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, favorites } = useFavorites();
  const topic = dsaTopics.find(t => t.id === topicId);
  const [completedProblems, setCompletedProblems] = useState<Set<string>>(new Set());
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [filters, setFilters] = useState({ difficulty: [] });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Topic not found</h1>
          <Link to="/dsa-sheet">
            <Button>Back to DSA Sheet</Button>
          </Link>
        </div>
      </div>
    );
  }

  const toggleProblem = useCallback((problemName: string) => {
    const isCurrentlyCompleted = completedProblems.has(problemName);

    setCompletedProblems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(problemName)) {
        newSet.delete(problemName);
      } else {
        newSet.add(problemName);
      }
      return newSet;
    });

    // Show feedback form when marking as completed (not when unchecking)
    if (!isCurrentlyCompleted) {
      setExpandedFeedback(problemName);
    }
  }, [completedProblems]);

  // Filter problems based on difficulty and favorites
  const filteredProblems = useMemo(() => {
    if (!topic) return [];
    
    let problems = topic.problems;
    
    // Filter by difficulty
    if (filters.difficulty.length > 0) {
      problems = problems.filter(problem => 
        filters.difficulty.includes(problem.difficulty || 'Medium')
      );
    }
    
    // Filter by favorites
    if (showFavoritesOnly) {
      problems = problems.filter(problem => 
        isFavorite('problem', problem.name)
      );
    }
    
    return problems;
  }, [topic, filters, isFavorite, showFavoritesOnly]);

  const progressPercentage = topic ? (completedProblems.size / topic.problems.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Container className="py-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb with Back Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/dsa-sheet" className="hover:text-foreground transition-colors">
                Ultimate DSA Sheet
              </Link>
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span className="text-foreground">{topic.title}</span>
            </div>
            <Link to="/dsa-sheet">
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-4xl">
              {topic.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {topic.title}
              </h1>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm">
                  {completedProblems.size}/{topic.problems.length} solved
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  {filteredProblems.length} problems shown
                </Badge>
                <div className="flex-1 max-w-xs">
                  <Progress value={progressPercentage} className="h-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters - Positioned at top */}
          <RouteFilters
            filters={filters}
            onFiltersChange={setFilters}
            favorites={favorites.problems}
            onToggleFavorite={(problemName) => toggleFavorite('problem', problemName)}
            showFavoritesOnly={showFavoritesOnly}
            onShowFavoritesChange={setShowFavoritesOnly}
          />

          {/* Problems List */}
          <div className="space-y-3">
            {filteredProblems.map((problem, index) => {
                  const isCompleted = completedProblems.has(problem.name);
                  const isProblemFavorite = isFavorite('problem', problem.name);
                  return (
                    <Card 
                      key={`${topic.id}-${index}`}
                      className={`group hover:shadow-md transition-all duration-200 ${
                        isCompleted ? 'bg-primary/5 border-primary/20' : 'hover:border-primary/20'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleProblem(problem.name)}
                            className="transition-colors hover:scale-110"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-primary" />
                            ) : (
                              <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-lg font-medium transition-colors ${
                                isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                              }`}>
                                {problem.name}
                              </h3>
                              {problem.difficulty && (
                                <Badge 
                                  className={`text-xs ${
                                    problem.difficulty === 'Easy' ? 'badge-easy' : 
                                    problem.difficulty === 'Medium' ? 'badge-medium' : 
                                    'badge-hard'
                                  }`}
                                >
                                  {problem.difficulty}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleFavorite('problem', problem.name)}
                              className="transition-colors hover:scale-110"
                            >
                              <Star 
                                className={`w-5 h-5 ${
                                  isProblemFavorite 
                                    ? 'text-yellow-500 fill-yellow-500' 
                                    : 'text-muted-foreground hover:text-yellow-500'
                                }`} 
                              />
                            </button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              asChild
                            >
                              <a
                                href={problem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                Solve
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                  
                  {/* Inline Feedback */}
                  {isCompleted && (
                    <div className="mt-4 px-4 pb-4">
                      <InlineFeedback
                        isExpanded={expandedFeedback === problem.name}
                        onToggle={() => setExpandedFeedback(expandedFeedback === problem.name ? null : problem.name)}
                        problemName={problem.name}
                        difficulty="Medium"
                        company={topic.title}
                        onSubmit={() => setExpandedFeedback(null)}
                      />
                    </div>
                  )}
                </Card>
                );
              })}
            </div>

          {/* Back Button */}
          <div className="mt-12 text-center">
            <Link to="/dsa-sheet">
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back to DSA Sheet
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default DSATopic;
