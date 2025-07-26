import React, { useState, useCallback } from 'react';
import KeywordBrainstormingSystem from './KeywordBrainstormingSystem';
import StockDiscoveryEngine from './StockDiscoveryEngine';

const KeywordToStockWorkflow = ({ darkMode = false, onStockSelect }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: 브레인스토밍, 2: 종목 발굴
  const [generatedKeywords, setGeneratedKeywords] = useState([]);
  const [discoveredStocks, setDiscoveredStocks] = useState([]);

  const theme = {
    bg: darkMode ? '#1a1a1a' : '#ffffff',
    cardBg: darkMode ? '#2d2d2d' : '#f8f9fa',
    text: darkMode ? '#ffffff' : '#333333',
    subtext: darkMode ? '#cccccc' : '#666666',
    border: darkMode ? '#404040' : '#e0e0e0',
    accent: '#007bff',
    positive: '#00c851',
    negative: '#ff4444',
    warning: '#ffbb33',
    purple: '#9c27b0',
    teal: '#20c997',
    orange: '#ff6b35'
  };

  // 키워드 생성 완료 처리
  const handleKeywordsGenerated = useCallback((keywords) => {
    setGeneratedKeywords(keywords);
    setCurrentStep(2);
    console.log('🧠 키워드 생성 완료:', keywords);
  }, []);

  // 종목 추적 시작 처리
  const handleStockTrack = useCallback((stock) => {
    if (onStockSelect) {
      onStockSelect(stock);
    }
    
    // 발굴된 종목 목록에 추가
    setDiscoveredStocks(prev => {
      const exists = prev.find(s => s.symbol === stock.symbol);
      if (!exists) {
        return [stock, ...prev.slice(0, 9)]; // 최대 10개 유지
      }
      return prev;
    });
    
    console.log('📈 종목 추적 시작:', stock);
  }, [onStockSelect]);

  // 단계 재설정
  const resetWorkflow = useCallback(() => {
    setCurrentStep(1);
    setGeneratedKeywords([]);
  }, []);

  // 이전 단계로
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  return (
    <div style={{
      background: theme.bg,
      borderRadius: '12px',
      border: `2px solid ${theme.border}`,
      overflow: 'hidden',
      marginBottom: '20px'
    }}>
      {/* 진행 상황 헤더 */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.purple}, ${theme.orange})`,
        padding: '20px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
              🚀 키워드 → 종목 발굴 워크플로우
            </h2>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
              생각의 흐름을 투자 기회로 전환하는 체계적 접근
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {currentStep > 1 && (
              <button
                onClick={goToPreviousStep}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                ← 이전 단계
              </button>
            )}
            <button
              onClick={resetWorkflow}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              🔄 처음부터
            </button>
          </div>
        </div>

        {/* 진행 단계 표시 */}
        <div style={{ marginTop: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {[
              { step: 1, label: '🧠 브레인스토밍', desc: '키워드 생성' },
              { step: 2, label: '🔍 종목 발굴', desc: '투자 기회 탐색' },
              { step: 3, label: '📈 추적 시작', desc: '관심종목 관리' }
            ].map((item, index) => (
              <React.Fragment key={item.step}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: currentStep >= item.step ? 1 : 0.5
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: currentStep >= item.step ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                    color: currentStep >= item.step ? theme.purple : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '5px'
                  }}>
                    {currentStep > item.step ? '✓' : item.step}
                  </div>
                  <div style={{ fontSize: '12px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '600' }}>{item.label}</div>
                    <div style={{ opacity: 0.8 }}>{item.desc}</div>
                  </div>
                </div>
                {index < 2 && (
                  <div style={{
                    width: '30px',
                    height: '2px',
                    background: currentStep > item.step ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                    marginTop: '-15px'
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 현재 단계 컨텐츠 */}
      <div style={{ padding: '0' }}>
        {currentStep === 1 && (
          <KeywordBrainstormingSystem
            darkMode={darkMode}
            onKeywordsGenerated={handleKeywordsGenerated}
          />
        )}

        {currentStep === 2 && (
          <StockDiscoveryEngine
            darkMode={darkMode}
            keywords={generatedKeywords}
            onStockTrack={handleStockTrack}
          />
        )}
      </div>

      {/* 워크플로우 요약 */}
      {currentStep === 2 && generatedKeywords.length > 0 && (
        <div style={{
          background: theme.cardBg,
          padding: '20px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <h3 style={{ color: theme.text, fontSize: '16px', marginBottom: '15px' }}>
            📋 워크플로우 요약
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            {/* 사용된 키워드 */}
            <div style={{
              background: theme.bg,
              padding: '15px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ color: theme.text, fontSize: '14px', marginBottom: '10px' }}>
                🏷️ 생성된 키워드 ({generatedKeywords.length}개)
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {generatedKeywords.map(keyword => (
                  <span
                    key={keyword}
                    style={{
                      background: theme.accent,
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* 발굴된 종목 통계 */}
            <div style={{
              background: theme.bg,
              padding: '15px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ color: theme.text, fontSize: '14px', marginBottom: '10px' }}>
                📊 발굴 현황
              </h4>
              <div style={{ fontSize: '12px', color: theme.subtext, lineHeight: '1.4' }}>
                <div>• 총 발굴 종목: 검색 결과 참조</div>
                <div>• 추적 시작: {discoveredStocks.length}개</div>
                <div>• 키워드 매칭: 자동 점수화</div>
                <div>• 분석 기준: 동전주/밈/퀀트</div>
              </div>
            </div>

            {/* 다음 액션 */}
            <div style={{
              background: theme.bg,
              padding: '15px',
              borderRadius: '8px',
              border: `1px solid ${theme.positive}`
            }}>
              <h4 style={{ color: theme.text, fontSize: '14px', marginBottom: '10px' }}>
                🎯 권장 다음 액션
              </h4>
              <div style={{ fontSize: '12px', color: theme.subtext, lineHeight: '1.4' }}>
                <div>• 관심 종목 추적 시작</div>
                <div>• 감정 기록과 연동</div>
                <div>• 뉴스 모니터링 설정</div>
                <div>• 매수 이유 사전 정리</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 추적 중인 종목 요약 */}
      {discoveredStocks.length > 0 && (
        <div style={{
          background: theme.cardBg,
          padding: '20px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <h3 style={{ color: theme.text, fontSize: '16px', marginBottom: '15px' }}>
            📈 추적 중인 종목 ({discoveredStocks.length}개)
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {discoveredStocks.map(stock => (
              <div
                key={stock.symbol}
                style={{
                  background: theme.bg,
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`,
                  cursor: 'pointer'
                }}
                onClick={() => onStockSelect && onStockSelect(stock)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>
                      {stock.symbol}
                      {stock.symbol === 'UAVS' && ' 🎯🚁'}
                      {stock.isPennyStock && ' 🪙'}
                    </div>
                    <div style={{ color: theme.subtext, fontSize: '11px' }}>
                      {stock.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: theme.text, fontSize: '12px', fontWeight: '600' }}>
                      {stock.currency === 'USD' ? '$' : ''}{stock.price?.toFixed(2)}
                      {stock.currency === 'KRW' ? '원' : ''}
                    </div>
                    <div style={{ fontSize: '10px', color: theme.subtext }}>
                      밈:{stock.memeScore} 퀀트:{stock.quantScore}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 하단 정보 */}
      <div style={{
        background: theme.cardBg,
        padding: '15px 20px',
        borderTop: `1px solid ${theme.border}`,
        fontSize: '12px',
        color: theme.subtext,
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        <div>🚀 체계적 접근으로 투자 기회를 놓치지 마세요</div>
        <div>🧠 생각 → 키워드 → 종목 → 감정 → 추적의 완전한 루프</div>
      </div>
    </div>
  );
};

export default KeywordToStockWorkflow; 