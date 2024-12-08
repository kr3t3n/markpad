import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Editor } from './components/Editor';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Contact } from './pages/Contact';
import { Documents } from './pages/Documents';
import { Toaster } from 'sonner';
import { Auth } from './pages/Auth';
import { AuthCallback } from './components/AuthCallback';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100 transition-colors flex flex-col">
      <Toaster 
        richColors 
        position="bottom-right" 
        closeButton
        dismissible
      />
      <Header />
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/edit/:id" element={<Editor />} />
        <Route path="/new" element={<Editor />} />
      </Routes>
      <Footer />
    </div>
  );
}