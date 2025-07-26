import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import { useLocalStorage } from '../hooks/useLocalStorage';

// 가이드 단계 정의
const GUIDE_STEPS = {
  onboarding: [
    {
      id: 'welcome',
      title: '🎉 단타 트레이더에 오신 것을 환영합니다!',
      content: '주식 투자의 모든 것을 AI와 함께 학습하고 실전에 적용해보세요.',
      target: null,
      position: 'center'
    },
    {
      id: 'categories',
      title: '📂 카테고리 탐색',
      content: '왼쪽 상단의 햄버거 메뉴를 클릭하면 다양한 기능들을 확인할 수 있어요.',
      target: '[data-guide="category-button"]',
      position: 'bottom-left'
    },
    {
      id: 'keyword-discovery',
      title: '🚀 키워드 종목 발굴',
      content: '투자 아이디어를 키워드로 정리하고 관련 종목을 발굴해보세요.',
      target: '[data-guide="keyword-discovery"]',
      position: 'bottom'
    },
    {
      id: 'ai-mentor',
      title: '🤖 AI 멘토 시스템',
      content: '오른쪽 하단의 AI 멘토가 실시간으로 조언을 드려요.',
      target: '[data-guide="ai-mentor"]',
      position: 'top-left'
    }
  ],

  keywordFlow: [
    {
      id: 'brainstorming-start',
      title: '🧠 브레인스토밍 시작',
      content: 'AI 보조 질문을 통해 체계적으로 투자 아이디어를 발굴할 수 있어요.',
      target: '[data-guide="ai-prompts-toggle"]',
      position: 'bottom'
    },
    {
      id: 'keyword-input',
      title: '✍️ 키워드 입력',
      content: '관심 있는 분야나 기술을 키워드로 입력해보세요.',
      target: '[data-guide="keyword-input"]',
      position: 'top'
    },
    {
      id: 'analysis-start',
      title: '🔍 분석 시작',
      content: '키워드를 바탕으로 관련 종목들을 발굴하고 분석해보세요.',
      target: '[data-guide="start-analysis"]',
      position: 'top'
    }
  ],

  discoveryFlow: [
    {
      id: 'filters',
      title: '🎯 필터 설정',
      content: '동전주, 밈주식, 퀀트 분석 중 관심 있는 항목을 선택하세요.',
      target: '[data-guide="filter-options"]',
      position: 'right'
    },
    {
      id: 'sorting',
      title: '📊 정렬 옵션',
      content: '밈 점수, 퀀트 점수 등으로 종목을 정렬할 수 있어요.',
      target: '[data-guide="sort-options"]',
      position: 'bottom'
    },
    {
      id: 'stock-tracking',
      title: '📈 종목 추적',
      content: '관심 있는 종목은 추적 버튼을 눌러 관심종목에 추가하세요.',
      target: '[data-guide="track-button"]',
      position: 'left'
    }
  ]
};

// 툴팁 데이터
const TOOLTIPS = {
  memeScore: {
    title: '🚀 밈 점수란?',
    content: '소셜미디어 언급량, 커뮤니티 관심도, 급등 가능성을 종합한 점수예요. 높을수록 화제성이 크지만 변동성도 커요.',
    warning: '⚠️ 밈주식은 단기 투자용으로만 활용하세요!'
  },
  quantScore: {
    title: '📊 퀀트 점수란?',
    content: 'PER, PBR, ROE 등 재무지표를 종합한 점수예요. 높을수록 펀더멘털이 우수한 종목이에요.',
    tip: '💡 장기 투자에 적합한 지표입니다.'
  },
  pennyStock: {
    title: '🪙 동전주란?',
    content: '주가가 매우 낮은 주식이에요. 적은 자금으로도 많은 수량을 살 수 있지만 위험도 높아요.',
    warning: '⚠️ 전체 포트폴리오의 10% 이하로 제한하세요!'
  },
  volumeSpike: {
    title: '🔥 거래량 급증',
    content: '평소보다 거래량이 급증한 종목이에요. 큰 뉴스가 있거나 관심이 집중되고 있어요.',
    tip: '💡 거래량은 주가 움직임의 신호등 역할을 해요.'
  }
};

const InteractiveGuide = ({ 
  darkMode = false, 
  currentSection = 'general',
  showOnboarding = false,
  onComplete 
}) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [completedGuides, setCompletedGuides] = useLocalStorage('completed_guides', []);
  const [showHints, setShowHints] = useLocalStorage('show_hints', true);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(false);
  
  const overlayRef = useRef(null);
  const tooltipRef = useRef(null);

  // 현재 가이드 단계
  const currentGuide = useMemo(() => {
    if (showOnboarding && !completedGuides.includes('onboarding')) {
      return GUIDE_STEPS.onboarding;
    }
    
    switch (currentSection) {
      case 'brainstorming':
        return GUIDE_STEPS.keywordFlow;
      case 'discovery':
        return GUIDE_STEPS.discoveryFlow;
      default:
        return [];
    }
  }, [showOnboarding, currentSection, completedGuides]);

  // 가이드 시작
  const startGuide = useCallback(() => {
    if (currentGuide.length > 0) {
      setCurrentStep(0);
      setIsGuideActive(true);
    }
  }, [currentGuide]);

  // 다음 단계
  const nextStep = useCallback(() => {
    if (currentStep < currentGuide.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeGuide();
    }
  }, [currentStep, currentGuide.length]);

  // 이전 단계
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // 가이드 완료
  const completeGuide = useCallback(() => {
    setIsGuideActive(false);
    setCurrentStep(0);
    
    const guideType = showOnboarding ? 'onboarding' : currentSection;
    if (!completedGuides.includes(guideType)) {
      setCompletedGuides(prev => [...prev, guideType]);
    }
    
    onComplete?.();
  }, [showOnboarding, currentSection, completedGuides, setCompletedGuides, onComplete]);

  // 가이드 건너뛰기
  const skipGuide = useCallback(() => {
    completeGuide();
  }, [completeGuide]);

  // 타겟 요소 하이라이트
  const highlightTarget = useCallback((targetSelector) => {
    if (!targetSelector) return null;
    
    const element = document.querySelector(targetSelector);
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
  }, []);

  // 툴팁 표시
  const showTooltip = useCallback((tooltipId, event) => {
    const tooltip = TOOLTIPS[tooltipId];
    if (!tooltip) return;
    
    setActiveTooltip({ ...tooltip, id: tooltipId });
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY
    });
  }, []);

  // 툴팁 숨기기
  const hideTooltip = useCallback(() => {
    setActiveTooltip(null);
  }, []);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isGuideActive) return;
      
      switch (event.key) {
        case 'ArrowRight':
        case 'Space':
          event.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          prevStep();
          break;
        case 'Escape':
          event.preventDefault();
          skipGuide();
          break;
        case '?':
          event.preventDefault();
          setKeyboardShortcuts(!keyboardShortcuts);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGuideActive, nextStep, prevStep, skipGuide, keyboardShortcuts]);

  // 자동 가이드 시작 (첫 방문자)
  useEffect(() => {
    if (showOnboarding && !completedGuides.includes('onboarding')) {
      setTimeout(() => startGuide(), 1000);
    }
  }, [showOnboarding, completedGuides, startGuide]);

  const currentStepData = currentGuide[currentStep];
  const targetHighlight = currentStepData?.target ? highlightTarget(currentStepData.target) : null;

  return (
    <>
      {/* 가이드 오버레이 */}
      {isGuideActive && (
        <div
          ref={overlayRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 9999,
            pointerEvents: 'auto'
          }}
          onClick={(e) => {
            if (e.target === overlayRef.current) {
              skipGuide();
            }
          }}
        >
          {/* 타겟 하이라이트 */}
          {targetHighlight && (
            <div
              style={{
                position: 'absolute',
                top: targetHighlight.top - 4,
                left: targetHighlight.left - 4,
                width: targetHighlight.width + 8,
                height: targetHighlight.height + 8,
                border: `3px solid ${theme.accent}`,
                borderRadius: '8px',
                boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.7)`,
                pointerEvents: 'none',
                animation: 'pulse 2s infinite'
              }}
            />
          )}

          {/* 가이드 카드 */}
          {currentStepData && (
            <div
              style={{
                position: 'absolute',
                top: targetHighlight ? 
                  (currentStepData.position?.includes('top') ? targetHighlight.top - 280 : targetHighlight.top + targetHighlight.height + 20) :
                  '50%',
                left: targetHighlight ?
                  (currentStepData.position?.includes('left') ? targetHighlight.left - 320 : targetHighlight.left) :
                  '50%',
                transform: !targetHighlight ? 'translate(-50%, -50%)' : 'none',
                width: '300px',
                background: theme.cardBg,
                borderRadius: '12px',
                border: `2px solid ${theme.accent}`,
                boxShadow: theme.shadows.xl,
                padding: '20px',
                fontFamily: typography.fontFamily.primary
              }}
            >
              {/* 헤더 */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  ...typography.presets.heading.h4,
                  color: typography.colors.primary,
                  margin: '0 0 8px 0'
                }}>
                  {currentStepData.title}
                </h3>
                <div style={{
                  ...typography.presets.caption,
                  color: typography.colors.muted
                }}>
                  단계 {currentStep + 1} / {currentGuide.length}
                </div>
              </div>

              {/* 내용 */}
              <div style={{
                ...typography.presets.body.normal,
                color: typography.colors.secondary,
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: '20px'
              }}>
                {currentStepData.content}
              </div>

              {/* 진행도 바 */}
              <div style={{
                width: '100%',
                height: '4px',
                background: theme.border,
                borderRadius: '2px',
                marginBottom: '16px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${((currentStep + 1) / currentGuide.length) * 100}%`,
                  height: '100%',
                  background: theme.gradients.success,
                  transition: 'width 0.3s ease'
                }} />
              </div>

              {/* 버튼 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <button
                  onClick={skipGuide}
                  style={{
                    ...typography.presets.button.small,
                    background: 'transparent',
                    color: typography.colors.muted,
                    border: `1px solid ${theme.border}`,
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  건너뛰기
                </button>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      style={{
                        ...typography.presets.button.small,
                        background: theme.accent,
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      이전
                    </button>
                  )}
                  
                  <button
                    onClick={nextStep}
                    style={{
                      ...typography.presets.button.small,
                      background: theme.positive,
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {currentStep === currentGuide.length - 1 ? '완료' : '다음'}
                  </button>
                </div>
              </div>

              {/* 키보드 단축키 힌트 */}
              <div style={{
                ...typography.presets.caption,
                color: typography.colors.muted,
                textAlign: 'center',
                marginTop: '12px',
                borderTop: `1px solid ${theme.border}`,
                paddingTop: '12px'
              }}>
                💡 단축키: ← → 이동 | Space 다음 | Esc 종료 | ? 도움말
              </div>
            </div>
          )}
        </div>
      )}

      {/* 툴팁 */}
      {activeTooltip && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: tooltipPosition.y - 10,
            left: tooltipPosition.x + 10,
            width: '280px',
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            boxShadow: theme.shadows.md,
            padding: '12px',
            zIndex: 10000,
            fontFamily: typography.fontFamily.primary,
            pointerEvents: 'none'
          }}
        >
          <h4 style={{
            ...typography.presets.heading.h4,
            color: typography.colors.primary,
            margin: '0 0 8px 0'
          }}>
            {activeTooltip.title}
          </h4>
          
          <div style={{
            ...typography.presets.body.small,
            color: typography.colors.secondary,
            lineHeight: typography.lineHeight.normal,
            marginBottom: activeTooltip.warning || activeTooltip.tip ? '8px' : '0'
          }}>
            {activeTooltip.content}
          </div>

          {activeTooltip.warning && (
            <div style={{
              ...typography.presets.body.xs,
              color: typography.colors.error,
              background: `${theme.negative}20`,
              padding: '6px 8px',
              borderRadius: '4px',
              marginBottom: activeTooltip.tip ? '8px' : '0'
            }}>
              {activeTooltip.warning}
            </div>
          )}

          {activeTooltip.tip && (
            <div style={{
              ...typography.presets.body.xs,
              color: typography.colors.info,
              background: `${theme.accent}20`,
              padding: '6px 8px',
              borderRadius: '4px'
            }}>
              {activeTooltip.tip}
            </div>
          )}
        </div>
      )}

      {/* 가이드 시작 버튼 (플로팅) */}
      {!isGuideActive && currentGuide.length > 0 && !completedGuides.includes(currentSection) && (
        <button
          onClick={startGuide}
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            background: theme.gradients.purple,
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            cursor: 'pointer',
            boxShadow: theme.shadows.lg,
            fontSize: '24px',
            zIndex: 1000,
            animation: 'bounce 2s infinite'
          }}
          title="가이드 시작"
        >
          🎯
        </button>
      )}

      {/* 힌트 토글 버튼 */}
      <button
        onClick={() => setShowHints(!showHints)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: showHints ? theme.positive : theme.border,
          color: showHints ? 'white' : theme.text,
          border: 'none',
          borderRadius: '20px',
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 1000
        }}
      >
        {showHints ? '💡 힌트 ON' : '💡 힌트 OFF'}
      </button>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
};

// 툴팁을 쉽게 사용할 수 있는 HOC
export const withTooltip = (WrappedComponent) => {
  return function WithTooltipComponent(props) {
    const [showTooltip, setShowTooltip] = useState(false);
    
    return (
      <div
        onMouseEnter={(e) => {
          if (props.tooltip) {
            // 툴팁 표시 로직
            setShowTooltip(true);
          }
        }}
        onMouseLeave={() => setShowTooltip(false)}
        data-guide={props['data-guide']}
      >
        <WrappedComponent {...props} />
      </div>
    );
  };
};

export { TOOLTIPS };
export default InteractiveGuide; 