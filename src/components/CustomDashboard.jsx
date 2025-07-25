import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { WIDGET_TYPES, DEFAULT_DASHBOARD_CONFIG, STORAGE_KEYS, COLORS } from '../utils/constants';
import StockChart from './StockChart';
import VolumeAnomalyTracker from './VolumeAnomalyTracker';
import NewsSection from './NewsSection';
import AIChatSection from './AIChatSection';
import InvestmentMemo from './InvestmentMemo';
import EmotionButtons from './EmotionButtons';

function CustomDashboard({ selectedStock, darkMode = false, onEmotionSelect }) {
  const [dashboardConfig, setDashboardConfig] = useLocalStorage(
    STORAGE_KEYS.DASHBOARD_CONFIG, 
    DEFAULT_DASHBOARD_CONFIG
  );
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);

  const theme = darkMode ? COLORS.dark : COLORS.light;

  // 위젯 활성화/비활성화 토글
  const toggleWidget = (widgetId) => {
    setDashboardConfig(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, enabled: !widget.enabled }
          : widget
      )
    );
  };

  // 위젯 순서 변경
  const moveWidget = (widgetId, direction) => {
    setDashboardConfig(prev => {
      const widgets = [...prev];
      const currentIndex = widgets.findIndex(w => w.id === widgetId);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (targetIndex >= 0 && targetIndex < widgets.length) {
        [widgets[currentIndex], widgets[targetIndex]] = [widgets[targetIndex], widgets[currentIndex]];
        // order 재정렬
        widgets.forEach((widget, index) => {
          widget.order = index + 1;
        });
      }
      
      return widgets;
    });
  };

  // 위젯 크기 변경
  const changeWidgetSize = (widgetId, size) => {
    setDashboardConfig(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, size }
          : widget
      )
    );
  };

  // 기본 설정으로 리셋
  const resetToDefault = () => {
    setDashboardConfig(DEFAULT_DASHBOARD_CONFIG);
    alert('대시보드가 기본 설정으로 초기화되었습니다! 🎯');
  };

  // 활성화된 위젯들을 order 순으로 정렬
  const enabledWidgets = dashboardConfig
    .filter(widget => widget.enabled)
    .sort((a, b) => a.order - b.order);

  // 위젯 렌더링
  const renderWidget = (widget) => {
    const containerStyle = {
      marginBottom: '1.5rem',
      gridColumn: widget.size === 'large' ? 'span 2' : widget.size === 'small' ? 'span 1' : 'span 1'
    };

    switch (widget.id) {
      case WIDGET_TYPES.PRICE:
        return (
          <div key={widget.id} style={containerStyle}>
            <PriceWidget stock={selectedStock} darkMode={darkMode} onPriceUpdate={setCurrentPrice} />
          </div>
        );
      
      case WIDGET_TYPES.CHART:
        return (
          <div key={widget.id} style={containerStyle}>
            <StockChart stock={selectedStock} chartType="5min" darkMode={darkMode} />
          </div>
        );
      
      case WIDGET_TYPES.EMOTIONS:
        return (
          <div key={widget.id} style={containerStyle}>
            <EmotionButtons onSelect={onEmotionSelect} darkMode={darkMode} />
          </div>
        );
      
      case WIDGET_TYPES.VOLUME:
        return (
          <div key={widget.id} style={containerStyle}>
            <VolumeAnomalyTracker stock={selectedStock} darkMode={darkMode} />
          </div>
        );
      
      case WIDGET_TYPES.NEWS:
        return (
          <div key={widget.id} style={containerStyle}>
            <NewsSection stock={selectedStock} darkMode={darkMode} />
          </div>
        );
      
      case WIDGET_TYPES.MEMOS:
        return (
          <div key={widget.id} style={containerStyle}>
            <InvestmentMemo stock={selectedStock} darkMode={darkMode} />
          </div>
        );
      
      case WIDGET_TYPES.AI_CHAT:
        return (
          <div key={widget.id} style={containerStyle}>
            <AIChatSection stock={selectedStock} darkMode={darkMode} />
          </div>
        );
      
      case WIDGET_TYPES.INDICATORS:
        return (
          <div key={widget.id} style={containerStyle}>
            <TechnicalIndicatorsWidget stock={selectedStock} darkMode={darkMode} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: theme.bg,
      minHeight: '100vh',
      padding: '1rem'
    }}>
      {/* 대시보드 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem',
        background: theme.surface,
        borderRadius: '16px',
        border: `2px solid ${theme.border}`
      }}>
        <div>
          <h2 style={{
            margin: 0,
            color: COLORS.primary,
            fontSize: '1.5rem',
            fontWeight: '800'
          }}>
            📊 {selectedStock} 대시보드
          </h2>
          <p style={{
            margin: '0.5rem 0 0 0',
            color: theme.subtext,
            fontSize: '0.9rem'
          }}>
            원하는 위젯을 선택하여 나만의 대시보드를 만들어보세요!
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            style={{
              background: isCustomizing 
                ? `linear-gradient(45deg, ${COLORS.primary}, #ff6b6b)` 
                : 'transparent',
              color: isCustomizing ? '#fff' : theme.text,
              border: `2px solid ${isCustomizing ? 'transparent' : theme.border}`,
              borderRadius: '12px',
              padding: '0.8rem 1.2rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            {isCustomizing ? '✅ 설정 완료' : '⚙️ 커스터마이징'}
          </button>
          
          {isCustomizing && (
            <button
              onClick={resetToDefault}
              style={{
                background: 'transparent',
                color: theme.text,
                border: `2px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '0.8rem 1.2rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              🔄 기본 설정
            </button>
          )}
        </div>
      </div>

      {/* 커스터마이징 패널 */}
      {isCustomizing && (
        <div style={{
          background: theme.surface,
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: `2px solid ${theme.border}`
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: COLORS.primary,
            fontSize: '1.2rem',
            fontWeight: '700'
          }}>
            🎛️ 위젯 설정
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {dashboardConfig.map(widget => (
              <div
                key={widget.id}
                style={{
                  background: darkMode ? '#1a1a1a' : '#fff',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: `2px solid ${widget.enabled ? COLORS.primary : theme.border}`
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.8rem'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: theme.text
                  }}>
                    <input
                      type="checkbox"
                      checked={widget.enabled}
                      onChange={() => toggleWidget(widget.id)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    {widget.title}
                  </label>
                  
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                      onClick={() => moveWidget(widget.id, 'up')}
                      disabled={!widget.enabled}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: widget.enabled ? 'pointer' : 'not-allowed',
                        fontSize: '1rem',
                        opacity: widget.enabled ? 1 : 0.3
                      }}
                    >
                      ⬆️
                    </button>
                    <button
                      onClick={() => moveWidget(widget.id, 'down')}
                      disabled={!widget.enabled}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: widget.enabled ? 'pointer' : 'not-allowed',
                        fontSize: '1rem',
                        opacity: widget.enabled ? 1 : 0.3
                      }}
                    >
                      ⬇️
                    </button>
                  </div>
                </div>
                
                {widget.enabled && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      color: theme.subtext,
                      marginBottom: '0.3rem'
                    }}>
                      크기:
                    </label>
                    <select
                      value={widget.size}
                      onChange={(e) => changeWidgetSize(widget.id, e.target.value)}
                      style={{
                        background: theme.bg,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        padding: '0.3rem',
                        fontSize: '0.8rem'
                      }}
                    >
                      <option value="small">작음</option>
                      <option value="medium">보통</option>
                      <option value="large">큼</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 대시보드 위젯들 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        {enabledWidgets.map(widget => renderWidget(widget))}
      </div>

      {/* 빈 대시보드 메시지 */}
      {enabledWidgets.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4rem',
          background: theme.surface,
          borderRadius: '16px',
          border: `2px dashed ${theme.border}`
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{
            color: theme.text,
            fontSize: '1.2rem',
            marginBottom: '0.5rem'
          }}>
            위젯을 선택해주세요!
          </h3>
          <p style={{
            color: theme.subtext,
            fontSize: '0.9rem',
            marginBottom: '1rem'
          }}>
            "커스터마이징" 버튼을 눌러 원하는 위젯들을 활성화해보세요.
          </p>
          <button
            onClick={() => setIsCustomizing(true)}
            style={{
              background: `linear-gradient(45deg, ${COLORS.primary}, #ff6b6b)`,
              color: '#fff',
              border: 'none',
              borderRadius: '25px',
              padding: '0.8rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            🎛️ 지금 설정하기
          </button>
        </div>
      )}
    </div>
  );
}

// 현재가 위젯
function PriceWidget({ stock, darkMode, onPriceUpdate }) {
  const [price, setPrice] = useState('0,000');
  const [change, setChange] = useState(0);
  const [changePercent, setChangePercent] = useState(0);

  const theme = darkMode ? COLORS.dark : COLORS.light;
  const isPositive = change >= 0;

  useEffect(() => {
    // 실제 구현에서는 실시간 가격 API 호출
    const mockPrice = Math.floor(Math.random() * 100000) + 50000;
    const mockChange = Math.floor(Math.random() * 2000) - 1000;
    const mockChangePercent = ((mockChange / mockPrice) * 100);

    setPrice(mockPrice.toLocaleString());
    setChange(mockChange);
    setChangePercent(mockChangePercent);
    
    if (onPriceUpdate) onPriceUpdate(mockPrice);
  }, [stock, onPriceUpdate]);

  return (
    <div style={{
      background: theme.surface,
      borderRadius: '16px',
      padding: '1.5rem',
      border: `2px solid ${theme.border}`,
      textAlign: 'center'
    }}>
      <h4 style={{
        margin: '0 0 1rem 0',
        color: COLORS.primary,
        fontSize: '1.1rem',
        fontWeight: '700'
      }}>
        💰 {stock} 현재가
      </h4>
      
      <div style={{
        fontSize: '2rem',
        fontWeight: '800',
        color: theme.text,
        marginBottom: '0.5rem'
      }}>
        {price}원
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{
          color: isPositive ? COLORS.success : COLORS.danger,
          fontSize: '1.2rem',
          fontWeight: '700'
        }}>
          {isPositive ? '▲' : '▼'} {Math.abs(change).toLocaleString()}원
        </span>
        <span style={{
          color: isPositive ? COLORS.success : COLORS.danger,
          fontSize: '1rem',
          fontWeight: '600'
        }}>
          ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}

// 기술 지표 위젯
function TechnicalIndicatorsWidget({ stock, darkMode }) {
  const theme = darkMode ? COLORS.dark : COLORS.light;
  
  const indicators = [
    { name: 'RSI', value: '65.2', status: 'neutral', description: '중립' },
    { name: 'MACD', value: '12.4', status: 'positive', description: '상승' },
    { name: '이동평균선', value: '55,420', status: 'positive', description: '상승' },
    { name: '볼린저밴드', value: '중간', status: 'neutral', description: '중립' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'positive': return COLORS.success;
      case 'negative': return COLORS.danger;
      default: return COLORS.secondary;
    }
  };

  return (
    <div style={{
      background: theme.surface,
      borderRadius: '16px',
      padding: '1.5rem',
      border: `2px solid ${theme.border}`
    }}>
      <h4 style={{
        margin: '0 0 1rem 0',
        color: COLORS.primary,
        fontSize: '1.1rem',
        fontWeight: '700'
      }}>
        📈 기술 지표
      </h4>
      
      <div style={{
        display: 'grid',
        gap: '0.8rem'
      }}>
        {indicators.map((indicator, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.8rem',
            background: darkMode ? '#1a1a1a' : '#fff',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`
          }}>
            <span style={{
              color: theme.text,
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              {indicator.name}
            </span>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                color: theme.text,
                fontSize: '0.9rem',
                fontWeight: '700'
              }}>
                {indicator.value}
              </div>
              <div style={{
                color: getStatusColor(indicator.status),
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {indicator.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomDashboard; 