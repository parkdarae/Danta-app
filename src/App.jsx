import React, { useState } from 'react';

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
            <span style={{ fontSize: '1.5rem' }}>🔧</span>
            30+ 고급 프레임워크 복구 중... 잠시만 기다려주세요!
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
          </p>
        </div>
      </div>
      
      {/* 예쁜 프레임워크 미리보기 */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '25px',
        padding: '20px 0'
      }}>
        {[
          { name: '거시탐구 프레임', icon: '🏛️', desc: '정책 수혜 스코어링, 글로벌 리스크 매핑', count: '5개' },
          { name: '바텀업 분석 프레임', icon: '🔬', desc: 'R&D 투자비율, 재무 건전성 분석', count: '5개' },
          { name: '심리/밈/테마 프레임', icon: '🧠', desc: '레딧 열기 지수, FOMO 경계지수', count: '5개' },
          { name: '인과관계 분석 프레임', icon: '🔗', desc: '정책↔산업↔종목 그래프, 동반상승', count: '4개' },
          { name: '투자 전략 프레임', icon: '💰', desc: '퀀트팩터 랭킹, 수익 최대화', count: '5개' }
        ].map((framework, index) => (
          <div key={framework.name} style={{
            background: darkMode 
              ? 'linear-gradient(135deg, #2d2d2d, #3d3d3d)' 
              : 'linear-gradient(135deg, #fff, #f8f9fa)',
            padding: '30px',
            borderRadius: '20px',
            border: `2px solid ${darkMode ? '#555' : '#e0e0e0'}`,
            boxShadow: darkMode 
              ? '0 10px 30px rgba(0,0,0,0.3)' 
              : '0 10px 30px rgba(0,0,0,0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = darkMode 
              ? '0 15px 40px rgba(0,0,0,0.4)' 
              : '0 15px 40px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = darkMode 
              ? '0 10px 30px rgba(0,0,0,0.3)' 
              : '0 10px 30px rgba(0,0,0,0.1)';
          }}
          >
            {/* 프레임 번호 배지 */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'linear-gradient(45deg, #8884d8, #ff6b6b)',
              color: 'white',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              {index + 1}
            </div>
            
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
              {framework.icon}
            </div>
            
            <h3 style={{
              color: darkMode ? '#fff' : '#333',
              margin: '0 0 10px 0',
              fontSize: '1.3rem',
              fontWeight: '700'
            }}>
              {framework.name}
            </h3>
            
            <div style={{
              background: darkMode ? '#4ecdc4' : '#8884d8',
              color: 'white',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              display: 'inline-block',
              marginBottom: '15px'
            }}>
              {framework.count}
            </div>
            
            <p style={{
              color: darkMode ? '#ccc' : '#666',
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {framework.desc}
            </p>
            
            {/* 로딩 바 */}
            <div style={{
              marginTop: '20px',
              background: darkMode ? '#555' : '#eee',
              borderRadius: '10px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(index + 1) * 20}%`,
                height: '100%',
                background: 'linear-gradient(45deg, #8884d8, #4ecdc4)',
                borderRadius: '10px',
                transition: 'width 2s ease',
                animation: 'loading 2s ease-in-out infinite alternate'
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes loading {
            0% { opacity: 0.7; }
            100% { opacity: 1; }
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