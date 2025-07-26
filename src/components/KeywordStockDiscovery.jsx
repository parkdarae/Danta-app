import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ChaessaemCharacter from './ChaessaemCharacter';
import { initializeStockDB } from '../utils/stockDatabase';
import aiStockSearchService from '../services/aiStockSearchService';

// 브레인스토밍 프롬프트
const BRAINSTORMING_PROMPTS = [
  { id: 1, text: "가장 주목받는 산업 트렌드는?", category: "industry", icon: "🏭" },
  { id: 2, text: "현재 사회적 이슈는?", category: "social", icon: "🌍" },
  { id: 3, text: "AI, 국방, 우주, 밈 중 관심사는?", category: "tech", icon: "🚀" },
  { id: 4, text: "자주 나오는 뉴스 키워드는?", category: "news", icon: "📰" },
  { id: 5, text: "미래 성장 가능성이 높은 분야는?", category: "future", icon: "🔮" },
  { id: 6, text: "개인적으로 관심 있는 테마는?", category: "personal", icon: "💭" }
];

const KeywordStockDiscovery = ({ darkMode = false }) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  
  const [currentStep, setCurrentStep] = useState('brainstorming'); // brainstorming, filtering, results
  const [userKeywords, setUserKeywords] = useState([]);
  const [aiKeywords, setAiKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({
    pennyStocks: false,
    memeStocks: false,
    quantStocks: true,
    markets: ['KR', 'US'],
    types: ['KR_STOCK', 'US_STOCK', 'ETF'],
    customConditions: {
      maxMarketCap: 1000000, // 1조 달러
      minRelevance: 0.3,
      limit: 20
    }
  });
  const [searchResults, setSearchResults] = useState(null);
  const [keywordSessions, setKeywordSessions] = useLocalStorage('keyword_sessions', []);
  const [newKeyword, setNewKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);

  // 데이터베이스 초기화
  useEffect(() => {
    const initDB = async () => {
      try {
        setIsLoading(true);
        console.log('📊 종목 데이터베이스 초기화 중...');
        await initializeStockDB();
        setDbInitialized(true);
        console.log('✅ 종목 데이터베이스 초기화 완료');
      } catch (error) {
        console.error('❌ 데이터베이스 초기화 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initDB();
  }, []);

  // 키워드 추가
  const addUserKeyword = () => {
    if (newKeyword.trim() && userKeywords.length < 10 && !userKeywords.includes(newKeyword.trim())) {
      const keyword = newKeyword.trim();
      setUserKeywords(prev => [...prev, keyword]);
      setSelectedKeywords(prev => [...prev, keyword]);
      setNewKeyword('');
    }
  };

  // AI 키워드 생성
  const handleGenerateAI = async () => {
    if (userKeywords.length === 0) {
      alert('먼저 키워드를 하나 이상 입력해주세요!');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('🤖 채쌤이 AI 키워드를 생성하고 있어요...');
      
      const keywordAnalysis = await aiStockSearchService.analyzeAndExpandKeywords(userKeywords, {
        userLevel: 'beginner',
        preferredMarkets: filterCriteria.markets,
        riskLevel: 'medium'
      });
      
      setAiAnalysisResult(keywordAnalysis);
      setAiKeywords(keywordAnalysis.expanded.slice(0, 15)); // 최대 15개
      
    } catch (error) {
      console.error('AI 키워드 생성 실패:', error);
      // 백업 키워드 생성
      const backupKeywords = generateBackupKeywords(userKeywords);
      setAiKeywords(backupKeywords);
    } finally {
      setIsLoading(false);
    }
  };

  // 백업 키워드 생성 (AI 실패 시)
  const generateBackupKeywords = (keywords) => {
    const keywordMappings = {
      'AI': ['인공지능', '머신러닝', '딥러닝', 'ChatGPT', '자연어처리'],
      '반도체': ['GPU', 'CPU', 'DRAM', 'NAND', '파운드리'],
      '전기차': ['EV', '배터리', '2차전지', '자율주행', '충전인프라'],
      '바이오': ['제약', '신약', '백신', '항체', '세포치료'],
      '게임': ['모바일게임', 'PC게임', '메타버스', 'VR', 'AR'],
      '드론': ['UAV', '무인기', '항공', '물류드론', '국방드론'],
      '우주': ['위성', '로켓', '항공우주', '우주관광', '우주통신'],
      '친환경': ['ESG', '탄소중립', '신재생에너지', '태양광', '풍력']
    };
    
    const expanded = [];
    keywords.forEach(keyword => {
      if (keywordMappings[keyword]) {
        expanded.push(...keywordMappings[keyword]);
      }
    });
    
    return [...new Set(expanded)].slice(0, 10);
  };

  // 다음 단계로
  const proceedToFiltering = () => {
    if (selectedKeywords.length === 0) {
      alert('검색할 키워드를 하나 이상 선택해주세요!');
      return;
    }
    setCurrentStep('filtering');
  };

  // 실제 AI 스마트 검색 실행
  const executeSmartSearch = async () => {
    if (!dbInitialized) {
      alert('종목 데이터베이스가 아직 준비되지 않았습니다. 잠시만 기다려주세요.');
      return;
    }
    
    if (selectedKeywords.length === 0) {
      alert('검색할 키워드를 선택해주세요!');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('🔍 채쌤과 함께 스마트 검색을 시작해요...');
      
      // AI 스마트 검색 실행
      const searchResult = await aiStockSearchService.smartSearch(selectedKeywords, {
        ...filterCriteria.customConditions,
        markets: filterCriteria.markets,
        types: filterCriteria.types,
        userPreferences: {
          pennyStocks: filterCriteria.pennyStocks,
          memeStocks: filterCriteria.memeStocks,
          quantStocks: filterCriteria.quantStocks
        }
      });
      
      setSearchResults(searchResult);
      setCurrentStep('results');
      
      // 세션 저장
      const session = {
        id: Date.now(),
        keywords: selectedKeywords,
        results: searchResult.results.length,
        timestamp: new Date(),
        filters: filterCriteria,
        aiEnhanced: searchResult.metadata.aiEnhanced
      };
      setKeywordSessions(prev => [session, ...prev.slice(0, 9)]);
      
    } catch (error) {
      console.error('검색 실패:', error);
      alert('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 키워드 토글
  const toggleKeyword = (keyword) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  // 관심목록에 추가
  const addToWatchlist = (stock) => {
    const watchlist = JSON.parse(localStorage.getItem('user_watchlist') || '[]');
    if (!watchlist.includes(stock.symbol)) {
      watchlist.push(stock.symbol);
      localStorage.setItem('user_watchlist', JSON.stringify(watchlist));
      alert(`${stock.symbol}이(가) 관심목록에 추가되었습니다!`);
    } else {
      alert('이미 관심목록에 있는 종목입니다.');
    }
  };

  // 뉴스 보기
  const viewNews = (stock) => {
    const newsUrl = `/news?stock=${stock.symbol}`;
    window.open(newsUrl, '_blank');
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
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ChaessaemCharacter size="normal" darkMode={darkMode} />
          <div>
            <h2 style={{
              ...typography.presets.heading.h2,
              color: typography.colors.primary,
              margin: 0
            }}>
              🤖 AI 채쌤 종목 발굴 시스템
            </h2>
            <p style={{
              ...typography.presets.body.normal,
              color: typography.colors.muted,
              margin: '8px 0 0 0'
            }}>
              {dbInitialized 
                ? '실제 종목 데이터와 AI 분석으로 최적의 투자 기회를 찾아보세요' 
                : '종목 데이터베이스를 준비하고 있어요...'}
            </p>
          </div>
        </div>
        
        {/* 상태 표시 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: dbInitialized ? `${theme.colors.positive}20` : `${theme.colors.warning}20`,
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            color: dbInitialized ? theme.colors.positive : theme.colors.warning
          }}>
            {dbInitialized ? '✅ DB 준비완료' : '⏳ DB 준비중'}
          </div>
          
          {/* 단계 표시 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['brainstorming', 'filtering', 'results'].map((step, index) => (
              <div
                key={step}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: currentStep === step 
                    ? `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`
                    : theme.colors.muted,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '16px',
          padding: '32px',
          zIndex: 10000,
          textAlign: 'center',
          color: 'white'
        }}>
          <ChaessaemCharacter size="large" darkMode={true} />
          <h3 style={{ margin: '16px 0 8px 0', fontSize: '18px' }}>
            🤖 채쌤이 열심히 분석하고 있어요!
          </h3>
          <p style={{ margin: 0, opacity: 0.8 }}>
            실제 종목 데이터와 AI를 활용해서 최적의 결과를 찾고 있습니다...
          </p>
        </div>
      )}

      {/* 1단계: 브레인스토밍 */}
      {currentStep === 'brainstorming' && (
        <div>
          {/* 사용자 키워드 입력 */}
          <div style={{
            background: `${theme.colors.accent}10`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            border: `1px solid ${theme.colors.accent}20`
          }}>
            <h3 style={{
              ...typography.presets.heading.h3,
              color: typography.colors.primary,
              marginBottom: '16px'
            }}>
              💭 관심 키워드 입력 (최대 10개)
            </h3>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addUserKeyword()}
                placeholder="예: AI, 전기차, 바이오, 게임 등"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.background,
                  color: typography.colors.primary,
                  fontSize: '14px'
                }}
              />
              <button
                onClick={addUserKeyword}
                disabled={!newKeyword.trim() || userKeywords.length >= 10}
                style={{
                  background: !newKeyword.trim() || userKeywords.length >= 10
                    ? theme.colors.muted
                    : `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: !newKeyword.trim() || userKeywords.length >= 10 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                추가
              </button>
            </div>

            {/* 입력된 키워드 표시 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {userKeywords.map((keyword, index) => (
                <span
                  key={index}
                  style={{
                    background: selectedKeywords.includes(keyword)
                      ? `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`
                      : `${theme.colors.accent}30`,
                    color: selectedKeywords.includes(keyword) ? 'white' : theme.colors.accent,
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onClick={() => toggleKeyword(keyword)}
                >
                  {keyword} {selectedKeywords.includes(keyword) ? '✓' : '+'}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserKeywords(prev => prev.filter(k => k !== keyword));
                      setSelectedKeywords(prev => prev.filter(k => k !== keyword));
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      padding: '0',
                      marginLeft: '4px'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <button
              onClick={handleGenerateAI}
              disabled={userKeywords.length === 0 || !dbInitialized}
              style={{
                background: userKeywords.length === 0 || !dbInitialized
                  ? theme.colors.muted
                  : `linear-gradient(135deg, ${theme.colors.positive}, ${theme.colors.accent})`,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: userKeywords.length === 0 || !dbInitialized ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              🤖 채쌤 AI 키워드 추천
            </button>
          </div>

          {/* 브레인스토밍 프롬프트 */}
          <div style={{
            background: theme.colors.background,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <h3 style={{
              ...typography.presets.heading.h3,
              color: typography.colors.primary,
              marginBottom: '16px'
            }}>
              🎯 브레인스토밍 도우미
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '12px'
            }}>
              {BRAINSTORMING_PROMPTS.map(prompt => (
                <div
                  key={prompt.id}
                  style={{
                    background: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = theme.colors.accent;
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = theme.colors.border;
                    e.target.style.transform = 'translateY(0)';
                  }}
                  onClick={() => {
                    // 프롬프트를 클릭하면 관련 키워드 제안
                    const suggestions = {
                      industry: ['AI', '반도체', '전기차'],
                      social: ['ESG', '친환경', '탄소중립'],
                      tech: ['AI', '국방', '우주', '게임'],
                      news: ['인플레이션', '금리', '환율'],
                      future: ['메타버스', '바이오', 'K-뷰티'],
                      personal: ['REIT', '배당주', 'ETF']
                    };
                    
                    const relatedKeywords = suggestions[prompt.category] || [];
                    relatedKeywords.forEach(keyword => {
                      if (!userKeywords.includes(keyword) && userKeywords.length < 10) {
                        setUserKeywords(prev => [...prev, keyword]);
                        setSelectedKeywords(prev => [...prev, keyword]);
                      }
                    });
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '18px' }}>{prompt.icon}</span>
                    <span style={{
                      ...typography.presets.body.normal,
                      color: typography.colors.primary,
                      fontWeight: '600'
                    }}>
                      {prompt.text}
                    </span>
                  </div>
                  <div style={{
                    ...typography.presets.body.small,
                    color: typography.colors.muted
                  }}>
                    클릭하면 관련 키워드가 자동 추가돼요
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI 추천 키워드 */}
          {aiKeywords.length > 0 && (
            <div style={{
              background: `${theme.colors.positive}10`,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              border: `1px solid ${theme.colors.positive}20`
            }}>
              <h3 style={{
                ...typography.presets.heading.h3,
                color: typography.colors.primary,
                marginBottom: '16px'
              }}>
                🤖 채쌤 AI 추천 키워드
              </h3>
              
              {aiAnalysisResult?.aiAdvice && (
                <div style={{
                  background: theme.colors.background,
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                  ...typography.presets.body.small,
                  color: typography.colors.secondary,
                  lineHeight: 1.5
                }}>
                  💡 <strong>채쌤의 조언:</strong> {aiAnalysisResult.aiAdvice}
                </div>
              )}
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {aiKeywords.map((keyword, index) => (
                  <button
                    key={index}
                    onClick={() => toggleKeyword(keyword)}
                    style={{
                      background: selectedKeywords.includes(keyword)
                        ? `linear-gradient(135deg, ${theme.colors.positive}, ${theme.colors.accent})`
                        : 'transparent',
                      color: selectedKeywords.includes(keyword) ? 'white' : theme.colors.positive,
                      border: `2px solid ${theme.colors.positive}`,
                      borderRadius: '16px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {keyword} {selectedKeywords.includes(keyword) ? '✓' : '+'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 다음 단계 버튼 */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={proceedToFiltering}
              disabled={selectedKeywords.length === 0}
              style={{
                background: selectedKeywords.length === 0
                  ? theme.colors.muted
                  : `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                cursor: selectedKeywords.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              선택된 키워드 ({selectedKeywords.length})로 검색하기 →
            </button>
          </div>
        </div>
      )}

      {/* 2단계: 필터링 */}
      {currentStep === 'filtering' && (
        <div>
          <div style={{
            background: `${theme.colors.accent}10`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            border: `1px solid ${theme.colors.accent}20`
          }}>
            <h3 style={{
              ...typography.presets.heading.h3,
              color: typography.colors.primary,
              marginBottom: '16px'
            }}>
              🎯 검색 조건 설정
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {/* 시장 선택 */}
              <div>
                <h4 style={{
                  ...typography.presets.heading.h4,
                  color: typography.colors.primary,
                  marginBottom: '12px'
                }}>
                  🌍 검색 시장
                </h4>
                
                {[
                  { key: 'KR', label: '🇰🇷 한국 시장', desc: 'KOSPI, KOSDAQ' },
                  { key: 'US', label: '🇺🇸 미국 시장', desc: 'NYSE, NASDAQ' }
                ].map(market => (
                  <label
                    key={market.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filterCriteria.markets.includes(market.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterCriteria(prev => ({
                            ...prev,
                            markets: [...prev.markets, market.key]
                          }));
                        } else {
                          setFilterCriteria(prev => ({
                            ...prev,
                            markets: prev.markets.filter(m => m !== market.key)
                          }));
                        }
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{
                      ...typography.presets.body.normal,
                      color: typography.colors.primary
                    }}>
                      {market.label}
                    </span>
                    <span style={{
                      ...typography.presets.body.small,
                      color: typography.colors.muted
                    }}>
                      ({market.desc})
                    </span>
                  </label>
                ))}
              </div>

              {/* 종목 타입 */}
              <div>
                <h4 style={{
                  ...typography.presets.heading.h4,
                  color: typography.colors.primary,
                  marginBottom: '12px'
                }}>
                  🏷️ 종목 타입
                </h4>
                
                {[
                  { key: 'KR_STOCK', label: '📈 한국 주식', desc: '개별 종목' },
                  { key: 'US_STOCK', label: '🚀 미국 주식', desc: '개별 종목' },
                  { key: 'ETF', label: '📊 ETF', desc: '상장지수펀드' }
                ].map(type => (
                  <label
                    key={type.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filterCriteria.types.includes(type.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterCriteria(prev => ({
                            ...prev,
                            types: [...prev.types, type.key]
                          }));
                        } else {
                          setFilterCriteria(prev => ({
                            ...prev,
                            types: prev.types.filter(t => t !== type.key)
                          }));
                        }
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{
                      ...typography.presets.body.normal,
                      color: typography.colors.primary
                    }}>
                      {type.label}
                    </span>
                    <span style={{
                      ...typography.presets.body.small,
                      color: typography.colors.muted
                    }}>
                      ({type.desc})
                    </span>
                  </label>
                ))}
              </div>

              {/* 검색 설정 */}
              <div>
                <h4 style={{
                  ...typography.presets.heading.h4,
                  color: typography.colors.primary,
                  marginBottom: '12px'
                }}>
                  ⚙️ 검색 설정
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{
                      ...typography.presets.body.small,
                      color: typography.colors.muted,
                      marginBottom: '4px',
                      display: 'block'
                    }}>
                      최대 검색 결과: {filterCriteria.customConditions.limit}개
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={filterCriteria.customConditions.limit}
                      onChange={(e) => setFilterCriteria(prev => ({
                        ...prev,
                        customConditions: {
                          ...prev.customConditions,
                          limit: parseInt(e.target.value)
                        }
                      }))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      ...typography.presets.body.small,
                      color: typography.colors.muted,
                      marginBottom: '4px',
                      display: 'block'
                    }}>
                      최소 관련도: {Math.round(filterCriteria.customConditions.minRelevance * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.1"
                      value={filterCriteria.customConditions.minRelevance}
                      onChange={(e) => setFilterCriteria(prev => ({
                        ...prev,
                        customConditions: {
                          ...prev.customConditions,
                          minRelevance: parseFloat(e.target.value)
                        }
                      }))}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 선택된 키워드 표시 */}
          <div style={{
            background: theme.colors.background,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <h4 style={{
              ...typography.presets.heading.h4,
              color: typography.colors.primary,
              marginBottom: '12px'
            }}>
              🔍 검색할 키워드 ({selectedKeywords.length}개)
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedKeywords.map((keyword, index) => (
                <span
                  key={index}
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`,
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* 실행 버튼 */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => setCurrentStep('brainstorming')}
              style={{
                background: 'transparent',
                color: theme.colors.accent,
                border: `2px solid ${theme.colors.accent}`,
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              ← 키워드 수정
            </button>
            
            <button
              onClick={executeSmartSearch}
              disabled={!dbInitialized || selectedKeywords.length === 0}
              style={{
                background: !dbInitialized || selectedKeywords.length === 0
                  ? theme.colors.muted
                  : `linear-gradient(135deg, ${theme.colors.positive}, ${theme.colors.accent})`,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 32px',
                cursor: !dbInitialized || selectedKeywords.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              🤖 AI 스마트 검색 시작!
            </button>
          </div>
        </div>
      )}

      {/* 3단계: 결과 */}
      {currentStep === 'results' && searchResults && (
        <div>
          {/* 결과 요약 */}
          <div style={{
            background: `${theme.colors.positive}10`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            border: `1px solid ${theme.colors.positive}20`
          }}>
            <h3 style={{
              ...typography.presets.heading.h3,
              color: typography.colors.primary,
              marginBottom: '16px'
            }}>
              🎉 {searchResults.metadata.aiEnhanced ? 'AI 스마트 검색' : '기본 검색'} 완료! 
              {searchResults.results.length}개 종목 발견
            </h3>
            
            {searchResults.insights?.advice && (
              <div style={{
                background: theme.colors.background,
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                ...typography.presets.body.normal,
                color: typography.colors.primary,
                lineHeight: 1.6
              }}>
                💡 <strong>채쌤의 조언:</strong> {searchResults.insights.advice}
              </div>
            )}
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  color: theme.colors.positive,
                  fontWeight: '700',
                  marginBottom: '4px'
                }}>
                  {searchResults.results.filter(s => s.type === 'KR_STOCK').length}
                </div>
                <div style={{
                  ...typography.presets.caption,
                  color: typography.colors.muted
                }}>
                  한국 주식
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  color: theme.colors.accent,
                  fontWeight: '700',
                  marginBottom: '4px'
                }}>
                  {searchResults.results.filter(s => s.type === 'US_STOCK').length}
                </div>
                <div style={{
                  ...typography.presets.caption,
                  color: typography.colors.muted
                }}>
                  미국 주식
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  color: theme.colors.primary,
                  fontWeight: '700',
                  marginBottom: '4px'
                }}>
                  {searchResults.results.filter(s => s.type === 'ETF').length}
                </div>
                <div style={{
                  ...typography.presets.caption,
                  color: typography.colors.muted
                }}>
                  ETF
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  color: theme.colors.warning,
                  fontWeight: '700',
                  marginBottom: '4px'
                }}>
                  {Math.round(searchResults.results.reduce((sum, s) => sum + (s.aiScore || s.relevanceScore), 0) / searchResults.results.length * 100)}%
                </div>
                <div style={{
                  ...typography.presets.caption,
                  color: typography.colors.muted
                }}>
                  평균 관련도
                </div>
              </div>
            </div>
          </div>

          {/* 검색된 종목 리스트 */}
          <div>
            {searchResults.results.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: `${theme.colors.muted}10`,
                borderRadius: '12px',
                border: `1px dashed ${theme.colors.muted}`
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h4 style={{
                  ...typography.presets.heading.h4,
                  color: typography.colors.primary,
                  marginBottom: '8px'
                }}>
                  조건에 맞는 종목이 없어요
                </h4>
                <p style={{
                  ...typography.presets.body.normal,
                  color: typography.colors.muted
                }}>
                  다른 키워드를 시도하거나 검색 조건을 완화해보세요
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {searchResults.results.map((stock, index) => (
                  <div
                    key={`${stock.symbol}-${index}`}
                    style={{
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '12px',
                      padding: '20px',
                      position: 'relative'
                    }}
                  >
                    {/* AI 점수 뱃지 */}
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '16px',
                      background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`,
                      color: 'white',
                      borderRadius: '12px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      #{index + 1} | {Math.round((stock.aiScore || stock.relevanceScore) * 100)}% 매칭
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: '20px',
                      alignItems: 'center'
                    }}>
                      {/* 종목 정보 */}
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <h4 style={{
                            ...typography.presets.heading.h4,
                            color: typography.colors.primary,
                            margin: 0
                          }}>
                            {stock.symbol}
                          </h4>
                          <span style={{
                            background: stock.type === 'KR_STOCK' ? '#FF6B6B20' :
                                      stock.type === 'US_STOCK' ? '#4A90E220' : '#2ECC7120',
                            color: stock.type === 'KR_STOCK' ? '#FF6B6B' :
                                   stock.type === 'US_STOCK' ? '#4A90E2' : '#2ECC71',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: '600'
                          }}>
                            {stock.type === 'KR_STOCK' ? '🇰🇷 한국' :
                             stock.type === 'US_STOCK' ? '🇺🇸 미국' : '📊 ETF'}
                          </span>
                        </div>
                        
                        <p style={{
                          ...typography.presets.body.normal,
                          color: typography.colors.primary,
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          {stock.name}
                        </p>
                        
                        <div style={{
                          ...typography.presets.body.small,
                          color: typography.colors.muted,
                          marginBottom: '8px'
                        }}>
                          {stock.sector} | {stock.exchange || stock.market}
                        </div>
                      </div>

                      {/* 매칭 정보 */}
                      <div>
                        <div style={{
                          ...typography.presets.body.small,
                          color: typography.colors.muted,
                          marginBottom: '8px'
                        }}>
                          매칭 키워드: {stock.matchedKeywords?.join(', ') || '키워드 매칭'}
                        </div>
                        
                        {stock.aiRecommendation && (
                          <div style={{
                            background: `${theme.colors.accent}10`,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            ...typography.presets.body.small,
                            color: typography.colors.secondary,
                            lineHeight: 1.4
                          }}>
                            🤖 {stock.aiRecommendation}
                          </div>
                        )}
                      </div>

                      {/* 액션 버튼 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button 
                          onClick={() => addToWatchlist(stock)}
                          style={{
                            background: `linear-gradient(135deg, ${theme.colors.positive}, ${theme.colors.accent})`,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          ⭐ 관심목록
                        </button>
                        
                        <button 
                          onClick={() => viewNews(stock)}
                          style={{
                            background: 'transparent',
                            color: theme.colors.accent,
                            border: `1px solid ${theme.colors.accent}`,
                            borderRadius: '8px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          📰 뉴스보기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 다시 시작 버튼 */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={() => {
                setCurrentStep('brainstorming');
                setSelectedKeywords([]);
                setSearchResults(null);
                setAiAnalysisResult(null);
              }}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              🔄 새로운 검색 시작
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordStockDiscovery; 