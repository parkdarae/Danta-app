// 공통 색상 팔레트
export const COLORS = {
  primary: '#8884d8',
  success: '#27ae60',
  warning: '#f39c12',
  danger: '#e74c3c',
  info: '#3498db',
  secondary: '#95a5a6',
  
  // 감정별 색상
  emotion: {
    happy: '#27ae60',
    excited: '#f39c12',
    love: '#e91e63',
    sad: '#8e44ad',
    angry: '#e74c3c',
    neutral: '#95a5a6'
  },
  
  // 다크모드 색상
  dark: {
    bg: '#23272b',
    surface: '#2a2a2a',
    border: '#333',
    text: '#e0e0e0',
    subtext: '#aaa'
  },
  
  // 라이트모드 색상
  light: {
    bg: '#fff',
    surface: '#f8f9fa',
    border: '#eee',
    text: '#222',
    subtext: '#666'
  }
};

// 지원하는 종목 목록
export const STOCKS = ['에이지이글', '삼성전자', '카카오'];

// 차트 타입
export const CHART_TYPES = {
  FIVE_MIN: '5min',
  ONE_HOUR: '1h',
  DAILY: '1d'
};

// 감정 카테고리
export const EMOTION_CATEGORIES = {
  ALL: '전체',
  POSITIVE: '긍정적',
  NEUTRAL: '중립적',
  NEGATIVE: '부정적',
  MONEY: '돈/투자',
  SPECIAL: '특별함'
};

// 메모 타입
export const MEMO_TYPES = {
  BUY: { label: '매수', color: '#4caf50', bg: '#e8f5e8' },
  SELL: { label: '매도', color: '#f44336', bg: '#ffeaea' },
  WATCH: { label: '관찰', color: '#ff9800', bg: '#fff3e0' },
  ANALYSIS: { label: '분석', color: '#2196f3', bg: '#e3f2fd' },
  NEWS: { label: '뉴스', color: '#9c27b0', bg: '#f3e5f5' }
};

// 대시보드 위젯 타입
export const WIDGET_TYPES = {
  PRICE: 'price',
  CHART: 'chart',
  VOLUME: 'volume',
  NEWS: 'news',
  EMOTIONS: 'emotions',
  MEMOS: 'memos',
  INDICATORS: 'indicators',
  AI_CHAT: 'ai_chat'
};

// 기본 대시보드 설정 (추천)
export const DEFAULT_DASHBOARD_CONFIG = [
  { id: WIDGET_TYPES.PRICE, title: '현재가', enabled: true, order: 1, size: 'small' },
  { id: WIDGET_TYPES.CHART, title: '차트', enabled: true, order: 2, size: 'large' },
  { id: WIDGET_TYPES.EMOTIONS, title: '감정 기록', enabled: true, order: 3, size: 'medium' },
  { id: WIDGET_TYPES.VOLUME, title: '거래량 분석', enabled: true, order: 4, size: 'medium' },
  { id: WIDGET_TYPES.NEWS, title: '뉴스', enabled: true, order: 5, size: 'medium' },
  { id: WIDGET_TYPES.MEMOS, title: '투자 메모', enabled: false, order: 6, size: 'medium' },
  { id: WIDGET_TYPES.INDICATORS, title: '기술 지표', enabled: false, order: 7, size: 'large' },
  { id: WIDGET_TYPES.AI_CHAT, title: 'AI 도우미', enabled: false, order: 8, size: 'large' }
];

// 데이터 내보내기 형식
export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  XLSX: 'xlsx',
  TABLEAU: 'tableau'
};

// API 엔드포인트
export const API_ENDPOINTS = {
  YAHOO_FINANCE: 'https://query1.finance.yahoo.com/v8/finance/chart/',
  OPENAI: 'https://api.openai.com/v1/chat/completions'
};

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  EMOTIONS: 'danta_emotions',
  MEMOS: 'danta_memos',
  DASHBOARD_CONFIG: 'danta_dashboard_config',
  TUTORIAL_MODE: 'tutorialMode',
  DARK_MODE: 'darkMode',
  SELECTED_STOCK: 'selectedStock',
  CHART_TYPE: 'chartType'
}; 