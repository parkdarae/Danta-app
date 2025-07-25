// 인과 관계 분석/상관 프레임
import { calculateCorrelation, calculateMutualInformation } from './correlationAnalyzer';
import { STORAGE_KEYS } from '../constants';

// 정책↔산업↔종목 상호 연관성 그래프 프레임
export class PolicyIndustryStockGraph {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this.policyKeywords = [
      '인프라', 'IRA', '반도체법', '그린뉴딜', '탄소중립', 
      '수소경제', '디지털뉴딜', 'K-뉴딜', '신재생에너지'
    ];
  }

  // 정책-산업-종목 연관성 분석
  analyzePolicyChain(stockData, newsData) {
    const results = {
      policyImpact: {},
      industryConnections: {},
      stockBeneficiaries: [],
      networkGraph: { nodes: [], links: [] }
    };

    // 정책 키워드 매칭
    this.policyKeywords.forEach(policy => {
      const relatedNews = newsData.filter(news => 
        news.title.toLowerCase().includes(policy.toLowerCase()) ||
        news.summary.toLowerCase().includes(policy.toLowerCase())
      );

      if (relatedNews.length > 0) {
        results.policyImpact[policy] = {
          newsCount: relatedNews.length,
          sentiment: this.calculateAverageSentiment(relatedNews),
          affectedIndustries: this.extractIndustries(relatedNews),
          timeRange: this.getTimeRange(relatedNews)
        };

        // 노드 추가
        results.networkGraph.nodes.push({
          id: policy,
          type: 'policy',
          value: relatedNews.length,
          sentiment: results.policyImpact[policy].sentiment
        });
      }
    });

    return results;
  }

  calculateAverageSentiment(news) {
    if (news.length === 0) return 0;
    const sentiments = news.map(n => n.sentiment || 0);
    return sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
  }

  extractIndustries(news) {
    const industries = [];
    const industryKeywords = {
      '반도체': ['반도체', '칩', '웨이퍼'],
      '자동차': ['자동차', '전기차', 'EV'],
      '바이오': ['바이오', '제약', '의료'],
      '건설': ['건설', '인프라', '도로'],
      '에너지': ['태양광', '풍력', '원자력']
    };

    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      const count = news.filter(n => 
        keywords.some(keyword => 
          n.title.includes(keyword) || n.summary.includes(keyword)
        )
      ).length;
      
      if (count > 0) {
        industries.push({ industry, relevance: count });
      }
    });

    return industries.sort((a, b) => b.relevance - a.relevance);
  }

  getTimeRange(news) {
    const dates = news.map(n => new Date(n.date)).sort();
    return {
      start: dates[0],
      end: dates[dates.length - 1],
      span: dates[dates.length - 1] - dates[0]
    };
  }
}

// 동반 상승 상관 프레임
export class CoMovementAnalyzer {
  constructor() {
    this.correlationThreshold = 0.7;
    this.timeWindow = 30; // 30일
  }

  // 동반 상승 종목 쌍 찾기
  findCoMovingPairs(stocksData, timeWindow = this.timeWindow) {
    const pairs = [];
    const stocks = Object.keys(stocksData);

    for (let i = 0; i < stocks.length; i++) {
      for (let j = i + 1; j < stocks.length; j++) {
        const stock1 = stocks[i];
        const stock2 = stocks[j];
        
        const correlation = this.calculatePriceCorrelation(
          stocksData[stock1], 
          stocksData[stock2], 
          timeWindow
        );

        if (Math.abs(correlation) > this.correlationThreshold) {
          pairs.push({
            pair: [stock1, stock2],
            correlation: correlation,
            strength: this.categorizeCorrelation(correlation),
            sector1: this.getSector(stock1),
            sector2: this.getSector(stock2),
            isSameSector: this.getSector(stock1) === this.getSector(stock2)
          });
        }
      }
    }

    return pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  calculatePriceCorrelation(data1, data2, window) {
    const prices1 = data1.slice(-window).map(d => d.close);
    const prices2 = data2.slice(-window).map(d => d.close);
    
    return calculateCorrelation(prices1, prices2);
  }

  categorizeCorrelation(correlation) {
    const abs = Math.abs(correlation);
    if (abs > 0.9) return '매우 강한 상관';
    if (abs > 0.7) return '강한 상관';
    if (abs > 0.5) return '중간 상관';
    return '약한 상관';
  }

  getSector(stockSymbol) {
    const sectorMap = {
      'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology',
      'TSLA': 'Automotive', 'F': 'Automotive', 'GM': 'Automotive',
      'JPM': 'Financial', 'BAC': 'Financial', 'WFC': 'Financial',
      'JNJ': 'Healthcare', 'PFE': 'Healthcare', 'UNH': 'Healthcare'
    };
    return sectorMap[stockSymbol] || 'Other';
  }
}

// 에너지/소재 ↔ 생산 단가 영향 프레임
export class CommodityImpactAnalyzer {
  constructor() {
    this.commodities = {
      'WTI': { name: '유가', impact: ['에너지', '석유화학', '항공'] },
      'GOLD': { name: '금', impact: ['금융', '보석'] },
      'COPPER': { name: '구리', impact: ['건설', '전기', '반도체'] },
      'STEEL': { name: '철강', impact: ['건설', '자동차', '조선'] }
    };
  }

  // 원자재 가격이 산업에 미치는 영향 분석
  analyzeCommodityImpact(commodityPrices, stockData) {
    const results = {
      priceChanges: {},
      industryImpact: {},
      sensitiveStocks: [],
      riskAssessment: {}
    };

    Object.entries(this.commodities).forEach(([symbol, info]) => {
      const priceChange = this.calculatePriceChange(commodityPrices[symbol]);
      results.priceChanges[symbol] = {
        current: commodityPrices[symbol]?.current || 0,
        change: priceChange,
        trend: priceChange > 5 ? '급등' : priceChange < -5 ? '급락' : '안정',
        affectedIndustries: info.impact
      };

      // 영향받는 산업 분석
      info.impact.forEach(industry => {
        if (!results.industryImpact[industry]) {
          results.industryImpact[industry] = {
            commodityFactors: [],
            totalImpact: 0,
            riskLevel: 'LOW'
          };
        }

        results.industryImpact[industry].commodityFactors.push({
          commodity: info.name,
          impact: priceChange,
          weight: this.getIndustryWeight(industry, symbol)
        });

        results.industryImpact[industry].totalImpact += 
          priceChange * this.getIndustryWeight(industry, symbol);
      });
    });

    // 리스크 레벨 계산
    Object.keys(results.industryImpact).forEach(industry => {
      const impact = Math.abs(results.industryImpact[industry].totalImpact);
      results.industryImpact[industry].riskLevel = 
        impact > 10 ? 'HIGH' : impact > 5 ? 'MEDIUM' : 'LOW';
    });

    return results;
  }

  calculatePriceChange(priceData) {
    if (!priceData || priceData.length < 2) return 0;
    const latest = priceData[priceData.length - 1];
    const previous = priceData[priceData.length - 2];
    return ((latest - previous) / previous) * 100;
  }

  getIndustryWeight(industry, commodity) {
    const weights = {
      '에너지': { 'WTI': 0.8, 'GOLD': 0.1 },
      '반도체': { 'COPPER': 0.6, 'WTI': 0.2 },
      '건설': { 'STEEL': 0.7, 'COPPER': 0.3 },
      '자동차': { 'STEEL': 0.5, 'WTI': 0.3 }
    };
    return weights[industry]?.[commodity] || 0.1;
  }
}

// 환율 민감 종목 스코어링 프레임
export class ExchangeRateSensitivityAnalyzer {
  constructor() {
    this.currencies = ['USD/KRW', 'EUR/KRW', 'JPY/KRW', 'CNY/KRW'];
  }

  // 환율 민감도 분석
  analyzeExchangeRateSensitivity(stockData, exchangeRates) {
    const results = {
      sensitivityScores: {},
      currencyExposure: {},
      hedgingStatus: {},
      recommendations: []
    };

    Object.keys(stockData).forEach(stock => {
      const sensitivity = this.calculateSensitivity(stock, stockData[stock], exchangeRates);
      
      results.sensitivityScores[stock] = {
        usdSensitivity: sensitivity.USD,
        totalSensitivity: sensitivity.total,
        riskLevel: this.categorizeRisk(sensitivity.total),
        exportRatio: this.getExportRatio(stock),
        hedgingRatio: this.getHedgingRatio(stock)
      };

      // 추천사항 생성
      if (sensitivity.total > 0.7) {
        results.recommendations.push({
          stock: stock,
          type: '환율 헤지 필요',
          reason: '높은 환율 민감도',
          action: '환율 파생상품 활용 검토'
        });
      }
    });

    return results;
  }

  calculateSensitivity(stock, stockPrices, exchangeRates) {
    const stockReturns = this.calculateReturns(stockPrices);
    const usdReturns = this.calculateReturns(exchangeRates['USD/KRW']);
    
    const usdCorrelation = calculateCorrelation(stockReturns, usdReturns);
    
    return {
      USD: Math.abs(usdCorrelation),
      total: Math.abs(usdCorrelation) * this.getExportRatio(stock)
    };
  }

  calculateReturns(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    return returns;
  }

  getExportRatio(stock) {
    // 실제로는 기업 데이터에서 가져와야 함
    const exportRatios = {
      'AAPL': 0.6, 'MSFT': 0.5, 'GOOGL': 0.4,
      'TSLA': 0.7, 'AMZN': 0.3
    };
    return exportRatios[stock] || 0.3;
  }

  getHedgingRatio(stock) {
    // 실제로는 기업 공시에서 가져와야 함
    const hedgingRatios = {
      'AAPL': 0.8, 'MSFT': 0.7, 'GOOGL': 0.6,
      'TSLA': 0.4, 'AMZN': 0.5
    };
    return hedgingRatios[stock] || 0.3;
  }

  categorizeRisk(sensitivity) {
    if (sensitivity > 0.7) return 'HIGH';
    if (sensitivity > 0.4) return 'MEDIUM';
    return 'LOW';
  }
}

// 통합 인과관계 분석 엔진
export class CausalityFrameworkEngine {
  constructor() {
    this.policyGraph = new PolicyIndustryStockGraph();
    this.coMovement = new CoMovementAnalyzer();
    this.commodityImpact = new CommodityImpactAnalyzer();
    this.exchangeRate = new ExchangeRateSensitivityAnalyzer();
  }

  // 전체 인과관계 분석 실행
  async runFullAnalysis(stockData, marketData) {
    const results = {
      timestamp: new Date().toISOString(),
      analysis: {
        policyChain: {},
        coMovement: {},
        commodityImpact: {},
        exchangeRate: {}
      },
      insights: [],
      riskFactors: [],
      opportunities: []
    };

    try {
      // 정책-산업-종목 연관성 분석
      results.analysis.policyChain = this.policyGraph.analyzePolicyChain(
        stockData, 
        marketData.news || []
      );

      // 동반 상승 분석
      results.analysis.coMovement = this.coMovement.findCoMovingPairs(stockData);

      // 원자재 영향 분석
      results.analysis.commodityImpact = this.commodityImpact.analyzeCommodityImpact(
        marketData.commodities || {}, 
        stockData
      );

      // 환율 민감도 분석
      results.analysis.exchangeRate = this.exchangeRate.analyzeExchangeRateSensitivity(
        stockData, 
        marketData.exchangeRates || {}
      );

      // 종합 인사이트 생성
      results.insights = this.generateInsights(results.analysis);
      results.riskFactors = this.identifyRiskFactors(results.analysis);
      results.opportunities = this.identifyOpportunities(results.analysis);

    } catch (error) {
      console.error('인과관계 분석 중 오류:', error);
      results.error = error.message;
    }

    return results;
  }

  generateInsights(analysis) {
    const insights = [];

    // 정책 수혜 인사이트
    Object.entries(analysis.policyChain.policyImpact || {}).forEach(([policy, data]) => {
      if (data.sentiment > 0.6) {
        insights.push({
          type: 'policy_benefit',
          title: `${policy} 정책 수혜 기대`,
          description: `${policy} 관련 뉴스 ${data.newsCount}건, 긍정 감성 ${(data.sentiment * 100).toFixed(1)}%`,
          confidence: data.sentiment,
          category: 'positive'
        });
      }
    });

    // 동반 상승 인사이트
    const strongCorrelations = analysis.coMovement.filter(pair => Math.abs(pair.correlation) > 0.8);
    if (strongCorrelations.length > 0) {
      insights.push({
        type: 'correlation',
        title: '강한 동반 상승 관계 발견',
        description: `${strongCorrelations.length}개 종목쌍이 강한 상관관계를 보임`,
        confidence: 0.8,
        category: 'neutral'
      });
    }

    return insights;
  }

  identifyRiskFactors(analysis) {
    const risks = [];

    // 원자재 리스크
    Object.entries(analysis.commodityImpact.industryImpact || {}).forEach(([industry, data]) => {
      if (data.riskLevel === 'HIGH') {
        risks.push({
          type: 'commodity_risk',
          industry: industry,
          level: 'HIGH',
          description: `${industry} 산업의 원자재 가격 변동 리스크`,
          impact: data.totalImpact
        });
      }
    });

    // 환율 리스크
    Object.entries(analysis.exchangeRate.sensitivityScores || {}).forEach(([stock, data]) => {
      if (data.riskLevel === 'HIGH') {
        risks.push({
          type: 'currency_risk',
          stock: stock,
          level: 'HIGH',
          description: `${stock}의 높은 환율 민감도`,
          sensitivity: data.totalSensitivity
        });
      }
    });

    return risks;
  }

  identifyOpportunities(analysis) {
    const opportunities = [];

    // 정책 수혜 기회
    Object.entries(analysis.policyChain.policyImpact || {}).forEach(([policy, data]) => {
      if (data.sentiment > 0.7 && data.newsCount > 5) {
        opportunities.push({
          type: 'policy_opportunity',
          title: `${policy} 수혜주 투자 기회`,
          description: `강한 정책 모멘텀과 긍정적 시장 반응`,
          confidence: data.sentiment,
          timeHorizon: 'medium'
        });
      }
    });

    return opportunities;
  }

  // 결과 저장
  saveResults(results) {
    const key = `${STORAGE_KEYS.MINING_RESULTS}_causality`;
    localStorage.setItem(key, JSON.stringify(results));
    return results;
  }

  // 결과 로드
  loadResults() {
    const key = `${STORAGE_KEYS.MINING_RESULTS}_causality`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
} 