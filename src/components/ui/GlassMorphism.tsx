
import { cn } from "@/lib/utils";

interface GlassMorphismProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "light" | "medium" | "heavy";
  border?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  shadow?: boolean;
}

const GlassMorphism = ({
  children,
  className,
  intensity = "medium",
  border = true,
  rounded = "lg",
  shadow = true,
}: GlassMorphismProps) => {
  const intensityClasses = {
    light: "bg-white/20 dark:bg-black/10 backdrop-blur-sm",
    medium: "bg-white/30 dark:bg-black/20 backdrop-blur-md",
    heavy: "bg-white/50 dark:bg-black/30 backdrop-blur-lg",
  };

  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        intensityClasses[intensity],
        roundedClasses[rounded],
        border && "border border-white/20 dark:border-white/10",
        shadow && "shadow-glass",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassMorphism;
