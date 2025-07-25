import React, { useState } from 'react';
import axios from 'axios';

// 거래량 데이터에서 최근 거래량 변화 요약
function summarizeVolume(chartData) {
  if (!chartData || chartData.length < 2) return '데이터 부족';
  const last = chartData[chartData.length - 1].price;
  const prev = chartData[chartData.length - 2].price;
  return `최근 거래량: ${last}, 직전: ${prev}, 변화: ${(last - prev) > 0 ? '증가' : '감소'}`;
}

// 샘플 SNS/기관수급 데이터
const sampleSNS = '트위터/카페 등에서 투자자들이 단기 반등 기대감, 일부는 경계 의견.';
const sampleInst = '기관 순매수세 약간 유입, 외국인 매수세는 보합.';

function PsyScoreSection({ news, chartData }) {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const newsSummary = news.map(n => `${n.title}: ${n.summary}`).join('\n');
    const volumeSummary = summarizeVolume(chartData);
    const prompt = `아래는 오늘의 뉴스, 거래량 변화, SNS 심리, 기관수급 요약입니다.\n\n뉴스: ${newsSummary}\n거래량: ${volumeSummary}\nSNS: ${sampleSNS}\n기관수급: ${sampleInst}\n\n이 정보를 바탕으로 현재 익절 타이밍에 대한 심리 점수(1~10, 숫자만), 근거, 추천 액션(익절/홀딩/추가매수 등)을 3줄 이내로 요약해줘.\n형식: 점수: X, 근거: Y, 추천: Z`;
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '너는 주식 심리 분석 전문가야.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 300,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setResult(res.data.choices[0].message.content);
    } catch (e) {
      setError('AI 심리 점수 분석 실패: API 키, 네트워크, 요금제 등을 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  // 점수 색상 추출
  let score = null, scoreColor = '#888';
  if (result) {
    const m = result.match(/점수[:\s]+(\d+)/);
    if (m) {
      score = parseInt(m[1], 10);
      if (score >= 8) scoreColor = '#43a047';
      else if (score >= 4) scoreColor = '#fbc02d';
      else scoreColor = '#e53935';
    }
  }

  return (
    <div style={{ margin: '1.5rem 0', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
      <h3>AI 심리 점수 (익절 타이밍 분석)</h3>
      <div style={{ marginBottom: 8 }}>
        <input
          type="password"
          placeholder="OpenAI API 키 입력 (sk-...)"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          style={{ width: 220, marginRight: 8 }}
        />
        <button onClick={() => localStorage.setItem('openai_api_key', apiKey)}>API 키 저장</button>
        <button onClick={handleAnalyze} disabled={loading || !apiKey || news.length === 0 || !chartData || chartData.length < 2} style={{marginLeft:8}}>
          {loading ? '분석 중...' : '심리 점수 분석'}</button>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {score !== null && <div style={{ fontSize:'2.2rem', fontWeight:700, color:scoreColor, marginBottom:8 }}>점수: {score}/10</div>}
      {result && <div style={{ background:'#fafafa', padding:12, borderRadius:6, color:'#333', whiteSpace:'pre-line' }}>{result}</div>}
      {!result && !loading && <div style={{ color:'#888', fontSize:'0.97rem' }}>뉴스, 거래량, SNS, 기관수급을 바탕으로 AI가 익절 타이밍 심리 점수와 추천을 분석합니다.</div>}
    </div>
  );
}

export default PsyScoreSection; 