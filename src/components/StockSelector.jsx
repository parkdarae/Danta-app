import React from 'react';
import { useNavigate } from 'react-router-dom';

function StockSelector({ stocks, selected, onChange, darkMode = false }) {
  const navigate = useNavigate();
  
  const bg = darkMode ? '#23272b' : '#fff';
  const text = darkMode ? '#e0e0e0' : '#222';
  const subtext = darkMode ? '#aaa' : '#888';
  const border = darkMode ? '#333' : '#eee';
  const accent = '#8884d8';

  const stockEmojis = {
    '에이지이글': '🦅',
    '삼성전자': '📱',
    '카카오': '💬'
  };

  const stockDescriptions = {
    '에이지이글': '코스닥 성장주',
    '삼성전자': '대형주 대표',
    '카카오': 'IT 플랫폼'
  };

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: accent,
          fontSize: '1.3rem',
          fontWeight: '700'
        }}>
          📈 종목 선택
        </h3>
        <button
          onClick={() => navigate(`/news/${selected}`)}
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(136, 132, 216, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(136, 132, 216, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(136, 132, 216, 0.3)';
          }}
        >
          📰 뉴스 보기
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '1rem'
      }}>
        {stocks.map(stock => (
          <div
            key={stock}
            onClick={() => onChange(stock)}
            style={{
              background: selected === stock 
                ? `linear-gradient(135deg, ${accent}22, ${accent}11)` 
                : (darkMode ? '#1a1a1a' : '#f8f9fa'),
              border: selected === stock 
                ? `2px solid ${accent}` 
                : `2px solid ${border}`,
              borderRadius: '12px',
              padding: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (selected !== stock) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = darkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.1)';
                e.target.style.borderColor = accent + '88';
              }
            }}
            onMouseLeave={(e) => {
              if (selected !== stock) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = border;
              }
            }}
          >
            {selected === stock && (
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: accent,
                color: '#fff',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                ✓
              </div>
            )}
            
            <div style={{ 
              fontSize: '2rem', 
              marginBottom: '0.5rem' 
            }}>
              {stockEmojis[stock] || '📊'}
            </div>
            
            <div style={{
              fontWeight: '700',
              fontSize: '1.1rem',
              color: selected === stock ? accent : text,
              marginBottom: '0.25rem'
            }}>
              {stock}
            </div>
            
            <div style={{
              fontSize: '0.85rem',
              color: subtext,
              fontWeight: '500'
            }}>
              {stockDescriptions[stock] || '투자 종목'}
            </div>

            {selected === stock && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.25rem 0.5rem',
                background: accent + '22',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: accent,
                fontWeight: '600'
              }}>
                선택됨
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: darkMode ? '#1a1a1a' : '#f0f8ff',
        borderRadius: '8px',
        border: `1px solid ${darkMode ? '#333' : '#e3f2fd'}`,
        fontSize: '0.9rem',
        color: subtext,
        textAlign: 'center'
      }}>
        💡 종목을 선택하면 실시간 차트와 분석 정보를 확인할 수 있습니다
      </div>
    </div>
  );
}

export default StockSelector; 