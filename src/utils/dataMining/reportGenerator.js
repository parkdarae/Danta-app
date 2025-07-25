/**
 * 주식 데이터 마이닝 프레임북 - 자동 리포트 생성 모듈
 * 프롬프트/질문 기반 자동 분석 리포트 생성
 */

// 리포트 타입 정의
export const REPORT_TYPES = {
  RISK_ANALYSIS: 'risk_analysis',
  THEME_IMPACT: 'theme_impact',
  TECHNICAL_ANALYSIS: 'technical_analysis',
  SENTIMENT_ANALYSIS: 'sentiment_analysis',
  INVESTMENT_STRATEGY: 'investment_strategy',
  COMPREHENSIVE: 'comprehensive'
};

// 질문 카테고리
export const QUESTION_CATEGORIES = {
  RISK: ['리스크', 'risk', '위험', '손실', '변동성'],
  THEME: ['테마', 'theme', '섹터', '업종', '트렌드'],
  TECHNICAL: ['기술적', '차트', '지표', 'RSI', 'MACD', '이동평균'],
  SENTIMENT: ['감정', '심리', '뉴스', '분위기', '소셜'],
  STRATEGY: ['전략', '투자', '매수', '매도', '포트폴리오']
};

/**
 * 질문 분류기
 */
export class QuestionClassifier {
  constructor() {
    this.questionTemplates = new Map();
    this.initializeTemplates();
  }

  // 질문 템플릿 초기화
  initializeTemplates() {
    this.questionTemplates.set('risk', [
      '이 종목의 리스크는 무엇인가요?',
      '투자 위험 요소를 알려주세요',
      '손실 가능성은 어느 정도인가요?',
      '변동성이 큰 이유는 무엇인가요?'
    ]);

    this.questionTemplates.set('theme', [
      '최근 테마 영향력은 어떤가요?',
      '어떤 테마에 속하나요?',
      '섹터 전망은 어떠한가요?',
      '관련 정책의 영향은?'
    ]);

    this.questionTemplates.set('technical', [
      '기술적 분석 결과는?',
      'RSI 지표는 어떤가요?',
      '차트 패턴 분석해주세요',
      '매수/매도 신호는?'
    ]);

    this.questionTemplates.set('sentiment', [
      '시장 심리는 어떤가요?',
      '뉴스 반응은 긍정적인가요?',
      '투자자 감정 상태는?',
      '소셜 미디어 반응은?'
    ]);

    this.questionTemplates.set('strategy', [
      '투자 전략을 추천해주세요',
      '언제 매수하는 것이 좋을까요?',
      '목표가는 어디까지인가요?',
      '포트폴리오 비중은?'
    ]);
  }

  // 질문 분류
  classifyQuestion(question) {
    const lowercaseQuestion = question.toLowerCase();
    const scores = {};

    // 각 카테고리별 키워드 매칭 점수 계산
    Object.entries(QUESTION_CATEGORIES).forEach(([category, keywords]) => {
      scores[category] = keywords.filter(keyword => 
        lowercaseQuestion.includes(keyword.toLowerCase())
      ).length;
    });

    // 가장 높은 점수의 카테고리 선택
    const bestCategory = Object.entries(scores).reduce((max, [category, score]) => 
      score > max.score ? { category: category.toLowerCase(), score } : max, 
      { category: 'comprehensive', score: 0 }
    );

    return {
      category: bestCategory.category,
      confidence: bestCategory.score > 0 ? Math.min(bestCategory.score / 3, 1) : 0.3,
      suggestedType: this.mapCategoryToReportType(bestCategory.category)
    };
  }

  // 카테고리를 리포트 타입으로 매핑
  mapCategoryToReportType(category) {
    const mapping = {
      risk: REPORT_TYPES.RISK_ANALYSIS,
      theme: REPORT_TYPES.THEME_IMPACT,
      technical: REPORT_TYPES.TECHNICAL_ANALYSIS,
      sentiment: REPORT_TYPES.SENTIMENT_ANALYSIS,
      strategy: REPORT_TYPES.INVESTMENT_STRATEGY
    };
    return mapping[category] || REPORT_TYPES.COMPREHENSIVE;
  }

  // 관련 질문 제안
  suggestRelatedQuestions(category) {
    return this.questionTemplates.get(category) || [];
  }
}

/**
 * 리포트 생성기
 */
export class AutoReportGenerator {
  constructor() {
    this.questionClassifier = new QuestionClassifier();
    this.reportTemplates = new Map();
    this.generatedReports = new Map();
    this.initializeReportTemplates();
  }

  // 리포트 템플릿 초기화
  initializeReportTemplates() {
    this.reportTemplates.set(REPORT_TYPES.RISK_ANALYSIS, {
      title: '리스크 분석 리포트',
      sections: ['volatility', 'correlation_risk', 'sentiment_risk', 'technical_risk', 'recommendations'],
      priority: ['volatility', 'sentiment_risk']
    });

    this.reportTemplates.set(REPORT_TYPES.THEME_IMPACT, {
      title: '테마 영향력 분석',
      sections: ['theme_identification', 'theme_strength', 'policy_impact', 'sector_comparison', 'outlook'],
      priority: ['theme_identification', 'theme_strength']
    });

    this.reportTemplates.set(REPORT_TYPES.TECHNICAL_ANALYSIS, {
      title: '기술적 분석 리포트',
      sections: ['price_trend', 'technical_indicators', 'support_resistance', 'trading_signals', 'targets'],
      priority: ['technical_indicators', 'trading_signals']
    });

    this.reportTemplates.set(REPORT_TYPES.SENTIMENT_ANALYSIS, {
      title: '감정 분석 리포트',
      sections: ['news_sentiment', 'social_sentiment', 'market_psychology', 'sentiment_trend', 'impact_assessment'],
      priority: ['news_sentiment', 'sentiment_trend']
    });

    this.reportTemplates.set(REPORT_TYPES.INVESTMENT_STRATEGY, {
      title: '투자 전략 제안',
      sections: ['current_position', 'entry_strategy', 'risk_management', 'target_setting', 'portfolio_allocation'],
      priority: ['entry_strategy', 'risk_management']
    });
  }

  // 자동 리포트 생성
  async generateReport(question, analysisData, options = {}) {
    const {
      stock,
      includeCharts = false,
      detailLevel = 'medium', // 'brief', 'medium', 'detailed'
      language = 'ko'
    } = options;

    try {
      // 1. 질문 분류
      const classification = this.questionClassifier.classifyQuestion(question);
      
      // 2. 리포트 템플릿 선택
      const template = this.reportTemplates.get(classification.suggestedType);
      
      // 3. 데이터 분석 및 섹션별 내용 생성
      const sections = await this.generateReportSections(
        template.sections, 
        analysisData, 
        { stock, detailLevel, classification }
      );

      // 4. 리포트 조합
      const report = {
        id: `report_${Date.now()}`,
        timestamp: new Date().toISOString(),
        question: question,
        classification: classification,
        title: `${stock} - ${template.title}`,
        summary: this.generateSummary(sections, template.priority),
        sections: sections,
        metadata: {
          stock,
          generatedAt: new Date().toISOString(),
          confidence: classification.confidence,
          dataSource: this.getDataSourceInfo(analysisData)
        },
        recommendations: this.generateRecommendations(sections, classification.suggestedType),
        relatedQuestions: this.questionClassifier.suggestRelatedQuestions(classification.category)
      };

      // 5. 리포트 저장
      this.generatedReports.set(report.id, report);

      return report;

    } catch (error) {
      console.error('리포트 생성 실패:', error);
      throw new Error(`리포트 생성 중 오류 발생: ${error.message}`);
    }
  }

  // 섹션별 내용 생성
  async generateReportSections(sectionNames, analysisData, options) {
    const sections = {};

    for (const sectionName of sectionNames) {
      sections[sectionName] = await this.generateSection(sectionName, analysisData, options);
    }

    return sections;
  }

  // 개별 섹션 생성
  async generateSection(sectionName, analysisData, options) {
    const { stock, detailLevel, classification } = options;

    switch (sectionName) {
      case 'volatility':
        return this.generateVolatilitySection(analysisData, stock);
      
      case 'correlation_risk':
        return this.generateCorrelationRiskSection(analysisData, stock);
      
      case 'sentiment_risk':
        return this.generateSentimentRiskSection(analysisData, stock);
      
      case 'technical_risk':
        return this.generateTechnicalRiskSection(analysisData, stock);
      
      case 'theme_identification':
        return this.generateThemeIdentificationSection(analysisData, stock);
      
      case 'theme_strength':
        return this.generateThemeStrengthSection(analysisData, stock);
      
      case 'technical_indicators':
        return this.generateTechnicalIndicatorsSection(analysisData, stock);
      
      case 'trading_signals':
        return this.generateTradingSignalsSection(analysisData, stock);
      
      case 'news_sentiment':
        return this.generateNewsSentimentSection(analysisData, stock);
      
      case 'sentiment_trend':
        return this.generateSentimentTrendSection(analysisData, stock);
      
      case 'entry_strategy':
        return this.generateEntryStrategySection(analysisData, stock);
      
      case 'risk_management':
        return this.generateRiskManagementSection(analysisData, stock);
      
      case 'recommendations':
        return this.generateRecommendationsSection(analysisData, stock, classification);
      
      default:
        return this.generateDefaultSection(sectionName, analysisData, stock);
    }
  }

  // 변동성 섹션 생성
  generateVolatilitySection(analysisData, stock) {
    const priceData = analysisData.processedData?.price;
    if (!priceData) {
      return {
        title: '변동성 분석',
        content: '가격 데이터가 없어 변동성을 분석할 수 없습니다.',
        confidence: 'low',
        keyMetrics: {}
      };
    }

    const features = priceData.features || [];
    const volatilities = features.map(f => f.volatility);
    const avgVolatility = volatilities.reduce((sum, v) => sum + v, 0) / volatilities.length;
    const maxVolatility = Math.max(...volatilities);

    let riskLevel = 'LOW';
    let riskDescription = '안정적';
    
    if (avgVolatility > 0.03) {
      riskLevel = 'HIGH';
      riskDescription = '높은 변동성';
    } else if (avgVolatility > 0.015) {
      riskLevel = 'MEDIUM';
      riskDescription = '중간 변동성';
    }

    return {
      title: '변동성 분석',
      content: `${stock}의 평균 변동성은 ${(avgVolatility * 100).toFixed(2)}%로 ${riskDescription}을 보이고 있습니다. 최대 변동성은 ${(maxVolatility * 100).toFixed(2)}%에 달하여 단기적으로 큰 가격 움직임이 있었음을 의미합니다.`,
      confidence: 'high',
      keyMetrics: {
        avgVolatility: `${(avgVolatility * 100).toFixed(2)}%`,
        maxVolatility: `${(maxVolatility * 100).toFixed(2)}%`,
        riskLevel: riskLevel,
        samples: volatilities.length
      },
      analysis: {
        trend: avgVolatility > 0.02 ? '변동성이 큰 편입니다.' : '비교적 안정적입니다.',
        implication: riskLevel === 'HIGH' ? 
          '단기 투자 시 손실 위험이 큽니다.' : 
          '상대적으로 안전한 투자 대상입니다.'
      }
    };
  }

  // 상관관계 리스크 섹션 생성
  generateCorrelationRiskSection(analysisData, stock) {
    const correlations = analysisData.correlations?.correlations;
    if (!correlations) {
      return {
        title: '상관관계 리스크',
        content: '상관관계 데이터가 없어 분석할 수 없습니다.',
        confidence: 'low',
        keyMetrics: {}
      };
    }

    const highCorrelations = Object.values(correlations).filter(
      corr => corr.significance && Math.abs(corr.coefficient) > 0.7
    );

    const diversificationRisk = highCorrelations.length > 2 ? 'HIGH' : 
                               highCorrelations.length > 0 ? 'MEDIUM' : 'LOW';

    return {
      title: '상관관계 리스크',
      content: `${stock}는 ${highCorrelations.length}개의 다른 요소와 높은 상관관계를 보입니다. ${diversificationRisk === 'HIGH' ? '분산투자 효과가 제한적일' : '적절한 분산투자가 가능할'} 것으로 예상됩니다.`,
      confidence: 'medium',
      keyMetrics: {
        highCorrelations: highCorrelations.length,
        diversificationRisk: diversificationRisk,
        strongestCorrelation: highCorrelations.length > 0 ? 
          `${(highCorrelations[0].coefficient * 100).toFixed(1)}%` : 'N/A'
      },
      analysis: {
        diversification: diversificationRisk === 'HIGH' ? 
          '포트폴리오 구성 시 다른 섹터 종목을 포함하세요.' :
          '적절한 분산투자가 가능합니다.',
        correlation_insight: highCorrelations.length > 0 ? 
          `다른 종목들과의 동조화 위험이 있습니다.` :
          '독립적인 움직임을 보입니다.'
      }
    };
  }

  // 감정 리스크 섹션 생성
  generateSentimentRiskSection(analysisData, stock) {
    const sentiment = analysisData.processedData?.sentiment;
    if (!sentiment) {
      return {
        title: '감정 리스크',
        content: '감정 분석 데이터가 없습니다.',
        confidence: 'low',
        keyMetrics: {}
      };
    }

    const overallSentiment = sentiment.overall || 0;
    const distribution = sentiment.distribution || {};
    
    let sentimentRisk = 'MEDIUM';
    let description = '중립적';
    
    if (overallSentiment < -0.3) {
      sentimentRisk = 'HIGH';
      description = '부정적';
    } else if (overallSentiment > 0.3) {
      sentimentRisk = 'LOW';
      description = '긍정적';
    }

    return {
      title: '감정 리스크',
      content: `${stock}에 대한 시장 감정은 ${description}입니다. 전체 감정 점수는 ${overallSentiment.toFixed(2)}이며, 긍정적 뉴스가 ${distribution.positive?.toFixed(1) || 0}%, 부정적 뉴스가 ${distribution.negative?.toFixed(1) || 0}%를 차지합니다.`,
      confidence: 'medium',
      keyMetrics: {
        overallSentiment: overallSentiment.toFixed(2),
        sentimentRisk: sentimentRisk,
        positiveRatio: `${distribution.positive?.toFixed(1) || 0}%`,
        negativeRatio: `${distribution.negative?.toFixed(1) || 0}%`
      },
      analysis: {
        marketMood: sentimentRisk === 'HIGH' ? 
          '부정적 감정이 주가에 악영향을 줄 수 있습니다.' :
          sentimentRisk === 'LOW' ? 
          '긍정적 감정이 주가 상승을 도울 수 있습니다.' :
          '중립적 감정 상태입니다.',
        recommendation: sentimentRisk === 'HIGH' ? 
          '추가 악재 발생 시 주가 하락 위험이 큽니다.' :
          '감정적 요인으로 인한 큰 변동은 제한적일 것으로 예상됩니다.'
      }
    };
  }

  // 기술적 지표 섹션 생성
  generateTechnicalIndicatorsSection(analysisData, stock) {
    const technicalIndicators = analysisData.processedData?.technicalIndicators;
    if (!technicalIndicators) {
      return {
        title: '기술적 지표 분석',
        content: '기술적 지표 데이터가 없습니다.',
        confidence: 'low',
        keyMetrics: {}
      };
    }

    const { rsi, macd, bollinger } = technicalIndicators;
    const signals = [];
    const keyMetrics = {};

    // RSI 분석
    if (rsi && rsi.length > 0) {
      const latestRSI = rsi[rsi.length - 1];
      keyMetrics.rsi = latestRSI.rsi.toFixed(1);
      keyMetrics.rsiSignal = latestRSI.signal;
      
      if (latestRSI.signal === 'overbought') {
        signals.push('RSI 과매수 상태 - 조정 가능성');
      } else if (latestRSI.signal === 'oversold') {
        signals.push('RSI 과매도 상태 - 반등 가능성');
      }
    }

    // MACD 분석
    if (macd && macd.length > 0) {
      const latestMACD = macd[macd.length - 1];
      keyMetrics.macd = latestMACD.macd.toFixed(2);
      keyMetrics.macdSignal = latestMACD.signal.toFixed(2);
      keyMetrics.macdCrossover = latestMACD.crossover;
      
      if (latestMACD.crossover === 'bullish') {
        signals.push('MACD 골든크로스 - 상승 신호');
      } else if (latestMACD.crossover === 'bearish') {
        signals.push('MACD 데드크로스 - 하락 신호');
      }
    }

    // 볼린저 밴드 분석
    if (bollinger && bollinger.length > 0) {
      const latestBollinger = bollinger[bollinger.length - 1];
      keyMetrics.bollingerSignal = latestBollinger.signal;
      keyMetrics.percentB = latestBollinger.percentB.toFixed(2);
      
      if (latestBollinger.signal === 'overbought') {
        signals.push('볼린저 밴드 상단 접촉 - 과매수');
      } else if (latestBollinger.signal === 'oversold') {
        signals.push('볼린저 밴드 하단 접촉 - 과매도');
      }
    }

    const overallSignal = this.determineOverallTechnicalSignal(signals);

    return {
      title: '기술적 지표 분석',
      content: `${stock}의 기술적 지표 분석 결과, 현재 ${overallSignal.direction} 신호를 보이고 있습니다. ${signals.join(', ')}`,
      confidence: 'high',
      keyMetrics: keyMetrics,
      signals: signals,
      overallSignal: overallSignal,
      analysis: {
        shortTerm: this.getShortTermOutlook(signals),
        tradingAction: this.getRecommendedAction(overallSignal)
      }
    };
  }

  // 전체 기술적 신호 판정
  determineOverallTechnicalSignal(signals) {
    const bullishSignals = signals.filter(s => 
      s.includes('상승') || s.includes('반등') || s.includes('골든크로스')
    ).length;
    
    const bearishSignals = signals.filter(s => 
      s.includes('하락') || s.includes('조정') || s.includes('데드크로스')
    ).length;

    if (bullishSignals > bearishSignals) {
      return { direction: '상승', strength: 'moderate' };
    } else if (bearishSignals > bullishSignals) {
      return { direction: '하락', strength: 'moderate' };
    } else {
      return { direction: '중립', strength: 'weak' };
    }
  }

  // 단기 전망
  getShortTermOutlook(signals) {
    if (signals.some(s => s.includes('골든크로스') || s.includes('반등'))) {
      return '단기적으로 상승 모멘텀이 기대됩니다.';
    } else if (signals.some(s => s.includes('데드크로스') || s.includes('조정'))) {
      return '단기적으로 조정 압력이 있을 수 있습니다.';
    } else {
      return '단기적으로 횡보할 가능성이 높습니다.';
    }
  }

  // 추천 행동
  getRecommendedAction(overallSignal) {
    switch (overallSignal.direction) {
      case '상승':
        return '매수 타이밍을 고려해보세요.';
      case '하락':
        return '매도를 고려하거나 관망하세요.';
      default:
        return '현재 포지션을 유지하며 추가 신호를 기다리세요.';
    }
  }

  // 요약 생성
  generateSummary(sections, prioritySections) {
    const summaryPoints = [];

    prioritySections.forEach(sectionName => {
      const section = sections[sectionName];
      if (section && section.content) {
        // 각 섹션의 첫 번째 문장을 요약으로 추출
        const firstSentence = section.content.split('.')[0] + '.';
        summaryPoints.push(firstSentence);
      }
    });

    return {
      keyPoints: summaryPoints,
      overallAssessment: this.generateOverallAssessment(sections),
      confidence: this.calculateOverallConfidence(sections)
    };
  }

  // 전체 평가 생성
  generateOverallAssessment(sections) {
    const hasHighRisk = Object.values(sections).some(section => 
      section.keyMetrics?.riskLevel === 'HIGH' || 
      section.keyMetrics?.sentimentRisk === 'HIGH'
    );

    const hasPositiveSignals = Object.values(sections).some(section => 
      section.overallSignal?.direction === '상승' ||
      section.keyMetrics?.sentimentRisk === 'LOW'
    );

    if (hasHighRisk && !hasPositiveSignals) {
      return '높은 리스크와 제한적인 상승 요인으로 신중한 접근이 필요합니다.';
    } else if (!hasHighRisk && hasPositiveSignals) {
      return '상대적으로 안전하면서 상승 가능성이 있는 투자 대상으로 평가됩니다.';
    } else if (hasHighRisk && hasPositiveSignals) {
      return '고위험 고수익 가능성이 있으나 철저한 리스크 관리가 필요합니다.';
    } else {
      return '중립적인 투자 대상으로 현재 시점에서는 관망이 적절할 것 같습니다.';
    }
  }

  // 전체 신뢰도 계산
  calculateOverallConfidence(sections) {
    const confidences = Object.values(sections)
      .map(section => {
        switch (section.confidence) {
          case 'high': return 0.8;
          case 'medium': return 0.6;
          case 'low': return 0.3;
          default: return 0.5;
        }
      })
      .filter(conf => conf > 0);

    if (confidences.length === 0) return 'medium';

    const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    
    if (avgConfidence >= 0.7) return 'high';
    if (avgConfidence >= 0.5) return 'medium';
    return 'low';
  }

  // 추천사항 생성
  generateRecommendations(sections, reportType) {
    const recommendations = [];

    switch (reportType) {
      case REPORT_TYPES.RISK_ANALYSIS:
        recommendations.push('리스크 요소를 지속적으로 모니터링하세요.');
        recommendations.push('포지션 크기를 조절하여 리스크를 관리하세요.');
        break;

      case REPORT_TYPES.TECHNICAL_ANALYSIS:
        recommendations.push('기술적 신호가 바뀔 때까지 현재 전략을 유지하세요.');
        recommendations.push('거래량과 함께 신호를 확인하세요.');
        break;

      case REPORT_TYPES.SENTIMENT_ANALYSIS:
        recommendations.push('뉴스와 시장 감정 변화를 주시하세요.');
        recommendations.push('감정적 과반응을 피하고 객관적으로 판단하세요.');
        break;

      default:
        recommendations.push('다각도 분석을 통해 종합적으로 판단하세요.');
        recommendations.push('정기적으로 분석을 업데이트하세요.');
    }

    // 섹션별 구체적 추천사항 추가
    Object.values(sections).forEach(section => {
      if (section.analysis?.recommendation) {
        recommendations.push(section.analysis.recommendation);
      }
    });

    return [...new Set(recommendations)]; // 중복 제거
  }

  // 데이터 소스 정보
  getDataSourceInfo(analysisData) {
    return {
      priceDataPoints: analysisData.processedData?.price?.raw?.length || 0,
      sentimentSamples: Object.keys(analysisData.processedData?.sentiment?.timeline || {}).length,
      correlationPairs: Object.keys(analysisData.correlations?.correlations || {}).length,
      lastUpdate: new Date().toISOString()
    };
  }

  // 기본 섹션 생성
  generateDefaultSection(sectionName, analysisData, stock) {
    return {
      title: sectionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      content: `${sectionName}에 대한 분석 데이터가 부족합니다.`,
      confidence: 'low',
      keyMetrics: {},
      analysis: {
        note: '추가 데이터 수집이 필요합니다.'
      }
    };
  }

  // 다른 섹션 생성 메서드들 (간소화된 버전)
  generateThemeIdentificationSection(analysisData, stock) {
    return {
      title: '테마 식별',
      content: `${stock}의 주요 테마를 분석 중입니다.`,
      confidence: 'medium',
      keyMetrics: { mainTheme: '분석 중' }
    };
  }

  generateThemeStrengthSection(analysisData, stock) {
    return {
      title: '테마 강도',
      content: `테마의 영향력과 지속 가능성을 평가합니다.`,
      confidence: 'medium',
      keyMetrics: { strength: '중간' }
    };
  }

  generateTradingSignalsSection(analysisData, stock) {
    return {
      title: '매매 신호',
      content: `현재 매매 신호를 종합적으로 분석합니다.`,
      confidence: 'medium',
      keyMetrics: { signal: '관망' }
    };
  }

  generateNewsSentimentSection(analysisData, stock) {
    const sentiment = analysisData.processedData?.sentiment;
    return {
      title: '뉴스 감정 분석',
      content: `뉴스 기반 감정 분석 결과를 제공합니다.`,
      confidence: sentiment ? 'high' : 'low',
      keyMetrics: { 
        overallSentiment: sentiment?.overall?.toFixed(2) || 'N/A' 
      }
    };
  }

  generateSentimentTrendSection(analysisData, stock) {
    return {
      title: '감정 트렌드',
      content: `시간에 따른 감정 변화 패턴을 분석합니다.`,
      confidence: 'medium',
      keyMetrics: { trend: '분석 중' }
    };
  }

  generateEntryStrategySection(analysisData, stock) {
    return {
      title: '진입 전략',
      content: `최적 진입 시점과 전략을 제안합니다.`,
      confidence: 'medium',
      keyMetrics: { strategy: '단계적 진입' }
    };
  }

  generateRiskManagementSection(analysisData, stock) {
    return {
      title: '리스크 관리',
      content: `포지션 크기와 손절매 전략을 제안합니다.`,
      confidence: 'high',
      keyMetrics: { 
        maxPosition: '10%',
        stopLoss: '5%'
      }
    };
  }

  generateRecommendationsSection(analysisData, stock, classification) {
    return {
      title: '종합 추천',
      content: `분석 결과를 바탕으로 한 종합적인 투자 제안입니다.`,
      confidence: 'medium',
      keyMetrics: { 
        recommendation: '중립',
        timeframe: '단기'
      }
    };
  }

  // 리포트 조회
  getReport(reportId) {
    return this.generatedReports.get(reportId);
  }

  // 모든 리포트 조회
  getAllReports() {
    return Array.from(this.generatedReports.values());
  }

  // 리포트 삭제
  deleteReport(reportId) {
    return this.generatedReports.delete(reportId);
  }
}

/**
 * 통합 리포트 매니저
 */
export class ReportManager {
  constructor() {
    this.autoReportGenerator = new AutoReportGenerator();
    this.reportHistory = new Map();
    this.reportTemplates = new Map();
  }

  // 질문 기반 리포트 생성
  async generateQuestionBasedReport(question, analysisData, options = {}) {
    try {
      console.log(`📋 "${question}" 질문에 대한 리포트 생성 중...`);
      
      const report = await this.autoReportGenerator.generateReport(question, analysisData, options);
      
      // 히스토리에 저장
      this.reportHistory.set(report.id, {
        ...report,
        createdAt: new Date(),
        viewCount: 0
      });

      console.log(`✅ 리포트 생성 완료: ${report.title}`);
      return report;

    } catch (error) {
      console.error('❌ 리포트 생성 실패:', error);
      throw error;
    }
  }

  // 추천 질문 목록 제공
  getSuggestedQuestions(category = null) {
    const classifier = this.autoReportGenerator.questionClassifier;
    
    if (category) {
      return classifier.suggestRelatedQuestions(category);
    }

    // 모든 카테고리의 질문을 섞어서 제공
    const allQuestions = [];
    Object.keys(QUESTION_CATEGORIES).forEach(cat => {
      const questions = classifier.suggestRelatedQuestions(cat.toLowerCase());
      allQuestions.push(...questions);
    });

    return allQuestions.sort(() => Math.random() - 0.5).slice(0, 10);
  }

  // 리포트 히스토리 조회
  getReportHistory(limit = 10) {
    return Array.from(this.reportHistory.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  // 리포트 통계
  getReportStatistics() {
    const reports = Array.from(this.reportHistory.values());
    const totalReports = reports.length;
    
    const categoryCounts = {};
    reports.forEach(report => {
      const category = report.classification.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const avgConfidence = reports.reduce((sum, report) => 
      sum + (report.classification.confidence || 0), 0) / Math.max(totalReports, 1);

    return {
      totalReports,
      categoryCounts,
      avgConfidence: avgConfidence.toFixed(2),
      mostPopularCategory: Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'
    };
  }

  // 리포트 내보내기
  exportReport(reportId, format = 'json') {
    const report = this.reportHistory.get(reportId);
    if (!report) {
      throw new Error('리포트를 찾을 수 없습니다.');
    }

    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      
      case 'markdown':
        return this.convertToMarkdown(report);
      
      case 'html':
        return this.convertToHTML(report);
      
      default:
        throw new Error('지원하지 않는 형식입니다.');
    }
  }

  // 마크다운 변환
  convertToMarkdown(report) {
    let markdown = `# ${report.title}\n\n`;
    markdown += `**생성일시:** ${report.timestamp}\n`;
    markdown += `**질문:** ${report.question}\n\n`;
    
    markdown += `## 요약\n`;
    markdown += `${report.summary.overallAssessment}\n\n`;
    
    markdown += `### 주요 포인트\n`;
    report.summary.keyPoints.forEach(point => {
      markdown += `- ${point}\n`;
    });
    markdown += '\n';

    Object.entries(report.sections).forEach(([sectionName, section]) => {
      markdown += `## ${section.title}\n`;
      markdown += `${section.content}\n\n`;
      
      if (Object.keys(section.keyMetrics).length > 0) {
        markdown += `### 주요 지표\n`;
        Object.entries(section.keyMetrics).forEach(([key, value]) => {
          markdown += `- **${key}:** ${value}\n`;
        });
        markdown += '\n';
      }
    });

    markdown += `## 추천사항\n`;
    report.recommendations.forEach(rec => {
      markdown += `- ${rec}\n`;
    });

    return markdown;
  }

  // HTML 변환
  convertToHTML(report) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${report.title}</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2rem; }
        .header { border-bottom: 2px solid #333; padding-bottom: 1rem; }
        .section { margin: 2rem 0; }
        .metrics { background: #f5f5f5; padding: 1rem; border-radius: 5px; }
        .recommendations { background: #e8f5e8; padding: 1rem; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.title}</h1>
        <p><strong>생성일시:</strong> ${report.timestamp}</p>
        <p><strong>질문:</strong> ${report.question}</p>
    </div>
    
    <div class="section">
        <h2>요약</h2>
        <p>${report.summary.overallAssessment}</p>
        <ul>
            ${report.summary.keyPoints.map(point => `<li>${point}</li>`).join('')}
        </ul>
    </div>
    
    ${Object.entries(report.sections).map(([sectionName, section]) => `
        <div class="section">
            <h2>${section.title}</h2>
            <p>${section.content}</p>
            ${Object.keys(section.keyMetrics).length > 0 ? `
                <div class="metrics">
                    <h3>주요 지표</h3>
                    ${Object.entries(section.keyMetrics).map(([key, value]) => 
                        `<p><strong>${key}:</strong> ${value}</p>`
                    ).join('')}
                </div>
            ` : ''}
        </div>
    `).join('')}
    
    <div class="recommendations">
        <h2>추천사항</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;
  }
}

export default ReportManager; 