import React from 'react';

const aiData = {
  '에이지이글': {
    action: '매수',
    score: 8,
    reason: '거래량 급증 + 긍정 뉴스 감지',
  },
  '삼성전자': {
    action: '관망',
    score: 6,
    reason: '단기 변동성 확대, 관망 추천',
  },
  '카카오': {
    action: '매도',
    score: 7,
    reason: '단기 반등 후 조정 예상',
  },
};

function AIJudgement({ stock = '에이지이글' }) {
  const data = aiData[stock] || aiData['에이지이글'];
  return (
    <div style={{ margin: '1.5rem 0', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
      <h3>AI 판단 요약</h3>
      <div>판단: <strong>{data.action}</strong></div>
      <div>신뢰도: <strong>{data.score}/10</strong></div>
      <div>이유: {data.reason}</div>
    </div>
  );
}

export default AIJudgement; 