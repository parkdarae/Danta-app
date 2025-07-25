import { useCallback, useRef, useEffect, useMemo } from 'react';

/**
 * 성능 최적화를 위한 커스텀 훅
 */
export const usePerformanceOptimization = () => {
  const cache = useRef(new Map());
  const debounceTimers = useRef(new Map());

  // 메모이제이션 훅
  const useMemoizedCalculation = useCallback((fn, deps, key) => {
    return useMemo(() => {
      const cacheKey = key || JSON.stringify(deps);
      
      if (cache.current.has(cacheKey)) {
        return cache.current.get(cacheKey);
      }
      
      const result = fn();
      cache.current.set(cacheKey, result);
      
      // 캐시 크기 제한
      if (cache.current.size > 50) {
        const firstKey = cache.current.keys().next().value;
        cache.current.delete(firstKey);
      }
      
      return result;
    }, deps);
  }, []);

  // 디바운싱 함수
  const useDebounce = useCallback((fn, delay, key = 'default') => {
    return useCallback((...args) => {
      if (debounceTimers.current.has(key)) {
        clearTimeout(debounceTimers.current.get(key));
      }
      
      const timer = setTimeout(() => {
        fn(...args);
        debounceTimers.current.delete(key);
      }, delay);
      
      debounceTimers.current.set(key, timer);
    }, [fn, delay, key]);
  }, []);

  // 스로틀링 함수
  const useThrottle = useCallback((fn, delay) => {
    const lastRun = useRef(Date.now() - delay);
    
    return useCallback((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        fn(...args);
        lastRun.current = Date.now();
      }
    }, [fn, delay]);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      debounceTimers.current.forEach(timer => clearTimeout(timer));
      debounceTimers.current.clear();
      cache.current.clear();
    };
  }, []);

  return {
    useMemoizedCalculation,
    useDebounce,
    useThrottle
  };
};

/**
 * 비동기 작업 최적화 훅
 */
export const useAsyncOptimization = () => {
  const abortControllers = useRef(new Map());

  const executeWithAbort = useCallback(async (fn, key = 'default') => {
    // 이전 요청 취소
    if (abortControllers.current.has(key)) {
      abortControllers.current.get(key).abort();
    }

    // 새로운 AbortController 생성
    const controller = new AbortController();
    abortControllers.current.set(key, controller);

    try {
      const result = await fn(controller.signal);
      abortControllers.current.delete(key);
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`요청 취소됨: ${key}`);
        return null;
      }
      abortControllers.current.delete(key);
      throw error;
    }
  }, []);

  // 배치 처리
  const batchProcess = useCallback(async (items, processor, batchSize = 10) => {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      results.push(...batchResults);
      
      // 다음 배치 전에 잠시 대기 (UI 블로킹 방지)
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return results;
  }, []);

  useEffect(() => {
    return () => {
      abortControllers.current.forEach(controller => controller.abort());
      abortControllers.current.clear();
    };
  }, []);

  return {
    executeWithAbort,
    batchProcess
  };
};

/**
 * 메모리 사용량 모니터링 훅
 */
export const useMemoryMonitoring = () => {
  const memoryUsage = useRef({
    peak: 0,
    current: 0,
    history: []
  });

  const trackMemoryUsage = useCallback(() => {
    if (performance.memory) {
      const current = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      
      memoryUsage.current.current = current;
      memoryUsage.current.peak = Math.max(memoryUsage.current.peak, current);
      memoryUsage.current.history.push({
        timestamp: Date.now(),
        usage: current
      });

      // 히스토리 크기 제한
      if (memoryUsage.current.history.length > 100) {
        memoryUsage.current.history.shift();
      }

      return current;
    }
    return null;
  }, []);

  const getMemoryReport = useCallback(() => {
    return {
      current: memoryUsage.current.current,
      peak: memoryUsage.current.peak,
      average: memoryUsage.current.history.reduce((sum, item) => sum + item.usage, 0) / memoryUsage.current.history.length,
      history: memoryUsage.current.history
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(trackMemoryUsage, 5000); // 5초마다 체크
    return () => clearInterval(interval);
  }, [trackMemoryUsage]);

  return {
    trackMemoryUsage,
    getMemoryReport
  };
}; 