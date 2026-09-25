import React, { useState } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Transaction from './pages/Transaction';
import Reports from './pages/Reports';

export default function App() {
  const [currentPage, setCurrentPage] = useState('analyze');
  const [analysisData, setAnalysisData] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [analyzeInput, setAnalyzeInput] = useState({
    message: '',
    url: '',
    activePresetId: null
  });

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setCurrentPage('result');
  };

  const handleNewAnalysis = () => {
    setCurrentPage('analyze');
  };

  const handleNavigate = (page, data = null) => {
    if (page === 'result' && data) {
      setAnalysisData(data);
    }
    if (page === 'reports' && data) {
      setReportsData(data);
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'result':
        return (
          <Analyze
            analysisData={analysisData}
            onNavigate={handleNavigate}
            onNewAnalysis={handleNewAnalysis}
          />
        );
      case 'transaction':
        return <Transaction onNavigate={handleNavigate} />;
      case 'reports':
        return <Reports initialData={reportsData} />;
      case 'analyze':
      case 'home':
      default:
        return (
          <Home
            onNavigate={handleNavigate}
            onAnalysisComplete={handleAnalysisComplete}
            savedInput={analyzeInput}
            onInputChange={setAnalyzeInput}
          />
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-dark)' }}>
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {renderPage()}
      </main>
    </div>
  );
}
