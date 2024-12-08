import React from 'react';
import { FileEdit } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <div className="border-b dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <FileEdit size={28} className="text-blue-600 dark:text-blue-400" />
          <h1 className="font-poppins text-base sm:text-xl font-semibold">
            Simple and beautiful markdown editor
          </h1>
        </Link>
      </div>
    </div>
  );
}