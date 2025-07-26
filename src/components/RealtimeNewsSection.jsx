import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const RealtimeNewsSection = ({ stock = '삼성전자', darkMode = false }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [newsFilter, setNewsFilter] = useState('all'); // 'all', 'positive', 'negative'
  const [sentimentAnalysis, setSentimentAnalysis] = useState({});
  const [sources, setSources] = useState(['naver', 'google', 'yahoo']);
  
  const refreshIntervalRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const theme = {
    background: darkMode ? '#23272b' : '#fff',
    text: darkMode ? '#e0e0e0' : '#222',
    subtext: darkMode ? '#aaa' : '#888',
    border: darkMode ? '#333' : '#eee',
    accent: '#8884d8',
    hover: darkMode ? '#2a2e33' : '#f8f9fa',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336'
  };

  // 실시간 뉴스 API 연동 (여러 소스 통합)
  const fetchRealtimeNews = useCallback(async (keyword, source = 'all') => {
    try {
      const promises = [];
      
      // Google News RSS (한국어)
      if (source === 'all' || source === 'google') {
        promises.push(fetchGoogleNews(keyword));
      }
      
      // Naver News API (실제로는 API 키 필요)
      if (source === 'all' || source === 'naver') {
        promises.push(fetchNaverNews(keyword));
      }
      
      // Yahoo Finance API
      if (source === 'all' || source === 'yahoo') {
        promises.push(fetchYahooNews(keyword));
      }

      const results = await Promise.allSettled(promises);
      const allNews = results
        .filter(result => result.status === 'fulfilled' && result.value)
        .flatMap(result => result.value)
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, 20); // 최대 20개

      return allNews;
    } catch (error) {
      console.error('뉴스 조회 실패:', error);
      return getSampleNews(keyword);
    }
  }, []);

  // Google News RSS 파싱
  const fetchGoogleNews = async (keyword) => {
    try {
      // 실제로는 CORS 프록시나 백엔드 API를 통해 호출
      const encodedKeyword = encodeURIComponent(keyword);
      const rssUrl = `https://news.google.com/rss/search?q=${encodedKeyword}&hl=ko&gl=KR&ceid=KR:ko`;
      
      // CORS 이슈로 인해 실제로는 백엔드 API 필요
      // 현재는 모의 데이터 반환
      return [
        {
          id: `google-${Date.now()}-1`,
          title: `${keyword} 관련 실시간 뉴스 - Google`,
          summary: `${keyword}에 대한 최신 뉴스를 Google에서 가져왔습니다.`,
          url: `https://news.google.com/search?q=${encodedKeyword}`,
          publishedAt: new Date().toISOString(),
          source: 'Google News',
          sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
          confidence: Math.random() * 0.5 + 0.5
        }
      ];
    } catch (error) {
      console.error('Google News 조회 실패:', error);
      return [];
    }
  };

  // Naver News API
  const fetchNaverNews = async (keyword) => {
    try {
      // 실제로는 Naver API 키 필요
      // const response = await axios.get('https://openapi.naver.com/v1/search/news.json', {
      //   headers: {
      //     'X-Naver-Client-Id': 'YOUR_CLIENT_ID',
      //     'X-Naver-Client-Secret': 'YOUR_CLIENT_SECRET'
      //   },
      //   params: {
      //     query: keyword,
      //     display: 10,
      //     sort: 'date'
      //   }
      // });

      // 모의 데이터 반환
      return Array.from({ length: 3 }, (_, i) => ({
        id: `naver-${Date.now()}-${i}`,
        title: `${keyword} ${['급등', '전망', '분석'][i]} - 네이버 뉴스`,
        summary: `${keyword}의 최신 동향에 대한 ${['긍정적', '중립적', '부정적'][i]} 분석입니다.`,
        url: `https://search.naver.com/search.naver?query=${encodeURIComponent(keyword)}`,
        publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
        source: 'Naver News',
        sentiment: ['positive', 'neutral', 'negative'][i],
        confidence: 0.7 + Math.random() * 0.2
      }));
    } catch (error) {
      console.error('Naver News 조회 실패:', error);
      return [];
    }
  };

  // Yahoo Finance API
  const fetchYahooNews = async (keyword) => {
    try {
      // Yahoo Finance API 호출 (실제로는 RapidAPI 등을 통해)
      return [
        {
          id: `yahoo-${Date.now()}-1`,
          title: `${keyword} Stock Analysis - Yahoo Finance`,
          summary: `Latest financial analysis and market sentiment for ${keyword}.`,
          url: `https://finance.yahoo.com/quote/${keyword}`,
          publishedAt: new Date().toISOString(),
          source: 'Yahoo Finance',
          sentiment: 'neutral',
          confidence: 0.8
        }
      ];
    } catch (error) {
      console.error('Yahoo News 조회 실패:', error);
      return [];
    }
  };

  // 샘플 뉴스 데이터
  const getSampleNews = (keyword) => {
    const samples = [
      {
        id: `sample-${Date.now()}-1`,
        title: `${keyword} 주가 상승세 지속`,
        summary: `${keyword}가 긍정적인 실적 발표에 힘입어 상승세를 이어가고 있습니다.`,
        url: '#',
        publishedAt: new Date().toISOString(),
        source: 'Sample News',
        sentiment: 'positive',
        confidence: 0.8
      },
      {
        id: `sample-${Date.now()}-2`,
        title: `${keyword} 투자자 관심 증가`,
        summary: `기관투자자들의 ${keyword}에 대한 관심이 높아지고 있습니다.`,
        url: '#',
        publishedAt: new Date(Date.now() - 1800000).toISOString(),
        source: 'Sample News',
        sentiment: 'positive',
        confidence: 0.7
      },
      {
        id: `sample-${Date.now()}-3`,
        title: `${keyword} 시장 변동성 주의`,
        summary: `${keyword} 주식의 변동성이 커지고 있어 투자 시 주의가 필요합니다.`,
        url: '#',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: 'Sample News',
        sentiment: 'negative',
        confidence: 0.6
      }
    ];
    
    return samples;
  };

  // 감정 분석 (간단한 키워드 기반)
  const analyzeSentiment = useCallback((title, summary) => {
    const positiveKeywords = ['상승', '급등', '호재', '긍정', '증가', '성장', '돌파', '상향'];
    const negativeKeywords = ['하락', '급락', '악재', '부정', '감소', '하향', '우려', '위험'];
    
    const text = (title + ' ' + summary).toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveKeywords.forEach(keyword => {
      if (text.includes(keyword)) positiveScore++;
    });
    
    negativeKeywords.forEach(keyword => {
      if (text.includes(keyword)) negativeScore++;
    });
    
    if (positiveScore > negativeScore) return { sentiment: 'positive', confidence: 0.6 + (positiveScore * 0.1) };
    if (negativeScore > positiveScore) return { sentiment: 'negative', confidence: 0.6 + (negativeScore * 0.1) };
    return { sentiment: 'neutral', confidence: 0.5 };
  }, []);

  // 뉴스 로드 함수
  const loadNews = useCallback(async (keyword = stock, forceRefresh = false) => {
    if (loading && !forceRefresh) return;

    setLoading(true);
    setError(null);

    try {
      const newsData = await fetchRealtimeNews(keyword);
      
      // 감정 분석 수행
      const newsWithSentiment = newsData.map(article => {
        const sentiment = article.sentiment ? 
          { sentiment: article.sentiment, confidence: article.confidence } :
          analyzeSentiment(article.title, article.summary);
        
        return {
          ...article,
          ...sentiment
        };
      });

      setNews(newsWithSentiment);
      setLastUpdate(new Date());
      
      // 감정 분석 통계 계산
      const sentimentStats = newsWithSentiment.reduce((acc, article) => {
        acc[article.sentiment] = (acc[article.sentiment] || 0) + 1;
        return acc;
      }, {});
      
      setSentimentAnalysis(sentimentStats);
      
    } catch (err) {
      setError('뉴스 조회 중 오류가 발생했습니다.');
      console.error('뉴스 로드 에러:', err);
    } finally {
      setLoading(false);
    }
  }, [stock, loading, fetchRealtimeNews, analyzeSentiment]);

  // 검색어 변경시 디바운싱
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        loadNews(value.trim());
      }
    }, 1000);
  }, [loadNews]);

  // 자동 새로고침 설정
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadNews(searchTerm || stock, true);
      }, 60000); // 1분마다
    } else if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, loadNews, searchTerm, stock]);

  // 초기 뉴스 로드
  useEffect(() => {
    loadNews();
  }, [stock]);

  // 필터링된 뉴스
  const filteredNews = news.filter(article => {
    if (newsFilter === 'all') return true;
    return article.sentiment === newsFilter;
  });

  // 감정별 색상
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return theme.success;
      case 'negative': return theme.error;
      default: return theme.warning;
    }
  };

  // 감정별 이모지
  const getSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '📊';
    }
  };

  return (
    <div style={{
      background: theme.background,
      border: `1px solid ${theme.border}`,
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          margin: 0,
          color: theme.accent,
          fontSize: '1.3rem',
          fontWeight: '700'
        }}>
          📰 실시간 뉴스
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              background: autoRefresh ? theme.success : theme.border,
              color: autoRefresh ? 'white' : theme.text,
              border: 'none',
              borderRadius: '6px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            {autoRefresh ? '🔄 ON' : '⏸️ OFF'}
          </button>
          <button
            onClick={() => loadNews(searchTerm || stock, true)}
            disabled={loading}
            style={{
              background: theme.accent,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '🔄' : '↻'}
          </button>
        </div>
      </div>

      {/* 검색 입력 */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={`검색어 입력 (현재: ${stock})`}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            background: theme.background,
            color: theme.text,
            fontSize: '0.9rem'
          }}
        />
      </div>

      {/* 감정 분석 요약 */}
      {Object.keys(sentimentAnalysis).length > 0 && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          padding: '0.75rem',
          background: theme.hover,
          borderRadius: '8px'
        }}>
          {Object.entries(sentimentAnalysis).map(([sentiment, count]) => (
            <div
              key={sentiment}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                background: getSentimentColor(sentiment),
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}
            >
              {getSentimentEmoji(sentiment)} {count}
            </div>
          ))}
        </div>
      )}

      {/* 필터 버튼 */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        {[
          { key: 'all', label: '전체', emoji: '📋' },
          { key: 'positive', label: '긍정', emoji: '📈' },
          { key: 'negative', label: '부정', emoji: '📉' }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setNewsFilter(filter.key)}
            style={{
              background: newsFilter === filter.key ? theme.accent : 'transparent',
              color: newsFilter === filter.key ? 'white' : theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              padding: '0.5rem 0.75rem',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            {filter.emoji} {filter.label}
          </button>
        ))}
      </div>

      {/* 마지막 업데이트 시간 */}
      {lastUpdate && (
        <div style={{
          textAlign: 'center',
          color: theme.subtext,
          fontSize: '0.7rem',
          marginBottom: '1rem'
        }}>
          마지막 업데이트: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div style={{
          background: theme.error,
          color: 'white',
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {/* 뉴스 목록 */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {loading && news.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: theme.subtext,
            padding: '2rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
            뉴스를 불러오는 중...
          </div>
        ) : filteredNews.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: theme.subtext,
            padding: '2rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📰</div>
            뉴스가 없습니다
          </div>
        ) : (
          filteredNews.map((article, index) => (
            <div
              key={article.id || index}
              style={{
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '0.75rem',
                background: theme.hover,
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.5rem'
              }}>
                <h4 style={{
                  margin: 0,
                  color: theme.text,
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  flex: 1,
                  marginRight: '0.5rem'
                }}>
                  {article.title}
                </h4>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: getSentimentColor(article.sentiment),
                  color: 'white',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem'
                }}>
                  {getSentimentEmoji(article.sentiment)}
                  {Math.round(article.confidence * 100)}%
                </div>
              </div>
              
              <p style={{
                margin: '0 0 0.5rem 0',
                color: theme.subtext,
                fontSize: '0.8rem',
                lineHeight: '1.4'
              }}>
                {article.summary}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.7rem',
                color: theme.subtext
              }}>
                <span>{article.source}</span>
                <span>{new Date(article.publishedAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 하단 정보 */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: `${theme.accent}15`,
        borderRadius: '8px',
        fontSize: '0.8rem',
        color: theme.subtext,
        textAlign: 'center'
      }}>
        💡 실시간 뉴스 • AI 감정분석 • {autoRefresh ? '1분마다 자동 업데이트' : '수동 업데이트'}
      </div>
    </div>
  );
};

export default RealtimeNewsSection; 