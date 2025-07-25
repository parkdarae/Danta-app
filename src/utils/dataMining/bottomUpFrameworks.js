/**
 * 🔬 바텀업·기업 심층형 프레임
 * 개별 종목을 해부하듯 분석하고 싶을 때 사용
 */

export class BottomUpAnalysisFrameworks {
  constructor() {
    this.rdDatabase = new Map();
    this.customerDatabase = new Map();
    this.technologyMetrics = new Map();
    this.financialMetrics = new Map();
    this.contractDatabase = new Map();
  }

  /**
   * 2.1 R&D 투자비율 프레임
   */
  async analyzeRnDInvestmentRatio(stock) {
    console.log(`🧪 ${stock} R&D 투자비율 분석 시작...`);

    try {
      // R&D 투자 대비 성과 분석
      const rdROI = await this.calculateRnDROI(stock);
      
      // 업종별 R&D 효율성 비교
      const sectorComparison = await this.compareRnDEfficiency(stock);
      
      // 연구개발비 증감 트렌드
      const rdTrend = await this.analyzeRnDTrend(stock);
      
      // 특허 출원과 R&D 투자 상관관계
      const patentCorrelation = await this.analyzePatentRnDCorrelation(stock);

      const result = {
        frameworkId: 'rnd_investment_ratio',
        stock: stock,
        rdROI: rdROI,
        sectorComparison: sectorComparison,
        rdTrend: rdTrend,
        patentCorrelation: patentCorrelation,
        efficiency: this.assessRnDEfficiency(rdROI, sectorComparison),
        recommendation: this.generateRnDRecommendation(rdROI, rdTrend),
        confidence: 'high',
        lastUpdate: new Date().toISOString()
      };

      console.log(`✅ R&D 투자비율 분석 완료: ROI ${rdROI.roi.toFixed(2)}%`);
      return result;

    } catch (error) {
      console.error(`❌ R&D 투자비율 분석 실패:`, error);
      throw error;
    }
  }

  // R&D ROI 계산
  async calculateRnDROI(stock) {
    const rdData = this.getRnDData(stock);
    const financialData = this.getFinancialData(stock);
    
    // R&D 투자 대비 매출 증가율
    const revenueGrowthROI = (financialData.revenueGrowth / rdData.rdRatio) * 100;
    
    // R&D 투자 대비 영업이익 증가율
    const operatingProfitROI = (financialData.operatingProfitGrowth / rdData.rdRatio) * 100;
    
    // 종합 ROI
    const overallROI = (revenueGrowthROI * 0.6 + operatingProfitROI * 0.4);

    return {
      roi: overallROI,
      revenueROI: revenueGrowthROI,
      profitROI: operatingProfitROI,
      rdInvestment: rdData.rdAmount,
      rdRatio: rdData.rdRatio,
      trend: this.analyzeROITrend(overallROI),
      benchmarkComparison: this.compareWithBenchmark(overallROI, stock)
    };
  }

  // R&D 데이터 조회 (모의)
  getRnDData(stock) {
    const rdDatabase = {
      '삼성전자': {
        rdAmount: 20000, // 억원
        rdRatio: 8.2,    // 매출 대비 %
        patents: 12000,
        researchPersonnel: 102000
      },
      '카카오': {
        rdAmount: 3500,
        rdRatio: 12.5,
        patents: 2800,
        researchPersonnel: 8500
      },
      '에이지이글': {
        rdAmount: 450,
        rdRatio: 25.3,
        patents: 45,
        researchPersonnel: 180
      }
    };

    return rdDatabase[stock] || {
      rdAmount: 1000,
      rdRatio: 5.0,
      patents: 100,
      researchPersonnel: 500
    };
  }

  /**
   * 2.2 주요 고객사 영향도 프레임
   */
  async analyzeCustomerImpactFramework(stock) {
    console.log(`🏢 ${stock} 주요 고객사 영향도 분석 시작...`);

    try {
      // 매출 의존도 분석
      const revenueDependency = await this.analyzeRevenueDependency(stock);
      
      // 고객사 연관관계 매핑
      const customerMapping = await this.mapCustomerRelationships(stock);
      
      // 고객사 실적 변화 파급효과
      const rippleEffect = await this.analyzeCustomerRippleEffect(stock);
      
      // 고객 다변화 수준 평가
      const diversificationLevel = await this.assessCustomerDiversification(stock);

      const result = {
        frameworkId: 'customer_impact_framework',
        stock: stock,
        revenueDependency: revenueDependency,
        customerMapping: customerMapping,
        rippleEffect: rippleEffect,
        diversificationLevel: diversificationLevel,
        riskLevel: this.assessCustomerRisk(revenueDependency, diversificationLevel),
        recommendation: this.generateCustomerRecommendation(revenueDependency, diversificationLevel),
        confidence: 'high',
        lastUpdate: new Date().toISOString()
      };

      console.log(`✅ 고객사 영향도 분석 완료: 위험도 ${result.riskLevel}`);
      return result;

    } catch (error) {
      console.error(`❌ 고객사 영향도 분석 실패:`, error);
      throw error;
    }
  }

  // 매출 의존도 분석
  async analyzeRevenueDependency(stock) {
    const customerData = this.getCustomerData(stock);
    
    const topCustomers = customerData.customers
      .sort((a, b) => b.revenueShare - a.revenueShare)
      .slice(0, 5);

    const top1Dependency = topCustomers[0]?.revenueShare || 0;
    const top3Dependency = topCustomers.slice(0, 3).reduce((sum, c) => sum + c.revenueShare, 0);
    const top5Dependency = topCustomers.reduce((sum, c) => sum + c.revenueShare, 0);

    return {
      topCustomers: topCustomers,
      top1Dependency: top1Dependency,
      top3Dependency: top3Dependency,
      top5Dependency: top5Dependency,
      riskLevel: this.categorizeCustomerRisk(top1Dependency, top3Dependency),
      herfindahlIndex: this.calculateHerfindahlIndex(customerData.customers)
    };
  }

  // 고객 데이터 조회 (모의)
  getCustomerData(stock) {
    const customerDatabase = {
      '삼성전자': {
        customers: [
          { name: '애플', revenueShare: 22.5, sector: '기술', stability: 'high' },
          { name: '퀄컴', revenueShare: 8.3, sector: '반도체', stability: 'high' },
          { name: '샤오미', revenueShare: 6.1, sector: '스마트폰', stability: 'medium' },
          { name: 'OPPO', revenueShare: 4.8, sector: '스마트폰', stability: 'medium' },
          { name: '기타', revenueShare: 58.3, sector: '다양', stability: 'medium' }
        ]
      },
      '카카오': {
        customers: [
          { name: '광고주A', revenueShare: 15.2, sector: '광고', stability: 'medium' },
          { name: '게임 플랫폼', revenueShare: 12.8, sector: '게임', stability: 'high' },
          { name: '커머스 파트너', revenueShare: 10.5, sector: '커머스', stability: 'medium' },
          { name: '기타', revenueShare: 61.5, sector: '다양', stability: 'medium' }
        ]
      },
      '에이지이글': {
        customers: [
          { name: '병원A', revenueShare: 45.2, sector: '병원', stability: 'medium' },
          { name: '제약회사B', revenueShare: 28.7, sector: '제약', stability: 'high' },
          { name: '기타', revenueShare: 26.1, sector: '다양', stability: 'low' }
        ]
      }
    };

    return customerDatabase[stock] || {
      customers: [
        { name: '기타', revenueShare: 100, sector: '다양', stability: 'medium' }
      ]
    };
  }

  /**
   * 2.3 기술 모멘텀 프레임
   */
  async analyzeTechnologyMomentumFramework(stock) {
    console.log(`🚀 ${stock} 기술 모멘텀 분석 시작...`);

    try {
      // 기술 뉴스 트렌드 분석
      const newsTrend = await this.analyzeTechNewsTrend(stock);
      
      // 특허 출원 증감률 분석
      const patentTrend = await this.analyzePatentTrend(stock);
      
      // 기술 선도기업 벤치마킹
      const benchmarking = await this.benchmarkTechLeaders(stock);
      
      // 기술력 대비 밸류에이션
      const techValuation = await this.analyzeTechValuation(stock);

      const result = {
        frameworkId: 'technology_momentum_framework',
        stock: stock,
        newsTrend: newsTrend,
        patentTrend: patentTrend,
        benchmarking: benchmarking,
        techValuation: techValuation,
        momentumScore: this.calculateTechMomentumScore(newsTrend, patentTrend, benchmarking),
        recommendation: this.generateTechRecommendation(newsTrend, patentTrend, techValuation),
        confidence: 'medium',
        lastUpdate: new Date().toISOString()
      };

      console.log(`✅ 기술 모멘텀 분석 완료: 점수 ${result.momentumScore.overall}`);
      return result;

    } catch (error) {
      console.error(`❌ 기술 모멘텀 분석 실패:`, error);
      throw error;
    }
  }

  /**
   * 2.4 재무 건전성 다층 분석 프레임
   */
  async analyzeFinancialHealthFramework(stock) {
    console.log(`💰 ${stock} 재무 건전성 다층 분석 시작...`);

    try {
      // 유동성 지표 분석
      const liquidityMetrics = await this.analyzeLiquidityMetrics(stock);
      
      // 부채 구조 분석
      const debtStructure = await this.analyzeDebtStructure(stock);
      
      // 업종별 벤치마킹
      const sectorBenchmark = await this.benchmarkFinancialMetrics(stock);
      
      // 재무 위험도 스코어링
      const riskScoring = await this.scoreFinancialRisk(stock);

      const result = {
        frameworkId: 'financial_health_framework',
        stock: stock,
        liquidityMetrics: liquidityMetrics,
        debtStructure: debtStructure,
        sectorBenchmark: sectorBenchmark,
        riskScoring: riskScoring,
        overallHealth: this.assessOverallFinancialHealth(liquidityMetrics, debtStructure, riskScoring),
        earlyWarnings: this.detectEarlyWarnings(liquidityMetrics, debtStructure),
        confidence: 'high',
        lastUpdate: new Date().toISOString()
      };

      console.log(`✅ 재무 건전성 분석 완료: 등급 ${result.overallHealth.grade}`);
      return result;

    } catch (error) {
      console.error(`❌ 재무 건전성 분석 실패:`, error);
      throw error;
    }
  }

  /**
   * 2.5 계약 체결력 점수화 프레임
   */
  async analyzeContractCapabilityFramework(stock) {
    console.log(`📋 ${stock} 계약 체결력 점수화 분석 시작...`);

    try {
      // 계약 뉴스 분석
      const contractNews = await this.analyzeContractNews(stock);
      
      // 계약 규모 및 조건 평가
      const contractTerms = await this.evaluateContractTerms(stock);
      
      // 업종별 계약 패턴 분석
      const industryPatterns = await this.analyzeIndustryContractPatterns(stock);
      
      // 계약 성과 추적
      const performanceTracking = await this.trackContractPerformance(stock);

      const result = {
        frameworkId: 'contract_capability_framework',
        stock: stock,
        contractNews: contractNews,
        contractTerms: contractTerms,
        industryPatterns: industryPatterns,
        performanceTracking: performanceTracking,
        capabilityScore: this.calculateContractCapabilityScore(contractNews, contractTerms, performanceTracking),
        salesPower: this.assessSalesPower(contractNews, industryPatterns),
        confidence: 'medium',
        lastUpdate: new Date().toISOString()
      };

      console.log(`✅ 계약 체결력 분석 완료: 점수 ${result.capabilityScore.overall}`);
      return result;

    } catch (error) {
      console.error(`❌ 계약 체결력 분석 실패:`, error);
      throw error;
    }
  }

  // === 헬퍼 메서드들 ===

  // 재무 데이터 조회 (모의)
  getFinancialData(stock) {
    const financialDatabase = {
      '삼성전자': {
        revenueGrowth: 8.5,
        operatingProfitGrowth: 12.3,
        currentRatio: 2.1,
        quickRatio: 1.8,
        debtToEquity: 0.35,
        interestCoverage: 15.2
      },
      '카카오': {
        revenueGrowth: 15.2,
        operatingProfitGrowth: -5.8,
        currentRatio: 1.5,
        quickRatio: 1.3,
        debtToEquity: 0.25,
        interestCoverage: 8.7
      },
      '에이지이글': {
        revenueGrowth: 28.5,
        operatingProfitGrowth: 45.2,
        currentRatio: 3.2,
        quickRatio: 2.8,
        debtToEquity: 0.15,
        interestCoverage: 25.3
      }
    };

    return financialDatabase[stock] || {
      revenueGrowth: 5.0,
      operatingProfitGrowth: 3.0,
      currentRatio: 1.8,
      quickRatio: 1.5,
      debtToEquity: 0.4,
      interestCoverage: 10.0
    };
  }

  // ROI 트렌드 분석
  analyzeROITrend(roi) {
    if (roi > 200) return 'excellent';
    if (roi > 150) return 'good';
    if (roi > 100) return 'average';
    if (roi > 50) return 'below_average';
    return 'poor';
  }

  // 벤치마크 비교
  compareWithBenchmark(roi, stock) {
    const sectorBenchmarks = {
      '기술': 180,
      '바이오': 120,
      '제조': 140
    };
    
    const stockProfile = this.getStockProfile(stock);
    const benchmark = sectorBenchmarks[stockProfile?.sector] || 150;
    
    return {
      benchmark: benchmark,
      difference: roi - benchmark,
      percentile: roi > benchmark ? 75 : 25
    };
  }

  getStockProfile(stock) {
    // 실제로는 더 상세한 프로필 데이터베이스 조회
    const profiles = {
      '삼성전자': { sector: '기술' },
      '카카오': { sector: '기술' },
      '에이지이글': { sector: '바이오' }
    };
    return profiles[stock];
  }

  // R&D 효율성 업종별 비교
  async compareRnDEfficiency(stock) {
    const stockProfile = this.getStockProfile(stock);
    const rdData = this.getRnDData(stock);
    
    const sectorAverages = {
      '기술': { rdRatio: 12.5, efficiency: 165 },
      '바이오': { rdRatio: 18.2, efficiency: 95 },
      '제조': { rdRatio: 3.8, efficiency: 140 }
    };
    
    const sectorAvg = sectorAverages[stockProfile?.sector] || sectorAverages['제조'];
    
    return {
      sectorAverage: sectorAvg,
      stockRatio: rdData.rdRatio,
      relativePosition: rdData.rdRatio > sectorAvg.rdRatio ? 'above_average' : 'below_average',
      ranking: Math.floor(Math.random() * 50) + 1, // 모의 랭킹
      totalCompanies: 100
    };
  }

  // R&D 투자 트렌드 분석
  async analyzeRnDTrend(stock) {
    // 모의 3년간 R&D 투자 데이터
    const mockTrend = [
      { year: 2022, amount: 18000, ratio: 7.8 },
      { year: 2023, amount: 19200, ratio: 8.0 },
      { year: 2024, amount: 20000, ratio: 8.2 }
    ];
    
    const growth = {
      amountGrowth: ((mockTrend[2].amount - mockTrend[0].amount) / mockTrend[0].amount) * 100,
      ratioGrowth: mockTrend[2].ratio - mockTrend[0].ratio
    };
    
    return {
      historicalData: mockTrend,
      growth: growth,
      trend: growth.amountGrowth > 10 ? 'increasing' : growth.amountGrowth > 0 ? 'stable' : 'decreasing',
      consistency: 'high' // R&D 투자의 일관성
    };
  }

  // 특허-R&D 상관관계 분석
  async analyzePatentRnDCorrelation(stock) {
    const rdData = this.getRnDData(stock);
    
    // 모의 특허 데이터
    const patentEfficiency = rdData.patents / (rdData.rdAmount / 100); // 100억원당 특허 수
    
    return {
      patentCount: rdData.patents,
      patentEfficiency: patentEfficiency,
      correlation: 0.78, // R&D 투자와 특허 출원의 상관계수
      benchmark: this.getPatentBenchmark(stock),
      qualityScore: this.assessPatentQuality(rdData.patents)
    };
  }

  getPatentBenchmark(stock) {
    const stockProfile = this.getStockProfile(stock);
    const benchmarks = {
      '기술': 8.5,
      '바이오': 12.3,
      '제조': 5.2
    };
    return benchmarks[stockProfile?.sector] || 7.0;
  }

  assessPatentQuality(patentCount) {
    if (patentCount > 10000) return 'high';
    if (patentCount > 1000) return 'medium';
    return 'low';
  }

  // R&D 효율성 평가
  assessRnDEfficiency(rdROI, sectorComparison) {
    const roiScore = rdROI.roi > 150 ? 'high' : rdROI.roi > 100 ? 'medium' : 'low';
    const sectorScore = sectorComparison.relativePosition;
    
    if (roiScore === 'high' && sectorScore === 'above_average') return 'excellent';
    if (roiScore === 'medium' || sectorScore === 'above_average') return 'good';
    return 'needs_improvement';
  }

  // R&D 추천사항 생성
  generateRnDRecommendation(rdROI, rdTrend) {
    const recommendations = [];
    
    if (rdROI.roi < 100) {
      recommendations.push('R&D 투자 효율성 개선 필요');
    }
    
    if (rdTrend.trend === 'decreasing') {
      recommendations.push('R&D 투자 확대 검토 권장');
    } else if (rdTrend.trend === 'increasing') {
      recommendations.push('현재 R&D 투자 전략 유지');
    }
    
    return recommendations;
  }

  // 고객 리스크 분류
  categorizeCustomerRisk(top1, top3) {
    if (top1 > 50) return 'very_high';
    if (top1 > 30 || top3 > 70) return 'high';
    if (top1 > 15 || top3 > 50) return 'medium';
    return 'low';
  }

  // 허핀달 지수 계산
  calculateHerfindahlIndex(customers) {
    return customers.reduce((sum, customer) => 
      sum + Math.pow(customer.revenueShare / 100, 2), 0
    ) * 10000;
  }

  // 고객사 연관관계 매핑
  async mapCustomerRelationships(stock) {
    const customerData = this.getCustomerData(stock);
    
    return {
      directCustomers: customerData.customers.length,
      indirectRelationships: this.identifyIndirectRelationships(customerData.customers),
      supplierNetwork: this.mapSupplierNetwork(stock),
      ecosystemMap: this.generateEcosystemMap(customerData.customers)
    };
  }

  identifyIndirectRelationships(customers) {
    // 간접 연관관계 식별 (예: 애플 → 아이폰 부품사들)
    return customers.filter(c => c.sector === '기술').length * 2; // 간단한 모의
  }

  mapSupplierNetwork(stock) {
    // 공급업체 네트워크 매핑
    return {
      tier1Suppliers: 15,
      tier2Suppliers: 45,
      criticalSuppliers: 3
    };
  }

  generateEcosystemMap(customers) {
    // 생태계 맵 생성
    const sectors = [...new Set(customers.map(c => c.sector))];
    return {
      diversificationScore: sectors.length / 5 * 100,
      dominantSector: customers.reduce((max, c) => 
        c.revenueShare > max.share ? { sector: c.sector, share: c.revenueShare } : max, 
        { sector: '', share: 0 }
      )
    };
  }

  // 고객사 파급효과 분석
  async analyzeCustomerRippleEffect(stock) {
    const customerData = this.getCustomerData(stock);
    const topCustomer = customerData.customers[0];
    
    // 주요 고객사의 주가 변동이 해당 기업에 미치는 영향 분석
    return {
      topCustomerImpact: {
        customer: topCustomer.name,
        correlation: 0.65, // 주가 상관관계
        sensitivity: topCustomer.revenueShare / 100 * 0.8, // 민감도
        lagEffect: 2 // 지연 효과 (일)
      },
      scenarioAnalysis: {
        bestCase: { customerGrowth: 20, expectedImpact: 15.2 },
        worstCase: { customerGrowth: -15, expectedImpact: -8.7 },
        baseCase: { customerGrowth: 5, expectedImpact: 3.1 }
      },
      hedgeStrategy: this.suggestCustomerHedgeStrategy(customerData)
    };
  }

  suggestCustomerHedgeStrategy(customerData) {
    const top1Share = customerData.customers[0]?.revenueShare || 0;
    
    if (top1Share > 40) {
      return ['고객 다변화 전략 수립', '신규 시장 개척', '계약 조건 재협상'];
    } else if (top1Share > 20) {
      return ['기존 고객 관계 강화', '추가 고객 확보'];
    }
    
    return ['현재 고객 구조 유지'];
  }

  // 고객 다변화 수준 평가
  async assessCustomerDiversification(stock) {
    const customerData = this.getCustomerData(stock);
    const hhi = this.calculateHerfindahlIndex(customerData.customers);
    
    let diversificationLevel = 'medium';
    if (hhi < 1500) diversificationLevel = 'high';
    else if (hhi > 2500) diversificationLevel = 'low';
    
    return {
      herfindahlIndex: hhi,
      level: diversificationLevel,
      numberOfCustomers: customerData.customers.length,
      sectorDiversification: this.calculateSectorDiversification(customerData.customers),
      geographicDiversification: this.calculateGeographicDiversification(stock)
    };
  }

  calculateSectorDiversification(customers) {
    const sectors = [...new Set(customers.map(c => c.sector))];
    return {
      sectorCount: sectors.length,
      dominantSectorShare: Math.max(...customers.map(c => c.revenueShare)),
      diversificationScore: (sectors.length / 5) * 100
    };
  }

  calculateGeographicDiversification(stock) {
    // 지역별 매출 다변화 (모의)
    return {
      domestic: 65,
      international: 35,
      regions: ['아시아', '북미', '유럽'],
      diversificationScore: 70
    };
  }

  // 고객 리스크 평가
  assessCustomerRisk(dependency, diversification) {
    const dependencyRisk = dependency.top1Dependency > 30 ? 'high' : 
                          dependency.top1Dependency > 15 ? 'medium' : 'low';
    
    const diversificationRisk = diversification.level === 'low' ? 'high' : 
                               diversification.level === 'medium' ? 'medium' : 'low';
    
    if (dependencyRisk === 'high' || diversificationRisk === 'high') return 'high';
    if (dependencyRisk === 'medium' || diversificationRisk === 'medium') return 'medium';
    return 'low';
  }

  generateCustomerRecommendation(dependency, diversification) {
    const recommendations = [];
    
    if (dependency.top1Dependency > 30) {
      recommendations.push('주요 고객 의존도가 높아 리스크 관리 필요');
    }
    
    if (diversification.level === 'low') {
      recommendations.push('고객 다변화 전략 수립 권장');
    }
    
    return recommendations;
  }

  // 기술 뉴스 트렌드 분석
  async analyzeTechNewsTrend(stock) {
    // 모의 기술 뉴스 트렌드 데이터
    return {
      newsCount: 45,
      sentimentScore: 0.72,
      keyTopics: ['AI', '5G', '자율주행'],
      trendDirection: 'increasing',
      mediaAttention: 'high',
      buzzScore: 85
    };
  }

  // 특허 트렌드 분석
  async analyzePatentTrend(stock) {
    return {
      recentPatents: 156,
      growthRate: 23.5,
      qualityScore: 0.78,
      citationIndex: 4.2,
      competitorComparison: 'above_average'
    };
  }

  // 기술 선도기업 벤치마킹
  async benchmarkTechLeaders(stock) {
    const leaders = ['엔비디아', 'ASML', 'TSMC'];
    
    return {
      benchmarkCompanies: leaders,
      technologyGap: 'medium', // 기술 격차
      competitivePosition: 'follower',
      catchUpPotential: 'high',
      investmentRequired: '대규모'
    };
  }

  // 기술력 대비 밸류에이션
  async analyzeTechValuation(stock) {
    return {
      techMultiple: 15.2, // 기술력 대비 배수
      industryAverage: 12.8,
      premium: 18.7, // 프리미엄 %
      justification: 'high', // 프리미엄 정당성
      fairValue: 52000 // 적정 주가
    };
  }

  // 기술 모멘텀 점수 계산
  calculateTechMomentumScore(news, patent, benchmark) {
    const newsScore = news.sentimentScore * news.buzzScore;
    const patentScore = patent.growthRate * patent.qualityScore;
    const benchmarkScore = benchmark.catchUpPotential === 'high' ? 80 : 60;
    
    const overall = (newsScore * 0.4 + patentScore * 0.4 + benchmarkScore * 0.2);
    
    return {
      overall: overall.toFixed(1),
      news: newsScore.toFixed(1),
      patent: patentScore.toFixed(1),
      benchmark: benchmarkScore,
      trend: overall > 70 ? 'strong' : overall > 50 ? 'moderate' : 'weak'
    };
  }

  generateTechRecommendation(news, patent, valuation) {
    const recommendations = [];
    
    if (news.sentimentScore > 0.7) {
      recommendations.push('기술 관련 긍정적 뉴스 트렌드 활용');
    }
    
    if (patent.growthRate > 20) {
      recommendations.push('특허 출원 증가 추세 지속');
    }
    
    if (valuation.premium > 20) {
      recommendations.push('밸류에이션 프리미엄 주의 필요');
    }
    
    return recommendations;
  }

  // 유동성 지표 분석
  async analyzeLiquidityMetrics(stock) {
    const financial = this.getFinancialData(stock);
    
    return {
      currentRatio: financial.currentRatio,
      quickRatio: financial.quickRatio,
      cashRatio: financial.quickRatio * 0.8, // 추정
      operatingCashFlow: 15000, // 모의
      freeCashFlow: 12000, // 모의
      liquidityGrade: this.gradeLiquidity(financial.currentRatio, financial.quickRatio)
    };
  }

  gradeLiquidity(current, quick) {
    if (current > 2.0 && quick > 1.5) return 'A';
    if (current > 1.5 && quick > 1.0) return 'B';
    if (current > 1.0 && quick > 0.8) return 'C';
    return 'D';
  }

  // 부채 구조 분석
  async analyzeDebtStructure(stock) {
    const financial = this.getFinancialData(stock);
    
    return {
      debtToEquity: financial.debtToEquity,
      debtToAssets: financial.debtToEquity / (1 + financial.debtToEquity),
      interestCoverage: financial.interestCoverage,
      shortTermDebtRatio: 0.3, // 모의
      longTermDebtRatio: 0.7, // 모의
      debtGrade: this.gradeDebtStructure(financial.debtToEquity, financial.interestCoverage)
    };
  }

  gradeDebtStructure(debtEquity, coverage) {
    if (debtEquity < 0.3 && coverage > 15) return 'A';
    if (debtEquity < 0.5 && coverage > 10) return 'B';
    if (debtEquity < 0.8 && coverage > 5) return 'C';
    return 'D';
  }

  // 재무지표 업종별 벤치마킹
  async benchmarkFinancialMetrics(stock) {
    const stockProfile = this.getStockProfile(stock);
    const sectorBenchmarks = {
      '기술': { currentRatio: 1.8, debtToEquity: 0.35, roe: 15.2 },
      '바이오': { currentRatio: 2.5, debtToEquity: 0.25, roe: 8.5 },
      '제조': { currentRatio: 1.5, debtToEquity: 0.55, roe: 12.0 }
    };
    
    return sectorBenchmarks[stockProfile?.sector] || sectorBenchmarks['제조'];
  }

  // 재무 위험도 스코어링
  async scoreFinancialRisk(stock) {
    const liquidity = await this.analyzeLiquidityMetrics(stock);
    const debt = await this.analyzeDebtStructure(stock);
    
    const liquidityScore = { A: 90, B: 75, C: 60, D: 40 }[liquidity.liquidityGrade];
    const debtScore = { A: 90, B: 75, C: 60, D: 40 }[debt.debtGrade];
    
    const overallScore = (liquidityScore + debtScore) / 2;
    
    return {
      overallScore: overallScore,
      liquidityScore: liquidityScore,
      debtScore: debtScore,
      riskLevel: overallScore > 80 ? 'low' : overallScore > 60 ? 'medium' : 'high',
      earlyWarningFlags: this.identifyWarningFlags(liquidity, debt)
    };
  }

  identifyWarningFlags(liquidity, debt) {
    const flags = [];
    
    if (liquidity.currentRatio < 1.2) flags.push('유동비율 부족');
    if (debt.debtToEquity > 0.7) flags.push('과도한 부채');
    if (debt.interestCoverage < 3) flags.push('이자보상배율 부족');
    
    return flags;
  }

  // 전체 재무 건전성 평가
  assessOverallFinancialHealth(liquidity, debt, risk) {
    const grades = ['A', 'B', 'C', 'D'];
    const liquidityGradeIndex = grades.indexOf(liquidity.liquidityGrade);
    const debtGradeIndex = grades.indexOf(debt.debtGrade);
    
    const avgGradeIndex = Math.round((liquidityGradeIndex + debtGradeIndex) / 2);
    const overallGrade = grades[avgGradeIndex];
    
    return {
      grade: overallGrade,
      score: risk.overallScore,
      explanation: this.explainFinancialHealth(overallGrade),
      outlook: risk.riskLevel === 'low' ? 'stable' : 'cautious'
    };
  }

  explainFinancialHealth(grade) {
    const explanations = {
      A: '매우 건전한 재무구조',
      B: '양호한 재무상태',
      C: '보통 수준의 재무건전성',
      D: '재무구조 개선 필요'
    };
    return explanations[grade];
  }

  detectEarlyWarnings(liquidity, debt) {
    const warnings = [];
    
    if (liquidity.currentRatio < 1.0) {
      warnings.push({
        type: 'liquidity_crisis',
        severity: 'high',
        message: '단기 유동성 위기 가능성'
      });
    }
    
    if (debt.interestCoverage < 2) {
      warnings.push({
        type: 'interest_burden',
        severity: 'high',
        message: '이자 부담 과중'
      });
    }
    
    return warnings;
  }

  // 계약 뉴스 분석
  async analyzeContractNews(stock) {
    return {
      totalContracts: 12,
      majorContracts: 4,
      averageContractSize: 250, // 억원
      successRate: 75, // %
      recentTrend: 'increasing'
    };
  }

  // 계약 조건 평가
  async evaluateContractTerms(stock) {
    return {
      averageDuration: 24, // 개월
      renewalRate: 85, // %
      profitMargin: 15.2, // %
      paymentTerms: 'favorable',
      riskAdjustment: 'low'
    };
  }

  // 업종별 계약 패턴
  async analyzeIndustryContractPatterns(stock) {
    const stockProfile = this.getStockProfile(stock);
    
    const industryPatterns = {
      '기술': { avgSize: 300, duration: 18, margin: 12 },
      '바이오': { avgSize: 150, duration: 36, margin: 25 },
      '제조': { avgSize: 500, duration: 24, margin: 8 }
    };
    
    return industryPatterns[stockProfile?.sector] || industryPatterns['제조'];
  }

  // 계약 성과 추적
  async trackContractPerformance(stock) {
    return {
      completionRate: 92, // %
      onTimeDelivery: 88, // %
      customerSatisfaction: 4.2, // 5점 만점
      renewalProbability: 78, // %
      additionalOrders: 15 // %
    };
  }

  // 계약 능력 점수 계산
  calculateContractCapabilityScore(news, terms, performance) {
    const newsScore = news.successRate;
    const termsScore = terms.profitMargin * 3; // 마진 중요도 반영
    const performanceScore = (performance.completionRate + performance.onTimeDelivery) / 2;
    
    const overall = (newsScore * 0.3 + termsScore * 0.3 + performanceScore * 0.4);
    
    return {
      overall: Math.min(overall, 100).toFixed(1),
      news: newsScore,
      terms: termsScore,
      performance: performanceScore,
      grade: overall > 80 ? 'A' : overall > 65 ? 'B' : overall > 50 ? 'C' : 'D'
    };
  }

  // 영업력 평가
  assessSalesPower(news, patterns) {
    const marketPerformance = news.successRate > 80 ? 'excellent' : 
                             news.successRate > 60 ? 'good' : 'needs_improvement';
    
    return {
      marketPerformance: marketPerformance,
      competitivePosition: 'strong',
      pipelineStrength: 'robust',
      relationshipQuality: 'high'
    };
  }
}

export default BottomUpAnalysisFrameworks; 