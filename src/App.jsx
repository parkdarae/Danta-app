import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
            <Route path="*" element={<MainPage />} />
          </Routes>
        </Router>
      </div>
    </ErrorBoundary>
  );
}

export default App;