import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const EnhancedNewsAnalyzer = ({ darkMode = false, selectedStock = '에이지이글' }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const theme = {
    bg: darkMode ? '#1a1a1a' : '#ffffff',
    cardBg: darkMode ? '#2d2d2d' : '#f8f9fa',
    text: darkMode ? '#ffffff' : '#333333',
    subtext: darkMode ? '#cccccc' : '#666666',
    border: darkMode ? '#404040' : '#e0e0e0',
    accent: '#007bff',
    positive: '#00c851',
    negative: '#ff4444',
    warning: '#ffbb33'
  };

  // 뉴스 소스 설정
  const newsSources = {
    google: {
      name: 'Google News',
      baseUrl: 'https://news.google.com/rss/search',
      enabled: true
    },
    yahoo: {
      name: 'Yahoo Finance',
      baseUrl: 'https://feeds.finance.yahoo.com',
      enabled: true
    },
    reuters: {
      name: 'Reuters Business',
      baseUrl: 'https://feeds.reuters.com/reuters/businessNews',
      enabled: true
    },
    cnbc: {
      name: 'CNBC',
      baseUrl: 'https://search.cnbc.com/rs/search/combinedcms/view.xml',
      enabled: true
    }
  };

  // 실시간 뉴스 수집
  const fetchRealTimeNews = useCallback(async (query = selectedStock) => {
    setLoading(true);
    try {
      const newsItems = [];
      
      // 다양한 소스에서 뉴스 수집 (Mock 데이터 - 실제로는 RSS/API 사용)
      const mockNewsData = generateMockNews(query);
      
      for (const item of mockNewsData) {
        // URL에서 실제 뉴스 내용 추출 시뮬레이션
        const content = await extractNewsContent(item.url);
        const summary = await generateNewsSummary(content, item.title);
        
        newsItems.push({
          ...item,
          content,
          summary,
          sentiment: analyzeSentiment(content),
          relevanceScore: calculateRelevanceScore(content, query)
        });
      }
      
      // 관련도 순으로 정렬
      newsItems.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      setNews(newsItems);
    } catch (error) {
      console.error('뉴스 수집 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedStock]);

  // Mock 뉴스 데이터 생성
  const generateMockNews = (query) => {
    const baseNews = [
      {
        id: 1,
        title: `${query} 주가 급등, 투자자들 주목`,
        url: 'https://finance.yahoo.com/news/stock-surge-123',
        source: 'Yahoo Finance',
        publishedAt: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
        category: 'stock',
        image: 'https://via.placeholder.com/300x200?text=Stock+News'
      },
      {
        id: 2,
        title: `미국 증시 ${query} 관련주 동반 상승세`,
        url: 'https://www.reuters.com/business/markets/stock-rise-456',
        source: 'Reuters',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60), // 1시간 전
        category: 'market',
        image: 'https://via.placeholder.com/300x200?text=Market+News'
      },
      {
        id: 3,
        title: `${query} 기업 실적 발표, 예상치 상회`,
        url: 'https://www.cnbc.com/earnings/report-789',
        source: 'CNBC',
        publishedAt: new Date(Date.now() - 1000 * 60 * 120), // 2시간 전
        category: 'earnings',
        image: 'https://via.placeholder.com/300x200?text=Earnings+News'
      },
      {
        id: 4,
        title: `에이지이글에어리얼사 신규 사업 진출 계획 공개`,
        url: 'https://news.google.com/article/new-business-abc',
        source: 'Google News',
        publishedAt: new Date(Date.now() - 1000 * 60 * 180), // 3시간 전
        category: 'business',
        image: 'https://via.placeholder.com/300x200?text=Business+News'
      },
      {
        id: 5,
        title: `항공업계 동향: ${query} 관련 기업들 주목`,
        url: 'https://finance.naver.com/industry/aviation-def',
        source: 'Naver Finance',
        publishedAt: new Date(Date.now() - 1000 * 60 * 240), // 4시간 전
        category: 'industry',
        image: 'https://via.placeholder.com/300x200?text=Industry+News'
      }
    ];

    // 검색어에 따라 뉴스 개수와 내용 조정
    return baseNews.map(item => ({
      ...item,
      title: item.title.replace(/에이지이글|ACEL|EAGLE/g, query),
      isRelevant: item.title.toLowerCase().includes(query.toLowerCase()) || 
                  item.category === 'stock' || 
                  query.toLowerCase().includes('eagle')
    }));
  };

  // URL에서 뉴스 내용 추출 (시뮬레이션)
  const extractNewsContent = async (url) => {
    // 실제로는 웹 스크래핑 또는 API 사용
    await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
    
    const mockContents = [
      `${selectedStock} 주식이 오늘 장중 급등세를 보이며 투자자들의 관심을 끌고 있다. 
      전문가들은 최근 발표된 실적과 새로운 사업 계획이 주가 상승의 주요 요인이라고 분석했다. 
      회사는 올해 매출 30% 증가를 목표로 하고 있으며, 신규 시장 진출을 위한 투자를 확대할 예정이다. 
      이에 따라 관련 업계 전체가 주목받고 있으며, 유사 기업들도 동반 상승하는 모습을 보이고 있다.`,
      
      `미국 증시에서 ${selectedStock} 관련주들이 일제히 상승세를 나타냈다. 
      시장 전문가들은 최근 발표된 경제 지표와 기업 실적이 긍정적인 영향을 미쳤다고 평가했다. 
      특히 기술주와 성장주 중심으로 매수세가 몰리면서 전체적인 상승 분위기가 조성되었다. 
      투자자들은 향후 실적 발표 시즌을 주시하고 있으며, 추가 상승 가능성에 대해 기대감을 보이고 있다.`,
      
      `${selectedStock} 기업이 발표한 분기 실적이 시장 예상치를 크게 상회하며 화제가 되고 있다. 
      매출은 전년 동기 대비 25% 증가했으며, 순이익은 40% 늘어나는 성과를 거두었다. 
      회사 측은 핵심 사업 부문의 성장과 효율적인 운영이 좋은 결과를 가져왔다고 설명했다. 
      이번 실적 발표 이후 주가는 장중 15% 이상 상승하며 52주 신고가를 경신했다.`,
      
      `에이지이글에어리얼사가 새로운 사업 영역 진출 계획을 공개하며 시장의 주목을 받고 있다. 
      회사는 향후 3년간 총 5억 달러를 투자하여 신기술 개발과 시장 확장을 추진할 예정이다. 
      특히 친환경 기술과 디지털 혁신에 중점을 두고 있으며, 이를 통해 경쟁력을 강화하겠다는 방침이다. 
      업계 관계자들은 이번 계획이 장기적인 성장 동력이 될 것으로 기대한다고 밝혔다.`,
      
      `항공업계 전반에 긍정적인 전망이 제기되면서 ${selectedStock} 등 관련 기업들이 투자자들의 관심을 끌고 있다. 
      코로나19 이후 항공 수요가 점진적으로 회복되고 있으며, 새로운 기술 도입으로 효율성도 개선되고 있다. 
      전문가들은 향후 2-3년간 업계 전체가 성장세를 이어갈 것으로 전망한다고 밝혔다. 
      이에 따라 관련 주식들도 중장기적으로 상승 잠재력이 높다는 평가를 받고 있다.`
    ];
    
    return mockContents[Math.floor(Math.random() * mockContents.length)];
  };

  // AI 뉴스 요약 생성 (200자 이내)
  const generateNewsSummary = async (content, title) => {
    // 실제로는 OpenAI API 사용
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 간단한 요약 알고리즘 (실제로는 GPT 사용)
    const sentences = content.split('. ').filter(s => s.length > 10);
    const keywords = extractKeywords(content);
    
    // 핵심 문장 추출
    const keySentences = sentences
      .filter(sentence => keywords.some(keyword => sentence.includes(keyword)))
      .slice(0, 2);
    
    let summary = keySentences.join('. ');
    
    // 200자 제한
    if (summary.length > 200) {
      summary = summary.substring(0, 197) + '...';
    }
    
    // 기본 요약문이 너무 짧은 경우
    if (summary.length < 50) {
      summary = `${selectedStock} 관련 주요 뉴스입니다. ${sentences[0].substring(0, 150)}...`;
    }
    
    return summary;
  };

  // 키워드 추출
  const extractKeywords = (text) => {
    const commonWords = ['이', '가', '을', '를', '의', '에', '는', '은', '와', '과', '로', '으로', '에서', '까지', '부터', '만', '도', '라고', '하고', '있다', '있는', '있으며', '것으로', '것이다'];
    const words = text.split(/\s+/)
      .filter(word => word.length > 1 && !commonWords.includes(word))
      .map(word => word.replace(/[^\w가-힣]/g, ''));
    
    // 빈도수 계산
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    // 빈도수 높은 순으로 정렬
    return Object.keys(frequency)
      .sort((a, b) => frequency[b] - frequency[a])
      .slice(0, 5);
  };

  // 감정 분석
  const analyzeSentiment = (content) => {
    const positiveWords = ['상승', '급등', '성장', '증가', '개선', '긍정', '호조', '확대', '발전', '성공', '기대'];
    const negativeWords = ['하락', '급락', '감소', '우려', '부정', '악화', '축소', '위험', '실패', '불안'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      positiveScore += (content.match(new RegExp(word, 'g')) || []).length;
    });
    
    negativeWords.forEach(word => {
      negativeScore += (content.match(new RegExp(word, 'g')) || []).length;
    });
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  };

  // 관련도 점수 계산
  const calculateRelevanceScore = (content, query) => {
    const queryWords = query.toLowerCase().split(' ');
    let score = 0;
    
    queryWords.forEach(word => {
      score += (content.toLowerCase().match(new RegExp(word, 'g')) || []).length * 10;
    });
    
    // 주식 관련 키워드 보너스
    const stockKeywords = ['주가', '투자', '매출', '실적', '상승', '하락'];
    stockKeywords.forEach(keyword => {
      score += (content.includes(keyword) ? 5 : 0);
    });
    
    return score;
  };

  // 뉴스 필터링
  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // 자동 새로고침
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchRealTimeNews();
      }, 300000); // 5분마다
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchRealTimeNews]);

  // 초기 로드
  useEffect(() => {
    fetchRealTimeNews();
  }, [fetchRealTimeNews]);

  // 감정 색상
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return theme.positive;
      case 'negative': return theme.negative;
      default: return theme.subtext;
    }
  };

  // 감정 아이콘
  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '📊';
    }
  };

  return (
    <div style={{
      background: theme.bg,
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      marginBottom: '20px',
      overflow: 'hidden'
    }}>
      {/* 헤더 */}
      <div style={{
        background: theme.cardBg,
        padding: '15px 20px',
        borderBottom: `1px solid ${theme.border}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>
              📰 실시간 뉴스 분석
            </h3>
            <span style={{
              background: theme.positive,
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              AI 요약
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                background: autoRefresh ? theme.positive : theme.subtext,
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {autoRefresh ? '🔄 자동' : '⏸️ 수동'}
            </button>
            
            <button
              onClick={() => fetchRealTimeNews()}
              disabled={loading}
              style={{
                background: loading ? theme.subtext : theme.accent,
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              {loading ? '🔄' : '📡'} 새로고침
            </button>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              color: theme.text,
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <option value="all">전체 카테고리</option>
            <option value="stock">주식</option>
            <option value="market">시장</option>
            <option value="earnings">실적</option>
            <option value="business">비즈니스</option>
            <option value="industry">산업</option>
          </select>
          
          <input
            type="text"
            placeholder="뉴스 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              color: theme.text,
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '12px',
              minWidth: '150px'
            }}
          />
          
          <span style={{ color: theme.subtext, fontSize: '12px' }}>
            {filteredNews.length}개 뉴스
          </span>
        </div>
      </div>

      {/* 뉴스 목록 */}
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: theme.subtext
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📡</div>
            실시간 뉴스를 수집하고 AI 요약을 생성하는 중...
          </div>
        ) : filteredNews.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: theme.subtext
          }}>
            검색 조건에 맞는 뉴스가 없습니다.
          </div>
        ) : (
          filteredNews.map((item, index) => (
            <div
              key={item.id}
              style={{
                padding: '15px 20px',
                borderBottom: `1px solid ${theme.border}`,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = theme.cardBg}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '10px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '5px'
                  }}>
                    <span style={{
                      color: getSentimentColor(item.sentiment),
                      fontSize: '16px'
                    }}>
                      {getSentimentIcon(item.sentiment)}
                    </span>
                    <h4 style={{
                      margin: 0,
                      color: theme.text,
                      fontSize: '14px',
                      fontWeight: '600',
                      lineHeight: '1.4'
                    }}>
                      {item.title}
                    </h4>
                  </div>
                  
                  <div style={{
                    color: theme.subtext,
                    fontSize: '12px',
                    marginBottom: '8px'
                  }}>
                    {item.source} • {item.publishedAt.toLocaleTimeString()} • 
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: theme.accent, textDecoration: 'none', marginLeft: '5px' }}
                    >
                      원본 보기 🔗
                    </a>
                  </div>
                  
                  {/* AI 요약 */}
                  <div style={{
                    background: theme.cardBg,
                    padding: '10px',
                    borderRadius: '6px',
                    border: `1px solid ${theme.border}`,
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      color: theme.accent,
                      fontSize: '11px',
                      fontWeight: '600',
                      marginBottom: '5px'
                    }}>
                      🤖 AI 요약 (200자)
                    </div>
                    <div style={{
                      color: theme.text,
                      fontSize: '13px',
                      lineHeight: '1.5'
                    }}>
                      {item.summary}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '5px',
                  marginLeft: '15px'
                }}>
                  <span style={{
                    background: theme.accent,
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '10px'
                  }}>
                    {item.category}
                  </span>
                  
                  <span style={{
                    background: getSentimentColor(item.sentiment) + '20',
                    color: getSentimentColor(item.sentiment),
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '10px'
                  }}>
                    관련도 {item.relevanceScore}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 하단 정보 */}
      <div style={{
        background: theme.cardBg,
        padding: '10px 20px',
        borderTop: `1px solid ${theme.border}`,
        fontSize: '12px',
        color: theme.subtext,
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div>🤖 AI가 200자 이내로 자동 요약</div>
        <div>🔄 {autoRefresh ? '5분마다 자동 업데이트' : '수동 업데이트'}</div>
      </div>
    </div>
  );
};

export default EnhancedNewsAnalyzer; 