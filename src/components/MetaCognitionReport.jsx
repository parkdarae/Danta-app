import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const MetaCognitionReport = ({ darkMode = false }) => {
  const [tradingRecords] = useLocalStorage('trading_records', []);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all'); // all, 30days, 7days
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  const theme = {
    bg: darkMode ? '#1a1a1a' : '#ffffff',
    cardBg: darkMode ? '#2d2d2d' : '#f8f9fa',
    text: darkMode ? '#ffffff' : '#333333',
    subtext: darkMode ? '#cccccc' : '#666666',
    border: darkMode ? '#404040' : '#e0e0e0',
    accent: '#007bff',
    positive: '#00c851',
    negative: '#ff4444',
    warning: '#ffbb33',
    purple: '#9c27b0',
    teal: '#20c997'
  };

  // 필터링된 기록들
  const filteredRecords = useMemo(() => {
    const now = new Date();
    let cutoffDate;

    switch (selectedTimeframe) {
      case '7days':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return tradingRecords;
    }

    return tradingRecords.filter(record => 
      new Date(record.timestamp) >= cutoffDate
    );
  }, [tradingRecords, selectedTimeframe]);

  // 감정별 통계 분석
  const emotionAnalysis = useMemo(() => {
    const emotionStats = {};
    
    filteredRecords.forEach(record => {
      if (!emotionStats[record.emotion]) {
        emotionStats[record.emotion] = {
          count: 0,
          buyCount: 0,
          sellCount: 0,
          totalConfidence: 0,
          externalInfluenceCount: 0,
          records: []
        };
      }
      
      emotionStats[record.emotion].count++;
      emotionStats[record.emotion].totalConfidence += record.confidenceLevel;
      emotionStats[record.emotion].records.push(record);
      
      if (record.action === 'buy') {
        emotionStats[record.emotion].buyCount++;
      } else {
        emotionStats[record.emotion].sellCount++;
      }
      
      if (record.externalInfluence) {
        emotionStats[record.emotion].externalInfluenceCount++;
      }
    });

    // 평균 확신도 계산
    Object.keys(emotionStats).forEach(emotion => {
      emotionStats[emotion].avgConfidence = Math.round(
        emotionStats[emotion].totalConfidence / emotionStats[emotion].count
      );
    });

    return emotionStats;
  }, [filteredRecords]);

  // 감정 출처 통계
  const emotionSourceStats = useMemo(() => {
    const sourceStats = {};
    
    filteredRecords.forEach(record => {
      if (!sourceStats[record.emotionSource]) {
        sourceStats[record.emotionSource] = {
          count: 0,
          avgConfidence: 0,
          totalConfidence: 0,
          actions: { buy: 0, sell: 0 }
        };
      }
      
      sourceStats[record.emotionSource].count++;
      sourceStats[record.emotionSource].totalConfidence += record.confidenceLevel;
      sourceStats[record.emotionSource].actions[record.action]++;
    });

    // 평균 확신도 계산
    Object.keys(sourceStats).forEach(source => {
      sourceStats[source].avgConfidence = Math.round(
        sourceStats[source].totalConfidence / sourceStats[source].count
      );
    });

    return sourceStats;
  }, [filteredRecords]);

  // 확신도 vs 결과 분석 (모의)
  const confidenceAnalysis = useMemo(() => {
    const groups = {
      low: { range: '0-40%', records: [], successRate: 0 },
      medium: { range: '41-70%', records: [], successRate: 0 },
      high: { range: '71-100%', records: [], successRate: 0 }
    };

    filteredRecords.forEach(record => {
      if (record.confidenceLevel <= 40) {
        groups.low.records.push(record);
      } else if (record.confidenceLevel <= 70) {
        groups.medium.records.push(record);
      } else {
        groups.high.records.push(record);
      }
    });

    // 가상의 성공률 계산 (실제로는 실제 수익률 데이터가 필요)
    // 여기서는 시뮬레이션 데이터 사용
    Object.keys(groups).forEach(group => {
      const records = groups[group].records;
      if (records.length > 0) {
        // 감정과 확신도를 기반으로 한 가상 성공률
        let virtualSuccessRate = 50; // 기본 50%
        
        records.forEach(record => {
          // 감정별 가중치
          const emotionWeights = {
            confident: 15,
            neutral: 0,
            hopeful: 10,
            anxious: -10,
            fearful: -20,
            greedy: -15,
            excited: -5,
            regretful: -25
          };
          
          virtualSuccessRate += (emotionWeights[record.emotion] || 0) / records.length;
          
          // 외부 영향이 있으면 성공률 약간 감소
          if (record.externalInfluence) {
            virtualSuccessRate -= 5 / records.length;
          }
        });
        
        groups[group].successRate = Math.max(0, Math.min(100, Math.round(virtualSuccessRate)));
      }
    });

    return groups;
  }, [filteredRecords]);

  // 시장 상태별 통계
  const marketStateStats = useMemo(() => {
    const stateStats = {};
    
    filteredRecords.forEach(record => {
      if (!stateStats[record.marketState]) {
        stateStats[record.marketState] = {
          count: 0,
          buyCount: 0,
          sellCount: 0,
          avgConfidence: 0,
          totalConfidence: 0
        };
      }
      
      stateStats[record.marketState].count++;
      stateStats[record.marketState].totalConfidence += record.confidenceLevel;
      stateStats[record.marketState][record.action + 'Count']++;
    });

    Object.keys(stateStats).forEach(state => {
      stateStats[state].avgConfidence = Math.round(
        stateStats[state].totalConfidence / stateStats[state].count
      );
    });

    return stateStats;
  }, [filteredRecords]);

  // AI 스타일 개선 팁 생성
  const generateInsights = useMemo(() => {
    const insights = [];
    
    // 확신도 분석 인사이트
    const highConfidenceSuccess = confidenceAnalysis.high.successRate;
    const lowConfidenceSuccess = confidenceAnalysis.low.successRate;
    
    if (lowConfidenceSuccess > highConfidenceSuccess) {
      insights.push({
        type: 'confidence',
        icon: '🤔',
        title: '확신도 역설 발견!',
        message: `확신도가 낮을 때 성공률이 ${lowConfidenceSuccess}%로 높은 확신(${highConfidenceSuccess}%)보다 좋습니다. 직관을 더 신뢰해보세요.`,
        priority: 'high'
      });
    }

    // 감정 분석 인사이트
    const emotionEntries = Object.entries(emotionAnalysis);
    if (emotionEntries.length > 0) {
      const dominantEmotion = emotionEntries.reduce((a, b) => 
        emotionAnalysis[a[0]].count > emotionAnalysis[b[0]].count ? a : b
      );
      
      insights.push({
        type: 'emotion',
        icon: '🎭',
        title: '주요 감정 패턴',
        message: `'${dominantEmotion[0]}' 상태에서 가장 많이 거래합니다 (${dominantEmotion[1].count}회). 평균 확신도: ${dominantEmotion[1].avgConfidence}%`,
        priority: 'medium'
      });
    }

    // 외부 영향 분석
    const externalInfluenceRate = (filteredRecords.filter(r => r.externalInfluence).length / filteredRecords.length * 100).toFixed(1);
    if (externalInfluenceRate > 50) {
      insights.push({
        type: 'external',
        icon: '📰',
        title: '외부 영향 주의',
        message: `${externalInfluenceRate}%의 거래가 외부 요인에 영향을 받았습니다. 독립적 판단력을 키워보세요.`,
        priority: 'high'
      });
    }

    // 시장 상태 분석
    const marketEntries = Object.entries(marketStateStats);
    if (marketEntries.length > 0) {
      const marketInsight = marketEntries.find(([state, stats]) => 
        state === 'overheated' && stats.buyCount > stats.sellCount
      );
      
      if (marketInsight) {
        insights.push({
          type: 'market',
          icon: '🌡️',
          title: '시장 타이밍 점검',
          message: '과열 상태에서도 매수 비중이 높습니다. 시장 상황을 더 신중히 고려해보세요.',
          priority: 'medium'
        });
      }
    }

    // 일반적인 격려 메시지
    if (filteredRecords.length >= 10) {
      insights.push({
        type: 'general',
        icon: '🎯',
        title: '데이터 축적 달성!',
        message: `${filteredRecords.length}개의 기록으로 의미있는 패턴 분석이 가능합니다. 지속적인 기록으로 더 정확한 인사이트를 얻으세요.`,
        priority: 'low'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [emotionAnalysis, confidenceAnalysis, filteredRecords, marketStateStats]);

  if (filteredRecords.length === 0) {
    return (
      <div style={{
        background: theme.bg,
        borderRadius: '12px',
        border: `2px solid ${theme.border}`,
        padding: '40px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
        <h3 style={{ color: theme.text, marginBottom: '10px' }}>
          메타인지 분석을 위한 데이터가 부족합니다
        </h3>
        <p style={{ color: theme.subtext, fontSize: '14px' }}>
          감정 기반 거래 기록을 최소 3개 이상 작성하시면<br />
          개인화된 투자 심리 분석 리포트를 제공해드립니다.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.bg,
      borderRadius: '12px',
      border: `2px solid ${theme.border}`,
      overflow: 'hidden',
      marginBottom: '20px'
    }}>
      {/* 헤더 */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.teal}, ${theme.purple})`,
        padding: '20px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
              🧠 메타인지 분석 리포트
            </h2>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
              감정과 결과의 패턴으로 더 현명한 투자자 되기
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              <option value="all" style={{ color: '#333' }}>전체 기간</option>
              <option value="30days" style={{ color: '#333' }}>최근 30일</option>
              <option value="7days" style={{ color: '#333' }}>최근 7일</option>
            </select>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {filteredRecords.length}개 기록 분석
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '25px' }}>
        {/* AI 인사이트 카드 */}
        {generateInsights.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: theme.text, fontSize: '18px', marginBottom: '15px' }}>
              🤖 AI 메타인지 인사이트
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
              {generateInsights.slice(0, 3).map((insight, index) => (
                <div
                  key={index}
                  style={{
                    background: theme.cardBg,
                    border: `2px solid ${
                      insight.priority === 'high' ? theme.negative :
                      insight.priority === 'medium' ? theme.warning : theme.positive
                    }`,
                    borderRadius: '12px',
                    padding: '20px',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: insight.priority === 'high' ? theme.negative :
                               insight.priority === 'medium' ? theme.warning : theme.positive,
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '700'
                  }}>
                    {insight.priority === 'high' ? '중요' : insight.priority === 'medium' ? '주의' : '정보'}
                  </div>
                  
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>
                    {insight.icon}
                  </div>
                  <h4 style={{ color: theme.text, fontSize: '16px', marginBottom: '8px' }}>
                    {insight.title}
                  </h4>
                  <p style={{ color: theme.subtext, fontSize: '14px', lineHeight: '1.4', margin: 0 }}>
                    {insight.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 확신도 vs 성공률 분석 */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: theme.text, fontSize: '18px', marginBottom: '15px' }}>
            📊 자기 인지 정확도 분석
          </h3>
          <div style={{
            background: theme.cardBg,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${theme.border}`
          }}>
            <p style={{ color: theme.subtext, fontSize: '14px', marginBottom: '20px' }}>
              확신도별 성과 분석 (가상 성공률 기반)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              {Object.entries(confidenceAnalysis).map(([group, data]) => (
                <div
                  key={group}
                  style={{
                    background: theme.bg,
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: `2px solid ${
                      data.successRate >= 70 ? theme.positive :
                      data.successRate >= 50 ? theme.warning : theme.negative
                    }`
                  }}
                >
                  <div style={{ color: theme.subtext, fontSize: '12px', marginBottom: '5px' }}>
                    확신도 {data.range}
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '700',
                    color: data.successRate >= 70 ? theme.positive :
                           data.successRate >= 50 ? theme.warning : theme.negative,
                    marginBottom: '5px'
                  }}>
                    {data.successRate}%
                  </div>
                  <div style={{ color: theme.subtext, fontSize: '12px' }}>
                    {data.records.length}회 거래
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              background: theme.bg,
              padding: '15px',
              borderRadius: '8px',
              marginTop: '15px',
              fontSize: '12px',
              color: theme.subtext
            }}>
              💡 <strong>해석 가이드:</strong> 확신도와 실제 성과의 일치율이 높을수록 자기 인지 능력이 뛰어납니다.
              확신이 낮은데 성과가 좋다면 직관을 더 신뢰해보세요!
            </div>
          </div>
        </div>

        {/* 감정별 통계 */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: theme.text, fontSize: '18px', marginBottom: '15px' }}>
            🎭 감정 vs 결과 리마인더
          </h3>
          <div style={{
            background: theme.cardBg,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {Object.entries(emotionAnalysis).map(([emotion, stats]) => {
                const emotionInfo = {
                  excited: { icon: '🤩', color: '#ff6b6b' },
                  confident: { icon: '😎', color: '#4ecdc4' },
                  neutral: { icon: '😐', color: '#95a5a6' },
                  anxious: { icon: '😰', color: '#f39c12' },
                  fearful: { icon: '😨', color: '#e74c3c' },
                  greedy: { icon: '🤑', color: '#27ae60' },
                  regretful: { icon: '😣', color: '#8e44ad' },
                  hopeful: { icon: '🤞', color: '#3498db' }
                }[emotion] || { icon: '😐', color: '#95a5a6' };

                return (
                  <div
                    key={emotion}
                    style={{
                      background: theme.bg,
                      border: `2px solid ${emotionInfo.color}`,
                      borderRadius: '12px',
                      padding: '15px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '10px'
                    }}>
                      <span style={{ fontSize: '24px' }}>{emotionInfo.icon}</span>
                      <div>
                        <div style={{ color: theme.text, fontWeight: '600', fontSize: '14px' }}>
                          {emotion} 감정
                        </div>
                        <div style={{ color: theme.subtext, fontSize: '12px' }}>
                          {stats.count}회 거래
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: theme.subtext, lineHeight: '1.4' }}>
                      • 평균 확신도: <strong>{stats.avgConfidence}%</strong><br />
                      • 매수: {stats.buyCount}회, 매도: {stats.sellCount}회<br />
                      • 외부 영향: {stats.externalInfluenceCount}회
                      {stats.externalInfluenceCount > stats.count * 0.7 && 
                        <span style={{ color: theme.warning }}> ⚠️</span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 감정 출처 통계 */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: theme.text, fontSize: '18px', marginBottom: '15px' }}>
            📈 감정 출처 통계
          </h3>
          <div style={{
            background: theme.cardBg,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px'
            }}>
              {Object.entries(emotionSourceStats)
                .sort(([,a], [,b]) => b.count - a.count)
                .map(([source, stats]) => {
                  const sourceInfo = {
                    news: { icon: '📰', label: '뉴스' },
                    fomo: { icon: '🏃‍♂️', label: 'FOMO' },
                    anxiety: { icon: '😰', label: '불안감' },
                    intuition: { icon: '💡', label: '직감' },
                    experience: { icon: '📚', label: '과거 경험' },
                    community: { icon: '👥', label: '커뮤니티' },
                    technical: { icon: '📊', label: '기술적 분석' },
                    fundamental: { icon: '🔍', label: '기본적 분석' }
                  }[source] || { icon: '❓', label: source };

                  const percentage = ((stats.count / filteredRecords.length) * 100).toFixed(1);

                  return (
                    <div
                      key={source}
                      style={{
                        background: theme.bg,
                        padding: '15px',
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <span style={{ fontSize: '18px' }}>{sourceInfo.icon}</span>
                        <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>
                          {sourceInfo.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: theme.subtext }}>
                        <div>{percentage}% ({stats.count}회)</div>
                        <div>평균 확신도: {stats.avgConfidence}%</div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* 외부 영향률 요약 */}
            <div style={{
              background: theme.bg,
              padding: '15px',
              borderRadius: '8px',
              marginTop: '15px',
              border: `1px solid ${theme.warning}`
            }}>
              <div style={{ color: theme.text, fontSize: '14px', fontWeight: '600', marginBottom: '5px' }}>
                📊 의사결정 독립성 점수
              </div>
              <div style={{ fontSize: '12px', color: theme.subtext }}>
                외부 영향 기반 거래: {((filteredRecords.filter(r => r.externalInfluence).length / filteredRecords.length) * 100).toFixed(1)}%
                <br />
                직관/분석 기반 거래: {((filteredRecords.filter(r => ['intuition', 'technical', 'fundamental'].includes(r.emotionSource)).length / filteredRecords.length) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* 시장 상태별 행동 패턴 */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: theme.text, fontSize: '18px', marginBottom: '15px' }}>
            🌡️ 시장 상태별 행동 패턴
          </h3>
          <div style={{
            background: theme.cardBg,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              {Object.entries(marketStateStats).map(([state, stats]) => {
                const stateInfo = {
                  overheated: { icon: '📈', label: '과열', color: theme.negative },
                  neutral: { icon: '⚖️', label: '중립', color: theme.subtext },
                  cooling: { icon: '📉', label: '냉각', color: theme.positive }
                }[state] || { icon: '❓', label: state, color: theme.border };

                return (
                  <div
                    key={state}
                    style={{
                      background: theme.bg,
                      border: `2px solid ${stateInfo.color}`,
                      borderRadius: '12px',
                      padding: '15px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                      {stateInfo.icon}
                    </div>
                    <div style={{ color: theme.text, fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                      {stateInfo.label}
                    </div>
                    <div style={{ fontSize: '12px', color: theme.subtext, lineHeight: '1.4' }}>
                      총 {stats.count}회<br />
                      매수: {stats.buyCount}회<br />
                      매도: {stats.sellCount}회<br />
                      평균 확신도: {stats.avgConfidence}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 상세 분석 토글 */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            style={{
              background: theme.accent,
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {showDetailedAnalysis ? '📊 간단히 보기' : '🔍 상세 분석 보기'}
          </button>
        </div>

        {/* 상세 분석 섹션 */}
        {showDetailedAnalysis && (
          <div style={{
            background: theme.cardBg,
            borderRadius: '12px',
            padding: '25px',
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{ color: theme.text, fontSize: '18px', marginBottom: '20px' }}>
              🔬 상세 메타인지 분석
            </h3>

            {/* 감정-시간대별 패턴 */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ color: theme.text, fontSize: '16px', marginBottom: '15px' }}>
                📅 최근 감정 변화 패턴
              </h4>
              <div style={{
                background: theme.bg,
                padding: '15px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`
              }}>
                {filteredRecords.slice(0, 10).reverse().map((record, index) => (
                  <div
                    key={record.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: index < 9 ? `1px solid ${theme.border}` : 'none'
                    }}
                  >
                    <div style={{ fontSize: '12px', color: theme.subtext }}>
                      {new Date(record.timestamp).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '14px', color: theme.text }}>
                      {record.emotion} → {record.action === 'buy' ? '매수' : '매도'}
                    </div>
                    <div style={{ fontSize: '12px', color: theme.subtext }}>
                      확신도: {record.confidenceLevel}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 개인화된 추천 */}
            <div>
              <h4 style={{ color: theme.text, fontSize: '16px', marginBottom: '15px' }}>
                💡 개인화된 메타인지 개선 방법
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {generateInsights.slice(3).map((insight, index) => (
                  <div
                    key={index}
                    style={{
                      background: theme.bg,
                      padding: '15px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{insight.icon}</span>
                    <div>
                      <div style={{ color: theme.text, fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                        {insight.title}
                      </div>
                      <div style={{ color: theme.subtext, fontSize: '12px', lineHeight: '1.4' }}>
                        {insight.message}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 기본 조언 */}
                <div style={{
                  background: theme.bg,
                  padding: '15px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.positive}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>🎯</span>
                  <div>
                    <div style={{ color: theme.text, fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                      지속적인 기록의 힘
                    </div>
                    <div style={{ color: theme.subtext, fontSize: '12px', lineHeight: '1.4' }}>
                      더 많은 기록을 축적할수록 개인 투자 패턴의 정확한 분석이 가능합니다. 
                      매주 최소 2-3회의 감정 기록을 추천드립니다.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      <div style={{
        background: theme.cardBg,
        padding: '15px 20px',
        borderTop: `1px solid ${theme.border}`,
        fontSize: '12px',
        color: theme.subtext,
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        <div>🧠 메타인지는 더 현명한 투자의 첫걸음입니다</div>
        <div>📊 {filteredRecords.length >= 10 ? '충분한 데이터로 신뢰성 높은 분석' : '더 많은 기록으로 정확도 향상 가능'}</div>
      </div>
    </div>
  );
};

export default MetaCognitionReport; 