import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import PageView from './components/PageView';
import StatsDisplay, { StatsProvider } from './components/StatsDisplay';
import { ClearProvider } from './components/ClearContext';
import AIAgent from './components/AIAgent';
import AIAgentPage from './components/AIAgentPage';

function App() {
  return (
    <StatsProvider>
      <ClearProvider>
        <Router>
          <Routes>
            <Route
              path="/aiagent"
              element={
                <div className="min-h-screen">
                  <AIAgentPage allowedTelegramId="178875921" />
                </div>
              }
            />
            <Route
              path="/*"
              element={
                <div className="min-h-screen bg-gray-100">
                  <Navbar />
                  <StatsDisplay />
                  <main className="container mx-auto px-4 py-8">
                    <Routes>
                      <Route path="/" element={<Navigate to="/page/1" replace />} />
                      <Route path="/page/:pageId" element={<PageView />} />
                      <Route path="*" element={<Navigate to="/page/1" replace />} />
                    </Routes>
                  </main>
                </div>
              }
            />
          </Routes>
        </Router>
      </ClearProvider>
    </StatsProvider>
  );
}

export default App;
