import React from 'react';

function PortfolioSummary({ list, prices }) {
  if (!list || list.length === 0) return null;
  let totalBuy = 0, totalEval = 0, profitCnt = 0, lossCnt = 0;
  list.forEach(item => {
    const buy = item.qty * item.price;
    totalBuy += buy;
    const priceInfo = prices[item.symbol];
    if (priceInfo && priceInfo.price != null) {
      const evalAmt = item.qty * priceInfo.price;
      totalEval += evalAmt;
      if (evalAmt > buy) profitCnt++;
      else if (evalAmt < buy) lossCnt++;
    } else {
      totalEval += buy;
    }
  });
  const profit = totalEval - totalBuy;
  const profitRate = totalBuy > 0 ? ((totalEval / totalBuy) - 1) * 100 : 0;
  return (
    <div style={{ margin: '1.5rem 0', padding: '1rem', border: '1px solid #eee', borderRadius: '8px', background:'#f8f9fa' }}>
      <h3>포트폴리오 요약</h3>
      <div style={{display:'flex',gap:24,flexWrap:'wrap',alignItems:'center'}}>
        <div><b>총 매입금액:</b> {totalBuy.toLocaleString()}원</div>
        <div><b>총 평가금액:</b> {totalEval.toLocaleString()}원</div>
        <div><b>총 수익률:</b> <span style={{color:profit>0?'#43a047':profit<0?'#e53935':'#888'}}>{profitRate.toFixed(2)}%</span></div>
        <div><b>수익 종목:</b> {profitCnt}개</div>
        <div><b>손실 종목:</b> {lossCnt}개</div>
      </div>
    </div>
  );
}

export default PortfolioSummary; 