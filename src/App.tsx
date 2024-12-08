import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Editor } from './components/Editor';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Contact } from './pages/Contact';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100 transition-colors flex flex-col">
      <Header />
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </div>
  );
}