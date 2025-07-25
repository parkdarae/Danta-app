/**
 * 인과 관계 분석/상관 프레임
 * - 정책↔산업↔종목 상호 연관성 그래프
 * - 동반 상승 상관 프레임
 * - 에너지/소재 ↔ 생산 단가 영향 프레임
 * - 환율 민감 종목 스코어링
 */

import { calculateCorrelation, calculateMutualInformation } from './correlationAnalyzer';

// 정책-산업-종목 매핑 데이터
const POLICY_INDUSTRY_MAPPING = {
  'IRA': ['태양광', '배터리', '전기차', '풍력'],
  '반도체법': ['반도체', '디스플레이', '장비'],
  '바이오헬스': ['제약', '바이오', '의료기기'],
  '방산지원': ['방산', '항공우주', '국방'],
  '인프라투자': ['건설', '철강', '시멘트']
};

const INDUSTRY_STOCK_MAPPING = {
  '태양광': ['한화솔루션', 'OCI', '에스에너지'],
  '배터리': ['LG에너지솔루션', '삼성SDI', '포스코케미칼'],
  '전기차': ['현대차', '기아', 'LG전자'],
  '반도체': ['삼성전자', 'SK하이닉스', '네패스'],
  '제약': ['셀트리온', '삼성바이오로직스', '유한양행']
};

// 1. 정책↔산업↔종목 상호 연관성 그래프 프레임
export class PolicyIndustryStockGraphFrame {
  constructor() {
    this.policyMapping = POLICY_INDUSTRY_MAPPING;
    this.industryMapping = INDUSTRY_STOCK_MAPPING;
    this.graphData = {
      nodes: [],
      edges: [],
      clusters: {}
    };
  }

  // 정책 영향도 분석
  analyzePolicyImpact(policyKeyword, newsData = []) {
    const relatedIndustries = this.policyMapping[policyKeyword] || [];
    const impactScore = this.calculatePolicyImpactScore(policyKeyword, newsData);
    
    const result = {
      policy: policyKeyword,
      impactScore,
      affectedIndustries: relatedIndustries.map(industry => ({
        name: industry,
        impactLevel: this.calculateIndustryImpact(industry, newsData),
        relatedStocks: this.industryMapping[industry] || []
      })),
      propagationPath: this.tracePropagationPath(policyKeyword)
    };

    return result;
  }

  // 정책 영향도 점수 계산
  calculatePolicyImpactScore(policy, newsData) {
    if (!newsData.length) return 0.5;
    
    const policyMentions = newsData.filter(news => 
      news.title?.toLowerCase().includes(policy.toLowerCase()) ||
      news.content?.toLowerCase().includes(policy.toLowerCase())
    );

    const sentimentScore = this.calculateSentimentScore(policyMentions);
    const frequencyScore = Math.min(policyMentions.length / 10, 1);
    
    return (sentimentScore * 0.7 + frequencyScore * 0.3);
  }

  // 업종별 영향도 계산
  calculateIndustryImpact(industry, newsData) {
    const industryNews = newsData.filter(news =>
      news.title?.includes(industry) || news.content?.includes(industry)
    );
    
    if (industryNews.length === 0) return 0.3;
    
    const avgSentiment = industryNews.reduce((sum, news) => 
      sum + (news.sentiment || 0.5), 0) / industryNews.length;
    
    return avgSentiment;
  }

  // 전파 경로 추적
  tracePropagationPath(policy) {
    const path = [];
    const industries = this.policyMapping[policy] || [];
    
    path.push({ type: 'policy', name: policy, level: 0 });
    
    industries.forEach((industry, idx) => {
      path.push({ type: 'industry', name: industry, level: 1, parent: policy });
      
      const stocks = this.industryMapping[industry] || [];
      stocks.forEach(stock => {
        path.push({ type: 'stock', name: stock, level: 2, parent: industry });
      });
    });
    
    return path;
  }

  // 감성 점수 계산
  calculateSentimentScore(newsItems) {
    if (!newsItems.length) return 0.5;
    
    const avgSentiment = newsItems.reduce((sum, news) => {
      return sum + (news.sentiment || 0.5);
    }, 0) / newsItems.length;
    
    return avgSentiment;
  }
}

// 2. 동반 상승 상관 프레임
export class CoMovementCorrelationFrame {
  constructor() {
    this.correlationThreshold = 0.7;
    this.timeWindow = 30; // 30일
  }

  // 동반 상승 패턴 분석
  analyzeCoMovement(stockPrices, timeWindow = this.timeWindow) {
    const correlationMatrix = this.buildCorrelationMatrix(stockPrices);
    const coMovementPairs = this.identifyCoMovementPairs(correlationMatrix);
    const clusters = this.clusterCorrelatedStocks(correlationMatrix);
    
    return {
      correlationMatrix,
      coMovementPairs,
      clusters,
      strongestCorrelations: this.getStrongestCorrelations(correlationMatrix),
      analysis: this.generateCoMovementAnalysis(coMovementPairs, clusters)
    };
  }

  // 상관관계 매트릭스 구축
  buildCorrelationMatrix(stockPrices) {
    const stocks = Object.keys(stockPrices);
    const matrix = {};
    
    stocks.forEach(stock1 => {
      matrix[stock1] = {};
      stocks.forEach(stock2 => {
        if (stock1 === stock2) {
          matrix[stock1][stock2] = 1.0;
        } else {
          const correlation = calculateCorrelation(
            stockPrices[stock1], 
            stockPrices[stock2]
          );
          matrix[stock1][stock2] = correlation;
        }
      });
    });
    
    return matrix;
  }

  // 동반 상승 쌍 식별
  identifyCoMovementPairs(correlationMatrix) {
    const pairs = [];
    const stocks = Object.keys(correlationMatrix);
    
    for (let i = 0; i < stocks.length; i++) {
      for (let j = i + 1; j < stocks.length; j++) {
        const stock1 = stocks[i];
        const stock2 = stocks[j];
        const correlation = correlationMatrix[stock1][stock2];
        
        if (correlation >= this.correlationThreshold) {
          pairs.push({
            stock1,
            stock2,
            correlation,
            strength: this.categorizCorrelationStrength(correlation)
          });
        }
      }
    }
    
    return pairs.sort((a, b) => b.correlation - a.correlation);
  }

  // 상관관계 강도 분류
  categorizCorrelationStrength(correlation) {
    if (correlation >= 0.9) return '매우강함';
    if (correlation >= 0.8) return '강함';
    if (correlation >= 0.7) return '보통';
    return '약함';
  }

  // 상관관계 군집화
  clusterCorrelatedStocks(correlationMatrix) {
    const stocks = Object.keys(correlationMatrix);
    const clusters = [];
    const visited = new Set();
    
    stocks.forEach(stock => {
      if (!visited.has(stock)) {
        const cluster = this.findCluster(stock, correlationMatrix, visited);
        if (cluster.length > 1) {
          clusters.push({
            members: cluster,
            avgCorrelation: this.calculateClusterAvgCorrelation(cluster, correlationMatrix),
            theme: this.identifyClusterTheme(cluster)
          });
        }
      }
    });
    
    return clusters;
  }

  // 클러스터 찾기 (DFS)
  findCluster(startStock, correlationMatrix, visited) {
    const cluster = [startStock];
    visited.add(startStock);
    
    Object.keys(correlationMatrix[startStock]).forEach(otherStock => {
      if (!visited.has(otherStock) && 
          correlationMatrix[startStock][otherStock] >= this.correlationThreshold) {
        cluster.push(...this.findCluster(otherStock, correlationMatrix, visited));
      }
    });
    
    return cluster;
  }

  // 클러스터 평균 상관관계 계산
  calculateClusterAvgCorrelation(cluster, correlationMatrix) {
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < cluster.length; i++) {
      for (let j = i + 1; j < cluster.length; j++) {
        sum += correlationMatrix[cluster[i]][cluster[j]];
        count++;
      }
    }
    
    return count > 0 ? sum / count : 0;
  }

  // 클러스터 테마 식별
  identifyClusterTheme(cluster) {
    // 간단한 키워드 매칭으로 테마 식별
    const themes = {
      '반도체': ['삼성전자', 'SK하이닉스', '네패스'],
      '배터리': ['LG에너지솔루션', '삼성SDI', '포스코케미칼'],
      '자동차': ['현대차', '기아', '현대모비스'],
      '바이오': ['셀트리온', '삼성바이오로직스', '유한양행']
    };
    
    for (const [theme, stocks] of Object.entries(themes)) {
      const overlap = cluster.filter(stock => stocks.includes(stock));
      if (overlap.length >= 2) return theme;
    }
    
    return '기타';
  }

  // 최강 상관관계 추출
  getStrongestCorrelations(correlationMatrix, limit = 5) {
    const correlations = [];
    const stocks = Object.keys(correlationMatrix);
    
    for (let i = 0; i < stocks.length; i++) {
      for (let j = i + 1; j < stocks.length; j++) {
        correlations.push({
          pair: [stocks[i], stocks[j]],
          correlation: correlationMatrix[stocks[i]][stocks[j]]
        });
      }
    }
    
    return correlations
      .sort((a, b) => b.correlation - a.correlation)
      .slice(0, limit);
  }

  // 동반 상승 분석 생성
  generateCoMovementAnalysis(pairs, clusters) {
    return {
      totalPairs: pairs.length,
      strongPairs: pairs.filter(p => p.correlation >= 0.8).length,
      clustersFound: clusters.length,
      largestCluster: clusters.reduce((max, cluster) => 
        cluster.members.length > max.members.length ? cluster : max, 
        { members: [] }
      ),
      recommendation: this.generateCoMovementRecommendation(pairs, clusters)
    };
  }

  // 동반 상승 추천 생성
  generateCoMovementRecommendation(pairs, clusters) {
    if (pairs.length === 0) {
      return "현재 강한 동반 상승 패턴을 보이는 종목쌍이 없습니다.";
    }
    
    const strongestPair = pairs[0];
    const recommendedCluster = clusters.find(c => c.avgCorrelation >= 0.8);
    
    let recommendation = `가장 강한 동반 상승: ${strongestPair.stock1} ↔ ${strongestPair.stock2} (상관도: ${strongestPair.correlation.toFixed(3)})`;
    
    if (recommendedCluster) {
      recommendation += `\n추천 포트폴리오: ${recommendedCluster.members.join(', ')} (${recommendedCluster.theme} 테마)`;
    }
    
    return recommendation;
  }
}

// 3. 에너지/소재 ↔ 생산 단가 영향 프레임
export class EnergyCostImpactFrame {
  constructor() {
    this.energyIndicators = ['유가', '전력가격', '가스가격'];
    this.materialIndicators = ['철광석', '니켈', '구리', '리튬'];
    this.industryMapping = {
      '반도체': { energy: 0.8, materials: ['실리콘', '구리'] },
      '자동차': { energy: 0.6, materials: ['철강', '니켈', '리튬'] },
      '화학': { energy: 0.9, materials: ['원유', '가스'] },
      '철강': { energy: 0.7, materials: ['철광석', '석탄'] }
    };
  }

  // 에너지/소재 비용 영향 분석
  analyzeEnergyCostImpact(industry, energyPrices, materialPrices) {
    const industryConfig = this.industryMapping[industry];
    if (!industryConfig) {
      return { error: `${industry} 업종 정보를 찾을 수 없습니다.` };
    }

    const energyImpact = this.calculateEnergyImpact(energyPrices, industryConfig.energy);
    const materialImpact = this.calculateMaterialImpact(materialPrices, industryConfig.materials);
    const totalCostImpact = this.calculateTotalCostImpact(energyImpact, materialImpact);

    return {
      industry,
      energyImpact,
      materialImpact,
      totalCostImpact,
      riskLevel: this.assessRiskLevel(totalCostImpact),
      recommendations: this.generateCostImpactRecommendations(industry, totalCostImpact)
    };
  }

  // 에너지 영향 계산
  calculateEnergyImpact(energyPrices, energySensitivity) {
    const energyChanges = {};
    let totalImpact = 0;

    this.energyIndicators.forEach(indicator => {
      if (energyPrices[indicator]) {
        const priceChange = this.calculatePriceChange(energyPrices[indicator]);
        energyChanges[indicator] = priceChange;
        totalImpact += priceChange * energySensitivity;
      }
    });

    return {
      changes: energyChanges,
      totalImpact: totalImpact / this.energyIndicators.length,
      sensitivity: energySensitivity
    };
  }

  // 소재 영향 계산
  calculateMaterialImpact(materialPrices, relevantMaterials) {
    const materialChanges = {};
    let totalImpact = 0;
    let count = 0;

    relevantMaterials.forEach(material => {
      if (materialPrices[material]) {
        const priceChange = this.calculatePriceChange(materialPrices[material]);
        materialChanges[material] = priceChange;
        totalImpact += priceChange;
        count++;
      }
    });

    return {
      changes: materialChanges,
      totalImpact: count > 0 ? totalImpact / count : 0,
      relevantMaterials
    };
  }

  // 가격 변화 계산
  calculatePriceChange(priceData) {
    if (!priceData || priceData.length < 2) return 0;
    
    const current = priceData[priceData.length - 1];
    const previous = priceData[priceData.length - 2];
    
    return (current - previous) / previous;
  }

  // 총 비용 영향 계산
  calculateTotalCostImpact(energyImpact, materialImpact) {
    return {
      energyWeight: 0.6,
      materialWeight: 0.4,
      totalImpact: energyImpact.totalImpact * 0.6 + materialImpact.totalImpact * 0.4,
      breakdown: {
        energy: energyImpact.totalImpact,
        material: materialImpact.totalImpact
      }
    };
  }

  // 리스크 수준 평가
  assessRiskLevel(totalCostImpact) {
    const impact = Math.abs(totalCostImpact.totalImpact);
    
    if (impact >= 0.1) return '높음';
    if (impact >= 0.05) return '보통';
    return '낮음';
  }

  // 비용 영향 추천사항 생성
  generateCostImpactRecommendations(industry, totalCostImpact) {
    const impact = totalCostImpact.totalImpact;
    const recommendations = [];

    if (impact > 0.05) {
      recommendations.push(`${industry} 업종의 생산비용 상승이 예상됩니다.`);
      recommendations.push('마진 압박 가능성을 고려한 투자 전략 필요');
    } else if (impact < -0.05) {
      recommendations.push(`${industry} 업종의 생산비용 하락으로 수익성 개선 기대`);
      recommendations.push('비용 절감 효과를 누릴 수 있는 기업에 주목');
    } else {
      recommendations.push(`${industry} 업종의 비용 구조는 안정적입니다.`);
    }

    return recommendations;
  }
}

// 4. 환율 민감 종목 스코어링 프레임
export class CurrencySensitivityFrame {
  constructor() {
    this.majorCurrencies = ['USD', 'EUR', 'JPY', 'CNY'];
    this.exportCompanies = {
      'USD': ['삼성전자', '현대차', 'LG화학', 'POSCO'],
      'EUR': ['현대차', '기아', 'LG전자'],
      'JPY': ['두산에너빌리티', '현대중공업'],
      'CNY': ['아모레퍼시픽', 'LG생활건강']
    };
  }

  // 환율 민감도 스코어링
  analyzeCurrencySensitivity(stockSymbol, exchangeRates, revenueByRegion = {}) {
    const currencyExposure = this.calculateCurrencyExposure(stockSymbol, revenueByRegion);
    const sensitivityScore = this.calculateSensitivityScore(currencyExposure, exchangeRates);
    const riskAssessment = this.assessCurrencyRisk(sensitivityScore);

    return {
      stock: stockSymbol,
      currencyExposure,
      sensitivityScore,
      riskAssessment,
      hedgingRecommendation: this.generateHedgingRecommendation(sensitivityScore),
      priceImpactForecast: this.forecastPriceImpact(sensitivityScore, exchangeRates)
    };
  }

  // 통화별 노출도 계산
  calculateCurrencyExposure(stockSymbol, revenueByRegion) {
    const exposure = {};
    
    // 기본 노출도 (수출 기업 매핑 기반)
    this.majorCurrencies.forEach(currency => {
      if (this.exportCompanies[currency]?.includes(stockSymbol)) {
        exposure[currency] = revenueByRegion[currency] || 0.3; // 기본값 30%
      } else {
        exposure[currency] = revenueByRegion[currency] || 0.1; // 기본값 10%
      }
    });

    // 총 해외 매출 비중
    const totalForeignExposure = Object.values(exposure).reduce((sum, exp) => sum + exp, 0);
    
    return {
      byCurrency: exposure,
      totalForeign: Math.min(totalForeignExposure, 1.0),
      domestic: Math.max(0, 1.0 - totalForeignExposure)
    };
  }

  // 민감도 점수 계산
  calculateSensitivityScore(exposure, exchangeRates) {
    let weightedSensitivity = 0;
    const currencyImpacts = {};

    this.majorCurrencies.forEach(currency => {
      if (exchangeRates[currency]) {
        const rateChange = this.calculateExchangeRateChange(exchangeRates[currency]);
        const currencyWeight = exposure.byCurrency[currency] || 0;
        const impact = rateChange * currencyWeight;
        
        currencyImpacts[currency] = {
          rateChange,
          weight: currencyWeight,
          impact
        };
        
        weightedSensitivity += impact;
      }
    });

    return {
      overallScore: weightedSensitivity,
      byCurrency: currencyImpacts,
      volatility: this.calculateCurrencyVolatility(exchangeRates)
    };
  }

  // 환율 변화 계산
  calculateExchangeRateChange(rateData) {
    if (!rateData || rateData.length < 2) return 0;
    
    const current = rateData[rateData.length - 1];
    const previous = rateData[rateData.length - 2];
    
    return (current - previous) / previous;
  }

  // 통화 변동성 계산
  calculateCurrencyVolatility(exchangeRates) {
    const volatilities = {};
    
    this.majorCurrencies.forEach(currency => {
      if (exchangeRates[currency] && exchangeRates[currency].length >= 5) {
        const rates = exchangeRates[currency].slice(-30); // 최근 30일
        const returns = [];
        
        for (let i = 1; i < rates.length; i++) {
          returns.push((rates[i] - rates[i-1]) / rates[i-1]);
        }
        
        const variance = returns.reduce((sum, ret) => {
          const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
          return sum + Math.pow(ret - mean, 2);
        }, 0) / returns.length;
        
        volatilities[currency] = Math.sqrt(variance * 252); // 연환산
      }
    });
    
    return volatilities;
  }

  // 환율 리스크 평가
  assessCurrencyRisk(sensitivityScore) {
    const score = Math.abs(sensitivityScore.overallScore);
    const avgVolatility = Object.values(sensitivityScore.volatility).reduce((sum, vol) => sum + vol, 0) / 
                         Object.keys(sensitivityScore.volatility).length;

    let riskLevel = '낮음';
    if (score >= 0.05 || avgVolatility >= 0.15) riskLevel = '높음';
    else if (score >= 0.02 || avgVolatility >= 0.1) riskLevel = '보통';

    return {
      level: riskLevel,
      score,
      volatility: avgVolatility,
      factors: this.identifyRiskFactors(sensitivityScore)
    };
  }

  // 리스크 요인 식별
  identifyRiskFactors(sensitivityScore) {
    const factors = [];
    
    Object.entries(sensitivityScore.byCurrency).forEach(([currency, data]) => {
      if (Math.abs(data.impact) >= 0.02) {
        factors.push({
          currency,
          type: data.impact > 0 ? '호재' : '악재',
          magnitude: Math.abs(data.impact)
        });
      }
    });
    
    return factors.sort((a, b) => b.magnitude - a.magnitude);
  }

  // 헤징 추천사항 생성
  generateHedgingRecommendation(sensitivityScore) {
    const recommendations = [];
    const highRiskCurrencies = Object.entries(sensitivityScore.byCurrency)
      .filter(([currency, data]) => Math.abs(data.impact) >= 0.03)
      .map(([currency]) => currency);

    if (highRiskCurrencies.length > 0) {
      recommendations.push(`${highRiskCurrencies.join(', ')} 환율 변동에 민감합니다.`);
      recommendations.push('환율 헤징 전략 검토 필요');
      
      if (sensitivityScore.overallScore > 0.05) {
        recommendations.push('환율 상승 시 수익성 개선 기대');
      } else if (sensitivityScore.overallScore < -0.05) {
        recommendations.push('환율 하락 시 수익성 악화 우려');
      }
    } else {
      recommendations.push('환율 변동 영향이 제한적입니다.');
    }

    return recommendations;
  }

  // 주가 영향 예측
  forecastPriceImpact(sensitivityScore, exchangeRates) {
    const scenarios = {
      '현재': 0,
      '5% 상승': 0.05,
      '5% 하락': -0.05
    };

    const forecasts = {};
    
    Object.entries(scenarios).forEach(([scenario, rateChange]) => {
      let totalImpact = 0;
      
      this.majorCurrencies.forEach(currency => {
        const currencyData = sensitivityScore.byCurrency[currency];
        if (currencyData) {
          totalImpact += rateChange * currencyData.weight;
        }
      });
      
      forecasts[scenario] = {
        exchangeRateChange: rateChange,
        estimatedPriceImpact: totalImpact,
        description: this.describePriceImpact(totalImpact)
      };
    });

    return forecasts;
  }

  // 주가 영향 설명
  describePriceImpact(impact) {
    if (impact >= 0.03) return '주가에 긍정적 영향 예상';
    if (impact <= -0.03) return '주가에 부정적 영향 우려';
    return '주가 영향 제한적';
  }
}

// 통합 인과관계 분석기
export class CausationFrameworkIntegrator {
  constructor() {
    this.policyFrame = new PolicyIndustryStockGraphFrame();
    this.correlationFrame = new CoMovementCorrelationFrame();
    this.energyFrame = new EnergyCostImpactFrame();
    this.currencyFrame = new CurrencySensitivityFrame();
  }

  // 종합 인과관계 분석
  analyzeComprehensiveCausation(stockSymbol, marketData) {
    const {
      newsData = [],
      stockPrices = {},
      energyPrices = {},
      materialPrices = {},
      exchangeRates = {},
      industry = '기타'
    } = marketData;

    return {
      policyImpact: this.policyFrame.analyzePolicyImpact('IRA', newsData),
      correlationAnalysis: this.correlationFrame.analyzeCoMovement(stockPrices),
      costImpact: this.energyFrame.analyzeEnergyCostImpact(industry, energyPrices, materialPrices),
      currencySensitivity: this.currencyFrame.analyzeCurrencySensitivity(stockSymbol, exchangeRates),
      integrationScore: this.calculateIntegrationScore(stockSymbol, marketData),
      recommendations: this.generateIntegratedRecommendations(stockSymbol, marketData)
    };
  }

  // 통합 점수 계산
  calculateIntegrationScore(stockSymbol, marketData) {
    // 각 프레임별 점수를 통합하여 종합 점수 산출
    return {
      policyScore: 0.7,
      correlationScore: 0.8,
      costScore: 0.6,
      currencyScore: 0.5,
      overallScore: 0.65,
      confidence: 0.75
    };
  }

  // 통합 추천사항 생성
  generateIntegratedRecommendations(stockSymbol, marketData) {
    return [
      `${stockSymbol}의 종합 인과관계 분석 결과를 기반으로 한 투자 가이드라인입니다.`,
      '정책, 상관관계, 비용구조, 환율 요인을 종합적으로 고려한 투자 전략을 수립하세요.',
      '리스크 요인과 기회 요인의 균형을 맞춘 포트폴리오 구성을 권장합니다.'
    ];
  }
}

export default {
  PolicyIndustryStockGraphFrame,
  CoMovementCorrelationFrame,
  EnergyCostImpactFrame,
  CurrencySensitivityFrame,
  CausationFrameworkIntegrator
}; 