import React, { useState, useEffect } from 'react';
import freeUSStockAPI from '../services/freeUSStockAPI';

const SimpleTOSTable = ({ darkMode = false }) => {
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // 에이지이글에어리얼사 관련 워치리스트
  const watchlist = ['ACEL', 'EAGLE', 'AEGL', 'AAPL', 'TSLA', 'NVDA', 'MSFT'];

  const theme = {
    bg: darkMode ? '#1a1a1a' : '#ffffff',
    cardBg: darkMode ? '#2d2d2d' : '#f8f9fa',
    text: darkMode ? '#ffffff' : '#333333',
    subtext: darkMode ? '#cccccc' : '#666666',
    border: darkMode ? '#404040' : '#e0e0e0',
    positive: '#00c851',
    negative: '#ff4444',
    neutral: darkMode ? '#999999' : '#666666'
  };

  // 실시간 데이터 업데이트
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const promises = watchlist.map(symbol => freeUSStockAPI.getUSStockData(symbol));
        const results = await Promise.all(promises);
        
        const dataMap = {};
        results.forEach(data => {
          dataMap[data.symbol] = data;
        });
        
        setStockData(dataMap);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // 5초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return 'N/A';
    return Number(num).toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatVolume = (volume) => {
    if (!volume) return 'N/A';
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toLocaleString();
  };

  const getPriceColor = (change) => {
    if (change > 0) return theme.positive;
    if (change < 0) return theme.negative;
    return theme.neutral;
  };

  if (loading && Object.keys(stockData).length === 0) {
    return (
      <div style={{
        background: theme.cardBg,
        borderRadius: '8px',
        border: `1px solid ${theme.border}`,
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ color: theme.text, fontSize: '16px', marginBottom: '10px' }}>
          📊 TOS 스타일 워치리스트 로딩 중...
        </div>
        <div style={{ color: theme.subtext, fontSize: '14px' }}>
          실시간 주식 데이터를 가져오고 있습니다
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.bg,
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      overflow: 'hidden',
      marginBottom: '20px'
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
            📊 TOS 스타일 워치리스트
          </h3>
          <span style={{ 
            background: theme.positive, 
            color: 'white', 
            padding: '2px 8px', 
            borderRadius: '12px', 
            fontSize: '12px' 
          }}>
            실시간
          </span>
        </div>
        <div style={{ color: theme.subtext, fontSize: '12px' }}>
          마지막 업데이트: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* 테이블 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: theme.cardBg }}>
              <th style={{ padding: '12px', textAlign: 'left', color: theme.text, fontWeight: '600', fontSize: '14px' }}>심볼</th>
              <th style={{ padding: '12px', textAlign: 'left', color: theme.text, fontWeight: '600', fontSize: '14px' }}>종목명</th>
              <th style={{ padding: '12px', textAlign: 'right', color: theme.text, fontWeight: '600', fontSize: '14px' }}>현재가</th>
              <th style={{ padding: '12px', textAlign: 'right', color: theme.text, fontWeight: '600', fontSize: '14px' }}>변화</th>
              <th style={{ padding: '12px', textAlign: 'right', color: theme.text, fontWeight: '600', fontSize: '14px' }}>변화율</th>
              <th style={{ padding: '12px', textAlign: 'right', color: theme.text, fontWeight: '600', fontSize: '14px' }}>거래량</th>
              <th style={{ padding: '12px', textAlign: 'center', color: theme.text, fontWeight: '600', fontSize: '14px' }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map(symbol => {
              const stock = stockData[symbol];
              if (!stock) return null;

              return (
                <tr 
                  key={symbol} 
                  style={{ 
                    borderBottom: `1px solid ${theme.border}`,
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.parentElement.style.background = theme.cardBg}
                  onMouseLeave={(e) => e.target.parentElement.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px' }}>
                    <div style={{ color: '#007bff', fontWeight: '600', fontSize: '14px' }}>
                      {stock.symbol}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ color: theme.text, fontSize: '13px' }}>
                      {stock.name}
                    </div>
                    <div style={{ color: theme.subtext, fontSize: '11px' }}>
                      {stock.source}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ color: theme.text, fontWeight: '600', fontSize: '14px' }}>
                      ${formatNumber(stock.price)}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ 
                      color: getPriceColor(stock.change), 
                      fontWeight: '600', 
                      fontSize: '13px' 
                    }}>
                      {stock.change > 0 ? '+' : ''}{formatNumber(stock.change)}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ 
                      color: getPriceColor(stock.changePercent), 
                      fontWeight: '600', 
                      fontSize: '13px' 
                    }}>
                      {stock.changePercent > 0 ? '+' : ''}{formatNumber(stock.changePercent, 2)}%
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ color: theme.text, fontSize: '13px' }}>
                      {formatVolume(stock.volume)}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: stock.isRealTime ? theme.positive : '#ffbb33'
                    }}></span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 하단 정보 */}
      <div style={{
        background: theme.cardBg,
        padding: '10px 20px',
        borderTop: `1px solid ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: theme.subtext
      }}>
        <div>
          💡 <strong>에이지이글에어리얼사</strong> 관련 미국 주식 포함
        </div>
        <div>
          🔄 5초마다 자동 업데이트
        </div>
      </div>
    </div>
  );
};

export default SimpleTOSTable; 