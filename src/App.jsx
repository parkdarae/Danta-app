import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import SimpleMainPage from './pages/SimpleMainPage';
import NewsDetailPage from './pages/NewsDetailPage';
import StockNewsPage from './pages/StockNewsPage';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<SimpleMainPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
            <Route path="/news" element={<StockNewsPage />} />
            <Route path="*" element={<SimpleMainPage />} />
          </Routes>
        </Router>
      </div>
    </ErrorBoundary>
  );
}

export default App;