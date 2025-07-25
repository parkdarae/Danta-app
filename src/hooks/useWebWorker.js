import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * 웹 워커를 사용하는 React 훅
 */
export const useWebWorker = (workerPath = '/analysis-worker.js') => {
  const workerRef = useRef(null);
  const messageIdRef = useRef(0);
  const pendingMessages = useRef(new Map());
  
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [workerError, setWorkerError] = useState(null);
  const [activeJobs, setActiveJobs] = useState(new Set());

  // 워커 초기화
  useEffect(() => {
    try {
      workerRef.current = new Worker(workerPath);
      
      workerRef.current.onmessage = (event) => {
        const { type, id, result, error, success, progress, phase, data } = event.data;
        
        if (type === 'PROGRESS') {
          // 진행 상황 업데이트
          const pendingMessage = pendingMessages.current.get(id);
          if (pendingMessage && pendingMessage.onProgress) {
            pendingMessage.onProgress({ progress, phase, data });
          }
          return;
        }

        if (type === 'RESULT' || type === 'ERROR') {
          const pendingMessage = pendingMessages.current.get(id);
          
          if (pendingMessage) {
            if (success) {
              pendingMessage.resolve(result);
            } else {
              pendingMessage.reject(new Error(error.message));
            }
            
            // 완료된 작업 정리
            pendingMessages.current.delete(id);
            setActiveJobs(prev => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
          }
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('웹 워커 오류:', error);
        setWorkerError(error);
        setIsWorkerReady(false);
      };

      workerRef.current.onmessageerror = (error) => {
        console.error('웹 워커 메시지 오류:', error);
        setWorkerError(error);
      };

      // 워커 준비 완료
      setIsWorkerReady(true);
      setWorkerError(null);

    } catch (error) {
      console.error('웹 워커 생성 실패:', error);
      setWorkerError(error);
      setIsWorkerReady(false);
    }

    // 정리
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      pendingMessages.current.clear();
      setIsWorkerReady(false);
    };
  }, [workerPath]);

  // 워커에 메시지 전송
  const postMessage = useCallback((type, data, options = {}) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isWorkerReady) {
        reject(new Error('웹 워커가 준비되지 않았습니다'));
        return;
      }

      const id = ++messageIdRef.current;
      
      // 진행 상황 콜백 설정
      const { onProgress, timeout = 30000 } = options;
      
      pendingMessages.current.set(id, {
        resolve,
        reject,
        onProgress,
        timestamp: Date.now()
      });

      // 활성 작업 추가
      setActiveJobs(prev => new Set([...prev, id]));

      // 타임아웃 설정
      const timeoutId = setTimeout(() => {
        const pendingMessage = pendingMessages.current.get(id);
        if (pendingMessage) {
          pendingMessage.reject(new Error('작업 시간 초과'));
          pendingMessages.current.delete(id);
          setActiveJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }
      }, timeout);

      // 메시지 전송
      try {
        workerRef.current.postMessage({
          type,
          id,
          data,
          options: { ...options, onProgress: undefined } // 직렬화 불가능한 함수 제거
        });
      } catch (error) {
        clearTimeout(timeoutId);
        pendingMessages.current.delete(id);
        setActiveJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        reject(error);
      }
    });
  }, [isWorkerReady]);

  // 상관관계 매트릭스 계산
  const calculateCorrelationMatrix = useCallback((data, options = {}) => {
    return postMessage('CORRELATION_MATRIX', data, {
      ...options,
      timeout: 60000 // 1분
    });
  }, [postMessage]);

  // K-means 클러스터링
  const performKMeansClustering = useCallback((data, options = {}) => {
    return postMessage('KMEANS_CLUSTERING', data, {
      ...options,
      timeout: 120000 // 2분
    });
  }, [postMessage]);

  // 최적화 알고리즘
  const performOptimization = useCallback((objective, constraints, initialGuess, options = {}) => {
    return postMessage('OPTIMIZATION', {
      objective: objective.toString(), // 함수를 문자열로 변환
      constraints,
      initialGuess
    }, {
      ...options,
      timeout: 180000 // 3분
    });
  }, [postMessage]);

  // 캐시 통계 조회
  const getCacheStats = useCallback(() => {
    return postMessage('CACHE_STATS', null, { timeout: 5000 });
  }, [postMessage]);

  // 캐시 초기화
  const clearCache = useCallback(() => {
    return postMessage('CLEAR_CACHE', null, { timeout: 5000 });
  }, [postMessage]);

  // 모든 작업 취소
  const cancelAllJobs = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      
      // 새 워커 생성
      setTimeout(() => {
        workerRef.current = new Worker(workerPath);
        setIsWorkerReady(true);
      }, 100);
    }
    
    // 대기 중인 모든 메시지 취소
    pendingMessages.current.forEach((pendingMessage) => {
      pendingMessage.reject(new Error('작업이 취소되었습니다'));
    });
    pendingMessages.current.clear();
    setActiveJobs(new Set());
  }, [workerPath]);

  return {
    // 상태
    isWorkerReady,
    workerError,
    activeJobs: Array.from(activeJobs),
    hasActiveJobs: activeJobs.size > 0,
    
    // 메서드
    calculateCorrelationMatrix,
    performKMeansClustering,
    performOptimization,
    getCacheStats,
    clearCache,
    cancelAllJobs,
    
    // 저수준 API
    postMessage
  };
};

/**
 * 분석 작업을 위한 특화된 웹 워커 훅
 */
export const useAnalysisWorker = () => {
  const webWorker = useWebWorker('/analysis-worker.js');
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  // 분석 진행 상황 추적
  const trackAnalysis = useCallback((analysisId, type, startTime) => {
    setCurrentAnalysis({
      id: analysisId,
      type,
      startTime,
      progress: 0,
      phase: 'starting'
    });
  }, []);

  // 분석 완료 처리
  const completeAnalysis = useCallback((result, error = null) => {
    if (currentAnalysis) {
      const completedAnalysis = {
        ...currentAnalysis,
        endTime: Date.now(),
        duration: Date.now() - currentAnalysis.startTime,
        result,
        error,
        success: !error
      };
      
      setAnalysisHistory(prev => [completedAnalysis, ...prev.slice(0, 9)]); // 최근 10개만 유지
      setCurrentAnalysis(null);
    }
  }, [currentAnalysis]);

  // 고수준 분석 함수들
  const analyzeStockCorrelations = useCallback(async (stockData, options = {}) => {
    const analysisId = Date.now();
    const startTime = Date.now();
    
    trackAnalysis(analysisId, 'correlation', startTime);
    
    try {
      const result = await webWorker.calculateCorrelationMatrix(stockData, {
        ...options,
        onProgress: (progressData) => {
          setCurrentAnalysis(prev => prev ? {
            ...prev,
            progress: progressData.progress,
            phase: progressData.phase,
            data: progressData.data
          } : null);
        }
      });
      
      completeAnalysis(result);
      return result;
      
    } catch (error) {
      completeAnalysis(null, error);
      throw error;
    }
  }, [webWorker, trackAnalysis, completeAnalysis]);

  const performStockClustering = useCallback(async (stockData, clusterCount = 3, options = {}) => {
    const analysisId = Date.now();
    const startTime = Date.now();
    
    trackAnalysis(analysisId, 'clustering', startTime);
    
    try {
      const result = await webWorker.performKMeansClustering(stockData, {
        k: clusterCount,
        ...options,
        onProgress: (progressData) => {
          setCurrentAnalysis(prev => prev ? {
            ...prev,
            progress: progressData.progress,
            phase: progressData.phase,
            data: progressData.data
          } : null);
        }
      });
      
      completeAnalysis(result);
      return result;
      
    } catch (error) {
      completeAnalysis(null, error);
      throw error;
    }
  }, [webWorker, trackAnalysis, completeAnalysis]);

  const optimizePortfolio = useCallback(async (returnsData, riskTolerance = 0.5, options = {}) => {
    const analysisId = Date.now();
    const startTime = Date.now();
    
    trackAnalysis(analysisId, 'optimization', startTime);
    
    try {
      // 포트폴리오 최적화 목적 함수 (샤프 비율 최대화)
      const objectiveFunction = (weights) => {
        // 간단한 포트폴리오 최적화 로직
        const portfolio_return = weights.reduce((sum, w, i) => sum + w * (returnsData[i] || 0), 0);
        const portfolio_risk = Math.sqrt(weights.reduce((sum, w) => sum + w * w, 0));
        return -(portfolio_return / portfolio_risk); // 음수로 변환 (최소화 문제로)
      };
      
      const initialGuess = new Array(returnsData.length).fill(1 / returnsData.length);
      
      const result = await webWorker.performOptimization(
        objectiveFunction,
        [], // 제약 조건
        initialGuess,
        {
          ...options,
          onProgress: (progressData) => {
            setCurrentAnalysis(prev => prev ? {
              ...prev,
              progress: progressData.progress,
              phase: progressData.phase,
              data: progressData.data
            } : null);
          }
        }
      );
      
      completeAnalysis(result);
      return result;
      
    } catch (error) {
      completeAnalysis(null, error);
      throw error;
    }
  }, [webWorker, trackAnalysis, completeAnalysis]);

  return {
    ...webWorker,
    
    // 분석 상태
    currentAnalysis,
    analysisHistory,
    
    // 고수준 분석 함수
    analyzeStockCorrelations,
    performStockClustering,
    optimizePortfolio
  };
}; 