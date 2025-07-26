import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import kisAPI from '../services/kisAPI';
import freeUSStockAPI from '../services/freeUSStockAPI';
import { getStockBySymbol } from '../data/stockMasterDB';

const StockAlertSystem = ({ darkMode = false, watchlist = [] }) => {
  const [alerts, setAlerts] = useLocalStorage('stock_alerts', []);
  const [realTimeData, setRealTimeData] = useState({});
  const [alertHistory, setAlertHistory] = useLocalStorage('alert_history', []);
  const [soundEnabled, setSoundEnabled] = useLocalStorage('alert_sound_enabled', true);
  const [notificationEnabled, setNotificationEnabled] = useLocalStorage('alert_notification_enabled', true);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const monitoringInterval = useRef(null);
  const lastNotificationTime = useRef({});

  const theme = {
    bg: darkMode ? '#1a1a1a' : '#ffffff',
    cardBg: darkMode ? '#2d2d2d' : '#f8f9fa',
    text: darkMode ? '#ffffff' : '#333333',
    subtext: darkMode ? '#cccccc' : '#666666',
    border: darkMode ? '#404040' : '#e0e0e0',
    accent: '#007bff',
    positive: '#00c851',
    negative: '#ff4444',
    warning: '#ffbb33'
  };

  // 알람 조건 타입
  const alertTypes = [
    { value: 'price_above', label: '가격 이상', icon: '⬆️' },
    { value: 'price_below', label: '가격 이하', icon: '⬇️' },
    { value: 'change_above', label: '변화율 +', icon: '📈' },
    { value: 'change_below', label: '변화율 -', icon: '📉' },
    { value: 'volume_spike', label: '거래량 급증', icon: '🔥' }
  ];

  // 알람 설정 추가
  const addAlert = (symbol, type, value, description = '') => {
    const stockInfo = getStockBySymbol(symbol);
    const newAlert = {
      id: Date.now().toString(),
      symbol,
      stockName: stockInfo?.name || symbol,
      type,
      value: parseFloat(value),
      description,
      isActive: true,
      createdAt: new Date().toISOString(),
      triggeredCount: 0
    };

    setAlerts(prev => [...prev, newAlert]);
    console.log(`🔔 알람 추가: ${symbol} ${type} ${value}`);
  };

  // 알람 삭제
  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // 알람 활성화/비활성화
  const toggleAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, isActive: !alert.isActive }
        : alert
    ));
  };

  // 실시간 데이터 모니터링
  const startMonitoring = useCallback(async () => {
    if (!watchlist.length) return;

    setIsMonitoring(true);
    console.log(`🔄 실시간 모니터링 시작: ${watchlist.length}개 종목`);

    try {
      const promises = watchlist.map(async (symbol) => {
        try {
          const stockInfo = getStockBySymbol(symbol);
          let data;

          if (stockInfo?.country === 'KOR') {
            data = await kisAPI.getCurrentPrice(symbol, 'domestic');
          } else {
            data = await freeUSStockAPI.getUSStockData(symbol);
          }

          return { symbol, data, stockInfo };
        } catch (error) {
          console.warn(`${symbol} 데이터 조회 실패:`, error);
          return { symbol, data: null, stockInfo: null };
        }
      });

      const results = await Promise.all(promises);
      const newRealTimeData = {};

      results.forEach(({ symbol, data, stockInfo }) => {
        if (data) {
          newRealTimeData[symbol] = {
            ...data,
            stockInfo,
            lastUpdated: new Date().toISOString()
          };
        }
      });

      setRealTimeData(prev => ({
        ...prev,
        ...newRealTimeData
      }));

      // 알람 체크
      checkAlerts(newRealTimeData);

    } catch (error) {
      console.error('모니터링 오류:', error);
    } finally {
      setIsMonitoring(false);
    }
  }, [watchlist, alerts]);

  // 알람 조건 체크
  const checkAlerts = useCallback((currentData) => {
    const activeAlerts = alerts.filter(alert => alert.isActive);
    
    activeAlerts.forEach(alert => {
      const stockData = currentData[alert.symbol];
      if (!stockData) return;

      let shouldTrigger = false;
      let message = '';

      switch (alert.type) {
        case 'price_above':
          if (stockData.price >= alert.value) {
            shouldTrigger = true;
            message = `${alert.stockName}(${alert.symbol}) 가격이 ${alert.value}${stockData.currency === 'USD' ? '$' : '원'} 이상이 되었습니다. 현재: ${stockData.price}`;
          }
          break;

        case 'price_below':
          if (stockData.price <= alert.value) {
            shouldTrigger = true;
            message = `${alert.stockName}(${alert.symbol}) 가격이 ${alert.value}${stockData.currency === 'USD' ? '$' : '원'} 이하가 되었습니다. 현재: ${stockData.price}`;
          }
          break;

        case 'change_above':
          if (stockData.changePercent >= alert.value) {
            shouldTrigger = true;
            message = `${alert.stockName}(${alert.symbol}) 변화율이 +${alert.value}% 이상이 되었습니다. 현재: ${stockData.changePercent}%`;
          }
          break;

        case 'change_below':
          if (stockData.changePercent <= -alert.value) {
            shouldTrigger = true;
            message = `${alert.stockName}(${alert.symbol}) 변화율이 -${alert.value}% 이하가 되었습니다. 현재: ${stockData.changePercent}%`;
          }
          break;

        case 'volume_spike':
          // 평상시 거래량의 alert.value배 이상인 경우
          const avgVolume = stockData.volume / (alert.value || 2);
          if (stockData.volume >= avgVolume * alert.value) {
            shouldTrigger = true;
            message = `${alert.stockName}(${alert.symbol}) 거래량이 ${alert.value}배 급증했습니다. 현재: ${stockData.volume?.toLocaleString()}`;
          }
          break;
      }

      if (shouldTrigger) {
        triggerAlert(alert, message, stockData);
      }
    });
  }, [alerts]);

  // 알람 발동
  const triggerAlert = useCallback((alert, message, stockData) => {
    const now = Date.now();
    const lastTime = lastNotificationTime.current[alert.id] || 0;
    
    // 같은 알람의 중복 발생 방지 (5분 간격)
    if (now - lastTime < 300000) return;

    lastNotificationTime.current[alert.id] = now;

    // 알람 기록 추가
    const alertRecord = {
      id: Date.now().toString(),
      alertId: alert.id,
      symbol: alert.symbol,
      message,
      stockData,
      timestamp: new Date().toISOString()
    };

    setAlertHistory(prev => [alertRecord, ...prev.slice(0, 99)]); // 최대 100개 보관

    // 알람 트리거 횟수 증가
    setAlerts(prev => prev.map(a => 
      a.id === alert.id 
        ? { ...a, triggeredCount: (a.triggeredCount || 0) + 1 }
        : a
    ));

    console.log(`🚨 알람 발동: ${message}`);

    // 사운드 알람
    if (soundEnabled) {
      playAlertSound();
    }

    // 브라우저 알림
    if (notificationEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('주식 알람', {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('주식 알람', {
              body: message,
              icon: '/favicon.ico'
            });
          }
        });
      }
    }
  }, [soundEnabled, notificationEnabled, setAlertHistory, setAlerts]);

  // 알람 사운드 재생
  const playAlertSound = () => {
    try {
      // Web Audio API를 사용한 간단한 비프음
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // 800Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('사운드 재생 실패:', error);
    }
  };

  // 모니터링 간격 설정
  useEffect(() => {
    if (watchlist.length > 0) {
      // 첫 데이터 로드
      startMonitoring();

      // 정기적 모니터링 (30초 간격)
      monitoringInterval.current = setInterval(() => {
        startMonitoring();
      }, 30000);

      return () => {
        if (monitoringInterval.current) {
          clearInterval(monitoringInterval.current);
        }
      };
    }
  }, [watchlist, startMonitoring]);

  // 알람 추가 폼 컴포넌트
  const AlertForm = ({ symbol }) => {
    const [alertType, setAlertType] = useState('price_above');
    const [alertValue, setAlertValue] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      if (alertValue && parseFloat(alertValue) > 0) {
        addAlert(symbol, alertType, alertValue, description);
        setAlertValue('');
        setDescription('');
      }
    };

    const stockInfo = getStockBySymbol(symbol);
    const currentData = realTimeData[symbol];

    return (
      <form onSubmit={handleSubmit} style={{
        padding: '15px',
        background: theme.cardBg,
        borderRadius: '6px',
        border: `1px solid ${theme.border}`,
        marginBottom: '10px'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <strong style={{ color: theme.text }}>
            {stockInfo?.name || symbol} ({symbol}) 알람 추가
          </strong>
          {currentData && (
            <div style={{ color: theme.subtext, fontSize: '12px', marginTop: '4px' }}>
              현재가: {currentData.price} {currentData.currency === 'USD' ? '$' : '원'} 
              ({currentData.changePercent > 0 ? '+' : ''}{currentData.changePercent}%)
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <select
            value={alertType}
            onChange={(e) => setAlertType(e.target.value)}
            style={{
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              color: theme.text,
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            {alertTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            step="0.01"
            placeholder="값 입력"
            value={alertValue}
            onChange={(e) => setAlertValue(e.target.value)}
            style={{
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              color: theme.text,
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '12px',
              width: '100px'
            }}
            required
          />

          <button
            type="submit"
            style={{
              background: theme.positive,
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            추가
          </button>
        </div>

        <input
          type="text"
          placeholder="메모 (선택사항)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: '100%',
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            color: theme.text,
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        />
      </form>
    );
  };

  return (
    <div style={{
      background: theme.bg,
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      marginBottom: '20px'
    }}>
      {/* 헤더 */}
      <div style={{
        background: theme.cardBg,
        padding: '15px 20px',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>
            🔔 실시간 알람 시스템
          </h3>
          <span style={{
            background: isMonitoring ? theme.positive : theme.subtext,
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            {isMonitoring ? '모니터링 중' : '대기 중'}
          </span>
          <span style={{
            background: theme.accent,
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            {alerts.filter(a => a.isActive).length}개 활성
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: soundEnabled ? theme.positive : theme.subtext,
              color: 'white',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="사운드 알람"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          <button
            onClick={() => setNotificationEnabled(!notificationEnabled)}
            style={{
              background: notificationEnabled ? theme.positive : theme.subtext,
              color: 'white',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="브라우저 알림"
          >
            {notificationEnabled ? '🔔' : '🔕'}
          </button>
        </div>
      </div>

      {/* 관심종목별 알람 설정 */}
      <div style={{ padding: '20px' }}>
        {watchlist.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: theme.subtext,
            padding: '40px',
            fontSize: '14px'
          }}>
            관심종목을 먼저 추가해주세요.
            <br />
            관심종목에 대해서만 실시간 알람을 설정할 수 있습니다.
          </div>
        ) : (
          watchlist.map(symbol => (
            <AlertForm key={symbol} symbol={symbol} />
          ))
        )}

        {/* 활성 알람 목록 */}
        {alerts.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ color: theme.text, fontSize: '16px', marginBottom: '15px' }}>
              📋 설정된 알람 ({alerts.length}개)
            </h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {alerts.map(alert => {
                const typeInfo = alertTypes.find(t => t.value === alert.type);
                const currentData = realTimeData[alert.symbol];
                
                return (
                  <div
                    key={alert.id}
                    style={{
                      background: theme.cardBg,
                      border: `1px solid ${alert.isActive ? theme.border : theme.subtext}`,
                      borderRadius: '6px',
                      padding: '12px',
                      marginBottom: '8px',
                      opacity: alert.isActive ? 1 : 0.6
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div>
                        <div style={{ color: theme.text, fontWeight: '600', fontSize: '14px' }}>
                          {typeInfo?.icon} {alert.stockName} ({alert.symbol})
                        </div>
                        <div style={{ color: theme.subtext, fontSize: '12px' }}>
                          {typeInfo?.label}: {alert.value}
                          {alert.type.includes('price') && (currentData?.currency === 'USD' ? '$' : '원')}
                          {alert.type.includes('change') && '%'}
                          {alert.type === 'volume_spike' && '배'}
                        </div>
                        {alert.description && (
                          <div style={{ color: theme.subtext, fontSize: '11px', marginTop: '2px' }}>
                            💬 {alert.description}
                          </div>
                        )}
                        <div style={{ color: theme.subtext, fontSize: '11px', marginTop: '4px' }}>
                          생성: {new Date(alert.createdAt).toLocaleString()} • 
                          발동: {alert.triggeredCount || 0}회
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                        <button
                          onClick={() => toggleAlert(alert.id)}
                          style={{
                            background: alert.isActive ? theme.warning : theme.positive,
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          {alert.isActive ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => removeAlert(alert.id)}
                          style={{
                            background: theme.negative,
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* 현재 상태 */}
                    {currentData && (
                      <div style={{
                        background: theme.bg,
                        padding: '8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: theme.subtext
                      }}>
                        현재: {currentData.price} ({currentData.changePercent > 0 ? '+' : ''}{currentData.changePercent}%) • 
                        거래량: {currentData.volume?.toLocaleString()} • 
                        업데이트: {new Date(currentData.lastUpdated).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 최근 알람 기록 */}
        {alertHistory.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ color: theme.text, fontSize: '16px', marginBottom: '15px' }}>
              🚨 최근 알람 기록 ({alertHistory.length}개)
            </h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {alertHistory.slice(0, 10).map(record => (
                <div
                  key={record.id}
                  style={{
                    background: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    padding: '10px',
                    marginBottom: '6px'
                  }}
                >
                  <div style={{ color: theme.text, fontSize: '13px', marginBottom: '4px' }}>
                    {record.message}
                  </div>
                  <div style={{ color: theme.subtext, fontSize: '11px' }}>
                    {new Date(record.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      <div style={{
        background: theme.cardBg,
        padding: '10px 20px',
        borderTop: `1px solid ${theme.border}`,
        fontSize: '12px',
        color: theme.subtext,
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div>⏱️ 30초마다 자동 체크</div>
        <div>🔔 브라우저 알림 + 사운드 지원</div>
      </div>
    </div>
  );
};

export default StockAlertSystem; 