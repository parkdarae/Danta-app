import React, { useState, useRef, useEffect } from 'react';

// OpenAI API 호출 함수
const callChatGPT = async (message, stock) => {
  // 실제 배포 시에는 환경변수로 API 키를 관리해야 합니다
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  
  if (!API_KEY) {
    // API 키가 없을 때 샘플 응답
    return getSampleResponse(message, stock);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `당신은 친근하고 귀여운 주식 투자 도우미 AI입니다. ${stock} 종목에 대해 전문적이면서도 이해하기 쉽게 설명해주세요. 이모지를 적절히 사용하고, 따뜻하고 친근한 말투로 대화해주세요. 투자 조언은 참고용이며 최종 결정은 사용자가 내려야 한다는 점을 강조해주세요.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('ChatGPT API 호출 실패:', error);
    return getSampleResponse(message, stock);
  }
};

// 샘플 응답 함수
const getSampleResponse = (message, stock) => {
  // 기술 지표 질문 감지
  if (message.includes('RSI')) {
    return `RSI는 주식의 "온도계" 같은 거예요! 🌡️\n\n📊 **중고등학생도 이해하는 RSI:**\nRSI는 0~100 사이의 숫자로 나타나요. 마치 시험 점수처럼요!\n\n• 70점 이상 → "너무 뜨거워!" 🔥 (과매수, 조정 가능성)\n• 30점 이하 → "너무 차가워!" 🧊 (과매도, 반등 가능성)\n• 30~70점 → "적당해!" 😊 (정상 범위)\n\n⚠️ **주의사항:** RSI만 보고 투자하면 안 돼요! 다른 지표들과 함께 보세요! 📈`;
  }
  
  if (message.includes('이동평균선')) {
    return `이동평균선은 주식 가격의 "평균 점수"를 선으로 그은 거예요! 📈\n\n📚 **쉬운 설명:**\n친구들과 시험 점수를 평균 내듯이, 주식 가격도 최근 몇 일간의 평균을 내서 선으로 그어요!\n\n• 주가가 이동평균선 **위에** 있으면 → 상승 추세! 📈\n• 주가가 이동평균선 **아래에** 있으면 → 하락 추세! 📉\n\n🎯 **활용 팁:**\n- 5일, 20일, 60일 이동평균선을 함께 보세요!\n- 단기선이 장기선을 뚫고 올라가면 골든크로스! ✨`;
  }
  
  if (message.includes('볼린저 밴드')) {
    return `볼린저 밴드는 주식 가격의 "운동장 경계선" 같은 거예요! 🏟️\n\n🎯 **쉬운 이해:**\n주식이 뛰어놀 수 있는 운동장에 울타리를 친 것 같아요!\n\n• **상단선**: 여기까지 올라가면 "너무 비싸!" 😱\n• **하단선**: 여기까지 떨어지면 "너무 싸!" 😍\n• **중간선**: 평균 가격선 (이동평균선) 📊\n\n🌟 **매매 신호:**\n- 주가가 상단선에 닿으면 → 매도 고려 💰\n- 주가가 하단선에 닿으면 → 매수 고려 🛒\n\n⚠️ 하지만 100% 정확하지 않으니 다른 지표도 함께 보세요!`;
  }
  
  if (message.includes('MACD')) {
    return `MACD는 주식의 "변화 감지기" 같은 거예요! 🎢\n\n🚀 **롤러코스터 비유:**\nMACD는 롤러코스터가 언제 올라가고 내려갈지 미리 알려주는 신호등 같아요!\n\n📊 **구성 요소:**\n• **MACD선**: 빠른 변화를 보여주는 선\n• **신호선**: 조금 느린 변화를 보여주는 선\n• **히스토그램**: 두 선의 차이를 막대로 표시\n\n⚡ **매매 신호:**\n- MACD선이 신호선을 **위로** 뚫으면 → 매수 신호! 📈\n- MACD선이 신호선을 **아래로** 뚫으면 → 매도 신호! 📉\n\n🎯 초보자는 히스토그램 색깔만 봐도 돼요! 초록색이면 상승, 빨간색이면 하락 신호!`;
  }

  const responses = [
    `안녕하세요! 😊 ${stock}에 대해 궁금하신 점이 있으신가요? 제가 중고등학생도 이해할 수 있게 쉽게 설명해드릴게요! ✨`,
    `${stock}는 정말 흥미로운 종목이에요! 📈 기술 지표부터 투자 기초까지 무엇이든 물어보세요! 🤔`,
    `투자할 때는 항상 신중하게 결정하는 것이 중요해요! 💡 기술 지표 사용법도 알려드릴 수 있어요! 📊`,
    `와! 좋은 질문이에요! 🤩 RSI, 이동평균선, MACD 같은 지표들 궁금하시면 언제든 물어보세요! 하지만 최종 투자 결정은 꼭 본인이 내리시길 바라요! 💪`,
    `${stock} 투자를 고려 중이시군요! 🚀 기술 지표 보는 법도 함께 알려드릴게요! 리스크 관리도 함께 생각해보시는 것이 좋을 것 같아요! 🛡️`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

function AIChatSection({ stock, onAIAnswer, darkMode = false }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const bg = darkMode ? '#23272b' : '#fff';
  const border = darkMode ? '#333' : '#eee';
  const text = darkMode ? '#e0e0e0' : '#222';
  const subtext = darkMode ? '#aaa' : '#888';
  const accent = '#8884d8';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      const aiResponse = await callChatGPT(input, stock);
      
      const aiMessage = {
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // 부모 컴포넌트에 AI 답변 전달
      if (onAIAnswer) {
        onAIAnswer({
          time: new Date().toLocaleString(),
          stock: stock,
          question: input,
          answer: aiResponse
        });
      }
    } catch (error) {
      const errorMessage = {
        type: 'ai',
        content: '죄송해요! 지금 답변하기 어려운 상황이에요. 😅 잠시 후에 다시 시도해주세요!',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    `${stock} 투자 전망이 어떤가요?`,
    `${stock} 주가 분석해주세요`,
    `RSI 지표가 뭔가요? 쉽게 설명해주세요`,
    `이동평균선은 어떻게 보나요?`,
    `${stock} 리스크는 무엇인가요?`,
    `볼린저 밴드 사용법 알려주세요`,
    `MACD 지표 보는 방법이 궁금해요`,
    `지금 ${stock} 사도 될까요?`
  ];

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '20px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 귀여운 배경 장식 */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '60px',
        height: '60px',
        background: 'linear-gradient(45deg, #74b9ff, #0984e3)',
        borderRadius: '50%',
        opacity: 0.1
      }} />

      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1.5rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          fontSize: '2rem',
          marginRight: '1rem',
          animation: 'bounce 2s infinite'
        }}>🤖</div>
        <div>
          <h3 style={{
            margin: 0,
            color: accent,
            fontSize: '1.4rem',
            fontWeight: '800',
            background: `linear-gradient(45deg, ${accent}, #74b9ff)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            AI 투자 도우미 💝
          </h3>
          <p style={{
            margin: '0.25rem 0 0 0',
            color: subtext,
            fontSize: '0.9rem',
            fontStyle: 'italic'
          }}>
            {stock}에 대해 궁금한 것을 물어보세요! ✨
          </p>
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div style={{
        height: '300px',
        overflowY: 'auto',
        marginBottom: '1rem',
        padding: '1rem',
        background: darkMode ? '#1a1a1a' : '#f8f9fa',
        borderRadius: '16px',
        border: `2px solid ${border}`
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: subtext,
            padding: '2rem',
            lineHeight: '1.6'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              안녕하세요! 반가워요! 😊
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              {stock}에 대해 궁금한 것이 있으면 언제든 물어보세요!<br/>
              투자 분석부터 시장 동향까지 도와드릴게요! 🚀
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '1rem'
              }}
            >
              <div style={{
                maxWidth: '80%',
                padding: '0.8rem 1rem',
                borderRadius: '16px',
                background: message.type === 'user' 
                  ? `linear-gradient(135deg, ${accent}, #74b9ff)`
                  : (darkMode ? '#2a2a2a' : '#ffffff'),
                color: message.type === 'user' ? '#fff' : text,
                border: message.type === 'ai' ? `2px solid ${border}` : 'none',
                boxShadow: message.type === 'user' 
                  ? '0 4px 12px rgba(116, 185, 255, 0.3)'
                  : (darkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)'),
                position: 'relative'
              }}>
                {message.type === 'ai' && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '-8px',
                    fontSize: '1rem'
                  }}>🤖</div>
                )}
                <div style={{ 
                  fontSize: '0.95rem', 
                  lineHeight: '1.5',
                  marginLeft: message.type === 'ai' ? '1rem' : '0'
                }}>
                  {message.content}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  opacity: 0.7,
                  marginTop: '0.5rem',
                  textAlign: message.type === 'user' ? 'right' : 'left',
                  marginLeft: message.type === 'ai' ? '1rem' : '0'
                }}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '1rem'
          }}>
            <div style={{
              padding: '0.8rem 1rem',
              borderRadius: '16px',
              background: darkMode ? '#2a2a2a' : '#ffffff',
              border: `2px solid ${border}`,
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '-8px',
                fontSize: '1rem'
              }}>🤖</div>
              <div style={{ 
                marginLeft: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: subtext
              }}>
                <div style={{
                  display: 'flex',
                  gap: '2px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: accent,
                    animation: 'bounce 1.4s infinite 0s'
                  }} />
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: accent,
                    animation: 'bounce 1.4s infinite 0.2s'
                  }} />
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: accent,
                    animation: 'bounce 1.4s infinite 0.4s'
                  }} />
                </div>
                생각 중이에요...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 빠른 질문 버튼들 */}
      {messages.length === 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: text,
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            💡 빠른 질문
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.5rem'
          }}>
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                style={{
                  background: darkMode ? '#2a2a2a' : '#f8f9fa',
                  border: `2px solid ${border}`,
                  borderRadius: '12px',
                  padding: '0.6rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  color: text,
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = accent;
                  e.target.style.background = darkMode ? accent + '22' : accent + '11';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = border;
                  e.target.style.background = darkMode ? '#2a2a2a' : '#f8f9fa';
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
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'flex-end'
      }}>
        <div style={{ flex: 1 }}>
          <textarea
          value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`${stock}에 대해 궁금한 것을 물어보세요... 🤔`}
          disabled={loading}
            style={{
              width: '100%',
              minHeight: '50px',
              maxHeight: '120px',
              padding: '0.8rem',
              border: `2px solid ${border}`,
              borderRadius: '16px',
              background: darkMode ? '#2a2a2a' : '#fff',
              color: text,
              fontSize: '0.95rem',
              resize: 'vertical',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = accent;
              e.target.style.boxShadow = `0 0 0 3px ${accent}22`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{
            background: input.trim() && !loading 
              ? `linear-gradient(135deg, ${accent}, #74b9ff)`
              : (darkMode ? '#333' : '#eee'),
            color: input.trim() && !loading ? '#fff' : subtext,
            border: 'none',
            borderRadius: '16px',
            padding: '0.8rem 1.2rem',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            fontSize: '1rem',
            fontWeight: '700',
            transition: 'all 0.2s',
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: input.trim() && !loading 
              ? '0 4px 12px rgba(116, 185, 255, 0.3)' 
              : 'none'
          }}
          onMouseEnter={(e) => {
            if (input.trim() && !loading) {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 16px rgba(116, 185, 255, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = input.trim() && !loading 
              ? '0 4px 12px rgba(116, 185, 255, 0.3)' 
              : 'none';
          }}
        >
          {loading ? '🤔' : '📤'} {loading ? '생각중' : '전송'}
        </button>
      </div>

      {/* 안내 메시지 */}
      <div style={{
        marginTop: '1rem',
        padding: '0.8rem',
        background: darkMode ? '#1a1a1a' : '#fff5f5',
        borderRadius: '12px',
        border: `2px solid ${darkMode ? '#333' : '#ffeaa7'}`,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.8rem', color: subtext, lineHeight: '1.4' }}>
          💡 <strong>참고:</strong> AI의 답변은 참고용이며, 투자 결정은 신중하게 하시기 바랍니다! 📊
        </div>
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-8px); }
            60% { transform: translateY(-4px); }
          }
        `}
      </style>
    </div>
  );
}

export default AIChatSection; 