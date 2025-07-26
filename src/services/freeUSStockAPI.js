import axios from 'axios';

class FreeUSStockAPI {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5000; // 5초 캐시
    this.requestCount = 0;
    this.maxRequestsPerSecond = 10;

    // 요청 제한 관리
    setInterval(() => {
      this.requestCount = 0;
    }, 1000);
    
    // CORS 프록시 옵션들 (Yahoo Finance 접근용)
    this.corsProxies = [
      '',  // 직접 접근 시도
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?'
    ];
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

  // 요청 제한 확인
  canMakeRequest() {
    return this.requestCount < this.maxRequestsPerSecond;
  }

  // Yahoo Finance 주식 현재가 조회 (완전 무료)
  async getYahooStockPrice(symbol) {
    const cacheKey = `yahoo-${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    if (!this.canMakeRequest()) {
      throw new Error('요청 한도 초과');
    }

    try {
      this.requestCount++;

      // Yahoo Finance API 호출
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
      let response;

      // CORS 우회를 위한 다중 시도
      for (const proxy of this.corsProxies) {
        try {
          const finalUrl = proxy + encodeURIComponent(url);
          response = await axios.get(proxy ? finalUrl : url, {
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          break;
        } catch (error) {
          if (proxy === this.corsProxies[this.corsProxies.length - 1]) {
            throw error;
          }
          continue;
        }
      }

      if (response?.data?.chart?.result?.[0]) {
        const result = response.data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators?.quote?.[0];
        const currentPrice = meta.regularMarketPrice || meta.previousClose;

        const stockData = {
          symbol: symbol.toUpperCase(),
          name: meta.longName || meta.shortName || symbol,
          price: currentPrice,
          change: currentPrice - meta.previousClose,
          changePercent: ((currentPrice - meta.previousClose) / meta.previousClose) * 100,
          volume: meta.regularMarketVolume || 0,
          high: meta.regularMarketDayHigh || currentPrice,
          low: meta.regularMarketDayLow || currentPrice,
          open: quote?.open?.[quote.open.length - 1] || meta.previousClose,
          market: meta.exchangeName || 'US',
          timestamp: new Date(meta.regularMarketTime * 1000).toISOString(),
          currency: meta.currency || 'USD',
          source: 'Yahoo Finance (Free)',
          marketCap: meta.marketCap,
          pe: meta.trailingPE,
          eps: meta.epsTrailingTwelveMonths
        };

        this.setCachedData(cacheKey, stockData);
        return stockData;
      } else {
        throw new Error('데이터 없음');
      }
    } catch (error) {
      console.error('Yahoo Finance 조회 오류:', error);
      // 에러 시 모의 데이터 반환
      return this.generateMockUSStockData(symbol);
    }
  }

  // Yahoo Finance 주식 검색
  async searchYahooStocks(query) {
    if (!this.canMakeRequest()) {
      return this.getMockSearchResults(query);
    }

    try {
      this.requestCount++;
      
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en&region=US&quotesCount=10&newsCount=0`;
      let response;

      // CORS 우회 시도
      for (const proxy of this.corsProxies) {
        try {
          const finalUrl = proxy + encodeURIComponent(url);
          response = await axios.get(proxy ? finalUrl : url, {
            timeout: 5000
          });
          break;
        } catch (error) {
          if (proxy === this.corsProxies[this.corsProxies.length - 1]) {
            throw error;
          }
          continue;
        }
      }

      if (response?.data?.quotes) {
        return response.data.quotes
          .filter(quote => quote.typeDisp === 'Equity') // 주식만 필터링
          .slice(0, 5)
          .map(quote => ({
            symbol: quote.symbol,
            name: quote.longname || quote.shortname || quote.symbol,
            market: quote.exchange || 'US',
            type: 'global',
            source: 'Yahoo Finance'
          }));
      }
    } catch (error) {
      console.error('Yahoo 검색 오류:', error);
    }

    return this.getMockSearchResults(query);
  }

  // IEX Cloud 무료 API (가입 필요하지만 무료 티어 있음)
  async getIEXStockPrice(symbol) {
    // IEX Cloud는 무료 티어가 있지만 토큰 필요
    // 현재는 Yahoo Finance 우선 사용
    return await this.getYahooStockPrice(symbol);
  }

  // Finnhub 무료 API
  async getFinnhubStockPrice(symbol) {
    try {
      // Finnhub 무료 API (토큰: demo)
      const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
        params: {
          symbol: symbol,
          token: 'demo' // demo 토큰 (제한적)
        },
        timeout: 5000
      });

      if (response.data && response.data.c) {
        return {
          symbol: symbol.toUpperCase(),
          name: symbol,
          price: response.data.c, // current price
          change: response.data.d, // change
          changePercent: response.data.dp, // change percent
          high: response.data.h, // high
          low: response.data.l, // low
          open: response.data.o, // open
          volume: 0, // Finnhub 무료 티어에서는 제한
          timestamp: new Date().toISOString(),
          source: 'Finnhub (Free)',
          market: 'US',
          currency: 'USD'
        };
      }
    } catch (error) {
      console.error('Finnhub 오류:', error);
    }

    // 실패 시 Yahoo Finance로 폴백
    return await this.getYahooStockPrice(symbol);
  }

  // 통합 미국 주식 조회
  async getUSStockData(symbol) {
    try {
      // 1순위: Yahoo Finance (완전 무료)
      return await this.getYahooStockPrice(symbol);
    } catch (error) {
      try {
        // 2순위: Finnhub (demo 토큰)
        return await this.getFinnhubStockPrice(symbol);
      } catch (finnhubError) {
        // 3순위: 모의 데이터
        return this.generateMockUSStockData(symbol);
      }
    }
  }

  // 주식 검색
  async searchUSStocks(query) {
    try {
      return await this.searchYahooStocks(query);
    } catch (error) {
      return this.getMockSearchResults(query);
    }
  }

  // 모의 데이터 생성 (API 실패 시)
  generateMockUSStockData(symbol) {
    const mockCompanies = {
      'ACEL': { name: 'Accel Entertainment Inc', basePrice: 12.50 },
      'EAGLE': { name: 'Eagle Pharmaceuticals Inc', basePrice: 45.30 },
      'AAPL': { name: 'Apple Inc', basePrice: 195.50 },
      'TSLA': { name: 'Tesla Inc', basePrice: 248.50 },
      'GOOGL': { name: 'Alphabet Inc', basePrice: 138.50 },
      'MSFT': { name: 'Microsoft Corp', basePrice: 420.50 },
      'NVDA': { name: 'NVIDIA Corp', basePrice: 875.30 },
      'META': { name: 'Meta Platforms Inc', basePrice: 515.20 },
      'AMZN': { name: 'Amazon.com Inc', basePrice: 185.40 },
      'BA': { name: 'Boeing Co', basePrice: 178.90 }
    };

    const company = mockCompanies[symbol.toUpperCase()] || { 
      name: `${symbol} Corp`, 
      basePrice: 50 + Math.random() * 100 
    };

    const changePercent = (Math.random() - 0.5) * 10;
    const change = company.basePrice * changePercent / 100;
    const currentPrice = company.basePrice + change;

    return {
      symbol: symbol.toUpperCase(),
      name: company.name,
      price: parseFloat(currentPrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      high: parseFloat((currentPrice + Math.random() * 5).toFixed(2)),
      low: parseFloat((currentPrice - Math.random() * 5).toFixed(2)),
      open: parseFloat((company.basePrice + (Math.random() - 0.5) * 10).toFixed(2)),
      market: 'NASDAQ',
      timestamp: new Date().toISOString(),
      currency: 'USD',
      source: 'Mock Data',
      pe: parseFloat((15 + Math.random() * 20).toFixed(2)),
      marketCap: Math.floor(Math.random() * 1000000000000)
    };
  }

  // 모의 검색 결과
  getMockSearchResults(query) {
    const mockResults = [
      { symbol: 'ACEL', name: 'Accel Entertainment Inc', market: 'NASDAQ' },
      { symbol: 'EAGLE', name: 'Eagle Pharmaceuticals Inc', market: 'NASDAQ' },
      { symbol: 'AEGL', name: 'Aeglea BioTherapeutics Inc', market: 'NASDAQ' },
      { symbol: 'AAPL', name: 'Apple Inc', market: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla Inc', market: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc', market: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corp', market: 'NASDAQ' },
      { symbol: 'NVDA', name: 'NVIDIA Corp', market: 'NASDAQ' },
      { symbol: 'META', name: 'Meta Platforms Inc', market: 'NASDAQ' },
      { symbol: 'AMZN', name: 'Amazon.com Inc', market: 'NASDAQ' }
    ];

    const queryUpper = query.toUpperCase();
    return mockResults
      .filter(stock => 
        stock.symbol.includes(queryUpper) || 
        stock.name.toUpperCase().includes(queryUpper)
      )
      .slice(0, 5)
      .map(stock => ({ 
        ...stock, 
        type: 'global',
        source: 'Mock Data'
      }));
  }

  // 실시간 구독 시뮬레이션
  startRealTimeSubscription(symbol, callback, interval = 5000) {
    const subscriptionId = `free-us-${symbol}-${Date.now()}`;
    
    const updatePrice = async () => {
      try {
        const data = await this.getUSStockData(symbol);
        callback(data, null);
      } catch (error) {
        callback(null, error);
      }
    };

    // 즉시 첫 데이터
    updatePrice();
    
    // 주기적 업데이트
    const intervalId = setInterval(updatePrice, interval);
    
    return {
      id: subscriptionId,
      stop: () => clearInterval(intervalId)
    };
  }

  // 시장 상태 확인
  getMarketStatus() {
    const now = new Date();
    const estTime = new Date(now.getTime() - 5 * 60 * 60 * 1000); // EST
    const hour = estTime.getHours();
    const day = estTime.getDay();

    // 미국 증시 운영 시간: 평일 09:30-16:00 EST
    const isMarketOpen = (day >= 1 && day <= 5) && 
                        ((hour === 9 && estTime.getMinutes() >= 30) || 
                         (hour >= 10 && hour < 16));

    return {
      isOpen: isMarketOpen,
      timezone: 'America/New_York',
      openTime: '09:30',
      closeTime: '16:00',
      currentTime: estTime.toLocaleString('en-US')
    };
  }
}

// 싱글톤 인스턴스
const freeUSStockAPI = new FreeUSStockAPI();

export default freeUSStockAPI; 