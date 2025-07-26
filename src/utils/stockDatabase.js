// 실제 종목 데이터베이스 관리 시스템
import { kisAPI } from './kisAPI';

// 종목 데이터베이스 스키마
const STOCK_DB_SCHEMA = {
  // 한국 주식
  KR_STOCKS: 'kr_stocks',
  // 미국 주식  
  US_STOCKS: 'us_stocks',
  // 한국 채권
  KR_BONDS: 'kr_bonds',
  // ETF
  ETF: 'etf',
  // 리츠
  REIT: 'reit'
};

// 종목 분류 체계
const SECTOR_MAPPING = {
  // IT/기술
  'IT': ['소프트웨어', '하드웨어', '반도체', '인터넷', '게임', 'AI', '빅데이터'],
  // 바이오/헬스케어
  'BIO': ['제약', '바이오', '의료기기', '병원', '헬스케어'],
  // 자동차/운송
  'AUTO': ['자동차', '자동차부품', '항공', '해운', '철도'],
  // 에너지/화학
  'ENERGY': ['석유', '가스', '화학', '정유', '전력', '신재생에너지'],
  // 금융
  'FINANCE': ['은행', '증권', '보험', '카드', '핀테크'],
  // 소비재
  'CONSUMER': ['식품', '음료', '화장품', '의류', '유통'],
  // 건설/부동산
  'CONSTRUCTION': ['건설', '건자재', '부동산', '리츠'],
  // 미디어/엔터테인먼트
  'MEDIA': ['방송', '광고', '엔터테인먼트', '교육'],
  // 기계/조선
  'MACHINERY': ['기계', '조선', '철강', '비철금속']
};

// 키워드 매핑 데이터베이스
const KEYWORD_MAPPING = {
  // AI 관련 키워드
  'AI': ['인공지능', 'AI', '머신러닝', '딥러닝', 'ChatGPT', 'LLM', '자연어처리'],
  '반도체': ['반도체', 'GPU', 'CPU', '메모리', 'DRAM', 'NAND', '파운드리'],
  '전기차': ['전기차', 'EV', '배터리', '2차전지', '리튬', '자율주행'],
  '바이오': ['바이오', '제약', '신약', '백신', '항체', '세포치료', '유전자치료'],
  '게임': ['게임', '모바일게임', 'PC게임', '콘솔게임', '메타버스', 'NFT'],
  '드론': ['드론', '무인기', 'UAV', '항공', '국방', '물류드론'],
  '우주': ['우주', '위성', '로켓', '항공우주', '우주관광', '우주통신'],
  '친환경': ['ESG', '친환경', '탄소중립', '신재생에너지', '태양광', '풍력', '수소'],
  '밈': ['밈', '소셜미디어', '커뮤니티', '레딧', '틱톡', '유튜브']
};

class StockDatabase {
  constructor() {
    this.isInitialized = false;
    this.lastUpdate = null;
    this.stockData = {
      [STOCK_DB_SCHEMA.KR_STOCKS]: [],
      [STOCK_DB_SCHEMA.US_STOCKS]: [],
      [STOCK_DB_SCHEMA.KR_BONDS]: [],
      [STOCK_DB_SCHEMA.ETF]: [],
      [STOCK_DB_SCHEMA.REIT]: []
    };
    this.keywordIndex = new Map(); // 키워드별 종목 인덱스
    this.sectorIndex = new Map();  // 섹터별 종목 인덱스
  }

  // 데이터베이스 초기화
  async initialize() {
    try {
      console.log('📊 종목 데이터베이스 초기화 시작...');
      
      // 로컬 스토리지에서 캐시된 데이터 확인
      const cachedData = this.loadCachedData();
      if (cachedData && this.isCacheValid(cachedData)) {
        console.log('💾 캐시된 데이터 사용');
        this.stockData = cachedData.data;
        this.lastUpdate = new Date(cachedData.timestamp);
        this.buildIndexes();
        this.isInitialized = true;
        return;
      }

      // 실제 API에서 데이터 수집
      await this.fetchAllStockData();
      this.buildIndexes();
      this.saveToCacheData();
      this.isInitialized = true;
      
      console.log('✅ 종목 데이터베이스 초기화 완료');
    } catch (error) {
      console.error('❌ 종목 데이터베이스 초기화 실패:', error);
      // 백업 데이터 사용
      this.loadBackupData();
    }
  }

  // 모든 종목 데이터 수집
  async fetchAllStockData() {
    const fetchPromises = [
      this.fetchKoreanStocks(),
      this.fetchUSStocks(),
      this.fetchKoreanBonds(),
      this.fetchETFs(),
      this.fetchREITs()
    ];

    const results = await Promise.allSettled(fetchPromises);
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`데이터 수집 실패 (${index}):`, result.reason);
      }
    });
  }

  // 한국 주식 데이터 수집
  async fetchKoreanStocks() {
    try {
      console.log('🇰🇷 한국 주식 데이터 수집 중...');
      
      // 한국투자증권 API 호출 (코스피 + 코스닥)
      const kospiData = await this.fetchKISMarketData('KOSPI');
      const kosdaqData = await this.fetchKISMarketData('KOSDAQ');
      
      const koreanStocks = [...kospiData, ...kosdaqData].map(stock => ({
        symbol: stock.mksc_shrn_iscd, // 종목코드
        name: stock.hts_kor_isnm,     // 종목명
        market: stock.mktc_scls_kcd,  // 시장구분
        sector: this.classifySector(stock.hts_kor_isnm),
        keywords: this.generateKeywords(stock.hts_kor_isnm),
        type: 'KR_STOCK',
        currency: 'KRW',
        exchange: stock.mktc_scls_kcd === '001' ? 'KOSPI' : 'KOSDAQ'
      }));

      this.stockData[STOCK_DB_SCHEMA.KR_STOCKS] = koreanStocks;
      console.log(`✅ 한국 주식 ${koreanStocks.length}개 수집 완료`);
      
    } catch (error) {
      console.error('❌ 한국 주식 데이터 수집 실패:', error);
      // 백업 데이터 사용
      this.stockData[STOCK_DB_SCHEMA.KR_STOCKS] = this.getBackupKoreanStocks();
    }
  }

  // 미국 주식 데이터 수집
  async fetchUSStocks() {
    try {
      console.log('🇺🇸 미국 주식 데이터 수집 중...');
      
      // Alpha Vantage API 또는 Finnhub API 사용
      const response = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=demo`);
      const usStocks = await response.json();
      
      const processedUSStocks = usStocks.slice(0, 1000).map(stock => ({
        symbol: stock.symbol,
        name: stock.description,
        market: 'US',
        sector: this.classifySector(stock.description),
        keywords: this.generateKeywords(stock.description),
        type: 'US_STOCK',
        currency: 'USD',
        exchange: 'NASDAQ'
      }));

      this.stockData[STOCK_DB_SCHEMA.US_STOCKS] = processedUSStocks;
      console.log(`✅ 미국 주식 ${processedUSStocks.length}개 수집 완료`);
      
    } catch (error) {
      console.error('❌ 미국 주식 데이터 수집 실패:', error);
      this.stockData[STOCK_DB_SCHEMA.US_STOCKS] = this.getBackupUSStocks();
    }
  }

  // 한국 채권 데이터 수집
  async fetchKoreanBonds() {
    try {
      console.log('💰 한국 채권 데이터 수집 중...');
      
      // 한국투자증권 채권 API 호출
      const bondData = await this.fetchKISBondData();
      
      const koreanBonds = bondData.map(bond => ({
        symbol: bond.bond_code,
        name: bond.bond_name,
        market: 'KR',
        sector: 'BOND',
        keywords: ['채권', '국채', '회사채', '금리'],
        type: 'KR_BOND',
        currency: 'KRW',
        maturityDate: bond.maturity_date,
        interestRate: bond.interest_rate
      }));

      this.stockData[STOCK_DB_SCHEMA.KR_BONDS] = koreanBonds;
      console.log(`✅ 한국 채권 ${koreanBonds.length}개 수집 완료`);
      
    } catch (error) {
      console.error('❌ 한국 채권 데이터 수집 실패:', error);
      this.stockData[STOCK_DB_SCHEMA.KR_BONDS] = this.getBackupKoreanBonds();
    }
  }

  // ETF 데이터 수집
  async fetchETFs() {
    try {
      console.log('📈 ETF 데이터 수집 중...');
      
      // 한국 + 미국 ETF 데이터
      const krETFs = await this.fetchKISETFData();
      const usETFs = await this.fetchUSETFData();
      
      const allETFs = [...krETFs, ...usETFs].map(etf => ({
        symbol: etf.symbol,
        name: etf.name,
        market: etf.market,
        sector: 'ETF',
        keywords: this.generateETFKeywords(etf.name),
        type: 'ETF',
        currency: etf.currency,
        underlying: etf.underlying // 추적 지수
      }));

      this.stockData[STOCK_DB_SCHEMA.ETF] = allETFs;
      console.log(`✅ ETF ${allETFs.length}개 수집 완료`);
      
    } catch (error) {
      console.error('❌ ETF 데이터 수집 실패:', error);
      this.stockData[STOCK_DB_SCHEMA.ETF] = this.getBackupETFs();
    }
  }

  // 리츠 데이터 수집
  async fetchREITs() {
    try {
      console.log('🏢 리츠 데이터 수집 중...');
      
      const reitData = await this.fetchKISREITData();
      
      const reits = reitData.map(reit => ({
        symbol: reit.symbol,
        name: reit.name,
        market: 'KR',
        sector: 'REIT',
        keywords: ['리츠', 'REIT', '부동산', '배당'],
        type: 'REIT',
        currency: 'KRW',
        propertyType: reit.property_type
      }));

      this.stockData[STOCK_DB_SCHEMA.REIT] = reits;
      console.log(`✅ 리츠 ${reits.length}개 수집 완료`);
      
    } catch (error) {
      console.error('❌ 리츠 데이터 수집 실패:', error);
      this.stockData[STOCK_DB_SCHEMA.REIT] = this.getBackupREITs();
    }
  }

  // 키워드로 종목 검색
  searchByKeywords(keywords, options = {}) {
    if (!this.isInitialized) {
      console.warn('⚠️ 데이터베이스가 초기화되지 않았습니다');
      return [];
    }

    const {
      limit = 50,
      markets = ['KR', 'US'],
      types = ['KR_STOCK', 'US_STOCK', 'ETF'],
      minRelevance = 0.3
    } = options;

    let results = [];

    // 모든 종목 데이터에서 검색
    Object.values(this.stockData).flat().forEach(stock => {
      if (!markets.includes(stock.market) || !types.includes(stock.type)) {
        return;
      }

      const relevanceScore = this.calculateRelevance(stock, keywords);
      if (relevanceScore >= minRelevance) {
        results.push({
          ...stock,
          relevanceScore,
          matchedKeywords: this.getMatchedKeywords(stock, keywords)
        });
      }
    });

    // 관련도 순으로 정렬
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return results.slice(0, limit);
  }

  // 관련도 계산
  calculateRelevance(stock, searchKeywords) {
    let score = 0;
    const stockKeywords = [...stock.keywords, stock.name, stock.symbol];
    
    searchKeywords.forEach(searchKeyword => {
      stockKeywords.forEach(stockKeyword => {
        // 완전 일치
        if (stockKeyword.toLowerCase() === searchKeyword.toLowerCase()) {
          score += 1.0;
        }
        // 부분 일치
        else if (stockKeyword.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                 searchKeyword.toLowerCase().includes(stockKeyword.toLowerCase())) {
          score += 0.7;
        }
        // 키워드 매핑 확인
        else if (this.checkKeywordMapping(searchKeyword, stockKeyword)) {
          score += 0.8;
        }
      });
    });

    return Math.min(score / searchKeywords.length, 1.0);
  }

  // 매칭된 키워드 추출
  getMatchedKeywords(stock, searchKeywords) {
    const matched = [];
    const stockKeywords = [...stock.keywords, stock.name];
    
    searchKeywords.forEach(searchKeyword => {
      stockKeywords.forEach(stockKeyword => {
        if (stockKeyword.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            searchKeyword.toLowerCase().includes(stockKeyword.toLowerCase())) {
          matched.push(stockKeyword);
        }
      });
    });

    return [...new Set(matched)];
  }

  // 섹터 분류
  classifySector(name) {
    for (const [sector, keywords] of Object.entries(SECTOR_MAPPING)) {
      for (const keyword of keywords) {
        if (name.includes(keyword)) {
          return sector;
        }
      }
    }
    return 'ETC';
  }

  // 키워드 생성
  generateKeywords(name) {
    const keywords = [];
    
    // 이름에서 키워드 추출
    Object.entries(KEYWORD_MAPPING).forEach(([category, relatedWords]) => {
      if (relatedWords.some(word => name.includes(word))) {
        keywords.push(category, ...relatedWords);
      }
    });

    // 회사명에서 키워드 추출
    const nameWords = name.split(/[\s\(\)]+/).filter(word => word.length > 1);
    keywords.push(...nameWords);

    return [...new Set(keywords)];
  }

  // 키워드 매핑 확인
  checkKeywordMapping(searchKeyword, stockKeyword) {
    for (const mappedKeywords of Object.values(KEYWORD_MAPPING)) {
      if (mappedKeywords.includes(searchKeyword) && mappedKeywords.includes(stockKeyword)) {
        return true;
      }
    }
    return false;
  }

  // 인덱스 구축
  buildIndexes() {
    this.keywordIndex.clear();
    this.sectorIndex.clear();

    Object.values(this.stockData).flat().forEach(stock => {
      // 키워드 인덱스
      stock.keywords.forEach(keyword => {
        if (!this.keywordIndex.has(keyword)) {
          this.keywordIndex.set(keyword, []);
        }
        this.keywordIndex.get(keyword).push(stock);
      });

      // 섹터 인덱스
      if (!this.sectorIndex.has(stock.sector)) {
        this.sectorIndex.set(stock.sector, []);
      }
      this.sectorIndex.get(stock.sector).push(stock);
    });
  }

  // 캐시 데이터 로드
  loadCachedData() {
    try {
      const cached = localStorage.getItem('stock_database_cache');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  // 캐시 유효성 확인 (24시간)
  isCacheValid(cachedData) {
    if (!cachedData.timestamp) return false;
    const now = new Date();
    const cacheTime = new Date(cachedData.timestamp);
    return (now - cacheTime) < 24 * 60 * 60 * 1000;
  }

  // 캐시 데이터 저장
  saveToCacheData() {
    try {
      const cacheData = {
        data: this.stockData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('stock_database_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('캐시 저장 실패:', error);
    }
  }

  // 백업 데이터 (API 실패 시 사용)
  getBackupKoreanStocks() {
    return [
      { symbol: '005930', name: '삼성전자', market: 'KR', sector: 'IT', keywords: ['반도체', '메모리', 'AI', '스마트폰'], type: 'KR_STOCK', currency: 'KRW', exchange: 'KOSPI' },
      { symbol: '000660', name: 'SK하이닉스', market: 'KR', sector: 'IT', keywords: ['반도체', 'DRAM', 'NAND', '메모리'], type: 'KR_STOCK', currency: 'KRW', exchange: 'KOSPI' },
      { symbol: '035420', name: 'NAVER', market: 'KR', sector: 'IT', keywords: ['인터넷', '검색', 'AI', '클라우드'], type: 'KR_STOCK', currency: 'KRW', exchange: 'KOSPI' },
      { symbol: '005380', name: '현대차', market: 'KR', sector: 'AUTO', keywords: ['자동차', '전기차', 'EV', '수소차'], type: 'KR_STOCK', currency: 'KRW', exchange: 'KOSPI' },
      { symbol: '373220', name: 'LG에너지솔루션', market: 'KR', sector: 'ENERGY', keywords: ['배터리', '2차전지', '전기차', 'ESS'], type: 'KR_STOCK', currency: 'KRW', exchange: 'KOSPI' }
    ];
  }

  getBackupUSStocks() {
    return [
      { symbol: 'AAPL', name: 'Apple Inc', market: 'US', sector: 'IT', keywords: ['스마트폰', 'iPhone', '반도체', 'AI'], type: 'US_STOCK', currency: 'USD', exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corp', market: 'US', sector: 'IT', keywords: ['소프트웨어', '클라우드', 'AI', 'ChatGPT'], type: 'US_STOCK', currency: 'USD', exchange: 'NASDAQ' },
      { symbol: 'NVDA', name: 'NVIDIA Corp', market: 'US', sector: 'IT', keywords: ['GPU', 'AI', '딥러닝', '반도체'], type: 'US_STOCK', currency: 'USD', exchange: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla Inc', market: 'US', sector: 'AUTO', keywords: ['전기차', 'EV', '자율주행', '배터리'], type: 'US_STOCK', currency: 'USD', exchange: 'NASDAQ' },
      { symbol: 'UAVS', name: 'AgEagle Aerial Systems', market: 'US', sector: 'AUTO', keywords: ['드론', 'UAV', '항공', '국방'], type: 'US_STOCK', currency: 'USD', exchange: 'NASDAQ' }
    ];
  }

  // 기타 백업 데이터들...
  getBackupKoreanBonds() { return []; }
  getBackupETFs() { return []; }
  getBackupREITs() { return []; }

  // API 호출 메서드들 (실제 구현)
  async fetchKISMarketData(market) {
    // 한국투자증권 API 실제 호출
    // 현재는 mock 데이터 반환
    return [];
  }

  async fetchKISBondData() { return []; }
  async fetchKISETFData() { return []; }
  async fetchUSETFData() { return []; }
  async fetchKISREITData() { return []; }
}

// 싱글톤 인스턴스
const stockDatabase = new StockDatabase();

export default stockDatabase;

// 편의 함수들
export const initializeStockDB = () => stockDatabase.initialize();
export const searchStocks = (keywords, options) => stockDatabase.searchByKeywords(keywords, options);
export const getStocksByKeyword = (keyword) => stockDatabase.keywordIndex.get(keyword) || [];
export const getStocksBySector = (sector) => stockDatabase.sectorIndex.get(sector) || []; 