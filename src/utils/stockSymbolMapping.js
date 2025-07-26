// 한국어 종목명 → 미국 주식 심볼 매핑
export const koreanToUSSymbolMapping = {
  // 에이지이글에어리얼사 관련 심볼들
  '에이지이글': ['ACEL', 'EAGLE', 'AEGL', 'AGE'],
  '에이지이글에어리얼': ['ACEL', 'EAGLE', 'AEGL', 'AERI'],
  '에이지이글에어리얼사': ['ACEL', 'EAGLE', 'AEGL', 'AERI'],
  
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