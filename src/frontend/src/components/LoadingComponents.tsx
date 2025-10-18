import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin text-blue-500 ${sizeClasses[size]}`} />
      {text && (
        <span className="ml-2 text-gray-600 font-medium">{text}</span>
      )}
    </div>
  );
};

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div className={`card-enhanced animate-fade-in-up ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="skeleton-avatar"></div>
        <div className="flex-1">
          <div className="skeleton-text mb-2"></div>
          <div className="skeleton-text w-3/4"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton-text"></div>
        <div className="skeleton-text w-5/6"></div>
        <div className="skeleton-text w-4/6"></div>
      </div>
    </div>
  );
};

interface SkeletonCharacterCardProps {
  className?: string;
}

export const SkeletonCharacterCard: React.FC<SkeletonCharacterCardProps> = ({ className = '' }) => {
  return (
    <div className={`character-card animate-fade-in-up ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="skeleton-avatar"></div>
        <div className="flex-1">
          <div className="skeleton-text mb-2"></div>
          <div className="skeleton-text w-3/4 mb-1"></div>
          <div className="skeleton-text w-1/2"></div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="skeleton-text mb-2"></div>
        <div className="progress-bar h-3">
          <div className="skeleton-text h-full w-1/3"></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="skeleton-text"></div>
        <div className="skeleton-text w-4/5"></div>
        <div className="skeleton-text w-3/5"></div>
      </div>
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  children, 
  text = 'Loading...' 
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
          <LoadingSpinner size="lg" text={text} />
        </div>
      </div>
    </div>
  );
};

interface ProgressSkeletonProps {
  className?: string;
}

export const ProgressSkeleton: React.FC<ProgressSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="skeleton-text w-24"></div>
        <div className="skeleton-text w-12"></div>
      </div>
      <div className="progress-bar h-4">
        <div className="skeleton-text h-full w-2/3"></div>
      </div>
      <div className="skeleton-text w-32"></div>
    </div>
  );
};

interface ActivitySkeletonProps {
  count?: number;
  className?: string;
}

export const ActivitySkeleton: React.FC<ActivitySkeletonProps> = ({ 
  count = 3, 
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="skeleton-avatar h-8 w-8"></div>
          <div className="flex-1">
            <div className="skeleton-text mb-1"></div>
            <div className="skeleton-text w-3/4"></div>
          </div>
          <div className="skeleton-text w-16"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
