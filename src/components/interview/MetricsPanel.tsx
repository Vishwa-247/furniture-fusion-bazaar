import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Eye, MessageSquare } from "lucide-react";
import { CheckCircle, XCircle } from "lucide-react";

interface MetricsPanelProps {
  facialData: {
    confident: number;
    stressed: number;
    nervous: number;
  };
  behaviorData: {
    blink_count: number;
    looking_at_camera: boolean;
    head_pose: { pitch: number; yaw: number; roll: number };
  };
  communicationData: {
    filler_word_count: number;
    words_per_minute: number;
    clarity_score: number;
  };
  isVisible: boolean;
}

const MetricBar = ({ label, value, color }: { label: string; value: number; color: string }) => {
  const colorClasses = {
    green: "bg-green-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    blue: "bg-blue-500"
  };
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
};

const MetricsPanel = ({ facialData, behaviorData, communicationData, isVisible }: MetricsPanelProps) => {
  if (!isVisible) return null;
  
  return (
    <Card className="w-64 shadow-lg border-border/50 bg-card/95 backdrop-blur">
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Live Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        {/* Facial Expression */}
        <div>
          <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
            <span>😊</span> Facial Expression
          </div>
          <div className="space-y-2">
            <MetricBar label="Confident" value={facialData.confident} color="green" />
            <MetricBar label="Stressed" value={facialData.stressed} color="amber" />
            <MetricBar label="Nervous" value={facialData.nervous} color="red" />
          </div>
        </div>
        
        {/* Behavior */}
        <div className="border-t border-border/50 pt-3">
          <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Behavior
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px]">Blinks</span>
              <span className="font-medium">{behaviorData.blink_count}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px]">Camera</span>
              <div className="flex items-center gap-1">
                {behaviorData.looking_at_camera ? (
                  <><CheckCircle className="h-3 w-3 text-green-500" /> <span className="text-green-500 text-[10px]">Yes</span></>
                ) : (
                  <><XCircle className="h-3 w-3 text-red-500" /> <span className="text-red-500 text-[10px]">No</span></>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Communication */}
        <div className="border-t border-border/50 pt-3">
          <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Communication
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Filler words</span>
              <span className="font-medium">{communicationData.filler_word_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pace</span>
              <span className="font-medium">{communicationData.words_per_minute} WPM</span>
            </div>
            <MetricBar label="Clarity" value={communicationData.clarity_score / 100} color="blue" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsPanel;
