import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header" style={{
        backgroundColor: '#282c34',
        padding: '20px',
        color: 'white',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'calc(10px + 2vmin)'
      }}>
        <div style={{ marginBottom: '30px', fontSize: '60px' }}>🏌️‍♀️</div>
        <h1 style={{ margin: '20px 0', color: '#61dafb' }}>
          채쌤 3.0 - 다룡이 전용 AI 트레이딩 어드바이저
        </h1>
        <p style={{ margin: '20px 0', fontSize: '18px', maxWidth: '600px', lineHeight: 1.6 }}>
          안녕하세요! 다룡아! 🎉<br/>
          앱이 정상적으로 로딩되었어요!<br/>
          이제 기능들을 하나씩 추가해보겠습니다.
        </p>
        
        <div style={{
          background: '#61dafb',
          color: '#282c34',
          padding: '15px 30px',
          borderRadius: '25px',
          margin: '20px 0',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          ✅ React 앱 정상 동작!
        </div>
        
        <div style={{
          background: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '15px',
          margin: '10px 0',
          fontSize: '14px'
        }}>
          🚀 배포 성공!
        </div>
        
        <div style={{
          marginTop: '40px',
          fontSize: '14px',
          opacity: 0.8
        }}>
          버전: 3.0 - 안정화 모드
        </div>
      </header>
    </div>
  );
}

export default App;