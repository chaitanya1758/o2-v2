import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Message } from '../types';
import QueryResult from './QueryResult';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [correctedSQL, setCorrectedSQL] = useState('');
  const [correctedVRL, setCorrectedVRL] = useState('');

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    if (type === 'negative') {
      setShowFeedbackForm(true);
      // Pre-fill with current SQL and VRL
      if (message.queryResult) {
        setCorrectedSQL(message.queryResult.sql);
        setCorrectedVRL(message.queryResult.vrl || '');
      }
    } else {
      setShowFeedbackForm(false);
    }
  };

  const submitFeedback = () => {
    // Here you would typically send feedback to your API
    console.log('Feedback submitted:', {
      messageId: message.id,
      type: feedback,
      notes: feedbackText,
      correctedSQL,
      correctedVRL
    });
    setShowFeedbackForm(false);
  };

  if (message.sender === 'user') {
    return (
      <div className="flex justify-end mb3">
        <div className="bg-purple white br4 pa3 mw6 br--bottom-right-0">
          <div className="f6 lh-copy">{message.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb3">
      <div className="bg-primary br4 pa3 shadow-1 br--bottom-left-0 fade-in-up chat-message border-theme" style={{ width: '70%', borderWidth: '1px', borderStyle: 'solid' }}>
        <div className="f6 lh-copy mb2 text-primary">{message.content}</div>
        
        {message.queryResult && (
          <QueryResult queryResult={message.queryResult} messageId={message.id.toString()} />
        )}
        
        {/* Feedback */}
        <div className="flex items-center mt2 pt2 border-top border-theme">
          <button
            onClick={() => handleFeedback('positive')}
            className={`bn bg-transparent pa1 pointer mr2 br2 ${
              feedback === 'positive' ? 'bg-light-green' : 'hover-bg-tertiary'
            }`}
          >
            <ThumbsUp className="w1 h1" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button
            onClick={() => handleFeedback('negative')}
            className={`bn bg-transparent pa1 pointer br2 ${
              feedback === 'negative' ? 'bg-light-red' : 'hover-bg-tertiary'
            }`}
          >
            <ThumbsDown className="w1 h1" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Feedback Form for negative feedback */}
        {showFeedbackForm && (
          <div className="mt3 pa3 bg-tertiary br2">
            <div className="f6 fw5 text-primary mb2">Help us improve</div>
            
            <div className="mb2">
              <label className="f7 fw5 db mb1 text-secondary">Optional notes:</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What could be improved?"
                className="w-100 pa2 border-theme br2 f7 bg-primary text-primary"
                style={{ borderWidth: '1px', borderStyle: 'solid' }}
                rows={2}
              />
            </div>

            <div className="mb2">
              <label className="f7 fw5 db mb1 text-secondary">Corrected SQL:</label>
              <textarea
                value={correctedSQL}
                onChange={(e) => setCorrectedSQL(e.target.value)}
                placeholder="Provide the correct SQL query"
                className="w-100 pa2 border-theme br2 f7 code bg-primary text-primary"
                style={{ borderWidth: '1px', borderStyle: 'solid' }}
                rows={3}
              />
            </div>

            <div className="mb3">
              <label className="f7 fw5 db mb1 text-secondary">Corrected VRL:</label>
              <textarea
                value={correctedVRL}
                onChange={(e) => setCorrectedVRL(e.target.value)}
                placeholder="Provide the correct VRL (optional)"
                className="w-100 pa2 border-theme br2 f7 code bg-primary text-primary"
                style={{ borderWidth: '1px', borderStyle: 'solid' }}
                rows={2}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowFeedbackForm(false)}
                className="pa2 mr2 border-theme bg-primary text-secondary br2 pointer f7"
                style={{ borderWidth: '1px', borderStyle: 'solid' }}
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                className="pa2 bg-blue white br2 bn pointer f7"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
