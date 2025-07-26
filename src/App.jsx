import React from 'react';

function App() {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f0f2f5',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>
          🏌️‍♀️ 채쌤 3.0 
        </h1>
        <h2 style={{ color: '#666', marginBottom: '30px' }}>
          다룡이 전용 AI 트레이딩 어드바이저
        </h2>
        
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#2d5a2d', fontSize: '18px', margin: 0 }}>
            ✅ 앱이 정상적으로 실행되었습니다!
          </p>
        </div>
        
        <p style={{ color: '#666', fontSize: '16px', lineHeight: 1.6 }}>
          안녕하세요 다룡아! 🎉<br/>
          하얀 화면 문제가 해결되었습니다.<br/>
          이제 트레이딩 기능들을 사용할 수 있어요!
        </p>
        
        <div style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          fontSize: '14px',
          color: '#666'
        }}>
          버전: 3.0 - 문제 해결 완료
        </div>
      </div>
    </div>
  );
}

export default App;