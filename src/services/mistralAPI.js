// Mistral AI API 서비스
class MistralAPIService {
  constructor() {
    this.baseURL = 'https://api.mistral.ai/v1';
    this.apiKey = process.env.REACT_APP_MISTRAL_API_KEY || localStorage.getItem('mistral_api_key');
    this.model = 'mistral-large-latest'; // 또는 'mixtral-8x7b-instruct-v0.1'
    this.maxRetries = 3;
    this.timeout = 30000; // 30초
  }

  // API 키 설정
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    if (apiKey) {
      localStorage.setItem('mistral_api_key', apiKey);
    } else {
      localStorage.removeItem('mistral_api_key');
    }
  }

  // API 키 확인
  hasApiKey() {
    return !!this.apiKey;
  }

  // 기본 요청 헤더
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  // 채팅 완료 API 호출
  async chatCompletion(messages, options = {}) {
    if (!this.hasApiKey()) {
      throw new Error('Mistral API 키가 설정되지 않았습니다.');
    }

    const payload = {
      model: options.model || this.model,
      messages: messages,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      top_p: options.topP || 1,
      stream: options.stream || false,
      safe_prompt: true,
      random_seed: options.seed || undefined
    };

    try {
      const response = await this.makeRequest('/chat/completions', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Mistral API 오류: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Mistral API 호출 실패:', error);
      throw error;
    }
  }

  // 재시도 로직이 포함된 요청
  async makeRequest(endpoint, options, retryCount = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.baseURL + endpoint, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (retryCount < this.maxRetries && !controller.signal.aborted) {
        console.warn(`Mistral API 재시도 ${retryCount + 1}/${this.maxRetries}`);
        await this.delay(Math.pow(2, retryCount) * 1000); // 지수적 백오프
        return this.makeRequest(endpoint, options, retryCount + 1);
      }
      
      throw error;
    }
  }

  // 딜레이 유틸리티
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 스트림 채팅 (실시간 응답)
  async streamChatCompletion(messages, onChunk, options = {}) {
    if (!this.hasApiKey()) {
      throw new Error('Mistral API 키가 설정되지 않았습니다.');
    }

    const payload = {
      model: options.model || this.model,
      messages: messages,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      stream: true,
      safe_prompt: true
    };

    try {
      const response = await fetch(this.baseURL + '/chat/completions', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Mistral API 스트림 오류: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 마지막 불완전한 줄 보존

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.warn('스트림 파싱 오류:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Mistral 스트림 오류:', error);
      throw error;
    }
  }

  // 모델 목록 조회
  async getAvailableModels() {
    if (!this.hasApiKey()) {
      return [];
    }

    try {
      const response = await this.makeRequest('/models', {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('모델 목록 조회 실패:', error);
      return [];
    }
  }

  // 임베딩 생성 (사용 가능한 경우)
  async createEmbedding(text, model = 'mistral-embed') {
    if (!this.hasApiKey()) {
      throw new Error('Mistral API 키가 설정되지 않았습니다.');
    }

    try {
      const response = await this.makeRequest('/embeddings', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: model,
          input: text
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.data[0].embedding;
      }
      throw new Error('임베딩 생성 실패');
    } catch (error) {
      console.error('Mistral 임베딩 오류:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
const mistralAPI = new MistralAPIService();

// 채쌤 전용 프롬프트 템플릿
export const CHAESSAEM_PROMPTS = {
  // 기본 페르소나
  systemPrompt: `당신은 '채쌤'이라는 이름의 25년 경력 주식 전문가이자 친근한 투자 멘토입니다.

성격과 말투:
- 친근하고 따뜻한 언니/누나 같은 느낌
- 전문적이지만 어렵지 않게 설명
- 감정적 공감과 실용적 조언의 균형
- 한국어로 자연스럽게 대화
- 이모지를 적절히 사용 (과하지 않게)

전문 분야:
- 주식 시장 분석 및 투자 전략
- 감정 기반 트레이딩 심리학
- 리스크 관리 및 포트폴리오 구성
- 초보자부터 고급자까지 맞춤 교육

응답 스타일:
- 200자 내외의 간결한 답변
- 구체적이고 실행 가능한 조언
- 사용자의 감정 상태 고려
- 위험 요소는 반드시 언급`,

  // 투자 조언 템플릿
  investmentAdvice: (userProfile, context) => `
사용자 프로필:
- 이름: ${userProfile.name || userProfile.nickname || '투자자'}
- 경험 수준: ${userProfile.experienceLevel || '초보자'}
- 위험 수준: ${userProfile.riskTolerance || 5}/10
- 투자 목표: ${userProfile.investmentGoal || '자산 증식'}

현재 상황: ${context}

위 정보를 바탕으로 채쌤의 친근하고 전문적인 조언을 해주세요.`,

  // 감정 분석 템플릿
  emotionAnalysis: (emotion, situation) => `
사용자가 현재 '${emotion}' 감정 상태에서 다음 상황에 있습니다:
${situation}

채쌤으로서 이 감정 상태에 적절한 투자 심리 조언을 해주세요.
감정적 매매의 위험성과 객관적 판단의 중요성을 포함해주세요.`,

  // 종목 분석 템플릿
  stockAnalysis: (symbol, userProfile) => `
종목: ${symbol}
사용자: ${userProfile.name || userProfile.nickname || '투자자'} (${userProfile.experienceLevel || '초보자'})

이 종목에 대한 채쌤의 분석과 조언을 해주세요.
기술적 분석보다는 실용적이고 이해하기 쉬운 관점에서 설명해주세요.`,

  // 뉴스 요약 템플릿
  newsSummary: (newsContent) => `
다음 뉴스를 투자자 관점에서 핵심만 200자 이내로 요약해주세요:

${newsContent}

채쌤의 친근한 톤으로 투자 영향도와 주의점을 포함해주세요.`
};

export default mistralAPI; 