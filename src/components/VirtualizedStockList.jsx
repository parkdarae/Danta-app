import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTheme, getScoreColor } from '../hooks/useTheme';

// 가상 스크롤링을 위한 설정
const ITEM_HEIGHT = 200; // 각 종목 카드 높이
const VISIBLE_ITEMS = 5; // 화면에 보이는 아이템 수
const BUFFER_SIZE = 2; // 버퍼 아이템 수

const VirtualizedStockItem = React.memo(({ stock, onTrack, theme }) => {
  const handleTrack = useCallback(() => {
    onTrack(stock);
  }, [stock, onTrack]);

  return (
    <div
      style={{
        background: theme.cardBg,
        border: `2px solid ${
          stock.symbol === 'UAVS' ? theme.warning :
          stock.isPennyStock ? theme.positive :
          stock.memeScore >= 80 ? theme.orange :
          theme.border
        }`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '15px',
        height: `${ITEM_HEIGHT - 15}px`,
        overflow: 'hidden'
      }}
    >
      {/* 종목 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
            <span style={{ color: theme.text, fontWeight: '700', fontSize: '16px' }}>
              {stock.symbol}
              {stock.symbol === 'UAVS' && ' 🎯🚁'}
              {stock.isPennyStock && ' 🪙'}
            </span>
            <span style={{ color: theme.subtext, fontSize: '12px' }}>
              {stock.name}
            </span>
          </div>
          <div style={{ color: theme.subtext, fontSize: '11px' }}>
            {stock.market} • {stock.sector}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ color: theme.text, fontSize: '16px', fontWeight: '700' }}>
            {stock.currency === 'USD' ? '$' : ''}{stock.price?.toFixed(2)}
            {stock.currency === 'KRW' ? '원' : ''}
          </div>
          <div style={{ color: theme.subtext, fontSize: '10px' }}>
            시총: {stock.marketCap < 1000 ? 
              `${stock.marketCap.toFixed(0)}M` : 
              `${(stock.marketCap/1000).toFixed(1)}B`}
          </div>
        </div>
      </div>

      {/* 점수 표시 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginBottom: '10px'
      }}>
        {/* 밈 점수 */}
        <div style={{
          background: theme.bg,
          padding: '6px',
          borderRadius: '6px',
          textAlign: 'center',
          border: `2px solid ${getScoreColor(stock.memeScore, theme)}`
        }}>
          <div style={{ fontSize: '10px', color: theme.subtext }}>밈</div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '700',
            color: getScoreColor(stock.memeScore, theme)
          }}>
            {stock.memeScore}
          </div>
        </div>

        {/* 퀀트 점수 */}
        <div style={{
          background: theme.bg,
          padding: '6px',
          borderRadius: '6px',
          textAlign: 'center',
          border: `2px solid ${getScoreColor(stock.quantScore, theme)}`
        }}>
          <div style={{ fontSize: '10px', color: theme.subtext }}>퀀트</div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '700',
            color: getScoreColor(stock.quantScore, theme)
          }}>
            {stock.quantScore}
          </div>
        </div>

        {/* 동전주 여부 */}
        <div style={{
          background: theme.bg,
          padding: '6px',
          borderRadius: '6px',
          textAlign: 'center',
          border: `2px solid ${stock.isPennyStock ? theme.positive : theme.border}`
        }}>
          <div style={{ fontSize: '10px', color: theme.subtext }}>동전주</div>
          <div style={{ 
            fontSize: '14px',
            color: stock.isPennyStock ? theme.positive : theme.text
          }}>
            {stock.isPennyStock ? '✅' : '❌'}
          </div>
        </div>

        {/* 거래량 */}
        <div style={{
          background: theme.bg,
          padding: '6px',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', color: theme.subtext }}>거래량</div>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '600',
            color: stock.volumeSpike > 200 ? theme.positive : theme.text
          }}>
            +{stock.volumeSpike?.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* 퀀트 지표 요약 */}
      <div style={{
        background: theme.bg,
        padding: '8px',
        borderRadius: '6px',
        marginBottom: '8px',
        fontSize: '10px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          <div>
            <span style={{ color: theme.subtext }}>PER: </span>
            <span style={{ color: theme.text, fontWeight: '600' }}>{stock.per?.toFixed(1)}</span>
          </div>
          <div>
            <span style={{ color: theme.subtext }}>ROE: </span>
            <span style={{ 
              color: stock.roe > 0 ? theme.positive : theme.negative,
              fontWeight: '600'
            }}>
              {stock.roe?.toFixed(1)}%
            </span>
          </div>
          <div>
            <span style={{ color: theme.subtext }}>성장률: </span>
            <span style={{ 
              color: stock.revenueGrowth > 0 ? theme.positive : theme.negative,
              fontWeight: '600'
            }}>
              {stock.revenueGrowth?.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={handleTrack}
          style={{
            background: theme.positive,
            border: 'none',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            flex: 1
          }}
        >
          📈 추적
        </button>
        <button
          style={{
            background: theme.accent,
            border: 'none',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            flex: 1
          }}
        >
          📰 뉴스
        </button>
      </div>
    </div>
  );
});

VirtualizedStockItem.displayName = 'VirtualizedStockItem';

const VirtualizedStockList = ({ stocks = [], onStockTrack, darkMode = false }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(VISIBLE_ITEMS * ITEM_HEIGHT);
  const containerRef = useRef(null);
  const theme = useTheme(darkMode);

  // 컨테이너 높이 자동 조정
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 100; // 여백 고려
        const idealHeight = Math.min(availableHeight, VISIBLE_ITEMS * ITEM_HEIGHT);
        setContainerHeight(idealHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // 가상 스크롤링 계산
  const virtualizedData = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endIndex = Math.min(
      stocks.length - 1,
      startIndex + Math.ceil(containerHeight / ITEM_HEIGHT) + BUFFER_SIZE * 2
    );

    const visibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (stocks[i]) {
        visibleItems.push({
          index: i,
          stock: stocks[i],
          top: i * ITEM_HEIGHT
        });
      }
    }

    return {
      visibleItems,
      totalHeight: stocks.length * ITEM_HEIGHT,
      startIndex,
      endIndex
    };
  }, [stocks, scrollTop, containerHeight]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const handleStockTrack = useCallback((stock) => {
    onStockTrack?.(stock);
  }, [onStockTrack]);

  if (stocks.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: theme.subtext,
        fontSize: '16px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
        <div>종목을 찾을 수 없습니다.</div>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>
          필터 조건을 조정해보세요.
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* 성능 정보 */}
      <div style={{
        background: theme.cardBg,
        padding: '8px 12px',
        borderRadius: '6px',
        marginBottom: '10px',
        fontSize: '11px',
        color: theme.subtext,
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>
          📊 총 {stocks.length}개 종목 
          {virtualizedData.visibleItems.length > 0 && 
            ` (${virtualizedData.startIndex + 1}-${virtualizedData.endIndex + 1} 표시)`
          }
        </span>
        <span>⚡ 가상 스크롤링 최적화</span>
      </div>

      {/* 가상 스크롤 컨테이너 */}
      <div
        ref={containerRef}
        style={{
          height: `${containerHeight}px`,
          overflow: 'auto',
          border: `2px solid ${theme.border}`,
          borderRadius: '12px',
          background: theme.bg
        }}
        onScroll={handleScroll}
      >
        <div style={{ height: `${virtualizedData.totalHeight}px`, position: 'relative' }}>
          {virtualizedData.visibleItems.map(({ stock, top, index }) => (
            <div
              key={`${stock.symbol}-${index}`}
              style={{
                position: 'absolute',
                top: `${top}px`,
                left: '0',
                right: '0',
                height: `${ITEM_HEIGHT}px`,
                padding: '0 15px'
              }}
            >
              <VirtualizedStockItem
                stock={stock}
                onTrack={handleStockTrack}
                theme={theme}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 스크롤 인디케이터 */}
      {stocks.length > VISIBLE_ITEMS && (
        <div style={{
          background: theme.cardBg,
          padding: '8px 12px',
          borderRadius: '6px',
          marginTop: '10px',
          fontSize: '11px',
          color: theme.subtext,
          textAlign: 'center'
        }}>
          스크롤하여 더 많은 종목을 확인하세요 
          ({Math.round((scrollTop / (virtualizedData.totalHeight - containerHeight)) * 100) || 0}%)
        </div>
      )}
    </div>
  );
};

export default React.memo(VirtualizedStockList); 