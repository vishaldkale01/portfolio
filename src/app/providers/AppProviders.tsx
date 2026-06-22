import type { PropsWithChildren } from 'react';
import { ThemeProvider } from '../../context/ThemeContext';
import { AdminProvider } from '../../context/AdminContext';
import { ChatBotProvider } from '../../context/ChatBotContext';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <AdminProvider>
        <ChatBotProvider>{children}</ChatBotProvider>
      </AdminProvider>
    </ThemeProvider>
  );
}
