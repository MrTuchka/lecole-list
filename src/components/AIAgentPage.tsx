import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface AIAgentPageProps {
  allowedTelegramId: string;
}

const AIAgentPage: React.FC<AIAgentPageProps> = ({ allowedTelegramId }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For testing - always authorize in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    
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
        if (telegramId === allowedTelegramId || isDevelopment) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      }
      setLoading(false);
    };

    getTelegramUser();
  }, [allowedTelegramId]);
  
  // Add the ElevenLabs script in a separate useEffect
  useEffect(() => {
    if (isAuthorized) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);

      return () => {
        // Try to clean up the script if possible
        const scriptElement = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
        if (scriptElement && scriptElement.parentNode) {
          scriptElement.parentNode.removeChild(scriptElement);
        }
      };
    }
  }, [isAuthorized]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white">
      <div className="w-full h-screen" dangerouslySetInnerHTML={{ 
        __html: '<elevenlabs-convai agent-id="agent_01jws2vrq7et6rsg8ax6qjbk48"></elevenlabs-convai>' 
      }} />
    </div>
  );
};

export default AIAgentPage;
