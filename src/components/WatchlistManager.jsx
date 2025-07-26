import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const WatchlistManager = ({ darkMode = false, onWatchlistChange }) => {
  const [watchlist, setWatchlist] = useLocalStorage('user_watchlist', ['UAVS', 'AAPL', 'TSLA', 'NVDA', 'MSFT']);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

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

  // 관심종목 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    if (onWatchlistChange) {
      onWatchlistChange(watchlist);
    }
  }, [watchlist, onWatchlistChange]);

  // 주식 검색 (확장된 목록)
  const searchStocks = (query) => {
    const allStocks = [
      // 🎯 에이지이글에어리얼 시스템스 - 정확한 매핑
      { symbol: 'UAVS', name: 'AgEagle Aerial Systems Inc', market: 'NYSE American', category: '에이지이글에어리얼시스템스' },
      
      // 항공우주/드론 관련 (에이지이글과 유사 섹터)
      { symbol: 'BA', name: 'Boeing Co', market: 'NYSE', category: '항공우주' },
      { symbol: 'RTX', name: 'Raytheon Technologies Corp', market: 'NYSE', category: '항공우주' },
      { symbol: 'LMT', name: 'Lockheed Martin Corp', market: 'NYSE', category: '방산' },
      { symbol: 'AVAV', name: 'AeroVironment Inc', market: 'NASDAQ', category: '드론' },
      { symbol: 'KTOS', name: 'Kratos Defense & Security Solutions', market: 'NASDAQ', category: '방산' },
      { symbol: 'PLTR', name: 'Palantir Technologies Inc', market: 'NYSE', category: '데이터분석' },
      
      // 주요 미국 주식
      { symbol: 'AAPL', name: 'Apple Inc', market: 'NASDAQ', category: 'Tech' },
      { symbol: 'TSLA', name: 'Tesla Inc', market: 'NASDAQ', category: 'EV' },
      { symbol: 'NVDA', name: 'NVIDIA Corp', market: 'NASDAQ', category: 'AI' },
      { symbol: 'MSFT', name: 'Microsoft Corp', market: 'NASDAQ', category: 'Tech' },
      { symbol: 'GOOGL', name: 'Alphabet Inc', market: 'NASDAQ', category: 'Tech' },
      { symbol: 'META', name: 'Meta Platforms Inc', market: 'NASDAQ', category: 'Social' },
      { symbol: 'AMZN', name: 'Amazon.com Inc', market: 'NASDAQ', category: 'E-commerce' },
      { symbol: 'NFLX', name: 'Netflix Inc', market: 'NASDAQ', category: 'Streaming' },
      { symbol: 'CRM', name: 'Salesforce Inc', market: 'NYSE', category: 'Cloud' },
      { symbol: 'UBER', name: 'Uber Technologies Inc', market: 'NYSE', category: 'Mobility' },
      
      // 항공/에어리얼 관련
      { symbol: 'BA', name: 'Boeing Co', market: 'NYSE', category: 'Aerospace' },
      { symbol: 'AAL', name: 'American Airlines Group', market: 'NASDAQ', category: 'Airlines' },
      { symbol: 'DAL', name: 'Delta Air Lines Inc', market: 'NYSE', category: 'Airlines' },
      { symbol: 'UAL', name: 'United Airlines Holdings', market: 'NASDAQ', category: 'Airlines' },
      { symbol: 'LUV', name: 'Southwest Airlines Co', market: 'NYSE', category: 'Airlines' },
      
      // 암호화폐 관련
      { symbol: 'COIN', name: 'Coinbase Global Inc', market: 'NASDAQ', category: 'Crypto' },
      { symbol: 'MSTR', name: 'MicroStrategy Inc', market: 'NASDAQ', category: 'Crypto' },
      
      // 한국 주식 (추가)
      { symbol: '005930', name: '삼성전자', market: 'KOSPI', category: '반도체' },
      { symbol: '373220', name: 'LG에너지솔루션', market: 'KOSPI', category: '배터리' },
      { symbol: '207940', name: '삼성바이오로직스', market: 'KOSPI', category: '바이오' },
      { symbol: '006400', name: '삼성SDI', market: 'KOSPI', category: '배터리' },
      { symbol: '051910', name: 'LG화학', market: 'KOSPI', category: '화학' }
    ];

    const query_lower = query.toLowerCase();
    return allStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query_lower) ||
      stock.name.toLowerCase().includes(query_lower) ||
      stock.category.toLowerCase().includes(query_lower)
    ).slice(0, 8);
  };

  // 검색어 입력 처리
  const handleSearch = (query) => {
    setSearchTerm(query);
    if (query.length >= 2) {
      const results = searchStocks(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // 관심종목에 추가
  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      const newWatchlist = [...watchlist, symbol];
      setWatchlist(newWatchlist);
      setSearchTerm('');
      setSearchResults([]);
      setShowAddForm(false);
    }
  };

  // 관심종목에서 제거
  const removeFromWatchlist = (symbol) => {
    const newWatchlist = watchlist.filter(item => item !== symbol);
    setWatchlist(newWatchlist);
  };

  // 관심종목 순서 변경
  const moveWatchlistItem = (fromIndex, toIndex) => {
    const newWatchlist = [...watchlist];
    const item = newWatchlist.splice(fromIndex, 1)[0];
    newWatchlist.splice(toIndex, 0, item);
    setWatchlist(newWatchlist);
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
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>
            ⭐ 관심종목 관리
          </h3>
          <span style={{
            background: theme.accent,
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            {watchlist.length}개
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            background: showAddForm ? theme.negative : theme.positive,
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {showAddForm ? '✕ 취소' : '+ 종목 추가'}
        </button>
      </div>

      {/* 종목 추가 폼 */}
      {showAddForm && (
        <div style={{
          background: theme.cardBg,
          padding: '15px 20px',
          borderBottom: `1px solid ${theme.border}`
        }}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="종목명 또는 심볼 검색 (예: 에이지이글, AAPL, 삼성전자)"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                background: theme.bg,
                color: theme.text,
                fontSize: '14px'
              }}
            />
          </div>
          
          {/* 검색 결과 */}
          {searchResults.length > 0 && (
            <div style={{
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {searchResults.map(stock => (
                <div
                  key={stock.symbol}
                  onClick={() => addToWatchlist(stock.symbol)}
                  style={{
                    padding: '10px 15px',
                    borderBottom: `1px solid ${theme.border}`,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = theme.cardBg}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <div>
                    <div style={{ color: theme.accent, fontWeight: '600', fontSize: '14px' }}>
                      {stock.symbol}
                    </div>
                    <div style={{ color: theme.text, fontSize: '13px' }}>
                      {stock.name}
                    </div>
                  </div>
                  <div style={{
                    background: theme.accent,
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}>
                    {stock.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 관심종목 목록 */}
      <div style={{ padding: '15px 20px' }}>
        {watchlist.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: theme.subtext,
            padding: '20px',
            fontSize: '14px'
          }}>
            관심종목이 없습니다. 위의 "종목 추가" 버튼을 클릭하여 추가해보세요.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '10px'
          }}>
            {watchlist.map((symbol, index) => (
              <div
                key={symbol}
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: theme.accent,
                    color: 'white',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {index + 1}
                  </span>
                  <div>
                    <div style={{ color: theme.accent, fontWeight: '600', fontSize: '14px' }}>
                      {symbol}
                    </div>
                    <div style={{ color: theme.subtext, fontSize: '11px' }}>
                      #{index + 1}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {index > 0 && (
                    <button
                      onClick={() => moveWatchlistItem(index, index - 1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.accent,
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '2px'
                      }}
                      title="위로"
                    >
                      ↑
                    </button>
                  )}
                  {index < watchlist.length - 1 && (
                    <button
                      onClick={() => moveWatchlistItem(index, index + 1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.accent,
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '2px'
                      }}
                      title="아래로"
                    >
                      ↓
                    </button>
                  )}
                  <button
                    onClick={() => removeFromWatchlist(symbol)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.negative,
                      cursor: 'pointer',
                      fontSize: '12px',
                      padding: '2px'
                    }}
                    title="삭제"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
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
        <div>💡 드래그하여 순서 변경 가능</div>
        <div>🔄 실시간 업데이트 중</div>
      </div>
    </div>
  );
};

export default WatchlistManager; 