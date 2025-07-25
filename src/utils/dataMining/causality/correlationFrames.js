/**
 * 인과 관계 분석/상관 프레임
 * 정책↔산업↔종목 상호 연관성, 동반 상승 상관, 에너지/소재 영향, 환율 민감도 분석
 */

// 정책-산업-종목 연관성 그래프 프레임
export class PolicyIndustryStockGraph {
  constructor() {
    this.policyKeywords = [
      '인프라', 'AI', '반도체', '신재생에너지', '전기차', '바이오', '국방',
      'ESG', '탄소중립', '디지털뉴딜', '그린뉴딜', '메타버스', '우주항공'
    ];
    
    this.industryMapping = {
      '인프라': ['건설', '철강', '시멘트', '중장비'],
      'AI': ['소프트웨어', '반도체', '클라우드', '빅데이터'],
      '반도체': ['반도체', '반도체장비', '소재'],
      '신재생에너지': ['태양광', '풍력', '수소', '배터리'],
      '전기차': ['자동차', '배터리', '충전인프라', '자율주행'],
      '바이오': ['제약', '바이오', '의료기기', 'K뷰티'],
      '국방': ['방산', '항공우주', '레이더', '드론'],
      'ESG': ['친환경', '재활용', '수처리', '폐기물'],
      '탄소중립': ['친환경', '수소', '원자력', 'CCUS'],
      '디지털뉴딜': ['5G', 'IoT', '클라우드', '데이터센터'],
      '그린뉴딜': ['태양광', '풍력', '전기차', '수소'],
      '메타버스': ['게임', 'VR/AR', '반도체', '콘텐츠'],
      '우주항공': ['항공우주', '위성', '발사체', '통신']
    };
  }

  // 정책 뉴스에서 연관 산업 추출
  analyzePolicyImpact(newsText, policyType) {
    const relevantIndustries = [];
    const keywordCount = {};
    
    Object.entries(this.industryMapping).forEach(([policy, industries]) => {
      if (newsText.includes(policy) || policyType === policy) {
        industries.forEach(industry => {
          keywordCount[industry] = (keywordCount[industry] || 0) + 1;
          if (!relevantIndustries.includes(industry)) {
            relevantIndustries.push(industry);
          }
        });
      }
    });

    return {
      impactedIndustries: relevantIndustries,
      keywordFrequency: keywordCount,
      impactScore: Math.min(Object.keys(keywordCount).length * 10, 100)
    };
  }

  // 산업별 대표 종목 매핑
  getRepresentativeStocks(industry) {
    const stockMapping = {
      '반도체': ['삼성전자', 'SK하이닉스', '네패스', '테스'],
      '태양광': ['한화솔루션', 'OCI', '신성이엔지', '에스에너지'],
      '자동차': ['현대차', '기아', '현대모비스', '만도'],
      '배터리': ['LG에너지솔루션', '삼성SDI', 'SK온', '포스코케미칼'],
      '건설': ['삼성물산', '현대건설', 'DL이앤씨', '포스코이앤씨'],
      '방산': ['한화시스템', 'LIG넥스원', '한화에어로스페이스', 'KAI'],
      '제약': ['삼성바이오로직스', '셀트리온', '유한양행', '종근당'],
      '게임': ['엔씨소프트', '넷마블', '위메이드', '크래프톤']
    };
    
    return stockMapping[industry] || [];
  }

  // 정책→산업→종목 연관성 그래프 생성
  buildCausalityGraph(policyEvent, timeRange = 30) {
    const graph = {
      nodes: [],
      edges: [],
      impactScores: {}
    };

    // 정책 노드 추가
    graph.nodes.push({
      id: `policy_${policyEvent.type}`,
      type: 'policy',
      label: policyEvent.name,
      impact: policyEvent.impact || 'medium'
    });

    // 영향받는 산업 분석
    const industryAnalysis = this.analyzePolicyImpact(
      policyEvent.description, 
      policyEvent.type
    );

    // 산업 노드 및 엣지 추가
    industryAnalysis.impactedIndustries.forEach(industry => {
      const industryId = `industry_${industry}`;
      
      graph.nodes.push({
        id: industryId,
        type: 'industry',
        label: industry,
        impactScore: industryAnalysis.keywordFrequency[industry] || 1
      });

      graph.edges.push({
        from: `policy_${policyEvent.type}`,
        to: industryId,
        weight: industryAnalysis.keywordFrequency[industry] || 1,
        type: 'policy_influence'
      });

      // 해당 산업의 대표 종목들
      const stocks = this.getRepresentativeStocks(industry);
      stocks.forEach(stock => {
        const stockId = `stock_${stock}`;
        
        graph.nodes.push({
          id: stockId,
          type: 'stock',
          label: stock,
          industry: industry
        });

        graph.edges.push({
          from: industryId,
          to: stockId,
          weight: 1,
          type: 'industry_exposure'
        });
      });
    });

    return graph;
  }
}

// 동반 상승 상관 프레임
export class CorrelationAnalyzer {
  constructor() {
    this.correlationThreshold = 0.7;
    this.timeWindows = [5, 20, 60]; // 일자 단위
  }

  // 피어슨 상관계수 계산
  calculatePearsonCorrelation(series1, series2) {
    if (series1.length !== series2.length) return 0;
    
    const n = series1.length;
    const sum1 = series1.reduce((a, b) => a + b, 0);
    const sum2 = series2.reduce((a, b) => a + b, 0);
    const sum1Sq = series1.reduce((a, b) => a + b * b, 0);
    const sum2Sq = series2.reduce((a, b) => a + b * b, 0);
    const pSum = series1.reduce((acc, val, i) => acc + val * series2[i], 0);
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    
    return den === 0 ? 0 : num / den;
  }

  // 동반 상승/하락 패턴 분석
  findCoMovementPatterns(stockData, timeWindow = 20) {
    const correlations = [];
    const stocks = Object.keys(stockData);
    
    for (let i = 0; i < stocks.length; i++) {
      for (let j = i + 1; j < stocks.length; j++) {
        const stock1 = stocks[i];
        const stock2 = stocks[j];
        
        const returns1 = this.calculateReturns(stockData[stock1], timeWindow);
        const returns2 = this.calculateReturns(stockData[stock2], timeWindow);
        
        const correlation = this.calculatePearsonCorrelation(returns1, returns2);
        
        if (Math.abs(correlation) > this.correlationThreshold) {
          correlations.push({
            pair: [stock1, stock2],
            correlation: correlation,
            relationship: correlation > 0 ? 'positive' : 'negative',
            strength: Math.abs(correlation),
            timeWindow: timeWindow
          });
        }
      }
    }
    
    return correlations.sort((a, b) => b.strength - a.strength);
  }

  // 수익률 계산
  calculateReturns(priceData, window) {
    const returns = [];
    for (let i = 1; i < Math.min(priceData.length, window + 1); i++) {
      const returnRate = (priceData[i] - priceData[i-1]) / priceData[i-1];
      returns.push(returnRate);
    }
    return returns;
  }

  // 군집 동반 상승 분석
  analyzeClusterMovement(stockGroups, marketData) {
    const clusterAnalysis = {};
    
    Object.entries(stockGroups).forEach(([sector, stocks]) => {
      const sectorReturns = [];
      const sectorVolumes = [];
      
      stocks.forEach(stock => {
        if (marketData[stock]) {
          const returns = this.calculateReturns(marketData[stock].prices, 20);
          const volumes = marketData[stock].volumes || [];
          
          sectorReturns.push(returns);
          sectorVolumes.push(volumes);
        }
      });
      
      // 섹터 내 평균 상관계수
      const avgCorrelation = this.calculateSectorCorrelation(sectorReturns);
      
      clusterAnalysis[sector] = {
        avgCorrelation: avgCorrelation,
        cohesion: avgCorrelation > 0.6 ? 'high' : avgCorrelation > 0.3 ? 'medium' : 'low',
        movementPattern: this.identifyMovementPattern(sectorReturns),
        volumePattern: this.analyzeVolumePattern(sectorVolumes)
      };
    });
    
    return clusterAnalysis;
  }

  calculateSectorCorrelation(returnsArray) {
    if (returnsArray.length < 2) return 0;
    
    let totalCorr = 0;
    let pairCount = 0;
    
    for (let i = 0; i < returnsArray.length; i++) {
      for (let j = i + 1; j < returnsArray.length; j++) {
        const corr = this.calculatePearsonCorrelation(returnsArray[i], returnsArray[j]);
        totalCorr += corr;
        pairCount++;
      }
    }
    
    return pairCount > 0 ? totalCorr / pairCount : 0;
  }

  identifyMovementPattern(returnsArray) {
    // 섹터 전체의 움직임 패턴 분석
    const avgReturns = returnsArray[0]?.map((_, i) => 
      returnsArray.reduce((sum, returns) => sum + (returns[i] || 0), 0) / returnsArray.length
    ) || [];
    
    const positiveCount = avgReturns.filter(r => r > 0).length;
    const totalCount = avgReturns.length;
    
    if (positiveCount / totalCount > 0.7) return 'bullish';
    if (positiveCount / totalCount < 0.3) return 'bearish';
    return 'neutral';
  }

  analyzeVolumePattern(volumesArray) {
    const avgVolumes = volumesArray.flat();
    const recentAvg = avgVolumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const historicalAvg = avgVolumes.slice(0, -5).reduce((a, b) => a + b, 0) / (avgVolumes.length - 5);
    
    const volumeRatio = recentAvg / historicalAvg;
    
    if (volumeRatio > 1.5) return 'surge';
    if (volumeRatio > 1.2) return 'increased';
    if (volumeRatio < 0.8) return 'decreased';
    return 'normal';
  }
}

// 에너지/소재 영향 분석 프레임
export class CommodityImpactAnalyzer {
  constructor() {
    this.commodityMapping = {
      '원유': ['정유', '화학', '운송', '항공'],
      '구리': ['전자', '자동차', '건설', '전력'],
      '철강': ['건설', '자동차', '조선', '기계'],
      '니켈': ['배터리', '스테인리스', '전자'],
      '리튬': ['배터리', '전기차', '에너지저장'],
      '금': ['귀금속', '반도체', '의료기기'],
      '은': ['태양광', '전자', '의료'],
      '팔라듐': ['자동차', '전자', '치과']
    };
  }

  // 원자재 가격 변동이 산업에 미치는 영향 분석
  analyzeCommodityImpact(commodityPrices, industryData, timeWindow = 30) {
    const impactAnalysis = {};
    
    Object.entries(this.commodityMapping).forEach(([commodity, industries]) => {
      if (!commodityPrices[commodity]) return;
      
      const commodityReturns = this.calculateReturns(
        commodityPrices[commodity], 
        timeWindow
      );
      
      industries.forEach(industry => {
        if (!industryData[industry]) return;
        
        const industryReturns = this.calculateReturns(
          industryData[industry], 
          timeWindow
        );
        
        const correlation = this.calculatePearsonCorrelation(
          commodityReturns, 
          industryReturns
        );
        
        const elasticity = this.calculatePriceElasticity(
          commodityPrices[commodity], 
          industryData[industry]
        );
        
        if (!impactAnalysis[industry]) {
          impactAnalysis[industry] = {};
        }
        
        impactAnalysis[industry][commodity] = {
          correlation: correlation,
          elasticity: elasticity,
          sensitivity: this.categorizeSensitivity(correlation, elasticity),
          impactDirection: correlation > 0 ? 'positive' : 'negative'
        };
      });
    });
    
    return impactAnalysis;
  }

  calculatePriceElasticity(commodityPrices, industryPrices) {
    // 가격 탄력성 계산 (% 변화량 기준)
    const commodityChanges = [];
    const industryChanges = [];
    
    for (let i = 1; i < Math.min(commodityPrices.length, industryPrices.length); i++) {
      const commodityChange = (commodityPrices[i] - commodityPrices[i-1]) / commodityPrices[i-1];
      const industryChange = (industryPrices[i] - industryPrices[i-1]) / industryPrices[i-1];
      
      if (Math.abs(commodityChange) > 0.001) { // 0.1% 이상 변화만 고려
        commodityChanges.push(commodityChange);
        industryChanges.push(industryChange);
      }
    }
    
    if (commodityChanges.length === 0) return 0;
    
    // 평균 탄력성 계산
    const elasticities = commodityChanges.map((commodityChange, i) => 
      Math.abs(commodityChange) > 0.001 ? industryChanges[i] / commodityChange : 0
    );
    
    return elasticities.reduce((sum, e) => sum + e, 0) / elasticities.length;
  }

  categorizeSensitivity(correlation, elasticity) {
    const absCorr = Math.abs(correlation);
    const absElast = Math.abs(elasticity);
    
    if (absCorr > 0.7 && absElast > 1) return 'very_high';
    if (absCorr > 0.5 && absElast > 0.5) return 'high';
    if (absCorr > 0.3 || absElast > 0.3) return 'medium';
    return 'low';
  }

  // 원자재 가격 급등/급락 시 수혜/피해 종목 식별
  identifyBeneficiaryStocks(commodityShock, magnitude = 'high') {
    const beneficiaries = [];
    const victims = [];
    
    Object.entries(this.commodityMapping).forEach(([commodity, industries]) => {
      if (commodityShock.type === commodity) {
        industries.forEach(industry => {
          const impactScore = this.calculateImpactScore(
            commodityShock.direction, 
            commodityShock.magnitude, 
            industry
          );
          
          if (impactScore > 0.5) {
            beneficiaries.push({
              industry: industry,
              impactScore: impactScore,
              reason: `${commodity} ${commodityShock.direction} 수혜`
            });
          } else if (impactScore < -0.5) {
            victims.push({
              industry: industry,
              impactScore: Math.abs(impactScore),
              reason: `${commodity} ${commodityShock.direction} 피해`
            });
          }
        });
      }
    });
    
    return {
      beneficiaries: beneficiaries.sort((a, b) => b.impactScore - a.impactScore),
      victims: victims.sort((a, b) => b.impactScore - a.impactScore)
    };
  }

  calculateImpactScore(direction, magnitude, industry) {
    // 산업별 원자재 의존도와 방향성 고려
    const dependencyScore = {
      '정유': { '원유': 0.9 },
      '화학': { '원유': 0.7, '구리': 0.3 },
      '배터리': { '리튬': 0.8, '니켈': 0.7 },
      '건설': { '철강': 0.8, '구리': 0.6 },
      '자동차': { '철강': 0.6, '구리': 0.4, '팔라듐': 0.3 }
    };
    
    const magnitudeMultiplier = magnitude === 'high' ? 1 : magnitude === 'medium' ? 0.7 : 0.4;
    const directionMultiplier = direction === 'up' ? -1 : 1; // 원자재 상승은 일반적으로 사용 산업에 부정적
    
    // 기본 점수 계산 (업종별 맞춤)
    let baseScore = 0.5;
    
    return baseScore * magnitudeMultiplier * directionMultiplier;
  }

  calculateReturns(priceData, window) {
    const returns = [];
    for (let i = 1; i < Math.min(priceData.length, window + 1); i++) {
      const returnRate = (priceData[i] - priceData[i-1]) / priceData[i-1];
      returns.push(returnRate);
    }
    return returns;
  }

  calculatePearsonCorrelation(series1, series2) {
    if (series1.length !== series2.length) return 0;
    
    const n = series1.length;
    const sum1 = series1.reduce((a, b) => a + b, 0);
    const sum2 = series2.reduce((a, b) => a + b, 0);
    const sum1Sq = series1.reduce((a, b) => a + b * b, 0);
    const sum2Sq = series2.reduce((a, b) => a + b * b, 0);
    const pSum = series1.reduce((acc, val, i) => acc + val * series2[i], 0);
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    
    return den === 0 ? 0 : num / den;
  }
}

// 환율 민감 종목 스코어링 프레임
export class ExchangeRateSensitivityAnalyzer {
  constructor() {
    this.currencyPairs = ['USD/KRW', 'EUR/KRW', 'JPY/KRW', 'CNY/KRW'];
    
    this.exportSectors = [
      '반도체', '자동차', '조선', '철강', '화학', '기계', 
      '디스플레이', '배터리', '석유화학'
    ];
    
    this.importSectors = [
      '정유', '항공', '통신', '유통', '건설', '섬유'
    ];
  }

  // 환율 민감도 스코어링
  calculateExchangeRateSensitivity(stockData, exchangeRateData, timeWindow = 60) {
    const sensitivityScores = {};
    
    Object.keys(stockData).forEach(stock => {
      const stockReturns = this.calculateReturns(stockData[stock], timeWindow);
      const sensitivities = {};
      
      this.currencyPairs.forEach(pair => {
        if (exchangeRateData[pair]) {
          const fxReturns = this.calculateReturns(exchangeRateData[pair], timeWindow);
          const correlation = this.calculatePearsonCorrelation(stockReturns, fxReturns);
          const beta = this.calculateBeta(stockReturns, fxReturns);
          
          sensitivities[pair] = {
            correlation: correlation,
            beta: beta,
            sensitivity: Math.abs(correlation),
            direction: correlation > 0 ? 'positive' : 'negative'
          };
        }
      });
      
      // 종합 민감도 점수 계산
      const avgSensitivity = Object.values(sensitivities)
        .reduce((sum, s) => sum + s.sensitivity, 0) / Object.keys(sensitivities).length;
      
      sensitivityScores[stock] = {
        overallSensitivity: avgSensitivity,
        currencyDetails: sensitivities,
        sensitivityLevel: this.categorizeSensitivity(avgSensitivity),
        businessType: this.inferBusinessType(stock, sensitivities)
      };
    });
    
    return sensitivityScores;
  }

  calculateBeta(stockReturns, marketReturns) {
    if (stockReturns.length !== marketReturns.length) return 0;
    
    const covariance = this.calculateCovariance(stockReturns, marketReturns);
    const marketVariance = this.calculateVariance(marketReturns);
    
    return marketVariance === 0 ? 0 : covariance / marketVariance;
  }

  calculateCovariance(series1, series2) {
    const mean1 = series1.reduce((a, b) => a + b, 0) / series1.length;
    const mean2 = series2.reduce((a, b) => a + b, 0) / series2.length;
    
    const covariance = series1.reduce((sum, val, i) => 
      sum + (val - mean1) * (series2[i] - mean2), 0
    ) / (series1.length - 1);
    
    return covariance;
  }

  calculateVariance(series) {
    const mean = series.reduce((a, b) => a + b, 0) / series.length;
    return series.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (series.length - 1);
  }

  categorizeSensitivity(sensitivity) {
    if (sensitivity > 0.7) return 'very_high';
    if (sensitivity > 0.5) return 'high';
    if (sensitivity > 0.3) return 'medium';
    return 'low';
  }

  inferBusinessType(stock, sensitivities) {
    // USD/KRW 민감도가 높으면서 양의 상관관계 = 수출주
    const usdSensitivity = sensitivities['USD/KRW'];
    
    if (usdSensitivity && usdSensitivity.sensitivity > 0.5) {
      if (usdSensitivity.direction === 'positive') {
        return 'export_oriented'; // 달러 강세 시 유리
      } else {
        return 'import_dependent'; // 달러 강세 시 불리
      }
    }
    
    return 'domestic_focused';
  }

  // 환율 변동 시나리오별 수혜/피해 예측
  analyzeExchangeRateScenario(scenario, sensitivityData) {
    const predictions = {
      beneficiaries: [],
      victims: [],
      neutrals: []
    };
    
    Object.entries(sensitivityData).forEach(([stock, data]) => {
      const currencyImpact = data.currencyDetails[scenario.currencyPair];
      
      if (!currencyImpact) return;
      
      const expectedImpact = this.calculateExpectedImpact(
        scenario.direction, 
        scenario.magnitude, 
        currencyImpact
      );
      
      const stockPrediction = {
        stock: stock,
        expectedReturn: expectedImpact,
        confidence: data.overallSensitivity,
        reasoning: this.generateReasoning(scenario, currencyImpact, data.businessType)
      };
      
      if (expectedImpact > 0.02) { // 2% 이상 수혜 예상
        predictions.beneficiaries.push(stockPrediction);
      } else if (expectedImpact < -0.02) { // 2% 이상 피해 예상
        predictions.victims.push(stockPrediction);
      } else {
        predictions.neutrals.push(stockPrediction);
      }
    });
    
    // 수혜/피해 정도별 정렬
    predictions.beneficiaries.sort((a, b) => b.expectedReturn - a.expectedReturn);
    predictions.victims.sort((a, b) => a.expectedReturn - b.expectedReturn);
    
    return predictions;
  }

  calculateExpectedImpact(direction, magnitude, currencyImpact) {
    const directionMultiplier = direction === 'strengthen' ? 1 : -1;
    const magnitudeMultiplier = magnitude === 'large' ? 1 : magnitude === 'medium' ? 0.6 : 0.3;
    
    // 베타와 상관계수를 결합한 예상 수익률
    const expectedReturn = currencyImpact.beta * directionMultiplier * magnitudeMultiplier * 0.1; // 10% 환율 변동 가정
    
    return expectedReturn;
  }

  generateReasoning(scenario, currencyImpact, businessType) {
    const currency = scenario.currencyPair.split('/')[0];
    const direction = scenario.direction === 'strengthen' ? '강세' : '약세';
    
    let reasoning = `${currency} ${direction} 시 `;
    
    if (businessType === 'export_oriented') {
      reasoning += currencyImpact.direction === 'positive' ? '수출 수익성 개선' : '수출 경쟁력 하락';
    } else if (businessType === 'import_dependent') {
      reasoning += currencyImpact.direction === 'negative' ? '원자재 비용 상승' : '원자재 비용 절감';
    } else {
      reasoning += '제한적 영향';
    }
    
    return reasoning;
  }

  calculateReturns(priceData, window) {
    const returns = [];
    for (let i = 1; i < Math.min(priceData.length, window + 1); i++) {
      const returnRate = (priceData[i] - priceData[i-1]) / priceData[i-1];
      returns.push(returnRate);
    }
    return returns;
  }

  calculatePearsonCorrelation(series1, series2) {
    if (series1.length !== series2.length) return 0;
    
    const n = series1.length;
    const sum1 = series1.reduce((a, b) => a + b, 0);
    const sum2 = series2.reduce((a, b) => a + b, 0);
    const sum1Sq = series1.reduce((a, b) => a + b * b, 0);
    const sum2Sq = series2.reduce((a, b) => a + b * b, 0);
    const pSum = series1.reduce((acc, val, i) => acc + val * series2[i], 0);
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    
    return den === 0 ? 0 : num / den;
  }
}

// 통합 인과관계 분석 프레임워크
export class CausalityFramework {
  constructor() {
    this.policyGraph = new PolicyIndustryStockGraph();
    this.correlationAnalyzer = new CorrelationAnalyzer();
    this.commodityAnalyzer = new CommodityImpactAnalyzer();
    this.fxAnalyzer = new ExchangeRateSensitivityAnalyzer();
  }

  // 종합 인과관계 분석 실행
  async runCausalityAnalysis(marketData, externalData = {}) {
    const results = {
      policyImpact: null,
      correlationPatterns: null,
      commodityEffects: null,
      fxSensitivity: null,
      synthesizedInsights: null
    };

    try {
      // 1. 정책 영향 분석
      if (externalData.policyEvents) {
        results.policyImpact = externalData.policyEvents.map(event => 
          this.policyGraph.buildCausalityGraph(event)
        );
      }

      // 2. 상관관계 패턴 분석
      if (marketData.stocks) {
        results.correlationPatterns = this.correlationAnalyzer.findCoMovementPatterns(
          marketData.stocks
        );
      }

      // 3. 원자재 영향 분석
      if (externalData.commodityPrices && marketData.industries) {
        results.commodityEffects = this.commodityAnalyzer.analyzeCommodityImpact(
          externalData.commodityPrices,
          marketData.industries
        );
      }

      // 4. 환율 민감도 분석
      if (externalData.exchangeRates && marketData.stocks) {
        results.fxSensitivity = this.fxAnalyzer.calculateExchangeRateSensitivity(
          marketData.stocks,
          externalData.exchangeRates
        );
      }

      // 5. 통합 인사이트 생성
      results.synthesizedInsights = this.synthesizeInsights(results);

    } catch (error) {
      console.error('인과관계 분석 중 오류:', error);
    }

    return results;
  }

  // 분석 결과 통합 및 인사이트 도출
  synthesizeInsights(analysisResults) {
    const insights = {
      keyRelationships: [],
      riskFactors: [],
      opportunities: [],
      recommendations: []
    };

    // 주요 관계 도출
    if (analysisResults.correlationPatterns) {
      const strongCorrelations = analysisResults.correlationPatterns
        .filter(c => c.strength > 0.8)
        .slice(0, 5);
      
      insights.keyRelationships = strongCorrelations.map(c => ({
        type: 'correlation',
        description: `${c.pair[0]}와 ${c.pair[1]}의 강한 ${c.relationship === 'positive' ? '동조' : '역방향'} 움직임`,
        strength: c.strength,
        actionable: true
      }));
    }

    // 리스크 요인 식별
    if (analysisResults.fxSensitivity) {
      const highFxRisks = Object.entries(analysisResults.fxSensitivity)
        .filter(([_, data]) => data.sensitivityLevel === 'very_high')
        .map(([stock, data]) => ({
          type: 'fx_risk',
          stock: stock,
          description: `환율 변동에 매우 민감`,
          level: 'high'
        }));
      
      insights.riskFactors.push(...highFxRisks);
    }

    // 기회 요인 식별
    if (analysisResults.policyImpact) {
      analysisResults.policyImpact.forEach(graph => {
        const opportunities = graph.nodes
          .filter(node => node.type === 'stock' && node.impactScore > 7)
          .map(node => ({
            type: 'policy_opportunity',
            stock: node.label,
            description: `정책 수혜 가능성 높음`,
            potential: 'high'
          }));
        
        insights.opportunities.push(...opportunities);
      });
    }

    // 투자 권고 생성
    insights.recommendations = this.generateRecommendations(insights);

    return insights;
  }

  generateRecommendations(insights) {
    const recommendations = [];

    // 상관관계 기반 권고
    insights.keyRelationships.forEach(rel => {
      if (rel.type === 'correlation' && rel.strength > 0.8) {
        recommendations.push({
          type: 'pair_trading',
          description: `${rel.description} - 페어 트레이딩 기회`,
          priority: 'medium',
          timeHorizon: 'short'
        });
      }
    });

    // 리스크 관리 권고
    if (insights.riskFactors.length > 0) {
      recommendations.push({
        type: 'risk_management',
        description: `환율 민감 종목 ${insights.riskFactors.length}개 모니터링 필요`,
        priority: 'high',
        timeHorizon: 'immediate'
      });
    }

    // 기회 활용 권고
    if (insights.opportunities.length > 0) {
      recommendations.push({
        type: 'opportunity',
        description: `정책 수혜주 ${insights.opportunities.length}개 관심 대상`,
        priority: 'medium',
        timeHorizon: 'medium'
      });
    }

    return recommendations;
  }
} 