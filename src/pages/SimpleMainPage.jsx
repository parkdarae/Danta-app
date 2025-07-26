import React, { useState } from 'react';
import TodayIssueStocks from '../components/TodayIssueStocks';
import { useLocalStorage } from '../hooks/useLocalStorage';

function SimpleMainPage() {
  const [darkMode, setDarkMode] = useLocalStorage('dark_mode', false);

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode ? '#1a1a1a' : '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          padding: '20px',
          background: darkMode ? '#2d2d2d' : '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            color: darkMode ? '#ffffff' : '#333333',
            margin: 0,
            fontSize: '28px',
            fontWeight: '700'
          }}>
            🔥 채쌤 이슈 종목 분석
          </h1>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: darkMode ? '#4A90E2' : '#2d3436',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {darkMode ? '☀️ 라이트 모드' : '🌙 다크 모드'}
          </button>
        </div>

        {/* 메인 컴포넌트 */}
        <TodayIssueStocks darkMode={darkMode} />
        
        {/* 안내 메시지 */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: darkMode ? '#2d2d2d' : '#ffffff',
          borderRadius: '16px',
          textAlign: 'center',
          border: `2px dashed ${darkMode ? '#4A90E2' : '#667eea'}`
        }}>
          <h3 style={{
            color: darkMode ? '#ffffff' : '#333333',
            margin: '0 0 12px 0'
          }}>
            🎉 새로운 "오늘의 이슈 종목" 페이지가 완성되었어요!
          </h3>
          <p style={{
            color: darkMode ? '#cccccc' : '#666666',
            margin: 0,
            lineHeight: 1.6
          }}>
            • 관심종목 중 15% 이상 변동성이 있는 종목만 표시<br/>
            • 실시간 뉴스 연동 기능 추가<br/>
            • 변동률에 따른 시각적 표시 (🚀📈📉💥)<br/>
            • 각 종목별 뉴스 바로가기 버튼
          </p>
        </div>
      </div>
    </div>
  );
}

export default SimpleMainPage; 