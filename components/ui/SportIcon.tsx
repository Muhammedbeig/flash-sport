import { cn } from "@/lib/utils";

type SportIconProps = {
  sport: string;
  className?: string;
};

export const SportIcon = ({ sport, className }: SportIconProps) => {
  const baseClasses = cn("w-5 h-5 shrink-0", className);

  switch (sport) {
    case "football": // Soccer Ball - Pentagon pattern
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClasses}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2 L15 8 L21 8 L17 13 L19 20 L12 15 L5 20 L7 13 L3 8 L9 8 Z" fill="currentColor" opacity="0.2"/>
          <path d="M12 2v4M15 8l3.5-2.5M21 8h-4M17 13l2.8 2.8M19 20l-2.5-3.5M12 15v5M5 20l2.5-3.5M7 13L4.2 15.8M3 8h4M9 8L5.5 5.5"/>
        </svg>
      );
    
    case "basketball": // Basketball with seams
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClasses}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2 Q6 12 12 22"/>
          <path d="M12 2 Q18 12 12 22"/>
          <path d="M2 12 Q12 6 22 12"/>
          <path d="M2 12 Q12 18 22 12"/>
        </svg>
      );
    
    case "nfl": // American Football with laces
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={baseClasses}>
          <ellipse cx="12" cy="12" rx="10" ry="6.5"/>
          <line x1="12" y1="8" x2="12" y2="16" stroke="white" strokeWidth="1.5"/>
          <line x1="9.5" y1="10" x2="14.5" y2="10" stroke="white" strokeWidth="1.2"/>
          <line x1="9.5" y1="12" x2="14.5" y2="12" stroke="white" strokeWidth="1.2"/>
          <line x1="9.5" y1="14" x2="14.5" y2="14" stroke="white" strokeWidth="1.2"/>
        </svg>
      );
    
    case "baseball": // Baseball with stitches
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClasses}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M7 8 Q9 10 9 12 Q9 14 7 16" strokeLinecap="round"/>
          <path d="M17 8 Q15 10 15 12 Q15 14 17 16" strokeLinecap="round"/>
          <circle cx="7.5" cy="9" r="0.8" fill="currentColor"/>
          <circle cx="8" cy="11" r="0.8" fill="currentColor"/>
          <circle cx="8" cy="13" r="0.8" fill="currentColor"/>
          <circle cx="7.5" cy="15" r="0.8" fill="currentColor"/>
          <circle cx="16.5" cy="9" r="0.8" fill="currentColor"/>
          <circle cx="16" cy="11" r="0.8" fill="currentColor"/>
          <circle cx="16" cy="13" r="0.8" fill="currentColor"/>
          <circle cx="16.5" cy="15" r="0.8" fill="currentColor"/>
        </svg>
      );
    
    case "hockey": // Hockey stick and puck
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={baseClasses}>
          <path d="M4 18 L4 22 L10 22 L10 18 Z"/>
          <rect x="4" y="14" width="2" height="4"/>
          <path d="M5 14 L5 4 L7 4 L9 10 L18 4 L20 5 L10 12 L6 14 Z"/>
          <ellipse cx="19" cy="20" rx="3" ry="1.5"/>
        </svg>
      );
    
    case "handball": // Handball with hexagon pattern
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClasses}>
          <circle cx="12" cy="12" r="10"/>
          <polygon points="12,7 15,9 15,13 12,15 9,13 9,9" fill="currentColor" opacity="0.3"/>
          <line x1="12" y1="2" x2="12" y2="7"/>
          <line x1="12" y1="15" x2="12" y2="22"/>
          <line x1="5" y1="6.5" x2="9" y2="9"/>
          <line x1="15" y1="13" x2="19" y2="15.5"/>
          <line x1="19" y1="6.5" x2="15" y2="9"/>
          <line x1="9" y1="13" x2="5" y2="15.5"/>
        </svg>
      );
    
    case "rugby": // Rugby ball
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={baseClasses}>
          <ellipse cx="12" cy="12" rx="10" ry="6"/>
          <line x1="12" y1="6" x2="12" y2="18" stroke="white" strokeWidth="1.5"/>
          <line x1="9" y1="9" x2="9" y2="15" stroke="white" strokeWidth="1"/>
          <line x1="15" y1="9" x2="15" y2="15" stroke="white" strokeWidth="1"/>
          <line x1="6" y1="11" x2="6" y2="13" stroke="white" strokeWidth="1"/>
          <line x1="18" y1="11" x2="18" y2="13" stroke="white" strokeWidth="1"/>
        </svg>
      );
    
    case "volleyball": // Volleyball with panels
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClasses}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2 C7 5, 5 7, 2 12"/>
          <path d="M12 2 C17 5, 19 7, 22 12"/>
          <path d="M2 12 C5 17, 7 19, 12 22"/>
          <path d="M22 12 C19 17, 17 19, 12 22"/>
          <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.2"/>
        </svg>
      );
    
    case "tennis": // Tennis racket with strings
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClasses}>
          <ellipse cx="9" cy="8" rx="5.5" ry="6.5"/>
          <line x1="13" y1="13" x2="20" y2="20" strokeWidth="2"/>
          <circle cx="20" cy="20" r="1.5" fill="currentColor"/>
          <line x1="6" y1="8" x2="12" y2="8" strokeWidth="0.5"/>
          <line x1="9" y1="4" x2="9" y2="12" strokeWidth="0.5"/>
          <line x1="6" y1="6" x2="12" y2="6" strokeWidth="0.5"/>
          <line x1="6" y1="10" x2="12" y2="10" strokeWidth="0.5"/>
          <line x1="7" y1="4" x2="7" y2="12" strokeWidth="0.5"/>
          <line x1="11" y1="4" x2="11" y2="12" strokeWidth="0.5"/>
        </svg>
      );
    
    case "cricket": // Cricket bat and ball
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={baseClasses}>
          <rect x="6" y="2" width="4" height="14" rx="2"/>
          <rect x="7" y="16" width="2" height="6" rx="1"/>
          <circle cx="17" cy="17" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="17" cy="17" r="1.5"/>
          <line x1="14" y1="14" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      );
    
    default: // Generic Sport Icon
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClasses}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2v20M2 12h20"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
      );
  }
};