import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useTypography } from '../hooks/useTypography';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ChaessaemEmoji from './ChaessaemEmoji';
import EnhancedButton from './EnhancedButton';

// 투자 성향별 추천 전략
const INVESTMENT_STRATEGIES = {
  // 경험 수준별
  beginner: {
    description: '초보자를 위한 안전한 투자 전략',
    focus: ['우량주', '배당주', '인덱스 펀드'],
    riskLevel: '낮음',
    timeHorizon: '장기 (3년 이상)',
    chaessaemAdvice: '님! 투자를 처음 시작하시니까 안전하고 검증된 종목부터 시작해보세요!'
  },
  intermediate: {
    description: '중급자를 위한 균형잡힌 포트폴리오',
    focus: ['성장주', '가치주', '섹터 ETF'],
    riskLevel: '중간',
    timeHorizon: '중장기 (1-3년)',
    chaessaemAdvice: '님은 어느 정도 경험이 있으시니 조금 더 공격적으로 가셔도 될 것 같아요!'
  },
  advanced: {
    description: '고급자를 위한 전문 투자 전략',
    focus: ['소형주', '테마주', '파생상품'],
    riskLevel: '높음',
    timeHorizon: '단중기 (6개월-2년)',
    chaessaemAdvice: '님은 베테랑이시니까 고급 전략도 충분히 소화하실 수 있을 거예요!'
  }
};

// 투자 목표별 종목 추천
const GOAL_BASED_RECOMMENDATIONS = {
  wealth_building: {
    title: '자산 증식형 포트폴리오',
    description: '장기적인 자산 성장을 목표로 하는 투자',
    stockTypes: [
      {
        type: '대형 성장주',
        description: '안정적이면서도 성장 가능성이 높은 대기업',
        examples: ['삼성전자', '네이버', 'SK하이닉스'],
        allocation: '40%',
        icon: '🏢'
      },
      {
        type: '중소형 성장주',
        description: '높은 성장 잠재력을 가진 중소기업',
        examples: ['카카오게임즈', '컴투스', '펄어비스'],
        allocation: '30%',
        icon: '🌱'
      },
      {
        type: '해외 ETF',
        description: '글로벌 분산투자를 위한 상장지수펀드',
        examples: ['KODEX 미국S&P500', 'TIGER 나스닥100'],
        allocation: '30%',
        icon: '🌍'
      }
    ]
  },
  income_generation: {
    title: '수익 창출형 포트폴리오',
    description: '꾸준한 배당과 안정적인 수익을 추구',
    stockTypes: [
      {
        type: '고배당 우선주',
        description: '안정적인 배당을 지급하는 우선주',
        examples: ['삼성전자우', 'LG화학우', 'SK텔레콤우'],
        allocation: '50%',
        icon: '💰'
      },
      {
        type: 'REITs',
        description: '부동산투자신탁으로 임대수익 분배',
        examples: ['코람코리츠', '롯데리츠', '이리츠'],
        allocation: '25%',
        icon: '🏠'
      },
      {
        type: '인프라 펀드',
        description: '안정적인 현금흐름을 가진 인프라 투자',
        examples: ['맥쿼리인프라', '코리아인프라'],
        allocation: '25%',
        icon: '🔌'
      }
    ]
  },
  speculation: {
    title: '단기 수익형 포트폴리오',
    description: '높은 수익률을 추구하는 공격적 투자',
    stockTypes: [
      {
        type: '테마주',
        description: '최신 트렌드를 반영한 테마 중심 투자',
        examples: ['2차전지', 'K-푸드', '메타버스'],
        allocation: '40%',
        icon: '🎯'
      },
      {
        type: '소형 급성장주',
        description: '폭발적 성장 가능성이 있는 소형주',
        examples: ['바이오 신약', '게임', 'IT 솔루션'],
        allocation: '35%',
        icon: '🚀'
      },
      {
        type: '변동성 ETF',
        description: '시장 변동성을 활용한 단기 투자',
        examples: ['KODEX 레버리지', 'TIGER 2X'],
        allocation: '25%',
        icon: '⚡'
      }
    ]
  },
  learning: {
    title: '학습 중심형 포트폴리오',
    description: '투자 학습과 경험 축적을 위한 구성',
    stockTypes: [
      {
        type: '블루칩',
        description: '시장을 대표하는 안정적인 대형주',
        examples: ['삼성전자', '네이버', 'LG에너지솔루션'],
        allocation: '60%',
        icon: '💎'
      },
      {
        type: '실습용 종목',
        description: '차트 분석과 매매 연습용 종목',
        examples: ['코스피200 ETF', '코스닥150 ETF'],
        allocation: '30%',
        icon: '📊'
      },
      {
        type: '소액 체험',
        description: '소액으로 다양한 섹터 체험',
        examples: ['각 업종별 대표주 1주씩'],
        allocation: '10%',
        icon: '🎓'
      }
    ]
  }
};

// 위험도별 동전주/대형주 추천
const RISK_BASED_RECOMMENDATIONS = {
  conservative: { // 1-3
    title: '안전 추구형',
    mainFocus: '대형 우량주 + 배당주',
    allocation: {
      '대형주': '70%',
      '중형주': '20%',
      '소형주': '10%'
    },
    avoidance: ['동전주', '테마주', '신규상장주']
  },
  moderate: { // 4-6
    title: '균형 추구형', 
    mainFocus: '대형주 + 중형 성장주',
    allocation: {
      '대형주': '50%',
      '중형주': '35%',
      '소형주': '15%'
    },
    avoidance: ['극단적 변동성 종목']
  },
  aggressive: { // 7-10
    title: '수익 추구형',
    mainFocus: '성장주 + 동전주 + 테마주',
    allocation: {
      '대형주': '30%',
      '중형주': '40%',
      '소형주/동전주': '30%'
    },
    avoidance: ['없음 (단, 리스크 관리 필수)']
  }
};

const PersonalizedInvestmentRecommendation = ({ darkMode = false }) => {
  const theme = useTheme(darkMode);
  const typography = useTypography(darkMode);
  const [userProfile] = useLocalStorage('user_profile', {});
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStockType, setSelectedStockType] = useState(null);

  // 사용자 표시 이름 가져오기
  const getDisplayName = () => {
    const { name, nickname } = userProfile;
    if (!name && !nickname) return '고객';
    if (name && !nickname) return name;
    if (!name && nickname) return nickname;
    
    // 상황에 맞게 혼용
    const contexts = {
      overview: nickname || name, // 개요는 친근하게
      portfolio: name ? name + '님' : nickname, // 포트폴리오는 정중하게
      advice: Math.random() > 0.5 ? nickname : (name ? name + '님' : nickname) // 조언은 랜덤
    };
    
    return contexts[activeTab] || nickname || name;
  };

  // 위험도 카테고리 결정
  const getRiskCategory = () => {
    const risk = userProfile.riskTolerance || 5;
    if (risk <= 3) return 'conservative';
    if (risk <= 6) return 'moderate';
    return 'aggressive';
  };

  // 추천 전략 가져오기
  const getRecommendedStrategy = () => {
    return INVESTMENT_STRATEGIES[userProfile.experienceLevel] || INVESTMENT_STRATEGIES.beginner;
  };

  // 목표 기반 추천 가져오기
  const getGoalBasedRecommendation = () => {
    return GOAL_BASED_RECOMMENDATIONS[userProfile.investmentGoal] || GOAL_BASED_RECOMMENDATIONS.wealth_building;
  };

  // 위험도 기반 추천 가져오기
  const getRiskBasedRecommendation = () => {
    return RISK_BASED_RECOMMENDATIONS[getRiskCategory()];
  };

  const strategy = getRecommendedStrategy();
  const goalRecommendation = getGoalBasedRecommendation();
  const riskRecommendation = getRiskBasedRecommendation();

  // 프로필이 없으면 설정 안내
  if (!userProfile.isProfileComplete) {
    return (
      <div style={{
        background: theme.cardBg,
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
        border: `2px solid ${theme.border}`
      }}>
        <ChaessaemEmoji
          type="emotions"
          emotion="thinking"
          size="large"
          showMessage={false}
          autoAnimation={true}
          darkMode={darkMode}
        />
        <h3 style={{
          ...typography.presets.heading.h3,
          color: typography.colors.primary,
          margin: '16px 0'
        }}>
          먼저 프로필을 설정해주세요!
        </h3>
        <p style={{
          ...typography.presets.body.normal,
          color: typography.colors.secondary
        }}>
          맞춤형 투자 추천을 받으려면 사용자 프로필 설정이 필요해요.
        </p>
      </div>
    );
  }

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
          type="trading"
          emotion="money"
          size="large"
          showMessage={false}
          autoAnimation={true}
          darkMode={darkMode}
        />
        <div>
          <h2 style={{
            ...typography.presets.heading.h2,
            color: typography.colors.primary,
            margin: 0,
            marginBottom: '8px'
          }}>
            {getDisplayName()}님 맞춤 투자 전략
          </h2>
          <div style={{
            ...typography.presets.body.small,
            color: typography.colors.muted
          }}>
            투자 성향 분석 결과를 바탕으로 한 개인화 추천
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        borderBottom: `2px solid ${theme.border}`,
        paddingBottom: '16px'
      }}>
        {[
          { id: 'overview', label: '📊 전략 개요', icon: '📊' },
          { id: 'portfolio', label: '💼 포트폴리오', icon: '💼' },
          { id: 'advice', label: '💬 채쌤 조언', icon: '💬' }
        ].map((tab) => (
          <EnhancedButton
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            size="normal"
            icon={tab.icon}
            darkMode={darkMode}
          >
            {tab.label}
          </EnhancedButton>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 기본 정보 */}
          <div style={{
            background: theme.gradients.light,
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{
              ...typography.presets.heading.h3,
              color: typography.colors.primary,
              marginBottom: '16px'
            }}>
              👤 {getDisplayName()}님의 투자 프로필
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{
                  ...typography.presets.label,
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
                  {strategy.description}
                </div>
              </div>
              
              <div>
                <div style={{
                  ...typography.presets.label,
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
                  {riskRecommendation.title}
                </div>
              </div>
              
              <div>
                <div style={{
                  ...typography.presets.label,
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
                  {goalRecommendation.title}
                </div>
              </div>
            </div>
          </div>

          {/* 추천 자산 배분 */}
          <div style={{
            background: theme.bg,
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{
              ...typography.presets.heading.h3,
              color: typography.colors.primary,
              marginBottom: '16px'
            }}>
              🎯 추천 자산 배분
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(riskRecommendation.allocation).map(([type, allocation]) => (
                <div key={type} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: theme.cardBg,
                  borderRadius: '8px'
                }}>
                  <span style={{
                    ...typography.presets.body.normal,
                    color: typography.colors.primary
                  }}>
                    {type}
                  </span>
                  <span style={{
                    ...typography.presets.body.normal,
                    color: theme.accent,
                    fontWeight: typography.fontWeight.semibold
                  }}>
                    {allocation}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: theme.gradients.ocean,
            borderRadius: '12px',
            padding: '24px',
            color: 'white'
          }}>
            <h3 style={{
              ...typography.presets.heading.h3,
              color: 'white',
              marginBottom: '12px'
            }}>
              💼 {goalRecommendation.title}
            </h3>
            <p style={{
              ...typography.presets.body.normal,
              color: 'rgba(255,255,255,0.9)'
            }}>
              {goalRecommendation.description}
            </p>
          </div>

          {goalRecommendation.stockTypes.map((stockType, index) => (
            <div
              key={index}
              style={{
                background: theme.bg,
                borderRadius: '12px',
                padding: '24px',
                border: `2px solid ${theme.border}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setSelectedStockType(selectedStockType === index ? null : index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{stockType.icon}</span>
                  <div>
                    <h4 style={{
                      ...typography.presets.heading.h4,
                      color: typography.colors.primary,
                      margin: 0
                    }}>
                      {stockType.type}
                    </h4>
                    <div style={{
                      ...typography.presets.body.small,
                      color: typography.colors.secondary
                    }}>
                      {stockType.description}
                    </div>
                  </div>
                </div>
                <div style={{
                  ...typography.presets.body.large,
                  color: theme.accent,
                  fontWeight: typography.fontWeight.bold
                }}>
                  {stockType.allocation}
                </div>
              </div>

              {selectedStockType === index && (
                <div style={{
                  background: theme.cardBg,
                  borderRadius: '8px',
                  padding: '16px',
                  marginTop: '12px'
                }}>
                  <div style={{
                    ...typography.presets.label,
                    color: typography.colors.muted,
                    marginBottom: '8px'
                  }}>
                    추천 종목 예시
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {stockType.examples.map((example, exIndex) => (
                      <div
                        key={exIndex}
                        style={{
                          background: theme.accent + '20',
                          color: theme.accent,
                          padding: '6px 12px',
                          borderRadius: '16px',
                          ...typography.presets.body.small,
                          fontWeight: typography.fontWeight.medium
                        }}
                      >
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'advice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 채쌤의 개인 맞춤 조언 */}
          <div style={{
            background: theme.gradients.success,
            borderRadius: '16px',
            padding: '24px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <ChaessaemEmoji
                type="emotions"
                emotion="confident"
                size="normal"
                showMessage={false}
                autoAnimation={true}
                darkMode={false}
              />
              <h3 style={{
                ...typography.presets.heading.h3,
                color: 'white',
                margin: 0
              }}>
                채쌤의 특별 조언
              </h3>
            </div>
            
            <p style={{
              ...typography.presets.body.large,
              color: 'white',
              lineHeight: typography.lineHeight.relaxed,
              margin: 0
            }}>
              {getDisplayName()}{strategy.chaessaemAdvice}
            </p>
          </div>

          {/* 개별 조언들 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: theme.cardBg,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{
                ...typography.presets.heading.h4,
                color: typography.colors.primary,
                marginBottom: '12px'
              }}>
                🎯 투자 접근 방식
              </h4>
              <p style={{
                ...typography.presets.body.normal,
                color: typography.colors.secondary,
                margin: 0
              }}>
                {getDisplayName()}님의 {riskRecommendation.title} 성향에 맞춰 <strong>{riskRecommendation.mainFocus}</strong> 중심으로 포트폴리오를 구성하시는 걸 추천해요!
              </p>
            </div>

            <div style={{
              background: theme.cardBg,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{
                ...typography.presets.heading.h4,
                color: typography.colors.primary,
                marginBottom: '12px'
              }}>
                ⚠️ 주의사항
              </h4>
              <p style={{
                ...typography.presets.body.normal,
                color: typography.colors.secondary,
                margin: 0
              }}>
                {riskRecommendation.avoidance[0] === '없음 (단, 리스크 관리 필수)' 
                  ? `${getDisplayName()}님은 공격적 투자를 선호하시지만, 반드시 손절선을 설정하고 리스크 관리를 철저히 하세요!`
                  : `${riskRecommendation.avoidance.join(', ')} 같은 고위험 투자는 피하시는 게 좋겠어요.`
                }
              </p>
            </div>

            <div style={{
              background: theme.cardBg,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h4 style={{
                ...typography.presets.heading.h4,
                color: typography.colors.primary,
                marginBottom: '12px'
              }}>
                📅 투자 기간
              </h4>
              <p style={{
                ...typography.presets.body.normal,
                color: typography.colors.secondary,
                margin: 0
              }}>
                {getDisplayName()}님께는 <strong>{strategy.timeHorizon}</strong> 투자를 추천해요. 조급해하지 마시고 꾸준히 투자하시면 좋은 결과가 있을 거예요!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedInvestmentRecommendation; 