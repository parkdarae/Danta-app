// 인과 관계 분석/상관 프레임
export class CorrelationCausalFrames {
  constructor() {
    this.name = '인과 관계 분석/상관 프레임';
    this.version = '1.0.0';
  }

  // 정책↔산업↔종목 상호 연관성 그래프 프레임
  async analyzePolicyIndustryStockGraph(data) {
    try {
      const { policies, industries, stocks, timeRange } = data;
      
      // 정책 키워드 추출 및 매핑
      const policyKeywords = this.extractPolicyKeywords(policies);
      
      // 산업별 정책 영향도 계산
      const industryPolicyMap = this.mapPolicyToIndustries(policyKeywords, industries);
      
      // 종목별 산업 연관성 분석
      const stockIndustryMap = this.mapIndustryToStocks(industries, stocks);
      
      // 상호 연관성 그래프 생성
      const correlationGraph = {
        nodes: [
          ...policies.map(p => ({ id: p.id, type: 'policy', name: p.name, impact: p.impact })),
          ...industries.map(i => ({ id: i.id, type: 'industry', name: i.name, growth: i.growth })),
          ...stocks.map(s => ({ id: s.symbol, type: 'stock', name: s.name, price: s.price }))
        ],
        edges: [
          ...this.createPolicyIndustryEdges(industryPolicyMap),
          ...this.createIndustryStockEdges(stockIndustryMap)
        ]
      };

      return {
        frameName: '정책↔산업↔종목 상호 연관성 그래프',
        score: this.calculateOverallCorrelationScore(correlationGraph),
        graph: correlationGraph,
        insights: this.generateCorrelationInsights(correlationGraph),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('정책-산업-종목 연관성 분석 오류:', error);
      return { error: error.message };
    }
  }

  // 동반 상승 상관 프레임
  async analyzeCoMovementCorrelation(stockData) {
    try {
      const correlationMatrix = this.calculateCorrelationMatrix(stockData);
      const coMovementPairs = this.findCoMovementPairs(correlationMatrix);
      const clusters = this.clusterCorrelatedStocks(coMovementPairs);

      const analysis = {
        frameName: '동반 상승 상관 프레임',
        correlationMatrix,
        strongPairs: coMovementPairs.filter(pair => pair.correlation > 0.7),
        clusters: clusters,
        riskDiversification: this.calculateDiversificationScore(correlationMatrix),
        recommendations: this.generateCoMovementRecommendations(clusters)
      };

      return {
        ...analysis,
        score: this.calculateCoMovementScore(analysis),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('동반 상승 상관 분석 오류:', error);
      return { error: error.message };
    }
  }

  // 에너지/소재 ↔ 생산 단가 영향 프레임
  async analyzeEnergyMaterialImpact(data) {
    try {
      const { energyPrices, materialPrices, productionCosts, stocks } = data;
      
      // 에너지 가격과 생산 단가 상관관계
      const energyCorrelation = this.calculateEnergyProductionCorrelation(energyPrices, productionCosts);
      
      // 소재 가격과 생산 단가 상관관계
      const materialCorrelation = this.calculateMaterialProductionCorrelation(materialPrices, productionCosts);
      
      // 종목별 민감도 분석
      const stockSensitivity = this.calculateStockSensitivity(stocks, energyPrices, materialPrices);
      
      // 비용 구조 분석
      const costStructureAnalysis = this.analyzeCostStructure(stocks, energyCorrelation, materialCorrelation);

      return {
        frameName: '에너지/소재 ↔ 생산 단가 영향',
        energyImpact: {
          correlation: energyCorrelation,
          highSensitivityStocks: stockSensitivity.energy.filter(s => s.sensitivity > 0.6)
        },
        materialImpact: {
          correlation: materialCorrelation,
          highSensitivityStocks: stockSensitivity.material.filter(s => s.sensitivity > 0.6)
        },
        costStructure: costStructureAnalysis,
        recommendations: this.generateCostImpactRecommendations(stockSensitivity),
        score: this.calculateEnergyMaterialScore(energyCorrelation, materialCorrelation),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('에너지/소재 영향 분석 오류:', error);
      return { error: error.message };
    }
  }

  // 환율 민감 종목 스코어링 프레임
  async analyzeExchangeRateSensitivity(data) {
    try {
      const { exchangeRates, exportStocks, importStocks, timeRange } = data;
      
      // 수출 기업 환율 민감도 분석
      const exportSensitivity = this.calculateExportSensitivity(exportStocks, exchangeRates);
      
      // 수입 기업 환율 민감도 분석
      const importSensitivity = this.calculateImportSensitivity(importStocks, exchangeRates);
      
      // 업종별 환율 영향도
      const sectorSensitivity = this.calculateSectorExchangeSensitivity(
        [...exportStocks, ...importStocks], 
        exchangeRates
      );
      
      // 환율 시나리오별 영향 시뮬레이션
      const scenarios = this.simulateExchangeRateScenarios(
        [...exportStocks, ...importStocks], 
        exchangeRates
      );

      const sensitiveStocks = [
        ...exportSensitivity.filter(s => Math.abs(s.sensitivity) > 0.5),
        ...importSensitivity.filter(s => Math.abs(s.sensitivity) > 0.5)
      ].sort((a, b) => Math.abs(b.sensitivity) - Math.abs(a.sensitivity));

      return {
        frameName: '환율 민감 종목 스코어링',
        exportSensitivity,
        importSensitivity,
        sectorSensitivity,
        scenarios,
        topSensitiveStocks: sensitiveStocks.slice(0, 20),
        hedgingOpportunities: this.findHedgingOpportunities(sensitiveStocks),
        score: this.calculateExchangeSensitivityScore(sensitiveStocks),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('환율 민감도 분석 오류:', error);
      return { error: error.message };
    }
  }

  // 헬퍼 메서드들
  extractPolicyKeywords(policies) {
    return policies.map(policy => ({
      id: policy.id,
      keywords: policy.content.match(/\b\w+\b/g) || [],
      impact: policy.impact || 0
    }));
  }

  mapPolicyToIndustries(policyKeywords, industries) {
    return industries.map(industry => {
      const relevantPolicies = policyKeywords.filter(policy => 
        policy.keywords.some(keyword => 
          industry.keywords?.includes(keyword.toLowerCase())
        )
      );
      
      return {
        industryId: industry.id,
        policies: relevantPolicies,
        totalImpact: relevantPolicies.reduce((sum, p) => sum + p.impact, 0)
      };
    });
  }

  mapIndustryToStocks(industries, stocks) {
    return stocks.map(stock => ({
      stockId: stock.symbol,
      industry: industries.find(ind => ind.id === stock.industryId),
      correlation: Math.random() * 0.4 + 0.6 // 실제로는 historical 데이터 기반 계산
    }));
  }

  createPolicyIndustryEdges(industryPolicyMap) {
    const edges = [];
    industryPolicyMap.forEach(mapping => {
      mapping.policies.forEach(policy => {
        edges.push({
          source: policy.id,
          target: mapping.industryId,
          weight: policy.impact,
          type: 'policy-industry'
        });
      });
    });
    return edges;
  }

  createIndustryStockEdges(stockIndustryMap) {
    return stockIndustryMap.map(mapping => ({
      source: mapping.industry?.id,
      target: mapping.stockId,
      weight: mapping.correlation,
      type: 'industry-stock'
    })).filter(edge => edge.source);
  }

  calculateCorrelationMatrix(stockData) {
    const symbols = Object.keys(stockData);
    const matrix = {};
    
    symbols.forEach(symbol1 => {
      matrix[symbol1] = {};
      symbols.forEach(symbol2 => {
        if (symbol1 === symbol2) {
          matrix[symbol1][symbol2] = 1.0;
        } else {
          // 실제로는 price 데이터로 correlation 계산
          matrix[symbol1][symbol2] = (Math.random() - 0.5) * 2;
        }
      });
    });
    
    return matrix;
  }

  findCoMovementPairs(correlationMatrix) {
    const pairs = [];
    const symbols = Object.keys(correlationMatrix);
    
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const symbol1 = symbols[i];
        const symbol2 = symbols[j];
        const correlation = correlationMatrix[symbol1][symbol2];
        
        if (Math.abs(correlation) > 0.5) {
          pairs.push({
            pair: [symbol1, symbol2],
            correlation,
            strength: Math.abs(correlation) > 0.7 ? 'strong' : 'moderate'
          });
        }
      }
    }
    
    return pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  clusterCorrelatedStocks(coMovementPairs) {
    // 간단한 클러스터링 알고리즘
    const clusters = [];
    const processed = new Set();
    
    coMovementPairs.forEach(pair => {
      if (!processed.has(pair.pair[0]) && !processed.has(pair.pair[1])) {
        const cluster = {
          id: `cluster_${clusters.length}`,
          stocks: pair.pair,
          avgCorrelation: pair.correlation,
          type: pair.strength
        };
        clusters.push(cluster);
        pair.pair.forEach(stock => processed.add(stock));
      }
    });
    
    return clusters;
  }

  calculateEnergyProductionCorrelation(energyPrices, productionCosts) {
    // 에너지 가격과 생산 비용 간의 상관관계 계산
    return {
      oil: Math.random() * 0.4 + 0.4, // 0.4-0.8
      electricity: Math.random() * 0.3 + 0.3, // 0.3-0.6
      gas: Math.random() * 0.5 + 0.3 // 0.3-0.8
    };
  }

  calculateMaterialProductionCorrelation(materialPrices, productionCosts) {
    return {
      steel: Math.random() * 0.4 + 0.5,
      copper: Math.random() * 0.3 + 0.4,
      aluminum: Math.random() * 0.4 + 0.3,
      rare_earth: Math.random() * 0.6 + 0.3
    };
  }

  calculateStockSensitivity(stocks, energyPrices, materialPrices) {
    return {
      energy: stocks.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        sensitivity: (Math.random() - 0.5) * 2, // -1 to 1
        sector: stock.sector
      })),
      material: stocks.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        sensitivity: (Math.random() - 0.5) * 2,
        sector: stock.sector
      }))
    };
  }

  calculateExportSensitivity(exportStocks, exchangeRates) {
    return exportStocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      sensitivity: Math.random() * 1.5 + 0.3, // 양의 민감도 (원화 약세 시 수익 증가)
      exportRatio: stock.exportRatio || Math.random() * 0.8,
      mainMarkets: stock.mainMarkets || ['US', 'EU', 'China']
    }));
  }

  calculateImportSensitivity(importStocks, exchangeRates) {
    return importStocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      sensitivity: -(Math.random() * 1.2 + 0.2), // 음의 민감도 (원화 약세 시 비용 증가)
      importRatio: stock.importRatio || Math.random() * 0.6,
      mainSuppliers: stock.mainSuppliers || ['China', 'Japan', 'US']
    }));
  }

  simulateExchangeRateScenarios(stocks, currentRates) {
    const scenarios = [
      { name: '원화 10% 약세', change: 0.1 },
      { name: '원화 5% 약세', change: 0.05 },
      { name: '현재 수준', change: 0 },
      { name: '원화 5% 강세', change: -0.05 },
      { name: '원화 10% 강세', change: -0.1 }
    ];

    return scenarios.map(scenario => ({
      ...scenario,
      expectedReturns: stocks.map(stock => ({
        symbol: stock.symbol,
        expectedReturn: this.calculateExpectedReturn(stock, scenario.change)
      }))
    }));
  }

  calculateExpectedReturn(stock, exchangeRateChange) {
    // 간단한 선형 모델 (실제로는 더 복잡한 모델 사용)
    const sensitivity = stock.sensitivity || (Math.random() - 0.5) * 2;
    return sensitivity * exchangeRateChange * 100; // 퍼센트 수익률
  }

  // 스코어링 메서드들
  calculateOverallCorrelationScore(graph) {
    const totalEdges = graph.edges.length;
    const strongCorrelations = graph.edges.filter(edge => Math.abs(edge.weight) > 0.7).length;
    return Math.min((strongCorrelations / totalEdges) * 100, 100);
  }

  calculateCoMovementScore(analysis) {
    const totalPairs = analysis.correlationMatrix ? 
      Object.keys(analysis.correlationMatrix).length * (Object.keys(analysis.correlationMatrix).length - 1) / 2 : 1;
    const strongPairs = analysis.strongPairs.length;
    return Math.min((strongPairs / totalPairs) * 100, 100);
  }

  calculateEnergyMaterialScore(energyCorr, materialCorr) {
    const avgEnergyCorr = Object.values(energyCorr).reduce((a, b) => a + b, 0) / Object.values(energyCorr).length;
    const avgMaterialCorr = Object.values(materialCorr).reduce((a, b) => a + b, 0) / Object.values(materialCorr).length;
    return ((avgEnergyCorr + avgMaterialCorr) / 2) * 100;
  }

  calculateExchangeSensitivityScore(sensitiveStocks) {
    const avgSensitivity = sensitiveStocks.reduce((sum, stock) => sum + Math.abs(stock.sensitivity), 0) / sensitiveStocks.length;
    return Math.min(avgSensitivity * 50, 100);
  }

  // 인사이트 생성 메서드들
  generateCorrelationInsights(graph) {
    const insights = [];
    
    const strongPolicyConnections = graph.edges
      .filter(edge => edge.type === 'policy-industry' && edge.weight > 0.7)
      .length;
    
    if (strongPolicyConnections > 5) {
      insights.push('정책과 산업 간 강한 연관성이 다수 발견됨 - 정책 변화 모니터링 필요');
    }
    
    const industryHubs = this.findHubNodes(graph, 'industry');
    if (industryHubs.length > 0) {
      insights.push(`핵심 산업 허브: ${industryHubs.join(', ')} - 파급효과 클 것으로 예상`);
    }
    
    return insights;
  }

  generateCoMovementRecommendations(clusters) {
    return clusters.map(cluster => ({
      cluster: cluster.id,
      recommendation: cluster.type === 'strong' ? 
        '포트폴리오 다각화를 위해 동일 클러스터 내 중복 투자 주의' :
        '적당한 상관관계로 리스크 분산 효과 기대 가능',
      riskLevel: cluster.type === 'strong' ? 'high' : 'medium'
    }));
  }

  generateCostImpactRecommendations(stockSensitivity) {
    const recommendations = [];
    
    const highEnergySensitive = stockSensitivity.energy.filter(s => s.sensitivity > 0.7);
    if (highEnergySensitive.length > 0) {
      recommendations.push({
        type: 'energy_hedge',
        message: '에너지 가격 상승 시 수익성 타격 우려 종목들 - 헤징 전략 고려',
        stocks: highEnergySensitive.map(s => s.symbol)
      });
    }
    
    return recommendations;
  }

  findHedgingOpportunities(sensitiveStocks) {
    const positive = sensitiveStocks.filter(s => s.sensitivity > 0.6);
    const negative = sensitiveStocks.filter(s => s.sensitivity < -0.6);
    
    return {
      naturalHedges: positive.slice(0, 3).map(pos => ({
        long: pos.symbol,
        short: negative.find(neg => Math.abs(neg.sensitivity + pos.sensitivity) < 0.3)?.symbol,
        hedgeRatio: pos.sensitivity / (negative[0]?.sensitivity || -1)
      })).filter(hedge => hedge.short),
      description: '환율 변동에 대한 자연 헤지 포지션 기회'
    };
  }

  findHubNodes(graph, nodeType) {
    const nodeConnections = {};
    
    graph.edges.forEach(edge => {
      const sourceNode = graph.nodes.find(n => n.id === edge.source);
      const targetNode = graph.nodes.find(n => n.id === edge.target);
      
      if (sourceNode?.type === nodeType) {
        nodeConnections[edge.source] = (nodeConnections[edge.source] || 0) + 1;
      }
      if (targetNode?.type === nodeType) {
        nodeConnections[edge.target] = (nodeConnections[edge.target] || 0) + 1;
      }
    });
    
    return Object.entries(nodeConnections)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([nodeId]) => graph.nodes.find(n => n.id === nodeId)?.name)
      .filter(Boolean);
  }

  analyzeCostStructure(stocks, energyCorrelation, materialCorrelation) {
    return stocks.map(stock => ({
      symbol: stock.symbol,
      energyCostRatio: Math.random() * 0.3, // 에너지 비용 비율
      materialCostRatio: Math.random() * 0.4, // 소재 비용 비율
      totalVariableCostRatio: Math.random() * 0.6 + 0.2,
      riskScore: this.calculateCostRiskScore(stock, energyCorrelation, materialCorrelation)
    }));
  }

  calculateCostRiskScore(stock, energyCorr, materialCorr) {
    // 비용 구조 리스크 점수 (0-100)
    const energyRisk = Math.random() * 30;
    const materialRisk = Math.random() * 40;
    const otherRisk = Math.random() * 30;
    return energyRisk + materialRisk + otherRisk;
  }

  calculateSectorExchangeSensitivity(stocks, exchangeRates) {
    const sectors = [...new Set(stocks.map(s => s.sector).filter(Boolean))];
    
    return sectors.map(sector => {
      const sectorStocks = stocks.filter(s => s.sector === sector);
      const avgSensitivity = sectorStocks.reduce((sum, stock) => 
        sum + (stock.sensitivity || (Math.random() - 0.5) * 2), 0) / sectorStocks.length;
      
      return {
        sector,
        avgSensitivity,
        stockCount: sectorStocks.length,
        riskLevel: Math.abs(avgSensitivity) > 0.7 ? 'high' : 
                  Math.abs(avgSensitivity) > 0.4 ? 'medium' : 'low'
      };
    });
  }

  calculateDiversificationScore(correlationMatrix) {
    const correlations = [];
    const symbols = Object.keys(correlationMatrix);
    
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        correlations.push(Math.abs(correlationMatrix[symbols[i]][symbols[j]]));
      }
    }
    
    const avgCorrelation = correlations.reduce((a, b) => a + b, 0) / correlations.length;
    return Math.max(0, (1 - avgCorrelation) * 100); // 상관관계가 낮을수록 다각화 점수 높음
  }
}

export default CorrelationCausalFrames; 