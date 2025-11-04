// src/components/messages/Conversation.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../api/api';
import LoadingSpinner from '../common/LoadingSpinner';

const Conversation = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);
  
  // Fetch conversation and messages
  const fetchConversation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch conversation details
      const conversationResponse = await api.get(`/messages/conversations/${conversationId}`);
      setConversation(conversationResponse.data.conversation);
      
      // Fetch messages
      const messagesResponse = await api.get(`/messages/conversations/${conversationId}/messages`);
      setMessages(messagesResponse.data.messages);
      
      // Mark conversation as read
      await api.patch(`/messages/conversations/${conversationId}/read`);
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError(err.response?.data?.message || 'Failed to load conversation');
      if (err.response?.status === 404) {
        navigate('/messages');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversation();
    
    // Set up polling for new messages
    const interval = setInterval(() => {
      if (!sending) {
        fetchNewMessages();
      }
    }, 10000); // every 10 seconds
    
    return () => clearInterval(interval);
  }, [conversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch only new messages (optimization)
  const fetchNewMessages = async () => {
    if (!messages.length) return;
    
    try {
      const lastMessageTime = messages[messages.length - 1].createdAt;
      const response = await api.get(
        `/messages/conversations/${conversationId}/messages?after=${lastMessageTime}`
      );
      
      if (response.data.messages.length > 0) {
        setMessages(prev => [...prev, ...response.data.messages]);
      }
    } catch (err) {
      console.error('Error fetching new messages:', err);
    }
  };

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    setSending(true);
    
    try {
      const response = await api.post(`/messages/conversations/${conversationId}`, {
        message: newMessage
      });
      
      // Add new message to the list
      setMessages(prev => [...prev, response.data.message]);
      
      // Clear input
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      showToast(err.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  // Format message timestamp
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format message date for group headers
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    }
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      formattedDate: formatMessageDate(date),
      messages
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Conversation header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="flex justify-between items-center px-6 py-3">
          <div className="flex items-center space-x-4">
            <Link to="/messages" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            
            {loading ? (
              <div className="h-10 w-40 bg-gray-200 animate-pulse rounded-md dark:bg-gray-700"></div>
            ) : error ? (
              <div className="text-sm text-red-500 dark:text-red-400">Error loading conversation</div>
            ) : conversation ? (
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-indigo-900">
                  {conversation.participant.profileImage ? (
                    <img 
                      src={conversation.participant.profileImage} 
                      alt={`${conversation.participant.firstName} ${conversation.participant.lastName}`}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <span className="text-indigo-600 font-medium dark:text-indigo-300">
                      {conversation.participant.firstName[0]}{conversation.participant.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {conversation.participant.firstName} {conversation.participant.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {conversation.participant.role}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={fetchConversation}
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <span className="sr-only">Refresh</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Conversation subject (if any) */}
        {conversation?.subject && (
          <div className="px-6 py-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Subject: {conversation.subject}
            </p>
          </div>
        )}
      </div>
      
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-6" ref={messageListRef}>
        {loading && !messages.length ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
            <Link 
              to="/messages"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Messages
            </Link>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <svg className="h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start the conversation by sending a message.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupMessagesByDate().map(group => (
              <div key={group.date} className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {group.formattedDate}
                    </p>
                  </div>
                </div>
                
                {group.messages.map((message, index) => {
                  const isCurrentUser = message.sender._id === user._id;
                  const showAvatar = index === 0 || group.messages[index - 1].sender._id !== message.sender._id;
                  
                  return (
                    <div key={message._id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      {!isCurrentUser && showAvatar && (
                        <div className="flex-shrink-0 mr-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-indigo-900">
                            {message.sender.profileImage ? (
                              <img 
                                src={message.sender.profileImage} 
                                alt={`${message.sender.firstName} ${message.sender.lastName}`}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <span className="text-xs text-indigo-600 font-medium dark:text-indigo-300">
                                {message.sender.firstName[0]}{message.sender.lastName[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className={`relative max-w-xl px-4 py-2 rounded-lg shadow ${
                        isCurrentUser 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <span className={`block text-xs mt-1 ${
                          isCurrentUser ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                      
                      {isCurrentUser && showAvatar && (
                        <div className="flex-shrink-0 ml-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-indigo-900">
                            {user.profileImage ? (
                              <img 
                                src={user.profileImage} 
                                alt={`${user.firstName} ${user.lastName}`}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <span className="text-xs text-indigo-600 font-medium dark:text-indigo-300">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message input */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <div className="flex-1">
            <textarea
              name="message"
              id="message"
              rows={1}
              className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Press Enter to send. Use Shift+Enter for a new line.
            </p>
          </div>
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              sending || !newMessage.trim() 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-indigo-700'
            }`}
          >
            {sending ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Conversation;