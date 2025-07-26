import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useChaessaemNotification } from './ChaessaemNotification';
import mistralAPI, { CHAESSAEM_PROMPTS } from '../services/mistralAPI';
import ChaessaemEmoji from './ChaessaemEmoji';
import EnhancedButton from './EnhancedButton';

const EnhancedChaessaemAI = ({ 
  darkMode = false, 
  userProfile = {},
  currentContext = '',
  onResponse = null 
}) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  const notification = useChaessaemNotification();
  
  // State 관리
  const [messages, setMessages] = useLocalStorage('chaessaem_chat_history', []);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [selectedModel, setSelectedModel] = useLocalStorage('chaessaem_ai_model', 'mistral');
  const [mistralApiKey, setMistralApiKey] = useLocalStorage('mistral_api_key', '');
  const [availableModels, setAvailableModels] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamingRef = useRef('');

  // 사용자 표시 이름
  const getUserName = () => {
    const { name, nickname } = userProfile;
    if (!name && !nickname) return '';
    if (name && !nickname) return name + '님';
    if (!name && nickname) return nickname;
    return Math.random() > 0.5 ? nickname : name + '님';
  };

  // 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Mistral API 키 설정
  useEffect(() => {
    if (mistralApiKey) {
      mistralAPI.setApiKey(mistralApiKey);
    }
  }, [mistralApiKey]);

  // 사용 가능한 모델 로드
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await mistralAPI.getAvailableModels();
        setAvailableModels(models);
      } catch (error) {
        console.warn('모델 목록 로드 실패:', error);
      }
    };

    if (mistralApiKey) {
      loadModels();
    }
  }, [mistralApiKey]);

  // 메시지 전송
  const sendMessage = useCallback(async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
      userName: getUserName()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      let aiResponse = '';
      
      if (selectedModel === 'mistral' && mistralApiKey) {
        // Mistral AI 사용
        aiResponse = await handleMistralResponse(messageText);
      } else {
        // OpenAI 폴백 또는 로컬 응답
        aiResponse = await handleFallbackResponse(messageText);
      }

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        model: selectedModel,
        streamComplete: true
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (onResponse) {
        onResponse(aiResponse);
      }

    } catch (error) {
      console.error('메시지 전송 실패:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `죄송해요, ${getUserName()}! 지금 채쌤이 잠깐 바쁜 것 같아요. 조금 후에 다시 말걸어주세요! 😅`,
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      
      notification.error('채쌤과의 대화 중 오류가 발생했어요', {
        title: '연결 오류',
        duration: 3000
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setStreamingMessage('');
      streamingRef.current = '';
    }
  }, [inputMessage, isLoading, selectedModel, mistralApiKey, userProfile, currentContext]);

  // Mistral AI 응답 처리
  const handleMistralResponse = async (messageText) => {
    const systemMessage = {
      role: 'system',
      content: CHAESSAEM_PROMPTS.systemPrompt
    };

    const contextMessage = currentContext ? {
      role: 'system',
      content: CHAESSAEM_PROMPTS.investmentAdvice(userProfile, currentContext)
    } : null;

    const conversationHistory = messages.slice(-6).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const messagesForAI = [
      systemMessage,
      ...(contextMessage ? [contextMessage] : []),
      ...conversationHistory,
      { role: 'user', content: messageText }
    ];

    if (isStreaming) {
      return await handleStreamingResponse(messagesForAI);
    } else {
      return await mistralAPI.chatCompletion(messagesForAI, {
        temperature: 0.7,
        maxTokens: 500
      });
    }
  };

  // 스트리밍 응답 처리
  const handleStreamingResponse = async (messages) => {
    setStreamingMessage('');
    streamingRef.current = '';

    return new Promise((resolve, reject) => {
      mistralAPI.streamChatCompletion(
        messages,
        (chunk) => {
          streamingRef.current += chunk;
          setStreamingMessage(streamingRef.current);
        },
        { temperature: 0.7, maxTokens: 500 }
      ).then(() => {
        resolve(streamingRef.current);
      }).catch(reject);
    });
  };

  // 폴백 응답 처리
  const handleFallbackResponse = async (messageText) => {
    // OpenAI API 또는 로컬 응답 로직
    const responses = [
      `${getUserName()}! 지금은 채쌤이 오프라인 모드예요. Mistral AI 키를 설정하시면 더 스마트한 대화가 가능해요! 🤖`,
      `안녕하세요 ${getUserName()}! 궁금한 것이 있으시면 언제든 물어보세요. 투자에 관한 모든 것을 도와드릴게요! 📈`,
      `${getUserName()}님의 메시지를 잘 들었어요! 지금은 간단한 답변만 가능하지만, AI 모델을 연결하시면 훨씬 더 도움이 될 거예요! ✨`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // 키보드 이벤트 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 채팅 초기화
  const clearChat = () => {
    setMessages([]);
    notification.info('채팅 기록이 초기화되었어요!', {
      title: '채팅 초기화',
      duration: 2000
    });
  };

  // 빠른 질문 버튼들
  const quickQuestions = [
    '오늘 시장 상황은 어때요?',
    '지금 매수하기 좋은 종목이 있을까요?',
    '제 포트폴리오를 점검해주세요',
    '투자 전략을 추천해주세요',
    '감정적으로 매매하지 않는 방법은?'
  ];

  return (
    <div style={{
      background: theme.cardBg,
      borderRadius: '20px',
      overflow: 'hidden',
      border: `2px solid ${theme.border}`,
      height: '600px',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: typography.fontFamily.primary
    }}>
      {/* 헤더 */}
      <div style={{
        background: theme.gradients.ocean,
        padding: '20px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ChaessaemEmoji
            type="emotions"
            emotion={isLoading ? 'thinking' : 'confident'}
            size="normal"
            showMessage={false}
            autoAnimation={isLoading}
            darkMode={false}
          />
          <div>
            <h3 style={{
              ...typography.presets.heading.h3,
              color: 'white',
              margin: 0,
              marginBottom: '4px'
            }}>
              채쌤 AI Assistant
            </h3>
            <div style={{
              ...typography.presets.body.small,
              color: 'rgba(255,255,255,0.8)'
            }}>
              {selectedModel === 'mistral' && mistralApiKey ? 
                `🤖 Mistral AI 연결됨` : 
                '💬 기본 모드'
              }
              {isTyping && ' • 타이핑 중...'}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <EnhancedButton
            onClick={clearChat}
            variant="ghost"
            size="small"
            icon="🗑️"
            style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            초기화
          </EnhancedButton>
        </div>
      </div>

      {/* AI 설정 패널 */}
      {!mistralApiKey && (
        <div style={{
          background: theme.gradients.warning,
          padding: '16px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            ...typography.presets.body.small,
            marginBottom: '12px'
          }}>
            🚀 Mistral AI로 더 스마트한 채쌤과 대화하세요!
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <input
              type="password"
              placeholder="Mistral API 키 입력..."
              value={mistralApiKey}
              onChange={(e) => setMistralApiKey(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'rgba(255,255,255,0.9)',
                ...typography.presets.body.small,
                flex: 1,
                maxWidth: '300px'
              }}
            />
            <EnhancedButton
              onClick={() => notification.info('Mistral API 키가 설정되었어요!', { duration: 2000 })}
              variant="secondary"
              size="small"
              disabled={!mistralApiKey}
            >
              연결
            </EnhancedButton>
          </div>
        </div>
      )}

      {/* 메시지 영역 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: typography.colors.muted
          }}>
            <ChaessaemEmoji
              type="emotions"
              emotion="happy"
              size="large"
              showMessage={false}
              autoAnimation={false}
              darkMode={darkMode}
            />
            <div style={{
              ...typography.presets.body.large,
              marginTop: '16px',
              marginBottom: '8px'
            }}>
              안녕하세요 {getUserName()}! 👋
            </div>
            <div style={{
              ...typography.presets.body.normal,
              color: typography.colors.secondary
            }}>
              투자에 관한 궁금한 점이 있으시면 언제든 물어보세요!
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            {message.role === 'assistant' && (
              <ChaessaemEmoji
                type="emotions"
                emotion={message.isError ? 'worried' : 'confident'}
                size="small"
                showMessage={false}
                autoAnimation={false}
                darkMode={darkMode}
              />
            )}
            
            <div style={{
              background: message.role === 'user' ? theme.accent : theme.bg,
              color: message.role === 'user' ? 'white' : typography.colors.primary,
              padding: '12px 16px',
              borderRadius: '16px',
              maxWidth: '70%',
              ...typography.presets.body.normal,
              lineHeight: typography.lineHeight.relaxed,
              wordBreak: 'break-word'
            }}>
              {message.content}
              <div style={{
                ...typography.presets.body.xs,
                opacity: 0.7,
                marginTop: '4px',
                textAlign: message.role === 'user' ? 'right' : 'left'
              }}>
                {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {message.model && ` • ${message.model}`}
              </div>
            </div>
          </div>
        ))}

        {/* 스트리밍 메시지 */}
        {streamingMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <ChaessaemEmoji
              type="emotions"
              emotion="thinking"
              size="small"
              showMessage={false}
              autoAnimation={true}
              darkMode={darkMode}
            />
            <div style={{
              background: theme.bg,
              color: typography.colors.primary,
              padding: '12px 16px',
              borderRadius: '16px',
              maxWidth: '70%',
              ...typography.presets.body.normal,
              lineHeight: typography.lineHeight.relaxed,
              position: 'relative'
            }}>
              {streamingMessage}
              <div style={{
                ...typography.presets.body.xs,
                opacity: 0.7,
                marginTop: '4px'
              }}>
                실시간 응답 중...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 빠른 질문 버튼들 */}
      {messages.length === 0 && (
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${theme.border}`,
          background: theme.bg
        }}>
          <div style={{
            ...typography.presets.body.small,
            color: typography.colors.muted,
            marginBottom: '12px'
          }}>
            💡 빠른 질문:
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => sendMessage(question)}
                disabled={isLoading}
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '20px',
                  padding: '6px 12px',
                  ...typography.presets.body.xs,
                  color: typography.colors.secondary,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isLoading ? 0.5 : 1
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div style={{
        padding: '20px',
        borderTop: `1px solid ${theme.border}`,
        background: theme.bg
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`${getUserName()}! 궁금한 점을 물어보세요...`}
            disabled={isLoading}
            style={{
              flex: 1,
              minHeight: '44px',
              maxHeight: '120px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: `2px solid ${theme.border}`,
              background: theme.cardBg,
              color: typography.colors.primary,
              ...typography.presets.body.normal,
              resize: 'none',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
          
          <EnhancedButton
            onClick={() => sendMessage()}
            variant="primary"
            size="normal"
            icon={isLoading ? "⏳" : "📤"}
            disabled={!inputMessage.trim() || isLoading}
            loading={isLoading}
            darkMode={darkMode}
          >
            전송
          </EnhancedButton>
        </div>
        
        {/* 하단 옵션 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              ...typography.presets.body.xs,
              color: typography.colors.muted,
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={isStreaming}
                onChange={(e) => setIsStreaming(e.target.checked)}
                style={{ margin: 0 }}
              />
              실시간 응답
            </label>
          </div>
          
          <div style={{
            ...typography.presets.body.xs,
            color: typography.colors.muted
          }}>
            Enter로 전송 • Shift+Enter로 줄바꿈
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChaessaemAI; 