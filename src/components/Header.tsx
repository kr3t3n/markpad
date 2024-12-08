import React from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <div className="border-b dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img 
            src="/favicon.svg" 
            alt="Markpad Logo" 
            className="w-7 h-7 logo-image" 
          />
          <h1 className="font-poppins text-base sm:text-xl font-semibold">
            Markpad: simple and beautiful markdown editor
          </h1>
        </Link>
      </div>
    </div>
  );
}