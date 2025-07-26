import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import { useLocalStorage } from '../hooks/useLocalStorage';

// 멘토의 조언 데이터베이스
const MENTOR_ADVICE = {
  // 키워드 브레인스토밍 단계
  brainstorming: {
    beginner: [
      {
        title: "💡 투자 아이디어의 시작점",
        content: "좋아요! 투자는 항상 '왜?'라는 질문에서 시작됩니다. 지금 이 키워드들이 떠오른 이유가 있을 거예요. 예를 들어 뉴스에서 봤거나, 일상에서 느낀 변화 때문이겠죠?",
        tip: "💎 고수 팁: 투자 아이디어는 일상에서 나옵니다. 커피숍에서 사람들이 무슨 앱을 쓰는지, 어떤 브랜드를 선호하는지 관찰해보세요.",
        level: "beginner"
      },
      {
        title: "🎯 키워드의 힘",
        content: "AI나 드론 같은 키워드를 선택하셨네요! 이런 기술 분야는 정말 유망하지만, 한 가지 주의할 점이 있어요. '테마 투자'는 단기간에 큰 수익을 낼 수 있지만 변동성도 크답니다.",
        tip: "⚠️ 현실 조언: 테마주 투자 시 투자금의 20% 이하로 시작하세요. 나머지는 안정적인 우량주에 투자하는 게 좋습니다.",
        level: "intermediate"
      }
    ],
    intermediate: [
      {
        title: "🔍 키워드 간 연관성 분석",
        content: "여러 키워드를 조합하신 걸 보니 투자 센스가 있으시네요! '우크라이나 + 국방 + 드론'처럼 연관된 키워드들은 시너지 효과를 만들어냅니다.",
        tip: "📈 전문가 관점: 글로벌 이슈와 기술 발전이 만나는 지점을 찾으세요. 2022년 우크라이나 사태로 방산주가 급등한 것처럼 말이죠.",
        level: "intermediate"
      }
    ]
  },

  // 종목 발굴 단계
  discovery: {
    beginner: [
      {
        title: "🪙 동전주의 진실",
        content: "동전주에 관심이 있으시군요! 저도 20년 전 동전주로 시작했어요. 하지만 '싸다'는 이유만으로 투자하면 위험해요. 싼 이유가 있거든요.",
        tip: "💰 현실 조언: 동전주는 전체 포트폴리오의 10% 이하로 제한하세요. 대신 왜 이 주식이 싼지 철저히 분석해야 합니다.",
        level: "beginner"
      },
      {
        title: "🚀 밈주식의 양면성",
        content: "밈주식도 고려하고 계시는군요! 2021년 게임스탑 사태를 기억하시나요? 밈주식은 단기간에 10배도 오르지만, 하루 만에 90% 떨어지기도 해요.",
        tip: "⚡ 생생한 경험담: 제가 본 최고의 밈주식 투자자는 수익의 50%를 항상 현금화했어요. 욕심을 버리는 게 핵심입니다.",
        level: "beginner"
      }
    ],
    intermediate: [
      {
        title: "📊 퀀트 분석의 마법",
        content: "퀀트 점수를 보고 계시네요! 좋은 접근이에요. PER, PBR 같은 지표들이 낮다고 무조건 좋은 건 아니에요. 업종별로 기준이 다르거든요.",
        tip: "🧮 전문가 노하우: 같은 업종 내에서 비교하세요. IT업종의 PER 30은 정상이지만, 유틸리티 업종에서는 과대평가일 수 있어요.",
        level: "intermediate"
      }
    ]
  },

  // 감정 기록 단계
  emotional: {
    beginner: [
      {
        title: "😱 감정이 최대의 적",
        content: "감정을 기록하시는 걸 보니 정말 현명하시네요! 제가 25년간 투자하면서 깨달은 건, 감정이 최대의 적이라는 거예요. 특히 욕심과 공포 말이죠.",
        tip: "🧘 마음가짐: 매수 전에 '이 돈을 잃어도 괜찮나?'를 자문해보세요. 대답이 'NO'라면 투자 금액을 줄이세요.",
        level: "beginner"
      },
      {
        title: "📝 기록의 힘",
        content: "매매 이유를 적으시는군요! 정말 훌륭해요. 저도 초보 시절 이런 기록 덕분에 같은 실수를 반복하지 않을 수 있었어요.",
        tip: "📚 성장 비결: 3개월 후 이 기록을 다시 읽어보세요. 당시 확신했던 이유가 얼마나 감정적이었는지 깨달을 거예요.",
        level: "beginner"
      }
    ]
  },

  // 일반적인 조언
  general: [
    {
      title: "🏆 성공하는 투자자의 습관",
      content: "25년 투자 경험으로 말씀드리면, 성공하는 투자자들은 모두 이 3가지를 지켜요: 1) 분산투자 2) 장기투자 3) 감정 통제",
      tip: "🎯 핵심 원칙: '달걀을 한 바구니에 담지 마라', '시간은 복리의 친구다', '시장이 아니라 자신과 싸워라'",
      level: "universal"
    },
    {
      title: "💎 워렌 버핏의 지혜",
      content: "워렌 버핏이 한 말이 있어요. '다른 사람이 욕심낼 때 두려워하고, 다른 사람이 두려워할 때 욕심내라.' 지금이 바로 그런 관점으로 시장을 봐야 할 때예요.",
      tip: "🧠 현명한 사고: 뉴스가 온통 호재 일색일 때는 조심하고, 모든 게 암울해 보일 때 기회를 찾으세요.",
      level: "universal"
    }
  ]
};

// 상황별 가이드 데이터
const CONTEXTUAL_GUIDES = {
  firstVisit: {
    title: "🎉 투자의 세계에 오신 것을 환영합니다!",
    content: "안녕하세요! 저는 25년 경력의 주식 전문가입니다. 여러분의 투자 여정을 도와드릴게요. 먼저 '🚀 키워드 종목 발굴'부터 시작해보시는 걸 추천해요.",
    steps: [
      "1️⃣ 관심 있는 분야의 키워드를 생각해보세요",
      "2️⃣ AI 보조 질문으로 체계적으로 접근하세요", 
      "3️⃣ 발굴된 종목들을 차근차근 분석해보세요",
      "4️⃣ 감정과 함께 매매 이유를 기록하세요"
    ]
  },
  
  keywordEmpty: {
    title: "🤔 어떤 키워드를 선택할지 고민되시나요?",
    content: "괜찮아요! 처음엔 누구나 그래요. 일상에서 자주 보거나 들은 것부터 시작해보세요.",
    suggestions: [
      "📱 스마트폰 관련: 'AI', '반도체', '배터리'",
      "🌍 사회 이슈: '친환경', '고령화', '우크라이나'",
      "🎮 취미 관련: '게임', '메타버스', 'VR'",
      "🏭 산업 동향: '전기차', '우주항공', '바이오'"
    ]
  },

  memeStockWarning: {
    title: "⚠️ 밈주식 투자 전에 꼭 알아두세요!",
    content: "밈주식은 소셜미디어 인기로 급등하는 주식이에요. 큰 수익도 가능하지만 그만큼 위험해요.",
    warnings: [
      "🎢 극심한 변동성: 하루에 50% 오르락내리락",
      "📉 펀더멘털 무시: 실제 가치와 괴리",
      "🕐 단기성: 인기가 사라지면 급락",
      "💰 소액 투자: 전체 자산의 5% 이하 권장"
    ]
  }
};

const AIStockMentor = ({ 
  darkMode = false, 
  currentSection = 'general',
  userLevel = 'beginner',
  keywords = [],
  selectedStock = null,
  isFirstVisit = false 
}) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  const [currentAdvice, setCurrentAdvice] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [mentorPersonality, setMentorPersonality] = useLocalStorage('mentor_personality', 'wise');
  const [userProgress, setUserProgress] = useLocalStorage('user_progress', {
    brainstorming: 0,
    discovery: 0,
    emotional: 0,
    overall: 0
  });

  // 멘토 성격별 스타일
  const mentorStyles = {
    wise: {
      name: "현명한 노인",
      avatar: "👴",
      tone: "차분하고 경험 중심",
      greeting: "25년 투자 경험을 바탕으로"
    },
    friendly: {
      name: "친근한 선배",
      avatar: "😊",
      tone: "친근하고 격려적",
      greeting: "함께 투자 공부해요!"
    },
    analytical: {
      name: "분석적 전문가",
      avatar: "🤓",
      tone: "논리적이고 데이터 중심",
      greeting: "데이터로 말하는"
    }
  };

  const currentMentor = mentorStyles[mentorPersonality];

  // 상황별 조언 선택 로직
  const getContextualAdvice = useCallback(() => {
    // 첫 방문자 가이드
    if (isFirstVisit) {
      return CONTEXTUAL_GUIDES.firstVisit;
    }

    // 키워드가 비어있을 때
    if (currentSection === 'brainstorming' && keywords.length === 0) {
      return CONTEXTUAL_GUIDES.keywordEmpty;
    }

    // 밈주식 관련 경고
    if (currentSection === 'discovery' && keywords.some(k => 
      ['밈', 'meme', '레딧', '급등'].some(meme => k.toLowerCase().includes(meme.toLowerCase()))
    )) {
      return CONTEXTUAL_GUIDES.memeStockWarning;
    }

    // 섹션별 조언
    const sectionAdvice = MENTOR_ADVICE[currentSection];
    if (sectionAdvice && sectionAdvice[userLevel]) {
      const adviceList = sectionAdvice[userLevel];
      return adviceList[Math.floor(Math.random() * adviceList.length)];
    }

    // 일반적인 조언
    const generalAdvice = MENTOR_ADVICE.general;
    return generalAdvice[Math.floor(Math.random() * generalAdvice.length)];
  }, [currentSection, userLevel, keywords, isFirstVisit]);

  // 조언 업데이트
  useEffect(() => {
    const advice = getContextualAdvice();
    setCurrentAdvice(advice);
  }, [getContextualAdvice]);

  // 사용자 진행도 업데이트
  const updateProgress = useCallback((section, increment = 10) => {
    setUserProgress(prev => ({
      ...prev,
      [section]: Math.min(100, prev[section] + increment),
      overall: Math.min(100, prev.overall + increment / 4)
    }));
  }, [setUserProgress]);

  // 멘토 성격 변경
  const changeMentorPersonality = useCallback((personality) => {
    setMentorPersonality(personality);
  }, [setMentorPersonality]);

  if (!currentAdvice) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '380px',
      maxHeight: '500px',
      background: theme.cardBg,
      borderRadius: '16px',
      border: `2px solid ${theme.accent}`,
      boxShadow: theme.shadows.xl,
      overflow: 'hidden',
      zIndex: 1000,
      fontFamily: typography.fontFamily.primary
    }}>
      {/* 멘토 헤더 */}
      <div style={{
        background: theme.gradients.ocean,
        padding: '16px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '32px' }}>{currentMentor.avatar}</div>
          <div>
            <div style={{ 
              ...typography.presets.body.small,
              fontWeight: typography.fontWeight.bold,
              marginBottom: '2px'
            }}>
              AI 투자 멘토
            </div>
            <div style={{ 
              ...typography.presets.caption,
              color: 'rgba(255,255,255,0.8)'
            }}>
              {currentMentor.greeting}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* 멘토 성격 변경 버튼 */}
          <select
            value={mentorPersonality}
            onChange={(e) => changeMentorPersonality(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '12px'
            }}
          >
            <option value="wise" style={{ color: '#333' }}>현명한 노인</option>
            <option value="friendly" style={{ color: '#333' }}>친근한 선배</option>
            <option value="analytical" style={{ color: '#333' }}>분석적 전문가</option>
          </select>
          
          <button
            onClick={() => setShowGuide(!showGuide)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {showGuide ? '✕' : '?'}
          </button>
        </div>
      </div>

      {/* 진행도 표시 */}
      <div style={{
        background: theme.bg,
        padding: '12px 16px',
        borderBottom: `1px solid ${theme.border}`
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ 
            ...typography.presets.label,
            color: typography.colors.secondary
          }}>
            투자 학습 진도
          </span>
          <span style={{ 
            ...typography.presets.body.small,
            color: typography.colors.accent,
            fontWeight: typography.fontWeight.semibold
          }}>
            {Math.round(userProgress.overall)}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          background: theme.border,
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${userProgress.overall}%`,
            height: '100%',
            background: theme.gradients.success,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* 조언 내용 */}
      <div style={{
        padding: '20px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        {/* 제목 */}
        <h3 style={{
          ...typography.presets.heading.h4,
          color: typography.colors.primary,
          margin: '0 0 12px 0'
        }}>
          {currentAdvice.title}
        </h3>

        {/* 내용 */}
        <div style={{
          ...typography.presets.body.normal,
          color: typography.colors.secondary,
          lineHeight: typography.lineHeight.relaxed,
          marginBottom: '16px'
        }}>
          {currentAdvice.content}
        </div>

        {/* 팁 */}
        {currentAdvice.tip && (
          <div style={{
            background: theme.gradients.warning,
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{
              ...typography.presets.body.small,
              color: 'white',
              lineHeight: typography.lineHeight.normal
            }}>
              {currentAdvice.tip}
            </div>
          </div>
        )}

        {/* 단계별 가이드 */}
        {currentAdvice.steps && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{
              ...typography.presets.heading.h4,
              color: typography.colors.primary,
              marginBottom: '8px'
            }}>
              📋 단계별 가이드
            </h4>
            {currentAdvice.steps.map((step, index) => (
              <div
                key={index}
                style={{
                  ...typography.presets.body.small,
                  color: typography.colors.secondary,
                  marginBottom: '6px',
                  paddingLeft: '8px'
                }}
              >
                {step}
              </div>
            ))}
          </div>
        )}

        {/* 제안사항 */}
        {currentAdvice.suggestions && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{
              ...typography.presets.heading.h4,
              color: typography.colors.primary,
              marginBottom: '8px'
            }}>
              💡 추천 키워드
            </h4>
            {currentAdvice.suggestions.map((suggestion, index) => (
              <div
                key={index}
                style={{
                  ...typography.presets.body.small,
                  color: typography.colors.secondary,
                  marginBottom: '4px',
                  paddingLeft: '8px'
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}

        {/* 경고사항 */}
        {currentAdvice.warnings && (
          <div style={{
            background: theme.gradients.danger,
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <h4 style={{
              ...typography.presets.heading.h4,
              color: 'white',
              marginBottom: '8px'
            }}>
              ⚠️ 주의사항
            </h4>
            {currentAdvice.warnings.map((warning, index) => (
              <div
                key={index}
                style={{
                  ...typography.presets.body.small,
                  color: 'white',
                  marginBottom: '4px',
                  paddingLeft: '8px'
                }}
              >
                {warning}
              </div>
            ))}
          </div>
        )}

        {/* 액션 버튼 */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={() => updateProgress(currentSection, 5)}
            style={{
              ...typography.presets.button.small,
              background: theme.positive,
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            💡 도움됐어요
          </button>
          <button
            onClick={() => setCurrentAdvice(getContextualAdvice())}
            style={{
              ...typography.presets.button.small,
              background: theme.accent,
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            🔄 다른 조언
          </button>
        </div>
      </div>

      {/* 하단 정보 */}
      <div style={{
        background: theme.cardBg,
        padding: '12px 16px',
        borderTop: `1px solid ${theme.border}`,
        textAlign: 'center'
      }}>
        <div style={{
          ...typography.presets.caption,
          color: typography.colors.muted
        }}>
          🎯 현재 단계: {currentSection} | 👤 레벨: {userLevel}
        </div>
      </div>
    </div>
  );
};

export default AIStockMentor; 