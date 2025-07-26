// 한국어 종목명 → 미국 주식 심볼 매핑
export const koreanToUSSymbolMapping = {
  // 에이지이글에어리얼 시스템스 - 정확한 매핑
  '에이지이글': ['UAVS'],  // AgEagle Aerial Systems Inc
  '에이지이글에어리얼': ['UAVS'],
  '에이지이글에어리얼사': ['UAVS'],
  '에이지이글에어리얼시스템스': ['UAVS'],
  '에이지이글에어리얼 시스템스': ['UAVS'],
  'AgEagle': ['UAVS'],
  'AgEagle Aerial Systems': ['UAVS'],
  
  // 기타 유사 항공/드론 관련 주식들 (참고용)
  '드론': ['UAVS', 'ACEL', 'PLTR', 'BA'],
  '항공시스템': ['UAVS', 'BA', 'RTX', 'LMT'],
  
  // 기타 한국어로 알려진 미국 주식들
  '애플': 'AAPL',
  '테슬라': 'TSLA',
  '구글': 'GOOGL',
  '마이크로소프트': 'MSFT',
  '아마존': 'AMZN',
  '메타': 'META',
  '넷플릭스': 'NFLX',
  '엔비디아': 'NVDA',
  '인텔': 'INTC',
  '보잉': 'BA',
  
  // 항공우주/방산 관련
  '록히드마틴': 'LMT',
  '레이시온': 'RTX',
  '노스롭그루먼': 'NOC',
  '제너럴다이나믹스': 'GD'
};

// 미국 심볼 검색 헬퍼 함수
export const findUSSymbol = (koreanName) => {
  const symbols = koreanToUSSymbolMapping[koreanName];
  if (Array.isArray(symbols)) {
    return symbols[0]; // 첫 번째 가능한 심볼 반환
  }
  return symbols || null;
};

// 모든 가능한 심볼 반환
export const getAllPossibleUSSymbols = (koreanName) => {
  const symbols = koreanToUSSymbolMapping[koreanName];
  if (Array.isArray(symbols)) {
    return symbols;
  }
  return symbols ? [symbols] : [];
};

// 심볼 자동 변환 함수
export const autoConvertToUSSymbol = (searchTerm) => {
  // 한국어가 포함된 경우 미국 심볼로 변환 시도
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(searchTerm)) {
    const usSymbol = findUSSymbol(searchTerm);
    if (usSymbol) {
      return {
        converted: true,
        originalTerm: searchTerm,
        usSymbol: usSymbol,
        allPossibleSymbols: getAllPossibleUSSymbols(searchTerm)
      };
    }
  }
  
  return {
    converted: false,
    originalTerm: searchTerm,
    usSymbol: searchTerm
  };
}; 