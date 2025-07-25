import React, { useState } from 'react';
import axios from 'axios';

function summarizeNews(news) {
  // 뉴스 제목+요약을 한 줄로 합침
  return news.map(n => `제목: ${n.title} 요약: ${n.summary}`).join('\n');
}

function NewsTrendSummary({ news }) {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [trend, setTrend] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setTrend('');
    const summary = summarizeNews(news);
    const prompt = `아래는 오늘의 종목 관련 뉴스 제목과 요약입니다. 주요 트렌드 키워드, 이슈, 긍/부정 분위기를 5줄 이내로 요약해줘.\n\n${summary}`;
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '너는 뉴스 트렌드 분석 전문가야.' },
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
      setTrend(res.data.choices[0].message.content);
    } catch (e) {
      setError('AI 뉴스 트렌드 분석 실패: API 키, 네트워크, 요금제 등을 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '1.5rem 0', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
      <h3>AI 뉴스 트렌드 요약</h3>
      <div style={{ marginBottom: 8 }}>
        <input
          type="password"
          placeholder="OpenAI API 키 입력 (sk-...)"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          style={{ width: 220, marginRight: 8 }}
        />
        <button onClick={() => localStorage.setItem('openai_api_key', apiKey)}>API 키 저장</button>
        <button onClick={handleAnalyze} disabled={loading || !apiKey || news.length === 0} style={{marginLeft:8}}>
          {loading ? '분석 중...' : '뉴스 트렌드 분석'}</button>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {trend && <div style={{ background:'#fafafa', padding:12, borderRadius:6, color:'#333', whiteSpace:'pre-line' }}>{trend}</div>}
      {!trend && !loading && <div style={{ color:'#888', fontSize:'0.97rem' }}>오늘의 뉴스 제목/요약을 바탕으로 트렌드 키워드, 이슈, 긍부정 분위기를 요약합니다.</div>}
    </div>
  );
}

export default NewsTrendSummary; 