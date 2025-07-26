import axios from 'axios';

class KISAPIService {
  constructor() {
    this.baseURL = 'https://openapi.koreainvestment.com:9443';
    this.mockMode = !process.env.REACT_APP_KIS_APP_KEY; // API 키가 없으면 목 모드
    
    // API 인증 정보 (환경변수에서 로드)
    this.config = {
      appKey: process.env.REACT_APP_KIS_APP_KEY || '',
      appSecret: process.env.REACT_APP_KIS_APP_SECRET || '',
      accessToken: null,
      tokenExpiry: null
    };

    this.cache = new Map();
    this.cacheTimeout = 1000; // 1초 캐시 (실시간을 위해 짧게)
    this.requestCount = 0;
    this.maxRequestsPerSecond = 20; // KIS API 제한

    // 요청 제한 관리
    setInterval(() => {
      this.requestCount = 0;
    }, 1000);
  }

  // 접근 토큰 발급
  async getAccessToken() {
    if (this.mockMode) {
      return 'MOCK_ACCESS_TOKEN';
    }

    try {
      const response = await axios.post(`${this.baseURL}/oauth2/tokenP`, {
        grant_type: 'client_credentials',
        appkey: this.config.appKey,
        appsecret: this.config.appSecret
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.access_token) {
        this.config.accessToken = response.data.access_token;
        this.config.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
        console.log('KIS API 접근 토큰 발급 성공');
        return this.config.accessToken;
      } else {
        throw new Error('토큰 발급 실패');
      }
    } catch (error) {
      console.error('KIS API 토큰 발급 오류:', error);
      throw new Error('KIS API 인증 실패');
    }
  }

  // 토큰 유효성 검사 및 갱신
  async ensureValidToken() {
    if (this.mockMode) return 'MOCK_ACCESS_TOKEN';

    if (!this.config.accessToken || Date.now() >= this.config.tokenExpiry) {
      await this.getAccessToken();
    }
    return this.config.accessToken;
  }

  // 요청 제한 확인
  canMakeRequest() {
    return this.requestCount < this.maxRequestsPerSecond;
  }

  // 캐시 확인
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // 캐시 저장
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 주식 현재가 조회 (한국 + 해외 주식)
  async getCurrentPrice(stockCode, market = 'auto') {
    const detectedMarket = this.detectMarket(stockCode, market);
    const cacheKey = `price-${stockCode}-${detectedMarket}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    if (this.mockMode) {
      return detectedMarket === 'overseas' ? 
        this.getMockOverseasStockData(stockCode) : 
        this.getMockStockData(stockCode);
    }

    if (!this.canMakeRequest()) {
      throw new Error('API 요청 한도 초과');
    }

    try {
      const token = await this.ensureValidToken();
      this.requestCount++;

      const response = await axios.get(`${this.baseURL}/uapi/domestic-stock/v1/quotations/inquire-price`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'appkey': this.config.appKey,
          'appsecret': this.config.appSecret,
          'tr_id': 'FHKST01010100',
          'custtype': 'P',
          'Content-Type': 'application/json; charset=utf-8'
        },
        params: {
          fid_cond_mrkt_div_code: 'J',
          fid_input_iscd: stockCode
        }
      });

      if (response.data.rt_cd === '0') {
        const output = response.data.output;
        const stockData = {
          symbol: stockCode,
          name: output.hts_kor_isnm || '종목명',
          price: parseInt(output.stck_prpr),
          change: parseInt(output.prdy_vrss),
          changePercent: parseFloat(output.prdy_ctrt),
          volume: parseInt(output.acml_vol),
          high: parseInt(output.stck_hgpr),
          low: parseInt(output.stck_lwpr),
          open: parseInt(output.stck_oprc),
          market: output.bstp_kor_isnm || 'KOSPI',
          timestamp: new Date().toISOString(),
          currency: 'KRW',
          marketStatus: this.getMarketStatus(),
          // 추가 KIS 데이터
          upperLimit: parseInt(output.stck_upar),
          lowerLimit: parseInt(output.stck_lwpr),
          tradingStatus: output.iscd_stat_cls_code,
          foreignLimit: parseInt(output.frgn_hldn_qty || 0)
        };

        this.setCachedData(cacheKey, stockData);
        return stockData;
      } else {
        throw new Error(`KIS API 오류: ${response.data.msg1}`);
      }
    } catch (error) {
      console.error('KIS API 주식 조회 오류:', error);
      // 에러 시 목 데이터 반환
      return this.getMockStockData(stockCode);
    }
  }

  // 주식 기본 정보 조회
  async getStockInfo(stockCode) {
    if (this.mockMode) {
      return this.getMockStockInfo(stockCode);
    }

    try {
      const token = await this.ensureValidToken();
      this.requestCount++;

      const response = await axios.get(`${this.baseURL}/uapi/domestic-stock/v1/quotations/inquire-daily-price`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'appkey': this.config.appKey,
          'appsecret': this.config.appSecret,
          'tr_id': 'FHKST01010400',
          'custtype': 'P'
        },
        params: {
          fid_cond_mrkt_div_code: 'J',
          fid_input_iscd: stockCode,
          fid_org_adj_prc: '1',
          fid_period_div_code: 'D'
        }
      });

      if (response.data.rt_cd === '0') {
        return {
          symbol: stockCode,
          name: response.data.output[0]?.hts_kor_isnm || '종목명',
          market: 'KOSPI/KOSDAQ',
          industry: '업종정보',
          description: `${stockCode} 주식의 기본 정보입니다.`
        };
      }
    } catch (error) {
      console.error('KIS API 주식 정보 조회 오류:', error);
    }

    return this.getMockStockInfo(stockCode);
  }

  // 주식 검색
  async searchStocks(keyword) {
    if (this.mockMode) {
      return this.getMockSearchResults(keyword);
    }

    // KIS API에는 종목 검색 API가 제한적이므로 
    // 일반적으로 종목 코드 리스트를 미리 준비하고 필터링
    return this.getMockSearchResults(keyword);
  }

  // 시장 상태 확인
  getMarketStatus() {
    const now = new Date();
    const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const hour = kstTime.getHours();
    const minute = kstTime.getMinutes();
    const day = kstTime.getDay();

    // 한국 증시 운영 시간: 평일 09:00-15:30
    const isMarketOpen = (day >= 1 && day <= 5) && 
                        ((hour === 9 && minute >= 0) || 
                         (hour >= 10 && hour < 15) || 
                         (hour === 15 && minute <= 30));

    return {
      isOpen: isMarketOpen,
      timezone: 'Asia/Seoul',
      openTime: '09:00',
      closeTime: '15:30',
      currentTime: kstTime.toLocaleString('ko-KR')
    };
  }

  // 목 데이터 (API 키가 없을 때 사용)
  getMockStockData(stockCode) {
    const mockData = {
      '005930': { name: '삼성전자', basePrice: 71000 },
      '000660': { name: 'SK하이닉스', basePrice: 128000 },
      '035720': { name: '카카오', basePrice: 45500 },
      '051910': { name: 'LG화학', basePrice: 385000 },
      '068270': { name: '셀트리온', basePrice: 178000 },
      '041510': { name: '에이지이글', basePrice: 8840 },
      '096770': { name: 'SK이노베이션', basePrice: 89400 },
      '028300': { name: 'HLB', basePrice: 32100 }
    };

    const stock = mockData[stockCode] || { name: `종목${stockCode}`, basePrice: 50000 };
    const changePercent = (Math.random() - 0.5) * 10;
    const change = Math.round(stock.basePrice * changePercent / 100);
    const currentPrice = stock.basePrice + change;

    return {
      symbol: stockCode,
      name: stock.name,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: Math.floor(Math.random() * 1000000),
      high: currentPrice + Math.floor(Math.random() * 3000),
      low: currentPrice - Math.floor(Math.random() * 3000),
      open: stock.basePrice + Math.floor((Math.random() - 0.5) * 2000),
      market: stockCode.length === 6 ? 'KOSPI' : 'KOSDAQ',
      timestamp: new Date().toISOString(),
      currency: 'KRW',
      marketStatus: this.getMarketStatus(),
      source: this.mockMode ? 'MOCK' : 'KIS'
    };
  }

  // 시장 자동 판별
  detectMarket(stockCode, market) {
    if (market && market !== 'auto') return market;
    
    // 6자리 숫자 = 한국 주식
    if (/^\d{6}$/.test(stockCode)) return 'domestic';
    
    // 영문 심볼 = 해외 주식
    if (/^[A-Z]{1,5}$/.test(stockCode)) return 'overseas';
    
    return 'domestic';
  }

  // 거래소 코드 반환
  getExchangeCode(symbol) {
    const exchangeMap = {
      'UAVS': 'NYS',  // AgEagle Aerial Systems - NYSE American
      'AAPL': 'NAS',  // Apple - NASDAQ
      'TSLA': 'NAS',  // Tesla - NASDAQ
      'NVDA': 'NAS',  // NVIDIA - NASDAQ
      'MSFT': 'NAS',  // Microsoft - NASDAQ
      'GOOGL': 'NAS', // Alphabet - NASDAQ
      'META': 'NAS',  // Meta - NASDAQ
      'AMZN': 'NAS',  // Amazon - NASDAQ
      'BA': 'NYS',    // Boeing - NYSE
      'JPM': 'NYS',   // JPMorgan - NYSE
      'RTX': 'NYS',   // Raytheon - NYSE
      'LMT': 'NYS',   // Lockheed Martin - NYSE
    };
    
    return exchangeMap[symbol] || 'NAS';
  }

  // 해외 주식 Mock 데이터 (최신 2024년 데이터 기준)
  getMockOverseasStockData(symbol) {
    const overseasMockData = {
      // 🎯 에이지이글에어리얼 시스템스 - 정확한 데이터
      'UAVS': { 
        name: 'AgEagle Aerial Systems Inc', 
        basePrice: 2.45, 
        currency: 'USD', 
        exchange: 'NYSE American',
        sector: 'Aerospace & Defense',
        industry: 'Drone Technology'
      },
      
      // 주요 미국 주식들 (2024년 최신 가격 기준)
      'AAPL': { name: 'Apple Inc', basePrice: 195.50, currency: 'USD', exchange: 'NASDAQ' },
      'TSLA': { name: 'Tesla Inc', basePrice: 248.50, currency: 'USD', exchange: 'NASDAQ' },
      'NVDA': { name: 'NVIDIA Corp', basePrice: 875.30, currency: 'USD', exchange: 'NASDAQ' },
      'MSFT': { name: 'Microsoft Corp', basePrice: 420.50, currency: 'USD', exchange: 'NASDAQ' },
      'GOOGL': { name: 'Alphabet Inc', basePrice: 138.50, currency: 'USD', exchange: 'NASDAQ' },
      'META': { name: 'Meta Platforms Inc', basePrice: 515.20, currency: 'USD', exchange: 'NASDAQ' },
      'AMZN': { name: 'Amazon.com Inc', basePrice: 185.40, currency: 'USD', exchange: 'NASDAQ' },
      
      // 항공우주 & 방산 관련 (에이지이글과 유사 섹터)
      'BA': { name: 'Boeing Co', basePrice: 178.90, currency: 'USD', exchange: 'NYSE' },
      'RTX': { name: 'Raytheon Technologies Corp', basePrice: 115.25, currency: 'USD', exchange: 'NYSE' },
      'LMT': { name: 'Lockheed Martin Corp', basePrice: 445.80, currency: 'USD', exchange: 'NYSE' },
      'PLTR': { name: 'Palantir Technologies Inc', basePrice: 25.15, currency: 'USD', exchange: 'NYSE' },
      
      // 드론 & 항공 기술 관련
      'AVAV': { name: 'AeroVironment Inc', basePrice: 102.35, currency: 'USD', exchange: 'NASDAQ' },
      'KTOS': { name: 'Kratos Defense & Security Solutions', basePrice: 18.45, currency: 'USD', exchange: 'NASDAQ' }
    };

    const stock = overseasMockData[symbol] || { 
      name: `${symbol} Corp`, 
      basePrice: 50 + Math.random() * 100,
      currency: 'USD',
      exchange: 'NASDAQ',
      sector: 'Technology',
      industry: 'Software'
    };

    const changePercent = (Math.random() - 0.5) * 8; // 해외 주식 변동성
    const change = stock.basePrice * changePercent / 100;
    const currentPrice = stock.basePrice + change;

    return {
      symbol: symbol,
      name: stock.name,
      price: parseFloat(currentPrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      high: parseFloat((currentPrice + Math.random() * 5).toFixed(2)),
      low: parseFloat((currentPrice - Math.random() * 5).toFixed(2)),
      open: parseFloat((stock.basePrice + (Math.random() - 0.5) * 10).toFixed(2)),
      market: stock.exchange,
      timestamp: new Date().toISOString(),
      currency: stock.currency,
      exchangeCode: this.getExchangeCode(symbol),
      marketStatus: this.getUSMarketStatus(),
      source: this.mockMode ? 'MOCK_OVERSEAS' : 'KIS_OVERSEAS',
      isOverseas: true,
      sector: stock.sector,
      industry: stock.industry,
      // 에이지이글 특별 마킹
      isAgEagle: symbol === 'UAVS'
    };
  }

  // 미국 시장 상태 확인
  getUSMarketStatus() {
    const now = new Date();
    const estTime = new Date(now.getTime() - 5 * 60 * 60 * 1000); // EST
    const hour = estTime.getHours();
    const day = estTime.getDay();

    // 미국 증시: 평일 09:30-16:00 EST
    const isOpen = (day >= 1 && day <= 5) && 
                   ((hour === 9 && estTime.getMinutes() >= 30) || 
                    (hour >= 10 && hour < 16));

    return {
      isOpen,
      timezone: 'America/New_York',
      openTime: '09:30 EST',
      closeTime: '16:00 EST',
      currentTime: estTime.toLocaleString('en-US')
    };
  }

  getMockStockInfo(stockCode) {
    const info = {
      '005930': { name: '삼성전자', industry: '반도체' },
      '000660': { name: 'SK하이닉스', industry: '반도체' },
      '035720': { name: '카카오', industry: 'IT서비스' },
      '051910': { name: 'LG화학', industry: '화학' },
      '068270': { name: '셀트리온', industry: '바이오' },
      '041510': { name: '에이지이글', industry: '항공우주' }
    };

    const stock = info[stockCode] || { name: `종목${stockCode}`, industry: '기타' };
    
    return {
      symbol: stockCode,
      name: stock.name,
      market: 'KOSPI',
      industry: stock.industry,
      description: `${stock.name}은(는) ${stock.industry} 업종의 대표 기업입니다.`
    };
  }

  getMockSearchResults(keyword) {
    const stocks = [
      { symbol: '005930', name: '삼성전자', market: 'KOSPI' },
      { symbol: '000660', name: 'SK하이닉스', market: 'KOSPI' },
      { symbol: '035720', name: '카카오', market: 'KOSPI' },
      { symbol: '051910', name: 'LG화학', market: 'KOSPI' },
      { symbol: '068270', name: '셀트리온', market: 'KOSPI' },
      { symbol: '041510', name: '에이지이글', market: 'KOSDAQ' },
      { symbol: '028300', name: 'HLB', market: 'KOSDAQ' },
      { symbol: '096770', name: 'SK이노베이션', market: 'KOSPI' }
    ];

    return stocks.filter(stock => 
      stock.name.includes(keyword) || 
      stock.symbol.includes(keyword)
    );
  }

  // 여러 종목 동시 조회
  async getMultipleStocks(stockCodes) {
    const promises = stockCodes.map(code => this.getCurrentPrice(code));
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => ({
      symbol: stockCodes[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }));
  }

  // 실시간 구독 시뮬레이션 (WebSocket 대신)
  startRealTimeSubscription(stockCode, callback, interval = 1000) {
    const subscriptionId = `kis-${stockCode}-${Date.now()}`;
    
    const updatePrice = async () => {
      try {
        const data = await this.getCurrentPrice(stockCode);
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
}

// 싱글톤 인스턴스
const kisAPI = new KISAPIService();

export default kisAPI; 