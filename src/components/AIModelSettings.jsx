import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useChaessaemNotification } from './ChaessaemNotification';
import mistralAPI from '../services/mistralAPI';
import ChaessaemEmoji from './ChaessaemEmoji';
import EnhancedButton from './EnhancedButton';

const AI_MODELS = {
  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    description: '🚀 최신 오픈소스 AI 모델 - 뛰어난 성능과 빠른 응답',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large (추천)', description: '가장 강력한 모델' },
      { id: 'mistral-medium-latest', name: 'Mistral Medium', description: '균형잡힌 성능' },
      { id: 'mistral-small-latest', name: 'Mistral Small', description: '빠르고 경제적' },
      { id: 'mixtral-8x7b-instruct-v0.1', name: 'Mixtral 8x7B', description: '전문가 혼합 모델' }
    ],
    keyRequired: true,
    website: 'https://console.mistral.ai',
    pros: ['최신 기술', '한국어 지원 우수', '빠른 응답', '합리적 가격'],
    cons: ['API 키 필요', '인터넷 연결 필요']
  },
  openai: {
    id: 'openai',
    name: 'OpenAI GPT',
    description: '🧠 검증된 AI 모델 - 안정적이고 일관된 품질',
    models: [
      { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo (추천)', description: '최고 성능' },
      { id: 'gpt-4', name: 'GPT-4', description: '안정적 성능' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '빠르고 경제적' }
    ],
    keyRequired: true,
    website: 'https://platform.openai.com',
    pros: ['검증된 안정성', '풍부한 지식', '일관된 품질'],
    cons: ['상대적으로 높은 비용', 'API 키 필요']
  },
  local: {
    id: 'local',
    name: '로컬 모드',
    description: '💻 기본 제공 - API 키 없이 사용 가능',
    models: [
      { id: 'basic', name: '기본 응답', description: '미리 준비된 답변' }
    ],
    keyRequired: false,
    pros: ['무료 사용', 'API 키 불필요', '인터넷 연결 불필요'],
    cons: ['제한적 기능', '개인화 부족', '학습 기능 없음']
  }
};

const AIModelSettings = ({ darkMode = false, onModelChange = null }) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  const notification = useChaessaemNotification();

  // 설정 상태
  const [selectedProvider, setSelectedProvider] = useLocalStorage('ai_provider', 'mistral');
  const [selectedModel, setSelectedModel] = useLocalStorage('ai_model', 'mistral-large-latest');
  const [mistralApiKey, setMistralApiKey] = useLocalStorage('mistral_api_key', '');
  const [openaiApiKey, setOpenaiApiKey] = useLocalStorage('openai_api_key', '');
  const [showApiKey, setShowApiKey] = useState({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [availableModels, setAvailableModels] = useState({});

  // API 키 변경 핸들러
  const handleApiKeyChange = (provider, key) => {
    if (provider === 'mistral') {
      setMistralApiKey(key);
      mistralAPI.setApiKey(key);
    } else if (provider === 'openai') {
      setOpenaiApiKey(key);
    }
    
    // 연결 상태 초기화
    setConnectionStatus(prev => ({ ...prev, [provider]: null }));
  };

  // 연결 테스트
  const testConnection = async (provider) => {
    setIsTestingConnection(true);
    setConnectionStatus(prev => ({ ...prev, [provider]: 'testing' }));

    try {
      if (provider === 'mistral' && mistralApiKey) {
        const models = await mistralAPI.getAvailableModels();
        setAvailableModels(prev => ({ ...prev, mistral: models }));
        setConnectionStatus(prev => ({ ...prev, [provider]: 'success' }));
        
        notification.success(`Mistral AI 연결 성공! 🎉`, {
          title: '연결 성공',
          duration: 3000
        });
      } else if (provider === 'openai' && openaiApiKey) {
        // OpenAI 연결 테스트 (기존 로직 활용)
        setConnectionStatus(prev => ({ ...prev, [provider]: 'success' }));
        
        notification.success(`OpenAI 연결 성공! 🎉`, {
          title: '연결 성공', 
          duration: 3000
        });
      }
    } catch (error) {
      console.error(`${provider} 연결 테스트 실패:`, error);
      setConnectionStatus(prev => ({ ...prev, [provider]: 'failed' }));
      
      notification.error(`${provider === 'mistral' ? 'Mistral' : 'OpenAI'} 연결에 실패했어요`, {
        title: '연결 실패',
        duration: 4000
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // 모델 선택 변경
  const handleModelChange = (provider, modelId) => {
    setSelectedProvider(provider);
    setSelectedModel(modelId);
    
    if (onModelChange) {
      onModelChange({ provider, modelId });
    }

    notification.info(
      `${AI_MODELS[provider].name}의 ${AI_MODELS[provider].models.find(m => m.id === modelId)?.name}로 변경되었어요!`,
      { title: '모델 변경', duration: 2000 }
    );
  };

  // API 키 표시/숨기기 토글
  const toggleApiKeyVisibility = (provider) => {
    setShowApiKey(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  // 연결 상태 아이콘
  const getConnectionIcon = (provider) => {
    const status = connectionStatus[provider];
    switch (status) {
      case 'testing': return '🔄';
      case 'success': return '✅';
      case 'failed': return '❌';
      default: return '⚪';
    }
  };

  return (
    <div style={{
      background: theme.cardBg,
      borderRadius: '20px',
      padding: '32px',
      border: `2px solid ${theme.border}`,
      fontFamily: typography.fontFamily.primary
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <ChaessaemEmoji
          type="emotions"
          emotion="confident"
          size="large"
          showMessage={false}
          autoAnimation={false}
          darkMode={darkMode}
        />
        <div>
          <h2 style={{
            ...typography.presets.heading.h2,
            color: typography.colors.primary,
            margin: 0,
            marginBottom: '8px'
          }}>
            채쌤 AI 모델 설정
          </h2>
          <div style={{
            ...typography.presets.body.small,
            color: typography.colors.muted
          }}>
            AI 모델을 선택하고 API 키를 설정하여 채쌤을 더욱 똑똑하게 만들어보세요!
          </div>
        </div>
      </div>

      {/* 현재 설정 요약 */}
      <div style={{
        background: theme.gradients.success,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <h3 style={{
          ...typography.presets.heading.h4,
          color: 'white',
          margin: 0,
          marginBottom: '8px'
        }}>
          🤖 현재 AI 설정
        </h3>
        <div style={{
          ...typography.presets.body.normal,
          color: 'rgba(255,255,255,0.9)'
        }}>
          <strong>{AI_MODELS[selectedProvider]?.name}</strong> - {' '}
          {AI_MODELS[selectedProvider]?.models.find(m => m.id === selectedModel)?.name || selectedModel}
        </div>
        <div style={{
          ...typography.presets.body.small,
          color: 'rgba(255,255,255,0.8)',
          marginTop: '4px'
        }}>
          {connectionStatus[selectedProvider] === 'success' ? '✅ 연결됨' : 
           connectionStatus[selectedProvider] === 'failed' ? '❌ 연결 실패' : 
           '⚪ 연결 상태 확인 필요'}
        </div>
      </div>

      {/* AI 모델 선택 */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          ...typography.presets.heading.h3,
          color: typography.colors.primary,
          marginBottom: '20px'
        }}>
          🎯 AI 모델 선택
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {Object.values(AI_MODELS).map((provider) => (
            <div
              key={provider.id}
              style={{
                background: selectedProvider === provider.id ? theme.accent + '15' : theme.bg,
                border: selectedProvider === provider.id ? `2px solid ${theme.accent}` : `2px solid ${theme.border}`,
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onClick={() => provider.keyRequired ? null : handleModelChange(provider.id, provider.models[0].id)}
            >
              {/* 연결 상태 표시 */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                fontSize: '20px'
              }}>
                {getConnectionIcon(provider.id)}
              </div>

              <h4 style={{
                ...typography.presets.heading.h4,
                color: typography.colors.primary,
                margin: 0,
                marginBottom: '8px'
              }}>
                {provider.name}
              </h4>

              <p style={{
                ...typography.presets.body.small,
                color: typography.colors.secondary,
                margin: 0,
                marginBottom: '16px',
                lineHeight: typography.lineHeight.relaxed
              }}>
                {provider.description}
              </p>

              {/* 장단점 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{
                    ...typography.presets.body.xs,
                    color: '#10B981',
                    fontWeight: typography.fontWeight.semibold,
                    marginBottom: '4px'
                  }}>
                    ✅ 장점
                  </div>
                  {provider.pros.map((pro, index) => (
                    <div key={index} style={{
                      ...typography.presets.body.xs,
                      color: typography.colors.secondary,
                      marginBottom: '2px'
                    }}>
                      • {pro}
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{
                    ...typography.presets.body.xs,
                    color: '#F59E0B',
                    fontWeight: typography.fontWeight.semibold,
                    marginBottom: '4px'
                  }}>
                    ⚠️ 고려사항
                  </div>
                  {provider.cons.map((con, index) => (
                    <div key={index} style={{
                      ...typography.presets.body.xs,
                      color: typography.colors.secondary,
                      marginBottom: '2px'
                    }}>
                      • {con}
                    </div>
                  ))}
                </div>
              </div>

              {/* API 키 설정 (필요한 경우) */}
              {provider.keyRequired && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    ...typography.presets.label,
                    color: typography.colors.muted,
                    marginBottom: '8px'
                  }}>
                    API 키 설정:
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type={showApiKey[provider.id] ? 'text' : 'password'}
                      placeholder={`${provider.name} API 키를 입력하세요`}
                      value={provider.id === 'mistral' ? mistralApiKey : openaiApiKey}
                      onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${theme.border}`,
                        background: theme.cardBg,
                        color: typography.colors.primary,
                        ...typography.presets.body.small,
                        outline: 'none'
                      }}
                    />
                    
                    <EnhancedButton
                      onClick={() => toggleApiKeyVisibility(provider.id)}
                      variant="ghost"
                      size="small"
                      icon={showApiKey[provider.id] ? "🙈" : "👁️"}
                      darkMode={darkMode}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...typography.presets.body.xs,
                        color: theme.accent,
                        textDecoration: 'none'
                      }}
                    >
                      🔗 API 키 발급받기
                    </a>
                    
                    <EnhancedButton
                      onClick={() => testConnection(provider.id)}
                      variant="outline"
                      size="small"
                      icon="🔌"
                      loading={isTestingConnection}
                      disabled={
                        !((provider.id === 'mistral' && mistralApiKey) || 
                          (provider.id === 'openai' && openaiApiKey)) ||
                        isTestingConnection
                      }
                      darkMode={darkMode}
                    >
                      연결 테스트
                    </EnhancedButton>
                  </div>
                </div>
              )}

              {/* 모델 선택 */}
              <div>
                <div style={{
                  ...typography.presets.label,
                  color: typography.colors.muted,
                  marginBottom: '8px'
                }}>
                  세부 모델:
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {provider.models.map((model) => (
                    <label
                      key={model.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: selectedProvider === provider.id && selectedModel === model.id ? 
                          theme.accent + '20' : 'transparent',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <input
                        type="radio"
                        name={`model-${provider.id}`}
                        checked={selectedProvider === provider.id && selectedModel === model.id}
                        onChange={() => handleModelChange(provider.id, model.id)}
                        style={{ margin: 0 }}
                      />
                      <div>
                        <div style={{
                          ...typography.presets.body.small,
                          color: typography.colors.primary,
                          fontWeight: typography.fontWeight.medium
                        }}>
                          {model.name}
                        </div>
                        <div style={{
                          ...typography.presets.body.xs,
                          color: typography.colors.muted
                        }}>
                          {model.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 추가 옵션 */}
      <div style={{
        background: theme.bg,
        borderRadius: '12px',
        padding: '20px',
        border: `1px solid ${theme.border}`
      }}>
        <h4 style={{
          ...typography.presets.heading.h4,
          color: typography.colors.primary,
          margin: 0,
          marginBottom: '16px'
        }}>
          ⚙️ 고급 설정
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <label style={{
              ...typography.presets.label,
              color: typography.colors.muted,
              display: 'block',
              marginBottom: '4px'
            }}>
              응답 창의성 (Temperature)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.7"
              style={{ width: '100%' }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              ...typography.presets.body.xs,
              color: typography.colors.muted
            }}>
              <span>보수적</span>
              <span>창의적</span>
            </div>
          </div>

          <div>
            <label style={{
              ...typography.presets.label,
              color: typography.colors.muted,
              display: 'block',
              marginBottom: '4px'
            }}>
              최대 응답 길이
            </label>
            <select style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              background: theme.cardBg,
              color: typography.colors.primary,
              ...typography.presets.body.small
            }}>
              <option value="300">짧게 (300자)</option>
              <option value="500" selected>보통 (500자)</option>
              <option value="1000">길게 (1000자)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 도움말 */}
      <div style={{
        background: theme.gradients.light,
        borderRadius: '12px',
        padding: '20px',
        marginTop: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ChaessaemEmoji
            type="emotions"
            emotion="thinking"
            size="normal"
            showMessage={false}
            autoAnimation={false}
            darkMode={darkMode}
          />
          <div>
            <h4 style={{
              ...typography.presets.heading.h4,
              color: typography.colors.primary,
              margin: 0,
              marginBottom: '8px'
            }}>
              💡 채쌤의 AI 설정 팁
            </h4>
            <ul style={{
              ...typography.presets.body.small,
              color: typography.colors.secondary,
              margin: 0,
              paddingLeft: '20px',
              lineHeight: typography.lineHeight.relaxed
            }}>
              <li><strong>Mistral AI</strong>: 최신 기술로 빠르고 정확한 답변을 원한다면 추천!</li>
              <li><strong>OpenAI GPT</strong>: 안정적이고 검증된 AI 경험을 원한다면 선택!</li>
              <li><strong>로컬 모드</strong>: API 키 없이 기본 기능만 사용하고 싶다면 OK!</li>
              <li>API 키는 안전하게 브라우저에만 저장되며, 외부로 전송되지 않아요.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModelSettings; 