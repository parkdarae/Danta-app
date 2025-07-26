import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import EnhancedButton from './EnhancedButton';

const CategoryNavigation = ({ currentCategory, onCategoryChange, darkMode = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef(null);
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);

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
      id: 'psychology',
      name: '🧠 감정 & 메타인지',
      description: '감정기록, 메타인지분석, 투자심리',
      icon: '🎭'
    },
    {
      id: 'discovery',
      name: '🚀 키워드 종목 발굴',
      description: '브레인스토밍, 동전주, 밈주식, 퀀트분석',
      icon: '🔍'
    },
    {
      id: 'tools',
      name: '🛠️ 도구',
      description: '데이터관리, 설정, 튜토리얼',
      icon: '⚙️'
    }
  ];

  // 키보드 네비게이션 지원
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isMenuOpen) return;
      
      switch (e.key) {
        case 'Escape':
          setIsMenuOpen(false);
          setFocusedIndex(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev < categories.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : categories.length - 1
          );
          break;
        case 'Enter':
          if (focusedIndex >= 0) {
            handleCategorySelect(categories[focusedIndex].id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, focusedIndex, categories]);

  const handleCategorySelect = (categoryId) => {
    onCategoryChange(categoryId);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* 햄버거 메뉴 버튼 */}
      <EnhancedButton
        onClick={() => setIsMenuOpen(true)}
        variant="primary"
        size="normal"
        icon="☰"
        tooltip="카테고리 메뉴 열기 (단축키: M)"
        darkMode={darkMode}
        data-guide="category-button"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          width: '48px',
          height: '48px',
          padding: '0',
          borderRadius: '12px'
        }}
      />

      {/* 카테고리 선택 모달 */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            ref={menuRef}
            style={{
              background: theme.bg,
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '640px',
              width: '90%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: theme.shadows.xl,
              border: `2px solid ${theme.border}`,
              fontFamily: typography.fontFamily.primary,
              animation: 'slideUp 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '28px',
              borderBottom: `2px solid ${theme.border}`,
              paddingBottom: '20px'
            }}>
              <h2 style={{
                ...typography.presets.heading.h2,
                color: typography.colors.primary,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                📂 <span>카테고리 선택</span>
              </h2>
              <EnhancedButton
                onClick={() => setIsMenuOpen(false)}
                variant="ghost"
                size="small"
                icon="✕"
                tooltip="닫기 (Esc)"
                darkMode={darkMode}
                style={{
                  width: '36px',
                  height: '36px',
                  padding: '0'
                }}
              />
            </div>

            {/* 현재 선택된 카테고리 표시 */}
            <div style={{
              background: `${theme.accent}15`,
              border: `2px solid ${theme.accent}`,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{ 
                ...typography.presets.label,
                color: typography.colors.muted,
                marginBottom: '4px'
              }}>
                현재 선택된 카테고리
              </div>
              <div style={{ 
                ...typography.presets.body.large,
                color: theme.accent, 
                fontWeight: typography.fontWeight.bold
              }}>
                {categories.find(cat => cat.id === currentCategory)?.name || '📈 트레이딩'}
              </div>
            </div>

            {/* 카테고리 목록 */}
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {categories.map((category, index) => (
                <EnhancedButton
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  variant={currentCategory === category.id ? "primary" : "secondary"}
                  size="large"
                  darkMode={darkMode}
                  data-guide={category.id === 'discovery' ? 'keyword-discovery' : undefined}
                  style={{
                    width: '100%',
                    height: 'auto',
                    padding: '20px',
                    justifyContent: 'flex-start',
                    background: focusedIndex === index ? `${theme.accent}20` : undefined,
                    border: focusedIndex === index ? `2px solid ${theme.accent}` : undefined
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    width: '100%'
                  }}>
                    <div style={{
                      fontSize: '36px',
                      minWidth: '54px',
                      textAlign: 'center'
                    }}>
                      {category.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        ...typography.presets.heading.h4,
                        color: currentCategory === category.id ? 'white' : typography.colors.primary,
                        margin: '0 0 6px 0'
                      }}>
                        {category.name}
                      </h3>
                      <p style={{
                        ...typography.presets.body.small,
                        color: currentCategory === category.id ? 'rgba(255,255,255,0.8)' : typography.colors.secondary,
                        margin: 0,
                        lineHeight: typography.lineHeight.normal
                      }}>
                        {category.description}
                      </p>
                    </div>
                    {currentCategory === category.id && (
                      <div style={{
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: typography.fontWeight.bold
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                </EnhancedButton>
              ))}
            </div>

            {/* 하단 안내 */}
            <div style={{
              marginTop: '28px',
              textAlign: 'center',
              borderTop: `1px solid ${theme.border}`,
              paddingTop: '20px'
            }}>
              <div style={{
                ...typography.presets.caption,
                color: typography.colors.muted,
                marginBottom: '8px'
              }}>
                💡 키보드 단축키
              </div>
              <div style={{
                ...typography.presets.body.xs,
                color: typography.colors.muted,
                lineHeight: typography.lineHeight.relaxed
              }}>
                ↑↓ 선택 | Enter 확인 | Esc 닫기 | M 메뉴
              </div>
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