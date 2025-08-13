import React from 'react';
import { Play, BarChart3, Copy } from 'lucide-react';
import { QueryResult as QueryResultType } from '../types';

interface QueryResultProps {
  queryResult: QueryResultType;
  messageId: string;
}

const QueryResult: React.FC<QueryResultProps> = ({ queryResult, messageId }) => {
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log('Content copied to clipboard');
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const handleRun = () => {
    console.log('Running query:', queryResult.sql);
    alert('Opening in OpenObserve...');
  };

  const handleSummarize = () => {
    console.log('Summarizing query results');
    alert('Summarizing results...');
  };

  const renderSQLWithHighlighting = (sql: string) => {
    const keywords = ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'LIMIT', 'GROUP BY', 'HAVING'];
    let highlighted = sql;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<span class="blue fw6">${keyword}</span>`);
    });
    
    return highlighted;
  };

  return (
    <div className="mt4 query-result-container">
      {/* User Query at Top with Bigger Font */}
      <div className="pa3 bg-tertiary border-theme mb3" style={{ borderWidth: '1px', borderStyle: 'solid', borderRadius: '8px' }}>
        <div className="f4 fw6 text-primary mb2">Query Request</div>
        <div className="f5 text-primary">Show cart ATC error rate</div>
      </div>

      {/* Header with Badges */}
      <div className="query-result-header flex justify-between items-center mb3">
        <span className="f5 fw6 text-primary">Generated Query Response</span>
        <div className="flex">
          {queryResult.badges.map((badge, index) => (
            <span 
              key={index}
              className={`f7 fw5 ph2 pv1 br3 ml1 ${
                badge.type === 'high' ? 'bg-success' :
                badge.type === 'medium' ? 'bg-warning' :
                'bg-info'
              }`}
            >
              {badge.text}
            </span>
          ))}
        </div>
      </div>

      {/* SQL Query Section */}
      <div className="mb3">
        <div className="pa3 bg-tertiary border-theme flex justify-between items-center" style={{ borderWidth: '1px', borderStyle: 'solid', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
          <span className="f6 fw6 text-primary">SQL Query</span>
          <button
            onClick={() => handleCopy(queryResult.sql)}
            className="pa2 border-theme br2 f6 pointer hover-bg-secondary flex items-center bg-primary text-secondary"
            style={{ borderWidth: '1px', borderStyle: 'solid' }}
          >
            <Copy className="w1 h1 mr1" />
            Copy
          </button>
        </div>
        <div className="query-result-content" style={{ borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
          <pre 
            className="ma0"
            style={{ color: 'var(--code-text)' }}
            dangerouslySetInnerHTML={{ 
              __html: renderSQLWithHighlighting(queryResult.sql) 
            }}
          />
        </div>
      </div>

      {/* VRL Function Section (if exists) */}
      {queryResult.vrl && (
        <div className="mb3">
          <div className="pa3 bg-tertiary border-theme flex justify-between items-center" style={{ borderWidth: '1px', borderStyle: 'solid', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
            <span className="f6 fw6 text-primary">VRL Function</span>
            <button
              onClick={() => handleCopy(queryResult.vrl!)}
              className="pa2 border-theme br2 f6 pointer hover-bg-secondary flex items-center bg-primary text-secondary"
              style={{ borderWidth: '1px', borderStyle: 'solid' }}
            >
              <Copy className="w1 h1 mr1" />
              Copy
            </button>
          </div>
          <div className="query-result-content" style={{ borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
            <pre className="ma0" style={{ color: 'var(--code-text)' }}>
              {queryResult.vrl}
            </pre>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pa3 bg-primary flex flex-wrap border-top border-theme" style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
        <button
          onClick={handleRun}
          className="pa2 mr2 mb2 bg-blue white br2 bn f6 pointer hover-bg-dark-blue flex items-center"
        >
          <Play className="w1 h1 mr1" />
          🚀 Run in OpenObserve
        </button>
        <button
          onClick={handleSummarize}
          className="pa2 mr2 mb2 bg-red white br2 bn f6 pointer hover-bg-dark-red flex items-center"
        >
          <BarChart3 className="w1 h1 mr1" />
          📊 Summarize
        </button>
      </div>
    </div>
  );
};

export default QueryResult;
