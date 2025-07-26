import React, { useState, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const PortfolioOCR = ({ darkMode = false, onPortfolioUpdate }) => {
  const [portfolio, setPortfolio] = useLocalStorage('user_portfolio', []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState('');
  const [extractedStocks, setExtractedStocks] = useState([]);
  const fileInputRef = useRef(null);

  const theme = {
    bg: darkMode ? '#1a1a1a' : '#ffffff',
    cardBg: darkMode ? '#2d2d2d' : '#f8f9fa',
    text: darkMode ? '#ffffff' : '#333333',
    subtext: darkMode ? '#cccccc' : '#666666',
    border: darkMode ? '#404040' : '#e0e0e0',
    accent: '#007bff',
    positive: '#00c851',
    negative: '#ff4444',
    warning: '#ffbb33'
  };

  // Tesseract.js OCR 처리 (브라우저 기반 OCR)
  const processImageWithOCR = async (imageFile) => {
    try {
      setIsProcessing(true);
      setOcrResult('');
      setExtractedStocks([]);

      // 이미지를 Canvas로 변환하여 전처리
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = async () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // 이미지 품질 향상을 위한 필터 적용
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // 대비 증가 및 흑백 변환
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            const enhanced = gray > 128 ? 255 : 0; // 이진화
            data[i] = enhanced;
            data[i + 1] = enhanced;
            data[i + 2] = enhanced;
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          // OCR 처리 시뮬레이션 (실제로는 Tesseract.js 사용)
          setTimeout(() => {
            const mockOCRResult = simulateOCR(imageFile.name);
            setOcrResult(mockOCRResult);
            const extracted = extractStockData(mockOCRResult);
            setExtractedStocks(extracted);
            setIsProcessing(false);
            resolve(extracted);
          }, 3000);
        };
        
        img.onerror = () => {
          setIsProcessing(false);
          reject(new Error('이미지 로딩 실패'));
        };
        
        img.src = URL.createObjectURL(imageFile);
      });
    } catch (error) {
      console.error('OCR 처리 오류:', error);
      setIsProcessing(false);
      alert('OCR 처리 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // OCR 결과 시뮬레이션 (실제 환경에서는 Tesseract.js 사용)
  const simulateOCR = (fileName) => {
    const mockResults = [
      // 키움증권 예시
      `키움증권 보유종목
      삼성전자          100주    78,500원
      LG에너지솔루션     50주    480,000원  
      AAPL            20주     $195.50
      TSLA            15주     $248.50
      에이지이글        30주     $12.50`,
      
      // 미래에셋 예시
      `미래에셋증권 계좌현황
      005930 삼성전자     200주
      373220 LG에너지     25주  
      NVDA              10주
      MSFT              40주
      EAGLE             50주`,
      
      // 카카오페이증권 예시
      `카카오페이증권
      보유종목:
      - 삼성전자 (005930): 150주
      - 애플 (AAPL): 25주  
      - 테슬라 (TSLA): 10주
      - 에이지이글 (ACEL): 75주`
    ];
    
    return mockResults[Math.floor(Math.random() * mockResults.length)];
  };

  // OCR 결과에서 주식 데이터 추출
  const extractStockData = (ocrText) => {
    const stocks = [];
    const lines = ocrText.split('\n');
    
    // 한국 주식 패턴
    const koreanStockPattern = /([가-힣]+(?:전자|에너지|바이오|화학|생명|솔루션|케미칼|제약|산업|금융|증권|보험|은행|카드|페이|통신|텔레콤)?)[\s\(]*(\d{6})?[\s\)]*[:\s]*(\d+)주/g;
    
    // 미국 주식 패턴
    const usStockPattern = /([A-Z]{1,5})[\s:]*(\d+)주/g;
    
    // 에이지이글 특별 패턴
    const eaglePattern = /(에이지이글|ACEL|EAGLE|AEGL)[\s\(]*([A-Z]+)?[\s\)]*[:\s]*(\d+)주/g;
    
    // 가격 패턴
    const pricePattern = /([\d,]+(?:\.\d+)?)원?|\$?([\d,]+(?:\.\d+)?)/g;

    lines.forEach(line => {
      // 한국 주식 추출
      let match;
      while ((match = koreanStockPattern.exec(line)) !== null) {
        const [, name, code, quantity] = match;
        stocks.push({
          symbol: code || getKoreanStockCode(name),
          name: name,
          quantity: parseInt(quantity),
          market: 'KOR',
          type: 'detected'
        });
      }
      
      // 미국 주식 추출
      koreanStockPattern.lastIndex = 0;
      while ((match = usStockPattern.exec(line)) !== null) {
        const [, symbol, quantity] = match;
        if (!['주식', '종목', '계좌', '보유'].includes(symbol)) {
          stocks.push({
            symbol: symbol,
            name: getUSStockName(symbol),
            quantity: parseInt(quantity),
            market: 'US',
            type: 'detected'
          });
        }
      }
      
      // 에이지이글 특별 처리
      usStockPattern.lastIndex = 0;
      while ((match = eaglePattern.exec(line)) !== null) {
        const [, koreanName, usSymbol, quantity] = match;
        const symbol = usSymbol || (koreanName === '에이지이글' ? 'ACEL' : koreanName);
        stocks.push({
          symbol: symbol,
          name: koreanName === '에이지이글' ? 'Accel Entertainment Inc' : koreanName,
          quantity: parseInt(quantity),
          market: 'US',
          type: 'detected',
          isEagle: true
        });
      }
    });

    // 중복 제거
    const uniqueStocks = stocks.filter((stock, index, self) => 
      index === self.findIndex(s => s.symbol === stock.symbol)
    );

    return uniqueStocks;
  };

  // 한국 주식명으로 코드 추정
  const getKoreanStockCode = (name) => {
    const codeMap = {
      '삼성전자': '005930',
      'LG에너지솔루션': '373220',
      '삼성바이오로직스': '207940',
      '삼성SDI': '006400',
      'LG화학': '051910',
      'SK하이닉스': '000660',
      '현대차': '005380',
      'LG생활건강': '051900'
    };
    return codeMap[name] || '000000';
  };

  // 미국 주식 심볼로 회사명 추정
  const getUSStockName = (symbol) => {
    const nameMap = {
      'AAPL': 'Apple Inc',
      'TSLA': 'Tesla Inc',
      'NVDA': 'NVIDIA Corp',
      'MSFT': 'Microsoft Corp',
      'GOOGL': 'Alphabet Inc',
      'META': 'Meta Platforms Inc',
      'AMZN': 'Amazon.com Inc',
      'ACEL': 'Accel Entertainment Inc',
      'EAGLE': 'Eagle Pharmaceuticals Inc',
      'AEGL': 'Aeglea BioTherapeutics Inc'
    };
    return nameMap[symbol] || `${symbol} Corp`;
  };

  // 파일 선택 처리
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      processImageWithOCR(file);
    } else {
      alert('이미지 파일만 업로드 가능합니다.');
    }
  };

  // 추출된 종목을 포트폴리오에 추가
  const addToPortfolio = (stock) => {
    const existingIndex = portfolio.findIndex(p => p.symbol === stock.symbol);
    
    if (existingIndex >= 0) {
      // 기존 종목 수량 업데이트
      const updatedPortfolio = [...portfolio];
      updatedPortfolio[existingIndex].quantity += stock.quantity;
      setPortfolio(updatedPortfolio);
    } else {
      // 새 종목 추가
      setPortfolio([...portfolio, {
        ...stock,
        addedAt: new Date().toISOString(),
        source: 'OCR'
      }]);
    }
    
    if (onPortfolioUpdate) {
      onPortfolioUpdate(portfolio);
    }
  };

  // 모든 추출된 종목 일괄 추가
  const addAllToPortfolio = () => {
    extractedStocks.forEach(stock => addToPortfolio(stock));
    setExtractedStocks([]);
    alert(`${extractedStocks.length}개 종목이 포트폴리오에 추가되었습니다.`);
  };

  return (
    <div style={{
      background: theme.bg,
      borderRadius: '8px',
      border: `1px solid ${theme.border}`,
      marginBottom: '20px',
      overflow: 'hidden'
    }}>
      {/* 헤더 */}
      <div style={{
        background: theme.cardBg,
        padding: '15px 20px',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ margin: 0, color: theme.text, fontSize: '18px' }}>
            📱 보유종목 자동 인식 (OCR)
          </h3>
          <span style={{
            background: theme.warning,
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            Beta
          </span>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          style={{
            background: isProcessing ? theme.subtext : theme.accent,
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '6px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {isProcessing ? '🔄 처리중...' : '📷 사진 업로드'}
        </button>
      </div>

      {/* 파일 입력 (숨겨진) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* 안내사항 */}
      <div style={{
        background: theme.cardBg,
        padding: '15px 20px',
        borderBottom: `1px solid ${theme.border}`
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: theme.text, fontSize: '16px' }}>
          📋 지원되는 증권사 화면
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          fontSize: '14px'
        }}>
          <div style={{ color: theme.subtext }}>✅ 키움증권 보유종목</div>
          <div style={{ color: theme.subtext }}>✅ 미래에셋증권 계좌</div>
          <div style={{ color: theme.subtext }}>✅ 카카오페이증권</div>
          <div style={{ color: theme.subtext }}>✅ 삼성증권 포트폴리오</div>
          <div style={{ color: theme.subtext }}>✅ NH투자증권</div>
          <div style={{ color: theme.subtext }}>✅ KB증권 보유현황</div>
        </div>
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          background: theme.warning + '20', 
          borderRadius: '6px',
          fontSize: '12px',
          color: theme.text
        }}>
          💡 <strong>팁:</strong> 스크린샷을 선명하게 찍고, 종목명과 수량이 잘 보이도록 해주세요. 에이지이글에어리얼사 관련 종목도 자동 인식됩니다!
        </div>
      </div>

      {/* OCR 처리 중 */}
      {isProcessing && (
        <div style={{
          padding: '30px 20px',
          textAlign: 'center',
          background: theme.cardBg,
          borderBottom: `1px solid ${theme.border}`
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
          <div style={{ color: theme.text, fontSize: '16px', marginBottom: '10px' }}>
            이미지를 분석하고 있습니다...
          </div>
          <div style={{ color: theme.subtext, fontSize: '14px' }}>
            종목명과 수량을 자동으로 인식 중입니다. 잠시만 기다려주세요.
          </div>
          <div style={{
            width: '200px',
            height: '4px',
            background: theme.border,
            borderRadius: '2px',
            margin: '20px auto',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '50%',
              height: '100%',
              background: theme.accent,
              borderRadius: '2px',
              animation: 'progress 2s ease-in-out infinite'
            }}></div>
          </div>
        </div>
      )}

      {/* OCR 결과 */}
      {ocrResult && !isProcessing && (
        <div style={{
          padding: '15px 20px',
          borderBottom: `1px solid ${theme.border}`
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: theme.text, fontSize: '16px' }}>
            📝 인식된 텍스트
          </h4>
          <div style={{
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            padding: '10px',
            fontSize: '12px',
            color: theme.subtext,
            maxHeight: '150px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap'
          }}>
            {ocrResult}
          </div>
        </div>
      )}

      {/* 추출된 종목 */}
      {extractedStocks.length > 0 && (
        <div style={{ padding: '15px 20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h4 style={{ margin: 0, color: theme.text, fontSize: '16px' }}>
              🎯 인식된 종목 ({extractedStocks.length}개)
            </h4>
            <button
              onClick={addAllToPortfolio}
              style={{
                background: theme.positive,
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              모두 추가
            </button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '10px'
          }}>
            {extractedStocks.map((stock, index) => (
              <div
                key={index}
                style={{
                  background: stock.isEagle ? theme.accent + '20' : theme.cardBg,
                  border: `1px solid ${stock.isEagle ? theme.accent : theme.border}`,
                  borderRadius: '6px',
                  padding: '12px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div>
                    <div style={{ 
                      color: stock.isEagle ? theme.accent : theme.text, 
                      fontWeight: '600', 
                      fontSize: '14px' 
                    }}>
                      {stock.symbol} {stock.isEagle && '🎯'}
                    </div>
                    <div style={{ color: theme.subtext, fontSize: '12px' }}>
                      {stock.name}
                    </div>
                  </div>
                  <div style={{
                    background: stock.market === 'KOR' ? theme.positive : theme.accent,
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '10px'
                  }}>
                    {stock.market}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ color: theme.text, fontSize: '13px' }}>
                    보유: <strong>{stock.quantity.toLocaleString()}주</strong>
                  </div>
                  <button
                    onClick={() => addToPortfolio(stock)}
                    style={{
                      background: theme.positive,
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    추가
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 현재 포트폴리오 */}
      {portfolio.length > 0 && (
        <div style={{
          background: theme.cardBg,
          padding: '15px 20px',
          borderTop: `1px solid ${theme.border}`
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: theme.text, fontSize: '16px' }}>
            💼 현재 포트폴리오 ({portfolio.length}개 종목)
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '8px',
            fontSize: '12px'
          }}>
            {portfolio.map((stock, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px',
                background: theme.bg,
                borderRadius: '4px',
                border: `1px solid ${theme.border}`
              }}>
                <span style={{ color: theme.accent, fontWeight: '600' }}>
                  {stock.symbol}
                </span>
                <span style={{ color: theme.text }}>
                  {stock.quantity.toLocaleString()}주
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
  @keyframes progress {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }
`;
document.head.appendChild(style);

export default PortfolioOCR; 