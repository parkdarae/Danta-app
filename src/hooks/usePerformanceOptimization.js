import { useCallback, useRef, useEffect, useMemo } from 'react';

// 성능 최적화 관련 훅들
export const usePerformanceOptimization = () => {
  const cache = useRef(new Map());
  const debounceTimers = useRef(new Map());

  // 메모이제이션 함수 (일반 함수로 변경)
  const memoizeCalculation = useCallback((fn, deps, key) => {
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
  }, []);

  // 디바운싱 함수
  const debounce = useCallback((fn, delay, key = 'default') => {
    return (...args) => {
      if (debounceTimers.current.has(key)) {
        clearTimeout(debounceTimers.current.get(key));
      }
      
      const timer = setTimeout(() => {
        fn(...args);
        debounceTimers.current.delete(key);
      }, delay);
      
      debounceTimers.current.set(key, timer);
    };
  }, []);

  // 스로틀링 함수
  const throttle = useCallback((fn, delay) => {
    let lastRun = Date.now() - delay;
    
    return (...args) => {
      if (Date.now() - lastRun >= delay) {
        fn(...args);
        lastRun = Date.now();
      }
    };
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 타이머 정리
      debounceTimers.current.forEach(timer => clearTimeout(timer));
      debounceTimers.current.clear();
      cache.current.clear();
    };
  }, []);

  return {
    memoizeCalculation,
    debounce,
    throttle
  };
};

// 비동기 작업 최적화 훅
export const useAsyncOptimization = () => {
  const abortControllers = useRef(new Map());

  const executeWithAbort = useCallback(async (fn, key = 'default') => {
    // 이전 작업 취소
    if (abortControllers.current.has(key)) {
      abortControllers.current.get(key).abort();
    }

    // 새 AbortController 생성
    const controller = new AbortController();
    abortControllers.current.set(key, controller);

    try {
      const result = await fn(controller.signal);
      abortControllers.current.delete(key);
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('작업이 취소되었습니다');
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
      
      // 다음 배치 전 잠시 대기 (UI 블록킹 방지)
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return results;
  }, []);

  // 정리
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

// 메모리 모니터링 훅
export const useMemoryMonitoring = () => {
  const memoryUsage = useRef({
    used: 0,
    total: 0,
    peak: 0,
    timestamp: Date.now()
  });

  const trackMemoryUsage = useCallback(() => {
    if (performance.memory) {
      const current = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      memoryUsage.current = {
        used: current,
        total: performance.memory.totalJSHeapSize / 1024 / 1024,
        peak: Math.max(memoryUsage.current.peak, current),
        timestamp: Date.now()
      };
    }
    return memoryUsage.current;
  }, []);

  const getMemoryReport = useCallback(() => {
    const current = trackMemoryUsage();
    return {
      ...current,
      isHigh: current.used > 100, // 100MB 이상
      isCritical: current.used > 500 // 500MB 이상
    };
  }, [trackMemoryUsage]);

  useEffect(() => {
    const interval = setInterval(trackMemoryUsage, 5000); // 5초마다 체크
    return () => clearInterval(interval);
  }, [trackMemoryUsage]);

  return {
    trackMemoryUsage,
    getMemoryReport,
    currentUsage: memoryUsage.current
  };
}; 