import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Always dark mode

  useEffect(() => {
    // Always set to dark mode - no user preference needed
    setIsDarkMode(true);
  }, []);

  useEffect(() => {
    // Always apply dark theme to document
    document.documentElement.classList.add('dark');
    
    // Always save dark theme to localStorage
    localStorage.setItem('theme', 'dark');
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    // Disabled - always dark mode
    return;
  };

  const setDarkMode = (isDark: boolean) => {
    // Only allow dark mode
    setIsDarkMode(true);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};