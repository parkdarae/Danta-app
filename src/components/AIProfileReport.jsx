import React, { useState } from 'react';
import axios from 'axios';

function summarizeHistory(history) {
  // 최근 20개 기록을 간단 요약 텍스트로 변환
  return history.map(h => {
    if (h.type === 'ai') {
      return `[AI] ${h.stock} 질문: ${h.question} 답변: ${h.answer}`;
    } else {
      return `[${h.stock}] 감정: ${h.emotion} 차트: ${h.chartType}`;
    }
  }).join('\n');
}

function AIProfileReport({ history }) {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setReport('');
    const summary = summarizeHistory(history);
    const prompt = `아래는 사용자의 최근 20개 주식 단타 판단/감정/AI 대화 기록입니다. 이 기록을 바탕으로 투자 성향(예: 공격적/보수적/감정적/분석적 등), 주요 특징, 개선점, 추천 전략을 5줄 이내로 요약해줘.\n\n${summary}`;
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '너는 투자 성향 분석 전문가야.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setReport(res.data.choices[0].message.content);
    } catch (e) {
      setError('AI 분석 실패: API 키, 네트워크, 요금제 등을 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '1.5rem 0', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
      <h3>AI 투자 성향 리포트</h3>
      <div style={{ marginBottom: 8 }}>
        <input
          type="password"
          placeholder="OpenAI API 키 입력 (sk-...)"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          style={{ width: 220, marginRight: 8 }}
        />
        <button onClick={() => localStorage.setItem('openai_api_key', apiKey)}>API 키 저장</button>
        <button onClick={handleAnalyze} disabled={loading || !apiKey || history.length === 0} style={{marginLeft:8}}>
          {loading ? '분석 중...' : '투자 성향 분석'}</button>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {report && <div style={{ background:'#fafafa', padding:12, borderRadius:6, color:'#333', whiteSpace:'pre-line' }}>{report}</div>}
      {!report && !loading && <div style={{ color:'#888', fontSize:'0.97rem' }}>최근 판단/감정/AI 기록을 바탕으로 투자 성향 리포트를 생성합니다.</div>}
    </div>
  );
}

export default AIProfileReport; 