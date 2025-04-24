import { ChatBot } from './ChatBot';
import { useChatBot } from '../../context/ChatBotContext';

export function ChatBotComponent() {
  const { isEnabled } = useChatBot();
  
  if (!isEnabled) {
    return null;
  }

  return <ChatBot />;
}