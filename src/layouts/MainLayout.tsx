import type { PropsWithChildren } from 'react';
import { Navbar } from '../components/Navbar';
import { useLocation } from 'react-router-dom';
import { ChatBotComponent } from '../components/ChatBot/ChatBotComponent';

export function MainLayout({ children }: PropsWithChildren) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 neural-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-md focus:bg-white focus:text-gray-900"
      >
        Skip to main content
      </a>
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
      <Navbar />
      <main 
        id="main-content" 
        className={`w-full mx-auto relative ${
          location.pathname.startsWith('/admin/dashboard') || location.pathname.startsWith('/task')
            ? '' 
            : 'px-4 sm:px-6 lg:px-8 py-8'
        }`}
      >
        {children}
      </main>
      <ChatBotComponent />
    </div>
  );
}
