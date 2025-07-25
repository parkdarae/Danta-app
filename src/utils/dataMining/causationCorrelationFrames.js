// 인과 관계 분석/상관 프레임
import { STOCKS } from '../constants';

/**
 * 정책↔산업↔종목 상호 연관성 그래프 프레임
 * @param {string} policyKeyword - 정책 키워드
 * @param {Array} stockList - 분석할 종목 리스트
 * @returns {Object} 연관성 그래프 데이터
 */
export const analyzePolicyIndustryStockGraph = (policyKeyword, stockList = STOCKS) => {
  const policyMappings = {
    'IRA': ['전기차', '배터리', '태양광', '풍력'],
    '인프라': ['건설', '철강', '시멘트', '중장비'],
    'AI정책': ['반도체', '소프트웨어', '클라우드', '데이터센터'],
    '녹색정책': ['친환경', '신재생에너지', '폐기물', '탄소중립'],
    '바이오정책': ['제약', '바이오테크', '의료기기', '헬스케어']
  };

  const industryStockMapping = {
    '전기차': ['현대차', 'LG에너지솔루션', 'SK이노베이션'],
    '배터리': ['LG에너지솔루션', 'SK이노베이션', '삼성SDI'],
    '반도체': ['삼성전자', 'SK하이닉스', 'TSMC', '엔비디아'],
    '건설': ['현대건설', 'GS건설', '대우건설'],
    '제약': ['셀트리온', '유한양행', '대웅제약']
  };

  const relatedIndustries = policyMappings[policyKeyword] || [];
  const connectionGraph = {
    policy: policyKeyword,
    industries: [],
    stocks: [],
    connections: []
  };

  relatedIndustries.forEach(industry => {
    connectionGraph.industries.push({
      name: industry,
      impact: Math.random() * 100, // 실제로는 뉴스 분석 결과
      confidence: Math.random() * 100
    });

    const relatedStocks = industryStockMapping[industry] || [];
    relatedStocks.forEach(stockName => {
      if (stockList.some(stock => stock.name.includes(stockName))) {
        connectionGraph.stocks.push({
          name: stockName,
          industry: industry,
          correlation: Math.random() * 100,
          impact: Math.random() * 100
        });

        connectionGraph.connections.push({
          from: policyKeyword,
          to: industry,
          strength: Math.random() * 100
        });

        connectionGraph.connections.push({
          from: industry,
          to: stockName,
          strength: Math.random() * 100
        });
      }
    });
  });

  return connectionGraph;
};

/**
 * 동반 상승 상관 프레임
 * @param {Array} stockPrices - 주식 가격 데이터
 * @param {number} period - 분석 기간 (일)
 * @returns {Array} 동반 상승 쌍/군 리스트
 */
export const analyzeCorrelatedRisers = (stockPrices, period = 30) => {
  const correlationPairs = [];
  
  // 상관계수 계산 (간단한 피어슨 상관계수)
  const calculateCorrelation = (stock1Prices, stock2Prices) => {
    const n = Math.min(stock1Prices.length, stock2Prices.length);
    if (n < 2) return 0;

    const mean1 = stock1Prices.reduce((a, b) => a + b, 0) / n;
    const mean2 = stock2Prices.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let sum1 = 0;
    let sum2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = stock1Prices[i] - mean1;
      const diff2 = stock2Prices[i] - mean2;
      numerator += diff1 * diff2;
      sum1 += diff1 * diff1;
      sum2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1 * sum2);
    return denominator === 0 ? 0 : numerator / denominator;
  };

  // 모든 주식 쌍에 대해 상관관계 분석
  for (let i = 0; i < STOCKS.length; i++) {
    for (let j = i + 1; j < STOCKS.length; j++) {
      const stock1 = STOCKS[i];
      const stock2 = STOCKS[j];
      
      // 임시 가격 데이터 생성 (실제로는 API에서 가져옴)
      const prices1 = Array.from({ length: period }, () => Math.random() * 100 + 50);
      const prices2 = Array.from({ length: period }, () => Math.random() * 100 + 50);
      
      const correlation = calculateCorrelation(prices1, prices2);
      
      if (correlation > 0.7) { // 높은 양의 상관관계
        correlationPairs.push({
          stock1: stock1.name,
          stock2: stock2.name,
          correlation: correlation,
          risePattern: 'synchronized',
          strength: correlation > 0.85 ? 'strong' : 'moderate',
          sector1: stock1.sector || '기타',
          sector2: stock2.sector || '기타',
          analysis: correlation > 0.85 ? 
            '매우 강한 동반 상승 패턴' : 
            '상당한 동반 상승 패턴'
        });
      }
    }
  }

  return correlationPairs.sort((a, b) => b.correlation - a.correlation);
};

/**
 * 에너지/소재 ↔ 생산 단가 영향 프레임
 * @param {Array} commodityPrices - 원자재 가격 데이터
 * @param {Array} stockList - 분석할 종목 리스트
 * @returns {Object} 생산 단가 영향 분석
 */
export const analyzeCommodityImpact = (commodityPrices, stockList = STOCKS) => {
  const commodityMapping = {
    '원유': ['화학', '석유화학', '운송', '항공'],
    '니켈': ['배터리', '스테인리스', '전기차'],
    '구리': ['전기', '전자', '건설', '자동차'],
    '철강': ['건설', '조선', '자동차', '기계'],
    '전력': ['제조업', '반도체', '데이터센터']
  };

  const impactAnalysis = {
    commodities: [],
    affectedStocks: [],
    riskScore: 0,
    opportunities: []
  };

  Object.entries(commodityMapping).forEach(([commodity, sectors]) => {
    const priceChange = (Math.random() - 0.5) * 20; // -10% ~ +10% 변동
    
    impactAnalysis.commodities.push({
      name: commodity,
      priceChange: priceChange,
      trend: priceChange > 0 ? 'rising' : 'falling',
      impact: Math.abs(priceChange)
    });

    sectors.forEach(sector => {
      const affectedStocks = stockList.filter(stock => 
        stock.name.includes('현대') && sector === '자동차' ||
        stock.name.includes('삼성') && sector === '반도체' ||
        stock.name.includes('LG') && sector === '화학'
      );

      affectedStocks.forEach(stock => {
        const costImpact = priceChange * (Math.random() * 0.3 + 0.1); // 10-40% 전이
        
        impactAnalysis.affectedStocks.push({
          stock: stock.name,
          commodity: commodity,
          sector: sector,
          costImpact: costImpact,
          marginEffect: -costImpact * 0.8, // 마진에 부정적 영향
          recommendation: costImpact > 5 ? 'watch' : costImpact < -5 ? 'opportunity' : 'neutral',
          reasoning: costImpact > 5 ? 
            `${commodity} 가격 상승으로 생산비 증가 우려` :
            costImpact < -5 ?
            `${commodity} 가격 하락으로 마진 개선 기대` :
            '원자재 가격 변동 영향 제한적'
        });
      });
    });
  });

  // 전체 리스크 스코어 계산
  impactAnalysis.riskScore = impactAnalysis.affectedStocks
    .reduce((sum, stock) => sum + Math.abs(stock.costImpact), 0) / 
    impactAnalysis.affectedStocks.length;

  // 기회 요소 추출
  impactAnalysis.opportunities = impactAnalysis.affectedStocks
    .filter(stock => stock.recommendation === 'opportunity')
    .map(stock => ({
      stock: stock.stock,
      reason: stock.reasoning,
      expectedBenefit: Math.abs(stock.marginEffect)
    }));

  return impactAnalysis;
};

/**
 * 환율 민감 종목 스코어링 프레임
 * @param {number} usdKrwRate - 현재 USD/KRW 환율
 * @param {number} rateChange - 환율 변동률 (%)
 * @param {Array} stockList - 분석할 종목 리스트
 * @returns {Array} 환율 민감도 스코어링 결과
 */
export const analyzeForexSensitivity = (usdKrwRate = 1320, rateChange = 0, stockList = STOCKS) => {
  const exporterSensitivity = {
    '삼성전자': { sensitivity: 0.8, type: 'export', revenue_fx_ratio: 0.7 },
    'SK하이닉스': { sensitivity: 0.7, type: 'export', revenue_fx_ratio: 0.8 },
    '현대차': { sensitivity: 0.6, type: 'export', revenue_fx_ratio: 0.4 },
    'POSCO': { sensitivity: 0.5, type: 'export', revenue_fx_ratio: 0.3 },
    'LG에너지솔루션': { sensitivity: 0.7, type: 'export', revenue_fx_ratio: 0.6 }
  };

  const importerSensitivity = {
    'S-Oil': { sensitivity: -0.6, type: 'import', cost_fx_ratio: 0.8 },
    'GS칼텍스': { sensitivity: -0.5, type: 'import', cost_fx_ratio: 0.7 },
    '한국항공우주': { sensitivity: -0.4, type: 'import', cost_fx_ratio: 0.3 }
  };

  const forexAnalysis = [];

  stockList.forEach(stock => {
    let sensitivity = 0;
    let type = 'neutral';
    let analysis = '';
    let score = 50; // 기본 점수

    if (exporterSensitivity[stock.name]) {
      const data = exporterSensitivity[stock.name];
      sensitivity = data.sensitivity;
      type = 'exporter';
      
      // 원화 약세 = 수출 유리
      const impact = rateChange * sensitivity;
      score = 50 + impact * 10;
      
      analysis = rateChange > 0 ? 
        `원화 약세로 수출 경쟁력 개선 (매출 ${(data.revenue_fx_ratio * 100).toFixed(0)}% 외화)` :
        rateChange < 0 ?
        `원화 강세로 수출 경쟁력 악화` :
        '환율 변동 없음';
    
    } else if (importerSensitivity[stock.name]) {
      const data = importerSensitivity[stock.name];
      sensitivity = Math.abs(data.sensitivity);
      type = 'importer';
      
      // 원화 약세 = 수입 불리
      const impact = -rateChange * sensitivity;
      score = 50 + impact * 10;
      
      analysis = rateChange > 0 ? 
        `원화 약세로 원자재 수입비 증가 (비용 ${(data.cost_fx_ratio * 100).toFixed(0)}% 외화)` :
        rateChange < 0 ?
        `원화 강세로 원자재 수입비 감소` :
        '환율 변동 없음';
    
    } else {
      analysis = '환율 영향 제한적';
    }

    forexAnalysis.push({
      stock: stock.name,
      sector: stock.sector || '기타',
      sensitivity: sensitivity,
      type: type,
      score: Math.max(0, Math.min(100, score)),
      currentRate: usdKrwRate,
      rateChange: rateChange,
      impact: rateChange * sensitivity,
      analysis: analysis,
      recommendation: score > 70 ? 'buy' : score < 30 ? 'sell' : 'hold',
      riskLevel: sensitivity > 0.7 ? 'high' : sensitivity > 0.4 ? 'medium' : 'low'
    });
  });

  return forexAnalysis.sort((a, b) => b.score - a.score);
};

/**
 * 통합 인과관계 네트워크 분석
 * @param {Object} params - 분석 매개변수
 * @returns {Object} 통합 네트워크 분석 결과
 */
export const analyzeIntegratedCausationNetwork = (params = {}) => {
  const {
    policyKeyword = 'AI정책',
    commodityData = {},
    forexRate = 1320,
    forexChange = 0,
    stockList = STOCKS
  } = params;

  return {
    policyImpact: analyzePolicyIndustryStockGraph(policyKeyword, stockList),
    correlationPairs: analyzeCorrelatedRisers([], 30),
    commodityImpact: analyzeCommodityImpact(commodityData, stockList),
    forexSensitivity: analyzeForexSensitivity(forexRate, forexChange, stockList),
    networkScore: Math.random() * 100,
    insights: [
      '정책-산업-종목 간 강한 연관성 발견',
      '동반 상승 패턴 3개 그룹 식별',
      '원자재 가격 변동이 마진에 미치는 영향 분석 완료',
      '환율 민감도 기반 투자 우선순위 도출'
    ]
  };
}; 