import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import ChaessaemCharacter from '../components/ChaessaemCharacter';

// 가상의 뉴스 데이터 생성
const generateStockNews = (symbol) => {
  const newsCategories = {
    earnings: '실적',
    merger: '인수합병',
    product: '신제품',
    regulatory: '규제',
    market: '시장',
    analyst: '애널리스트'
  };

  const newsTemplates = [
    {
      category: 'earnings',
      title: `${symbol} 3분기 실적 시장 예상치 상회`,
      content: `${symbol}가 3분기 실적에서 시장 예상치를 크게 상회하며 투자자들의 관심을 끌고 있습니다. 매출액과 영업이익 모두 전년 동기 대비 큰 폭으로 증가했습니다.`,
      impact: 'positive',
      source: '한국경제',
      time: '15분 전'
    },
    {
      category: 'product',
      title: `${symbol} 혁신적인 신제품 라인업 공개`,
      content: `${symbol}가 차세대 기술을 적용한 신제품을 공개했습니다. 업계 전문가들은 이번 제품이 시장 판도를 바꿀 수 있을 것으로 전망하고 있습니다.`,
      impact: 'positive',
      source: '매일경제',
      time: '32분 전'
    },
    {
      category: 'market',
      title: `${symbol} 주가 급등, 거래량 폭증`,
      content: `${symbol} 주가가 장중 급등세를 보이며 거래량이 평소 대비 3배 이상 증가했습니다. 기관 투자자들의 매수세가 이어지고 있습니다.`,
      impact: 'positive',
      source: '이데일리',
      time: '1시간 전'
    },
    {
      category: 'analyst',
      title: `${symbol} 목표주가 상향 조정`,
      content: `대형 증권사가 ${symbol}의 목표주가를 20% 상향 조정했습니다. 강력한 실적 성장과 시장 점유율 확대가 주된 이유로 분석됩니다.`,
      impact: 'positive',
      source: '연합뉴스',
      time: '2시간 전'
    },
    {
      category: 'regulatory',
      title: `${symbol} 관련 규제 변화 예고`,
      content: `${symbol}과 관련된 업계 규제가 변화할 예정입니다. 이번 규제 변화가 향후 사업 전략에 미칠 영향에 대해 시장의 관심이 집중되고 있습니다.`,
      impact: 'neutral',
      source: '파이낸셜뉴스',
      time: '3시간 전'
    }
  ];

  return newsTemplates.map((template, index) => ({
    id: `${symbol}-${index}`,
    ...template,
    readCount: Math.floor(Math.random() * 10000) + 1000,
    commentCount: Math.floor(Math.random() * 200) + 10
  }));
};

// 관련 종목 데이터
const getRelatedStocks = (currentSymbol) => {
  const allStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'UAVS'];
  return allStocks
    .filter(stock => stock !== currentSymbol)
    .slice(0, 4)
    .map(symbol => ({
      symbol,
      change: (Math.random() * 10 - 5).toFixed(2),
      changePercent: (Math.random() * 10 - 5).toFixed(2)
    }));
};

const StockNewsPage = ({ darkMode = false }) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const stockSymbol = searchParams.get('stock') || 'UAVS';
  const [newsData, setNewsData] = useState([]);
  const [relatedStocks, setRelatedStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 뉴스 데이터 로드
  useEffect(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      const news = generateStockNews(stockSymbol);
      setNewsData(news);
      setRelatedStocks(getRelatedStocks(stockSymbol));
      setIsLoading(false);
    }, 1000);
  }, [stockSymbol]);

  // 뉴스 필터링
  const filteredNews = selectedCategory === 'all' 
    ? newsData 
    : newsData.filter(news => news.category === selectedCategory);

  // 임팩트에 따른 색상
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'positive': return '#50C878';
      case 'negative': return '#FF6B6B';
      default: return theme.colors.muted;
    }
  };

  // 임팩트 이모지
  const getImpactEmoji = (impact) => {
    switch (impact) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '📊';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.background,
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* 헤더 */}
        <div style={{
          background: theme.colors.surface,
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.md
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: 'transparent',
                  border: `2px solid ${theme.colors.accent}`,
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  color: theme.colors.accent,
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ←
              </button>
              
              <ChaessaemCharacter size="normal" darkMode={darkMode} />
              
              <div>
                <h1 style={{
                  ...typography.presets.heading.h1,
                  color: typography.colors.primary,
                  margin: 0
                }}>
                  📰 {stockSymbol} 실시간 뉴스
                </h1>
                <p style={{
                  ...typography.presets.body.normal,
                  color: typography.colors.muted,
                  margin: '8px 0 0 0'
                }}>
                  최신 뉴스와 시장 분석을 실시간으로 확인하세요
                </p>
              </div>
            </div>
            
            <div style={{
              background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`,
              color: 'white',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              총 {newsData.length}개 뉴스
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {[
              { key: 'all', label: '전체', icon: '📰' },
              { key: 'earnings', label: '실적', icon: '💰' },
              { key: 'product', label: '신제품', icon: '🚀' },
              { key: 'market', label: '시장', icon: '📈' },
              { key: 'analyst', label: '애널리스트', icon: '🔍' },
              { key: 'regulatory', label: '규제', icon: '⚖️' }
            ].map(category => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                style={{
                  background: selectedCategory === category.key 
                    ? `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`
                    : 'transparent',
                  color: selectedCategory === category.key ? 'white' : theme.colors.accent,
                  border: `2px solid ${theme.colors.accent}`,
                  borderRadius: '20px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.3s ease'
                }}
              >
                <span>{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '24px'
        }}>
          {/* 뉴스 리스트 */}
          <div>
            {isLoading ? (
              <div style={{
                background: theme.colors.surface,
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                border: `1px solid ${theme.colors.border}`
              }}>
                <ChaessaemCharacter size="large" darkMode={darkMode} />
                <p style={{
                  ...typography.presets.body.normal,
                  color: typography.colors.muted,
                  marginTop: '16px'
                }}>
                  최신 뉴스를 불러오고 있어요...
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredNews.map((news, index) => (
                  <div
                    key={news.id}
                    style={{
                      background: theme.colors.surface,
                      borderRadius: '16px',
                      padding: '24px',
                      border: `1px solid ${theme.colors.border}`,
                      boxShadow: theme.shadows.md,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = theme.shadows.lg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = theme.shadows.md;
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '20px' }}>
                          {getImpactEmoji(news.impact)}
                        </span>
                        <span style={{
                          background: `${getImpactColor(news.impact)}20`,
                          color: getImpactColor(news.impact),
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {news.category}
                        </span>
                      </div>
                      
                      <div style={{
                        textAlign: 'right',
                        ...typography.presets.caption,
                        color: typography.colors.muted
                      }}>
                        <div>{news.source}</div>
                        <div>{news.time}</div>
                      </div>
                    </div>

                    <h3 style={{
                      ...typography.presets.heading.h3,
                      color: typography.colors.primary,
                      marginBottom: '12px',
                      lineHeight: 1.4
                    }}>
                      {news.title}
                    </h3>

                    <p style={{
                      ...typography.presets.body.normal,
                      color: typography.colors.secondary,
                      lineHeight: 1.6,
                      marginBottom: '16px'
                    }}>
                      {news.content}
                    </p>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: `1px solid ${theme.colors.border}`,
                      paddingTop: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        ...typography.presets.caption,
                        color: typography.colors.muted
                      }}>
                        <span>👁️ {news.readCount.toLocaleString()}</span>
                        <span>💬 {news.commentCount}</span>
                      </div>
                      
                      <button style={{
                        background: `linear-gradient(135deg, ${theme.colors.accent}20, ${theme.colors.primary}20)`,
                        color: theme.colors.accent,
                        border: `1px solid ${theme.colors.accent}`,
                        borderRadius: '8px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        자세히 보기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 관련 종목 */}
            <div style={{
              background: theme.colors.surface,
              borderRadius: '16px',
              padding: '20px',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadows.md
            }}>
              <h4 style={{
                ...typography.presets.heading.h4,
                color: typography.colors.primary,
                marginBottom: '16px'
              }}>
                📊 관련 종목
              </h4>
              
              {relatedStocks.map(stock => (
                <div
                  key={stock.symbol}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: `1px solid ${theme.colors.border}`,
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/news?stock=${stock.symbol}`)}
                >
                  <span style={{
                    ...typography.presets.body.normal,
                    color: typography.colors.primary,
                    fontWeight: '600'
                  }}>
                    {stock.symbol}
                  </span>
                  <span style={{
                    ...typography.presets.body.small,
                    color: parseFloat(stock.changePercent) >= 0 ? '#50C878' : '#FF6B6B',
                    fontWeight: '600'
                  }}>
                    {parseFloat(stock.changePercent) >= 0 ? '+' : ''}{stock.changePercent}%
                  </span>
                </div>
              ))}
            </div>

            {/* 채쌤 팁 */}
            <div style={{
              background: `linear-gradient(135deg, ${theme.colors.accent}15, ${theme.colors.primary}15)`,
              borderRadius: '16px',
              padding: '20px',
              border: `1px solid ${theme.colors.accent}`,
              textAlign: 'center'
            }}>
              <ChaessaemCharacter size="normal" darkMode={darkMode} />
              <h4 style={{
                ...typography.presets.heading.h4,
                color: typography.colors.primary,
                margin: '12px 0 8px 0'
              }}>
                💡 채쌤 뉴스 분석 팁
              </h4>
              <p style={{
                ...typography.presets.body.small,
                color: typography.colors.secondary,
                lineHeight: 1.5
              }}>
                뉴스는 팩트와 추측을 구분해서 읽어야 해요. 
                특히 '전망', '예상' 같은 단어가 들어간 내용은 
                신중하게 판단하세요!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockNewsPage; 