import { useMemo } from 'react';

export const useTheme = (darkMode = false) => {
  return useMemo(() => ({
    bg: darkMode ? '#1a1a1a' : '#ffffff',
    cardBg: darkMode ? '#2d2d2d' : '#f8f9fa',
    text: darkMode ? '#ffffff' : '#333333',
    subtext: darkMode ? '#cccccc' : '#666666',
    border: darkMode ? '#404040' : '#e0e0e0',
    accent: '#007bff',
    positive: '#00c851',
    negative: '#ff4444',
    warning: '#ffbb33',
    purple: '#9c27b0',
    teal: '#20c997',
    orange: '#ff6b35',
    blue: '#007bff',
    indigo: '#6610f2',
    pink: '#e83e8c',
    red: '#dc3545',
    yellow: '#ffc107',
    green: '#28a745',
    cyan: '#17a2b8',
    
    // 그라디언트 미리 계산
    gradients: {
      primary: `linear-gradient(135deg, ${darkMode ? '#9c27b0' : '#007bff'}, ${darkMode ? '#ff6b35' : '#20c997'})`,
      success: `linear-gradient(135deg, #00c851, #20c997)`,
      warning: `linear-gradient(135deg, #ffbb33, #ff6b35)`,
      danger: `linear-gradient(135deg, #ff4444, #dc3545)`,
      purple: `linear-gradient(135deg, #9c27b0, #6610f2)`,
      ocean: `linear-gradient(135deg, #007bff, #17a2b8)`,
      sunset: `linear-gradient(135deg, #ff6b35, #ffc107)`
    },
    
    // 그림자 미리 계산
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.12)',
      md: '0 4px 6px rgba(0,0,0,0.12)',
      lg: '0 10px 20px rgba(0,0,0,0.15)',
      xl: '0 15px 35px rgba(0,0,0,0.1)',
      card: darkMode ? '0 4px 15px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,0,0,0.1)',
      button: '0 2px 8px rgba(0,0,0,0.15)'
    },
    
    // 애니메이션 속도
    transitions: {
      fast: '0.15s ease',
      normal: '0.3s ease',
      slow: '0.5s ease'
    },
    
    // 반응형 브레이크포인트
    breakpoints: {
      mobile: '768px',
      tablet: '1024px',
      desktop: '1200px'
    }
  }), [darkMode]);
};

// 색상 유틸리티 함수들
export const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getScoreColor = (score, theme) => {
  if (score >= 80) return theme.positive;
  if (score >= 60) return theme.warning;
  if (score >= 40) return theme.orange;
  return theme.negative;
};

export const getChangeColor = (change, theme) => {
  if (change > 0) return theme.positive;
  if (change < 0) return theme.negative;
  return theme.text;
}; 