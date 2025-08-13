import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, show, onClose, type = 'success' }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red';
      case 'info':
        return 'bg-blue';
      default:
        return 'bg-green';
    }
  };

  if (!show) return null;

  return (
    <div 
      className={`fixed bottom-1 right-1 ${getBackgroundColor()} white pa3 br3 shadow-1 z-999 transition-all`}
      style={{
        transform: show ? 'translateY(0)' : 'translateY(100px)',
        transition: 'transform 0.3s ease'
      }}
    >
      {message}
    </div>
  );
};

export default Toast;
