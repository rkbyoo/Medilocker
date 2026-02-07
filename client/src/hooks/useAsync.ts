/**
 * useAsync Hook
 * Generic hook for handling async operations with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import type { AsyncState } from '@/types';

type AsyncFunction<T> = () => Promise<T>;

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useAsync = <T>(
  asyncFunction: AsyncFunction<T>,
  options: UseAsyncOptions = {}
) => {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<AsyncState<T>>({
    isLoading: immediate,
    data: undefined,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await asyncFunction();
      setState({ isLoading: false, data, error: null });
      onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ isLoading: false, data: undefined, error: errorMessage });
      onError?.(error as Error);
      throw error;
    }
  }, [asyncFunction, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    reset: () => setState({ isLoading: false, data: undefined, error: null }),
  };
};