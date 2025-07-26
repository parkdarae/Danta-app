import React, { useState } from 'react';

const CategoryNavigation = ({ currentCategory, onCategoryChange, darkMode = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    {
      id: 'trading',
      name: '📈 트레이딩',
      description: '차트, 종목선택, 매매기록',
      icon: '📊'
    },
    {
      id: 'analysis',
      name: '🔍 분석도구',
      description: 'AI분석, 데이터마이닝, 심리분석',
      icon: '🧠'
    },
    {
      id: 'news',
      name: '📰 뉴스정보',
      description: '실시간뉴스, 트렌드분석',
      icon: '📺'
    },
    {
      id: 'portfolio',
      name: '💼 포트폴리오',
      description: '보유종목, 수익률관리',
      icon: '💰'
    },
    {
      id: 'tools',
      name: '🛠️ 도구',
      description: '데이터관리, 설정, 튜토리얼',
      icon: '⚙️'
    }
  ];

  const theme = {
    background: darkMode ? '#1a1a1a' : '#ffffff',
    text: darkMode ? '#e0e0e0' : '#333333',
    accent: '#8884d8',
    border: darkMode ? '#333333' : '#e0e0e0',
    hover: darkMode ? '#2a2a2a' : '#f5f5f5',
    overlay: darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'
  };

  const handleCategorySelect = (categoryId) => {
    onCategoryChange(categoryId);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* 햄버거 메뉴 버튼 */}
      <button
        onClick={() => setIsMenuOpen(true)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          background: theme.accent,
          border: 'none',
          borderRadius: '8px',
          padding: '12px',
          color: 'white',
          fontSize: '18px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        }}
      >
        ☰
      </button>

      {/* 카테고리 선택 모달 */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.overlay,
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            style={{
              background: theme.background,
              borderRadius: '16px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: `1px solid ${theme.border}`,
              animation: 'slideUp 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px',
              borderBottom: `2px solid ${theme.border}`,
              paddingBottom: '15px'
            }}>
              <h2 style={{
                margin: 0,
                color: theme.text,
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                📂 카테고리 선택
              </h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: theme.text,
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = theme.hover;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                }}
              >
                ✕
              </button>
            </div>

            {/* 현재 선택된 카테고리 표시 */}
            <div style={{
              background: `${theme.accent}20`,
              border: `2px solid ${theme.accent}`,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <span style={{ color: theme.accent, fontWeight: 'bold' }}>
                현재: {categories.find(cat => cat.id === currentCategory)?.name || '📈 트레이딩'}
              </span>
            </div>

            {/* 카테고리 목록 */}
            <div style={{
              display: 'grid',
              gap: '15px'
            }}>
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  style={{
                    background: currentCategory === category.id ? `${theme.accent}20` : theme.hover,
                    border: currentCategory === category.id ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (currentCategory !== category.id) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      e.target.style.background = `${theme.accent}10`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentCategory !== category.id) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = theme.hover;
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <div style={{
                      fontSize: '32px',
                      minWidth: '50px',
                      textAlign: 'center'
                    }}>
                      {category.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        margin: 0,
                        color: theme.text,
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginBottom: '5px'
                      }}>
                        {category.name}
                      </h3>
                      <p style={{
                        margin: 0,
                        color: darkMode ? '#aaa' : '#666',
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        {category.description}
                      </p>
                    </div>
                    {currentCategory === category.id && (
                      <div style={{
                        color: theme.accent,
                        fontSize: '20px',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 하단 안내 */}
            <div style={{
              marginTop: '25px',
              textAlign: 'center',
              color: darkMode ? '#888' : '#666',
              fontSize: '12px',
              borderTop: `1px solid ${theme.border}`,
              paddingTop: '15px'
            }}>
              💡 카테고리를 선택하면 해당 기능들이 표시됩니다
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default CategoryNavigation; 