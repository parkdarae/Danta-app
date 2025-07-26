import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useChaessaemNotification } from './ChaessaemNotification';
import UserProfileSetup from './UserProfileSetup';
import PersonalizedInvestmentRecommendation from './PersonalizedInvestmentRecommendation';
import ChaessaemEmoji from './ChaessaemEmoji';
import EnhancedButton from './EnhancedButton';

const UserPage = ({ darkMode = false }) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  const notification = useChaessaemNotification();
  
  const [userProfile, setUserProfile] = useLocalStorage('user_profile', {
    isProfileComplete: false
  });
  
  const [currentView, setCurrentView] = useState('main');
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // 프로필 완료 처리
  const handleProfileComplete = (completedProfile) => {
    setUserProfile(completedProfile);
    setCurrentView('recommendations');
    
    // 완료 알림
    notification.achievement(
      `${getDisplayName(completedProfile)}님의 맞춤형 투자 전략이 준비되었어요!`,
      {
        title: '프로필 설정 완료! 🎉',
        duration: 5000
      }
    );
  };

  // 표시할 이름 결정
  const getDisplayName = (profile = userProfile) => {
    const { name, nickname } = profile;
    if (!name && !nickname) return '고객';
    if (name && !nickname) return name;
    if (!name && nickname) return nickname;
    
    // 메인 화면에서는 친근하게
    return nickname || name;
  };

  // 프로필 수정
  const handleEditProfile = () => {
    setShowProfileEdit(true);
    setCurrentView('setup');
  };

  // 프로필 초기화
  const handleResetProfile = () => {
    if (window.confirm('정말로 프로필을 초기화하시겠습니까?')) {
      setUserProfile({ isProfileComplete: false });
      setCurrentView('setup');
      notification.info('프로필이 초기화되었습니다. 다시 설정해주세요.');
    }
  };

  // 첫 진입 시 뷰 결정
  useEffect(() => {
    if (!userProfile.isProfileComplete) {
      setCurrentView('setup');
    } else {
      setCurrentView('main');
    }
  }, [userProfile.isProfileComplete]);

  // 메인 대시보드 뷰
  const renderMainDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 웰컴 섹션 */}
      <div style={{
        background: theme.gradients.ocean,
        borderRadius: '20px',
        padding: '32px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 배경 장식 */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '80px',
          height: '80px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <ChaessaemEmoji
            type="emotions"
            emotion="happy"
            size="huge"
            showMessage={false}
            autoAnimation={true}
            darkMode={false}
          />
          
          <div>
            <h1 style={{
              ...typography.presets.heading.h1,
              color: 'white',
              margin: 0,
              marginBottom: '8px'
            }}>
              안녕하세요, {getDisplayName()}님! 👋
            </h1>
            
            <p style={{
              ...typography.presets.body.large,
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              marginBottom: '16px'
            }}>
              채쌤과 함께하는 스마트한 투자 여정에 오신 것을 환영해요!
            </p>
            
            <div style={{
              ...typography.presets.body.normal,
              color: 'rgba(255,255,255,0.8)'
            }}>
              📅 가입일: {new Date(userProfile.setupDate).toLocaleDateString('ko-KR')}
            </div>
          </div>
        </div>
      </div>

      {/* 퀵 액션 */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '16px',
        padding: '24px',
        border: `2px solid ${theme.border}`
      }}>
        <h3 style={{
          ...typography.presets.heading.h3,
          color: typography.colors.primary,
          marginBottom: '20px'
        }}>
          🚀 빠른 액션
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          <EnhancedButton
            onClick={() => setCurrentView('recommendations')}
            variant="primary"
            size="large"
            icon="🎯"
            fullWidth={true}
            darkMode={darkMode}
          >
            맞춤 투자 전략 보기
          </EnhancedButton>
          
          <EnhancedButton
            onClick={handleEditProfile}
            variant="outline"
            size="large"
            icon="✏️"
            fullWidth={true}
            darkMode={darkMode}
          >
            프로필 수정하기
          </EnhancedButton>
          
          <EnhancedButton
            onClick={() => window.location.reload()}
            variant="secondary"
            size="large"
            icon="🔄"
            fullWidth={true}
            darkMode={darkMode}
          >
            투자 현황 새로고침
          </EnhancedButton>
        </div>
      </div>

      {/* 프로필 요약 */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '16px',
        padding: '24px',
        border: `2px solid ${theme.border}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{
            ...typography.presets.heading.h3,
            color: typography.colors.primary,
            margin: 0
          }}>
            📊 내 투자 프로필
          </h3>
          
          <EnhancedButton
            onClick={handleResetProfile}
            variant="ghost"
            size="small"
            icon="🗑️"
            darkMode={darkMode}
          >
            초기화
          </EnhancedButton>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: theme.bg,
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              ...typography.presets.body.small,
              color: typography.colors.muted,
              marginBottom: '4px'
            }}>
              투자 경험
            </div>
            <div style={{
              ...typography.presets.body.normal,
              color: typography.colors.primary,
              fontWeight: typography.fontWeight.semibold
            }}>
              {userProfile.experienceLevel === 'beginner' ? '초보자 🌱' :
               userProfile.experienceLevel === 'intermediate' ? '중급자 🌿' : '고급자 🌳'}
            </div>
          </div>
          
          <div style={{
            background: theme.bg,
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              ...typography.presets.body.small,
              color: typography.colors.muted,
              marginBottom: '4px'
            }}>
              위험 수준
            </div>
            <div style={{
              ...typography.presets.body.normal,
              color: typography.colors.primary,
              fontWeight: typography.fontWeight.semibold
            }}>
              {userProfile.riskTolerance <= 3 ? '안전형 🛡️' :
               userProfile.riskTolerance <= 6 ? '균형형 ⚖️' : '공격형 🚀'}
            </div>
          </div>
          
          <div style={{
            background: theme.bg,
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              ...typography.presets.body.small,
              color: typography.colors.muted,
              marginBottom: '4px'
            }}>
              투자 목표
            </div>
            <div style={{
              ...typography.presets.body.normal,
              color: typography.colors.primary,
              fontWeight: typography.fontWeight.semibold
            }}>
              {userProfile.investmentGoal === 'wealth_building' ? '자산증식 💰' :
               userProfile.investmentGoal === 'income_generation' ? '수익창출 📈' :
               userProfile.investmentGoal === 'speculation' ? '단기수익 🚀' : '학습목적 📚'}
            </div>
          </div>
        </div>
      </div>

      {/* 채쌤의 오늘의 한마디 */}
      <div style={{
        background: theme.gradients.warning,
        borderRadius: '16px',
        padding: '24px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ChaessaemEmoji
            type="emotions"
            emotion="confident"
            size="normal"
            showMessage={false}
            autoAnimation={true}
            darkMode={false}
          />
          
          <div>
            <h4 style={{
              ...typography.presets.heading.h4,
              color: 'white',
              margin: 0,
              marginBottom: '8px'
            }}>
              💬 채쌤의 오늘의 한마디
            </h4>
            
            <p style={{
              ...typography.presets.body.normal,
              color: 'white',
              margin: 0,
              lineHeight: typography.lineHeight.relaxed
            }}>
              {getDisplayName()}님! 오늘도 현명한 투자 결정을 내리시길 바라요. 
              감정에 휩쓸리지 말고 데이터에 기반한 판단을 하시는 게 가장 중요해요! 📊✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: typography.fontFamily.primary
    }}>
      {/* 네비게이션 (프로필 완료 후에만 표시) */}
      {userProfile.isProfileComplete && !showProfileEdit && (
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          padding: '16px',
          background: theme.cardBg,
          borderRadius: '12px',
          border: `1px solid ${theme.border}`
        }}>
          <EnhancedButton
            onClick={() => setCurrentView('main')}
            variant={currentView === 'main' ? 'primary' : 'ghost'}
            size="normal"
            icon="🏠"
            darkMode={darkMode}
          >
            홈
          </EnhancedButton>
          
          <EnhancedButton
            onClick={() => setCurrentView('recommendations')}
            variant={currentView === 'recommendations' ? 'primary' : 'ghost'}
            size="normal"
            icon="🎯"
            darkMode={darkMode}
          >
            맞춤 추천
          </EnhancedButton>
        </div>
      )}

      {/* 콘텐츠 렌더링 */}
      {currentView === 'setup' || showProfileEdit ? (
        <UserProfileSetup
          darkMode={darkMode}
          onComplete={(profile) => {
            handleProfileComplete(profile);
            setShowProfileEdit(false);
          }}
        />
      ) : currentView === 'main' ? (
        renderMainDashboard()
      ) : currentView === 'recommendations' ? (
        <PersonalizedInvestmentRecommendation darkMode={darkMode} />
      ) : null}
    </div>
  );
};

export default UserPage; 