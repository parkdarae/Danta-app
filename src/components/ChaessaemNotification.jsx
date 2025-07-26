import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import ChaessaemEmoji from './ChaessaemEmoji';

// 알림 타입별 채쌤 이모티콘 매핑
const NOTIFICATION_EMOJI_MAP = {
  success: {
    type: 'trading',
    emotion: 'celebrating',
    sound: '🎉'
  },
  error: {
    type: 'trading',
    emotion: 'warning',
    sound: '⚠️'
  },
  info: {
    type: 'emotions',
    emotion: 'thinking',
    sound: '💡'
  },
  warning: {
    type: 'emotions',
    emotion: 'worried',
    sound: '🚨'
  },
  loading: {
    type: 'loading',
    emotion: 'working',
    sound: '⏳'
  },
  achievement: {
    type: 'trading',
    emotion: 'money',
    sound: '🏆'
  }
};

const ChaessaemNotification = ({ 
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  darkMode = false,
  position = 'top-right', // top-right, top-left, bottom-right, bottom-left, center
  showIcon = true,
  actionButton = null,
  persistent = false
}) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const emojiConfig = NOTIFICATION_EMOJI_MAP[type] || NOTIFICATION_EMOJI_MAP.info;

  // 자동 닫기
  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, persistent]);

  // 입장 애니메이션
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  // 위치별 스타일
  const getPositionStyle = () => {
    const baseStyle = {
      position: 'fixed',
      zIndex: 10000,
      minWidth: '320px',
      maxWidth: '480px'
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyle, top: '20px', right: '20px' };
      case 'top-left':
        return { ...baseStyle, top: '20px', left: '20px' };
      case 'bottom-right':
        return { ...baseStyle, bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { ...baseStyle, bottom: '20px', left: '20px' };
      case 'center':
        return { 
          ...baseStyle, 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          minWidth: '400px'
        };
      default:
        return { ...baseStyle, top: '20px', right: '20px' };
    }
  };

  // 타입별 색상 테마
  const getTypeTheme = () => {
    switch (type) {
      case 'success':
        return {
          background: `linear-gradient(135deg, ${theme.positive}15, ${theme.positive}25)`,
          border: theme.positive,
          iconBg: theme.positive
        };
      case 'error':
        return {
          background: `linear-gradient(135deg, ${theme.negative}15, ${theme.negative}25)`,
          border: theme.negative,
          iconBg: theme.negative
        };
      case 'warning':
        return {
          background: `linear-gradient(135deg, ${theme.warning}15, ${theme.warning}25)`,
          border: theme.warning,
          iconBg: theme.warning
        };
      case 'achievement':
        return {
          background: `linear-gradient(135deg, ${theme.purple}15, ${theme.purple}25)`,
          border: theme.purple,
          iconBg: theme.purple
        };
      default:
        return {
          background: `linear-gradient(135deg, ${theme.accent}15, ${theme.accent}25)`,
          border: theme.accent,
          iconBg: theme.accent
        };
    }
  };

  const typeTheme = getTypeTheme();

  if (!isVisible) return null;

  return (
    <div
      style={{
        ...getPositionStyle(),
        background: typeTheme.background,
        border: `2px solid ${typeTheme.border}`,
        borderRadius: '16px',
        padding: '20px',
        boxShadow: theme.shadows.xl,
        backdropFilter: 'blur(10px)',
        fontFamily: typography.fontFamily.primary,
        opacity: isVisible ? 1 : 0,
        transform: isAnimating 
          ? (position.includes('top') ? 'translateY(-10px)' : 'translateY(10px)')
          : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
      }}
      onClick={!persistent ? handleClose : undefined}
    >
      {/* 닫기 버튼 */}
      {!persistent && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: typography.colors.muted,
            cursor: 'pointer',
            fontSize: '16px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = `${typeTheme.border}20`;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
          }}
        >
          ✕
        </button>
      )}

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        {/* 채쌤 이모티콘 */}
        {showIcon && (
          <div style={{
            background: `${typeTheme.iconBg}20`,
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '60px',
            height: '60px'
          }}>
            <ChaessaemEmoji
              type={emojiConfig.type}
              emotion={emojiConfig.emotion}
              size="normal"
              showMessage={false}
              autoAnimation={true}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* 콘텐츠 */}
        <div style={{ flex: 1, paddingRight: persistent ? '0' : '24px' }}>
          {/* 제목 */}
          {title && (
            <h4 style={{
              ...typography.presets.heading.h4,
              color: typography.colors.primary,
              margin: '0 0 8px 0'
            }}>
              {title}
            </h4>
          )}

          {/* 메시지 */}
          <p style={{
            ...typography.presets.body.normal,
            color: typography.colors.secondary,
            margin: 0,
            lineHeight: typography.lineHeight.relaxed
          }}>
            {message}
          </p>

          {/* 액션 버튼 */}
          {actionButton && (
            <div style={{ marginTop: '16px' }}>
              {actionButton}
            </div>
          )}
        </div>
      </div>

      {/* 진행률 바 (duration이 있을 때) */}
      {!persistent && duration > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '4px',
          background: `${typeTheme.border}20`,
          borderRadius: '0 0 14px 14px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: typeTheme.border,
            animation: `shrink ${duration}ms linear`,
            transformOrigin: 'left'
          }} />
        </div>
      )}

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

// 알림 시스템 훅
export const useChaessaemNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = { 
      ...notification, 
      id,
      onClose: () => removeNotification(id)
    };
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // 편의 메서드들
  const success = (message, options = {}) => addNotification({
    type: 'success',
    title: '성공!',
    message,
    ...options
  });

  const error = (message, options = {}) => addNotification({
    type: 'error',
    title: '오류',
    message,
    duration: 7000,
    ...options
  });

  const info = (message, options = {}) => addNotification({
    type: 'info',
    title: '알림',
    message,
    ...options
  });

  const warning = (message, options = {}) => addNotification({
    type: 'warning',
    title: '주의',
    message,
    duration: 6000,
    ...options
  });

  const achievement = (message, options = {}) => addNotification({
    type: 'achievement',
    title: '달성!',
    message,
    duration: 8000,
    ...options
  });

  const loading = (message, options = {}) => addNotification({
    type: 'loading',
    title: '처리중...',
    message,
    persistent: true,
    showIcon: true,
    ...options
  });

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    info,
    warning,
    achievement,
    loading
  };
};

// 알림 컨테이너 컴포넌트
export const ChaessaemNotificationContainer = ({ notifications, darkMode = false }) => {
  return (
    <>
      {notifications.map((notification) => (
        <ChaessaemNotification
          key={notification.id}
          darkMode={darkMode}
          {...notification}
        />
      ))}
    </>
  );
};

export default ChaessaemNotification; 