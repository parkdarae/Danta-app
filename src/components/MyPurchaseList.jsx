import React, { useState, useEffect } from 'react';
import { fetchYahooRealtime } from '../utils/fetchRealtime';
import PortfolioSummary from './PortfolioSummary';

function MyPurchaseList() {
  const STORAGE_KEY = 'darong_my_purchases';
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ stock: '', qty: '', price: '', date: '', memo: '', symbol: '' });
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [prices, setPrices] = useState({}); // {symbol: {price, time}}
  const [loadingIdx, setLoadingIdx] = useState(null);

  // 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setList(saved ? JSON.parse(saved) : []);
  }, []);

  // 저장
  const save = (newList) => {
    setList(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  };

  // 추가
  const handleAdd = () => {
    if (!form.stock.trim() || !form.qty || !form.price || !form.symbol.trim()) return;
    const newItem = { ...form, qty: Number(form.qty), price: Number(form.price), date: form.date || new Date().toISOString().slice(0,10) };
    save([newItem, ...list]);
    setForm({ stock: '', qty: '', price: '', date: '', memo: '', symbol: '' });
  };

  // 삭제
  const handleDelete = (idx) => {
    save(list.filter((_, i) => i !== idx));
  };

  // 수정
  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditForm(list[idx]);
  };
  const handleEditSave = (idx) => {
    const newList = list.map((item, i) => i === idx ? editForm : item);
    save(newList);
    setEditIdx(null);
    setEditForm({});
  };

  // 실시간 시세 fetch
  const fetchPrice = async (symbol, idx) => {
    setLoadingIdx(idx);
    try {
      const data = await fetchYahooRealtime(symbol);
      setPrices(p => ({ ...p, [symbol]: data }));
    } catch (e) {
      setPrices(p => ({ ...p, [symbol]: { price: null, error: true } }));
    } finally {
      setLoadingIdx(null);
    }
  };

  // 합계
  const total = list.reduce((sum, item) => sum + (item.qty * item.price), 0);

  return (
    <div style={{ margin: '1.5rem 0', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
      <PortfolioSummary list={list} prices={prices} />
      <h3>내가 구매한 정보 (직접 입력, 보안저장)</h3>
      <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
        <input placeholder="종목명" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} style={{width:100}} />
        <input placeholder="심볼(005930.KS)" value={form.symbol} onChange={e=>setForm(f=>({...f,symbol:e.target.value}))} style={{width:120}} />
        <input placeholder="수량" type="number" value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} style={{width:60}} />
        <input placeholder="매입가" type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} style={{width:80}} />
        <input placeholder="매입일" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{width:120}} />
        <input placeholder="메모" value={form.memo} onChange={e=>setForm(f=>({...f,memo:e.target.value}))} style={{flex:1,minWidth:80}} />
        <button onClick={handleAdd}>추가</button>
      </div>
      <div style={{marginBottom:8, color:'#888'}}>총 매입금액: <b>{total.toLocaleString()}원</b></div>
      <ul style={{ paddingLeft:0, listStyle:'none', margin:0 }}>
        {list.length === 0 && <li style={{ color:'#888' }}>아직 입력된 내역이 없습니다.</li>}
        {list.map((item, i) => {
          const priceInfo = prices[item.symbol];
          let evalAmt = null, profit = null, profitRate = null;
          if (priceInfo && priceInfo.price != null) {
            evalAmt = item.qty * priceInfo.price;
            profit = evalAmt - (item.qty * item.price);
            profitRate = ((evalAmt / (item.qty * item.price)) - 1) * 100;
          }
          return (
            <li key={i} style={{ marginBottom:8, background:'#fafafa', borderRadius:6, padding:'0.5rem 0.7rem', position:'relative' }}>
              {editIdx === i ? (
                <>
                  <input value={editForm.stock} onChange={e=>setEditForm(f=>({...f,stock:e.target.value}))} style={{width:100}} />
                  <input value={editForm.symbol} onChange={e=>setEditForm(f=>({...f,symbol:e.target.value}))} style={{width:120}} />
                  <input type="number" value={editForm.qty} onChange={e=>setEditForm(f=>({...f,qty:e.target.value}))} style={{width:60}} />
                  <input type="number" value={editForm.price} onChange={e=>setEditForm(f=>({...f,price:e.target.value}))} style={{width:80}} />
                  <input type="date" value={editForm.date} onChange={e=>setEditForm(f=>({...f,date:e.target.value}))} style={{width:120}} />
                  <input value={editForm.memo} onChange={e=>setEditForm(f=>({...f,memo:e.target.value}))} style={{width:120}} />
                  <button onClick={()=>handleEditSave(i)} style={{marginLeft:4}}>저장</button>
                  <button onClick={()=>setEditIdx(null)} style={{marginLeft:4}}>취소</button>
                </>
              ) : (
                <>
                  <span style={{fontWeight:600}}>{item.stock}</span> / 심볼: {item.symbol} / 수량: {item.qty} / 매입가: {item.price.toLocaleString()}원 / 일자: {item.date} / 메모: {item.memo}
                  <button onClick={()=>handleEdit(i)} style={{marginLeft:8}}>수정</button>
                  <button onClick={()=>handleDelete(i)} style={{marginLeft:4}}>삭제</button>
                  <button onClick={()=>fetchPrice(item.symbol, i)} style={{marginLeft:8}} disabled={loadingIdx===i}>실시간평가</button>
                  {loadingIdx===i && <span style={{color:'#888',marginLeft:6}}>조회중...</span>}
                  {priceInfo && priceInfo.error && <span style={{color:'red',marginLeft:6}}>조회실패</span>}
                  {evalAmt != null && (
                    <span style={{marginLeft:8}}>
                      <b>평가금액:</b> {evalAmt.toLocaleString()}원 / <b>수익률:</b> <span style={{color:profit>0?'#43a047':profit<0?'#e53935':'#888'}}>{profitRate.toFixed(2)}%</span>
                    </span>
                  )}
                  {priceInfo && priceInfo.price && <span style={{color:'#888',marginLeft:8,fontSize:'0.95em'}}>({priceInfo.price} {priceInfo.currency}, {priceInfo.time})</span>}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default MyPurchaseList; 