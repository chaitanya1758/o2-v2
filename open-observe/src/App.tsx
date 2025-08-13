import React from 'react';
import 'tachyons';
import './App.css';
import QueryAssistant from './components/QueryAssistant';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <QueryAssistant />
      </div>
    </ThemeProvider>
  );
}

export default App;
