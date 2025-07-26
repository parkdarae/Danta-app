import React, { useState, useEffect } from 'react';
import ChaessaemEmoji from './ChaessaemEmoji';

// 기술 지표 데이터
const technicalIndicators = {
  upper: [
    {
      name: '이동평균선',
      emoji: '📈',
      simple: '최근 몇 일간의 주가 평균값을 선으로 그은 것',
      detailed: '지난 n일 동안의 주가 평균값을 이은 선으로, 주가의 전체적인 흐름을 파악할 수 있어요. 주가가 이동평균선 위에 있으면 상승추세, 아래에 있으면 하락추세로 판단해요.',
      beginner: '친구들과 시험 점수 평균을 내는 것처럼, 주식 가격의 평균을 내서 그래프로 그은 선이에요! 📊'
    },
    {
      name: '볼린저 밴드',
      emoji: '🎯',
      simple: '주가 변동폭을 알 수 있는 밴드 모양 지표',
      detailed: '주가의 변동성 추이를 파악할 수 있는 밴드 모양 지표예요. 밴드가 넓어지면 변동성이 커지고, 좁아지면 변동성이 작아져요. 주가가 밴드 위쪽에 닿으면 과매수, 아래쪽에 닿으면 과매도 신호로 봐요.',
      beginner: '주식 가격이 움직일 수 있는 범위를 보여주는 울타리 같은 거예요! 🏠'
    },
    {
      name: '일목균형표',
      emoji: '☁️',
      simple: '구름 모양으로 주가 흐름을 한눈에 보여주는 지표',
      detailed: '최근 주가 움직임을 4개의 선과 구름형태로 표현한 일본식 차트 분석법이에요. 구름 위에 주가가 있으면 상승추세, 아래에 있으면 하락추세예요.',
      beginner: '하늘의 구름처럼 생긴 지표로, 주식이 구름 위에 있으면 좋고 아래에 있으면 안 좋다고 봐요! ☁️'
    }
  ],
  lower: [
    {
      name: 'RSI',
      emoji: '🌡️',
      simple: '주식이 너무 많이 올랐는지 떨어졌는지 알려주는 온도계',
      detailed: '현재 시장의 매수/매도가 과도한지를 0~100% 사이의 수치로 측정해요. 70% 이상이면 과매수(너무 많이 올라서 조정 가능), 30% 이하면 과매도(너무 많이 떨어져서 반등 가능) 상태예요.',
      beginner: '체온계처럼 주식의 열기를 재는 거예요! 너무 뜨거우면(70% 이상) 쉬어야 하고, 너무 차가우면(30% 이하) 다시 올라갈 수 있어요! 🌡️'
    },
    {
      name: 'MACD',
      emoji: '🎢',
      simple: '주가 흐름의 변화를 미리 알려주는 지표',
      detailed: '단기/장기 이동평균선의 차이 정도를 나타내는 추세 지표예요. MACD 선이 신호선을 위로 돌파하면 매수 신호, 아래로 돌파하면 매도 신호로 해석해요.',
      beginner: '롤러코스터처럼 주식 가격의 변화를 미리 알려주는 신호등 같은 거예요! 🎢'
    },
    {
      name: '거래량',
      emoji: '📊',
      simple: '그날 주식이 얼마나 많이 거래됐는지 보여주는 막대그래프',
      detailed: '시장에서 주식이 거래된 양을 막대그래프로 표시해요. 거래량이 급증하면 주가 변동이 클 가능성이 높고, 적으면 변동이 작을 가능성이 높아요.',
      beginner: '그날 얼마나 많은 사람들이 주식을 사고팔았는지 보여주는 막대그래프예요! 📊'
    },
    {
      name: '스토캐스틱',
      emoji: '🎯',
      simple: '현재 주가가 최근 기간에서 어느 위치에 있는지 알려주는 지표',
      detailed: '현재 주가가 일정 기간의 고가-저가 사이 어느 지점에 있는지를 %로 표현해요. 80% 이상이면 과매수, 20% 이하면 과매도 신호로 봐요.',
      beginner: '시험 성적처럼 현재 주식 가격이 최근에 비해 몇 등인지 알려주는 점수표예요! 🎯'
    }
  ]
};

function TutorialHelper({ darkMode = false, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('upper');
  const [tutorialMode, setTutorialMode] = useState(() => {
    return localStorage.getItem('tutorialMode') !== 'false';
  });

  const bg = darkMode ? '#1a1a1a' : '#fff';
  const border = darkMode ? '#333' : '#e0e0e0';
  const text = darkMode ? '#e0e0e0' : '#222';
  const accent = '#8884d8';

  const tutorialSteps = [
    {
      title: '📚 주식 차트 기초',
      content: '안녕하세요! 주식 투자가 처음이시군요! 😊 차트는 주식의 가격 변화를 그래프로 보여주는 거예요. 마치 게임 캐릭터의 체력바나 점수판 같은 거라고 생각하면 돼요!',
      emoji: '📈'
    },
    {
      title: '📊 상단 지표란?',
      content: '상단 지표는 차트 위에 그어지는 선들이에요! 이동평균선, 볼린저 밴드 같은 것들이 있어요. 이건 주식 가격의 흐름을 더 쉽게 파악할 수 있게 도와주는 도구예요!',
      emoji: '⬆️'
    },
    {
      title: '📉 하단 지표란?',
      content: '하단 지표는 차트 아래쪽에 따로 보여지는 그래프들이에요! RSI, MACD 같은 것들이 있어요. 이건 주식이 지금 사기 좋은 타이밍인지, 팔기 좋은 타이밍인지 알려주는 신호등 같은 거예요!',
      emoji: '⬇️'
    },
    {
      title: '🎯 지표 사용법',
      content: '지표들은 100% 정확하지 않아요! 날씨 예보처럼 참고용으로 사용하는 거예요. 여러 지표를 함께 보고, 뉴스나 다른 정보도 같이 확인해서 판단하는 게 중요해요!',
      emoji: '⚠️'
    }
  ];

  const currentIndicators = technicalIndicators[selectedCategory];

  useEffect(() => {
    localStorage.setItem('tutorialMode', tutorialMode);
  }, [tutorialMode]);

  if (!tutorialMode) {
    return (
      <button
        onClick={() => setTutorialMode(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: `linear-gradient(45deg, ${accent}, #ff6b6b)`,
          color: '#fff',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 20px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '700',
          boxShadow: '0 4px 15px rgba(136, 132, 216, 0.4)',
          zIndex: 1000,
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
        }}
      >
        🎓 도움말 켜기
      </button>
    );
  }

  return (
    <div style={{
      background: bg,
      border: `2px solid ${border}`,
      borderRadius: '20px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ChaessaemEmoji
            type="emotions"
            emotion="confident"
            size="normal"
            showMessage={false}
            autoAnimation={true}
            darkMode={darkMode}
          />
          <h3 style={{
            margin: 0,
            color: accent,
            fontSize: '1.4rem',
            fontWeight: '800',
            background: `linear-gradient(45deg, ${accent}, #ff6b6b)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            채쌤의 주식 초보자 가이드
          </h3>
        </div>
        <button
          onClick={() => setTutorialMode(false)}
          style={{
            background: 'transparent',
            border: `2px solid ${border}`,
            borderRadius: '50px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '12px',
            color: text,
            fontWeight: '600'
          }}
        >
          ❌ 가이드 끄기
        </button>
      </div>

      {/* 튜토리얼 단계 */}
      {currentStep < tutorialSteps.length && (
        <div style={{
          background: darkMode ? '#2a2a2a' : '#f8f9fa',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: `2px solid ${accent}40`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '2rem', marginRight: '1rem' }}>
              {tutorialSteps[currentStep].emoji}
            </div>
            <div>
              <h4 style={{
                margin: '0 0 0.5rem 0',
                color: accent,
                fontSize: '1.2rem',
                fontWeight: '700'
              }}>
                {tutorialSteps[currentStep].title}
              </h4>
              <div style={{
                fontSize: '0.9rem',
                color: text,
                lineHeight: '1.6'
              }}>
                {tutorialSteps[currentStep].content}
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '0.8rem',
              color: darkMode ? '#aaa' : '#666'
            }}>
              {currentStep + 1} / {tutorialSteps.length} 단계
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  style={{
                    background: 'transparent',
                    border: `2px solid ${border}`,
                    borderRadius: '20px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: text
                  }}
                >
                  ← 이전
                </button>
              )}
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                style={{
                  background: `linear-gradient(45deg, ${accent}, #ff6b6b)`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                {currentStep === tutorialSteps.length - 1 ? '완료!' : '다음 →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 지표 설명 섹션 */}
      {currentStep >= tutorialSteps.length && (
        <>
          {/* 카테고리 선택 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={() => setSelectedCategory('upper')}
              style={{
                background: selectedCategory === 'upper' 
                  ? `linear-gradient(45deg, ${accent}, #ff6b6b)` 
                  : 'transparent',
                color: selectedCategory === 'upper' ? '#fff' : text,
                border: `2px solid ${selectedCategory === 'upper' ? 'transparent' : border}`,
                borderRadius: '25px',
                padding: '0.8rem 1.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '700',
                transition: 'all 0.3s'
              }}
            >
              ⬆️ 상단 지표
            </button>
            <button
              onClick={() => setSelectedCategory('lower')}
              style={{
                background: selectedCategory === 'lower' 
                  ? `linear-gradient(45deg, ${accent}, #ff6b6b)` 
                  : 'transparent',
                color: selectedCategory === 'lower' ? '#fff' : text,
                border: `2px solid ${selectedCategory === 'lower' ? 'transparent' : border}`,
                borderRadius: '25px',
                padding: '0.8rem 1.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '700',
                transition: 'all 0.3s'
              }}
            >
              ⬇️ 하단 지표
            </button>
          </div>

          {/* 지표 설명 카드들 */}
          <div style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
          }}>
            {currentIndicators.map((indicator, index) => (
              <div
                key={index}
                style={{
                  background: darkMode ? '#2a2a2a' : '#f8f9fa',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: `2px solid ${border}`,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '1.5rem', marginRight: '0.8rem' }}>
                    {indicator.emoji}
                  </div>
                  <h4 style={{
                    margin: 0,
                    color: accent,
                    fontSize: '1.1rem',
                    fontWeight: '700'
                  }}>
                    {indicator.name}
                  </h4>
                </div>
                
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.8rem',
                  background: darkMode ? '#1a1a1a' : '#fff',
                  borderRadius: '12px',
                  border: `1px solid ${border}`
                }}>
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#ff6b6b',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    🎒 중고등학생도 이해하는 설명:
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: text,
                    lineHeight: '1.5'
                  }}>
                    {indicator.beginner}
                  </div>
                </div>

                <div style={{
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  color: text,
                  fontWeight: '600',
                  lineHeight: '1.4'
                }}>
                  💡 {indicator.simple}
                </div>

                <div style={{
                  fontSize: '0.85rem',
                  color: darkMode ? '#ccc' : '#555',
                  lineHeight: '1.5'
                }}>
                  📖 <strong>자세한 설명:</strong> {indicator.detailed}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 도움말 */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: darkMode ? '#1a2a1a' : '#f0f8ff',
        borderRadius: '12px',
        border: `2px solid ${darkMode ? '#333' : '#e3f2fd'}`,
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '0.9rem',
          color: text,
          lineHeight: '1.5'
        }}>
          💡 <strong>기억하세요:</strong> 기술 지표는 참고용일 뿐이에요! 
          여러 지표를 함께 보고, 뉴스와 기업 정보도 확인해서 신중하게 투자 결정을 내리세요! 📊✨
        </div>
      </div>
    </div>
  );
}

export default TutorialHelper; 