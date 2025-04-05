import React from 'react';
import Turnstile from 'react-turnstile';

interface TurnstileProps {
  onVerify: (token: string) => void;
}

const TurnstileWidget: React.FC<TurnstileProps> = ({ onVerify }) => {
  // For local development, auto-verify after a short delay
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      const timer = setTimeout(() => {
        onVerify('dev-mode-token');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [onVerify]);

  if (import.meta.env.DEV) {
    return (
      <div className="flex justify-center mb-4 text-sm text-gray-600">
        Human verification bypassed in development mode
      </div>
    );
  }

  return (
    <Turnstile
      sitekey="0x4AAAAAABDNo1wGKSLNbd0c"
      onVerify={onVerify}
      theme="light"
      className="flex justify-center mb-4"
    />
  );
};

export default TurnstileWidget;