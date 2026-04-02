import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Film className={cn("text-primary", iconSizes[size])} />
      <span className={cn("font-bold tracking-tight", sizeClasses[size])}>
        <span className="text-primary">Cine</span>
        <span className="text-foreground">Match</span>
      </span>
    </div>
  );
}
