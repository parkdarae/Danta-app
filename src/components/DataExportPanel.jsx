import React, { useState } from 'react';
import { 
  exportToJSON, 
  exportToCSV, 
  exportToTableau, 
  generateTableauWebDataConnector,
  generateDataSummary 
} from '../utils/dataExporter';
import { COLORS } from '../utils/constants';

function DataExportPanel({ darkMode = false }) {
  const [isExporting, setIsExporting] = useState(false);
  const [dataSummary, setDataSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const theme = darkMode ? COLORS.dark : COLORS.light;

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      switch (format) {
        case 'json':
          exportToJSON();
          break;
        case 'csv':
          exportToCSV();
          break;
        case 'tableau':
          exportToTableau();
          break;
        case 'tableau-connector':
          generateTableauWebDataConnector();
          break;
        default:
          alert('지원하지 않는 형식입니다.');
      }
      
      // 성공 메시지
      setTimeout(() => {
        alert(`${format.toUpperCase()} 형식으로 데이터가 성공적으로 내보내기되었습니다! 🎉`);
        setIsExporting(false);
      }, 500);
      
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
      alert('데이터 내보내기 중 오류가 발생했습니다. 😥');
      setIsExporting(false);
    }
  };

  const showDataSummary = () => {
    const summary = generateDataSummary();
    setDataSummary(summary);
    setShowSummary(true);
  };

  const exportFormats = [
    {
      id: 'json',
      name: 'JSON',
      icon: '📄',
      description: '개발자 친화적인 JSON 형식',
      color: '#f39c12',
      useCase: '프로그래밍, API 연동'
    },
    {
      id: 'csv',
      name: 'CSV',
      icon: '📊',
      description: '엑셀에서 열 수 있는 CSV 형식',
      color: '#27ae60',
      useCase: '엑셀, 스프레드시트 분석'
    },
    {
      id: 'tableau',
      name: 'Tableau Data',
      icon: '📈',
      description: '태블로 분석용 다중 파일',
      color: '#3498db',
      useCase: '태블로 데이터 시각화'
    },
    {
      id: 'tableau-connector',
      name: 'Tableau 커넥터',
      icon: '🔗',
      description: '태블로 웹 데이터 커넥터 생성',
      color: '#8e44ad',
      useCase: '태블로 실시간 연동'
    }
  ];

  return (
    <div style={{
      background: theme.surface,
      borderRadius: '20px',
      padding: '2rem',
      margin: '1rem 0',
      border: `2px solid ${theme.border}`,
      boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      {/* 헤더 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          margin: '0 0 0.5rem 0',
          color: COLORS.primary,
          fontSize: '1.5rem',
          fontWeight: '800',
          background: `linear-gradient(45deg, ${COLORS.primary}, #ff6b6b)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          📊 데이터 내보내기
        </h3>
        <p style={{
          margin: 0,
          color: theme.subtext,
          fontSize: '1rem',
          fontStyle: 'italic'
        }}>
          투자 데이터를 외부 분석 도구로 내보내어 더 깊이 있는 분석을 해보세요!
        </p>
      </div>

      {/* 데이터 요약 섹션 */}
      <div style={{
        background: darkMode ? '#1a1a1a' : '#f8f9fa',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: `2px solid ${theme.border}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h4 style={{
            margin: 0,
            color: COLORS.primary,
            fontSize: '1.2rem',
            fontWeight: '700'
          }}>
            📋 데이터 현황
          </h4>
          <button
            onClick={showDataSummary}
            style={{
              background: `linear-gradient(45deg, ${COLORS.primary}, #ff6b6b)`,
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '0.6rem 1.2rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            📊 상세 보기
          </button>
        </div>

        {showSummary && dataSummary && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              background: darkMode ? '#2a2a2a' : '#fff',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
              border: `2px solid ${COLORS.success}40`
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😊</div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: COLORS.success,
                marginBottom: '0.3rem'
              }}>
                {dataSummary.총감정기록수}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: theme.subtext,
                fontWeight: '600'
              }}>
                감정 기록
              </div>
            </div>

            <div style={{
              background: darkMode ? '#2a2a2a' : '#fff',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
              border: `2px solid ${COLORS.info}40`
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: COLORS.info,
                marginBottom: '0.3rem'
              }}>
                {dataSummary.총메모수}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: theme.subtext,
                fontWeight: '600'
              }}>
                투자 메모
              </div>
            </div>

            <div style={{
              background: darkMode ? '#2a2a2a' : '#fff',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
              border: `2px solid ${COLORS.warning}40`
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: COLORS.warning,
                marginBottom: '0.3rem'
              }}>
                {dataSummary.사용중인종목수}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: theme.subtext,
                fontWeight: '600'
              }}>
                분석 종목
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 내보내기 형식 선택 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {exportFormats.map(format => (
          <div
            key={format.id}
            style={{
              background: darkMode ? '#1a1a1a' : '#fff',
              borderRadius: '16px',
              padding: '1.5rem',
              border: `2px solid ${theme.border}`,
              transition: 'all 0.3s',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.borderColor = format.color;
              e.target.style.boxShadow = `0 8px 25px ${format.color}40`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.borderColor = theme.border;
              e.target.style.boxShadow = 'none';
            }}
          >
            {/* 배경 장식 */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '60px',
              height: '60px',
              background: `${format.color}20`,
              borderRadius: '50%',
              opacity: 0.6
            }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '2rem',
                marginRight: '1rem'
              }}>
                {format.icon}
              </div>
              <div>
                <h4 style={{
                  margin: '0 0 0.3rem 0',
                  color: format.color,
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  {format.name}
                </h4>
                <p style={{
                  margin: 0,
                  color: theme.subtext,
                  fontSize: '0.9rem'
                }}>
                  {format.description}
                </p>
              </div>
            </div>

            <div style={{
              marginBottom: '1rem',
              padding: '0.8rem',
              background: `${format.color}10`,
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '0.85rem',
                color: theme.text,
                fontWeight: '600'
              }}>
                💡 활용 분야: {format.useCase}
              </div>
            </div>

            <button
              onClick={() => handleExport(format.id)}
              disabled={isExporting}
              style={{
                width: '100%',
                background: `linear-gradient(45deg, ${format.color}, ${format.color}dd)`,
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.8rem',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '700',
                transition: 'all 0.3s',
                opacity: isExporting ? 0.6 : 1
              }}
            >
              {isExporting ? '내보내는 중...' : `${format.name}로 내보내기`}
            </button>
          </div>
        ))}
      </div>

      {/* 태블로 사용 가이드 */}
      <div style={{
        background: `linear-gradient(135deg, ${darkMode ? '#1a2a1a' : '#f0f8ff'}, ${darkMode ? '#2a1a2a' : '#fff5f5'})`,
        borderRadius: '16px',
        padding: '1.5rem',
        border: `2px solid ${darkMode ? '#333' : '#e3f2fd'}`
      }}>
        <h4 style={{
          margin: '0 0 1rem 0',
          color: COLORS.info,
          fontSize: '1.1rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📈 태블로(Tableau) 사용 가이드
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: darkMode ? '#2a2a2a' : '#fff',
            borderRadius: '8px',
            padding: '1rem',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ fontWeight: '600', color: COLORS.info, marginBottom: '0.5rem' }}>
              📊 Tableau Data 방식
            </div>
            <div style={{ fontSize: '0.85rem', color: theme.subtext, lineHeight: '1.4' }}>
              CSV/JSON 파일을 다운로드한 후 태블로에서 "파일에 연결"로 불러오세요.
            </div>
          </div>
          
          <div style={{
            background: darkMode ? '#2a2a2a' : '#fff',
            borderRadius: '8px',
            padding: '1rem',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ fontWeight: '600', color: COLORS.warning, marginBottom: '0.5rem' }}>
              🔗 웹 데이터 커넥터 방식
            </div>
            <div style={{ fontSize: '0.85rem', color: theme.subtext, lineHeight: '1.4' }}>
              HTML 파일을 다운로드한 후 태블로에서 "웹 데이터 커넥터"로 연결하세요.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataExportPanel; 