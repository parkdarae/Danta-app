/**
 * 투자 전략 실현 프레임워크
 * 5개 핵심 프레임: 퀀트팩터 랭킹, 30일 수익 최대화 시뮬레이터, 익절 트리거 알림, 매수 타이밍 점수화, 섹터 순환 전략
 */

export default class InvestmentStrategyFrameworks {
  constructor() {
    this.name = '투자 전략 실현 프레임워크';
    this.version = '1.0.0';
    this.status = 'active';
  }

  // 1. 퀀트팩터 랭킹 프레임
  async analyzeQuantFactorRanking(stock, marketData = {}) {
    try {
      // 퀀트 팩터 계산
      const quantFactors = this.calculateQuantFactors(stock, marketData);
      
      // 팩터별 점수 산출
      const factorScores = this.calculateFactorScores(quantFactors);
      
      // 종합 랭킹 계산
      const overallRanking = this.calculateOverallRanking(factorScores);
      
      // 동종업계 비교
      const industryComparison = this.compareWithIndustry(stock, factorScores);
      
      return {
        frameId: 'quant_factor_ranking',
        frameName: '퀀트팩터 랭킹',
        score: overallRanking.normalizedScore,
        confidence: 0.88,
        data: {
          quantFactors,
          factorScores,
          overallRanking,
          industryComparison,
          recommendations: this.generateQuantRecommendations(factorScores)
        },
        insights: this.generateQuantInsights(factorScores, industryComparison),
        visualization: this.createQuantVisualization(factorScores),
        recommendations: this.generateQuantRecommendations(factorScores)
      };
    } catch (error) {
      return this.createErrorResult('quant_factor_ranking', error);
    }
  }

  // 2. 30일 수익 최대화 시뮬레이터 프레임
  async analyzeProfitMaximizationSimulator(stock, seedMoney = 500000, marketData = {}) {
    try {
      // 시나리오 생성
      const scenarios = this.generateInvestmentScenarios(stock, seedMoney);
      
      // 몬테카를로 시뮬레이션
      const simulations = this.runMonteCarloSimulation(scenarios, marketData);
      
      // 최적 전략 추출
      const optimalStrategy = this.findOptimalStrategy(simulations);
      
      // 리스크 분석
      const riskAnalysis = this.analyzeInvestmentRisks(simulations);
      
      return {
        frameId: 'profit_maximization_simulator',
        frameName: '30일 수익 최대화 시뮬레이터',
        score: optimalStrategy.expectedReturn,
        confidence: 0.75,
        data: {
          scenarios,
          simulations,
          optimalStrategy,
          riskAnalysis,
          projectedOutcomes: this.calculateProjectedOutcomes(simulations)
        },
        insights: this.generateSimulationInsights(optimalStrategy, riskAnalysis),
        visualization: this.createSimulationVisualization(simulations),
        recommendations: this.generateSimulationRecommendations(optimalStrategy)
      };
    } catch (error) {
      return this.createErrorResult('profit_maximization_simulator', error);
    }
  }

  // 3. 익절 트리거 알림 프레임
  async analyzeTakeProfitTrigger(stock, marketData = {}) {
    try {
      // 현재 시장 상황 분석
      const marketConditions = this.analyzeMarketConditions(stock, marketData);
      
      // 기술적 지표 분석
      const technicalIndicators = this.analyzeTechnicalIndicators(stock, marketData);
      
      // 거래량 분석
      const volumeAnalysis = this.analyzeVolumePatterns(stock, marketData);
      
      // 뉴스/이벤트 영향도
      const newsImpact = this.analyzeNewsImpact(stock, marketData);
      
      // 익절 조건 설정
      const triggerConditions = this.calculateTriggerConditions(
        marketConditions, 
        technicalIndicators, 
        volumeAnalysis, 
        newsImpact
      );
      
      return {
        frameId: 'take_profit_trigger',
        frameName: '익절 트리거 알림',
        score: triggerConditions.urgencyScore,
        confidence: 0.82,
        data: {
          marketConditions,
          technicalIndicators,
          volumeAnalysis,
          newsImpact,
          triggerConditions,
          alertSettings: this.generateAlertSettings(triggerConditions)
        },
        insights: this.generateTriggerInsights(triggerConditions),
        visualization: this.createTriggerVisualization(triggerConditions),
        recommendations: this.generateTriggerRecommendations(triggerConditions)
      };
    } catch (error) {
      return this.createErrorResult('take_profit_trigger', error);
    }
  }

  // 4. 매수 타이밍 점수화 프레임
  async analyzeBuyTimingScoring(stock, marketData = {}) {
    try {
      // RSI 분석
      const rsiAnalysis = this.analyzeRSI(stock, marketData);
      
      // MACD 분석
      const macdAnalysis = this.analyzeMACDSignals(stock, marketData);
      
      // 거래량 분포 분석
      const volumeDistribution = this.analyzeVolumeDistribution(stock, marketData);
      
      // 수급 분석
      const supplyDemandAnalysis = this.analyzeSupplyDemand(stock, marketData);
      
      // 매수 타이밍 점수 계산
      const timingScore = this.calculateBuyTimingScore(
        rsiAnalysis,
        macdAnalysis,
        volumeDistribution,
        supplyDemandAnalysis
      );
      
      return {
        frameId: 'buy_timing_scoring',
        frameName: '매수 타이밍 점수화',
        score: timingScore.overall,
        confidence: 0.85,
        data: {
          rsiAnalysis,
          macdAnalysis,
          volumeDistribution,
          supplyDemandAnalysis,
          timingScore,
          optimalEntry: this.calculateOptimalEntry(timingScore)
        },
        insights: this.generateTimingInsights(timingScore),
        visualization: this.createTimingVisualization(timingScore),
        recommendations: this.generateTimingRecommendations(timingScore)
      };
    } catch (error) {
      return this.createErrorResult('buy_timing_scoring', error);
    }
  }

  // 5. 섹터 순환 전략 시각화 프레임
  async analyzeSectorRotationStrategy(stock, marketData = {}) {
    try {
      // 섹터별 자금 흐름 분석
      const sectorFlows = this.analyzeSectorMoneyFlows(marketData);
      
      // 경기 사이클 위치 분석
      const cyclePosition = this.analyzeEconomicCyclePosition(marketData);
      
      // 섹터 순환 패턴 분석
      const rotationPatterns = this.analyzeSectorRotationPatterns(sectorFlows, cyclePosition);
      
      // 다음 단계 예측
      const nextPhase = this.predictNextRotationPhase(rotationPatterns);
      
      // 해당 종목의 섹터 위치
      const stockSectorPosition = this.analyzeStockSectorPosition(stock, sectorFlows);
      
      return {
        frameId: 'sector_rotation_strategy',
        frameName: '섹터 순환 전략 시각화',
        score: nextPhase.confidence,
        confidence: 0.78,
        data: {
          sectorFlows,
          cyclePosition,
          rotationPatterns,
          nextPhase,
          stockSectorPosition,
          rotationTimeline: this.createRotationTimeline(rotationPatterns)
        },
        insights: this.generateRotationInsights(nextPhase, stockSectorPosition),
        visualization: this.createRotationVisualization(sectorFlows, nextPhase),
        recommendations: this.generateRotationRecommendations(nextPhase, stockSectorPosition)
      };
    } catch (error) {
      return this.createErrorResult('sector_rotation_strategy', error);
    }
  }

  // 통합 분석 실행
  async executeAllFrames(stock, marketData = {}) {
    const results = {
      timestamp: new Date().toISOString(),
      category: 'investment_strategy',
      categoryName: '투자 전략 실현 프레임',
      stock,
      frames: {},
      summary: {}
    };

    try {
      // 모든 프레임 병렬 실행
      const [
        quantRanking,
        profitSimulator,
        takeProfitTrigger,
        buyTiming,
        sectorRotation
      ] = await Promise.all([
        this.analyzeQuantFactorRanking(stock, marketData),
        this.analyzeProfitMaximizationSimulator(stock, 500000, marketData),
        this.analyzeTakeProfitTrigger(stock, marketData),
        this.analyzeBuyTimingScoring(stock, marketData),
        this.analyzeSectorRotationStrategy(stock, marketData)
      ]);

      results.frames = {
        quantRanking,
        profitSimulator,
        takeProfitTrigger,
        buyTiming,
        sectorRotation
      };

      // 투자 전략 종합 요약 생성
      results.summary = this.generateInvestmentSummary(results.frames);
      
      return results;
    } catch (error) {
      console.error('투자 전략 프레임 실행 오류:', error);
      return {
        ...results,
        error: error.message,
        status: 'error'
      };
    }
  }

  // === 퀀트팩터 관련 메서드들 ===

  calculateQuantFactors(stock, marketData) {
    // 모의 재무 데이터 생성 (실제로는 API에서 가져옴)
    const mockData = {
      market_cap: Math.random() * 100000000000000, // 시가총액
      revenue: Math.random() * 10000000000000, // 매출
      net_income: Math.random() * 1000000000000, // 순이익
      total_assets: Math.random() * 50000000000000, // 총자산
      shareholders_equity: Math.random() * 20000000000000, // 자기자본
      current_price: Math.random() * 100000 + 50000,
      book_value_per_share: Math.random() * 50000 + 20000,
      sales_per_share: Math.random() * 80000 + 30000,
      operating_cash_flow: Math.random() * 5000000000000,
      debt_to_equity: Math.random() * 2,
      gross_margin: Math.random() * 0.5 + 0.1
    };

    return {
      // 가치 지표
      PER: mockData.current_price / (mockData.net_income / (mockData.market_cap / mockData.current_price)),
      PBR: mockData.current_price / mockData.book_value_per_share,
      PSR: mockData.market_cap / mockData.revenue,
      PCR: mockData.market_cap / mockData.operating_cash_flow,
      
      // 수익성 지표
      ROE: mockData.net_income / mockData.shareholders_equity,
      ROA: mockData.net_income / mockData.total_assets,
      ROIC: mockData.net_income / (mockData.shareholders_equity + mockData.debt_to_equity * mockData.shareholders_equity),
      Gross_Margin: mockData.gross_margin,
      
      // 성장성 지표
      Revenue_Growth: Math.random() * 0.3 - 0.1, // -10% ~ 20%
      Earnings_Growth: Math.random() * 0.4 - 0.2, // -20% ~ 20%
      
      // 안정성 지표
      Debt_to_Equity: mockData.debt_to_equity,
      Current_Ratio: Math.random() * 2 + 1, // 1 ~ 3
      Quick_Ratio: Math.random() * 1.5 + 0.5 // 0.5 ~ 2
    };
  }

  calculateFactorScores(factors) {
    const scores = {};
    
    // 각 팩터를 0-100점으로 정규화
    scores.value = {
      PER: this.normalizeScore(factors.PER, 5, 25, true), // 낮을수록 좋음
      PBR: this.normalizeScore(factors.PBR, 0.5, 3, true),
      PSR: this.normalizeScore(factors.PSR, 0.5, 5, true),
      PCR: this.normalizeScore(factors.PCR, 5, 20, true)
    };
    
    scores.profitability = {
      ROE: this.normalizeScore(factors.ROE, 0, 0.3, false), // 높을수록 좋음
      ROA: this.normalizeScore(factors.ROA, 0, 0.15, false),
      ROIC: this.normalizeScore(factors.ROIC, 0, 0.25, false),
      Gross_Margin: this.normalizeScore(factors.Gross_Margin, 0, 0.6, false)
    };
    
    scores.growth = {
      Revenue_Growth: this.normalizeScore(factors.Revenue_Growth, -0.1, 0.3, false),
      Earnings_Growth: this.normalizeScore(factors.Earnings_Growth, -0.2, 0.4, false)
    };
    
    scores.stability = {
      Debt_to_Equity: this.normalizeScore(factors.Debt_to_Equity, 0, 2, true),
      Current_Ratio: this.normalizeScore(factors.Current_Ratio, 1, 3, false),
      Quick_Ratio: this.normalizeScore(factors.Quick_Ratio, 0.5, 2, false)
    };
    
    return scores;
  }

  normalizeScore(value, min, max, reverse = false) {
    const normalized = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    return reverse ? 100 - normalized : normalized;
  }

  calculateOverallRanking(factorScores) {
    const weights = {
      value: 0.3,
      profitability: 0.3,
      growth: 0.25,
      stability: 0.15
    };
    
    let totalScore = 0;
    const categoryScores = {};
    
    Object.entries(factorScores).forEach(([category, scores]) => {
      const categoryAvg = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;
      categoryScores[category] = categoryAvg;
      totalScore += categoryAvg * weights[category];
    });
    
    return {
      totalScore,
      normalizedScore: totalScore / 100,
      categoryScores,
      rank: this.calculateRank(totalScore),
      grade: this.calculateGrade(totalScore)
    };
  }

  calculateRank(score) {
    if (score >= 85) return 'S';
    if (score >= 75) return 'A';
    if (score >= 65) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  }

  calculateGrade(score) {
    if (score >= 85) return '매우 우수';
    if (score >= 75) return '우수';
    if (score >= 65) return '양호';
    if (score >= 50) return '보통';
    return '주의';
  }

  compareWithIndustry(stock, factorScores) {
    // 동종업계 평균 대비 비교 (모의 데이터)
    const industryAverages = {
      value: 60,
      profitability: 55,
      growth: 50,
      stability: 65
    };
    
    const comparison = {};
    Object.entries(factorScores).forEach(([category, scores]) => {
      const categoryAvg = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;
      comparison[category] = {
        myScore: categoryAvg,
        industryAvg: industryAverages[category],
        difference: categoryAvg - industryAverages[category],
        percentile: this.calculatePercentile(categoryAvg)
      };
    });
    
    return comparison;
  }

  calculatePercentile(score) {
    return Math.min(95, Math.max(5, score + Math.random() * 20 - 10));
  }

  generateQuantInsights(factorScores, industryComparison) {
    const insights = [];
    
    // 강점 분석
    const strengths = Object.entries(industryComparison)
      .filter(([_, data]) => data.difference > 10)
      .map(([category, _]) => category);
    
    if (strengths.length > 0) {
      insights.push(`${strengths.join(', ')} 부문에서 업계 평균 대비 우수한 성과를 보입니다.`);
    }
    
    // 약점 분석
    const weaknesses = Object.entries(industryComparison)
      .filter(([_, data]) => data.difference < -10)
      .map(([category, _]) => category);
    
    if (weaknesses.length > 0) {
      insights.push(`${weaknesses.join(', ')} 부문에서 업계 평균 대비 개선이 필요합니다.`);
    }
    
    // 전체적인 평가
    const avgDifference = Object.values(industryComparison)
      .reduce((sum, data) => sum + data.difference, 0) / Object.keys(industryComparison).length;
    
    if (avgDifference > 5) {
      insights.push('전반적으로 업계 평균을 상회하는 우량 기업입니다.');
    } else if (avgDifference < -5) {
      insights.push('전반적으로 업계 평균 대비 개선 여지가 있습니다.');
    }
    
    return insights;
  }

  createQuantVisualization(factorScores) {
    const radarData = Object.entries(factorScores).map(([category, scores]) => ({
      subject: category,
      value: Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length,
      fullMark: 100
    }));
    
    return {
      type: 'radar',
      data: radarData,
      options: {
        title: '퀀트팩터 종합 분석',
        labels: {
          value: '점수',
          profitability: '수익성',
          growth: '성장성',
          stability: '안정성'
        }
      }
    };
  }

  generateQuantRecommendations(factorScores) {
    const recommendations = [];
    
    const overallScore = Object.values(factorScores)
      .map(category => Object.values(category).reduce((sum, score) => sum + score, 0) / Object.values(category).length)
      .reduce((sum, score) => sum + score, 0) / Object.keys(factorScores).length;
    
    if (overallScore >= 75) {
      recommendations.push('퀀트 지표상 우수한 투자 대상으로 평가됩니다.');
      recommendations.push('장기 보유 관점에서 매력적인 종목입니다.');
    } else if (overallScore >= 60) {
      recommendations.push('전반적으로 양호한 수준이나 일부 지표 개선 모니터링이 필요합니다.');
    } else {
      recommendations.push('퀀트 지표상 신중한 접근이 필요한 종목입니다.');
      recommendations.push('추가적인 정성적 분석과 함께 종합 판단하세요.');
    }
    
    return recommendations;
  }

  // === 수익 최대화 시뮬레이터 관련 메서드들 ===

  generateInvestmentScenarios(stock, seedMoney) {
    return [
      {
        id: 'conservative',
        name: '보수적 전략',
        allocation: { [stock]: 0.3, 'cash': 0.7 },
        rebalanceFrequency: 30,
        riskLevel: 'low'
      },
      {
        id: 'balanced',
        name: '균형 전략',
        allocation: { [stock]: 0.5, 'market_etf': 0.3, 'cash': 0.2 },
        rebalanceFrequency: 14,
        riskLevel: 'medium'
      },
      {
        id: 'aggressive',
        name: '적극적 전략',
        allocation: { [stock]: 0.7, 'growth_stocks': 0.2, 'cash': 0.1 },
        rebalanceFrequency: 7,
        riskLevel: 'high'
      },
      {
        id: 'momentum',
        name: '모멘텀 전략',
        allocation: { [stock]: 0.8, 'momentum_stocks': 0.15, 'cash': 0.05 },
        rebalanceFrequency: 3,
        riskLevel: 'very_high'
      }
    ];
  }

  runMonteCarloSimulation(scenarios, marketData, iterations = 1000) {
    const results = {};
    
    scenarios.forEach(scenario => {
      const outcomes = [];
      
      for (let i = 0; i < iterations; i++) {
        const outcome = this.simulateSingleScenario(scenario, marketData);
        outcomes.push(outcome);
      }
      
      results[scenario.id] = {
        scenario,
        outcomes,
        statistics: this.calculateSimulationStatistics(outcomes)
      };
    });
    
    return results;
  }

  simulateSingleScenario(scenario, marketData) {
    let portfolioValue = 500000; // 초기 투자금
    const dailyReturns = [];
    
    // 30일 시뮬레이션
    for (let day = 1; day <= 30; day++) {
      // 일일 수익률 생성 (정규분포 기반)
      const baseReturn = (Math.random() - 0.5) * 0.1; // -5% ~ +5%
      const volatilityAdjustment = this.getRiskMultiplier(scenario.riskLevel);
      const dailyReturn = baseReturn * volatilityAdjustment;
      
      portfolioValue *= (1 + dailyReturn);
      dailyReturns.push(dailyReturn);
      
      // 리밸런싱 체크
      if (day % scenario.rebalanceFrequency === 0) {
        portfolioValue *= 0.998; // 리밸런싱 비용 (0.2%)
      }
    }
    
    return {
      finalValue: portfolioValue,
      totalReturn: (portfolioValue - 500000) / 500000,
      dailyReturns,
      maxDrawdown: this.calculateMaxDrawdown(dailyReturns),
      sharpeRatio: this.calculateSharpeRatio(dailyReturns)
    };
  }

  getRiskMultiplier(riskLevel) {
    const multipliers = {
      'low': 0.5,
      'medium': 1.0,
      'high': 1.5,
      'very_high': 2.0
    };
    return multipliers[riskLevel] || 1.0;
  }

  calculateMaxDrawdown(returns) {
    let maxDrawdown = 0;
    let peak = 0;
    let cumulative = 1;
    
    returns.forEach(ret => {
      cumulative *= (1 + ret);
      if (cumulative > peak) {
        peak = cumulative;
      }
      const drawdown = (peak - cumulative) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    });
    
    return maxDrawdown;
  }

  calculateSharpeRatio(returns) {
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const volatility = Math.sqrt(
      returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    );
    return volatility > 0 ? avgReturn / volatility : 0;
  }

  calculateSimulationStatistics(outcomes) {
    const finalValues = outcomes.map(o => o.finalValue);
    const returns = outcomes.map(o => o.totalReturn);
    
    return {
      meanReturn: returns.reduce((sum, ret) => sum + ret, 0) / returns.length,
      medianReturn: this.calculateMedian(returns),
      standardDeviation: Math.sqrt(
        returns.reduce((sum, ret) => sum + Math.pow(ret - this.calculateMean(returns), 2), 0) / returns.length
      ),
      percentile5: this.calculatePercentile(returns, 5),
      percentile95: this.calculatePercentile(returns, 95),
      winRate: returns.filter(ret => ret > 0).length / returns.length,
      avgMaxDrawdown: outcomes.reduce((sum, o) => sum + o.maxDrawdown, 0) / outcomes.length,
      avgSharpeRatio: outcomes.reduce((sum, o) => sum + o.sharpeRatio, 0) / outcomes.length
    };
  }

  calculateMean(array) {
    return array.reduce((sum, val) => sum + val, 0) / array.length;
  }

  calculateMedian(array) {
    const sorted = [...array].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  calculatePercentile(array, percentile) {
    const sorted = [...array].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    return lower === upper ? sorted[lower] : 
           sorted[lower] * (upper - index) + sorted[upper] * (index - lower);
  }

  findOptimalStrategy(simulations) {
    let optimalStrategy = null;
    let bestScore = -Infinity;
    
    Object.entries(simulations).forEach(([strategyId, result]) => {
      // 위험 조정 수익률 계산 (샤프 비율 고려)
      const riskAdjustedReturn = result.statistics.meanReturn - 
        (result.statistics.standardDeviation * 0.5); // 리스크 페널티
      
      const score = riskAdjustedReturn * result.statistics.winRate;
      
      if (score > bestScore) {
        bestScore = score;
        optimalStrategy = {
          strategyId,
          strategy: result.scenario,
          expectedReturn: result.statistics.meanReturn,
          riskAdjustedReturn,
          winRate: result.statistics.winRate,
          maxDrawdown: result.statistics.avgMaxDrawdown,
          score
        };
      }
    });
    
    return optimalStrategy;
  }

  analyzeInvestmentRisks(simulations) {
    const riskAnalysis = {};
    
    Object.entries(simulations).forEach(([strategyId, result]) => {
      riskAnalysis[strategyId] = {
        volatility: result.statistics.standardDeviation,
        downside_risk: result.statistics.percentile5,
        max_drawdown: result.statistics.avgMaxDrawdown,
        var_95: result.statistics.percentile5, // Value at Risk (95%)
        risk_rating: this.calculateRiskRating(result.statistics)
      };
    });
    
    return riskAnalysis;
  }

  calculateRiskRating(stats) {
    if (stats.standardDeviation > 0.15 || stats.avgMaxDrawdown > 0.3) return 'high';
    if (stats.standardDeviation > 0.1 || stats.avgMaxDrawdown > 0.2) return 'medium';
    return 'low';
  }

  calculateProjectedOutcomes(simulations) {
    const projections = {};
    
    Object.entries(simulations).forEach(([strategyId, result]) => {
      projections[strategyId] = {
        best_case: 500000 * (1 + result.statistics.percentile95),
        expected_case: 500000 * (1 + result.statistics.meanReturn),
        worst_case: 500000 * (1 + result.statistics.percentile5),
        probability_of_loss: 1 - result.statistics.winRate
      };
    });
    
    return projections;
  }

  generateSimulationInsights(optimalStrategy, riskAnalysis) {
    const insights = [];
    
    insights.push(`${optimalStrategy.strategy.name}이 위험 조정 수익률 기준 최적 전략입니다.`);
    insights.push(`예상 수익률: ${(optimalStrategy.expectedReturn * 100).toFixed(1)}%, 승률: ${(optimalStrategy.winRate * 100).toFixed(1)}%`);
    
    if (optimalStrategy.maxDrawdown > 0.2) {
      insights.push('최대 손실폭이 20%를 초과할 수 있어 리스크 관리가 중요합니다.');
    }
    
    const highRiskStrategies = Object.entries(riskAnalysis)
      .filter(([_, analysis]) => analysis.risk_rating === 'high').length;
    
    if (highRiskStrategies > 0) {
      insights.push('일부 전략은 높은 위험도를 보이므로 신중한 선택이 필요합니다.');
    }
    
    return insights;
  }

  createSimulationVisualization(simulations) {
    const data = Object.entries(simulations).map(([strategyId, result]) => ({
      strategy: result.scenario.name,
      expectedReturn: result.statistics.meanReturn * 100,
      risk: result.statistics.standardDeviation * 100,
      sharpeRatio: result.statistics.avgSharpeRatio,
      winRate: result.statistics.winRate * 100
    }));
    
    return {
      type: 'scatter',
      data,
      options: {
        xAxis: 'risk',
        yAxis: 'expectedReturn',
        size: 'sharpeRatio',
        title: '위험-수익률 분석',
        labels: {
          x: '위험도 (%)',
          y: '예상 수익률 (%)'
        }
      }
    };
  }

  generateSimulationRecommendations(optimalStrategy) {
    const recommendations = [];
    
    recommendations.push(`${optimalStrategy.strategy.name} 채택을 권장합니다.`);
    
    if (optimalStrategy.strategy.riskLevel === 'high' || optimalStrategy.strategy.riskLevel === 'very_high') {
      recommendations.push('고위험 전략이므로 손절매 기준을 명확히 설정하세요.');
      recommendations.push('포지션 크기를 조절하여 위험을 관리하세요.');
    }
    
    recommendations.push(`${optimalStrategy.strategy.rebalanceFrequency}일마다 포트폴리오 리밸런싱을 실행하세요.`);
    recommendations.push('시장 상황 변화에 따라 전략을 유연하게 조정하세요.');
    
    return recommendations;
  }

  // === 익절 트리거 관련 메서드들 ===

  analyzeMarketConditions(stock, marketData) {
    return {
      market_trend: Math.random() > 0.5 ? 'bullish' : 'bearish',
      volatility_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      sector_performance: Math.random() * 0.2 - 0.1, // -10% ~ +10%
      overall_sentiment: Math.random() * 100,
      fear_greed_index: Math.random() * 100
    };
  }

  analyzeTechnicalIndicators(stock, marketData) {
    return {
      rsi: Math.random() * 100,
      macd: {
        signal: Math.random() > 0.5 ? 'bullish' : 'bearish',
        strength: Math.random() * 100
      },
      bollinger_position: Math.random() * 100, // 0-100, 볼린저 밴드 내 위치
      moving_average_trend: Math.random() > 0.5 ? 'upward' : 'downward',
      support_resistance: {
        support: Math.random() * 10000 + 80000,
        resistance: Math.random() * 10000 + 90000,
        current_position: Math.random() * 100
      }
    };
  }

  analyzeVolumePatterns(stock, marketData) {
    return {
      volume_trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
      volume_spike: Math.random() > 0.7, // 거래량 급증 여부
      relative_volume: Math.random() * 3 + 0.5, // 평균 대비 배수
      distribution_days: Math.floor(Math.random() * 10), // 최근 분산 매도일 수
      accumulation_signal: Math.random() > 0.6
    };
  }

  analyzeNewsImpact(stock, marketData) {
    return {
      recent_news_sentiment: Math.random() * 2 - 1, // -1 ~ +1
      earnings_proximity: Math.floor(Math.random() * 30), // 실적발표까지 일수
      major_events: Math.random() > 0.8, // 주요 이벤트 임박 여부
      analyst_upgrades: Math.floor(Math.random() * 3), // 최근 목표주가 상향 수
      insider_trading: Math.random() > 0.9 // 임원 매매 여부
    };
  }

  calculateTriggerConditions(marketConditions, technicalIndicators, volumeAnalysis, newsImpact) {
    let urgencyScore = 0;
    const triggers = [];
    
    // 기술적 트리거
    if (technicalIndicators.rsi > 80) {
      urgencyScore += 0.3;
      triggers.push('RSI 과매수 구간 진입');
    }
    
    if (technicalIndicators.support_resistance.current_position > 90) {
      urgencyScore += 0.25;
      triggers.push('저항선 근접');
    }
    
    // 거래량 트리거
    if (volumeAnalysis.volume_spike && volumeAnalysis.relative_volume > 2) {
      urgencyScore += 0.2;
      triggers.push('거래량 급증');
    }
    
    // 뉴스/이벤트 트리거
    if (newsImpact.earnings_proximity <= 3) {
      urgencyScore += 0.15;
      triggers.push('실적발표 임박');
    }
    
    // 시장 상황 트리거
    if (marketConditions.fear_greed_index > 80) {
      urgencyScore += 0.1;
      triggers.push('시장 과열');
    }
    
    return {
      urgencyScore: Math.min(urgencyScore, 1.0),
      activeTrigs: triggers,
      recommendedAction: this.getRecommendedAction(urgencyScore),
      timeFrame: this.calculateTimeFrame(urgencyScore),
      confidenceLevel: Math.min(urgencyScore + 0.2, 0.95)
    };
  }

  getRecommendedAction(urgencyScore) {
    if (urgencyScore > 0.7) return 'immediate_sell';
    if (urgencyScore > 0.5) return 'prepare_sell';
    if (urgencyScore > 0.3) return 'monitor_closely';
    return 'hold';
  }

  calculateTimeFrame(urgencyScore) {
    if (urgencyScore > 0.7) return '즉시';
    if (urgencyScore > 0.5) return '1-2일 내';
    if (urgencyScore > 0.3) return '1주일 내';
    return '모니터링';
  }

  generateAlertSettings(triggerConditions) {
    return {
      price_alert: triggerConditions.urgencyScore > 0.5,
      volume_alert: triggerConditions.urgencyScore > 0.4,
      news_alert: triggerConditions.urgencyScore > 0.3,
      technical_alert: triggerConditions.urgencyScore > 0.6,
      notification_frequency: this.getNotificationFrequency(triggerConditions.urgencyScore)
    };
  }

  getNotificationFrequency(urgencyScore) {
    if (urgencyScore > 0.7) return 'real_time';
    if (urgencyScore > 0.5) return 'hourly';
    if (urgencyScore > 0.3) return 'daily';
    return 'weekly';
  }

  generateTriggerInsights(triggerConditions) {
    const insights = [];
    
    if (triggerConditions.urgencyScore > 0.7) {
      insights.push('매우 강한 익절 신호가 감지되었습니다.');
      insights.push('즉시 매도를 검토하시기 바랍니다.');
    } else if (triggerConditions.urgencyScore > 0.5) {
      insights.push('익절 타이밍이 근접했습니다.');
      insights.push('포지션 일부 정리를 고려해보세요.');
    } else if (triggerConditions.urgencyScore > 0.3) {
      insights.push('주의 깊은 모니터링이 필요한 시점입니다.');
    } else {
      insights.push('현재는 안정적인 보유가 가능한 상황입니다.');
    }
    
    if (triggerConditions.activeTrigs.length > 0) {
      insights.push(`활성 트리거: ${triggerConditions.activeTrigs.join(', ')}`);
    }
    
    return insights;
  }

  createTriggerVisualization(triggerConditions) {
    return {
      type: 'gauge',
      data: {
        value: triggerConditions.urgencyScore * 100,
        ranges: [
          { min: 0, max: 30, color: '#4CAF50', label: '안전' },
          { min: 30, max: 50, color: '#FF9800', label: '주의' },
          { min: 50, max: 70, color: '#F44336', label: '경고' },
          { min: 70, max: 100, color: '#9C27B0', label: '위험' }
        ]
      },
      options: {
        title: '익절 긴급도 지수',
        unit: '%'
      }
    };
  }

  generateTriggerRecommendations(triggerConditions) {
    const recommendations = [];
    
    switch (triggerConditions.recommendedAction) {
      case 'immediate_sell':
        recommendations.push('즉시 매도 실행을 권장합니다.');
        recommendations.push('시장가 주문으로 빠른 체결을 우선하세요.');
        break;
      case 'prepare_sell':
        recommendations.push('매도 준비를 하고 지정가 주문을 설정하세요.');
        recommendations.push('분할 매도로 위험을 분산하세요.');
        break;
      case 'monitor_closely':
        recommendations.push('면밀한 모니터링을 지속하세요.');
        recommendations.push('손절매 라인을 명확히 설정하세요.');
        break;
      default:
        recommendations.push('현재 보유를 유지하되 정기적인 점검을 하세요.');
    }
    
    return recommendations;
  }

  // === 매수 타이밍 관련 메서드들 ===

  analyzeRSI(stock, marketData) {
    const rsi = Math.random() * 100;
    return {
      current_rsi: rsi,
      signal: rsi < 30 ? 'oversold' : rsi > 70 ? 'overbought' : 'neutral',
      trend: Math.random() > 0.5 ? 'rising' : 'falling',
      divergence: Math.random() > 0.8, // 다이버전스 발생 여부
      strength: this.calculateRSIStrength(rsi)
    };
  }

  calculateRSIStrength(rsi) {
    if (rsi < 20 || rsi > 80) return 'very_strong';
    if (rsi < 30 || rsi > 70) return 'strong';
    if (rsi < 40 || rsi > 60) return 'moderate';
    return 'weak';
  }

  analyzeMACDSignals(stock, marketData) {
    const macdValue = Math.random() * 2 - 1;
    const signalLine = Math.random() * 2 - 1;
    const histogram = macdValue - signalLine;
    
    return {
      macd_value: macdValue,
      signal_line: signalLine,
      histogram: histogram,
      crossover: this.detectMACDCrossover(macdValue, signalLine),
      trend: histogram > 0 ? 'bullish' : 'bearish',
      momentum: Math.abs(histogram) > 0.5 ? 'strong' : 'weak'
    };
  }

  detectMACDCrossover(macd, signal) {
    const diff = macd - signal;
    if (Math.abs(diff) < 0.1) {
      return diff > 0 ? 'bullish_crossover' : 'bearish_crossover';
    }
    return 'none';
  }

  analyzeVolumeDistribution(stock, marketData) {
    return {
      volume_profile: this.generateVolumeProfile(),
      poc: Math.random() * 10000 + 85000, // Point of Control
      value_area_high: Math.random() * 5000 + 90000,
      value_area_low: Math.random() * 5000 + 80000,
      volume_imbalance: Math.random() > 0.6,
      institutional_activity: Math.random() * 100
    };
  }

  generateVolumeProfile() {
    const profile = [];
    for (let price = 80000; price <= 100000; price += 1000) {
      profile.push({
        price,
        volume: Math.random() * 1000000,
        percentage: Math.random() * 100
      });
    }
    return profile;
  }

  analyzeSupplyDemand(stock, marketData) {
    return {
      supply_zones: [
        { price: 95000, strength: 'strong' },
        { price: 98000, strength: 'weak' }
      ],
      demand_zones: [
        { price: 82000, strength: 'strong' },
        { price: 85000, strength: 'moderate' }
      ],
      order_flow: Math.random() > 0.5 ? 'bullish' : 'bearish',
      smart_money_activity: Math.random() * 100,
      retail_sentiment: Math.random() * 100
    };
  }

  calculateBuyTimingScore(rsiAnalysis, macdAnalysis, volumeDistribution, supplyDemandAnalysis) {
    let score = 0;
    const factors = {};
    
    // RSI 점수 (30점 만점)
    factors.rsi = this.calculateRSIScore(rsiAnalysis);
    score += factors.rsi * 0.3;
    
    // MACD 점수 (25점 만점)
    factors.macd = this.calculateMACDScore(macdAnalysis);
    score += factors.macd * 0.25;
    
    // 거래량 점수 (25점 만점)
    factors.volume = this.calculateVolumeScore(volumeDistribution);
    score += factors.volume * 0.25;
    
    // 수급 점수 (20점 만점)
    factors.supply_demand = this.calculateSupplyDemandScore(supplyDemandAnalysis);
    score += factors.supply_demand * 0.2;
    
    return {
      overall: Math.min(score, 1.0),
      factors,
      grade: this.calculateTimingGrade(score),
      confidence: this.calculateTimingConfidence(factors)
    };
  }

  calculateRSIScore(rsiAnalysis) {
    let score = 0;
    
    if (rsiAnalysis.signal === 'oversold') score += 0.8;
    else if (rsiAnalysis.signal === 'neutral') score += 0.5;
    else score += 0.2;
    
    if (rsiAnalysis.divergence) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  calculateMACDScore(macdAnalysis) {
    let score = 0;
    
    if (macdAnalysis.crossover === 'bullish_crossover') score += 0.6;
    else if (macdAnalysis.trend === 'bullish') score += 0.4;
    else score += 0.2;
    
    if (macdAnalysis.momentum === 'strong') score += 0.3;
    else score += 0.1;
    
    return Math.min(score, 1.0);
  }

  calculateVolumeScore(volumeDistribution) {
    let score = 0.5; // 기본 점수
    
    if (volumeDistribution.volume_imbalance) score += 0.3;
    if (volumeDistribution.institutional_activity > 70) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  calculateSupplyDemandScore(supplyDemandAnalysis) {
    let score = 0.5; // 기본 점수
    
    if (supplyDemandAnalysis.order_flow === 'bullish') score += 0.2;
    if (supplyDemandAnalysis.smart_money_activity > 60) score += 0.2;
    if (supplyDemandAnalysis.retail_sentiment < 40) score += 0.1; // 역발상
    
    return Math.min(score, 1.0);
  }

  calculateTimingGrade(score) {
    if (score >= 0.8) return 'A+';
    if (score >= 0.7) return 'A';
    if (score >= 0.6) return 'B+';
    if (score >= 0.5) return 'B';
    if (score >= 0.4) return 'C';
    return 'D';
  }

  calculateTimingConfidence(factors) {
    const consistency = Object.values(factors).filter(score => score > 0.6).length;
    return Math.min(0.5 + (consistency * 0.1), 0.95);
  }

  calculateOptimalEntry(timingScore) {
    return {
      recommendation: timingScore.overall > 0.7 ? 'strong_buy' : 
                     timingScore.overall > 0.5 ? 'buy' : 
                     timingScore.overall > 0.3 ? 'wait' : 'avoid',
      entry_price: Math.random() * 5000 + 85000,
      stop_loss: Math.random() * 3000 + 80000,
      target_price: Math.random() * 10000 + 95000,
      position_size: this.calculatePositionSize(timingScore.overall)
    };
  }

  calculatePositionSize(score) {
    if (score > 0.8) return 'full';
    if (score > 0.6) return 'large';
    if (score > 0.4) return 'medium';
    return 'small';
  }

  generateTimingInsights(timingScore) {
    const insights = [];
    
    if (timingScore.overall >= 0.7) {
      insights.push('매우 좋은 매수 타이밍입니다.');
      insights.push('여러 기술적 지표가 긍정적 신호를 보입니다.');
    } else if (timingScore.overall >= 0.5) {
      insights.push('양호한 매수 타이밍입니다.');
      insights.push('신중한 접근으로 진입을 고려하세요.');
    } else {
      insights.push('현재는 관망이 적절한 시점입니다.');
      insights.push('더 나은 타이밍을 기다리는 것을 권장합니다.');
    }
    
    // 개별 팩터 분석
    const strongFactors = Object.entries(timingScore.factors)
      .filter(([_, score]) => score > 0.7)
      .map(([factor, _]) => factor);
    
    if (strongFactors.length > 0) {
      insights.push(`강한 매수 신호: ${strongFactors.join(', ')}`);
    }
    
    return insights;
  }

  createTimingVisualization(timingScore) {
    const data = Object.entries(timingScore.factors).map(([factor, score]) => ({
      factor: factor.toUpperCase(),
      score: score * 100,
      target: 70
    }));
    
    return {
      type: 'bar',
      data,
      options: {
        title: '매수 타이밍 팩터 분석',
        yAxis: '점수 (%)',
        threshold: 70
      }
    };
  }

  generateTimingRecommendations(timingScore) {
    const recommendations = [];
    
    if (timingScore.overall >= 0.7) {
      recommendations.push('적극적인 매수를 권장합니다.');
      recommendations.push('분할 매수로 평균 단가를 조절하세요.');
    } else if (timingScore.overall >= 0.5) {
      recommendations.push('소량 매수 후 추가 매수를 준비하세요.');
      recommendations.push('손절매 라인을 명확히 설정하세요.');
    } else {
      recommendations.push('현재는 매수를 보류하고 관망하세요.');
      recommendations.push('더 나은 진입 기회를 기다리세요.');
    }
    
    recommendations.push('매수 후에는 목표가와 손절가를 반드시 설정하세요.');
    
    return recommendations;
  }

  // === 섹터 순환 관련 메서드들 ===

  analyzeSectorMoneyFlows(marketData) {
    const sectors = [
      '기술', '헬스케어', '금융', '에너지', '소비재',
      '산업재', '통신', '유틸리티', '부동산', '소재'
    ];
    
    const flows = {};
    sectors.forEach(sector => {
      flows[sector] = {
        inflow: Math.random() * 1000000000,
        outflow: Math.random() * 1000000000,
        net_flow: 0,
        momentum: Math.random() * 2 - 1, // -1 ~ +1
        relative_strength: Math.random() * 100
      };
      flows[sector].net_flow = flows[sector].inflow - flows[sector].outflow;
    });
    
    return flows;
  }

  analyzeEconomicCyclePosition(marketData) {
    const phases = ['확장', '성숙', '둔화', '회복'];
    const currentPhase = phases[Math.floor(Math.random() * phases.length)];
    
    return {
      current_phase: currentPhase,
      phase_duration: Math.floor(Math.random() * 24) + 1, // 1-24개월
      next_phase: phases[(phases.indexOf(currentPhase) + 1) % phases.length],
      transition_probability: Math.random() * 100,
      indicators: {
        gdp_growth: Math.random() * 6 - 2, // -2% ~ 4%
        inflation: Math.random() * 5 + 1, // 1% ~ 6%
        unemployment: Math.random() * 8 + 2, // 2% ~ 10%
        interest_rate: Math.random() * 5 + 0.5 // 0.5% ~ 5.5%
      }
    };
  }

  analyzeSectorRotationPatterns(sectorFlows, cyclePosition) {
    const patterns = {};
    
    Object.entries(sectorFlows).forEach(([sector, flow]) => {
      patterns[sector] = {
        current_strength: flow.relative_strength,
        cycle_fit: this.calculateCycleFit(sector, cyclePosition.current_phase),
        momentum_score: flow.momentum,
        rotation_stage: this.getSectorRotationStage(sector, cyclePosition.current_phase),
        expected_performance: this.predictSectorPerformance(sector, cyclePosition)
      };
    });
    
    return patterns;
  }

  calculateCycleFit(sector, phase) {
    const cycleFits = {
      '확장': { '기술': 0.9, '소비재': 0.8, '금융': 0.7, '에너지': 0.6 },
      '성숙': { '헬스케어': 0.9, '소비재': 0.8, '통신': 0.7, '유틸리티': 0.6 },
      '둔화': { '유틸리티': 0.9, '헬스케어': 0.8, '소재': 0.5, '에너지': 0.4 },
      '회복': { '금융': 0.9, '산업재': 0.8, '기술': 0.7, '부동산': 0.6 }
    };
    
    return cycleFits[phase]?.[sector] || 0.5;
  }

  getSectorRotationStage(sector, phase) {
    const rotationMap = {
      '확장': { '기술': 'leading', '금융': 'early', '에너지': 'lagging' },
      '성숙': { '헬스케어': 'leading', '소비재': 'early', '기술': 'mature' },
      '둔화': { '유틸리티': 'leading', '금융': 'lagging', '기술': 'declining' },
      '회복': { '금융': 'early', '산업재': 'emerging', '유틸리티': 'mature' }
    };
    
    return rotationMap[phase]?.[sector] || 'neutral';
  }

  predictSectorPerformance(sector, cyclePosition) {
    const cycleFit = this.calculateCycleFit(sector, cyclePosition.current_phase);
    const nextCycleFit = this.calculateCycleFit(sector, cyclePosition.next_phase);
    const transitionWeight = cyclePosition.transition_probability / 100;
    
    const expectedPerformance = 
      cycleFit * (1 - transitionWeight) + nextCycleFit * transitionWeight;
    
    return {
      short_term: cycleFit,
      long_term: nextCycleFit,
      weighted_average: expectedPerformance,
      outlook: expectedPerformance > 0.7 ? 'positive' : 
               expectedPerformance > 0.4 ? 'neutral' : 'negative'
    };
  }

  predictNextRotationPhase(rotationPatterns) {
    // 현재 강세 섹터 분석
    const strongSectors = Object.entries(rotationPatterns)
      .filter(([_, pattern]) => pattern.current_strength > 70)
      .map(([sector, _]) => sector);
    
    // 다음 단계 예상 리더 섹터
    const nextLeaders = Object.entries(rotationPatterns)
      .filter(([_, pattern]) => pattern.expected_performance.outlook === 'positive')
      .sort((a, b) => b[1].expected_performance.weighted_average - a[1].expected_performance.weighted_average)
      .slice(0, 3)
      .map(([sector, _]) => sector);
    
    return {
      current_leaders: strongSectors,
      next_leaders: nextLeaders,
      rotation_timing: this.estimateRotationTiming(rotationPatterns),
      confidence: this.calculateRotationConfidence(rotationPatterns),
      transition_signals: this.identifyTransitionSignals(rotationPatterns)
    };
  }

  estimateRotationTiming(rotationPatterns) {
    // 모멘텀 변화율 기반 타이밍 추정
    const momentumChanges = Object.values(rotationPatterns)
      .map(pattern => Math.abs(pattern.momentum_score));
    const avgMomentumChange = momentumChanges.reduce((sum, change) => sum + change, 0) / momentumChanges.length;
    
    if (avgMomentumChange > 0.7) return '1-2주 내';
    if (avgMomentumChange > 0.4) return '1-2개월 내';
    return '3개월 이후';
  }

  calculateRotationConfidence(rotationPatterns) {
    const consistentPatterns = Object.values(rotationPatterns)
      .filter(pattern => 
        (pattern.cycle_fit > 0.6 && pattern.momentum_score > 0.3) ||
        (pattern.cycle_fit < 0.4 && pattern.momentum_score < -0.3)
      ).length;
    
    return Math.min(consistentPatterns / Object.keys(rotationPatterns).length, 0.9);
  }

  identifyTransitionSignals(rotationPatterns) {
    const signals = [];
    
    // 모멘텀 발산 신호
    const divergentSectors = Object.entries(rotationPatterns)
      .filter(([_, pattern]) => 
        Math.abs(pattern.momentum_score - pattern.current_strength / 100) > 0.3
      );
    
    if (divergentSectors.length > 2) {
      signals.push('섹터간 모멘텀 발산 감지');
    }
    
    // 사이클 부조화 신호
    const misalignedSectors = Object.entries(rotationPatterns)
      .filter(([_, pattern]) => pattern.cycle_fit < 0.3 && pattern.current_strength > 60);
    
    if (misalignedSectors.length > 0) {
      signals.push('경기 사이클과 섹터 성과 부조화');
    }
    
    return signals;
  }

  analyzeStockSectorPosition(stock, sectorFlows) {
    // 종목의 섹터 분류 (실제로는 API에서 가져옴)
    const stockSector = this.classifyStockSector(stock);
    const sectorData = sectorFlows[stockSector];
    
    if (!sectorData) {
      return {
        sector: '기타',
        position: 'unknown',
        recommendation: 'individual_analysis'
      };
    }
    
    return {
      sector: stockSector,
      sector_strength: sectorData.relative_strength,
      sector_momentum: sectorData.momentum,
      sector_flow: sectorData.net_flow,
      position_in_cycle: this.getStockCyclePosition(stock, stockSector),
      relative_performance: this.calculateRelativePerformance(stock, sectorData)
    };
  }

  classifyStockSector(stock) {
    const sectorMap = {
      '삼성전자': '기술',
      'SK하이닉스': '기술',
      '현대차': '산업재',
      'LG화학': '소재',
      '셀트리온': '헬스케어',
      'KB금융': '금융'
    };
    
    return sectorMap[stock] || '기타';
  }

  getStockCyclePosition(stock, sector) {
    // 종목별 사이클 내 위치 분석
    return ['early', 'mid', 'late'][Math.floor(Math.random() * 3)];
  }

  calculateRelativePerformance(stock, sectorData) {
    // 섹터 대비 상대 성과
    return {
      vs_sector: Math.random() * 20 - 10, // -10% ~ +10%
      percentile: Math.random() * 100,
      outperforming: Math.random() > 0.5
    };
  }

  createRotationTimeline(rotationPatterns) {
    const timeline = [];
    const phases = ['확장', '성숙', '둔화', '회복'];
    
    phases.forEach((phase, index) => {
      const leadingSectors = Object.entries(rotationPatterns)
        .filter(([_, pattern]) => this.calculateCycleFit(_, phase) > 0.7)
        .map(([sector, _]) => sector);
      
      timeline.push({
        phase,
        duration: '6-12개월',
        leading_sectors: leadingSectors,
        characteristics: this.getPhaseCharacteristics(phase)
      });
    });
    
    return timeline;
  }

  getPhaseCharacteristics(phase) {
    const characteristics = {
      '확장': ['경제 성장 가속', '기업 실적 개선', '투자 확대'],
      '성숙': ['성장률 둔화', '인플레이션 상승', '통화 정책 긴축'],
      '둔화': ['성장률 하락', '수익성 악화', '리스크 회피'],
      '회복': ['정책 부양', '유동성 공급', '기대감 회복']
    };
    
    return characteristics[phase] || [];
  }

  generateRotationInsights(nextPhase, stockSectorPosition) {
    const insights = [];
    
    if (nextPhase.next_leaders.includes(stockSectorPosition.sector)) {
      insights.push(`${stockSectorPosition.sector} 섹터가 다음 상승 주도 그룹으로 예상됩니다.`);
      insights.push('섹터 순환 관점에서 매력적인 투자 기회입니다.');
    } else if (nextPhase.current_leaders.includes(stockSectorPosition.sector)) {
      insights.push(`${stockSectorPosition.sector} 섹터는 현재 강세를 보이고 있습니다.`);
      insights.push('수익 실현 타이밍을 검토할 시점입니다.');
    } else {
      insights.push(`${stockSectorPosition.sector} 섹터는 현재 순환에서 소외되고 있습니다.`);
      insights.push('개별 종목 펀더멘털에 더 주목하세요.');
    }
    
    insights.push(`섹터 순환 전환까지 예상 기간: ${nextPhase.rotation_timing}`);
    
    return insights;
  }

  createRotationVisualization(sectorFlows, nextPhase) {
    const data = Object.entries(sectorFlows).map(([sector, flow]) => ({
      sector,
      current_strength: flow.relative_strength,
      momentum: flow.momentum * 50 + 50, // -1~1을 0~100으로 변환
      net_flow: flow.net_flow / 1000000, // 백만 단위로 변환
      is_next_leader: nextPhase.next_leaders.includes(sector)
    }));
    
    return {
      type: 'bubble',
      data,
      options: {
        xAxis: 'current_strength',
        yAxis: 'momentum',
        size: 'net_flow',
        title: '섹터 순환 분석',
        labels: {
          x: '현재 강도 (%)',
          y: '모멘텀 (%)',
          size: '자금 유입 (백만)'
        }
      }
    };
  }

  generateRotationRecommendations(nextPhase, stockSectorPosition) {
    const recommendations = [];
    
    if (nextPhase.next_leaders.includes(stockSectorPosition.sector)) {
      recommendations.push('섹터 순환 관점에서 매수를 고려하세요.');
      recommendations.push('같은 섹터 내 다른 우량주도 함께 검토하세요.');
    } else {
      recommendations.push('섹터 순환에 의존하기보다 개별 종목 분석에 집중하세요.');
      recommendations.push('다음 순환 주도 섹터로의 분산투자를 고려하세요.');
    }
    
    recommendations.push('경기 사이클 변화를 지속적으로 모니터링하세요.');
    recommendations.push('섹터 ETF를 활용한 헤지 전략도 고려해보세요.');
    
    return recommendations;
  }

  // === 투자 전략 종합 요약 ===

  generateInvestmentSummary(frames) {
    const summary = {
      overallScore: 0,
      investmentGrade: '',
      keyStrategies: [],
      riskFactors: [],
      opportunities: [],
      actionItems: []
    };

    // 전체 점수 계산 (가중평균)
    const weights = {
      quantRanking: 0.25,
      profitSimulator: 0.2,
      takeProfitTrigger: 0.2,
      buyTiming: 0.2,
      sectorRotation: 0.15
    };

    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(frames).forEach(([key, frame]) => {
      if (frame.score && weights[key]) {
        totalScore += frame.score * weights[key];
        totalWeight += weights[key];
      }
    });
    
    summary.overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    summary.investmentGrade = this.calculateInvestmentGrade(summary.overallScore);

    // 핵심 전략 도출
    if (frames.quantRanking?.score > 0.7) {
      summary.keyStrategies.push('퀀트 지표 기반 가치 투자');
    }
    
    if (frames.buyTiming?.score > 0.7) {
      summary.keyStrategies.push('기술적 분석 기반 타이밍 투자');
    }
    
    if (frames.sectorRotation?.score > 0.7) {
      summary.keyStrategies.push('섹터 순환 전략');
    }

    // 리스크 요소 식별
    if (frames.takeProfitTrigger?.data?.triggerConditions?.urgencyScore > 0.5) {
      summary.riskFactors.push('익절 신호 감지');
    }
    
    if (frames.profitSimulator?.data?.riskAnalysis) {
      const highRiskStrategies = Object.values(frames.profitSimulator.data.riskAnalysis)
        .filter(analysis => analysis.risk_rating === 'high').length;
      if (highRiskStrategies > 0) {
        summary.riskFactors.push('높은 변동성 리스크');
      }
    }

    // 투자 기회 식별
    if (frames.quantRanking?.data?.overallRanking?.grade === '우수' || 
        frames.quantRanking?.data?.overallRanking?.grade === '매우 우수') {
      summary.opportunities.push('퀀트 팩터 우수 종목');
    }
    
    if (frames.buyTiming?.data?.timingScore?.overall > 0.6) {
      summary.opportunities.push('매수 타이밍 양호');
    }

    // 실행 항목
    summary.actionItems = this.generateActionItems(frames);

    return summary;
  }

  calculateInvestmentGrade(score) {
    if (score >= 0.8) return 'S급 (강력 추천)';
    if (score >= 0.7) return 'A급 (추천)';
    if (score >= 0.6) return 'B급 (양호)';
    if (score >= 0.5) return 'C급 (보통)';
    return 'D급 (주의)';
  }

  generateActionItems(frames) {
    const actionItems = [];
    
    // 매수 타이밍 기반 액션
    if (frames.buyTiming?.data?.timingScore?.overall > 0.7) {
      actionItems.push('즉시 매수 검토');
    } else if (frames.buyTiming?.data?.timingScore?.overall > 0.5) {
      actionItems.push('분할 매수 전략 수립');
    }
    
    // 익절 트리거 기반 액션
    if (frames.takeProfitTrigger?.data?.triggerConditions?.urgencyScore > 0.7) {
      actionItems.push('즉시 익절 검토');
    } else if (frames.takeProfitTrigger?.data?.triggerConditions?.urgencyScore > 0.5) {
      actionItems.push('익절 준비 및 모니터링 강화');
    }
    
    // 시뮬레이션 기반 액션
    if (frames.profitSimulator?.data?.optimalStrategy) {
      actionItems.push(`${frames.profitSimulator.data.optimalStrategy.strategy.name} 전략 적용`);
    }
    
    // 섹터 순환 기반 액션
    if (frames.sectorRotation?.data?.nextPhase?.rotation_timing === '1-2주 내') {
      actionItems.push('섹터 순환 대비 포지션 조정');
    }
    
    return actionItems;
  }

  // 에러 결과 생성
  createErrorResult(frameId, error) {
    return {
      frameId,
      frameName: this.getFrameName(frameId),
      score: 0,
      confidence: 0,
      error: error.message,
      status: 'error',
      data: null,
      insights: ['분석 중 오류가 발생했습니다.'],
      recommendations: ['다시 시도하거나 데이터를 확인해주세요.']
    };
  }

  // 프레임 이름 반환
  getFrameName(frameId) {
    const names = {
      'quant_factor_ranking': '퀀트팩터 랭킹',
      'profit_maximization_simulator': '30일 수익 최대화 시뮬레이터',
      'take_profit_trigger': '익절 트리거 알림',
      'buy_timing_scoring': '매수 타이밍 점수화',
      'sector_rotation_strategy': '섹터 순환 전략 시각화'
    };
    return names[frameId] || frameId;
  }
} 