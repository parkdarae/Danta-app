// AI 채쌤 연동 스마트 주식 검색 서비스
import stockDatabase from '../utils/stockDatabase';

class AIStockSearchService {
  constructor() {
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
    this.searchHistory = this.loadSearchHistory();
    this.userPreferences = this.loadUserPreferences();
  }

  // AI 채쌤과 함께하는 키워드 분석 및 확장
  async analyzeAndExpandKeywords(userKeywords, context = {}) {
    try {
      console.log('🤖 채쌤이 키워드를 분석하고 있어요...');
      
      const prompt = this.createKeywordAnalysisPrompt(userKeywords, context);
      const aiResponse = await this.callOpenAI(prompt);
      
      const expandedKeywords = this.parseKeywordResponse(aiResponse);
      
      // 검색 히스토리에 저장
      this.saveSearchToHistory(userKeywords, expandedKeywords);
      
      return {
        original: userKeywords,
        expanded: expandedKeywords.keywords,
        categories: expandedKeywords.categories,
        suggestions: expandedKeywords.suggestions,
        aiAdvice: expandedKeywords.advice
      };
      
    } catch (error) {
      console.error('AI 키워드 분석 실패:', error);
      // AI 실패 시 기본 키워드 확장 로직 사용
      return this.fallbackKeywordExpansion(userKeywords);
    }
  }

  // AI 키워드 분석 프롬프트 생성
  createKeywordAnalysisPrompt(keywords, context) {
    const keywordStr = keywords.join(', ');
    const userLevel = context.userLevel || 'beginner';
    const preferredMarkets = context.preferredMarkets || ['한국', '미국'];
    const riskLevel = context.riskLevel || 'medium';

    return `
안녕하세요! 저는 LPGA 프로이자 투자 심리 전문가인 채쌤이에요. 
다룡이의 키워드를 분석해서 최적의 투자 종목을 찾아드릴게요! 🏌️‍♀️📈

**분석할 키워드**: ${keywordStr}
**투자자 수준**: ${userLevel}
**선호 시장**: ${preferredMarkets.join(', ')}
**위험 성향**: ${riskLevel}

다음 형식으로 분석해주세요:

1. **확장 키워드** (원래 키워드와 관련된 추가 키워드들):
   - 기술적 키워드: 
   - 산업 분야 키워드:
   - 트렌드 키워드:

2. **카테고리 분류**:
   - 주요 섹터:
   - 투자 테마:
   - 시장 분류:

3. **추천 검색어** (더 구체적인 검색을 위한):
   - 종목명 추천:
   - 관련 ETF:
   - 업종별 키워드:

4. **채쌤의 투자 조언**:
   - 이 키워드 관련 투자 시 주의사항
   - 현재 시장 상황에서의 전망
   - 초보자를 위한 팁

JSON 형식으로 응답해주세요:
{
  "keywords": ["확장된", "키워드", "목록"],
  "categories": {
    "sector": ["섹터1", "섹터2"],
    "theme": ["테마1", "테마2"],
    "market": ["시장1", "시장2"]
  },
  "suggestions": {
    "stocks": ["종목1", "종목2"],
    "etfs": ["ETF1", "ETF2"],
    "sectors": ["업종1", "업종2"]
  },
  "advice": "채쌤의 구체적인 투자 조언과 주의사항"
}
`;
  }

  // OpenAI API 호출
  async callOpenAI(prompt) {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '당신은 LPGA 프로 골퍼이자 투자 심리 전문가인 채쌤입니다. 친근하고 따뜻하면서도 전문적인 조언을 제공하세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // AI 응답 파싱
  parseKeywordResponse(response) {
    try {
      // JSON 부분만 추출
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // JSON 파싱 실패 시 텍스트 파싱
      return this.parseTextResponse(response);
      
    } catch (error) {
      console.error('AI 응답 파싱 실패:', error);
      return this.getDefaultKeywordExpansion();
    }
  }

  // 텍스트 응답 파싱 (JSON 실패 시)
  parseTextResponse(response) {
    const keywords = [];
    const categories = { sector: [], theme: [], market: [] };
    const suggestions = { stocks: [], etfs: [], sectors: [] };
    
    // 간단한 텍스트 파싱 로직
    const lines = response.split('\n');
    lines.forEach(line => {
      if (line.includes('키워드') && line.includes(':')) {
        const extracted = line.split(':')[1]?.split(',').map(k => k.trim()).filter(k => k);
        if (extracted) keywords.push(...extracted);
      }
    });

    return {
      keywords: keywords.slice(0, 10),
      categories,
      suggestions,
      advice: '채쌤이 키워드를 분석해서 관련 종목을 찾아드릴게요!'
    };
  }

  // AI 실패 시 백업 키워드 확장
  fallbackKeywordExpansion(userKeywords) {
    const expandedKeywords = [];
    const keywordMappings = {
      'AI': ['인공지능', '머신러닝', '딥러닝', 'ChatGPT', '자연어처리', '컴퓨터비전'],
      '반도체': ['GPU', 'CPU', 'DRAM', 'NAND', '파운드리', '시스템반도체'],
      '전기차': ['EV', '배터리', '2차전지', '자율주행', '충전인프라', '리튬'],
      '바이오': ['제약', '신약', '백신', '항체', '세포치료', '유전자치료'],
      '게임': ['모바일게임', 'PC게임', '콘솔게임', '메타버스', 'VR', 'AR'],
      '드론': ['UAV', '무인기', '항공', '물류드론', '국방드론', '농업드론'],
      '우주': ['위성', '로켓', '항공우주', '우주관광', '우주통신', '우주산업'],
      '친환경': ['ESG', '탄소중립', '신재생에너지', '태양광', '풍력', '수소']
    };

    userKeywords.forEach(keyword => {
      expandedKeywords.push(keyword);
      if (keywordMappings[keyword]) {
        expandedKeywords.push(...keywordMappings[keyword]);
      }
    });

    return {
      original: userKeywords,
      expanded: [...new Set(expandedKeywords)],
      categories: { sector: [], theme: [], market: [] },
      suggestions: { stocks: [], etfs: [], sectors: [] },
      aiAdvice: '키워드가 확장되었어요. 더 정확한 분석을 위해 OpenAI API 키를 설정해주세요!'
    };
  }

  // 스마트 종목 검색 (AI 분석 + 데이터베이스 검색)
  async smartSearch(userKeywords, options = {}) {
    try {
      console.log('🔍 채쌤과 함께 스마트 검색을 시작해요...');
      
      // 1단계: AI 키워드 분석
      const keywordAnalysis = await this.analyzeAndExpandKeywords(userKeywords, options);
      
      // 2단계: 확장된 키워드로 데이터베이스 검색
      const searchKeywords = [...keywordAnalysis.original, ...keywordAnalysis.expanded];
      const searchResults = stockDatabase.searchByKeywords(searchKeywords, {
        limit: options.limit || 20,
        markets: options.markets || ['KR', 'US'],
        types: options.types || ['KR_STOCK', 'US_STOCK', 'ETF'],
        minRelevance: 0.2
      });

      // 3단계: AI 기반 결과 정제 및 순위 조정
      const refinedResults = this.refineSearchResults(searchResults, keywordAnalysis, options);
      
      // 4단계: 추가 인사이트 생성
      const insights = await this.generateSearchInsights(refinedResults, keywordAnalysis);

      return {
        query: {
          original: userKeywords,
          expanded: keywordAnalysis.expanded,
          analysis: keywordAnalysis
        },
        results: refinedResults,
        insights: insights,
        metadata: {
          totalFound: searchResults.length,
          searchTime: new Date(),
          aiEnhanced: true
        }
      };

    } catch (error) {
      console.error('스마트 검색 실패:', error);
      
      // 백업: 기본 검색
      const basicResults = stockDatabase.searchByKeywords(userKeywords, options);
      return {
        query: { original: userKeywords, expanded: userKeywords },
        results: basicResults,
        insights: { advice: '기본 검색 결과입니다. AI 분석을 위해 OpenAI API 키를 설정해주세요.' },
        metadata: { totalFound: basicResults.length, searchTime: new Date(), aiEnhanced: false }
      };
    }
  }

  // 검색 결과 정제
  refineSearchResults(results, keywordAnalysis, options) {
    return results.map(stock => {
      // AI 분석 기반 점수 보정
      let aiScore = stock.relevanceScore;
      
      // 카테고리 일치도 반영
      if (keywordAnalysis.categories.sector.includes(stock.sector)) {
        aiScore += 0.3;
      }
      
      // 사용자 선호도 반영
      if (this.userPreferences.favoriteStocks?.includes(stock.symbol)) {
        aiScore += 0.2;
      }
      
      // 위험도 조정
      if (options.riskLevel === 'low' && stock.type === 'ETF') {
        aiScore += 0.1;
      }
      
      return {
        ...stock,
        aiScore: Math.min(aiScore, 1.0),
        aiRecommendation: this.generateStockRecommendation(stock, keywordAnalysis)
      };
    }).sort((a, b) => b.aiScore - a.aiScore);
  }

  // 종목별 AI 추천 생성
  generateStockRecommendation(stock, keywordAnalysis) {
    const recommendations = [
      `${stock.name}은(는) "${keywordAnalysis.original.join(', ')}" 키워드와 높은 관련성을 보여요.`,
      `현재 ${stock.sector} 섹터에서 주목받고 있는 종목입니다.`,
      `${stock.market} 시장에서 거래되는 ${stock.type} 종목이에요.`
    ];
    
    // 위험도별 조언 추가
    if (stock.type === 'KR_STOCK') {
      recommendations.push('국내 주식으로 정보 접근성이 좋아요.');
    } else if (stock.type === 'US_STOCK') {
      recommendations.push('해외 주식으로 환율 변동 리스크를 고려하세요.');
    } else if (stock.type === 'ETF') {
      recommendations.push('ETF로 분산투자 효과를 기대할 수 있어요.');
    }
    
    return recommendations.join(' ');
  }

  // 검색 인사이트 생성
  async generateSearchInsights(results, keywordAnalysis) {
    const sectorDistribution = this.analyzeSectorDistribution(results);
    const marketDistribution = this.analyzeMarketDistribution(results);
    
    return {
      advice: keywordAnalysis.aiAdvice || '채쌤이 분석한 맞춤형 종목들이에요!',
      sectorInsights: this.generateSectorInsights(sectorDistribution),
      marketInsights: this.generateMarketInsights(marketDistribution),
      riskAnalysis: this.generateRiskAnalysis(results),
      recommendations: this.generateActionRecommendations(results, keywordAnalysis)
    };
  }

  // 섹터 분포 분석
  analyzeSectorDistribution(results) {
    const distribution = {};
    results.forEach(stock => {
      distribution[stock.sector] = (distribution[stock.sector] || 0) + 1;
    });
    return distribution;
  }

  // 시장 분포 분석
  analyzeMarketDistribution(results) {
    const distribution = {};
    results.forEach(stock => {
      distribution[stock.market] = (distribution[stock.market] || 0) + 1;
    });
    return distribution;
  }

  // 섹터 인사이트 생성
  generateSectorInsights(distribution) {
    const topSector = Object.keys(distribution).reduce((a, b) => 
      distribution[a] > distribution[b] ? a : b
    );
    
    return `가장 많이 발견된 섹터는 ${topSector}이에요. 이 분야가 현재 주목받고 있는 것 같아요!`;
  }

  // 시장 인사이트 생성
  generateMarketInsights(distribution) {
    const hasKR = distribution.KR > 0;
    const hasUS = distribution.US > 0;
    
    if (hasKR && hasUS) {
      return '한국과 미국 시장 모두에서 관련 종목을 찾았어요. 글로벌 트렌드인 것 같아요!';
    } else if (hasKR) {
      return '주로 한국 시장에서 관련 종목이 많이 발견되었어요.';
    } else if (hasUS) {
      return '미국 시장에서 관련 종목이 많이 발견되었어요. 글로벌 투자 기회를 확인해보세요!';
    }
    
    return '다양한 시장에서 종목을 발견했어요.';
  }

  // 위험도 분석
  generateRiskAnalysis(results) {
    const etfCount = results.filter(r => r.type === 'ETF').length;
    const stockCount = results.length - etfCount;
    
    if (etfCount > stockCount) {
      return '검색 결과에 ETF가 많아 상대적으로 안정적인 투자가 가능해요.';
    } else {
      return '개별 종목이 많아 높은 수익률을 기대할 수 있지만 위험도도 함께 고려하세요.';
    }
  }

  // 행동 추천
  generateActionRecommendations(results, keywordAnalysis) {
    const recommendations = [];
    
    if (results.length > 10) {
      recommendations.push('📊 너무 많은 종목이 검색되었어요. 더 구체적인 키워드로 필터링해보세요.');
    } else if (results.length < 3) {
      recommendations.push('🔍 검색 결과가 적어요. 키워드를 더 추가하거나 다른 표현으로 시도해보세요.');
    } else {
      recommendations.push('✅ 적절한 수의 종목이 검색되었어요. 각 종목을 자세히 분석해보세요.');
    }
    
    recommendations.push('💡 관심 있는 종목은 관심목록에 추가해서 지속적으로 모니터링하세요.');
    recommendations.push('📰 선택한 종목의 최신 뉴스도 함께 확인해보세요.');
    
    return recommendations;
  }

  // 검색 히스토리 관리
  saveSearchToHistory(original, expanded) {
    const searchEntry = {
      id: Date.now(),
      timestamp: new Date(),
      originalKeywords: original,
      expandedKeywords: expanded,
      resultsCount: 0
    };
    
    this.searchHistory.unshift(searchEntry);
    this.searchHistory = this.searchHistory.slice(0, 50); // 최근 50개만 유지
    
    localStorage.setItem('ai_search_history', JSON.stringify(this.searchHistory));
  }

  loadSearchHistory() {
    try {
      const history = localStorage.getItem('ai_search_history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  loadUserPreferences() {
    try {
      const prefs = localStorage.getItem('user_preferences');
      return prefs ? JSON.parse(prefs) : {};
    } catch {
      return {};
    }
  }

  // 기본 키워드 확장 (AI 실패 시)
  getDefaultKeywordExpansion() {
    return {
      keywords: [],
      categories: { sector: [], theme: [], market: [] },
      suggestions: { stocks: [], etfs: [], sectors: [] },
      advice: '기본 검색을 진행합니다. AI 분석을 위해 OpenAI API 키를 설정해주세요.'
    };
  }
}

// 싱글톤 인스턴스
const aiStockSearchService = new AIStockSearchService();

export default aiStockSearchService;

// 편의 함수들
export const aiSmartSearch = (keywords, options) => aiStockSearchService.smartSearch(keywords, options);
export const expandKeywords = (keywords, context) => aiStockSearchService.analyzeAndExpandKeywords(keywords, context);
export const getSearchHistory = () => aiStockSearchService.searchHistory; 