import React, { useState } from 'react';
import AdvancedFrameworksPanel from './components/AdvancedFrameworksPanel';

function App() {
  const [selectedStock, setSelectedStock] = useState('삼성전자');
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div style={{
      padding: '20px',
      backgroundColor: darkMode ? '#1a1a1a' : '#f0f2f5',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    }}>
      {/* 멋진 헤더 */}
      <div style={{
        backgroundColor: darkMode ? '#2d2d2d' : 'white',
        padding: '30px',
        borderRadius: '20px',
        boxShadow: darkMode ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '1400px',
        margin: '0 auto 30px auto',
        border: `2px solid ${darkMode ? '#444' : '#e0e0e0'}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 배경 그라데이션 효과 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #8884d8, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
          backgroundSize: '300% 300%',
          animation: 'gradientMove 3s ease infinite'
        }} />
        
        <h1 style={{ 
          color: darkMode ? '#fff' : '#333', 
          marginBottom: '15px',
          background: 'linear-gradient(45deg, #8884d8, #ff6b6b, #4ecdc4)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '3rem',
          fontWeight: '900',
          textShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
        }}>
          🏌️‍♀️ 채쌤 3.0 
        </h1>
        <h2 style={{ 
          color: darkMode ? '#ccc' : '#666', 
          marginBottom: '25px',
          fontSize: '1.4rem',
          fontWeight: '600'
        }}>
          다룡이 전용 AI 트레이딩 어드바이저 ✨
        </h2>
        
        {/* 고급 컨트롤 패널 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '25px',
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 15px',
            backgroundColor: darkMode ? '#3d3d3d' : '#f8f9fa',
            borderRadius: '12px',
            border: `2px solid ${darkMode ? '#555' : '#e0e0e0'}`
          }}>
            <span style={{ fontSize: '1.2rem' }}>📈</span>
            <label style={{ 
              color: darkMode ? '#ccc' : '#666', 
              fontWeight: '600',
              fontSize: '14px'
            }}>
              종목 선택:
            </label>
            <select 
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              style={{
                padding: '8px 15px',
                borderRadius: '8px',
                border: `2px solid ${darkMode ? '#555' : '#ddd'}`,
                backgroundColor: darkMode ? '#4d4d4d' : 'white',
                color: darkMode ? '#fff' : '#333',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <option value="삼성전자">🏭 삼성전자</option>
              <option value="SK하이닉스">💾 SK하이닉스</option>
              <option value="현대차">🚗 현대차</option>
              <option value="LG화학">🧪 LG화학</option>
              <option value="셀트리온">💊 셀트리온</option>
              <option value="KB금융">🏦 KB금융</option>
            </select>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: darkMode 
                ? 'linear-gradient(45deg, #4ecdc4, #45b7d1)' 
                : 'linear-gradient(45deg, #8884d8, #a29bfe)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '700',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
          >
            {darkMode ? '🌞 라이트 모드' : '🌙 다크 모드'}
          </button>
        </div>
        
        <div style={{
          background: darkMode 
            ? 'linear-gradient(45deg, #2d5a2d, #1e3a1e)' 
            : 'linear-gradient(45deg, #e8f5e8, #f0fff0)',
          padding: '20px',
          borderRadius: '12px',
          border: `2px solid ${darkMode ? '#4ade80' : '#2d5a2d'}`,
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <p style={{ 
            color: darkMode ? '#4ade80' : '#2d5a2d', 
            fontSize: '18px', 
            margin: 0,
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🚀</span>
            30+ 고급 트레이딩 프레임워크 실행 준비 완료!
            <span style={{ fontSize: '1.5rem' }}>✨</span>
          </p>
        </div>
      </div>
      
      {/* 30+ 고급 프레임워크 패널 - 복구! */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <AdvancedFrameworksPanel 
          selectedStock={selectedStock}
          darkMode={darkMode}
        />
      </div>

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          select:hover {
            border-color: ${darkMode ? '#4ecdc4' : '#8884d8'} !important;
          }
          
          select:focus {
            border-color: ${darkMode ? '#4ecdc4' : '#8884d8'} !important;
            box-shadow: 0 0 0 3px ${darkMode ? 'rgba(78, 205, 196, 0.2)' : 'rgba(136, 132, 216, 0.2)'} !important;
          }
        `}
      </style>
    </div>
  );
}

export default App;