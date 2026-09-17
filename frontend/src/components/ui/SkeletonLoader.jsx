import React from 'react';

/**
 * Sparkle Skeleton Loader — shimmer with occasional primary-color glint (per DESIGN.md)
 */
export const SkeletonLoader = ({ type = 'card', lines = 3 }) => {
  if (type === 'card') {
    return (
      <div className="glass-card rounded-lg overflow-hidden flex flex-col animate-pulse">
        <div className="shimmer-bg h-48 w-full"></div>
        <div className="p-4 space-y-2">
          <div className="shimmer-bg h-4 w-3/4 rounded-full"></div>
          <div className="shimmer-bg h-3 w-1/2 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`shimmer-bg h-4 rounded-full ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}></div>
        ))}
      </div>
    );
  }

  if (type === 'row') {
    return (
      <div className="flex items-center gap-4 animate-pulse p-4">
        <div className="shimmer-bg w-12 h-12 rounded-xl shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="shimmer-bg h-4 w-3/4 rounded-full"></div>
          <div className="shimmer-bg h-3 w-1/2 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="shimmer-bg h-8 w-full rounded-lg animate-pulse"></div>
  );
};

export default SkeletonLoader;
