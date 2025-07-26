import axios from 'axios';

class RealTimeDataService {
  constructor() {
    this.cache = new Map();
    this.subscribers = new Map();
    this.intervals = new Map();
    this.cacheTimeout = 3000; // 3초 캐시
    
    // 실제 사용 가능한 무료 API들
    this.apiConfig = {
      finnhub: {
        baseUrl: 'https://finnhub.io/api/v1',
        token: 'demo', // 실제로는 무료 가입 후 토큰 사용
        rateLimit: 60 // per minute
      },
      iex: {
        baseUrl: 'https://api.iex.cloud/v1',
        token: 'pk_test', // IEX Cloud 무료 토큰
        rateLimit: 100
      },
      twelveData: {
        baseUrl: 'https://api.twelvedata.com',
        token: 'demo',
        rateLimit: 800 // per day for free
      }
    };
    
    this.requestCounts = {
      finnhub: 0,
      iex: 0,
      twelveData: 0
    };
    
    // 매분 요청 카운트 리셋
    setInterval(() => {
      this.requestCounts = { finnhub: 0, iex: 0, twelveData: 0 };
    }, 60000);
  }

  // 캐시 관리
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Finnhub API 호출 (가장 안정적)
  async getFinnhubData(symbol) {
    try {
      if (this.requestCounts.finnhub >= this.apiConfig.finnhub.rateLimit) {
        throw new Error('Finnhub rate limit exceeded');
      }

      this.requestCounts.finnhub++;
      
      // 현재가 조회
      const quoteResponse = await axios.get(`${this.apiConfig.finnhub.baseUrl}/quote`, {
        params: { symbol, token: this.apiConfig.finnhub.token },
        timeout: 5000
      });

      // 회사 정보 조회
      const profileResponse = await axios.get(`${this.apiConfig.finnhub.baseUrl}/stock/profile2`, {
        params: { symbol, token: this.apiConfig.finnhub.token },
        timeout: 5000
      });

      const quote = quoteResponse.data;
      const profile = profileResponse.data;

      if (quote && quote.c !== undefined) {
        return {
          symbol: symbol.toUpperCase(),
          name: profile.name || symbol,
          price: quote.c, // current price
          change: quote.d, // change
          changePercent: quote.dp, // change percent
          high: quote.h, // high
          low: quote.l, // low
          open: quote.o, // open
          previousClose: quote.pc, // previous close
          volume: 0, // Finnhub free tier limitation
          marketCap: profile.marketCapitalization || 0,
          industry: profile.finnhubIndustry || 'N/A',
          country: profile.country || 'US',
          currency: profile.currency || 'USD',
          exchange: profile.exchange || 'NASDAQ',
          timestamp: new Date().toISOString(),
          source: 'Finnhub',
          pe: null,
          eps: null,
          isRealTime: true
        };
      }
      throw new Error('Invalid Finnhub response');
    } catch (error) {
      console.error('Finnhub API error:', error);
      throw error;
    }
  }

  // IEX Cloud API 호출
  async getIEXData(symbol) {
    try {
      if (this.requestCounts.iex >= this.apiConfig.iex.rateLimit) {
        throw new Error('IEX rate limit exceeded');
      }

      this.requestCounts.iex++;
      
      const response = await axios.get(`${this.apiConfig.iex.baseUrl}/data/core/quote/${symbol}`, {
        params: { token: this.apiConfig.iex.token },
        timeout: 5000
      });

      const data = response.data[0];
      if (data) {
        return {
          symbol: symbol.toUpperCase(),
          name: data.companyName || symbol,
          price: data.latestPrice,
          change: data.change,
          changePercent: data.changePercent * 100,
          high: data.high,
          low: data.low,
          open: data.open,
          previousClose: data.previousClose,
          volume: data.latestVolume,
          marketCap: data.marketCap,
          pe: data.peRatio,
          timestamp: new Date().toISOString(),
          source: 'IEX Cloud',
          currency: 'USD',
          exchange: data.primaryExchange || 'NASDAQ',
          isRealTime: true
        };
      }
      throw new Error('Invalid IEX response');
    } catch (error) {
      console.error('IEX API error:', error);
      throw error;
    }
  }

  // TwelveData API 호출
  async getTwelveData(symbol) {
    try {
      if (this.requestCounts.twelveData >= this.apiConfig.twelveData.rateLimit) {
        throw new Error('TwelveData rate limit exceeded');
      }

      this.requestCounts.twelveData++;
      
      const response = await axios.get(`${this.apiConfig.twelveData.baseUrl}/quote`, {
        params: { 
          symbol,
          apikey: this.apiConfig.twelveData.token
        },
        timeout: 5000
      });

      const data = response.data;
      if (data && data.close) {
        const change = parseFloat(data.close) - parseFloat(data.previous_close);
        const changePercent = (change / parseFloat(data.previous_close)) * 100;

        return {
          symbol: symbol.toUpperCase(),
          name: data.name || symbol,
          price: parseFloat(data.close),
          change: change,
          changePercent: changePercent,
          high: parseFloat(data.high),
          low: parseFloat(data.low),
          open: parseFloat(data.open),
          previousClose: parseFloat(data.previous_close),
          volume: parseInt(data.volume) || 0,
          timestamp: new Date().toISOString(),
          source: 'TwelveData',
          currency: 'USD',
          exchange: data.exchange || 'NASDAQ',
          isRealTime: true
        };
      }
      throw new Error('Invalid TwelveData response');
    } catch (error) {
      console.error('TwelveData API error:', error);
      throw error;
    }
  }

  // 고품질 Mock 데이터 (API 실패 시)
  generateRealisticMockData(symbol) {
    const baseData = {
      'ACEL': { name: 'Accel Entertainment Inc', basePrice: 12.50, volume: 145000 },
      'EAGLE': { name: 'Eagle Pharmaceuticals Inc', basePrice: 45.30, volume: 89000 },
      'AEGL': { name: 'Aeglea BioTherapeutics Inc', basePrice: 2.15, volume: 234000 },
      'AAPL': { name: 'Apple Inc', basePrice: 195.50, volume: 45000000 },
      'TSLA': { name: 'Tesla Inc', basePrice: 248.50, volume: 78000000 },
      'NVDA': { name: 'NVIDIA Corp', basePrice: 875.30, volume: 23000000 },
      'MSFT': { name: 'Microsoft Corp', basePrice: 420.50, volume: 18000000 },
      'GOOGL': { name: 'Alphabet Inc', basePrice: 138.50, volume: 15000000 },
      'META': { name: 'Meta Platforms Inc', basePrice: 515.20, volume: 12000000 },
      'AMZN': { name: 'Amazon.com Inc', basePrice: 185.40, volume: 25000000 }
    };

    const company = baseData[symbol.toUpperCase()] || { 
      name: `${symbol} Corp`, 
      basePrice: 50 + Math.random() * 100,
      volume: Math.floor(Math.random() * 1000000)
    };

    // 현실적인 가격 변동 (-5% ~ +5%)
    const changePercent = (Math.random() - 0.5) * 10;
    const change = company.basePrice * changePercent / 100;
    const currentPrice = company.basePrice + change;
    
    // 장중 고가/저가 시뮬레이션
    const dayRange = currentPrice * 0.03; // 3% 범위
    const high = currentPrice + Math.random() * dayRange;
    const low = currentPrice - Math.random() * dayRange;
    const open = company.basePrice + (Math.random() - 0.5) * dayRange;

    return {
      symbol: symbol.toUpperCase(),
      name: company.name,
      price: parseFloat(currentPrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      open: parseFloat(open.toFixed(2)),
      previousClose: company.basePrice,
      volume: company.volume + Math.floor(Math.random() * 100000),
      marketCap: Math.floor(currentPrice * 1000000 * (100 + Math.random() * 900)),
      pe: parseFloat((15 + Math.random() * 20).toFixed(2)),
      eps: parseFloat((currentPrice / (15 + Math.random() * 20)).toFixed(2)),
      currency: 'USD',
      exchange: 'NASDAQ',
      industry: 'Technology',
      country: 'US',
      timestamp: new Date().toISOString(),
      source: 'Realistic Mock',
      isRealTime: false
    };
  }

  // 통합 데이터 조회 (다중 API 폴백)
  async getStockData(symbol) {
    const cacheKey = `stock-${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    // API 우선순위: Finnhub → IEX → TwelveData → Mock
    const apiMethods = [
      () => this.getFinnhubData(symbol),
      () => this.getIEXData(symbol),
      () => this.getTwelveData(symbol)
    ];

    for (const apiMethod of apiMethods) {
      try {
        const data = await apiMethod();
        this.setCachedData(cacheKey, data);
        console.log(`✅ ${symbol} 실시간 데이터 (${data.source}):`, {
          price: data.price,
          change: data.change,
          changePercent: data.changePercent
        });
        return data;
      } catch (error) {
        console.warn(`API 호출 실패, 다음 API 시도:`, error.message);
        continue;
      }
    }

    // 모든 API 실패 시 고품질 Mock 데이터
    console.log(`⚠️ ${symbol} - 모든 API 실패, 고품질 Mock 데이터 사용`);
    const mockData = this.generateRealisticMockData(symbol);
    this.setCachedData(cacheKey, mockData);
    return mockData;
  }

  // 실시간 구독 (TOS 스타일)
  startRealTimeSubscription(symbols, callback, interval = 5000) {
    const subscriptionId = `tos-${Date.now()}`;
    
    const updateData = async () => {
      try {
        const promises = symbols.map(symbol => this.getStockData(symbol));
        const results = await Promise.all(promises);
        
        const dataMap = {};
        results.forEach(data => {
          dataMap[data.symbol] = data;
        });
        
        callback(dataMap, null);
      } catch (error) {
        callback(null, error);
      }
    };

    // 즉시 첫 데이터 로드
    updateData();
    
    // 주기적 업데이트
    const intervalId = setInterval(updateData, interval);
    this.intervals.set(subscriptionId, intervalId);
    
    return {
      id: subscriptionId,
      stop: () => {
        clearInterval(intervalId);
        this.intervals.delete(subscriptionId);
      }
    };
  }

  // 다중 종목 조회 (TOS 워치리스트 스타일)
  async getMultipleStocks(symbols) {
    try {
      const promises = symbols.map(symbol => this.getStockData(symbol));
      const results = await Promise.all(promises);
      
      return results.reduce((acc, data) => {
        acc[data.symbol] = data;
        return acc;
      }, {});
    } catch (error) {
      console.error('Multiple stocks fetch error:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
const realTimeDataService = new RealTimeDataService();

export default realTimeDataService; 