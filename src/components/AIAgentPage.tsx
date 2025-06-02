import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';

interface AIAgentPageProps {
  allowedTelegramId: string;
}

const AIAgentPage: React.FC<AIAgentPageProps> = ({ allowedTelegramId }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to get Telegram Web App data
    const getTelegramUser = () => {
      // Check if Telegram WebApp is available
      if (window.Telegram && window.Telegram.WebApp) {
        const webAppUser = window.Telegram.WebApp.initDataUnsafe?.user;
        if (webAppUser && webAppUser.id.toString() === allowedTelegramId) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } else {
        // For development testing purposes - remove in production
        const urlParams = new URLSearchParams(window.location.search);
        const telegramId = urlParams.get('telegramId');
        setIsAuthorized(telegramId === allowedTelegramId);
      }
      setLoading(false);
    };

    getTelegramUser();

    // Add the ElevenLabs script if it doesn't exist
    if (!document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]')) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
    }

    return () => {
      // No need to remove the script as it might be used by other parts of the app
    };
  }, [allowedTelegramId]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-full" dangerouslySetInnerHTML={{ 
        __html: '<elevenlabs-convai agent-id="agent_01jws2vrq7et6rsg8ax6qjbk48"></elevenlabs-convai>' 
      }} />
    </div>
  );
};

export default AIAgentPage;
