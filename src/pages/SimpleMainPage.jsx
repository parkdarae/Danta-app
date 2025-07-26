import React, { useState } from 'react';
import TodayIssueStocks from '../components/TodayIssueStocks';
import KakaoStyleNotifications from '../components/KakaoStyleNotifications';
import KeywordStockDiscovery from '../components/KeywordStockDiscovery';
import EmotionalTradingJournal from '../components/EmotionalTradingJournal';
import ChaessaemCharacter from '../components/ChaessaemCharacter';
import { useLocalStorage } from '../hooks/useLocalStorage';

function SimpleMainPage() {
  const [darkMode, setDarkMode] = useLocalStorage('dark_mode', false);
  const [currentSection, setCurrentSection] = useState('dashboard');

  const sections = [
    { key: 'dashboard', label: '🏠 대시보드', icon: '🏠' },
    { key: 'issues', label: '🔥 이슈종목', icon: '🔥' },
    { key: 'discovery', label: '🧠 종목발굴', icon: '🧠' },
    { key: 'journal', label: '💭 감정기록', icon: '💭' },
    { key: 'alerts', label: '📱 실시간알람', icon: '📱' }
  ];

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'issues':
        return <TodayIssueStocks darkMode={darkMode} />;
      case 'discovery':
        return <KeywordStockDiscovery darkMode={darkMode} />;
      case 'journal':
        return <EmotionalTradingJournal darkMode={darkMode} />;
      case 'alerts':
        return <KakaoStyleNotifications darkMode={darkMode} />;
      default:
        return (
          <div>
            {/* 대시보드 - 모든 컴포넌트 요약 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {/* 이슈 종목 미리보기 */}
              <div style={{
                background: darkMode ? '#2d2d2d' : '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: `2px solid ${darkMode ? '#4A90E2' : '#667eea'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setCurrentSection('issues')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '24px' }}>🔥</span>
                  <h3 style={{
                    color: darkMode ? '#ffffff' : '#333333',
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>
                    오늘의 이슈 종목
                  </h3>
                </div>
                <p style={{
                  color: darkMode ? '#cccccc' : '#666666',
                  margin: 0,
                  lineHeight: 1.5,
                  fontSize: '14px'
                }}>
                  관심종목 중 15% 이상 변동성이 있는 종목을 실시간으로 모니터링하고, 
                  관련 뉴스를 바로 확인할 수 있어요.
                </p>
                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  background: `${darkMode ? '#4A90E2' : '#667eea'}20`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: darkMode ? '#4A90E2' : '#667eea',
                  fontWeight: '600'
                }}>
                  클릭해서 확인하기 →
                </div>
              </div>

              {/* 종목 발굴 미리보기 */}
              <div style={{
                background: darkMode ? '#2d2d2d' : '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: `2px solid ${darkMode ? '#2ECC71' : '#27ae60'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setCurrentSection('discovery')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '24px' }}>🧠</span>
                  <h3 style={{
                    color: darkMode ? '#ffffff' : '#333333',
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>
                    키워드 종목 발굴
                  </h3>
                </div>
                <p style={{
                  color: darkMode ? '#cccccc' : '#666666',
                  margin: 0,
                  lineHeight: 1.5,
                  fontSize: '14px'
                }}>
                  브레인스토밍으로 키워드를 생성하고, AI 추천을 통해 
                  숨겨진 보석 종목을 발굴해보세요.
                </p>
                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  background: `${darkMode ? '#2ECC71' : '#27ae60'}20`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: darkMode ? '#2ECC71' : '#27ae60',
                  fontWeight: '600'
                }}>
                  발굴 시작하기 →
                </div>
              </div>

              {/* 감정 기록 미리보기 */}
              <div style={{
                background: darkMode ? '#2d2d2d' : '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: `2px solid ${darkMode ? '#E74C3C' : '#e74c3c'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setCurrentSection('journal')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '24px' }}>💭</span>
                  <h3 style={{
                    color: darkMode ? '#ffffff' : '#333333',
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>
                    감정 기반 트레이딩 기록
                  </h3>
                </div>
                <p style={{
                  color: darkMode ? '#cccccc' : '#666666',
                  margin: 0,
                  lineHeight: 1.5,
                  fontSize: '14px'
                }}>
                  투자 감정과 메타인지를 기록하여 더 나은 투자 의사결정을 
                  할 수 있도록 도와드려요.
                </p>
                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  background: `${darkMode ? '#E74C3C' : '#e74c3c'}20`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: darkMode ? '#E74C3C' : '#e74c3c',
                  fontWeight: '600'
                }}>
                  기록 시작하기 →
                </div>
              </div>

              {/* 실시간 알람 미리보기 */}
              <div style={{
                background: darkMode ? '#2d2d2d' : '#ffffff',
                borderRadius: '16px',
                padding: '20px',
                border: `2px solid ${darkMode ? '#F39C12' : '#f39c12'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setCurrentSection('alerts')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '24px' }}>📱</span>
                  <h3 style={{
                    color: darkMode ? '#ffffff' : '#333333',
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>
                    실시간 카톡 알람
                  </h3>
                </div>
                <p style={{
                  color: darkMode ? '#cccccc' : '#666666',
                  margin: 0,
                  lineHeight: 1.5,
                  fontSize: '14px'
                }}>
                  가격, 손절, 뉴스, 변동성, 채쌤 팁 등 다양한 알림을 
                  카카오톡 스타일로 받아보세요.
                </p>
                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  background: `${darkMode ? '#F39C12' : '#f39c12'}20`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: darkMode ? '#F39C12' : '#f39c12',
                  fontWeight: '600'
                }}>
                  알림 설정하기 →
                </div>
              </div>
            </div>

            {/* 채쌤 소개 */}
            <div style={{
              background: `linear-gradient(135deg, ${darkMode ? '#4A90E2' : '#667eea'}15, ${darkMode ? '#2ECC71' : '#27ae60'}15)`,
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              border: `1px solid ${darkMode ? '#4A90E2' : '#667eea'}30`
            }}>
              <ChaessaemCharacter size="large" darkMode={darkMode} />
              <h2 style={{
                color: darkMode ? '#ffffff' : '#333333',
                margin: '24px 0 16px 0',
                fontSize: '28px',
                fontWeight: '700'
              }}>
                🏌️‍♀️ 안녕하세요, 채쌤입니다!
              </h2>
              <p style={{
                color: darkMode ? '#cccccc' : '#666666',
                margin: 0,
                lineHeight: 1.6,
                fontSize: '16px',
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                LPGA 투어 10승을 기록한 골프 프로이자, 투자 심리 전문 코치입니다.<br/>
                여러분의 투자 여정에서 감정을 관리하고 더 나은 의사결정을 할 수 있도록 도와드릴게요.<br/>
                <strong>특히 다룡이의 전용 AI 멘토</strong>로서 언제나 함께하겠습니다! 💖
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginTop: '24px',
                maxWidth: '800px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                <div style={{
                  background: darkMode ? '#2d2d2d' : '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                  border: `1px solid ${darkMode ? '#4A90E2' : '#667eea'}20`
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>🧠</div>
                  <h4 style={{
                    color: darkMode ? '#ffffff' : '#333333',
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    투자 심리 관리
                  </h4>
                  <p style={{
                    color: darkMode ? '#cccccc' : '#666666',
                    margin: 0,
                    fontSize: '12px',
                    lineHeight: 1.4
                  }}>
                    FOMO, 탐욕, 두려움 등<br/>
                    투자 감정을 과학적으로 분석
                  </p>
                </div>
                
                <div style={{
                  background: darkMode ? '#2d2d2d' : '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                  border: `1px solid ${darkMode ? '#2ECC71' : '#27ae60'}20`
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎯</div>
                  <h4 style={{
                    color: darkMode ? '#ffffff' : '#333333',
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    종목 발굴 전문가
                  </h4>
                  <p style={{
                    color: darkMode ? '#cccccc' : '#666666',
                    margin: 0,
                    fontSize: '12px',
                    lineHeight: 1.4
                  }}>
                    키워드 브레인스토밍으로<br/>
                    숨겨진 보석 종목 발굴
                  </p>
                </div>
                
                <div style={{
                  background: darkMode ? '#2d2d2d' : '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                  border: `1px solid ${darkMode ? '#E74C3C' : '#e74c3c'}20`
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>📱</div>
                  <h4 style={{
                    color: darkMode ? '#ffffff' : '#333333',
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    실시간 알림
                  </h4>
                  <p style={{
                    color: darkMode ? '#cccccc' : '#666666',
                    margin: 0,
                    fontSize: '12px',
                    lineHeight: 1.4
                  }}>
                    중요한 시장 변화와<br/>
                    투자 타이밍을 놓치지 않게
                  </p>
                </div>
                
                <div style={{
                  background: darkMode ? '#2d2d2d' : '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                  border: `1px solid ${darkMode ? '#9B59B6' : '#9b59b6'}20`
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>🏌️‍♀️</div>
                  <h4 style={{
                    color: darkMode ? '#ffffff' : '#333333',
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                  멘탈 코칭
                  </h4>
                  <p style={{
                    color: darkMode ? '#cccccc' : '#666666',
                    margin: 0,
                    fontSize: '12px',
                    lineHeight: 1.4
                  }}>
                    골프와 투자 모두에서<br/>
                    강인한 멘탈 관리법 전수
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode ? '#1a1a1a' : '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ChaessaemCharacter size="small" darkMode={darkMode} />
            <div>
              <h1 style={{
                color: darkMode ? '#ffffff' : '#333333',
                margin: 0,
                fontSize: '28px',
                fontWeight: '700'
              }}>
                🏌️‍♀️ 채쌤 3.0 - 다룡이 전용 AI 트레이딩 어드바이저
              </h1>
              <p style={{
                color: darkMode ? '#cccccc' : '#666666',
                margin: '4px 0 0 0',
                fontSize: '14px'
              }}>
                감정 기반 투자 심리 관리 + 스마트 종목 발굴 시스템
              </p>
            </div>
          </div>
          
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

        {/* 네비게이션 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          padding: '16px',
          background: darkMode ? '#2d2d2d' : '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          flexWrap: 'wrap'
        }}>
          {sections.map(section => (
            <button
              key={section.key}
              onClick={() => setCurrentSection(section.key)}
              style={{
                background: currentSection === section.key 
                  ? `linear-gradient(135deg, ${darkMode ? '#4A90E2' : '#667eea'}, ${darkMode ? '#2ECC71' : '#27ae60'})`
                  : 'transparent',
                color: currentSection === section.key 
                  ? 'white' 
                  : darkMode ? '#cccccc' : '#666666',
                border: currentSection === section.key 
                  ? 'none'
                  : `2px solid ${darkMode ? '#4A90E2' : '#667eea'}`,
                borderRadius: '12px',
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (currentSection !== section.key) {
                  e.target.style.background = `${darkMode ? '#4A90E2' : '#667eea'}20`;
                }
              }}
              onMouseLeave={(e) => {
                if (currentSection !== section.key) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span>{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>

        {/* 메인 콘텐츠 */}
        <div>
          {renderCurrentSection()}
        </div>

        {/* 푸터 */}
        <div style={{
          textAlign: 'center',
          padding: '32px 20px',
          marginTop: '40px',
          background: darkMode ? '#2d2d2d' : '#ffffff',
          borderRadius: '16px',
          border: `2px dashed ${darkMode ? '#4A90E2' : '#667eea'}`
        }}>
          <h3 style={{
            color: darkMode ? '#ffffff' : '#333333',
            margin: '0 0 12px 0',
            fontSize: '20px',
            fontWeight: '700'
          }}>
            🎉 모든 기능이 완성되었어요!
          </h3>
          <p style={{
            color: darkMode ? '#cccccc' : '#666666',
            margin: 0,
            lineHeight: 1.6,
            fontSize: '14px'
          }}>
            • 🔥 오늘의 이슈 종목: 15% 이상 변동성 종목 + 실시간 뉴스 연동<br/>
            • 🧠 키워드 종목 발굴: 브레인스토밍 + AI 추천 + 퀀트/밈 스톡 분석<br/>
            • 💭 감정 기반 트레이딩 기록: 메타인지 + 90일 보관 + 별표 영구보관<br/>
            • 📱 실시간 카톡 알람: 5가지 알림 타입 + 커스텀 설정<br/>
            • 🏌️‍♀️ 채쌤 AI: LPGA 프로 + 투자 심리 전문가 + 다룡이 전용 멘토
          </p>
        </div>
      </div>
    </div>
  );
}

export default SimpleMainPage; 