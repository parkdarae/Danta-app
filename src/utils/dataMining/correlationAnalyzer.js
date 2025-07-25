/**
 * 주식 데이터 마이닝 프레임북 - 상관/인과분석 모듈
 * 엔티티 간 관계 분석, 네트워크 그래프 구성, 영향도 분석
 */

// 분석 타입 정의
export const ANALYSIS_TYPES = {
  PEARSON: 'pearson',
  SPEARMAN: 'spearman',
  MUTUAL_INFO: 'mutual_info',
  CHI_SQUARE: 'chi_square',
  CAUSALITY: 'causality'
};

// 엔티티 타입 정의
export const ENTITY_TYPES = {
  STOCK: 'stock',
  SECTOR: 'sector',
  POLICY: 'policy',
  NEWS_EVENT: 'news_event',
  THEME: 'theme',
  INDICATOR: 'indicator'
};

/**
 * 상관관계 분석기
 */
export class CorrelationAnalyzer {
  constructor() {
    this.correlationMatrix = new Map();
    this.analysisHistory = [];
    this.significanceLevel = 0.05;
  }

  // 피어슨 상관계수 계산
  calculatePearsonCorrelation(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length) {
      throw new Error('입력 데이터가 유효하지 않습니다.');
    }

    const n = x.length;
    if (n < 2) return { coefficient: 0, pValue: 1, significance: false };

    // 평균 계산
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;

    // 공분산과 표준편차 계산
    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;

    for (let i = 0; i < n; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      
      numerator += deltaX * deltaY;
      sumXSquared += deltaX * deltaX;
      sumYSquared += deltaY * deltaY;
    }

    const denominator = Math.sqrt(sumXSquared * sumYSquared);
    const correlation = denominator === 0 ? 0 : numerator / denominator;

    // t-검정을 통한 유의성 검정
    const tStat = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
    const pValue = this.calculatePValue(tStat, n - 2);

    return {
      coefficient: correlation,
      pValue: pValue,
      significance: pValue < this.significanceLevel,
      sampleSize: n,
      interpretation: this.interpretCorrelation(correlation)
    };
  }

  // 스피어만 순위 상관계수 계산
  calculateSpearmanCorrelation(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length) {
      throw new Error('입력 데이터가 유효하지 않습니다.');
    }

    // 순위 변환
    const rankX = this.convertToRanks(x);
    const rankY = this.convertToRanks(y);

    // 피어슨 상관계수로 순위 데이터 분석
    return this.calculatePearsonCorrelation(rankX, rankY);
  }

  // 순위 변환 함수
  convertToRanks(data) {
    const indexed = data.map((value, index) => ({ value, index }));
    indexed.sort((a, b) => a.value - b.value);

    const ranks = new Array(data.length);
    let currentRank = 1;

    for (let i = 0; i < indexed.length; i++) {
      if (i > 0 && indexed[i].value === indexed[i - 1].value) {
        // 동점 처리 (평균 순위)
        const startTie = i - 1;
        while (i < indexed.length && indexed[i].value === indexed[startTie].value) {
          i++;
        }
        const avgRank = (currentRank + currentRank + (i - startTie) - 1) / 2;
        
        for (let j = startTie; j < i; j++) {
          ranks[indexed[j].index] = avgRank;
        }
        currentRank += (i - startTie);
        i--; // for문에서 증가하므로 보정
      } else {
        ranks[indexed[i].index] = currentRank++;
      }
    }

    return ranks;
  }

  // 상호정보량 계산 (범주형 데이터용)
  calculateMutualInformation(x, y, bins = 10) {
    // 연속형 데이터를 구간으로 분할
    const xBinned = this.binData(x, bins);
    const yBinned = this.binData(y, bins);

    // 빈도 계산
    const jointFreq = this.calculateJointFrequency(xBinned, yBinned);
    const xFreq = this.calculateFrequency(xBinned);
    const yFreq = this.calculateFrequency(yBinned);

    let mutualInfo = 0;
    const n = x.length;

    Object.keys(jointFreq).forEach(xyKey => {
      const [xVal, yVal] = xyKey.split(',');
      const pXY = jointFreq[xyKey] / n;
      const pX = xFreq[xVal] / n;
      const pY = yFreq[yVal] / n;

      if (pXY > 0 && pX > 0 && pY > 0) {
        mutualInfo += pXY * Math.log2(pXY / (pX * pY));
      }
    });

    return {
      mutualInformation: mutualInfo,
      normalizedMI: this.normalizeMutualInformation(mutualInfo, xFreq, yFreq, n),
      interpretation: this.interpretMutualInformation(mutualInfo)
    };
  }

  // 데이터 구간화
  binData(data, bins) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins;

    return data.map(val => {
      const bin = Math.floor((val - min) / binWidth);
      return Math.min(bin, bins - 1); // 마지막 구간 처리
    });
  }

  // 결합 빈도 계산
  calculateJointFrequency(x, y) {
    const freq = {};
    for (let i = 0; i < x.length; i++) {
      const key = `${x[i]},${y[i]}`;
      freq[key] = (freq[key] || 0) + 1;
    }
    return freq;
  }

  // 빈도 계산
  calculateFrequency(data) {
    const freq = {};
    data.forEach(val => {
      freq[val] = (freq[val] || 0) + 1;
    });
    return freq;
  }

  // p-value 근사 계산 (t-분포)
  calculatePValue(tStat, df) {
    // 간단한 근사식 사용
    const absTStat = Math.abs(tStat);
    if (absTStat > 3) return 0.001;
    if (absTStat > 2.5) return 0.01;
    if (absTStat > 2) return 0.05;
    if (absTStat > 1.5) return 0.1;
    return 0.2;
  }

  // 상관계수 해석
  interpretCorrelation(correlation) {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return '매우 강한 상관관계';
    if (abs >= 0.6) return '강한 상관관계';
    if (abs >= 0.4) return '중간 상관관계';
    if (abs >= 0.2) return '약한 상관관계';
    return '상관관계 없음';
  }

  // 상호정보량 해석
  interpretMutualInformation(mi) {
    if (mi > 1.5) return '매우 강한 의존성';
    if (mi > 1.0) return '강한 의존성';
    if (mi > 0.5) return '중간 의존성';
    if (mi > 0.1) return '약한 의존성';
    return '독립적';
  }

  // 상호정보량 정규화
  normalizeMutualInformation(mi, xFreq, yFreq, n) {
    const hX = this.calculateEntropy(Object.values(xFreq), n);
    const hY = this.calculateEntropy(Object.values(yFreq), n);
    const maxEntropy = Math.min(hX, hY);
    return maxEntropy > 0 ? mi / maxEntropy : 0;
  }

  // 엔트로피 계산
  calculateEntropy(frequencies, total) {
    let entropy = 0;
    frequencies.forEach(freq => {
      if (freq > 0) {
        const p = freq / total;
        entropy -= p * Math.log2(p);
      }
    });
    return entropy;
  }
}

/**
 * 네트워크 분석기
 */
export class NetworkAnalyzer {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.networkMetrics = {};
  }

  // 노드 추가
  addNode(id, data) {
    this.nodes.set(id, {
      id,
      type: data.type || ENTITY_TYPES.STOCK,
      attributes: data.attributes || {},
      metadata: data.metadata || {},
      createdAt: new Date().toISOString()
    });
  }

  // 엣지 추가 (관계)
  addEdge(fromId, toId, relationship) {
    const edgeId = `${fromId}-${toId}`;
    this.edges.set(edgeId, {
      id: edgeId,
      from: fromId,
      to: toId,
      type: relationship.type,
      weight: relationship.weight || 1,
      strength: relationship.strength || 0,
      direction: relationship.direction || 'undirected',
      metadata: relationship.metadata || {},
      createdAt: new Date().toISOString()
    });
  }

  // 중심성 분석
  calculateCentrality() {
    const centrality = {
      degree: this.calculateDegreeCentrality(),
      betweenness: this.calculateBetweennessCentrality(),
      closeness: this.calculateClosenessCentrality(),
      eigenvector: this.calculateEigenvectorCentrality()
    };

    this.networkMetrics.centrality = centrality;
    return centrality;
  }

  // 연결 중심성 계산
  calculateDegreeCentrality() {
    const degree = {};
    
    this.nodes.forEach((node, nodeId) => {
      degree[nodeId] = 0;
    });

    this.edges.forEach(edge => {
      degree[edge.from] = (degree[edge.from] || 0) + 1;
      if (edge.direction === 'undirected') {
        degree[edge.to] = (degree[edge.to] || 0) + 1;
      }
    });

    // 정규화
    const maxDegree = Math.max(...Object.values(degree));
    Object.keys(degree).forEach(nodeId => {
      degree[nodeId] = maxDegree > 0 ? degree[nodeId] / maxDegree : 0;
    });

    return degree;
  }

  // 매개 중심성 계산 (간단한 근사)
  calculateBetweennessCentrality() {
    const betweenness = {};
    
    this.nodes.forEach((node, nodeId) => {
      betweenness[nodeId] = 0;
    });

    // 간단한 근사: 각 노드가 얼마나 많은 경로의 중간에 위치하는지
    this.nodes.forEach((node, nodeId) => {
      const neighbors = this.getNeighbors(nodeId);
      let pathCount = 0;

      neighbors.forEach(neighbor1 => {
        neighbors.forEach(neighbor2 => {
          if (neighbor1 !== neighbor2) {
            // neighbor1과 neighbor2 사이의 경로에서 현재 노드가 중간에 위치
            if (!this.isDirectlyConnected(neighbor1, neighbor2)) {
              pathCount++;
            }
          }
        });
      });

      betweenness[nodeId] = pathCount;
    });

    // 정규화
    const maxBetweenness = Math.max(...Object.values(betweenness));
    Object.keys(betweenness).forEach(nodeId => {
      betweenness[nodeId] = maxBetweenness > 0 ? betweenness[nodeId] / maxBetweenness : 0;
    });

    return betweenness;
  }

  // 근접 중심성 계산
  calculateClosenessCentrality() {
    const closeness = {};
    
    this.nodes.forEach((node, nodeId) => {
      const distances = this.calculateShortestPaths(nodeId);
      const totalDistance = Object.values(distances).reduce((sum, dist) => sum + dist, 0);
      closeness[nodeId] = totalDistance > 0 ? 1 / totalDistance : 0;
    });

    return closeness;
  }

  // 고유벡터 중심성 계산 (간단한 반복법)
  calculateEigenvectorCentrality(iterations = 10) {
    const centrality = {};
    
    // 초기화
    this.nodes.forEach((node, nodeId) => {
      centrality[nodeId] = 1;
    });

    // 반복 계산
    for (let iter = 0; iter < iterations; iter++) {
      const newCentrality = {};
      
      this.nodes.forEach((node, nodeId) => {
        newCentrality[nodeId] = 0;
        const neighbors = this.getNeighbors(nodeId);
        neighbors.forEach(neighborId => {
          newCentrality[nodeId] += centrality[neighborId];
        });
      });

      // 정규화
      const norm = Math.sqrt(Object.values(newCentrality).reduce((sum, val) => sum + val * val, 0));
      if (norm > 0) {
        Object.keys(newCentrality).forEach(nodeId => {
          centrality[nodeId] = newCentrality[nodeId] / norm;
        });
      }
    }

    return centrality;
  }

  // 이웃 노드 찾기
  getNeighbors(nodeId) {
    const neighbors = [];
    
    this.edges.forEach(edge => {
      if (edge.from === nodeId) {
        neighbors.push(edge.to);
      } else if (edge.to === nodeId && edge.direction === 'undirected') {
        neighbors.push(edge.from);
      }
    });

    return neighbors;
  }

  // 직접 연결 확인
  isDirectlyConnected(node1, node2) {
    const edgeId1 = `${node1}-${node2}`;
    const edgeId2 = `${node2}-${node1}`;
    return this.edges.has(edgeId1) || this.edges.has(edgeId2);
  }

  // 최단 경로 계산 (BFS)
  calculateShortestPaths(startNode) {
    const distances = {};
    const queue = [startNode];
    
    this.nodes.forEach((node, nodeId) => {
      distances[nodeId] = nodeId === startNode ? 0 : Infinity;
    });

    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = this.getNeighbors(current);

      neighbors.forEach(neighbor => {
        const newDistance = distances[current] + 1;
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          queue.push(neighbor);
        }
      });
    }

    return distances;
  }

  // 커뮤니티 탐지 (간단한 모듈성 기반)
  detectCommunities() {
    const communities = [];
    const visited = new Set();

    this.nodes.forEach((node, nodeId) => {
      if (!visited.has(nodeId)) {
        const community = this.expandCommunity(nodeId, visited);
        if (community.length > 1) {
          communities.push(community);
        }
      }
    });

    return communities;
  }

  // 커뮤니티 확장
  expandCommunity(startNode, visited) {
    const community = [startNode];
    const queue = [startNode];
    visited.add(startNode);

    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = this.getNeighbors(current);

      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          // 연결 강도 기반 커뮤니티 결정
          const edgeWeight = this.getEdgeWeight(current, neighbor);
          if (edgeWeight > 0.5) { // 임계값
            community.push(neighbor);
            queue.push(neighbor);
            visited.add(neighbor);
          }
        }
      });
    }

    return community;
  }

  // 엣지 가중치 조회
  getEdgeWeight(from, to) {
    const edgeId1 = `${from}-${to}`;
    const edgeId2 = `${to}-${from}`;
    
    const edge = this.edges.get(edgeId1) || this.edges.get(edgeId2);
    return edge ? edge.weight : 0;
  }

  // 네트워크 시각화 데이터 생성
  generateVisualizationData() {
    const nodes = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      label: node.attributes.name || node.id,
      type: node.type,
      size: (this.networkMetrics.centrality?.degree?.[node.id] || 0) * 50 + 10,
      color: this.getNodeColor(node.type)
    }));

    const edges = Array.from(this.edges.values()).map(edge => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      label: edge.type,
      width: edge.weight * 5,
      color: this.getEdgeColor(edge.type)
    }));

    return { nodes, edges };
  }

  // 노드 색상 결정
  getNodeColor(type) {
    const colors = {
      [ENTITY_TYPES.STOCK]: '#4285f4',
      [ENTITY_TYPES.SECTOR]: '#ea4335',
      [ENTITY_TYPES.POLICY]: '#fbbc04',
      [ENTITY_TYPES.NEWS_EVENT]: '#34a853',
      [ENTITY_TYPES.THEME]: '#9aa0a6',
      [ENTITY_TYPES.INDICATOR]: '#ff6d01'
    };
    return colors[type] || '#757575';
  }

  // 엣지 색상 결정
  getEdgeColor(type) {
    const colors = {
      correlation: '#4285f4',
      causation: '#ea4335',
      similarity: '#34a853',
      influence: '#fbbc04'
    };
    return colors[type] || '#9aa0a6';
  }
}

/**
 * 인과관계 분석기
 */
export class CausalityAnalyzer {
  constructor() {
    this.correlationMatrix = {};
    this.networkGraph = {};
  }

  // 정책↔산업↔종목 상호 연관성 그래프 프레임
  buildPolicyIndustryStockGraph(policyData, industryData, stockData) {
    const graph = {
      nodes: [],
      edges: [],
      layers: {
        policy: [],
        industry: [],
        stock: []
      }
    };

    // 정책 노드 추가
    policyData.forEach(policy => {
      const node = {
        id: `policy_${policy.id}`,
        type: 'policy',
        name: policy.name,
        impact: policy.impact || 0,
        keywords: policy.keywords || []
      };
      graph.nodes.push(node);
      graph.layers.policy.push(node);
    });

    // 산업 노드 추가
    industryData.forEach(industry => {
      const node = {
        id: `industry_${industry.id}`,
        type: 'industry',
        name: industry.name,
        marketCap: industry.marketCap || 0,
        sectors: industry.sectors || []
      };
      graph.nodes.push(node);
      graph.layers.industry.push(node);
    });

    // 종목 노드 추가
    stockData.forEach(stock => {
      const node = {
        id: `stock_${stock.symbol}`,
        type: 'stock',
        name: stock.name,
        symbol: stock.symbol,
        price: stock.price || 0,
        volume: stock.volume || 0
      };
      graph.nodes.push(node);
      graph.layers.stock.push(node);
    });

    // 연관성 엣지 계산 및 추가
    this.calculatePolicyIndustryRelations(graph, policyData, industryData);
    this.calculateIndustryStockRelations(graph, industryData, stockData);

    return graph;
  }

  calculatePolicyIndustryRelations(graph, policyData, industryData) {
    policyData.forEach(policy => {
      industryData.forEach(industry => {
        const correlation = this.calculateKeywordOverlap(
          policy.keywords || [],
          industry.sectors || []
        );
        
        if (correlation > 0.3) { // 임계값
          graph.edges.push({
            source: `policy_${policy.id}`,
            target: `industry_${industry.id}`,
            weight: correlation,
            type: 'policy-industry'
          });
        }
      });
    });
  }

  calculateIndustryStockRelations(graph, industryData, stockData) {
    industryData.forEach(industry => {
      stockData.forEach(stock => {
        if (stock.industry === industry.name || 
            industry.sectors.includes(stock.sector)) {
          const correlation = this.calculateIndustryStockCorrelation(industry, stock);
          
          graph.edges.push({
            source: `industry_${industry.id}`,
            target: `stock_${stock.symbol}`,
            weight: correlation,
            type: 'industry-stock'
          });
        }
      });
    });
  }

  // 동반 상승 상관 프레임
  findCoMovementPatterns(priceData, timeWindow = 30) {
    const symbols = Object.keys(priceData);
    const correlationPairs = [];

    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const symbol1 = symbols[i];
        const symbol2 = symbols[j];
        
        const correlation = this.calculatePriceCorrelation(
          priceData[symbol1],
          priceData[symbol2],
          timeWindow
        );

        if (correlation > 0.7) { // 높은 상관관계
          correlationPairs.push({
            pair: [symbol1, symbol2],
            correlation: correlation,
            strength: this.classifyCorrelationStrength(correlation),
            pattern: this.identifyMovementPattern(
              priceData[symbol1],
              priceData[symbol2]
            )
          });
        }
      }
    }

    return this.groupCorrelationClusters(correlationPairs);
  }

  calculatePriceCorrelation(prices1, prices2, window) {
    const returns1 = this.calculateReturns(prices1.slice(-window));
    const returns2 = this.calculateReturns(prices2.slice(-window));
    
    return this.pearsonCorrelation(returns1, returns2);
  }

  groupCorrelationClusters(correlationPairs) {
    const clusters = [];
    const processed = new Set();

    correlationPairs.forEach(pair => {
      const key = pair.pair.sort().join('-');
      if (!processed.has(key)) {
        const cluster = this.buildCorrelationCluster(pair, correlationPairs);
        clusters.push(cluster);
        cluster.symbols.forEach(symbol => processed.add(symbol));
      }
    });

    return clusters;
  }

  // 에너지/소재 ↔ 생산 단가 영향 프레임
  analyzeCommodityImpact(commodityPrices, stockData) {
    const impactAnalysis = {
      energyImpact: {},
      materialImpact: {},
      overallSensitivity: {}
    };

    // 에너지 가격 영향 분석
    const energySymbols = ['CL=F', 'NG=F', 'BZ=F']; // 원유, 천연가스, 브렌트
    energySymbols.forEach(energy => {
      if (commodityPrices[energy]) {
        impactAnalysis.energyImpact[energy] = this.calculateEnergyImpact(
          commodityPrices[energy],
          stockData
        );
      }
    });

    // 소재 가격 영향 분석
    const materialSymbols = ['GC=F', 'SI=F', 'HG=F', 'NI=F']; // 금, 은, 구리, 니켈
    materialSymbols.forEach(material => {
      if (commodityPrices[material]) {
        impactAnalysis.materialImpact[material] = this.calculateMaterialImpact(
          commodityPrices[material],
          stockData
        );
      }
    });

    // 전체 민감도 계산
    Object.keys(stockData).forEach(symbol => {
      impactAnalysis.overallSensitivity[symbol] = this.calculateOverallSensitivity(
        symbol,
        impactAnalysis.energyImpact,
        impactAnalysis.materialImpact
      );
    });

    return impactAnalysis;
  }

  calculateEnergyImpact(energyPrices, stockData) {
    const impact = {};
    
    Object.keys(stockData).forEach(symbol => {
      const stock = stockData[symbol];
      const correlation = this.calculatePriceCorrelation(
        energyPrices,
        stock.prices,
        60 // 60일 상관관계
      );

      const sensitivity = this.calculateEnergySensitivity(stock);
      
      impact[symbol] = {
        correlation: correlation,
        sensitivity: sensitivity,
        impactScore: Math.abs(correlation) * sensitivity,
        direction: correlation > 0 ? 'positive' : 'negative'
      };
    });

    return impact;
  }

  // 환율 민감 종목 스코어링 프레임
  calculateExchangeRateSensitivity(exchangeRates, stockData) {
    const sensitivity = {};
    
    Object.keys(stockData).forEach(symbol => {
      const stock = stockData[symbol];
      
      // USD/KRW 환율과의 상관관계
      const usdKrwCorrelation = this.calculatePriceCorrelation(
        exchangeRates['USDKRW=X'],
        stock.prices,
        90 // 90일 상관관계
      );

      // 수출 의존도 계산
      const exportDependency = this.calculateExportDependency(stock);
      
      // 해외 매출 비중
      const overseasRevenue = stock.overseasRevenue || 0;
      
      // 종합 환율 민감도 점수
      const sensitivityScore = this.calculateCompositeSensitivity(
        usdKrwCorrelation,
        exportDependency,
        overseasRevenue
      );

      sensitivity[symbol] = {
        symbol: symbol,
        name: stock.name,
        usdKrwCorrelation: usdKrwCorrelation,
        exportDependency: exportDependency,
        overseasRevenue: overseasRevenue,
        sensitivityScore: sensitivityScore,
        riskLevel: this.classifyExchangeRateRisk(sensitivityScore),
        hedgingRecommendation: this.getHedgingRecommendation(sensitivityScore)
      };
    });

    return Object.values(sensitivity).sort((a, b) => 
      Math.abs(b.sensitivityScore) - Math.abs(a.sensitivityScore)
    );
  }

  calculateExportDependency(stock) {
    // 업종별 수출 의존도 가중치
    const sectorWeights = {
      'Technology': 0.8,
      'Semiconductors': 0.9,
      'Automotive': 0.7,
      'Steel': 0.6,
      'Chemicals': 0.5,
      'Default': 0.3
    };

    return sectorWeights[stock.sector] || sectorWeights['Default'];
  }

  calculateCompositeSensitivity(correlation, exportDep, overseasRev) {
    return (Math.abs(correlation) * 0.4) + 
           (exportDep * 0.35) + 
           (overseasRev / 100 * 0.25);
  }

  classifyExchangeRateRisk(score) {
    if (score > 0.7) return 'HIGH';
    if (score > 0.4) return 'MEDIUM';
    return 'LOW';
  }

  getHedgingRecommendation(score) {
    if (score > 0.7) return '환율 헤지 필수';
    if (score > 0.4) return '환율 헤지 권장';
    return '환율 헤지 불필요';
  }

  // 유틸리티 함수들
  calculateKeywordOverlap(keywords1, keywords2) {
    const set1 = new Set(keywords1.map(k => k.toLowerCase()));
    const set2 = new Set(keywords2.map(k => k.toLowerCase()));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size; // Jaccard 유사도
  }

  calculateIndustryStockCorrelation(industry, stock) {
    // 업종 매칭도 + 시가총액 가중치 + 기타 요인
    let correlation = 0.5; // 기본값
    
    if (stock.sector === industry.name) correlation += 0.3;
    if (industry.sectors.includes(stock.sector)) correlation += 0.2;
    
    return Math.min(correlation, 1.0);
  }

  pearsonCorrelation(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;

    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  calculateReturns(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    return returns;
  }

  classifyCorrelationStrength(correlation) {
    const abs = Math.abs(correlation);
    if (abs > 0.8) return 'VERY_STRONG';
    if (abs > 0.6) return 'STRONG';
    if (abs > 0.4) return 'MODERATE';
    return 'WEAK';
  }

  identifyMovementPattern(prices1, prices2) {
    const recent1 = prices1.slice(-10);
    const recent2 = prices2.slice(-10);
    
    const trend1 = this.calculateTrend(recent1);
    const trend2 = this.calculateTrend(recent2);
    
    if (trend1 > 0 && trend2 > 0) return 'BOTH_RISING';
    if (trend1 < 0 && trend2 < 0) return 'BOTH_FALLING';
    if (trend1 > 0 && trend2 < 0) return 'DIVERGING';
    if (trend1 < 0 && trend2 > 0) return 'DIVERGING';
    return 'SIDEWAYS';
  }

  calculateTrend(prices) {
    if (prices.length < 2) return 0;
    return (prices[prices.length - 1] - prices[0]) / prices[0];
  }

  buildCorrelationCluster(seedPair, allPairs) {
    const cluster = {
      symbols: [...seedPair.pair],
      avgCorrelation: seedPair.correlation,
      pattern: seedPair.pattern,
      strength: seedPair.strength
    };

    // 클러스터에 추가할 수 있는 다른 종목들 찾기
    allPairs.forEach(pair => {
      const hasCommon = pair.pair.some(symbol => cluster.symbols.includes(symbol));
      if (hasCommon && !cluster.symbols.includes(pair.pair[0])) {
        cluster.symbols.push(pair.pair[0]);
      }
      if (hasCommon && !cluster.symbols.includes(pair.pair[1])) {
        cluster.symbols.push(pair.pair[1]);
      }
    });

    return cluster;
  }

  calculateEnergySensitivity(stock) {
    // 업종별 에너지 민감도
    const energySensitivity = {
      'Airlines': 0.9,
      'Automotive': 0.7,
      'Steel': 0.8,
      'Chemicals': 0.6,
      'Shipping': 0.8,
      'Default': 0.3
    };

    return energySensitivity[stock.sector] || energySensitivity['Default'];
  }

  calculateMaterialImpact(materialPrices, stockData) {
    const impact = {};
    
    Object.keys(stockData).forEach(symbol => {
      const stock = stockData[symbol];
      const correlation = this.calculatePriceCorrelation(
        materialPrices,
        stock.prices,
        60
      );

      const sensitivity = this.calculateMaterialSensitivity(stock);
      
      impact[symbol] = {
        correlation: correlation,
        sensitivity: sensitivity,
        impactScore: Math.abs(correlation) * sensitivity,
        direction: correlation > 0 ? 'positive' : 'negative'
      };
    });

    return impact;
  }

  calculateMaterialSensitivity(stock) {
    const materialSensitivity = {
      'Steel': 0.9,
      'Mining': 0.8,
      'Semiconductors': 0.7,
      'Electronics': 0.6,
      'Default': 0.2
    };

    return materialSensitivity[stock.sector] || materialSensitivity['Default'];
  }

  calculateOverallSensitivity(symbol, energyImpact, materialImpact) {
    let totalScore = 0;
    let count = 0;

    Object.values(energyImpact).forEach(impact => {
      if (impact[symbol]) {
        totalScore += impact[symbol].impactScore;
        count++;
      }
    });

    Object.values(materialImpact).forEach(impact => {
      if (impact[symbol]) {
        totalScore += impact[symbol].impactScore;
        count++;
      }
    });

    return count > 0 ? totalScore / count : 0;
  }
}

/**
 * 통합 관계 분석 매니저
 */
export class RelationshipAnalysisManager {
  constructor() {
    this.correlationAnalyzer = new CorrelationAnalyzer();
    this.networkAnalyzer = new NetworkAnalyzer();
    this.causalityAnalyzer = new CausalityAnalyzer();
    this.analysisResults = new Map();
  }

  // 종합 관계 분석
  async analyzeRelationships(entities, options = {}) {
    const {
      includeCorrelation = true,
      includeCausality = true,
      includeNetwork = true,
      timeWindow = 30
    } = options;

    const results = {
      timestamp: new Date().toISOString(),
      correlations: {},
      causalities: {},
      networkMetrics: {},
      insights: []
    };

    try {
      // 1. 상관관계 분석
      if (includeCorrelation) {
        console.log('📊 상관관계 분석 시작...');
        results.correlations = await this.analyzeAllCorrelations(entities);
      }

      // 2. 인과관계 분석
      if (includeCausality) {
        console.log('🔗 인과관계 분석 시작...');
        results.causalities = await this.analyzeAllCausalities(entities);
      }

      // 3. 네트워크 분석
      if (includeNetwork) {
        console.log('🕸️ 네트워크 분석 시작...');
        results.networkMetrics = await this.analyzeNetwork(entities, results.correlations);
      }

      // 4. 인사이트 생성
      results.insights = this.generateInsights(results);

      this.analysisResults.set('latest', results);
      console.log('✅ 관계 분석 완료');

      return results;

    } catch (error) {
      console.error('❌ 관계 분석 실패:', error);
      throw error;
    }
  }

  // 모든 상관관계 분석
  async analyzeAllCorrelations(entities) {
    const correlations = {};

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entity1 = entities[i];
        const entity2 = entities[j];
        
        const corrKey = `${entity1.id}-${entity2.id}`;
        
        // 수치 데이터가 있는 경우 피어슨 상관계수 계산
        if (entity1.timeSeries && entity2.timeSeries) {
          const correlation = this.correlationAnalyzer.calculatePearsonCorrelation(
            entity1.timeSeries.map(d => d.value),
            entity2.timeSeries.map(d => d.value)
          );
          
          correlations[corrKey] = {
            entities: [entity1.id, entity2.id],
            type: 'pearson',
            ...correlation
          };
        }
      }
    }

    return correlations;
  }

  // 모든 인과관계 분석
  async analyzeAllCausalities(entities) {
    const causalities = {};

    for (let i = 0; i < entities.length; i++) {
      for (let j = 0; j < entities.length; j++) {
        if (i !== j) {
          const cause = entities[i];
          const effect = entities[j];
          
          const causalKey = `${cause.id}->${effect.id}`;
          
          if (cause.timeSeries && effect.timeSeries) {
            const causality = this.causalityAnalyzer.grangerCausalityTest(
              cause.timeSeries.map(d => d.value),
              effect.timeSeries.map(d => d.value)
            );
            
            causalities[causalKey] = {
              cause: cause.id,
              effect: effect.id,
              ...causality
            };
          }
        }
      }
    }

    return causalities;
  }

  // 네트워크 분석
  async analyzeNetwork(entities, correlations) {
    // 네트워크 구성
    entities.forEach(entity => {
      this.networkAnalyzer.addNode(entity.id, {
        type: entity.type,
        attributes: entity.attributes || {}
      });
    });

    // 유의한 상관관계를 엣지로 추가
    Object.values(correlations).forEach(corr => {
      if (corr.significance && Math.abs(corr.coefficient) > 0.3) {
        this.networkAnalyzer.addEdge(corr.entities[0], corr.entities[1], {
          type: 'correlation',
          weight: Math.abs(corr.coefficient),
          strength: corr.coefficient
        });
      }
    });

    // 중심성 분석
    const centrality = this.networkAnalyzer.calculateCentrality();
    
    // 커뮤니티 탐지
    const communities = this.networkAnalyzer.detectCommunities();

    return {
      centrality,
      communities,
      visualizationData: this.networkAnalyzer.generateVisualizationData()
    };
  }

  // 인사이트 생성
  generateInsights(results) {
    const insights = [];

    // 강한 상관관계 찾기
    Object.values(results.correlations).forEach(corr => {
      if (corr.significance && Math.abs(corr.coefficient) > 0.7) {
        insights.push({
          type: 'high_correlation',
          message: `${corr.entities[0]}과 ${corr.entities[1]} 간에 ${corr.interpretation} (${(corr.coefficient * 100).toFixed(1)}%)가 발견되었습니다.`,
          importance: 'high',
          entities: corr.entities,
          metric: corr.coefficient
        });
      }
    });

    // 인과관계 발견
    Object.values(results.causalities).forEach(causal => {
      if (causal.causalityExists && causal.confidence > 0.8) {
        insights.push({
          type: 'causality_detected',
          message: `${causal.cause}가 ${causal.effect}에 인과적 영향을 미치는 것으로 분석되었습니다 (신뢰도: ${(causal.confidence * 100).toFixed(1)}%).`,
          importance: 'high',
          entities: [causal.cause, causal.effect],
          metric: causal.confidence
        });
      }
    });

    // 네트워크 중심성 분석
    if (results.networkMetrics.centrality) {
      const centralNodes = Object.entries(results.networkMetrics.centrality.degree)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      centralNodes.forEach(([nodeId, centrality]) => {
        if (centrality > 0.5) {
          insights.push({
            type: 'central_node',
            message: `${nodeId}는 네트워크에서 중심적 역할을 하는 것으로 분석되었습니다 (중심성: ${(centrality * 100).toFixed(1)}%).`,
            importance: 'medium',
            entities: [nodeId],
            metric: centrality
          });
        }
      });
    }

    // 중요도순 정렬
    return insights.sort((a, b) => {
      const importanceOrder = { high: 3, medium: 2, low: 1 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    });
  }

  // 분석 결과 조회
  getAnalysisResults(key = 'latest') {
    return this.analysisResults.get(key);
  }

  // 모든 분석 결과 조회
  getAllResults() {
    return Array.from(this.analysisResults.entries());
  }
} 

/**
 * 4. 인과 관계 분석/상관 프레임
 */

// 정책↔산업↔종목 상호 연관성 그래프
export const analyzePolicyIndustryStockGraph = async (policies, industries, stocks) => {
  try {
    const graph = {
      nodes: [],
      edges: [],
      clusters: []
    };

    // 노드 생성 (정책, 산업, 종목)
    policies.forEach(policy => {
      graph.nodes.push({
        id: `policy_${policy.id}`,
        type: 'policy',
        name: policy.name,
        keywords: policy.keywords,
        impact_score: policy.impact_score || 0
      });
    });

    industries.forEach(industry => {
      graph.nodes.push({
        id: `industry_${industry.code}`,
        type: 'industry',
        name: industry.name,
        sector: industry.sector,
        policy_relevance: calculatePolicyRelevance(industry, policies)
      });
    });

    stocks.forEach(stock => {
      graph.nodes.push({
        id: `stock_${stock.symbol}`,
        type: 'stock',
        name: stock.name,
        industry: stock.industry,
        market_cap: stock.market_cap || 0
      });
    });

    // 엣지 생성 (관계 강도 계산)
    const edges = calculateRelationshipStrength(policies, industries, stocks);
    graph.edges = edges;

    // 클러스터 분석
    const clusters = identifyPolicyIndustryClusters(graph);
    graph.clusters = clusters;

    return {
      success: true,
      graph,
      insights: generateGraphInsights(graph),
      impact_paths: findHighImpactPaths(graph)
    };
  } catch (error) {
    console.error('정책-산업-종목 그래프 분석 오류:', error);
    return { success: false, error: error.message };
  }
};

// 동반 상승 상관 프레임
export const analyzeCoMovementCorrelation = async (stockData, timeWindow = 30) => {
  try {
    const correlationMatrix = {};
    const pairs = [];
    const clusters = [];

    // 상관계수 매트릭스 계산
    for (let i = 0; i < stockData.length; i++) {
      for (let j = i + 1; j < stockData.length; j++) {
        const stock1 = stockData[i];
        const stock2 = stockData[j];
        
        const correlation = calculatePearsonCorrelation(
          stock1.price_changes,
          stock2.price_changes
        );

        const coMovement = {
          pair: `${stock1.symbol}-${stock2.symbol}`,
          correlation: correlation,
          sync_days: calculateSyncDays(stock1.price_changes, stock2.price_changes),
          volatility_match: calculateVolatilityMatch(stock1, stock2),
          sector_similarity: calculateSectorSimilarity(stock1.sector, stock2.sector)
        };

        if (Math.abs(correlation) > 0.6) {
          pairs.push(coMovement);
        }
      }
    }

    // 동반 상승 클러스터 식별
    const movementClusters = identifyMovementClusters(pairs);
    
    // 시간대별 상관관계 변화 분석
    const timeBasedCorrelation = analyzeTimeBasedCorrelation(stockData, timeWindow);

    return {
      success: true,
      correlation_matrix: correlationMatrix,
      high_correlation_pairs: pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)),
      movement_clusters: movementClusters,
      time_based_analysis: timeBasedCorrelation,
      insights: generateCoMovementInsights(pairs, movementClusters)
    };
  } catch (error) {
    console.error('동반 상승 상관 분석 오류:', error);
    return { success: false, error: error.message };
  }
};

// 에너지/소재 ↔ 생산 단가 영향 프레임
export const analyzeEnergyMaterialImpact = async (energyData, materialData, productionStocks) => {
  try {
    const impacts = [];
    
    // 에너지 가격 영향 분석
    const energyImpacts = calculateEnergyImpacts(energyData, productionStocks);
    
    // 소재 가격 영향 분석  
    const materialImpacts = calculateMaterialImpacts(materialData, productionStocks);
    
    // 생산 단가 모델링
    const costModel = buildProductionCostModel(energyData, materialData, productionStocks);
    
    // 수익성 예측
    const profitabilityForecast = forecastProfitability(costModel, productionStocks);
    
    // 민감도 분석
    const sensitivityAnalysis = performSensitivityAnalysis(costModel);

    productionStocks.forEach(stock => {
      const energyImpact = energyImpacts.find(e => e.symbol === stock.symbol);
      const materialImpact = materialImpacts.find(m => m.symbol === stock.symbol);
      
      impacts.push({
        symbol: stock.symbol,
        name: stock.name,
        industry: stock.industry,
        energy_sensitivity: energyImpact?.sensitivity || 0,
        material_sensitivity: materialImpact?.sensitivity || 0,
        cost_structure: {
          energy_ratio: energyImpact?.cost_ratio || 0,
          material_ratio: materialImpact?.cost_ratio || 0,
          labor_ratio: stock.labor_cost_ratio || 0
        },
        profit_margin_forecast: profitabilityForecast[stock.symbol] || {},
        risk_level: calculateCostRiskLevel(energyImpact, materialImpact)
      });
    });

    return {
      success: true,
      energy_impacts: energyImpacts,
      material_impacts: materialImpacts,
      cost_model: costModel,
      stock_impacts: impacts.sort((a, b) => 
        (b.energy_sensitivity + b.material_sensitivity) - 
        (a.energy_sensitivity + a.material_sensitivity)
      ),
      sensitivity_analysis: sensitivityAnalysis,
      insights: generateCostImpactInsights(impacts, costModel)
    };
  } catch (error) {
    console.error('에너지/소재 영향 분석 오류:', error);
    return { success: false, error: error.message };
  }
};

// 환율 민감 종목 스코어링
export const analyzeExchangeRateSensitivity = async (stockData, exchangeRates, timeWindow = 90) => {
  try {
    const sensitivities = [];
    
    stockData.forEach(stock => {
      const sensitivity = calculateExchangeRateSensitivity(stock, exchangeRates, timeWindow);
      
      sensitivities.push({
        symbol: stock.symbol,
        name: stock.name,
        industry: stock.industry,
        export_ratio: stock.export_ratio || 0,
        import_ratio: stock.import_ratio || 0,
        usd_sensitivity: sensitivity.usd || 0,
        eur_sensitivity: sensitivity.eur || 0,
        jpy_sensitivity: sensitivity.jpy || 0,
        cny_sensitivity: sensitivity.cny || 0,
        overall_sensitivity: calculateOverallSensitivity(sensitivity),
        hedging_ratio: stock.hedging_ratio || 0,
        revenue_geography: stock.revenue_geography || {},
        risk_score: calculateExchangeRateRisk(sensitivity, stock)
      });
    });

    // 환율 변동 시나리오 분석
    const scenarios = generateExchangeRateScenarios();
    const scenarioImpacts = analyzeScenarioImpacts(sensitivities, scenarios);

    // 헤징 효과 분석
    const hedgingAnalysis = analyzeHedgingEffectiveness(sensitivities);

    return {
      success: true,
      sensitivities: sensitivities.sort((a, b) => b.overall_sensitivity - a.overall_sensitivity),
      scenario_analysis: scenarioImpacts,
      hedging_analysis: hedgingAnalysis,
      high_risk_stocks: sensitivities.filter(s => s.risk_score > 0.7),
      low_risk_stocks: sensitivities.filter(s => s.risk_score < 0.3),
      insights: generateExchangeRateInsights(sensitivities, scenarioImpacts)
    };
  } catch (error) {
    console.error('환율 민감도 분석 오류:', error);
    return { success: false, error: error.message };
  }
};

// 헬퍼 함수들
const calculatePolicyRelevance = (industry, policies) => {
  return policies.reduce((relevance, policy) => {
    const keywordMatch = policy.keywords.filter(keyword => 
      industry.name.includes(keyword) || industry.description?.includes(keyword)
    ).length;
    return relevance + (keywordMatch / policy.keywords.length);
  }, 0);
};

const calculateRelationshipStrength = (policies, industries, stocks) => {
  const edges = [];
  
  // 정책-산업 관계
  policies.forEach(policy => {
    industries.forEach(industry => {
      const strength = calculatePolicyIndustryStrength(policy, industry);
      if (strength > 0.3) {
        edges.push({
          source: `policy_${policy.id}`,
          target: `industry_${industry.code}`,
          weight: strength,
          type: 'policy-industry'
        });
      }
    });
  });

  // 산업-종목 관계
  industries.forEach(industry => {
    stocks.filter(stock => stock.industry === industry.code).forEach(stock => {
      edges.push({
        source: `industry_${industry.code}`,
        target: `stock_${stock.symbol}`,
        weight: 0.8,
        type: 'industry-stock'
      });
    });
  });

  return edges;
};

const identifyPolicyIndustryClusters = (graph) => {
  // 클러스터링 알고리즘 구현
  const clusters = [];
  const visited = new Set();
  
  graph.nodes.filter(node => node.type === 'policy').forEach(policyNode => {
    if (!visited.has(policyNode.id)) {
      const cluster = exploreCluster(policyNode, graph, visited);
      if (cluster.nodes.length > 1) {
        clusters.push(cluster);
      }
    }
  });
  
  return clusters;
};

const exploreCluster = (startNode, graph, visited) => {
  const cluster = { nodes: [startNode], edges: [] };
  const queue = [startNode];
  visited.add(startNode.id);
  
  while (queue.length > 0) {
    const currentNode = queue.shift();
    const connectedEdges = graph.edges.filter(edge => 
      edge.source === currentNode.id || edge.target === currentNode.id
    );
    
    connectedEdges.forEach(edge => {
      const nextNodeId = edge.source === currentNode.id ? edge.target : edge.source;
      const nextNode = graph.nodes.find(node => node.id === nextNodeId);
      
      if (!visited.has(nextNodeId) && edge.weight > 0.5) {
        visited.add(nextNodeId);
        cluster.nodes.push(nextNode);
        cluster.edges.push(edge);
        queue.push(nextNode);
      }
    });
  }
  
  return cluster;
};

const generateGraphInsights = (graph) => {
  const insights = [];
  
  // 가장 영향력 있는 정책 식별
  const policyNodes = graph.nodes.filter(node => node.type === 'policy');
  const mostInfluentialPolicy = policyNodes.reduce((max, policy) => {
    const connections = graph.edges.filter(edge => edge.source === policy.id).length;
    return connections > (max.connections || 0) ? { ...policy, connections } : max;
  }, {});
  
  insights.push({
    type: 'most_influential_policy',
    data: mostInfluentialPolicy,
    message: `가장 영향력 있는 정책: ${mostInfluentialPolicy.name} (${mostInfluentialPolicy.connections}개 산업 연결)`
  });
  
  // 정책 혜택을 가장 많이 받는 산업
  const industryBenefits = graph.nodes.filter(node => node.type === 'industry').map(industry => {
    const policyConnections = graph.edges.filter(edge => 
      edge.target === industry.id && edge.type === 'policy-industry'
    ).length;
    return { ...industry, policy_benefits: policyConnections };
  });
  
  const topBeneficiaryIndustry = industryBenefits.reduce((max, industry) => 
    industry.policy_benefits > (max.policy_benefits || 0) ? industry : max, {}
  );
  
  insights.push({
    type: 'top_beneficiary_industry',
    data: topBeneficiaryIndustry,
    message: `정책 혜택 최대 수혜 산업: ${topBeneficiaryIndustry.name}`
  });
  
  return insights;
};

const findHighImpactPaths = (graph) => {
  const paths = [];
  
  // 정책 → 산업 → 종목 경로 탐색
  const policyNodes = graph.nodes.filter(node => node.type === 'policy');
  
  policyNodes.forEach(policy => {
    const policyIndustryEdges = graph.edges.filter(edge => 
      edge.source === policy.id && edge.type === 'policy-industry'
    );
    
    policyIndustryEdges.forEach(policyEdge => {
      const industry = graph.nodes.find(node => node.id === policyEdge.target);
      const industryStockEdges = graph.edges.filter(edge => 
        edge.source === industry.id && edge.type === 'industry-stock'
      );
      
      industryStockEdges.forEach(industryEdge => {
        const stock = graph.nodes.find(node => node.id === industryEdge.target);
        const pathImpact = policyEdge.weight * industryEdge.weight;
        
        if (pathImpact > 0.5) {
          paths.push({
            policy: policy.name,
            industry: industry.name,
            stock: stock.name,
            impact_score: pathImpact,
            path: `${policy.name} → ${industry.name} → ${stock.name}`
          });
        }
      });
    });
  });
  
  return paths.sort((a, b) => b.impact_score - a.impact_score).slice(0, 10);
};

const calculateSyncDays = (priceChanges1, priceChanges2) => {
  let syncDays = 0;
  const minLength = Math.min(priceChanges1.length, priceChanges2.length);
  
  for (let i = 0; i < minLength; i++) {
    const direction1 = priceChanges1[i] > 0 ? 1 : (priceChanges1[i] < 0 ? -1 : 0);
    const direction2 = priceChanges2[i] > 0 ? 1 : (priceChanges2[i] < 0 ? -1 : 0);
    
    if (direction1 === direction2 && direction1 !== 0) {
      syncDays++;
    }
  }
  
  return syncDays / minLength;
};

const calculateVolatilityMatch = (stock1, stock2) => {
  const vol1 = calculateVolatility(stock1.price_changes);
  const vol2 = calculateVolatility(stock2.price_changes);
  return 1 - Math.abs(vol1 - vol2) / Math.max(vol1, vol2);
};

const calculateSectorSimilarity = (sector1, sector2) => {
  if (sector1 === sector2) return 1;
  
  // 관련 섹터 매핑
  const relatedSectors = {
    'Technology': ['Software', 'Hardware', 'Semiconductors'],
    'Healthcare': ['Biotechnology', 'Pharmaceuticals', 'Medical Devices'],
    'Financial': ['Banking', 'Insurance', 'Investment'],
    'Energy': ['Oil & Gas', 'Renewable Energy', 'Utilities']
  };
  
  for (const [mainSector, subSectors] of Object.entries(relatedSectors)) {
    if (subSectors.includes(sector1) && subSectors.includes(sector2)) {
      return 0.7;
    }
  }
  
  return 0;
};

const identifyMovementClusters = (pairs) => {
  // 클러스터링을 위한 그래프 구성
  const nodes = new Set();
  pairs.forEach(pair => {
    const [stock1, stock2] = pair.pair.split('-');
    nodes.add(stock1);
    nodes.add(stock2);
  });
  
  const clusters = [];
  const visited = new Set();
  
  nodes.forEach(node => {
    if (!visited.has(node)) {
      const cluster = findConnectedStocks(node, pairs, visited);
      if (cluster.length > 2) {
        clusters.push({
          stocks: cluster,
          avg_correlation: calculateAvgCorrelation(cluster, pairs),
          cluster_strength: calculateClusterStrength(cluster, pairs)
        });
      }
    }
  });
  
  return clusters.sort((a, b) => b.cluster_strength - a.cluster_strength);
};

const findConnectedStocks = (startStock, pairs, visited, threshold = 0.6) => {
  const cluster = [startStock];
  const queue = [startStock];
  visited.add(startStock);
  
  while (queue.length > 0) {
    const currentStock = queue.shift();
    const connectedPairs = pairs.filter(pair => 
      pair.pair.includes(currentStock) && Math.abs(pair.correlation) > threshold
    );
    
    connectedPairs.forEach(pair => {
      const [stock1, stock2] = pair.pair.split('-');
      const otherStock = stock1 === currentStock ? stock2 : stock1;
      
      if (!visited.has(otherStock)) {
        visited.add(otherStock);
        cluster.push(otherStock);
        queue.push(otherStock);
      }
    });
  }
  
  return cluster;
};

const calculateAvgCorrelation = (cluster, pairs) => {
  let totalCorr = 0;
  let count = 0;
  
  for (let i = 0; i < cluster.length; i++) {
    for (let j = i + 1; j < cluster.length; j++) {
      const pairKey1 = `${cluster[i]}-${cluster[j]}`;
      const pairKey2 = `${cluster[j]}-${cluster[i]}`;
      const pair = pairs.find(p => p.pair === pairKey1 || p.pair === pairKey2);
      
      if (pair) {
        totalCorr += Math.abs(pair.correlation);
        count++;
      }
    }
  }
  
  return count > 0 ? totalCorr / count : 0;
};

const calculateClusterStrength = (cluster, pairs) => {
  const avgCorr = calculateAvgCorrelation(cluster, pairs);
  const clusterSize = cluster.length;
  return avgCorr * Math.log(clusterSize + 1);
};

const analyzeTimeBasedCorrelation = (stockData, timeWindow) => {
  const timeAnalysis = {
    short_term: [], // 7일
    medium_term: [], // 30일  
    long_term: [] // 90일
  };
  
  const timeWindows = { short_term: 7, medium_term: 30, long_term: 90 };
  
  Object.entries(timeWindows).forEach(([term, window]) => {
    for (let i = 0; i < stockData.length; i++) {
      for (let j = i + 1; j < stockData.length; j++) {
        const correlation = calculateRollingCorrelation(
          stockData[i].price_changes,
          stockData[j].price_changes,
          window
        );
        
        timeAnalysis[term].push({
          pair: `${stockData[i].symbol}-${stockData[j].symbol}`,
          correlation: correlation.average,
          stability: correlation.stability,
          trend: correlation.trend
        });
      }
    }
  });
  
  return timeAnalysis;
};

const calculateRollingCorrelation = (series1, series2, window) => {
  const correlations = [];
  
  for (let i = window; i <= Math.min(series1.length, series2.length); i++) {
    const subset1 = series1.slice(i - window, i);
    const subset2 = series2.slice(i - window, i);
    correlations.push(calculatePearsonCorrelation(subset1, subset2));
  }
  
  const average = correlations.reduce((sum, corr) => sum + corr, 0) / correlations.length;
  const stability = 1 - calculateVolatility(correlations);
  const trend = correlations.length > 1 ? 
    (correlations[correlations.length - 1] - correlations[0]) / correlations.length : 0;
  
  return { average, stability, trend };
};

const generateCoMovementInsights = (pairs, clusters) => {
  const insights = [];
  
  // 가장 강한 상관관계
  const strongestPair = pairs[0];
  insights.push({
    type: 'strongest_correlation',
    data: strongestPair,
    message: `가장 강한 동반 움직임: ${strongestPair.pair} (상관계수: ${strongestPair.correlation.toFixed(3)})`
  });
  
  // 가장 큰 클러스터
  const largestCluster = clusters[0];
  if (largestCluster) {
    insights.push({
      type: 'largest_cluster',
      data: largestCluster,
      message: `최대 동반상승 그룹: ${largestCluster.stocks.join(', ')} (${largestCluster.stocks.length}개 종목)`
    });
  }
  
  // 역상관 관계
  const negativeCorrelations = pairs.filter(pair => pair.correlation < -0.5);
  if (negativeCorrelations.length > 0) {
    insights.push({
      type: 'negative_correlations',
      data: negativeCorrelations,
      message: `역상관 관계 발견: ${negativeCorrelations.length}쌍의 반대 움직임`
    });
  }
  
  return insights;
};

// 에너지/소재 영향 분석 헬퍼 함수들
const calculateEnergyImpacts = (energyData, stocks) => {
  return stocks.map(stock => {
    const energySensitivity = calculateEnergySensitivity(stock, energyData);
    const costRatio = estimateEnergyCostRatio(stock);
    
    return {
      symbol: stock.symbol,
      sensitivity: energySensitivity,
      cost_ratio: costRatio,
      impact_score: energySensitivity * costRatio
    };
  });
};

const calculateMaterialImpacts = (materialData, stocks) => {
  return stocks.map(stock => {
    const materialSensitivity = calculateMaterialSensitivity(stock, materialData);
    const costRatio = estimateMaterialCostRatio(stock);
    
    return {
      symbol: stock.symbol,
      sensitivity: materialSensitivity,
      cost_ratio: costRatio,
      impact_score: materialSensitivity * costRatio
    };
  });
};

const buildProductionCostModel = (energyData, materialData, stocks) => {
  const costModel = {
    energy_factors: {},
    material_factors: {},
    stock_profiles: {}
  };
  
  // 에너지 요인 분석
  energyData.forEach(energy => {
    costModel.energy_factors[energy.type] = {
      price_trend: calculateTrend(energy.prices),
      volatility: calculateVolatility(energy.prices),
      seasonal_pattern: identifySeasonalPattern(energy.prices)
    };
  });
  
  // 소재 요인 분석
  materialData.forEach(material => {
    costModel.material_factors[material.type] = {
      price_trend: calculateTrend(material.prices),
      volatility: calculateVolatility(material.prices),
      supply_risk: material.supply_risk || 0
    };
  });
  
  // 종목별 비용 프로파일
  stocks.forEach(stock => {
    costModel.stock_profiles[stock.symbol] = {
      energy_dependency: calculateEnergyDependency(stock),
      material_dependency: calculateMaterialDependency(stock),
      cost_structure_flexibility: stock.cost_flexibility || 0.5
    };
  });
  
  return costModel;
};

const forecastProfitability = (costModel, stocks) => {
  const forecasts = {};
  
  stocks.forEach(stock => {
    const profile = costModel.stock_profiles[stock.symbol];
    const energyImpact = calculateEnergyPriceImpact(profile, costModel.energy_factors);
    const materialImpact = calculateMaterialPriceImpact(profile, costModel.material_factors);
    
    forecasts[stock.symbol] = {
      base_margin: stock.profit_margin || 0.1,
      energy_impact: energyImpact,
      material_impact: materialImpact,
      forecasted_margin: stock.profit_margin - energyImpact - materialImpact,
      confidence: calculateForecastConfidence(profile, costModel)
    };
  });
  
  return forecasts;
};

const performSensitivityAnalysis = (costModel) => {
  const scenarios = [
    { name: 'energy_up_10', energy_change: 0.1, material_change: 0 },
    { name: 'energy_down_10', energy_change: -0.1, material_change: 0 },
    { name: 'material_up_20', energy_change: 0, material_change: 0.2 },
    { name: 'material_down_20', energy_change: 0, material_change: -0.2 },
    { name: 'both_up', energy_change: 0.1, material_change: 0.15 },
    { name: 'both_down', energy_change: -0.1, material_change: -0.15 }
  ];
  
  const sensitivity = {};
  
  scenarios.forEach(scenario => {
    sensitivity[scenario.name] = {};
    
    Object.keys(costModel.stock_profiles).forEach(symbol => {
      const profile = costModel.stock_profiles[symbol];
      const energyImpact = profile.energy_dependency * scenario.energy_change;
      const materialImpact = profile.material_dependency * scenario.material_change;
      
      sensitivity[scenario.name][symbol] = {
        total_impact: energyImpact + materialImpact,
        energy_component: energyImpact,
        material_component: materialImpact
      };
    });
  });
  
  return sensitivity;
};

const calculateCostRiskLevel = (energyImpact, materialImpact) => {
  const totalSensitivity = (energyImpact?.sensitivity || 0) + (materialImpact?.sensitivity || 0);
  const totalCostRatio = (energyImpact?.cost_ratio || 0) + (materialImpact?.cost_ratio || 0);
  
  const riskScore = totalSensitivity * totalCostRatio;
  
  if (riskScore > 0.7) return 'High';
  if (riskScore > 0.4) return 'Medium';
  return 'Low';
};

const generateCostImpactInsights = (impacts, costModel) => {
  const insights = [];
  
  // 가장 위험한 종목
  const highRiskStocks = impacts.filter(stock => stock.risk_level === 'High');
  if (highRiskStocks.length > 0) {
    insights.push({
      type: 'high_risk_stocks',
      data: highRiskStocks,
      message: `원가 상승 고위험 종목: ${highRiskStocks.map(s => s.name).join(', ')}`
    });
  }
  
  // 에너지 민감도가 높은 종목
  const energySensitiveStocks = impacts
    .filter(stock => stock.energy_sensitivity > 0.6)
    .sort((a, b) => b.energy_sensitivity - a.energy_sensitivity)
    .slice(0, 3);
    
  if (energySensitiveStocks.length > 0) {
    insights.push({
      type: 'energy_sensitive',
      data: energySensitiveStocks,
      message: `에너지 가격 민감 종목: ${energySensitiveStocks.map(s => s.name).join(', ')}`
    });
  }
  
  // 소재 민감도가 높은 종목
  const materialSensitiveStocks = impacts
    .filter(stock => stock.material_sensitivity > 0.6)
    .sort((a, b) => b.material_sensitivity - a.material_sensitivity)
    .slice(0, 3);
    
  if (materialSensitiveStocks.length > 0) {
    insights.push({
      type: 'material_sensitive',
      data: materialSensitiveStocks,
      message: `원자재 가격 민감 종목: ${materialSensitiveStocks.map(s => s.name).join(', ')}`
    });
  }
  
  return insights;
};

// 환율 민감도 분석 헬퍼 함수들
const calculateExchangeRateSensitivity = (stock, exchangeRates, timeWindow) => {
  const sensitivity = {};
  
  Object.keys(exchangeRates).forEach(currency => {
    const stockReturns = stock.price_changes.slice(-timeWindow);
    const currencyChanges = exchangeRates[currency].changes.slice(-timeWindow);
    
    const correlation = calculatePearsonCorrelation(stockReturns, currencyChanges);
    const beta = calculateBeta(stockReturns, currencyChanges);
    
    sensitivity[currency.toLowerCase()] = {
      correlation: correlation,
      beta: beta,
      sensitivity_score: Math.abs(correlation) * Math.abs(beta)
    };
  });
  
  return sensitivity;
};

const calculateOverallSensitivity = (sensitivity) => {
  const weights = { usd: 0.4, eur: 0.2, jpy: 0.2, cny: 0.2 };
  
  return Object.entries(weights).reduce((total, [currency, weight]) => {
    const currencySensitivity = sensitivity[currency]?.sensitivity_score || 0;
    return total + (currencySensitivity * weight);
  }, 0);
};

const calculateExchangeRateRisk = (sensitivity, stock) => {
  const overallSensitivity = calculateOverallSensitivity(sensitivity);
  const hedgingEffect = Math.max(0, stock.hedging_ratio - 0.5) * 0.5; // 헤징으로 인한 리스크 감소
  const exposureRisk = (stock.export_ratio + stock.import_ratio) * 0.5;
  
  return Math.min(1, overallSensitivity + exposureRisk - hedgingEffect);
};

const generateExchangeRateScenarios = () => {
  return [
    { name: 'USD 강세 (+10%)', usd: 0.1, eur: 0.05, jpy: 0.02, cny: 0.03 },
    { name: 'USD 약세 (-10%)', usd: -0.1, eur: -0.03, jpy: -0.02, cny: -0.05 },
    { name: '원화 강세 (전반적)', usd: -0.08, eur: -0.06, jpy: -0.04, cny: -0.05 },
    { name: '원화 약세 (전반적)', usd: 0.08, eur: 0.06, jpy: 0.04, cny: 0.05 },
    { name: '변동성 확대', usd: 0.15, eur: -0.12, jpy: 0.08, cny: -0.06 }
  ];
};

const analyzeScenarioImpacts = (sensitivities, scenarios) => {
  const impacts = {};
  
  scenarios.forEach(scenario => {
    impacts[scenario.name] = sensitivities.map(stock => {
      const impact = 
        (stock.usd_sensitivity * scenario.usd) +
        (stock.eur_sensitivity * scenario.eur) +
        (stock.jpy_sensitivity * scenario.jpy) +
        (stock.cny_sensitivity * scenario.cny);
      
      return {
        symbol: stock.symbol,
        name: stock.name,
        impact: impact,
        impact_percentage: impact * 100
      };
    }).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  });
  
  return impacts;
};

const analyzeHedgingEffectiveness = (sensitivities) => {
  return sensitivities.map(stock => {
    const unhedgedRisk = stock.overall_sensitivity;
    const hedgedRisk = unhedgedRisk * (1 - stock.hedging_ratio);
    const hedgingEffectiveness = (unhedgedRisk - hedgedRisk) / unhedgedRisk;
    
    return {
      symbol: stock.symbol,
      name: stock.name,
      hedging_ratio: stock.hedging_ratio,
      unhedged_risk: unhedgedRisk,
      hedged_risk: hedgedRisk,
      effectiveness: hedgingEffectiveness,
      recommendation: getHedgingRecommendation(hedgingEffectiveness, stock.risk_score)
    };
  });
};

const getHedgingRecommendation = (effectiveness, riskScore) => {
  if (riskScore > 0.7 && effectiveness < 0.5) {
    return '헤징 확대 필요';
  } else if (riskScore < 0.3 && effectiveness > 0.8) {
    return '헤징 축소 고려';
  } else if (effectiveness > 0.6) {
    return '헤징 적정 수준';
  } else {
    return '헤징 전략 재검토';
  }
};

const generateExchangeRateInsights = (sensitivities, scenarioImpacts) => {
  const insights = [];
  
  // 가장 환율 민감한 종목
  const mostSensitive = sensitivities[0];
  insights.push({
    type: 'most_sensitive',
    data: mostSensitive,
    message: `환율 변동 최고 민감주: ${mostSensitive.name} (민감도: ${(mostSensitive.overall_sensitivity * 100).toFixed(1)}%)`
  });
  
  // USD 강세 시나리오 최대 수혜주
  const usdStrengthWinners = scenarioImpacts['USD 강세 (+10%)']
    .filter(stock => stock.impact > 0)
    .slice(0, 3);
    
  if (usdStrengthWinners.length > 0) {
    insights.push({
      type: 'usd_strength_winners',
      data: usdStrengthWinners,
      message: `달러 강세 수혜주: ${usdStrengthWinners.map(s => s.name).join(', ')}`
    });
  }
  
  // 헤징 효과가 좋은 종목
  const wellHedgedStocks = sensitivities.filter(s => s.hedging_ratio > 0.7 && s.risk_score < 0.5);
  if (wellHedgedStocks.length > 0) {
    insights.push({
      type: 'well_hedged',
      data: wellHedgedStocks,
      message: `환율 리스크 헤징 우수 종목: ${wellHedgedStocks.map(s => s.name).join(', ')}`
    });
  }
  
  return insights;
};

// 기존 헬퍼 함수들 (간단한 구현)
const calculateEnergySensitivity = (stock, energyData) => {
  // 산업별 에너지 민감도 가중치
  const industryWeights = {
    'Steel': 0.9,
    'Chemical': 0.8,
    'Automotive': 0.7,
    'Airline': 0.9,
    'Shipping': 0.8,
    'Technology': 0.3,
    'Financial': 0.1
  };
  
  return industryWeights[stock.industry] || 0.5;
};

const estimateEnergyCostRatio = (stock) => {
  const industryRatios = {
    'Steel': 0.25,
    'Chemical': 0.30,
    'Automotive': 0.15,
    'Airline': 0.35,
    'Shipping': 0.40,
    'Technology': 0.05,
    'Financial': 0.02
  };
  
  return industryRatios[stock.industry] || 0.10;
};

const calculateMaterialSensitivity = (stock, materialData) => {
  const industryWeights = {
    'Steel': 0.95,
    'Chemical': 0.85,
    'Automotive': 0.75,
    'Construction': 0.80,
    'Electronics': 0.70,
    'Technology': 0.40,
    'Financial': 0.05
  };
  
  return industryWeights[stock.industry] || 0.5;
};

const estimateMaterialCostRatio = (stock) => {
  const industryRatios = {
    'Steel': 0.60,
    'Chemical': 0.50,
    'Automotive': 0.45,
    'Construction': 0.40,
    'Electronics': 0.35,
    'Technology': 0.15,
    'Financial': 0.02
  };
  
  return industryRatios[stock.industry] || 0.20;
};

const calculateTrend = (prices) => {
  if (prices.length < 2) return 0;
  
  const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
  const secondHalf = prices.slice(Math.floor(prices.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, price) => sum + price, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, price) => sum + price, 0) / secondHalf.length;
  
  return (secondAvg - firstAvg) / firstAvg;
};

const identifySeasonalPattern = (prices) => {
  // 간단한 계절성 패턴 식별
  const quarters = [[], [], [], []];
  
  prices.forEach((price, index) => {
    const quarter = Math.floor((index % 12) / 3);
    quarters[quarter].push(price);
  });
  
  const quarterAvgs = quarters.map(q => 
    q.length > 0 ? q.reduce((sum, p) => sum + p, 0) / q.length : 0
  );
  
  const maxQuarter = quarterAvgs.indexOf(Math.max(...quarterAvgs));
  const minQuarter = quarterAvgs.indexOf(Math.min(...quarterAvgs));
  
  return {
    peak_quarter: maxQuarter + 1,
    low_quarter: minQuarter + 1,
    seasonality_strength: (Math.max(...quarterAvgs) - Math.min(...quarterAvgs)) / Math.max(...quarterAvgs)
  };
};

const calculateEnergyDependency = (stock) => {
  return estimateEnergyCostRatio(stock) * calculateEnergySensitivity(stock, null);
};

const calculateMaterialDependency = (stock) => {
  return estimateMaterialCostRatio(stock) * calculateMaterialSensitivity(stock, null);
};

const calculateEnergyPriceImpact = (profile, energyFactors) => {
  // 에너지 가격 상승 예상치를 기반으로 비용 증가 계산
  const avgTrend = Object.values(energyFactors).reduce((sum, factor) => sum + factor.price_trend, 0) / Object.keys(energyFactors).length;
  return profile.energy_dependency * avgTrend * (1 - profile.cost_structure_flexibility);
};

const calculateMaterialPriceImpact = (profile, materialFactors) => {
  // 소재 가격 상승 예상치를 기반으로 비용 증가 계산
  const avgTrend = Object.values(materialFactors).reduce((sum, factor) => sum + factor.price_trend, 0) / Object.keys(materialFactors).length;
  return profile.material_dependency * avgTrend * (1 - profile.cost_structure_flexibility);
};

const calculateForecastConfidence = (profile, costModel) => {
  // 예측 신뢰도 계산 (단순화된 버전)
  const energyVolatility = Object.values(costModel.energy_factors).reduce((sum, factor) => sum + factor.volatility, 0) / Object.keys(costModel.energy_factors).length;
  const materialVolatility = Object.values(costModel.material_factors).reduce((sum, factor) => sum + factor.volatility, 0) / Object.keys(costModel.material_factors).length;
  
  const avgVolatility = (energyVolatility + materialVolatility) / 2;
  return Math.max(0.3, 1 - avgVolatility); // 최소 30% 신뢰도
};

const calculateBeta = (stockReturns, marketReturns) => {
  const n = Math.min(stockReturns.length, marketReturns.length);
  
  if (n < 2) return 0;
  
  const stockMean = stockReturns.slice(0, n).reduce((sum, r) => sum + r, 0) / n;
  const marketMean = marketReturns.slice(0, n).reduce((sum, r) => sum + r, 0) / n;
  
  let covariance = 0;
  let marketVariance = 0;
  
  for (let i = 0; i < n; i++) {
    const stockDeviation = stockReturns[i] - stockMean;
    const marketDeviation = marketReturns[i] - marketMean;
    
    covariance += stockDeviation * marketDeviation;
    marketVariance += marketDeviation * marketDeviation;
  }
  
  if (marketVariance === 0) return 0;
  
  return covariance / marketVariance;
};

const calculatePolicyIndustryStrength = (policy, industry) => {
  // 정책과 산업 간의 연관성 강도 계산
  let strength = 0;
  
  // 키워드 매칭
  const keywordMatches = policy.keywords.filter(keyword => 
    industry.name.toLowerCase().includes(keyword.toLowerCase()) ||
    (industry.description && industry.description.toLowerCase().includes(keyword.toLowerCase()))
  ).length;
  
  strength += (keywordMatches / policy.keywords.length) * 0.6;
  
  // 정책 유형과 산업 연관성
  if (policy.type === 'subsidy' && industry.government_support) {
    strength += 0.3;
  }
  
  if (policy.type === 'regulation' && industry.regulation_sensitive) {
    strength += 0.4;
  }
  
  // 과거 영향도 히스토리
  if (policy.historical_impact && policy.historical_impact[industry.code]) {
    strength += policy.historical_impact[industry.code] * 0.3;
  }
  
  return Math.min(1, strength);
};

// 4. 인과 관계 분석/상관 프레임
export class CausalityFramework {
  /**
   * 정책↔산업↔종목 상호 연관성 그래프 프레임
   */
  static async analyzePolicyIndustryStockGraph(stockData, newsData, policyData) {
    try {
      const graph = {
        nodes: [],
        edges: [],
        correlationMatrix: {}
      };

      // 정책 노드 생성
      const policyNodes = policyData.map(policy => ({
        id: `policy_${policy.id}`,
        type: 'policy',
        label: policy.name,
        description: policy.description,
        impact: policy.impact || 0
      }));

      // 산업 노드 생성
      const industryNodes = [...new Set(stockData.map(stock => stock.sector))].map(sector => ({
        id: `industry_${sector}`,
        type: 'industry',
        label: sector,
        stocks: stockData.filter(s => s.sector === sector).length
      }));

      // 종목 노드 생성
      const stockNodes = stockData.map(stock => ({
        id: `stock_${stock.symbol}`,
        type: 'stock',
        label: stock.name,
        symbol: stock.symbol,
        sector: stock.sector,
        marketCap: stock.marketCap || 0
      }));

      graph.nodes = [...policyNodes, ...industryNodes, ...stockNodes];

      // 연관성 분석 및 엣지 생성
      const policyIndustryEdges = this.analyzePolicyIndustryConnections(policyData, industryNodes, newsData);
      const industryStockEdges = this.analyzeIndustryStockConnections(industryNodes, stockNodes);
      const stockCorrelationEdges = this.analyzeStockCorrelations(stockData);

      graph.edges = [...policyIndustryEdges, ...industryStockEdges, ...stockCorrelationEdges];

      return {
        type: 'policy_industry_stock_graph',
        graph,
        metrics: {
          totalNodes: graph.nodes.length,
          totalEdges: graph.edges.length,
          avgConnectivity: graph.edges.length / graph.nodes.length,
          strongestConnections: graph.edges.sort((a, b) => b.weight - a.weight).slice(0, 10)
        }
      };
    } catch (error) {
      console.error('정책-산업-종목 그래프 분석 오류:', error);
      return null;
    }
  }

  /**
   * 동반 상승 상관 프레임
   */
  static async analyzeCoMovementCorrelation(stockData, timeframe = 30) {
    try {
      const correlations = [];
      const threshold = 0.7; // 높은 상관관계 기준

      for (let i = 0; i < stockData.length; i++) {
        for (let j = i + 1; j < stockData.length; j++) {
          const stock1 = stockData[i];
          const stock2 = stockData[j];

          const correlation = this.calculatePriceCorrelation(stock1.priceHistory, stock2.priceHistory, timeframe);
          
          if (Math.abs(correlation) >= threshold) {
            correlations.push({
              pair: `${stock1.symbol}-${stock2.symbol}`,
              stock1: stock1.symbol,
              stock2: stock2.symbol,
              correlation,
              strength: Math.abs(correlation),
              direction: correlation > 0 ? 'positive' : 'negative',
              sector1: stock1.sector,
              sector2: stock2.sector,
              crossSector: stock1.sector !== stock2.sector
            });
          }
        }
      }

      // 상관관계 클러스터 분석
      const clusters = this.identifyCorrelationClusters(correlations);

      return {
        type: 'co_movement_correlation',
        correlations: correlations.sort((a, b) => b.strength - a.strength),
        clusters,
        metrics: {
          totalPairs: correlations.length,
          strongPositive: correlations.filter(c => c.correlation >= threshold).length,
          strongNegative: correlations.filter(c => c.correlation <= -threshold).length,
          crossSectorPairs: correlations.filter(c => c.crossSector).length,
          avgCorrelation: correlations.reduce((sum, c) => sum + Math.abs(c.correlation), 0) / correlations.length
        }
      };
    } catch (error) {
      console.error('동반 상승 상관 분석 오류:', error);
      return null;
    }
  }

  /**
   * 에너지/소재 ↔ 생산 단가 영향 프레임
   */
  static async analyzeEnergyMaterialImpact(stockData, commodityData) {
    try {
      const impactAnalysis = [];
      const energyMaterials = ['oil', 'gas', 'steel', 'copper', 'lithium', 'nickel'];

      for (const stock of stockData) {
        const stockImpact = {
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          impacts: {}
        };

        for (const material of energyMaterials) {
          const materialData = commodityData.find(c => c.type === material);
          if (materialData) {
            const impact = this.calculateMaterialImpact(stock, materialData);
            stockImpact.impacts[material] = {
              sensitivity: impact.sensitivity,
              costImpact: impact.costImpact,
              priceElasticity: impact.priceElasticity,
              riskLevel: this.categorizRiskLevel(impact.sensitivity)
            };
          }
        }

        // 전체 리스크 점수 계산
        const overallRisk = Object.values(stockImpact.impacts)
          .reduce((sum, impact) => sum + Math.abs(impact.sensitivity), 0) / energyMaterials.length;

        stockImpact.overallRisk = overallRisk;
        stockImpact.riskCategory = this.categorizeOverallRisk(overallRisk);

        impactAnalysis.push(stockImpact);
      }

      return {
        type: 'energy_material_impact',
        analysis: impactAnalysis.sort((a, b) => b.overallRisk - a.overallRisk),
        insights: {
          highRiskStocks: impactAnalysis.filter(s => s.riskCategory === 'high').length,
          mostSensitiveMaterial: this.findMostSensitiveMaterial(impactAnalysis),
          sectorRiskRanking: this.calculateSectorRiskRanking(impactAnalysis)
        }
      };
    } catch (error) {
      console.error('에너지/소재 영향 분석 오류:', error);
      return null;
    }
  }

  /**
   * 환율 민감 종목 스코어링 프레임
   */
  static async analyzeExchangeRateSensitivity(stockData, exchangeRateData, timeframe = 90) {
    try {
      const sensitivityScores = [];

      for (const stock of stockData) {
        const sensitivity = this.calculateExchangeRateSensitivity(
          stock.priceHistory,
          exchangeRateData,
          timeframe
        );

        const score = {
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          exportRatio: stock.exportRatio || 0,
          sensitivityScore: sensitivity.score,
          correlation: sensitivity.correlation,
          volatilityImpact: sensitivity.volatilityImpact,
          direction: sensitivity.direction, // 'positive' | 'negative'
          riskLevel: this.categorizeExchangeRisk(sensitivity.score),
          recommendation: this.generateExchangeRecommendation(sensitivity, stock)
        };

        sensitivityScores.push(score);
      }

      return {
        type: 'exchange_rate_sensitivity',
        scores: sensitivityScores.sort((a, b) => Math.abs(b.sensitivityScore) - Math.abs(a.sensitivityScore)),
        insights: {
          mostSensitive: sensitivityScores.slice(0, 10),
          exporters: sensitivityScores.filter(s => s.direction === 'negative' && s.exportRatio > 0.3),
          importers: sensitivityScores.filter(s => s.direction === 'positive'),
          hedgeableStocks: sensitivityScores.filter(s => Math.abs(s.sensitivityScore) > 0.5)
        }
      };
    } catch (error) {
      console.error('환율 민감도 분석 오류:', error);
      return null;
    }
  }

  // 보조 메서드들
  static analyzePolicyIndustryConnections(policyData, industryNodes, newsData) {
    const edges = [];
    
    for (const policy of policyData) {
      for (const industry of industryNodes) {
        const connection = this.calculatePolicyIndustryConnection(policy, industry, newsData);
        if (connection.weight > 0.3) {
          edges.push({
            source: `policy_${policy.id}`,
            target: industry.id,
            weight: connection.weight,
            type: 'policy-industry',
            description: connection.description
          });
        }
      }
    }
    
    return edges;
  }

  static analyzeIndustryStockConnections(industryNodes, stockNodes) {
    const edges = [];
    
    for (const stock of stockNodes) {
      const industry = industryNodes.find(ind => ind.label === stock.sector);
      if (industry) {
        edges.push({
          source: industry.id,
          target: stock.id,
          weight: 1.0,
          type: 'industry-stock'
        });
      }
    }
    
    return edges;
  }

  static analyzeStockCorrelations(stockData) {
    const edges = [];
    const threshold = 0.6;
    
    for (let i = 0; i < stockData.length; i++) {
      for (let j = i + 1; j < stockData.length; j++) {
        const correlation = this.calculatePriceCorrelation(
          stockData[i].priceHistory,
          stockData[j].priceHistory,
          30
        );
        
        if (Math.abs(correlation) >= threshold) {
          edges.push({
            source: `stock_${stockData[i].symbol}`,
            target: `stock_${stockData[j].symbol}`,
            weight: Math.abs(correlation),
            type: 'stock-correlation',
            correlation
          });
        }
      }
    }
    
    return edges;
  }

  static calculatePriceCorrelation(prices1, prices2, timeframe) {
    if (!prices1 || !prices2 || prices1.length < timeframe || prices2.length < timeframe) {
      return 0;
    }

    const recent1 = prices1.slice(-timeframe);
    const recent2 = prices2.slice(-timeframe);

    // 피어슨 상관계수 계산
    const mean1 = recent1.reduce((sum, p) => sum + p, 0) / recent1.length;
    const mean2 = recent2.reduce((sum, p) => sum + p, 0) / recent2.length;

    let numerator = 0;
    let sum1 = 0;
    let sum2 = 0;

    for (let i = 0; i < recent1.length; i++) {
      const diff1 = recent1[i] - mean1;
      const diff2 = recent2[i] - mean2;
      numerator += diff1 * diff2;
      sum1 += diff1 * diff1;
      sum2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1 * sum2);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  static identifyCorrelationClusters(correlations) {
    // 간단한 클러스터링 알고리즘
    const clusters = [];
    const processed = new Set();

    for (const correlation of correlations) {
      if (!processed.has(correlation.stock1) && !processed.has(correlation.stock2)) {
        const cluster = {
          id: clusters.length + 1,
          stocks: [correlation.stock1, correlation.stock2],
          avgCorrelation: correlation.correlation,
          strength: correlation.strength
        };

        // 관련된 다른 상관관계 찾기
        for (const other of correlations) {
          if (other !== correlation &&
              (cluster.stocks.includes(other.stock1) || cluster.stocks.includes(other.stock2))) {
            if (!cluster.stocks.includes(other.stock1)) cluster.stocks.push(other.stock1);
            if (!cluster.stocks.includes(other.stock2)) cluster.stocks.push(other.stock2);
          }
        }

        cluster.stocks.forEach(stock => processed.add(stock));
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  static calculateMaterialImpact(stock, materialData) {
    // 업종별 소재 민감도 매핑
    const sectorSensitivity = {
      'Technology': { oil: 0.2, steel: 0.3, copper: 0.7, lithium: 0.8 },
      'Manufacturing': { oil: 0.6, steel: 0.8, copper: 0.5, lithium: 0.3 },
      'Automotive': { oil: 0.7, steel: 0.9, lithium: 0.9, nickel: 0.6 },
      'Energy': { oil: 0.9, gas: 0.9, steel: 0.4, copper: 0.3 },
      'Materials': { oil: 0.5, steel: 0.7, copper: 0.8, nickel: 0.7 },
      'default': { oil: 0.3, steel: 0.3, copper: 0.3, lithium: 0.2 }
    };

    const sensitivity = sectorSensitivity[stock.sector] || sectorSensitivity.default;
    const materialSensitivity = sensitivity[materialData.type] || 0.2;

    return {
      sensitivity: materialSensitivity,
      costImpact: materialSensitivity * (materialData.priceChange || 0),
      priceElasticity: materialSensitivity * 0.8 // 추정치
    };
  }

  static calculateExchangeRateSensitivity(priceHistory, exchangeRateData, timeframe) {
    if (!priceHistory || !exchangeRateData || priceHistory.length < timeframe) {
      return { score: 0, correlation: 0, volatilityImpact: 0, direction: 'neutral' };
    }

    const recentPrices = priceHistory.slice(-timeframe);
    const recentRates = exchangeRateData.slice(-timeframe);

    const correlation = this.calculatePriceCorrelation(recentPrices, recentRates, timeframe);
    
    // 변동성 영향 계산
    const priceVolatility = this.calculateVolatility(recentPrices);
    const rateVolatility = this.calculateVolatility(recentRates);
    const volatilityImpact = (priceVolatility / rateVolatility) * Math.abs(correlation);

    return {
      score: Math.abs(correlation),
      correlation,
      volatilityImpact,
      direction: correlation > 0 ? 'positive' : correlation < 0 ? 'negative' : 'neutral'
    };
  }

  static calculateVolatility(prices) {
    if (prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  static categorizRiskLevel(sensitivity) {
    if (sensitivity >= 0.7) return 'high';
    if (sensitivity >= 0.4) return 'medium';
    return 'low';
  }

  static categorizeOverallRisk(risk) {
    if (risk >= 0.6) return 'high';
    if (risk >= 0.3) return 'medium';
    return 'low';
  }

  static categorizeExchangeRisk(score) {
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  static findMostSensitiveMaterial(analysis) {
    const materialSums = {};
    
    for (const stock of analysis) {
      for (const [material, impact] of Object.entries(stock.impacts)) {
        if (!materialSums[material]) materialSums[material] = 0;
        materialSums[material] += Math.abs(impact.sensitivity);
      }
    }
    
    return Object.entries(materialSums)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'oil';
  }

  static calculateSectorRiskRanking(analysis) {
    const sectorRisks = {};
    
    for (const stock of analysis) {
      if (!sectorRisks[stock.sector]) {
        sectorRisks[stock.sector] = { total: 0, count: 0 };
      }
      sectorRisks[stock.sector].total += stock.overallRisk;
      sectorRisks[stock.sector].count += 1;
    }
    
    return Object.entries(sectorRisks)
      .map(([sector, data]) => ({
        sector,
        avgRisk: data.total / data.count,
        stockCount: data.count
      }))
      .sort((a, b) => b.avgRisk - a.avgRisk);
  }

  static generateExchangeRecommendation(sensitivity, stock) {
    const { score, direction } = sensitivity;
    
    if (score < 0.3) return 'LOW_RISK';
    if (direction === 'negative' && stock.exportRatio > 0.3) return 'HEDGE_RECOMMENDED';
    if (direction === 'positive' && score > 0.6) return 'MONITOR_CLOSELY';
    if (score > 0.7) return 'HIGH_RISK';
    return 'MODERATE_RISK';
  }

  static calculatePolicyIndustryConnection(policy, industry, newsData) {
    // 정책과 산업 간 연관성을 뉴스 데이터를 통해 계산
    const policyKeywords = policy.keywords || [];
    const industryKeywords = industry.keywords || [industry.label];
    
    let connectionWeight = 0;
    let matchingNews = 0;
    
    for (const news of newsData) {
      const newsText = (news.title + ' ' + news.content).toLowerCase();
      const policyMatch = policyKeywords.some(keyword => 
        newsText.includes(keyword.toLowerCase())
      );
      const industryMatch = industryKeywords.some(keyword => 
        newsText.includes(keyword.toLowerCase())
      );
      
      if (policyMatch && industryMatch) {
        matchingNews++;
        connectionWeight += news.sentiment || 0.5;
      }
    }
    
    return {
      weight: Math.min(connectionWeight / 10, 1), // 정규화
      description: `${matchingNews}개 뉴스에서 연관성 발견`
    };
  }
} 