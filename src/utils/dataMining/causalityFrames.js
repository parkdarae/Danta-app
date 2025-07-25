// 인과 관계 분석/상관 프레임
export class CausalityFrames {
  constructor() {
    this.correlationThreshold = 0.7;
    this.policyKeywords = ['IRA', '인프라', '그린뉴딜', '반도체법', '탄소중립'];
    this.industries = ['반도체', '자동차', '배터리', '태양광', '바이오'];
  }

  // 1. 정책↔산업↔종목 상호 연관성 그래프
  async analyzePolicyIndustryStockGraph(stockData, newsData, policyEvents) {
    try {
      const graph = {
        nodes: [],
        edges: [],
        insights: []
      };

      // 정책 노드 생성
      this.policyKeywords.forEach(policy => {
        graph.nodes.push({
          id: `policy_${policy}`,
          type: 'policy',
          label: policy,
          size: this.calculatePolicyImpact(policy, newsData)
        });
      });

      // 산업 노드 생성
      this.industries.forEach(industry => {
        graph.nodes.push({
          id: `industry_${industry}`,
          type: 'industry',
          label: industry,
          size: this.calculateIndustrySize(industry, stockData)
        });
      });

      // 종목 노드 생성
      Object.keys(stockData).forEach(stock => {
        graph.nodes.push({
          id: `stock_${stock}`,
          type: 'stock',
          label: stock,
          size: stockData[stock].marketCap || 100
        });
      });

      // 엣지(관계) 생성
      const connections = this.findPolicyStockConnections(newsData, policyEvents);
      connections.forEach(conn => {
        graph.edges.push({
          source: conn.from,
          target: conn.to,
          weight: conn.strength,
          type: conn.type
        });
      });

      return {
        graph,
        summary: `${graph.nodes.length}개 노드, ${graph.edges.length}개 연결`,
        strongestPaths: this.findStrongestPaths(graph),
        score: this.calculateGraphScore(graph)
      };
    } catch (error) {
      console.error('정책-산업-종목 그래프 분석 오류:', error);
      return { error: '분석 중 오류 발생' };
    }
  }

  // 2. 동반 상승 상관 프레임
  async analyzeCoMovementCorrelation(stockData, period = 30) {
    try {
      const correlations = [];
      const stocks = Object.keys(stockData);

      for (let i = 0; i < stocks.length; i++) {
        for (let j = i + 1; j < stocks.length; j++) {
          const stock1 = stocks[i];
          const stock2 = stocks[j];
          
          const correlation = this.calculateCorrelation(
            stockData[stock1].priceHistory,
            stockData[stock2].priceHistory,
            period
          );

          if (Math.abs(correlation) > this.correlationThreshold) {
            correlations.push({
              pair: [stock1, stock2],
              correlation: correlation,
              strength: this.getCorrelationStrength(correlation),
              pattern: this.identifyPattern(stockData[stock1], stockData[stock2]),
              tradingOpportunity: this.assessTradingOpportunity(correlation, stockData[stock1], stockData[stock2])
            });
          }
        }
      }

      return {
        correlations: correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)),
        strongestPairs: correlations.slice(0, 5),
        insights: this.generateCorrelationInsights(correlations),
        score: correlations.length > 0 ? correlations[0].correlation : 0
      };
    } catch (error) {
      console.error('동반 상승 상관 분석 오류:', error);
      return { error: '분석 중 오류 발생' };
    }
  }

  // 3. 에너지/소재 ↔ 생산 단가 영향 프레임
  async analyzeEnergyMaterialImpact(stockData, commodityPrices) {
    try {
      const impacts = [];
      const energyMaterials = ['원유', '천연가스', '니켈', '리튬', '구리'];

      Object.keys(stockData).forEach(stock => {
        const stockInfo = stockData[stock];
        const sensitivity = this.calculateCommoditySensitivity(stockInfo, commodityPrices);

        if (sensitivity.totalImpact > 0.3) {
          impacts.push({
            stock: stock,
            industry: stockInfo.industry,
            sensitivity: sensitivity,
            costStructure: this.analyzeCostStructure(stockInfo),
            riskLevel: this.assessCommodityRisk(sensitivity),
            hedgingOpportunity: this.identifyHedgingOpportunity(sensitivity, commodityPrices)
          });
        }
      });

      return {
        impacts: impacts.sort((a, b) => b.sensitivity.totalImpact - a.sensitivity.totalImpact),
        highRiskStocks: impacts.filter(i => i.riskLevel === 'HIGH'),
        hedgingOpportunities: impacts.filter(i => i.hedgingOpportunity.score > 0.7),
        insights: this.generateCommodityInsights(impacts),
        score: impacts.length > 0 ? impacts[0].sensitivity.totalImpact : 0
      };
    } catch (error) {
      console.error('에너지/소재 영향 분석 오류:', error);
      return { error: '분석 중 오류 발생' };
    }
  }

  // 4. 환율 민감 종목 스코어링
  async analyzeExchangeRateSensitivity(stockData, exchangeRates, period = 90) {
    try {
      const sensitivities = [];

      Object.keys(stockData).forEach(stock => {
        const stockInfo = stockData[stock];
        
        if (stockInfo.exportRatio > 0.3 || stockInfo.importRatio > 0.3) {
          const sensitivity = {
            stock: stock,
            exportRatio: stockInfo.exportRatio || 0,
            importRatio: stockInfo.importRatio || 0,
            mainCurrencies: this.identifyMainCurrencies(stockInfo),
            sensitivity: this.calculateExchangeRateSensitivity(stockInfo, exchangeRates, period),
            hedgeRatio: this.calculateHedgeRatio(stockInfo),
            riskScore: 0,
            opportunityScore: 0
          };

          sensitivity.riskScore = this.calculateExchangeRateRisk(sensitivity);
          sensitivity.opportunityScore = this.calculateExchangeRateOpportunity(sensitivity, exchangeRates);

          sensitivities.push(sensitivity);
        }
      });

      return {
        sensitivities: sensitivities.sort((a, b) => Math.abs(b.sensitivity) - Math.abs(a.sensitivity)),
        highRiskStocks: sensitivities.filter(s => s.riskScore > 0.7),
        opportunities: sensitivities.filter(s => s.opportunityScore > 0.7),
        insights: this.generateExchangeRateInsights(sensitivities),
        score: sensitivities.length > 0 ? Math.abs(sensitivities[0].sensitivity) : 0
      };
    } catch (error) {
      console.error('환율 민감도 분석 오류:', error);
      return { error: '분석 중 오류 발생' };
    }
  }

  // 헬퍼 메서드들
  calculatePolicyImpact(policy, newsData) {
    const mentions = newsData.filter(news => 
      news.content.includes(policy) || news.title.includes(policy)
    ).length;
    return Math.min(mentions * 10, 100);
  }

  calculateIndustrySize(industry, stockData) {
    const industryStocks = Object.values(stockData).filter(stock => 
      stock.industry === industry
    );
    return industryStocks.reduce((sum, stock) => sum + (stock.marketCap || 0), 0) / 1000000;
  }

  findPolicyStockConnections(newsData, policyEvents) {
    const connections = [];
    
    policyEvents.forEach(event => {
      const relatedNews = newsData.filter(news => 
        news.content.includes(event.policy) && 
        Math.abs(new Date(news.date) - new Date(event.date)) < 7 * 24 * 60 * 60 * 1000
      );

      relatedNews.forEach(news => {
        if (news.affectedStocks) {
          news.affectedStocks.forEach(stock => {
            connections.push({
              from: `policy_${event.policy}`,
              to: `stock_${stock}`,
              strength: news.sentiment * 0.5 + event.impact * 0.5,
              type: 'policy_impact'
            });
          });
        }
      });
    });

    return connections;
  }

  calculateCorrelation(series1, series2, period) {
    if (!series1 || !series2 || series1.length < period || series2.length < period) {
      return 0;
    }

    const recent1 = series1.slice(-period);
    const recent2 = series2.slice(-period);

    const mean1 = recent1.reduce((sum, val) => sum + val, 0) / period;
    const mean2 = recent2.reduce((sum, val) => sum + val, 0) / period;

    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;

    for (let i = 0; i < period; i++) {
      const diff1 = recent1[i] - mean1;
      const diff2 = recent2[i] - mean2;
      
      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sumSq1 * sumSq2);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  getCorrelationStrength(correlation) {
    const abs = Math.abs(correlation);
    if (abs > 0.9) return '매우 강함';
    if (abs > 0.7) return '강함';
    if (abs > 0.5) return '보통';
    return '약함';
  }

  calculateCommoditySensitivity(stockInfo, commodityPrices) {
    const sensitivity = {
      oil: this.calculateOilSensitivity(stockInfo),
      metals: this.calculateMetalSensitivity(stockInfo),
      totalImpact: 0
    };

    sensitivity.totalImpact = (sensitivity.oil + sensitivity.metals) / 2;
    return sensitivity;
  }

  calculateOilSensitivity(stockInfo) {
    if (stockInfo.industry === '항공' || stockInfo.industry === '물류') return 0.8;
    if (stockInfo.industry === '화학' || stockInfo.industry === '자동차') return 0.6;
    return 0.2;
  }

  calculateMetalSensitivity(stockInfo) {
    if (stockInfo.industry === '반도체' || stockInfo.industry === '배터리') return 0.7;
    if (stockInfo.industry === '자동차' || stockInfo.industry === '건설') return 0.5;
    return 0.1;
  }

  calculateExchangeRateSensitivity(stockInfo, exchangeRates, period) {
    // 단순화된 환율 민감도 계산
    const baseExposure = (stockInfo.exportRatio || 0) - (stockInfo.importRatio || 0);
    const volatility = this.calculateExchangeRateVolatility(exchangeRates, period);
    return baseExposure * volatility;
  }

  calculateExchangeRateVolatility(exchangeRates, period) {
    if (!exchangeRates || exchangeRates.length < period) return 0.1;
    
    const recentRates = exchangeRates.slice(-period);
    const returns = [];
    
    for (let i = 1; i < recentRates.length; i++) {
      returns.push((recentRates[i] - recentRates[i-1]) / recentRates[i-1]);
    }
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  generateCorrelationInsights(correlations) {
    const insights = [];
    
    if (correlations.length > 0) {
      const strongest = correlations[0];
      insights.push(`가장 강한 상관관계: ${strongest.pair[0]} ↔ ${strongest.pair[1]} (${(strongest.correlation * 100).toFixed(1)}%)`);
    }

    const positiveCorr = correlations.filter(c => c.correlation > 0).length;
    const negativeCorr = correlations.filter(c => c.correlation < 0).length;
    
    insights.push(`동조 움직임: ${positiveCorr}개, 역상관 움직임: ${negativeCorr}개`);

    return insights;
  }

  generateCommodityInsights(impacts) {
    const insights = [];
    
    if (impacts.length > 0) {
      const mostSensitive = impacts[0];
      insights.push(`원자재 가격에 가장 민감한 종목: ${mostSensitive.stock} (영향도 ${(mostSensitive.sensitivity.totalImpact * 100).toFixed(1)}%)`);
    }

    const highRisk = impacts.filter(i => i.riskLevel === 'HIGH').length;
    insights.push(`고위험 종목 ${highRisk}개 식별`);

    return insights;
  }

  generateExchangeRateInsights(sensitivities) {
    const insights = [];
    
    if (sensitivities.length > 0) {
      const mostSensitive = sensitivities[0];
      insights.push(`환율 변동에 가장 민감한 종목: ${mostSensitive.stock}`);
    }

    const exportSensitive = sensitivities.filter(s => s.exportRatio > 0.5).length;
    insights.push(`수출 의존도 높은 종목 ${exportSensitive}개`);

    return insights;
  }

  // 추가 헬퍼 메서드들
  findStrongestPaths(graph) {
    // 그래프에서 가장 강한 경로 찾기 (단순화)
    return graph.edges
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map(edge => `${edge.source} → ${edge.target} (${edge.weight.toFixed(2)})`);
  }

  calculateGraphScore(graph) {
    if (graph.edges.length === 0) return 0;
    return graph.edges.reduce((sum, edge) => sum + edge.weight, 0) / graph.edges.length;
  }

  identifyPattern(stock1Data, stock2Data) {
    // 패턴 식별 로직 (단순화)
    const corr = this.calculateCorrelation(stock1Data.priceHistory, stock2Data.priceHistory, 30);
    if (corr > 0.8) return '강한 동조';
    if (corr < -0.8) return '강한 역상관';
    return '약한 상관';
  }

  assessTradingOpportunity(correlation, stock1Data, stock2Data) {
    // 거래 기회 평가 (단순화)
    const score = Math.abs(correlation) * 0.5 + 
                  (stock1Data.volume + stock2Data.volume) / 2000000 * 0.3 +
                  Math.random() * 0.2; // 임시 점수
    
    return {
      score: Math.min(score, 1),
      action: score > 0.7 ? '매수 고려' : score < 0.3 ? '관망' : '주의 관찰'
    };
  }

  analyzeCostStructure(stockInfo) {
    // 비용 구조 분석 (단순화)
    return {
      rawMaterialCost: stockInfo.industry === '제조' ? 0.6 : 0.3,
      energyCost: stockInfo.industry === '화학' ? 0.4 : 0.2,
      laborCost: 0.3
    };
  }

  assessCommodityRisk(sensitivity) {
    if (sensitivity.totalImpact > 0.7) return 'HIGH';
    if (sensitivity.totalImpact > 0.4) return 'MEDIUM';
    return 'LOW';
  }

  identifyHedgingOpportunity(sensitivity, commodityPrices) {
    // 헤징 기회 식별 (단순화)
    return {
      score: sensitivity.totalImpact * 0.8,
      strategy: sensitivity.totalImpact > 0.6 ? '선물 헤징 권장' : '현물 관리'
    };
  }

  identifyMainCurrencies(stockInfo) {
    // 주요 통화 식별 (단순화)
    if (stockInfo.mainMarkets && stockInfo.mainMarkets.includes('미국')) return ['USD'];
    if (stockInfo.mainMarkets && stockInfo.mainMarkets.includes('중국')) return ['CNY'];
    return ['USD', 'EUR'];
  }

  calculateHedgeRatio(stockInfo) {
    // 헤지 비율 계산 (단순화)
    return Math.min((stockInfo.exportRatio || 0) * 0.8, 0.9);
  }

  calculateExchangeRateRisk(sensitivity) {
    return Math.abs(sensitivity.sensitivity) * (1 - sensitivity.hedgeRatio);
  }

  calculateExchangeRateOpportunity(sensitivity, exchangeRates) {
    // 환율 기회 계산 (단순화)
    const trend = this.calculateTrend(exchangeRates);
    return Math.abs(sensitivity.sensitivity * trend) * 0.8;
  }

  calculateTrend(data) {
    if (!data || data.length < 2) return 0;
    const recent = data.slice(-10);
    return (recent[recent.length - 1] - recent[0]) / recent[0];
  }
} 