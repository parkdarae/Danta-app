import React from 'react';

const ChaessaemCharacter = ({ 
  size = 'normal', 
  showMessage = false, 
  message = "안녕하세요! 채쌤입니다.",
  darkMode = false,
  style = {},
  onClick
}) => {
  // 크기 설정
  const sizes = {
    small: { width: '60px', height: '80px' },
    normal: { width: '120px', height: '160px' },
    large: { width: '180px', height: '240px' },
    huge: { width: '240px', height: '320px' }
  };

  const sizeStyle = sizes[size] || sizes.normal;

  return (
    <div style={{ 
      position: 'relative', 
      display: 'inline-block',
      ...style 
    }}>
      {/* 채쌤 상반신 SVG (정면 이미지 기반) */}
      <svg
        width={sizeStyle.width}
        height={sizeStyle.height}
        viewBox="0 0 120 160"
        style={{
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.3s ease'
        }}
        onClick={onClick}
      >
        {/* 배경 (투명) */}
        <rect width="120" height="160" fill="transparent" />
        
        {/* 채쌤 몸체 (검은색 폴로셔츠) */}
        <ellipse 
          cx="60" 
          cy="140" 
          rx="35" 
          ry="20" 
          fill="#2d3436"
          stroke="#636e72"
          strokeWidth="1"
        />
        
        {/* 채쌤 폴로셔츠 (상반신) */}
        <rect 
          x="25" 
          y="90" 
          width="70" 
          height="70" 
          rx="15" 
          fill="#2d3436"
          stroke="#636e72"
          strokeWidth="1"
        />
        
        {/* 폴로셔츠 칼라 */}
        <path 
          d="M 40 90 L 50 80 L 70 80 L 80 90 Z" 
          fill="#636e72"
          stroke="#2d3436"
          strokeWidth="1"
        />
        
        {/* 폴로셔츠 단추 */}
        <circle cx="60" cy="100" r="2" fill="#74b9ff" />
        <circle cx="60" cy="110" r="2" fill="#74b9ff" />
        <circle cx="60" cy="120" r="2" fill="#74b9ff" />
        
        {/* 채쌤 팔 (왼쪽) */}
        <ellipse 
          cx="20" 
          cy="110" 
          rx="12" 
          ry="25" 
          fill="#2d3436"
        />
        
        {/* 채쌤 팔 (오른쪽) */}
        <ellipse 
          cx="100" 
          cy="110" 
          rx="12" 
          ry="25" 
          fill="#2d3436"
        />
        
        {/* 채쌤 손 (왼쪽) */}
        <circle cx="20" cy="135" r="8" fill="#fdbcb4" />
        
        {/* 채쌤 손 (오른쪽) - 골프클럽 잡는 손 */}
        <circle cx="100" cy="135" r="8" fill="#fdbcb4" />
        
        {/* 골프클럽 (부분) */}
        <line 
          x1="100" 
          y1="135" 
          x2="110" 
          y2="155" 
          stroke="#8b4513" 
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* 채쌤 목 */}
        <rect 
          x="50" 
          y="75" 
          width="20" 
          height="15" 
          fill="#fdbcb4"
        />
        
        {/* 채쌤 얼굴 */}
        <circle 
          cx="60" 
          cy="50" 
          r="25" 
          fill="#fdbcb4"
          stroke="#e17055"
          strokeWidth="1"
        />
        
        {/* 채쌤 모자 (빨간색) */}
        <ellipse 
          cx="60" 
          cy="35" 
          rx="28" 
          ry="18" 
          fill="#d63031"
          stroke="#a29bfe"
          strokeWidth="1"
        />
        
        {/* 모자 챙 */}
        <ellipse 
          cx="60" 
          cy="45" 
          rx="32" 
          ry="8" 
          fill="#b92d2d"
          stroke="#a29bfe"
          strokeWidth="1"
        />
        
        {/* 모자 단추 */}
        <circle cx="60" cy="30" r="2" fill="#2d3436" />
        
        {/* 채쌤 머리카락 (포니테일 끝부분만) */}
        <ellipse 
          cx="85" 
          cy="40" 
          rx="8" 
          ry="15" 
          fill="#f39c12"
          stroke="#e67e22"
          strokeWidth="1"
          transform="rotate(15 85 40)"
        />
        
        {/* 채쌤 눈 (왼쪽) */}
        <ellipse cx="52" cy="45" rx="4" ry="6" fill="white" />
        <circle cx="52" cy="45" r="3" fill="#2d3436" />
        <circle cx="53" cy="44" r="1" fill="white" />
        
        {/* 채쌤 눈 (오른쪽) */}
        <ellipse cx="68" cy="45" rx="4" ry="6" fill="white" />
        <circle cx="68" cy="45" r="3" fill="#2d3436" />
        <circle cx="69" cy="44" r="1" fill="white" />
        
        {/* 채쌤 코 */}
        <ellipse cx="60" cy="52" rx="2" ry="3" fill="#f8b400" opacity="0.6" />
        
        {/* 채쌤 입 (밝은 미소) */}
        <path 
          d="M 55 58 Q 60 62 65 58" 
          stroke="#e17055" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* 채쌤 볼 홍조 (왼쪽) */}
        <circle cx="45" cy="52" r="4" fill="#ff7675" opacity="0.4" />
        
        {/* 채쌤 볼 홍조 (오른쪽) */}
        <circle cx="75" cy="52" r="4" fill="#ff7675" opacity="0.4" />
        
        {/* 채쌤 눈썹 (왼쪽) */}
        <path 
          d="M 48 40 Q 52 38 56 40" 
          stroke="#e67e22" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* 채쌤 눈썹 (오른쪽) */}
        <path 
          d="M 64 40 Q 68 38 72 40" 
          stroke="#e67e22" 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* 채쌤 귀 (왼쪽) */}
        <ellipse cx="35" cy="50" rx="4" ry="6" fill="#fdbcb4" />
        
        {/* 채쌤 귀 (오른쪽) */}
        <ellipse cx="85" cy="50" rx="4" ry="6" fill="#fdbcb4" />
      </svg>
      
      {/* 메시지 말풍선 */}
      {showMessage && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '100%',
          marginLeft: '10px',
          padding: '8px 12px',
          background: darkMode ? '#2d3436' : 'white',
          border: `2px solid ${darkMode ? '#74b9ff' : '#ddd'}`,
          borderRadius: '12px',
          fontSize: '14px',
          color: darkMode ? 'white' : '#2d3436',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          {/* 말풍선 화살표 */}
          <div style={{
            position: 'absolute',
            left: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '0',
            height: '0',
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: `8px solid ${darkMode ? '#2d3436' : 'white'}`
          }} />
          {message}
        </div>
      )}
    </div>
  );
};

export default ChaessaemCharacter; 