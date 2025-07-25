import React, { useState, useEffect } from 'react';
import { COLORS } from '../utils/constants';
import { ReportManager } from '../utils/dataMining/reportGenerator';

function AutoReportGenerator({ selectedStock, analysisData, darkMode = false }) {
  const [reportManager] = useState(() => new ReportManager());
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportHistory, setReportHistory] = useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const theme = darkMode ? COLORS.dark : COLORS.light;

  // 추천 질문 로드
  useEffect(() => {
    const questions = reportManager.getSuggestedQuestions();
    setSuggestedQuestions(questions);
    loadReportHistory();
  }, [reportManager]);

  // 리포트 히스토리 로드
  const loadReportHistory = () => {
    const history = reportManager.getReportHistory(5);
    setReportHistory(history);
  };

  // 리포트 생성
  const generateReport = async () => {
    if (!currentQuestion.trim()) {
      alert('질문을 입력해주세요!');
      return;
    }

    if (!analysisData) {
      alert('분석 데이터가 없습니다. 먼저 데이터 마이닝을 실행해주세요!');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log(`📋 "${currentQuestion}" 질문에 대한 리포트 생성 중...`);
      
      const report = await reportManager.generateQuestionBasedReport(currentQuestion, analysisData, {
        stock: selectedStock,
        includeCharts: false,
        detailLevel: 'medium',
        language: 'ko'
      });

      setGeneratedReport(report);
      setCurrentQuestion('');
      loadReportHistory();
      
      console.log('✅ 리포트 생성 완료!');

    } catch (error) {
      console.error('❌ 리포트 생성 실패:', error);
      alert(`리포트 생성 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 추천 질문 선택
  const selectSuggestedQuestion = (question) => {
    setCurrentQuestion(question);
  };

  // 리포트 다운로드
  const downloadReport = (format = 'json') => {
    if (!generatedReport) return;
    
    try {
      const content = reportManager.exportReport(generatedReport.id, format);
      const blob = new Blob([content], { 
        type: format === 'json' ? 'application/json' : 
              format === 'markdown' ? 'text/markdown' : 'text/html' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedStock}_report_${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`다운로드 중 오류 발생: ${error.message}`);
    }
  };

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
          fontSize: '1.6rem',
          fontWeight: '800',
          background: `linear-gradient(45deg, ${COLORS.primary}, #ff6b6b, #4ecdc4)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🤖 AI 자동 리포트 생성기
        </h3>
        <p style={{
          margin: 0,
          color: theme.subtext,
          fontSize: '1rem',
          fontStyle: 'italic'
        }}>
          질문하면 {selectedStock}에 대한 전문적인 분석 리포트를 자동 생성해드립니다
        </p>
      </div>

      {/* 질문 입력 섹션 */}
      <div style={{
        background: darkMode ? '#1a1a1a' : '#f8f9fa',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: `2px solid ${theme.border}`
      }}>
        <h4 style={{
          margin: '0 0 1rem 0',
          color: COLORS.primary,
          fontSize: '1.2rem',
          fontWeight: '700'
        }}>
          💬 질문 입력
        </h4>

        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <input
            type="text"
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder="예: 이 종목의 리스크는 무엇인가요?"
            style={{
              flex: 1,
              padding: '1rem',
              border: `2px solid ${theme.border}`,
              borderRadius: '12px',
              background: theme.bg,
              color: theme.text,
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                generateReport();
              }
            }}
          />
          
          <button
            onClick={generateReport}
            disabled={isGenerating || !currentQuestion.trim()}
            style={{
              background: isGenerating || !currentQuestion.trim() 
                ? `linear-gradient(45deg, #95a5a6, #bdc3c7)` 
                : `linear-gradient(45deg, ${COLORS.primary}, #4ecdc4)`,
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              cursor: isGenerating || !currentQuestion.trim() ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '700',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}
          >
            {isGenerating ? '🔄 생성중...' : '📋 리포트 생성'}
          </button>
        </div>

        {/* 추천 질문 */}
        <div>
          <h5 style={{
            margin: '0 0 0.8rem 0',
            color: theme.text,
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            💡 추천 질문
          </h5>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '0.8rem'
          }}>
            {suggestedQuestions.slice(0, 6).map((question, index) => (
              <button
                key={index}
                onClick={() => selectSuggestedQuestion(question)}
                style={{
                  background: darkMode ? '#2a2a2a' : '#fff',
                  border: `2px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '0.8rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: theme.text,
                  textAlign: 'left',
                  transition: 'all 0.3s',
                  lineHeight: '1.3'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = COLORS.primary;
                  e.target.style.background = `${COLORS.primary}10`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = theme.border;
                  e.target.style.background = darkMode ? '#2a2a2a' : '#fff';
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 생성된 리포트 */}
      {generatedReport && (
        <ReportDisplay 
          report={generatedReport} 
          darkMode={darkMode} 
          onDownload={downloadReport}
        />
      )}

      {/* 리포트 히스토리 */}
      {reportHistory.length > 0 && (
        <ReportHistory 
          history={reportHistory} 
          darkMode={darkMode}
          onSelectReport={setGeneratedReport}
        />
      )}
    </div>
  );
}

// 리포트 표시 컴포넌트
function ReportDisplay({ report, darkMode, onDownload }) {
  const theme = darkMode ? COLORS.dark : COLORS.light;
  const [expandedSections, setExpandedSections] = useState(new Set());

  const toggleSection = (sectionName) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div style={{
      background: darkMode ? '#1a1a1a' : '#f8f9fa',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem',
      border: `2px solid ${COLORS.primary}40`
    }}>
      {/* 리포트 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem'
      }}>
        <div>
          <h4 style={{
            margin: '0 0 0.5rem 0',
            color: COLORS.primary,
            fontSize: '1.4rem',
            fontWeight: '700'
          }}>
            {report.title}
          </h4>
          <p style={{
            margin: '0 0 0.5rem 0',
            color: theme.subtext,
            fontSize: '0.9rem'
          }}>
            질문: "{report.question}"
          </p>
          <p style={{
            margin: 0,
            color: theme.subtext,
            fontSize: '0.8rem'
          }}>
            생성일시: {new Date(report.timestamp).toLocaleString()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onDownload('markdown')}
            style={{
              background: `linear-gradient(45deg, ${COLORS.info}, #74b9ff)`,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}
          >
            📄 MD
          </button>
          <button
            onClick={() => onDownload('html')}
            style={{
              background: `linear-gradient(45deg, ${COLORS.warning}, #fdcb6e)`,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}
          >
            🌐 HTML
          </button>
          <button
            onClick={() => onDownload('json')}
            style={{
              background: `linear-gradient(45deg, ${COLORS.success}, #00b894)`,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}
          >
            📊 JSON
          </button>
        </div>
      </div>

      {/* 요약 */}
      <div style={{
        background: `${COLORS.primary}10`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: `2px solid ${COLORS.primary}30`
      }}>
        <h5 style={{
          margin: '0 0 1rem 0',
          color: COLORS.primary,
          fontSize: '1.1rem',
          fontWeight: '700'
        }}>
          📝 종합 평가
        </h5>
        <p style={{
          margin: '0 0 1rem 0',
          color: theme.text,
          fontSize: '1rem',
          lineHeight: '1.5',
          fontWeight: '500'
        }}>
          {report.summary.overallAssessment}
        </p>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.9rem',
          color: theme.subtext
        }}>
          <span>신뢰도: {getConfidenceBadge(report.summary.confidence)}</span>
          <span>분류: {report.classification.category.toUpperCase()}</span>
        </div>
      </div>

      {/* 주요 포인트 */}
      <div style={{
        background: darkMode ? '#2a2a2a' : '#fff',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: `1px solid ${theme.border}`
      }}>
        <h5 style={{
          margin: '0 0 1rem 0',
          color: theme.text,
          fontSize: '1.1rem',
          fontWeight: '700'
        }}>
          🎯 주요 포인트
        </h5>
        <ul style={{
          margin: 0,
          paddingLeft: '1.5rem',
          color: theme.text,
          lineHeight: '1.6'
        }}>
          {report.summary.keyPoints.map((point, index) => (
            <li key={index} style={{ marginBottom: '0.5rem' }}>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* 상세 섹션 */}
      <div style={{
        background: darkMode ? '#2a2a2a' : '#fff',
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        <h5 style={{
          margin: 0,
          padding: '1.2rem',
          background: darkMode ? '#333' : '#f8f9fa',
          color: theme.text,
          fontSize: '1.1rem',
          fontWeight: '700',
          borderBottom: `1px solid ${theme.border}`
        }}>
          📊 상세 분석
        </h5>

        {Object.entries(report.sections).map(([sectionName, section], index) => (
          <div key={sectionName} style={{
            borderBottom: index < Object.keys(report.sections).length - 1 ? `1px solid ${theme.border}` : 'none'
          }}>
            <button
              onClick={() => toggleSection(sectionName)}
              style={{
                width: '100%',
                padding: '1rem 1.2rem',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: theme.text,
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              <span>{section.title}</span>
              <span style={{
                color: COLORS.primary,
                fontSize: '1.2rem',
                transition: 'transform 0.3s',
                transform: expandedSections.has(sectionName) ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </button>

            {expandedSections.has(sectionName) && (
              <div style={{ padding: '0 1.2rem 1.5rem 1.2rem' }}>
                <p style={{
                  margin: '0 0 1rem 0',
                  color: theme.text,
                  lineHeight: '1.5'
                }}>
                  {section.content}
                </p>

                {Object.keys(section.keyMetrics).length > 0 && (
                  <div style={{
                    background: `${COLORS.info}10`,
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '1rem'
                  }}>
                    <h6 style={{
                      margin: '0 0 0.8rem 0',
                      color: COLORS.info,
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}>
                      주요 지표
                    </h6>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '0.8rem'
                    }}>
                      {Object.entries(section.keyMetrics).map(([key, value]) => (
                        <div key={key} style={{
                          background: darkMode ? '#2a2a2a' : '#fff',
                          padding: '0.6rem',
                          borderRadius: '6px',
                          border: `1px solid ${theme.border}`
                        }}>
                          <div style={{
                            fontSize: '0.8rem',
                            color: theme.subtext,
                            marginBottom: '0.2rem'
                          }}>
                            {key}
                          </div>
                          <div style={{
                            fontSize: '0.9rem',
                            color: theme.text,
                            fontWeight: '600'
                          }}>
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 추천사항 */}
      <div style={{
        background: `${COLORS.success}10`,
        borderRadius: '12px',
        padding: '1.5rem',
        border: `2px solid ${COLORS.success}30`
      }}>
        <h5 style={{
          margin: '0 0 1rem 0',
          color: COLORS.success,
          fontSize: '1.1rem',
          fontWeight: '700'
        }}>
          💡 추천사항
        </h5>
        <ul style={{
          margin: 0,
          paddingLeft: '1.5rem',
          color: theme.text,
          lineHeight: '1.6'
        }}>
          {report.recommendations.map((recommendation, index) => (
            <li key={index} style={{ marginBottom: '0.5rem' }}>
              {recommendation}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// 리포트 히스토리 컴포넌트
function ReportHistory({ history, darkMode, onSelectReport }) {
  const theme = darkMode ? COLORS.dark : COLORS.light;

  return (
    <div style={{
      background: darkMode ? '#1a1a1a' : '#f8f9fa',
      borderRadius: '16px',
      padding: '1.5rem',
      border: `2px solid ${theme.border}`
    }}>
      <h4 style={{
        margin: '0 0 1rem 0',
        color: COLORS.primary,
        fontSize: '1.2rem',
        fontWeight: '700'
      }}>
        📚 최근 생성된 리포트
      </h4>

      <div style={{
        display: 'grid',
        gap: '0.8rem'
      }}>
        {history.map((report, index) => (
          <button
            key={report.id}
            onClick={() => onSelectReport(report)}
            style={{
              background: darkMode ? '#2a2a2a' : '#fff',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.3s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = COLORS.primary;
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = theme.border;
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <div>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: theme.text,
                marginBottom: '0.3rem'
              }}>
                {report.question}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: theme.subtext
              }}>
                {new Date(report.createdAt).toLocaleString()}
              </div>
            </div>
            
            <div style={{
              fontSize: '0.8rem',
              color: COLORS.primary,
              fontWeight: '600'
            }}>
              {report.classification.category.toUpperCase()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// 신뢰도 배지 생성
function getConfidenceBadge(confidence) {
  const colors = {
    high: COLORS.success,
    medium: COLORS.warning,
    low: COLORS.danger
  };

  const labels = {
    high: '높음',
    medium: '보통',
    low: '낮음'
  };

  return (
    <span style={{
      background: colors[confidence] || COLORS.secondary,
      color: '#fff',
      padding: '0.2rem 0.5rem',
      borderRadius: '12px',
      fontSize: '0.7rem',
      fontWeight: '600',
      textTransform: 'uppercase'
    }}>
      {labels[confidence] || confidence}
    </span>
  );
}

export default AutoReportGenerator; 