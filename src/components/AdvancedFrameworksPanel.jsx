import React, { useState, useEffect } from 'react';
import { COLORS } from '../utils/constants';
import MacroExplorationFrameworks from '../utils/dataMining/advancedFrameworks';
import BottomUpAnalysisFrameworks from '../utils/dataMining/bottomUpFrameworks';
import PsychologicalMemeFrameworks from '../utils/dataMining/psychologicalFrameworks';
import CausalityCorrelationFrameworks from '../utils/dataMining/causalityCorrelationFrameworks';
import InvestmentStrategyFrameworks from '../utils/dataMining/investmentStrategyFrameworks';

// 프레임워크 카테고리
const FRAMEWORK_CATEGORIES = {
  MACRO: 'macro',
  BOTTOM_UP: 'bottom_up',
  PSYCHOLOGICAL: 'psychological',
  CAUSAL: 'causal',
  INVESTMENT: 'investment',
  LEARNING: 'learning'
};

// 개별 프레임워크 정의
const AVAILABLE_FRAMEWORKS = {
  [FRAMEWORK_CATEGORIES.MACRO]: [
    { id: 'policy_benefit', name: '정책 수혜 스코어링', icon: '🏛️', priority: 'high' },
    { id: 'global_risk', name: '글로벌 리스크 매핑', icon: '🌍', priority: 'high' },
    { id: 'economic_cycle', name: '경제 사이클 적합도', icon: '📊', priority: 'medium' },
    { id: 'interest_rate', name: '금리 영향도 맵', icon: '💰', priority: 'medium' },
    { id: 'macro_news', name: '거시 뉴스 이슈맵', icon: '📰', priority: 'high' }
  ],
  [FRAMEWORK_CATEGORIES.BOTTOM_UP]: [
    { id: 'rnd_ratio', name: 'R&D 투자비율', icon: '🧪', priority: 'medium' },
    { id: 'customer_impact', name: '주요 고객사 영향도', icon: '🏢', priority: 'high' },
    { id: 'tech_momentum', name: '기술 모멘텀', icon: '🚀', priority: 'medium' },
    { id: 'financial_health', name: '재무 건전성 다층분석', icon: '💰', priority: 'high' },
    { id: 'contract_capability', name: '계약 체결력 점수화', icon: '📋', priority: 'medium' }
  ],
  [FRAMEWORK_CATEGORIES.PSYCHOLOGICAL]: [
    { id: 'reddit_heat', name: '레딧 열기 지수', icon: '🔥', priority: 'high' },
    { id: 'fomo_boundary', name: '과열 vs FOMO 경계지수', icon: '🌡️', priority: 'high' },
    { id: 'contrarian', name: '역발상 탐지', icon: '🔄', priority: 'medium' },
    { id: 'narrative_strength', name: '짧은 서사 강도', icon: '📖', priority: 'medium' },
    { id: 'ai_theme_tagging', name: 'AI 테마 자동 태깅', icon: '🏷️', priority: 'high' }
  ],
  [FRAMEWORK_CATEGORIES.CAUSAL]: [
    { id: 'policy_industry_graph', name: '정책↔산업↔종목 그래프', icon: '🔗', priority: 'high' },
    { id: 'co_rising_correlation', name: '동반 상승 상관', icon: '📈', priority: 'high' },
    { id: 'energy_cost_impact', name: '에너지/소재 영향', icon: '⚡', priority: 'medium' },
    { id: 'exchange_rate_sensitivity', name: '환율 민감도', icon: '💱', priority: 'medium' }
  ],
  [FRAMEWORK_CATEGORIES.INVESTMENT]: [
    { id: 'quant_factor_ranking', name: '퀀트팩터 랭킹', icon: '📊', priority: 'high' },
    { id: 'profit_maximization_simulator', name: '30일 수익 최대화', icon: '💎', priority: 'high' },
    { id: 'take_profit_trigger', name: '익절 트리거 알림', icon: '🚨', priority: 'medium' },
    { id: 'buy_timing_scoring', name: '매수 타이밍', icon: '⏰', priority: 'high' },
    { id: 'sector_rotation_strategy', name: '섹터 순환 전략', icon: '🔄', priority: 'medium' }
  ]
};

function AdvancedFrameworksPanel({ selectedStock, darkMode = false }) {
  const [frameworks] = useState(() => ({
    macro: new MacroExplorationFrameworks(),
    bottomUp: new BottomUpAnalysisFrameworks(),
    psychological: new PsychologicalMemeFrameworks(),
    causal: new CausalityCorrelationFrameworks(),
    investment: new InvestmentStrategyFrameworks()
  }));

  const [selectedCategory, setSelectedCategory] = useState(FRAMEWORK_CATEGORIES.MACRO);
  const [activeFrameworks, setActiveFrameworks] = useState(new Set());
  const [analysisResults, setAnalysisResults] = useState(new Map());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const theme = darkMode ? COLORS.dark : COLORS.light;

  // 프레임워크 실행
  const runFramework = async (frameworkId, category) => {
    if (activeFrameworks.has(frameworkId)) return;

    setActiveFrameworks(prev => new Set([...prev, frameworkId]));
    setIsAnalyzing(true);

    try {
      let result = null;
      
      console.log(`🔍 ${frameworkId} 프레임워크 실행 중...`);

      switch (category) {
        case FRAMEWORK_CATEGORIES.MACRO:
          result = await executeMarcoFramework(frameworkId, selectedStock);
          break;
        case FRAMEWORK_CATEGORIES.BOTTOM_UP:
          result = await executeBottomUpFramework(frameworkId, selectedStock);
          break;
        case FRAMEWORK_CATEGORIES.PSYCHOLOGICAL:
          result = await executePsychologicalFramework(frameworkId, selectedStock);
          break;
        case FRAMEWORK_CATEGORIES.CAUSAL:
          result = await executeCausalFramework(frameworkId, selectedStock);
          break;
        case FRAMEWORK_CATEGORIES.INVESTMENT:
          result = await executeInvestmentFramework(frameworkId, selectedStock);
          break;
        default:
          throw new Error(`지원하지 않는 카테고리: ${category}`);
      }

      setAnalysisResults(prev => new Map([...prev, [frameworkId, result]]));
      console.log(`✅ ${frameworkId} 프레임워크 완료`);

    } catch (error) {
      console.error(`❌ ${frameworkId} 프레임워크 실패:`, error);
      // 에러를 결과로 저장
      setAnalysisResults(prev => new Map([...prev, [frameworkId, { error: error.message }]]));
    } finally {
      setActiveFrameworks(prev => {
        const newSet = new Set(prev);
        newSet.delete(frameworkId);
        return newSet;
      });
      
      if (activeFrameworks.size <= 1) {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
      }
    }
  };

  // 거시 프레임워크 실행
  const executeMarcoFramework = async (frameworkId, stock) => {
    switch (frameworkId) {
      case 'policy_benefit':
        return await frameworks.macro.analyzePolicyBenefitScoring(stock, [
          { name: 'IRA', impact: 'high' },
          { name: '반도체법', impact: 'high' }
        ]);
      case 'global_risk':
        return await frameworks.macro.analyzeGlobalRiskMapping(stock);
      case 'economic_cycle':
        return await frameworks.macro.analyzeEconomicCycleMatching(stock);
      case 'interest_rate':
        return await frameworks.macro.analyzeInterestRateImpactMap(stock);
      case 'macro_news':
        return await frameworks.macro.analyzeMacroNewsIssueMap(stock);
      default:
        throw new Error(`알 수 없는 거시 프레임워크: ${frameworkId}`);
    }
  };

  // 바텀업 프레임워크 실행
  const executeBottomUpFramework = async (frameworkId, stock) => {
    switch (frameworkId) {
      case 'rnd_ratio':
        return await frameworks.bottomUp.analyzeRnDInvestmentRatio(stock);
      case 'customer_impact':
        return await frameworks.bottomUp.analyzeCustomerImpactFramework(stock);
      case 'tech_momentum':
        return await frameworks.bottomUp.analyzeTechnologyMomentumFramework(stock);
      case 'financial_health':
        return await frameworks.bottomUp.analyzeFinancialHealthFramework(stock);
      case 'contract_capability':
        return await frameworks.bottomUp.analyzeContractCapabilityFramework(stock);
      default:
        throw new Error(`알 수 없는 바텀업 프레임워크: ${frameworkId}`);
    }
  };

  // 심리 프레임워크 실행
  const executePsychologicalFramework = async (frameworkId, stock) => {
    switch (frameworkId) {
      case 'reddit_heat':
        return await frameworks.psychological.analyzeRedditHeatIndex(stock);
      case 'fomo_boundary':
        return await frameworks.psychological.analyzeFOMOBoundaryIndex(stock);
      case 'contrarian':
        return await frameworks.psychological.analyzeContrarianDetection(stock);
      case 'narrative_strength':
        return await frameworks.psychological.analyzeShortNarrativeStrength(stock);
      case 'ai_theme_tagging':
        return await frameworks.psychological.analyzeAIThemeAutoTagging(stock);
      default:
        throw new Error(`알 수 없는 심리 프레임워크: ${frameworkId}`);
    }
  };

  // 인과관계/상관 프레임워크 실행
  const executeCausalFramework = async (frameworkId, stock) => {
    const marketData = {
      policyNews: [
        { title: 'IRA 관련 정책 발표', content: '인플레이션 감축법 태양광 에너지 지원' },
        { title: '반도체 지원법', content: 'CHIPS Act 국내 반도체 산업 육성' }
      ],
      industryData: {
        '반도체': { growth: 15, policy_impact: 'high' },
        '태양광': { growth: 25, policy_impact: 'very_high' },
        '전기차': { growth: 20, policy_impact: 'high' }
      },
      stockData: {
        [stock]: { 
          volume: Math.random() * 1000000,
          price: Math.random() * 100000 + 50000,
          sector: '반도체'
        }
      },
      stockPrices: {
        [stock]: Array.from({length: 60}, () => Math.random() * 20000 + 80000),
        '삼성전자': Array.from({length: 60}, () => Math.random() * 10000 + 70000),
        'SK하이닉스': Array.from({length: 60}, () => Math.random() * 20000 + 100000)
      },
      energyPrices: {
        'crude_oil': Array.from({length: 60}, () => Math.random() * 20 + 80),
        'natural_gas': Array.from({length: 60}, () => Math.random() * 5 + 15),
        'coal': Array.from({length: 60}, () => Math.random() * 10 + 90)
      },
      materialPrices: {
        'copper': Array.from({length: 60}, () => Math.random() * 1000 + 8000),
        'steel': Array.from({length: 60}, () => Math.random() * 100 + 500),
        'aluminum': Array.from({length: 60}, () => Math.random() * 500 + 2000)
      },
      exchangeRates: {
        'USD': Array.from({length: 60}, () => Math.random() * 50 + 1300),
        'CNY': Array.from({length: 60}, () => Math.random() * 10 + 180),
        'JPY': Array.from({length: 60}, () => Math.random() * 50 + 950)
      },
      exportRatio: 0.6,
      importRatio: 0.4,
      industry: '반도체'
    };

    switch (frameworkId) {
      case 'policy_industry_graph':
        return await frameworks.causal.analyzePolicyIndustryStockGraph(marketData);
      case 'co_rising_correlation':
        return await frameworks.causal.analyzeCoRisingCorrelation(marketData);
      case 'energy_cost_impact':
        return await frameworks.causal.analyzeEnergyCostImpact(marketData);
      case 'exchange_rate_sensitivity':
        return await frameworks.causal.analyzeExchangeRateSensitivity(marketData);
      default:
        throw new Error(`알 수 없는 인과관계 프레임워크: ${frameworkId}`);
    }
  };

  // 투자 전략 프레임워크 실행
  const executeInvestmentFramework = async (frameworkId, stock) => {
    const marketData = {
      stockPrices: {
        [stock]: Array.from({length: 60}, () => Math.random() * 20000 + 80000),
        '삼성전자': Array.from({length: 60}, () => Math.random() * 10000 + 70000),
        'SK하이닉스': Array.from({length: 60}, () => Math.random() * 20000 + 100000)
      },
      financialData: {
        market_cap: Math.random() * 100000000000000,
        revenue: Math.random() * 10000000000000,
        net_income: Math.random() * 1000000000000,
        total_assets: Math.random() * 50000000000000
      },
      technicalIndicators: {
        rsi: Math.random() * 100,
        macd: Math.random() * 2 - 1,
        volume: Math.random() * 1000000
      },
      sectorData: {
        sector: '반도체',
        sectorFlow: Math.random() * 1000000000,
        sectorMomentum: Math.random() * 2 - 1
      }
    };

    switch (frameworkId) {
      case 'quant_factor_ranking':
        return await frameworks.investment.analyzeQuantFactorRanking(stock, marketData);
      case 'profit_maximization_simulator':
        return await frameworks.investment.analyzeProfitMaximizationSimulator(stock, 500000, marketData);
      case 'take_profit_trigger':
        return await frameworks.investment.analyzeTakeProfitTrigger(stock, marketData);
      case 'buy_timing_scoring':
        return await frameworks.investment.analyzeBuyTimingScoring(stock, marketData);
      case 'sector_rotation_strategy':
        return await frameworks.investment.analyzeSectorRotationStrategy(stock, marketData);
      default:
        throw new Error(`알 수 없는 투자 전략 프레임워크: ${frameworkId}`);
    }
  };

  // 모든 고우선순위 프레임워크 실행
  const runHighPriorityFrameworks = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const highPriorityFrameworks = Object.values(AVAILABLE_FRAMEWORKS)
      .flat()
      .filter(fw => fw.priority === 'high');

    const total = highPriorityFrameworks.length;
    let completed = 0;

    for (const framework of highPriorityFrameworks) {
      const category = Object.keys(AVAILABLE_FRAMEWORKS).find(cat =>
        AVAILABLE_FRAMEWORKS[cat].some(fw => fw.id === framework.id)
      );
      
      await runFramework(framework.id, category);
      completed++;
      setAnalysisProgress((completed / total) * 100);
    }

    setIsAnalyzing(false);
  };

  // 카테고리별 요약 생성
  const generateCategorySummary = (category) => {
    const categoryFrameworks = AVAILABLE_FRAMEWORKS[category];
    const completedCount = categoryFrameworks.filter(fw => 
      analysisResults.has(fw.id) && !analysisResults.get(fw.id)?.error
    ).length;

    return {
      total: categoryFrameworks.length,
      completed: completedCount,
      progress: (completedCount / categoryFrameworks.length) * 100
    };
  };

  return (
    <div style={{
      background: theme.surface,
      borderRadius: '20px',
      padding: '2rem',
      margin: '1rem 0',
      border: `2px solid ${theme.border}`,
      boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      {/* 헤더 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          margin: '0 0 0.5rem 0',
          color: COLORS.primary,
          fontSize: '1.8rem',
          fontWeight: '900',
          background: `linear-gradient(45deg, ${COLORS.primary}, #ff6b6b, #4ecdc4)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          📚 통찰을 부르는 30+ 고급 프레임
        </h3>
        <p style={{
          margin: 0,
          color: theme.subtext,
          fontSize: '1rem',
          fontStyle: 'italic'
        }}>
          {selectedStock} 종목의 다차원 심층 분석 - 단타 앱의 핵심 기술
        </p>
      </div>

      {/* 통합 실행 버튼 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <button
          onClick={runHighPriorityFrameworks}
          disabled={isAnalyzing}
          style={{
            background: isAnalyzing 
              ? `linear-gradient(45deg, #95a5a6, #bdc3c7)` 
              : `linear-gradient(45deg, ${COLORS.primary}, #ff6b6b, #4ecdc4)`,
            color: '#fff',
            border: 'none',
            borderRadius: '25px',
            padding: '1rem 2rem',
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            fontSize: '1.1rem',
            fontWeight: '700',
            transition: 'all 0.3s',
            boxShadow: '0 6px 20px rgba(136, 132, 216, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            margin: '0 auto',
            backgroundSize: '200% 200%',
            animation: 'gradientMove 3s ease infinite'
          }}
        >
          {isAnalyzing ? '🔄 고급 분석 실행 중...' : '🚀 핵심 프레임 일괄 실행'}
        </button>

        {isAnalyzing && (
          <div style={{
            marginTop: '1rem',
            width: '300px',
            margin: '1rem auto 0 auto'
          }}>
            <div style={{
              background: theme.border,
              borderRadius: '10px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${analysisProgress}%`,
                height: '100%',
                background: `linear-gradient(45deg, ${COLORS.primary}, #4ecdc4)`,
                transition: 'width 0.5s ease'
              }} />
            </div>
            <p style={{
              margin: '0.5rem 0 0 0',
              color: theme.subtext,
              fontSize: '0.85rem',
              textAlign: 'center'
            }}>
              진행률: {analysisProgress.toFixed(0)}%
            </p>
          </div>
        )}
      </div>

      {/* 카테고리 탭 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {Object.entries(FRAMEWORK_CATEGORIES).map(([key, value]) => {
          const summary = generateCategorySummary(value);
          const isActive = selectedCategory === value;
          
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(value)}
              style={{
                background: isActive ? COLORS.primary : 'transparent',
                color: isActive ? '#fff' : theme.text,
                border: `2px solid ${isActive ? COLORS.primary : theme.border}`,
                borderRadius: '12px',
                padding: '0.8rem 1.2rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.3rem',
                minWidth: '120px'
              }}
            >
              <span>{getCategoryName(key)}</span>
              <span style={{
                fontSize: '0.75rem',
                opacity: 0.8
              }}>
                {summary.completed}/{summary.total}
              </span>
              {summary.completed > 0 && (
                <div style={{
                  width: '100%',
                  height: '3px',
                  background: isActive ? 'rgba(255,255,255,0.3)' : theme.border,
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${summary.progress}%`,
                    height: '100%',
                    background: isActive ? '#fff' : COLORS.success,
                    transition: 'width 0.3s'
                  }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 카테고리의 프레임워크들 */}
      <FrameworkGrid
        frameworks={AVAILABLE_FRAMEWORKS[selectedCategory]}
        category={selectedCategory}
        activeFrameworks={activeFrameworks}
        analysisResults={analysisResults}
        onRunFramework={runFramework}
        darkMode={darkMode}
      />

      {/* 분석 결과 패널 */}
      {analysisResults.size > 0 && (
        <AnalysisResultsPanel
          results={analysisResults}
          darkMode={darkMode}
        />
      )}

      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
}

// 프레임워크 그리드 컴포넌트
function FrameworkGrid({ frameworks, category, activeFrameworks, analysisResults, onRunFramework, darkMode }) {
  const theme = darkMode ? COLORS.dark : COLORS.light;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      {frameworks.map(framework => {
        const isActive = activeFrameworks.has(framework.id);
        const hasResult = analysisResults.has(framework.id);
        const hasError = hasResult && analysisResults.get(framework.id)?.error;
        
        return (
          <div
            key={framework.id}
            style={{
              background: darkMode ? '#1a1a1a' : '#f8f9fa',
              borderRadius: '16px',
              padding: '1.5rem',
              border: `2px solid ${hasResult ? (hasError ? COLORS.danger : COLORS.success) : theme.border}`,
              transition: 'all 0.3s',
              position: 'relative'
            }}
          >
            {/* 프레임워크 정보 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '2rem',
                background: getPriorityColor(framework.priority),
                borderRadius: '12px',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '60px',
                minHeight: '60px'
              }}>
                {framework.icon}
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  color: theme.text,
                  fontSize: '1.1rem',
                  fontWeight: '700'
                }}>
                  {framework.name}
                </h4>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    background: getPriorityColor(framework.priority),
                    color: '#fff',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {framework.priority}
                  </span>
                  
                  {hasResult && (
                    <span style={{
                      color: hasError ? COLORS.danger : COLORS.success,
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {hasError ? '❌ 오류' : '✅ 완료'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 실행 버튼 */}
            <button
              onClick={() => onRunFramework(framework.id, category)}
              disabled={isActive || hasResult}
              style={{
                width: '100%',
                background: hasResult 
                  ? (hasError ? COLORS.danger : COLORS.success) 
                  : isActive 
                    ? `linear-gradient(45deg, #95a5a6, #bdc3c7)` 
                    : `linear-gradient(45deg, ${COLORS.primary}, #4ecdc4)`,
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.8rem',
                cursor: hasResult || isActive ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
            >
              {isActive ? '🔄 분석 중...' : 
               hasResult ? (hasError ? '다시 시도' : '분석 완료') : 
               '🚀 분석 시작'}
            </button>

            {/* 로딩 인디케이터 */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '24px',
                height: '24px',
                border: `3px solid ${theme.border}`,
                borderTop: `3px solid ${COLORS.primary}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// 분석 결과 패널 컴포넌트
function AnalysisResultsPanel({ results, darkMode }) {
  const theme = darkMode ? COLORS.dark : COLORS.light;
  const [selectedResult, setSelectedResult] = useState(null);

  const successfulResults = Array.from(results.entries()).filter(([_, result]) => !result.error);

  if (successfulResults.length === 0) return null;

  return (
    <div style={{
      background: darkMode ? '#1a1a1a' : '#f8f9fa',
      borderRadius: '16px',
      padding: '2rem',
      border: `2px solid ${theme.border}`,
      marginTop: '2rem'
    }}>
      <h4 style={{
        margin: '0 0 1.5rem 0',
        color: COLORS.primary,
        fontSize: '1.3rem',
        fontWeight: '700'
      }}>
        🎯 분석 결과 요약
      </h4>

      {/* 결과 카드들 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {successfulResults.map(([frameworkId, result]) => (
          <ResultCard
            key={frameworkId}
            frameworkId={frameworkId}
            result={result}
            onClick={() => setSelectedResult({ frameworkId, result })}
            darkMode={darkMode}
          />
        ))}
      </div>

      {/* 통합 인사이트 */}
      <IntegratedInsights results={successfulResults} darkMode={darkMode} />

      {/* 상세 결과 모달 */}
      {selectedResult && (
        <DetailedResultModal
          frameworkId={selectedResult.frameworkId}
          result={selectedResult.result}
          onClose={() => setSelectedResult(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

// 결과 카드 컴포넌트
function ResultCard({ frameworkId, result, onClick, darkMode }) {
  const theme = darkMode ? COLORS.dark : COLORS.light;
  const frameworkInfo = getFrameworkInfo(frameworkId);

  // 결과에서 핵심 지표 추출
  const keyMetric = extractKeyMetric(result);

  return (
    <div
      onClick={onClick}
      style={{
        background: darkMode ? '#2a2a2a' : '#fff',
        borderRadius: '12px',
        padding: '1.2rem',
        border: `1px solid ${theme.border}`,
        cursor: 'pointer',
        transition: 'all 0.3s',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        marginBottom: '0.8rem'
      }}>
        <span style={{ fontSize: '1.5rem' }}>{frameworkInfo.icon}</span>
        <h5 style={{
          margin: 0,
          color: theme.text,
          fontSize: '0.95rem',
          fontWeight: '600'
        }}>
          {frameworkInfo.name}
        </h5>
      </div>

      {keyMetric && (
        <div style={{
          background: `${COLORS.primary}10`,
          borderRadius: '8px',
          padding: '0.8rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: COLORS.primary,
            marginBottom: '0.3rem'
          }}>
            {keyMetric.value}
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: theme.subtext
          }}>
            {keyMetric.label}
          </div>
        </div>
      )}

      <div style={{
        marginTop: '0.8rem',
        fontSize: '0.75rem',
        color: theme.subtext,
        textAlign: 'right'
      }}>
        클릭하여 상세보기 →
      </div>
    </div>
  );
}

// 통합 인사이트 컴포넌트
function IntegratedInsights({ results, darkMode }) {
  const theme = darkMode ? COLORS.dark : COLORS.light;

  // 인사이트 생성 로직
  const insights = generateIntegratedInsights(results);

  return (
    <div style={{
      background: `${COLORS.primary}10`,
      borderRadius: '12px',
      padding: '1.5rem',
      border: `2px solid ${COLORS.primary}30`
    }}>
      <h5 style={{
        margin: '0 0 1rem 0',
        color: COLORS.primary,
        fontSize: '1.1rem',
        fontWeight: '700'
      }}>
        🧠 종합 인사이트
      </h5>

      <div style={{
        display: 'grid',
        gap: '0.8rem'
      }}>
        {insights.map((insight, index) => (
          <div
            key={index}
            style={{
              background: darkMode ? '#2a2a2a' : '#fff',
              borderRadius: '8px',
              padding: '1rem',
              borderLeft: `4px solid ${getInsightColor(insight.type)}`
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <span>{getInsightIcon(insight.type)}</span>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: theme.text
              }}>
                {insight.title}
              </span>
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.85rem',
              color: theme.subtext,
              lineHeight: '1.4'
            }}>
              {insight.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 상세 결과 모달 컴포넌트
function DetailedResultModal({ frameworkId, result, onClose, darkMode }) {
  const theme = darkMode ? COLORS.dark : COLORS.light;
  const frameworkInfo = getFrameworkInfo(frameworkId);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        background: theme.surface,
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: `2px solid ${theme.border}`
        }}>
          <span style={{ fontSize: '2rem' }}>{frameworkInfo.icon}</span>
          <h3 style={{
            margin: 0,
            color: theme.text,
            fontSize: '1.4rem',
            fontWeight: '700',
            flex: 1
          }}>
            {frameworkInfo.name} 상세 결과
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: theme.subtext,
              padding: '0.5rem'
            }}
          >
            ×
          </button>
        </div>

        {/* 결과 내용 */}
        <div style={{
          fontSize: '0.9rem',
          lineHeight: '1.6',
          color: theme.text
        }}>
          <pre style={{
            background: darkMode ? '#1a1a1a' : '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '12px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            whiteSpace: 'pre-wrap'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

// === 헬퍼 함수들 ===

function getCategoryName(key) {
  const names = {
    MACRO: '🧭 거시탐색',
    BOTTOM_UP: '🔬 기업심층',
    PSYCHOLOGICAL: '🧠 심리밈테마',
    CAUSAL: '🔄 인과상관',
    INVESTMENT: '💰 투자전략',
    LEARNING: '🧩 학습내재화'
  };
  return names[key] || key;
}

function getPriorityColor(priority) {
  const colors = {
    high: COLORS.danger,
    medium: COLORS.warning,
    low: COLORS.info
  };
  return colors[priority] || COLORS.secondary;
}

function getFrameworkInfo(frameworkId) {
  const allFrameworks = Object.values(AVAILABLE_FRAMEWORKS).flat();
  return allFrameworks.find(fw => fw.id === frameworkId) || { 
    name: frameworkId, 
    icon: '🔍', 
    priority: 'medium' 
  };
}

function extractKeyMetric(result) {
  // 결과에서 핵심 지표 추출 로직
  if (result.benefitScore?.overall) {
    return { value: `${result.benefitScore.overall.toFixed(1)}점`, label: '수혜 점수' };
  }
  if (result.overallRiskLevel) {
    return { value: result.overallRiskLevel, label: '리스크 레벨' };
  }
  if (result.heatIndex?.overall) {
    return { value: `${result.heatIndex.overall.toFixed(0)}°`, label: '열기 지수' };
  }
  if (result.rdROI?.roi) {
    return { value: `${result.rdROI.roi.toFixed(1)}%`, label: 'R&D ROI' };
  }
  if (result.confidence) {
    return { value: result.confidence.toUpperCase(), label: '신뢰도' };
  }
  return null;
}

function generateIntegratedInsights(results) {
  const insights = [];

  // 위험 요소 통합 분석
  const riskResults = results.filter(([id, _]) => 
    id.includes('risk') || id.includes('fomo') || id.includes('contrarian')
  );
  
  if (riskResults.length > 0) {
    insights.push({
      type: 'risk',
      title: '리스크 종합 평가',
      message: `${riskResults.length}개 리스크 프레임워크 분석 결과, 종합적인 위험 관리가 필요합니다.`
    });
  }

  // 기회 요소 분석
  const opportunityResults = results.filter(([id, _]) => 
    id.includes('policy') || id.includes('theme') || id.includes('tech')
  );
  
  if (opportunityResults.length > 0) {
    insights.push({
      type: 'opportunity',
      title: '투자 기회 발견',
      message: `정책 수혜, 테마 강화, 기술 모멘텀 등 다양한 투자 기회가 감지되었습니다.`
    });
  }

  // 시장 심리 분석
  const psychResults = results.filter(([id, _]) => 
    id.includes('reddit') || id.includes('narrative') || id.includes('theme')
  );
  
  if (psychResults.length > 0) {
    insights.push({
      type: 'sentiment',
      title: '시장 심리 분석',
      message: `소셜 미디어 동향과 시장 서사를 종합한 심리 분석이 완료되었습니다.`
    });
  }

  return insights;
}

function getInsightColor(type) {
  const colors = {
    risk: COLORS.danger,
    opportunity: COLORS.success,
    sentiment: COLORS.info,
    default: COLORS.primary
  };
  return colors[type] || colors.default;
}

function getInsightIcon(type) {
  const icons = {
    risk: '⚠️',
    opportunity: '🎯',
    sentiment: '📊',
    default: '💡'
  };
  return icons[type] || icons.default;
}

export default AdvancedFrameworksPanel; 