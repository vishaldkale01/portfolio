import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { useContacts } from '../../hooks/useContacts';

export function ContactsTab() {
  const { theme } = useTheme();
  const {
    contacts,
    loading,
    submitLoading,
    fetchContacts,
    replyToContact,
    deleteContact
  } = useContacts();

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleReplyToContact = async (id: string, reply: string) => {
    await replyToContact(id, reply);
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) return;
    await deleteContact(id);
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-blue-400">Loading contacts...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {contacts.map((contact) => (
            <motion.div
              key={contact.email}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`relative group ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-white/50'} p-6 rounded-lg border border-blue-500/30 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} text-lg`}>
                      {contact.name}
                    </h3>
                    <a 
                      href={`mailto:${contact.email}`} 
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      {contact.email}
                    </a>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        contact.hasUnreplied
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          : 'bg-green-500/10 text-green-400 border-green-500/30'
                      } border`}>
                        {contact.totalMessages} message{contact.totalMessages !== 1 ? 's' : ''} • {contact.hasUnreplied ? 'Has unreplied' : 'All replied'}
                      </span>
                    </div>
                  </div>
                </div>

                {contact.messages.map((msg) => (
                  <div key={msg._id} className="mt-4 p-4 rounded-lg border border-blue-500/10 bg-blue-500/5">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-gray-500">
                        {new Date(msg.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        msg.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          : 'bg-green-500/10 text-green-400 border-green-500/30'
                      } border`}>
                        {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                      </span>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                      {msg.message}
                    </p>

                    {msg.reply && msg.replyDate && (
                      <div className="mt-4 p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                        <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Your Reply:
                        </h4>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} whitespace-pre-wrap`}>
                          {msg.reply}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Replied on: {new Date(msg.replyDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-3">
                      {msg.status === 'pending' && (
                        <Button
                          variant="secondary"
                          onClick={() => {
                            const el = document.getElementById(`reply-${msg._id}`) as HTMLTextAreaElement;
                            if (el) el.focus();
                          }}
                        >
                          Reply
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteContact(msg._id)}
                        isLoading={submitLoading}
                        loadingText="Deleting..."
                      >
                        Delete
                      </Button>
                    </div>

                    {msg.status === 'pending' && (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const replyText = (form.elements.namedItem('reply') as HTMLTextAreaElement).value;
                          if (replyText.trim()) {
                            handleReplyToContact(msg._id, replyText.trim());
                            form.reset();
                          }
                        }} 
                        className="mt-4 space-y-4"
                      >
                        <div>
                          <label 
                            htmlFor={`reply-${msg._id}`} 
                            className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}
                          >
                            Write a Reply
                          </label>
                          <textarea
                            id={`reply-${msg._id}`}
                            name="reply"
                            className={`w-full p-3 ${theme === 'dark' ? 'bg-black/50 text-gray-300' : 'bg-white text-gray-900'} border border-blue-500/30 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400`}
                            rows={4}
                            required
                            placeholder="Type your reply here..."
                          />
                        </div>
                        <Button 
                          type="submit" 
                          isLoading={submitLoading} 
                          loadingText="Sending..."
                        >
                          Send Reply
                        </Button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
