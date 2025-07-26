import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ChaessaemCharacter from './ChaessaemCharacter';

// 감정 카테고리
const EMOTIONS = {
  FEAR: { id: 'fear', name: '😨 두려움', color: '#FF6B6B', intensity: [1, 2, 3, 4, 5] },
  GREED: { id: 'greed', name: '🤑 탐욕', color: '#FF9F43', intensity: [1, 2, 3, 4, 5] },
  FOMO: { id: 'fomo', name: '😰 FOMO', color: '#FF6348', intensity: [1, 2, 3, 4, 5] },
  CONFIDENCE: { id: 'confidence', name: '😎 자신감', color: '#2ECC71', intensity: [1, 2, 3, 4, 5] },
  ANXIETY: { id: 'anxiety', name: '😟 불안', color: '#E74C3C', intensity: [1, 2, 3, 4, 5] },
  EXCITEMENT: { id: 'excitement', name: '🤩 흥분', color: '#F39C12', intensity: [1, 2, 3, 4, 5] },
  REGRET: { id: 'regret', name: '😔 후회', color: '#9B59B6', intensity: [1, 2, 3, 4, 5] },
  CALM: { id: 'calm', name: '😌 냉정', color: '#3498DB', intensity: [1, 2, 3, 4, 5] }
};

// 거래 타입
const TRADE_TYPES = {
  BUY: { id: 'buy', name: '매수', icon: '📈', color: '#2ECC71' },
  SELL: { id: 'sell', name: '매도', icon: '📉', color: '#E74C3C' },
  HOLD: { id: 'hold', name: '홀딩', icon: '🤝', color: '#F39C12' },
  WATCH: { id: 'watch', name: '관망', icon: '👀', color: '#3498DB' }
};

// 메타인지 항목
const METACOGNITION_FIELDS = {
  CONFIDENCE_LEVEL: {
    id: 'confidence_level',
    name: '확신도',
    type: 'range',
    min: 1,
    max: 10,
    description: '이 거래에 대한 확신 정도 (1-10)'
  },
  EXTERNAL_INFLUENCE: {
    id: 'external_influence',
    name: '외부 영향도',
    type: 'range',
    min: 1,
    max: 10,
    description: '외부 정보/의견이 결정에 미친 영향 (1-10)'
  },
  EXPECTED_RESULT: {
    id: 'expected_result',
    name: '예상 결과',
    type: 'select',
    options: ['매우 긍정적', '긍정적', '보통', '부정적', '매우 부정적'],
    description: '이 거래의 예상 결과'
  },
  MARKET_STATE: {
    id: 'market_state',
    name: '시장 상태 인식',
    type: 'select',
    options: ['강세장', '약세장', '횡보장', '변동성 높음', '불확실'],
    description: '거래 당시 시장 상태에 대한 인식'
  },
  PAST_COMPARISON: {
    id: 'past_comparison',
    name: '과거 경험 비교',
    type: 'textarea',
    description: '비슷한 과거 경험과 비교'
  },
  EMOTION_SOURCE: {
    id: 'emotion_source',
    name: '감정 원인',
    type: 'textarea',
    description: '현재 감정의 구체적 원인'
  }
};

const EmotionalTradingJournal = ({ darkMode = false }) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  
  const [tradingRecords, setTradingRecords] = useLocalStorage('trading_records', []);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({
    id: null,
    timestamp: new Date(),
    symbol: '',
    action: '',
    emotion: '',
    emotionIntensity: 3,
    price: '',
    quantity: '',
    reasoning: '',
    metacognition: {
      confidence_level: 5,
      external_influence: 5,
      expected_result: '보통',
      market_state: '불확실',
      past_comparison: '',
      emotion_source: ''
    },
    isStarred: false,
    actualResult: null,
    notes: ''
  });
  const [viewMode, setViewMode] = useState('dashboard'); // dashboard, record, list, insights
  const [filterEmotion, setFilterEmotion] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  // 90일 기본 보관, 별표는 영구 보관
  const getRecordRetentionStatus = (record) => {
    if (record.isStarred) return { status: 'permanent', days: '영구' };
    
    const recordDate = new Date(record.timestamp);
    const now = new Date();
    const daysPassed = Math.floor((now - recordDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 90 - daysPassed);
    
    if (daysRemaining <= 10) return { status: 'warning', days: daysRemaining };
    if (daysRemaining <= 30) return { status: 'caution', days: daysRemaining };
    return { status: 'safe', days: daysRemaining };
  };

  // 만료 예정 기록 알림
  useEffect(() => {
    const expiringRecords = tradingRecords.filter(record => {
      if (record.isStarred) return false;
      const retention = getRecordRetentionStatus(record);
      return retention.status === 'warning';
    });

    if (expiringRecords.length > 0) {
      // 알림 표시 로직 (실제로는 notification 시스템 사용)
      console.log(`${expiringRecords.length}개의 기록이 곧 만료됩니다.`);
    }
  }, [tradingRecords]);

  // 새 기록 시작
  const startNewRecord = () => {
    setCurrentRecord({
      id: Date.now(),
      timestamp: new Date(),
      symbol: '',
      action: '',
      emotion: '',
      emotionIntensity: 3,
      price: '',
      quantity: '',
      reasoning: '',
      metacognition: {
        confidence_level: 5,
        external_influence: 5,
        expected_result: '보통',
        market_state: '불확실',
        past_comparison: '',
        emotion_source: ''
      },
      isStarred: false,
      actualResult: null,
      notes: ''
    });
    setIsRecording(true);
    setViewMode('record');
  };

  // 기록 저장
  const saveRecord = () => {
    if (!currentRecord.symbol || !currentRecord.action || !currentRecord.emotion) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setTradingRecords(prev => [currentRecord, ...prev]);
    setIsRecording(false);
    setViewMode('dashboard');
  };

  // 기록 별표 토글
  const toggleStar = (recordId) => {
    setTradingRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { ...record, isStarred: !record.isStarred }
          : record
      )
    );
  };

  // 기록 삭제
  const deleteRecord = (recordId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setTradingRecords(prev => prev.filter(record => record.id !== recordId));
    }
  };

  // 통계 계산
  const getStatistics = () => {
    const total = tradingRecords.length;
    const starred = tradingRecords.filter(r => r.isStarred).length;
    const byEmotion = Object.keys(EMOTIONS).reduce((acc, emotion) => {
      acc[emotion] = tradingRecords.filter(r => r.emotion === emotion).length;
      return acc;
    }, {});
    
    const expiringCount = tradingRecords.filter(record => {
      const retention = getRecordRetentionStatus(record);
      return retention.status === 'warning';
    }).length;

    return { total, starred, byEmotion, expiringCount };
  };

  const stats = getStatistics();

  // 메타인지 필드 렌더링
  const renderMetacognitionField = (fieldKey, field) => {
    const value = currentRecord.metacognition[fieldKey];
    
    switch (field.type) {
      case 'range':
        return (
          <div key={fieldKey} style={{ marginBottom: '16px' }}>
            <label style={{
              ...typography.presets.body.small,
              color: typography.colors.muted,
              marginBottom: '8px',
              display: 'block'
            }}>
              {field.name} ({value}/{field.max})
            </label>
            <input
              type="range"
              min={field.min}
              max={field.max}
              value={value}
              onChange={(e) => setCurrentRecord(prev => ({
                ...prev,
                metacognition: {
                  ...prev.metacognition,
                  [fieldKey]: parseInt(e.target.value)
                }
              }))}
              style={{ width: '100%' }}
            />
            <div style={{
              ...typography.presets.caption,
              color: typography.colors.muted,
              marginTop: '4px'
            }}>
              {field.description}
            </div>
          </div>
        );
      
      case 'select':
        return (
          <div key={fieldKey} style={{ marginBottom: '16px' }}>
            <label style={{
              ...typography.presets.body.small,
              color: typography.colors.muted,
              marginBottom: '8px',
              display: 'block'
            }}>
              {field.name}
            </label>
            <select
              value={value}
              onChange={(e) => setCurrentRecord(prev => ({
                ...prev,
                metacognition: {
                  ...prev.metacognition,
                  [fieldKey]: e.target.value
                }
              }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.background,
                color: typography.colors.primary
              }}
            >
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div style={{
              ...typography.presets.caption,
              color: typography.colors.muted,
              marginTop: '4px'
            }}>
              {field.description}
            </div>
          </div>
        );
      
      case 'textarea':
        return (
          <div key={fieldKey} style={{ marginBottom: '16px' }}>
            <label style={{
              ...typography.presets.body.small,
              color: typography.colors.muted,
              marginBottom: '8px',
              display: 'block'
            }}>
              {field.name}
            </label>
            <textarea
              value={value}
              onChange={(e) => setCurrentRecord(prev => ({
                ...prev,
                metacognition: {
                  ...prev.metacognition,
                  [fieldKey]: e.target.value
                }
              }))}
              placeholder={field.description}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.background,
                color: typography.colors.primary,
                resize: 'vertical'
              }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: theme.colors.surface,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.md
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ChaessaemCharacter size="normal" darkMode={darkMode} />
          <div>
            <h2 style={{
              ...typography.presets.heading.h2,
              color: typography.colors.primary,
              margin: 0
            }}>
              💭 감정 기반 트레이딩 기록
            </h2>
            <p style={{
              ...typography.presets.body.normal,
              color: typography.colors.muted,
              margin: '8px 0 0 0'
            }}>
              투자 감정과 메타인지를 기록하여 더 나은 투자자가 되어보세요
            </p>
          </div>
        </div>
        
        {/* 네비게이션 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'dashboard', label: '📊 대시보드' },
            { key: 'record', label: '📝 기록하기' },
            { key: 'list', label: '📋 목록' },
            { key: 'insights', label: '🧠 인사이트' }
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setViewMode(item.key)}
              style={{
                background: viewMode === item.key 
                  ? `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`
                  : 'transparent',
                color: viewMode === item.key ? 'white' : theme.colors.accent,
                border: `2px solid ${theme.colors.accent}`,
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 대시보드 */}
      {viewMode === 'dashboard' && (
        <div>
          {/* 통계 카드 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: `${theme.colors.accent}15`,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              border: `1px solid ${theme.colors.accent}20`
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
              <div style={{
                ...typography.presets.body.large,
                color: theme.colors.accent,
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {stats.total}
              </div>
              <div style={{
                ...typography.presets.caption,
                color: typography.colors.muted
              }}>
                총 기록 수
              </div>
            </div>

            <div style={{
              background: `${theme.colors.warning}15`,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              border: `1px solid ${theme.colors.warning}20`
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
              <div style={{
                ...typography.presets.body.large,
                color: theme.colors.warning,
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {stats.starred}
              </div>
              <div style={{
                ...typography.presets.caption,
                color: typography.colors.muted
              }}>
                영구 보관 기록
              </div>
            </div>

            <div style={{
              background: `${theme.colors.negative}15`,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              border: `1px solid ${theme.colors.negative}20`
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
              <div style={{
                ...typography.presets.body.large,
                color: theme.colors.negative,
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {stats.expiringCount}
              </div>
              <div style={{
                ...typography.presets.caption,
                color: typography.colors.muted
              }}>
                만료 예정 기록
              </div>
            </div>

            <div style={{
              background: `${theme.colors.positive}15`,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              border: `1px solid ${theme.colors.positive}20`
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📈</div>
              <div style={{
                ...typography.presets.body.large,
                color: theme.colors.positive,
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {Math.round((stats.starred / Math.max(stats.total, 1)) * 100)}%
              </div>
              <div style={{
                ...typography.presets.caption,
                color: typography.colors.muted
              }}>
                별표 비율
              </div>
            </div>
          </div>

          {/* 감정별 통계 */}
          <div style={{
            background: theme.colors.background,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <h3 style={{
              ...typography.presets.heading.h3,
              color: typography.colors.primary,
              marginBottom: '16px'
            }}>
              😊 감정별 거래 통계
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px'
            }}>
              {Object.entries(EMOTIONS).map(([key, emotion]) => (
                <div
                  key={key}
                  style={{
                    background: `${emotion.color}15`,
                    border: `1px solid ${emotion.color}30`,
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{
                    fontSize: '18px',
                    marginBottom: '4px'
                  }}>
                    {emotion.name}
                  </div>
                  <div style={{
                    ...typography.presets.body.normal,
                    color: emotion.color,
                    fontWeight: '700'
                  }}>
                    {stats.byEmotion[key] || 0}회
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 빠른 기록 시작 */}
          <div style={{
            background: `${theme.colors.positive}10`,
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            border: `1px solid ${theme.colors.positive}20`
          }}>
            <h3 style={{
              ...typography.presets.heading.h3,
              color: typography.colors.primary,
              marginBottom: '16px'
            }}>
              📝 새 거래 기록하기
            </h3>
            
            <p style={{
              ...typography.presets.body.normal,
              color: typography.colors.muted,
              marginBottom: '20px'
            }}>
              지금 경험하고 있는 투자 감정과 의사결정 과정을 기록해보세요
            </p>
            
            <button
              onClick={startNewRecord}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.positive}, ${theme.colors.accent})`,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              🚀 기록 시작하기
            </button>
          </div>
        </div>
      )}

      {/* 기록하기 */}
      {viewMode === 'record' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }}>
            {/* 기본 정보 */}
            <div style={{
              background: theme.colors.background,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <h3 style={{
                ...typography.presets.heading.h3,
                color: typography.colors.primary,
                marginBottom: '16px'
              }}>
                📊 거래 정보
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{
                    ...typography.presets.body.small,
                    color: typography.colors.muted,
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    종목 코드 *
                  </label>
                  <input
                    type="text"
                    value={currentRecord.symbol}
                    onChange={(e) => setCurrentRecord(prev => ({...prev, symbol: e.target.value.toUpperCase()}))}
                    placeholder="AAPL, TSLA 등"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.border}`,
                      background: theme.colors.surface,
                      color: typography.colors.primary
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    ...typography.presets.body.small,
                    color: typography.colors.muted,
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    거래 행동 *
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px'
                  }}>
                    {Object.values(TRADE_TYPES).map(type => (
                      <button
                        key={type.id}
                        onClick={() => setCurrentRecord(prev => ({...prev, action: type.id}))}
                        style={{
                          background: currentRecord.action === type.id 
                            ? `linear-gradient(135deg, ${type.color}, ${theme.colors.accent})`
                            : 'transparent',
                          color: currentRecord.action === type.id ? 'white' : type.color,
                          border: `2px solid ${type.color}`,
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        {type.icon} {type.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{
                      ...typography.presets.body.small,
                      color: typography.colors.muted,
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      가격
                    </label>
                    <input
                      type="number"
                      value={currentRecord.price}
                      onChange={(e) => setCurrentRecord(prev => ({...prev, price: e.target.value}))}
                      placeholder="100.00"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${theme.colors.border}`,
                        background: theme.colors.surface,
                        color: typography.colors.primary
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      ...typography.presets.body.small,
                      color: typography.colors.muted,
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      수량
                    </label>
                    <input
                      type="number"
                      value={currentRecord.quantity}
                      onChange={(e) => setCurrentRecord(prev => ({...prev, quantity: e.target.value}))}
                      placeholder="100"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${theme.colors.border}`,
                        background: theme.colors.surface,
                        color: typography.colors.primary
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    ...typography.presets.body.small,
                    color: typography.colors.muted,
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    거래 근거
                  </label>
                  <textarea
                    value={currentRecord.reasoning}
                    onChange={(e) => setCurrentRecord(prev => ({...prev, reasoning: e.target.value}))}
                    placeholder="이 거래를 결정한 이유를 자세히 적어주세요..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.border}`,
                      background: theme.colors.surface,
                      color: typography.colors.primary,
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 감정 정보 */}
            <div style={{
              background: theme.colors.background,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <h3 style={{
                ...typography.presets.heading.h3,
                color: typography.colors.primary,
                marginBottom: '16px'
              }}>
                😊 감정 상태 *
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                marginBottom: '16px'
              }}>
                {Object.values(EMOTIONS).map(emotion => (
                  <button
                    key={emotion.id}
                    onClick={() => setCurrentRecord(prev => ({...prev, emotion: emotion.id}))}
                    style={{
                      background: currentRecord.emotion === emotion.id 
                        ? `linear-gradient(135deg, ${emotion.color}, ${theme.colors.accent})`
                        : 'transparent',
                      color: currentRecord.emotion === emotion.id ? 'white' : emotion.color,
                      border: `2px solid ${emotion.color}`,
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    {emotion.name}
                  </button>
                ))}
              </div>

              {currentRecord.emotion && (
                <div>
                  <label style={{
                    ...typography.presets.body.small,
                    color: typography.colors.muted,
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    감정 강도: {currentRecord.emotionIntensity}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={currentRecord.emotionIntensity}
                    onChange={(e) => setCurrentRecord(prev => ({...prev, emotionIntensity: parseInt(e.target.value)}))}
                    style={{ width: '100%' }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    ...typography.presets.caption,
                    color: typography.colors.muted,
                    marginTop: '4px'
                  }}>
                    <span>약함</span>
                    <span>보통</span>
                    <span>강함</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 메타인지 섹션 */}
          <div style={{
            background: `${theme.colors.accent}10`,
            borderRadius: '12px',
            padding: '20px',
            marginTop: '24px',
            border: `1px solid ${theme.colors.accent}20`
          }}>
            <h3 style={{
              ...typography.presets.heading.h3,
              color: typography.colors.primary,
              marginBottom: '16px'
            }}>
              🧠 메타인지 보조 항목
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {Object.entries(METACOGNITION_FIELDS).map(([key, field]) => 
                renderMetacognitionField(key, field)
              )}
            </div>
          </div>

          {/* 저장 버튼 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '24px'
          }}>
            <button
              onClick={() => setViewMode('dashboard')}
              style={{
                background: 'transparent',
                color: theme.colors.muted,
                border: `2px solid ${theme.colors.muted}`,
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              취소
            </button>
            
            <button
              onClick={saveRecord}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.positive}, ${theme.colors.accent})`,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 32px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              💾 기록 저장
            </button>
          </div>
        </div>
      )}

      {/* 목록 */}
      {viewMode === 'list' && (
        <div>
          {/* 필터 */}
          <div style={{
            background: theme.colors.background,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: `1px solid ${theme.colors.border}`,
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            <div>
              <label style={{
                ...typography.presets.body.small,
                color: typography.colors.muted,
                marginRight: '8px'
              }}>
                감정:
              </label>
              <select
                value={filterEmotion}
                onChange={(e) => setFilterEmotion(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.surface,
                  color: typography.colors.primary
                }}
              >
                <option value="all">전체</option>
                {Object.values(EMOTIONS).map(emotion => (
                  <option key={emotion.id} value={emotion.id}>
                    {emotion.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{
                ...typography.presets.body.small,
                color: typography.colors.muted,
                marginRight: '8px'
              }}>
                기간:
              </label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.surface,
                  color: typography.colors.primary
                }}
              >
                <option value="all">전체</option>
                <option value="week">최근 1주</option>
                <option value="month">최근 1달</option>
                <option value="3months">최근 3달</option>
              </select>
            </div>
          </div>

          {/* 기록 리스트 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tradingRecords
              .filter(record => filterEmotion === 'all' || record.emotion === filterEmotion)
              .filter(record => {
                if (filterPeriod === 'all') return true;
                const recordDate = new Date(record.timestamp);
                const now = new Date();
                const diffTime = now - recordDate;
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                
                switch (filterPeriod) {
                  case 'week': return diffDays <= 7;
                  case 'month': return diffDays <= 30;
                  case '3months': return diffDays <= 90;
                  default: return true;
                }
              })
              .map(record => {
                const emotion = EMOTIONS[record.emotion?.toUpperCase()];
                const tradeType = TRADE_TYPES[record.action?.toUpperCase()];
                const retention = getRecordRetentionStatus(record);
                
                return (
                  <div
                    key={record.id}
                    style={{
                      background: theme.colors.surface,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '12px',
                      padding: '16px',
                      position: 'relative'
                    }}
                  >
                    {/* 보관 상태 표시 */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      {record.isStarred ? (
                        <span style={{
                          background: theme.colors.warning,
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          ⭐ 영구보관
                        </span>
                      ) : (
                        <span style={{
                          background: retention.status === 'warning' ? theme.colors.negative :
                                   retention.status === 'caution' ? theme.colors.warning :
                                   theme.colors.positive,
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          {retention.days}일 남음
                        </span>
                      )}
                      
                      <button
                        onClick={() => toggleStar(record.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: '4px'
                        }}
                      >
                        {record.isStarred ? '⭐' : '☆'}
                      </button>
                      
                      <button
                        onClick={() => deleteRecord(record.id)}
                        style={{
                          background: theme.colors.negative,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: '16px',
                      alignItems: 'center'
                    }}>
                      {/* 거래 정보 */}
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontSize: '20px' }}>
                            {tradeType?.icon}
                          </span>
                          <h4 style={{
                            ...typography.presets.heading.h4,
                            color: typography.colors.primary,
                            margin: 0
                          }}>
                            {record.symbol}
                          </h4>
                          <span style={{
                            background: tradeType?.color + '20',
                            color: tradeType?.color,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {tradeType?.name}
                          </span>
                        </div>
                        
                        <div style={{
                          ...typography.presets.body.small,
                          color: typography.colors.muted
                        }}>
                          {new Date(record.timestamp).toLocaleString()}
                        </div>
                        
                        {record.price && (
                          <div style={{
                            ...typography.presets.body.normal,
                            color: typography.colors.primary,
                            fontWeight: '600'
                          }}>
                            ${record.price} × {record.quantity}
                          </div>
                        )}
                      </div>

                      {/* 감정 정보 */}
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <span style={{
                            background: emotion?.color + '20',
                            color: emotion?.color,
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {emotion?.name} {record.emotionIntensity}/5
                          </span>
                        </div>
                        
                        <div style={{
                          ...typography.presets.body.small,
                          color: typography.colors.muted,
                          marginBottom: '8px'
                        }}>
                          확신도: {record.metacognition.confidence_level}/10
                        </div>
                        
                        {record.reasoning && (
                          <div style={{
                            ...typography.presets.body.small,
                            color: typography.colors.secondary,
                            lineHeight: 1.4,
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {record.reasoning}
                          </div>
                        )}
                      </div>

                      {/* 메타인지 요약 */}
                      <div style={{
                        ...typography.presets.caption,
                        color: typography.colors.muted,
                        textAlign: 'right',
                        minWidth: '120px'
                      }}>
                        <div>외부영향: {record.metacognition.external_influence}/10</div>
                        <div>예상결과: {record.metacognition.expected_result}</div>
                        <div>시장상태: {record.metacognition.market_state}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {tradingRecords.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: `${theme.colors.muted}10`,
              borderRadius: '12px',
              border: `1px dashed ${theme.colors.muted}`
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <h4 style={{
                ...typography.presets.heading.h4,
                color: typography.colors.primary,
                marginBottom: '8px'
              }}>
                아직 기록이 없어요
              </h4>
              <p style={{
                ...typography.presets.body.normal,
                color: typography.colors.muted
              }}>
                첫 번째 거래 감정을 기록해보세요!
              </p>
            </div>
          )}
        </div>
      )}

      {/* 인사이트 */}
      {viewMode === 'insights' && (
        <div>
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: `${theme.colors.accent}10`,
            borderRadius: '12px',
            border: `1px solid ${theme.colors.accent}20`
          }}>
            <ChaessaemCharacter size="large" darkMode={darkMode} />
            <h3 style={{
              ...typography.presets.heading.h3,
              color: typography.colors.primary,
              marginTop: '16px',
              marginBottom: '12px'
            }}>
              🧠 AI 인사이트 분석
            </h3>
            <p style={{
              ...typography.presets.body.normal,
              color: typography.colors.muted,
              marginBottom: '20px'
            }}>
              충분한 데이터가 쌓이면 채쌤이 당신의 투자 패턴을 분석해드릴게요!<br/>
              더 많은 기록을 쌓아보세요.
            </p>
            
            <div style={{
              background: theme.colors.background,
              borderRadius: '8px',
              padding: '16px',
              marginTop: '20px'
            }}>
              <h4 style={{
                ...typography.presets.heading.h4,
                color: typography.colors.primary,
                marginBottom: '12px'
              }}>
                예상 분석 항목 (10개 기록 이상 시)
              </h4>
              
              <div style={{
                ...typography.presets.body.small,
                color: typography.colors.muted,
                textAlign: 'left',
                lineHeight: 1.6
              }}>
                • 💭 감정 vs 결과 분석: 어떤 감정일 때 더 좋은 성과를 내는지<br/>
                • 📊 감정 원인 통계: 주로 어떤 요인이 감정을 유발하는지<br/>
                • 🎯 자기 인식 정확도: 예상 결과와 실제 결과 비교<br/>
                • 🧠 메타인지 개선 팁: 개인화된 투자 심리 조언<br/>
                • 📈 최적 거래 타이밍: 당신에게 맞는 거래 패턴 발견
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionalTradingJournal; 