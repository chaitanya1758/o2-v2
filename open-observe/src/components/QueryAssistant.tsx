import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import Toast from './Toast';
import TimeRangeSelector from './TimeRangeSelector';
import { QueryResult } from '../types';
import { mockSavedQueries, mockFrequentQueries, generateMockQueryResponse } from '../data/mockData';

const QueryAssistant: React.FC = () => {
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      sender: 'assistant',
      content: "👋 Hello! I'm your OpenObserve Query Assistant. Ask me about errors, performance, or analytics!",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type?: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string>('');
  const [pendingQueryTitle, setPendingQueryTitle] = useState<string>('');

  // Mock chat history
  const [chatHistory] = useState([
    { id: '1', title: 'Error analysis from yesterday', timestamp: new Date(Date.now() - 86400000) },
    { id: '2', title: 'Performance metrics review', timestamp: new Date(Date.now() - 172800000) },
  ]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleExecuteQuery = (query: string, title: string = '') => {
    setPendingQuery(query);
    setPendingQueryTitle(title || 'Execute Query');
    setShowTimeSelector(true);
  };

  const handleTimeRangeApply = (timeRange: any) => {
    showToast(`Executing query with ${timeRange.type} time range`);
    handleSendMessage(pendingQuery);
  };

  const handleEditQuery = (queryId: string) => {
    showToast('Edit query: ' + queryId, 'info');
    // Here you would open an edit modal
  };

  const handleDeleteQuery = (queryId: string) => {
    if (window.confirm('Are you sure you want to delete this query?')) {
      showToast('Query deleted', 'success');
      // Here you would remove the query from state
    }
  };

  const handleLoadChat = (chatId: string) => {
    showToast('Loading chat: ' + chatId, 'info');
    // Here you would load the chat history
  };

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API response
    setTimeout(() => {
      const queryResult: QueryResult = generateMockQueryResponse(message, selectedIndex);

      const assistantMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        content: 'I\'ve generated a SQL query based on your request:',
        queryResult,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: 1,
        sender: 'assistant',
        content: "👋 Hello! I'm your OpenObserve Query Assistant. Try asking me about errors, performance, or analytics queries!",
        timestamp: new Date()
      }
    ]);
    showToast('New chat started');
  };

  return (
    <>
      <div className="main-layout-container">
        <div className="w-25 min-w-20">
          <Sidebar
            selectedEnvironment={selectedEnvironment}
            selectedIndex={selectedIndex}
            onEnvironmentChange={setSelectedEnvironment}
            onIndexChange={setSelectedIndex}
            savedQueries={mockSavedQueries}
            frequentQueries={mockFrequentQueries}
            chatHistory={chatHistory}
            onNewChat={handleNewChat}
            onExecuteQuery={(query: string) => handleExecuteQuery(query)}
            onLoadChat={handleLoadChat}
            onEditQuery={handleEditQuery}
            onDeleteQuery={handleDeleteQuery}
          />
        </div>
        <div className="main-content-container">
          <MainContent
            messages={messages}
            isLoading={isLoading}
            selectedIndex={selectedIndex}
            selectedEnvironment={selectedEnvironment}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
      <TimeRangeSelector
        isOpen={showTimeSelector}
        onClose={() => setShowTimeSelector(false)}
        onApply={handleTimeRangeApply}
        queryTitle={pendingQueryTitle}
      />
      <Toast 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </>
  );
};

export default QueryAssistant;
