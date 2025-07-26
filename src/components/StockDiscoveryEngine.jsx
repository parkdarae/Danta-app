import React, { useState, useMemo, useCallback } from 'react';
import { searchStocks } from '../data/stockMasterDB';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTheme } from '../hooks/useTheme';
import VirtualizedStockList from './VirtualizedStockList';

// 점수 계산 로직을 별도 함수로 분리하여 재사용성 향상
const calculateMemeScore = (stock, keywords, baseScore = 30) => {
  let score = baseScore;
  
  const memeKeywords = ['밈', 'meme', '레딧', 'reddit', '소셜', 'YOLO', '개미', '급등'];
  const techKeywords = ['AI', '드론', '전기차', '게임', '우주', '항공'];
  const volatileKeywords = ['우크라이나', '국방', '에너지', '암호화폐'];
  
  keywords.forEach(keyword => {
    if (memeKeywords.some(mk => keyword.toLowerCase().includes(mk.toLowerCase()))) {
      score += 25;
    }
    if (techKeywords.some(tk => keyword.toLowerCase().includes(tk.toLowerCase()))) {
      score += 15;
    }
    if (volatileKeywords.some(vk => keyword.toLowerCase().includes(vk.toLowerCase()))) {
      score += 20;
    }
  });

  // 동전주면 밈 점수 보너스
  const price = stock.currency === 'USD' ? 
    (Math.random() * 15 + 0.5) : 
    (Math.random() * 15000 + 500);
  const isPennyStock = stock.currency === 'USD' ? price <= 5 : price <= 1000;
  if (isPennyStock) score += 15;
  
  // UAVS 특별 처리
  if (stock.symbol === 'UAVS') score += 30;

  return Math.min(100, score + Math.random() * 20 - 10);
};

const calculateQuantScore = () => {
  const per = Math.random() * 30 + 5;
  const pbr = Math.random() * 5 + 0.5;
  const roe = Math.random() * 25 + (-10);
  const debtRatio = Math.random() * 80 + 10;
  const revenueGrowth = Math.random() * 50 + (-20);

  let score = 0;
  score += per < 15 ? 20 : per < 25 ? 10 : 0;
  score += pbr < 1.5 ? 20 : pbr < 3 ? 10 : 0;
  score += roe > 10 ? 20 : roe > 5 ? 10 : roe > 0 ? 5 : 0;
  score += debtRatio < 30 ? 20 : debtRatio < 50 ? 10 : 0;
  score += revenueGrowth > 15 ? 20 : revenueGrowth > 5 ? 10 : revenueGrowth > 0 ? 5 : 0;

  return { score: Math.min(100, score), per, pbr, roe, debtRatio, revenueGrowth };
};

const StockDiscoveryEngine = ({ darkMode = false, keywords = [], onStockTrack }) => {
  const [filterOptions, setFilterOptions] = useLocalStorage('discovery_filters', {
    showPennyStocks: true,
    showMemeStocks: true,
    showQuantStocks: true,
    maxPrice: 10,
    minMemeScore: 60,
    minQuantScore: 70,
    maxMarketCap: 1000000000
  });
  
  const [sortBy, setSortBy] = useState('memeScore');
  const [customFilters, setCustomFilters] = useLocalStorage('custom_filters', []);
  const [showCustomFilterForm, setShowCustomFilterForm] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');

  const theme = useTheme(darkMode);

  // 키워드 기반 종목 매칭 및 분석
  const discoveredStocks = useMemo(() => {
    if (keywords.length === 0) return [];

    // 키워드로 기본 검색
    let foundStocks = [];
    keywords.forEach(keyword => {
      const results = searchStocks(keyword, { limit: 20 });
      foundStocks = [...foundStocks, ...results];
    });

    // 중복 제거
    const uniqueStocks = foundStocks.reduce((acc, stock) => {
      if (!acc.find(s => s.symbol === stock.symbol)) {
        acc.push(stock);
      }
      return acc;
    }, []);

    // 각 종목에 대해 동전주/밈주식/퀀트 점수 계산 (최적화)
    return uniqueStocks.map(stock => {
      const basePrice = stock.currency === 'USD' ? 
        (Math.random() * 15 + 0.5) : 
        (Math.random() * 15000 + 500);
      
      const isPennyStock = stock.currency === 'USD' ? basePrice <= 5 : basePrice <= 1000;
      
      // 분리된 함수들로 점수 계산
      const memeScore = Math.round(calculateMemeScore(stock, keywords));
      const quantData = calculateQuantScore();
      const marketCap = Math.random() * 5000 + 50;

      return {
        ...stock,
        price: basePrice,
        isPennyStock,
        memeScore,
        quantScore: Math.round(quantData.score),
        marketCap,
        
        // 퀀트 지표들
        per: quantData.per,
        pbr: quantData.pbr,
        roe: quantData.roe,
        debtRatio: quantData.debtRatio,
        revenueGrowth: quantData.revenueGrowth,
        
        // 밈 지표들
        socialMentions: Math.floor(Math.random() * 10000),
        volumeSpike: Math.random() * 500 + 100,
        redditScore: Math.floor(Math.random() * 100),
        
        // 키워드 매칭 점수
        keywordMatchScore: keywords.filter(k => 
          stock.keywords?.some(sk => sk.toLowerCase().includes(k.toLowerCase())) ||
          stock.name.toLowerCase().includes(k.toLowerCase()) ||
          stock.sector?.toLowerCase().includes(k.toLowerCase())
        ).length
      };
    });
  }, [keywords]);

  // 필터링된 종목들
  const filteredStocks = useMemo(() => {
    return discoveredStocks.filter(stock => {
      // 동전주 필터
      if (filterOptions.showPennyStocks && stock.isPennyStock) return true;
      
      // 밈주식 필터
      if (filterOptions.showMemeStocks && stock.memeScore >= filterOptions.minMemeScore) return true;
      
      // 퀀트 필터
      if (filterOptions.showQuantStocks && stock.quantScore >= filterOptions.minQuantScore) return true;
      
      return false;
    }).filter(stock => {
      // 가격 필터
      if (stock.currency === 'USD' && stock.price > filterOptions.maxPrice) return false;
      if (stock.currency === 'KRW' && stock.price > filterOptions.maxPrice * 1300) return false;
      
      // 시가총액 필터
      if (stock.marketCap > filterOptions.maxMarketCap / 1000000) return false;
      
      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'memeScore':
          return b.memeScore - a.memeScore;
        case 'quantScore':
          return b.quantScore - a.quantScore;
        case 'price':
          return a.price - b.price;
        case 'marketCap':
          return a.marketCap - b.marketCap;
        case 'keywordMatch':
          return b.keywordMatchScore - a.keywordMatchScore;
        default:
          return b.memeScore - a.memeScore;
      }
    });
  }, [discoveredStocks, filterOptions, sortBy]);

  // 커스텀 필터 저장
  const saveCustomFilter = useCallback(() => {
    if (newFilterName) {
      const newFilter = {
        id: Date.now().toString(),
        name: newFilterName,
        options: filterOptions,
        timestamp: new Date().toISOString()
      };
      setCustomFilters(prev => [newFilter, ...prev.slice(0, 4)]); // 최대 5개
      setNewFilterName('');
      setShowCustomFilterForm(false);
    }
  }, [newFilterName, filterOptions, setCustomFilters]);

  // 필터 옵션 업데이트
  const updateFilterOption = useCallback((key, value) => {
    setFilterOptions(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setFilterOptions]);

  // 종목 추적 시작
  const handleTrackStock = useCallback((stock) => {
    if (onStockTrack) {
      onStockTrack(stock);
    }
    console.log('📈 종목 추적 시작:', stock);
  }, [onStockTrack]);

  if (keywords.length === 0) {
    return (
      <div style={{
        background: theme.bg,
        borderRadius: '12px',
        border: `2px solid ${theme.border}`,
        padding: '40px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
        <h3 style={{ color: theme.text, marginBottom: '10px' }}>
          키워드를 먼저 선택해주세요
        </h3>
        <p style={{ color: theme.subtext, fontSize: '14px' }}>
          브레인스토밍에서 키워드를 생성하면<br />
          관련 종목 발굴이 시작됩니다.
        </p>
      </div>
    );
  }

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
        background: theme.gradients.ocean,
        padding: '20px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
              🔍 키워드 기반 종목 발굴
            </h2>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
              동전주 • 밈주식 • 퀀트 분석으로 숨겨진 기회 발굴
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
              {filteredStocks.length}개 발굴
            </span>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              키워드: {keywords.join(', ')}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '25px' }}>
        {/* 필터 설정 */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: theme.text, fontSize: '18px', margin: 0 }}>
              🎯 발굴 필터 설정
            </h3>
            <button
              onClick={() => setShowCustomFilterForm(!showCustomFilterForm)}
              style={{
                background: theme.warning,
                border: 'none',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              {showCustomFilterForm ? '✕ 닫기' : '💾 필터 저장'}
            </button>
          </div>

          <div style={{
            background: theme.cardBg,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${theme.border}`
          }}>
            {/* 기본 필터들 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {/* 동전주 필터 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={filterOptions.showPennyStocks}
                    onChange={(e) => updateFilterOption('showPennyStocks', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>
                    🪙 동전주 ($5 미만)
                  </span>
                </div>
                <div style={{ marginLeft: '26px' }}>
                  <label style={{ color: theme.subtext, fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                    최대 가격: ${filterOptions.maxPrice}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={filterOptions.maxPrice}
                    onChange={(e) => updateFilterOption('maxPrice', parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* 밈주식 필터 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={filterOptions.showMemeStocks}
                    onChange={(e) => updateFilterOption('showMemeStocks', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>
                    🚀 밈주식 (소셜 버즈)
                  </span>
                </div>
                <div style={{ marginLeft: '26px' }}>
                  <label style={{ color: theme.subtext, fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                    최소 밈 점수: {filterOptions.minMemeScore}점
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={filterOptions.minMemeScore}
                    onChange={(e) => updateFilterOption('minMemeScore', parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* 퀀트 필터 */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={filterOptions.showQuantStocks}
                    onChange={(e) => updateFilterOption('showQuantStocks', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>
                    📊 퀀트 우량주
                  </span>
                </div>
                <div style={{ marginLeft: '26px' }}>
                  <label style={{ color: theme.subtext, fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                    최소 퀀트 점수: {filterOptions.minQuantScore}점
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={filterOptions.minQuantScore}
                    onChange={(e) => updateFilterOption('minQuantScore', parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* 커스텀 필터 저장 폼 */}
            {showCustomFilterForm && (
              <div style={{
                background: theme.bg,
                padding: '15px',
                borderRadius: '8px',
                marginTop: '15px',
                border: `1px solid ${theme.border}`
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={newFilterName}
                    onChange={(e) => setNewFilterName(e.target.value)}
                    placeholder="필터 이름 (예: 고급등주 특별 필터)"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: `2px solid ${theme.border}`,
                      borderRadius: '6px',
                      background: theme.bg,
                      color: theme.text,
                      fontSize: '14px'
                    }}
                  />
                  <button
                    onClick={saveCustomFilter}
                    disabled={!newFilterName}
                    style={{
                      background: theme.positive,
                      border: 'none',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: newFilterName ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '600',
                      opacity: newFilterName ? 1 : 0.6
                    }}
                  >
                    저장
                  </button>
                </div>
              </div>
            )}

            {/* 저장된 커스텀 필터들 */}
            {customFilters.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <h4 style={{ color: theme.text, fontSize: '14px', marginBottom: '10px' }}>
                  💾 저장된 필터
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {customFilters.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setFilterOptions(filter.options)}
                      style={{
                        background: theme.accent,
                        border: 'none',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 정렬 옵션 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>정렬:</span>
            {[
              { value: 'memeScore', label: '🚀 밈 점수' },
              { value: 'quantScore', label: '📊 퀀트 점수' },
              { value: 'keywordMatch', label: '🎯 키워드 매칭' },
              { value: 'price', label: '💰 가격 낮은순' },
              { value: 'marketCap', label: '📈 시총 작은순' }
            ].map(sort => (
              <button
                key={sort.value}
                onClick={() => setSortBy(sort.value)}
                style={{
                  background: sortBy === sort.value ? theme.accent : 'transparent',
                  color: sortBy === sort.value ? 'white' : theme.text,
                  border: `2px solid ${theme.accent}`,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>

        {/* 발굴된 종목 목록 - 가상 스크롤링 적용 */}
        <VirtualizedStockList
          stocks={filteredStocks}
          onStockTrack={handleTrackStock}
          darkMode={darkMode}
        />

        {/* CSV 내보내기 */}
        {filteredStocks.length > 0 && (
          <div style={{ marginTop: '25px', textAlign: 'center' }}>
            <button
              onClick={() => {
                const csvData = filteredStocks.map(stock => ({
                  Symbol: stock.symbol,
                  Name: stock.name,
                  Price: stock.price,
                  'Meme Score': stock.memeScore,
                  'Quant Score': stock.quantScore,
                  'Is Penny': stock.isPennyStock ? 'Yes' : 'No',
                  PER: stock.per.toFixed(1),
                  PBR: stock.pbr.toFixed(1),
                  ROE: stock.roe.toFixed(1) + '%',
                  'Debt Ratio': stock.debtRatio.toFixed(1) + '%',
                  'Revenue Growth': stock.revenueGrowth.toFixed(1) + '%',
                  'Market Cap': stock.marketCap + 'M',
                  Keywords: keywords.join(', ')
                }));
                
                const csv = [
                  Object.keys(csvData[0]).join(','),
                  ...csvData.map(row => Object.values(row).join(','))
                ].join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `키워드_종목발굴_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{
                background: theme.purple,
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              📊 CSV로 내보내기 ({filteredStocks.length}개 종목)
            </button>
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
        <div>🔍 키워드 기반 종목 발굴로 숨겨진 기회를 찾아보세요</div>
        <div>🎯 동전주 • 밈주식 • 퀀트 분석으로 다각도 평가</div>
      </div>
    </div>
  );
};

export default StockDiscoveryEngine; 