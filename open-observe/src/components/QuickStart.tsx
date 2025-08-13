import React from 'react';
import { sampleQueries } from '../data/sampleQueries';

interface QuickStartProps {
  onSelectQuery: (query: string) => void;
}

const QuickStart: React.FC<QuickStartProps> = ({ onSelectQuery }) => {
  return (
    <div className="pa3">
      <div className="f6 fw6 text-primary mb3">💡 Try these sample queries:</div>
      
      {sampleQueries.slice(0, 2).map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb3">
          <div className="f7 fw5 text-secondary mb2">{category.category}</div>
          {category.queries.slice(0, 2).map((query, queryIndex) => (
            <div
              key={queryIndex}
              onClick={() => onSelectQuery(query)}
              className="pa2 mb1 br2 bg-tertiary hover-bg-secondary pointer f7 lh-copy text-primary border-theme"
              style={{ borderWidth: '1px', borderStyle: 'solid' }}
            >
              {query}
            </div>
          ))}
        </div>
      ))}
      
      <div className="f7 text-secondary mt3">
        Click any query above to get started, or type your own question!
      </div>
    </div>
  );
};

export default QuickStart;
