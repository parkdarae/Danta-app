import React, { forwardRef, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';

const EnhancedButton = forwardRef(({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger, success
  size = 'normal', // small, normal, large
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left', // left, right
  onClick,
  darkMode = false,
  tooltip = null,
  className = '',
  style = {},
  'data-guide': dataGuide,
  ...props
}, ref) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // 버튼 스타일 변형
  const variants = {
    primary: {
      background: theme.gradients.ocean,
      color: 'white',
      border: 'none',
      hover: { background: theme.accent, transform: 'translateY(-1px)' },
      active: { transform: 'translateY(0)' }
    },
    secondary: {
      background: theme.cardBg,
      color: theme.text,
      border: `2px solid ${theme.border}`,
      hover: { borderColor: theme.accent, background: theme.bg },
      active: { background: theme.border }
    },
    outline: {
      background: 'transparent',
      color: theme.accent,
      border: `2px solid ${theme.accent}`,
      hover: { background: theme.accent, color: 'white' },
      active: { background: `${theme.accent}dd` }
    },
    ghost: {
      background: 'transparent',
      color: theme.text,
      border: 'none',
      hover: { background: theme.cardBg },
      active: { background: theme.border }
    },
    danger: {
      background: theme.gradients.danger,
      color: 'white',
      border: 'none',
      hover: { background: theme.negative, transform: 'translateY(-1px)' },
      active: { transform: 'translateY(0)' }
    },
    success: {
      background: theme.gradients.success,
      color: 'white',
      border: 'none',
      hover: { background: theme.positive, transform: 'translateY(-1px)' },
      active: { transform: 'translateY(0)' }
    }
  };

  // 크기별 스타일
  const sizes = {
    small: {
      padding: '6px 12px',
      fontSize: typography.fontSize.sm,
      height: '32px'
    },
    normal: {
      padding: '10px 20px',
      fontSize: typography.fontSize.base,
      height: '40px'
    },
    large: {
      padding: '14px 28px',
      fontSize: typography.fontSize.lg,
      height: '48px'
    }
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  // 현재 상태에 따른 스타일
  const getCurrentStyle = () => {
    let currentStyle = { ...variantStyle };
    
    if (disabled || loading) {
      currentStyle = {
        ...currentStyle,
        opacity: 0.6,
        cursor: 'not-allowed',
        background: theme.border,
        color: theme.subtext
      };
    } else if (isPressed) {
      currentStyle = { ...currentStyle, ...variantStyle.active };
    } else if (isHovered || isFocused) {
      currentStyle = { ...currentStyle, ...variantStyle.hover };
    }
    
    return currentStyle;
  };

  const currentStyle = getCurrentStyle();

  // 키보드 이벤트 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsPressed(true);
      onClick?.(e);
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsPressed(false);
    }
  };

  return (
    <button
      ref={ref}
      className={className}
      disabled={disabled || loading}
      onClick={!disabled && !loading ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      data-guide={dataGuide}
      aria-label={typeof children === 'string' ? children : tooltip}
      title={tooltip}
      style={{
        // 기본 스타일
        fontFamily: typography.fontFamily.primary,
        fontWeight: typography.fontWeight.semibold,
        letterSpacing: typography.letterSpacing.wide,
        borderRadius: '8px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: theme.transitions.normal,
        outline: 'none',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: fullWidth ? '100%' : 'auto',
        
        // 접근성을 위한 포커스 스타일
        boxShadow: isFocused && !disabled ? 
          `0 0 0 3px ${theme.accent}40` : 
          currentStyle.boxShadow || theme.shadows.button,
        
        // 크기 스타일
        ...sizeStyle,
        
        // 변형 스타일
        background: currentStyle.background,
        color: currentStyle.color,
        border: currentStyle.border,
        opacity: currentStyle.opacity,
        transform: currentStyle.transform,
        
        // 커스텀 스타일
        ...style
      }}
      {...props}
    >
      {/* 로딩 스피너 */}
      {loading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: `2px solid ${currentStyle.color}30`,
            borderTop: `2px solid ${currentStyle.color}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      )}
      
      {/* 아이콘 (왼쪽) */}
      {icon && iconPosition === 'left' && !loading && (
        <span style={{ fontSize: sizeStyle.fontSize, lineHeight: 1 }}>
          {icon}
        </span>
      )}
      
      {/* 버튼 텍스트 */}
      {!loading && (
        <span style={{ 
          opacity: loading ? 0 : 1,
          transition: theme.transitions.fast
        }}>
          {children}
        </span>
      )}
      
      {/* 아이콘 (오른쪽) */}
      {icon && iconPosition === 'right' && !loading && (
        <span style={{ fontSize: sizeStyle.fontSize, lineHeight: 1 }}>
          {icon}
        </span>
      )}

      {/* 로딩 텍스트 */}
      {loading && (
        <span style={{ marginLeft: '8px' }}>
          처리중...
        </span>
      )}

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
});

EnhancedButton.displayName = 'EnhancedButton';

export default EnhancedButton; 