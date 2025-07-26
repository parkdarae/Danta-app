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
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* 헤더 */}
      <div style={{
        backgroundColor: darkMode ? '#2d2d2d' : 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto 20px auto'
      }}>
        <h1 style={{ 
          color: darkMode ? '#fff' : '#333', 
          marginBottom: '10px',
          background: 'linear-gradient(45deg, #8884d8, #ff6b6b, #4ecdc4)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2.5rem'
        }}>
          🏌️‍♀️ 채쌤 3.0 
        </h1>
        <h2 style={{ 
          color: darkMode ? '#ccc' : '#666', 
          marginBottom: '20px',
          fontSize: '1.3rem'
        }}>
          다룡이 전용 AI 트레이딩 어드바이저
        </h2>
        
        {/* 컨트롤 패널 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <div>
            <label style={{ 
              color: darkMode ? '#ccc' : '#666', 
              marginRight: '10px',
              fontWeight: '600'
            }}>
              종목 선택:
            </label>
            <select 
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                backgroundColor: darkMode ? '#3d3d3d' : 'white',
                color: darkMode ? '#fff' : '#333',
                fontSize: '14px'
              }}
            >
              <option value="삼성전자">삼성전자</option>
              <option value="SK하이닉스">SK하이닉스</option>
              <option value="현대차">현대차</option>
              <option value="LG화학">LG화학</option>
              <option value="셀트리온">셀트리온</option>
              <option value="KB금융">KB금융</option>
            </select>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: darkMode ? '#4ecdc4' : '#8884d8',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {darkMode ? '🌞 라이트 모드' : '🌙 다크 모드'}
          </button>
        </div>
        
        <div style={{
          backgroundColor: darkMode ? '#2d5a2d' : '#e8f5e8',
          padding: '15px',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <p style={{ 
            color: darkMode ? '#4ade80' : '#2d5a2d', 
            fontSize: '16px', 
            margin: 0,
            fontWeight: '600'
          }}>
            ✅ 30+ 고급 트레이딩 프레임워크 준비 완료!
          </p>
        </div>
      </div>
      
      {/* 30+ 고급 프레임워크 패널 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <AdvancedFrameworksPanel 
          selectedStock={selectedStock}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

export default App;