import React from 'react';

const ProgressIndicator = ({ 
  progress = 0, 
  phase = '', 
  isActive = false, 
  darkMode = false,
  memoryUsage = null,
  estimatedTime = null 
}) => {
  const theme = {
    background: darkMode ? '#23272b' : '#fff',
    text: darkMode ? '#e0e0e0' : '#222',
    accent: '#8884d8',
    success: '#4CAF50',
    warning: '#FF9800',
    border: darkMode ? '#333' : '#eee'
  };

  const getPhaseIcon = (phase) => {
    const icons = {
      'data_collection': '📊',
      'preprocessing': '🔧',
      'correlation': '🔗',
      'clustering': '🔍',
      'insight_generation': '💡'
    };
    return icons[phase] || '⚙️';
  };

  const getPhaseText = (phase) => {
    const texts = {
      'data_collection': '데이터 수집',
      'preprocessing': '데이터 전처리',
      'correlation': '상관관계 분석',
      'clustering': '클러스터링',
      'insight_generation': '인사이트 생성'
    };
    return texts[phase] || '처리 중';
  };

  const formatTime = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}분 ${secs}초` : `${secs}초`;
  };

  const formatMemory = (mb) => {
    if (!mb) return '';
    return mb < 1000 ? `${mb.toFixed(1)}MB` : `${(mb/1024).toFixed(1)}GB`;
  };

  return (
    <div style={{
      background: theme.background,
      border: `2px solid ${theme.border}`,
      borderRadius: '16px',
      padding: '1.5rem',
      margin: '1rem 0',
      boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    }}>
      {/* 현재 단계 표시 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '1rem',
        fontSize: '1.1rem',
        fontWeight: '600',
        color: theme.text
      }}>
        <span style={{ 
          fontSize: '1.5rem', 
          marginRight: '0.5rem',
          animation: isActive ? 'pulse 2s infinite' : 'none'
        }}>
          {getPhaseIcon(phase)}
        </span>
        {getPhaseText(phase)}
        {isActive && (
          <div style={{
            marginLeft: 'auto',
            padding: '0.25rem 0.75rem',
            background: theme.accent,
            color: '#fff',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            실행 중
          </div>
        )}
      </div>

      {/* 진행률 바 */}
      <div style={{
        background: darkMode ? '#1a1a1a' : '#f5f5f5',
        borderRadius: '8px',
        height: '8px',
        marginBottom: '1rem',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          background: `linear-gradient(90deg, ${theme.accent}, ${theme.success})`,
          height: '100%',
          width: `${progress}%`,
          borderRadius: '8px',
          transition: 'width 0.5s ease',
          position: 'relative'
        }}>
          {/* 애니메이션 효과 */}
          {isActive && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shimmer 2s infinite'
            }} />
          )}
        </div>
      </div>

      {/* 상세 정보 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.9rem',
        color: darkMode ? '#aaa' : '#666'
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span>📈 진행률: {progress.toFixed(1)}%</span>
          {estimatedTime && (
            <span>⏱️ 예상시간: {formatTime(estimatedTime)}</span>
          )}
        </div>
        {memoryUsage && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>🧠 메모리: {formatMemory(memoryUsage)}</span>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: memoryUsage > 500 ? theme.warning : theme.success
            }} />
          </div>
        )}
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ProgressIndicator; 