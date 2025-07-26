import axios from 'axios';

class RealtimeAPIService {
  constructor() {
    this.subscribers = new Map();
    this.intervals = new Map();
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30초 캐시
    
    // API 설정
    this.APIs = {
      alphaVantage: {
        baseURL: 'https://www.alphavantage.co/query',
        key: 'demo', // 실제 사용시 환경변수로 관리
        rateLimit: 5 // 분당 5회
      },
      yahoo: {
        baseURL: 'https://query1.finance.yahoo.com/v8/finance/chart',
        rateLimit: 60 // 분당 60회
      },
      korean: {
        // 한국투자증권 API 등 실제 한국 증권 API 설정
        baseURL: 'https://openapi.koreainvestment.com:9443',
        rateLimit: 20
      }
    };
    
    // 요청 제한 관리
    this.requestCounts = new Map();
    this.resetRequestCounts();
  }

  // 요청 횟수 초기화 (1분마다)
  resetRequestCounts() {
    setInterval(() => {
      this.requestCounts.clear();
    }, 60000);
  }

  // 요청 제한 확인
  canMakeRequest(apiName) {
    const current = this.requestCounts.get(apiName) || 0;
    const limit = this.APIs[apiName]?.rateLimit || 10;
    return current < limit;
  }

  // 요청 횟수 증가
  incrementRequestCount(apiName) {
    const current = this.requestCounts.get(apiName) || 0;
    this.requestCounts.set(apiName, current + 1);
  }

  // 캐시에서 데이터 조회
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // 캐시에 데이터 저장
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 한국 주식 실시간 데이터 조회
  async getKoreanStockData(symbol) {
    const cacheKey = `korean-${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // 실제 구현에서는 한국투자증권 API 또는 다른 실시간 API 사용
      // 현재는 모의 데이터 반환
      const mockData = {
        symbol,
        name: this.getKoreanStockName(symbol),
        price: Math.floor(Math.random() * 100000) + 10000,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 1000000),
        high: 0,
        low: 0,
        open: 0,
        market: symbol.length === 6 ? 'KOSPI' : 'KOSDAQ',
        timestamp: new Date().toISOString(),
        currency: 'KRW'
      };

      // 고가, 저가, 시가 계산
      mockData.high = mockData.price + Math.random() * 5000;
      mockData.low = mockData.price - Math.random() * 5000;
      mockData.open = mockData.low + Math.random() * (mockData.high - mockData.low);

      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.error('Korean stock data fetch error:', error);
      throw new Error('한국 주식 데이터 조회 실패');
    }
  }

  // 글로벌 주식 실시간 데이터 조회 (Alpha Vantage)
  async getGlobalStockData(symbol) {
    const cacheKey = `global-${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    if (!this.canMakeRequest('alphaVantage')) {
      throw new Error('API 요청 한도 초과');
    }

    try {
      this.incrementRequestCount('alphaVantage');
      
      const response = await axios.get(this.APIs.alphaVantage.baseURL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.APIs.alphaVantage.key
        },
        timeout: 10000
      });

      const quote = response.data['Global Quote'];
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error('데이터 없음');
      }

      const data = {
        symbol: quote['01. symbol'],
        name: symbol, // 실제로는 별도 API로 회사명 조회
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        market: 'NASDAQ', // 실제로는 거래소 정보 포함
        timestamp: quote['07. latest trading day'],
        currency: 'USD'
      };

      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Global stock data fetch error:', error);
      throw new Error('글로벌 주식 데이터 조회 실패');
    }
  }

  // Yahoo Finance API로 실시간 데이터 조회 (백업)
  async getYahooStockData(symbol) {
    const cacheKey = `yahoo-${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    if (!this.canMakeRequest('yahoo')) {
      throw new Error('API 요청 한도 초과');
    }

    try {
      this.incrementRequestCount('yahoo');
      
      const response = await axios.get(`${this.APIs.yahoo.baseURL}/${symbol}`, {
        timeout: 10000
      });

      const result = response.data.chart.result[0];
      const meta = result.meta;
      const indicators = result.indicators.quote[0];

      const data = {
        symbol: meta.symbol,
        name: meta.longName || meta.shortName || symbol,
        price: meta.regularMarketPrice,
        change: meta.regularMarketPrice - meta.previousClose,
        changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
        volume: meta.regularMarketVolume,
        high: meta.regularMarketDayHigh,
        low: meta.regularMarketDayLow,
        open: indicators.open?.[indicators.open.length - 1] || meta.regularMarketPrice,
        market: meta.exchangeName,
        timestamp: new Date(meta.regularMarketTime * 1000).toISOString(),
        currency: meta.currency
      };

      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Yahoo stock data fetch error:', error);
      throw new Error('Yahoo Finance 데이터 조회 실패');
    }
  }

  // 통합 주식 데이터 조회 (자동 API 선택)
  async getStockData(symbol, market = 'auto') {
    try {
      // 한국 주식 판별 (6자리 숫자)
      if (market === 'auto') {
        market = /^\d{6}$/.test(symbol) ? 'korean' : 'global';
      }

      if (market === 'korean') {
        return await this.getKoreanStockData(symbol);
      } else {
        // 글로벌 주식 - Alpha Vantage 우선, 실패시 Yahoo Finance
        try {
          return await this.getGlobalStockData(symbol);
        } catch (error) {
          console.warn('Alpha Vantage 실패, Yahoo Finance로 시도:', error.message);
          return await this.getYahooStockData(symbol);
        }
      }
    } catch (error) {
      console.error('Stock data fetch failed:', error);
      throw error;
    }
  }

  // 실시간 구독 시작
  startRealTimeSubscription(symbol, callback, interval = 5000) {
    const subscriptionId = `${symbol}-${Date.now()}`;
    
    // 구독자 등록
    this.subscribers.set(subscriptionId, {
      symbol,
      callback,
      lastUpdate: 0
    });

    // 즉시 첫 데이터 조회
    this.fetchAndNotify(subscriptionId);

    // 주기적 업데이트 설정
    const intervalId = setInterval(() => {
      this.fetchAndNotify(subscriptionId);
    }, interval);

    this.intervals.set(subscriptionId, intervalId);

    return subscriptionId;
  }

  // 구독 데이터 조회 및 알림
  async fetchAndNotify(subscriptionId) {
    const subscription = this.subscribers.get(subscriptionId);
    if (!subscription) return;

    try {
      const data = await this.getStockData(subscription.symbol);
      subscription.callback(data, null);
      subscription.lastUpdate = Date.now();
    } catch (error) {
      subscription.callback(null, error);
    }
  }

  // 실시간 구독 중지
  stopRealTimeSubscription(subscriptionId) {
    const intervalId = this.intervals.get(subscriptionId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(subscriptionId);
    }
    this.subscribers.delete(subscriptionId);
  }

  // 모든 구독 중지
  stopAllSubscriptions() {
    this.intervals.forEach(intervalId => clearInterval(intervalId));
    this.intervals.clear();
    this.subscribers.clear();
  }

  // 한국 주식명 매핑 (실제로는 별도 API나 데이터베이스 사용)
  getKoreanStockName(symbol) {
    const nameMap = {
      '005930': '삼성전자',
      '000660': 'SK하이닉스',
      '035720': '카카오',
      '051910': 'LG화학',
      '068270': '셀트리온',
      '028300': 'HLB',
      '041510': '에이지이글',
      '096770': 'SK이노베이션',
      '034220': 'LG디스플레이',
      '003550': 'LG'
    };
    return nameMap[symbol] || `주식${symbol}`;
  }

  // 주식 검색
  async searchStocks(query, limit = 10) {
    if (!query || query.length < 2) return [];

    try {
      // 한국 주식 검색
      const koreanStocks = this.searchKoreanStocks(query);
      
      // 글로벌 주식 검색 (Alpha Vantage)
      let globalStocks = [];
      if (this.canMakeRequest('alphaVantage')) {
        try {
          this.incrementRequestCount('alphaVantage');
          const response = await axios.get(this.APIs.alphaVantage.baseURL, {
            params: {
              function: 'SYMBOL_SEARCH',
              keywords: query,
              apikey: this.APIs.alphaVantage.key
            },
            timeout: 10000
          });

          if (response.data.bestMatches) {
            globalStocks = response.data.bestMatches.slice(0, 5).map(match => ({
              symbol: match['1. symbol'],
              name: match['2. name'],
              market: match['4. region'],
              type: match['3. type'],
              currency: match['8. currency'] || 'USD'
            }));
          }
        } catch (error) {
          console.warn('Global stock search failed:', error);
        }
      }

      // 결과 합치기
      const results = [
        ...koreanStocks.map(stock => ({ ...stock, type: 'korean' })),
        ...globalStocks.map(stock => ({ ...stock, type: 'global' }))
      ];

      return results.slice(0, limit);
    } catch (error) {
      console.error('Stock search error:', error);
      return [];
    }
  }

  // 한국 주식 검색 (로컬 데이터)
  searchKoreanStocks(query) {
    const stocks = [
      { symbol: '005930', name: '삼성전자', market: 'KOSPI' },
      { symbol: '000660', name: 'SK하이닉스', market: 'KOSPI' },
      { symbol: '035720', name: '카카오', market: 'KOSPI' },
      { symbol: '051910', name: 'LG화학', market: 'KOSPI' },
      { symbol: '068270', name: '셀트리온', market: 'KOSPI' },
      { symbol: '028300', name: 'HLB', market: 'KOSDAQ' },
      { symbol: '041510', name: '에이지이글', market: 'KOSDAQ' },
      { symbol: '096770', name: 'SK이노베이션', market: 'KOSPI' },
      { symbol: '034220', name: 'LG디스플레이', market: 'KOSPI' },
      { symbol: '003550', name: 'LG', market: 'KOSPI' }
    ];

    return stocks.filter(stock =>
      stock.name.toLowerCase().includes(query.toLowerCase()) ||
      stock.symbol.includes(query)
    );
  }

  // 시장 상태 확인
  getMarketStatus() {
    const now = new Date();
    const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC+9
    const hour = kstTime.getHours();
    const minute = kstTime.getMinutes();
    const day = kstTime.getDay();

    // 한국 시장 (평일 9:00-15:30)
    const koreanMarketOpen = (day >= 1 && day <= 5) && 
                            ((hour === 9 && minute >= 0) || 
                             (hour >= 10 && hour < 15) || 
                             (hour === 15 && minute <= 30));

    // 미국 시장 (평일 23:30-06:00 KST, 서머타임 22:30-05:00)
    const usMarketOpen = (day >= 1 && day <= 5) && 
                        ((hour >= 22 && hour <= 23) || 
                         (hour >= 0 && hour <= 5));

    return {
      korean: koreanMarketOpen,
      us: usMarketOpen,
      timestamp: kstTime.toISOString()
    };
  }
}

// 싱글톤 인스턴스 생성
const realtimeAPI = new RealtimeAPIService();

export default realtimeAPI; 