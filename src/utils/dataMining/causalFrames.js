/**
 * 인과 관계 분석/상관 프레임
 * 정책, 산업, 종목 간 상호 연관성과 상관관계를 분석하는 모듈
 */

export class CausalFrames {
  constructor() {
    this.policyKeywords = {
      'IRA': ['인플레이션감축법', 'IRA', '청정에너지', '태양광', '전기차'],
      '금리정책': ['기준금리', '연준', 'FOMC', '인플레이션', '금리인상'],
      '반도체법': ['CHIPS', '반도체', '첨단기술', '국가안보'],
      'K-뉴딜': ['한국판뉴딜', '디지털뉴딜', '그린뉴딜', '디지털전환']
    };

    this.sectorMapping = {
      '태양광': ['한화솔루션', 'OCI', 'LG화학'],
      '전기차': ['현대차', '기아', 'LG에너지솔루션'],
      '반도체': ['삼성전자', 'SK하이닉스', '네패스'],
      '조선': ['현대중공업', '삼성중공업', '대우조선해양']
    };

    this.energyMaterials = {
      '원유': { symbol: 'CL=F', sector: '에너지' },
      '천연가스': { symbol: 'NG=F', sector: '에너지' },
      '구리': { symbol: 'HG=F', sector: '소재' },
      '니켈': { symbol: 'NI=F', sector: '소재' }
    };
  }

  /**
   * 정책↔산업↔종목 상호 연관성 그래프 프레임
   */
  async analyzePolicyIndustryStockGraph(stockSymbol, timeframe = '1y') {
    try {
      console.log('정책↔산업↔종목 연관성 분석 시작...');
      
      const connections = {
        nodes: [],
        edges: [],
        analysis: {}
      };

      // 종목 기본 정보
      const stockInfo = await this.getStockBasicInfo(stockSymbol);
      const sector = stockInfo.sector || '기타';

      // 1. 정책 노드 생성
      const relevantPolicies = this.findRelevantPolicies(sector);
      relevantPolicies.forEach(policy => {
        connections.nodes.push({
          id: policy.name,
          type: 'policy',
          category: '정책',
          impact: policy.impact,
          keywords: policy.keywords
        });
      });

      // 2. 산업 노드 생성
      connections.nodes.push({
        id: sector,
        type: 'industry',
        category: '산업',
        relatedStocks: this.sectorMapping[sector] || []
      });

      // 3. 종목 노드 생성
      connections.nodes.push({
        id: stockSymbol,
        type: 'stock',
        category: '종목',
        sector: sector,
        marketCap: stockInfo.marketCap || 0
      });

      // 4. 연관성 엣지 생성
      relevantPolicies.forEach(policy => {
        // 정책 → 산업 연결
        connections.edges.push({
          source: policy.name,
          target: sector,
          weight: policy.impact,
          type: 'policy_to_industry'
        });
        
        // 산업 → 종목 연결
        connections.edges.push({
          source: sector,
          target: stockSymbol,
          weight: 0.8,
          type: 'industry_to_stock'
        });
      });

      // 5. 연관성 강도 분석
      const connectionStrength = this.calculateConnectionStrength(connections);

      return {
        timestamp: new Date().toISOString(),
        stockSymbol,
        sector,
        connectionGraph: connections,
        connectionStrength,
        insights: this.generateConnectionInsights(connections, connectionStrength)
      };

    } catch (error) {
      console.error('정책↔산업↔종목 연관성 분석 오류:', error);
      return { error: error.message };
    }
  }

  /**
   * 동반 상승 상관 프레임
   */
  async analyzeCorrelationPairs(stockSymbol, timeframe = '3m') {
    try {
      console.log('동반 상승 상관관계 분석 시작...');
      
      const correlationData = {
        targetStock: stockSymbol,
        correlatedPairs: [],
        correlationMatrix: {},
        insights: {}
      };

      // 같은 섹터 종목들 가져오기
      const sectorStocks = await this.getSectorStocks(stockSymbol);
      
      // 상관계수 계산
      for (const compareStock of sectorStocks) {
        if (compareStock !== stockSymbol) {
          const correlation = await this.calculatePearsonCorrelation(
            stockSymbol, 
            compareStock, 
            timeframe
          );
          
          if (Math.abs(correlation) > 0.6) {
            correlationData.correlatedPairs.push({
              stock: compareStock,
              correlation: correlation,
              relationship: correlation > 0 ? '양의 상관' : '음의 상관',
              strength: this.getCorrelationStrength(Math.abs(correlation))
            });
          }
        }
      }

      // 상관관계 매트릭스 생성
      correlationData.correlationMatrix = await this.buildCorrelationMatrix(
        [stockSymbol, ...sectorStocks.slice(0, 5)]
      );

      // 동반 상승 패턴 분석
      const movementPatterns = await this.analyzeMovementPatterns(
        stockSymbol,
        correlationData.correlatedPairs
      );

      correlationData.insights = {
        strongestCorrelation: correlationData.correlatedPairs[0] || null,
        averageCorrelation: this.calculateAverageCorrelation(correlationData.correlatedPairs),
        movementPatterns,
        recommendation: this.generateCorrelationRecommendation(correlationData)
      };

      return correlationData;

    } catch (error) {
      console.error('동반 상승 상관관계 분석 오류:', error);
      return { error: error.message };
    }
  }

  /**
   * 에너지/소재 ↔ 생산 단가 영향 프레임
   */
  async analyzeEnergyMaterialImpact(stockSymbol) {
    try {
      console.log('에너지/소재 영향도 분석 시작...');
      
      const impactAnalysis = {
        targetStock: stockSymbol,
        energyImpact: {},
        materialImpact: {},
        overallSensitivity: 0,
        insights: {}
      };

      // 각 에너지/소재별 영향도 분석
      for (const [material, info] of Object.entries(this.energyMaterials)) {
        const sensitivity = await this.calculateMaterialSensitivity(
          stockSymbol, 
          info.symbol
        );
        
        if (info.sector === '에너지') {
          impactAnalysis.energyImpact[material] = {
            sensitivity,
            currentPrice: await this.getCurrentPrice(info.symbol),
            priceChange: await this.getPriceChange(info.symbol, '1m'),
            impact: sensitivity * await this.getPriceChange(info.symbol, '1m')
          };
        } else {
          impactAnalysis.materialImpact[material] = {
            sensitivity,
            currentPrice: await this.getCurrentPrice(info.symbol),
            priceChange: await this.getPriceChange(info.symbol, '1m'),
            impact: sensitivity * await this.getPriceChange(info.symbol, '1m')
          };
        }
      }

      // 전체 민감도 계산
      const allSensitivities = [
        ...Object.values(impactAnalysis.energyImpact),
        ...Object.values(impactAnalysis.materialImpact)
      ].map(item => Math.abs(item.sensitivity));
      
      impactAnalysis.overallSensitivity = allSensitivities.reduce((a, b) => a + b, 0) / allSensitivities.length;

      // 생산 단가 영향 시뮬레이션
      const costImpactSimulation = await this.simulateProductionCostImpact(
        stockSymbol,
        impactAnalysis
      );

      impactAnalysis.insights = {
        mostSensitiveMaterial: this.findMostSensitiveMaterial(impactAnalysis),
        costImpactForecast: costImpactSimulation,
        riskLevel: this.assessEnergyMaterialRisk(impactAnalysis),
        hedgingRecommendation: this.generateHedgingRecommendation(impactAnalysis)
      };

      return impactAnalysis;

    } catch (error) {
      console.error('에너지/소재 영향도 분석 오류:', error);
      return { error: error.message };
    }
  }

  /**
   * 환율 민감 종목 스코어링 프레임
   */
  async analyzeExchangeRateSensitivity(stockSymbol) {
    try {
      console.log('환율 민감도 분석 시작...');
      
      const exchangeRateAnalysis = {
        targetStock: stockSymbol,
        currencies: {},
        sensitivityScore: 0,
        exposureAnalysis: {},
        insights: {}
      };

      const majorCurrencies = ['USDKRW=X', 'EURKRW=X', 'JPYKRW=X', 'CNYKRW=X'];
      
      // 각 통화별 민감도 분석
      for (const currency of majorCurrencies) {
        const sensitivity = await this.calculateExchangeRateSensitivity(
          stockSymbol,
          currency
        );
        
        exchangeRateAnalysis.currencies[currency] = {
          sensitivity,
          currentRate: await this.getCurrentPrice(currency),
          rateChange: await this.getPriceChange(currency, '1m'),
          impact: sensitivity * await this.getPriceChange(currency, '1m')
        };
      }

      // 종합 민감도 스코어 계산
      const sensitivities = Object.values(exchangeRateAnalysis.currencies)
        .map(curr => Math.abs(curr.sensitivity));
      exchangeRateAnalysis.sensitivityScore = sensitivities.reduce((a, b) => a + b, 0) / sensitivities.length;

      // 노출도 분석 (수출/수입 비중 추정)
      exchangeRateAnalysis.exposureAnalysis = await this.analyzeExchangeRateExposure(stockSymbol);

      // 환율 시나리오 분석
      const scenarioAnalysis = await this.performExchangeRateScenarioAnalysis(
        stockSymbol,
        exchangeRateAnalysis
      );

      exchangeRateAnalysis.insights = {
        mostSensitiveCurrency: this.findMostSensitiveCurrency(exchangeRateAnalysis),
        riskLevel: this.assessExchangeRateRisk(exchangeRateAnalysis.sensitivityScore),
        scenarioAnalysis,
        hedgingStrategy: this.generateExchangeRateHedgingStrategy(exchangeRateAnalysis)
      };

      return exchangeRateAnalysis;

    } catch (error) {
      console.error('환율 민감도 분석 오류:', error);
      return { error: error.message };
    }
  }

  // Helper 메서드들
  findRelevantPolicies(sector) {
    const relevantPolicies = [];
    
    Object.entries(this.policyKeywords).forEach(([policyName, keywords]) => {
      const impact = this.calculatePolicyImpact(sector, keywords);
      if (impact > 0.3) {
        relevantPolicies.push({
          name: policyName,
          keywords,
          impact
        });
      }
    });
    
    return relevantPolicies.sort((a, b) => b.impact - a.impact);
  }

  calculatePolicyImpact(sector, keywords) {
    // 간단한 키워드 매칭 기반 영향도 계산
    const sectorKeywords = this.sectorMapping[sector] || [];
    let matchCount = 0;
    
    keywords.forEach(keyword => {
      if (sectorKeywords.some(stock => stock.includes(keyword)) || 
          sector.includes(keyword)) {
        matchCount++;
      }
    });
    
    return Math.min(matchCount / keywords.length, 1.0);
  }

  calculateConnectionStrength(connections) {
    const totalEdges = connections.edges.length;
    const avgWeight = connections.edges.reduce((sum, edge) => sum + edge.weight, 0) / totalEdges;
    
    return {
      edgeCount: totalEdges,
      averageWeight: avgWeight,
      strength: totalEdges * avgWeight,
      level: this.getStrengthLevel(totalEdges * avgWeight)
    };
  }

  getStrengthLevel(strength) {
    if (strength > 2.0) return '매우 강함';
    if (strength > 1.5) return '강함';
    if (strength > 1.0) return '보통';
    if (strength > 0.5) return '약함';
    return '매우 약함';
  }

  generateConnectionInsights(connections, strength) {
    return {
      summary: `${connections.nodes.find(n => n.type === 'stock').id}는 ${strength.level} 수준의 정책-산업 연관성을 보입니다.`,
      keyConnections: connections.edges.sort((a, b) => b.weight - a.weight).slice(0, 3),
      recommendation: strength.strength > 1.5 ? 
        '정책 변화에 민감하게 반응할 가능성이 높습니다.' : 
        '정책 영향도가 제한적입니다.'
    };
  }

  async getStockBasicInfo(symbol) {
    // 기본 주식 정보 조회 (실제 API 호출 시뮬레이션)
    return {
      symbol,
      sector: '반도체', // 예시
      marketCap: 100000000000
    };
  }

  async getSectorStocks(stockSymbol) {
    // 같은 섹터 종목들 반환 (예시)
    return ['005930.KS', '000660.KS', '035420.KS'];
  }

  async calculatePearsonCorrelation(stock1, stock2, timeframe) {
    // 피어슨 상관계수 계산 (시뮬레이션)
    return Math.random() * 2 - 1; // -1 ~ 1
  }

  getCorrelationStrength(correlation) {
    if (correlation > 0.8) return '매우 강함';
    if (correlation > 0.6) return '강함';
    if (correlation > 0.4) return '보통';
    if (correlation > 0.2) return '약함';
    return '매우 약함';
  }

  async buildCorrelationMatrix(stocks) {
    const matrix = {};
    for (const stock1 of stocks) {
      matrix[stock1] = {};
      for (const stock2 of stocks) {
        if (stock1 === stock2) {
          matrix[stock1][stock2] = 1.0;
        } else {
          matrix[stock1][stock2] = await this.calculatePearsonCorrelation(stock1, stock2, '3m');
        }
      }
    }
    return matrix;
  }

  calculateAverageCorrelation(pairs) {
    if (pairs.length === 0) return 0;
    return pairs.reduce((sum, pair) => sum + Math.abs(pair.correlation), 0) / pairs.length;
  }

  async analyzeMovementPatterns(stockSymbol, correlatedPairs) {
    return {
      synchronousMovements: Math.floor(Math.random() * 20) + 10,
      leadLagPatterns: correlatedPairs.slice(0, 2),
      volatilitySync: Math.random() * 0.8 + 0.2
    };
  }

  generateCorrelationRecommendation(data) {
    if (data.correlatedPairs.length > 3) {
      return '높은 상관관계를 가진 종목들이 많아 포트폴리오 분산 효과가 제한적일 수 있습니다.';
    }
    return '적절한 수준의 상관관계로 포트폴리오 구성에 적합합니다.';
  }

  async calculateMaterialSensitivity(stockSymbol, materialSymbol) {
    // 소재 가격 민감도 계산 (시뮬레이션)
    return Math.random() * 2 - 1;
  }

  async getCurrentPrice(symbol) {
    // 현재 가격 조회 (시뮬레이션)
    return Math.random() * 100 + 50;
  }

  async getPriceChange(symbol, period) {
    // 가격 변화율 조회 (시뮬레이션)
    return (Math.random() - 0.5) * 0.1; // -5% ~ +5%
  }

  findMostSensitiveMaterial(analysis) {
    let maxSensitivity = 0;
    let mostSensitive = null;
    
    const allMaterials = {...analysis.energyImpact, ...analysis.materialImpact};
    Object.entries(allMaterials).forEach(([material, data]) => {
      if (Math.abs(data.sensitivity) > maxSensitivity) {
        maxSensitivity = Math.abs(data.sensitivity);
        mostSensitive = { material, ...data };
      }
    });
    
    return mostSensitive;
  }

  async simulateProductionCostImpact(stockSymbol, analysis) {
    return {
      currentCostIndex: 100,
      projectedCostIndex: 100 + Math.random() * 20 - 10,
      impactOnMargins: (Math.random() - 0.5) * 0.05,
      recommendation: '원자재 가격 변동 모니터링 필요'
    };
  }

  assessEnergyMaterialRisk(analysis) {
    if (analysis.overallSensitivity > 0.7) return '높음';
    if (analysis.overallSensitivity > 0.4) return '보통';
    return '낮음';
  }

  generateHedgingRecommendation(analysis) {
    const riskLevel = this.assessEnergyMaterialRisk(analysis);
    if (riskLevel === '높음') {
      return '원자재 선물 헤징 또는 관련 ETF 활용을 고려하세요.';
    }
    return '현재 수준에서는 별도 헤징이 불필요합니다.';
  }

  async calculateExchangeRateSensitivity(stockSymbol, currency) {
    // 환율 민감도 계산 (시뮬레이션)
    return Math.random() * 2 - 1;
  }

  async analyzeExchangeRateExposure(stockSymbol) {
    return {
      exportRatio: Math.random() * 0.8,
      importRatio: Math.random() * 0.5,
      mainMarkets: ['미국', '중국', '유럽'],
      hedgingRatio: Math.random() * 0.6
    };
  }

  findMostSensitiveCurrency(analysis) {
    let maxSensitivity = 0;
    let mostSensitive = null;
    
    Object.entries(analysis.currencies).forEach(([currency, data]) => {
      if (Math.abs(data.sensitivity) > maxSensitivity) {
        maxSensitivity = Math.abs(data.sensitivity);
        mostSensitive = { currency, ...data };
      }
    });
    
    return mostSensitive;
  }

  assessExchangeRateRisk(sensitivityScore) {
    if (sensitivityScore > 0.7) return '높음';
    if (sensitivityScore > 0.4) return '보통';
    return '낮음';
  }

  async performExchangeRateScenarioAnalysis(stockSymbol, analysis) {
    return {
      scenarios: [
        { name: '원화 강세 10%', impact: -analysis.sensitivityScore * 0.1 },
        { name: '원화 약세 10%', impact: analysis.sensitivityScore * 0.1 },
        { name: '달러 강세 시나리오', impact: analysis.currencies['USDKRW=X']?.sensitivity * 0.05 || 0 }
      ],
      expectedVolatility: analysis.sensitivityScore * 0.2
    };
  }

  generateExchangeRateHedgingStrategy(analysis) {
    const riskLevel = this.assessExchangeRateRisk(analysis.sensitivityScore);
    if (riskLevel === '높음') {
      return '통화선물 또는 옵션을 통한 환위험 헤징을 권장합니다.';
    }
    return '현재 환율 노출도는 관리 가능한 수준입니다.';
  }
} 