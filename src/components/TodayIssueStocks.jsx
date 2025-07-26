import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ChaessaemCharacter from './ChaessaemCharacter';

// 실시간 주가 데이터 시뮬레이션 (실제로는 API에서 가져옴)
const generateMockStockData = (symbol) => {
  const basePrice = Math.random() * 100 + 10;
  const volatility = Math.random() * 0.3 + 0.05; // 5-35% 변동성
  const isPositive = Math.random() > 0.5;
  const change = basePrice * volatility * (isPositive ? 1 : -1);
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol,
    currentPrice: basePrice.toFixed(2),
    change: change.toFixed(2),
    changePercent: changePercent.toFixed(2),
    volume: Math.floor(Math.random() * 1000000) + 100000,
    volatility: volatility * 100,
    lastUpdate: new Date().toLocaleTimeString(),
    isHighVolatility: Math.abs(changePercent) >= 15 // 15% 이상 변동성
  };
};

// 가상의 뉴스 데이터
const generateNewsData = (symbol) => {
  const newsTemplates = {
    positive: [
      `${symbol} 실적 호조로 급등세`,
      `${symbol} 신규 사업 진출 발표`,
      `${symbol} 대규모 계약 체결`,
      `${symbol} 기술 혁신 성과 발표`
    ],
    negative: [
      `${symbol} 실적 우려로 하락`,
      `${symbol} 규제 이슈 부상`,
      `${symbol} 경영진 교체 소식`,
      `${symbol} 시장 점유율 하락`
    ],
    neutral: [
      `${symbol} 주주총회 개최 예정`,
      `${symbol} 분기 실적 발표`,
      `${symbol} 신제품 출시 계획`,
      `${symbol} 업계 동향 분석`
    ]
  };
  
  const types = ['positive', 'negative', 'neutral'];
  const selectedType = types[Math.floor(Math.random() * types.length)];
  const templates = newsTemplates[selectedType];
  const selectedNews = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    title: selectedNews,
    type: selectedType,
    time: `${Math.floor(Math.random() * 60)}분 전`,
    source: ['연합뉴스', '한국경제', '매일경제', '이데일리'][Math.floor(Math.random() * 4)]
  };
};

const TodayIssueStocks = ({ darkMode = false }) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  
  const [userWatchlist] = useLocalStorage('user_watchlist', ['UAVS', 'AAPL', 'TSLA', 'NVDA', 'MSFT']);
  const [stocksData, setStocksData] = useState({});
  const [highVolatilityStocks, setHighVolatilityStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // 실시간 주가 데이터 업데이트
  const updateStockData = useCallback(() => {
    const newStocksData = {};
    userWatchlist.forEach(symbol => {
      newStocksData[symbol] = generateMockStockData(symbol);
    });
    
    setStocksData(newStocksData);
    
    // 15% 이상 변동성 종목만 필터링
    const highVolStocks = Object.values(newStocksData)
      .filter(stock => stock.isHighVolatility)
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 5); // 상위 5개만
    
    setHighVolatilityStocks(highVolStocks);
    setLastUpdate(new Date());
    setIsLoading(false);
  }, [userWatchlist]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    updateStockData();
    
    // 30초마다 실시간 업데이트
    const interval = setInterval(updateStockData, 30000);
    return () => clearInterval(interval);
  }, [updateStockData]);

  // 뉴스 페이지로 이동
  const handleNewsClick = (symbol) => {
    // 실제로는 뉴스 페이지로 라우팅
    window.open(`/news?stock=${symbol}`, '_blank');
  };

  // 변동률에 따른 색상 결정
  const getChangeColor = (changePercent) => {
    const percent = parseFloat(changePercent);
    if (percent > 0) return '#FF6B6B'; // 상승 빨간색
    if (percent < 0) return '#4A90E2'; // 하락 파란색
    return theme.colors.muted; // 보합 회색
  };

  // 변동률에 따른 이모지
  const getChangeEmoji = (changePercent) => {
    const percent = parseFloat(changePercent);
    if (percent >= 20) return '🚀';
    if (percent >= 15) return '📈';
    if (percent <= -20) return '💥';
    if (percent <= -15) return '📉';
    return '📊';
  };

  return (
    <div style={{
      background: theme.colors.surface,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.md
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ChaessaemCharacter size="small" darkMode={darkMode} />
          <div>
            <h3 style={{
              ...typography.presets.heading.h3,
              color: typography.colors.primary,
              margin: 0
            }}>
              🔥 오늘의 이슈 종목
            </h3>
            <p style={{
              ...typography.presets.body.small,
              color: typography.colors.muted,
              margin: '4px 0 0 0'
            }}>
              관심종목 중 2주 평균 대비 15% 이상 변동성 종목
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            ...typography.presets.caption,
            color: typography.colors.muted
          }}>
            마지막 업데이트: {lastUpdate.toLocaleTimeString()}
          </div>
          <button
            onClick={updateStockData}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            🔄 새로고침
          </button>
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <ChaessaemCharacter size="normal" darkMode={darkMode} />
          <p style={{
            ...typography.presets.body.normal,
            color: typography.colors.muted,
            marginTop: '16px'
          }}>
            실시간 변동성 분석 중...
          </p>
        </div>
      ) : (
        <>
          {/* 이슈 종목이 없는 경우 */}
          {highVolatilityStocks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: `${theme.colors.accent}10`,
              borderRadius: '12px',
              border: `1px dashed ${theme.colors.accent}`
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>😴</div>
              <h4 style={{
                ...typography.presets.heading.h4,
                color: typography.colors.primary,
                marginBottom: '8px'
              }}>
                현재 이슈 종목이 없어요
              </h4>
              <p style={{
                ...typography.presets.body.normal,
                color: typography.colors.muted
              }}>
                관심종목이 모두 안정적인 상태입니다.<br/>
                15% 이상 변동성이 감지되면 알려드릴게요!
              </p>
            </div>
          ) : (
            /* 이슈 종목 리스트 */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {highVolatilityStocks.map((stock, index) => (
                <div
                  key={stock.symbol}
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.surface}, ${theme.colors.background})`,
                    border: `2px solid ${getChangeColor(stock.changePercent)}20`,
                    borderRadius: '12px',
                    padding: '20px',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* 순위 뱃지 */}
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '16px',
                    background: getChangeColor(stock.changePercent),
                    color: 'white',
                    borderRadius: '12px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {index + 1}위
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    {/* 종목 정보 */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px' }}>
                          {getChangeEmoji(stock.changePercent)}
                        </span>
                        <h4 style={{
                          ...typography.presets.heading.h4,
                          color: typography.colors.primary,
                          margin: 0
                        }}>
                          {stock.symbol}
                        </h4>
                        <span style={{
                          background: `${getChangeColor(stock.changePercent)}20`,
                          color: getChangeColor(stock.changePercent),
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {parseFloat(stock.changePercent) > 0 ? '+' : ''}{stock.changePercent}%
                        </span>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '8px'
                      }}>
                        <div>
                          <span style={{
                            ...typography.presets.caption,
                            color: typography.colors.muted
                          }}>
                            현재가
                          </span>
                          <div style={{
                            ...typography.presets.body.large,
                            color: getChangeColor(stock.changePercent),
                            fontWeight: '700'
                          }}>
                            ${stock.currentPrice}
                          </div>
                        </div>
                        
                        <div>
                          <span style={{
                            ...typography.presets.caption,
                            color: typography.colors.muted
                          }}>
                            변동금액
                          </span>
                          <div style={{
                            ...typography.presets.body.normal,
                            color: getChangeColor(stock.changePercent),
                            fontWeight: '600'
                          }}>
                            {parseFloat(stock.change) > 0 ? '+' : ''}${stock.change}
                          </div>
                        </div>
                        
                        <div>
                          <span style={{
                            ...typography.presets.caption,
                            color: typography.colors.muted
                          }}>
                            거래량
                          </span>
                          <div style={{
                            ...typography.presets.body.normal,
                            color: typography.colors.primary,
                            fontWeight: '600'
                          }}>
                            {stock.volume.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* 뉴스 미리보기 */}
                      <div style={{
                        background: `${theme.colors.accent}10`,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        marginTop: '8px'
                      }}>
                        <div style={{
                          ...typography.presets.body.small,
                          color: typography.colors.primary,
                          marginBottom: '4px'
                        }}>
                          📰 {generateNewsData(stock.symbol).title}
                        </div>
                        <div style={{
                          ...typography.presets.caption,
                          color: typography.colors.muted
                        }}>
                          {generateNewsData(stock.symbol).source} • {generateNewsData(stock.symbol).time}
                        </div>
                      </div>
                    </div>

                    {/* 뉴스 바로가기 버튼 */}
                    <div style={{ marginLeft: '20px' }}>
                      <button
                        onClick={() => handleNewsClick(stock.symbol)}
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`,
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          minWidth: '100px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>📰</span>
                        <span>실시간 뉴스</span>
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>보러가기</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 업데이트 안내 */}
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            padding: '16px',
            background: `${theme.colors.positive}10`,
            borderRadius: '8px',
            border: `1px solid ${theme.colors.positive}20`
          }}>
            <p style={{
              ...typography.presets.body.small,
              color: typography.colors.muted,
              margin: 0
            }}>
              💡 <strong>채쌤 꿀팁:</strong> 변동성이 높은 종목은 기회이자 위험입니다. 
              뉴스를 꼼꼼히 확인하고 신중하게 투자하세요!
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default TodayIssueStocks; 