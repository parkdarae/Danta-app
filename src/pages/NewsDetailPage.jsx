import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStockNewsMultiple, symbolMap, analyzeNewsSentiment } from '../utils/fetchRealtime';

// 해외 뉴스 소스 추가
const fetchGlobalNews = async (symbol) => {
  try {
    // Alpha Vantage News API (예시)
    const response = await fetch(`https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=demo`);
    const data = await response.json();
    
    if (data.feed) {
      return data.feed.slice(0, 10).map(news => ({
        title: news.title,
        summary: news.summary || news.title,
        url: news.url,
        publishTime: new Date(news.time_published).toLocaleString(),
        provider: news.source,
        category: '해외',
        sentiment: news.overall_sentiment_label || 'Neutral'
      }));
    }
    return [];
  } catch (e) {
    console.error('해외 뉴스 조회 실패:', e);
    return [];
  }
};

// 샘플 뉴스 데이터 (API 실패 시 사용)
const getSampleNews = (stock) => [
  {
    title: `${stock}, 3분기 실적 발표 예정`,
    summary: `${stock}이 다음 주 3분기 실적을 발표할 예정입니다. 시장에서는 긍정적인 실적을 기대하고 있습니다.`,
    url: '#sample-news-1',
    publishTime: new Date().toLocaleString(),
    provider: '경제일보',
    category: '국내',
    sentiment: 'Positive'
  },
  {
    title: `${stock} 주가 분석, 단기 상승 전망`,
    summary: `증권가에서는 ${stock}의 단기 주가 상승을 전망하고 있습니다. 기술적 분석 결과 긍정적인 신호가 감지되었습니다.`,
    url: '#sample-news-2',
    publishTime: new Date(Date.now() - 3600000).toLocaleString(),
    provider: '투자뉴스',
    category: '국내',
    sentiment: 'Positive'
  },
  {
    title: `Global Market Update: ${stock} Performance`,
    summary: `International markets are showing positive sentiment towards ${stock}. Recent developments suggest strong growth potential.`,
    url: '#sample-news-3',
    publishTime: new Date(Date.now() - 7200000).toLocaleString(),
    provider: 'Financial Times',
    category: '해외',
    sentiment: 'Positive'
  },
  {
    title: `${stock} 거래량 급증, 투자자 관심 집중`,
    summary: `오늘 ${stock}의 거래량이 평소보다 200% 이상 증가하며 투자자들의 관심이 집중되고 있습니다.`,
    url: '#sample-news-4',
    publishTime: new Date(Date.now() - 10800000).toLocaleString(),
    provider: '매일경제',
    category: '국내',
    sentiment: 'Neutral'
  },
  {
    title: `${stock} Analyst Recommendations Updated`,
    summary: `Major investment banks have updated their recommendations for ${stock}, with most maintaining a buy rating.`,
    url: '#sample-news-5',
    publishTime: new Date(Date.now() - 14400000).toLocaleString(),
    provider: 'Bloomberg',
    category: '해외',
    sentiment: 'Positive'
  }
];

function NewsDetailPage() {
  const { stock } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, 국내, 해외
  const [sortBy, setSortBy] = useState('TIME'); // TIME, SENTIMENT
  const [sentiment, setSentiment] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darong_darkmode') === 'true';
  });

  const bg = darkMode ? '#181a1b' : '#f8f9fa';
  const card = darkMode ? '#23272b' : '#fff';
  const text = darkMode ? '#e0e0e0' : '#222';
  const subtext = darkMode ? '#aaa' : '#888';
  const border = darkMode ? '#333' : '#eee';
  const accent = '#8884d8';

  useEffect(() => {
    loadNews();
  }, [stock]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const symbol = symbolMap[stock] || '005930.KS';
      
      // 국내 뉴스와 해외 뉴스를 동시에 가져오기
      const [domesticNews, globalNews] = await Promise.all([
        fetchStockNewsMultiple(stock, symbol),
        fetchGlobalNews(symbol.replace('.KS', '').replace('.KQ', ''))
      ]);

      const allNews = [
        ...domesticNews.map(n => ({ ...n, category: '국내' })),
        ...globalNews
      ];

      // 샘플 데이터로 폴백
      const finalNews = allNews.length > 0 ? allNews : getSampleNews(stock);
      
      setNews(finalNews);
      
      // 감정 분석
      const sentimentAnalysis = analyzeNewsSentiment(finalNews);
      setSentiment(sentimentAnalysis);
      
    } catch (error) {
      console.error('뉴스 로딩 실패:', error);
      setNews(getSampleNews(stock));
      setSentiment(analyzeNewsSentiment(getSampleNews(stock)));
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(item => {
    if (filter === 'ALL') return true;
    return item.category === filter;
  });

  const sortedNews = [...filteredNews].sort((a, b) => {
    if (sortBy === 'TIME') {
      return new Date(b.publishTime) - new Date(a.publishTime);
    }
    // 감정별 정렬
    const sentimentOrder = { 'Positive': 3, 'Neutral': 2, 'Negative': 1 };
    return (sentimentOrder[b.sentiment] || 2) - (sentimentOrder[a.sentiment] || 2);
  });

  const getSentimentColor = (sentimentType) => {
    switch (sentimentType) {
      case 'Positive': return '#4caf50';
      case 'Negative': return '#f44336';
      default: return '#ff9800';
    }
  };

  const getSentimentLabel = (sentimentType) => {
    switch (sentimentType) {
      case 'Positive': return '긍정';
      case 'Negative': return '부정';
      default: return '중립';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      color: text,
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* 헤더 */}
        <div style={{
          background: card,
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
          border: `1px solid ${border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: `2px solid ${accent}`,
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginRight: '1rem',
                color: accent,
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            >
              ←
            </button>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '2rem', 
                color: accent,
                fontWeight: '700'
              }}>
                {stock} 뉴스 센터
              </h1>
              <p style={{ 
                margin: '0.5rem 0 0 0', 
                color: subtext,
                fontSize: '1.1rem'
              }}>
                실시간 국내외 뉴스 및 시장 분석
              </p>
            </div>
          </div>

          {/* 감정 분석 요약 */}
          {sentiment && (
            <div style={{
              background: darkMode ? '#1a1a1a' : '#f8f9fa',
              borderRadius: '12px',
              padding: '1.5rem',
              marginTop: '1rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: accent }}>📊 시장 감정 분석</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50' }}>
                    {sentiment.positive}%
                  </div>
                  <div style={{ color: subtext, fontSize: '0.9rem' }}>긍정</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>
                    {sentiment.neutral}%
                  </div>
                  <div style={{ color: subtext, fontSize: '0.9rem' }}>중립</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f44336' }}>
                    {sentiment.negative}%
                  </div>
                  <div style={{ color: subtext, fontSize: '0.9rem' }}>부정</div>
                </div>
              </div>
              <div style={{ 
                textAlign: 'center',
                padding: '0.8rem',
                background: darkMode ? '#2a2a2a' : '#fff',
                borderRadius: '8px',
                fontWeight: 'bold',
                color: getSentimentColor(sentiment.summary === '긍정적' ? 'Positive' : sentiment.summary === '부정적' ? 'Negative' : 'Neutral')
              }}>
                전체 시장 감정: {sentiment.summary}
              </div>
            </div>
          )}
        </div>

        {/* 필터 및 정렬 */}
        <div style={{
          background: card,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: `1px solid ${border}`
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['ALL', '국내', '해외'].map(category => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  style={{
                    background: filter === category ? accent : 'transparent',
                    color: filter === category ? '#fff' : text,
                    border: `2px solid ${filter === category ? accent : border}`,
                    borderRadius: '20px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  {category === 'ALL' ? '전체' : category}
                </button>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: subtext, fontSize: '0.9rem' }}>정렬:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: darkMode ? '#2a2a2a' : '#fff',
                  color: text,
                  border: `1px solid ${border}`,
                  borderRadius: '8px',
                  padding: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                <option value="TIME">최신순</option>
                <option value="SENTIMENT">감정순</option>
              </select>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '1rem',
            fontSize: '0.9rem',
            color: subtext,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>총 {sortedNews.length}개 기사</span>
            <button
              onClick={loadNews}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: accent,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              {loading ? '새로고침 중...' : '🔄 새로고침'}
            </button>
          </div>
        </div>

        {/* 뉴스 목록 */}
        {loading ? (
          <div style={{
            background: card,
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            color: subtext,
            border: `1px solid ${border}`
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📰</div>
            뉴스를 불러오는 중...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sortedNews.map((article, index) => (
              <div
                key={index}
                style={{
                  background: card,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: `1px solid ${border}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: darkMode ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.05)'
                }}
                onClick={() => {
                  if (article.url && article.url !== '#') {
                    window.open(article.url, '_blank');
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = darkMode ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{
                      background: article.category === '해외' ? '#2196f3' : '#4caf50',
                      color: '#fff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {article.category}
                    </span>
                    <span style={{
                      background: getSentimentColor(article.sentiment) + '22',
                      color: getSentimentColor(article.sentiment),
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      border: `1px solid ${getSentimentColor(article.sentiment)}44`
                    }}>
                      {getSentimentLabel(article.sentiment)}
                    </span>
                  </div>
                  <span style={{ 
                    color: subtext, 
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap'
                  }}>
                    {article.publishTime}
                  </span>
                </div>

                <h3 style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  lineHeight: '1.4',
                  color: text
                }}>
                  {article.title}
                </h3>

                <p style={{
                  margin: '0 0 1rem 0',
                  lineHeight: '1.6',
                  color: subtext,
                  fontSize: '0.95rem'
                }}>
                  {article.summary}
                </p>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: `1px solid ${border}`
                }}>
                  <span style={{ 
                    color: subtext, 
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    📰 {article.provider}
                  </span>
                  <span style={{
                    color: accent,
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    자세히 보기 →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 푸터 */}
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: subtext,
          fontSize: '0.9rem'
        }}>
          <p>💡 뉴스를 클릭하면 원문 기사로 이동합니다</p>
          <p>⚠️ 투자 결정 시 신중하게 검토하시기 바랍니다</p>
        </div>
      </div>
    </div>
  );
}

export default NewsDetailPage; 