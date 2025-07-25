import React, { useState, useEffect } from 'react';
import { useMemoryMonitoring } from '../hooks/usePerformanceOptimization';

const PerformanceMonitor = ({ darkMode = false }) => {
  const { trackMemoryUsage, getMemoryReport } = useMemoryMonitoring();
  const [performanceData, setPerformanceData] = useState({
    fps: 0,
    loadTime: 0,
    memoryUsage: 0,
    networkRequests: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  const theme = {
    background: darkMode ? '#23272b' : '#fff',
    text: darkMode ? '#e0e0e0' : '#222',
    accent: '#8884d8',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#f44336',
    border: darkMode ? '#333' : '#eee'
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const memoryReport = getMemoryReport();
      const now = performance.now();
      
      setPerformanceData(prev => ({
        ...prev,
        memoryUsage: memoryReport.current || 0,
        loadTime: now
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [getMemoryReport]);

  // FPS 측정
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setPerformanceData(prev => ({
          ...prev,
          fps: Math.round(frameCount * 1000 / (currentTime - lastTime))
        }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }, []);

  const getScoreColor = (value, thresholds) => {
    if (value >= thresholds.good) return theme.success;
    if (value >= thresholds.warning) return theme.warning;
    return theme.error;
  };

  const MetricCard = ({ title, value, unit, thresholds, icon }) => (
    <div style={{
      background: darkMode ? '#2a2e33' : '#f8f9fa',
      borderRadius: '8px',
      padding: '1rem',
      textAlign: 'center',
      border: `1px solid ${theme.border}`,
      minWidth: '120px'
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: getScoreColor(value, thresholds),
        marginBottom: '0.25rem'
      }}>
        {typeof value === 'number' ? value.toFixed(1) : value}
        <span style={{ fontSize: '0.8rem', marginLeft: '0.25rem' }}>{unit}</span>
      </div>
      <div style={{
        fontSize: '0.8rem',
        color: darkMode ? '#aaa' : '#666',
        fontWeight: '500'
      }}>
        {title}
      </div>
    </div>
  );

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: theme.accent,
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '1.2rem',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}
        title="성능 모니터 열기"
      >
        📊
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: theme.background,
      border: `2px solid ${theme.border}`,
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.15)',
      zIndex: 1000,
      maxWidth: '400px'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: theme.text,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📊 성능 모니터
        </div>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: theme.text,
            padding: '0.25rem'
          }}
        >
          ✕
        </button>
      </div>

      {/* 메트릭 카드들 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem'
      }}>
        <MetricCard
          title="FPS"
          value={performanceData.fps}
          unit=""
          thresholds={{ good: 55, warning: 30 }}
          icon="🎯"
        />
        <MetricCard
          title="메모리"
          value={performanceData.memoryUsage}
          unit="MB"
          thresholds={{ good: 100, warning: 300 }}
          icon="🧠"
        />
        <MetricCard
          title="로드 시간"
          value={performanceData.loadTime / 1000}
          unit="s"
          thresholds={{ good: 2, warning: 5 }}
          icon="⚡"
        />
        <MetricCard
          title="상태"
          value={performanceData.fps > 30 ? "양호" : "주의"}
          unit=""
          thresholds={{ good: 1, warning: 0.5 }}
          icon="💚"
        />
      </div>

      {/* 성능 팁 */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: darkMode ? '#1a1a1a' : '#f0f8ff',
        borderRadius: '8px',
        fontSize: '0.8rem',
        color: darkMode ? '#aaa' : '#666'
      }}>
        💡 <strong>팁:</strong> 웹 워커 기반 분석을 사용하면 FPS가 안정적으로 유지됩니다.
      </div>
    </div>
  );
};

export default PerformanceMonitor; 