import React, { useState, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ChaessaemCharacter from './ChaessaemCharacter';

// 브레인스토밍 프롬프트
const BRAINSTORMING_PROMPTS = [
  { id: 1, text: "가장 주목받는 산업 트렌드는?", category: "industry", icon: "🏭" },
  { id: 2, text: "현재 사회적 이슈는?", category: "social", icon: "🌍" },
  { id: 3, text: "AI, 국방, 우주, 밈 중 관심사는?", category: "tech", icon: "🚀" },
  { id: 4, text: "자주 나오는 뉴스 키워드는?", category: "news", icon: "📰" },
  { id: 5, text: "미래 성장 가능성이 높은 분야는?", category: "future", icon: "🔮" },
  { id: 6, text: "개인적으로 관심 있는 테마는?", category: "personal", icon: "💭" }
];

// 가상의 주식 데이터베이스
const STOCK_DATABASE = [
  // AI 관련
  { symbol: 'NVDA', name: 'NVIDIA', keywords: ['AI', '반도체', '그래픽카드', 'GPU', '딥러닝'], 
    price: 450.23, marketCap: 1200000, sector: 'Technology', isPenny: false },
  { symbol: 'AMD', name: 'Advanced Micro Devices', keywords: ['AI', 'CPU', '반도체', '프로세서'], 
    price: 105.67, marketCap: 170000, sector: 'Technology', isPenny: false },
  
  // 국방/드론 관련
  { symbol: 'UAVS', name: 'AgEagle Aerial Systems', keywords: ['드론', '정찰', '국방', '농업', '감시'], 
    price: 1.23, marketCap: 85, sector: 'Aerospace', isPenny: true },
  { symbol: 'LMT', name: 'Lockheed Martin', keywords: ['국방', '미사일', '항공우주', '방산'], 
    price: 420.45, marketCap: 115000, sector: 'Aerospace', isPenny: false },
  
  // 우주 관련
  { symbol: 'SPCE', name: 'Virgin Galactic', keywords: ['우주', '관광', '로켓', '우주여행'], 
    price: 4.56, marketCap: 450, sector: 'Aerospace', isPenny: true },
  { symbol: 'RKLB', name: 'Rocket Lab', keywords: ['우주', '로켓', '위성', '발사'], 
    price: 8.90, marketCap: 4200, sector: 'Aerospace', isPenny: false },
  
  // 밈/소셜 관련
  { symbol: 'AMC', name: 'AMC Entertainment', keywords: ['밈', '영화관', '엔터테인먼트', '소셜미디어'], 
    price: 3.45, marketCap: 1800, sector: 'Entertainment', isPenny: true },
  { symbol: 'GME', name: 'GameStop', keywords: ['밈', '게임', '소매', 'NFT', '소셜미디어'], 
    price: 15.67, marketCap: 4500, sector: 'Retail', isPenny: false },
  
  // 에너지/친환경
  { symbol: 'TSLA', name: 'Tesla', keywords: ['전기차', '배터리', '친환경', '에너지', '자율주행'], 
    price: 250.34, marketCap: 800000, sector: 'Automotive', isPenny: false },
  { symbol: 'PLUG', name: 'Plug Power', keywords: ['수소', '연료전지', '친환경', '에너지'], 
    price: 2.89, marketCap: 1650, sector: 'Energy', isPenny: true }
];

// 퀀트 점수 계산
const calculateQuantScore = (stock) => {
  const price = stock.price;
  const marketCap = stock.marketCap;
  
  // 임의의 재무 지표 생성 (실제로는 API에서 가져옴)
  const per = 15 + Math.random() * 20; // 15-35
  const pbr = 1 + Math.random() * 3; // 1-4
  const roe = 5 + Math.random() * 20; // 5-25%
  const debtRatio = Math.random() * 50; // 0-50%
  const revenueGrowth = -10 + Math.random() * 40; // -10% ~ +30%
  
  // 점수 계산 (100점 만점)
  let score = 0;
  
  // PER 점수 (20점)
  if (per < 15) score += 20;
  else if (per < 25) score += 15;
  else if (per < 35) score += 10;
  else score += 5;
  
  // PBR 점수 (20점)
  if (pbr < 1.5) score += 20;
  else if (pbr < 2.5) score += 15;
  else if (pbr < 3.5) score += 10;
  else score += 5;
  
  // ROE 점수 (20점)
  if (roe > 20) score += 20;
  else if (roe > 15) score += 15;
  else if (roe > 10) score += 10;
  else score += 5;
  
  // 부채비율 점수 (20점)
  if (debtRatio < 20) score += 20;
  else if (debtRatio < 30) score += 15;
  else if (debtRatio < 40) score += 10;
  else score += 5;
  
  // 매출성장률 점수 (20점)
  if (revenueGrowth > 20) score += 20;
  else if (revenueGrowth > 10) score += 15;
  else if (revenueGrowth > 5) score += 10;
  else score += 5;
  
  return {
    total: Math.round(score),
    details: {
      per: per.toFixed(1),
      pbr: pbr.toFixed(1),
      roe: roe.toFixed(1),
      debtRatio: debtRatio.toFixed(1),
      revenueGrowth: revenueGrowth.toFixed(1)
    }
  };
};

// 밈 점수 계산
const calculateMemeScore = (stock) => {
  let score = 0;
  
  // 페니스톡 여부 (20점)
  if (stock.isPenny) score += 20;
  
  // 소셜 미디어 언급 (20점)
  const socialMentions = Math.random() * 1000;
  if (socialMentions > 800) score += 20;
  else if (socialMentions > 500) score += 15;
  else if (socialMentions > 200) score += 10;
  else score += 5;
  
  // 과거 펌핑 이력 (20점)
  const hasPumpHistory = Math.random() > 0.7;
  if (hasPumpHistory) score += 20;
  else score += 5;
  
  // 거래량 급증 (20점)
  const volumeSpike = Math.random() * 5;
  if (volumeSpike > 3) score += 20;
  else if (volumeSpike > 2) score += 15;
  else if (volumeSpike > 1.5) score += 10;
  else score += 5;
  
  // 시가총액 대비 거래량 패턴 (20점)
  const volumeRatio = Math.random() * 0.1;
  if (volumeRatio > 0.05) score += 20;
  else if (volumeRatio > 0.03) score += 15;
  else if (volumeRatio > 0.02) score += 10;
  else score += 5;
  
  return Math.round(score);
};

const KeywordStockDiscovery = ({ darkMode = false }) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  
  const [currentStep, setCurrentStep] = useState('brainstorming'); // brainstorming, filtering, results
  const [userKeywords, setUserKeywords] = useState([]);
  const [aiKeywords, setAiKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({
    pennyStocks: true,
    memeStocks: true,
    quantStocks: true,
    customConditions: {
      maxMarketCap: 10000, // 백만 달러
      minMemeScore: 60,
      minQuantScore: 70
    }
  });
  const [discoveredStocks, setDiscoveredStocks] = useState([]);
  const [keywordSessions, setKeywordSessions] = useLocalStorage('keyword_sessions', []);
  const [newKeyword, setNewKeyword] = useState('');

  // AI 키워드 생성
  const generateAIKeywords = (userInputs) => {
    const aiSuggestions = [
      'AI', '인공지능', '머신러닝', '자율주행', '로보틱스',
      '드론', '국방', '사이버보안', '반도체', '5G',
      '우주항공', '위성', '로켓', '우주관광', '우주통신',
      '친환경', '전기차', '배터리', '수소', '태양광',
      '메타버스', '게임', 'NFT', '블록체인', '암호화폐',
      '바이오', '제약', '헬스케어', '의료기기', '원격의료',
      '핀테크', '결제', '디지털뱅킹', '투자앱', 'P2P'
    ];
    
    // 사용자 입력과 관련된 키워드 필터링 및 추가
    const related = aiSuggestions.filter(keyword => 
      !userInputs.some(input => 
        input.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(input.toLowerCase())
      )
    ).slice(0, 10);
    
    return related;
  };

  // 키워드로 주식 검색
  const searchStocksByKeywords = useCallback((keywords) => {
    const results = STOCK_DATABASE.filter(stock => 
      keywords.some(keyword => 
        stock.keywords.some(stockKeyword => 
          stockKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
          keyword.toLowerCase().includes(stockKeyword.toLowerCase())
        ) ||
        stock.name.toLowerCase().includes(keyword.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    // 각 주식에 점수 추가
    const enrichedResults = results.map(stock => ({
      ...stock,
      quantScore: calculateQuantScore(stock),
      memeScore: calculateMemeScore(stock),
      matchedKeywords: keywords.filter(keyword => 
        stock.keywords.some(stockKeyword => 
          stockKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
          keyword.toLowerCase().includes(stockKeyword.toLowerCase())
        )
      )
    }));

    return enrichedResults;
  }, []);

  // 키워드 추가
  const addUserKeyword = () => {
    if (newKeyword.trim() && userKeywords.length < 10) {
      setUserKeywords([...userKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  // AI 키워드 생성
  const handleGenerateAI = () => {
    const generated = generateAIKeywords(userKeywords);
    setAiKeywords(generated);
  };

  // 다음 단계로
  const proceedToFiltering = () => {
    if (selectedKeywords.length > 0) {
      setCurrentStep('filtering');
    }
  };

  // 주식 발굴 실행
  const executeDiscovery = () => {
    const results = searchStocksByKeywords(selectedKeywords);
    
    // 필터 적용
    let filteredResults = results;
    
    if (filterCriteria.pennyStocks) {
      filteredResults = filteredResults.filter(stock => stock.isPenny);
    }
    if (filterCriteria.memeStocks) {
      filteredResults = filteredResults.filter(stock => 
        stock.memeScore >= filterCriteria.customConditions.minMemeScore
      );
    }
    if (filterCriteria.quantStocks) {
      filteredResults = filteredResults.filter(stock => 
        stock.quantScore.total >= filterCriteria.customConditions.minQuantScore
      );
    }
    
    // 시가총액 필터
    filteredResults = filteredResults.filter(stock => 
      stock.marketCap <= filterCriteria.customConditions.maxMarketCap
    );

    setDiscoveredStocks(filteredResults);
    setCurrentStep('results');
    
    // 세션 저장
    const session = {
      id: Date.now(),
      keywords: selectedKeywords,
      results: filteredResults.length,
      timestamp: new Date(),
      filters: filterCriteria
    };
    setKeywordSessions(prev => [session, ...prev.slice(0, 9)]);
  };

  // 키워드 토글
  const toggleKeyword = (keyword) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
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
              🧠 키워드 기반 주식 발굴
            </h2>
            <p style={{
              ...typography.presets.body.normal,
              color: typography.colors.muted,
              margin: '8px 0 0 0'
            }}>
              브레인스토밍으로 숨겨진 보석 종목을 찾아보세요
            </p>
          </div>
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
              💭 자유 키워드 입력 (최대 10개)
            </h3>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addUserKeyword()}
                placeholder="관심 있는 키워드를 입력하세요"
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
                    background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`,
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleKeyword(keyword)}
                >
                  {keyword} {selectedKeywords.includes(keyword) ? '✓' : ''}
                </span>
              ))}
            </div>

            <button
              onClick={handleGenerateAI}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.positive}, ${theme.colors.accent})`,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              🤖 AI 추천 키워드 생성
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
              🎯 브레인스토밍 프롬프트
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
                    클릭해서 아이디어를 얻어보세요
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
                🤖 AI 추천 키워드
              </h3>
              
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
              선택된 키워드 ({selectedKeywords.length})로 주식 찾기 →
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
              {/* 주식 카테고리 */}
              <div>
                <h4 style={{
                  ...typography.presets.heading.h4,
                  color: typography.colors.primary,
                  marginBottom: '12px'
                }}>
                  🏷️ 주식 카테고리
                </h4>
                
                {[
                  { key: 'pennyStocks', label: '🪙 페니 스톡', desc: '가격 < $5' },
                  { key: 'memeStocks', label: '🚀 밈 스톡', desc: '소셜 미디어 화제' },
                  { key: 'quantStocks', label: '📊 퀀트 우량주', desc: '재무지표 우수' }
                ].map(category => (
                  <label
                    key={category.key}
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
                      checked={filterCriteria[category.key]}
                      onChange={(e) => setFilterCriteria(prev => ({
                        ...prev,
                        [category.key]: e.target.checked
                      }))}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{
                      ...typography.presets.body.normal,
                      color: typography.colors.primary
                    }}>
                      {category.label}
                    </span>
                    <span style={{
                      ...typography.presets.body.small,
                      color: typography.colors.muted
                    }}>
                      ({category.desc})
                    </span>
                  </label>
                ))}
              </div>

              {/* 커스텀 조건 */}
              <div>
                <h4 style={{
                  ...typography.presets.heading.h4,
                  color: typography.colors.primary,
                  marginBottom: '12px'
                }}>
                  ⚙️ 세부 조건
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{
                      ...typography.presets.body.small,
                      color: typography.colors.muted,
                      marginBottom: '4px',
                      display: 'block'
                    }}>
                      최대 시가총액 (백만 $)
                    </label>
                    <input
                      type="number"
                      value={filterCriteria.customConditions.maxMarketCap}
                      onChange={(e) => setFilterCriteria(prev => ({
                        ...prev,
                        customConditions: {
                          ...prev.customConditions,
                          maxMarketCap: parseInt(e.target.value) || 0
                        }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${theme.colors.border}`,
                        background: theme.colors.background,
                        color: typography.colors.primary
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      ...typography.presets.body.small,
                      color: typography.colors.muted,
                      marginBottom: '4px',
                      display: 'block'
                    }}>
                      최소 밈 점수
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filterCriteria.customConditions.minMemeScore}
                      onChange={(e) => setFilterCriteria(prev => ({
                        ...prev,
                        customConditions: {
                          ...prev.customConditions,
                          minMemeScore: parseInt(e.target.value)
                        }
                      }))}
                      style={{ width: '100%' }}
                    />
                    <span style={{
                      ...typography.presets.body.small,
                      color: typography.colors.primary
                    }}>
                      {filterCriteria.customConditions.minMemeScore}점
                    </span>
                  </div>
                  
                  <div>
                    <label style={{
                      ...typography.presets.body.small,
                      color: typography.colors.muted,
                      marginBottom: '4px',
                      display: 'block'
                    }}>
                      최소 퀀트 점수
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filterCriteria.customConditions.minQuantScore}
                      onChange={(e) => setFilterCriteria(prev => ({
                        ...prev,
                        customConditions: {
                          ...prev.customConditions,
                          minQuantScore: parseInt(e.target.value)
                        }
                      }))}
                      style={{ width: '100%' }}
                    />
                    <span style={{
                      ...typography.presets.body.small,
                      color: typography.colors.primary
                    }}>
                      {filterCriteria.customConditions.minQuantScore}점
                    </span>
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
              🔍 선택된 키워드
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
              ← 뒤로가기
            </button>
            
            <button
              onClick={executeDiscovery}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.positive}, ${theme.colors.accent})`,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 32px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              🔍 주식 발굴 시작!
            </button>
          </div>
        </div>
      )}

      {/* 3단계: 결과 */}
      {currentStep === 'results' && (
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
              🎉 발굴 완료! {discoveredStocks.length}개 종목 발견
            </h3>
            
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
                  {discoveredStocks.filter(s => s.isPenny).length}
                </div>
                <div style={{
                  ...typography.presets.caption,
                  color: typography.colors.muted
                }}>
                  페니 스톡
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  color: theme.colors.accent,
                  fontWeight: '700',
                  marginBottom: '4px'
                }}>
                  {discoveredStocks.filter(s => s.memeScore >= 70).length}
                </div>
                <div style={{
                  ...typography.presets.caption,
                  color: typography.colors.muted
                }}>
                  고밈 스톡
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  color: theme.colors.primary,
                  fontWeight: '700',
                  marginBottom: '4px'
                }}>
                  {discoveredStocks.filter(s => s.quantScore.total >= 80).length}
                </div>
                <div style={{
                  ...typography.presets.caption,
                  color: typography.colors.muted
                }}>
                  퀀트 우량주
                </div>
              </div>
            </div>
          </div>

          {/* 발굴된 주식 리스트 */}
          <div>
            {discoveredStocks.length === 0 ? (
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
                  필터 조건을 완화하거나 다른 키워드를 시도해보세요
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {discoveredStocks.map((stock, index) => (
                  <div
                    key={stock.symbol}
                    style={{
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '12px',
                      padding: '20px',
                      position: 'relative'
                    }}
                  >
                    {/* 순위 뱃지 */}
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
                      #{index + 1}
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: '20px',
                      alignItems: 'center'
                    }}>
                      {/* 종목 정보 */}
                      <div>
                        <h4 style={{
                          ...typography.presets.heading.h4,
                          color: typography.colors.primary,
                          marginBottom: '4px'
                        }}>
                          {stock.symbol}
                        </h4>
                        <p style={{
                          ...typography.presets.body.small,
                          color: typography.colors.muted,
                          marginBottom: '8px'
                        }}>
                          {stock.name}
                        </p>
                        <div style={{
                          ...typography.presets.body.large,
                          color: typography.colors.primary,
                          fontWeight: '700'
                        }}>
                          ${stock.price}
                        </div>
                      </div>

                      {/* 점수 및 매칭 키워드 */}
                      <div>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <span style={{
                            background: `${theme.colors.accent}20`,
                            color: theme.colors.accent,
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            밈: {stock.memeScore}점
                          </span>
                          <span style={{
                            background: `${theme.colors.primary}20`,
                            color: theme.colors.primary,
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            퀀트: {stock.quantScore.total}점
                          </span>
                          {stock.isPenny && (
                            <span style={{
                              background: `${theme.colors.warning}20`,
                              color: theme.colors.warning,
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              페니스톡
                            </span>
                          )}
                        </div>
                        
                        <div style={{
                          ...typography.presets.body.small,
                          color: typography.colors.muted,
                          marginBottom: '4px'
                        }}>
                          매칭 키워드: {stock.matchedKeywords.join(', ')}
                        </div>
                        
                        <div style={{
                          ...typography.presets.caption,
                          color: typography.colors.muted
                        }}>
                          {stock.sector} | 시총: ${stock.marketCap}M
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button style={{
                          background: `linear-gradient(135deg, ${theme.colors.positive}, ${theme.colors.accent})`,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          📊 관심목록 추가
                        </button>
                        
                        <button style={{
                          background: 'transparent',
                          color: theme.colors.accent,
                          border: `1px solid ${theme.colors.accent}`,
                          borderRadius: '8px',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          📰 뉴스 보기
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
                setDiscoveredStocks([]);
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
              🔄 새로운 키워드로 다시 시작
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordStockDiscovery; 