import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import NewsDetailPage from './pages/NewsDetailPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/news/:stock" element={<NewsDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;