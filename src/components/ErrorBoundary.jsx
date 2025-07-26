import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2 style={{ color: '#c92a2a', marginBottom: '16px' }}>
            🚨 채쌤이 일시적으로 문제를 겪고 있어요!
          </h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
            <strong>에러 메시지:</strong>
            <pre style={{ margin: '8px 0', color: '#495057', fontSize: '14px' }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <strong>🔧 해결 방법:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>페이지를 새로고침 해보세요 (F5)</li>
              <li>브라우저 캐시를 삭제해보세요</li>
              <li>다른 브라우저에서 시도해보세요</li>
              <li>잠시 후 다시 접속해보세요</li>
            </ul>
          </div>

          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#228be6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginRight: '10px'
            }}
          >
            🔄 페이지 새로고침
          </button>
          
          <button 
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{
              backgroundColor: '#40c057',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ⚡ 다시 시도
          </button>

          {this.state.errorInfo && (
            <details style={{ marginTop: '16px' }}>
              <summary style={{ cursor: 'pointer', color: '#495057' }}>
                🔍 개발자용 상세 정보
              </summary>
              <pre style={{ 
                marginTop: '8px', 
                fontSize: '12px', 
                color: '#6c757d',
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                overflow: 'auto'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 