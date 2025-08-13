import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';
import QuickStart from './QuickStart';
import ThemeToggle from './ThemeToggle';

interface MainContentProps {
  messages: Message[];
  isLoading: boolean;
  selectedIndex: string;
  selectedEnvironment: string;
  onSendMessage: (message: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  messages,
  isLoading,
  selectedIndex,
  selectedEnvironment,
  onSendMessage
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showWarning, setShowWarning] = useState(true);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const getWarningMessage = () => {
    if (!selectedEnvironment && !selectedIndex) {
      return "Please select an environment and index for better accuracy";
    } else if (!selectedEnvironment) {
      return "Please select an environment for better accuracy";
    } else if (!selectedIndex) {
      return "Please select an index for better accuracy";
    }
    return "";
  };

  const shouldShowWarning = showWarning && (!selectedEnvironment || !selectedIndex);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="h-100 flex flex-column bg-primary">
      {/* Header */}
      <div className="pa3 border-bottom border-theme flex justify-between items-center bg-primary flex-shrink-0">
        <h1 className="ma0 f3 fw6 text-primary">Query Assistant</h1>
        <div className="flex items-center">
          <ThemeToggle />
          <div className="w3 h3 br-100 bg-purple white flex items-center justify-center fw6 pointer ml3">
            JD
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {shouldShowWarning && (
        <div className="pa3 flex justify-between items-center flex-shrink-0" style={{ backgroundColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)' }}>
          <span className="f6" style={{ color: 'var(--warning-text)' }}>{getWarningMessage()}</span>
          <button 
            onClick={() => setShowWarning(false)}
            className="bn bg-transparent f4 pointer"
            style={{ color: 'var(--warning-text)' }}
          >
            <X className="w1 h1" />
          </button>
        </div>
      )}

      {/* Chat Area */}
      <div 
        ref={chatAreaRef}
        className="chat-area-container pa3 bg-secondary"
      >
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Show QuickStart only when there's just the initial message */}
        {messages.length === 1 && messages[0].sender === 'assistant' && (
          <QuickStart onSelectQuery={onSendMessage} />
        )}
        
        {isLoading && (
          <div className="flex justify-start mb3">
            <div className="bg-primary border-theme br4 pa3 shadow-1" style={{ borderWidth: '1px', borderStyle: 'solid' }}>
              <div className="flex items-center">
                <div className="w1 h1 ba b--blue br-100 spin mr2"></div>
                <span className="text-primary">Generating response...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="input-area-container pa3 bg-primary border-top border-theme">
        <form onSubmit={handleSubmit} className="relative mw7 center">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your logs..."
            className="chat-input w-100 pa3 pr5 br4 f5 resize-none border-theme"
            style={{ 
              borderWidth: '2px',
              borderStyle: 'solid',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
            rows={3}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute bottom-1 right-1 w3 h3 bg-purple white br3 bn pointer flex items-center justify-center disabled-o-50"
          >
            <Send className="w1 h1" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MainContent;
