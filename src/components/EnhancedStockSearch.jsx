import React, { useState, useEffect, useCallback, useRef } from 'react';
import { searchStocks, getStockBySymbol, getPopularStocks } from '../data/stockMasterDB';
import kisAPI from '../services/kisAPI';
import freeUSStockAPI from '../services/freeUSStockAPI';

const EnhancedStockSearch = ({ 
  darkMode = false, 
  onStockSelect,
  onWatchlistAdd,
  selectedStock 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularStocks, setPopularStocks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('');
  
  const searchInputRef = useRef(null);
  const debounceTimer = useRef(null);

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

  // 초기 데이터 로드
  useEffect(() => {
    // 인기 종목 로드
    const popular = getPopularStocks('ALL', 8);
    setPopularStocks(popular);

    // 최근 검색 기록 로드
    const recent = JSON.parse(localStorage.getItem('recent_stock_searches') || '[]');
    setRecentSearches(recent);
  }, []);

  // 디바운스 검색
  const debouncedSearch = useCallback((query, country, sector) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (query.length < 1) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      
      try {
        const results = searchStocks(query, {
          country: country,
          sector: sector || null,
          limit: 10,
          includeScore: true
        });
        
        console.log(`🔍 검색: "${query}" → ${results.length}개 결과`);
        setSearchResults(results);
      } catch (error) {
        console.error('검색 오류:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // 검색어 변경 처리
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setShowDropdown(true);
    debouncedSearch(value, selectedCountry, selectedSector);
  };

  // 종목 선택 처리
  const handleStockSelect = async (stock) => {
    try {
      console.log(`📊 종목 선택: ${stock.symbol} (${stock.name})`);
      
      // 최근 검색에 추가
      const updatedRecent = [
        stock,
        ...recentSearches.filter(item => item.symbol !== stock.symbol)
      ].slice(0, 10);
      
      setRecentSearches(updatedRecent);
      localStorage.setItem('recent_stock_searches', JSON.stringify(updatedRecent));

      // 실시간 데이터 조회
      let realTimeData = null;
      try {
        if (stock.country === 'KOR') {
          realTimeData = await kisAPI.getCurrentPrice(stock.symbol, 'domestic');
        } else {
          realTimeData = await freeUSStockAPI.getUSStockData(stock.symbol);
        }
        
        console.log(`✅ 실시간 데이터 조회 성공:`, realTimeData);
      } catch (error) {
        console.warn('실시간 데이터 조회 실패, 기본 정보 사용:', error);
      }

      // 종목 정보 결합
      const combinedData = {
        ...stock,
        ...realTimeData,
        basicInfo: stock, // 기본 정보 보존
        hasRealTimeData: !!realTimeData
      };

      // 콜백 호출
      if (onStockSelect) {
        onStockSelect(combinedData);
      }

      // UI 정리
      setSearchTerm(stock.symbol + ' - ' + stock.name);
      setShowDropdown(false);
      
    } catch (error) {
      console.error('종목 선택 처리 오류:', error);
    }
  };

  // 관심종목 추가
  const handleAddToWatchlist = (stock, event) => {
    event.stopPropagation();
    if (onWatchlistAdd) {
      onWatchlistAdd(stock);
    }
    console.log(`⭐ 관심종목 추가: ${stock.symbol}`);
  };

  // 국가 필터 변경
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    if (searchTerm) {
      debouncedSearch(searchTerm, country, selectedSector);
    }
  };

  // 섹터 필터 변경
  const handleSectorChange = (sector) => {
    setSelectedSector(sector);
    if (searchTerm) {
      debouncedSearch(searchTerm, selectedCountry, sector);
    }
  };

  // 섹터 목록
  const sectors = [
    { value: '', label: '전체 섹터' },
    { value: 'Technology', label: '기술' },
    { value: 'Healthcare', label: '헬스케어' },
    { value: 'Financial Services', label: '금융' },
    { value: 'Consumer Discretionary', label: '임의소비재' },
    { value: 'Consumer Staples', label: '필수소비재' },
    { value: 'Aerospace & Defense', label: '항공우주/방산' },
    { value: '반도체', label: '반도체' },
    { value: '바이오', label: '바이오' },
    { value: '화학', label: '화학' },
    { value: '자동차', label: '자동차' }
  ];

  return (
    <div style={{
      background: theme.bg,
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      marginBottom: '20px',
      position: 'relative'
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
            🔍 향상된 종목 검색
          </h3>
          <span style={{
            background: theme.positive,
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            DB 통합
          </span>
        </div>
      </div>

      {/* 검색 필터 */}
      <div style={{
        padding: '15px 20px',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* 국가 필터 */}
        <select
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          style={{
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '12px'
          }}
        >
          <option value="ALL">🌍 전체</option>
          <option value="KOR">🇰🇷 한국</option>
          <option value="USA">🇺🇸 미국</option>
        </select>

        {/* 섹터 필터 */}
        <select
          value={selectedSector}
          onChange={(e) => handleSectorChange(e.target.value)}
          style={{
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '12px'
          }}
        >
          {sectors.map(sector => (
            <option key={sector.value} value={sector.value}>
              {sector.label}
            </option>
          ))}
        </select>

        <div style={{ color: theme.subtext, fontSize: '12px', marginLeft: 'auto' }}>
          총 종목: 한국 {Object.keys(getPopularStocks('KOR', 1000)).length}개, 
          미국 {Object.keys(getPopularStocks('USA', 1000)).length}개
        </div>
      </div>

      {/* 검색 입력 */}
      <div style={{ padding: '15px 20px', position: 'relative' }}>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="종목명, 심볼, 업종으로 검색 (예: 에이지이글, UAVS, 삼성전자, AAPL)"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          style={{
            width: '100%',
            padding: '12px 15px',
            border: `2px solid ${theme.border}`,
            borderRadius: '8px',
            background: theme.bg,
            color: theme.text,
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = theme.accent}
          onBlur={(e) => e.target.style.borderColor = theme.border}
        />

        {loading && (
          <div style={{
            position: 'absolute',
            right: '30px',
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
            left: '20px',
            right: '20px',
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000
          }}>
            {/* 검색 결과 */}
            {searchTerm && searchResults.length > 0 && (
              <div>
                <div style={{
                  padding: '10px 15px',
                  borderBottom: `1px solid ${theme.border}`,
                  color: theme.subtext,
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  🔍 검색 결과 ({searchResults.length}개)
                </div>
                {searchResults.map((stock, index) => (
                  <div
                    key={stock.symbol}
                    onClick={() => handleStockSelect(stock)}
                    style={{
                      padding: '12px 15px',
                      borderBottom: index === searchResults.length - 1 ? 'none' : `1px solid ${theme.border}`,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = theme.cardBg}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          color: stock.symbol === 'UAVS' ? theme.warning : theme.accent,
                          fontWeight: '600',
                          fontSize: '14px'
                        }}>
                          {stock.symbol}
                          {stock.symbol === 'UAVS' && ' 🎯🚁'}
                        </span>
                        <span style={{
                          background: stock.country === 'KOR' ? theme.positive : theme.accent,
                          color: 'white',
                          padding: '1px 6px',
                          borderRadius: '8px',
                          fontSize: '10px'
                        }}>
                          {stock.country === 'KOR' ? '🇰🇷' : '🇺🇸'}
                        </span>
                        <span style={{
                          background: theme.border,
                          color: theme.subtext,
                          padding: '1px 6px',
                          borderRadius: '8px',
                          fontSize: '10px'
                        }}>
                          {stock.sector}
                        </span>
                      </div>
                      
                      <div style={{ color: theme.text, fontSize: '13px', marginBottom: '2px' }}>
                        {stock.name}
                        {stock.nameKor && stock.country === 'USA' && (
                          <span style={{ color: theme.subtext }}> ({stock.nameKor})</span>
                        )}
                      </div>
                      
                      <div style={{ color: theme.subtext, fontSize: '11px' }}>
                        {stock.market} • {stock.industry}
                        {stock.score && (
                          <span style={{ color: theme.warning }}> • 관련도 {stock.score}</span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => handleAddToWatchlist(stock, e)}
                      style={{
                        background: theme.positive,
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                      title="관심종목 추가"
                    >
                      ⭐
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 검색 결과 없음 */}
            {searchTerm && searchResults.length === 0 && !loading && (
              <div style={{
                padding: '20px 15px',
                textAlign: 'center',
                color: theme.subtext,
                fontSize: '14px'
              }}>
                "{searchTerm}"에 대한 검색 결과가 없습니다.
                <br />
                <small>종목명, 심볼, 업종으로 다시 검색해보세요.</small>
              </div>
            )}

            {/* 최근 검색 & 인기 종목 */}
            {!searchTerm && (
              <div>
                {/* 최근 검색 */}
                {recentSearches.length > 0 && (
                  <div>
                    <div style={{
                      padding: '10px 15px',
                      borderBottom: `1px solid ${theme.border}`,
                      color: theme.subtext,
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      🕒 최근 검색
                    </div>
                    {recentSearches.slice(0, 5).map((stock, index) => (
                      <div
                        key={stock.symbol}
                        onClick={() => handleStockSelect(stock)}
                        style={{
                          padding: '10px 15px',
                          borderBottom: `1px solid ${theme.border}`,
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onMouseEnter={(e) => e.target.style.background = theme.cardBg}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <div>
                          <span style={{ color: theme.accent, fontWeight: '600', fontSize: '13px' }}>
                            {stock.symbol}
                          </span>
                          <span style={{ color: theme.text, marginLeft: '8px', fontSize: '12px' }}>
                            {stock.name}
                          </span>
                        </div>
                        <span style={{
                          background: stock.country === 'KOR' ? theme.positive : theme.accent,
                          color: 'white',
                          padding: '1px 6px',
                          borderRadius: '8px',
                          fontSize: '10px'
                        }}>
                          {stock.country === 'KOR' ? '🇰🇷' : '🇺🇸'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 인기 종목 */}
                <div>
                  <div style={{
                    padding: '10px 15px',
                    borderBottom: `1px solid ${theme.border}`,
                    color: theme.subtext,
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    🔥 인기 종목 (시가총액 기준)
                  </div>
                  {popularStocks.slice(0, 6).map((stock, index) => (
                    <div
                      key={stock.symbol}
                      onClick={() => handleStockSelect(stock)}
                      style={{
                        padding: '10px 15px',
                        borderBottom: index === 5 ? 'none' : `1px solid ${theme.border}`,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.target.style.background = theme.cardBg}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <div>
                        <span style={{ color: theme.accent, fontWeight: '600', fontSize: '13px' }}>
                          {stock.symbol}
                          {stock.symbol === 'UAVS' && ' 🎯🚁'}
                        </span>
                        <span style={{ color: theme.text, marginLeft: '8px', fontSize: '12px' }}>
                          {stock.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ color: theme.subtext, fontSize: '10px' }}>
                          {stock.marketCap ? 
                            (stock.marketCap >= 1e12 ? 
                              `$${(stock.marketCap/1e12).toFixed(1)}T` : 
                              `$${(stock.marketCap/1e9).toFixed(0)}B`
                            ) : 
                            stock.currency === 'KRW' ? 
                              `${(stock.marketCap/1e12).toFixed(0)}조` : 
                              'N/A'
                          }
                        </span>
                        <span style={{
                          background: stock.country === 'KOR' ? theme.positive : theme.accent,
                          color: 'white',
                          padding: '1px 6px',
                          borderRadius: '8px',
                          fontSize: '10px'
                        }}>
                          {stock.country === 'KOR' ? '🇰🇷' : '🇺🇸'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
        <div>💡 선택 시 실시간 데이터 자동 조회</div>
        <div>🎯 에이지이글에어리얼 시스템스 (UAVS) 우선 표시</div>
      </div>
    </div>
  );
};

export default EnhancedStockSearch; 