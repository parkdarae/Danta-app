import React, { useState, useEffect, useCallback, useMemo } from 'react';
import realTimeDataService from '../services/realTimeDataService';

const TOSStyleTradingTable = ({ 
  watchlist = ['ACEL', 'EAGLE', 'AEGL', 'AAPL', 'TSLA', 'NVDA', 'MSFT'], 
  darkMode = false 
}) => {
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'asc' });
  const [selectedStock, setSelectedStock] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // TOS 스타일 색상 테마
  const theme = useMemo(() => ({
    background: darkMode ? '#1a1a1a' : '#ffffff',
    cardBg: darkMode ? '#2d2d2d' : '#f8f9fa',
    text: darkMode ? '#ffffff' : '#333333',
    subtext: darkMode ? '#cccccc' : '#666666',
    border: darkMode ? '#404040' : '#e0e0e0',
    headerBg: darkMode ? '#333333' : '#f0f0f0',
    rowHover: darkMode ? '#3a3a3a' : '#f5f5f5',
    positive: '#00c851',
    negative: '#ff4444',
    neutral: darkMode ? '#999999' : '#666666',
    accent: '#007bff',
    warning: '#ffbb33'
  }), [darkMode]);

  // 실시간 데이터 구독
  useEffect(() => {
    let subscription = null;

    const startSubscription = () => {
      setLoading(true);
      subscription = realTimeDataService.startRealTimeSubscription(
        watchlist,
        (data, error) => {
          if (error) {
            setError(error.message);
            setLoading(false);
          } else {
            setStockData(data);
            setError(null);
            setLoading(false);
          }
        },
        refreshInterval
      );
    };

    startSubscription();

    return () => {
      if (subscription) {
        subscription.stop();
      }
    };
  }, [watchlist, refreshInterval]);

  // 테이블 정렬
  const handleSort = useCallback((key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // 정렬된 데이터
  const sortedData = useMemo(() => {
    const data = Object.values(stockData);
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aString < bString ? -1 : aString > bString ? 1 : 0;
      } else {
        return aString > bString ? -1 : aString < bString ? 1 : 0;
      }
    });
  }, [stockData, sortConfig]);

  // 가격 변화 색상
  const getPriceColor = (change) => {
    if (change > 0) return theme.positive;
    if (change < 0) return theme.negative;
    return theme.neutral;
  };

  // 숫자 포맷팅
  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return 'N/A';
    return Number(num).toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  // 큰 숫자 포맷팅 (Market Cap)
  const formatLargeNumber = (num) => {
    if (num === null || num === undefined || num === 0) return 'N/A';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(0)}`;
  };

  // 새로고침 간격 변경
  const handleRefreshIntervalChange = (interval) => {
    setRefreshInterval(interval);
  };

  if (loading && Object.keys(stockData).length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        background: theme.cardBg,
        borderRadius: '8px',
        border: `1px solid ${theme.border}`
      }}>
        <div style={{ color: theme.text, fontSize: '18px', marginBottom: '10px' }}>
          🔄 TOS 스타일 트레이딩 데이터 로딩 중...
        </div>
        <div style={{ color: theme.subtext, fontSize: '14px' }}>
          실시간 주식 데이터를 불러오고 있습니다
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.background,
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      overflow: 'hidden'
    }}>
      {/* 헤더 */}
      <div style={{
        background: theme.headerBg,
        padding: '15px 20px',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>
            📊 TOS 스타일 워치리스트
          </h3>
          <div style={{ color: theme.subtext, fontSize: '14px' }}>
            {Object.keys(stockData).length}개 종목
          </div>
          {error && (
            <div style={{ color: theme.warning, fontSize: '12px' }}>
              ⚠️ {error}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={refreshInterval}
            onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              color: theme.text,
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <option value={3000}>3초</option>
            <option value={5000}>5초</option>
            <option value={10000}>10초</option>
            <option value={30000}>30초</option>
          </select>
          <div style={{
            color: loading ? theme.warning : theme.positive,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            {loading ? '🔄' : '✅'} 실시간
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: theme.headerBg }}>
              {[
                { key: 'symbol', label: '심볼', width: '80px' },
                { key: 'name', label: '종목명', width: '180px' },
                { key: 'price', label: '현재가', width: '100px' },
                { key: 'change', label: '변화', width: '80px' },
                { key: 'changePercent', label: '변화율', width: '80px' },
                { key: 'volume', label: '거래량', width: '100px' },
                { key: 'high', label: '고가', width: '80px' },
                { key: 'low', label: '저가', width: '80px' },
                { key: 'open', label: '시가', width: '80px' },
                { key: 'marketCap', label: '시가총액', width: '100px' },
                { key: 'pe', label: 'P/E', width: '60px' },
                { key: 'source', label: '소스', width: '80px' }
              ].map(column => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  style={{
                    padding: '12px 8px',
                    textAlign: 'left',
                    borderBottom: `1px solid ${theme.border}`,
                    color: theme.text,
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    userSelect: 'none',
                    width: column.width,
                    background: sortConfig.key === column.key ? theme.accent + '20' : 'transparent'
                  }}
                >
                  {column.label}
                  {sortConfig.key === column.key && (
                    <span style={{ marginLeft: '5px' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map(stock => (
              <tr
                key={stock.symbol}
                onClick={() => setSelectedStock(selectedStock === stock.symbol ? null : stock.symbol)}
                style={{
                  cursor: 'pointer',
                  background: selectedStock === stock.symbol ? theme.accent + '20' : 'transparent',
                  borderBottom: `1px solid ${theme.border}`,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedStock !== stock.symbol) {
                    e.target.style.background = theme.rowHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedStock !== stock.symbol) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <td style={{ padding: '10px 8px', fontSize: '12px', fontWeight: '600', color: theme.accent }}>
                  {stock.symbol}
                </td>
                <td style={{ padding: '10px 8px', fontSize: '12px', color: theme.text }}>
                  <div>{stock.name}</div>
                  <div style={{ color: theme.subtext, fontSize: '10px' }}>
                    {stock.exchange} • {stock.currency}
                  </div>
                </td>
                <td style={{ 
                  padding: '10px 8px', 
                  fontSize: '13px', 
                  fontWeight: '600',
                  color: theme.text 
                }}>
                  ${formatNumber(stock.price)}
                </td>
                <td style={{ 
                  padding: '10px 8px', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: getPriceColor(stock.change)
                }}>
                  {stock.change > 0 ? '+' : ''}{formatNumber(stock.change)}
                </td>
                <td style={{ 
                  padding: '10px 8px', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: getPriceColor(stock.changePercent)
                }}>
                  {stock.changePercent > 0 ? '+' : ''}{formatNumber(stock.changePercent, 2)}%
                </td>
                <td style={{ padding: '10px 8px', fontSize: '12px', color: theme.text }}>
                  {formatNumber(stock.volume, 0)}
                </td>
                <td style={{ padding: '10px 8px', fontSize: '12px', color: theme.positive }}>
                  ${formatNumber(stock.high)}
                </td>
                <td style={{ padding: '10px 8px', fontSize: '12px', color: theme.negative }}>
                  ${formatNumber(stock.low)}
                </td>
                <td style={{ padding: '10px 8px', fontSize: '12px', color: theme.text }}>
                  ${formatNumber(stock.open)}
                </td>
                <td style={{ padding: '10px 8px', fontSize: '12px', color: theme.text }}>
                  {formatLargeNumber(stock.marketCap)}
                </td>
                <td style={{ padding: '10px 8px', fontSize: '12px', color: theme.text }}>
                  {formatNumber(stock.pe, 1)}
                </td>
                <td style={{ padding: '10px 8px', fontSize: '10px', color: theme.subtext }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '3px' 
                  }}>
                    {stock.isRealTime ? '🔴' : '🟡'}
                    {stock.source}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 선택된 종목 상세 정보 */}
      {selectedStock && stockData[selectedStock] && (
        <div style={{
          background: theme.cardBg,
          borderTop: `1px solid ${theme.border}`,
          padding: '15px 20px'
        }}>
          <h4 style={{ 
            margin: '0 0 10px 0', 
            color: theme.text,
            fontSize: '16px'
          }}>
            📈 {stockData[selectedStock].name} ({selectedStock}) 상세 정보
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px',
            fontSize: '12px'
          }}>
            <div>
              <div style={{ color: theme.subtext }}>산업군</div>
              <div style={{ color: theme.text, fontWeight: '600' }}>
                {stockData[selectedStock].industry || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ color: theme.subtext }}>국가</div>
              <div style={{ color: theme.text, fontWeight: '600' }}>
                {stockData[selectedStock].country || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ color: theme.subtext }}>EPS</div>
              <div style={{ color: theme.text, fontWeight: '600' }}>
                ${formatNumber(stockData[selectedStock].eps)}
              </div>
            </div>
            <div>
              <div style={{ color: theme.subtext }}>마지막 업데이트</div>
              <div style={{ color: theme.text, fontWeight: '600' }}>
                {new Date(stockData[selectedStock].timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TOSStyleTradingTable; 