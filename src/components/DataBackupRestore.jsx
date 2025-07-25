import React, { useRef, useState } from 'react';

const KEYS = [
  'darong_my_purchases',
  'darong_history',
  // 메모는 종목별로 저장되어 있으므로, 전체 키를 동적으로 수집
];

function getAllMemoKeys() {
  return Object.keys(localStorage).filter(k => k.startsWith('darong_memo_'));
}

function DataBackupRestore() {
  const fileRef = useRef();
  const [msg, setMsg] = useState('');

  // 내보내기
  const handleExport = () => {
    const data = {};
    for (const k of KEYS) {
      data[k] = localStorage.getItem(k);
    }
    for (const k of getAllMemoKeys()) {
      data[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `darong_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    setMsg('백업 파일이 다운로드되었습니다.');
  };

  // 불러오기
  const handleImport = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result);
        Object.entries(data).forEach(([k, v]) => {
          if (typeof v === 'string') localStorage.setItem(k, v);
        });
        setMsg('복원이 완료되었습니다! 새로고침 후 반영됩니다.');
      } catch {
        setMsg('복원 실패: 올바른 백업 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ margin: '1.5rem 0', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
      <h3>데이터 백업/복원</h3>
      <button onClick={handleExport} style={{marginRight:8}}>내보내기(JSON)</button>
      <input type="file" accept="application/json" ref={fileRef} style={{display:'none'}} onChange={handleImport} />
      <button onClick={()=>fileRef.current.click()}>불러오기(JSON)</button>
      {msg && <div style={{marginTop:8,color:'#43a047'}}>{msg}</div>}
      <div style={{color:'#888',fontSize:'0.97rem',marginTop:8}}>
        내 구매내역, 판단기록, 메모 등 주요 데이터를 JSON 파일로 백업/복원할 수 있습니다.<br/>
        복원 후 새로고침하면 반영됩니다.
      </div>
    </div>
  );
}

export default DataBackupRestore; 