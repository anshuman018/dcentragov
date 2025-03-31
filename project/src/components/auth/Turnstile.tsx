import Turnstile from 'react-turnstile';

interface TurnstileProps {
  onVerify: (token: string) => void;
}

const TurnstileWidget: React.FC<TurnstileProps> = ({ onVerify }) => {
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