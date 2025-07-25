/**
 * 인과 관계 분석/상관 프레임
 * - 정책↔산업↔종목 상호 연관성 그래프
 * - 동반 상승 상관 프레임
 * - 에너지/소재 ↔ 생산 단가 영향 프레임
 * - 환율 민감 종목 스코어링
 */

export class CausalAnalyzer {
  constructor() {
    this.correlationThreshold = 0.7;
    this.significanceLevel = 0.05;
  }

  /**
   * 정책↔산업↔종목 상호 연관성 그래프 분석
   */
  analyzePolicyIndustryStockGraph(data) {
    const { policies, industries, stocks, news } = data;
    
    const graph = {
      nodes: [],
      edges: [],
      clusters: {}
    };

    // 노드 생성
    policies.forEach(policy => {
      graph.nodes.push({
        id: `policy_${policy.id}`,
        type: 'policy',
        name: policy.name,
        keywords: policy.keywords,
        impact_score: this.calculatePolicyImpact(policy, news)
      });
    });

    industries.forEach(industry => {
      graph.nodes.push({
        id: `industry_${industry.id}`,
        type: 'industry',
        name: industry.name,
        sector: industry.sector,
        policy_sensitivity: this.calculatePolicySensitivity(industry, policies)
      });
    });

    stocks.forEach(stock => {
      graph.nodes.push({
        id: `stock_${stock.symbol}`,
        type: 'stock',
        symbol: stock.symbol,
        name: stock.name,
        industry_id: stock.industry_id,
        correlation_strength: this.calculateStockCorrelation(stock, data)
      });
    });

    // 연관성 간선 생성
    this.generatePolicyIndustryEdges(graph, policies, industries, news);
    this.generateIndustryStockEdges(graph, industries, stocks);
    this.generateCrossCorrelationEdges(graph, stocks);

    return {
      graph,
      insights: this.generateGraphInsights(graph),
      pathways: this.findInfluencePathways(graph)
    };
  }

  /**
   * 동반 상승 상관 프레임
   */
  analyzeCoMovementCorrelation(stockData) {
    const correlationMatrix = this.calculateCorrelationMatrix(stockData);
    const pairs = this.findHighCorrelationPairs(correlationMatrix);
    const clusters = this.identifyCorrelationClusters(correlationMatrix);

    return {
      correlation_matrix: correlationMatrix,
      high_correlation_pairs: pairs.map(pair => ({
        ...pair,
        co_movement_strength: this.calculateCoMovementStrength(pair, stockData),
        synchronized_periods: this.findSynchronizedPeriods(pair, stockData),
        lead_lag_analysis: this.performLeadLagAnalysis(pair, stockData)
      })),
      clusters: clusters.map(cluster => ({
        ...cluster,
        cluster_momentum: this.calculateClusterMomentum(cluster, stockData),
        rotation_probability: this.calculateRotationProbability(cluster)
      }))
    };
  }

  /**
   * 에너지/소재 ↔ 생산 단가 영향 프레임
   */
  analyzeEnergyCostImpact(data) {
    const { energyPrices, materialPrices, companies, stockPrices } = data;
    
    const analysis = {
      energy_sensitivity: {},
      material_sensitivity: {},
      cost_impact_scores: {},
      margin_predictions: {}
    };

    companies.forEach(company => {
      // 에너지 민감도 분석
      analysis.energy_sensitivity[company.symbol] = {
        oil_sensitivity: this.calculateEnergySensitivity(company, energyPrices.oil, stockPrices),
        electricity_sensitivity: this.calculateEnergySensitivity(company, energyPrices.electricity, stockPrices),
        gas_sensitivity: this.calculateEnergySensitivity(company, energyPrices.gas, stockPrices)
      };

      // 원자재 민감도 분석
      analysis.material_sensitivity[company.symbol] = {
        steel_sensitivity: this.calculateMaterialSensitivity(company, materialPrices.steel, stockPrices),
        copper_sensitivity: this.calculateMaterialSensitivity(company, materialPrices.copper, stockPrices),
        semiconductor_sensitivity: this.calculateMaterialSensitivity(company, materialPrices.silicon, stockPrices)
      };

      // 생산 단가 영향 점수
      analysis.cost_impact_scores[company.symbol] = this.calculateCostImpactScore(
        company,
        analysis.energy_sensitivity[company.symbol],
        analysis.material_sensitivity[company.symbol]
      );

      // 마진 예측
      analysis.margin_predictions[company.symbol] = this.predictMarginImpact(
        company,
        energyPrices,
        materialPrices
      );
    });

    return {
      ...analysis,
      industry_rankings: this.rankIndustriesByCostSensitivity(analysis),
      hedging_opportunities: this.identifyHedgingOpportunities(analysis),
      cost_cycle_insights: this.analyzeCostCycles(energyPrices, materialPrices)
    };
  }

  /**
   * 환율 민감 종목 스코어링
   */
  analyzeExchangeRateSensitivity(data) {
    const { exchangeRates, companies, stockPrices, tradeData } = data;
    
    const sensitivity_scores = {};
    
    companies.forEach(company => {
      const score = {
        usd_sensitivity: this.calculateCurrencySensitivity(company, exchangeRates.USD, stockPrices),
        eur_sensitivity: this.calculateCurrencySensitivity(company, exchangeRates.EUR, stockPrices),
        jpy_sensitivity: this.calculateCurrencySensitivity(company, exchangeRates.JPY, stockPrices),
        cny_sensitivity: this.calculateCurrencySensitivity(company, exchangeRates.CNY, stockPrices),
        
        export_ratio: this.calculateExportRatio(company, tradeData),
        import_dependency: this.calculateImportDependency(company, tradeData),
        
        overall_score: 0,
        risk_level: 'low',
        hedge_recommendation: ''
      };

      // 종합 점수 계산
      score.overall_score = this.calculateOverallExchangeSensitivity(score);
      score.risk_level = this.determineRiskLevel(score.overall_score);
      score.hedge_recommendation = this.generateHedgeRecommendation(company, score);

      sensitivity_scores[company.symbol] = score;
    });

    return {
      sensitivity_scores,
      currency_impact_rankings: this.rankByCurrencyImpact(sensitivity_scores),
      hedging_strategies: this.recommendHedgingStrategies(sensitivity_scores),
      exchange_rate_forecasts: this.generateExchangeRateForecasts(exchangeRates)
    };
  }

  // 헬퍼 메서드들
  calculatePolicyImpact(policy, news) {
    const relevantNews = news.filter(n => 
      policy.keywords.some(keyword => 
        n.title.toLowerCase().includes(keyword.toLowerCase()) ||
        n.content.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    return relevantNews.reduce((sum, n) => sum + (n.sentiment_score || 0), 0) / Math.max(relevantNews.length, 1);
  }

  calculatePolicySensitivity(industry, policies) {
    return policies.reduce((total, policy) => {
      const overlap = policy.keywords.filter(k => 
        industry.keywords?.includes(k)
      ).length;
      return total + (overlap / policy.keywords.length);
    }, 0) / policies.length;
  }

  calculateStockCorrelation(stock, data) {
    // 주식 간 상관관계 강도 계산
    const correlations = data.stocks
      .filter(s => s.symbol !== stock.symbol && s.industry_id === stock.industry_id)
      .map(s => this.pearsonCorrelation(stock.prices, s.prices))
      .filter(corr => !isNaN(corr));
    
    return correlations.reduce((sum, corr) => sum + Math.abs(corr), 0) / Math.max(correlations.length, 1);
  }

  generatePolicyIndustryEdges(graph, policies, industries, news) {
    policies.forEach(policy => {
      industries.forEach(industry => {
        const strength = this.calculatePolicyIndustryConnection(policy, industry, news);
        if (strength > 0.3) {
          graph.edges.push({
            source: `policy_${policy.id}`,
            target: `industry_${industry.id}`,
            weight: strength,
            type: 'policy_influence'
          });
        }
      });
    });
  }

  generateIndustryStockEdges(graph, industries, stocks) {
    industries.forEach(industry => {
      const industryStocks = stocks.filter(s => s.industry_id === industry.id);
      industryStocks.forEach(stock => {
        graph.edges.push({
          source: `industry_${industry.id}`,
          target: `stock_${stock.symbol}`,
          weight: 0.8,
          type: 'industry_membership'
        });
      });
    });
  }

  generateCrossCorrelationEdges(graph, stocks) {
    for (let i = 0; i < stocks.length; i++) {
      for (let j = i + 1; j < stocks.length; j++) {
        const correlation = this.pearsonCorrelation(stocks[i].prices, stocks[j].prices);
        if (Math.abs(correlation) > this.correlationThreshold) {
          graph.edges.push({
            source: `stock_${stocks[i].symbol}`,
            target: `stock_${stocks[j].symbol}`,
            weight: Math.abs(correlation),
            type: 'correlation'
          });
        }
      }
    }
  }

  findInfluencePathways(graph) {
    // 정책 → 산업 → 종목 경로 찾기
    const pathways = [];
    const policyNodes = graph.nodes.filter(n => n.type === 'policy');
    const stockNodes = graph.nodes.filter(n => n.type === 'stock');

    policyNodes.forEach(policy => {
      stockNodes.forEach(stock => {
        const path = this.findShortestPath(graph, policy.id, stock.id);
        if (path && path.length <= 4) { // 정책 → 산업 → 종목 (최대 3단계)
          pathways.push({
            policy: policy.name,
            stock: stock.symbol,
            path: path,
            influence_strength: this.calculatePathInfluence(graph, path)
          });
        }
      });
    });

    return pathways.sort((a, b) => b.influence_strength - a.influence_strength);
  }

  pearsonCorrelation(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;

    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  calculateCorrelationMatrix(stockData) {
    const symbols = Object.keys(stockData);
    const matrix = {};

    symbols.forEach(symbol1 => {
      matrix[symbol1] = {};
      symbols.forEach(symbol2 => {
        matrix[symbol1][symbol2] = this.pearsonCorrelation(
          stockData[symbol1].prices,
          stockData[symbol2].prices
        );
      });
    });

    return matrix;
  }

  findHighCorrelationPairs(correlationMatrix) {
    const pairs = [];
    const symbols = Object.keys(correlationMatrix);

    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const symbol1 = symbols[i];
        const symbol2 = symbols[j];
        const correlation = correlationMatrix[symbol1][symbol2];

        if (Math.abs(correlation) > this.correlationThreshold) {
          pairs.push({
            pair: [symbol1, symbol2],
            correlation: correlation,
            strength: Math.abs(correlation)
          });
        }
      }
    }

    return pairs.sort((a, b) => b.strength - a.strength);
  }

  calculateEnergySensitivity(company, energyPrices, stockPrices) {
    const companyPrices = stockPrices[company.symbol];
    if (!companyPrices || !energyPrices) return 0;

    const correlation = this.pearsonCorrelation(
      energyPrices.map(p => p.price),
      companyPrices.map(p => p.price)
    );

    // 회사의 에너지 집약도 고려
    const energyIntensity = company.energy_intensity || 0.5;
    return correlation * energyIntensity;
  }

  calculateMaterialSensitivity(company, materialPrices, stockPrices) {
    const companyPrices = stockPrices[company.symbol];
    if (!companyPrices || !materialPrices) return 0;

    const correlation = this.pearsonCorrelation(
      materialPrices.map(p => p.price),
      companyPrices.map(p => p.price)
    );

    // 회사의 원자재 의존도 고려
    const materialDependency = company.material_dependency || 0.5;
    return correlation * materialDependency;
  }

  calculateCurrencySensitivity(company, exchangeRates, stockPrices) {
    const companyPrices = stockPrices[company.symbol];
    if (!companyPrices || !exchangeRates) return 0;

    const correlation = this.pearsonCorrelation(
      exchangeRates.map(r => r.rate),
      companyPrices.map(p => p.price)
    );

    // 회사의 해외 매출 비중 고려
    const foreignSalesRatio = company.foreign_sales_ratio || 0.3;
    return correlation * foreignSalesRatio;
  }

  calculateExportRatio(company, tradeData) {
    const companyTrade = tradeData.find(t => t.company === company.symbol);
    if (!companyTrade) return 0.3; // 기본값

    return companyTrade.exports / (companyTrade.exports + companyTrade.domestic_sales);
  }

  calculateImportDependency(company, tradeData) {
    const companyTrade = tradeData.find(t => t.company === company.symbol);
    if (!companyTrade) return 0.2; // 기본값

    return companyTrade.imports / companyTrade.total_costs;
  }

  calculateOverallExchangeSensitivity(score) {
    const weights = {
      usd: 0.4,
      eur: 0.2,
      jpy: 0.2,
      cny: 0.2
    };

    return (
      Math.abs(score.usd_sensitivity) * weights.usd +
      Math.abs(score.eur_sensitivity) * weights.eur +
      Math.abs(score.jpy_sensitivity) * weights.jpy +
      Math.abs(score.cny_sensitivity) * weights.cny
    ) * (score.export_ratio + score.import_dependency) / 2;
  }

  determineRiskLevel(score) {
    if (score > 0.7) return 'high';
    if (score > 0.4) return 'medium';
    return 'low';
  }

  generateHedgeRecommendation(company, score) {
    if (score.risk_level === 'high') {
      if (score.export_ratio > 0.5) {
        return '환율 헤지 전략 필수: 선물 또는 옵션 활용';
      } else {
        return '수입 비용 헤지 고려: 통화 스왑 검토';
      }
    } else if (score.risk_level === 'medium') {
      return '부분 헤지 고려: 주요 통화 익스포저 관리';
    }
    return '헤지 불필요: 자연 헤지 효과 활용';
  }
}

export default CausalAnalyzer; 