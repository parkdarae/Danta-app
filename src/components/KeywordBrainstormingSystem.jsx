import React, { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTheme } from '../hooks/useTheme';

// AI 프롬프트는 컴포넌트 외부로 이동하여 재생성 방지
const AI_PROMPTS = [
    {
      id: 'industry',
      question: '🏭 지금 가장 주목하는 산업은?',
      options: [
        { value: 'ai', label: 'AI/머신러닝', keywords: ['AI', '인공지능', '머신러닝', 'ChatGPT', '자율주행'] },
        { value: 'defense', label: '국방/방산', keywords: ['국방', '방산', '무기', '드론', '군사'] },
        { value: 'space', label: '우주/항공', keywords: ['우주', '항공', '위성', '로켓', '스페이스X'] },
        { value: 'biotech', label: '바이오/헬스케어', keywords: ['바이오', '의료', '제약', '헬스케어', '백신'] },
        { value: 'energy', label: '에너지/친환경', keywords: ['에너지', '태양광', '배터리', '전기차', '수소'] },
        { value: 'fintech', label: '핀테크/블록체인', keywords: ['핀테크', '블록체인', '암호화폐', '결제', 'DeFi'] },
        { value: 'gaming', label: '게임/메타버스', keywords: ['게임', '메타버스', 'VR', 'AR', 'NFT'] },
        { value: 'mobility', label: '모빌리티/운송', keywords: ['전기차', '자율주행', '모빌리티', '운송', '물류'] }
      ]
    },
    {
      id: 'social_issues',
      question: '🌍 사회적 이슈 중 투자로 연결될 수 있는 키워드는?',
      options: [
        { value: 'climate', label: '기후변화', keywords: ['기후변화', '탄소중립', '친환경', 'ESG', '재생에너지'] },
        { value: 'aging', label: '고령화', keywords: ['고령화', '실버산업', '의료', '요양', '건강관리'] },
        { value: 'urbanization', label: '도시화', keywords: ['스마트시티', '도시화', '인프라', '건설', '부동산'] },
        { value: 'digital', label: '디지털 전환', keywords: ['디지털', 'DX', '클라우드', '사이버보안', '빅데이터'] },
        { value: 'food_security', label: '식량안보', keywords: ['식량안보', '농업', '대체육', '푸드테크', '바이오농업'] },
        { value: 'geopolitics', label: '지정학적 이슈', keywords: ['지정학', '공급망', '리쇼어링', '국가안보', '인프라'] }
      ]
    },
    {
      id: 'trends',
      question: '📈 최근 뉴스에서 자주 보이는 트렌드 키워드는?',
      options: [
        { value: 'ukraine', label: '우크라이나/국제정세', keywords: ['우크라이나', '전쟁', '국방', '에너지', '곡물'] },
        { value: 'inflation', label: '인플레이션/금리', keywords: ['인플레이션', '금리', '연준', '채권', '달러'] },
        { value: 'supply_chain', label: '공급망 이슈', keywords: ['공급망', '반도체', '물류', '원자재', '제조업'] },
        { value: 'china', label: '중국/아시아', keywords: ['중국', '홍콩', '대만', '아시아', '무역전쟁'] },
        { value: 'pandemic', label: '팬데믹 이후', keywords: ['포스트코로나', '원격근무', '디지털헬스', '언택트'] },
        { value: 'meme', label: '밈주식/소셜트레이딩', keywords: ['밈주식', '레딧', '소셜트레이딩', '개미', 'YOLO'] }
      ]
    },
    {
      id: 'personal',
      question: '💡 개인적으로 끌리는 투자 테마는?',
      options: [
        { value: 'penny', label: '동전주/저가주', keywords: ['동전주', '저가주', '소형주', '성장주', '급등주'] },
        { value: 'dividend', label: '배당/안정성', keywords: ['배당주', '우선주', 'REIT', '안정투자', '인컴투자'] },
        { value: 'growth', label: '성장주/유니콘', keywords: ['성장주', '유니콘', '스타트업', '혁신기업', 'IPO'] },
        { value: 'value', label: '가치투자/저평가', keywords: ['가치투자', '저평가', '펀더멘털', '재무제표', 'PER'] },
        { value: 'momentum', label: '모멘텀/기술적분석', keywords: ['모멘텀', '차트', '기술적분석', '추세', '돌파'] },
        { value: 'contrarian', label: '역발상/언더독', keywords: ['역발상', '언더독', '터닝어라운드', '회복', '반전'] }
      ]
    }
  ];

const KeywordBrainstormingSystem = ({ darkMode = false, onKeywordsGenerated }) => {
  const [currentKeywords, setCurrentKeywords] = useState([]);
  const [inputKeyword, setInputKeyword] = useState('');
  const [savedSessions, setSavedSessions] = useLocalStorage('keyword_sessions', []);
  const [currentSessionName, setCurrentSessionName] = useState('');
  const [showAIPrompts, setShowAIPrompts] = useState(false);
  const [selectedPromptAnswers, setSelectedPromptAnswers] = useState({});

  const theme = useTheme(darkMode);

  // 키워드 추가
  const addKeyword = useCallback((keyword) => {
    if (keyword && !currentKeywords.includes(keyword) && currentKeywords.length < 10) {
      setCurrentKeywords(prev => [...prev, keyword]);
      setInputKeyword('');
    }
  }, [currentKeywords]);

  // 키워드 제거
  const removeKeyword = useCallback((keyword) => {
    setCurrentKeywords(prev => prev.filter(k => k !== keyword));
  }, []);

  // AI 프롬프트 답변 처리
  const handlePromptAnswer = useCallback((promptId, optionValue, keywords) => {
    setSelectedPromptAnswers(prev => ({
      ...prev,
      [promptId]: optionValue
    }));
    
    // 키워드 자동 추가
    keywords.forEach(keyword => {
      if (!currentKeywords.includes(keyword) && currentKeywords.length < 10) {
        setCurrentKeywords(prev => [...prev, keyword]);
      }
    });
  }, [currentKeywords]);

  // 세션 저장
  const saveSession = useCallback(() => {
    if (currentSessionName && currentKeywords.length > 0) {
      const newSession = {
        id: Date.now().toString(),
        name: currentSessionName,
        keywords: currentKeywords,
        promptAnswers: selectedPromptAnswers,
        timestamp: new Date().toISOString()
      };
      
      setSavedSessions(prev => [newSession, ...prev.slice(0, 9)]); // 최대 10개 세션 보관
      setCurrentSessionName('');
      console.log('💾 브레인스토밍 세션 저장:', newSession);
    }
  }, [currentSessionName, currentKeywords, selectedPromptAnswers, setSavedSessions]);

  // 세션 불러오기
  const loadSession = useCallback((session) => {
    setCurrentKeywords(session.keywords);
    setSelectedPromptAnswers(session.promptAnswers);
    setCurrentSessionName(session.name);
  }, []);

  // 키워드 분석 시작
  const startAnalysis = useCallback(() => {
    if (currentKeywords.length > 0 && onKeywordsGenerated) {
      onKeywordsGenerated(currentKeywords);
    }
  }, [currentKeywords, onKeywordsGenerated]);

  // 키워드 그룹화 및 관련성 분석
  const keywordGroups = useMemo(() => {
    const groups = {};
    
    currentKeywords.forEach(keyword => {
      // 간단한 카테고리 분류 로직
      let category = '기타';
      
      if (['AI', '인공지능', '머신러닝', 'ChatGPT', '자율주행'].some(tech => 
        keyword.includes(tech) || tech.includes(keyword))) {
        category = 'AI/Tech';
      } else if (['국방', '방산', '무기', '드론', '군사'].some(def => 
        keyword.includes(def) || def.includes(keyword))) {
        category = '국방/방산';
      } else if (['에너지', '태양광', '배터리', '전기차', '수소'].some(energy => 
        keyword.includes(energy) || energy.includes(keyword))) {
        category = '에너지';
      } else if (['바이오', '의료', '제약', '헬스케어'].some(bio => 
        keyword.includes(bio) || bio.includes(keyword))) {
        category = '바이오/헬스';
      } else if (['게임', 'VR', 'AR', '메타버스'].some(game => 
        keyword.includes(game) || game.includes(keyword))) {
        category = '게임/메타버스';
      }
      
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(keyword);
    });
    
    return groups;
  }, [currentKeywords]);

  return (
    <div style={{
      background: theme.bg,
      borderRadius: '12px',
      border: `2px solid ${theme.border}`,
      overflow: 'hidden',
      marginBottom: '20px'
    }}>
      {/* 헤더 */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.orange}, ${theme.purple})`,
        padding: '20px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
              🧠 키워드 브레인스토밍
            </h2>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
              생각의 흐름을 키워드로 정리하고 투자 아이디어를 발굴하세요
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {currentKeywords.length}/10 키워드
            </span>
            <button
              onClick={() => setShowAIPrompts(!showAIPrompts)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {showAIPrompts ? '🧠 수동 입력' : '🤖 AI 보조'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '25px' }}>
        {/* AI 보조 프롬프트 */}
        {showAIPrompts && (
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: theme.text, fontSize: '18px', marginBottom: '20px' }}>
              🤖 AI 브레인스토밍 도우미
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {AI_PROMPTS.map(prompt => (
                <div
                  key={prompt.id}
                  style={{
                    background: theme.cardBg,
                    borderRadius: '12px',
                    padding: '20px',
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <h4 style={{ color: theme.text, fontSize: '16px', marginBottom: '15px' }}>
                    {prompt.question}
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '10px'
                  }}>
                    {prompt.options.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handlePromptAnswer(prompt.id, option.value, option.keywords)}
                        style={{
                          background: selectedPromptAnswers[prompt.id] === option.value ? theme.accent : 'transparent',
                          color: selectedPromptAnswers[prompt.id] === option.value ? 'white' : theme.text,
                          border: `2px solid ${theme.accent}`,
                          padding: '12px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          textAlign: 'left',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                          {option.label}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.8 }}>
                          {option.keywords.slice(0, 3).join(', ')}...
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 수동 키워드 입력 */}
        {!showAIPrompts && (
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: theme.text, fontSize: '18px', marginBottom: '15px' }}>
              ✍️ 직접 키워드 입력
            </h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                value={inputKeyword}
                onChange={(e) => setInputKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword(inputKeyword)}
                placeholder="투자 아이디어 키워드를 입력하세요 (예: AI, 드론, 우크라이나)"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: `2px solid ${theme.border}`,
                  borderRadius: '8px',
                  background: theme.bg,
                  color: theme.text,
                  fontSize: '14px'
                }}
              />
              <button
                onClick={() => addKeyword(inputKeyword)}
                disabled={!inputKeyword || currentKeywords.length >= 10}
                style={{
                  background: theme.positive,
                  border: 'none',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: inputKeyword && currentKeywords.length < 10 ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: inputKeyword && currentKeywords.length < 10 ? 1 : 0.6
                }}
              >
                추가
              </button>
            </div>

            {/* 추천 키워드 */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ color: theme.subtext, fontSize: '14px', marginBottom: '10px' }}>
                💡 추천 키워드 (클릭하여 추가):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['AI', '드론', '국방', '우크라이나', '전기차', '메타버스', '바이오', '에너지', '반도체', '게임', '핀테크', '우주항공'].map(keyword => (
                  <button
                    key={keyword}
                    onClick={() => addKeyword(keyword)}
                    disabled={currentKeywords.includes(keyword) || currentKeywords.length >= 10}
                    style={{
                      background: currentKeywords.includes(keyword) ? theme.subtext : 'transparent',
                      border: `1px solid ${theme.border}`,
                      color: currentKeywords.includes(keyword) ? 'white' : theme.text,
                      padding: '6px 12px',
                      borderRadius: '20px',
                      cursor: !currentKeywords.includes(keyword) && currentKeywords.length < 10 ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontWeight: '600',
                      opacity: currentKeywords.includes(keyword) || currentKeywords.length >= 10 ? 0.6 : 1
                    }}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 현재 키워드 목록 */}
        {currentKeywords.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: theme.text, fontSize: '18px', marginBottom: '15px' }}>
              🏷️ 선택된 키워드 ({currentKeywords.length}개)
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
              {currentKeywords.map(keyword => (
                <div
                  key={keyword}
                  style={{
                    background: theme.accent,
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '0',
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* 키워드 그룹화 */}
            {Object.keys(keywordGroups).length > 1 && (
              <div style={{
                background: theme.cardBg,
                padding: '15px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                marginBottom: '15px'
              }}>
                <h4 style={{ color: theme.text, fontSize: '14px', marginBottom: '10px' }}>
                  📊 키워드 그룹 분석
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {Object.entries(keywordGroups).map(([category, keywords]) => (
                    <div
                      key={category}
                      style={{
                        background: theme.bg,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${theme.border}`
                      }}
                    >
                      <div style={{ color: theme.text, fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                        {category}
                      </div>
                      <div style={{ color: theme.subtext, fontSize: '11px' }}>
                        {keywords.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 세션 관리 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: theme.text, fontSize: '18px', marginBottom: '15px' }}>
            💾 세션 관리
          </h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input
              type="text"
              value={currentSessionName}
              onChange={(e) => setCurrentSessionName(e.target.value)}
              placeholder="세션 이름 (예: 국방산업 분석, AI 테마주 발굴)"
              style={{
                flex: 1,
                padding: '10px 14px',
                border: `2px solid ${theme.border}`,
                borderRadius: '6px',
                background: theme.bg,
                color: theme.text,
                fontSize: '14px'
              }}
            />
            <button
              onClick={saveSession}
              disabled={!currentSessionName || currentKeywords.length === 0}
              style={{
                background: theme.warning,
                border: 'none',
                color: 'white',
                padding: '10px 18px',
                borderRadius: '6px',
                cursor: currentSessionName && currentKeywords.length > 0 ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '600',
                opacity: currentSessionName && currentKeywords.length > 0 ? 1 : 0.6
              }}
            >
              💾 저장
            </button>
          </div>

          {/* 저장된 세션 목록 */}
          {savedSessions.length > 0 && (
            <div style={{
              background: theme.cardBg,
              borderRadius: '8px',
              padding: '15px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ color: theme.text, fontSize: '14px', marginBottom: '10px' }}>
                📂 저장된 세션 ({savedSessions.length}개)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedSessions.slice(0, 5).map(session => (
                  <div
                    key={session.id}
                    style={{
                      background: theme.bg,
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${theme.border}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ color: theme.text, fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>
                        {session.name}
                      </div>
                      <div style={{ color: theme.subtext, fontSize: '12px' }}>
                        {session.keywords.slice(0, 3).join(', ')}{session.keywords.length > 3 && '...'} 
                        • {new Date(session.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => loadSession(session)}
                      style={{
                        background: theme.accent,
                        border: 'none',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      불러오기
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 분석 시작 버튼 */}
        {currentKeywords.length > 0 && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={startAnalysis}
              style={{
                background: `linear-gradient(135deg, ${theme.positive}, ${theme.teal})`,
                border: 'none',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🚀 키워드 기반 종목 발굴 시작!
            </button>
            <div style={{ color: theme.subtext, fontSize: '12px', marginTop: '10px' }}>
              선택된 키워드로 동전주, 밈주식, 퀀트 분석을 시작합니다
            </div>
          </div>
        )}
      </div>

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
        <div>🧠 생각의 흐름을 키워드로 정리하여 투자 기회를 발굴하세요</div>
        <div>💡 AI 보조 질문으로 더 체계적인 브레인스토밍 가능</div>
      </div>
    </div>
  );
};

export default KeywordBrainstormingSystem; 