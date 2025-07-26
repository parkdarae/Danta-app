import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';

// 채쌤 이모티콘 데이터 (64종 중 얼굴 표현 가능한 것들)
const CHAESSAEM_EMOJIS = {
  // 기본 감정 표현
  emotions: {
    happy: {
      face: "😊",
      description: "기쁨",
      message: "좋은 투자 결과네요!",
      animation: "bounce"
    },
    excited: {
      face: "🤩",
      description: "흥분",
      message: "대박! 이 종목 괜찮은데요?",
      animation: "wobble"
    },
    thinking: {
      face: "🤔",
      description: "생각중",
      message: "음... 한번 분석해볼게요.",
      animation: "pulse"
    },
    worried: {
      face: "😰",
      description: "걱정",
      message: "이 종목 좀 위험할 수 있어요.",
      animation: "shake"
    },
    surprised: {
      face: "😲",
      description: "놀람",
      message: "어? 이런 결과가!",
      animation: "jump"
    },
    confident: {
      face: "😎",
      description: "자신감",
      message: "이거 제가 추천한 종목이에요!",
      animation: "slide"
    },
    sleepy: {
      face: "😴",
      description: "졸림",
      message: "시장이 좀 조용하네요...",
      animation: "sway"
    },
    love: {
      face: "😍",
      description: "사랑",
      message: "이 종목 정말 좋아요!",
      animation: "heartbeat"
    }
  },

  // 투자 관련 특수 표현
  trading: {
    analyzing: {
      face: "🧐",
      description: "분석중",
      message: "데이터를 꼼꼼히 분석하고 있어요!",
      animation: "rotate"
    },
    celebrating: {
      face: "🎉",
      description: "축하",
      message: "수익률 달성! 축하드려요!",
      animation: "confetti"
    },
    warning: {
      face: "⚠️",
      description: "경고",
      message: "위험 신호가 감지됐어요!",
      animation: "alert"
    },
    thumbsup: {
      face: "👍",
      description: "추천",
      message: "이 전략 추천해요!",
      animation: "approve"
    },
    money: {
      face: "💰",
      description: "수익",
      message: "수익이 쌓이고 있어요!",
      animation: "coin"
    },
    rocket: {
      face: "🚀",
      description: "급등",
      message: "이 종목 상승세네요!",
      animation: "launch"
    }
  },

  // 로딩 애니메이션 (3가지 타입)
  loading: {
    working: {
      face: "💼",
      description: "열심히 일하는 중",
      message: "열심히 분석하고 있어요! 잠시만 기다려주세요.",
      animation: "work"
    },
    tip: {
      face: "💡",
      description: "꿀팁 제공",
      message: "분석하는 동안 투자 꿀팁을 알려드릴게요!",
      animation: "tip"
    },
    running: {
      face: "🏃‍♀️",
      description: "목적지 향해 달리기",
      message: "최고의 결과를 위해 달려가고 있어요!",
      animation: "run"
    }
  }
};

// 채쌤 로딩 팁 데이터
const LOADING_TIPS = [
  "💡 분산투자는 기본! 달걀을 한 바구니에 담지 마세요!",
  "💡 감정적 투자는 금물! 차트보다 마음을 먼저 읽어보세요!",
  "💡 장기투자가 답! 시간은 복리의 친구랍니다!",
  "💡 손절 타이밍이 중요해요! 고집은 투자의 적이에요!",
  "💡 뉴스에 휘둘리지 마세요! 팩트를 확인하는 습관을!",
  "💡 투자 일기 쓰는 습관! 과거의 나에게서 배우세요!",
  "💡 시장은 감정이 아닌 데이터로! 채쌤이 도와드릴게요!",
  "💡 작은 수익도 소중해요! 천 리 길도 한 걸음부터!"
];

const ChaessaemEmoji = ({ 
  type = 'emotions', 
  emotion = 'happy', 
  size = 'normal', 
  showMessage = false,
  autoAnimation = true,
  onClick,
  darkMode = false,
  style = {},
  className = '',
  loadingTips = false,
  children
}) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  
  const [currentTip, setCurrentTip] = useState(0);
  const [animationState, setAnimationState] = useState('idle');
  const [isAnimating, setIsAnimating] = useState(false);

  // 크기 설정
  const sizes = {
    small: { width: '32px', height: '32px', fontSize: '16px' },
    normal: { width: '48px', height: '48px', fontSize: '24px' },
    large: { width: '64px', height: '64px', fontSize: '32px' },
    huge: { width: '96px', height: '96px', fontSize: '48px' }
  };

  const sizeStyle = sizes[size] || sizes.normal;
  
  // 이모티콘 데이터 가져오기
  const emojiData = useMemo(() => {
    return CHAESSAEM_EMOJIS[type]?.[emotion] || CHAESSAEM_EMOJIS.emotions.happy;
  }, [type, emotion]);

  // 로딩 팁 로테이션
  useEffect(() => {
    if (loadingTips && type === 'loading') {
      const interval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % LOADING_TIPS.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loadingTips, type]);

  // 자동 애니메이션
  useEffect(() => {
    if (autoAnimation) {
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [autoAnimation, emotion]);

  // 채쌤 캐릭터 SVG (기본 얼굴)
  const ChaessaemFace = ({ expression = 'happy' }) => (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* 채쌤 모자 */}
      <div style={{
        width: '80%',
        height: '25%',
        background: 'linear-gradient(135deg, #c44536 0%, #8b2e1f 100%)',
        borderRadius: '50% 50% 0 0',
        position: 'relative',
        border: '1px solid #6b1f14'
      }}>
        {/* 모자 버튼 */}
        <div style={{
          position: 'absolute',
          top: '2px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '6px',
          height: '4px',
          background: '#333',
          borderRadius: '2px'
        }} />
      </div>

      {/* 채쌤 얼굴 */}
      <div style={{
        width: '70%',
        height: '50%',
        background: 'linear-gradient(135deg, #fdbcb4 0%, #f4a395 100%)',
        borderRadius: '50%',
        position: 'relative',
        border: '1px solid #e8967d'
      }}>
        {/* 눈 */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '20%',
          width: '8px',
          height: '8px',
          background: '#000',
          borderRadius: '50%'
        }}>
          {/* 눈동자 하이라이트 */}
          <div style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            width: '3px',
            height: '3px',
            background: '#fff',
            borderRadius: '50%'
          }} />
        </div>
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '20%',
          width: '8px',
          height: '8px',
          background: '#000',
          borderRadius: '50%'
        }}>
          <div style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            width: '3px',
            height: '3px',
            background: '#fff',
            borderRadius: '50%'
          }} />
        </div>

        {/* 입 (표정에 따라 변화) */}
        <div style={{
          position: 'absolute',
          bottom: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '12px',
          height: expression === 'happy' ? '6px' : '4px',
          borderRadius: expression === 'happy' ? '0 0 12px 12px' : '12px',
          background: expression === 'worried' ? '#333' : '#ff6b9d',
          border: '1px solid #e55a88'
        }} />

        {/* 볼 홍조 */}
        {expression === 'happy' && (
          <>
            <div style={{
              position: 'absolute',
              top: '45%',
              left: '10%',
              width: '6px',
              height: '4px',
              background: '#ff9eb5',
              borderRadius: '50%',
              opacity: 0.7
            }} />
            <div style={{
              position: 'absolute',
              top: '45%',
              right: '10%',
              width: '6px',
              height: '4px',
              background: '#ff9eb5',
              borderRadius: '50%',
              opacity: 0.7
            }} />
          </>
        )}
      </div>

      {/* 채쌤 포니테일 */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '-5%',
        width: '15px',
        height: '20px',
        background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
        borderRadius: '50% 0 80% 20%',
        border: '1px solid #9d7e1a'
      }} />

      {/* 이모티콘 오버레이 */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        fontSize: '60%',
        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
      }}>
        {emojiData.face}
      </div>
    </div>
  );

  // 애니메이션 스타일
  const getAnimationStyle = () => {
    if (!isAnimating && !autoAnimation) return {};
    
    const animations = {
      bounce: 'bounce 0.6s ease-in-out',
      wobble: 'wobble 0.8s ease-in-out',
      pulse: 'pulse 1s ease-in-out infinite',
      shake: 'shake 0.5s ease-in-out',
      jump: 'jump 0.4s ease-out',
      slide: 'slideIn 0.6s ease-out',
      sway: 'sway 2s ease-in-out infinite',
      heartbeat: 'heartbeat 1s ease-in-out infinite',
      rotate: 'rotate 2s linear infinite',
      confetti: 'confetti 1s ease-out',
      alert: 'alert 0.3s ease-in-out infinite',
      approve: 'approve 0.8s ease-out',
      coin: 'coinFlip 1s ease-in-out',
      launch: 'launch 1.2s ease-out',
      work: 'work 1.5s ease-in-out infinite',
      tip: 'tip 0.8s ease-in-out',
      run: 'run 1s ease-in-out infinite'
    };

    return {
      animation: animations[emojiData.animation] || animations.bounce
    };
  };

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {/* 채쌤 이모티콘 */}
      <div
        style={{
          ...sizeStyle,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.gradients.light,
          borderRadius: '50%',
          border: `2px solid ${theme.accent}`,
          boxShadow: theme.shadows.md,
          overflow: 'hidden',
          ...getAnimationStyle()
        }}
      >
        <ChaessaemFace expression={emotion} />
      </div>

      {/* 메시지 */}
      {showMessage && (
        <div style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '8px 12px',
          maxWidth: '200px',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* 말풍선 화살표 */}
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: `6px solid ${theme.cardBg}`
          }} />
          
          <div style={{
            ...typography.presets.body.small,
            color: typography.colors.primary,
            fontWeight: typography.fontWeight.medium
          }}>
            {loadingTips && type === 'loading' ? 
              LOADING_TIPS[currentTip] : 
              emojiData.message
            }
          </div>
        </div>
      )}

      {/* 추가 콘텐츠 */}
      {children}

      {/* CSS 애니메이션 정의 */}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes wobble {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        
        @keyframes jump {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
          100% { transform: translateY(0) scale(1); }
        }
        
        @keyframes slideIn {
          0% { transform: translateX(-20px) opacity(0); }
          100% { transform: translateX(0) opacity(1); }
        }
        
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(3deg); }
        }
        
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25%, 75% { transform: scale(1.1); }
          50% { transform: scale(1.2); }
        }
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes confetti {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.3) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); }
        }
        
        @keyframes alert {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        
        @keyframes approve {
          0% { transform: scale(1) rotateY(0deg); }
          50% { transform: scale(1.2) rotateY(180deg); }
          100% { transform: scale(1) rotateY(360deg); }
        }
        
        @keyframes coinFlip {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg) scale(1.1); }
          100% { transform: rotateY(360deg); }
        }
        
        @keyframes launch {
          0% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-20px) scale(1.2); }
          100% { transform: translateY(-40px) scale(0.8) opacity(0.3); }
        }
        
        @keyframes work {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        
        @keyframes tip {
          0% { transform: scale(1); }
          50% { transform: scale(1.1) rotateZ(5deg); }
          100% { transform: scale(1); }
        }
        
        @keyframes run {
          0%, 100% { transform: translateX(0) scale(1); }
          50% { transform: translateX(3px) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

// 채쌤 로딩 애니메이션 컴포넌트
export const ChaessaemLoader = ({ 
  type = 'working', 
  message,
  darkMode = false,
  showTips = true 
}) => {
  const [currentType, setCurrentType] = useState(0);
  const loadingTypes = ['working', 'tip', 'running'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentType(prev => (prev + 1) % loadingTypes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '20px'
    }}>
      <ChaessaemEmoji
        type="loading"
        emotion={loadingTypes[currentType]}
        size="large"
        showMessage={showTips}
        autoAnimation={true}
        darkMode={darkMode}
        loadingTips={showTips}
      />
      
      {message && (
        <div style={{
          textAlign: 'center',
          color: darkMode ? '#e0e0e0' : '#666',
          fontSize: '14px',
          maxWidth: '300px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ChaessaemEmoji; 