import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w3 h3 br-100 bn pointer transition-all"
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-secondary)'
      }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w1 h1" />
      ) : (
        <Sun className="w1 h1" />
      )}
    </button>
  );
};

export default ThemeToggle;
