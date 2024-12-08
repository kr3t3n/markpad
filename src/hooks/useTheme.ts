import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const THEME_KEY = 'theme-preference';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = Cookies.get(THEME_KEY);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    Cookies.set(THEME_KEY, isDark ? 'dark' : 'light', { expires: 365 });
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return { isDark, toggleTheme };
}