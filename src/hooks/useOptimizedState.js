import { useState, useCallback, useMemo, useRef } from 'react';

// 최적화된 상태 관리 훅
export const useOptimizedState = (initialState) => {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);
  
  // 상태 업데이트 시 ref도 함께 업데이트
  const optimizedSetState = useCallback((newState) => {
    if (typeof newState === 'function') {
      setState(prevState => {
        const updatedState = newState(prevState);
        stateRef.current = updatedState;
        return updatedState;
      });
    } else {
      stateRef.current = newState;
      setState(newState);
    }
  }, []);

  return [state, optimizedSetState, stateRef];
};

// 디바운스 훅
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef(null);

  useMemo(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};

// 메모이즈된 계산 훅
export const useMemoizedCalculation = (calculator, dependencies) => {
  return useMemo(() => {
    try {
      return calculator();
    } catch (error) {
      console.warn('계산 중 오류 발생:', error);
      return null;
    }
  }, dependencies);
};

// 최적화된 이벤트 핸들러 훅
export const useOptimizedHandlers = (handlers) => {
  return useMemo(() => {
    const optimizedHandlers = {};
    
    Object.keys(handlers).forEach(key => {
      optimizedHandlers[key] = useCallback(handlers[key], []);
    });
    
    return optimizedHandlers;
  }, [handlers]);
};

// 컴포넌트 마운트 상태 추적 훅
export const useMountedState = () => {
  const mountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  const getMountedState = useCallback(() => mountedRef.current, []);

  useMemo(() => {
    mountedRef.current = true;
    setIsMounted(true);
    
    return () => {
      mountedRef.current = false;
      setIsMounted(false);
    };
  }, []);

  return [isMounted, getMountedState];
};

export default {
  useOptimizedState,
  useDebounce,
  useMemoizedCalculation,
  useOptimizedHandlers,
  useMountedState
}; 