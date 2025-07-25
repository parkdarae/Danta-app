// 인과 관계 분석/상관 프레임들
export class CorrelationAnalysisFrames {
  constructor() {
    this.policyIndustryStockGraph = new Map();
    this.correlationHistory = [];
    this.energyMaterialImpactMap = new Map();
    this.exchangeRateSensitivity = new Map();
  }

  // 정책↔산업↔종목 상호 연관성 그래프 프레임
  async buildPolicyIndustryStockGraph(policyKeywords, stockData, newsData) {
    const graph = {
      nodes: [],
      edges: [],
      layers: {
        policy: [],
        industry: [],
        stock: []
      }
    };

    // 정책 노드 생성
    policyKeywords.forEach(policy => {
      const policyNode = {
        id: `policy_${policy}`,
        type: 'policy',
        name: policy,
        influence: 0,
        relatedNews: []
      };
      
      // 뉴스에서 정책 언급 빈도 계산
      newsData.forEach(news => {
        if (news.title?.toLowerCase().includes(policy.toLowerCase()) || 
            news.summary?.toLowerCase().includes(policy.toLowerCase())) {
          policyNode.influence += 1;
          policyNode.relatedNews.push(news);
        }
      });

      graph.nodes.push(policyNode);
      graph.layers.policy.push(policyNode);
    });

    // 산업-종목 연결 분석
    const industries = this.extractIndustries(stockData);
    industries.forEach(industry => {
      const industryNode = {
        id: `industry_${industry}`,
        type: 'industry',
        name: industry,
        stocks: [],
        policyConnections: []
      };

      // 해당 산업의 종목들
      stockData.forEach(stock => {
        if (stock.industry === industry) {
          const stockNode = {
            id: `stock_${stock.symbol}`,
            type: 'stock',
            symbol: stock.symbol,
            name: stock.name,
            industry: industry,
            priceChange: stock.changePercent || 0,
            volume: stock.volume || 0
          };
          
          industryNode.stocks.push(stockNode);
          graph.nodes.push(stockNode);
          graph.layers.stock.push(stockNode);

          // 산업-종목 연결
          graph.edges.push({
            from: industryNode.id,
            to: stockNode.id,
            type: 'industry_stock',
            weight: 1
          });
        }
      });

      graph.nodes.push(industryNode);
      graph.layers.industry.push(industryNode);

      // 정책-산업 연결 분석
      graph.layers.policy.forEach(policyNode => {
        const connection = this.calculatePolicyIndustryConnection(policyNode, industry, newsData);
        if (connection.strength > 0.3) {
          industryNode.policyConnections.push(connection);
          graph.edges.push({
            from: policyNode.id,
            to: industryNode.id,
            type: 'policy_industry',
            weight: connection.strength,
            description: connection.description
          });
        }
      });
    });

    this.policyIndustryStockGraph.set(Date.now(), graph);
    return graph;
  }

  // 동반 상승 상관 프레임
  async findCoMovementCorrelation(stocksData, timeWindow = 30) {
    const correlationPairs = [];
    const stockSymbols = stocksData.map(s => s.symbol);

    for (let i = 0; i < stockSymbols.length; i++) {
      for (let j = i + 1; j < stockSymbols.length; j++) {
        const stock1 = stocksData[i];
        const stock2 = stocksData[j];

        const correlation = await this.calculatePriceCorrelation(stock1, stock2, timeWindow);
        
        if (correlation.coefficient > 0.7) {
          correlationPairs.push({
            pair: [stock1.symbol, stock2.symbol],
            names: [stock1.name, stock2.name],
            correlation: correlation.coefficient,
            confidence: correlation.pValue < 0.05 ? 'high' : 'medium',
            pattern: correlation.pattern,
            commonFactors: this.findCommonFactors(stock1, stock2),
            recentStrength: correlation.recentTrend,
            recommendation: this.generateCoMovementRecommendation(correlation)
          });
        }
      }
    }

    // 상관도 순으로 정렬
    correlationPairs.sort((a, b) => b.correlation - a.correlation);
    
    this.correlationHistory.push({
      timestamp: Date.now(),
      pairs: correlationPairs,
      timeWindow: timeWindow
    });

    return correlationPairs;
  }

  // 에너지/소재 ↔ 생산 단가 영향 프레임
  async analyzeEnergyMaterialImpact(stocksData, commodityPrices) {
    const impactAnalysis = {
      energyImpact: [],
      materialImpact: [],
      combinedImpact: [],
      riskMatrix: []
    };

    // 에너지 영향 분석
    const energyPrices = commodityPrices.filter(c => 
      ['crude_oil', 'natural_gas', 'electricity'].includes(c.type)
    );

    // 소재 영향 분석
    const materialPrices = commodityPrices.filter(c => 
      ['steel', 'copper', 'aluminum', 'nickel', 'lithium'].includes(c.type)
    );

    stocksData.forEach(stock => {
      const energyExposure = this.calculateEnergyExposure(stock);
      const materialExposure = this.calculateMaterialExposure(stock);

      if (energyExposure.score > 0.4 || materialExposure.score > 0.4) {
        const impact = {
          symbol: stock.symbol,
          name: stock.name,
          industry: stock.industry,
          energyExposure: energyExposure,
          materialExposure: materialExposure,
          priceElasticity: this.calculatePriceElasticity(stock, energyPrices, materialPrices),
          riskLevel: this.calculateCommodityRisk(energyExposure, materialExposure),
          hedgingOpportunity: this.identifyHedgingOpportunity(stock, energyExposure, materialExposure)
        };

        if (energyExposure.score > 0.4) {
          impactAnalysis.energyImpact.push(impact);
        }
        if (materialExposure.score > 0.4) {
          impactAnalysis.materialImpact.push(impact);
        }
        if (energyExposure.score > 0.4 && materialExposure.score > 0.4) {
          impactAnalysis.combinedImpact.push(impact);
        }
      }
    });

    this.energyMaterialImpactMap.set(Date.now(), impactAnalysis);
    return impactAnalysis;
  }

  // 환율 민감 종목 스코어링 프레임
  async analyzeExchangeRateSensitivity(stocksData, exchangeRates) {
    const sensitivityAnalysis = [];

    stocksData.forEach(stock => {
      const exportRatio = this.getExportRatio(stock);
      const importRatio = this.getImportRatio(stock);
      const foreignRevenueRatio = this.getForeignRevenueRatio(stock);

      if (exportRatio > 0.2 || importRatio > 0.2 || foreignRevenueRatio > 0.3) {
        const sensitivity = {
          symbol: stock.symbol,
          name: stock.name,
          industry: stock.industry,
          exportRatio: exportRatio,
          importRatio: importRatio,
          foreignRevenueRatio: foreignRevenueRatio,
          primaryCurrencies: this.identifyPrimaryCurrencies(stock),
          sensitivities: {},
          overallScore: 0,
          riskLevel: 'low',
          recommendation: ''
        };

        // 주요 통화별 민감도 계산
        ['USD', 'EUR', 'JPY', 'CNY'].forEach(currency => {
          const currencyExposure = this.calculateCurrencyExposure(stock, currency);
          if (currencyExposure > 0.1) {
            const historicalCorrelation = this.calculateExchangeRateCorrelation(
              stock, 
              currency, 
              exchangeRates
            );
            
            sensitivity.sensitivities[currency] = {
              exposure: currencyExposure,
              correlation: historicalCorrelation,
              elasticity: this.calculateExchangeRateElasticity(stock, currency),
              currentTrend: this.getCurrentExchangeTrend(currency, exchangeRates)
            };
          }
        });

        // 전체 점수 계산
        sensitivity.overallScore = this.calculateOverallExchangeSensitivity(sensitivity);
        sensitivity.riskLevel = this.determineExchangeRiskLevel(sensitivity.overallScore);
        sensitivity.recommendation = this.generateExchangeRecommendation(sensitivity);

        sensitivityAnalysis.push(sensitivity);
      }
    });

    // 민감도 점수 순으로 정렬
    sensitivityAnalysis.sort((a, b) => b.overallScore - a.overallScore);

    this.exchangeRateSensitivity.set(Date.now(), sensitivityAnalysis);
    return sensitivityAnalysis;
  }

  // 헬퍼 메서드들
  extractIndustries(stockData) {
    const industries = [...new Set(stockData.map(stock => stock.industry).filter(Boolean))];
    return industries.length > 0 ? industries : [
      '반도체', '자동차', '바이오', '금융', '에너지', '소재', '기술'
    ];
  }

  calculatePolicyIndustryConnection(policyNode, industry, newsData) {
    let connectionStrength = 0;
    let relevantNews = [];

    newsData.forEach(news => {
      const policyMention = news.title?.toLowerCase().includes(policyNode.name.toLowerCase()) ||
                           news.summary?.toLowerCase().includes(policyNode.name.toLowerCase());
      const industryMention = news.title?.toLowerCase().includes(industry.toLowerCase()) ||
                             news.summary?.toLowerCase().includes(industry.toLowerCase());

      if (policyMention && industryMention) {
        connectionStrength += 0.3;
        relevantNews.push(news);
      } else if (policyMention || industryMention) {
        connectionStrength += 0.1;
      }
    });

    return {
      strength: Math.min(connectionStrength, 1.0),
      description: `${policyNode.name}과 ${industry} 산업의 연관성`,
      relevantNews: relevantNews.slice(0, 3),
      confidence: connectionStrength > 0.5 ? 'high' : connectionStrength > 0.2 ? 'medium' : 'low'
    };
  }

  async calculatePriceCorrelation(stock1, stock2, timeWindow) {
    // 실제 구현에서는 과거 가격 데이터를 사용
    const correlation = Math.random() * 0.4 + 0.6; // 0.6-1.0 시뮬레이션
    
    return {
      coefficient: correlation,
      pValue: Math.random() * 0.1, // p-value 시뮬레이션
      pattern: correlation > 0.8 ? 'strong_positive' : 'moderate_positive',
      recentTrend: Math.random() > 0.5 ? 'strengthening' : 'weakening'
    };
  }

  findCommonFactors(stock1, stock2) {
    const factors = [];
    
    if (stock1.industry === stock2.industry) {
      factors.push(`같은 산업 (${stock1.industry})`);
    }
    
    // 추가 공통 요인 분석 로직
    factors.push('시장 전반 트렌드');
    
    return factors;
  }

  generateCoMovementRecommendation(correlation) {
    if (correlation.coefficient > 0.85) {
      return {
        type: 'pair_trading',
        strategy: '페어 트레이딩 기회',
        description: '두 종목의 강한 상관관계를 활용한 차익거래 가능'
      };
    } else if (correlation.coefficient > 0.7) {
      return {
        type: 'sector_play',
        strategy: '섹터 플레이',
        description: '동일 섹터/테마 내 분산투자 고려'
      };
    }
    return {
      type: 'monitor',
      strategy: '관찰',
      description: '상관관계 변화 모니터링'
    };
  }

  calculateEnergyExposure(stock) {
    // 에너지 노출도 계산 (업종, 비즈니스 모델 등 기반)
    const energyIntensiveIndustries = ['화학', '철강', '시멘트', '항공', '물류'];
    const baseScore = energyIntensiveIndustries.includes(stock.industry) ? 0.6 : 0.1;
    
    return {
      score: Math.min(baseScore + Math.random() * 0.3, 1.0),
      factors: ['업종 특성', '생산 프로세스', '운송비'],
      primary_energy: ['전력', '석유', '천연가스']
    };
  }

  calculateMaterialExposure(stock) {
    // 소재 노출도 계산
    const materialIntensiveIndustries = ['반도체', '자동차', '건설', '조선', '철강'];
    const baseScore = materialIntensiveIndustries.includes(stock.industry) ? 0.7 : 0.2;
    
    return {
      score: Math.min(baseScore + Math.random() * 0.2, 1.0),
      factors: ['원자재 의존도', '부품 구성', '대체재 가능성'],
      primary_materials: ['철강', '구리', '알루미늄', '니켈']
    };
  }

  calculatePriceElasticity(stock, energyPrices, materialPrices) {
    return {
      energy_elasticity: (Math.random() - 0.5) * 2, // -1 to 1
      material_elasticity: (Math.random() - 0.5) * 2,
      confidence: Math.random() > 0.3 ? 'medium' : 'high'
    };
  }

  calculateCommodityRisk(energyExposure, materialExposure) {
    const totalRisk = (energyExposure.score + materialExposure.score) / 2;
    if (totalRisk > 0.7) return 'high';
    if (totalRisk > 0.4) return 'medium';
    return 'low';
  }

  identifyHedgingOpportunity(stock, energyExposure, materialExposure) {
    const opportunities = [];
    
    if (energyExposure.score > 0.6) {
      opportunities.push({
        type: 'energy_hedge',
        instrument: 'WTI 원유 선물',
        strategy: 'Short hedge'
      });
    }
    
    if (materialExposure.score > 0.6) {
      opportunities.push({
        type: 'material_hedge',
        instrument: '구리/철강 선물',
        strategy: 'Cross hedge'
      });
    }
    
    return opportunities;
  }

  getExportRatio(stock) {
    // 실제로는 재무제표에서 추출
    const exportIntensiveIndustries = ['반도체', '자동차', '조선', '화학'];
    return exportIntensiveIndustries.includes(stock.industry) ? 
           Math.random() * 0.5 + 0.3 : Math.random() * 0.3;
  }

  getImportRatio(stock) {
    return Math.random() * 0.4;
  }

  getForeignRevenueRatio(stock) {
    return Math.random() * 0.6;
  }

  identifyPrimaryCurrencies(stock) {
    const currencies = ['USD'];
    if (Math.random() > 0.5) currencies.push('EUR');
    if (Math.random() > 0.7) currencies.push('JPY');
    return currencies;
  }

  calculateCurrencyExposure(stock, currency) {
    return Math.random() * 0.5 + 0.1;
  }

  calculateExchangeRateCorrelation(stock, currency, exchangeRates) {
    return (Math.random() - 0.5) * 1.6; // -0.8 to 0.8
  }

  calculateExchangeRateElasticity(stock, currency) {
    return (Math.random() - 0.5) * 2; // -1 to 1
  }

  getCurrentExchangeTrend(currency, exchangeRates) {
    const trends = ['strengthening', 'weakening', 'stable'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  calculateOverallExchangeSensitivity(sensitivity) {
    let score = 0;
    let totalWeight = 0;

    Object.values(sensitivity.sensitivities).forEach(sens => {
      const weight = sens.exposure;
      score += Math.abs(sens.correlation) * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  determineExchangeRiskLevel(score) {
    if (score > 0.6) return 'high';
    if (score > 0.3) return 'medium';
    return 'low';
  }

  generateExchangeRecommendation(sensitivity) {
    const riskLevel = sensitivity.riskLevel;
    const topCurrency = Object.keys(sensitivity.sensitivities)[0];
    
    if (riskLevel === 'high') {
      return `${topCurrency} 환율 변동에 높은 민감도. 환헤지 전략 고려 필요`;
    } else if (riskLevel === 'medium') {
      return `${topCurrency} 환율 모니터링 권장. 적정 수준의 환율 리스크`;
    }
    return '환율 리스크 낮음. 현재 수준 유지';
  }
} 