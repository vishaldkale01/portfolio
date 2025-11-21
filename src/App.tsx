import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";
import { ThemeProvider } from './context/ThemeContext';
import { AdminProvider } from './context/AdminContext';
import { ChatBotProvider } from './context/ChatBotContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChatBotComponent } from './components/ChatBot/ChatBotComponent';
import { Home } from './pages/Home';
import { Experience } from './pages/Experience';
import { Projects } from './pages/Projects';
import { Contact } from './pages/Contact';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { socket } from './socket'; // ← important!

function App() {
   const [message, setMessage] = useState<string>("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("server-message", (msg) => {
      setMessage(msg);
      console.log("server message" , msg)
    });

    return () => {
      socket.off("server-message");
    };
  }, []);

  return (
    <ThemeProvider>
      <AdminProvider>
        <ChatBotProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 neural-bg">
              <div className="fixed inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
              <Navbar />
              <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
                <Routes>
                  <Route path="/portfolio" element={<Home />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/experience" element={<Experience />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
              <ChatBotComponent />
            </div>
          </Router>
        </ChatBotProvider>
      </AdminProvider>
    </ThemeProvider>
  );
}

export default App;
