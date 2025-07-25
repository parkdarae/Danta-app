/**
 * 인과 관계 분석/상관 프레임
 * 정책↔산업↔종목 상호 연관성, 동반 상승 상관, 에너지/소재 영향, 환율 민감도 분석
 */

// 인과 관계 분석/상관 프레임
import { calculateCorrelation, calculateMutualInformation } from './correlationAnalyzer';

// 정책↔산업↔종목 상호 연관성 그래프 프레임
export class PolicyIndustryStockGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.correlationMatrix = new Map();
  }

  // 정책-산업-종목 관계 그래프 생성
  async buildInterconnectionGraph(policyData, industryData, stockData) {
    try {
      const graph = {
        nodes: [],
        edges: [],
        clusters: {}
      };

      // 정책 노드 생성
      policyData.forEach(policy => {
        graph.nodes.push({
          id: `policy_${policy.id}`,
          type: 'policy',
          name: policy.name,
          impact_score: policy.impact_score || 0,
          keywords: policy.keywords || [],
          date: policy.announcement_date
        });
      });

      // 산업 노드 생성
      industryData.forEach(industry => {
        graph.nodes.push({
          id: `industry_${industry.code}`,
          type: 'industry',
          name: industry.name,
          market_cap: industry.total_market_cap || 0,
          companies_count: industry.companies.length
        });
      });

      // 종목 노드 생성
      stockData.forEach(stock => {
        graph.nodes.push({
          id: `stock_${stock.symbol}`,
          type: 'stock',
          name: stock.name,
          symbol: stock.symbol,
          market_cap: stock.market_cap || 0,
          industry: stock.industry,
          policy_sensitivity: this.calculatePolicySensitivity(stock)
        });
      });

      // 정책-산업 연결 분석
      this.analyzePolicyIndustryConnections(policyData, industryData, graph);
      
      // 산업-종목 연결 분석
      this.analyzeIndustryStockConnections(industryData, stockData, graph);
      
      // 정책-종목 직접 연결 분석
      this.analyzePolicyStockConnections(policyData, stockData, graph);

      return graph;
    } catch (error) {
      console.error('정책-산업-종목 그래프 생성 오류:', error);
      return { nodes: [], edges: [], clusters: {} };
    }
  }

  // 정책 민감도 계산
  calculatePolicySensitivity(stock) {
    const factors = {
      government_contracts: stock.government_revenue_ratio || 0,
      regulatory_exposure: stock.regulatory_risk_score || 0,
      subsidy_dependency: stock.subsidy_ratio || 0,
      export_ratio: stock.export_ratio || 0
    };

    return Object.values(factors).reduce((sum, val) => sum + val, 0) / Object.keys(factors).length;
  }

  // 정책-산업 연결 분석
  analyzePolicyIndustryConnections(policyData, industryData, graph) {
    policyData.forEach(policy => {
      industryData.forEach(industry => {
        const relevanceScore = this.calculatePolicyIndustryRelevance(policy, industry);
        
        if (relevanceScore > 0.3) {
          graph.edges.push({
            source: `policy_${policy.id}`,
            target: `industry_${industry.code}`,
            type: 'policy_industry',
            strength: relevanceScore,
            impact_type: this.determinePolicyImpactType(policy, industry)
          });
        }
      });
    });
  }

  // 정책-산업 관련성 계산
  calculatePolicyIndustryRelevance(policy, industry) {
    const policyKeywords = policy.keywords || [];
    const industryKeywords = industry.keywords || [];
    
    let matchCount = 0;
    policyKeywords.forEach(pk => {
      industryKeywords.forEach(ik => {
        if (pk.toLowerCase().includes(ik.toLowerCase()) || 
            ik.toLowerCase().includes(pk.toLowerCase())) {
          matchCount++;
        }
      });
    });

    return Math.min(matchCount / Math.max(policyKeywords.length, 1), 1.0);
  }

  // 정책 영향 유형 결정
  determinePolicyImpactType(policy, industry) {
    const impactTypes = ['positive', 'negative', 'neutral'];
    // 실제로는 더 복잡한 로직이 필요
    return policy.impact_direction || 'neutral';
  }

  // 산업-종목 연결 분석
  analyzeIndustryStockConnections(industryData, stockData, graph) {
    stockData.forEach(stock => {
      const industry = industryData.find(ind => ind.code === stock.industry_code);
      if (industry) {
        graph.edges.push({
          source: `industry_${industry.code}`,
          target: `stock_${stock.symbol}`,
          type: 'industry_stock',
          strength: 1.0,
          market_share: stock.industry_market_share || 0
        });
      }
    });
  }

  // 정책-종목 직접 연결 분석
  analyzePolicyStockConnections(policyData, stockData, graph) {
    policyData.forEach(policy => {
      stockData.forEach(stock => {
        const directRelevance = this.calculateDirectPolicyStockRelevance(policy, stock);
        
        if (directRelevance > 0.4) {
          graph.edges.push({
            source: `policy_${policy.id}`,
            target: `stock_${stock.symbol}`,
            type: 'policy_stock_direct',
            strength: directRelevance,
            impact_mechanism: this.identifyImpactMechanism(policy, stock)
          });
        }
      });
    });
  }

  // 정책-종목 직접 관련성 계산
  calculateDirectPolicyStockRelevance(policy, stock) {
    const factors = {
      keyword_match: this.calculateKeywordMatch(policy.keywords, stock.business_keywords),
      revenue_exposure: stock.government_revenue_ratio || 0,
      regulatory_impact: this.assessRegulatoryImpact(policy, stock),
      geographic_overlap: this.calculateGeographicOverlap(policy, stock)
    };

    return Object.values(factors).reduce((sum, val) => sum + val, 0) / Object.keys(factors).length;
  }

  // 키워드 매칭 계산
  calculateKeywordMatch(policyKeywords, stockKeywords) {
    if (!policyKeywords || !stockKeywords) return 0;
    
    let matches = 0;
    policyKeywords.forEach(pk => {
      stockKeywords.forEach(sk => {
        if (pk.toLowerCase() === sk.toLowerCase()) matches++;
      });
    });

    return Math.min(matches / Math.max(policyKeywords.length, 1), 1.0);
  }

  // 규제 영향 평가
  assessRegulatoryImpact(policy, stock) {
    // 실제로는 더 복잡한 규제 영향 분석 로직
    return policy.regulatory_intensity * stock.regulatory_sensitivity || 0;
  }

  // 지리적 중복 계산
  calculateGeographicOverlap(policy, stock) {
    // 실제로는 정책 적용 지역과 기업 사업 지역의 중복도 계산
    return 0.5; // 임시값
  }

  // 영향 메커니즘 식별
  identifyImpactMechanism(policy, stock) {
    return 'subsidy'; // 임시값, 실제로는 보조금, 규제, 세제혜택 등 분류
  }
}

// 동반 상승 상관 프레임
export class CoRisingCorrelationFrame {
  constructor() {
    this.correlationThreshold = 0.7;
    this.timeWindows = [5, 10, 20, 60]; // 일 단위
  }

  // 동반 상승 종목 쌍 분석
  async analyzeCoRisingPairs(stockPriceData, timeWindow = 20) {
    try {
      const pairs = [];
      const symbols = Object.keys(stockPriceData);

      for (let i = 0; i < symbols.length; i++) {
        for (let j = i + 1; j < symbols.length; j++) {
          const symbol1 = symbols[i];
          const symbol2 = symbols[j];
          
          const correlation = await this.calculatePairCorrelation(
            stockPriceData[symbol1], 
            stockPriceData[symbol2], 
            timeWindow
          );

          if (correlation.correlation > this.correlationThreshold) {
            pairs.push({
              symbol1,
              symbol2,
              correlation: correlation.correlation,
              p_value: correlation.p_value,
              timeWindow,
              coMovementScore: correlation.coMovementScore,
              leadLagRelation: correlation.leadLagRelation
            });
          }
        }
      }

      return pairs.sort((a, b) => b.correlation - a.correlation);
    } catch (error) {
      console.error('동반 상승 분석 오류:', error);
      return [];
    }
  }

  // 쌍별 상관관계 계산
  async calculatePairCorrelation(data1, data2, timeWindow) {
    const returns1 = this.calculateReturns(data1.slice(-timeWindow));
    const returns2 = this.calculateReturns(data2.slice(-timeWindow));

    const correlation = calculateCorrelation(returns1, returns2);
    const coMovementScore = this.calculateCoMovementScore(returns1, returns2);
    const leadLagRelation = this.analyzeLadLagRelation(returns1, returns2);

    return {
      correlation,
      p_value: this.calculatePValue(correlation, timeWindow),
      coMovementScore,
      leadLagRelation
    };
  }

  // 수익률 계산 (최적화 + 에러 핸들링)
  calculateReturns(priceData) {
    if (!Array.isArray(priceData) || priceData.length < 2) {
      console.warn('수익률 계산: 불충분한 데이터');
      return [];
    }

    try {
      const returns = new Array(priceData.length - 1);
      for (let i = 1; i < priceData.length; i++) {
        const current = priceData[i]?.close;
        const previous = priceData[i-1]?.close;
        
        if (typeof current !== 'number' || typeof previous !== 'number' || previous === 0) {
          returns[i-1] = 0; // 무효한 데이터의 경우 0으로 처리
          continue;
        }
        
        returns[i-1] = (current - previous) / previous;
      }
      return returns;
    } catch (error) {
      console.error('수익률 계산 오류:', error);
      return [];
    }
  }

  // 동조 움직임 점수 계산
  calculateCoMovementScore(returns1, returns2) {
    let sameDirectionCount = 0;
    
    for (let i = 0; i < Math.min(returns1.length, returns2.length); i++) {
      if ((returns1[i] > 0 && returns2[i] > 0) || (returns1[i] < 0 && returns2[i] < 0)) {
        sameDirectionCount++;
      }
    }

    return sameDirectionCount / Math.min(returns1.length, returns2.length);
  }

  // 선행-후행 관계 분석
  analyzeLadLagRelation(returns1, returns2) {
    const maxLag = 5;
    let bestLag = 0;
    let bestCorrelation = 0;

    for (let lag = -maxLag; lag <= maxLag; lag++) {
      const correlation = this.calculateLaggedCorrelation(returns1, returns2, lag);
      if (Math.abs(correlation) > Math.abs(bestCorrelation)) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }

    return {
      lag: bestLag,
      correlation: bestCorrelation,
      leader: bestLag > 0 ? 'symbol1' : bestLag < 0 ? 'symbol2' : 'simultaneous'
    };
  }

  // 지연 상관관계 계산 (최적화 + 에러 핸들링)
  calculateLaggedCorrelation(returns1, returns2, lag) {
    if (!Array.isArray(returns1) || !Array.isArray(returns2)) {
      console.warn('지연 상관관계 계산: 유효하지 않은 입력 데이터');
      return 0;
    }

    const minLength = Math.min(returns1.length, returns2.length);
    const absLag = Math.abs(lag);
    
    if (minLength <= absLag) {
      console.warn(`지연 상관관계 계산: 데이터 길이(${minLength})가 지연값(${absLag})보다 작음`);
      return 0;
    }

    try {
      let adjustedReturns1, adjustedReturns2;

      if (lag > 0) {
        adjustedReturns1 = returns1.slice(lag);
        adjustedReturns2 = returns2.slice(0, -lag);
      } else if (lag < 0) {
        adjustedReturns1 = returns1.slice(0, lag);
        adjustedReturns2 = returns2.slice(-lag);
      } else {
        adjustedReturns1 = returns1;
        adjustedReturns2 = returns2;
      }

      return calculateCorrelation(adjustedReturns1, adjustedReturns2);
    } catch (error) {
      console.error('지연 상관관계 계산 오류:', error);
      return 0;
    }
  }

  // P-값 계산 (간단한 근사)
  calculatePValue(correlation, sampleSize) {
    const tStat = correlation * Math.sqrt((sampleSize - 2) / (1 - correlation * correlation));
    // 실제로는 t-분포를 사용해야 하지만, 간단한 근사값 사용
    return Math.exp(-Math.abs(tStat));
  }

  // 업종별 동반 상승 그룹 식별
  identifyCoMovementGroups(coRisingPairs, stockMetadata) {
    const groups = new Map();
    const visited = new Set();

    coRisingPairs.forEach(pair => {
      if (!visited.has(pair.symbol1) && !visited.has(pair.symbol2)) {
        const groupId = `group_${groups.size + 1}`;
        const group = {
          id: groupId,
          members: [pair.symbol1, pair.symbol2],
          avgCorrelation: pair.correlation,
          industry: stockMetadata[pair.symbol1]?.industry || 'unknown'
        };

        groups.set(groupId, group);
        visited.add(pair.symbol1);
        visited.add(pair.symbol2);
      }
    });

    return Array.from(groups.values());
  }
}

// 에너지/소재 ↔ 생산 단가 영향 프레임
export class EnergyMaterialCostFrame {
  constructor() {
    this.energySources = ['crude_oil', 'natural_gas', 'electricity', 'coal'];
    this.materials = ['steel', 'copper', 'aluminum', 'nickel', 'lithium'];
    this.impactFactors = new Map();
  }

  // 에너지/소재 비용 영향 분석
  async analyzeEnergyMaterialImpact(stockData, commodityData, industryMapping) {
    try {
      const impactAnalysis = {
        individual_stocks: {},
        industry_aggregates: {},
        cost_sensitivity_ranking: [],
        price_elasticity: {}
      };

      // 개별 종목 분석
      for (const stock of stockData) {
        impactAnalysis.individual_stocks[stock.symbol] = await this.analyzeStockEnergyImpact(
          stock, commodityData, industryMapping
        );
      }

      // 업종별 집계 분석
      impactAnalysis.industry_aggregates = this.aggregateByIndustry(
        impactAnalysis.individual_stocks, stockData
      );

      // 비용 민감도 랭킹
      impactAnalysis.cost_sensitivity_ranking = this.createSensitivityRanking(
        impactAnalysis.individual_stocks
      );

      // 가격 탄력성 분석
      impactAnalysis.price_elasticity = await this.calculatePriceElasticity(
        stockData, commodityData
      );

      return impactAnalysis;
    } catch (error) {
      console.error('에너지/소재 비용 영향 분석 오류:', error);
      return {};
    }
  }

  // 개별 종목 에너지 영향 분석
  async analyzeStockEnergyImpact(stock, commodityData, industryMapping) {
    const industry = industryMapping[stock.industry_code];
    const energyProfile = this.getIndustryEnergyProfile(industry);

    const impact = {
      overall_sensitivity: 0,
      energy_breakdown: {},
      material_breakdown: {},
      cost_structure_impact: {},
      margin_pressure_score: 0
    };

    // 에너지별 영향 분석
    for (const energyType of this.energySources) {
      const sensitivity = energyProfile.energy_weights[energyType] || 0;
      const priceVolatility = this.calculateCommodityVolatility(commodityData[energyType]);
      
      impact.energy_breakdown[energyType] = {
        sensitivity,
        price_volatility: priceVolatility,
        impact_score: sensitivity * priceVolatility,
        cost_pass_through_ability: this.estimateCostPassThrough(stock, energyType)
      };
    }

    // 소재별 영향 분석
    for (const material of this.materials) {
      const sensitivity = energyProfile.material_weights[material] || 0;
      const priceVolatility = this.calculateCommodityVolatility(commodityData[material]);
      
      impact.material_breakdown[material] = {
        sensitivity,
        price_volatility: priceVolatility,
        impact_score: sensitivity * priceVolatility,
        substitution_possibility: this.assessSubstitutionPossibility(stock, material)
      };
    }

    // 전체 민감도 계산
    impact.overall_sensitivity = this.calculateOverallSensitivity(
      impact.energy_breakdown, impact.material_breakdown
    );

    // 마진 압박 점수
    impact.margin_pressure_score = this.calculateMarginPressureScore(
      impact, stock.financial_metrics
    );

    return impact;
  }

  // 업종별 에너지 프로필 조회
  getIndustryEnergyProfile(industry) {
    const profiles = {
      'manufacturing': {
        energy_weights: { electricity: 0.4, natural_gas: 0.3, crude_oil: 0.2, coal: 0.1 },
        material_weights: { steel: 0.3, aluminum: 0.2, copper: 0.2, nickel: 0.1, lithium: 0.1 }
      },
      'transportation': {
        energy_weights: { crude_oil: 0.6, electricity: 0.2, natural_gas: 0.1, coal: 0.1 },
        material_weights: { steel: 0.4, aluminum: 0.3, copper: 0.1, nickel: 0.1, lithium: 0.1 }
      },
      'utilities': {
        energy_weights: { natural_gas: 0.4, coal: 0.3, crude_oil: 0.2, electricity: 0.1 },
        material_weights: { copper: 0.3, steel: 0.2, aluminum: 0.2, nickel: 0.2, lithium: 0.1 }
      },
      'default': {
        energy_weights: { electricity: 0.25, natural_gas: 0.25, crude_oil: 0.25, coal: 0.25 },
        material_weights: { steel: 0.2, copper: 0.2, aluminum: 0.2, nickel: 0.2, lithium: 0.2 }
      }
    };

    return profiles[industry?.toLowerCase()] || profiles['default'];
  }

  // 원자재 가격 변동성 계산
  calculateCommodityVolatility(priceData) {
    if (!priceData || priceData.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < priceData.length; i++) {
      returns.push((priceData[i] - priceData[i-1]) / priceData[i-1]);
    }

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  // 비용 전가 능력 추정
  estimateCostPassThrough(stock, energyType) {
    const factors = {
      market_power: stock.market_share || 0.1,
      brand_strength: stock.brand_score || 0.5,
      product_differentiation: stock.differentiation_score || 0.5,
      customer_loyalty: stock.loyalty_score || 0.5
    };

    return Object.values(factors).reduce((sum, val) => sum + val, 0) / Object.keys(factors).length;
  }

  // 대체 가능성 평가
  assessSubstitutionPossibility(stock, material) {
    // 실제로는 더 복잡한 로직 필요
    const substitutionMatrix = {
      'steel': 0.6,
      'aluminum': 0.7,
      'copper': 0.4,
      'nickel': 0.5,
      'lithium': 0.3
    };

    return substitutionMatrix[material] || 0.5;
  }

  // 전체 민감도 계산
  calculateOverallSensitivity(energyBreakdown, materialBreakdown) {
    const energyImpact = Object.values(energyBreakdown)
      .reduce((sum, item) => sum + item.impact_score, 0);
    
    const materialImpact = Object.values(materialBreakdown)
      .reduce((sum, item) => sum + item.impact_score, 0);

    return (energyImpact + materialImpact) / 2;
  }

  // 마진 압박 점수 계산
  calculateMarginPressureScore(impact, financialMetrics) {
    const costSensitivity = impact.overall_sensitivity;
    const marginBuffer = financialMetrics?.operating_margin || 0.1;
    const fixedCostRatio = financialMetrics?.fixed_cost_ratio || 0.5;

    return costSensitivity * (1 - marginBuffer) * fixedCostRatio;
  }

  // 업종별 집계
  aggregateByIndustry(individualAnalysis, stockData) {
    const industryAggregates = {};

    stockData.forEach(stock => {
      const industry = stock.industry;
      if (!industryAggregates[industry]) {
        industryAggregates[industry] = {
          total_sensitivity: 0,
          stock_count: 0,
          avg_margin_pressure: 0,
          top_vulnerabilities: []
        };
      }

      const stockAnalysis = individualAnalysis[stock.symbol];
      industryAggregates[industry].total_sensitivity += stockAnalysis.overall_sensitivity;
      industryAggregates[industry].avg_margin_pressure += stockAnalysis.margin_pressure_score;
      industryAggregates[industry].stock_count++;
    });

    // 평균 계산
    Object.values(industryAggregates).forEach(industry => {
      industry.avg_sensitivity = industry.total_sensitivity / industry.stock_count;
      industry.avg_margin_pressure = industry.avg_margin_pressure / industry.stock_count;
    });

    return industryAggregates;
  }

  // 민감도 랭킹 생성
  createSensitivityRanking(individualAnalysis) {
    return Object.entries(individualAnalysis)
      .map(([symbol, analysis]) => ({
        symbol,
        sensitivity: analysis.overall_sensitivity,
        margin_pressure: analysis.margin_pressure_score,
        risk_score: analysis.overall_sensitivity * analysis.margin_pressure_score
      }))
      .sort((a, b) => b.risk_score - a.risk_score);
  }

  // 가격 탄력성 분석
  async calculatePriceElasticity(stockData, commodityData) {
    const elasticity = {};

    for (const stock of stockData) {
      elasticity[stock.symbol] = {};
      
      for (const commodity of [...this.energySources, ...this.materials]) {
        if (commodityData[commodity]) {
          elasticity[stock.symbol][commodity] = await this.calculateStockCommodityElasticity(
            stock.price_history, commodityData[commodity]
          );
        }
      }
    }

    return elasticity;
  }

  // 개별 주식-원자재 탄력성 계산
  async calculateStockCommodityElasticity(stockPrices, commodityPrices) {
    // 간단한 탄력성 계산 (실제로는 더 복잡한 계량경제학적 모델 필요)
    const stockReturns = this.calculateReturns(stockPrices);
    const commodityReturns = this.calculateReturns(commodityPrices);

    if (stockReturns.length !== commodityReturns.length || stockReturns.length === 0) {
      return 0;
    }

    // 단순 선형 회귀로 탄력성 근사
    const correlation = calculateCorrelation(stockReturns, commodityReturns);
    const stockVolatility = this.calculateVolatility(stockReturns);
    const commodityVolatility = this.calculateVolatility(commodityReturns);

    return correlation * (stockVolatility / commodityVolatility);
  }

  // 수익률 계산
  calculateReturns(priceData) {
    const returns = [];
    for (let i = 1; i < priceData.length; i++) {
      returns.push((priceData[i] - priceData[i-1]) / priceData[i-1]);
    }
    return returns;
  }

  // 변동성 계산
  calculateVolatility(returns) {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }
}

// 환율 민감 종목 스코어링 프레임
export class ExchangeRateSensitivityFrame {
  constructor() {
    this.currencies = ['USD', 'EUR', 'JPY', 'CNY', 'GBP'];
    this.sensitivityThreshold = 0.3;
  }

  // 환율 민감도 종합 분석
  async analyzeExchangeRateSensitivity(stockData, exchangeRateData, tradeData) {
    try {
      const analysis = {
        individual_scores: {},
        industry_aggregates: {},
        currency_exposure_matrix: {},
        hedging_effectiveness: {},
        sensitivity_ranking: []
      };

      // 개별 종목 분석
      for (const stock of stockData) {
        analysis.individual_scores[stock.symbol] = await this.calculateStockExchangeSensitivity(
          stock, exchangeRateData, tradeData
        );
      }

      // 업종별 집계
      analysis.industry_aggregates = this.aggregateByIndustry(
        analysis.individual_scores, stockData
      );

      // 통화 노출 매트릭스
      analysis.currency_exposure_matrix = this.createCurrencyExposureMatrix(
        analysis.individual_scores
      );

      // 헤징 효과성 분석
      analysis.hedging_effectiveness = this.analyzeHedgingEffectiveness(
        stockData, analysis.individual_scores
      );

      // 민감도 랭킹
      analysis.sensitivity_ranking = this.createSensitivityRanking(
        analysis.individual_scores
      );

      return analysis;
    } catch (error) {
      console.error('환율 민감도 분석 오류:', error);
      return {};
    }
  }

  // 개별 종목 환율 민감도 계산 (최적화 버전)
  async calculateStockExchangeSensitivity(stock, exchangeRateData, tradeData) {
    const sensitivity = {
      overall_score: 0,
      currency_breakdown: {},
      exposure_factors: {},
      risk_metrics: {},
      hedging_ratio: 0
    };

    // 병렬 처리로 성능 최적화
    const currencyPromises = this.currencies.map(async (currency) => {
      const [exposureFactor, priceCorrelation] = await Promise.all([
        Promise.resolve(this.calculateCurrencyExposure(stock, currency, tradeData)),
        this.calculateExchangeRateCorrelation(
          stock.price_history, 
          exchangeRateData[`KRW_${currency}`]
        )
      ]);

      return {
        currency,
        exposure_factor: exposureFactor,
        price_correlation: priceCorrelation,
        sensitivity_score: exposureFactor * Math.abs(priceCorrelation),
        direction: priceCorrelation > 0 ? 'positive' : 'negative'
      };
    });

    const currencyResults = await Promise.all(currencyPromises);
    
    // 결과를 sensitivity.currency_breakdown에 저장
    currencyResults.forEach(result => {
      const { currency, ...data } = result;
      sensitivity.currency_breakdown[currency] = data;
    });

    // 노출 요인 분석
    sensitivity.exposure_factors = this.analyzeExposureFactors(stock, tradeData);

    // 리스크 메트릭 계산
    sensitivity.risk_metrics = this.calculateRiskMetrics(sensitivity.currency_breakdown);

    // 헤징 비율 추정
    sensitivity.hedging_ratio = this.estimateHedgingRatio(stock);

    // 전체 점수 계산
    sensitivity.overall_score = this.calculateOverallSensitivityScore(sensitivity);

    return sensitivity;
  }

  // 통화 노출도 계산
  calculateCurrencyExposure(stock, currency, tradeData) {
    const factors = {
      export_ratio: this.getExportRatio(stock, currency, tradeData),
      import_ratio: this.getImportRatio(stock, currency, tradeData),
      foreign_revenue_ratio: stock.foreign_revenue?.[currency] || 0,
      foreign_assets_ratio: stock.foreign_assets?.[currency] || 0,
      debt_exposure: stock.foreign_debt?.[currency] || 0
    };

    // 가중 평균으로 노출도 계산
    const weights = { export_ratio: 0.3, import_ratio: 0.2, foreign_revenue_ratio: 0.3, foreign_assets_ratio: 0.1, debt_exposure: 0.1 };
    
    return Object.entries(factors).reduce((sum, [factor, value]) => {
      return sum + (value * weights[factor]);
    }, 0);
  }

  // 수출 비율 계산
  getExportRatio(stock, currency, tradeData) {
    const stockTradeData = tradeData[stock.symbol];
    if (!stockTradeData || !stockTradeData.exports) return 0;

    const totalExports = Object.values(stockTradeData.exports).reduce((sum, val) => sum + val, 0);
    const currencyExports = stockTradeData.exports[currency] || 0;

    return totalExports > 0 ? currencyExports / totalExports : 0;
  }

  // 수입 비율 계산
  getImportRatio(stock, currency, tradeData) {
    const stockTradeData = tradeData[stock.symbol];
    if (!stockTradeData || !stockTradeData.imports) return 0;

    const totalImports = Object.values(stockTradeData.imports).reduce((sum, val) => sum + val, 0);
    const currencyImports = stockTradeData.imports[currency] || 0;

    return totalImports > 0 ? currencyImports / totalImports : 0;
  }

  // 환율 상관관계 계산
  async calculateExchangeRateCorrelation(stockPrices, exchangeRateData) {
    if (!stockPrices || !exchangeRateData || stockPrices.length !== exchangeRateData.length) {
      return 0;
    }

    const stockReturns = this.calculateReturns(stockPrices);
    const fxReturns = this.calculateReturns(exchangeRateData);

    return calculateCorrelation(stockReturns, fxReturns);
  }

  // 노출 요인 분석
  analyzeExposureFactors(stock, tradeData) {
    return {
      business_model_exposure: this.assessBusinessModelExposure(stock),
      supply_chain_exposure: this.assessSupplyChainExposure(stock, tradeData),
      customer_base_exposure: this.assessCustomerBaseExposure(stock),
      competitive_position: this.assessCompetitivePosition(stock),
      operational_leverage: this.calculateOperationalLeverage(stock)
    };
  }

  // 사업모델 노출도 평가
  assessBusinessModelExposure(stock) {
    const exportDependency = stock.export_revenue_ratio || 0;
    const importDependency = stock.import_cost_ratio || 0;
    const foreignOperations = stock.foreign_operations_ratio || 0;

    return (exportDependency + importDependency + foreignOperations) / 3;
  }

  // 공급망 노출도 평가
  assessSupplyChainExposure(stock, tradeData) {
    const stockTradeData = tradeData[stock.symbol];
    if (!stockTradeData) return 0.5; // 기본값

    const importConcentration = this.calculateImportConcentration(stockTradeData.imports);
    const supplierDiversification = stock.supplier_diversification_score || 0.5;

    return importConcentration * (1 - supplierDiversification);
  }

  // 수입 집중도 계산
  calculateImportConcentration(imports) {
    if (!imports) return 0;

    const values = Object.values(imports);
    const total = values.reduce((sum, val) => sum + val, 0);
    
    if (total === 0) return 0;

    // 허핀달 지수 사용
    return values.reduce((sum, val) => sum + Math.pow(val / total, 2), 0);
  }

  // 고객 기반 노출도 평가
  assessCustomerBaseExposure(stock) {
    return stock.foreign_customer_ratio || 0.3; // 기본값
  }

  // 경쟁력 평가
  assessCompetitivePosition(stock) {
    const factors = {
      market_share: stock.market_share || 0.1,
      brand_power: stock.brand_score || 0.5,
      cost_competitiveness: stock.cost_advantage_score || 0.5,
      technology_advantage: stock.tech_advantage_score || 0.5
    };

    return Object.values(factors).reduce((sum, val) => sum + val, 0) / Object.keys(factors).length;
  }

  // 운영 레버리지 계산
  calculateOperationalLeverage(stock) {
    const fixedCosts = stock.fixed_costs || stock.total_costs * 0.6; // 기본 가정
    const totalCosts = stock.total_costs || 1;

    return fixedCosts / totalCosts;
  }

  // 리스크 메트릭 계산
  calculateRiskMetrics(currencyBreakdown) {
    const sensitivities = Object.values(currencyBreakdown).map(c => c.sensitivity_score);
    
    return {
      max_sensitivity: Math.max(...sensitivities),
      avg_sensitivity: sensitivities.reduce((sum, s) => sum + s, 0) / sensitivities.length,
      sensitivity_variance: this.calculateVariance(sensitivities),
      concentration_risk: this.calculateConcentrationRisk(sensitivities)
    };
  }

  // 분산 계산
  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  // 집중 리스크 계산
  calculateConcentrationRisk(sensitivities) {
    const total = sensitivities.reduce((sum, s) => sum + s, 0);
    if (total === 0) return 0;

    // 허핀달 지수 사용
    return sensitivities.reduce((sum, s) => sum + Math.pow(s / total, 2), 0);
  }

  // 헤징 비율 추정
  estimateHedgingRatio(stock) {
    // 실제로는 파생상품 보유 현황, 헤징 정책 등을 분석해야 함
    const factors = {
      company_size: Math.min(stock.market_cap / 1000000000, 1), // 조 단위로 정규화
      foreign_exposure: stock.foreign_revenue_ratio || 0,
      industry_practice: this.getIndustryHedgingPractice(stock.industry),
      risk_management_score: stock.risk_management_score || 0.5
    };

    return Object.values(factors).reduce((sum, val) => sum + val, 0) / Object.keys(factors).length;
  }

  // 업종별 헤징 관행 조회
  getIndustryHedgingPractice(industry) {
    const practices = {
      'export_manufacturing': 0.7,
      'import_dependent': 0.6,
      'global_operations': 0.8,
      'domestic_focused': 0.2,
      'default': 0.4
    };

    return practices[industry?.toLowerCase()] || practices['default'];
  }

  // 전체 민감도 점수 계산
  calculateOverallSensitivityScore(sensitivity) {
    const currencyScores = Object.values(sensitivity.currency_breakdown)
      .map(c => c.sensitivity_score);
    
    const maxSensitivity = Math.max(...currencyScores);
    const avgSensitivity = currencyScores.reduce((sum, s) => sum + s, 0) / currencyScores.length;
    
    // 헤징 효과 반영
    const hedgingAdjustment = 1 - sensitivity.hedging_ratio * 0.5;
    
    return (maxSensitivity * 0.6 + avgSensitivity * 0.4) * hedgingAdjustment;
  }

  // 수익률 계산
  calculateReturns(priceData) {
    const returns = [];
    for (let i = 1; i < priceData.length; i++) {
      returns.push((priceData[i] - priceData[i-1]) / priceData[i-1]);
    }
    return returns;
  }

  // 업종별 집계
  aggregateByIndustry(individualScores, stockData) {
    const industryAggregates = {};

    stockData.forEach(stock => {
      const industry = stock.industry;
      if (!industryAggregates[industry]) {
        industryAggregates[industry] = {
          total_sensitivity: 0,
          stock_count: 0,
          currency_exposures: {}
        };
      }

      const stockAnalysis = individualScores[stock.symbol];
      industryAggregates[industry].total_sensitivity += stockAnalysis.overall_score;
      industryAggregates[industry].stock_count++;

      // 통화별 노출 집계
      Object.entries(stockAnalysis.currency_breakdown).forEach(([currency, data]) => {
        if (!industryAggregates[industry].currency_exposures[currency]) {
          industryAggregates[industry].currency_exposures[currency] = 0;
        }
        industryAggregates[industry].currency_exposures[currency] += data.sensitivity_score;
      });
    });

    // 평균 계산
    Object.values(industryAggregates).forEach(industry => {
      industry.avg_sensitivity = industry.total_sensitivity / industry.stock_count;
      
      Object.keys(industry.currency_exposures).forEach(currency => {
        industry.currency_exposures[currency] /= industry.stock_count;
      });
    });

    return industryAggregates;
  }

  // 통화 노출 매트릭스 생성
  createCurrencyExposureMatrix(individualScores) {
    const matrix = {};

    this.currencies.forEach(currency => {
      matrix[currency] = {};
      
      Object.entries(individualScores).forEach(([symbol, analysis]) => {
        matrix[currency][symbol] = analysis.currency_breakdown[currency]?.sensitivity_score || 0;
      });
    });

    return matrix;
  }

  // 헤징 효과성 분석
  analyzeHedgingEffectiveness(stockData, individualScores) {
    const effectiveness = {};

    stockData.forEach(stock => {
      const analysis = individualScores[stock.symbol];
      
      effectiveness[stock.symbol] = {
        hedging_ratio: analysis.hedging_ratio,
        risk_reduction: this.calculateRiskReduction(analysis),
        cost_effectiveness: this.estimateHedgingCostEffectiveness(stock, analysis),
        optimal_hedge_ratio: this.calculateOptimalHedgeRatio(analysis)
      };
    });

    return effectiveness;
  }

  // 리스크 감소 효과 계산
  calculateRiskReduction(analysis) {
    const unhedgedRisk = analysis.overall_score / (1 - analysis.hedging_ratio * 0.5);
    const hedgedRisk = analysis.overall_score;

    return (unhedgedRisk - hedgedRisk) / unhedgedRisk;
  }

  // 헤징 비용 효과성 추정
  estimateHedgingCostEffectiveness(stock, analysis) {
    const hedgingCost = analysis.hedging_ratio * 0.02; // 2% 비용 가정
    const riskReduction = this.calculateRiskReduction(analysis);

    return riskReduction / hedgingCost;
  }

  // 최적 헤지 비율 계산
  calculateOptimalHedgeRatio(analysis) {
    // 간단한 최적화 (실제로는 더 복잡한 포트폴리오 이론 적용)
    const riskAversion = 2; // 위험 기피도
    const hedgingCost = 0.02;
    
    return Math.min(analysis.overall_score * riskAversion / hedgingCost, 1.0);
  }

  // 민감도 랭킹 생성
  createSensitivityRanking(individualScores) {
    return Object.entries(individualScores)
      .map(([symbol, analysis]) => ({
        symbol,
        overall_sensitivity: analysis.overall_score,
        max_currency_sensitivity: analysis.risk_metrics.max_sensitivity,
        hedging_ratio: analysis.hedging_ratio,
        adjusted_risk: analysis.overall_score * (1 - analysis.hedging_ratio * 0.5)
      }))
      .sort((a, b) => b.adjusted_risk - a.adjusted_risk);
  }
}

// 성능 최적화 유틸리티 클래스
export class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100; // 최대 캐시 크기
  }

  // 메모이제이션 캐시
  memoize(fn, keyGenerator) {
    return (...args) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }

      const result = fn(...args);
      
      // 캐시 크기 관리
      if (this.cache.size >= this.maxCacheSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      this.cache.set(key, result);
      return result;
    };
  }

  // 청크 단위 배열 처리
  processInChunks(array, chunkSize, processor) {
    return new Promise((resolve) => {
      const results = [];
      let index = 0;

      const processChunk = () => {
        const chunk = array.slice(index, index + chunkSize);
        if (chunk.length === 0) {
          resolve(results);
          return;
        }

        const chunkResults = chunk.map(processor);
        results.push(...chunkResults);
        index += chunkSize;

        // 다음 청크를 비동기적으로 처리
        setTimeout(processChunk, 0);
      };

      processChunk();
    });
  }

  // 메모리 사용량 최적화를 위한 데이터 정리
  cleanupData(data, maxAge = 3600000) { // 1시간
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, value] of data.entries()) {
      if (value.timestamp && (now - new Date(value.timestamp).getTime()) > maxAge) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => data.delete(key));
    return keysToDelete.length;
  }
}

// 에러 핸들링 유틸리티
export class ErrorHandler {
  static handleAsyncError(fn, fallbackValue = null) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        console.error(`비동기 작업 오류 (${fn.name}):`, error);
        return fallbackValue;
      }
    };
  }

  static validateNumericalArray(data, name = '데이터') {
    if (!Array.isArray(data)) {
      throw new Error(`${name}가 배열이 아닙니다.`);
    }
    if (data.length === 0) {
      throw new Error(`${name}가 비어있습니다.`);
    }
    if (!data.every(item => typeof item === 'number' && !isNaN(item))) {
      throw new Error(`${name}에 유효하지 않은 숫자가 포함되어 있습니다.`);
    }
    return true;
  }

  static safeCalculation(calculation, fallback = 0) {
    try {
      const result = calculation();
      return isNaN(result) || !isFinite(result) ? fallback : result;
    } catch (error) {
      console.warn('안전한 계산 실패:', error);
      return fallback;
    }
  }
}

export default {
  PolicyIndustryStockGraph,
  CoRisingCorrelationFrame,
  EnergyMaterialCostFrame,
  ExchangeRateSensitivityFrame,
  PerformanceOptimizer,
  ErrorHandler
}; 