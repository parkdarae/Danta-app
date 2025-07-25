/**
 * 인과 관계 분석/상관 프레임
 * - 정책↔산업↔종목 상호 연관성 그래프 프레임
 * - 동반 상승 상관 프레임  
 * - 에너지/소재 ↔ 생산 단가 영향 프레임
 * - 환율 민감 종목 스코어링 프레임
 */

import { calculateCorrelation, calculateMutualInformation } from './correlationAnalyzer';

// 정책↔산업↔종목 상호 연관성 그래프 프레임
export const policyIndustryStockGraph = {
  name: '정책↔산업↔종목 상호 연관성 그래프',
  description: 'IRA → 태양광 산업 → 한화솔루션 등 산업계층 분석',
  
  async analyze(data) {
    const { policyNews, industryData, stockData } = data;
    
    // 정책 키워드 추출
    const policyKeywords = this.extractPolicyKeywords(policyNews);
    
    // 산업별 정책 연관성 분석
    const industryConnections = this.analyzePolicyIndustryConnection(policyKeywords, industryData);
    
    // 종목별 산업 연관성 분석
    const stockConnections = this.analyzeIndustryStockConnection(industryData, stockData);
    
    // 그래프 구조 생성
    const graph = this.buildConnectionGraph(industryConnections, stockConnections);
    
    return {
      score: this.calculateOverallConnectionScore(graph),
      graph,
      policyImpact: industryConnections,
      industryImpact: stockConnections,
      insights: this.generateConnectionInsights(graph),
      visualization: this.createGraphVisualization(graph)
    };
  },
  
  extractPolicyKeywords(policyNews) {
    const keywords = [];
    const policyPatterns = [
      /인프라|투자|세제혜택|보조금|지원책/g,
      /탄소중립|그린뉴딜|신재생에너지/g,
      /반도체|AI|첨단기술|K-반도체/g,
      /바이오|헬스케어|제약지원/g
    ];
    
    policyNews.forEach(news => {
      policyPatterns.forEach(pattern => {
        const matches = news.content.match(pattern);
        if (matches) {
          keywords.push(...matches);
        }
      });
    });
    
    return this.countKeywordFrequency(keywords);
  },
  
  analyzePolicyIndustryConnection(policyKeywords, industryData) {
    const connections = {};
    
    Object.keys(policyKeywords).forEach(keyword => {
      const frequency = policyKeywords[keyword];
      
      // 산업별 키워드 매칭
      industryData.forEach(industry => {
        const matchScore = this.calculateKeywordMatchScore(keyword, industry);
        if (matchScore > 0.5) {
          if (!connections[industry.code]) {
            connections[industry.code] = { industry: industry.name, policies: [] };
          }
          connections[industry.code].policies.push({
            keyword,
            frequency,
            matchScore,
            impact: frequency * matchScore
          });
        }
      });
    });
    
    return connections;
  },
  
  analyzeIndustryStockConnection(industryData, stockData) {
    const connections = {};
    
    stockData.forEach(stock => {
      const industryCode = stock.industry;
      if (!connections[industryCode]) {
        connections[industryCode] = [];
      }
      
      connections[industryCode].push({
        symbol: stock.symbol,
        name: stock.name,
        correlation: this.calculateIndustryCorrelation(stock, industryData),
        beta: stock.beta || 1.0,
        sensitivity: this.calculateSensitivity(stock)
      });
    });
    
    return connections;
  },
  
  buildConnectionGraph(industryConnections, stockConnections) {
    const nodes = [];
    const edges = [];
    
    // 정책 노드 추가
    Object.values(industryConnections).forEach(connection => {
      connection.policies.forEach(policy => {
        nodes.push({
          id: `policy_${policy.keyword}`,
          type: 'policy',
          label: policy.keyword,
          weight: policy.frequency
        });
        
        // 정책 → 산업 엣지
        edges.push({
          source: `policy_${policy.keyword}`,
          target: `industry_${connection.industry}`,
          weight: policy.impact,
          type: 'policy_industry'
        });
      });
    });
    
    // 산업 노드 추가
    Object.keys(stockConnections).forEach(industryCode => {
      nodes.push({
        id: `industry_${industryCode}`,
        type: 'industry',
        label: industryCode,
        stocks: stockConnections[industryCode].length
      });
      
      // 산업 → 종목 엣지
      stockConnections[industryCode].forEach(stock => {
        nodes.push({
          id: `stock_${stock.symbol}`,
          type: 'stock',
          label: stock.name,
          beta: stock.beta
        });
        
        edges.push({
          source: `industry_${industryCode}`,
          target: `stock_${stock.symbol}`,
          weight: stock.correlation,
          type: 'industry_stock'
        });
      });
    });
    
    return { nodes, edges };
  },
  
  calculateOverallConnectionScore(graph) {
    const policyNodes = graph.nodes.filter(n => n.type === 'policy');
    const industryNodes = graph.nodes.filter(n => n.type === 'industry');
    const stockNodes = graph.nodes.filter(n => n.type === 'stock');
    
    const connectionDensity = graph.edges.length / (graph.nodes.length * (graph.nodes.length - 1) / 2);
    const avgWeight = graph.edges.reduce((sum, edge) => sum + edge.weight, 0) / graph.edges.length;
    
    return Math.min(100, (connectionDensity * 50 + avgWeight * 50));
  },
  
  generateConnectionInsights(graph) {
    const insights = [];
    
    // 가장 영향력 있는 정책 식별
    const policyImpacts = {};
    graph.edges.filter(e => e.type === 'policy_industry').forEach(edge => {
      if (!policyImpacts[edge.source]) policyImpacts[edge.source] = 0;
      policyImpacts[edge.source] += edge.weight;
    });
    
    const topPolicy = Object.keys(policyImpacts).reduce((a, b) => 
      policyImpacts[a] > policyImpacts[b] ? a : b
    );
    
    insights.push(`가장 영향력 있는 정책: ${topPolicy.replace('policy_', '')}`);
    
    // 가장 민감한 산업 식별
    const industryConnections = {};
    graph.edges.filter(e => e.type === 'industry_stock').forEach(edge => {
      if (!industryConnections[edge.source]) industryConnections[edge.source] = [];
      industryConnections[edge.source].push(edge.weight);
    });
    
    Object.keys(industryConnections).forEach(industry => {
      const avgCorr = industryConnections[industry].reduce((a, b) => a + b, 0) / industryConnections[industry].length;
      if (avgCorr > 0.7) {
        insights.push(`고상관 산업: ${industry.replace('industry_', '')} (${(avgCorr * 100).toFixed(1)}%)`);
      }
    });
    
    return insights;
  },
  
  createGraphVisualization(graph) {
    return {
      type: 'network',
      data: graph,
      config: {
        layout: 'hierarchical',
        direction: 'left-right',
        nodeSize: 'weight',
        edgeWidth: 'weight',
        colorByType: true
      }
    };
  },
  
  calculateKeywordMatchScore(keyword, industry) {
    // 단순 키워드 매칭 스코어 (실제로는 더 정교한 NLP 필요)
    const industryKeywords = {
      '전기전자': ['반도체', 'AI', '첨단기술', '전자'],
      '에너지': ['탄소중립', '그린뉴딜', '신재생에너지', '태양광'],
      '바이오': ['바이오', '헬스케어', '제약지원', '의료'],
      '건설': ['인프라', '투자', '건설', '부동산']
    };
    
    const keywords = industryKeywords[industry.name] || [];
    return keywords.some(k => keyword.includes(k)) ? 0.8 : 0.1;
  },
  
  calculateIndustryCorrelation(stock, industryData) {
    // 실제로는 주가 데이터와 산업 지수의 상관관계를 계산
    return Math.random() * 0.5 + 0.3; // 0.3-0.8 범위
  },
  
  calculateSensitivity(stock) {
    return stock.beta * (stock.volatility || 1.2);
  },
  
  countKeywordFrequency(keywords) {
    const frequency = {};
    keywords.forEach(keyword => {
      frequency[keyword] = (frequency[keyword] || 0) + 1;
    });
    return frequency;
  }
};

// 동반 상승 상관 프레임
export const companionRiseCorrelation = {
  name: '동반 상승 상관',
  description: '일정 주기 동반 상승하는 쌍/군 추출 (반도체+장비주)',
  
  async analyze(data) {
    const { priceData, timeWindow = 30 } = data;
    
    // 상관관계 매트릭스 계산
    const correlationMatrix = this.calculateCorrelationMatrix(priceData, timeWindow);
    
    // 동반 상승 패턴 탐지
    const companionPairs = this.findCompanionPairs(correlationMatrix);
    
    // 그룹 클러스터링
    const clusters = this.clusterCompanionGroups(companionPairs);
    
    return {
      score: this.calculateCompanionScore(companionPairs),
      correlationMatrix,
      companionPairs,
      clusters,
      insights: this.generateCompanionInsights(clusters),
      recommendations: this.generateTradingRecommendations(clusters)
    };
  },
  
  calculateCorrelationMatrix(priceData, timeWindow) {
    const symbols = Object.keys(priceData);
    const matrix = {};
    
    symbols.forEach(symbol1 => {
      matrix[symbol1] = {};
      symbols.forEach(symbol2 => {
        if (symbol1 !== symbol2) {
          const correlation = calculateCorrelation(
            priceData[symbol1].slice(-timeWindow),
            priceData[symbol2].slice(-timeWindow)
          );
          matrix[symbol1][symbol2] = correlation;
        }
      });
    });
    
    return matrix;
  },
  
  findCompanionPairs(correlationMatrix) {
    const pairs = [];
    const threshold = 0.7;
    
    Object.keys(correlationMatrix).forEach(symbol1 => {
      Object.keys(correlationMatrix[symbol1]).forEach(symbol2 => {
        const correlation = correlationMatrix[symbol1][symbol2];
        if (correlation > threshold) {
          pairs.push({
            pair: [symbol1, symbol2],
            correlation,
            strength: this.calculatePairStrength(correlation)
          });
        }
      });
    });
    
    // 중복 제거 및 정렬
    return this.deduplicateAndSort(pairs);
  },
  
  clusterCompanionGroups(companionPairs) {
    const clusters = [];
    const visited = new Set();
    
    companionPairs.forEach(pair => {
      if (!visited.has(pair.pair[0]) && !visited.has(pair.pair[1])) {
        const cluster = this.buildCluster(pair, companionPairs, visited);
        if (cluster.members.length >= 2) {
          clusters.push(cluster);
        }
      }
    });
    
    return clusters.sort((a, b) => b.avgCorrelation - a.avgCorrelation);
  },
  
  buildCluster(seedPair, allPairs, visited) {
    const cluster = {
      members: [...seedPair.pair],
      correlations: [seedPair.correlation],
      avgCorrelation: seedPair.correlation
    };
    
    seedPair.pair.forEach(symbol => visited.add(symbol));
    
    // 클러스터 확장
    let expanded = true;
    while (expanded) {
      expanded = false;
      
      allPairs.forEach(pair => {
        const [s1, s2] = pair.pair;
        if (cluster.members.includes(s1) && !visited.has(s2)) {
          cluster.members.push(s2);
          cluster.correlations.push(pair.correlation);
          visited.add(s2);
          expanded = true;
        } else if (cluster.members.includes(s2) && !visited.has(s1)) {
          cluster.members.push(s1);
          cluster.correlations.push(pair.correlation);
          visited.add(s1);
          expanded = true;
        }
      });
    }
    
    cluster.avgCorrelation = cluster.correlations.reduce((a, b) => a + b, 0) / cluster.correlations.length;
    return cluster;
  },
  
  calculateCompanionScore(companionPairs) {
    if (companionPairs.length === 0) return 0;
    
    const avgCorrelation = companionPairs.reduce((sum, pair) => sum + pair.correlation, 0) / companionPairs.length;
    const strongPairs = companionPairs.filter(pair => pair.correlation > 0.8).length;
    
    return Math.min(100, avgCorrelation * 70 + (strongPairs / companionPairs.length) * 30);
  },
  
  generateCompanionInsights(clusters) {
    const insights = [];
    
    clusters.forEach((cluster, index) => {
      insights.push(
        `클러스터 ${index + 1}: ${cluster.members.join(', ')} (평균 상관도: ${(cluster.avgCorrelation * 100).toFixed(1)}%)`
      );
      
      if (cluster.avgCorrelation > 0.8) {
        insights.push(`⚡ 고상관 그룹으로 동반 매매 전략 적합`);
      }
    });
    
    return insights;
  },
  
  generateTradingRecommendations(clusters) {
    const recommendations = [];
    
    clusters.forEach(cluster => {
      if (cluster.avgCorrelation > 0.75) {
        recommendations.push({
          type: 'pair_trading',
          members: cluster.members,
          strategy: '동반 매매',
          confidence: cluster.avgCorrelation,
          description: `${cluster.members.join('/')} 그룹은 ${(cluster.avgCorrelation * 100).toFixed(1)}% 상관도로 함께 움직입니다.`
        });
      }
    });
    
    return recommendations;
  },
  
  calculatePairStrength(correlation) {
    if (correlation > 0.9) return 'very_strong';
    if (correlation > 0.8) return 'strong';
    if (correlation > 0.7) return 'moderate';
    return 'weak';
  },
  
  deduplicateAndSort(pairs) {
    const uniquePairs = [];
    const seen = new Set();
    
    pairs.forEach(pair => {
      const key = pair.pair.sort().join('-');
      if (!seen.has(key)) {
        seen.add(key);
        uniquePairs.push(pair);
      }
    });
    
    return uniquePairs.sort((a, b) => b.correlation - a.correlation);
  }
};

// 에너지/소재 ↔ 생산 단가 영향 프레임
export const energyMaterialCostImpact = {
  name: '에너지/소재 ↔ 생산 단가 영향',
  description: '원유, 전력, 니켈 → 반도체 단가 추이 분석으로 수익성 예측',
  
  async analyze(data) {
    const { commodityPrices, stockData, productionData } = data;
    
    // 원자재-산업 매핑
    const materialMapping = this.createMaterialIndustryMapping();
    
    // 비용 영향도 분석
    const costImpacts = this.analyzeCostImpacts(commodityPrices, materialMapping);
    
    // 마진 영향 예측
    const marginImpacts = this.predictMarginImpacts(costImpacts, stockData);
    
    // 가격 전가 능력 분석
    const pricingPower = this.analyzePricingPower(stockData, costImpacts);
    
    return {
      score: this.calculateCostImpactScore(costImpacts),
      materialMapping,
      costImpacts,
      marginImpacts,
      pricingPower,
      insights: this.generateCostInsights(costImpacts, marginImpacts),
      alerts: this.generateCostAlerts(costImpacts)
    };
  },
  
  createMaterialIndustryMapping() {
    return {
      crude_oil: {
        industries: ['화학', '정유', '항공', '해운'],
        costWeight: { '화학': 0.4, '정유': 0.8, '항공': 0.3, '해운': 0.25 }
      },
      copper: {
        industries: ['전기전자', '건설', '자동차'],
        costWeight: { '전기전자': 0.15, '건설': 0.1, '자동차': 0.05 }
      },
      nickel: {
        industries: ['배터리', '철강', '항공우주'],
        costWeight: { '배터리': 0.3, '철강': 0.1, '항공우주': 0.08 }
      },
      lithium: {
        industries: ['배터리', '전기차'],
        costWeight: { '배터리': 0.4, '전기차': 0.2 }
      },
      electricity: {
        industries: ['반도체', '알루미늄', '철강', '데이터센터'],
        costWeight: { '반도체': 0.1, '알루미늄': 0.4, '철강': 0.15, '데이터센터': 0.2 }
      }
    };
  },
  
  analyzeCostImpacts(commodityPrices, materialMapping) {
    const impacts = {};
    
    Object.keys(materialMapping).forEach(material => {
      const priceChange = this.calculatePriceChange(commodityPrices[material]);
      const mapping = materialMapping[material];
      
      Object.keys(mapping.costWeight).forEach(industry => {
        if (!impacts[industry]) {
          impacts[industry] = { totalImpact: 0, materials: [] };
        }
        
        const impact = priceChange * mapping.costWeight[industry];
        impacts[industry].totalImpact += impact;
        impacts[industry].materials.push({
          material,
          priceChange,
          weight: mapping.costWeight[industry],
          impact
        });
      });
    });
    
    return impacts;
  },
  
  predictMarginImpacts(costImpacts, stockData) {
    const marginPredictions = {};
    
    Object.keys(costImpacts).forEach(industry => {
      const costImpact = costImpacts[industry].totalImpact;
      
      // 해당 산업의 주식들에 대한 마진 영향 예측
      const industryStocks = stockData.filter(stock => stock.industry === industry);
      
      industryStocks.forEach(stock => {
        const baseMargin = stock.operatingMargin || 0.1;
        const marginFlexibility = this.calculateMarginFlexibility(stock);
        
        const predictedMarginChange = costImpact * (1 - marginFlexibility);
        const newMargin = baseMargin + predictedMarginChange;
        
        marginPredictions[stock.symbol] = {
          currentMargin: baseMargin,
          costImpact,
          marginFlexibility,
          predictedMarginChange,
          newMargin,
          severity: this.calculateSeverity(predictedMarginChange, baseMargin)
        };
      });
    });
    
    return marginPredictions;
  },
  
  analyzePricingPower(stockData, costImpacts) {
    const pricingPowerAnalysis = {};
    
    stockData.forEach(stock => {
      const industry = stock.industry;
      const costImpact = costImpacts[industry]?.totalImpact || 0;
      
      // 가격 전가 능력 지표들
      const marketShare = stock.marketShare || 0.1;
      const brandPower = stock.brandValue || 0.5;
      const competitionLevel = this.getCompetitionLevel(industry);
      const productDifferentiation = this.getProductDifferentiation(stock);
      
      const pricingPower = this.calculatePricingPower(
        marketShare, brandPower, competitionLevel, productDifferentiation
      );
      
      pricingPowerAnalysis[stock.symbol] = {
        pricingPower,
        costImpact,
        canPassThrough: pricingPower > 0.6,
        passThroughRate: Math.min(pricingPower, 1.0),
        netImpact: costImpact * (1 - Math.min(pricingPower, 1.0)),
        recommendation: this.generatePricingRecommendation(pricingPower, costImpact)
      };
    });
    
    return pricingPowerAnalysis;
  },
  
  calculateCostImpactScore(costImpacts) {
    const industries = Object.keys(costImpacts);
    if (industries.length === 0) return 50;
    
    const avgImpact = industries.reduce((sum, industry) => 
      sum + Math.abs(costImpacts[industry].totalImpact), 0
    ) / industries.length;
    
    // 영향도가 클수록 낮은 점수 (위험)
    return Math.max(0, 100 - avgImpact * 100);
  },
  
  generateCostInsights(costImpacts, marginImpacts) {
    const insights = [];
    
    // 가장 영향받는 산업
    const sortedIndustries = Object.keys(costImpacts).sort((a, b) => 
      Math.abs(costImpacts[b].totalImpact) - Math.abs(costImpacts[a].totalImpact)
    );
    
    if (sortedIndustries.length > 0) {
      const topImpacted = sortedIndustries[0];
      const impact = costImpacts[topImpacted].totalImpact;
      insights.push(
        `가장 영향받는 산업: ${topImpacted} (${impact > 0 ? '+' : ''}${(impact * 100).toFixed(1)}%)`
      );
    }
    
    // 심각한 마진 압박 종목
    const severeImpacts = Object.keys(marginImpacts).filter(symbol => 
      marginImpacts[symbol].severity === 'high'
    );
    
    if (severeImpacts.length > 0) {
      insights.push(`⚠️ 심각한 마진 압박: ${severeImpacts.slice(0, 3).join(', ')}`);
    }
    
    return insights;
  },
  
  generateCostAlerts(costImpacts) {
    const alerts = [];
    
    Object.keys(costImpacts).forEach(industry => {
      const impact = costImpacts[industry].totalImpact;
      
      if (Math.abs(impact) > 0.1) { // 10% 이상 영향
        alerts.push({
          type: impact > 0 ? 'cost_increase' : 'cost_decrease',
          industry,
          impact: impact * 100,
          severity: Math.abs(impact) > 0.2 ? 'high' : 'medium',
          message: `${industry} 산업 생산비용 ${impact > 0 ? '상승' : '하락'} ${Math.abs(impact * 100).toFixed(1)}%`
        });
      }
    });
    
    return alerts.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  },
  
  calculatePriceChange(priceData) {
    if (!priceData || priceData.length < 2) return 0;
    const recent = priceData.slice(-5); // 최근 5일
    const previous = priceData.slice(-10, -5); // 이전 5일
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
    
    return (recentAvg - previousAvg) / previousAvg;
  },
  
  calculateMarginFlexibility(stock) {
    // 마진 유연성 = 고정비 비율의 역수
    const fixedCostRatio = stock.fixedCostRatio || 0.6;
    return 1 - fixedCostRatio;
  },
  
  calculateSeverity(marginChange, baseMargin) {
    const impactRatio = Math.abs(marginChange) / baseMargin;
    if (impactRatio > 0.3) return 'high';
    if (impactRatio > 0.15) return 'medium';
    return 'low';
  },
  
  getCompetitionLevel(industry) {
    const competitionLevels = {
      '반도체': 0.8, '자동차': 0.9, '화학': 0.7,
      '철강': 0.8, '배터리': 0.6, '항공': 0.4
    };
    return competitionLevels[industry] || 0.7;
  },
  
  getProductDifferentiation(stock) {
    // 제품 차별화 정도 (브랜드, 기술력 등)
    return stock.productDifferentiation || 0.5;
  },
  
  calculatePricingPower(marketShare, brandPower, competitionLevel, productDifferentiation) {
    return (marketShare * 0.3 + brandPower * 0.3 + 
            (1 - competitionLevel) * 0.2 + productDifferentiation * 0.2);
  },
  
  generatePricingRecommendation(pricingPower, costImpact) {
    if (pricingPower > 0.7 && costImpact > 0) {
      return '가격 전가 가능 - 매수 고려';
    } else if (pricingPower < 0.4 && costImpact > 0) {
      return '마진 압박 예상 - 주의';
    } else if (costImpact < 0) {
      return '비용 절감 효과 - 수혜 예상';
    }
    return '중립';
  }
};

// 환율 민감 종목 스코어링 프레임
export const exchangeRateSensitivity = {
  name: '환율 민감 종목 스코어링',
  description: '수출기업 + 원화 강세 효과 시뮬레이션 (자동차/반도체 수출주)',
  
  async analyze(data) {
    const { exchangeRates, stockData, exportData } = data;
    
    // 환율 변동 분석
    const exchangeVolatility = this.analyzeExchangeVolatility(exchangeRates);
    
    // 기업별 환율 노출도 계산
    const exposureScores = this.calculateExposureScores(stockData, exportData);
    
    // 환율 민감도 스코어링
    const sensitivityScores = this.calculateSensitivityScores(exposureScores, exchangeVolatility);
    
    // 환율 시나리오 분석
    const scenarioAnalysis = this.performScenarioAnalysis(sensitivityScores, exchangeRates);
    
    return {
      score: this.calculateOverallSensitivityScore(sensitivityScores),
      exchangeVolatility,
      exposureScores,
      sensitivityScores,
      scenarioAnalysis,
      insights: this.generateExchangeInsights(sensitivityScores, scenarioAnalysis),
      recommendations: this.generateExchangeRecommendations(sensitivityScores, exchangeRates)
    };
  },
  
  analyzeExchangeVolatility(exchangeRates) {
    const analysis = {};
    
    Object.keys(exchangeRates).forEach(currency => {
      const rates = exchangeRates[currency];
      const volatility = this.calculateVolatility(rates);
      const trend = this.calculateTrend(rates);
      const momentum = this.calculateMomentum(rates);
      
      analysis[currency] = {
        currentRate: rates[rates.length - 1],
        volatility,
        trend,
        momentum,
        riskLevel: this.categorizeRisk(volatility)
      };
    });
    
    return analysis;
  },
  
  calculateExposureScores(stockData, exportData) {
    const exposures = {};
    
    stockData.forEach(stock => {
      const exportInfo = exportData.find(exp => exp.symbol === stock.symbol);
      
      if (exportInfo) {
        const exportRatio = exportInfo.exportRevenue / exportInfo.totalRevenue;
        const regionExposure = this.calculateRegionExposure(exportInfo.exportRegions);
        const hedgingRatio = exportInfo.hedgingRatio || 0;
        
        exposures[stock.symbol] = {
          exportRatio,
          regionExposure,
          hedgingRatio,
          netExposure: exportRatio * (1 - hedgingRatio),
          currencies: this.identifyExposureCurrencies(exportInfo.exportRegions)
        };
      } else {
        // 수출 데이터가 없는 경우 산업별 기본값 적용
        exposures[stock.symbol] = this.getDefaultExposure(stock.industry);
      }
    });
    
    return exposures;
  },
  
  calculateSensitivityScores(exposureScores, exchangeVolatility) {
    const sensitivityScores = {};
    
    Object.keys(exposureScores).forEach(symbol => {
      const exposure = exposureScores[symbol];
      let totalSensitivity = 0;
      
      exposure.currencies.forEach(currencyInfo => {
        const currency = currencyInfo.currency;
        const weight = currencyInfo.weight;
        const volatility = exchangeVolatility[currency]?.volatility || 0.1;
        
        const currencySensitivity = exposure.netExposure * weight * volatility;
        totalSensitivity += currencySensitivity;
      });
      
      sensitivityScores[symbol] = {
        sensitivity: totalSensitivity,
        exposure: exposure.netExposure,
        riskLevel: this.categorizeSensitivity(totalSensitivity),
        hedged: exposure.hedgingRatio > 0.5,
        majorCurrency: this.findMajorCurrency(exposure.currencies),
        impactDirections: this.calculateImpactDirections(exposure.currencies, exchangeVolatility)
      };
    });
    
    return sensitivityScores;
  },
  
  performScenarioAnalysis(sensitivityScores, exchangeRates) {
    const scenarios = {
      won_strength_5: { KRW: -0.05, USD: 0.05, EUR: 0.02, CNY: 0.01 },
      won_strength_10: { KRW: -0.10, USD: 0.10, EUR: 0.05, CNY: 0.03 },
      won_weakness_5: { KRW: 0.05, USD: -0.05, EUR: -0.02, CNY: -0.01 },
      won_weakness_10: { KRW: 0.10, USD: -0.10, EUR: -0.05, CNY: -0.03 }
    };
    
    const analysis = {};
    
    Object.keys(scenarios).forEach(scenarioName => {
      const scenario = scenarios[scenarioName];
      analysis[scenarioName] = {};
      
      Object.keys(sensitivityScores).forEach(symbol => {
        const score = sensitivityScores[symbol];
        let impactScore = 0;
        
        score.impactDirections.forEach(impact => {
          const exchangeChange = scenario[impact.currency] || 0;
          impactScore += impact.impact * exchangeChange;
        });
        
        analysis[scenarioName][symbol] = {
          impactScore,
          expectedReturn: impactScore * score.sensitivity,
          risk: Math.abs(impactScore) * score.sensitivity,
          recommendation: this.getScenarioRecommendation(impactScore)
        };
      });
    });
    
    return analysis;
  },
  
  calculateOverallSensitivityScore(sensitivityScores) {
    const scores = Object.values(sensitivityScores);
    if (scores.length === 0) return 50;
    
    const avgSensitivity = scores.reduce((sum, score) => sum + score.sensitivity, 0) / scores.length;
    const hedgedRatio = scores.filter(score => score.hedged).length / scores.length;
    
    // 민감도가 낮고 헤지 비율이 높을수록 높은 점수
    return Math.min(100, (1 - avgSensitivity) * 70 + hedgedRatio * 30);
  },
  
  generateExchangeInsights(sensitivityScores, scenarioAnalysis) {
    const insights = [];
    
    // 가장 민감한 종목들
    const mostSensitive = Object.keys(sensitivityScores)
      .sort((a, b) => sensitivityScores[b].sensitivity - sensitivityScores[a].sensitivity)
      .slice(0, 3);
    
    insights.push(`환율 최고 민감: ${mostSensitive.join(', ')}`);
    
    // 헤지 현황
    const hedgedStocks = Object.keys(sensitivityScores).filter(symbol => 
      sensitivityScores[symbol].hedged
    );
    
    insights.push(`헤지 적용 종목: ${hedgedStocks.length}개`);
    
    // 원화 강세 시나리오 수혜/피해 종목
    const wonStrengthWinners = Object.keys(scenarioAnalysis.won_strength_5)
      .filter(symbol => scenarioAnalysis.won_strength_5[symbol].impactScore > 0)
      .slice(0, 3);
    
    if (wonStrengthWinners.length > 0) {
      insights.push(`원화 강세 수혜: ${wonStrengthWinners.join(', ')}`);
    }
    
    return insights;
  },
  
  generateExchangeRecommendations(sensitivityScores, exchangeRates) {
    const recommendations = [];
    
    Object.keys(sensitivityScores).forEach(symbol => {
      const score = sensitivityScores[symbol];
      
      if (score.riskLevel === 'high' && !score.hedged) {
        recommendations.push({
          symbol,
          type: 'hedge_recommendation',
          message: '환율 헤지 필요 - 높은 환율 리스크',
          priority: 'high'
        });
      }
      
      if (score.sensitivity > 0.3 && score.majorCurrency === 'USD') {
        const usdTrend = exchangeRates.USD_KRW?.trend || 0;
        if (usdTrend > 0) {
          recommendations.push({
            symbol,
            type: 'trading_opportunity',
            message: '달러 강세 기조 - 수출 수혜 기대',
            priority: 'medium'
          });
        }
      }
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  },
  
  calculateVolatility(rates) {
    if (rates.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < rates.length; i++) {
      returns.push((rates[i] - rates[i-1]) / rates[i-1]);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * Math.sqrt(252); // 연율화
  },
  
  calculateTrend(rates) {
    if (rates.length < 2) return 0;
    
    const recent = rates.slice(-10);
    const slope = (recent[recent.length - 1] - recent[0]) / recent.length;
    
    return slope / recent[0]; // 정규화된 기울기
  },
  
  calculateMomentum(rates) {
    if (rates.length < 3) return 0;
    
    const short = rates.slice(-5);
    const long = rates.slice(-20, -5);
    
    const shortAvg = short.reduce((a, b) => a + b, 0) / short.length;
    const longAvg = long.reduce((a, b) => a + b, 0) / long.length;
    
    return (shortAvg - longAvg) / longAvg;
  },
  
  categorizeRisk(volatility) {
    if (volatility > 0.3) return 'high';
    if (volatility > 0.15) return 'medium';
    return 'low';
  },
  
  calculateRegionExposure(exportRegions) {
    // 지역별 수출 비중 정규화
    const total = Object.values(exportRegions).reduce((a, b) => a + b, 0);
    const normalized = {};
    
    Object.keys(exportRegions).forEach(region => {
      normalized[region] = exportRegions[region] / total;
    });
    
    return normalized;
  },
  
  identifyExposureCurrencies(exportRegions) {
    const currencyMapping = {
      'North_America': { currency: 'USD', weight: 1.0 },
      'Europe': { currency: 'EUR', weight: 1.0 },
      'China': { currency: 'CNY', weight: 1.0 },
      'Japan': { currency: 'JPY', weight: 1.0 },
      'Southeast_Asia': { currency: 'USD', weight: 0.7 }
    };
    
    const currencies = [];
    Object.keys(exportRegions).forEach(region => {
      if (currencyMapping[region]) {
        currencies.push({
          ...currencyMapping[region],
          weight: currencyMapping[region].weight * (exportRegions[region] || 0)
        });
      }
    });
    
    return currencies;
  },
  
  getDefaultExposure(industry) {
    const defaultExposures = {
      '자동차': { exportRatio: 0.6, hedgingRatio: 0.3, currencies: [{ currency: 'USD', weight: 0.4 }, { currency: 'EUR', weight: 0.3 }] },
      '반도체': { exportRatio: 0.8, hedgingRatio: 0.5, currencies: [{ currency: 'USD', weight: 0.7 }] },
      '화학': { exportRatio: 0.4, hedgingRatio: 0.2, currencies: [{ currency: 'USD', weight: 0.5 }] },
      '철강': { exportRatio: 0.3, hedgingRatio: 0.1, currencies: [{ currency: 'USD', weight: 0.6 }] }
    };
    
    const defaultExp = defaultExposures[industry] || { exportRatio: 0.2, hedgingRatio: 0.1, currencies: [{ currency: 'USD', weight: 1.0 }] };
    defaultExp.netExposure = defaultExp.exportRatio * (1 - defaultExp.hedgingRatio);
    
    return defaultExp;
  },
  
  categorizeSensitivity(sensitivity) {
    if (sensitivity > 0.4) return 'high';
    if (sensitivity > 0.2) return 'medium';
    return 'low';
  },
  
  findMajorCurrency(currencies) {
    return currencies.reduce((max, curr) => 
      curr.weight > max.weight ? curr : max
    ).currency;
  },
  
  calculateImpactDirections(currencies, exchangeVolatility) {
    return currencies.map(currencyInfo => ({
      currency: currencyInfo.currency,
      weight: currencyInfo.weight,
      impact: currencyInfo.weight * (exchangeVolatility[currencyInfo.currency]?.trend || 0)
    }));
  },
  
  getScenarioRecommendation(impactScore) {
    if (impactScore > 0.05) return 'strong_buy';
    if (impactScore > 0.02) return 'buy';
    if (impactScore < -0.05) return 'sell';
    if (impactScore < -0.02) return 'caution';
    return 'hold';
  }
};

export default {
  policyIndustryStockGraph,
  companionRiseCorrelation,
  energyMaterialCostImpact,
  exchangeRateSensitivity
}; 