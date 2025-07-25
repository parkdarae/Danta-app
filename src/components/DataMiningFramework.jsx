import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { COLORS } from '../utils/constants';
import { DataMiningManager } from '../utils/dataMining/dataProcessor';
import { RelationshipAnalysisManager } from '../utils/dataMining/correlationAnalyzer';
import { ClusterAnalysisManager } from '../utils/dataMining/clusterAnalyzer';
import { usePerformanceOptimization, useAsyncOptimization, useMemoryMonitoring } from '../hooks/usePerformanceOptimization';
import { useAnalysisWorker } from '../hooks/useWebWorker';
import ProgressIndicator from './ProgressIndicator';
import AnalysisResultsVisualizer from './AnalysisResultsVisualizer';

// 분석 단계 정의
const ANALYSIS_PHASES = {
  DATA_COLLECTION: 'data_collection',
  PREPROCESSING: 'preprocessing',
  CORRELATION: 'correlation',
  CLUSTERING: 'clustering',
  INSIGHT_GENERATION: 'insight_generation'
};

// 프레임북 타입 정의
const FRAMEWORK_TYPES = {
  TECHNICAL: 'technical',
  FUNDAMENTAL: 'fundamental',
  SENTIMENT: 'sentiment',
  THEMATIC: 'thematic',
  COMPREHENSIVE: 'comprehensive'
};

function DataMiningFramework({ selectedStock, darkMode = false, onAnalysisComplete }) {
  // 성능 최적화 훅들
  const { useMemoizedCalculation, useDebounce } = usePerformanceOptimization();
  const { executeWithAbort, batchProcess } = useAsyncOptimization();
  const { trackMemoryUsage, getMemoryReport } = useMemoryMonitoring();
  
  // 웹 워커 훅
  const {
    isWorkerReady,
    workerError,
    hasActiveJobs,
    currentAnalysis,
    analysisHistory,
    analyzeStockCorrelations,
    performStockClustering,
    cancelAllJobs
  } = useAnalysisWorker();

  // 프레임워크 매니저 메모이제이션
  const frameworkManager = useMemo(() => ({
    dataManager: new DataMiningManager(),
    relationshipManager: new RelationshipAnalysisManager(),
    clusterManager: new ClusterAnalysisManager()
  }), []);

  const [analysisState, setAnalysisState] = useState({
    currentPhase: ANALYSIS_PHASES.DATA_COLLECTION,
    progress: 0,
    isRunning: false,
    results: null,
    errors: [],
    memoryUsage: null
  });

  const [frameworkConfig, setFrameworkConfig] = useState({
    type: FRAMEWORK_TYPES.COMPREHENSIVE,
    timeWindow: 30,
    includeNews: true,
    includeTechnicals: true,
    includeCorrelation: true,
    includeClustering: true,
    maxClusters: 8
  });

  const [analysisResults, setAnalysisResults] = useState({
    processedData: null,
    correlations: null,
    clusters: null,
    insights: [],
    networkData: null
  });

  const theme = useMemo(() => darkMode ? COLORS.dark : COLORS.light, [darkMode]);

  // 포괄적 분석 실행 (최적화 버전)
  const runComprehensiveAnalysis = useCallback(async () => {
    const startTime = performance.now();
    
    setAnalysisState(prev => ({ 
      ...prev, 
      isRunning: true, 
      progress: 0, 
      errors: [],
      memoryUsage: trackMemoryUsage()
    }));

    try {
      // 1단계: 데이터 수집 및 전처리
      setAnalysisState(prev => ({ 
        ...prev, 
        currentPhase: ANALYSIS_PHASES.DATA_COLLECTION, 
        progress: 20,
        memoryUsage: trackMemoryUsage()
      }));
      console.log('📊 1단계: 데이터 수집 중...');
      
      const processedData = await frameworkManager.dataManager.processStockData(selectedStock, {
        startDate: new Date(Date.now() - frameworkConfig.timeWindow * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        includeNews: frameworkConfig.includeNews,
        includeTechnicals: frameworkConfig.includeTechnicals
      });

      // 2단계: 전처리 완료
      setAnalysisState(prev => ({ 
        ...prev, 
        currentPhase: ANALYSIS_PHASES.PREPROCESSING, 
        progress: 40,
        memoryUsage: trackMemoryUsage()
      }));
      console.log('🔧 2단계: 데이터 전처리 완료');

      // 분석용 엔티티 생성
      const entities = await createAnalysisEntities(processedData);

      // 3단계: 상관관계 분석
      let correlationResults = null;
      if (frameworkConfig.includeCorrelation) {
        setAnalysisState(prev => ({ 
          ...prev, 
          currentPhase: ANALYSIS_PHASES.CORRELATION, 
          progress: 60,
          memoryUsage: trackMemoryUsage()
        }));
        console.log('🔗 3단계: 상관관계 분석 중...');
        
        correlationResults = await frameworkManager.relationshipManager.analyzeRelationships(entities, {
          includeCorrelation: true,
          includeCausality: true,
          includeNetwork: true
        });
      }

      // 4단계: 클러스터링 분석
      let clusterResults = null;
      if (frameworkConfig.includeClustering) {
        setAnalysisState(prev => ({ 
          ...prev, 
          currentPhase: ANALYSIS_PHASES.CLUSTERING, 
          progress: 80,
          memoryUsage: trackMemoryUsage()
        }));
        console.log('🔍 4단계: 클러스터링 분석 중...');
        
        const numericalData = extractNumericalFeatures(processedData);
        const textualData = extractTextualData(processedData);
        
        clusterResults = await frameworkManager.clusterManager.performComprehensiveAnalysis(numericalData, {
          includeKMeans: true,
          includeHierarchical: true,
          includeTopicModeling: true,
          includeThemeExtraction: true,
          textData: textualData,
          maxClusters: frameworkConfig.maxClusters
        });
      }

      // 5단계: 통합 인사이트 생성
      setAnalysisState(prev => ({ 
        ...prev, 
        currentPhase: ANALYSIS_PHASES.INSIGHT_GENERATION, 
        progress: 100,
        memoryUsage: trackMemoryUsage()
      }));
      console.log('💡 5단계: 인사이트 생성 중...');

      const integratedInsights = generateIntegratedInsights(processedData, correlationResults, clusterResults);

      // 결과 저장 및 콜백 호출
      const finalResults = {
        processedData,
        correlations: correlationResults,
        clusters: clusterResults,
        insights: integratedInsights,
        networkData: correlationResults?.networkMetrics?.visualizationData || null,
        performance: {
          duration: performance.now() - startTime,
          memoryReport: getMemoryReport()
        }
      };

      setAnalysisResults(finalResults);

      // 상위 컴포넌트에 결과 전달
      if (onAnalysisComplete) {
        onAnalysisComplete(finalResults);
      }

      setAnalysisState(prev => ({ 
        ...prev, 
        isRunning: false, 
        currentPhase: ANALYSIS_PHASES.INSIGHT_GENERATION,
        results: '분석 완료',
        memoryUsage: trackMemoryUsage()
      }));

      console.log(`✅ 데이터 마이닝 프레임북 분석 완료! (${(performance.now() - startTime).toFixed(2)}ms)`);

    } catch (error) {
      console.error('❌ 분석 실패:', error);
      setAnalysisState(prev => ({ 
        ...prev, 
        isRunning: false, 
        errors: [...prev.errors, error.message],
        memoryUsage: trackMemoryUsage()
      }));
    }
  }, [selectedStock, frameworkConfig, frameworkManager, onAnalysisComplete, trackMemoryUsage, getMemoryReport]);

  // 웹 워커 기반 고성능 분석 실행
  const runHighPerformanceAnalysis = useCallback(async () => {
    if (!isWorkerReady) {
      alert('웹 워커가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setAnalysisState(prev => ({ 
      ...prev, 
      isRunning: true, 
      progress: 0, 
      errors: [],
      memoryUsage: trackMemoryUsage()
    }));

    try {
      console.log('🚀 고성능 웹 워커 분석 시작...');

      // 1. 샘플 데이터 생성 (실제로는 API에서 가져옴)
      const sampleData = generateSampleStockData(selectedStock);
      
      // 2. 상관관계 분석 (웹 워커에서 실행)
      setAnalysisState(prev => ({ 
        ...prev, 
        currentPhase: ANALYSIS_PHASES.CORRELATION, 
        progress: 30,
        memoryUsage: trackMemoryUsage()
      }));

      const correlationResult = await analyzeStockCorrelations(sampleData, {
        method: 'pearson',
        minPeriods: 20
      });

      // 3. 클러스터링 분석 (웹 워커에서 실행)
      setAnalysisState(prev => ({ 
        ...prev, 
        currentPhase: ANALYSIS_PHASES.CLUSTERING, 
        progress: 70,
        memoryUsage: trackMemoryUsage()
      }));

      const clusteringResult = await performStockClustering(
        Object.values(sampleData).map(stock => [stock.volatility, stock.momentum, stock.volume]),
        frameworkConfig.maxClusters
      );

      // 4. 결과 통합
      const finalResults = {
        processedData: sampleData,
        correlations: correlationResult,
        clusters: clusteringResult,
        insights: generateWebWorkerInsights(correlationResult, clusteringResult),
        performance: {
          duration: currentAnalysis?.duration || 0,
          memoryReport: getMemoryReport(),
          workerBased: true
        }
      };

      setAnalysisResults(finalResults);

      if (onAnalysisComplete) {
        onAnalysisComplete(finalResults);
      }

      setAnalysisState(prev => ({ 
        ...prev, 
        isRunning: false, 
        currentPhase: ANALYSIS_PHASES.INSIGHT_GENERATION,
        progress: 100,
        results: '웹 워커 분석 완료',
        memoryUsage: trackMemoryUsage()
      }));

      console.log('✅ 웹 워커 기반 분석 완료!');

    } catch (error) {
      console.error('❌ 웹 워커 분석 실패:', error);
      setAnalysisState(prev => ({ 
        ...prev, 
        isRunning: false, 
        errors: [...prev.errors, error.message],
        memoryUsage: trackMemoryUsage()
      }));
    }
  }, [
    isWorkerReady, 
    selectedStock, 
    frameworkConfig, 
    analyzeStockCorrelations, 
    performStockClustering,
    currentAnalysis,
    onAnalysisComplete, 
    trackMemoryUsage, 
    getMemoryReport
  ]);

  // 샘플 데이터 생성 함수
  const generateSampleStockData = useCallback((stock) => {
    const symbols = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN'];
    const data = {};
    
    symbols.forEach(symbol => {
      data[symbol] = {
        symbol,
        price: 100 + Math.random() * 900,
        volatility: Math.random() * 0.5,
        momentum: (Math.random() - 0.5) * 0.2,
        volume: Math.random() * 1000000,
        correlation_score: Math.random()
      };
    });
    
    return data;
  }, []);

  // 웹 워커 인사이트 생성
  const generateWebWorkerInsights = useCallback((correlationResult, clusteringResult) => {
    const insights = [];
    
    if (correlationResult?.metadata) {
      insights.push({
        category: '상관관계 분석',
        description: `${correlationResult.metadata.symbols.length}개 종목 간 상관관계를 분석했습니다. 캐시 적중률: ${correlationResult.metadata.cacheHits}`,
        confidence: 85,
        impact: '포트폴리오 다양화에 도움'
      });
    }
    
    if (clusteringResult?.centroids) {
      insights.push({
        category: '클러스터링 분석',
        description: `${clusteringResult.centroids.length}개 클러스터로 종목을 그룹화했습니다. 실루엣 점수: ${clusteringResult.silhouetteScore.toFixed(3)}`,
        confidence: 78,
        impact: '유사한 특성의 종목 그룹 식별'
      });
    }
    
    insights.push({
      category: '성능 최적화',
      description: '웹 워커를 활용하여 UI 블로킹 없이 고성능 분석을 수행했습니다.',
      confidence: 95,
      impact: '사용자 경험 향상'
    });
    
    return insights;
  }, []);

  // 분석용 엔티티 생성
  const createAnalysisEntities = async (processedData) => {
    const entities = [];

    // 주가 엔티티
    if (processedData.price) {
      entities.push({
        id: `${selectedStock}_price`,
        type: 'stock_price',
        timeSeries: processedData.price.raw.map(d => ({ date: d.date, value: d.close })),
        attributes: { symbol: selectedStock, dataType: 'price' }
      });

      entities.push({
        id: `${selectedStock}_volume`,
        type: 'trading_volume',
        timeSeries: processedData.price.raw.map(d => ({ date: d.date, value: d.volume })),
        attributes: { symbol: selectedStock, dataType: 'volume' }
      });
    }

    // 기술 지표 엔티티
    if (processedData.technicalIndicators) {
      const { rsi, macd } = processedData.technicalIndicators;
      
      if (rsi && rsi.length > 0) {
        entities.push({
          id: `${selectedStock}_rsi`,
          type: 'technical_indicator',
          timeSeries: rsi.map((item, index) => ({ 
            date: processedData.price.raw[item.index]?.date || `day_${index}`, 
            value: item.rsi 
          })),
          attributes: { symbol: selectedStock, indicator: 'RSI' }
        });
      }

      if (macd && macd.length > 0) {
        entities.push({
          id: `${selectedStock}_macd`,
          type: 'technical_indicator',
          timeSeries: macd.map((item, index) => ({ 
            date: processedData.price.raw[item.index]?.date || `day_${index}`, 
            value: item.macd 
          })),
          attributes: { symbol: selectedStock, indicator: 'MACD' }
        });
      }
    }

    // 감성 엔티티
    if (processedData.sentiment) {
      const sentimentTimeline = Object.entries(processedData.sentiment.timeline).map(([date, data]) => ({
        date,
        value: data.average
      }));

      entities.push({
        id: `${selectedStock}_sentiment`,
        type: 'sentiment',
        timeSeries: sentimentTimeline,
        attributes: { symbol: selectedStock, dataType: 'sentiment' }
      });
    }

    return entities;
  };

  // 수치 특성 추출
  const extractNumericalFeatures = (processedData) => {
    const features = [];

    if (processedData.price?.features) {
      processedData.price.features.forEach(feature => {
        features.push([
          feature.current_value,
          feature.moving_average,
          feature.volatility,
          feature.momentum,
          feature.relative_position
        ]);
      });
    }

    return features;
  };

  // 텍스트 데이터 추출
  const extractTextualData = (processedData) => {
    const textData = [];

    // 키워드에서 텍스트 생성 (실제로는 뉴스 원문을 사용)
    if (processedData.keywords) {
      processedData.keywords.forEach(item => {
        textData.push(`${selectedStock} ${item.keyword} 관련 뉴스`);
      });
    }

    return textData;
  };

  // 통합 인사이트 생성
  const generateIntegratedInsights = (processedData, correlationResults, clusterResults) => {
    const insights = [];

    // 기본 데이터 인사이트
    if (processedData) {
      insights.push({
        type: 'data_summary',
        title: '데이터 수집 현황',
        message: `${selectedStock}의 ${frameworkConfig.timeWindow}일간 데이터를 분석했습니다.`,
        importance: 'medium',
        icon: '📊',
        details: {
          pricePoints: processedData.price?.raw?.length || 0,
          sentimentScore: processedData.sentiment?.overall?.toFixed(2) || 'N/A',
          keywordCount: processedData.keywords?.length || 0
        }
      });
    }

    // 상관관계 인사이트
    if (correlationResults?.insights) {
      correlationResults.insights.forEach(insight => {
        insights.push({
          ...insight,
          category: 'correlation',
          icon: insight.type === 'high_correlation' ? '🔗' : '📈'
        });
      });
    }

    // 클러스터링 인사이트
    if (clusterResults?.insights) {
      clusterResults.insights.forEach(insight => {
        insights.push({
          ...insight,
          category: 'clustering',
          icon: insight.type === 'optimal_clusters' ? '🎯' : '📊'
        });
      });
    }

    // 종합 인사이트
    if (processedData && correlationResults && clusterResults) {
      insights.push({
        type: 'comprehensive_analysis',
        title: '종합 분석 결과',
        message: `${selectedStock}에 대한 다각도 분석이 완료되었습니다. 총 ${insights.length - 1}개의 인사이트가 발견되었습니다.`,
        importance: 'high',
        icon: '🚀',
        category: 'summary'
      });
    }

    return insights.sort((a, b) => {
      const importanceOrder = { high: 3, medium: 2, low: 1 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    });
  };

  // 프레임북 타입 변경 핸들러
  const handleFrameworkTypeChange = (type) => {
    setFrameworkConfig(prev => ({
      ...prev,
      type,
      includeNews: type !== FRAMEWORK_TYPES.TECHNICAL,
      includeTechnicals: type === FRAMEWORK_TYPES.TECHNICAL || type === FRAMEWORK_TYPES.COMPREHENSIVE,
      includeCorrelation: type === FRAMEWORK_TYPES.COMPREHENSIVE,
      includeClustering: type === FRAMEWORK_TYPES.THEMATIC || type === FRAMEWORK_TYPES.COMPREHENSIVE
    }));
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
          🔬 데이터 마이닝 프레임북
        </h3>
        <p style={{
          margin: 0,
          color: theme.subtext,
          fontSize: '1rem',
          fontStyle: 'italic'
        }}>
          {selectedStock} 종목의 데이터를 다각도로 분석하여 투자 인사이트를 발굴합니다
        </p>
      </div>

      {/* 프레임북 설정 */}
      <div style={{
        background: darkMode ? '#1a1a1a' : '#f8f9fa',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: `2px solid ${theme.border}`
      }}>
        <h4 style={{
          margin: '0 0 1rem 0',
          color: COLORS.primary,
          fontSize: '1.2rem',
          fontWeight: '700'
        }}>
          ⚙️ 분석 프레임 설정
        </h4>

        {/* 프레임북 타입 선택 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: theme.text,
            marginBottom: '0.5rem'
          }}>
            분석 프레임 타입
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.5rem'
          }}>
            {Object.entries(FRAMEWORK_TYPES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleFrameworkTypeChange(value)}
                style={{
                  background: frameworkConfig.type === value ? COLORS.primary : 'transparent',
                  color: frameworkConfig.type === value ? '#fff' : theme.text,
                  border: `2px solid ${frameworkConfig.type === value ? COLORS.primary : theme.border}`,
                  borderRadius: '8px',
                  padding: '0.5rem 0.8rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
              >
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* 상세 설정 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '0.3rem'
            }}>
              분석 기간 (일)
            </label>
            <input
              type="number"
              value={frameworkConfig.timeWindow}
              onChange={(e) => setFrameworkConfig(prev => ({ ...prev, timeWindow: parseInt(e.target.value) }))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                background: theme.bg,
                color: theme.text,
                fontSize: '0.9rem'
              }}
              min="7"
              max="90"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '0.3rem'
            }}>
              최대 클러스터 수
            </label>
            <input
              type="number"
              value={frameworkConfig.maxClusters}
              onChange={(e) => setFrameworkConfig(prev => ({ ...prev, maxClusters: parseInt(e.target.value) }))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                background: theme.bg,
                color: theme.text,
                fontSize: '0.9rem'
              }}
              min="2"
              max="15"
            />
          </div>
        </div>
      </div>

      {/* 분석 실행 버튼 그룹 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* 기본 분석 버튼 */}
        <button
          onClick={runComprehensiveAnalysis}
          disabled={analysisState.isRunning}
          style={{
            background: analysisState.isRunning 
              ? `linear-gradient(45deg, #95a5a6, #bdc3c7)` 
              : `linear-gradient(45deg, ${COLORS.primary}, #ff6b6b)`,
            color: '#fff',
            border: 'none',
            borderRadius: '16px',
            padding: '1.5rem',
            cursor: analysisState.isRunning ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s',
            boxShadow: '0 4px 16px rgba(136, 132, 216, 0.3)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <div style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>기본 분석</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>메인 스레드 기반 • 안정성 중시</div>
        </button>

        {/* 고성능 분석 버튼 */}
        <button
          onClick={runHighPerformanceAnalysis}
          disabled={analysisState.isRunning || !isWorkerReady}
          style={{
            background: analysisState.isRunning || !isWorkerReady
              ? `linear-gradient(45deg, #95a5a6, #bdc3c7)` 
              : `linear-gradient(45deg, #4ecdc4, #44a08d)`,
            color: '#fff',
            border: 'none',
            borderRadius: '16px',
            padding: '1.5rem',
            cursor: (analysisState.isRunning || !isWorkerReady) ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s',
            boxShadow: '0 4px 16px rgba(78, 205, 196, 0.3)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
          <div style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>고성능 분석</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
            {isWorkerReady ? '웹 워커 기반 • 병렬 처리' : '워커 로딩 중...'}
      </div>
        </button>

        {/* 작업 취소 버튼 */}
        {(analysisState.isRunning || hasActiveJobs) && (
          <button
            onClick={() => {
              cancelAllJobs();
              setAnalysisState(prev => ({ 
                ...prev, 
                isRunning: false, 
                progress: 0,
                errors: [...prev.errors, '사용자에 의해 취소됨']
              }));
            }}
            style={{
              background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              padding: '1.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: '0 4px 16px rgba(231, 76, 60, 0.3)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛑</div>
            <div style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>분석 취소</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>모든 작업 중단</div>
          </button>
        )}
      </div>

      {/* 웹 워커 상태 정보 */}
      {!workerError && (
        <div style={{
          background: isWorkerReady ? '#4CAF5020' : '#FF980020',
          border: `1px solid ${isWorkerReady ? '#4CAF50' : '#FF9800'}`,
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem',
          fontSize: '0.9rem',
          color: theme.text
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>
              {isWorkerReady ? '✅' : '⏳'}
            </span>
            <span style={{ fontWeight: '600' }}>
              웹 워커 상태: {isWorkerReady ? '준비 완료' : '로딩 중'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            {isWorkerReady 
              ? '고성능 병렬 분석이 가능합니다. UI 블로킹 없이 무거운 계산을 수행합니다.'
              : '웹 워커를 초기화하고 있습니다. 잠시만 기다려주세요.'
            }
          </div>
          {hasActiveJobs && (
          <div style={{
              marginTop: '0.5rem', 
              fontSize: '0.8rem',
              color: '#4ecdc4',
              fontWeight: '600'
            }}>
              🔄 현재 {hasActiveJobs ? 1 : 0}개의 백그라운드 작업이 실행 중입니다.
          </div>
          )}
        </div>
      )}

      {/* 진행 상황 - 새로운 ProgressIndicator 사용 */}
      {(analysisState.isRunning || currentAnalysis) && (
        <ProgressIndicator
          progress={currentAnalysis?.progress || analysisState.progress}
          phase={currentAnalysis?.phase || analysisState.currentPhase}
          isActive={analysisState.isRunning || hasActiveJobs}
          darkMode={darkMode}
          memoryUsage={analysisState.memoryUsage}
          estimatedTime={currentAnalysis?.estimatedTime}
        />
      )}

      {/* 오류 표시 */}
      {analysisState.errors.length > 0 && (
        <div style={{
          background: `${COLORS.danger}10`,
          border: `2px solid ${COLORS.danger}`,
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <h4 style={{
            margin: '0 0 0.5rem 0',
            color: COLORS.danger,
            fontSize: '1rem',
            fontWeight: '700'
          }}>
            ⚠️ 분석 중 오류 발생
          </h4>
          {analysisState.errors.map((error, index) => (
            <div key={index} style={{
              fontSize: '0.9rem',
              color: COLORS.danger,
              marginBottom: '0.3rem'
            }}>
              • {error}
            </div>
          ))}
        </div>
      )}

      {/* 분석 결과 시각화 - 새로운 AnalysisResultsVisualizer 사용 */}
      <AnalysisResultsVisualizer 
        results={analysisResults.processedData ? analysisResults : null} 
        darkMode={darkMode} 
      />

      {/* 분석 히스토리 */}
      {analysisHistory.length > 0 && (
        <div style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '2rem',
          marginTop: '2rem',
          border: `1px solid ${theme.border}`,
          boxShadow: darkMode ? '0 4px 12px #0006' : '0 4px 12px #0001'
        }}>
          <h3 style={{
            margin: '0 0 1.5rem 0',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: theme.text,
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem'
          }}>
            📜 분석 히스토리
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {analysisHistory.map((analysis, index) => (
              <div key={analysis.id} style={{
                background: darkMode ? '#1a1a1a' : '#f8f9fa',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                border: `1px solid ${theme.border}`
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    fontWeight: '600',
                    color: theme.text,
                    fontSize: '1rem'
                  }}>
                    {analysis.type === 'correlation' ? '🔗 상관관계 분석' : 
                     analysis.type === 'clustering' ? '🔍 클러스터링 분석' : 
                     '🚀 최적화 분석'}
                  </span>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    background: analysis.success ? '#4CAF50' : '#f44336',
                    color: '#fff'
                  }}>
                    {analysis.success ? '성공' : '실패'}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: darkMode ? '#aaa' : '#666',
                  marginBottom: '0.5rem'
                }}>
                  소요시간: {(analysis.duration / 1000).toFixed(2)}초 • 
                  {new Date(analysis.startTime).toLocaleString('ko-KR')}
                </div>
                {analysis.error && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#f44336',
                    background: '#f4433620',
                    padding: '0.5rem',
                    borderRadius: '6px'
                  }}>
                    오류: {analysis.error.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
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

// 단계 설명 함수
function getPhaseDescription(phase) {
  const descriptions = {
    [ANALYSIS_PHASES.DATA_COLLECTION]: '📊 데이터 수집 중...',
    [ANALYSIS_PHASES.PREPROCESSING]: '🔧 데이터 전처리 중...',
    [ANALYSIS_PHASES.CORRELATION]: '🔗 상관관계 분석 중...',
    [ANALYSIS_PHASES.CLUSTERING]: '🔍 클러스터링 분석 중...',
    [ANALYSIS_PHASES.INSIGHT_GENERATION]: '💡 인사이트 생성 중...'
  };
  return descriptions[phase] || '분석 중...';
}

// 인사이트 패널 컴포넌트
function InsightPanel({ insights, darkMode }) {
  const theme = darkMode ? COLORS.dark : COLORS.light;

  return (
    <div style={{
      background: darkMode ? '#1a1a1a' : '#f8f9fa',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem',
      border: `2px solid ${theme.border}`
    }}>
      <h4 style={{
        margin: '0 0 1.5rem 0',
        color: COLORS.primary,
        fontSize: '1.3rem',
        fontWeight: '700'
      }}>
        💡 발견된 인사이트
      </h4>

      <div style={{
        display: 'grid',
        gap: '1rem'
      }}>
        {insights.map((insight, index) => (
          <div
            key={index}
            style={{
              background: darkMode ? '#2a2a2a' : '#fff',
              borderRadius: '12px',
              padding: '1.2rem',
              border: `2px solid ${getImportanceColor(insight.importance)}40`,
              borderLeft: `5px solid ${getImportanceColor(insight.importance)}`
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              <div style={{
                fontSize: '1.5rem',
                flexShrink: 0
              }}>
                {insight.icon || '💡'}
              </div>
              
              <div style={{ flex: 1 }}>
                {insight.title && (
                  <h5 style={{
                    margin: '0 0 0.5rem 0',
                    color: theme.text,
                    fontSize: '1rem',
                    fontWeight: '700'
                  }}>
                    {insight.title}
                  </h5>
                )}
                
                <p style={{
                  margin: '0 0 0.8rem 0',
                  color: theme.text,
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  {insight.message}
                </p>

                {insight.details && (
                  <div style={{
                    background: `${getImportanceColor(insight.importance)}10`,
                    borderRadius: '8px',
                    padding: '0.8rem',
                    fontSize: '0.8rem',
                    color: theme.subtext
                  }}>
                    {typeof insight.details === 'object' ? 
                      Object.entries(insight.details).map(([key, value]) => (
                        <div key={key}>{key}: {value}</div>
                      )) : 
                      insight.details
                    }
                  </div>
                )}
              </div>

              <div style={{
                background: getImportanceColor(insight.importance),
                color: '#fff',
                borderRadius: '12px',
                padding: '0.3rem 0.6rem',
                fontSize: '0.7rem',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                {insight.importance}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 네트워크 시각화 컴포넌트
function NetworkVisualization({ networkData, darkMode }) {
  const theme = darkMode ? COLORS.dark : COLORS.light;

  return (
    <div style={{
      background: darkMode ? '#1a1a1a' : '#f8f9fa',
      borderRadius: '16px',
      padding: '1.5rem',
      border: `2px solid ${theme.border}`
    }}>
      <h4 style={{
        margin: '0 0 1rem 0',
        color: COLORS.primary,
        fontSize: '1.2rem',
        fontWeight: '700'
      }}>
        🕸️ 상관관계 네트워크
      </h4>

      <div style={{
        background: darkMode ? '#2a2a2a' : '#fff',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${theme.border}`
      }}>
        <div>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕸️</div>
          <p style={{
            color: theme.subtext,
            fontSize: '1rem',
            margin: 0
          }}>
            네트워크 시각화가 여기에 표시됩니다
          </p>
          <p style={{
            color: theme.subtext,
            fontSize: '0.85rem',
            margin: '0.5rem 0 0 0'
          }}>
            노드: {networkData.nodes?.length || 0} | 엣지: {networkData.edges?.length || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

// 중요도 색상 함수
function getImportanceColor(importance) {
  const colors = {
    high: COLORS.danger,
    medium: COLORS.warning,
    low: COLORS.info
  };
  return colors[importance] || COLORS.secondary;
}

export default DataMiningFramework; 