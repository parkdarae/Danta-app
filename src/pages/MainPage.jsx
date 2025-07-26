import React, { useState, useEffect, useCallback } from 'react';
import CategoryNavigation from '../components/CategoryNavigation';
import CharacterReaction from '../components/CharacterReaction';
import EmotionButtons from '../components/EmotionButtons';
import TodayPicks from '../components/TodayPicks';
import AIJudgement from '../components/AIJudgement';
import StockChart from '../components/StockChart';
import RealtimeNewsSection from '../components/RealtimeNewsSection';
import AIChatSection from '../components/AIChatSection';
import AIProfileReport from '../components/AIProfileReport';
import PsyScoreSection from '../components/PsyScoreSection';
import InvestmentMemo from '../components/InvestmentMemo';
import VolumeAnomalyTracker from '../components/VolumeAnomalyTracker';
import MyPurchaseList from '../components/MyPurchaseList';
import RealtimeFetchDemo from '../components/RealtimeFetchDemo';
import DataBackupRestore from '../components/DataBackupRestore';
import TutorialHelper from '../components/TutorialHelper';
import CustomDashboard from '../components/CustomDashboard';
import DataExportPanel from '../components/DataExportPanel';
import DataMiningFramework from '../components/DataMiningFramework';
import AutoReportGenerator from '../components/AutoReportGenerator';
import PerformanceMonitor from '../components/PerformanceMonitor';
import SimpleTOSTable from '../components/SimpleTOSTable';
import WatchlistManager from '../components/WatchlistManager';
import PortfolioOCR from '../components/PortfolioOCR';
import EnhancedNewsAnalyzer from '../components/EnhancedNewsAnalyzer';
import EnhancedStockSearch from '../components/EnhancedStockSearch';
import StockAlertSystem from '../components/StockAlertSystem';
import EmotionalTradingTracker from '../components/EmotionalTradingTracker';
import MetaCognitionReport from '../components/MetaCognitionReport';
import KeywordToStockWorkflow from '../components/KeywordToStockWorkflow';
import UserPage from '../components/UserPage';
import EnhancedChaessaemAI from '../components/EnhancedChaessaemAI';
import AIModelSettings from '../components/AIModelSettings';
import AIStockMentor from '../components/AIStockMentor';
import InteractiveGuide from '../components/InteractiveGuide';
import { useChaessaemNotification, ChaessaemNotificationContainer } from '../components/ChaessaemNotification';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTypography } from '../hooks/useTypography';
import { STORAGE_KEYS, STOCKS } from '../utils/constants';

function MainPage() {
  const [emotion, setEmotion] = useState('neutral');
  const [selectedStock, setSelectedStock] = useLocalStorage(STORAGE_KEYS.SELECTED_STOCK, STOCKS[1]);
  const [chartType, setChartType] = useLocalStorage(STORAGE_KEYS.CHART_TYPE, '5min');
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useLocalStorage(STORAGE_KEYS.DARK_MODE, false);
  const [miningResults, setMiningResults] = useState(null);
  const [currentCategory, setCurrentCategory] = useLocalStorage('current_category', 'user');
  const [userWatchlist, setUserWatchlist] = useState(['UAVS', 'AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'META']);
  const [userPortfolio, setUserPortfolio] = useState([]);
  const [isFirstVisit, setIsFirstVisit] = useLocalStorage('is_first_visit', true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [generatedKeywords, setGeneratedKeywords] = useState([]);
  
  const typography = useTypography(darkMode);
  const notification = useChaessaemNotification();

  const toggleDarkMode = useCallback(() => {
    setDarkMode(dm => !dm);
  }, [setDarkMode]);

  // 첫 방문 시 웰컴 메시지
  useEffect(() => {
    if (isFirstVisit) {
      setTimeout(() => {
        notification.success(
          '채쌤과 함께하는 스마트 투자 여정에 오신 것을 환영합니다! 🎉',
          {
            title: '환영합니다!',
            duration: 8000,
            position: 'center'
          }
        );
      }, 2000);
    }
  }, [isFirstVisit, notification]);

  // 관심종목 변경 콜백
  const handleWatchlistChange = useCallback((newWatchlist) => {
    setUserWatchlist(newWatchlist);
  }, []);

  // 포트폴리오 변경 콜백
  const handlePortfolioUpdate = useCallback((newPortfolio) => {
    setUserPortfolio(newPortfolio);
  }, []);

  // 카테고리별 컴포넌트 렌더링 함수
  const renderCategoryComponents = () => {
    const accent = '#8884d8';
    
    switch (currentCategory) {
      case 'user':
        return (
          <>
            <UserPage darkMode={darkMode} />
          </>
        );
      case 'trading':
        return (
          <>
            <TutorialHelper darkMode={darkMode} />
            <CharacterReaction emotion={emotion} darkMode={darkMode} />
            <EmotionButtons onSelect={handleEmotion} darkMode={darkMode} />
            <EnhancedStockSearch 
              onStockSelect={(stockData) => setSelectedStock(stockData.name || stockData.symbol)} 
              onWatchlistAdd={(stock) => {
                if (!userWatchlist.includes(stock.symbol)) {
                  setUserWatchlist([...userWatchlist, stock.symbol]);
                }
              }}
              darkMode={darkMode}
              selectedStock={selectedStock}
            />
            <WatchlistManager 
              darkMode={darkMode}
              onWatchlistChange={handleWatchlistChange}
            />
            <SimpleTOSTable 
              darkMode={darkMode}
              watchlist={userWatchlist}
            />
            <StockAlertSystem 
              darkMode={darkMode}
              watchlist={userWatchlist}
            />
            <div style={{ textAlign: 'center', marginBottom: 8, display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button
                onClick={() => setChartType('5min')}
                style={{
                  background: chartType === '5min' ? accent : 'transparent',
                  color: chartType === '5min' ? '#fff' : (darkMode ? accent : '#333'),
                  border: `2px solid ${accent}`,
                  borderRadius: '12px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
              >
                5분봉
              </button>
              <button
                onClick={() => setChartType('1h')}
                style={{
                  background: chartType === '1h' ? accent : 'transparent',
                  color: chartType === '1h' ? '#fff' : (darkMode ? accent : '#333'),
                  border: `2px solid ${accent}`,
                  borderRadius: '12px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
              >
                1시간봉
              </button>
              <button
                onClick={() => setChartType('1d')}
                style={{
                  background: chartType === '1d' ? accent : 'transparent',
                  color: chartType === '1d' ? '#fff' : (darkMode ? accent : '#333'),
                  border: `2px solid ${accent}`,
                  borderRadius: '12px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
              >
                일봉
              </button>
            </div>
            <StockChart stock={selectedStock} period={chartType} darkMode={darkMode} />
            <TodayPicks darkMode={darkMode} />
            <AIJudgement darkMode={darkMode} />
            <VolumeAnomalyTracker stock={selectedStock} darkMode={darkMode} />
          </>
        );
      
      case 'analysis':
        return (
          <>
            <DataMiningFramework 
              selectedStock={selectedStock} 
              darkMode={darkMode} 
              onAnalysisComplete={setMiningResults}
            />
            <AIProfileReport darkMode={darkMode} />
            <PsyScoreSection darkMode={darkMode} />
            <AIChatSection darkMode={darkMode} />
            <AutoReportGenerator darkMode={darkMode} />
          </>
        );
      
      case 'news':
        return (
          <>
            <EnhancedNewsAnalyzer 
              darkMode={darkMode} 
              selectedStock={selectedStock}
            />
            <RealtimeNewsSection stock={selectedStock} darkMode={darkMode} />
            <RealtimeFetchDemo darkMode={darkMode} />
          </>
        );
      
      case 'portfolio':
        return (
          <>
            <PortfolioOCR 
              darkMode={darkMode}
              onPortfolioUpdate={handlePortfolioUpdate}
            />
            <MyPurchaseList darkMode={darkMode} />
            <InvestmentMemo darkMode={darkMode} />
            <div style={{
              marginTop: 24, 
              background: darkMode ? '#23272b' : '#fff', 
              borderRadius: 8, 
              boxShadow: darkMode ? '0 1px 4px #0008' : '0 1px 4px #0001', 
              padding: '1rem 0.7rem', 
              border: `1px solid ${darkMode ? '#333' : '#eee'}`
            }}>
              <h4 style={{margin: '0 0 8px 0', fontSize: '1.1rem', color: darkMode ? '#e0e0e0' : '#222'}}>
                판단/감정 기록 (최근 20개)
              </h4>
              <ul style={{fontSize: '0.97rem', color: darkMode ? '#aaa' : '#888', paddingLeft: 0, listStyle: 'none', margin: 0}}>
                {history.map((h,i)=>(
                  <li key={i} style={{marginBottom: 4, wordBreak: 'break-all'}}>
                    <span style={{color: darkMode ? '#aaa' : '#888', fontSize: '0.93em'}}>[{h.time}]</span> <b>{h.stock}</b>
                    {h.type === 'ai' ? (
                      <span> / <b>AI질문:</b> {h.question}<br/><b>AI답변:</b> {h.answer}</span>
                    ) : (
                      <span> / 감정: <b>{h.emotion}</b> / 차트: {h.chartType}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </>
        );
      
      case 'psychology':
        return (
          <>
            <TutorialHelper darkMode={darkMode} />
            <EmotionalTradingTracker 
              darkMode={darkMode} 
              selectedStock={selectedStock}
            />
            <MetaCognitionReport darkMode={darkMode} />
            <CharacterReaction emotion={emotion} darkMode={darkMode} />
            <EmotionButtons onSelect={handleEmotion} darkMode={darkMode} />
            <AIProfileReport darkMode={darkMode} />
            <PsyScoreSection darkMode={darkMode} />
          </>
        );
      
      case 'discovery':
        return (
          <>
            <TutorialHelper darkMode={darkMode} />
            <KeywordToStockWorkflow 
              darkMode={darkMode}
              onStockSelect={(stock) => setSelectedStock(stock.symbol || stock.name)}
              onKeywordsGenerated={(keywords) => setGeneratedKeywords(keywords)}
            />
          </>
        );
      
      case 'ai-chat':
        return (
          <>
            <EnhancedChaessaemAI 
              darkMode={darkMode}
              userProfile={JSON.parse(localStorage.getItem('user_profile') || '{}')}
              currentContext={`현재 선택된 종목: ${selectedStock || '없음'}`}
              onResponse={(response) => console.log('채쌤 응답:', response)}
            />
          </>
        );
      
      case 'tools':
        return (
          <>
            <AIModelSettings 
              darkMode={darkMode}
              onModelChange={(config) => console.log('AI 모델 변경:', config)}
            />
            <DataBackupRestore darkMode={darkMode} />
            <DataExportPanel darkMode={darkMode} />
            <CustomDashboard darkMode={darkMode} />
          </>
        );
      
      default:
        return <div>카테고리를 선택해주세요</div>;
    }
  };

  // 기록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('darong_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // 감정 버튼 클릭 시 기록 저장
  const handleEmotion = (emo) => {
    setEmotion(emo);
    const newRecord = {
      time: new Date().toLocaleString(),
      stock: selectedStock,
      emotion: emo,
      chartType,
    };
    const newHistory = [newRecord, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('darong_history', JSON.stringify(newHistory));

    // 감정별 채쌤 알림
    const emotionMessages = {
      excited: '와! 흥미진진한 투자 타이밍이네요! 하지만 너무 성급하지 마세요 😊',
      happy: '좋은 기분이네요! 수익이 날 때일수록 차분함을 유지하세요 ✨',
      confident: '자신감이 넘치시네요! 과신은 금물, 항상 리스크 관리를 잊지 마세요 💪',
      worried: '걱정되시는군요. 이럴 때일수록 차분히 데이터를 분석해보세요 🤔',
      surprised: '놀라운 상황이군요! 예상치 못한 변동성에 대비하세요 😲',
      greed: '수익에 대한 욕심이 생기셨나요? 적절한 수익실현도 중요해요 💰',
      fear: '두려움을 느끼고 계시네요. 감정적 판단보다는 객관적 분석이 필요해요 😰'
    };

    if (emotionMessages[emo]) {
      notification.info(emotionMessages[emo], {
        title: '채쌤의 감정 코칭',
        duration: 6000
      });
    }
  };

  const bg = darkMode ? '#181a1b' : '#f8f9fa';
  const card = darkMode ? '#23272b' : '#fff';
  const text = darkMode ? '#e0e0e0' : '#222';
  const subtext = darkMode ? '#aaa' : '#888';
  const accent = '#8884d8';

  return (
    <div style={{
      fontFamily: 'sans-serif',
      background: bg,
      minHeight: '100vh',
      color: text,
      transition: 'background 0.3s, color 0.3s',
    }}>
      {/* 카테고리 네비게이션 */}
      <CategoryNavigation 
        currentCategory={currentCategory}
        onCategoryChange={setCurrentCategory}
        darkMode={darkMode}
      />

      {/* 메인 컨텐츠 영역 */}
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '5rem 1rem 4rem 1rem',
        boxSizing: 'border-box',
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
          background: card,
          borderRadius: 12,
          padding: '1rem',
          boxShadow: darkMode ? '0 2px 12px #0008' : '0 2px 12px rgba(0,0,0,0.07)',
        }}>
          <h1 style={{ 
            textAlign: 'center', 
            fontSize: '2.1rem', 
            marginBottom: 0, 
            letterSpacing: '-1px', 
            color: accent,
            flex: 1
          }}>
            Danta Trader App
          </h1>
          <button 
            onClick={toggleDarkMode} 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.7rem',
              cursor: 'pointer',
              color: darkMode ? accent : '#333',
              marginLeft: 8
            }} 
            title="다크모드 토글"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>

        {/* 카테고리 안내 */}
        <p style={{ 
          textAlign: 'center', 
          color: subtext, 
          fontSize: '1.1rem', 
          marginBottom: 16,
          background: card,
          borderRadius: 8,
          padding: '0.8rem',
          boxShadow: darkMode ? '0 1px 6px #0005' : '0 1px 6px rgba(0,0,0,0.05)',
        }}>
          📂 {(() => {
            switch(currentCategory) {
              case 'user': return '👤 내 프로필';
              case 'trading': return '📈 트레이딩 도구';
              case 'analysis': return '🔍 분석 도구';
              case 'news': return '📰 뉴스 정보';
              case 'portfolio': return '💼 포트폴리오';
              case 'psychology': return '🧠 감정 & 메타인지';
              case 'discovery': return '🚀 키워드 종목 발굴';
              case 'ai-chat': return '🤖 AI 채팅';
              case 'tools': return '🛠️ 관리 도구';
              default: return '카테고리 선택';
            }
          })()}
        </p>

        {/* 카테고리별 컴포넌트 */}
        <div style={{
          display: 'grid',
          gap: '1rem',
        }}>
          {renderCategoryComponents()}
        </div>
      </div>

      {/* 성능 모니터 */}
      <PerformanceMonitor darkMode={darkMode} />
      
      {/* AI 주식 멘토 시스템 */}
      <AIStockMentor
        darkMode={darkMode}
        currentSection={currentCategory}
        userLevel="beginner"
        keywords={generatedKeywords}
        selectedStock={selectedStock}
        isFirstVisit={isFirstVisit}
        userProfile={JSON.parse(localStorage.getItem('user_profile') || '{}')}
        data-guide="ai-mentor"
      />
      
      {/* 인터랙티브 가이드 */}
      <InteractiveGuide
        darkMode={darkMode}
        currentSection={currentCategory}
        showOnboarding={isFirstVisit}
        onComplete={() => {
          setIsFirstVisit(false);
          setShowOnboarding(false);
        }}
      />
      
      {/* 채쌤 알림 시스템 */}
      <ChaessaemNotificationContainer
        notifications={notification.notifications}
        darkMode={darkMode}
      />
    </div>
  );
}

export default MainPage; 