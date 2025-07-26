import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const RealtimeStockSearch = ({ onStockSelect, darkMode = false, selectedStock }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStockData, setSelectedStockData] = useState(null);
  const searchInputRef = useRef(null);
  const debounceTimer = useRef(null);

  const theme = {
    background: darkMode ? '#23272b' : '#fff',
    text: darkMode ? '#e0e0e0' : '#222',
    subtext: darkMode ? '#aaa' : '#888',
    border: darkMode ? '#333' : '#eee',
    accent: '#8884d8',
    hover: darkMode ? '#2a2e33' : '#f8f9fa',
    success: '#4caf50',
    error: '#f44336'
  };

  // 한국 주식 검색 (예시 - 실제로는 KIS API나 다른 한국 증권 API 사용)
  const searchKoreanStocks = async (query) => {
    // 실제 구현에서는 한국투자증권 API나 다른 실시간 API를 사용
    const mockStocks = [
      { symbol: '005930', name: '삼성전자', market: 'KOSPI', price: 71000, change: 1.2 },
      { symbol: '000660', name: 'SK하이닉스', market: 'KOSPI', price: 128000, change: -0.8 },
      { symbol: '035720', name: '카카오', market: 'KOSPI', price: 45500, change: 2.1 },
      { symbol: '051910', name: 'LG화학', market: 'KOSPI', price: 385000, change: 0.5 },
      { symbol: '068270', name: '셀트리온', market: 'KOSPI', price: 178000, change: -1.5 },
      { symbol: '028300', name: 'HLB', market: 'KOSDAQ', price: 32100, change: 3.2 },
      { symbol: '041510', name: '에이지이글', market: 'KOSDAQ', price: 8840, change: 5.7 },
      { symbol: '096770', name: 'SK이노베이션', market: 'KOSPI', price: 89400, change: -0.3 },
      { symbol: '034220', name: 'LG디스플레이', market: 'KOSPI', price: 12950, change: 1.8 },
      { symbol: '003550', name: 'LG', market: 'KOSPI', price: 85600, change: 0.9 }
    ];

    return mockStocks.filter(stock => 
      stock.name.toLowerCase().includes(query.toLowerCase()) ||
      stock.symbol.includes(query)
    );
  };

  // 글로벌 주식 검색 (Alpha Vantage API 사용)
  const searchGlobalStocks = async (query) => {
    try {
      const response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
          apikey: 'demo' // 실제 사용시 API 키 필요
        }
      });

      if (response.data && response.data.bestMatches) {
        return response.data.bestMatches.slice(0, 5).map(match => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          market: match['4. region'],
          type: match['3. type'],
          price: null // 실시간 가격은 별도 API 호출 필요
        }));
      }
      return [];
    } catch (error) {
      console.error('Global stock search error:', error);
      return [];
    }
  };

  // 실시간 주가 조회
  const fetchRealTimePrice = async (symbol, market = 'KOR') => {
    try {
      if (market === 'KOR' || market === 'KOSPI' || market === 'KOSDAQ') {
        // 한국 주식 - 실제로는 KIS API 사용
        const mockPrice = {
          symbol,
          price: Math.floor(Math.random() * 100000) + 10000,
          change: (Math.random() - 0.5) * 10,
          volume: Math.floor(Math.random() * 1000000),
          timestamp: new Date().toLocaleString()
        };
        return mockPrice;
      } else {
        // 글로벌 주식 - Alpha Vantage API
        const response = await axios.get(`https://www.alphavantage.co/query`, {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: symbol,
            apikey: 'demo'
          }
        });

        const quote = response.data['Global Quote'];
        if (quote) {
          return {
            symbol: quote['01. symbol'],
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: parseInt(quote['06. volume']),
            timestamp: quote['07. latest trading day']
          };
        }
      }
    } catch (error) {
      console.error('Real-time price fetch error:', error);
      return null;
    }
  };

  // 디바운스된 검색 함수
  const debouncedSearch = useCallback((query) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      if (query.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      setShowDropdown(true);

      try {
        // 한국 주식과 글로벌 주식 동시 검색
        const [koreanStocks, globalStocks] = await Promise.all([
          searchKoreanStocks(query),
          searchGlobalStocks(query)
        ]);

        const combinedResults = [
          ...koreanStocks.map(stock => ({ ...stock, type: 'korean' })),
          ...globalStocks.map(stock => ({ ...stock, type: 'global' }))
        ].slice(0, 10);

        setSearchResults(combinedResults);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // 종목 선택 핸들러
  const handleStockSelect = async (stock) => {
    setSearchTerm(`${stock.name} (${stock.symbol})`);
    setShowDropdown(false);
    
    // 실시간 가격 조회
    const priceData = await fetchRealTimePrice(stock.symbol, stock.market);
    const selectedData = { ...stock, ...priceData };
    
    setSelectedStockData(selectedData);
    onStockSelect(selectedData);

    // 최근 검색에 추가
    const updated = [stock, ...recentSearches.filter(s => s.symbol !== stock.symbol)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_stock_searches', JSON.stringify(updated));
  };

  // 최근 검색 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('recent_stock_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 실시간 가격 업데이트 (선택된 종목)
  useEffect(() => {
    if (selectedStockData) {
      const interval = setInterval(async () => {
        const updatedPrice = await fetchRealTimePrice(selectedStockData.symbol, selectedStockData.market);
        if (updatedPrice) {
          setSelectedStockData(prev => ({ ...prev, ...updatedPrice }));
        }
      }, 5000); // 5초마다 업데이트

      return () => clearInterval(interval);
    }
  }, [selectedStockData]);

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
          🔍 실시간 종목 검색
        </h3>
        <div style={{
          background: selectedStockData?.change >= 0 ? theme.success : theme.error,
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }}>
          실시간
        </div>
      </div>

      {/* 검색 입력 */}
      <div style={{ position: 'relative' }} ref={searchInputRef}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
          placeholder="종목명 또는 심볼을 입력하세요 (예: 삼성전자, AAPL)"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: `2px solid ${theme.border}`,
            borderRadius: '12px',
            fontSize: '1rem',
            background: theme.background,
            color: theme.text,
            outline: 'none',
            transition: 'border-color 0.3s',
          }}
          onFocus={(e) => e.target.style.borderColor = theme.accent}
          onBlur={(e) => e.target.style.borderColor = theme.border}
        />

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: theme.accent
          }}>
            🔄
          </div>
        )}

        {/* 검색 결과 드롭다운 */}
        {showDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: theme.background,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            marginTop: '0.5rem',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }}>
            {/* 검색 결과 */}
            {searchResults.length > 0 ? (
              <>
                <div style={{
                  padding: '0.5rem 1rem',
                  background: theme.hover,
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: theme.accent,
                  borderBottom: `1px solid ${theme.border}`
                }}>
                  검색 결과
                </div>
                {searchResults.map((stock, index) => (
                  <div
                    key={`${stock.symbol}-${index}`}
                    onClick={() => handleStockSelect(stock)}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      borderBottom: index < searchResults.length - 1 ? `1px solid ${theme.border}` : 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = theme.hover}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{
                          fontWeight: 'bold',
                          color: theme.text,
                          fontSize: '0.9rem'
                        }}>
                          {stock.name}
                        </div>
                        <div style={{
                          color: theme.subtext,
                          fontSize: '0.8rem'
                        }}>
                          {stock.symbol} • {stock.market}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          background: stock.type === 'korean' ? '#4caf50' : '#2196f3',
                          color: 'white',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem'
                        }}>
                          {stock.type === 'korean' ? '🇰🇷' : '🌍'}
                        </span>
                        {stock.price && (
                          <span style={{
                            color: stock.change >= 0 ? theme.success : theme.error,
                            fontWeight: 'bold',
                            fontSize: '0.8rem'
                          }}>
                            {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              !isLoading && searchTerm.length >= 2 && (
                <div style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: theme.subtext
                }}>
                  검색 결과가 없습니다
                </div>
              )
            )}

            {/* 최근 검색 */}
            {recentSearches.length > 0 && searchTerm.length < 2 && (
              <>
                <div style={{
                  padding: '0.5rem 1rem',
                  background: theme.hover,
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: theme.accent,
                  borderBottom: `1px solid ${theme.border}`
                }}>
                  최근 검색
                </div>
                {recentSearches.map((stock, index) => (
                  <div
                    key={`recent-${stock.symbol}-${index}`}
                    onClick={() => handleStockSelect(stock)}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      borderBottom: index < recentSearches.length - 1 ? `1px solid ${theme.border}` : 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = theme.hover}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{
                          fontWeight: 'bold',
                          color: theme.text,
                          fontSize: '0.9rem'
                        }}>
                          {stock.name}
                        </div>
                        <div style={{
                          color: theme.subtext,
                          fontSize: '0.8rem'
                        }}>
                          {stock.symbol} • {stock.market}
                        </div>
                      </div>
                      <span style={{ color: theme.subtext, fontSize: '0.8rem' }}>
                        🕒
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* 선택된 종목 정보 */}
      {selectedStockData && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: theme.hover,
          borderRadius: '12px',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <h4 style={{
              margin: 0,
              color: theme.text,
              fontSize: '1.1rem'
            }}>
              {selectedStockData.name}
            </h4>
            <span style={{
              background: selectedStockData.change >= 0 ? theme.success : theme.error,
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              {selectedStockData.change >= 0 ? '▲' : '▼'} {Math.abs(selectedStockData.change).toFixed(2)}%
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            fontSize: '0.9rem'
          }}>
            <div>
              <span style={{ color: theme.subtext }}>현재가: </span>
              <span style={{ color: theme.text, fontWeight: 'bold' }}>
                {selectedStockData.price?.toLocaleString()}원
              </span>
            </div>
            <div>
              <span style={{ color: theme.subtext }}>거래량: </span>
              <span style={{ color: theme.text }}>
                {selectedStockData.volume?.toLocaleString()}
              </span>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: theme.subtext }}>업데이트: </span>
              <span style={{ color: theme.text, fontSize: '0.8rem' }}>
                {selectedStockData.timestamp}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: `${theme.accent}15`,
        borderRadius: '8px',
        fontSize: '0.8rem',
        color: theme.subtext,
        textAlign: 'center'
      }}>
        💡 실시간 데이터 제공 • 한국/글로벌 주식 지원 • 5초마다 자동 업데이트
      </div>
    </div>
  );
};

export default RealtimeStockSearch; 