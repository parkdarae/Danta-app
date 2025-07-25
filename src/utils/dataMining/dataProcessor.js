/**
 * 주식 데이터 마이닝 프레임북 - 데이터 처리 모듈
 * 수치 데이터와 비수치 데이터의 수집, 정제, 정규화 담당
 */

// 데이터 타입 정의
export const DATA_TYPES = {
  NUMERICAL: 'numerical',
  TEXT: 'text',
  CATEGORICAL: 'categorical',
  TIME_SERIES: 'time_series',
  FINANCIAL: 'financial'
};

// 정규화 방법
export const NORMALIZATION_METHODS = {
  MIN_MAX: 'min_max',
  Z_SCORE: 'z_score',
  ROBUST: 'robust',
  LOG: 'log'
};

/**
 * 데이터 수집기 클래스
 */
export class DataCollector {
  constructor() {
    this.dataSources = new Map();
    this.collectionLog = [];
  }

  // 데이터 소스 등록
  registerDataSource(name, config) {
    this.dataSources.set(name, {
      ...config,
      lastUpdate: null,
      status: 'inactive'
    });
  }

  // 수치 데이터 수집 (가격, 거래량, 재무제표)
  async collectNumericalData(stockSymbol, startDate, endDate) {
    try {
      const data = {
        price: await this.collectPriceData(stockSymbol, startDate, endDate),
        volume: await this.collectVolumeData(stockSymbol, startDate, endDate),
        financial: await this.collectFinancialData(stockSymbol),
        technicalIndicators: await this.calculateTechnicalIndicators(stockSymbol)
      };

      this.logCollection('numerical', stockSymbol, data.price?.length || 0);
      return data;
    } catch (error) {
      console.error('수치 데이터 수집 실패:', error);
      return null;
    }
  }

  // 비수치 데이터 수집 (뉴스, 공시, 소셜 데이터)
  async collectTextualData(stockSymbol, days = 30) {
    try {
      const data = {
        news: await this.collectNewsData(stockSymbol, days),
        announcements: await this.collectAnnouncementData(stockSymbol, days),
        socialSentiment: await this.collectSocialData(stockSymbol, days),
        policyDocuments: await this.collectPolicyData(stockSymbol)
      };

      this.logCollection('textual', stockSymbol, data.news?.length || 0);
      return data;
    } catch (error) {
      console.error('비수치 데이터 수집 실패:', error);
      return null;
    }
  }

  // 가격 데이터 수집 (모의)
  async collectPriceData(symbol, startDate, endDate) {
    // 실제 구현에서는 API 호출
    const mockData = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      if (date.getDay() !== 0 && date.getDay() !== 6) { // 주말 제외
        const basePrice = 50000 + Math.random() * 50000;
        mockData.push({
          date: date.toISOString().split('T')[0],
          open: basePrice,
          high: basePrice * (1 + Math.random() * 0.05),
          low: basePrice * (1 - Math.random() * 0.05),
          close: basePrice + (Math.random() - 0.5) * basePrice * 0.03,
          volume: Math.floor(Math.random() * 1000000) + 100000
        });
      }
    }
    
    return mockData;
  }

  // 뉴스 데이터 수집 (모의)
  async collectNewsData(symbol, days) {
    const newsTopics = [
      '실적 발표', '신제품 출시', '정책 변화', '업계 동향', 
      '투자 유치', '파트너십', '기술 혁신', '시장 확대'
    ];
    
    const sentiments = ['positive', 'negative', 'neutral'];
    const mockNews = [];
    
    for (let i = 0; i < days * 2; i++) {
      mockNews.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: `${symbol} ${newsTopics[Math.floor(Math.random() * newsTopics.length)]} 관련 뉴스`,
        content: `${symbol}와 관련된 주요 뉴스 내용...`,
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        source: 'mock_news',
        keywords: this.extractKeywords(symbol),
        impact_score: Math.random()
      });
    }
    
    return mockNews;
  }

  // 키워드 추출 (간단한 모의)
  extractKeywords(symbol) {
    const keywords = {
      '삼성전자': ['반도체', '스마트폰', '디스플레이', '메모리'],
      '카카오': ['플랫폼', '메신저', '게임', '핀테크'],
      '에이지이글': ['바이오', '제약', '헬스케어', '신약']
    };
    
    return keywords[symbol] || ['기술', '혁신', '성장'];
  }

  // 수집 로그 기록
  logCollection(type, symbol, count) {
    this.collectionLog.push({
      timestamp: new Date().toISOString(),
      type,
      symbol,
      count,
      status: 'success'
    });
  }
}

/**
 * 데이터 정제 및 전처리 클래스
 */
export class DataPreprocessor {
  constructor() {
    this.preprocessingRules = new Map();
    this.transformationHistory = [];
  }

  // 결측값 처리
  handleMissingValues(data, method = 'mean') {
    if (!Array.isArray(data)) return data;
    
    const cleanedData = [...data];
    const validValues = cleanedData.filter(val => val !== null && val !== undefined && !isNaN(val));
    
    if (validValues.length === 0) return data;
    
    let fillValue;
    switch (method) {
      case 'mean':
        fillValue = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
        break;
      case 'median':
        const sorted = [...validValues].sort((a, b) => a - b);
        fillValue = sorted[Math.floor(sorted.length / 2)];
        break;
      case 'mode':
        const frequency = {};
        validValues.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
        fillValue = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
        break;
      default:
        fillValue = 0;
    }
    
    return cleanedData.map(val => 
      val === null || val === undefined || isNaN(val) ? fillValue : val
    );
  }

  // 정규화
  normalize(data, method = NORMALIZATION_METHODS.MIN_MAX) {
    if (!Array.isArray(data) || data.length === 0) return data;
    
    const validData = data.filter(val => val !== null && val !== undefined && !isNaN(val));
    if (validData.length === 0) return data;
    
    const min = Math.min(...validData);
    const max = Math.max(...validData);
    const mean = validData.reduce((sum, val) => sum + val, 0) / validData.length;
    const std = Math.sqrt(validData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validData.length);
    
    return data.map(val => {
      if (val === null || val === undefined || isNaN(val)) return val;
      
      switch (method) {
        case NORMALIZATION_METHODS.MIN_MAX:
          return (val - min) / (max - min);
        case NORMALIZATION_METHODS.Z_SCORE:
          return (val - mean) / std;
        case NORMALIZATION_METHODS.LOG:
          return val > 0 ? Math.log(val) : 0;
        default:
          return val;
      }
    });
  }

  // 텍스트 전처리
  preprocessText(text) {
    if (!text || typeof text !== 'string') return '';
    
    // 기본 정제
    let cleaned = text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, ' ') // 특수문자 제거
      .replace(/\s+/g, ' ') // 공백 정리
      .trim();
    
    // 불용어 제거 (한국어 기본)
    const stopWords = ['은', '는', '이', '가', '을', '를', '의', '와', '과', '에', '에서', '로', '으로'];
    const words = cleaned.split(' ');
    const filteredWords = words.filter(word => 
      word.length > 1 && !stopWords.includes(word)
    );
    
    return filteredWords.join(' ');
  }

  // 감성 분석 (간단한 키워드 기반)
  analyzeSentiment(text) {
    const positiveWords = ['상승', '증가', '호재', '성장', '이익', '개선', '긍정', '좋은', '성공'];
    const negativeWords = ['하락', '감소', '악재', '위험', '손실', '악화', '부정', '나쁜', '실패'];
    
    const words = this.preprocessText(text).split(' ');
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.some(pos => word.includes(pos))) score += 1;
      if (negativeWords.some(neg => word.includes(neg))) score -= 1;
    });
    
    // 정규화 (-1 ~ 1)
    const maxScore = Math.max(positiveWords.length, negativeWords.length);
    const normalizedScore = Math.max(-1, Math.min(1, score / maxScore));
    
    return {
      score: normalizedScore,
      sentiment: normalizedScore > 0.1 ? 'positive' : 
                normalizedScore < -0.1 ? 'negative' : 'neutral',
      confidence: Math.abs(normalizedScore)
    };
  }

  // 원-핫 인코딩
  oneHotEncode(categories, allCategories) {
    const encoded = {};
    allCategories.forEach(cat => {
      encoded[`is_${cat}`] = categories.includes(cat) ? 1 : 0;
    });
    return encoded;
  }

  // 시계열 특성 생성
  createTimeSeriesFeatures(data, windowSize = 5) {
    if (!Array.isArray(data) || data.length < windowSize) return [];
    
    const features = [];
    
    for (let i = windowSize; i < data.length; i++) {
      const window = data.slice(i - windowSize, i);
      const current = data[i];
      
      features.push({
        index: i,
        current_value: current,
        moving_average: window.reduce((sum, val) => sum + val, 0) / windowSize,
        volatility: this.calculateVolatility(window),
        trend: this.calculateTrend(window),
        momentum: current - window[0],
        relative_position: this.calculateRelativePosition(current, window)
      });
    }
    
    return features;
  }

  // 변동성 계산
  calculateVolatility(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // 추세 계산
  calculateTrend(values) {
    if (values.length < 2) return 0;
    const first = values[0];
    const last = values[values.length - 1];
    return (last - first) / first;
  }

  // 상대적 위치 계산
  calculateRelativePosition(current, window) {
    const min = Math.min(...window);
    const max = Math.max(...window);
    return max === min ? 0.5 : (current - min) / (max - min);
  }
}

/**
 * 기술 지표 계산기
 */
export class TechnicalIndicatorCalculator {
  // RSI 계산
  static calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return [];
    
    const gains = [];
    const losses = [];
    
    // 가격 변화 계산
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const rsiValues = [];
    
    // 첫 번째 RSI 계산
    let avgGain = gains.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
    
    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      
      rsiValues.push({
        index: i + 1,
        rsi: rsi,
        signal: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral'
      });
    }
    
    return rsiValues;
  }

  // MACD 계산
  static calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (prices.length < slowPeriod) return [];
    
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    const macdLine = [];
    const minLength = Math.min(fastEMA.length, slowEMA.length);
    
    for (let i = 0; i < minLength; i++) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
    
    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    const macdResult = [];
    
    for (let i = 0; i < signalLine.length; i++) {
      const macd = macdLine[i + (macdLine.length - signalLine.length)];
      const signal = signalLine[i];
      const histogram = macd - signal;
      
      macdResult.push({
        index: i + slowPeriod,
        macd: macd,
        signal: signal,
        histogram: histogram,
        crossover: i > 0 && 
          (macd > signal && macdLine[i - 1] <= signalLine[i - 1]) ? 'bullish' :
          (macd < signal && macdLine[i - 1] >= signalLine[i - 1]) ? 'bearish' : 'none'
      });
    }
    
    return macdResult;
  }

  // EMA 계산
  static calculateEMA(prices, period) {
    if (prices.length < period) return [];
    
    const multiplier = 2 / (period + 1);
    const emaValues = [];
    
    // 첫 번째 EMA는 SMA로 시작
    let ema = prices.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
    emaValues.push(ema);
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
      emaValues.push(ema);
    }
    
    return emaValues;
  }

  // 볼린저 밴드 계산
  static calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) return [];
    
    const bands = [];
    
    for (let i = period - 1; i < prices.length; i++) {
      const window = prices.slice(i - period + 1, i + 1);
      const sma = window.reduce((sum, val) => sum + val, 0) / period;
      
      const variance = window.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
      const std = Math.sqrt(variance);
      
      const upperBand = sma + (std * stdDev);
      const lowerBand = sma - (std * stdDev);
      const currentPrice = prices[i];
      
      bands.push({
        index: i,
        upperBand: upperBand,
        middleBand: sma,
        lowerBand: lowerBand,
        price: currentPrice,
        bandwidth: ((upperBand - lowerBand) / sma) * 100,
        percentB: (currentPrice - lowerBand) / (upperBand - lowerBand),
        squeeze: ((upperBand - lowerBand) / sma) < 0.1,
        signal: currentPrice > upperBand ? 'overbought' : 
               currentPrice < lowerBand ? 'oversold' : 'normal'
      });
    }
    
    return bands;
  }
}

/**
 * 통합 데이터 처리 매니저
 */
export class DataMiningManager {
  constructor() {
    this.collector = new DataCollector();
    this.preprocessor = new DataPreprocessor();
    this.processingQueue = [];
    this.results = new Map();
  }

  // 종합 데이터 처리 파이프라인
  async processStockData(symbol, options = {}) {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate = new Date().toISOString().split('T')[0],
      includeNews = true,
      includeTechnicals = true,
      normalizationMethod = NORMALIZATION_METHODS.MIN_MAX
    } = options;

    try {
      console.log(`📊 ${symbol} 데이터 마이닝 시작...`);

      // 1. 데이터 수집
      const [numericalData, textualData] = await Promise.all([
        this.collector.collectNumericalData(symbol, startDate, endDate),
        includeNews ? this.collector.collectTextualData(symbol) : null
      ]);

      // 2. 데이터 전처리
      const processedData = this.preprocessAllData(numericalData, textualData, {
        normalizationMethod,
        includeTechnicals
      });

      // 3. 결과 저장
      this.results.set(symbol, {
        timestamp: new Date().toISOString(),
        rawData: { numerical: numericalData, textual: textualData },
        processedData: processedData,
        metadata: {
          symbol,
          startDate,
          endDate,
          processingOptions: options
        }
      });

      console.log(`✅ ${symbol} 데이터 마이닝 완료`);
      return processedData;

    } catch (error) {
      console.error(`❌ ${symbol} 데이터 마이닝 실패:`, error);
      throw error;
    }
  }

  // 전체 데이터 전처리
  preprocessAllData(numericalData, textualData, options) {
    const processed = {
      price: null,
      technicalIndicators: null,
      sentiment: null,
      keywords: [],
      features: {}
    };

    // 가격 데이터 처리
    if (numericalData?.price) {
      const prices = numericalData.price.map(d => d.close);
      processed.price = {
        raw: numericalData.price,
        normalized: this.preprocessor.normalize(prices, options.normalizationMethod),
        features: this.preprocessor.createTimeSeriesFeatures(prices)
      };

      // 기술 지표 계산
      if (options.includeTechnicals) {
        processed.technicalIndicators = {
          rsi: TechnicalIndicatorCalculator.calculateRSI(prices),
          macd: TechnicalIndicatorCalculator.calculateMACD(prices),
          bollinger: TechnicalIndicatorCalculator.calculateBollingerBands(prices)
        };
      }
    }

    // 텍스트 데이터 처리
    if (textualData?.news) {
      const sentiments = textualData.news.map(news => 
        this.preprocessor.analyzeSentiment(news.content)
      );

      processed.sentiment = {
        overall: sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length,
        distribution: this.calculateSentimentDistribution(sentiments),
        timeline: this.createSentimentTimeline(textualData.news, sentiments)
      };

      // 키워드 추출 및 집계
      processed.keywords = this.aggregateKeywords(textualData.news);
    }

    return processed;
  }

  // 감성 분포 계산
  calculateSentimentDistribution(sentiments) {
    const distribution = { positive: 0, neutral: 0, negative: 0 };
    sentiments.forEach(s => distribution[s.sentiment]++);
    
    const total = sentiments.length;
    return {
      positive: (distribution.positive / total) * 100,
      neutral: (distribution.neutral / total) * 100,
      negative: (distribution.negative / total) * 100
    };
  }

  // 감성 타임라인 생성
  createSentimentTimeline(news, sentiments) {
    const timeline = {};
    
    news.forEach((item, index) => {
      const date = item.date;
      if (!timeline[date]) {
        timeline[date] = { scores: [], count: 0 };
      }
      timeline[date].scores.push(sentiments[index].score);
      timeline[date].count++;
    });

    // 일별 평균 감성 점수 계산
    Object.keys(timeline).forEach(date => {
      const scores = timeline[date].scores;
      timeline[date].average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    });

    return timeline;
  }

  // 키워드 집계
  aggregateKeywords(news) {
    const keywordFreq = {};
    
    news.forEach(item => {
      if (item.keywords) {
        item.keywords.forEach(keyword => {
          keywordFreq[keyword] = (keywordFreq[keyword] || 0) + 1;
        });
      }
    });

    return Object.entries(keywordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([keyword, freq]) => ({ keyword, frequency: freq }));
  }

  // 처리 결과 조회
  getProcessedData(symbol) {
    return this.results.get(symbol);
  }

  // 모든 처리 결과 조회
  getAllResults() {
    return Array.from(this.results.entries()).map(([symbol, data]) => ({
      symbol,
      ...data
    }));
  }
} 