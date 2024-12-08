import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full py-4 px-4 mt-auto bg-white dark:bg-gray-800 border-t dark:border-gray-700">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap justify-center sm:justify-start gap-4">
          <Link 
            to="/terms" 
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Terms
          </Link>
          <Link 
            to="/privacy" 
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Privacy
          </Link>
          <Link 
            to="/contact" 
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Contact
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a 
            href="https://www.buymeacoffee.com/georgipep"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Like markpad? Show your love with a ☕
          </a>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Created by{' '}
            <a 
              href="https://x.com/georgipep" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Georgi
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}