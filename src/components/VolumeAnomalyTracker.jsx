import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchChartData, symbolMap, detectVolumeAnomaly } from '../utils/fetchRealtime';

// 샘플 거래대금 데이터 (시간, 거래대금)
const sampleVolume = [
  { time: '09:00', volume: 1000 },
  { time: '09:05', volume: 1200 },
  { time: '09:10', volume: 1100 },
  { time: '09:15', volume: 3500 }, // 급증
  { time: '09:20', volume: 1300 },
  { time: '09:25', volume: 600 },  // 급감
  { time: '09:30', volume: 1400 },
  { time: '09:35', volume: 1600 },
];

function VolumeAnomalyTracker({ stock = '삼성전자', darkMode = false }) {
  const [volumeData, setVolumeData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useRealData, setUseRealData] = useState(true);
  const [threshold, setThreshold] = useState(2.0);

  const bg = darkMode ? '#23272b' : '#fff';
  const text = darkMode ? '#e0e0e0' : '#222';
  const subtext = darkMode ? '#aaa' : '#888';
  const border = darkMode ? '#333' : '#eee';
  const accent = '#43a047';
  const danger = '#e53935';
  const warning = '#ff9800';

  useEffect(() => {
    loadVolumeData();
    const interval = setInterval(loadVolumeData, 30000); // 30초마다 갱신
    return () => clearInterval(interval);
  }, [stock, useRealData, threshold]);

  const loadVolumeData = async () => {
    if (!useRealData) {
      // 샘플 데이터 사용
      setVolumeData(sampleVolume);
      const sampleAnomalies = detectVolumeAnomaly(sampleVolume, threshold);
      setAnomalies(sampleAnomalies);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const symbol = symbolMap[stock] || '005930.KS';
      const chartData = await fetchChartData(symbol, '5m', '1d');
      
      if (chartData && chartData.length > 0) {
        setVolumeData(chartData);
        const detectedAnomalies = detectVolumeAnomaly(chartData, threshold);
        setAnomalies(detectedAnomalies);
      } else {
        // API 데이터가 없으면 샘플 데이터로 폴백
        setVolumeData(sampleVolume);
        const sampleAnomalies = detectVolumeAnomaly(sampleVolume, threshold);
        setAnomalies(sampleAnomalies);
        setError('실시간 데이터를 가져올 수 없어 샘플 데이터를 표시합니다.');
      }
    } catch (e) {
      console.error('거래량 데이터 로딩 실패:', e);
      setVolumeData(sampleVolume);
      const sampleAnomalies = detectVolumeAnomaly(sampleVolume, threshold);
      setAnomalies(sampleAnomalies);
      setError('실시간 데이터를 가져올 수 없어 샘플 데이터를 표시합니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatVolume = (volume) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
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
            {`거래량: ${data.volume?.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const getAnomalyColor = (ratio) => {
    if (ratio >= 3) return danger;
    if (ratio >= 2) return warning;
    return accent;
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
          {stock} 거래량 이상징후 트래킹
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            style={{
              background: darkMode ? '#333' : '#fff',
              color: text,
              border: `1px solid ${border}`,
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.8rem'
            }}
          >
            <option value={1.5}>1.5배</option>
            <option value={2.0}>2.0배</option>
            <option value={2.5}>2.5배</option>
            <option value={3.0}>3.0배</option>
          </select>
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
            onClick={loadVolumeData}
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
        <div style={{ textAlign: 'center', padding: '2rem', color: subtext }}>
          거래량 데이터를 분석하는 중...
        </div>
      ) : (
        <>
      <ResponsiveContainer width="100%" height={220}>
            <LineChart data={volumeData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
                tickFormatter={formatVolume}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke={accent} 
                strokeWidth={2} 
                dot={{ fill: accent, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: accent, strokeWidth: 2 }}
              />
        </LineChart>
      </ResponsiveContainer>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontWeight: 'bold', color: text }}>
                이상징후 감지 (평균 대비 {threshold}배 이상)
              </span>
              <span style={{ 
                fontSize: '0.9rem', 
                color: anomalies.length > 0 ? danger : accent,
                fontWeight: 'bold'
              }}>
                {anomalies.length}건 발견
              </span>
            </div>

            {anomalies.length === 0 ? (
              <div style={{ 
                color: subtext, 
                textAlign: 'center', 
                padding: '1rem',
                background: darkMode ? '#1a1f1a' : '#f8fff8',
                borderRadius: '6px',
                fontSize: '0.9rem'
              }}>
                현재 이상징후가 없습니다.
              </div>
            ) : (
              <div style={{ 
                maxHeight: '150px', 
                overflowY: 'auto',
                background: darkMode ? '#1a1a1a' : '#fafafa',
                borderRadius: '6px',
                padding: '8px'
              }}>
                {anomalies.map((anomaly, i) => (
                  <div 
                    key={i} 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 8px',
                      marginBottom: '4px',
                      background: darkMode ? '#2a2a2a' : '#fff',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${getAnomalyColor(anomaly.ratio)}`,
                      fontSize: '0.9rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 'bold', color: text }}>
                        {anomaly.time}
                      </span>
                      <span style={{ marginLeft: '8px', color: subtext }}>
                        거래량: {anomaly.volume?.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ 
                      color: getAnomalyColor(anomaly.ratio),
                      fontWeight: 'bold'
                    }}>
                      {anomaly.ratio}배 급증
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {volumeData.length > 0 && (
            <div style={{ 
              marginTop: '1rem', 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '8px',
              fontSize: '0.9rem'
            }}>
              <div style={{ color: subtext }}>
                총 데이터: <span style={{ color: text, fontWeight: 'bold' }}>{volumeData.length}개</span>
              </div>
              <div style={{ color: subtext }}>
                평균 거래량: <span style={{ color: text, fontWeight: 'bold' }}>
                  {Math.round(volumeData.reduce((sum, d) => sum + d.volume, 0) / volumeData.length).toLocaleString()}
                </span>
              </div>
              <div style={{ color: subtext }}>
                마지막 갱신: <span style={{ color: text, fontWeight: 'bold' }}>
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
      </div>
          )}
        </>
      )}
    </div>
  );
}

export default VolumeAnomalyTracker; 