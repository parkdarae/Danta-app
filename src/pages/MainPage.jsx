import React, { useState, useEffect, useCallback } from 'react';
import CharacterReaction from '../components/CharacterReaction';
import EmotionButtons from '../components/EmotionButtons';
import TodayPicks from '../components/TodayPicks';
import AIJudgement from '../components/AIJudgement';
import StockSelector from '../components/StockSelector';
import StockChart from '../components/StockChart';
import NewsSection from '../components/NewsSection';
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
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS, STOCKS } from '../utils/constants';

const STOCKS = ['에이지이글', '삼성전자', '카카오'];

function MainPage() {
  const [emotion, setEmotion] = useState('neutral');
  const [selectedStock, setSelectedStock] = useLocalStorage(STORAGE_KEYS.SELECTED_STOCK, STOCKS[1]);
  const [chartType, setChartType] = useLocalStorage(STORAGE_KEYS.CHART_TYPE, '5min');
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useLocalStorage(STORAGE_KEYS.DARK_MODE, false);
  const [viewMode, setViewMode] = useState('classic'); // 'classic' 또는 'dashboard'
  const [miningResults, setMiningResults] = useState(null); // 데이터 마이닝 결과 저장

  const toggleDarkMode = useCallback(() => {
    setDarkMode(dm => !dm);
  }, [setDarkMode]);

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
    const newHistory = [newRecord, ...history].slice(0, 20); // 최근 20개만
    setHistory(newHistory);
    localStorage.setItem('darong_history', JSON.stringify(newHistory));
  };

  const bg = darkMode ? '#181a1b' : '#f8f9fa';
  const card = darkMode ? '#23272b' : '#fff';
  const text = darkMode ? '#e0e0e0' : '#222';
  const subtext = darkMode ? '#aaa' : '#888';
  const border = darkMode ? '#333' : '#eee';
  const accent = '#8884d8';

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      padding: '2rem 1rem 4rem 1rem',
      fontFamily: 'sans-serif',
      background: bg,
      minHeight: '100vh',
      boxSizing: 'border-box',
      borderRadius: 12,
      boxShadow: darkMode ? '0 2px 12px #0008' : '0 2px 12px rgba(0,0,0,0.07)',
      color: text,
      transition: 'background 0.3s, color 0.3s',
    }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
        <h1 style={{ textAlign: 'center', fontSize: '2.1rem', marginBottom: 0, letterSpacing: '-1px', color: accent }}>Danta Trader App</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* 뷰 모드 전환 버튼 */}
          <button 
            onClick={() => setViewMode(viewMode === 'classic' ? 'dashboard' : 'classic')}
            style={{
              background: viewMode === 'dashboard' ? accent : 'transparent',
              color: viewMode === 'dashboard' ? '#fff' : (darkMode ? accent : '#333'),
              border: `2px solid ${accent}`,
              borderRadius: '12px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
            title="보기 모드 전환"
          >
            {viewMode === 'classic' ? '📊 대시보드' : '📋 클래식'}
          </button>
          <button onClick={toggleDarkMode} style={{background:'none',border:'none',fontSize:'1.7rem',cursor:'pointer',color:darkMode?accent:'#333',marginLeft:8}} title="다크모드 토글">
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
      <p style={{ textAlign: 'center', color: subtext, fontSize: '1.1rem', marginBottom: 16 }}>
        단타 중심 실전 매매 도우미 {viewMode === 'dashboard' && '- 커스텀 대시보드'}
      </p>

      {viewMode === 'classic' ? (
        // 클래식 뷰
        <>
          <TutorialHelper darkMode={darkMode} />
          <CharacterReaction emotion={emotion} darkMode={darkMode} />
          <EmotionButtons onSelect={handleEmotion} darkMode={darkMode} />
          <StockSelector stocks={STOCKS} selected={selectedStock} onChange={setSelectedStock} darkMode={darkMode} />
          <div style={{ textAlign: 'center', marginBottom: 8, display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button
              onClick={() => setChartType('5min')}
              style={{
                marginRight: 0,
                background: chartType === '5min' ? accent : (darkMode ? '#333' : '#eee'),
                color: chartType === '5min' ? '#fff' : (darkMode ? '#e0e0e0' : '#333'),
                border: 'none',
                borderRadius: 8,
                padding: '0.5rem 1.2rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: chartType === '5min' ? '0 2px 8px #8884d822' : 'none',
                transition: 'all 0.2s',
              }}
            >
              5분봉
            </button>
            <button
              onClick={() => setChartType('1h')}
              style={{
                background: chartType === '1h' ? accent : (darkMode ? '#333' : '#eee'),
                color: chartType === '1h' ? '#fff' : (darkMode ? '#e0e0e0' : '#333'),
                border: 'none',
                borderRadius: 8,
                padding: '0.5rem 1.2rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: chartType === '1h' ? '0 2px 8px #8884d822' : 'none',
                transition: 'all 0.2s',
              }}
            >
              1시간봉
            </button>
          </div>
          <StockChart stock={selectedStock} chartType={chartType} darkMode={darkMode} />
          <AIJudgement stock={selectedStock} />
          <NewsSection stock={selectedStock} />
          <PsyScoreSection news={(window._lastNewsList||[])} chartData={(window._lastChartData||[])} />
          <AIChatSection stock={selectedStock} onAIAnswer={(ai) => {
            const newRecord = {
              time: ai.time,
              stock: ai.stock,
              emotion: 'AI',
              chartType: '',
              type: 'ai',
              question: ai.question,
              answer: ai.answer,
            };
            const newHistory = [newRecord, ...history].slice(0, 20);
            setHistory(newHistory);
            localStorage.setItem('darong_history', JSON.stringify(newHistory));
          }} />
          <TodayPicks />
          <AIProfileReport history={history} />
          <InvestmentMemo stock={selectedStock} darkMode={darkMode} />
          <VolumeAnomalyTracker stock={selectedStock} darkMode={darkMode} />
          <MyPurchaseList />
          <RealtimeFetchDemo />
          <DataBackupRestore />
          <DataExportPanel darkMode={darkMode} />
          <DataMiningFramework 
            selectedStock={selectedStock} 
            darkMode={darkMode}
            onAnalysisComplete={setMiningResults}
          />
          <AutoReportGenerator 
            selectedStock={selectedStock} 
            analysisData={miningResults}
            darkMode={darkMode} 
          />
        </>
      ) : (
        // 대시보드 뷰
        <>
          <CustomDashboard 
            selectedStock={selectedStock} 
            darkMode={darkMode} 
            onEmotionSelect={handleEmotion}
          />
          <DataExportPanel darkMode={darkMode} />
          <DataMiningFramework 
            selectedStock={selectedStock} 
            darkMode={darkMode}
            onAnalysisComplete={setMiningResults}
          />
          <AutoReportGenerator 
            selectedStock={selectedStock} 
            analysisData={miningResults}
            darkMode={darkMode} 
          />
        </>
      )}
      <div style={{marginTop:24, background:card, borderRadius:8, boxShadow:darkMode?'0 1px 4px #0008':'0 1px 4px #0001', padding:'1rem 0.7rem', border:`1px solid ${border}`}}>
        <h4 style={{margin:'0 0 8px 0', fontSize:'1.1rem', color:text}}>판단/감정 기록 (최근 20개)</h4>
        <ul style={{fontSize:'0.97rem',color:subtext,paddingLeft:0,listStyle:'none',margin:0}}>
          {history.map((h,i)=>(
            <li key={i} style={{marginBottom:4, wordBreak:'break-all'}}>
              <span style={{color:subtext,fontSize:'0.93em'}}>[{h.time}]</span> <b>{h.stock}</b>
              {h.type === 'ai' ? (
                <span> / <b>AI질문:</b> {h.question}<br/><b>AI답변:</b> {h.answer}</span>
              ) : (
                <span> / 감정: <b>{h.emotion}</b> / 차트: {h.chartType}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* 성능 모니터 */}
      <PerformanceMonitor darkMode={darkMode} />
    </div>
  );
}

export default MainPage; 