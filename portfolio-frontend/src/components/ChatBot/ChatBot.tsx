import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatBotState } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import './ChatBot.css';

const dummyMessages: ChatMessage[] = [
  {
    id: '1',
    text: '👋 Hi! I\'m your AI assistant. Need any help?',
    sender: 'bot',
    timestamp: new Date()
  }
];

export const ChatBot: React.FC = () => {
  const { theme } = useTheme();
  const [state, setState] = useState<ChatBotState>({
    isOpen: false,
    messages: dummyMessages,
    loading: false
  });
  const [input, setInput] = useState('');
  const [isInitialRender, setIsInitialRender] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (state.isOpen) {
      inputRef.current?.focus();
    }
  }, [state.messages, state.isOpen]);

  useEffect(() => {
    // Add initial attention-grabbing animation
    const timer = setTimeout(() => {
      setIsInitialRender(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const toggleChat = () => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      loading: true
    }));

    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'This is a dummy response. AI integration coming soon! 🤖✨',
        sender: 'bot',
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botResponse],
        loading: false
      }));
    }, 1000);
  };

  return (
    <div className={`chatbot-container ${isInitialRender ? 'initial-render' : ''}`}>
      {!state.isOpen && (
        <button 
          onClick={toggleChat} 
          className={`chat-button ${theme} ${isInitialRender ? 'bounce' : ''}`}
          aria-label="Open chat"
        >
          <div className="chat-button-content">
            <span className="chat-icon">🤖</span>
            <span className="chat-pulse"></span>
          </div>
        </button>
      )}

      {state.isOpen && (
        <div className={`chat-window ${theme}`}>
          <div className={`chat-header ${theme}`}>
            <div className="header-content">
              <span className="bot-avatar">🤖</span>
              <div className="header-text">
                <h3>AI Assistant</h3>
                <span className="status">Online</span>
              </div>
            </div>
            <button 
              onClick={toggleChat} 
              className={`close-button ${theme}`}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          
          <div className={`messages-container ${theme}`}>
            {state.messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'bot' ? 'bot' : 'user'} ${theme}`}
              >
                {message.text}
                <span className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            ))}
            {state.loading && (
              <div className={`message bot ${theme}`}>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={`input-container ${theme}`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className={`chat-input ${theme}`}
            />
            <button 
              onClick={handleSend}
              className={`send-button ${theme}`}
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <span className="send-icon">📤</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};