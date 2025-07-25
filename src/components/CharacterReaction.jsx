import React from 'react';

const reactions = {
  // 기존 32개 감정
  happy: { emoji: '🎉', message: '좋은 기분이시군요! 오늘은 차트 분석이 더 잘될 것 같아요!', color: '#27ae60', bg: '#d5f5d5' },
  excited: { emoji: '🚀', message: '우와! 정말 신나시는군요! 이럴 때일수록 신중한 매매가 중요해요!', color: '#f39c12', bg: '#fef9e7' },
  love: { emoji: '💕', message: '사랑스러운 기분이시군요! 투자도 사랑하는 마음으로 해보세요!', color: '#e91e63', bg: '#fce4ec' },
  laughing: { emoji: '😄', message: '웃음이 가득하시네요! 즐거운 마음으로 투자하면 운도 따라와요!', color: '#ff9800', bg: '#fff3e0' },
  wink: { emoji: '😉', message: '자신감이 넘치시는군요! 하지만 겸손한 마음도 잊지 마세요!', color: '#9c27b0', bg: '#f3e5f5' },
  kiss: { emoji: '💋', message: '사랑이 가득한 하루네요! 투자에도 애정을 담아보세요!', color: '#e74c3c', bg: '#ffebee' },
  cool: { emoji: '😎', message: '쿨하시네요! 이런 냉정함이 투자에 도움이 될 거예요!', color: '#3498db', bg: '#e3f2fd' },
  angel: { emoji: '👼', message: '천사같은 마음이시군요! 선한 마음으로 현명한 투자 결정을 내리세요!', color: '#f1c40f', bg: '#fffde7' },
  
  neutral: { emoji: '🤖', message: '차분한 마음으로 데이터를 분석해보시죠!', color: '#95a5a6', bg: '#f8f9fa' },
  thinking: { emoji: '🧠', message: '깊게 생각하고 계시는군요! 신중한 분석이 좋은 결과를 만들어요!', color: '#34495e', bg: '#ecf0f1' },
  confused: { emoji: '🤯', message: '혼란스러우시군요. 차트를 천천히 다시 살펴보시는 건 어떨까요?', color: '#7f8c8d', bg: '#f8f9fa' },
  surprised: { emoji: '😲', message: '놀라셨군요! 예상치 못한 움직임일 때 더욱 신중해야 해요!', color: '#f39c12', bg: '#fef9e7' },
  shock: { emoji: '⚡', message: '충격적이시겠어요! 이럴 때일수록 감정보다는 데이터를 믿으세요!', color: '#e74c3c', bg: '#ffebee' },
  dizzy: { emoji: '💫', message: '어지러우시군요! 잠깐 쉬면서 마음을 정리해보세요!', color: '#9b59b6', bg: '#f3e5f5' },
  sleepy: { emoji: '😴', message: '피곤하시군요! 충분한 휴식 후에 투자 결정을 내리세요!', color: '#3498db', bg: '#e8f4fd' },
  yawn: { emoji: '🥱', message: '하품이 나오시는군요! 집중력이 떨어질 때는 휴식이 답이에요!', color: '#95a5a6', bg: '#f8f9fa' },
  
  worried: { emoji: '🤗', message: '걱정이 많으시군요. 차근차근 분석해보시면 답이 보일 거예요!', color: '#3498db', bg: '#e3f2fd' },
  sad: { emoji: '💪', message: '실망스러우시겠지만, 이런 경험이 더 나은 투자자로 만들어줘요!', color: '#9b59b6', bg: '#f3e5f5' },
  crying: { emoji: '🌈', message: '울고 싶으실 때도 있죠. 하지만 내일은 더 좋은 날이 올 거예요!', color: '#2980b9', bg: '#e8f4fd' },
  disappointed: { emoji: '🌟', message: '실망스러우시겠지만 실패는 성공의 어머니예요!', color: '#8e44ad', bg: '#f3e5f5' },
  tired: { emoji: '☕', message: '많이 피곤하시군요! 커피 한 잔 하고 다시 시작해보세요!', color: '#7f8c8d', bg: '#f8f9fa' },
  sick: { emoji: '🏥', message: '몸이 안 좋으시군요! 건강이 최우선이에요. 푹 쉬세요!', color: '#e67e22', bg: '#fdf2e9' },
  nervous: { emoji: '🧘', message: '긴장되시는군요! 심호흡하고 차분하게 생각해보세요!', color: '#f39c12', bg: '#fef9e7' },
  sweating: { emoji: '💧', message: '식은땀이 나시는군요! 너무 스트레스 받지 마시고 여유를 가지세요!', color: '#3498db', bg: '#e8f4fd' },
  
  angry: { emoji: '😌', message: '화가 나실 때일수록 냉정하게 판단하시는 게 좋아요. 심호흡 한번!', color: '#e74c3c', bg: '#ffeaea' },
  rage: { emoji: '🌊', message: '분노의 파도가 몰려오시는군요! 잠깐 멈추고 마음을 가라앉혀보세요!', color: '#c0392b', bg: '#fadbd8' },
  annoyed: { emoji: '🍃', message: '짜증이 나시는군요! 바람처럼 가볍게 털어내고 다시 시작해요!', color: '#e67e22', bg: '#fdebd0' },
  grumpy: { emoji: '🌻', message: '시무룩하시군요! 해바라기처럼 긍정적인 면을 바라봐요!', color: '#95a5a6', bg: '#f8f9fa' },
  money_face: { emoji: '🤑', message: '돈이 보이시는군요! 하지만 욕심은 금물이에요!', color: '#27ae60', bg: '#d5f5d5' },
  party: { emoji: '🥳', message: '파티 기분이시군요! 하지만 축하는 수익이 날 때 하는 게 좋겠어요!', color: '#9c27b0', bg: '#f3e5f5' },
  rocket: { emoji: '🚀', message: '로켓처럼 솟구치는 기분! 하지만 안전띠는 꼭 매세요!', color: '#3498db', bg: '#e8f4fd' },
  fire: { emoji: '🔥', message: '불타는 열정이시군요! 이 에너지로 좋은 결과 만드세요!', color: '#e74c3c', bg: '#ffebee' },

  // 새로 추가된 32개 감정
  melting: { emoji: '🫠', message: '녹아내리는 기분이시군요! 이럴 때는 잠깐 쉬어가는 게 좋아요!', color: '#ff6b6b', bg: '#ffe8e8' },
  nerd: { emoji: '📚', message: '공부하는 자세가 훌륭하세요! 지식은 최고의 투자 도구예요!', color: '#74b9ff', bg: '#e8f4fd' },
  sunglasses_cool: { emoji: '🕶️', message: '정말 멋지시네요! 이런 여유로운 마음가짐이 투자에 도움돼요!', color: '#2d3436', bg: '#ddd' },
  glasses: { emoji: '👓', message: '분석적인 시각이 돋보이시네요! 차트를 더 자세히 살펴보세요!', color: '#6c5ce7', bg: '#f1f0ff' },
  rose: { emoji: '🌹', message: '장미처럼 아름다운 하루네요! 투자도 아름답게 성공하길!', color: '#fd79a8', bg: '#fce8f3' },
  gift: { emoji: '🎁', message: '선물같은 기분이시군요! 오늘은 좋은 기회가 있을지도요!', color: '#e84393', bg: '#fce4ec' },
  gift_box: { emoji: '📦', message: '놀라운 선물이 기다리고 있을 것 같아요! 기대해보세요!', color: '#a29bfe', bg: '#f3f0ff' },
  computer: { emoji: '💻', message: '디지털 시대의 투자자시군요! 기술을 활용한 현명한 투자 하세요!', color: '#00b894', bg: '#e8f8f5' },
  
  chart_up: { emoji: '📈', message: '상승하는 기분이시군요! 실제 차트도 이렇게 올라가길!', color: '#00b894', bg: '#e8f8f5' },
  chart_down: { emoji: '📉', message: '하락하는 느낌이시군요! 이럴 때가 기회일 수도 있어요!', color: '#e17055', bg: '#fdf2f2' },
  chart: { emoji: '📊', message: '데이터 분석 모드시군요! 차트를 꼼꼼히 분석해보세요!', color: '#0984e3', bg: '#e8f4fd' },
  money_bag: { emoji: '💰', message: '돈주머니가 무거워지는 꿈을 꾸시는군요! 실현되길!', color: '#00b894', bg: '#e8f8f5' },
  dollar: { emoji: '💵', message: '달러가 보이시는군요! 환율도 체크해보세요!', color: '#00b894', bg: '#e8f8f5' },
  yen: { emoji: '💴', message: '엔화 투자에 관심이 있으시군요! 일본 시장도 흥미로워요!', color: '#fdcb6e', bg: '#fef9e7' },
  euro: { emoji: '💶', message: '유럽 시장에 관심이 있으시군요! 글로벌 투자도 좋은 선택이에요!', color: '#6c5ce7', bg: '#f1f0ff' },
  pound: { emoji: '💷', message: '영국 시장을 보고 계시는군요! 다양한 시장 분석이 중요해요!', color: '#fd79a8', bg: '#fce8f3' },
  
  diamond: { emoji: '💎', message: '다이아몬드 같은 투자를 찾고 계시는군요! 희귀한 기회를 놓치지 마세요!', color: '#74b9ff', bg: '#e8f4fd' },
  gem: { emoji: '💍', message: '보석같은 종목을 찾고 계시는군요! 신중하게 선택하세요!', color: '#fd79a8', bg: '#fce8f3' },
  crown: { emoji: '👑', message: '왕관을 쓴 기분이시군요! 자신감도 좋지만 겸손함도 필요해요!', color: '#fdcb6e', bg: '#fef9e7' },
  trophy: { emoji: '🏆', message: '트로피를 받은 기분이시군요! 성공을 향해 달려가세요!', color: '#fdcb6e', bg: '#fef9e7' },
  medal: { emoji: '🥇', message: '금메달리스트 같은 기분이시군요! 최고의 투자 결과를 기대해요!', color: '#fdcb6e', bg: '#fef9e7' },
  target: { emoji: '🎯', message: '목표가 명확하시군요! 정확한 타겟팅이 성공의 열쇠예요!', color: '#e17055', bg: '#fdf2f2' },
  bullseye: { emoji: '🎪', message: '정확히 맞추셨군요! 이런 정확성이 투자에도 나타나길!', color: '#e84393', bg: '#fce4ec' },
  lightning: { emoji: '⚡', message: '번개같은 속도시군요! 하지만 빠른 결정보다는 신중한 판단이 좋아요!', color: '#fdcb6e', bg: '#fef9e7' },
  
  star: { emoji: '⭐', message: '별처럼 빛나는 하루네요! 투자도 별처럼 반짝이길!', color: '#fdcb6e', bg: '#fef9e7' },
  sparkle: { emoji: '✨', message: '반짝반짝 빛나는 기분이시군요! 오늘은 특별한 날이 될 것 같아요!', color: '#ffeaa7', bg: '#fffef7' },
  rainbow: { emoji: '🌈', message: '무지개처럼 다채로운 기분이시군요! 다양한 투자 기회도 살펴보세요!', color: '#fd79a8', bg: '#fce8f3' },
  unicorn: { emoji: '🦄', message: '유니콘 같은 특별한 기분이시군요! 유니콘 기업 투자도 좋겠어요!', color: '#fd79a8', bg: '#fce8f3' },
  phoenix: { emoji: '🔥', message: '불사조처럼 다시 일어나는 기분이시군요! 재기의 힘을 믿어요!', color: '#e17055', bg: '#fdf2f2' },
  butterfly: { emoji: '🦋', message: '나비처럼 가벼운 기분이시군요! 변화의 시기를 맞이하고 계시는 것 같아요!', color: '#a29bfe', bg: '#f3f0ff' },
  flower: { emoji: '🌸', message: '벚꽃처럼 아름다운 기분이시군요! 봄이 오듯 좋은 소식도 올 거예요!', color: '#fd79a8', bg: '#fce8f3' },
  four_leaf: { emoji: '🍀', message: '네잎클로버 같은 행운이 함께하시길! 운도 실력이에요!', color: '#00b894', bg: '#e8f8f5' }
};

function CharacterReaction({ emotion, darkMode = false }) {
  const reaction = reactions[emotion] || reactions.neutral;
  
  const bg = darkMode ? '#23272b' : '#fff';
  const border = darkMode ? '#333' : '#eee';
  const text = darkMode ? '#e0e0e0' : '#222';

  return (
    <div style={{
      background: bg,
      border: `3px solid ${border}`,
      borderRadius: '24px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: darkMode ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.08)',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center'
    }}>
      {/* 배경 장식 */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '60px',
        height: '60px',
        background: `linear-gradient(45deg, ${reaction.color}40, ${reaction.color}20)`,
        borderRadius: '50%',
        opacity: 0.6,
        animation: 'float 4s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20px',
        left: '-20px',
        width: '40px',
        height: '40px',
        background: `linear-gradient(45deg, ${reaction.color}30, ${reaction.color}10)`,
        borderRadius: '50%',
        opacity: 0.4,
        animation: 'float 3s ease-in-out infinite reverse'
      }} />

      {/* 메인 캐릭터 */}
      <div style={{
        fontSize: '4rem',
        marginBottom: '1.5rem',
        animation: 'bounce 2s infinite',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
      }}>
        {reaction.emoji}
      </div>

      {/* 말풍선 */}
      <div style={{
        background: `linear-gradient(135deg, ${reaction.bg}, ${reaction.color}20)`,
        border: `3px solid ${reaction.color}60`,
        borderRadius: '20px',
        padding: '1.5rem',
        position: 'relative',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {/* 말풍선 꼬리 */}
        <div style={{
          position: 'absolute',
          top: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '0',
          height: '0',
          borderLeft: '15px solid transparent',
          borderRight: '15px solid transparent',
          borderBottom: `15px solid ${reaction.color}60`
        }} />
        
        <div style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          color: text,
          lineHeight: '1.6',
          letterSpacing: '-0.02em'
        }}>
          {reaction.message}
        </div>

        {/* 반짝이는 장식 */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '15px',
          fontSize: '1rem',
          opacity: 0.8,
          animation: 'twinkle 2s infinite'
        }}>✨</div>
      </div>

      {/* 추가 장식 */}
      <div style={{
        marginTop: '1rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: reaction.color,
          animation: 'pulse 1.5s infinite'
        }} />
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: reaction.color,
          animation: 'pulse 1.5s infinite 0.2s'
        }} />
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: reaction.color,
          animation: 'pulse 1.5s infinite 0.4s'
        }} />
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-20px); }
            60% { transform: translateY(-10px); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.8; transform: scale(1) rotate(0deg); }
            50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(180deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.3); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

export default CharacterReaction; 