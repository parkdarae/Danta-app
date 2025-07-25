import React, { useState } from 'react';

const emotions = [
  // 기존 32개
  { key: 'happy', emoji: '😊', label: '기쁨', color: '#27ae60' },
  { key: 'excited', emoji: '🤩', label: '흥분', color: '#f39c12' },
  { key: 'love', emoji: '😍', label: '사랑', color: '#e91e63' },
  { key: 'laughing', emoji: '😂', label: '웃음', color: '#ff9800' },
  { key: 'wink', emoji: '😉', label: '윙크', color: '#9c27b0' },
  { key: 'kiss', emoji: '😘', label: '키스', color: '#e74c3c' },
  { key: 'cool', emoji: '😎', label: '쿨함', color: '#3498db' },
  { key: 'angel', emoji: '😇', label: '천사', color: '#f1c40f' },
  
  { key: 'neutral', emoji: '😐', label: '중립', color: '#95a5a6' },
  { key: 'thinking', emoji: '🤔', label: '생각', color: '#34495e' },
  { key: 'confused', emoji: '😕', label: '혼란', color: '#7f8c8d' },
  { key: 'surprised', emoji: '😲', label: '놀람', color: '#f39c12' },
  { key: 'shock', emoji: '😱', label: '충격', color: '#e74c3c' },
  { key: 'dizzy', emoji: '😵', label: '어지러움', color: '#9b59b6' },
  { key: 'sleepy', emoji: '😴', label: '졸림', color: '#3498db' },
  { key: 'yawn', emoji: '😪', label: '하품', color: '#95a5a6' },
  
  { key: 'worried', emoji: '😰', label: '걱정', color: '#e74c3c' },
  { key: 'sad', emoji: '😢', label: '슬픔', color: '#3498db' },
  { key: 'crying', emoji: '😭', label: '울음', color: '#2980b9' },
  { key: 'disappointed', emoji: '😞', label: '실망', color: '#8e44ad' },
  { key: 'tired', emoji: '😫', label: '피곤', color: '#7f8c8d' },
  { key: 'sick', emoji: '🤒', label: '아픔', color: '#e67e22' },
  { key: 'nervous', emoji: '😅', label: '긴장', color: '#f39c12' },
  { key: 'sweating', emoji: '😓', label: '식은땀', color: '#3498db' },
  
  { key: 'angry', emoji: '😠', label: '화남', color: '#e74c3c' },
  { key: 'rage', emoji: '🤬', label: '분노', color: '#c0392b' },
  { key: 'annoyed', emoji: '😤', label: '짜증', color: '#e67e22' },
  { key: 'grumpy', emoji: '😒', label: '시무룩', color: '#95a5a6' },
  { key: 'money_face', emoji: '🤑', label: '돈', color: '#27ae60' },
  { key: 'party', emoji: '🥳', label: '파티', color: '#9c27b0' },
  { key: 'rocket', emoji: '🚀', label: '로켓', color: '#3498db' },
  { key: 'fire', emoji: '🔥', label: '불타는', color: '#e74c3c' },

  // 새로 추가하는 32개
  { key: 'melting', emoji: '🫠', label: '녹아내림', color: '#ff6b6b' },
  { key: 'nerd', emoji: '🤓', label: '똑똑함', color: '#74b9ff' },
  { key: 'sunglasses_cool', emoji: '😎', label: '선글라스', color: '#2d3436' },
  { key: 'glasses', emoji: '👓', label: '안경', color: '#6c5ce7' },
  { key: 'rose', emoji: '🌹', label: '장미', color: '#fd79a8' },
  { key: 'gift', emoji: '🎁', label: '선물', color: '#e84393' },
  { key: 'gift_box', emoji: '📦', label: '선물박스', color: '#a29bfe' },
  { key: 'computer', emoji: '💻', label: '컴퓨터', color: '#00b894' },
  
  { key: 'chart_up', emoji: '📈', label: '상승그래프', color: '#00b894' },
  { key: 'chart_down', emoji: '📉', label: '하락그래프', color: '#e17055' },
  { key: 'chart', emoji: '📊', label: '막대그래프', color: '#0984e3' },
  { key: 'money_bag', emoji: '💰', label: '돈주머니', color: '#00b894' },
  { key: 'dollar', emoji: '💵', label: '달러', color: '#00b894' },
  { key: 'yen', emoji: '💴', label: '엔화', color: '#fdcb6e' },
  { key: 'euro', emoji: '💶', label: '유로', color: '#6c5ce7' },
  { key: 'pound', emoji: '💷', label: '파운드', color: '#fd79a8' },
  
  { key: 'diamond', emoji: '💎', label: '다이아몬드', color: '#74b9ff' },
  { key: 'gem', emoji: '💍', label: '보석반지', color: '#fd79a8' },
  { key: 'crown', emoji: '👑', label: '왕관', color: '#fdcb6e' },
  { key: 'trophy', emoji: '🏆', label: '트로피', color: '#fdcb6e' },
  { key: 'medal', emoji: '🥇', label: '금메달', color: '#fdcb6e' },
  { key: 'target', emoji: '🎯', label: '타겟', color: '#e17055' },
  { key: 'bullseye', emoji: '🎪', label: '정확한', color: '#e84393' },
  { key: 'lightning', emoji: '⚡', label: '번개', color: '#fdcb6e' },
  
  { key: 'star', emoji: '⭐', label: '별', color: '#fdcb6e' },
  { key: 'sparkle', emoji: '✨', label: '반짝임', color: '#ffeaa7' },
  { key: 'rainbow', emoji: '🌈', label: '무지개', color: '#fd79a8' },
  { key: 'unicorn', emoji: '🦄', label: '유니콘', color: '#fd79a8' },
  { key: 'phoenix', emoji: '🔥', label: '불사조', color: '#e17055' },
  { key: 'butterfly', emoji: '🦋', label: '나비', color: '#a29bfe' },
  { key: 'flower', emoji: '🌸', label: '벚꽃', color: '#fd79a8' },
  { key: 'four_leaf', emoji: '🍀', label: '네잎클로버', color: '#00b894' }
];

function EmotionButtons({ onSelect, darkMode = false }) {
  const [showAll, setShowAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  const bg = darkMode ? '#23272b' : '#fff';
  const border = darkMode ? '#333' : '#eee';
  const text = darkMode ? '#e0e0e0' : '#222';
  const accent = '#8884d8';

  const categories = {
    'ALL': '전체',
    'POSITIVE': '긍정적',
    'NEUTRAL': '중립적', 
    'NEGATIVE': '부정적',
    'MONEY': '돈/투자',
    'SPECIAL': '특별함'
  };

  const getEmotionCategory = (emotion) => {
    const positive = ['happy', 'excited', 'love', 'laughing', 'wink', 'kiss', 'cool', 'angel', 'party', 'rocket', 'fire', 'nerd', 'sunglasses_cool', 'rose', 'gift', 'gift_box', 'chart_up', 'diamond', 'gem', 'crown', 'trophy', 'medal', 'target', 'lightning', 'star', 'sparkle', 'rainbow', 'unicorn', 'phoenix', 'butterfly', 'flower', 'four_leaf'];
    const neutral = ['neutral', 'thinking', 'confused', 'surprised', 'sleepy', 'yawn', 'glasses', 'computer'];
    const negative = ['worried', 'sad', 'crying', 'disappointed', 'tired', 'sick', 'nervous', 'sweating', 'angry', 'rage', 'annoyed', 'grumpy', 'melting', 'chart_down'];
    const money = ['money_face', 'money_bag', 'dollar', 'yen', 'euro', 'pound', 'chart_up', 'chart_down', 'chart'];
    const special = ['shock', 'dizzy', 'bullseye'];
    
    if (positive.includes(emotion.key)) return 'POSITIVE';
    if (neutral.includes(emotion.key)) return 'NEUTRAL';
    if (negative.includes(emotion.key)) return 'NEGATIVE';
    if (money.includes(emotion.key)) return 'MONEY';
    return 'SPECIAL';
  };

  const filteredEmotions = emotions.filter(emotion => {
    if (selectedCategory === 'ALL') return true;
    return getEmotionCategory(emotion) === selectedCategory;
  });

  const displayEmotions = showAll ? filteredEmotions : filteredEmotions.slice(0, 12);

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '24px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: darkMode ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.08)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 더욱 귀여운 배경 장식 */}
      <div style={{
        position: 'absolute',
        top: '-25px',
        right: '-25px',
        width: '50px',
        height: '50px',
        background: 'linear-gradient(45deg, #ff9ff3, #f368e0)',
        borderRadius: '50%',
        opacity: 0.15,
        animation: 'float 3s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20px',
        left: '-20px',
        width: '40px',
        height: '40px',
        background: 'linear-gradient(45deg, #74b9ff, #0984e3)',
        borderRadius: '50%',
        opacity: 0.12,
        animation: 'float 4s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '-15px',
        width: '30px',
        height: '30px',
        background: 'linear-gradient(45deg, #fd79a8, #fdcb6e)',
        borderRadius: '50%',
        opacity: 0.1,
        animation: 'float 5s ease-in-out infinite'
      }} />

      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          margin: '0 0 0.8rem 0',
          color: accent,
          fontSize: '1.6rem',
          fontWeight: '900',
          background: `linear-gradient(45deg, ${accent}, #ff6b6b, #4ecdc4)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200% 200%',
          animation: 'gradientMove 3s ease infinite'
        }}>
          💭 오늘의 기분을 선택해주세요!
        </h3>
        <p style={{
          margin: 0,
          color: darkMode ? '#bbb' : '#555',
          fontSize: '1rem',
          fontStyle: 'italic',
          fontWeight: '500'
        }}>
          총 <span style={{ color: accent, fontWeight: 'bold' }}>64개</span>의 다양한 감정으로 표현해보세요! ✨
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.8rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {Object.entries(categories).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            style={{
              background: selectedCategory === key 
                ? `linear-gradient(45deg, ${accent}, #ff6b6b)` 
                : 'transparent',
              color: selectedCategory === key ? '#fff' : text,
              border: selectedCategory === key 
                ? 'none' 
                : `2px solid ${border}`,
              borderRadius: '25px',
              padding: '0.6rem 1.2rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '700',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: selectedCategory === key 
                ? '0 6px 20px rgba(136, 132, 216, 0.4)' 
                : 'none',
              transform: selectedCategory === key ? 'translateY(-2px)' : 'translateY(0)'
            }}
          >
            {label}
          </button>
        ))}
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {displayEmotions.map(emotion => (
          <button
            key={emotion.key}
            onClick={() => onSelect(emotion.key)}
            style={{
              background: `linear-gradient(135deg, ${darkMode ? '#2a2a2a' : '#ffffff'}, ${darkMode ? '#3a3a3a' : '#f8f9fa'})`,
              border: `3px solid ${border}`,
              borderRadius: '20px',
              padding: '1.2rem 0.8rem',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              minHeight: '100px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-8px) scale(1.08)';
              e.target.style.borderColor = emotion.color;
              e.target.style.background = `linear-gradient(135deg, ${emotion.color}20, ${emotion.color}35)`;
              e.target.style.boxShadow = `0 12px 30px ${emotion.color}50`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.borderColor = border;
              e.target.style.background = `linear-gradient(135deg, ${darkMode ? '#2a2a2a' : '#ffffff'}, ${darkMode ? '#3a3a3a' : '#f8f9fa'})`;
              e.target.style.boxShadow = 'none';
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'translateY(0) scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'translateY(-8px) scale(1.08)';
            }}
          >
            {/* 반짝이는 장식 */}
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              fontSize: '0.7rem',
              opacity: 0.8,
              animation: 'twinkle 2s infinite'
            }}>✨</div>
            
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '0.3rem',
              filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))',
              transition: 'all 0.3s'
            }}>
              {emotion.emoji}
            </div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: '800',
              color: text,
              textAlign: 'center',
              lineHeight: '1.2',
              letterSpacing: '-0.02em'
            }}>
              {emotion.label}
            </div>
          </button>
        ))}
      </div>

      {/* 더보기/접기 버튼 */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            background: `linear-gradient(45deg, ${accent}, #ff6b6b, #4ecdc4)`,
            color: '#fff',
            border: 'none',
            borderRadius: '30px',
            padding: '1rem 2rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '800',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 6px 20px rgba(136, 132, 216, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            margin: '0 auto',
            backgroundSize: '200% 200%',
            animation: 'gradientMove 3s ease infinite'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px) scale(1.05)';
            e.target.style.boxShadow = '0 8px 25px rgba(136, 132, 216, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 6px 20px rgba(136, 132, 216, 0.4)';
          }}
        >
          {showAll ? (
            <>🙈 간단히 보기</>
          ) : (
            <>🌈 전체 감정 보기 ({emotions.length - 12}개 더)</>
          )}
        </button>
      </div>

      {/* 더욱 귀여운 안내 메시지 */}
      <div style={{
        background: `linear-gradient(135deg, ${darkMode ? '#2a1a2a' : '#fff0f5'}, ${darkMode ? '#1a2a3a' : '#f0f8ff'})`,
        borderRadius: '20px',
        padding: '1.5rem',
        border: `3px solid ${darkMode ? '#444' : '#ffd6e7'}`,
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          fontSize: '1.5rem',
          marginBottom: '0.8rem'
        }}>🎭</div>
        <div style={{
          fontSize: '1rem',
          color: text,
          fontWeight: '700',
          marginBottom: '0.6rem'
        }}>
          감정 기록의 특별한 마법 ✨
        </div>
        <div style={{
          fontSize: '0.9rem',
          color: darkMode ? '#bbb' : '#666',
          lineHeight: '1.6',
          fontWeight: '500'
        }}>
          매일매일 감정을 기록하면<br/>
          투자 패턴을 분석해서 더 현명한 결정을 도와드려요!<br/>
          <span style={{ color: accent, fontWeight: '700' }}>총 64가지 감정</span>으로 세밀하게 표현해보세요! 🧠💡
        </div>
        
        {/* 귀여운 장식들 */}
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '20px',
          fontSize: '1.2rem',
          animation: 'heartbeat 2s infinite'
        }}>💖</div>
        <div style={{
          position: 'absolute',
          bottom: '15px',
          left: '20px',
          fontSize: '1rem',
          animation: 'twinkle 3s infinite'
        }}>🌟</div>
      </div>

      <style>
        {`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.7; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
}

export default EmotionButtons; 