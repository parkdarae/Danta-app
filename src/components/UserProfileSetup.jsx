import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ChaessaemEmoji from './ChaessaemEmoji';
import EnhancedButton from './EnhancedButton';

// 투자 경험 수준
const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    name: '초보자',
    description: '주식 투자를 처음 시작해요',
    icon: '🌱',
    chaessaemResponse: '초보자시군요! 천천히 차근차근 배워나가시면 돼요. 제가 도와드릴게요!'
  },
  {
    id: 'intermediate', 
    name: '중급자',
    description: '1-3년 정도 투자 경험이 있어요',
    icon: '🌿',
    chaessaemResponse: '어느 정도 경험이 있으시네요! 더 체계적인 전략을 세워보시는 건 어때요?'
  },
  {
    id: 'advanced',
    name: '고급자', 
    description: '3년 이상의 풍부한 투자 경험이 있어요',
    icon: '🌳',
    chaessaemResponse: '베테랑이시네요! 고급 분석 도구들을 마음껏 활용해보세요!'
  }
];

// 투자 목표
const INVESTMENT_GOALS = [
  {
    id: 'wealth_building',
    name: '자산 증식',
    description: '장기적으로 자산을 늘리고 싶어요',
    icon: '💰',
    keywords: ['성장주', '장기투자', '복리효과']
  },
  {
    id: 'income_generation',
    name: '수익 창출',
    description: '꾸준한 배당이나 수익을 원해요',
    icon: '📈',
    keywords: ['배당주', '리츠', '안정수익']
  },
  {
    id: 'speculation',
    name: '단기 수익',
    description: '빠른 시간 내에 큰 수익을 노려요',
    icon: '🚀',
    keywords: ['단타', '스윙', '테마주']
  },
  {
    id: 'learning',
    name: '학습 목적',
    description: '투자를 배우면서 경험을 쌓고 싶어요',
    icon: '📚',
    keywords: ['모의투자', '소액투자', '공부']
  }
];

const UserProfileSetup = ({ darkMode = false, onComplete }) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  
  const [userProfile, setUserProfile] = useLocalStorage('user_profile', {
    name: '',
    nickname: '',
    experienceLevel: '',
    investmentGoal: '',
    riskTolerance: 5,
    investmentAmount: '',
    isProfileComplete: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [tempProfile, setTempProfile] = useState(userProfile);
  const [chaessaemMessage, setChaessaemMessage] = useState('');

  // 채쌤 메시지 업데이트
  useEffect(() => {
    const messages = {
      1: '안녕하세요! 저는 여러분의 투자 파트너 채쌤이에요! 🎉 먼저 어떻게 불러드리면 될까요?',
      2: `${getDisplayName()}! 만나서 반가워요! 😊 투자 경험이 어느 정도 되시나요?`,
      3: `${getDisplayName()}님의 투자 목표가 궁금해요! 어떤 방향으로 투자하고 싶으신가요?`,
      4: `마지막으로 ${getDisplayName()}님의 위험 감수 수준을 알려주세요! 투자는 위험과 수익이 비례해요 📊`,
      5: `완료되었어요! ${getDisplayName()}님만의 맞춤형 투자 전략을 준비해드릴게요! 🎯`
    };
    setChaessaemMessage(messages[currentStep] || messages[1]);
  }, [currentStep, tempProfile.name, tempProfile.nickname]);

  // 표시할 이름 결정 (상황에 맞게 혼용)
  const getDisplayName = () => {
    const { name, nickname } = tempProfile;
    
    if (!name && !nickname) return '고객';
    if (name && !nickname) return name;
    if (!name && nickname) return nickname;
    
    // 둘 다 있을 때는 상황에 맞게 선택
    const useNickname = Math.random() > 0.5 || currentStep === 1; // 첫 인사는 친근하게
    return useNickname ? nickname : name + '님';
  };

  // 단계별 완료 조건 확인
  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return tempProfile.name || tempProfile.nickname;
      case 2: return tempProfile.experienceLevel;
      case 3: return tempProfile.investmentGoal;
      case 4: return true; // 위험도는 기본값이 있음
      default: return false;
    }
  };

  // 다음 단계로
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeSetup();
    }
  };

  // 이전 단계로
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // 프로필 설정 완료
  const completeSetup = () => {
    const completedProfile = {
      ...tempProfile,
      isProfileComplete: true,
      setupDate: new Date().toISOString()
    };
    setUserProfile(completedProfile);
    onComplete?.(completedProfile);
  };

  // 입력값 업데이트
  const updateProfile = (field, value) => {
    setTempProfile(prev => ({ ...prev, [field]: value }));
  };

  // 위험도 레벨 텍스트
  const getRiskLevelText = (level) => {
    if (level <= 2) return '안전 추구형 🛡️';
    if (level <= 4) return '신중형 ⚖️';
    if (level <= 6) return '균형형 📊';
    if (level <= 8) return '적극형 📈';
    return '공격형 🚀';
  };

  return (
    <div style={{
      background: theme.gradients.ocean,
      borderRadius: '20px',
      padding: '32px',
      margin: '20px 0',
      color: 'white',
      fontFamily: typography.fontFamily.primary,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 배경 장식 */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '100px',
        height: '100px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />

      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <ChaessaemEmoji
          type="emotions"
          emotion={currentStep === 5 ? 'celebrating' : 'excited'}
          size="large"
          showMessage={false}
          autoAnimation={true}
          darkMode={false}
        />
        <div>
          <h2 style={{
            ...typography.presets.heading.h2,
            color: 'white',
            margin: 0,
            marginBottom: '8px'
          }}>
            채쌤과 함께하는 프로필 설정
          </h2>
          <div style={{
            ...typography.presets.body.small,
            color: 'rgba(255,255,255,0.8)'
          }}>
            단계 {currentStep} / 4 {currentStep === 5 && '- 완료!'}
          </div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div style={{
        width: '100%',
        height: '6px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '3px',
        marginBottom: '24px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(currentStep / 4) * 100}%`,
          height: '100%',
          background: 'white',
          borderRadius: '3px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* 채쌤 메시지 */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '32px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          ...typography.presets.body.large,
          color: 'white',
          lineHeight: typography.lineHeight.relaxed
        }}>
          {chaessaemMessage}
        </div>
      </div>

      {/* 단계별 입력 폼 */}
      <div style={{ marginBottom: '32px' }}>
        {/* 1단계: 이름/닉네임 */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                ...typography.presets.label,
                color: 'white',
                display: 'block',
                marginBottom: '8px'
              }}>
                이름 (실명)
              </label>
              <input
                type="text"
                value={tempProfile.name}
                onChange={(e) => updateProfile('name', e.target.value)}
                placeholder="홍길동"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.9)',
                  ...typography.presets.body.normal,
                  color: '#333'
                }}
              />
            </div>
            
            <div>
              <label style={{
                ...typography.presets.label,
                color: 'white',
                display: 'block',
                marginBottom: '8px'
              }}>
                닉네임 (별명)
              </label>
              <input
                type="text"
                value={tempProfile.nickname}
                onChange={(e) => updateProfile('nickname', e.target.value)}
                placeholder="투자천재, 주식킹 등..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.9)',
                  ...typography.presets.body.normal,
                  color: '#333'
                }}
              />
            </div>
            
            <div style={{
              ...typography.presets.body.small,
              color: 'rgba(255,255,255,0.8)',
              fontStyle: 'italic'
            }}>
              💡 이름과 닉네임 중 하나만 입력해도 돼요! 둘 다 입력하시면 상황에 맞게 불러드릴게요.
            </div>
          </div>
        )}

        {/* 2단계: 투자 경험 */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => updateProfile('experienceLevel', level.id)}
                style={{
                  background: tempProfile.experienceLevel === level.id 
                    ? 'rgba(255,255,255,0.25)' 
                    : 'rgba(255,255,255,0.1)',
                  border: tempProfile.experienceLevel === level.id 
                    ? '2px solid white' 
                    : '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  color: 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{level.icon}</span>
                  <div>
                    <div style={{
                      ...typography.presets.body.large,
                      fontWeight: typography.fontWeight.semibold,
                      marginBottom: '4px'
                    }}>
                      {level.name}
                    </div>
                    <div style={{
                      ...typography.presets.body.small,
                      color: 'rgba(255,255,255,0.8)'
                    }}>
                      {level.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 3단계: 투자 목표 */}
        {currentStep === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {INVESTMENT_GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => updateProfile('investmentGoal', goal.id)}
                style={{
                  background: tempProfile.investmentGoal === goal.id 
                    ? 'rgba(255,255,255,0.25)' 
                    : 'rgba(255,255,255,0.1)',
                  border: tempProfile.investmentGoal === goal.id 
                    ? '2px solid white' 
                    : '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  color: 'white'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{goal.icon}</span>
                </div>
                <div style={{
                  ...typography.presets.body.large,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: '8px',
                  textAlign: 'center'
                }}>
                  {goal.name}
                </div>
                <div style={{
                  ...typography.presets.body.small,
                  color: 'rgba(255,255,255,0.8)',
                  textAlign: 'center'
                }}>
                  {goal.description}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 4단계: 위험 감수 수준 */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                ...typography.presets.heading.h3,
                color: 'white',
                marginBottom: '8px'
              }}>
                위험 감수 수준: {getRiskLevelText(tempProfile.riskTolerance)}
              </div>
              <div style={{
                ...typography.presets.body.small,
                color: 'rgba(255,255,255,0.8)'
              }}>
                슬라이더를 움직여서 선택하세요
              </div>
            </div>

            <div style={{ padding: '0 20px' }}>
              <input
                type="range"
                min="1"
                max="10"
                value={tempProfile.riskTolerance}
                onChange={(e) => updateProfile('riskTolerance', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: 'rgba(255,255,255,0.3)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                ...typography.presets.body.xs,
                color: 'rgba(255,255,255,0.6)'
              }}>
                <span>1 (안전)</span>
                <span>5 (균형)</span>
                <span>10 (공격)</span>
              </div>
            </div>

            {/* 위험도별 설명 */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{
                ...typography.presets.body.normal,
                color: 'white'
              }}>
                {tempProfile.riskTolerance <= 3 && '안정적인 투자를 선호하시는군요! 배당주나 우량주 중심으로 추천해드릴게요.'}
                {tempProfile.riskTolerance > 3 && tempProfile.riskTolerance <= 7 && '균형잡힌 투자 스타일이네요! 성장주와 안정주를 적절히 섞어 추천해드릴게요.'}
                {tempProfile.riskTolerance > 7 && '적극적인 투자를 원하시는군요! 고성장 가능성이 있는 종목들을 추천해드릴게요.'}
              </div>
            </div>
          </div>
        )}

        {/* 5단계: 완료 */}
        {currentStep === 5 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '24px' }}>
              <ChaessaemEmoji
                type="trading"
                emotion="celebrating"
                size="huge"
                showMessage={false}
                autoAnimation={true}
                darkMode={false}
              />
            </div>
            
            <div style={{
              ...typography.presets.heading.h3,
              color: 'white',
              marginBottom: '16px'
            }}>
              🎉 프로필 설정 완료!
            </div>
            
            <div style={{
              ...typography.presets.body.large,
              color: 'rgba(255,255,255,0.9)',
              lineHeight: typography.lineHeight.relaxed
            }}>
              {getDisplayName()}님의 투자 성향에 맞는 맞춤형 추천을 준비했어요!<br/>
              이제 개인화된 투자 전략을 확인해보세요! 🚀
            </div>
          </div>
        )}
      </div>

      {/* 네비게이션 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <EnhancedButton
          onClick={prevStep}
          variant="ghost"
          size="normal"
          disabled={currentStep === 1}
          icon="←"
          style={{
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            visibility: currentStep === 1 ? 'hidden' : 'visible'
          }}
        >
          이전
        </EnhancedButton>

        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: step <= currentStep ? 'white' : 'rgba(255,255,255,0.3)',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>

        <EnhancedButton
          onClick={nextStep}
          variant="secondary"
          size="normal"
          disabled={!isStepComplete() && currentStep < 5}
          icon={currentStep === 4 ? "✓" : "→"}
          iconPosition="right"
          style={{
            background: 'white',
            color: theme.accent,
            fontWeight: typography.fontWeight.semibold
          }}
        >
          {currentStep === 4 ? '완료' : '다음'}
        </EnhancedButton>
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default UserProfileSetup; 