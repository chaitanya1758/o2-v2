import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { SavedQuery, FrequentQuery } from '../types';
import { mockEnvironments } from '../data/mockData';

interface SidebarProps {
  selectedEnvironment: string;
  selectedIndex: string;
  onEnvironmentChange: (env: string) => void;
  onIndexChange: (index: string) => void;
  savedQueries: SavedQuery[];
  frequentQueries: FrequentQuery[];
  chatHistory: Array<{ id: string; title: string; timestamp: Date }>;
  onNewChat: () => void;
  onExecuteQuery: (query: string) => void;
  onLoadChat: (chatId: string) => void;
  onEditQuery: (queryId: string) => void;
  onDeleteQuery: (queryId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedEnvironment,
  selectedIndex,
  onEnvironmentChange,
  onIndexChange,
  savedQueries,
  frequentQueries,
  chatHistory,
  onNewChat,
  onExecuteQuery,
  onLoadChat,
  onEditQuery,
  onDeleteQuery
}) => {
  const getAvailableIndices = () => {
    const env = mockEnvironments.find(e => e.value === selectedEnvironment);
    return env ? env.indices : [];
  };

  const handleEnvironmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEnv = e.target.value;
    onEnvironmentChange(newEnv);
    onIndexChange(''); // Reset index when environment changes
  };

  return (
    <div className="h-100 bg-primary border-right border-theme flex flex-column">
      {/* Header */}
      <div className="pa3 border-bottom border-theme">
        <h2 className="ma0 f5 fw6 text-primary mb3">OpenObserve Assistant</h2>
        <button 
          onClick={onNewChat}
          className="w-100 pa3 bg-purple white br3 bn f6 fw5 pointer hover-bg-dark-purple"
        >
          <Plus className="dib w1 h1 mr2" />
          New Chat
        </button>
      </div>

      {/* Configuration */}
      <div className="pa3 flex-auto overflow-y-auto">
        <div className="mb4">
          <h3 className="ma0 f6 fw5 text-secondary mb2">Configuration</h3>
          
          <select
            value={selectedEnvironment}
            onChange={handleEnvironmentChange}
            className="w-100 pa2 br2 f6 mb3 border-theme"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            <option value="">Select Environment</option>
            {mockEnvironments.map(env => (
              <option key={env.value} value={env.value}>
                {env.label}
              </option>
            ))}
          </select>

          <select
            value={selectedIndex}
            onChange={(e) => onIndexChange(e.target.value)}
            className="w-100 pa2 br2 f6 mb3 border-theme"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            <option value="">Select Index/Stream</option>
            {getAvailableIndices().map((index: string) => (
              <option key={index} value={index}>
                {index}
              </option>
            ))}
          </select>
        </div>

        {/* Saved Queries */}
        <div className="mb4">
          <div className="flex justify-between items-center mb2">
            <span className="f6 fw5 text-primary">Saved Queries</span>
            <button className="bn bg-transparent purple f4 pointer">
              <Plus className="w1 h1" />
            </button>
          </div>
          
          {savedQueries.map((query: SavedQuery) => (
            <div 
              key={query.id}
              className="pa3 mb2 br2 pointer hover-bg-tertiary border-theme-hover relative"
              style={{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'transparent'
              }}
            >
              <div 
                onClick={() => onExecuteQuery(query.query)}
                className="w-100"
              >
                <div className="f6 fw5 text-primary mb1">{query.name}</div>
                <div className="f7 text-secondary">{query.index}</div>
              </div>
              
              <div className="absolute top-1 right-1 flex">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditQuery(query.id);
                  }}
                  className="bn bg-transparent text-secondary f6 pointer pa1 mr1 icon-button"
                  title="Edit query"
                >
                  <Edit className="w1 h1" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteQuery(query.id);
                  }}
                  className="bn bg-transparent text-secondary f6 pointer pa1 icon-button"
                  title="Delete query"
                >
                  <Trash2 className="w1 h1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="mb4">
          <div className="f6 fw5 text-primary mb2">Chat History</div>
          
          {chatHistory.map(chat => (
            <div 
              key={chat.id}
              onClick={() => onLoadChat(chat.id)}
              className="pa3 mb2 br2 pointer hover-bg-tertiary"
            >
              <div className="f6 fw5 text-primary mb1">{chat.title}</div>
              <div className="f7 text-secondary">{chat.timestamp.toLocaleDateString()}</div>
            </div>
          ))}
          
          {chatHistory.length === 0 && (
            <div className="f7 text-secondary pa2">No previous chats</div>
          )}
        </div>

        {/* Frequently Asked */}
        <div>
          <div className="f6 fw5 text-primary mb2">Frequently Asked</div>
          
          {frequentQueries.map((query: FrequentQuery) => (
            <div 
              key={query.id}
              onClick={() => onExecuteQuery(query.query)}
              className="pa3 mb2 br2 pointer hover-bg-tertiary"
            >
              <div className="f6 fw5 text-primary mb1">Show {query.id.replace('-', ' ')}</div>
              <div className="f7 text-secondary">{query.usage}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
