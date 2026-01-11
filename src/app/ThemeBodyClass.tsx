'use client';

import { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeBodyClass() {
  const { theme } = useTheme();

  useEffect(() => {
    // adjust these to match your ThemeContext values
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  return null;
}
