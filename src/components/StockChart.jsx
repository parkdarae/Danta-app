import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchChartData, symbolMap } from '../utils/fetchRealtime';

// 샘플 데이터 (API 실패 시 fallback)
const sampleData = {
  '에이지이글': {
    '5min': [
      { time: '09:00', price: 1200 },
      { time: '09:05', price: 1250 },
      { time: '09:10', price: 1300 },
      { time: '09:15', price: 1280 },
      { time: '09:20', price: 1320 },
    ],
    '1h': [
      { time: '10시', price: 1200 },
      { time: '11시', price: 1350 },
      { time: '12시', price: 1400 },
      { time: '13시', price: 1380 },
      { time: '14시', price: 1420 },
    ],
  },
  '삼성전자': {
    '5min': [
      { time: '09:00', price: 70000 },
      { time: '09:05', price: 70200 },
      { time: '09:10', price: 70500 },
      { time: '09:15', price: 70300 },
      { time: '09:20', price: 70700 },
    ],
    '1h': [
      { time: '10시', price: 70000 },
      { time: '11시', price: 71000 },
      { time: '12시', price: 71500 },
      { time: '13시', price: 71300 },
      { time: '14시', price: 71800 },
    ],
  },
  '카카오': {
    '5min': [
      { time: '09:00', price: 48000 },
      { time: '09:05', price: 48200 },
      { time: '09:10', price: 48500 },
      { time: '09:15', price: 48300 },
      { time: '09:20', price: 48800 },
    ],
    '1h': [
      { time: '10시', price: 48000 },
      { time: '11시', price: 49000 },
      { time: '12시', price: 49500 },
      { time: '13시', price: 49200 },
      { time: '14시', price: 49800 },
    ],
  },
};

function StockChart({ stock, chartType, darkMode = false }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useRealData, setUseRealData] = useState(true);

  const bg = darkMode ? '#23272b' : '#fff';
  const text = darkMode ? '#e0e0e0' : '#222';
  const subtext = darkMode ? '#aaa' : '#888';
  const border = darkMode ? '#333' : '#eee';
  const accent = '#8884d8';

  useEffect(() => {
    loadChartData();
  }, [stock, chartType, useRealData]);

  const loadChartData = async () => {
    if (!useRealData) {
      // 샘플 데이터 사용
      const sampleChartData = sampleData[stock]?.[chartType] || sampleData['삼성전자']['5min'];
      setData(sampleChartData);
      return;
    }

    // 실제 API 데이터 사용
    setLoading(true);
    setError(null);
    
    try {
      const symbol = symbolMap[stock] || '005930.KS';
      const interval = chartType === '5min' ? '5m' : '1h';
      const range = chartType === '5min' ? '1d' : '5d';
      
      const chartData = await fetchChartData(symbol, interval, range);
      
      if (chartData && chartData.length > 0) {
        setData(chartData);
      } else {
        // API 데이터가 없으면 샘플 데이터로 폴백
        const fallbackData = sampleData[stock]?.[chartType] || sampleData['삼성전자']['5min'];
        setData(fallbackData);
        setError('실시간 데이터를 가져올 수 없어 샘플 데이터를 표시합니다.');
      }
    } catch (e) {
      console.error('차트 데이터 로딩 실패:', e);
      // 에러 시 샘플 데이터로 폴백
      const fallbackData = sampleData[stock]?.[chartType] || sampleData['삼성전자']['5min'];
      setData(fallbackData);
      setError('실시간 데이터를 가져올 수 없어 샘플 데이터를 표시합니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}K`;
    }
    return price.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: darkMode ? '#333' : '#fff',
          padding: '8px 12px',
          border: `1px solid ${border}`,
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          color: text
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          <p style={{ margin: '4px 0 0 0', color: accent }}>
            {`가격: ${data.price?.toLocaleString()}원`}
          </p>
          {data.volume && (
            <p style={{ margin: '2px 0 0 0', color: subtext, fontSize: '0.9rem' }}>
              {`거래량: ${data.volume?.toLocaleString()}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      color: text
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: accent }}>
          {stock} {chartType === '5min' ? '5분봉' : '1시간봉'} 차트
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setUseRealData(!useRealData)}
            style={{
              background: useRealData ? accent : (darkMode ? '#333' : '#eee'),
              color: useRealData ? '#fff' : text,
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            {useRealData ? '실시간' : '샘플'}
          </button>
          <button
            onClick={loadChartData}
            disabled={loading}
            style={{
              background: darkMode ? '#333' : '#eee',
              color: text,
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem'
            }}
          >
            {loading ? '로딩...' : '새로고침'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: darkMode ? '#2d1b1b' : '#fef2f2',
          color: darkMode ? '#fca5a5' : '#dc2626',
          padding: '8px 12px',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: subtext }}>
          차트 데이터를 불러오는 중...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={border} />
            <XAxis 
              dataKey="time" 
              stroke={subtext}
              fontSize={12}
              tick={{ fill: subtext }}
            />
            <YAxis 
              stroke={subtext}
              fontSize={12}
              tick={{ fill: subtext }}
              tickFormatter={formatPrice}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={accent} 
              strokeWidth={2}
              dot={{ fill: accent, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: accent, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {data.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '8px',
          fontSize: '0.9rem'
        }}>
          <div style={{ color: subtext }}>
            데이터 포인트: <span style={{ color: text, fontWeight: 'bold' }}>{data.length}개</span>
          </div>
          {data.length > 0 && (
            <>
              <div style={{ color: subtext }}>
                최신 가격: <span style={{ color: accent, fontWeight: 'bold' }}>
                  {data[data.length - 1]?.price?.toLocaleString()}원
                </span>
              </div>
              <div style={{ color: subtext }}>
                최신 시각: <span style={{ color: text, fontWeight: 'bold' }}>
                  {data[data.length - 1]?.time}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default StockChart; 