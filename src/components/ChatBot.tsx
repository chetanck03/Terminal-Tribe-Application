import { useState } from 'react';

interface ChatBotProps {
  configUrl: string;
}

const ChatBot = ({ configUrl }: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Create the shareable URL
  const shareableUrl = `https://cdn.botpress.cloud/webchat/v2.3/shareable.html?configUrl=${configUrl}`;

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-20 md:bottom-8 right-8 z-50 bg-campus-blue text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-all flex items-center"
        aria-label="Chat with AI Assistant"
      >
        {isOpen ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span className="font-medium">Close</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="font-medium">AI Assistant</span>
          </>
        )}
      </button>

      {/* Chat container with iframe */}
      {isOpen && (
        <div className="fixed bottom-28 md:bottom-24 right-8 z-50 w-80 md:w-96 h-96 bg-white rounded-lg shadow-xl overflow-hidden">
          <iframe 
            src={shareableUrl}
            title="Botpress Chat"
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            style={{ border: "none" }}
          />
        </div>
      )}
    </>
  );
};

export default ChatBot; 