import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Header from './components/Header';
import PageView from './components/PageView';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/page/1" replace />} />
            <Route path="/page/:pageId" element={<PageView />} />
            <Route path="*" element={<Navigate to="/page/1" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
