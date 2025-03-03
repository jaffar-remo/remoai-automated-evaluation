
import { cn } from '@/lib/utils';
import React from 'react';

interface AnimatedContainerProps {
  children: React.ReactNode;
  isVisible: boolean;
  animateIn?: string;
  animateOut?: string;
  className?: string;
  onAnimationComplete?: () => void;
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  isVisible,
  animateIn = 'animate-fade-in',
  animateOut = 'animate-fade-out',
  className,
  onAnimationComplete,
}) => {
  const [shouldRender, setShouldRender] = React.useState(isVisible);

  React.useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
        if (onAnimationComplete) onAnimationComplete();
      }, 300); // Match this to the animation duration
      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationComplete]);

  return (
    shouldRender && (
      <div
        className={cn(
          isVisible ? animateIn : animateOut,
          'transition-all duration-300 ease-in-out',
          className
        )}
      >
        {children}
      </div>
    )
  );
};

export default AnimatedContainer;
