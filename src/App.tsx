import React from 'react';
import { Editor } from './components/Editor';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100 transition-colors flex flex-col">
      <Editor />
      <Footer />
    </div>
  );
}