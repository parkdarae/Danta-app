import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import ChaessaemCharacter from './ChaessaemCharacter';

// 채쌤 기본 이모티콘 (단순화)
const CHAESSAEM_EMOJIS = {
  // 기본 감정 표현 (채쌤 캐릭터 사용)
  emotions: {
    happy: {
      face: "character",
      description: "기쁨",
      message: "좋은 투자 결과네요!",
      animation: "bounce"
    },
    excited: {
      face: "character",
      description: "흥분",
      message: "대박! 이 종목 괜찮은데요?",
      animation: "bounce"
    },
    thinking: {
      face: "character",
      description: "생각중",
      message: "음... 한번 분석해볼게요.",
      animation: "pulse"
    },
    worried: {
      face: "character",
      description: "걱정",
      message: "이 종목 좀 위험할 수 있어요.",
      animation: "none"
    },
    surprised: {
      face: "character",
      description: "놀람",
      message: "어? 이런 결과가!",
      animation: "none"
    },
    confident: {
      face: "character",
      description: "자신감",
      message: "이거 제가 추천한 종목이에요!",
      animation: "bounce"
    },
    neutral: {
      face: "character",
      description: "기본",
      message: "안녕하세요! 채쌤입니다.",
      animation: "none"
    }
  },

  // 투자 관련 (채쌤 캐릭터)
  trading: {
    analyzing: {
      face: "character",
      description: "분석중",
      message: "데이터를 꼼꼼히 분석하고 있어요!",
      animation: "pulse"
    },
    celebrating: {
      face: "character",
      description: "축하",
      message: "수익률 달성! 축하드려요!",
      animation: "bounce"
    },
    warning: {
      face: "character",
      description: "경고",
      message: "위험 신호가 감지됐어요!",
      animation: "none"
    },
    default: {
      face: "character",
      description: "기본",
      message: "채쌤이 도와드릴게요!",
      animation: "none"
    }
  },

  // 로딩 상태 (채쌤 캐릭터)
  loading: {
    working: {
      face: "character",
      description: "작업중",
      message: "열심히 분석하고 있어요!",
      animation: "pulse"
    },
    tip: {
      face: "character",
      description: "팁 제공",
      message: "투자 꿀팁을 알려드릴게요!",
      animation: "none"
    },
    default: {
      face: "character",
      description: "기본",
      message: "잠시만 기다려주세요!",
      animation: "pulse"
    }
  }
};

// 채쌤 로딩 팁 데이터 (단순화)
const LOADING_TIPS = [
  "💡 분산투자는 기본! 달걀을 한 바구니에 담지 마세요!",
  "💡 감정적 투자는 금물! 차트보다 마음을 먼저 읽어보세요!",
  "💡 장기투자가 답! 시간은 복리의 친구랍니다!",
  "💡 손절 타이밍이 중요해요! 고집은 투자의 적이에요!",
  "💡 투자 일기 쓰는 습관! 과거의 나에게서 배우세요!"
];

const ChaessaemEmoji = ({ 
  type = 'emotions', 
  emotion = 'neutral', 
  size = 'normal', 
  showMessage = false,
  autoAnimation = false,
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
  const [isAnimating, setIsAnimating] = useState(false);

  // 크기 설정 (ChaessaemCharacter에 맞게 조정)
  const sizes = {
    small: 'small',
    normal: 'normal', 
    large: 'large',
    huge: 'huge'
  };

  const characterSize = sizes[size] || sizes.normal;
  
  // 이모티콘 데이터 가져오기
  const emojiData = useMemo(() => {
    return CHAESSAEM_EMOJIS[type]?.[emotion] || CHAESSAEM_EMOJIS.emotions.neutral;
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

  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      {/* 채쌤 캐릭터 표시 */}
      <ChaessaemCharacter
        size={characterSize}
        showMessage={showMessage}
        message={emojiData.message}
        darkMode={darkMode}
        onClick={onClick}
        style={{
          animation: autoAnimation && emojiData.animation !== 'none' 
            ? `chaessaem${emojiData.animation} 2s ease-in-out infinite`
            : 'none'
        }}
      />

      {/* CSS 애니메이션 스타일 */}
      <style>
        {`
          @keyframes chaessaembounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          
          @keyframes chaessaempulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}
      </style>

      {/* 로딩 팁 표시 */}
      {loadingTips && type === 'loading' && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '12px',
          padding: '12px 16px',
          background: `${theme.colors.accent}15`,
          border: `1px solid ${theme.colors.accent}`,
          borderRadius: '12px',
          fontSize: typography.sizes.sm,
          color: typography.colors.primary,
          fontFamily: typography.fontFamily.primary,
          maxWidth: '280px',
          textAlign: 'center',
          boxShadow: theme.shadows.lg,
          zIndex: 1000
        }}>
          {LOADING_TIPS[currentTip]}
        </div>
      )}

      {children}
    </div>
  );
};

// 로딩 컴포넌트 (새 캐릭터 적용)
export const ChaessaemLoader = ({ 
  type = 'working', 
  darkMode = false, 
  showTips = false,
  message = '채쌤이 열심히 작업하고 있어요!' 
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      <ChaessaemEmoji
        type="loading"
        emotion={type}
        size="large"
        showMessage={false}
        autoAnimation={true}
        darkMode={darkMode}
        loadingTips={showTips}
        style={{ marginBottom: '16px' }}
      />
      <div style={{
        color: darkMode ? '#e1e5e9' : '#495057',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        {message}
      </div>
    </div>
  );
};

export default ChaessaemEmoji; 