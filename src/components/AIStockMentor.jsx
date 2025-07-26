import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ChaessaemCharacter from './ChaessaemCharacter';

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
      },
      {
        title: "🔍 시장 트렌드 읽기",
        content: "시장은 항상 변화하고 있어요. 지금 핫한 키워드가 내년에도 핫할까요? 의외로 그렇지 않은 경우가 많답니다. 트렌드를 따라가되, 맹신하지는 마세요.",
        tip: "📈 실전 노하우: 트렌드가 정점에 달했을 때는 오히려 조심해야 할 시기입니다. 모든 사람이 알고 있는 호재는 이미 주가에 반영되어 있어요.",
        level: "advanced"
      }
    ],
    intermediate: [
      {
        title: "🔍 키워드 간 연관성 분석",
        content: "여러 키워드를 조합하신 걸 보니 투자 센스가 있으시네요! '우크라이나 + 국방 + 드론'처럼 연관된 키워드들은 시너지 효과를 만들어냅니다.",
        tip: "📈 전문가 관점: 글로벌 이슈와 기술 발전이 만나는 지점을 찾으세요. 2022년 우크라이나 사태로 방산주가 급등한 것처럼 말이죠.",
        level: "intermediate"
      },
      {
        title: "💰 섹터 로테이션의 비밀",
        content: "섹터별로 돌아가며 주목받는 것을 '섹터 로테이션'이라고 해요. 지금 IT가 핫하다면, 다음엔 바이오나 에너지가 주목받을 수 있어요.",
        tip: "🔄 고수 전략: 한 섹터가 과열되면 다른 섹터로 눈을 돌려보세요. 항상 다음을 준비하는 투자자가 승리합니다.",
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
      },
      {
        title: "🏢 기업 분석의 기초",
        content: "좋은 기업을 찾는 것이 투자의 시작이에요. 매출이 꾸준히 증가하고, 부채가 적고, 시장에서 경쟁력이 있는 기업을 찾아보세요.",
        tip: "📊 분석 팁: 최소 3년간의 재무제표를 살펴보세요. 일회성 호재보다는 꾸준한 성장이 중요합니다.",
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
    tip: "🎯 시작 가이드: 투자는 공부가 90%, 실전이 10%입니다. 서두르지 마시고 차근차근 배워나가세요!",
    level: "beginner"
  },
  profileComplete: {
    title: "✨ 프로필 설정 완료!",
    content: "프로필 설정을 완료하셨네요! 이제 본격적으로 투자 공부를 시작해볼까요? 여러분의 투자 성향에 맞는 맞춤형 조언을 준비했어요.",
    tip: "🎊 다음 단계: 키워드 브레인스토밍부터 시작해서 천천히 모든 기능을 체험해보세요!",
    level: "beginner"
  }
};

const AIStockMentor = ({
  darkMode = false,
  currentSection = 'brainstorming',
  userLevel = 'beginner',
  keywords = [],
  selectedStock = '',
  isFirstVisit = false,
  userProfile = {},
  onClose,
  isVisible = true
}) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  
  // 상태 관리
  const [currentAdviceIndex, setCurrentAdviceIndex] = useState(0);
  const [userProgress, setUserProgress] = useLocalStorage('user_progress', {
    overall: 0,
    brainstorming: 0,
    discovery: 0,
    emotional: 0,
    completed: false
  });
  const [completedTips, setCompletedTips] = useLocalStorage('completed_tips', []);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // 현재 조언 가져오기
  const getCurrentAdviceList = useCallback(() => {
    if (isFirstVisit && !userProfile.name) {
      return [CONTEXTUAL_GUIDES.firstVisit];
    }
    
    if (userProfile.name && userProgress.overall === 0) {
      return [CONTEXTUAL_GUIDES.profileComplete];
    }
    
    const sectionAdvice = MENTOR_ADVICE[currentSection]?.[userLevel] || [];
    if (sectionAdvice.length === 0) {
      return MENTOR_ADVICE.general;
    }
    return sectionAdvice;
  }, [currentSection, userLevel, isFirstVisit, userProfile, userProgress.overall]);

  const currentAdviceList = getCurrentAdviceList();
  const currentAdvice = currentAdviceList[currentAdviceIndex] || currentAdviceList[0];

  // 진도율 업데이트
  const updateProgress = useCallback((section, increment = 15) => {
    setUserProgress(prev => {
      const newSectionProgress = Math.min(100, (prev[section] || 0) + increment);
      const newOverallProgress = Math.min(100, prev.overall + increment);
      
      const updated = {
        ...prev,
        [section]: newSectionProgress,
        overall: newOverallProgress,
        completed: newOverallProgress >= 100
      };
      
      return updated;
    });
  }, [setUserProgress]);

  // 다음 팁으로 자동 이동
  const moveToNextTip = useCallback(() => {
    const tipId = `${currentSection}-${currentAdviceIndex}`;
    if (!completedTips.includes(tipId)) {
      setCompletedTips(prev => [...prev, tipId]);
    }
    
    updateProgress(currentSection, 15);
    
    // 0.5초 후 다음 팁으로 이동
    setTimeout(() => {
      if (currentAdviceIndex < currentAdviceList.length - 1) {
        setCurrentAdviceIndex(prev => prev + 1);
      } else {
        // 현재 섹션의 모든 팁 완료 시 다음 섹션으로
        const sections = ['brainstorming', 'discovery', 'emotional'];
        const currentSectionIndex = sections.indexOf(currentSection);
        
        if (currentSectionIndex < sections.length - 1) {
          // 다음 섹션으로 이동 (실제로는 부모 컴포넌트에서 처리)
          setCurrentAdviceIndex(0);
        } else {
          // 모든 섹션 완료 시 자동 닫기
          setTimeout(() => {
            if (onClose) onClose();
          }, 1000);
        }
      }
    }, 500);
  }, [currentSection, currentAdviceIndex, currentAdviceList.length, completedTips, setCompletedTips, updateProgress, onClose]);

  // 진도율 100% 달성 시 자동 닫기
  useEffect(() => {
    if (userProgress.completed && userProgress.overall >= 100) {
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    }
  }, [userProgress.completed, userProgress.overall, onClose]);

  // 닫기 확인 다이얼로그
  const handleCloseClick = () => {
    if (userProgress.overall < 100) {
      setShowCloseConfirm(true);
    } else {
      if (onClose) onClose();
    }
  };

  // 컴포넌트가 보이지 않으면 렌더링하지 않음
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: theme.colors.surface,
        borderRadius: '16px',
        boxShadow: theme.shadows.xl,
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 헤더 */}
        <div style={{
          background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`,
          color: 'white',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ChaessaemCharacter 
              size="small" 
              darkMode={true}
              showMessage={false}
            />
            <div>
              <h3 style={{
                ...typography.presets.heading.h3,
                color: 'white',
                margin: '0 0 4px 0'
              }}>
                📚 채쌤과 함께하는 투자 공부
              </h3>
              <div style={{
                fontSize: '14px',
                opacity: 0.9
              }}>
                진도율: {Math.round(userProgress.overall)}% | 
                팁 {currentAdviceIndex + 1}/{currentAdviceList.length}
              </div>
            </div>
          </div>
          
          {/* 닫기 버튼 */}
          <button
            onClick={handleCloseClick}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* 진도바 */}
        <div style={{
          background: `${theme.colors.accent}20`,
          height: '6px',
          position: 'relative'
        }}>
          <div style={{
            background: `linear-gradient(90deg, ${theme.colors.accent}, ${theme.colors.positive})`,
            height: '100%',
            width: `${userProgress.overall}%`,
            transition: 'width 0.5s ease',
            borderRadius: '0 3px 3px 0'
          }} />
        </div>

        {/* 메인 콘텐츠 */}
        <div style={{
          padding: '24px',
          flex: 1,
          overflow: 'auto'
        }}>
          {/* 조언 제목 */}
          <h4 style={{
            ...typography.presets.heading.h4,
            color: typography.colors.primary,
            marginBottom: '16px'
          }}>
            {currentAdvice.title}
          </h4>

          {/* 조언 내용 */}
          <div style={{
            ...typography.presets.body.normal,
            color: typography.colors.primary,
            lineHeight: 1.6,
            marginBottom: '20px',
            background: `${theme.colors.accent}10`,
            padding: '16px',
            borderRadius: '12px',
            borderLeft: `4px solid ${theme.colors.accent}`
          }}>
            {currentAdvice.content}
          </div>

          {/* 팁 */}
          <div style={{
            background: `${theme.colors.positive}15`,
            padding: '16px',
            borderRadius: '12px',
            borderLeft: `4px solid ${theme.colors.positive}`,
            marginBottom: '24px'
          }}>
            <div style={{
              ...typography.presets.body.small,
              color: typography.colors.primary,
              fontWeight: typography.fontWeight.medium
            }}>
              {currentAdvice.tip}
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div style={{
          padding: '20px',
          borderTop: `1px solid ${theme.colors.border}`,
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={moveToNextTip}
            style={{
              ...typography.presets.button.normal,
              background: `linear-gradient(135deg, ${theme.colors.positive}, ${theme.colors.accent})`,
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              flex: 2,
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            ✨ 도움이 되었습니다!
          </button>
          
          <button
            onClick={() => setCurrentAdviceIndex((currentAdviceIndex + 1) % currentAdviceList.length)}
            style={{
              ...typography.presets.button.normal,
              background: 'transparent',
              color: theme.colors.accent,
              border: `2px solid ${theme.colors.accent}`,
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            🔄 다른 팁
          </button>
          
          <button
            onClick={handleCloseClick}
            style={{
              ...typography.presets.button.normal,
              background: 'transparent',
              color: theme.colors.warning,
              border: `2px solid ${theme.colors.warning}`,
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            ⏸️ 나중에
          </button>
        </div>
      </div>

      {/* 닫기 확인 다이얼로그 */}
      {showCloseConfirm && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: theme.colors.surface,
          borderRadius: '12px',
          padding: '24px',
          boxShadow: theme.shadows.xl,
          textAlign: 'center',
          minWidth: '300px'
        }}>
          <h4 style={{
            ...typography.presets.heading.h4,
            color: typography.colors.primary,
            marginBottom: '16px'
          }}>
            정말 나가시겠어요?
          </h4>
          <p style={{
            ...typography.presets.body.normal,
            color: typography.colors.muted,
            marginBottom: '20px'
          }}>
            현재 진도율: {Math.round(userProgress.overall)}%<br/>
            지금 나가시면 진도가 저장됩니다.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setShowCloseConfirm(false);
                if (onClose) onClose();
              }}
              style={{
                background: theme.colors.warning,
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              나가기
            </button>
            <button
              onClick={() => setShowCloseConfirm(false)}
              style={{
                background: theme.colors.accent,
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              계속 공부하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIStockMentor; 