import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ChaessaemCharacter from './ChaessaemCharacter';

// 알림 타입 정의
const NOTIFICATION_TYPES = {
  PRICE: {
    id: 'price',
    name: '가격 알림',
    icon: '💰',
    color: '#FF6B6B',
    description: '목표 가격 도달 시 알림'
  },
  STOP_LOSS: {
    id: 'stop_loss',
    name: '손절 알림',
    icon: '🛑',
    color: '#FF4757',
    description: '손절 기준 도달 시 알림'
  },
  NEWS: {
    id: 'news',
    name: '뉴스 알림',
    icon: '📰',
    color: '#3742FA',
    description: '관심 종목 뉴스 발생 시 알림'
  },
  VOLATILITY: {
    id: 'volatility',
    name: '변동성 알림',
    icon: '📈',
    color: '#2ED573',
    description: '급등/급락 시 알림'
  },
  CHAESSAEM_TIP: {
    id: 'chaessaem_tip',
    name: '채쌤 팁',
    icon: '💡',
    color: '#FF6B9D',
    description: '채쌤의 투자 조언 알림'
  }
};

// 알림음 옵션
const NOTIFICATION_SOUNDS = {
  kakao: { name: '카카오톡', file: '/sounds/kakao.mp3' },
  bell: { name: '벨소리', file: '/sounds/bell.mp3' },
  ding: { name: '딩동', file: '/sounds/ding.mp3' },
  chime: { name: '차임', file: '/sounds/chime.mp3' },
  silent: { name: '무음', file: null }
};

const KakaoStyleNotifications = ({ darkMode = false }) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  
  const [alertSettings, setAlertSettings] = useLocalStorage('kakao_alert_settings', []);
  const [notificationHistory, setNotificationHistory] = useLocalStorage('notification_history', []);
  const [isSettingMode, setIsSettingMode] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'price',
    symbol: '',
    condition: 'above',
    value: '',
    sound: 'kakao',
    enabled: true
  });
  const [activeNotifications, setActiveNotifications] = useState([]);

  // 실시간 알림 체크 (30초마다)
  useEffect(() => {
    const checkAlerts = () => {
      alertSettings.forEach(alert => {
        if (!alert.enabled) return;
        
        // 가상의 주가 데이터 (실제로는 API에서 가져옴)
        const currentPrice = (Math.random() * 100 + 10).toFixed(2);
        const shouldTrigger = checkAlertCondition(alert, currentPrice);
        
        if (shouldTrigger) {
          triggerNotification(alert, currentPrice);
        }
      });
    };

    const interval = setInterval(checkAlerts, 30000);
    return () => clearInterval(interval);
  }, [alertSettings]);

  // 알림 조건 체크
  const checkAlertCondition = (alert, currentPrice) => {
    const price = parseFloat(currentPrice);
    const targetValue = parseFloat(alert.value);

    switch (alert.type) {
      case 'price':
        return alert.condition === 'above' ? price >= targetValue : price <= targetValue;
      case 'stop_loss':
        return price <= targetValue;
      case 'volatility':
        return Math.abs((price - targetValue) / targetValue) >= 0.15; // 15% 변동성
      default:
        return false;
    }
  };

  // 알림 발송
  const triggerNotification = useCallback((alert, currentPrice) => {
    const notification = {
      id: Date.now(),
      type: alert.type,
      symbol: alert.symbol,
      message: generateNotificationMessage(alert, currentPrice),
      timestamp: new Date(),
      read: false
    };

    // 브라우저 알림
    if (Notification.permission === 'granted') {
      new Notification(`채쌤 알림: ${alert.symbol}`, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: alert.symbol
      });
    }

    // 알림음 재생
    if (alert.sound !== 'silent') {
      playNotificationSound(alert.sound);
    }

    // 화면 알림 표시
    setActiveNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // 알림 기록 저장
    setNotificationHistory(prev => [notification, ...prev].slice(0, 100));
    
    // 5초 후 자동 숨김
    setTimeout(() => {
      setActiveNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, [setNotificationHistory]);

  // 알림 메시지 생성
  const generateNotificationMessage = (alert, currentPrice) => {
    const typeData = NOTIFICATION_TYPES[alert.type.toUpperCase()];
    
    switch (alert.type) {
      case 'price':
        return `${alert.symbol}이 목표가 $${alert.value}에 도달했어요! (현재: $${currentPrice})`;
      case 'stop_loss':
        return `${alert.symbol} 손절 기준 도달! 현재 $${currentPrice}`;
      case 'volatility':
        return `${alert.symbol} 급변동 감지! 현재 $${currentPrice}`;
      case 'news':
        return `${alert.symbol} 관련 중요 뉴스가 있어요!`;
      case 'chaessaem_tip':
        return `채쌤의 ${alert.symbol} 투자 팁이 도착했어요!`;
      default:
        return `${alert.symbol} 알림이 도착했어요!`;
    }
  };

  // 알림음 재생
  const playNotificationSound = (soundType) => {
    const sound = NOTIFICATION_SOUNDS[soundType];
    if (sound?.file) {
      const audio = new Audio(sound.file);
      audio.volume = 0.3;
      audio.play().catch(e => console.log('알림음 재생 실패:', e));
    }
  };

  // 알림 추가
  const addAlert = () => {
    if (!newAlert.symbol || !newAlert.value) return;
    
    const alert = {
      ...newAlert,
      id: Date.now(),
      createdAt: new Date()
    };
    
    setAlertSettings(prev => [...prev, alert]);
    setNewAlert({
      type: 'price',
      symbol: '',
      condition: 'above',
      value: '',
      sound: 'kakao',
      enabled: true
    });
  };

  // 알림 삭제
  const deleteAlert = (alertId) => {
    setAlertSettings(prev => prev.filter(alert => alert.id !== alertId));
  };

  // 알림 토글
  const toggleAlert = (alertId) => {
    setAlertSettings(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert
      )
    );
  };

  // 브라우저 알림 권한 요청
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  return (
    <div style={{
      background: theme.colors.surface,
      borderRadius: '16px',
      padding: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.md
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>📱</span>
          <div>
            <h3 style={{
              ...typography.presets.heading.h3,
              color: typography.colors.primary,
              margin: 0
            }}>
              실시간 카톡알람
            </h3>
            <p style={{
              ...typography.presets.body.small,
              color: typography.colors.muted,
              margin: '4px 0 0 0'
            }}>
              종목별 맞춤 알림 설정
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={requestNotificationPermission}
            style={{
              background: theme.colors.warning,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            🔔 권한 설정
          </button>
          
          <button
            onClick={() => setIsSettingMode(!isSettingMode)}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {isSettingMode ? '🏠 메인' : '⚙️ 설정'}
          </button>
        </div>
      </div>

      {/* 활성 알림 표시 */}
      {activeNotifications.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {activeNotifications.map(notification => (
            <div
              key={notification.id}
              style={{
                background: '#FFE066',
                border: '2px solid #FFA500',
                borderRadius: '12px',
                padding: '16px',
                minWidth: '300px',
                maxWidth: '400px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'slideInRight 0.3s ease-out'
              }}
            >
              <ChaessaemCharacter size="small" />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '4px',
                  fontSize: '14px'
                }}>
                  {NOTIFICATION_TYPES[notification.type?.toUpperCase()]?.icon} 채쌤 알림
                </div>
                <div style={{
                  color: '#555',
                  fontSize: '13px',
                  lineHeight: 1.4
                }}>
                  {notification.message}
                </div>
              </div>
              <button
                onClick={() => setActiveNotifications(prev => prev.filter(n => n.id !== notification.id))}
                style={{
                  background: 'rgba(0,0,0,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 설정 모드 */}
      {isSettingMode ? (
        <div>
          {/* 새 알림 추가 */}
          <div style={{
            background: `${theme.colors.accent}10`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: `1px solid ${theme.colors.accent}20`
          }}>
            <h4 style={{
              ...typography.presets.heading.h4,
              color: typography.colors.primary,
              marginBottom: '16px'
            }}>
              ➕ 새 알림 추가
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '16px'
            }}>
              {/* 알림 타입 */}
              <div>
                <label style={{
                  ...typography.presets.body.small,
                  color: typography.colors.muted,
                  marginBottom: '4px',
                  display: 'block'
                }}>
                  알림 타입
                </label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background,
                    color: typography.colors.primary
                  }}
                >
                  {Object.values(NOTIFICATION_TYPES).map(type => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 종목 코드 */}
              <div>
                <label style={{
                  ...typography.presets.body.small,
                  color: typography.colors.muted,
                  marginBottom: '4px',
                  display: 'block'
                }}>
                  종목 코드
                </label>
                <input
                  type="text"
                  placeholder="예: AAPL, TSLA"
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({...newAlert, symbol: e.target.value.toUpperCase()})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background,
                    color: typography.colors.primary
                  }}
                />
              </div>

              {/* 조건 */}
              {newAlert.type === 'price' && (
                <div>
                  <label style={{
                    ...typography.presets.body.small,
                    color: typography.colors.muted,
                    marginBottom: '4px',
                    display: 'block'
                  }}>
                    조건
                  </label>
                  <select
                    value={newAlert.condition}
                    onChange={(e) => setNewAlert({...newAlert, condition: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.border}`,
                      background: theme.colors.background,
                      color: typography.colors.primary
                    }}
                  >
                    <option value="above">이상</option>
                    <option value="below">이하</option>
                  </select>
                </div>
              )}

              {/* 목표값 */}
              <div>
                <label style={{
                  ...typography.presets.body.small,
                  color: typography.colors.muted,
                  marginBottom: '4px',
                  display: 'block'
                }}>
                  목표값 ($)
                </label>
                <input
                  type="number"
                  placeholder="100.00"
                  step="0.01"
                  value={newAlert.value}
                  onChange={(e) => setNewAlert({...newAlert, value: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background,
                    color: typography.colors.primary
                  }}
                />
              </div>

              {/* 알림음 */}
              <div>
                <label style={{
                  ...typography.presets.body.small,
                  color: typography.colors.muted,
                  marginBottom: '4px',
                  display: 'block'
                }}>
                  알림음
                </label>
                <select
                  value={newAlert.sound}
                  onChange={(e) => setNewAlert({...newAlert, sound: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background,
                    color: typography.colors.primary
                  }}
                >
                  {Object.entries(NOTIFICATION_SOUNDS).map(([key, sound]) => (
                    <option key={key} value={key}>
                      {sound.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={addAlert}
              disabled={!newAlert.symbol || !newAlert.value}
              style={{
                background: !newAlert.symbol || !newAlert.value 
                  ? theme.colors.muted 
                  : `linear-gradient(135deg, ${theme.colors.positive}, ${theme.colors.accent})`,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: !newAlert.symbol || !newAlert.value ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                width: '100%'
              }}
            >
              ➕ 알림 추가
            </button>
          </div>

          {/* 기존 알림 목록 */}
          <div>
            <h4 style={{
              ...typography.presets.heading.h4,
              color: typography.colors.primary,
              marginBottom: '16px'
            }}>
              📋 설정된 알림 ({alertSettings.length}개)
            </h4>
            
            {alertSettings.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: `${theme.colors.muted}10`,
                borderRadius: '12px',
                border: `1px dashed ${theme.colors.muted}`
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
                <p style={{
                  ...typography.presets.body.normal,
                  color: typography.colors.muted
                }}>
                  설정된 알림이 없습니다.<br/>
                  위에서 새 알림을 추가해보세요!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alertSettings.map(alert => (
                  <div
                    key={alert.id}
                    style={{
                      background: alert.enabled ? theme.colors.background : `${theme.colors.muted}20`,
                      border: `1px solid ${alert.enabled ? theme.colors.border : theme.colors.muted}`,
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>
                        {NOTIFICATION_TYPES[alert.type?.toUpperCase()]?.icon}
                      </span>
                      <div>
                        <div style={{
                          ...typography.presets.body.normal,
                          color: typography.colors.primary,
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          {alert.symbol} - {NOTIFICATION_TYPES[alert.type?.toUpperCase()]?.name}
                        </div>
                        <div style={{
                          ...typography.presets.body.small,
                          color: typography.colors.muted
                        }}>
                          ${alert.value} {alert.condition === 'above' ? '이상' : '이하'} | {NOTIFICATION_SOUNDS[alert.sound]?.name}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => toggleAlert(alert.id)}
                        style={{
                          background: alert.enabled ? theme.colors.positive : theme.colors.muted,
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        {alert.enabled ? '🔔 ON' : '🔕 OFF'}
                      </button>
                      
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        style={{
                          background: theme.colors.negative,
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 대시보드 모드 */
        <div>
          {/* 통계 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: `${theme.colors.positive}15`,
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: `1px solid ${theme.colors.positive}20`
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📢</div>
              <div style={{
                ...typography.presets.body.large,
                color: theme.colors.positive,
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {alertSettings.filter(a => a.enabled).length}
              </div>
              <div style={{
                ...typography.presets.caption,
                color: typography.colors.muted
              }}>
                활성 알림
              </div>
            </div>

            <div style={{
              background: `${theme.colors.accent}15`,
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: `1px solid ${theme.colors.accent}20`
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📱</div>
              <div style={{
                ...typography.presets.body.large,
                color: theme.colors.accent,
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {notificationHistory.length}
              </div>
              <div style={{
                ...typography.presets.caption,
                color: typography.colors.muted
              }}>
                총 알림 수
              </div>
            </div>

            <div style={{
              background: `${theme.colors.warning}15`,
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              border: `1px solid ${theme.colors.warning}20`
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏰</div>
              <div style={{
                ...typography.presets.body.large,
                color: theme.colors.warning,
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {notificationHistory.filter(n => {
                  const today = new Date().toDateString();
                  return new Date(n.timestamp).toDateString() === today;
                }).length}
              </div>
              <div style={{
                ...typography.presets.caption,
                color: typography.colors.muted
              }}>
                오늘 알림
              </div>
            </div>
          </div>

          {/* 최근 알림 기록 */}
          <div>
            <h4 style={{
              ...typography.presets.heading.h4,
              color: typography.colors.primary,
              marginBottom: '16px'
            }}>
              📝 최근 알림 기록
            </h4>
            
            {notificationHistory.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: `${theme.colors.muted}10`,
                borderRadius: '12px',
                border: `1px dashed ${theme.colors.muted}`
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                <p style={{
                  ...typography.presets.body.normal,
                  color: typography.colors.muted
                }}>
                  아직 받은 알림이 없습니다.<br/>
                  알림을 설정하고 기다려보세요!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notificationHistory.slice(0, 5).map(notification => (
                  <div
                    key={notification.id}
                    style={{
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '16px' }}>
                        {NOTIFICATION_TYPES[notification.type?.toUpperCase()]?.icon}
                      </span>
                      <div>
                        <div style={{
                          ...typography.presets.body.normal,
                          color: typography.colors.primary,
                          marginBottom: '2px'
                        }}>
                          {notification.message}
                        </div>
                        <div style={{
                          ...typography.presets.caption,
                          color: typography.colors.muted
                        }}>
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <span style={{
                      background: NOTIFICATION_TYPES[notification.type?.toUpperCase()]?.color || theme.colors.muted,
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      {notification.symbol}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default KakaoStyleNotifications; 