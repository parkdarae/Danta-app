// 한국 + 미국 주식 종합 마스터 데이터베이스
export const STOCK_MASTER_DB = {
  // 🇰🇷 한국 주식 (KOSPI + KOSDAQ 주요 종목)
  KOR: {
    // KOSPI 대형주
    '005930': { 
      symbol: '005930', 
      name: '삼성전자', 
      nameEng: 'Samsung Electronics Co Ltd',
      market: 'KOSPI', 
      sector: '반도체', 
      industry: 'IT하드웨어',
      keywords: ['삼성', 'samsung', '반도체', 'semiconductor', 'electronics'],
      marketCap: 500000000000000, // 500조
      currency: 'KRW'
    },
    '000660': { 
      symbol: '000660', 
      name: 'SK하이닉스', 
      nameEng: 'SK Hynix Inc',
      market: 'KOSPI', 
      sector: '반도체', 
      industry: 'IT하드웨어',
      keywords: ['하이닉스', 'hynix', '반도체', 'memory', '메모리'],
      marketCap: 80000000000000,
      currency: 'KRW'
    },
    '035720': { 
      symbol: '035720', 
      name: '카카오', 
      nameEng: 'Kakao Corp',
      market: 'KOSPI', 
      sector: 'IT서비스', 
      industry: '플랫폼',
      keywords: ['카카오', 'kakao', '플랫폼', 'platform', 'messenger'],
      marketCap: 20000000000000,
      currency: 'KRW'
    },
    '051910': { 
      symbol: '051910', 
      name: 'LG화학', 
      nameEng: 'LG Chem Ltd',
      market: 'KOSPI', 
      sector: '화학', 
      industry: '배터리',
      keywords: ['lg', '화학', 'chem', 'battery', '배터리'],
      marketCap: 60000000000000,
      currency: 'KRW'
    },
    '068270': { 
      symbol: '068270', 
      name: '셀트리온', 
      nameEng: 'Celltrion Inc',
      market: 'KOSPI', 
      sector: '바이오', 
      industry: '의약품',
      keywords: ['셀트리온', 'celltrion', '바이오', 'bio', 'pharma'],
      marketCap: 30000000000000,
      currency: 'KRW'
    },
    '373220': { 
      symbol: '373220', 
      name: 'LG에너지솔루션', 
      nameEng: 'LG Energy Solution Ltd',
      market: 'KOSPI', 
      sector: '배터리', 
      industry: '2차전지',
      keywords: ['lg', '에너지', 'energy', 'battery', '배터리', '솔루션'],
      marketCap: 90000000000000,
      currency: 'KRW'
    },
    '207940': { 
      symbol: '207940', 
      name: '삼성바이오로직스', 
      nameEng: 'Samsung Biologics Co Ltd',
      market: 'KOSPI', 
      sector: '바이오', 
      industry: 'CMO',
      keywords: ['삼성', '바이오', 'samsung', 'biologics', 'cmo'],
      marketCap: 50000000000000,
      currency: 'KRW'
    },
    '006400': { 
      symbol: '006400', 
      name: '삼성SDI', 
      nameEng: 'Samsung SDI Co Ltd',
      market: 'KOSPI', 
      sector: '배터리', 
      industry: '2차전지',
      keywords: ['삼성', 'sdi', '배터리', 'battery', 'secondary'],
      marketCap: 40000000000000,
      currency: 'KRW'
    },
    '005380': { 
      symbol: '005380', 
      name: '현대차', 
      nameEng: 'Hyundai Motor Co',
      market: 'KOSPI', 
      sector: '자동차', 
      industry: '완성차',
      keywords: ['현대', 'hyundai', '자동차', 'motor', 'car'],
      marketCap: 35000000000000,
      currency: 'KRW'
    },
    '000270': { 
      symbol: '000270', 
      name: '기아', 
      nameEng: 'Kia Corp',
      market: 'KOSPI', 
      sector: '자동차', 
      industry: '완성차',
      keywords: ['기아', 'kia', '자동차', 'motor', 'car'],
      marketCap: 30000000000000,
      currency: 'KRW'
    },
    
    // KOSDAQ 주요 종목
    '091990': { 
      symbol: '091990', 
      name: '셀트리온헬스케어', 
      nameEng: 'Celltrion Healthcare Co Ltd',
      market: 'KOSDAQ', 
      sector: '바이오', 
      industry: '의약품유통',
      keywords: ['셀트리온', 'celltrion', 'healthcare', '헬스케어', '바이오'],
      marketCap: 15000000000000,
      currency: 'KRW'
    },
    '086900': { 
      symbol: '086900', 
      name: '메디톡스', 
      nameEng: 'Medytox Inc',
      market: 'KOSDAQ', 
      sector: '바이오', 
      industry: '의약품',
      keywords: ['메디톡스', 'medytox', '보톡스', 'botox', '바이오'],
      marketCap: 8000000000000,
      currency: 'KRW'
    },
    '196170': { 
      symbol: '196170', 
      name: '알테오젠', 
      nameEng: 'Alteogen Inc',
      market: 'KOSDAQ', 
      sector: '바이오', 
      industry: '의약품',
      keywords: ['알테오젠', 'alteogen', '바이오', 'bio', 'drug'],
      marketCap: 6000000000000,
      currency: 'KRW'
    },
    '067310': { 
      symbol: '067310', 
      name: '하림지주', 
      nameEng: 'Harim Holdings Co Ltd',
      market: 'KOSDAQ', 
      sector: '식품', 
      industry: '육류가공',
      keywords: ['하림', 'harim', '식품', 'food', '닭고기'],
      marketCap: 2000000000000,
      currency: 'KRW'
    }
  },

  // 🇺🇸 미국 주식 (주요 거래소별)
  USA: {
    // 🎯 에이지이글에어리얼 시스템스 - 최우선
    'UAVS': {
      symbol: 'UAVS',
      name: 'AgEagle Aerial Systems Inc',
      nameKor: '에이지이글에어리얼 시스템스',
      market: 'NYSE American',
      sector: 'Aerospace & Defense',
      industry: 'Drone Technology',
      keywords: ['uavs', 'ageagle', 'aerial', 'systems', 'drone', 'uav', '에이지이글', '에이지이글에어리얼', '드론'],
      marketCap: 150000000, // 1.5억 달러
      currency: 'USD',
      exchange: 'NYS'
    },

    // Big Tech (FAANG+)
    'AAPL': {
      symbol: 'AAPL',
      name: 'Apple Inc',
      nameKor: '애플',
      market: 'NASDAQ',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      keywords: ['apple', 'iphone', 'mac', 'ios', '애플', 'tech'],
      marketCap: 3000000000000, // 3조 달러
      currency: 'USD',
      exchange: 'NAS'
    },
    'MSFT': {
      symbol: 'MSFT',
      name: 'Microsoft Corp',
      nameKor: '마이크로소프트',
      market: 'NASDAQ',
      sector: 'Technology',
      industry: 'Software',
      keywords: ['microsoft', 'windows', 'azure', 'office', '마이크로소프트'],
      marketCap: 2800000000000,
      currency: 'USD',
      exchange: 'NAS'
    },
    'GOOGL': {
      symbol: 'GOOGL',
      name: 'Alphabet Inc',
      nameKor: '알파벳(구글)',
      market: 'NASDAQ',
      sector: 'Technology',
      industry: 'Internet Services',
      keywords: ['google', 'alphabet', 'search', 'android', '구글', '알파벳'],
      marketCap: 1700000000000,
      currency: 'USD',
      exchange: 'NAS'
    },
    'AMZN': {
      symbol: 'AMZN',
      name: 'Amazon.com Inc',
      nameKor: '아마존',
      market: 'NASDAQ',
      sector: 'Consumer Discretionary',
      industry: 'E-commerce',
      keywords: ['amazon', 'aws', 'ecommerce', 'cloud', '아마존'],
      marketCap: 1500000000000,
      currency: 'USD',
      exchange: 'NAS'
    },
    'META': {
      symbol: 'META',
      name: 'Meta Platforms Inc',
      nameKor: '메타(페이스북)',
      market: 'NASDAQ',
      sector: 'Technology',
      industry: 'Social Media',
      keywords: ['meta', 'facebook', 'instagram', 'whatsapp', '메타', '페이스북'],
      marketCap: 800000000000,
      currency: 'USD',
      exchange: 'NAS'
    },
    'TSLA': {
      symbol: 'TSLA',
      name: 'Tesla Inc',
      nameKor: '테슬라',
      market: 'NASDAQ',
      sector: 'Consumer Discretionary',
      industry: 'Electric Vehicles',
      keywords: ['tesla', 'electric', 'ev', 'musk', '테슬라', '전기차'],
      marketCap: 800000000000,
      currency: 'USD',
      exchange: 'NAS'
    },
    'NVDA': {
      symbol: 'NVDA',
      name: 'NVIDIA Corp',
      nameKor: '엔비디아',
      market: 'NASDAQ',
      sector: 'Technology',
      industry: 'Semiconductors',
      keywords: ['nvidia', 'gpu', 'ai', 'graphics', '엔비디아', '반도체'],
      marketCap: 1800000000000,
      currency: 'USD',
      exchange: 'NAS'
    },
    'NFLX': {
      symbol: 'NFLX',
      name: 'Netflix Inc',
      nameKor: '넷플릭스',
      market: 'NASDAQ',
      sector: 'Communication Services',
      industry: 'Streaming',
      keywords: ['netflix', 'streaming', 'video', 'content', '넷플릭스'],
      marketCap: 200000000000,
      currency: 'USD',
      exchange: 'NAS'
    },

    // 항공우주 & 방산 (에이지이글 관련 섹터)
    'BA': {
      symbol: 'BA',
      name: 'Boeing Co',
      nameKor: '보잉',
      market: 'NYSE',
      sector: 'Aerospace & Defense',
      industry: 'Aircraft Manufacturing',
      keywords: ['boeing', 'aircraft', 'aerospace', '보잉', '항공기'],
      marketCap: 120000000000,
      currency: 'USD',
      exchange: 'NYS'
    },
    'RTX': {
      symbol: 'RTX',
      name: 'Raytheon Technologies Corp',
      nameKor: '레이시온',
      market: 'NYSE',
      sector: 'Aerospace & Defense',
      industry: 'Defense Systems',
      keywords: ['raytheon', 'defense', 'aerospace', '레이시온', '방산'],
      marketCap: 140000000000,
      currency: 'USD',
      exchange: 'NYS'
    },
    'LMT': {
      symbol: 'LMT',
      name: 'Lockheed Martin Corp',
      nameKor: '록히드마틴',
      market: 'NYSE',
      sector: 'Aerospace & Defense',
      industry: 'Defense Contractor',
      keywords: ['lockheed', 'martin', 'defense', '록히드', '방산'],
      marketCap: 110000000000,
      currency: 'USD',
      exchange: 'NYS'
    },
    'AVAV': {
      symbol: 'AVAV',
      name: 'AeroVironment Inc',
      nameKor: '에어로바이론먼트',
      market: 'NASDAQ',
      sector: 'Aerospace & Defense',
      industry: 'Drones & UAV',
      keywords: ['aerovironment', 'drone', 'uav', 'aerial', '드론'],
      marketCap: 3000000000,
      currency: 'USD',
      exchange: 'NAS'
    },
    'KTOS': {
      symbol: 'KTOS',
      name: 'Kratos Defense & Security Solutions Inc',
      nameKor: '크라토스',
      market: 'NASDAQ',
      sector: 'Aerospace & Defense',
      industry: 'Defense Technology',
      keywords: ['kratos', 'defense', 'security', '크라토스', '방산'],
      marketCap: 2500000000,
      currency: 'USD',
      exchange: 'NAS'
    },

    // 금융
    'JPM': {
      symbol: 'JPM',
      name: 'JPMorgan Chase & Co',
      nameKor: 'JP모건',
      market: 'NYSE',
      sector: 'Financial Services',
      industry: 'Banking',
      keywords: ['jpmorgan', 'chase', 'bank', 'jp모건', '은행'],
      marketCap: 500000000000,
      currency: 'USD',
      exchange: 'NYS'
    },
    'BAC': {
      symbol: 'BAC',
      name: 'Bank of America Corp',
      nameKor: '뱅크오브아메리카',
      market: 'NYSE',
      sector: 'Financial Services',
      industry: 'Banking',
      keywords: ['bank', 'america', 'banking', '뱅크오브아메리카'],
      marketCap: 300000000000,
      currency: 'USD',
      exchange: 'NYS'
    },

    // 헬스케어
    'JNJ': {
      symbol: 'JNJ',
      name: 'Johnson & Johnson',
      nameKor: '존슨앤존슨',
      market: 'NYSE',
      sector: 'Healthcare',
      industry: 'Pharmaceuticals',
      keywords: ['johnson', 'healthcare', 'pharma', '존슨앤존슨', '의약품'],
      marketCap: 450000000000,
      currency: 'USD',
      exchange: 'NYS'
    },
    'PFE': {
      symbol: 'PFE',
      name: 'Pfizer Inc',
      nameKor: '화이자',
      market: 'NYSE',
      sector: 'Healthcare',
      industry: 'Pharmaceuticals',
      keywords: ['pfizer', 'pharma', 'vaccine', '화이자', '백신'],
      marketCap: 250000000000,
      currency: 'USD',
      exchange: 'NYS'
    },

    // 소비재
    'KO': {
      symbol: 'KO',
      name: 'Coca-Cola Co',
      nameKor: '코카콜라',
      market: 'NYSE',
      sector: 'Consumer Staples',
      industry: 'Beverages',
      keywords: ['coca', 'cola', 'beverage', '코카콜라', '음료'],
      marketCap: 260000000000,
      currency: 'USD',
      exchange: 'NYS'
    },
    'PG': {
      symbol: 'PG',
      name: 'Procter & Gamble Co',
      nameKor: 'P&G',
      market: 'NYSE',
      sector: 'Consumer Staples',
      industry: 'Consumer Products',
      keywords: ['procter', 'gamble', 'consumer', 'pg', '생활용품'],
      marketCap: 380000000000,
      currency: 'USD',
      exchange: 'NYS'
    },

    // 신재생에너지 & EV
    'PLTR': {
      symbol: 'PLTR',
      name: 'Palantir Technologies Inc',
      nameKor: '팔란티어',
      market: 'NYSE',
      sector: 'Technology',
      industry: 'Data Analytics',
      keywords: ['palantir', 'data', 'analytics', '팔란티어', '데이터'],
      marketCap: 60000000000,
      currency: 'USD',
      exchange: 'NYS'
    }
  }
};

// 통합 검색 함수
export class StockSearchEngine {
  constructor() {
    this.masterDB = STOCK_MASTER_DB;
    this.searchIndex = this.buildSearchIndex();
  }

  // 검색 인덱스 구축
  buildSearchIndex() {
    const index = [];
    
    // 한국 주식 인덱싱
    Object.entries(this.masterDB.KOR).forEach(([symbol, data]) => {
      index.push({
        ...data,
        country: 'KOR',
        searchTerms: [
          data.symbol,
          data.name,
          data.nameEng,
          data.sector,
          data.industry,
          ...data.keywords
        ].filter(Boolean).map(term => term.toLowerCase())
      });
    });

    // 미국 주식 인덱싱
    Object.entries(this.masterDB.USA).forEach(([symbol, data]) => {
      index.push({
        ...data,
        country: 'USA',
        searchTerms: [
          data.symbol,
          data.name,
          data.nameKor,
          data.sector,
          data.industry,
          ...data.keywords
        ].filter(Boolean).map(term => term.toLowerCase())
      });
    });

    return index;
  }

  // 종목 검색
  search(query, options = {}) {
    const {
      country = 'ALL', // 'KOR', 'USA', 'ALL'
      sector = null,
      limit = 10,
      includeScore = false
    } = options;

    if (!query || query.length < 1) return [];

    const queryLower = query.toLowerCase();
    const results = [];

    this.searchIndex.forEach(stock => {
      // 국가 필터
      if (country !== 'ALL' && stock.country !== country) return;
      
      // 섹터 필터
      if (sector && stock.sector !== sector) return;

      // 검색 스코어 계산
      let score = 0;
      
      // 정확한 심볼 매치 (최고 점수)
      if (stock.symbol.toLowerCase() === queryLower) {
        score += 100;
      } else if (stock.symbol.toLowerCase().includes(queryLower)) {
        score += 50;
      }

      // 정확한 이름 매치
      if (stock.name && stock.name.toLowerCase() === queryLower) {
        score += 90;
      } else if (stock.name && stock.name.toLowerCase().includes(queryLower)) {
        score += 40;
      }

      // 한글/영문 이름 매치
      if (stock.nameKor && stock.nameKor.includes(query)) {
        score += 80;
      }
      if (stock.nameEng && stock.nameEng.toLowerCase().includes(queryLower)) {
        score += 60;
      }

      // 키워드 매치
      stock.searchTerms.forEach(term => {
        if (term === queryLower) {
          score += 30;
        } else if (term.includes(queryLower)) {
          score += 10;
        }
      });

      // 에이지이글 특별 보너스
      if (stock.symbol === 'UAVS' && 
          ['에이지이글', 'ageagle', 'aerial', 'uavs'].some(term => 
            queryLower.includes(term) || term.includes(queryLower))) {
        score += 50;
      }

      if (score > 0) {
        results.push(includeScore ? { ...stock, score } : stock);
      }
    });

    // 점수순으로 정렬 후 제한
    return results
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);
  }

  // 심볼로 정확한 종목 조회
  getStockBySymbol(symbol, country = null) {
    if (country === 'KOR' || (!country && /^\d{6}$/.test(symbol))) {
      return this.masterDB.KOR[symbol] || null;
    }
    if (country === 'USA' || (!country && /^[A-Z]{1,5}$/.test(symbol))) {
      return this.masterDB.USA[symbol] || null;
    }
    
    // 양쪽 모두 검색
    return this.masterDB.KOR[symbol] || this.masterDB.USA[symbol] || null;
  }

  // 섹터별 종목 조회
  getStocksBySector(sector, country = 'ALL') {
    return this.search('', { country, sector, limit: 100 })
      .filter(stock => stock.sector === sector);
  }

  // 인기 종목 조회 (시가총액 기준)
  getPopularStocks(country = 'ALL', limit = 10) {
    let stocks = [];
    
    if (country === 'ALL' || country === 'KOR') {
      stocks.push(...Object.values(this.masterDB.KOR));
    }
    if (country === 'ALL' || country === 'USA') {
      stocks.push(...Object.values(this.masterDB.USA));
    }

    return stocks
      .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
      .slice(0, limit);
  }
}

// 싱글톤 인스턴스
export const stockSearchEngine = new StockSearchEngine();

// 빠른 검색 함수들 (외부에서 쉽게 사용)
export const searchStocks = (query, options) => stockSearchEngine.search(query, options);
export const getStockBySymbol = (symbol, country) => stockSearchEngine.getStockBySymbol(symbol, country);
export const getPopularStocks = (country, limit) => stockSearchEngine.getPopularStocks(country, limit);
export const getStocksBySector = (sector, country) => stockSearchEngine.getStocksBySector(sector, country); 