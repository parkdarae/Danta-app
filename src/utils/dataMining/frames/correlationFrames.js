// 인과 관계 분석과 상관관계 분석을 위한 프레임들을 구현합니다.
import { calculateCorrelation, calculateMutualInformation } from '../correlationAnalyzer';

// 정책↔산업↔종목 상호 연관성 그래프 프레임
export const policyIndustryStockNetworkFrame = {
  name: "정책↔산업↔종목 상호 연관성 그래프",
  description: "정책 발표가 산업을 거쳐 개별 종목에 미치는 영향 경로를 네트워크로 시각화",
  category: "correlation",
  
  async analyze(stockData, policyData, industryData) {
    try {
      // 정책 키워드 매핑
      const policyKeywords = this.extractPolicyKeywords(policyData);
      
      // 산업별 정책 연관도 계산
      const industryPolicyCorrelation = this.calculateIndustryPolicyCorrelation(
        industryData, 
        policyKeywords
      );
      
      // 종목별 산업 연관도 계산
      const stockIndustryCorrelation = this.calculateStockIndustryCorrelation(
        stockData, 
        industryData
      );
      
      // 네트워크 그래프 구성
      const networkGraph = this.buildNetworkGraph(
        policyKeywords,
        industryPolicyCorrelation,
        stockIndustryCorrelation
      );
      
      // 영향 경로 분석
      const impactPaths = this.analyzeImpactPaths(networkGraph, stockData.symbol);
      
      return {
        score: this.calculateNetworkScore(impactPaths),
        networkGraph,
        impactPaths,
        keyInsights: this.generateNetworkInsights(impactPaths),
        riskFactors: this.identifyNetworkRisks(networkGraph, stockData.symbol)
      };
    } catch (error) {
      console.error('Policy-Industry-Stock Network Frame Error:', error);
      return { score: 0, error: error.message };
    }
  },
  
  extractPolicyKeywords(policyData) {
    const keywordMap = {
      'IRA': ['인플레이션감축법', '재생에너지', '세금공제'],
      '반도체법': ['CHIPS법', '반도체', '공급망'],
      '탄소중립': ['넷제로', '그린뉴딜', 'ESG'],
      '디지털뉴딜': ['AI', '5G', '데이터센터']
    };
    
    return Object.keys(keywordMap).filter(policy => 
      policyData.some(news => 
        keywordMap[policy].some(keyword => 
          news.title?.includes(keyword) || news.content?.includes(keyword)
        )
      )
    );
  },
  
  calculateIndustryPolicyCorrelation(industryData, policyKeywords) {
    const correlations = {};
    
    industryData.forEach(industry => {
      correlations[industry.name] = {};
      policyKeywords.forEach(policy => {
        correlations[industry.name][policy] = Math.random() * 0.8 + 0.2; // 실제로는 뉴스 분석 결과
      });
    });
    
    return correlations;
  },
  
  calculateStockIndustryCorrelation(stockData, industryData) {
    // 종목의 산업별 연관도 계산
    const correlations = {};
    
    industryData.forEach(industry => {
      correlations[industry.name] = this.calculateBusinessCorrelation(
        stockData, 
        industry
      );
    });
    
    return correlations;
  },
  
  calculateBusinessCorrelation(stockData, industry) {
    // 사업 영역, 매출 구성, 고객사 등을 기반으로 상관도 계산
    const businessAreas = stockData.businessAreas || [];
    const industryKeywords = industry.keywords || [];
    
    const overlap = businessAreas.filter(area => 
      industryKeywords.some(keyword => area.includes(keyword))
    ).length;
    
    return overlap / Math.max(businessAreas.length, industryKeywords.length, 1);
  },
  
  buildNetworkGraph(policies, industryCorrelations, stockCorrelations) {
    const nodes = [];
    const edges = [];
    
    // 정책 노드
    policies.forEach(policy => {
      nodes.push({ id: policy, type: 'policy', label: policy });
    });
    
    // 산업 노드 및 정책-산업 엣지
    Object.keys(industryCorrelations).forEach(industry => {
      nodes.push({ id: industry, type: 'industry', label: industry });
      
      policies.forEach(policy => {
        const correlation = industryCorrelations[industry][policy];
        if (correlation > 0.3) {
          edges.push({
            source: policy,
            target: industry,
            weight: correlation,
            type: 'policy-industry'
          });
        }
      });
    });
    
    // 종목 노드 및 산업-종목 엣지
    Object.keys(stockCorrelations).forEach(industry => {
      const correlation = stockCorrelations[industry];
      if (correlation > 0.2) {
        edges.push({
          source: industry,
          target: 'target_stock',
          weight: correlation,
          type: 'industry-stock'
        });
      }
    });
    
    nodes.push({ id: 'target_stock', type: 'stock', label: '대상 종목' });
    
    return { nodes, edges };
  },
  
  analyzeImpactPaths(networkGraph, stockSymbol) {
    const paths = [];
    
    // 정책에서 종목까지의 경로 찾기
    networkGraph.nodes
      .filter(node => node.type === 'policy')
      .forEach(policyNode => {
        const path = this.findPath(networkGraph, policyNode.id, 'target_stock');
        if (path.length > 0) {
          paths.push({
            policy: policyNode.id,
            path: path,
            totalWeight: this.calculatePathWeight(networkGraph, path),
            impactLevel: this.assessImpactLevel(path)
          });
        }
      });
    
    return paths.sort((a, b) => b.totalWeight - a.totalWeight);
  },
  
  findPath(graph, start, end, visited = new Set()) {
    if (start === end) return [end];
    if (visited.has(start)) return [];
    
    visited.add(start);
    
    const connectedEdges = graph.edges.filter(edge => edge.source === start);
    
    for (const edge of connectedEdges) {
      const path = this.findPath(graph, edge.target, end, new Set(visited));
      if (path.length > 0) {
        return [start, ...path];
      }
    }
    
    return [];
  },
  
  calculatePathWeight(graph, path) {
    let totalWeight = 1;
    
    for (let i = 0; i < path.length - 1; i++) {
      const edge = graph.edges.find(e => 
        e.source === path[i] && e.target === path[i + 1]
      );
      if (edge) {
        totalWeight *= edge.weight;
      }
    }
    
    return totalWeight;
  },
  
  assessImpactLevel(path) {
    const pathLength = path.length;
    if (pathLength <= 2) return '직접 영향';
    if (pathLength <= 3) return '간접 영향';
    return '미미한 영향';
  },
  
  calculateNetworkScore(impactPaths) {
    if (impactPaths.length === 0) return 0;
    
    const maxWeight = Math.max(...impactPaths.map(p => p.totalWeight));
    const pathCount = impactPaths.length;
    
    return Math.min(100, (maxWeight * 70) + (pathCount * 5));
  },
  
  generateNetworkInsights(impactPaths) {
    const insights = [];
    
    if (impactPaths.length === 0) {
      insights.push("현재 정책과 직접적인 연관성이 낮습니다.");
      return insights;
    }
    
    const strongestPath = impactPaths[0];
    insights.push(`가장 강한 영향 경로: ${strongestPath.path.join(' → ')}`);
    
    const directPaths = impactPaths.filter(p => p.impactLevel === '직접 영향');
    if (directPaths.length > 0) {
      insights.push(`${directPaths.length}개의 정책이 직접적으로 영향을 미칩니다.`);
    }
    
    return insights;
  },
  
  identifyNetworkRisks(networkGraph, stockSymbol) {
    const risks = [];
    
    // 단일 정책 의존도 위험
    const policyDependencies = networkGraph.edges
      .filter(e => e.type === 'policy-industry')
      .reduce((acc, edge) => {
        acc[edge.source] = (acc[edge.source] || 0) + edge.weight;
        return acc;
      }, {});
    
    const maxDependency = Math.max(...Object.values(policyDependencies));
    if (maxDependency > 0.7) {
      const dominantPolicy = Object.keys(policyDependencies)
        .find(policy => policyDependencies[policy] === maxDependency);
      risks.push(`${dominantPolicy} 정책 의존도가 높아 정책 변화 시 리스크 존재`);
    }
    
    // 산업 집중도 위험
    const industryConnections = networkGraph.edges
      .filter(e => e.type === 'industry-stock')
      .length;
    
    if (industryConnections < 2) {
      risks.push("산업 다각화가 부족하여 특정 산업 리스크에 노출");
    }
    
    return risks;
  }
};

// 동반 상승 상관 프레임
export const coMovementCorrelationFrame = {
  name: "동반 상승 상관",
  description: "특정 주기로 함께 상승하는 종목군을 발견하고 상관관계를 분석",
  category: "correlation",
  
  async analyze(stockData, marketData, timeWindow = 30) {
    try {
      // 동반 상승 패턴 탐지
      const coMovementPairs = this.detectCoMovementPairs(marketData, timeWindow);
      
      // 상관계수 계산
      const correlationMatrix = this.calculateCorrelationMatrix(coMovementPairs);
      
      // 섹터별 동반 상승 분석
      const sectorCorrelations = this.analyzeSectorCorrelations(coMovementPairs);
      
      // 리딩-래깅 관계 분석
      const leadLagRelations = this.analyzeLeadLagRelations(coMovementPairs);
      
      return {
        score: this.calculateCoMovementScore(stockData.symbol, coMovementPairs),
        coMovementPairs,
        correlationMatrix,
        sectorCorrelations,
        leadLagRelations,
        recommendations: this.generateCoMovementRecommendations(stockData, coMovementPairs)
      };
    } catch (error) {
      console.error('Co-Movement Correlation Frame Error:', error);
      return { score: 0, error: error.message };
    }
  },
  
  detectCoMovementPairs(marketData, timeWindow) {
    const pairs = [];
    const symbols = Object.keys(marketData);
    
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const symbol1 = symbols[i];
        const symbol2 = symbols[j];
        
        const correlation = this.calculateRollingCorrelation(
          marketData[symbol1], 
          marketData[symbol2], 
          timeWindow
        );
        
        if (correlation > 0.6) {
          pairs.push({
            pair: [symbol1, symbol2],
            correlation,
            synchronicity: this.calculateSynchronicity(
              marketData[symbol1], 
              marketData[symbol2]
            ),
            volatilityRatio: this.calculateVolatilityRatio(
              marketData[symbol1], 
              marketData[symbol2]
            )
          });
        }
      }
    }
    
    return pairs.sort((a, b) => b.correlation - a.correlation);
  },
  
  calculateRollingCorrelation(data1, data2, window) {
    if (data1.length !== data2.length || data1.length < window) return 0;
    
    const returns1 = this.calculateReturns(data1.slice(-window));
    const returns2 = this.calculateReturns(data2.slice(-window));
    
    return calculateCorrelation(returns1, returns2);
  },
  
  calculateReturns(prices) {
    return prices.slice(1).map((price, i) => 
      (price - prices[i]) / prices[i]
    );
  },
  
  calculateSynchronicity(data1, data2) {
    const returns1 = this.calculateReturns(data1);
    const returns2 = this.calculateReturns(data2);
    
    let synchronousMoves = 0;
    
    for (let i = 0; i < Math.min(returns1.length, returns2.length); i++) {
      if ((returns1[i] > 0 && returns2[i] > 0) || 
          (returns1[i] < 0 && returns2[i] < 0)) {
        synchronousMoves++;
      }
    }
    
    return synchronousMoves / Math.min(returns1.length, returns2.length);
  },
  
  calculateVolatilityRatio(data1, data2) {
    const vol1 = this.calculateVolatility(data1);
    const vol2 = this.calculateVolatility(data2);
    
    return Math.min(vol1, vol2) / Math.max(vol1, vol2);
  },
  
  calculateVolatility(data) {
    const returns = this.calculateReturns(data);
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  },
  
  calculateCorrelationMatrix(coMovementPairs) {
    const matrix = {};
    
    coMovementPairs.forEach(pair => {
      const [stock1, stock2] = pair.pair;
      
      if (!matrix[stock1]) matrix[stock1] = {};
      if (!matrix[stock2]) matrix[stock2] = {};
      
      matrix[stock1][stock2] = pair.correlation;
      matrix[stock2][stock1] = pair.correlation;
    });
    
    return matrix;
  },
  
  analyzeSectorCorrelations(coMovementPairs) {
    const sectorMap = {
      'AAPL': 'Technology',
      'MSFT': 'Technology',
      'GOOGL': 'Technology',
      'NVDA': 'Technology',
      'JPM': 'Financial',
      'BAC': 'Financial'
    };
    
    const sectorCorrelations = {};
    
    coMovementPairs.forEach(pair => {
      const [stock1, stock2] = pair.pair;
      const sector1 = sectorMap[stock1] || 'Other';
      const sector2 = sectorMap[stock2] || 'Other';
      
      if (sector1 === sector2) {
        if (!sectorCorrelations[sector1]) {
          sectorCorrelations[sector1] = [];
        }
        sectorCorrelations[sector1].push(pair);
      }
    });
    
    return sectorCorrelations;
  },
  
  analyzeLeadLagRelations(coMovementPairs) {
    return coMovementPairs.map(pair => {
      // 실제로는 시계열 분석을 통해 리딩-래깅 관계 파악
      const leadLag = Math.random() > 0.5 ? pair.pair[0] : pair.pair[1];
      const lagDays = Math.floor(Math.random() * 5) + 1;
      
      return {
        pair: pair.pair,
        leader: leadLag,
        follower: pair.pair.find(s => s !== leadLag),
        lagDays,
        confidence: 0.6 + Math.random() * 0.3
      };
    });
  },
  
  calculateCoMovementScore(targetSymbol, coMovementPairs) {
    const relevantPairs = coMovementPairs.filter(pair => 
      pair.pair.includes(targetSymbol)
    );
    
    if (relevantPairs.length === 0) return 0;
    
    const avgCorrelation = relevantPairs.reduce((sum, pair) => 
      sum + pair.correlation, 0
    ) / relevantPairs.length;
    
    const pairCount = relevantPairs.length;
    
    return Math.min(100, (avgCorrelation * 60) + (pairCount * 8));
  },
  
  generateCoMovementRecommendations(stockData, coMovementPairs) {
    const recommendations = [];
    const targetSymbol = stockData.symbol;
    
    const relevantPairs = coMovementPairs.filter(pair => 
      pair.pair.includes(targetSymbol)
    );
    
    if (relevantPairs.length === 0) {
      recommendations.push("동반 상승 종목이 발견되지 않아 독립적인 움직임을 보입니다.");
      return recommendations;
    }
    
    const strongestPair = relevantPairs[0];
    const partner = strongestPair.pair.find(s => s !== targetSymbol);
    
    recommendations.push(`${partner}와 강한 동반 상승 관계 (상관계수: ${strongestPair.correlation.toFixed(3)})`);
    
    if (strongestPair.synchronicity > 0.7) {
      recommendations.push("높은 동조성으로 포트폴리오 분산 효과가 제한적일 수 있습니다.");
    }
    
    return recommendations;
  }
};

// 에너지/소재 ↔ 생산 단가 영향 프레임
export const energyMaterialCostImpactFrame = {
  name: "에너지/소재 ↔ 생산 단가 영향",
  description: "원유, 전력, 원자재 가격 변동이 기업의 생산 단가와 수익성에 미치는 영향 분석",
  category: "correlation",
  
  async analyze(stockData, commodityData, energyData) {
    try {
      // 원자재 의존도 분석
      const materialDependency = this.analyzeMaterialDependency(stockData);
      
      // 에너지 비용 민감도 분석
      const energySensitivity = this.analyzeEnergySensitivity(stockData, energyData);
      
      // 생산 단가 영향도 계산
      const costImpact = this.calculateCostImpact(
        materialDependency, 
        energySensitivity, 
        commodityData
      );
      
      // 수익성 시나리오 분석
      const profitabilityScenarios = this.analyzeProfitabilityScenarios(
        stockData, 
        costImpact
      );
      
      return {
        score: this.calculateCostImpactScore(costImpact),
        materialDependency,
        energySensitivity,
        costImpact,
        profitabilityScenarios,
        hedgingRecommendations: this.generateHedgingRecommendations(costImpact)
      };
    } catch (error) {
      console.error('Energy-Material Cost Impact Frame Error:', error);
      return { score: 0, error: error.message };
    }
  },
  
  analyzeMaterialDependency(stockData) {
    // 업종별 주요 원자재 의존도 매핑
    const industryMaterials = {
      'semiconductor': ['silicon', 'rare_earth', 'copper'],
      'automotive': ['steel', 'aluminum', 'lithium'],
      'construction': ['steel', 'cement', 'copper'],
      'chemical': ['crude_oil', 'natural_gas', 'ethylene']
    };
    
    const industry = this.identifyIndustry(stockData);
    const materials = industryMaterials[industry] || [];
    
    return materials.map(material => ({
      material,
      dependencyLevel: this.calculateMaterialDependency(stockData, material),
      costSensitivity: this.calculateCostSensitivity(material),
      substitutability: this.assessSubstitutability(material)
    }));
  },
  
  identifyIndustry(stockData) {
    const businessDescription = stockData.businessDescription || '';
    
    if (businessDescription.includes('반도체') || businessDescription.includes('semiconductor')) {
      return 'semiconductor';
    }
    if (businessDescription.includes('자동차') || businessDescription.includes('automotive')) {
      return 'automotive';
    }
    if (businessDescription.includes('건설') || businessDescription.includes('construction')) {
      return 'construction';
    }
    if (businessDescription.includes('화학') || businessDescription.includes('chemical')) {
      return 'chemical';
    }
    
    return 'general';
  },
  
  calculateMaterialDependency(stockData, material) {
    // 실제로는 재무제표의 원재료비, 매출 구성 등을 분석
    const dependencyMap = {
      'silicon': 0.3,
      'steel': 0.4,
      'crude_oil': 0.5,
      'copper': 0.25,
      'lithium': 0.35
    };
    
    return dependencyMap[material] || 0.1;
  },
  
  calculateCostSensitivity(material) {
    // 원자재별 가격 변동성과 대체재 가용성 고려
    const sensitivityMap = {
      'crude_oil': 0.8,
      'natural_gas': 0.7,
      'steel': 0.6,
      'copper': 0.65,
      'lithium': 0.9,
      'rare_earth': 0.85
    };
    
    return sensitivityMap[material] || 0.5;
  },
  
  assessSubstitutability(material) {
    const substitutabilityMap = {
      'crude_oil': 0.3,
      'steel': 0.6,
      'aluminum': 0.7,
      'copper': 0.4,
      'lithium': 0.2,
      'rare_earth': 0.1
    };
    
    return substitutabilityMap[material] || 0.5;
  },
  
  analyzeEnergySensitivity(stockData, energyData) {
    // 에너지 집약도 분석
    const energyIntensity = this.calculateEnergyIntensity(stockData);
    
    // 전력 비용 민감도
    const electricitySensitivity = this.calculateElectricitySensitivity(stockData);
    
    // 에너지 비용 비중
    const energyCostRatio = this.calculateEnergyCostRatio(stockData);
    
    return {
      energyIntensity,
      electricitySensitivity,
      energyCostRatio,
      totalEnergyExposure: this.calculateTotalEnergyExposure(
        energyIntensity, 
        electricitySensitivity, 
        energyCostRatio
      )
    };
  },
  
  calculateEnergyIntensity(stockData) {
    // 업종별 에너지 집약도
    const industryIntensity = {
      'steel': 0.9,
      'aluminum': 0.95,
      'chemical': 0.8,
      'semiconductor': 0.7,
      'automotive': 0.5
    };
    
    const industry = this.identifyIndustry(stockData);
    return industryIntensity[industry] || 0.3;
  },
  
  calculateElectricitySensitivity(stockData) {
    // 전력 의존도가 높은 업종 식별
    const highElectricityIndustries = ['semiconductor', 'data_center', 'aluminum'];
    const industry = this.identifyIndustry(stockData);
    
    return highElectricityIndustries.includes(industry) ? 0.8 : 0.4;
  },
  
  calculateEnergyCostRatio(stockData) {
    // 매출 대비 에너지 비용 비중 (실제로는 재무제표 분석)
    const industry = this.identifyIndustry(stockData);
    const energyCostRatios = {
      'steel': 0.15,
      'chemical': 0.12,
      'semiconductor': 0.08,
      'automotive': 0.06,
      'general': 0.04
    };
    
    return energyCostRatios[industry] || 0.04;
  },
  
  calculateTotalEnergyExposure(intensity, sensitivity, costRatio) {
    return (intensity * 0.4) + (sensitivity * 0.3) + (costRatio * 0.3);
  },
  
  calculateCostImpact(materialDependency, energySensitivity, commodityData) {
    const materialImpact = materialDependency.reduce((total, dep) => {
      const priceChange = commodityData[dep.material]?.priceChange || 0;
      return total + (dep.dependencyLevel * dep.costSensitivity * priceChange);
    }, 0);
    
    const energyImpact = energySensitivity.totalEnergyExposure * 
                        (commodityData.energy?.priceChange || 0);
    
    return {
      materialImpact,
      energyImpact,
      totalImpact: materialImpact + energyImpact,
      impactOnMargin: this.calculateMarginImpact(materialImpact + energyImpact)
    };
  },
  
  calculateMarginImpact(totalImpact) {
    // 비용 증가가 마진에 미치는 영향 (가격 전가 능력 고려)
    const pricingPower = 0.6; // 60%의 가격 전가 능력 가정
    const netImpact = totalImpact * (1 - pricingPower);
    
    return {
      grossMarginImpact: netImpact,
      operatingMarginImpact: netImpact * 1.2, // 운영 레버리지 고려
      netMarginImpact: netImpact * 1.1
    };
  },
  
  analyzeProfitabilityScenarios(stockData, costImpact) {
    const baseMargin = stockData.profitMargin || 0.1;
    
    const scenarios = [
      { name: '낙관적', costMultiplier: 0.5 },
      { name: '기본', costMultiplier: 1.0 },
      { name: '비관적', costMultiplier: 1.5 }
    ];
    
    return scenarios.map(scenario => {
      const adjustedImpact = costImpact.totalImpact * scenario.costMultiplier;
      const newMargin = baseMargin - adjustedImpact;
      
      return {
        scenario: scenario.name,
        originalMargin: baseMargin,
        costImpact: adjustedImpact,
        newMargin,
        marginChange: newMargin - baseMargin,
        profitabilityRisk: this.assessProfitabilityRisk(newMargin, baseMargin)
      };
    });
  },
  
  assessProfitabilityRisk(newMargin, baseMargin) {
    const marginDecline = (baseMargin - newMargin) / baseMargin;
    
    if (marginDecline > 0.3) return '높음';
    if (marginDecline > 0.15) return '중간';
    if (marginDecline > 0.05) return '낮음';
    return '미미';
  },
  
  calculateCostImpactScore(costImpact) {
    const impactLevel = Math.abs(costImpact.totalImpact);
    
    if (impactLevel < 0.02) return 85; // 영향 미미
    if (impactLevel < 0.05) return 70; // 영향 보통
    if (impactLevel < 0.1) return 50;  // 영향 큼
    return 30; // 영향 매우 큼
  },
  
  generateHedgingRecommendations(costImpact) {
    const recommendations = [];
    
    if (Math.abs(costImpact.materialImpact) > 0.03) {
      recommendations.push("원자재 가격 변동 리스크가 높아 선물 헤징 검토 필요");
    }
    
    if (Math.abs(costImpact.energyImpact) > 0.03) {
      recommendations.push("에너지 비용 변동 리스크가 높아 에너지 효율 개선 또는 헤징 전략 필요");
    }
    
    if (costImpact.totalImpact > 0.05) {
      recommendations.push("비용 상승 압력이 높아 가격 인상이나 비용 절감 전략 시급");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("현재 원자재/에너지 비용 리스크는 관리 가능한 수준");
    }
    
    return recommendations;
  }
};

// 환율 민감 종목 스코어링 프레임
export const exchangeRateSensitivityFrame = {
  name: "환율 민감 종목 스코어링",
  description: "환율 변동이 수출입 기업의 실적에 미치는 영향을 분석하고 민감도를 점수화",
  category: "correlation",
  
  async analyze(stockData, exchangeRateData, tradeData) {
    try {
      // 수출/수입 의존도 분석
      const tradeDependency = this.analyzeTradeExposure(stockData, tradeData);
      
      // 환율 민감도 계산
      const exchangeSensitivity = this.calculateExchangeSensitivity(
        stockData, 
        exchangeRateData,
        tradeDependency
      );
      
      // 헤징 현황 분석
      const hedgingStatus = this.analyzeHedgingStatus(stockData);
      
      // 경쟁력 영향 분석
      const competitivenessImpact = this.analyzeCompetitivenessImpact(
        exchangeRateData, 
        tradeDependency
      );
      
      return {
        score: this.calculateExchangeRateScore(exchangeSensitivity, hedgingStatus),
        tradeDependency,
        exchangeSensitivity,
        hedgingStatus,
        competitivenessImpact,
        optimalExchangeRate: this.calculateOptimalExchangeRate(tradeDependency),
        riskMitigation: this.generateRiskMitigationStrategy(exchangeSensitivity)
      };
    } catch (error) {
      console.error('Exchange Rate Sensitivity Frame Error:', error);
      return { score: 0, error: error.message };
    }
  },
  
  analyzeTradeExposure(stockData, tradeData) {
    // 매출의 수출 비중
    const exportRatio = this.calculateExportRatio(stockData);
    
    // 원가의 수입 비중
    const importRatio = this.calculateImportRatio(stockData);
    
    // 주요 거래 통화
    const majorCurrencies = this.identifyMajorCurrencies(stockData);
    
    // 지역별 매출 분포
    const regionalSales = this.analyzeRegionalSales(stockData);
    
    return {
      exportRatio,
      importRatio,
      netExposure: exportRatio - importRatio,
      majorCurrencies,
      regionalSales,
      tradeBalance: this.calculateTradeBalance(exportRatio, importRatio)
    };
  },
  
  calculateExportRatio(stockData) {
    // 실제로는 재무제표에서 해외매출 비중 추출
    const industry = this.identifyIndustry(stockData);
    const exportRatios = {
      'semiconductor': 0.8,
      'automotive': 0.6,
      'shipbuilding': 0.9,
      'steel': 0.4,
      'chemical': 0.5,
      'general': 0.2
    };
    
    return exportRatios[industry] || 0.2;
  },
  
  calculateImportRatio(stockData) {
    // 원재료 수입 의존도
    const industry = this.identifyIndustry(stockData);
    const importRatios = {
      'semiconductor': 0.6,
      'automotive': 0.4,
      'chemical': 0.7,
      'steel': 0.8,
      'general': 0.3
    };
    
    return importRatios[industry] || 0.3;
  },
  
  identifyMajorCurrencies(stockData) {
    // 업종별 주요 거래 통화
    const industry = this.identifyIndustry(stockData);
    const currencyMap = {
      'semiconductor': ['USD', 'CNY', 'EUR'],
      'automotive': ['USD', 'EUR', 'CNY'],
      'shipbuilding': ['USD', 'EUR'],
      'steel': ['USD', 'CNY'],
      'general': ['USD']
    };
    
    return currencyMap[industry] || ['USD'];
  },
  
  analyzeRegionalSales(stockData) {
    // 지역별 매출 분포 (실제로는 사업보고서에서 추출)
    const industry = this.identifyIndustry(stockData);
    const defaultDistribution = {
      'Korea': 0.4,
      'USA': 0.3,
      'China': 0.2,
      'Europe': 0.1
    };
    
    // 업종별 특성 반영
    if (industry === 'semiconductor') {
      return {
        'Korea': 0.2,
        'USA': 0.4,
        'China': 0.3,
        'Europe': 0.1
      };
    }
    
    return defaultDistribution;
  },
  
  calculateTradeBalance(exportRatio, importRatio) {
    const netExposure = exportRatio - importRatio;
    
    if (netExposure > 0.3) return '수출 초과';
    if (netExposure < -0.3) return '수입 초과';
    return '균형';
  },
  
  calculateExchangeSensitivity(stockData, exchangeRateData, tradeDependency) {
    const sensitivities = {};
    
    tradeDependency.majorCurrencies.forEach(currency => {
      const rate = exchangeRateData[currency] || {};
      const volatility = this.calculateExchangeVolatility(rate);
      
      sensitivities[currency] = {
        currentRate: rate.current || 1,
        volatility,
        exportSensitivity: this.calculateExportSensitivity(
          tradeDependency.exportRatio, 
          currency,
          tradeDependency.regionalSales
        ),
        importSensitivity: this.calculateImportSensitivity(
          tradeDependency.importRatio, 
          currency
        ),
        netSensitivity: 0
      };
      
      sensitivities[currency].netSensitivity = 
        sensitivities[currency].exportSensitivity - 
        sensitivities[currency].importSensitivity;
    });
    
    return sensitivities;
  },
  
  calculateExchangeVolatility(rateData) {
    if (!rateData.history || rateData.history.length < 30) return 0.1;
    
    const returns = [];
    for (let i = 1; i < rateData.history.length; i++) {
      const ret = (rateData.history[i] - rateData.history[i-1]) / rateData.history[i-1];
      returns.push(ret);
    }
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance * 252); // 연율화
  },
  
  calculateExportSensitivity(exportRatio, currency, regionalSales) {
    const regionCurrencyMap = {
      'USA': 'USD',
      'Europe': 'EUR',
      'China': 'CNY',
      'Japan': 'JPY'
    };
    
    let exposureRatio = 0;
    Object.entries(regionalSales).forEach(([region, ratio]) => {
      if (regionCurrencyMap[region] === currency) {
        exposureRatio += ratio;
      }
    });
    
    return exportRatio * exposureRatio;
  },
  
  calculateImportSensitivity(importRatio, currency) {
    // 주요 수입 통화별 비중 (단순화)
    const importCurrencyRatio = {
      'USD': 0.6,
      'CNY': 0.3,
      'EUR': 0.1
    };
    
    return importRatio * (importCurrencyRatio[currency] || 0.1);
  },
  
  analyzeHedgingStatus(stockData) {
    // 실제로는 재무제표 주석에서 파생상품 정보 추출
    const industry = this.identifyIndustry(stockData);
    
    // 업종별 일반적인 헤징 비율
    const typicalHedgingRatios = {
      'semiconductor': 0.7,
      'automotive': 0.6,
      'shipbuilding': 0.8,
      'steel': 0.4,
      'general': 0.3
    };
    
    const hedgingRatio = typicalHedgingRatios[industry] || 0.3;
    
    return {
      hedgingRatio,
      hedgingMethods: this.identifyHedgingMethods(industry),
      hedgingEffectiveness: this.assessHedgingEffectiveness(hedgingRatio),
      unhedgedExposure: 1 - hedgingRatio
    };
  },
  
  identifyHedgingMethods(industry) {
    const methodMap = {
      'semiconductor': ['선물환', '옵션', '통화스왑'],
      'automotive': ['선물환', '통화스왑'],
      'general': ['선물환']
    };
    
    return methodMap[industry] || ['선물환'];
  },
  
  assessHedgingEffectiveness(hedgingRatio) {
    if (hedgingRatio > 0.7) return '높음';
    if (hedgingRatio > 0.5) return '보통';
    if (hedgingRatio > 0.3) return '낮음';
    return '미흡';
  },
  
  analyzeCompetitivenessImpact(exchangeRateData, tradeDependency) {
    const impacts = {};
    
    Object.entries(exchangeRateData).forEach(([currency, data]) => {
      const currentRate = data.current || 1;
      const historicalAvg = data.average || currentRate;
      const rateDeviation = (currentRate - historicalAvg) / historicalAvg;
      
      impacts[currency] = {
        priceCompetitiveness: this.calculatePriceCompetitiveness(
          rateDeviation, 
          tradeDependency.exportRatio
        ),
        costCompetitiveness: this.calculateCostCompetitiveness(
          rateDeviation, 
          tradeDependency.importRatio
        ),
        marketShareImpact: this.estimateMarketShareImpact(rateDeviation)
      };
    });
    
    return impacts;
  },
  
  calculatePriceCompetitiveness(rateDeviation, exportRatio) {
    // 원화 약세(-) = 수출 경쟁력 향상(+)
    const competitivenessChange = -rateDeviation * exportRatio;
    
    if (competitivenessChange > 0.05) return '크게 개선';
    if (competitivenessChange > 0.02) return '개선';
    if (competitivenessChange > -0.02) return '보통';
    if (competitivenessChange > -0.05) return '악화';
    return '크게 악화';
  },
  
  calculateCostCompetitiveness(rateDeviation, importRatio) {
    // 원화 약세(-) = 수입 비용 증가(-)
    const costChange = rateDeviation * importRatio;
    
    if (costChange > 0.05) return '크게 악화';
    if (costChange > 0.02) return '악화';
    if (costChange > -0.02) return '보통';
    if (costChange > -0.05) return '개선';
    return '크게 개선';
  },
  
  estimateMarketShareImpact(rateDeviation) {
    // 환율 변동이 시장 점유율에 미치는 영향 추정
    const elasticity = 1.5; // 환율-수출 탄력성
    const shareImpact = -rateDeviation * elasticity;
    
    return {
      percentageChange: shareImpact,
      direction: shareImpact > 0 ? '증가' : '감소',
      magnitude: Math.abs(shareImpact) > 0.1 ? '큰 영향' : '보통 영향'
    };
  },
  
  calculateOptimalExchangeRate(tradeDependency) {
    // 수출입 균형점을 고려한 최적 환율 추정
    const exportWeight = tradeDependency.exportRatio;
    const importWeight = tradeDependency.importRatio;
    
    if (exportWeight > importWeight) {
      return {
        direction: '원화 약세',
        optimalRange: '1,200-1,300원/달러',
        reasoning: '수출 비중이 높아 원화 약세가 유리'
      };
    } else if (importWeight > exportWeight) {
      return {
        direction: '원화 강세',
        optimalRange: '1,000-1,100원/달러',
        reasoning: '수입 비중이 높아 원화 강세가 유리'
      };
    } else {
      return {
        direction: '현재 수준 유지',
        optimalRange: '1,100-1,200원/달러',
        reasoning: '수출입 균형으로 안정적인 환율이 유리'
      };
    }
  },
  
  calculateExchangeRateScore(exchangeSensitivity, hedgingStatus) {
    // 환율 민감도가 낮고 헤징이 잘 되어 있을수록 높은 점수
    const totalSensitivity = Object.values(exchangeSensitivity)
      .reduce((sum, curr) => sum + Math.abs(curr.netSensitivity), 0);
    
    const sensitivityScore = Math.max(0, 100 - (totalSensitivity * 200));
    const hedgingScore = hedgingStatus.hedgingRatio * 50;
    
    return Math.min(100, sensitivityScore + hedgingScore);
  },
  
  generateRiskMitigationStrategy(exchangeSensitivity) {
    const strategies = [];
    
    Object.entries(exchangeSensitivity).forEach(([currency, sensitivity]) => {
      if (Math.abs(sensitivity.netSensitivity) > 0.2) {
        if (sensitivity.netSensitivity > 0) {
          strategies.push(`${currency} 약세 리스크 대비 헤징 강화 필요`);
        } else {
          strategies.push(`${currency} 강세 리스크 대비 자연 헤징 또는 파생상품 활용`);
        }
      }
    });
    
    if (strategies.length === 0) {
      strategies.push("현재 환율 리스크는 관리 가능한 수준");
    }
    
    return strategies;
  }
};

export const correlationFrames = {
  policyIndustryStockNetworkFrame,
  coMovementCorrelationFrame,
  energyMaterialCostImpactFrame,
  exchangeRateSensitivityFrame
}; 