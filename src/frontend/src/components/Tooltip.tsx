import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollTop - tooltipRect.height - 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollTop + 8;
        left = triggerRect.left + scrollLeft + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollTop + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollLeft - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollTop + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollLeft + 8;
        break;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';
    switch (position) {
      case 'top':
        return `${baseClasses} top-full left-1/2 -translate-x-1/2 -translate-y-1/2`;
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 -translate-x-1/2 translate-y-1/2`;
      case 'left':
        return `${baseClasses} left-full top-1/2 -translate-y-1/2 -translate-x-1/2`;
      case 'right':
        return `${baseClasses} right-full top-1/2 -translate-y-1/2 translate-x-1/2`;
      default:
        return baseClasses;
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`tooltip ${className}`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            opacity: isVisible ? 1 : 0,
          }}
        >
          <div className={getArrowClasses()}></div>
          <div className="relative z-10">
            {typeof content === 'string' ? (
              <span className="text-sm font-medium">{content}</span>
            ) : (
              content
            )}
          </div>
        </div>
      )}
    </>
  );
};

interface InfoTooltipProps {
  content: string | React.ReactNode;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, className = '' }) => {
  return (
    <Tooltip content={content} className={className}>
      <div className="inline-flex items-center justify-center w-4 h-4 bg-blue-100 text-blue-600 rounded-full cursor-help hover:bg-blue-200 transition-colors">
        <span className="text-xs font-bold">?</span>
      </div>
    </Tooltip>
  );
};

interface CharacterTooltipProps {
  character: any;
  children: React.ReactNode;
}

export const CharacterTooltip: React.FC<CharacterTooltipProps> = ({ character, children }) => {
  const tooltipContent = (
    <div className="p-3 max-w-xs">
      <div className="font-semibold text-white mb-2">{character.characterName}</div>
      <div className="space-y-1 text-sm text-gray-200">
        <div>Level {character.level} {character.className}</div>
        <div>{character.race} • {character.realm}</div>
        <div className="pt-2 border-t border-gray-600">
          <div className="text-green-400">
            {character.activities.filter((a: any) => a.completed).length}/{character.activities.length} activities completed
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} position="top" delay={100}>
      {children}
    </Tooltip>
  );
};

export default Tooltip;
