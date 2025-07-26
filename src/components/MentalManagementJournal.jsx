import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useChaessaemNotification } from './ChaessaemNotification';
import { detectUserType, createGolfStockAdvice, getTimeBasedGreeting } from '../services/chaessaemPersona';
import ChaessaemEmoji from './ChaessaemEmoji';
import EnhancedButton from './EnhancedButton';

// 감정 상태 매핑
const EMOTION_STATES = {
  golf: {
    confident: { icon: '💪', label: '자신만만', color: '#10B981' },
    focused: { icon: '🎯', label: '집중완료', color: '#3B82F6' },
    nervous: { icon: '😰', label: '긴장됨', color: '#F59E0B' },
    frustrated: { icon: '😤', label: '답답함', color: '#EF4444' },
    relaxed: { icon: '😌', label: '편안함', color: '#8B5CF6' }
  },
  trading: {
    bullish: { icon: '📈', label: '상승확신', color: '#10B981' },
    bearish: { icon: '📉', label: '하락우려', color: '#EF4444' },
    neutral: { icon: '⚖️', label: '중립적', color: '#6B7280' },
    FOMO: { icon: '🔥', label: 'FOMO', color: '#F59E0B' },
    cautious: { icon: '🛡️', label: '신중함', color: '#3B82F6' }
  }
};

// 루틴 체크리스트
const DAILY_ROUTINES = {
  golf: [
    { id: 'morning_stretch', label: '아침 스트레칭', icon: '🤸‍♀️' },
    { id: 'swing_practice', label: '스윙 연습', icon: '⛳' },
    { id: 'putting_drill', label: '퍼팅 드릴', icon: '🥅' },
    { id: 'mental_visualization', label: '멘탈 시각화', icon: '🧠' },
    { id: 'equipment_check', label: '장비 점검', icon: '🏌️‍♀️' }
  ],
  trading: [
    { id: 'market_analysis', label: '시장 분석', icon: '📊' },
    { id: 'news_check', label: '뉴스 체크', icon: '📰' },
    { id: 'portfolio_review', label: '포트폴리오 검토', icon: '💼' },
    { id: 'risk_assessment', label: '리스크 평가', icon: '⚠️' },
    { id: 'emotion_check', label: '감정 점검', icon: '❤️' }
  ]
};

const MentalManagementJournal = ({ darkMode = false }) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  const notification = useChaessaemNotification();
  const userInfo = detectUserType();
  const isDaryong = userInfo.userType === 'CORE_USER';

  // 상태 관리
  const [journalEntries, setJournalEntries] = useLocalStorage('mental_journal_entries', []);
  const [currentEntry, setCurrentEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    golfEmotion: '',
    tradingEmotion: '',
    golfRoutines: [],
    tradingRoutines: [],
    golfNotes: '',
    tradingNotes: '',
    mentalScore: 5,
    insights: '',
    chaessaemAdvice: ''
  });
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // 오늘의 채쌤 조언 생성
  useEffect(() => {
    if (!currentEntry.chaessaemAdvice) {
      const advice = createGolfStockAdvice({ 
        context: '멘탈 매니지먼트 일지',
        golfEmotion: currentEntry.golfEmotion,
        tradingEmotion: currentEntry.tradingEmotion
      });
      setCurrentEntry(prev => ({ ...prev, chaessaemAdvice: advice }));
    }
  }, [currentEntry.golfEmotion, currentEntry.tradingEmotion]);

  // 루틴 체크 핸들러
  const handleRoutineCheck = (category, routineId, checked) => {
    const routineKey = `${category}Routines`;
    setCurrentEntry(prev => ({
      ...prev,
      [routineKey]: checked 
        ? [...prev[routineKey], routineId]
        : prev[routineKey].filter(id => id !== routineId)
    }));
  };

  // 감정 상태 선택
  const handleEmotionSelect = (category, emotion) => {
    const emotionKey = `${category}Emotion`;
    setCurrentEntry(prev => ({ ...prev, [emotionKey]: emotion }));
  };

  // 일지 저장
  const saveEntry = () => {
    const entryToSave = {
      ...currentEntry,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };

    setJournalEntries(prev => {
      const existingIndex = prev.findIndex(entry => entry.date === currentEntry.date);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = entryToSave;
        return updated;
      } else {
        return [entryToSave, ...prev];
      }
    });

    const message = isDaryong ? 
      "다룡아! 오늘 일지 저장 완료! 꾸준히 기록하는 모습이 정말 대단해 👍" :
      "오늘의 멘탈 관리 일지가 저장되었어요! 꾸준한 기록이 성장의 밑거름이 됩니다 ✨";

    notification.success(message, {
      title: '일지 저장 완료',
      duration: 3000
    });
  };

  // 특정 날짜 일지 로드
  const loadEntry = (date) => {
    const existingEntry = journalEntries.find(entry => entry.date === date);
    if (existingEntry) {
      setCurrentEntry(existingEntry);
    } else {
      setCurrentEntry({
        date,
        golfEmotion: '',
        tradingEmotion: '',
        golfRoutines: [],
        tradingRoutines: [],
        golfNotes: '',
        tradingNotes: '',
        mentalScore: 5,
        insights: '',
        chaessaemAdvice: ''
      });
    }
  };

  // 분석 데이터 생성
  const generateAnalytics = () => {
    const recentEntries = journalEntries.slice(0, 30); // 최근 30일
    
    const emotionTrends = {
      golf: {},
      trading: {}
    };

    const routineCompletion = {
      golf: {},
      trading: {}
    };

    recentEntries.forEach(entry => {
      // 감정 트렌드
      if (entry.golfEmotion) {
        emotionTrends.golf[entry.golfEmotion] = (emotionTrends.golf[entry.golfEmotion] || 0) + 1;
      }
      if (entry.tradingEmotion) {
        emotionTrends.trading[entry.tradingEmotion] = (emotionTrends.trading[entry.tradingEmotion] || 0) + 1;
      }

      // 루틴 완수율
      entry.golfRoutines.forEach(routine => {
        routineCompletion.golf[routine] = (routineCompletion.golf[routine] || 0) + 1;
      });
      entry.tradingRoutines.forEach(routine => {
        routineCompletion.trading[routine] = (routineCompletion.trading[routine] || 0) + 1;
      });
    });

    return { emotionTrends, routineCompletion, totalEntries: recentEntries.length };
  };

  const analytics = generateAnalytics();

  return (
    <div style={{
      background: theme.cardBg,
      borderRadius: '20px',
      padding: '32px',
      border: `2px solid ${theme.border}`,
      fontFamily: typography.fontFamily.primary
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <ChaessaemEmoji
          type="emotions"
          emotion={isDaryong ? "confident" : "thinking"}
          size="large"
          showMessage={false}
          autoAnimation={false}
          darkMode={darkMode}
        />
        <div>
          <h2 style={{
            ...typography.presets.heading.h2,
            color: typography.colors.primary,
            margin: 0,
            marginBottom: '8px'
          }}>
            {isDaryong ? "다룡이의 멘탈 매니지먼트 일지" : "멘탈 매니지먼트 일지"}
          </h2>
          <div style={{
            ...typography.presets.body.small,
            color: typography.colors.muted
          }}>
            골프 🏌️‍♀️ + 주식 📈 = 완벽한 멘탈 트레이닝
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        borderBottom: `2px solid ${theme.border}`,
        paddingBottom: '16px'
      }}>
        {[
          { id: 'daily', label: '📝 오늘의 일지', icon: '📝' },
          { id: 'history', label: '📚 기록 보기', icon: '📚' },
          { id: 'analytics', label: '📊 분석 리포트', icon: '📊' }
        ].map((tab) => (
          <EnhancedButton
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            size="normal"
            icon={tab.icon}
            darkMode={darkMode}
          >
            {tab.label}
          </EnhancedButton>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 날짜 선택 */}
          <div style={{
            background: theme.gradients.ocean,
            borderRadius: '12px',
            padding: '20px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{
                ...typography.presets.heading.h3,
                color: 'white',
                margin: 0
              }}>
                {isDaryong ? "다룡이의 오늘" : "오늘의 기록"}
              </h3>
              <input
                type="date"
                value={currentEntry.date}
                onChange={(e) => {
                  setCurrentEntry(prev => ({ ...prev, date: e.target.value }));
                  loadEntry(e.target.value);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.9)',
                  ...typography.presets.body.small
                }}
              />
            </div>
          </div>

          {/* 감정 상태 체크 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* 골프 감정 */}
            <div style={{
              background: theme.bg,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{
                ...typography.presets.heading.h4,
                color: typography.colors.primary,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🏌️‍♀️ 골프 멘탈 상태
              </h4>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {Object.entries(EMOTION_STATES.golf).map(([key, emotion]) => (
                  <button
                    key={key}
                    onClick={() => handleEmotionSelect('golf', key)}
                    style={{
                      background: currentEntry.golfEmotion === key ? emotion.color : theme.cardBg,
                      color: currentEntry.golfEmotion === key ? 'white' : typography.colors.primary,
                      border: `2px solid ${emotion.color}`,
                      borderRadius: '20px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      ...typography.presets.body.small,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {emotion.icon} {emotion.label}
                  </button>
                ))}
              </div>

              <textarea
                placeholder={isDaryong ? "다룡아, 골프에 대한 생각을 적어봐!" : "골프와 관련된 오늘의 생각을 적어보세요"}
                value={currentEntry.golfNotes}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, golfNotes: e.target.value }))}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`,
                  background: theme.cardBg,
                  color: typography.colors.primary,
                  ...typography.presets.body.normal,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* 주식 감정 */}
            <div style={{
              background: theme.bg,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{
                ...typography.presets.heading.h4,
                color: typography.colors.primary,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📈 투자 멘탈 상태
              </h4>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {Object.entries(EMOTION_STATES.trading).map(([key, emotion]) => (
                  <button
                    key={key}
                    onClick={() => handleEmotionSelect('trading', key)}
                    style={{
                      background: currentEntry.tradingEmotion === key ? emotion.color : theme.cardBg,
                      color: currentEntry.tradingEmotion === key ? 'white' : typography.colors.primary,
                      border: `2px solid ${emotion.color}`,
                      borderRadius: '20px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      ...typography.presets.body.small,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {emotion.icon} {emotion.label}
                  </button>
                ))}
              </div>

              <textarea
                placeholder={isDaryong ? "다룡아, 투자에 대한 솔직한 감정을 털어놔!" : "투자와 관련된 오늘의 감정을 기록해보세요"}
                value={currentEntry.tradingNotes}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, tradingNotes: e.target.value }))}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`,
                  background: theme.cardBg,
                  color: typography.colors.primary,
                  ...typography.presets.body.normal,
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* 루틴 체크리스트 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* 골프 루틴 */}
            <div style={{
              background: theme.bg,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{
                ...typography.presets.heading.h4,
                color: typography.colors.primary,
                marginBottom: '16px'
              }}>
                ⛳ 골프 루틴 체크
              </h4>
              
              {DAILY_ROUTINES.golf.map((routine) => (
                <label
                  key={routine.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    marginBottom: '8px',
                    background: currentEntry.golfRoutines.includes(routine.id) ? theme.accent + '20' : theme.cardBg,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={currentEntry.golfRoutines.includes(routine.id)}
                    onChange={(e) => handleRoutineCheck('golf', routine.id, e.target.checked)}
                  />
                  <span style={{ fontSize: '20px' }}>{routine.icon}</span>
                  <span style={{
                    ...typography.presets.body.normal,
                    color: typography.colors.primary
                  }}>
                    {routine.label}
                  </span>
                </label>
              ))}
            </div>

            {/* 투자 루틴 */}
            <div style={{
              background: theme.bg,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{
                ...typography.presets.heading.h4,
                color: typography.colors.primary,
                marginBottom: '16px'
              }}>
                📊 투자 루틴 체크
              </h4>
              
              {DAILY_ROUTINES.trading.map((routine) => (
                <label
                  key={routine.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    marginBottom: '8px',
                    background: currentEntry.tradingRoutines.includes(routine.id) ? theme.accent + '20' : theme.cardBg,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={currentEntry.tradingRoutines.includes(routine.id)}
                    onChange={(e) => handleRoutineCheck('trading', routine.id, e.target.checked)}
                  />
                  <span style={{ fontSize: '20px' }}>{routine.icon}</span>
                  <span style={{
                    ...typography.presets.body.normal,
                    color: typography.colors.primary
                  }}>
                    {routine.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 멘탈 스코어 */}
          <div style={{
            background: theme.bg,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${theme.border}`
          }}>
            <h4 style={{
              ...typography.presets.heading.h4,
              color: typography.colors.primary,
              marginBottom: '16px'
            }}>
              🧠 오늘의 멘탈 스코어: {currentEntry.mentalScore}/10
            </h4>
            
            <input
              type="range"
              min="1"
              max="10"
              value={currentEntry.mentalScore}
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, mentalScore: parseInt(e.target.value) }))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: `linear-gradient(to right, #EF4444 0%, #F59E0B 50%, #10B981 100%)`,
                outline: 'none',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            />
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              ...typography.presets.body.xs,
              color: typography.colors.muted
            }}>
              <span>😰 스트레스</span>
              <span>😐 보통</span>
              <span>😊 최고컨디션</span>
            </div>
          </div>

          {/* 채쌤의 조언 */}
          {currentEntry.chaessaemAdvice && (
            <div style={{
              background: theme.gradients.success,
              borderRadius: '16px',
              padding: '24px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <ChaessaemEmoji
                  type="emotions"
                  emotion="confident"
                  size="normal"
                  showMessage={false}
                  autoAnimation={false}
                  darkMode={false}
                />
                <h4 style={{
                  ...typography.presets.heading.h4,
                  color: 'white',
                  margin: 0
                }}>
                  {isDaryong ? "채쌤의 다룡이 전용 조언" : "채쌤의 조언"}
                </h4>
              </div>
              
              <p style={{
                ...typography.presets.body.large,
                color: 'white',
                margin: 0,
                lineHeight: typography.lineHeight.relaxed
              }}>
                {currentEntry.chaessaemAdvice}
              </p>
            </div>
          )}

          {/* 저장 버튼 */}
          <div style={{ textAlign: 'center' }}>
            <EnhancedButton
              onClick={saveEntry}
              variant="primary"
              size="large"
              icon="💾"
              darkMode={darkMode}
            >
              {isDaryong ? "다룡이 일지 저장하기" : "오늘의 일지 저장하기"}
            </EnhancedButton>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <h3 style={{
            ...typography.presets.heading.h3,
            color: typography.colors.primary,
            marginBottom: '20px'
          }}>
            📚 {isDaryong ? "다룡이의 기록 히스토리" : "멘탈 관리 기록"}
          </h3>
          
          {journalEntries.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: typography.colors.muted
            }}>
              <ChaessaemEmoji
                type="emotions"
                emotion="thinking"
                size="large"
                showMessage={false}
                autoAnimation={false}
                darkMode={darkMode}
              />
              <p style={{
                ...typography.presets.body.large,
                marginTop: '16px'
              }}>
                {isDaryong ? "다룡아, 아직 기록이 없어! 첫 일지를 작성해보자!" : "아직 기록된 일지가 없어요. 첫 일지를 작성해보세요!"}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {journalEntries.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    background: theme.cardBg,
                    borderRadius: '12px',
                    padding: '16px',
                    border: `1px solid ${theme.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => {
                    setCurrentEntry(entry);
                    setActiveTab('daily');
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{
                      ...typography.presets.body.normal,
                      fontWeight: typography.fontWeight.semibold,
                      color: typography.colors.primary
                    }}>
                      {new Date(entry.date).toLocaleDateString('ko-KR')}
                    </span>
                    <span style={{
                      background: theme.accent,
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      ...typography.presets.body.xs
                    }}>
                      {entry.mentalScore}/10
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    {entry.golfEmotion && (
                      <span style={{
                        background: EMOTION_STATES.golf[entry.golfEmotion]?.color + '20',
                        color: EMOTION_STATES.golf[entry.golfEmotion]?.color,
                        padding: '4px 8px',
                        borderRadius: '12px',
                        ...typography.presets.body.xs
                      }}>
                        🏌️‍♀️ {EMOTION_STATES.golf[entry.golfEmotion]?.label}
                      </span>
                    )}
                    {entry.tradingEmotion && (
                      <span style={{
                        background: EMOTION_STATES.trading[entry.tradingEmotion]?.color + '20',
                        color: EMOTION_STATES.trading[entry.tradingEmotion]?.color,
                        padding: '4px 8px',
                        borderRadius: '12px',
                        ...typography.presets.body.xs
                      }}>
                        📈 {EMOTION_STATES.trading[entry.tradingEmotion]?.label}
                      </span>
                    )}
                  </div>
                  
                  <div style={{
                    ...typography.presets.body.small,
                    color: typography.colors.muted
                  }}>
                    루틴 완료: {entry.golfRoutines.length + entry.tradingRoutines.length}/10
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <h3 style={{
            ...typography.presets.heading.h3,
            color: typography.colors.primary,
            marginBottom: '20px'
          }}>
            📊 {isDaryong ? "다룡이의 멘탈 분석 리포트" : "멘탈 관리 분석 리포트"}
          </h3>
          
          {analytics.totalEntries === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: typography.colors.muted
            }}>
              <ChaessaemEmoji
                type="emotions"
                emotion="thinking"
                size="large"
                showMessage={false}
                autoAnimation={false}
                darkMode={darkMode}
              />
              <p style={{
                ...typography.presets.body.large,
                marginTop: '16px'
              }}>
                {isDaryong ? "다룡아, 데이터가 더 쌓이면 분석 리포트를 보여줄게!" : "더 많은 기록이 쌓이면 상세한 분석을 제공해드릴게요!"}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {/* 감정 트렌드 분석 */}
              <div style={{
                background: theme.bg,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${theme.border}`
              }}>
                <h4 style={{
                  ...typography.presets.heading.h4,
                  color: typography.colors.primary,
                  marginBottom: '16px'
                }}>
                  🎭 감정 패턴 분석
                </h4>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    ...typography.presets.body.small,
                    color: typography.colors.muted,
                    marginBottom: '8px'
                  }}>
                    골프 감정 (최근 30일)
                  </div>
                  {Object.entries(analytics.emotionTrends.golf).map(([emotion, count]) => (
                    <div key={emotion} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        ...typography.presets.body.small,
                        color: typography.colors.primary
                      }}>
                        {EMOTION_STATES.golf[emotion]?.icon} {EMOTION_STATES.golf[emotion]?.label}
                      </span>
                      <span style={{
                        ...typography.presets.body.small,
                        color: typography.colors.muted
                      }}>
                        {count}회 ({Math.round(count / analytics.totalEntries * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
                
                <div>
                  <div style={{
                    ...typography.presets.body.small,
                    color: typography.colors.muted,
                    marginBottom: '8px'
                  }}>
                    투자 감정 (최근 30일)
                  </div>
                  {Object.entries(analytics.emotionTrends.trading).map(([emotion, count]) => (
                    <div key={emotion} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        ...typography.presets.body.small,
                        color: typography.colors.primary
                      }}>
                        {EMOTION_STATES.trading[emotion]?.icon} {EMOTION_STATES.trading[emotion]?.label}
                      </span>
                      <span style={{
                        ...typography.presets.body.small,
                        color: typography.colors.muted
                      }}>
                        {count}회 ({Math.round(count / analytics.totalEntries * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 루틴 완수율 */}
              <div style={{
                background: theme.bg,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${theme.border}`
              }}>
                <h4 style={{
                  ...typography.presets.heading.h4,
                  color: typography.colors.primary,
                  marginBottom: '16px'
                }}>
                  ✅ 루틴 완수율
                </h4>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    ...typography.presets.body.small,
                    color: typography.colors.muted,
                    marginBottom: '8px'
                  }}>
                    골프 루틴
                  </div>
                  {DAILY_ROUTINES.golf.map((routine) => {
                    const count = analytics.routineCompletion.golf[routine.id] || 0;
                    const percentage = Math.round(count / analytics.totalEntries * 100);
                    return (
                      <div key={routine.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          ...typography.presets.body.small,
                          color: typography.colors.primary
                        }}>
                          {routine.icon} {routine.label}
                        </span>
                        <span style={{
                          ...typography.presets.body.small,
                          color: percentage >= 70 ? '#10B981' : percentage >= 40 ? '#F59E0B' : '#EF4444'
                        }}>
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div>
                  <div style={{
                    ...typography.presets.body.small,
                    color: typography.colors.muted,
                    marginBottom: '8px'
                  }}>
                    투자 루틴
                  </div>
                  {DAILY_ROUTINES.trading.map((routine) => {
                    const count = analytics.routineCompletion.trading[routine.id] || 0;
                    const percentage = Math.round(count / analytics.totalEntries * 100);
                    return (
                      <div key={routine.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          ...typography.presets.body.small,
                          color: typography.colors.primary
                        }}>
                          {routine.icon} {routine.label}
                        </span>
                        <span style={{
                          ...typography.presets.body.small,
                          color: percentage >= 70 ? '#10B981' : percentage >= 40 ? '#F59E0B' : '#EF4444'
                        }}>
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 채쌤의 분석 */}
              <div style={{
                background: theme.gradients.warning,
                borderRadius: '12px',
                padding: '20px',
                color: 'white',
                gridColumn: 'span 2'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <ChaessaemEmoji
                    type="emotions"
                    emotion="thinking"
                    size="normal"
                    showMessage={false}
                    autoAnimation={false}
                    darkMode={false}
                  />
                  <h4 style={{
                    ...typography.presets.heading.h4,
                    color: 'white',
                    margin: 0
                  }}>
                    채쌤의 종합 분석
                  </h4>
                </div>
                
                <p style={{
                  ...typography.presets.body.large,
                  color: 'white',
                  margin: 0,
                  lineHeight: typography.lineHeight.relaxed
                }}>
                  {isDaryong ? 
                    `다룡아! 최근 ${analytics.totalEntries}일간의 기록을 보니 정말 꾸준하게 노력하고 있어! 골프와 투자 모두에서 성장하는 모습이 보여서 정말 자랑스러워. 앞으로도 이 리듬 유지하면서 함께 성장해나가자! 💪` :
                    `최근 ${analytics.totalEntries}일간의 기록을 분석해보니 꾸준한 멘탈 관리 노력이 돋보이네요! 골프와 투자 모두에서 체계적으로 접근하고 계신 모습이 인상적입니다. 지속적인 기록과 성찰이 더 나은 결과로 이어질 거예요! ✨`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentalManagementJournal; 