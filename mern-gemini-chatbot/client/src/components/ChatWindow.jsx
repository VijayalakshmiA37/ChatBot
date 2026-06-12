import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Bot } from 'lucide-react';

const ChatWindow = ({ messages, isTyping }) => {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
      <div className="chat-window" style={{justifyContent: 'center'}}>
        <div className="empty-state">
          <Bot size={64} color="var(--accent-color)" />
          <h2>How can I help you today?</h2>
          <p>I am your MERN AI Assistant powered by Google Gemini. Ask me anything!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {messages.map((msg, index) => (
        <MessageBubble key={msg._id || index} message={msg} />
      ))}
      
      {isTyping && (
        <div className="message-wrapper assistant">
          <div className="avatar assistant">
            <Bot size={24} />
          </div>
          <div className="message-content">
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
