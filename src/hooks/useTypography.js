import { useMemo } from 'react';

export const useTypography = (darkMode = false) => {
  return useMemo(() => ({
    // 기본 폰트 패밀리
    fontFamily: {
      primary: "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
      mono: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
      number: "'SF Pro Display', 'Segoe UI', 'Roboto', sans-serif"
    },

    // 폰트 크기 (rem 기준)
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem'     // 48px
    },

    // 폰트 두께
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    },

    // 행간 (line-height)
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
      loose: '2'
    },

    // 자간 (letter-spacing)
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    },

    // 텍스트 색상 (테마 기반)
    colors: {
      primary: darkMode ? '#ffffff' : '#1a1a1a',
      secondary: darkMode ? '#e0e0e0' : '#4a4a4a',
      muted: darkMode ? '#a0a0a0' : '#6b7280',
      accent: '#007bff',
      success: '#00c851',
      warning: '#ffbb33',
      error: '#ff4444',
      info: '#17a2b8'
    },

    // 컴포넌트별 스타일 프리셋
    presets: {
      // 제목 스타일
      heading: {
        h1: {
          fontSize: '2.25rem',
          fontWeight: '700',
          lineHeight: '1.25',
          letterSpacing: '-0.025em',
          marginBottom: '1rem'
        },
        h2: {
          fontSize: '1.875rem',
          fontWeight: '600',
          lineHeight: '1.25',
          letterSpacing: '-0.025em',
          marginBottom: '0.875rem'
        },
        h3: {
          fontSize: '1.5rem',
          fontWeight: '600',
          lineHeight: '1.25',
          marginBottom: '0.75rem'
        },
        h4: {
          fontSize: '1.25rem',
          fontWeight: '600',
          lineHeight: '1.25',
          marginBottom: '0.5rem'
        }
      },

      // 본문 텍스트
      body: {
        large: {
          fontSize: '1.125rem',
          fontWeight: '400',
          lineHeight: '1.75'
        },
        normal: {
          fontSize: '1rem',
          fontWeight: '400',
          lineHeight: '1.5'
        },
        small: {
          fontSize: '0.875rem',
          fontWeight: '400',
          lineHeight: '1.5'
        },
        xs: {
          fontSize: '0.75rem',
          fontWeight: '400',
          lineHeight: '1.25'
        }
      },

      // 버튼 텍스트
      button: {
        large: {
          fontSize: '1.125rem',
          fontWeight: '600',
          letterSpacing: '0.025em'
        },
        normal: {
          fontSize: '1rem',
          fontWeight: '600',
          letterSpacing: '0.025em'
        },
        small: {
          fontSize: '0.875rem',
          fontWeight: '600',
          letterSpacing: '0.025em'
        }
      },

      // 레이블 & 캡션
      label: {
        fontSize: '0.875rem',
        fontWeight: '500',
        lineHeight: '1.25',
        letterSpacing: '0.025em'
      },
      
      caption: {
        fontSize: '0.75rem',
        fontWeight: '400',
        lineHeight: '1.25',
        color: darkMode ? '#a0a0a0' : '#6b7280'
      },

      // 숫자 표시 (주가, 퍼센트 등)
      number: {
        large: {
          fontFamily: "'SF Pro Display', 'Segoe UI', 'Roboto', sans-serif",
          fontSize: '1.5rem',
          fontWeight: '700',
          lineHeight: '1.25',
          letterSpacing: '-0.025em'
        },
        normal: {
          fontFamily: "'SF Pro Display', 'Segoe UI', 'Roboto', sans-serif",
          fontSize: '1.125rem',
          fontWeight: '600',
          lineHeight: '1.25',
          letterSpacing: '-0.025em'
        },
        small: {
          fontFamily: "'SF Pro Display', 'Segoe UI', 'Roboto', sans-serif",
          fontSize: '0.875rem',
          fontWeight: '600',
          lineHeight: '1.25'
        }
      },

      // 코드 & 기술적 텍스트
      code: {
        fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
        fontSize: '0.875rem',
        fontWeight: '400',
        lineHeight: '1.5',
        background: darkMode ? '#2d2d2d' : '#f5f5f5',
        padding: '0.125rem 0.25rem',
        borderRadius: '0.25rem'
      }
    },

    // 반응형 유틸리티
    responsive: {
      mobile: {
        h1: { fontSize: '1.875rem' },
        h2: { fontSize: '1.5rem' },
        h3: { fontSize: '1.25rem' },
        body: { fontSize: '0.875rem' }
      },
      tablet: {
        h1: { fontSize: '2.25rem' },
        h2: { fontSize: '1.875rem' },
        h3: { fontSize: '1.5rem' },
        body: { fontSize: '1rem' }
      }
    }
  }), [darkMode]);
};

// 텍스트 컴포넌트 생성 헬퍼
export const createTextStyle = (preset, customStyle = {}) => ({
  ...preset,
  ...customStyle
});

// 반응형 텍스트 크기 계산
export const getResponsiveTextSize = (baseSize, breakpoint = 'desktop') => {
  const scales = {
    mobile: 0.875,
    tablet: 0.9375,
    desktop: 1
  };
  
  const scale = scales[breakpoint] || 1;
  return `${parseFloat(baseSize) * scale}rem`;
}; 