import { useState, useEffect, useCallback, useRef } from 'react';
import realtimeAPI from '../services/realtimeAPI';

export const useRealtimeStock = (symbol, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const subscriptionRef = useRef(null);
  const retryCountRef = useRef(0);
  
  const {
    interval = 5000,      // 업데이트 간격 (밀리초)
    maxRetries = 3,       // 최대 재시도 횟수
    autoStart = true,     // 자동 시작 여부
    market = 'auto'       // 시장 타입 ('korean', 'global', 'auto')
  } = options;

  // 데이터 조회 함수
  const fetchStockData = useCallback(async () => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      const stockData = await realtimeAPI.getStockData(symbol, market);
      setData(stockData);
      retryCountRef.current = 0; // 성공시 재시도 카운트 리셋
    } catch (err) {
      console.error('Stock data fetch error:', err);
      setError(err.message);
      
      // 재시도 로직
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        setTimeout(() => {
          fetchStockData();
        }, 2000 * retryCountRef.current); // 지수 백오프
      }
    } finally {
      setLoading(false);
    }
  }, [symbol, market, maxRetries]);

  // 실시간 구독 시작
  const startRealTime = useCallback(() => {
    if (!symbol || subscriptionRef.current) return;

    setIsRealTime(true);
    subscriptionRef.current = realtimeAPI.startRealTimeSubscription(
      symbol,
      (stockData, error) => {
        if (error) {
          setError(error.message);
        } else {
          setData(stockData);
          setError(null);
        }
        setLoading(false);
      },
      interval
    );
  }, [symbol, interval]);

  // 실시간 구독 중지
  const stopRealTime = useCallback(() => {
    if (subscriptionRef.current) {
      realtimeAPI.stopRealTimeSubscription(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    setIsRealTime(false);
  }, []);

  // 실시간 토글
  const toggleRealTime = useCallback(() => {
    if (isRealTime) {
      stopRealTime();
    } else {
      startRealTime();
    }
  }, [isRealTime, startRealTime, stopRealTime]);

  // 수동 새로고침
  const refresh = useCallback(() => {
    fetchStockData();
  }, [fetchStockData]);

  // 초기 데이터 로드 및 자동 시작
  useEffect(() => {
    if (symbol && autoStart) {
      fetchStockData().then(() => {
        if (autoStart) {
          startRealTime();
        }
      });
    }

    return () => {
      stopRealTime();
    };
  }, [symbol, autoStart, fetchStockData, startRealTime, stopRealTime]);

  // 컴포넌트 언마운트시 정리
  useEffect(() => {
    return () => {
      stopRealTime();
    };
  }, [stopRealTime]);

  return {
    data,
    loading,
    error,
    isRealTime,
    startRealTime,
    stopRealTime,
    toggleRealTime,
    refresh
  };
};

export const useStockSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  const search = useCallback(async (query, limit = 10) => {
    // 디바운싱
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchResults = await realtimeAPI.searchStocks(query, limit);
        setResults(searchResults);
      } catch (err) {
        console.error('Stock search error:', err);
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults
  };
};

export const useMarketStatus = () => {
  const [status, setStatus] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const updateStatus = useCallback(() => {
    const marketStatus = realtimeAPI.getMarketStatus();
    setStatus(marketStatus);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    // 초기 상태 확인
    updateStatus();

    // 1분마다 시장 상태 확인
    const interval = setInterval(updateStatus, 60000);

    return () => clearInterval(interval);
  }, [updateStatus]);

  return {
    status,
    lastUpdate,
    refresh: updateStatus
  };
};

export const useMultipleStocks = (symbols, options = {}) => {
  const [stocksData, setStocksData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const subscriptionsRef = useRef({});

  const {
    interval = 5000,
    maxSymbols = 10,
    autoStart = true
  } = options;

  const startRealTimeForStock = useCallback((symbol) => {
    if (subscriptionsRef.current[symbol]) return;

    subscriptionsRef.current[symbol] = realtimeAPI.startRealTimeSubscription(
      symbol,
      (stockData, error) => {
        if (error) {
          setErrors(prev => ({ ...prev, [symbol]: error.message }));
        } else {
          setStocksData(prev => ({ ...prev, [symbol]: stockData }));
          setErrors(prev => {
            const updated = { ...prev };
            delete updated[symbol];
            return updated;
          });
        }
      },
      interval
    );
  }, [interval]);

  const stopRealTimeForStock = useCallback((symbol) => {
    if (subscriptionsRef.current[symbol]) {
      realtimeAPI.stopRealTimeSubscription(subscriptionsRef.current[symbol]);
      delete subscriptionsRef.current[symbol];
    }
  }, []);

  const addStock = useCallback((symbol) => {
    if (Object.keys(stocksData).length >= maxSymbols) {
      console.warn(`최대 ${maxSymbols}개의 종목만 추가할 수 있습니다.`);
      return;
    }

    if (!stocksData[symbol]) {
      startRealTimeForStock(symbol);
    }
  }, [stocksData, maxSymbols, startRealTimeForStock]);

  const removeStock = useCallback((symbol) => {
    stopRealTimeForStock(symbol);
    setStocksData(prev => {
      const updated = { ...prev };
      delete updated[symbol];
      return updated;
    });
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[symbol];
      return updated;
    });
  }, [stopRealTimeForStock]);

  const clearAllStocks = useCallback(() => {
    Object.keys(subscriptionsRef.current).forEach(symbol => {
      stopRealTimeForStock(symbol);
    });
    setStocksData({});
    setErrors({});
  }, [stopRealTimeForStock]);

  // 초기 종목들 설정
  useEffect(() => {
    if (symbols && symbols.length > 0 && autoStart) {
      setLoading(true);
      symbols.slice(0, maxSymbols).forEach(symbol => {
        startRealTimeForStock(symbol);
      });
      setLoading(false);
    }

    return () => {
      clearAllStocks();
    };
  }, [symbols, autoStart, maxSymbols, startRealTimeForStock, clearAllStocks]);

  return {
    stocksData,
    loading,
    errors,
    addStock,
    removeStock,
    clearAllStocks,
    subscribedSymbols: Object.keys(stocksData)
  };
};

// 차트 데이터용 훅
export const useStockChart = (symbol, period = '1d', options = {}) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const {
    maxDataPoints = 100,
    updateInterval = 30000, // 30초마다 차트 업데이트
    autoUpdate = true
  } = options;

  const addDataPoint = useCallback((stockData) => {
    setChartData(prev => {
      const newPoint = {
        timestamp: new Date(stockData.timestamp).getTime(),
        price: stockData.price,
        volume: stockData.volume,
        high: stockData.high,
        low: stockData.low,
        open: stockData.open
      };

      const updated = [...prev, newPoint];
      
      // 최대 데이터 포인트 수 제한
      if (updated.length > maxDataPoints) {
        return updated.slice(-maxDataPoints);
      }
      
      return updated;
    });
  }, [maxDataPoints]);

  const clearChartData = useCallback(() => {
    setChartData([]);
    setError(null);
  }, []);

  // 실시간 차트 데이터 업데이트
  useEffect(() => {
    if (!symbol || !autoUpdate) return;

    const updateChart = async () => {
      try {
        const stockData = await realtimeAPI.getStockData(symbol);
        addDataPoint(stockData);
      } catch (err) {
        setError(err.message);
      }
    };

    // 초기 데이터 로드
    updateChart();

    // 주기적 업데이트
    intervalRef.current = setInterval(updateChart, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [symbol, updateInterval, autoUpdate, addDataPoint]);

  return {
    chartData,
    loading,
    error,
    clearChartData,
    addDataPoint
  };
}; 