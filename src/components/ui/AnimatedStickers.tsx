import { cn } from "@/lib/utils";

interface StickerProps {
  className?: string;
}

export const FloatingBrain = ({ className }: StickerProps) => (
  <div className={cn("animate-bounce", className)}>
    <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow-lg">
      <defs>
        <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary-foreground))" />
        </linearGradient>
      </defs>
      <g className="animate-pulse">
        <path
          d="M60 20c-15 0-25 8-30 20-3 8-2 15 2 22 5 10 12 18 20 25 3 2 6 3 8 3s5-1 8-3c8-7 15-15 20-25 4-7 5-14 2-22-5-12-15-20-30-20z"
          fill="url(#brainGrad)"
          className="animate-pulse"
        />
        <circle cx="45" cy="45" r="3" fill="hsl(var(--background))" className="animate-ping" />
        <circle cx="75" cy="45" r="3" fill="hsl(var(--background))" className="animate-ping" />
      </g>
    </svg>
  </div>
);

export const FloatingRocket = ({ className }: StickerProps) => (
  <div className={cn("animate-bounce", className)} style={{ animationDelay: '1s' }}>
    <svg width="100" height="100" viewBox="0 0 100 100" className="drop-shadow-lg">
      <defs>
        <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--secondary))" />
          <stop offset="100%" stopColor="hsl(var(--secondary-foreground))" />
        </linearGradient>
      </defs>
      <g className="animate-pulse">
        <path
          d="M50 10l-8 30h16l-8-30z"
          fill="url(#rocketGrad)"
        />
        <rect x="42" y="35" width="16" height="25" rx="3" fill="url(#rocketGrad)" />
        <path
          d="M35 50l7 10h16l7-10h-30z"
          fill="hsl(var(--accent))"
        />
        <circle cx="50" cy="75" r="8" fill="hsl(var(--destructive))" className="animate-pulse" />
        <circle cx="50" cy="75" r="4" fill="hsl(var(--destructive-foreground))" />
      </g>
    </svg>
  </div>
);

export const FloatingBook = ({ className }: StickerProps) => (
  <div className={cn("animate-bounce", className)} style={{ animationDelay: '2s' }}>
    <svg width="90" height="90" viewBox="0 0 90 90" className="drop-shadow-lg">
      <defs>
        <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--accent))" />
          <stop offset="100%" stopColor="hsl(var(--accent-foreground))" />
        </linearGradient>
      </defs>
      <g className="animate-pulse">
        <rect x="20" y="15" width="50" height="60" rx="5" fill="url(#bookGrad)" />
        <rect x="25" y="25" width="40" height="3" rx="1" fill="hsl(var(--muted))" />
        <rect x="25" y="35" width="35" height="2" rx="1" fill="hsl(var(--muted))" />
        <rect x="25" y="42" width="30" height="2" rx="1" fill="hsl(var(--muted))" />
        <rect x="25" y="49" width="38" height="2" rx="1" fill="hsl(var(--muted))" />
      </g>
    </svg>
  </div>
);

export const FloatingGear = ({ className }: StickerProps) => (
  <div className={cn("animate-spin", className)} style={{ animationDuration: '8s' }}>
    <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-lg">
      <defs>
        <linearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary)/0.7)" />
        </linearGradient>
      </defs>
      <path
        d="M40 10l4 8h8l-2 6 6 4-4 6 4 6-6 4 2 6h-8l-4 8-4-8h-8l2-6-6-4 4-6-4-6 6-4-2-6h8l4-8z"
        fill="url(#gearGrad)"
      />
      <circle cx="40" cy="40" r="12" fill="hsl(var(--background))" />
      <circle cx="40" cy="40" r="6" fill="url(#gearGrad)" />
    </svg>
  </div>
);

export const StudySticker = ({ className }: StickerProps) => (
  <div className={cn("animate-pulse", className)}>
    <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-xl">
      <defs>
        <linearGradient id="studyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="50%" stopColor="hsl(var(--secondary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
      
      {/* Person studying */}
      <g className="animate-bounce" style={{ animationDuration: '3s' }}>
        {/* Head */}
        <circle cx="100" cy="60" r="20" fill="hsl(var(--muted-foreground))" />
        
        {/* Body */}
        <rect x="85" y="75" width="30" height="40" rx="5" fill="url(#studyGrad)" />
        
        {/* Laptop */}
        <rect x="70" y="110" width="60" height="30" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
        <rect x="75" y="115" width="50" height="20" rx="2" fill="hsl(var(--primary))" className="animate-pulse" />
        
        {/* Books */}
        <rect x="140" y="120" width="15" height="20" rx="2" fill="hsl(var(--secondary))" />
        <rect x="157" y="115" width="15" height="25" rx="2" fill="hsl(var(--accent))" />
        
        {/* Floating ideas */}
        <circle cx="130" cy="40" r="5" fill="hsl(var(--primary))" className="animate-ping" />
        <circle cx="145" cy="50" r="3" fill="hsl(var(--secondary))" className="animate-ping" style={{ animationDelay: '0.5s' }} />
        <circle cx="160" cy="35" r="4" fill="hsl(var(--accent))" className="animate-ping" style={{ animationDelay: '1s' }} />
      </g>
    </svg>
  </div>
);

export const InterviewSticker = ({ className }: StickerProps) => (
  <div className={cn("", className)}>
    <svg width="180" height="180" viewBox="0 0 180 180" className="drop-shadow-xl">
      <defs>
        <linearGradient id="interviewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary-foreground))" />
        </linearGradient>
      </defs>
      
      {/* Interview scene */}
      <g className="animate-pulse">
        {/* Two people */}
        <circle cx="60" cy="50" r="15" fill="hsl(var(--muted-foreground))" />
        <rect x="50" y="60" width="20" height="30" rx="3" fill="url(#interviewGrad)" />
        
        <circle cx="120" cy="50" r="15" fill="hsl(var(--muted-foreground))" />
        <rect x="110" y="60" width="20" height="30" rx="3" fill="hsl(var(--secondary))" />
        
        {/* Table */}
        <rect x="40" y="85" width="100" height="8" rx="4" fill="hsl(var(--card))" />
        
        {/* Speech bubbles */}
        <circle cx="80" cy="30" r="12" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="2" className="animate-bounce" />
        <text x="80" y="35" textAnchor="middle" fontSize="10" fill="hsl(var(--foreground))">?</text>
        
        <circle cx="100" cy="25" r="8" fill="hsl(var(--primary))" className="animate-ping" />
      </g>
    </svg>
  </div>
);