import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getStockBySymbol } from '../data/stockMasterDB';

const EmotionalTradingTracker = ({ darkMode = false, selectedStock }) => {
  const [tradingRecords, setTradingRecords] = useLocalStorage('trading_records', []);
  const [emotionalData, setEmotionalData] = useLocalStorage('emotional_data', []);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [filterBy, setFilterBy] = useState('all'); // all, starred, recent

  // 새 기록 폼 상태
  const [formData, setFormData] = useState({
    // 기본 거래 정보
    action: 'buy', // buy, sell
    symbol: '',
    quantity: '',
    price: '',
    emotion: 'neutral',
    
    // 메타인지 항목들
    confidenceLevel: 50, // 0-100
    externalInfluence: false,
    influenceSource: '',
    expectedResult: '',
    marketState: 'neutral', // overheated, cooling, neutral
    emotionSource: 'intuition', // news, fomo, anxiety, intuition, experience
    notes: '',
    
    // 시스템 관리
    isStarred: false,
    timestamp: null
  });

  const theme = {
    bg: darkMode ? '#1a1a1a' : '#ffffff',
    cardBg: darkMode ? '#2d2d2d' : '#f8f9fa',
    text: darkMode ? '#ffffff' : '#333333',
    subtext: darkMode ? '#cccccc' : '#666666',
    border: darkMode ? '#404040' : '#e0e0e0',
    accent: '#007bff',
    positive: '#00c851',
    negative: '#ff4444',
    warning: '#ffbb33',
    purple: '#9c27b0'
  };

  // 감정 옵션들
  const emotions = [
    { value: 'excited', label: '흥분', icon: '🤩', color: '#ff6b6b' },
    { value: 'confident', label: '자신감', icon: '😎', color: '#4ecdc4' },
    { value: 'neutral', label: '중립', icon: '😐', color: '#95a5a6' },
    { value: 'anxious', label: '불안', icon: '😰', color: '#f39c12' },
    { value: 'fearful', label: '공포', icon: '😨', color: '#e74c3c' },
    { value: 'greedy', label: '욕심', icon: '🤑', color: '#27ae60' },
    { value: 'regretful', label: '후회', icon: '😣', color: '#8e44ad' },
    { value: 'hopeful', label: '희망', icon: '🤞', color: '#3498db' }
  ];

  // 감정 출처 옵션들
  const emotionSources = [
    { value: 'news', label: '뉴스', icon: '📰' },
    { value: 'fomo', label: 'FOMO', icon: '🏃‍♂️' },
    { value: 'anxiety', label: '불안감', icon: '😰' },
    { value: 'intuition', label: '직감', icon: '💡' },
    { value: 'experience', label: '과거 경험', icon: '📚' },
    { value: 'community', label: '커뮤니티', icon: '👥' },
    { value: 'technical', label: '기술적 분석', icon: '📊' },
    { value: 'fundamental', label: '기본적 분석', icon: '🔍' }
  ];

  // 시장 상태 옵션들
  const marketStates = [
    { value: 'overheated', label: '과열', icon: '📈', color: '#ff4444' },
    { value: 'neutral', label: '중립', icon: '⚖️', color: '#95a5a6' },
    { value: 'cooling', label: '냉각', icon: '📉', color: '#4ecdc4' }
  ];

  // 초기 설정
  useEffect(() => {
    if (selectedStock && !formData.symbol) {
      setFormData(prev => ({
        ...prev,
        symbol: selectedStock
      }));
    }
  }, [selectedStock]);

  // 기록 저장
  const saveRecord = useCallback(() => {
    const newRecord = {
      id: Date.now().toString(),
      ...formData,
      timestamp: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90일 후
      stockInfo: getStockBySymbol(formData.symbol)
    };

    setTradingRecords(prev => [newRecord, ...prev]);
    
    // 폼 초기화
    setFormData({
      action: 'buy',
      symbol: selectedStock || '',
      quantity: '',
      price: '',
      emotion: 'neutral',
      confidenceLevel: 50,
      externalInfluence: false,
      influenceSource: '',
      expectedResult: '',
      marketState: 'neutral',
      emotionSource: 'intuition',
      notes: '',
      isStarred: false,
      timestamp: null
    });

    setShowRecordForm(false);
    console.log('📝 거래 기록 저장 완료:', newRecord);
  }, [formData, selectedStock, setTradingRecords]);

  // 기록 별표 토글
  const toggleStar = useCallback((recordId) => {
    setTradingRecords(prev => prev.map(record =>
      record.id === recordId
        ? { ...record, isStarred: !record.isStarred }
        : record
    ));
  }, [setTradingRecords]);

  // 기록 삭제
  const deleteRecord = useCallback((recordId) => {
    setTradingRecords(prev => prev.filter(record => record.id !== recordId));
  }, [setTradingRecords]);

  // 만료 예정 기록 확인 (80일 경과)
  const getExpiringRecords = useCallback(() => {
    const now = new Date();
    const warningPeriod = 10 * 24 * 60 * 60 * 1000; // 10일 전 경고
    
    return tradingRecords.filter(record => {
      if (record.isStarred) return false; // 별표는 영구 보관
      const expiryDate = new Date(record.expiryDate);
      const timeDiff = expiryDate.getTime() - now.getTime();
      return timeDiff <= warningPeriod && timeDiff > 0;
    });
  }, [tradingRecords]);

  // 필터링된 기록들
  const filteredRecords = tradingRecords.filter(record => {
    switch (filterBy) {
      case 'starred':
        return record.isStarred;
      case 'recent':
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(record.timestamp) >= oneWeekAgo;
      default:
        return true;
    }
  });

  // 유사한 과거 기록 찾기
  const findSimilarRecords = useCallback((currentEmotion, currentAction) => {
    return tradingRecords.filter(record =>
      record.emotion === currentEmotion &&
      record.action === currentAction &&
      record.id !== currentRecord?.id
    ).slice(0, 3);
  }, [tradingRecords, currentRecord]);

  return (
    <div style={{
      background: theme.bg,
      borderRadius: '12px',
      border: `2px solid ${theme.border}`,
      overflow: 'hidden',
      marginBottom: '20px'
    }}>
      {/* 헤더 */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.purple}, ${theme.accent})`,
        padding: '20px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
              🧠 감정 기반 트레이딩 기록
            </h2>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
              투자 심리와 메타인지 분석으로 더 현명한 결정을
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              총 {tradingRecords.length}개 기록
            </span>
            <button
              onClick={() => setShowRecordForm(!showRecordForm)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {showRecordForm ? '📝 폼 닫기' : '➕ 새 기록'}
            </button>
          </div>
        </div>
      </div>

      {/* 만료 예정 알림 */}
      {getExpiringRecords().length > 0 && (
        <div style={{
          background: theme.warning,
          color: 'white',
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          ⚠️ {getExpiringRecords().length}개 기록이 10일 내 만료됩니다. 
          별표(★)를 눌러 영구 보관하세요!
        </div>
      )}

      {/* 새 기록 폼 */}
      {showRecordForm && (
        <div style={{
          background: theme.cardBg,
          padding: '25px',
          borderBottom: `1px solid ${theme.border}`
        }}>
          <h3 style={{ color: theme.text, marginBottom: '20px', fontSize: '18px' }}>
            📝 새로운 거래 & 감정 기록
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* 기본 거래 정보 */}
            <div style={{
              background: theme.bg,
              padding: '20px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ color: theme.text, marginBottom: '15px', fontSize: '16px' }}>
                📊 거래 정보
              </h4>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: theme.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  매수/매도
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['buy', 'sell'].map(action => (
                    <button
                      key={action}
                      onClick={() => setFormData(prev => ({ ...prev, action }))}
                      style={{
                        background: formData.action === action ? theme.accent : 'transparent',
                        color: formData.action === action ? 'white' : theme.text,
                        border: `2px solid ${theme.accent}`,
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      {action === 'buy' ? '📈 매수' : '📉 매도'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: theme.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  종목 심볼
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                  placeholder="예: UAVS, 005930"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `2px solid ${theme.border}`,
                    borderRadius: '6px',
                    background: theme.bg,
                    color: theme.text,
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: theme.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                    수량
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="100"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `2px solid ${theme.border}`,
                      borderRadius: '6px',
                      background: theme.bg,
                      color: theme.text,
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: theme.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                    가격
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="2.45"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `2px solid ${theme.border}`,
                      borderRadius: '6px',
                      background: theme.bg,
                      color: theme.text,
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 감정 & 메타인지 */}
            <div style={{
              background: theme.bg,
              padding: '20px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ color: theme.text, marginBottom: '15px', fontSize: '16px' }}>
                🧠 감정 & 메타인지
              </h4>

              {/* 감정 선택 */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: theme.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  현재 감정
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {emotions.map(emotion => (
                    <button
                      key={emotion.value}
                      onClick={() => setFormData(prev => ({ ...prev, emotion: emotion.value }))}
                      style={{
                        background: formData.emotion === emotion.value ? emotion.color : 'transparent',
                        color: formData.emotion === emotion.value ? 'white' : theme.text,
                        border: `2px solid ${emotion.color}`,
                        padding: '8px 4px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}
                    >
                      <div>{emotion.icon}</div>
                      <div>{emotion.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 확신도 슬라이더 */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: theme.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  📍 투자 결정의 확신도: {formData.confidenceLevel}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.confidenceLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, confidenceLevel: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: `linear-gradient(to right, #ff4444 0%, #ffbb33 50%, #00c851 100%)`,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* 외부 영향 */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: theme.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  📍 외부 영향 여부
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, externalInfluence: !prev.externalInfluence }))}
                    style={{
                      background: formData.externalInfluence ? theme.warning : theme.subtext,
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    {formData.externalInfluence ? '✅ 영향 받음' : '❌ 영향 없음'}
                  </button>
                  {formData.externalInfluence && (
                    <input
                      type="text"
                      value={formData.influenceSource}
                      onChange={(e) => setFormData(prev => ({ ...prev, influenceSource: e.target.value }))}
                      placeholder="영향 요인 (예: 뉴스, 커뮤니티)"
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: `2px solid ${theme.border}`,
                        borderRadius: '6px',
                        background: theme.bg,
                        color: theme.text,
                        fontSize: '12px'
                      }}
                    />
                  )}
                </div>
              </div>

              {/* 감정 출처 */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: theme.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  📍 감정의 출처
                </label>
                <select
                  value={formData.emotionSource}
                  onChange={(e) => setFormData(prev => ({ ...prev, emotionSource: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `2px solid ${theme.border}`,
                    borderRadius: '6px',
                    background: theme.bg,
                    color: theme.text,
                    fontSize: '14px'
                  }}
                >
                  {emotionSources.map(source => (
                    <option key={source.value} value={source.value}>
                      {source.icon} {source.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 시장 분석 & 기대 */}
            <div style={{
              background: theme.bg,
              padding: '20px',
              borderRadius: '8px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{ color: theme.text, marginBottom: '15px', fontSize: '16px' }}>
                📊 시장 분석 & 기대
              </h4>

              {/* 시장 상태 */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: theme.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  📍 현재 시장 상태
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {marketStates.map(state => (
                    <button
                      key={state.value}
                      onClick={() => setFormData(prev => ({ ...prev, marketState: state.value }))}
                      style={{
                        background: formData.marketState === state.value ? state.color : 'transparent',
                        color: formData.marketState === state.value ? 'white' : theme.text,
                        border: `2px solid ${state.color}`,
                        padding: '10px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        flex: 1,
                        textAlign: 'center'
                      }}
                    >
                      <div>{state.icon}</div>
                      <div>{state.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 기대 결과 */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: theme.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  📍 기대하는 결과
                </label>
                <input
                  type="text"
                  value={formData.expectedResult}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedResult: e.target.value }))}
                  placeholder="예: 5% 수익, 회복 반등, 손절 최소화"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `2px solid ${theme.border}`,
                    borderRadius: '6px',
                    background: theme.bg,
                    color: theme.text,
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* 메모 */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: theme.text, fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  💭 메모 & 추가 생각
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="거래 이유, 추가 생각, 특이사항 등을 자유롭게 기록하세요..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `2px solid ${theme.border}`,
                    borderRadius: '6px',
                    background: theme.bg,
                    color: theme.text,
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* 유사한 과거 기록 표시 */}
          {formData.emotion !== 'neutral' && findSimilarRecords(formData.emotion, formData.action).length > 0 && (
            <div style={{
              background: theme.cardBg,
              padding: '15px',
              borderRadius: '8px',
              border: `1px solid ${theme.warning}`,
              marginTop: '20px'
            }}>
              <h5 style={{ color: theme.text, marginBottom: '10px', fontSize: '14px' }}>
                🔄 과거 비슷한 상황 ({findSimilarRecords(formData.emotion, formData.action).length}건)
              </h5>
              <div style={{ fontSize: '12px', color: theme.subtext }}>
                {findSimilarRecords(formData.emotion, formData.action).slice(0, 2).map(record => (
                  <div key={record.id} style={{ marginBottom: '5px' }}>
                    • {new Date(record.timestamp).toLocaleDateString()} - {record.symbol} {record.action === 'buy' ? '매수' : '매도'} 
                    (확신도: {record.confidenceLevel}%)
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 저장 버튼 */}
          <div style={{ marginTop: '25px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowRecordForm(false)}
              style={{
                background: 'transparent',
                border: `2px solid ${theme.border}`,
                color: theme.text,
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              취소
            </button>
            <button
              onClick={saveRecord}
              disabled={!formData.symbol || !formData.quantity || !formData.price}
              style={{
                background: theme.positive,
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: formData.symbol && formData.quantity && formData.price ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '600',
                opacity: formData.symbol && formData.quantity && formData.price ? 1 : 0.6
              }}
            >
              💾 기록 저장
            </button>
          </div>
        </div>
      )}

      {/* 필터 & 기록 목록 */}
      <div style={{ padding: '20px' }}>
        {/* 필터 버튼들 */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>필터:</span>
          {[
            { value: 'all', label: '전체', icon: '📋' },
            { value: 'starred', label: '별표', icon: '⭐' },
            { value: 'recent', label: '최근 7일', icon: '🕒' }
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setFilterBy(filter.value)}
              style={{
                background: filterBy === filter.value ? theme.accent : 'transparent',
                color: filterBy === filter.value ? 'white' : theme.text,
                border: `2px solid ${theme.accent}`,
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              {filter.icon} {filter.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', color: theme.subtext, fontSize: '12px' }}>
            {filteredRecords.length}개 기록 표시 중
          </div>
        </div>

        {/* 기록 목록 */}
        {filteredRecords.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: theme.subtext,
            fontSize: '16px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
            <div>아직 기록이 없습니다.</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              첫 번째 감정 기반 거래 기록을 작성해보세요!
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filteredRecords.map(record => {
              const emotion = emotions.find(e => e.value === record.emotion);
              const emotionSource = emotionSources.find(es => es.value === record.emotionSource);
              const marketState = marketStates.find(ms => ms.value === record.marketState);
              const daysUntilExpiry = Math.ceil((new Date(record.expiryDate) - new Date()) / (24 * 60 * 60 * 1000));
              
              return (
                <div
                  key={record.id}
                  style={{
                    background: theme.cardBg,
                    border: `2px solid ${record.isStarred ? theme.warning : theme.border}`,
                    borderRadius: '12px',
                    padding: '20px',
                    position: 'relative'
                  }}
                >
                  {/* 헤더 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '5px'
                      }}>
                        <span style={{
                          background: record.action === 'buy' ? theme.positive : theme.negative,
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700'
                        }}>
                          {record.action === 'buy' ? '📈 매수' : '📉 매도'}
                        </span>
                        <span style={{ color: theme.text, fontWeight: '700', fontSize: '16px' }}>
                          {record.symbol}
                        </span>
                        {record.stockInfo && (
                          <span style={{ color: theme.subtext, fontSize: '14px' }}>
                            ({record.stockInfo.name})
                          </span>
                        )}
                      </div>
                      <div style={{ color: theme.subtext, fontSize: '12px' }}>
                        {new Date(record.timestamp).toLocaleString()} • 
                        수량: {record.quantity} • 
                        가격: {record.price}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => toggleStar(record.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          fontSize: '20px',
                          cursor: 'pointer',
                          filter: record.isStarred ? 'none' : 'grayscale(100%)'
                        }}
                        title={record.isStarred ? '별표 제거 (90일 보관)' : '별표 추가 (영구 보관)'}
                      >
                        ⭐
                      </button>
                      <button
                        onClick={() => deleteRecord(record.id)}
                        style={{
                          background: theme.negative,
                          border: 'none',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {/* 감정 & 메타인지 정보 */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    {/* 감정 */}
                    <div style={{
                      background: theme.bg,
                      padding: '12px',
                      borderRadius: '8px',
                      border: `2px solid ${emotion?.color || theme.border}`
                    }}>
                      <div style={{ fontSize: '12px', color: theme.subtext, marginBottom: '4px' }}>감정</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: theme.text }}>
                        {emotion?.icon} {emotion?.label}
                      </div>
                    </div>

                    {/* 확신도 */}
                    <div style={{
                      background: theme.bg,
                      padding: '12px',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '12px', color: theme.subtext, marginBottom: '4px' }}>확신도</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: theme.text }}>
                        {record.confidenceLevel}%
                      </div>
                    </div>

                    {/* 시장 상태 */}
                    <div style={{
                      background: theme.bg,
                      padding: '12px',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '12px', color: theme.subtext, marginBottom: '4px' }}>시장 상태</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: theme.text }}>
                        {marketState?.icon} {marketState?.label}
                      </div>
                    </div>

                    {/* 감정 출처 */}
                    <div style={{
                      background: theme.bg,
                      padding: '12px',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '12px', color: theme.subtext, marginBottom: '4px' }}>감정 출처</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: theme.text }}>
                        {emotionSource?.icon} {emotionSource?.label}
                      </div>
                    </div>
                  </div>

                  {/* 기대 결과 & 외부 영향 */}
                  {(record.expectedResult || record.externalInfluence) && (
                    <div style={{
                      background: theme.bg,
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '15px'
                    }}>
                      {record.expectedResult && (
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ color: theme.subtext, fontSize: '12px' }}>기대 결과: </span>
                          <span style={{ color: theme.text, fontSize: '14px' }}>{record.expectedResult}</span>
                        </div>
                      )}
                      {record.externalInfluence && (
                        <div>
                          <span style={{ color: theme.subtext, fontSize: '12px' }}>외부 영향: </span>
                          <span style={{ color: theme.warning, fontSize: '14px' }}>
                            ✅ {record.influenceSource || '있음'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 메모 */}
                  {record.notes && (
                    <div style={{
                      background: theme.bg,
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '15px'
                    }}>
                      <div style={{ fontSize: '12px', color: theme.subtext, marginBottom: '4px' }}>메모</div>
                      <div style={{ fontSize: '14px', color: theme.text, lineHeight: '1.4' }}>
                        {record.notes}
                      </div>
                    </div>
                  )}

                  {/* 만료 정보 */}
                  {!record.isStarred && (
                    <div style={{
                      fontSize: '12px',
                      color: daysUntilExpiry <= 10 ? theme.warning : theme.subtext,
                      textAlign: 'right'
                    }}>
                      {daysUntilExpiry > 0 ? 
                        `${daysUntilExpiry}일 후 만료` : 
                        '만료됨'
                      }
                      {daysUntilExpiry <= 10 && ' ⚠️'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      <div style={{
        background: theme.cardBg,
        padding: '15px 20px',
        borderTop: `1px solid ${theme.border}`,
        fontSize: '12px',
        color: theme.subtext,
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        <div>💾 기본 90일 보관 • ⭐ 별표 시 영구 보관</div>
        <div>🧠 메타인지로 더 현명한 투자 결정을</div>
      </div>
    </div>
  );
};

export default EmotionalTradingTracker; 