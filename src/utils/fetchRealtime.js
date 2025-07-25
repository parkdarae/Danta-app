import axios from 'axios';

// 종목명 → Yahoo Finance 심볼 매핑
export const symbolMap = {
  '에이지이글': '060540.KQ', // 코스닥
  '삼성전자': '005930.KS', // 코스피
  '카카오': '035720.KS', // 코스피
};

// symbol 예시: '005930.KS'(삼성전자), 'AAPL'(애플)
export async function fetchYahooRealtime(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    const res = await axios.get(url);
    const result = res.data.chart.result[0];
    const lastIdx = result.timestamp.length - 1;
    const price = result.indicators.quote[0].close[lastIdx];
    const volume = result.indicators.quote[0].volume[lastIdx];
    const time = new Date(result.timestamp[lastIdx] * 1000);
    return {
      price,
      volume,
      time: time.toLocaleString(),
      symbol,
      currency: result.meta.currency,
      exchange: result.meta.exchangeName,
    };
  } catch (e) {
    console.error('실시간 데이터 조회 실패:', e);
    throw new Error('실시간 데이터 조회 실패');
  }
}

// 차트 데이터 가져오기 (5분봉, 1시간봉 등)
export async function fetchChartData(symbol, interval = '5m', range = '1d') {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    const res = await axios.get(url);
    const result = res.data.chart.result[0];
    
    const chartData = result.timestamp.map((timestamp, index) => ({
      time: new Date(timestamp * 1000).toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      price: result.indicators.quote[0].close[index] || 0,
      volume: result.indicators.quote[0].volume[index] || 0,
      open: result.indicators.quote[0].open[index] || 0,
      high: result.indicators.quote[0].high[index] || 0,
      low: result.indicators.quote[0].low[index] || 0,
    })).filter(item => item.price > 0);

    return chartData;
  } catch (e) {
    console.error('차트 데이터 조회 실패:', e);
    return null;
  }
}

// 주식 기본 정보 가져오기
export async function fetchStockInfo(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,price`;
    const res = await axios.get(url);
    const result = res.data.quoteSummary.result[0];
    
    return {
      currentPrice: result.price.regularMarketPrice?.raw || 0,
      previousClose: result.price.regularMarketPreviousClose?.raw || 0,
      dayChange: result.price.regularMarketChange?.raw || 0,
      dayChangePercent: result.price.regularMarketChangePercent?.raw || 0,
      marketCap: result.summaryDetail.marketCap?.raw || 0,
      volume: result.price.regularMarketVolume?.raw || 0,
      currency: result.price.currency || 'KRW',
    };
  } catch (e) {
    console.error('주식 정보 조회 실패:', e);
    return null;
  }
}

// 거래량 이상 감지
export function detectVolumeAnomaly(chartData, threshold = 2.0) {
  if (!chartData || chartData.length < 10) return [];
  
  const avgVolume = chartData.slice(-10).reduce((sum, item) => sum + item.volume, 0) / 10;
  const anomalies = [];
  
  chartData.forEach((item, index) => {
    if (item.volume > avgVolume * threshold) {
      anomalies.push({
        time: item.time,
        volume: item.volume,
        avgVolume: Math.round(avgVolume),
        ratio: (item.volume / avgVolume).toFixed(2),
        index
      });
    }
  });
  
  return anomalies;
}

// 뉴스 데이터 가져오기 (Yahoo Finance News)
export async function fetchStockNews(symbol, limit = 5) {
  try {
    // Yahoo Finance News API (비공식)
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&lang=ko&region=KR&quotesCount=1&newsCount=${limit}`;
    const res = await axios.get(url);
    
    if (res.data.news && res.data.news.length > 0) {
      return res.data.news.map(news => ({
        title: news.title || '제목 없음',
        summary: news.summary || news.title || '내용 요약이 없습니다.',
        url: news.link || '#',
        publishTime: news.providerPublishTime ? new Date(news.providerPublishTime * 1000).toLocaleString() : '시간 정보 없음',
        provider: news.publisher || '출처 불명'
      }));
    }
    
    return [];
  } catch (e) {
    console.error('뉴스 데이터 조회 실패:', e);
    return [];
  }
}

// 다양한 소스에서 종목 관련 뉴스 수집
export async function fetchStockNewsMultiple(stockName, symbol) {
  const newsResults = [];
  
  try {
    // 1. Yahoo Finance 뉴스
    const yahooNews = await fetchStockNews(symbol);
    newsResults.push(...yahooNews);
    
    // 2. 추가 뉴스 소스가 있다면 여기에 추가
    // 예: Google News API, 네이버 뉴스 API 등
    
  } catch (e) {
    console.error('종합 뉴스 수집 실패:', e);
  }
  
  // 중복 제거 및 정렬
  const uniqueNews = newsResults.filter((news, index, self) => 
    index === self.findIndex(n => n.title === news.title)
  );
  
  return uniqueNews.slice(0, 10); // 최대 10개
}

// 뉴스 감정 분석 (간단한 키워드 기반)
export function analyzeNewsSentiment(newsList) {
  const positiveKeywords = ['상승', '급등', '호조', '긍정', '성장', '개선', '증가', '기대', '성공', '수혜'];
  const negativeKeywords = ['하락', '급락', '부진', '악화', '감소', '우려', '위험', '리스크', '손실', '실패'];
  
  let positive = 0;
  let negative = 0;
  let neutral = 0;
  
  newsList.forEach(news => {
    const text = (news.title + ' ' + news.summary).toLowerCase();
    
    const positiveCount = positiveKeywords.filter(keyword => text.includes(keyword)).length;
    const negativeCount = negativeKeywords.filter(keyword => text.includes(keyword)).length;
    
    if (positiveCount > negativeCount) {
      positive++;
    } else if (negativeCount > positiveCount) {
      negative++;
    } else {
      neutral++;
    }
  });
  
  const total = newsList.length;
  return {
    positive: total > 0 ? (positive / total * 100).toFixed(1) : 0,
    negative: total > 0 ? (negative / total * 100).toFixed(1) : 0,
    neutral: total > 0 ? (neutral / total * 100).toFixed(1) : 0,
    summary: positive > negative ? '긍정적' : negative > positive ? '부정적' : '중립적'
  };
} 