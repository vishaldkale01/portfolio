import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import type { Settings } from '../types';

interface ChatBotContextType {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

export function ChatBotProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get<Settings>('/settings');
        if ('data' in response && response.data) {
          setIsEnabled(response.data.homePage.showChatBot);
        }
      } catch (error) {
        console.error('Failed to fetch chat bot settings:', error);
      }
    };

    fetchSettings();

    // Listen for settings updates
    const handleSettingsUpdate = (event: CustomEvent<Settings>) => {
      setIsEnabled(event.detail.homePage.showChatBot);
    };

    window.addEventListener('settings:updated', handleSettingsUpdate as EventListener);
    return () => {
      window.removeEventListener('settings:updated', handleSettingsUpdate as EventListener);
    };
  }, []);

  return (
    <ChatBotContext.Provider value={{ isEnabled, setIsEnabled }}>
      {children}
    </ChatBotContext.Provider>
  );
}

export function useChatBot() {
  const context = useContext(ChatBotContext);
  if (context === undefined) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
}