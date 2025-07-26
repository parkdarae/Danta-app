// 한국투자증권 API 인터페이스
class KISAPIClient {
  constructor() {
    this.baseURL = 'https://openapi.koreainvestment.com:9443';
    this.appKey = process.env.REACT_APP_KIS_APP_KEY;
    this.appSecret = process.env.REACT_APP_KIS_APP_SECRET;
    this.accessToken = null;
  }

  // 접근 토큰 발급
  async getAccessToken() {
    if (this.accessToken) return this.accessToken;

    try {
      const response = await fetch(`${this.baseURL}/oauth2/tokenP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          appkey: this.appKey,
          appsecret: this.appSecret
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        return this.accessToken;
      }
      
      throw new Error('KIS API 토큰 발급 실패');
    } catch (error) {
      console.warn('KIS API 연결 실패, 백업 데이터 사용:', error.message);
      return null;
    }
  }

  // 종목 리스트 조회 (Mock 데이터)
  async getStockList(market = 'ALL') {
    try {
      // 실제 API 호출 대신 백업 데이터 반환
      return this.getBackupStockData(market);
    } catch (error) {
      console.warn('종목 리스트 조회 실패:', error);
      return this.getBackupStockData(market);
    }
  }

  // 백업 종목 데이터
  getBackupStockData(market) {
    const koreanStocks = [
      // IT/기술
      { mksc_shrn_iscd: '005930', hts_kor_isnm: '삼성전자', mktc_scls_kcd: '001' },
      { mksc_shrn_iscd: '000660', hts_kor_isnm: 'SK하이닉스', mktc_scls_kcd: '001' },
      { mksc_shrn_iscd: '035420', hts_kor_isnm: 'NAVER', mktc_scls_kcd: '001' },
      { mksc_shrn_iscd: '035720', hts_kor_isnm: '카카오', mktc_scls_kcd: '001' },
      { mksc_shrn_iscd: '051910', hts_kor_isnm: 'LG화학', mktc_scls_kcd: '001' },
      
      // 자동차/전기차
      { mksc_shrn_iscd: '005380', hts_kor_isnm: '현대차', mktc_scls_kcd: '001' },
      { mksc_shrn_iscd: '012330', hts_kor_isnm: '현대모비스', mktc_scls_kcd: '001' },
      { mksc_shrn_iscd: '373220', hts_kor_isnm: 'LG에너지솔루션', mktc_scls_kcd: '001' },
      
      // 바이오/제약
      { mksc_shrn_iscd: '207940', hts_kor_isnm: '삼성바이오로직스', mktc_scls_kcd: '001' },
      { mksc_shrn_iscd: '068270', hts_kor_isnm: '셀트리온', mktc_scls_kcd: '001' },
      { mksc_shrn_iscd: '196170', hts_kor_isnm: '알테오젠', mktc_scls_kcd: '002' },
      
      // 게임/엔터테인먼트
      { mksc_shrn_iscd: '036570', hts_kor_isnm: '엔씨소프트', mktc_scls_kcd: '001' },
      { mksc_shrn_iscd: '259960', hts_kor_isnm: '크래프톤', mktc_scls_kcd: '001' },
      { mksc_shrn_iscd: '251270', hts_kor_isnm: '넷마블', mktc_scls_kcd: '001' },
      
      // 국방/드론
      { mksc_shrn_iscd: '272210', hts_kor_isnm: '한화시스템', mktc_scls_kcd: '001' },
      { mksc_shrn_iscd: '047810', hts_kor_isnm: '한국항공우주', mktc_scls_kcd: '001' },
      
      // 우주/항공
      { mksc_shrn_iscd: '189300', hts_kor_isnm: '인텔리안테크', mktc_scls_kcd: '002' },
      { mksc_shrn_iscd: '218410', hts_kor_isnm: 'RFHIC', mktc_scls_kcd: '002' },
      
      // 친환경/에너지
      { mksc_shrn_iscd: '003490', hts_kor_isnm: '대한항공', mktc_scls_kcd: '001' },
      { mksc_shrn_iscd: '015760', hts_kor_isnm: '한국전력', mktc_scls_kcd: '001' }
    ];

    return market === 'KOSDAQ' 
      ? koreanStocks.filter(stock => stock.mktc_scls_kcd === '002')
      : market === 'KOSPI'
      ? koreanStocks.filter(stock => stock.mktc_scls_kcd === '001')
      : koreanStocks;
  }
}

// 싱글톤 인스턴스
const kisAPI = new KISAPIClient();

export { kisAPI };
export default kisAPI; 