import React, { useState, useEffect } from 'react';

function getStorageKey(stock) {
  return `darong_memo_${stock}`;
}

const MEMO_TYPES = {
  BUY: { label: '매수', color: '#4caf50', bg: '#e8f5e8' },
  SELL: { label: '매도', color: '#f44336', bg: '#ffeaea' },
  WATCH: { label: '관찰', color: '#ff9800', bg: '#fff3e0' },
  ANALYSIS: { label: '분석', color: '#2196f3', bg: '#e3f2fd' },
  NEWS: { label: '뉴스', color: '#9c27b0', bg: '#f3e5f5' }
};

function InvestmentMemo({ stock, darkMode = false }) {
  const [memos, setMemos] = useState([]);
  const [input, setInput] = useState('');
  const [selectedType, setSelectedType] = useState('ANALYSIS');
  const [tags, setTags] = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editType, setEditType] = useState('ANALYSIS');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const bg = darkMode ? '#23272b' : '#fff';
  const text = darkMode ? '#e0e0e0' : '#222';
  const subtext = darkMode ? '#aaa' : '#888';
  const border = darkMode ? '#333' : '#eee';
  const inputBg = darkMode ? '#2a2a2a' : '#fff';
  const accent = '#8884d8';

  // 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey(stock));
    setMemos(saved ? JSON.parse(saved) : []);
    setInput('');
    setEditIdx(null);
    setEditValue('');
    setSearchQuery('');
  }, [stock]);

  // 저장
  const save = (newMemos) => {
    setMemos(newMemos);
    localStorage.setItem(getStorageKey(stock), JSON.stringify(newMemos));
  };

  // 추가
  const handleAdd = () => {
    if (!input.trim()) return;
    const newMemo = {
      id: Date.now(),
      text: input,
      type: selectedType,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      time: new Date().toLocaleString(),
      price: null, // 추후 현재가 연동 가능
    };
    const newMemos = [newMemo, ...memos];
    save(newMemos);
    setInput('');
    setTags('');
  };

  // 삭제
  const handleDelete = (idx) => {
    const newMemos = memos.filter((_, i) => i !== idx);
    save(newMemos);
  };

  // 수정 시작
  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditValue(memos[idx].text);
    setEditTags(memos[idx].tags ? memos[idx].tags.join(', ') : '');
    setEditType(memos[idx].type || 'ANALYSIS');
  };

  // 수정 저장
  const handleEditSave = (idx) => {
    const newMemos = memos.map((m, i) => i === idx ? {
      ...m,
      text: editValue,
      type: editType,
      tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      updatedTime: new Date().toLocaleString()
    } : m);
    save(newMemos);
    setEditIdx(null);
    setEditValue('');
    setEditTags('');
  };

  // 필터링된 메모
  const filteredMemos = memos.filter(memo => {
    const matchesSearch = !searchQuery || 
      memo.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (memo.tags && memo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesType = filterType === 'ALL' || memo.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // 태그 추출
  const allTags = [...new Set(memos.flatMap(memo => memo.tags || []))];

  const MemoTypeIcon = ({ type }) => {
    const typeInfo = MEMO_TYPES[type] || MEMO_TYPES.ANALYSIS;
    return (
      <span style={{
        background: darkMode ? typeInfo.color + '33' : typeInfo.bg,
        color: typeInfo.color,
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        border: `1px solid ${typeInfo.color}33`
      }}>
        {typeInfo.label}
      </span>
    );
  };

  const TagChip = ({ tag, onClick }) => (
    <span
      onClick={onClick}
      style={{
        background: darkMode ? '#444' : '#f0f0f0',
        color: darkMode ? '#ccc' : '#666',
        padding: '2px 6px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        marginRight: '4px',
        cursor: onClick ? 'pointer' : 'default',
        border: `1px solid ${border}`
      }}
    >
      #{tag}
    </span>
  );

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      color: text
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: accent }}>
        {stock} 투자 메모
      </h3>

      {/* 검색 및 필터 */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="메모 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: '150px',
            padding: '6px 10px',
            border: `1px solid ${border}`,
            borderRadius: '6px',
            background: inputBg,
            color: text,
            fontSize: '0.9rem'
          }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '6px 10px',
            border: `1px solid ${border}`,
            borderRadius: '6px',
            background: inputBg,
            color: text,
            fontSize: '0.9rem'
          }}
        >
          <option value="ALL">전체</option>
          {Object.entries(MEMO_TYPES).map(([key, type]) => (
            <option key={key} value={key}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* 메모 추가 */}
      <div style={{ 
        background: darkMode ? '#1a1a1a' : '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: '6px 10px',
              border: `1px solid ${border}`,
              borderRadius: '6px',
              background: inputBg,
              color: text,
              fontSize: '0.9rem'
            }}
          >
            {Object.entries(MEMO_TYPES).map(([key, type]) => (
              <option key={key} value={key}>{type.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="태그 (쉼표로 구분)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '6px 10px',
              border: `1px solid ${border}`,
              borderRadius: '6px',
              background: inputBg,
              color: text,
              fontSize: '0.9rem'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="투자 메모를 입력하세요..."
            style={{
              flex: 1,
              minHeight: '60px',
              padding: '8px 10px',
              border: `1px solid ${border}`,
              borderRadius: '6px',
              background: inputBg,
              color: text,
              fontSize: '0.9rem',
              resize: 'vertical'
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            style={{
              background: input.trim() ? accent : (darkMode ? '#333' : '#eee'),
              color: input.trim() ? '#fff' : subtext,
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            추가
          </button>
        </div>
      </div>

      {/* 인기 태그 */}
      {allTags.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.9rem', color: subtext, marginBottom: '4px' }}>
            인기 태그:
          </div>
          <div>
            {allTags.slice(0, 8).map(tag => (
              <TagChip 
                key={tag} 
                tag={tag} 
                onClick={() => setSearchQuery(tag)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 메모 목록 */}
      <div style={{ fontSize: '0.9rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontWeight: 'bold' }}>
            메모 목록 ({filteredMemos.length}개)
          </span>
          {memos.length !== filteredMemos.length && (
            <span style={{ color: subtext, fontSize: '0.8rem' }}>
              전체 {memos.length}개 중 필터링됨
            </span>
          )}
        </div>

        {filteredMemos.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: subtext, 
            padding: '2rem',
            background: darkMode ? '#1a1a1a' : '#f8f9fa',
            borderRadius: '6px'
          }}>
            {searchQuery || filterType !== 'ALL' ? '검색 결과가 없습니다.' : '아직 메모가 없습니다.'}
          </div>
        ) : (
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            border: `1px solid ${border}`,
            borderRadius: '6px'
          }}>
            {filteredMemos.map((memo, idx) => (
              <div key={memo.id || idx} style={{
                padding: '12px',
                borderBottom: idx < filteredMemos.length - 1 ? `1px solid ${border}` : 'none',
                background: darkMode ? '#1a1a1a' : '#fafafa'
              }}>
                {editIdx === idx ? (
                  // 수정 모드
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                        style={{
                          padding: '4px 8px',
                          border: `1px solid ${border}`,
                          borderRadius: '4px',
                          background: inputBg,
                          color: text,
                          fontSize: '0.8rem'
                        }}
                      >
                        {Object.entries(MEMO_TYPES).map(([key, type]) => (
                          <option key={key} value={key}>{type.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="태그"
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          border: `1px solid ${border}`,
                          borderRadius: '4px',
                          background: inputBg,
                          color: text,
                          fontSize: '0.8rem'
                        }}
                      />
                    </div>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '60px',
                        padding: '8px',
                        border: `1px solid ${border}`,
                        borderRadius: '4px',
                        background: inputBg,
                        color: text,
                        fontSize: '0.9rem',
                        resize: 'vertical'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleEditSave(idx)}
                        style={{
                          background: accent,
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 12px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditIdx(null)}
                        style={{
                          background: darkMode ? '#333' : '#eee',
                          color: text,
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 12px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  // 일반 모드
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <MemoTypeIcon type={memo.type || 'ANALYSIS'} />
                        {memo.tags && memo.tags.map(tag => (
                          <TagChip key={tag} tag={tag} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEdit(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: accent,
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            padding: '2px 4px'
                          }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#f44336',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            padding: '2px 4px'
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <div style={{ 
                      lineHeight: '1.4',
                      marginBottom: '8px',
                      wordBreak: 'break-word'
                    }}>
                      {memo.text}
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: subtext,
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>{memo.time}</span>
                      {memo.updatedTime && (
                        <span>(수정: {memo.updatedTime})</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InvestmentMemo; 