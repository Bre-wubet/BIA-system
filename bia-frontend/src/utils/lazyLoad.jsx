import React, { Suspense } from 'react';

/**
 * Loading component to display while lazy-loaded components are being loaded
 */
export const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

/**
 * Higher-order component that wraps a component with Suspense and lazy loading
 * @param {Function} importFunc - Dynamic import function that returns a promise
 * @returns {React.ReactNode} - Lazy-loaded component wrapped in Suspense
 */
export const lazyLoad = (importFunc) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Creates a lazy-loaded component with a custom loading fallback
 * @param {Function} importFunc - Dynamic import function that returns a promise
 * @param {React.ReactNode} fallback - Custom fallback component to display while loading
 * @returns {React.ReactNode} - Lazy-loaded component with custom fallback
 */
export const lazyLoadWithCustomFallback = (importFunc, fallback) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={fallback || <LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};