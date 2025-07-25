import React, { useState } from 'react';
import { fetchYahooRealtime } from '../utils/fetchRealtime';

function RealtimeFetchDemo() {
  const [symbol, setSymbol] = useState('005930.KS');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchYahooRealtime(symbol);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '1.5rem 0', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
      <h3>실시간 시세/거래대금 조회 (샘플)</h3>
      <div style={{ display:'flex', gap:8, marginBottom:8 }}>
        <input value={symbol} onChange={e=>setSymbol(e.target.value)} placeholder="심볼 (예: 005930.KS, AAPL)" style={{width:160}} />
        <button onClick={handleFetch} disabled={loading}>조회</button>
      </div>
      {loading && <div style={{color:'#888'}}>조회 중...</div>}
      {error && <div style={{color:'red'}}>{error}</div>}
      {result && (
        <div style={{background:'#fafafa',padding:12,borderRadius:6}}>
          <div><b>심볼:</b> {result.symbol}</div>
          <div><b>시세:</b> {result.price} {result.currency}</div>
          <div><b>거래대금:</b> {result.volume?.toLocaleString()}</div>
          <div><b>거래소:</b> {result.exchange}</div>
          <div><b>시간:</b> {result.time}</div>
        </div>
      )}
      <div style={{color:'#888',fontSize:'0.97rem',marginTop:8}}>
        예시: 삼성전자(005930.KS), 카카오(035720.KS), 애플(AAPL), 테슬라(TSLA) 등<br/>
        국내: KOSPI/KOSDAQ 종목코드+시장 (예: 005930.KS, 035720.KQ)<br/>
        해외: 티커 (예: AAPL, TSLA, MSFT)
      </div>
    </div>
  );
}

export default RealtimeFetchDemo; 