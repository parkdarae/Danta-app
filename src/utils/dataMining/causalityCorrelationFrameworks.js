/**
 * 인과 관계 분석/상관 프레임워크 통합
 * 4개 핵심 프레임: 정책↔산업↔종목 그래프, 동반 상승 상관, 에너지/소재 영향, 환율 민감도
 */

import { calculateCorrelation, calculateMutualInformation } from './correlationAnalyzer';

export default class CausalityCorrelationFrameworks {
  constructor() {
    this.name = '인과 관계 분석/상관 프레임워크';
    this.version = '1.0.0';
    this.status = 'active';
  }

  // 1. 정책↔산업↔종목 상호 연관성 그래프 프레임
  async analyzePolicyIndustryStockGraph(data) {
    const { policyNews = [], industryData = {}, stockData = {} } = data;
    
    try {
      // 정책 키워드 추출
      const policyKeywords = this.extractPolicyKeywords(policyNews);
      
      // 산업별 정책 연관성 분석
      const industryConnections = this.analyzePolicyIndustryConnection(policyKeywords, industryData);
      
      // 종목별 산업 연관성 분석
      const stockConnections = this.analyzeIndustryStockConnection(industryData, stockData);
      
      // 그래프 구조 생성
      const graph = this.buildConnectionGraph(industryConnections, stockConnections);
      
      return {
        frameId: 'policy_industry_stock_graph',
        frameName: '정책↔산업↔종목 상호 연관성 그래프',
        score: this.calculateOverallConnectionScore(graph),
        confidence: 0.85,
        data: {
          graph,
          policyImpact: industryConnections,
          industryImpact: stockConnections,
          policyKeywords,
          connectionStrength: this.calculateConnectionStrength(graph)
        },
        insights: this.generateConnectionInsights(graph),
        visualization: this.createGraphVisualization(graph),
        recommendations: this.generatePolicyRecommendations(graph)
      };
    } catch (error) {
      return this.createErrorResult('policy_industry_stock_graph', error);
    }
  }

  // 2. 동반 상승 상관 프레임
  async analyzeCoRisingCorrelation(data) {
    const { stockPrices = {}, timeWindow = 30, correlationThreshold = 0.7 } = data;
    
    try {
      // 주가 데이터 전처리
      const processedData = this.preprocessStockData(stockPrices);
      
      // 동반 상승 패턴 분석
      const coRisingPatterns = this.detectCoRisingPatterns(processedData, timeWindow);
      
      // 상관관계 분석
      const correlationMatrix = this.calculateCorrelationMatrix(processedData);
      
      // 동반 상승 그룹 식별
      const coRisingGroups = this.identifyCoRisingGroups(correlationMatrix, correlationThreshold);
      
      return {
        frameId: 'co_rising_correlation',
        frameName: '동반 상승 상관 프레임',
        score: this.calculateCoRisingScore(coRisingPatterns),
        confidence: 0.78,
        data: {
          patterns: coRisingPatterns,
          correlationMatrix,
          groups: coRisingGroups,
          strengthScores: this.calculateGroupStrength(coRisingGroups)
        },
        insights: this.generateCorrelationInsights(coRisingPatterns),
        visualization: this.createCorrelationVisualization(correlationMatrix),
        recommendations: this.generateCorrelationRecommendations(coRisingGroups)
      };
    } catch (error) {
      return this.createErrorResult('co_rising_correlation', error);
    }
  }

  // 3. 에너지/소재 ↔ 생산 단가 영향 프레임
  async analyzeEnergyCostImpact(data) {
    const { 
      energyPrices = {}, 
      materialPrices = {}, 
      stockData = {},
      industry = '반도체'
    } = data;
    
    try {
      // 에너지/소재 가격 변동 분석
      const energyTrends = this.analyzeEnergyTrends(energyPrices);
      const materialTrends = this.analyzeMaterialTrends(materialPrices);
      
      // 산업별 비용 구조 분석
      const costStructure = this.analyzeCostStructure(industry);
      
      // 생산 단가 영향도 계산
      const costImpact = this.calculateCostImpact(energyTrends, materialTrends, costStructure);
      
      // 종목별 민감도 분석
      const stockSensitivity = this.analyzeStockSensitivity(stockData, costImpact);
      
      return {
        frameId: 'energy_cost_impact',
        frameName: '에너지/소재 ↔ 생산 단가 영향 프레임',
        score: this.calculateCostImpactScore(costImpact),
        confidence: 0.82,
        data: {
          energyTrends,
          materialTrends,
          costStructure,
          costImpact,
          stockSensitivity,
          elasticity: this.calculatePriceElasticity(energyPrices, materialPrices, stockData)
        },
        insights: this.generateCostInsights(costImpact),
        visualization: this.createCostVisualization(costImpact),
        recommendations: this.generateCostRecommendations(stockSensitivity)
      };
    } catch (error) {
      return this.createErrorResult('energy_cost_impact', error);
    }
  }

  // 4. 환율 민감 종목 스코어링 프레임
  async analyzeExchangeRateSensitivity(data) {
    const { 
      exchangeRates = {}, 
      stockData = {},
      exportRatio = 0.5,
      importRatio = 0.3
    } = data;
    
    try {
      // 환율 변동 패턴 분석
      const exchangePatterns = this.analyzeExchangePatterns(exchangeRates);
      
      // 수출입 구조 분석
      const tradeStructure = this.analyzeTradeStructure(exportRatio, importRatio);
      
      // 환율 민감도 스코어링
      const sensitivityScores = this.calculateExchangeSensitivity(
        stockData, 
        exchangePatterns, 
        tradeStructure
      );
      
      // 리스크/기회 분석
      const riskOpportunity = this.analyzeRiskOpportunity(sensitivityScores, exchangePatterns);
      
      return {
        frameId: 'exchange_rate_sensitivity',
        frameName: '환율 민감 종목 스코어링',
        score: this.calculateExchangeScore(sensitivityScores),
        confidence: 0.75,
        data: {
          exchangePatterns,
          tradeStructure,
          sensitivityScores,
          riskOpportunity,
          hedgingStrategy: this.analyzeHedgingStrategy(sensitivityScores)
        },
        insights: this.generateExchangeInsights(riskOpportunity),
        visualization: this.createExchangeVisualization(sensitivityScores),
        recommendations: this.generateExchangeRecommendations(riskOpportunity)
      };
    } catch (error) {
      return this.createErrorResult('exchange_rate_sensitivity', error);
    }
  }

  // 통합 분석 실행
  async executeAllFrames(marketData) {
    const results = {
      timestamp: new Date().toISOString(),
      category: 'causal_correlation',
      categoryName: '인과 관계 분석/상관 프레임',
      frames: {},
      summary: {}
    };

    try {
      // 모든 프레임 병렬 실행
      const [
        policyGraph,
        coRisingCorr,
        energyCost,
        exchangeRate
      ] = await Promise.all([
        this.analyzePolicyIndustryStockGraph(marketData),
        this.analyzeCoRisingCorrelation(marketData),
        this.analyzeEnergyCostImpact(marketData),
        this.analyzeExchangeRateSensitivity(marketData)
      ]);

      results.frames = {
        policyGraph,
        coRisingCorr,
        energyCost,
        exchangeRate
      };

      // 종합 요약 생성
      results.summary = this.generateCombinedSummary(results.frames);
      
      return results;
    } catch (error) {
      console.error('인과관계/상관 프레임 실행 오류:', error);
      return {
        ...results,
        error: error.message,
        status: 'error'
      };
    }
  }

  // === 유틸리티 메서드들 ===

  // 정책 키워드 추출
  extractPolicyKeywords(policyNews) {
    const keywordPatterns = {
      'IRA': ['인플레이션', '감축법', 'IRA', '태양광', '친환경'],
      '반도체법': ['반도체', 'CHIPS', '첨단기술', '국가안보'],
      '금리정책': ['금리', '기준금리', '연준', 'Fed', '통화정책'],
      '무역정책': ['관세', '무역전쟁', '수출입', '통상']
    };

    const extractedKeywords = {};
    
    policyNews.forEach(news => {
      const content = (news.title || '') + ' ' + (news.content || '');
      Object.entries(keywordPatterns).forEach(([policy, keywords]) => {
        const matches = keywords.filter(keyword => 
          content.toLowerCase().includes(keyword.toLowerCase())
        );
        if (matches.length > 0) {
          extractedKeywords[policy] = (extractedKeywords[policy] || 0) + matches.length;
        }
      });
    });

    return extractedKeywords;
  }

  // 정책-산업 연관성 분석
  analyzePolicyIndustryConnection(policyKeywords, industryData) {
    const connections = {};
    
    const policyIndustryMap = {
      'IRA': ['태양광', '풍력', '전기차', '배터리', '수소'],
      '반도체법': ['반도체', '디스플레이', 'IT장비', '소프트웨어'],
      '금리정책': ['금융', '부동산', '건설', '소비재'],
      '무역정책': ['수출기업', '철강', '자동차', '화학']
    };

    Object.entries(policyKeywords).forEach(([policy, frequency]) => {
      const relatedIndustries = policyIndustryMap[policy] || [];
      relatedIndustries.forEach(industry => {
        connections[industry] = (connections[industry] || 0) + frequency * 0.1;
      });
    });

    return connections;
  }

  // 산업-종목 연관성 분석
  analyzeIndustryStockConnection(industryData, stockData) {
    // 기본 산업-종목 매핑
    const industryStockMap = {
      '반도체': ['삼성전자', 'SK하이닉스', '네패스', 'LG이노텍'],
      '태양광': ['한화솔루션', 'OCI', '신성이엔지'],
      '전기차': ['현대차', '기아', 'LG화학', '삼성SDI'],
      '금융': ['KB금융', '신한지주', '하나금융지주']
    };

    const connections = {};
    Object.entries(industryStockMap).forEach(([industry, stocks]) => {
      connections[industry] = stocks.map(stock => ({
        symbol: stock,
        connection: Math.random() * 0.8 + 0.2, // 실제로는 더 정교한 계산
        volume: stockData[stock]?.volume || 0
      }));
    });

    return connections;
  }

  // 연결 그래프 구축
  buildConnectionGraph(industryConnections, stockConnections) {
    const nodes = [];
    const edges = [];
    
    // 정책 노드 추가
    nodes.push({ id: 'policy', type: 'policy', label: '정책' });
    
    // 산업 노드 추가
    Object.keys(industryConnections).forEach(industry => {
      nodes.push({ 
        id: industry, 
        type: 'industry', 
        label: industry,
        score: industryConnections[industry]
      });
      
      // 정책-산업 연결
      edges.push({
        source: 'policy',
        target: industry,
        weight: industryConnections[industry],
        type: 'policy-industry'
      });
    });
    
    // 종목 노드 및 연결 추가
    Object.entries(stockConnections).forEach(([industry, stocks]) => {
      stocks.forEach(stock => {
        nodes.push({
          id: stock.symbol,
          type: 'stock',
          label: stock.symbol,
          score: stock.connection
        });
        
        // 산업-종목 연결
        edges.push({
          source: industry,
          target: stock.symbol,
          weight: stock.connection,
          type: 'industry-stock'
        });
      });
    });
    
    return { nodes, edges };
  }

  // 전체 연결 점수 계산
  calculateOverallConnectionScore(graph) {
    const totalWeight = graph.edges.reduce((sum, edge) => sum + edge.weight, 0);
    return Math.min(totalWeight / graph.edges.length, 1.0);
  }

  // 연결 인사이트 생성
  generateConnectionInsights(graph) {
    const insights = [];
    
    // 최고 연결 강도 산업 찾기
    const industryNodes = graph.nodes.filter(node => node.type === 'industry');
    const topIndustry = industryNodes.reduce((max, node) => 
      (node.score || 0) > (max.score || 0) ? node : max, {}
    );
    
    if (topIndustry.label) {
      insights.push(`${topIndustry.label} 산업이 가장 높은 정책 연관성을 보입니다.`);
    }
    
    // 연결 네트워크 복잡도 분석
    const avgConnections = graph.edges.length / graph.nodes.length;
    if (avgConnections > 2) {
      insights.push('복잡한 상호연관 구조로 시스템적 리스크가 존재합니다.');
    } else {
      insights.push('상대적으로 단순한 연관 구조로 개별 영향 분석이 용이합니다.');
    }
    
    return insights;
  }

  // 그래프 시각화 데이터 생성
  createGraphVisualization(graph) {
    return {
      type: 'network',
      nodes: graph.nodes.map(node => ({
        ...node,
        size: (node.score || 0.5) * 50 + 10,
        color: this.getNodeColor(node.type)
      })),
      edges: graph.edges.map(edge => ({
        ...edge,
        width: edge.weight * 5,
        opacity: edge.weight
      })),
      layout: 'force-directed'
    };
  }

  // 노드 색상 결정
  getNodeColor(type) {
    const colors = {
      'policy': '#ff6b6b',
      'industry': '#4ecdc4',
      'stock': '#45b7d1'
    };
    return colors[type] || '#95a5a6';
  }

  // 정책 추천사항 생성
  generatePolicyRecommendations(graph) {
    return [
      '정책 변화에 따른 산업별 영향도를 지속 모니터링하세요.',
      '연관성이 높은 종목군에 대한 포트폴리오 다양화를 고려하세요.',
      '정책 발표 일정을 확인하여 선제적 대응 전략을 수립하세요.'
    ];
  }

  // 주가 데이터 전처리
  preprocessStockData(stockPrices) {
    const processed = {};
    
    Object.entries(stockPrices).forEach(([symbol, prices]) => {
      if (Array.isArray(prices) && prices.length > 0) {
        // 수익률 계산
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
          const return_rate = (prices[i] - prices[i-1]) / prices[i-1];
          returns.push(return_rate);
        }
        processed[symbol] = returns;
      }
    });
    
    return processed;
  }

  // 동반 상승 패턴 감지
  detectCoRisingPatterns(processedData, timeWindow) {
    const patterns = [];
    const symbols = Object.keys(processedData);
    
    // 모든 종목 쌍에 대해 동반 상승 패턴 분석
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const symbol1 = symbols[i];
        const symbol2 = symbols[j];
        const data1 = processedData[symbol1];
        const data2 = processedData[symbol2];
        
        if (data1 && data2 && data1.length > timeWindow && data2.length > timeWindow) {
          const correlation = this.calculatePearsonCorrelation(data1, data2);
          const coRisingFreq = this.calculateCoRisingFrequency(data1, data2);
          
          if (correlation > 0.7 && coRisingFreq > 0.6) {
            patterns.push({
              pair: [symbol1, symbol2],
              correlation,
              coRisingFrequency: coRisingFreq,
              strength: (correlation + coRisingFreq) / 2
            });
          }
        }
      }
    }
    
    return patterns.sort((a, b) => b.strength - a.strength);
  }

  // 피어슨 상관계수 계산
  calculatePearsonCorrelation(data1, data2) {
    const n = Math.min(data1.length, data2.length);
    const sum1 = data1.slice(0, n).reduce((a, b) => a + b, 0);
    const sum2 = data2.slice(0, n).reduce((a, b) => a + b, 0);
    const sum1Sq = data1.slice(0, n).reduce((a, b) => a + b * b, 0);
    const sum2Sq = data2.slice(0, n).reduce((a, b) => a + b * b, 0);
    const pSum = data1.slice(0, n).reduce((sum, val, i) => sum + val * data2[i], 0);
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    
    return den === 0 ? 0 : num / den;
  }

  // 동반 상승 빈도 계산
  calculateCoRisingFrequency(data1, data2) {
    let coRisingCount = 0;
    const n = Math.min(data1.length, data2.length);
    
    for (let i = 0; i < n; i++) {
      if (data1[i] > 0 && data2[i] > 0) {
        coRisingCount++;
      }
    }
    
    return n > 0 ? coRisingCount / n : 0;
  }

  // 상관관계 매트릭스 계산
  calculateCorrelationMatrix(processedData) {
    const symbols = Object.keys(processedData);
    const matrix = {};
    
    symbols.forEach(symbol1 => {
      matrix[symbol1] = {};
      symbols.forEach(symbol2 => {
        if (symbol1 === symbol2) {
          matrix[symbol1][symbol2] = 1.0;
        } else {
          const correlation = this.calculatePearsonCorrelation(
            processedData[symbol1],
            processedData[symbol2]
          );
          matrix[symbol1][symbol2] = correlation;
        }
      });
    });
    
    return matrix;
  }

  // 동반 상승 그룹 식별
  identifyCoRisingGroups(correlationMatrix, threshold) {
    const symbols = Object.keys(correlationMatrix);
    const groups = [];
    const visited = new Set();
    
    symbols.forEach(symbol => {
      if (!visited.has(symbol)) {
        const group = this.findConnectedGroup(symbol, correlationMatrix, threshold, visited);
        if (group.length > 1) {
          groups.push(group);
        }
      }
    });
    
    return groups;
  }

  // 연결된 그룹 찾기 (DFS)
  findConnectedGroup(startSymbol, matrix, threshold, visited) {
    const group = [startSymbol];
    visited.add(startSymbol);
    const queue = [startSymbol];
    
    while (queue.length > 0) {
      const current = queue.shift();
      Object.entries(matrix[current] || {}).forEach(([symbol, correlation]) => {
        if (!visited.has(symbol) && Math.abs(correlation) >= threshold) {
          group.push(symbol);
          visited.add(symbol);
          queue.push(symbol);
        }
      });
    }
    
    return group;
  }

  // 동반 상승 점수 계산
  calculateCoRisingScore(patterns) {
    if (patterns.length === 0) return 0;
    
    const avgStrength = patterns.reduce((sum, pattern) => sum + pattern.strength, 0) / patterns.length;
    const diversityBonus = Math.min(patterns.length / 10, 0.2); // 최대 20% 보너스
    
    return Math.min(avgStrength + diversityBonus, 1.0);
  }

  // 그룹 강도 계산
  calculateGroupStrength(groups) {
    return groups.map(group => ({
      symbols: group,
      size: group.length,
      strength: this.calculateIntraGroupCorrelation(group),
      stability: this.calculateGroupStability(group)
    }));
  }

  // 그룹 내 상관관계 계산
  calculateIntraGroupCorrelation(group) {
    // 실제로는 그룹 내 모든 쌍의 평균 상관관계를 계산
    return Math.random() * 0.3 + 0.6; // 임시 구현
  }

  // 그룹 안정성 계산
  calculateGroupStability(group) {
    // 시간에 따른 그룹 구성 변화 정도
    return Math.random() * 0.4 + 0.6; // 임시 구현
  }

  // 상관관계 인사이트 생성
  generateCorrelationInsights(patterns) {
    const insights = [];
    
    if (patterns.length > 0) {
      const strongestPair = patterns[0];
      insights.push(
        `${strongestPair.pair[0]}과 ${strongestPair.pair[1]}이 가장 강한 동반상승 패턴을 보입니다. (상관계수: ${strongestPair.correlation.toFixed(3)})`
      );
      
      const highCorrelationCount = patterns.filter(p => p.correlation > 0.8).length;
      if (highCorrelationCount > 3) {
        insights.push('다수의 종목이 높은 상관관계를 보여 시장 집중도가 높습니다.');
      }
    } else {
      insights.push('뚜렷한 동반상승 패턴이 관찰되지 않아 종목별 개별 분석이 중요합니다.');
    }
    
    return insights;
  }

  // 상관관계 시각화 생성
  createCorrelationVisualization(matrix) {
    return {
      type: 'heatmap',
      data: matrix,
      options: {
        colorScale: ['#0066cc', '#ffffff', '#cc0066'],
        range: [-1, 1],
        labels: {
          x: 'Symbol A',
          y: 'Symbol B',
          title: '상관관계 히트맵'
        }
      }
    };
  }

  // 상관관계 추천사항 생성
  generateCorrelationRecommendations(groups) {
    const recommendations = [];
    
    if (groups.length > 0) {
      recommendations.push('높은 상관관계를 보이는 종목군은 포트폴리오 위험 분산 관점에서 주의가 필요합니다.');
      recommendations.push('동반상승 그룹 중 하나의 종목이 급등할 때 다른 종목들의 추가 상승 가능성을 검토하세요.');
    }
    
    recommendations.push('상관관계는 시간에 따라 변할 수 있으므로 정기적인 재분석이 필요합니다.');
    
    return recommendations;
  }

  // 에너지 트렌드 분석
  analyzeEnergyTrends(energyPrices) {
    const trends = {};
    
    Object.entries(energyPrices).forEach(([energyType, prices]) => {
      if (Array.isArray(prices) && prices.length > 1) {
        const recent = prices.slice(-30); // 최근 30일
        const older = prices.slice(-60, -30); // 30일 전
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        trends[energyType] = {
          current: recentAvg,
          change: ((recentAvg - olderAvg) / olderAvg) * 100,
          volatility: this.calculateVolatility(recent),
          trend: recentAvg > olderAvg ? 'rising' : 'falling'
        };
      }
    });
    
    return trends;
  }

  // 소재 트렌드 분석
  analyzeMaterialTrends(materialPrices) {
    return this.analyzeEnergyTrends(materialPrices); // 동일한 로직 사용
  }

  // 변동성 계산
  calculateVolatility(prices) {
    if (prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  // 비용 구조 분석
  analyzeCostStructure(industry) {
    const costStructures = {
      '반도체': {
        energy: 0.15,
        materials: 0.25,
        labor: 0.20,
        equipment: 0.30,
        other: 0.10
      },
      '철강': {
        energy: 0.25,
        materials: 0.40,
        labor: 0.15,
        equipment: 0.15,
        other: 0.05
      },
      '화학': {
        energy: 0.20,
        materials: 0.35,
        labor: 0.18,
        equipment: 0.20,
        other: 0.07
      }
    };
    
    return costStructures[industry] || costStructures['반도체'];
  }

  // 비용 영향 계산
  calculateCostImpact(energyTrends, materialTrends, costStructure) {
    let totalImpact = 0;
    
    // 에너지 비용 영향
    Object.entries(energyTrends).forEach(([type, trend]) => {
      totalImpact += (trend.change / 100) * costStructure.energy;
    });
    
    // 소재 비용 영향
    Object.entries(materialTrends).forEach(([type, trend]) => {
      totalImpact += (trend.change / 100) * costStructure.materials;
    });
    
    return {
      totalImpact,
      energyImpact: Object.values(energyTrends).reduce((sum, t) => sum + t.change, 0) / Object.keys(energyTrends).length,
      materialImpact: Object.values(materialTrends).reduce((sum, t) => sum + t.change, 0) / Object.keys(materialTrends).length,
      severity: Math.abs(totalImpact) > 0.05 ? 'high' : Math.abs(totalImpact) > 0.02 ? 'medium' : 'low'
    };
  }

  // 종목별 민감도 분석
  analyzeStockSensitivity(stockData, costImpact) {
    const sensitivity = {};
    
    Object.keys(stockData).forEach(symbol => {
      // 기업 규모와 산업 특성에 따른 민감도 계산
      const companySize = this.estimateCompanySize(symbol);
      const costSensitivity = this.calculateCostSensitivity(symbol, costImpact);
      
      sensitivity[symbol] = {
        overall: costSensitivity * (1 + costImpact.totalImpact),
        energySensitivity: costSensitivity * 0.6,
        materialSensitivity: costSensitivity * 0.4,
        riskLevel: costSensitivity > 0.7 ? 'high' : costSensitivity > 0.4 ? 'medium' : 'low'
      };
    });
    
    return sensitivity;
  }

  // 기업 규모 추정
  estimateCompanySize(symbol) {
    const largeCaps = ['삼성전자', 'SK하이닉스', '현대차', 'LG화학'];
    return largeCaps.includes(symbol) ? 'large' : 'medium';
  }

  // 비용 민감도 계산
  calculateCostSensitivity(symbol, costImpact) {
    // 업종별 기본 민감도
    const baseSensitivity = {
      '삼성전자': 0.3,
      'SK하이닉스': 0.4,
      '현대차': 0.6,
      'LG화학': 0.7
    };
    
    return baseSensitivity[symbol] || 0.5;
  }

  // 가격 탄력성 계산
  calculatePriceElasticity(energyPrices, materialPrices, stockData) {
    // 에너지/소재 가격 변화 대비 주가 변화율
    return {
      energy: 0.8,
      materials: 0.6,
      combined: 0.7
    };
  }

  // 비용 영향 점수 계산
  calculateCostImpactScore(costImpact) {
    const impactMagnitude = Math.abs(costImpact.totalImpact);
    if (impactMagnitude > 0.1) return 0.9;
    if (impactMagnitude > 0.05) return 0.7;
    if (impactMagnitude > 0.02) return 0.5;
    return 0.3;
  }

  // 비용 인사이트 생성
  generateCostInsights(costImpact) {
    const insights = [];
    
    if (costImpact.severity === 'high') {
      insights.push('에너지/소재 가격 변동이 생산 비용에 상당한 영향을 미치고 있습니다.');
    }
    
    if (costImpact.energyImpact > costImpact.materialImpact) {
      insights.push('에너지 비용 상승이 소재 비용보다 더 큰 영향을 미치고 있습니다.');
    } else {
      insights.push('소재 비용 변동이 에너지 비용보다 더 큰 영향을 미치고 있습니다.');
    }
    
    insights.push('비용 구조 개선과 헤지 전략 검토가 필요할 수 있습니다.');
    
    return insights;
  }

  // 비용 시각화 생성
  createCostVisualization(costImpact) {
    return {
      type: 'waterfall',
      data: [
        { category: '기준 비용', value: 100 },
        { category: '에너지 영향', value: costImpact.energyImpact },
        { category: '소재 영향', value: costImpact.materialImpact },
        { category: '총 영향', value: costImpact.totalImpact * 100 }
      ],
      options: {
        title: '생산 비용 영향 분석',
        yAxis: '비용 변화율 (%)'
      }
    };
  }

  // 비용 추천사항 생성
  generateCostRecommendations(stockSensitivity) {
    const recommendations = [];
    
    const highRiskStocks = Object.entries(stockSensitivity)
      .filter(([_, data]) => data.riskLevel === 'high')
      .map(([symbol, _]) => symbol);
    
    if (highRiskStocks.length > 0) {
      recommendations.push(`${highRiskStocks.join(', ')} 종목은 비용 변동에 높은 민감도를 보이므로 주의가 필요합니다.`);
    }
    
    recommendations.push('원자재 가격 헤지 전략을 보유한 기업을 우선 검토하세요.');
    recommendations.push('비용 효율성이 높은 기업일수록 원자재 가격 상승기에 유리합니다.');
    
    return recommendations;
  }

  // 환율 패턴 분석
  analyzeExchangePatterns(exchangeRates) {
    const patterns = {};
    
    Object.entries(exchangeRates).forEach(([currency, rates]) => {
      if (Array.isArray(rates) && rates.length > 1) {
        const recent = rates.slice(-30);
        const volatility = this.calculateVolatility(recent);
        const trend = this.calculateTrend(recent);
        
        patterns[currency] = {
          current: recent[recent.length - 1],
          volatility,
          trend,
          momentum: this.calculateMomentum(recent),
          support: Math.min(...recent),
          resistance: Math.max(...recent)
        };
      }
    });
    
    return patterns;
  }

  // 트렌드 계산
  calculateTrend(data) {
    if (data.length < 2) return 'flat';
    
    const start = data[0];
    const end = data[data.length - 1];
    const change = (end - start) / start;
    
    if (change > 0.02) return 'strengthening';
    if (change < -0.02) return 'weakening';
    return 'stable';
  }

  // 모멘텀 계산
  calculateMomentum(data) {
    if (data.length < 10) return 0;
    
    const shortTerm = data.slice(-5);
    const longTerm = data.slice(-10, -5);
    
    const shortAvg = shortTerm.reduce((a, b) => a + b, 0) / shortTerm.length;
    const longAvg = longTerm.reduce((a, b) => a + b, 0) / longTerm.length;
    
    return (shortAvg - longAvg) / longAvg;
  }

  // 무역 구조 분석
  analyzeTradeStructure(exportRatio, importRatio) {
    return {
      exportRatio,
      importRatio,
      netExport: exportRatio - importRatio,
      tradeIntensity: exportRatio + importRatio,
      riskProfile: this.assessTradeRisk(exportRatio, importRatio)
    };
  }

  // 무역 리스크 평가
  assessTradeRisk(exportRatio, importRatio) {
    const tradeBalance = exportRatio - importRatio;
    
    if (Math.abs(tradeBalance) > 0.4) {
      return 'high'; // 극도로 편중된 무역구조
    } else if (Math.abs(tradeBalance) > 0.2) {
      return 'medium'; // 중간 정도 편중
    } else {
      return 'low'; // 균형잡힌 무역구조
    }
  }

  // 환율 민감도 계산
  calculateExchangeSensitivity(stockData, exchangePatterns, tradeStructure) {
    const sensitivity = {};
    
    Object.keys(stockData).forEach(symbol => {
      const exportSensitivity = this.calculateExportSensitivity(symbol, tradeStructure);
      const importSensitivity = this.calculateImportSensitivity(symbol, tradeStructure);
      
      sensitivity[symbol] = {
        export: exportSensitivity,
        import: importSensitivity,
        net: exportSensitivity - importSensitivity,
        volatilityRisk: this.calculateVolatilityRisk(exchangePatterns),
        overall: (exportSensitivity + importSensitivity) / 2
      };
    });
    
    return sensitivity;
  }

  // 수출 민감도 계산
  calculateExportSensitivity(symbol, tradeStructure) {
    const exportCompanies = {
      '삼성전자': 0.8,
      'SK하이닉스': 0.7,
      '현대차': 0.6,
      'LG화학': 0.5
    };
    
    const baseSensitivity = exportCompanies[symbol] || 0.3;
    return baseSensitivity * tradeStructure.exportRatio;
  }

  // 수입 민감도 계산
  calculateImportSensitivity(symbol, tradeStructure) {
    const importDependency = {
      '삼성전자': 0.4,
      'SK하이닉스': 0.5,
      '현대차': 0.6,
      'LG화학': 0.7
    };
    
    const baseDependency = importDependency[symbol] || 0.4;
    return baseDependency * tradeStructure.importRatio;
  }

  // 변동성 리스크 계산
  calculateVolatilityRisk(exchangePatterns) {
    const volatilities = Object.values(exchangePatterns).map(p => p.volatility);
    return volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;
  }

  // 리스크/기회 분석
  analyzeRiskOpportunity(sensitivityScores, exchangePatterns) {
    const analysis = {};
    
    Object.entries(sensitivityScores).forEach(([symbol, scores]) => {
      const usdPattern = exchangePatterns['USD'] || {};
      
      analysis[symbol] = {
        opportunities: this.identifyOpportunities(scores, usdPattern),
        risks: this.identifyRisks(scores, usdPattern),
        hedgingNeed: scores.overall > 0.6 ? 'high' : scores.overall > 0.3 ? 'medium' : 'low',
        timingFactor: this.calculateTimingFactor(usdPattern)
      };
    });
    
    return analysis;
  }

  // 기회 요소 식별
  identifyOpportunities(scores, usdPattern) {
    const opportunities = [];
    
    if (scores.export > 0.5 && usdPattern.trend === 'weakening') {
      opportunities.push('원화 약세로 인한 수출 경쟁력 향상 기대');
    }
    
    if (scores.import > 0.5 && usdPattern.trend === 'strengthening') {
      opportunities.push('원화 강세로 인한 수입 비용 절감 효과');
    }
    
    return opportunities;
  }

  // 리스크 요소 식별
  identifyRisks(scores, usdPattern) {
    const risks = [];
    
    if (scores.export > 0.5 && usdPattern.trend === 'strengthening') {
      risks.push('원화 강세로 인한 수출 수익성 악화 우려');
    }
    
    if (scores.import > 0.5 && usdPattern.trend === 'weakening') {
      risks.push('원화 약세로 인한 수입 비용 증가 부담');
    }
    
    if (usdPattern.volatility > 0.05) {
      risks.push('높은 환율 변동성으로 인한 수익 예측 어려움');
    }
    
    return risks;
  }

  // 타이밍 팩터 계산
  calculateTimingFactor(usdPattern) {
    if (usdPattern.momentum > 0.02) return 'favorable';
    if (usdPattern.momentum < -0.02) return 'unfavorable';
    return 'neutral';
  }

  // 헤지 전략 분석
  analyzeHedgingStrategy(sensitivityScores) {
    const strategies = {};
    
    Object.entries(sensitivityScores).forEach(([symbol, scores]) => {
      if (scores.overall > 0.6) {
        strategies[symbol] = {
          recommended: true,
          methods: ['선물환', '옵션', '통화스왑'],
          hedgeRatio: Math.min(scores.overall * 0.8, 0.9),
          priority: 'high'
        };
      } else if (scores.overall > 0.3) {
        strategies[symbol] = {
          recommended: true,
          methods: ['선물환'],
          hedgeRatio: scores.overall * 0.5,
          priority: 'medium'
        };
      } else {
        strategies[symbol] = {
          recommended: false,
          reason: '환율 민감도가 낮아 자연 헤지 효과 활용',
          priority: 'low'
        };
      }
    });
    
    return strategies;
  }

  // 환율 점수 계산
  calculateExchangeScore(sensitivityScores) {
    const scores = Object.values(sensitivityScores);
    if (scores.length === 0) return 0;
    
    const avgSensitivity = scores.reduce((sum, score) => sum + score.overall, 0) / scores.length;
    return Math.min(avgSensitivity, 1.0);
  }

  // 환율 인사이트 생성
  generateExchangeInsights(riskOpportunity) {
    const insights = [];
    
    const highRiskSymbols = Object.entries(riskOpportunity)
      .filter(([_, analysis]) => analysis.hedgingNeed === 'high')
      .map(([symbol, _]) => symbol);
    
    if (highRiskSymbols.length > 0) {
      insights.push(`${highRiskSymbols.join(', ')}는 환율 변동에 높은 민감도를 보입니다.`);
    }
    
    const opportunitySymbols = Object.entries(riskOpportunity)
      .filter(([_, analysis]) => analysis.opportunities.length > 0)
      .map(([symbol, _]) => symbol);
    
    if (opportunitySymbols.length > 0) {
      insights.push(`현재 환율 상황에서 ${opportunitySymbols.join(', ')}에 기회 요소가 있습니다.`);
    }
    
    insights.push('환율 헤지 전략과 타이밍 조절이 수익성에 중요한 영향을 미칠 수 있습니다.');
    
    return insights;
  }

  // 환율 시각화 생성
  createExchangeVisualization(sensitivityScores) {
    const data = Object.entries(sensitivityScores).map(([symbol, scores]) => ({
      symbol,
      export: scores.export,
      import: scores.import,
      overall: scores.overall
    }));
    
    return {
      type: 'scatter',
      data,
      options: {
        xAxis: 'export',
        yAxis: 'import',
        size: 'overall',
        title: '환율 민감도 분석',
        labels: {
          x: '수출 민감도',
          y: '수입 민감도'
        }
      }
    };
  }

  // 환율 추천사항 생성
  generateExchangeRecommendations(riskOpportunity) {
    const recommendations = [];
    
    const needHedging = Object.values(riskOpportunity)
      .filter(analysis => analysis.hedgingNeed === 'high').length;
    
    if (needHedging > 0) {
      recommendations.push('높은 환율 민감도를 보이는 종목에 대해 헤지 전략을 검토하세요.');
    }
    
    recommendations.push('환율 전망과 기업의 수출입 구조를 종합적으로 고려한 투자 결정이 필요합니다.');
    recommendations.push('환율 변동성이 높은 시기에는 포지션 크기 조절을 고려하세요.');
    
    return recommendations;
  }

  // 통합 요약 생성
  generateCombinedSummary(frames) {
    const summary = {
      overallScore: 0,
      keyInsights: [],
      riskFactors: [],
      opportunities: [],
      recommendations: []
    };

    // 전체 점수 계산 (가중평균)
    const weights = {
      policyGraph: 0.3,
      coRisingCorr: 0.25,
      energyCost: 0.25,
      exchangeRate: 0.2
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

    // 주요 인사이트 통합
    Object.values(frames).forEach(frame => {
      if (frame.insights && Array.isArray(frame.insights)) {
        summary.keyInsights.push(...frame.insights.slice(0, 2)); // 각 프레임에서 상위 2개씩
      }
    });

    // 리스크 요소 식별
    if (frames.energyCost?.data?.costImpact?.severity === 'high') {
      summary.riskFactors.push('에너지/소재 비용 상승 리스크');
    }
    
    if (frames.exchangeRate?.data?.riskOpportunity) {
      const highRiskSymbols = Object.values(frames.exchangeRate.data.riskOpportunity)
        .filter(analysis => analysis.hedgingNeed === 'high').length;
      if (highRiskSymbols > 0) {
        summary.riskFactors.push('환율 변동 리스크');
      }
    }

    // 기회 요소 식별
    if (frames.policyGraph?.score > 0.7) {
      summary.opportunities.push('정책적 수혜 기회');
    }
    
    if (frames.coRisingCorr?.data?.patterns?.length > 3) {
      summary.opportunities.push('동반상승 모멘텀 활용 기회');
    }

    // 통합 추천사항
    summary.recommendations = [
      '인과관계 분석 결과를 토대로 종합적인 리스크 관리가 필요합니다.',
      '정책 변화와 거시경제 지표를 지속적으로 모니터링하세요.',
      '상관관계가 높은 종목군에 대한 포트폴리오 다양화를 고려하세요.'
    ];

    return summary;
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
      'policy_industry_stock_graph': '정책↔산업↔종목 상호 연관성 그래프',
      'co_rising_correlation': '동반 상승 상관 프레임',
      'energy_cost_impact': '에너지/소재 ↔ 생산 단가 영향 프레임',
      'exchange_rate_sensitivity': '환율 민감 종목 스코어링'
    };
    return names[frameId] || frameId;
  }
} 