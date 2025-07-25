/**
 * 인과 관계 분석/상관 프레임 유틸리티
 * Causality and Correlation Analysis Framework
 */

// 정책↔산업↔종목 상호 연관성 그래프 프레임
export class PolicyIndustryStockGraph {
  constructor(stockData, policyData, industryMappings) {
    this.stockData = stockData;
    this.policyData = policyData;
    this.industryMappings = industryMappings;
    this.graph = new Map();
  }

  // 정책-산업-종목 연관성 그래프 생성
  buildConnectivityGraph() {
    const graph = {
      nodes: [],
      edges: [],
      clusters: {}
    };

    // 정책 노드 생성
    this.policyData.forEach(policy => {
      graph.nodes.push({
        id: `policy_${policy.id}`,
        type: 'policy',
        name: policy.name,
        description: policy.description,
        benefitScore: policy.benefitScore || 0,
        effectRadius: policy.effectRadius || 1
      });
    });

    // 산업 노드 생성
    Object.keys(this.industryMappings).forEach(industryCode => {
      const industry = this.industryMappings[industryCode];
      graph.nodes.push({
        id: `industry_${industryCode}`,
        type: 'industry',
        name: industry.name,
        code: industryCode,
        policyExposure: industry.policyExposure || 0
      });
    });

    // 종목 노드 생성
    this.stockData.forEach(stock => {
      graph.nodes.push({
        id: `stock_${stock.symbol}`,
        type: 'stock',
        symbol: stock.symbol,
        name: stock.name,
        industry: stock.industry,
        marketCap: stock.marketCap,
        policyBenefitScore: this.calculatePolicyBenefit(stock)
      });
    });

    // 엣지(연결) 생성
    this.generateEdges(graph);

    return graph;
  }

  // 정책 수혜 점수 계산
  calculatePolicyBenefit(stock) {
    let totalBenefit = 0;
    
    this.policyData.forEach(policy => {
      const industryMatch = this.checkIndustryMatch(stock.industry, policy.targetIndustries);
      const keywordMatch = this.checkKeywordMatch(stock.keywords, policy.keywords);
      
      const benefitScore = (industryMatch * 0.6 + keywordMatch * 0.4) * policy.benefitScore;
      totalBenefit += benefitScore;
    });

    return Math.min(totalBenefit, 100); // 0-100 스케일
  }

  // 산업 매칭 확인
  checkIndustryMatch(stockIndustry, policyIndustries) {
    if (!policyIndustries || !stockIndustry) return 0;
    return policyIndustries.includes(stockIndustry) ? 1 : 0;
  }

  // 키워드 매칭 확인
  checkKeywordMatch(stockKeywords, policyKeywords) {
    if (!stockKeywords || !policyKeywords) return 0;
    
    const matches = stockKeywords.filter(keyword => 
      policyKeywords.some(policyKeyword => 
        keyword.toLowerCase().includes(policyKeyword.toLowerCase())
      )
    );
    
    return Math.min(matches.length / policyKeywords.length, 1);
  }

  // 엣지 생성
  generateEdges(graph) {
    // 정책 → 산업 연결
    this.policyData.forEach(policy => {
      if (policy.targetIndustries) {
        policy.targetIndustries.forEach(industryCode => {
          graph.edges.push({
            source: `policy_${policy.id}`,
            target: `industry_${industryCode}`,
            type: 'policy_industry',
            strength: policy.benefitScore / 100,
            description: `${policy.name} → ${this.industryMappings[industryCode]?.name}`
          });
        });
      }
    });

    // 산업 → 종목 연결
    this.stockData.forEach(stock => {
      graph.edges.push({
        source: `industry_${stock.industry}`,
        target: `stock_${stock.symbol}`,
        type: 'industry_stock',
        strength: 0.8,
        description: `${this.industryMappings[stock.industry]?.name} → ${stock.name}`
      });
    });

    // 정책 → 종목 직접 연결 (강한 연관성)
    this.stockData.forEach(stock => {
      const benefitScore = stock.policyBenefitScore;
      if (benefitScore > 30) { // 임계값 이상일 때만 직접 연결
        this.policyData.forEach(policy => {
          const directBenefit = this.calculateDirectPolicyBenefit(stock, policy);
          if (directBenefit > 20) {
            graph.edges.push({
              source: `policy_${policy.id}`,
              target: `stock_${stock.symbol}`,
              type: 'direct_policy_stock',
              strength: directBenefit / 100,
              description: `${policy.name} → ${stock.name} (직접 수혜)`
            });
          }
        });
      }
    });
  }

  // 직접 정책 수혜 계산
  calculateDirectPolicyBenefit(stock, policy) {
    const industryMatch = this.checkIndustryMatch(stock.industry, policy.targetIndustries);
    const keywordMatch = this.checkKeywordMatch(stock.keywords, policy.keywords);
    const sizeBonus = stock.marketCap > 1000000000 ? 1.2 : 1.0; // 대형주 보너스
    
    return (industryMatch * 0.5 + keywordMatch * 0.5) * policy.benefitScore * sizeBonus;
  }
}

// 동반 상승 상관 프레임
export class CoRisingCorrelationAnalyzer {
  constructor(historicalData, timeWindow = 30) {
    this.historicalData = historicalData;
    this.timeWindow = timeWindow;
  }

  // 동반 상승 패턴 분석
  analyzeCoRisingPatterns() {
    const correlations = new Map();
    const stockSymbols = Object.keys(this.historicalData);

    // 모든 종목 쌍에 대해 상관관계 계산
    for (let i = 0; i < stockSymbols.length; i++) {
      for (let j = i + 1; j < stockSymbols.length; j++) {
        const symbol1 = stockSymbols[i];
        const symbol2 = stockSymbols[j];
        
        const correlation = this.calculateTimeSeriesCorrelation(
          this.historicalData[symbol1],
          this.historicalData[symbol2]
        );

        if (correlation.coefficient > 0.7) { // 강한 양의 상관관계
          correlations.set(`${symbol1}_${symbol2}`, {
            pair: [symbol1, symbol2],
            correlation: correlation.coefficient,
            coRisingDays: correlation.coRisingDays,
            averageRise: correlation.averageRise,
            reliability: correlation.reliability
          });
        }
      }
    }

    return this.rankCorrelations(correlations);
  }

  // 시계열 상관관계 계산
  calculateTimeSeriesCorrelation(data1, data2) {
    const minLength = Math.min(data1.length, data2.length);
    const returns1 = this.calculateReturns(data1.slice(-minLength));
    const returns2 = this.calculateReturns(data2.slice(-minLength));

    const correlation = this.pearsonCorrelation(returns1, returns2);
    const coRisingDays = this.countCoRisingDays(returns1, returns2);
    const averageRise = this.calculateAverageRise(returns1, returns2);
    const reliability = this.calculateReliability(returns1, returns2);

    return {
      coefficient: correlation,
      coRisingDays,
      averageRise,
      reliability
    };
  }

  // 수익률 계산
  calculateReturns(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    return returns;
  }

  // 피어슨 상관계수 계산
  pearsonCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
    const sumXX = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);
    const sumYY = y.map(yi => yi * yi).reduce((a, b) => a + b, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  // 동반 상승 일수 계산
  countCoRisingDays(returns1, returns2) {
    let coRisingDays = 0;
    for (let i = 0; i < returns1.length; i++) {
      if (returns1[i] > 0 && returns2[i] > 0) {
        coRisingDays++;
      }
    }
    return coRisingDays;
  }

  // 평균 상승률 계산
  calculateAverageRise(returns1, returns2) {
    let totalRise = 0;
    let risingDays = 0;
    
    for (let i = 0; i < returns1.length; i++) {
      if (returns1[i] > 0 && returns2[i] > 0) {
        totalRise += (returns1[i] + returns2[i]) / 2;
        risingDays++;
      }
    }
    
    return risingDays > 0 ? totalRise / risingDays : 0;
  }

  // 신뢰도 계산
  calculateReliability(returns1, returns2) {
    const totalDays = returns1.length;
    const sameDireDays = returns1.filter((r1, i) => 
      (r1 > 0 && returns2[i] > 0) || (r1 < 0 && returns2[i] < 0)
    ).length;
    
    return sameDireDays / totalDays;
  }

  // 상관관계 순위화
  rankCorrelations(correlations) {
    return Array.from(correlations.values())
      .sort((a, b) => {
        // 복합 점수: 상관계수 * 신뢰도 * 평균상승률
        const scoreA = a.correlation * a.reliability * Math.abs(a.averageRise) * 100;
        const scoreB = b.correlation * b.reliability * Math.abs(b.averageRise) * 100;
        return scoreB - scoreA;
      })
      .slice(0, 20); // 상위 20개만 반환
  }
}

// 에너지/소재 → 생산 단가 영향 프레임
export class ProductionCostImpactAnalyzer {
  constructor(energyData, materialData, stockData) {
    this.energyData = energyData; // 유가, 전력 등
    this.materialData = materialData; // 철강, 니켈, 구리 등
    this.stockData = stockData;
    this.costSensitivityMap = this.buildSensitivityMap();
  }

  // 비용 민감도 맵 구축
  buildSensitivityMap() {
    return {
      // 에너지 민감도
      energy: {
        '운송': { oil: 0.8, electricity: 0.3 },
        '항공': { oil: 0.9, electricity: 0.2 },
        '화학': { oil: 0.6, gas: 0.7, electricity: 0.5 },
        '철강': { coal: 0.8, electricity: 0.6 },
        '반도체': { electricity: 0.9, gas: 0.4 },
        '자동차': { oil: 0.4, electricity: 0.3, steel: 0.5 }
      },
      // 원자재 민감도
      materials: {
        '반도체': { silicon: 0.6, gold: 0.3, copper: 0.4 },
        '자동차': { steel: 0.6, aluminum: 0.4, copper: 0.3 },
        '건설': { steel: 0.7, cement: 0.6, copper: 0.2 },
        '전자': { copper: 0.5, silver: 0.3, rare_earth: 0.4 },
        '배터리': { lithium: 0.8, nickel: 0.7, cobalt: 0.6 }
      }
    };
  }

  // 생산 단가 영향 분석
  analyzeCostImpact() {
    const results = [];

    this.stockData.forEach(stock => {
      const impact = this.calculateCostImpact(stock);
      if (impact.totalImpact > 0.1) { // 10% 이상 영향받는 종목만
        results.push({
          stock: stock,
          impact: impact,
          riskLevel: this.classifyRiskLevel(impact.totalImpact),
          recommendations: this.generateRecommendations(stock, impact)
        });
      }
    });

    return results.sort((a, b) => b.impact.totalImpact - a.impact.totalImpact);
  }

  // 개별 종목 비용 영향 계산
  calculateCostImpact(stock) {
    const industry = stock.industry;
    const energyImpact = this.calculateEnergyImpact(industry);
    const materialImpact = this.calculateMaterialImpact(industry);
    
    const totalImpact = energyImpact.total + materialImpact.total;
    
    return {
      energyImpact,
      materialImpact,
      totalImpact,
      breakdown: {
        energy: energyImpact,
        materials: materialImpact
      },
      profitabilityRisk: this.calculateProfitabilityRisk(stock, totalImpact)
    };
  }

  // 에너지 영향 계산
  calculateEnergyImpact(industry) {
    const sensitivity = this.costSensitivityMap.energy[industry] || {};
    let totalImpact = 0;
    const breakdown = {};

    Object.keys(sensitivity).forEach(energyType => {
      const priceChange = this.getEnergyPriceChange(energyType);
      const impact = sensitivity[energyType] * priceChange;
      breakdown[energyType] = {
        sensitivity: sensitivity[energyType],
        priceChange,
        impact
      };
      totalImpact += Math.abs(impact);
    });

    return { total: totalImpact, breakdown };
  }

  // 원자재 영향 계산
  calculateMaterialImpact(industry) {
    const sensitivity = this.costSensitivityMap.materials[industry] || {};
    let totalImpact = 0;
    const breakdown = {};

    Object.keys(sensitivity).forEach(materialType => {
      const priceChange = this.getMaterialPriceChange(materialType);
      const impact = sensitivity[materialType] * priceChange;
      breakdown[materialType] = {
        sensitivity: sensitivity[materialType],
        priceChange,
        impact
      };
      totalImpact += Math.abs(impact);
    });

    return { total: totalImpact, breakdown };
  }

  // 에너지 가격 변화율 조회
  getEnergyPriceChange(energyType) {
    const data = this.energyData[energyType];
    if (!data || data.length < 2) return 0;
    
    const current = data[data.length - 1].price;
    const previous = data[data.length - 2].price;
    return (current - previous) / previous;
  }

  // 원자재 가격 변화율 조회
  getMaterialPriceChange(materialType) {
    const data = this.materialData[materialType];
    if (!data || data.length < 2) return 0;
    
    const current = data[data.length - 1].price;
    const previous = data[data.length - 2].price;
    return (current - previous) / previous;
  }

  // 수익성 리스크 계산
  calculateProfitabilityRisk(stock, costImpact) {
    const operatingMargin = stock.financials?.operatingMargin || 0.1;
    const revenueGrowth = stock.financials?.revenueGrowth || 0;
    
    // 비용 증가가 영업이익률에 미치는 영향
    const marginImpact = costImpact * 0.7; // 70%가 마진에 직접 영향
    const newMargin = operatingMargin - marginImpact;
    
    return {
      currentMargin: operatingMargin,
      projectedMargin: newMargin,
      marginImpact,
      riskScore: this.calculateRiskScore(newMargin, revenueGrowth)
    };
  }

  // 리스크 점수 계산
  calculateRiskScore(projectedMargin, revenueGrowth) {
    if (projectedMargin < 0) return 100; // 적자 위험
    if (projectedMargin < 0.05) return 80; // 높은 위험
    if (projectedMargin < 0.1) return 60; // 중간 위험
    if (revenueGrowth < 0) return 50; // 성장률 부정적
    return Math.max(0, 40 - projectedMargin * 100); // 낮은 위험
  }

  // 리스크 레벨 분류
  classifyRiskLevel(totalImpact) {
    if (totalImpact > 0.3) return 'HIGH';
    if (totalImpact > 0.15) return 'MEDIUM';
    return 'LOW';
  }

  // 추천사항 생성
  generateRecommendations(stock, impact) {
    const recommendations = [];
    
    if (impact.riskLevel === 'HIGH') {
      recommendations.push('비용 증가 리스크가 높음. 단기 보유 지양');
      recommendations.push('원자재/에너지 가격 안정화 시점까지 관망');
    } else if (impact.riskLevel === 'MEDIUM') {
      recommendations.push('비용 영향 모니터링 필요');
      recommendations.push('분기 실적 발표 시 마진 변화 확인');
    }
    
    if (impact.profitabilityRisk.riskScore > 70) {
      recommendations.push('수익성 악화 우려. 포지션 축소 고려');
    }
    
    return recommendations;
  }
}

// 환율 민감 종목 스코어링
export class ExchangeRateSensitivityScorer {
  constructor(exchangeRateData, stockData, tradeData) {
    this.exchangeRateData = exchangeRateData;
    this.stockData = stockData;
    this.tradeData = tradeData; // 수출입 데이터
  }

  // 환율 민감도 스코어링
  scoreExchangeRateSensitivity() {
    const results = [];

    this.stockData.forEach(stock => {
      const sensitivity = this.calculateSensitivity(stock);
      if (Math.abs(sensitivity.totalScore) > 20) { // 임계값 이상만
        results.push({
          stock: stock,
          sensitivity: sensitivity,
          currentExposure: this.calculateCurrentExposure(stock),
          recommendations: this.generateExchangeRecommendations(stock, sensitivity)
        });
      }
    });

    return results.sort((a, b) => 
      Math.abs(b.sensitivity.totalScore) - Math.abs(a.sensitivity.totalScore)
    );
  }

  // 환율 민감도 계산
  calculateSensitivity(stock) {
    const exportSensitivity = this.calculateExportSensitivity(stock);
    const importSensitivity = this.calculateImportSensitivity(stock);
    const competitionSensitivity = this.calculateCompetitionSensitivity(stock);
    
    const totalScore = exportSensitivity + importSensitivity + competitionSensitivity;
    
    return {
      export: exportSensitivity,
      import: importSensitivity,
      competition: competitionSensitivity,
      totalScore,
      netExposure: exportSensitivity - importSensitivity,
      explanation: this.explainSensitivity(totalScore, exportSensitivity, importSensitivity)
    };
  }

  // 수출 민감도 계산
  calculateExportSensitivity(stock) {
    const exportRatio = stock.financials?.exportRatio || 0;
    const mainMarkets = stock.businessInfo?.mainMarkets || [];
    
    let baseScore = exportRatio * 100; // 수출비중이 높을수록 민감
    
    // 주요 시장별 가중치
    const marketWeights = {
      'US': 1.5,     // 달러 민감도 높음
      'EU': 1.2,     // 유로 민감도
      'China': 1.3,  // 위안 민감도
      'Japan': 1.1   // 엔화 민감도
    };
    
    let marketMultiplier = 1;
    mainMarkets.forEach(market => {
      marketMultiplier *= (marketWeights[market] || 1);
    });
    
    return baseScore * marketMultiplier;
  }

  // 수입 민감도 계산
  calculateImportSensitivity(stock) {
    const importRatio = stock.financials?.importRatio || 0;
    const rawMaterialDependency = stock.businessInfo?.rawMaterialDependency || 0;
    
    const baseScore = importRatio * 80; // 수입비중 (수출보다 낮은 가중치)
    const materialBonus = rawMaterialDependency * 30; // 원자재 의존도
    
    return -(baseScore + materialBonus); // 음수 (원화 강세 시 비용 감소)
  }

  // 경쟁 민감도 계산
  calculateCompetitionSensitivity(stock) {
    const domesticMarketShare = stock.businessInfo?.domesticMarketShare || 0;
    const foreignCompetitors = stock.businessInfo?.foreignCompetitors || [];
    
    let competitionScore = 0;
    
    // 국내 시장점유율이 낮고 외국 경쟁사가 많으면 환율에 민감
    if (domesticMarketShare < 0.3 && foreignCompetitors.length > 2) {
      competitionScore = 25; // 환율 변동 시 경쟁력 영향
    }
    
    return competitionScore;
  }

  // 현재 노출도 계산
  calculateCurrentExposure(stock) {
    const currentRate = this.getCurrentExchangeRate('USD'); // 달러 기준
    const historicalAverage = this.getHistoricalAverageRate('USD', 252); // 1년 평균
    
    const rateDeviation = (currentRate - historicalAverage) / historicalAverage;
    const exposureMultiplier = stock.sensitivity?.export || 0;
    
    return {
      currentRate,
      historicalAverage,
      deviation: rateDeviation,
      impactEstimate: rateDeviation * exposureMultiplier,
      riskLevel: this.classifyExposureRisk(Math.abs(rateDeviation * exposureMultiplier))
    };
  }

  // 현재 환율 조회
  getCurrentExchangeRate(currency) {
    const data = this.exchangeRateData[currency];
    return data && data.length > 0 ? data[data.length - 1].rate : 1200; // 기본값
  }

  // 역사적 평균 환율 계산
  getHistoricalAverageRate(currency, days) {
    const data = this.exchangeRateData[currency];
    if (!data || data.length < days) return 1200; // 기본값
    
    const recentData = data.slice(-days);
    const sum = recentData.reduce((acc, item) => acc + item.rate, 0);
    return sum / recentData.length;
  }

  // 노출 리스크 분류
  classifyExposureRisk(impactEstimate) {
    if (Math.abs(impactEstimate) > 50) return 'HIGH';
    if (Math.abs(impactEstimate) > 25) return 'MEDIUM';
    return 'LOW';
  }

  // 민감도 설명
  explainSensitivity(totalScore, exportSensitivity, importSensitivity) {
    if (totalScore > 50) {
      return '환율 변동에 매우 민감. 원화 약세 시 수익 증가 가능성';
    } else if (totalScore > 25) {
      return '환율 변동에 민감. 모니터링 필요';
    } else if (totalScore < -25) {
      return '원화 강세 시 비용 절감 효과. 수입 의존도 높음';
    } else {
      return '환율 영향 제한적';
    }
  }

  // 환율 관련 추천사항
  generateExchangeRecommendations(stock, sensitivity) {
    const recommendations = [];
    
    if (sensitivity.totalScore > 50) {
      recommendations.push('환율 헤지 전략 확인 필요');
      recommendations.push('달러 강세 기대 시 매수 고려');
    } else if (sensitivity.totalScore < -30) {
      recommendations.push('원화 강세 시 비용 절감 효과 기대');
      recommendations.push('수입 원가 변동 모니터링');
    }
    
    if (Math.abs(sensitivity.totalScore) > 40) {
      recommendations.push('환율 변동성 높은 시기 포지션 조절');
    }
    
    return recommendations;
  }
}

// 통합 인과관계 분석 매니저
export class CausalityFrameworkManager {
  constructor(data) {
    this.data = data;
    this.policyGraph = new PolicyIndustryStockGraph(
      data.stocks, 
      data.policies, 
      data.industryMappings
    );
    this.correlationAnalyzer = new CoRisingCorrelationAnalyzer(data.historicalPrices);
    this.costAnalyzer = new ProductionCostImpactAnalyzer(
      data.energyPrices, 
      data.materialPrices, 
      data.stocks
    );
    this.exchangeAnalyzer = new ExchangeRateSensitivityScorer(
      data.exchangeRates, 
      data.stocks, 
      data.tradeData
    );
  }

  // 모든 인과관계 프레임 실행
  async executeAllFrames() {
    const results = {
      timestamp: new Date().toISOString(),
      frames: {}
    };

    try {
      // 1. 정책↔산업↔종목 상호 연관성 그래프
      results.frames.policyIndustryGraph = {
        name: '정책↔산업↔종목 상호 연관성 그래프',
        data: this.policyGraph.buildConnectivityGraph(),
        insights: this.generatePolicyInsights()
      };

      // 2. 동반 상승 상관 프레임
      results.frames.coRisingCorrelation = {
        name: '동반 상승 상관 프레임',
        data: this.correlationAnalyzer.analyzeCoRisingPatterns(),
        insights: this.generateCorrelationInsights()
      };

      // 3. 에너지/소재 → 생산 단가 영향 프레임
      results.frames.productionCostImpact = {
        name: '에너지/소재 → 생산 단가 영향 프레임',
        data: this.costAnalyzer.analyzeCostImpact(),
        insights: this.generateCostInsights()
      };

      // 4. 환율 민감 종목 스코어링
      results.frames.exchangeRateSensitivity = {
        name: '환율 민감 종목 스코어링',
        data: this.exchangeAnalyzer.scoreExchangeRateSensitivity(),
        insights: this.generateExchangeInsights()
      };

      return results;

    } catch (error) {
      console.error('인과관계 분석 실행 중 오류:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 정책 관련 인사이트 생성
  generatePolicyInsights() {
    return [
      '정책 발표 후 48시간 내 관련 종목 모니터링 권장',
      '정책 수혜주는 발표 직후보다 실제 시행 시점에 재평가',
      '산업별 정책 노출도를 통한 포트폴리오 리스크 관리 필요'
    ];
  }

  // 상관관계 인사이트 생성
  generateCorrelationInsights() {
    return [
      '동반 상승 패턴은 섹터 순환 전략에 활용 가능',
      '상관관계 깨짐 현상은 개별 종목 이슈 신호일 수 있음',
      '페어 트레이딩 기회 발굴을 위한 상관관계 모니터링'
    ];
  }

  // 비용 영향 인사이트 생성
  generateCostInsights() {
    return [
      '원자재 가격 상승기에는 비용 전가 능력이 중요',
      '에너지 집약적 산업의 계절성 고려 필요',
      '글로벌 공급망 이슈와 연계한 리스크 관리'
    ];
  }

  // 환율 인사이트 생성
  generateExchangeInsights() {
    return [
      '수출기업은 환율 헤지 비율 확인 필요',
      '환율 변동성이 높은 시기에는 포지션 크기 조절',
      '달러 강세 사이클과 수출주 투자 타이밍 연계'
    ];
  }
} 