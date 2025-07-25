import React from 'react';

const picks = [
  { name: '에이지이글', reason: '거래량 급증, 뉴스 호재' },
  { name: '삼성전자', reason: 'AI 반도체 기대감' },
  { name: '카카오', reason: '단기 저점 반등 시도' },
];

function TodayPicks() {
  return (
    <div style={{ margin: '1.5rem 0' }}>
      <h3>오늘의 단타 종목</h3>
      <ul>
        {picks.map((pick, idx) => (
          <li key={idx} style={{ marginBottom: '0.5rem' }}>
            <strong>{pick.name}</strong> - {pick.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodayPicks; 