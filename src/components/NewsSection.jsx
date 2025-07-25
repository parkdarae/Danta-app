import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewsTrendSummary from './NewsTrendSummary';

// 샘플 뉴스 데이터 (API 실패 시 fallback)
const sampleNews = {
  '에이지이글': [
    {
      title: '에이지이글, 거래량 급증…신사업 기대감',
      summary: '에이지이글이 신사업 진출 소식에 거래량이 급증하고 있습니다. 투자자들의 관심이 집중되고 있습니다.',
      url: '#',
    },
    {
      title: '에이지이글, 유상증자 결정',
      summary: '에이지이글이 유상증자를 결정했다는 소식에 주가 변동성이 커지고 있습니다.',
      url: '#',
    },
  ],
  '삼성전자': [
    {
      title: '삼성전자, AI 반도체 수혜 기대',
      summary: '삼성전자가 AI 반도체 시장에서 두각을 나타내며 투자자들의 기대를 모으고 있습니다.',
      url: '#',
    },
    {
      title: '삼성전자, 외국인 순매수 지속',
      summary: '외국인 투자자들의 순매수가 이어지며 주가가 강세를 보이고 있습니다.',
      url: '#',
    },
  ],
  '카카오': [
    {
      title: '카카오, 단기 저점 반등 시도',
      summary: '카카오가 최근 하락세를 딛고 단기 반등을 시도하고 있습니다.',
      url: '#',
    },
    {
      title: '카카오, 신규 서비스 출시',
      summary: '카카오가 신규 서비스를 출시하며 시장의 주목을 받고 있습니다.',
      url: '#',
    },
  ],
};

// NewsAPI 예시 (실제 사용 시 API 키 필요)
async function fetchNews(keyword) {
  // const apiKey = 'YOUR_NEWSAPI_KEY';
  // const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&language=ko&sortBy=publishedAt&apiKey=${apiKey}`;
  // const res = await axios.get(url);
  // return res.data.articles.map(a => ({
  //   title: a.title,
  //   summary: a.description || '',
  //   url: a.url,
  // }));
  return null; // 실제 API 연동 시 위 코드 사용
}

function NewsSection({ stock = '에이지이글' }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sentiments, setSentiments] = useState({}); // 뉴스별 긍/부정 판단

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // 실제 API 연동 시 아래 주석 해제
        // const newsList = await fetchNews(stock);
        // if (!ignore && newsList) setNews(newsList);
        // else setNews(sampleNews[stock] || []);
        setNews(sampleNews[stock] || []);
      } catch (e) {
        setError('뉴스 불러오기 실패, 샘플 데이터로 대체합니다.');
        setNews(sampleNews[stock] || []);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [stock]);

  // 긍/부정 판단 버튼 클릭 핸들러
  const handleSentiment = (idx, value) => {
    setSentiments(s => ({ ...s, [idx]: value }));
  };

  // 리스크 요약(샘플: 부정 뉴스 개수)
  const riskScore = Object.values(sentiments).filter(v => v === 'negative').length;

  // 오퍼링/디룩션/전환청구/유상증자 등 경고 키워드 감지
  const alertKeywords = ['오퍼링', '디룩션', '전환청구', '유상증자'];
  const alertNews = news.filter(item =>
    alertKeywords.some(kw =>
      (item.title && item.title.includes(kw)) || (item.summary && item.summary.includes(kw))
    )
  );

  return (
    <div style={{ margin: '1.5rem 0', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
      <h3>실시간 뉴스/리스크 요약</h3>
      {alertNews.length > 0 && (
        <div style={{background:'#ffebee',color:'#b71c1c',padding:'0.5rem 1rem',borderRadius:6,marginBottom:8,fontWeight:'bold',fontSize:'1.05rem',border:'1px solid #f44336'}}>
          🚨 오퍼링/디룩션/전환청구/유상증자 관련 경보 감지!
          <ul style={{margin:'6px 0 0 0',paddingLeft:18,fontSize:'0.97rem',color:'#b71c1c'}}>
            {alertNews.map((n,i)=>(<li key={i}>{n.title}</li>))}
          </ul>
        </div>
      )}
      {loading && <div>뉴스 불러오는 중...</div>}
      {error && <div style={{ color: 'red', fontSize: '0.95rem' }}>{error}</div>}
      <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
        {news.map((item, idx) => (
          <li key={idx} style={{ marginBottom: '1rem', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', color: '#333', textDecoration: 'none' }}>{item.title}</a>
            <div style={{ fontSize: '0.97rem', color: '#555', margin: '0.3rem 0' }}>{item.summary}</div>
            <div>
              <button
                onClick={() => handleSentiment(idx, 'positive')}
                style={{
                  background: sentiments[idx] === 'positive' ? '#4caf50' : '#eee',
                  color: sentiments[idx] === 'positive' ? '#fff' : '#333',
                  border: 'none', borderRadius: 4, padding: '0.2rem 0.7rem', marginRight: 6, cursor: 'pointer',
                }}
              >
                긍정
              </button>
              <button
                onClick={() => handleSentiment(idx, 'negative')}
                style={{
                  background: sentiments[idx] === 'negative' ? '#f44336' : '#eee',
                  color: sentiments[idx] === 'negative' ? '#fff' : '#333',
                  border: 'none', borderRadius: 4, padding: '0.2rem 0.7rem', cursor: 'pointer',
                }}
              >
                부정
              </button>
            </div>
          </li>
        ))}
      </ul>
      <NewsTrendSummary news={news} />
      <div style={{ marginTop: 8, color: riskScore > 0 ? '#f44336' : '#4caf50', fontWeight: 'bold' }}>
        리스크 요약: {riskScore > 0 ? `부정 뉴스 ${riskScore}건 감지` : '특이 리스크 없음'}
      </div>
    </div>
  );
}

export default NewsSection; 