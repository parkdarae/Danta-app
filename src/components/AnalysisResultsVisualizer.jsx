import React, { useState, useMemo } from 'react';

const AnalysisResultsVisualizer = ({ results, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState('summary');
  
  const theme = {
    background: darkMode ? '#23272b' : '#fff',
    text: darkMode ? '#e0e0e0' : '#222',
    accent: '#8884d8',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#f44336',
    border: darkMode ? '#333' : '#eee',
    card: darkMode ? '#2a2e33' : '#f8f9fa'
  };

  // 결과 요약 생성
  const summary = useMemo(() => {
    if (!results) return null;
    
    return {
      dataQuality: calculateDataQuality(results),
      correlationStrength: calculateCorrelationStrength(results),
      clusteringEffectiveness: calculateClusteringEffectiveness(results),
      insightCount: results.insights?.length || 0,
      processingTime: results.performance?.duration || 0
    };
  }, [results]);

  const calculateDataQuality = (results) => {
    if (!results?.processedData) return 0;
    // 데이터 품질 점수 계산 로직
    const hasPrice = results.processedData.price ? 25 : 0;
    const hasTechnicals = results.processedData.technicalIndicators ? 25 : 0;
    const hasSentiment = results.processedData.sentiment ? 25 : 0;
    const hasKeywords = results.processedData.keywords?.length > 0 ? 25 : 0;
    return hasPrice + hasTechnicals + hasSentiment + hasKeywords;
  };

  const calculateCorrelationStrength = (results) => {
    if (!results?.correlations) return 0;
    // 상관관계 강도 계산
    return Math.random() * 100; // 임시값
  };

  const calculateClusteringEffectiveness = (results) => {
    if (!results?.clusters) return 0;
    // 클러스터링 효과성 계산
    return Math.random() * 100; // 임시값
  };

  const getScoreColor = (score) => {
    if (score >= 80) return theme.success;
    if (score >= 60) return theme.accent;
    if (score >= 40) return theme.warning;
    return theme.error;
  };

  const ScoreCard = ({ title, score, icon, description }) => (
    <div style={{
      background: theme.card,
      borderRadius: '12px',
      padding: '1.5rem',
      border: `1px solid ${theme.border}`,
      textAlign: 'center',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = darkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = 'none';
    }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: getScoreColor(score),
        marginBottom: '0.5rem'
      }}>
        {score.toFixed(1)}
      </div>
      <div style={{
        fontSize: '1rem',
        fontWeight: '600',
        color: theme.text,
        marginBottom: '0.5rem'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '0.8rem',
        color: darkMode ? '#aaa' : '#666',
        lineHeight: 1.4
      }}>
        {description}
      </div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      style={{
        background: isActive ? theme.accent : 'transparent',
        color: isActive ? '#fff' : theme.text,
        border: `2px solid ${isActive ? theme.accent : theme.border}`,
        borderRadius: '8px',
        padding: '0.75rem 1.5rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontSize: '0.9rem'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.target.style.background = darkMode ? '#333' : '#f5f5f5';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.target.style.background = 'transparent';
        }
      }}
    >
      {label}
    </button>
  );

  const InsightCard = ({ insight, index }) => (
    <div style={{
      background: theme.card,
      borderRadius: '12px',
      padding: '1.25rem',
      border: `1px solid ${theme.border}`,
      marginBottom: '1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          background: theme.accent,
          color: '#fff',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          marginRight: '0.75rem'
        }}>
          {index + 1}
        </div>
        <div style={{
          fontWeight: '600',
          color: theme.text,
          fontSize: '1rem'
        }}>
          {insight.category || '분석 인사이트'}
        </div>
        <div style={{
          marginLeft: 'auto',
          padding: '0.25rem 0.75rem',
          background: getScoreColor(insight.confidence || 75),
          color: '#fff',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>
          신뢰도 {(insight.confidence || 75).toFixed(0)}%
        </div>
      </div>
      <div style={{
        color: darkMode ? '#ccc' : '#555',
        lineHeight: 1.6,
        fontSize: '0.95rem'
      }}>
        {insight.description || insight.text || '분석 결과를 기반으로 도출된 인사이트입니다.'}
      </div>
      {insight.impact && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.5rem 0.75rem',
          background: darkMode ? '#1a1a1a' : '#f0f8ff',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: darkMode ? '#aaa' : '#666'
        }}>
          💡 예상 영향: {insight.impact}
        </div>
      )}
    </div>
  );

  if (!results) {
    return (
      <div style={{
        background: theme.background,
        borderRadius: '16px',
        padding: '2rem',
        textAlign: 'center',
        border: `1px solid ${theme.border}`
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
        <div style={{ 
          fontSize: '1.2rem', 
          color: theme.text, 
          marginBottom: '0.5rem',
          fontWeight: '600'
        }}>
          분석 결과를 기다리는 중...
        </div>
        <div style={{ color: darkMode ? '#aaa' : '#666' }}>
          데이터 마이닝을 실행하면 결과가 여기에 표시됩니다.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.background,
      borderRadius: '16px',
      padding: '2rem',
      border: `1px solid ${theme.border}`,
      boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>📈</div>
        <div>
          <div style={{
            fontSize: '1.4rem',
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: '0.25rem'
          }}>
            분석 결과 대시보드
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: darkMode ? '#aaa' : '#666'
          }}>
            {new Date().toLocaleString('ko-KR')} 완료 • 
            처리시간: {(summary?.processingTime / 1000).toFixed(2)}초
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <TabButton 
          id="summary" 
          label="📊 요약" 
          isActive={activeTab === 'summary'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="insights" 
          label="💡 인사이트" 
          isActive={activeTab === 'insights'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="correlations" 
          label="🔗 상관관계" 
          isActive={activeTab === 'correlations'} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="clusters" 
          label="🔍 클러스터" 
          isActive={activeTab === 'clusters'} 
          onClick={setActiveTab} 
        />
      </div>

      {/* 탭 내용 */}
      {activeTab === 'summary' && summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <ScoreCard
            title="데이터 품질"
            score={summary.dataQuality}
            icon="📊"
            description="수집된 데이터의 완성도와 신뢰성"
          />
          <ScoreCard
            title="상관관계 강도"
            score={summary.correlationStrength}
            icon="🔗"
            description="발견된 상관관계의 통계적 유의성"
          />
          <ScoreCard
            title="클러스터링 효과"
            score={summary.clusteringEffectiveness}
            icon="🔍"
            description="데이터 그룹화의 명확성과 유용성"
          />
          <ScoreCard
            title="인사이트 개수"
            score={summary.insightCount}
            icon="💡"
            description="생성된 유의미한 분석 인사이트"
          />
        </div>
      )}

      {activeTab === 'insights' && (
        <div>
          {results.insights && results.insights.length > 0 ? (
            results.insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} index={index} />
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: darkMode ? '#aaa' : '#666'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💡</div>
              <div>생성된 인사이트가 없습니다.</div>
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                데이터 마이닝을 통해 더 많은 인사이트를 발견해보세요.
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'correlations' && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: darkMode ? '#aaa' : '#666'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔗</div>
          <div>상관관계 시각화</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            향후 업데이트에서 제공될 예정입니다.
          </div>
        </div>
      )}

      {activeTab === 'clusters' && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: darkMode ? '#aaa' : '#666'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
          <div>클러스터 시각화</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            향후 업데이트에서 제공될 예정입니다.
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResultsVisualizer; 