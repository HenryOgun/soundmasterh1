import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Header from './components/Header';
import MainGrid from './components/MainGrid';
import Footer from './components/Footer';
import ArticleModal from './components/ArticleModal';

export default function App() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <BrowserRouter>
      <div className="bg-white font-sans text-gray-900">
        <Header />
        <Routes>
          <Route path="/" element={<MainGrid onSelectArticle={setSelectedArticle} />} />
          <Route path="/about" element={<MainGrid onSelectArticle={setSelectedArticle} />} />
          <Route path="/achievements" element={<MainGrid onSelectArticle={setSelectedArticle} />} />
          <Route path="/contact" element={<MainGrid onSelectArticle={setSelectedArticle} />} />
          <Route path="/articles" element={<MainGrid onSelectArticle={setSelectedArticle} />} />
          <Route path="/projects/audio" element={<MainGrid onSelectArticle={setSelectedArticle} />} />
          <Route path="/projects/broadcast" element={<MainGrid onSelectArticle={setSelectedArticle} />} />
          <Route path="/projects/tech" element={<MainGrid onSelectArticle={setSelectedArticle} />} />
          <Route path="*" element={<MainGrid onSelectArticle={setSelectedArticle} />} />
        </Routes>
        <Footer />
        {selectedArticle && (
          <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
        )}
      </div>
    </BrowserRouter>
  );
}
