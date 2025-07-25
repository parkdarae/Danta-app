// 인과 관계 분석/상관 프레임
// 정책↔산업↔종목 상호 연관성, 동반 상승, 에너지/소재 영향, 환율 민감도 등

// 정책↔산업↔종목 상호 연관성 그래프 프레임
export class PolicyIndustryStockGraph {
  constructor(data) {
    this.data = data;
    this.nodes = new Map();
    this.edges = [];
  }

  // 정책-산업-종목 연관성 그래프 생성
  buildInterconnectionGraph() {
    const policyKeywords = ['IRA', '반도체법', '인프라투자', '탄소중립', '디지털뉴딜'];
    const industries = ['반도체', '태양광', '전기차', '바이오', '건설'];
    
    const graph = {
      nodes: [],
      edges: [],
      metrics: {}
    };

    // 정책 노드
    policyKeywords.forEach(policy => {
      graph.nodes.push({
        id: `policy_${policy}`,
        type: 'policy',
        label: policy,
        influence: this.calculatePolicyInfluence(policy),
        color: '#FF6B6B'
      });
    });

    // 산업 노드
    industries.forEach(industry => {
      graph.nodes.push({
        id: `industry_${industry}`,
        type: 'industry',
        label: industry,
        impact: this.calculateIndustryImpact(industry),
        color: '#4ECDC4'
      });
    });

    // 종목 노드 (샘플)
    const stocks = ['삼성전자', '한화솔루션', '테슬라', '셀트리온', '현대건설'];
    stocks.forEach(stock => {
      graph.nodes.push({
        id: `stock_${stock}`,
        type: 'stock',
        label: stock,
        correlation: this.calculateStockCorrelation(stock),
        color: '#45B7D1'
      });
    });

    // 연관성 엣지 생성
    this.buildConnections(graph);

    return {
      graph,
      insights: this.generateGraphInsights(graph),
      pathAnalysis: this.analyzePolicyPaths(graph)
    };
  }

  calculatePolicyInfluence(policy) {
    // 정책 영향력 점수 (0-100)
    const influences = {
      'IRA': 85,
      '반도체법': 90,
      '인프라투자': 75,
      '탄소중립': 80,
      '디지털뉴딜': 70
    };
    return influences[policy] || 50;
  }

  calculateIndustryImpact(industry) {
    // 산업 영향도 점수
    const impacts = {
      '반도체': 95,
      '태양광': 85,
      '전기차': 90,
      '바이오': 75,
      '건설': 70
    };
    return impacts[industry] || 50;
  }

  calculateStockCorrelation(stock) {
    // 종목 상관도 점수
    const correlations = {
      '삼성전자': 0.85,
      '한화솔루션': 0.78,
      '테슬라': 0.92,
      '셀트리온': 0.65,
      '현대건설': 0.72
    };
    return correlations[stock] || 0.5;
  }

  buildConnections(graph) {
    // 정책 → 산업 연결
    const policyIndustryMap = {
      'IRA': ['태양광', '전기차'],
      '반도체법': ['반도체'],
      '인프라투자': ['건설'],
      '탄소중립': ['태양광', '전기차'],
      '디지털뉴딜': ['반도체', '바이오']
    };

    // 산업 → 종목 연결
    const industryStockMap = {
      '반도체': ['삼성전자'],
      '태양광': ['한화솔루션'],
      '전기차': ['테슬라'],
      '바이오': ['셀트리온'],
      '건설': ['현대건설']
    };

    // 엣지 생성
    Object.entries(policyIndustryMap).forEach(([policy, industries]) => {
      industries.forEach(industry => {
        graph.edges.push({
          source: `policy_${policy}`,
          target: `industry_${industry}`,
          weight: Math.random() * 0.5 + 0.5,
          type: 'policy-industry'
        });

        // 산업 → 종목 연결
        if (industryStockMap[industry]) {
          industryStockMap[industry].forEach(stock => {
            graph.edges.push({
              source: `industry_${industry}`,
              target: `stock_${stock}`,
              weight: Math.random() * 0.4 + 0.6,
              type: 'industry-stock'
            });
          });
        }
      });
    });
  }

  generateGraphInsights(graph) {
    return {
      mostInfluentialPolicy: '반도체법',
      keyIndustryConnections: 3,
      strongestPath: 'IRA → 태양광 → 한화솔루션',
      networkDensity: graph.edges.length / (graph.nodes.length * (graph.nodes.length - 1) / 2)
    };
  }

  analyzePolicyPaths(graph) {
    return [
      {
        path: 'IRA → 태양광 → 한화솔루션',
        strength: 0.85,
        impact: '높음',
        timeHorizon: '중장기'
      },
      {
        path: '반도체법 → 반도체 → 삼성전자',
        strength: 0.92,
        impact: '매우높음',
        timeHorizon: '장기'
      }
    ];
  }
}

// 동반 상승 상관 프레임
export class CoRisingCorrelationFrame {
  constructor(stockData) {
    this.stockData = stockData;
  }

  findCoRisingPairs(period = 30) {
    const pairs = [];
    const stocks = Object.keys(this.stockData);

    for (let i = 0; i < stocks.length; i++) {
      for (let j = i + 1; j < stocks.length; j++) {
        const correlation = this.calculateCorrelation(
          this.stockData[stocks[i]],
          this.stockData[stocks[j]],
          period
        );

        if (correlation > 0.7) {
          pairs.push({
            pair: [stocks[i], stocks[j]],
            correlation: correlation,
            strength: this.getCorrelationStrength(correlation),
            sector: this.identifySector([stocks[i], stocks[j]]),
            riskLevel: this.assessRiskLevel(correlation)
          });
        }
      }
    }

    return pairs.sort((a, b) => b.correlation - a.correlation);
  }

  calculateCorrelation(data1, data2, period) {
    if (!data1 || !data2 || data1.length < period || data2.length < period) {
      return 0;
    }

    const n = Math.min(data1.length, data2.length, period);
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;

    for (let i = 0; i < n; i++) {
      const x = data1[i];
      const y = data2[i];
      
      sum1 += x;
      sum2 += y;
      sum1Sq += x * x;
      sum2Sq += y * y;
      pSum += x * y;
    }

    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

    return den === 0 ? 0 : num / den;
  }

  getCorrelationStrength(correlation) {
    if (correlation > 0.8) return '매우 강함';
    if (correlation > 0.7) return '강함';
    if (correlation > 0.5) return '보통';
    return '약함';
  }

  identifySector(stocks) {
    const sectorMap = {
      '삼성전자': '반도체',
      'SK하이닉스': '반도체',
      '한화솔루션': '태양광',
      '셀트리온': '바이오',
      '현대차': '자동차'
    };

    const sectors = stocks.map(stock => sectorMap[stock] || '기타');
    return [...new Set(sectors)].join(', ');
  }

  assessRiskLevel(correlation) {
    if (correlation > 0.9) return '높음 (과도한 동조화)';
    if (correlation > 0.7) return '보통 (적정 상관)';
    return '낮음';
  }

  generateCoRisingReport(pairs) {
    const topPairs = pairs.slice(0, 5);
    
    return {
      summary: {
        totalPairs: pairs.length,
        averageCorrelation: pairs.reduce((sum, p) => sum + p.correlation, 0) / pairs.length,
        strongestPair: pairs[0]
      },
      recommendations: this.generateRecommendations(topPairs),
      riskAnalysis: this.analyzePortfolioRisk(topPairs),
      sectors: this.analyzeSectorCorrelations(pairs)
    };
  }

  generateRecommendations(pairs) {
    return pairs.map(pair => ({
      pair: pair.pair,
      strategy: pair.correlation > 0.8 ? 
        '포트폴리오 분산 필요 (과도한 상관성)' : 
        '동반 투자 전략 고려 가능',
      timing: '단기 동조화 활용 또는 장기 분산 전략',
      warning: pair.correlation > 0.9 ? '과열 위험 주의' : null
    }));
  }

  analyzePortfolioRisk(pairs) {
    const highCorrelationCount = pairs.filter(p => p.correlation > 0.8).length;
    
    return {
      diversificationRisk: highCorrelationCount > 3 ? '높음' : '보통',
      recommendation: highCorrelationCount > 3 ? 
        '포트폴리오 재구성 필요' : 
        '적정 수준의 분산',
      concentrationWarning: highCorrelationCount > 5
    };
  }

  analyzeSectorCorrelations(pairs) {
    const sectorPairs = {};
    
    pairs.forEach(pair => {
      const sector = pair.sector;
      if (!sectorPairs[sector]) {
        sectorPairs[sector] = {
          count: 0,
          avgCorrelation: 0,
          pairs: []
        };
      }
      sectorPairs[sector].count++;
      sectorPairs[sector].pairs.push(pair);
    });

    Object.keys(sectorPairs).forEach(sector => {
      const sectorData = sectorPairs[sector];
      sectorData.avgCorrelation = sectorData.pairs.reduce(
        (sum, p) => sum + p.correlation, 0
      ) / sectorData.count;
    });

    return sectorPairs;
  }
}

// 에너지/소재 ↔ 생산 단가 영향 프레임
export class EnergyMaterialImpactFrame {
  constructor() {
    this.energyFactors = ['원유', '천연가스', '전력', '석탄'];
    this.materialFactors = ['구리', '철강', '알루미늄', '니켈', '리튬'];
    this.productionSectors = ['반도체', '자동차', '화학', '철강', '전자'];
  }

  analyzeImpactChain() {
    const impactChain = {};

    this.productionSectors.forEach(sector => {
      impactChain[sector] = {
        energyImpact: this.calculateEnergyImpact(sector),
        materialImpact: this.calculateMaterialImpact(sector),
        overallSensitivity: 0,
        profitabilityRisk: '',
        recommendations: []
      };

      // 전체 민감도 계산
      impactChain[sector].overallSensitivity = 
        (impactChain[sector].energyImpact.totalImpact + 
         impactChain[sector].materialImpact.totalImpact) / 2;

      // 수익성 리스크 평가
      impactChain[sector].profitabilityRisk = 
        this.assessProfitabilityRisk(impactChain[sector].overallSensitivity);

      // 권장사항 생성
      impactChain[sector].recommendations = 
        this.generateRecommendations(sector, impactChain[sector]);
    });

    return {
      impactAnalysis: impactChain,
      marketInsights: this.generateMarketInsights(impactChain),
      investmentStrategy: this.createInvestmentStrategy(impactChain)
    };
  }

  calculateEnergyImpact(sector) {
    const energyWeights = {
      '반도체': { '전력': 0.4, '천연가스': 0.3, '원유': 0.2, '석탄': 0.1 },
      '자동차': { '전력': 0.2, '원유': 0.4, '천연가스': 0.2, '석탄': 0.2 },
      '화학': { '천연가스': 0.4, '원유': 0.3, '전력': 0.2, '석탄': 0.1 },
      '철강': { '석탄': 0.5, '전력': 0.3, '천연가스': 0.1, '원유': 0.1 },
      '전자': { '전력': 0.5, '원유': 0.2, '천연가스': 0.2, '석탄': 0.1 }
    };

    const weights = energyWeights[sector] || {};
    let totalImpact = 0;
    const details = {};

    this.energyFactors.forEach(factor => {
      const weight = weights[factor] || 0;
      const priceVolatility = this.getEnergyVolatility(factor);
      const impact = weight * priceVolatility;
      
      details[factor] = {
        weight: weight,
        volatility: priceVolatility,
        impact: impact
      };
      
      totalImpact += impact;
    });

    return {
      totalImpact: totalImpact,
      details: details,
      primaryFactor: this.findPrimaryFactor(details)
    };
  }

  calculateMaterialImpact(sector) {
    const materialWeights = {
      '반도체': { '구리': 0.3, '니켈': 0.2, '알루미늄': 0.2, '철강': 0.2, '리튬': 0.1 },
      '자동차': { '철강': 0.3, '알루미늄': 0.25, '구리': 0.2, '리튬': 0.15, '니켈': 0.1 },
      '화학': { '구리': 0.2, '철강': 0.3, '알루미늄': 0.2, '니켈': 0.2, '리튬': 0.1 },
      '철강': { '철강': 0.6, '구리': 0.2, '니켈': 0.1, '알루미늄': 0.05, '리튬': 0.05 },
      '전자': { '구리': 0.4, '알루미늄': 0.2, '니켈': 0.2, '철강': 0.1, '리튬': 0.1 }
    };

    const weights = materialWeights[sector] || {};
    let totalImpact = 0;
    const details = {};

    this.materialFactors.forEach(factor => {
      const weight = weights[factor] || 0;
      const priceVolatility = this.getMaterialVolatility(factor);
      const impact = weight * priceVolatility;
      
      details[factor] = {
        weight: weight,
        volatility: priceVolatility,
        impact: impact
      };
      
      totalImpact += impact;
    });

    return {
      totalImpact: totalImpact,
      details: details,
      primaryFactor: this.findPrimaryFactor(details)
    };
  }

  getEnergyVolatility(factor) {
    const volatilities = {
      '원유': 0.85,
      '천연가스': 0.92,
      '전력': 0.75,
      '석탄': 0.68
    };
    return volatilities[factor] || 0.5;
  }

  getMaterialVolatility(factor) {
    const volatilities = {
      '구리': 0.78,
      '철강': 0.65,
      '알루미늄': 0.72,
      '니켈': 0.88,
      '리튬': 0.95
    };
    return volatilities[factor] || 0.5;
  }

  findPrimaryFactor(details) {
    let maxImpact = 0;
    let primaryFactor = '';
    
    Object.entries(details).forEach(([factor, data]) => {
      if (data.impact > maxImpact) {
        maxImpact = data.impact;
        primaryFactor = factor;
      }
    });
    
    return primaryFactor;
  }

  assessProfitabilityRisk(sensitivity) {
    if (sensitivity > 0.8) return '높음';
    if (sensitivity > 0.6) return '보통';
    if (sensitivity > 0.4) return '낮음';
    return '매우낮음';
  }

  generateRecommendations(sector, analysis) {
    const recommendations = [];
    
    if (analysis.overallSensitivity > 0.7) {
      recommendations.push('원자재 가격 헷징 전략 필요');
      recommendations.push('대체 공급망 확보 권장');
    }
    
    if (analysis.energyImpact.totalImpact > 0.6) {
      recommendations.push('에너지 효율성 개선 투자');
      recommendations.push('재생에너지 전환 검토');
    }
    
    if (analysis.materialImpact.totalImpact > 0.6) {
      recommendations.push('소재 재활용 기술 도입');
      recommendations.push('장기 계약을 통한 가격 안정화');
    }
    
    return recommendations;
  }

  generateMarketInsights(impactChain) {
    const insights = [];
    
    const highSensitivitySectors = Object.entries(impactChain)
      .filter(([sector, data]) => data.overallSensitivity > 0.7)
      .map(([sector]) => sector);
    
    if (highSensitivitySectors.length > 0) {
      insights.push({
        type: 'warning',
        message: `${highSensitivitySectors.join(', ')} 섹터는 원자재 가격 변동에 높은 민감도를 보임`,
        impact: '수익성 변동성 증가 위험'
      });
    }
    
    insights.push({
      type: 'opportunity',
      message: '에너지 전환 섹터는 중장기적 성장 기회',
      impact: '대체 에너지 관련 투자 기회 확대'
    });
    
    return insights;
  }

  createInvestmentStrategy(impactChain) {
    const strategies = {
      defensive: [],
      opportunistic: [],
      hedging: []
    };
    
    Object.entries(impactChain).forEach(([sector, data]) => {
      if (data.overallSensitivity > 0.8) {
        strategies.hedging.push({
          sector: sector,
          strategy: '헷징 포지션 구축',
          reason: '높은 원자재 민감도'
        });
      } else if (data.overallSensitivity < 0.4) {
        strategies.opportunistic.push({
          sector: sector,
          strategy: '공격적 투자',
          reason: '낮은 원자재 의존도'
        });
      } else {
        strategies.defensive.push({
          sector: sector,
          strategy: '신중한 접근',
          reason: '중간 수준의 민감도'
        });
      }
    });
    
    return strategies;
  }
}

// 환율 민감 종목 스코어링 프레임
export class ExchangeRateSensitivityFrame {
  constructor(stockData, exchangeRateData) {
    this.stockData = stockData;
    this.exchangeRateData = exchangeRateData;
    this.majorCurrencies = ['USD', 'EUR', 'JPY', 'CNY'];
  }

  calculateSensitivityScores() {
    const scores = {};
    
    Object.keys(this.stockData).forEach(stock => {
      scores[stock] = {
        overallScore: 0,
        currencyExposure: {},
        businessType: this.identifyBusinessType(stock),
        exportRatio: this.estimateExportRatio(stock),
        recommendations: []
      };
      
      // 각 통화별 민감도 계산
      this.majorCurrencies.forEach(currency => {
        const sensitivity = this.calculateCurrencySensitivity(stock, currency);
        scores[stock].currencyExposure[currency] = sensitivity;
      });
      
      // 전체 민감도 점수
      scores[stock].overallScore = this.calculateOverallScore(scores[stock]);
      
      // 권장사항 생성
      scores[stock].recommendations = this.generateCurrencyRecommendations(
        stock, 
        scores[stock]
      );
    });
    
    return {
      scores: scores,
      rankings: this.createSensitivityRankings(scores),
      marketAnalysis: this.analyzeMarketConditions(),
      investmentGuide: this.createInvestmentGuide(scores)
    };
  }

  calculateCurrencySensitivity(stock, currency) {
    // 환율과 주가의 상관관계 계산
    const stockPrices = this.stockData[stock] || [];
    const exchangeRates = this.exchangeRateData[currency] || [];
    
    if (stockPrices.length < 30 || exchangeRates.length < 30) {
      return { correlation: 0, strength: '데이터부족' };
    }
    
    const correlation = this.calculateCorrelation(stockPrices, exchangeRates);
    const volatility = this.calculateVolatility(stockPrices);
    const exchangeVolatility = this.calculateVolatility(exchangeRates);
    
    return {
      correlation: correlation,
      strength: this.interpretCorrelationStrength(correlation),
      volatility: volatility,
      beta: correlation * (volatility / exchangeVolatility),
      direction: correlation > 0 ? '정의관계' : '역의관계'
    };
  }

  calculateCorrelation(data1, data2) {
    const n = Math.min(data1.length, data2.length);
    if (n < 10) return 0;
    
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;
    
    for (let i = 0; i < n; i++) {
      sum1 += data1[i];
      sum2 += data2[i];
      sum1Sq += data1[i] * data1[i];
      sum2Sq += data2[i] * data2[i];
      pSum += data1[i] * data2[i];
    }
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    
    return den === 0 ? 0 : num / den;
  }

  calculateVolatility(data) {
    if (data.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      const return_rate = (data[i] - data[i-1]) / data[i-1];
      returns.push(return_rate);
    }
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  interpretCorrelationStrength(correlation) {
    const abs = Math.abs(correlation);
    if (abs > 0.8) return '매우강함';
    if (abs > 0.6) return '강함';
    if (abs > 0.4) return '보통';
    if (abs > 0.2) return '약함';
    return '매우약함';
  }

  identifyBusinessType(stock) {
    const businessTypes = {
      '삼성전자': '수출제조업',
      'SK하이닉스': '수출제조업',
      '한화솔루션': '수출제조업',
      '현대차': '수출제조업',
      '셀트리온': '수출제조업',
      'NAVER': '내수서비스업',
      '카카오': '내수서비스업',
      'LG생활건강': '내수제조업'
    };
    return businessTypes[stock] || '기타';
  }

  estimateExportRatio(stock) {
    const exportRatios = {
      '삼성전자': 0.85,
      'SK하이닉스': 0.90,
      '한화솔루션': 0.70,
      '현대차': 0.75,
      '셀트리온': 0.80,
      'NAVER': 0.20,
      '카카오': 0.15,
      'LG생활건강': 0.30
    };
    return exportRatios[stock] || 0.5;
  }

  calculateOverallScore(stockData) {
    let totalScore = 0;
    let weightSum = 0;
    
    const currencyWeights = {
      'USD': 0.4,
      'EUR': 0.2,
      'JPY': 0.2,
      'CNY': 0.2
    };
    
    Object.entries(stockData.currencyExposure).forEach(([currency, data]) => {
      const weight = currencyWeights[currency] || 0.1;
      const score = Math.abs(data.correlation) * 100;
      totalScore += score * weight;
      weightSum += weight;
    });
    
    return weightSum > 0 ? totalScore / weightSum : 0;
  }

  generateCurrencyRecommendations(stock, stockData) {
    const recommendations = [];
    
    if (stockData.overallScore > 70) {
      recommendations.push({
        type: 'warning',
        message: '환율 변동에 높은 민감도',
        action: '환율 헷징 전략 고려 필요'
      });
    }
    
    if (stockData.exportRatio > 0.7) {
      recommendations.push({
        type: 'info',
        message: '높은 수출 의존도',
        action: '환율 동향 면밀 모니터링'
      });
    }
    
    const strongCurrencies = Object.entries(stockData.currencyExposure)
      .filter(([currency, data]) => Math.abs(data.correlation) > 0.6)
      .map(([currency]) => currency);
    
    if (strongCurrencies.length > 0) {
      recommendations.push({
        type: 'strategy',
        message: `${strongCurrencies.join(', ')} 환율 주요 영향`,
        action: '해당 통화 동향 집중 분석'
      });
    }
    
    return recommendations;
  }

  createSensitivityRankings(scores) {
    const rankings = Object.entries(scores)
      .map(([stock, data]) => ({
        stock: stock,
        score: data.overallScore,
        businessType: data.businessType,
        exportRatio: data.exportRatio
      }))
      .sort((a, b) => b.score - a.score);
    
    return {
      highSensitivity: rankings.filter(item => item.score > 70),
      mediumSensitivity: rankings.filter(item => item.score >= 40 && item.score <= 70),
      lowSensitivity: rankings.filter(item => item.score < 40)
    };
  }

  analyzeMarketConditions() {
    // 현재 환율 시장 상황 분석
    return {
      dollarStrength: 'moderate', // 분석 로직 추가 필요
      volatilityLevel: 'high',
      trendDirection: 'strengthening',
      keyFactors: [
        '미 연준 금리 정책',
        '지정학적 리스크',
        '무역 수지 변화'
      ],
      outlook: {
        shortTerm: '변동성 지속',
        mediumTerm: '달러 강세 전망',
        longTerm: '정상화 예상'
      }
    };
  }

  createInvestmentGuide(scores) {
    const guide = {
      dollarStrong: {
        title: '달러 강세 시나리오',
        winners: [],
        losers: [],
        strategy: '수출기업 중심 포트폴리오'
      },
      dollarWeak: {
        title: '달러 약세 시나리오',
        winners: [],
        losers: [],
        strategy: '내수기업 중심 포트폴리오'
      },
      hedging: {
        title: '헷징 전략',
        instruments: ['환율 선물', 'ETF', '통화 옵션'],
        recommendations: []
      }
    };
    
    Object.entries(scores).forEach(([stock, data]) => {
      if (data.businessType === '수출제조업' && data.overallScore > 60) {
        // USD 상관관계가 음수면 달러 강세 시 불리
        const usdCorr = data.currencyExposure.USD?.correlation || 0;
        if (usdCorr < -0.5) {
          guide.dollarStrong.losers.push(stock);
          guide.dollarWeak.winners.push(stock);
        } else if (usdCorr > 0.5) {
          guide.dollarStrong.winners.push(stock);
          guide.dollarWeak.losers.push(stock);
        }
      }
    });
    
    return guide;
  }
}

// 통합 인과관계 분석기
export class IntegratedCorrelationAnalyzer {
  constructor() {
    this.policyGraph = new PolicyIndustryStockGraph();
    this.coRisingFrame = null;
    this.energyFrame = new EnergyMaterialImpactFrame();
    this.exchangeFrame = null;
  }

  performComprehensiveAnalysis(stockData, exchangeData) {
    this.coRisingFrame = new CoRisingCorrelationFrame(stockData);
    this.exchangeFrame = new ExchangeRateSensitivityFrame(stockData, exchangeData);
    
    const results = {
      policyConnections: this.policyGraph.buildInterconnectionGraph(),
      correlationPairs: this.coRisingFrame.findCoRisingPairs(),
      energyImpact: this.energyFrame.analyzeImpactChain(),
      exchangeSensitivity: this.exchangeFrame.calculateSensitivityScores(),
      integratedInsights: this.generateIntegratedInsights()
    };
    
    return {
      ...results,
      summary: this.createExecutiveSummary(results),
      recommendations: this.createStrategicRecommendations(results)
    };
  }

  generateIntegratedInsights() {
    return {
      systemicRisks: [
        '높은 상관관계로 인한 분산 효과 제한',
        '에너지/원자재 가격 동조화 위험',
        '환율 변동성 증가에 따른 수출기업 리스크'
      ],
      opportunities: [
        '정책 수혜 경로를 통한 투자 기회',
        '섹터 순환 전략 활용 가능',
        '환율 헷징을 통한 안정성 확보'
      ],
      emergingTrends: [
        '에너지 전환 가속화',
        '공급망 다변화 추세',
        '디지털 전환 정책 확대'
      ]
    };
  }

  createExecutiveSummary(results) {
    return {
      keyFindings: [
        `정책-산업 연관성: ${results.policyConnections.insights.strongestPath}`,
        `높은 상관관계 쌍: ${results.correlationPairs.length}개`,
        `환율 고민감군: ${results.exchangeSensitivity.rankings.highSensitivity.length}개 종목`
      ],
      riskLevel: this.assessOverallRisk(results),
      opportunityLevel: this.assessOpportunityLevel(results),
      actionItems: [
        '포트폴리오 재조정 검토',
        '헷징 전략 수립',
        '정책 모니터링 체계 구축'
      ]
    };
  }

  assessOverallRisk(results) {
    let riskScore = 0;
    
    // 상관관계 리스크
    const highCorrCount = results.correlationPairs.filter(p => p.correlation > 0.8).length;
    riskScore += highCorrCount * 10;
    
    // 환율 민감도 리스크
    const highExchangeCount = results.exchangeSensitivity.rankings.highSensitivity.length;
    riskScore += highExchangeCount * 15;
    
    // 에너지 의존도 리스크
    const highEnergyDependent = Object.values(results.energyImpact.impactAnalysis)
      .filter(analysis => analysis.overallSensitivity > 0.7).length;
    riskScore += highEnergyDependent * 12;
    
    if (riskScore > 100) return '높음';
    if (riskScore > 50) return '보통';
    return '낮음';
  }

  assessOpportunityLevel(results) {
    let opportunityScore = 0;
    
    // 정책 수혜 기회
    opportunityScore += results.policyConnections.pathAnalysis.length * 20;
    
    // 섹터 다양성
    const sectorCount = new Set(
      results.correlationPairs.map(p => p.sector)
    ).size;
    opportunityScore += sectorCount * 10;
    
    if (opportunityScore > 80) return '높음';
    if (opportunityScore > 40) return '보통';
    return '낮음';
  }

  createStrategicRecommendations(results) {
    return {
      immediate: [
        '높은 상관관계 종목군 분산 검토',
        '환율 헷징 필요성 평가',
        '에너지 비용 상승 대비책 마련'
      ],
      shortTerm: [
        '정책 수혜주 포지션 조정',
        '섹터 순환 전략 준비',
        '원자재 가격 모니터링 체계 구축'
      ],
      longTerm: [
        '지속가능한 투자 전략 수립',
        '글로벌 공급망 변화 대응',
        '기술 혁신 트렌드 반영'
      ]
    };
  }
} 