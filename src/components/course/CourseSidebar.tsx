import { ChevronDown, ChevronRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Chapter {
  id: string;
  title: string;
  order_number: number;
  level?: string;
}

interface CourseSidebarProps {
  chapters: Chapter[];
  currentChapterId?: string;
  onChapterSelect: (chapterId: string) => void;
  progress: number;
  completedChapters: string[];
}

export const CourseSidebar = ({
  chapters,
  currentChapterId,
  onChapterSelect,
  progress,
  completedChapters,
}: CourseSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    intermediate: true,
    advanced: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getChaptersByLevel = (level: string) => {
    return chapters.filter(ch => {
      const chapterLevel = ch.level || 'intermediate';
      return chapterLevel === level;
    });
  };

  const basicChapters = getChaptersByLevel('basic');
  const intermediateChapters = getChaptersByLevel('intermediate');
  const advancedChapters = getChaptersByLevel('advanced');

  const renderChapterList = (chapterList: Chapter[]) => {
    return chapterList.map((chapter) => {
      const isActive = currentChapterId === chapter.id;
      const isCompleted = completedChapters.includes(chapter.id);

      return (
        <Button
          key={chapter.id}
          variant="ghost"
          className={cn(
            'w-full justify-start text-left pl-8 py-2 h-auto',
            isActive && 'bg-primary/10 text-primary font-medium',
            !isActive && 'hover:bg-muted'
          )}
          onClick={() => onChapterSelect(chapter.id)}
        >
          <div className="flex items-center gap-2 flex-1">
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
            ) : (
              <BookOpen className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="text-sm truncate">{chapter.title}</span>
          </div>
        </Button>
      );
    });
  };

  const SectionHeader = ({ title, icon, level, count }: { title: string; icon: string; level: string; count: number }) => {
    const isExpanded = expandedSections[level];
    
    return (
      <Button
        variant="ghost"
        className="w-full justify-start font-semibold mb-1"
        onClick={() => toggleSection(level)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 mr-2" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-2" />
        )}
        <span className="mr-2">{icon}</span>
        <span>{title}</span>
        <span className="ml-auto text-xs text-muted-foreground">({count})</span>
      </Button>
    );
  };

  return (
    <div className="w-64 border-r border-border bg-card h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Course Progress</h3>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">{Math.round(progress)}% Complete</p>
      </div>

      <div className="p-2">
        {basicChapters.length > 0 && (
          <div className="mb-2">
            <SectionHeader title="Basics" icon="📘" level="basic" count={basicChapters.length} />
            {expandedSections.basic && (
              <div className="space-y-1">
                {renderChapterList(basicChapters)}
              </div>
            )}
          </div>
        )}

        {intermediateChapters.length > 0 && (
          <div className="mb-2">
            <SectionHeader title="Intermediate" icon="📗" level="intermediate" count={intermediateChapters.length} />
            {expandedSections.intermediate && (
              <div className="space-y-1">
                {renderChapterList(intermediateChapters)}
              </div>
            )}
          </div>
        )}

        {advancedChapters.length > 0 && (
          <div className="mb-2">
            <SectionHeader title="Advanced" icon="📕" level="advanced" count={advancedChapters.length} />
            {expandedSections.advanced && (
              <div className="space-y-1">
                {renderChapterList(advancedChapters)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
