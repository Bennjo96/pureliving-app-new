// src/components/messages/MessageCenter.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../api/api';
import LoadingSpinner from '../common/LoadingSpinner';

const MessageCenter = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageData, setNewMessageData] = useState({
    recipient: '',
    subject: '',
    message: '',
  });
  const [availableRecipients, setAvailableRecipients] = useState([]);

  // Fetch conversations
  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available recipients
  const fetchAvailableRecipients = async () => {
    try {
      const response = await api.get('/messages/recipients');
      setAvailableRecipients(response.data.recipients);
    } catch (err) {
      console.error('Error fetching recipients:', err);
      showToast(err.response?.data?.message || 'Failed to load recipients', 'error');
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchAvailableRecipients();
  }, []);

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // Handle new message form changes
  const handleNewMessageChange = (e) => {
    const { name, value } = e.target;
    setNewMessageData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Send new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/messages', newMessageData);
      
      // Close modal and reset form
      setShowNewMessageModal(false);
      setNewMessageData({
        recipient: '',
        subject: '',
        message: '',
      });
      
      // Navigate to the new conversation
      navigate(`/messages/${response.data.conversationId}`);
      showToast('Message sent successfully', 'success');
    } catch (err) {
      console.error('Error sending message:', err);
      showToast(err.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Mark conversation as read
  const markAsRead = async (conversationId) => {
    try {
      await api.patch(`/messages/conversations/${conversationId}/read`);
      
      // Update local state
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err) {
      console.error('Error marking conversation as read:', err);
      showToast(err.response?.data?.message || 'Failed to update conversation', 'error');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Today: show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Yesterday: show "Yesterday"
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Within a week: show day name
    if (now - date < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise: show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conversation => {
    // Apply search filter
    const matchesSearch = 
      conversation.participant.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.participant.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conversation.subject && conversation.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply read/unread filter
    const matchesReadFilter = 
      filter === 'all' || 
      (filter === 'unread' && conversation.unreadCount > 0) ||
      (filter === 'read' && conversation.unreadCount === 0);
    
    return matchesSearch && matchesReadFilter;
  });

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Message list sidebar */}
      <div className="w-64 flex flex-col border-r border-gray-200 dark:border-gray-700">
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Messages</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
          <div className="mt-6 flex space-x-4">
            <button
              type="button"
              onClick={() => setShowNewMessageModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              New Message
            </button>
            <button
              type="button"
              onClick={fetchConversations}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="px-6 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Search messages"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        {/* Filters */}
        <div className="px-6 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              className={`px-2 py-1 text-sm rounded-md ${
                filter === 'all'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('unread')}
              className={`px-2 py-1 text-sm rounded-md ${
                filter === 'unread'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Unread
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('read')}
              className={`px-2 py-1 text-sm rounded-md ${
                filter === 'read'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Read
            </button>
          </div>
        </div>
        
        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner size="small" />
            </div>
          ) : error ? (
            <div className="px-6 py-4 text-sm text-red-500 dark:text-red-400">
              {error}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              No conversations found
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredConversations.map((conversation) => (
                <li 
                  key={conversation._id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    conversation.unreadCount > 0 ? 'bg-blue-50 dark:bg-blue-900' : ''
                  }`}
                >
                  <Link 
                    to={`/messages/${conversation._id}`}
                    className="block px-6 py-4"
                    onClick={() => conversation.unreadCount > 0 && markAsRead(conversation._id)}
                  >
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {conversation.participant.firstName} {conversation.participant.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(conversation.updatedAt)}
                      </p>
                    </div>
                    {conversation.subject && (
                      <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                        {conversation.subject}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 mt-2">
                        {conversation.unreadCount} new {conversation.unreadCount === 1 ? 'message' : 'messages'}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Message content area */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center px-6 py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Select a conversation</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Choose a conversation from the list or create a new message.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowNewMessageModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Message
            </button>
          </div>
        </div>
      </div>
      
      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 dark:bg-gray-800">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">New Message</h3>
                  <div className="mt-4">
                    <form onSubmit={handleSendMessage}>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-6">
                          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Recipient
                          </label>
                          <div className="mt-1">
                            <select
                              id="recipient"
                              name="recipient"
                              required
                              value={newMessageData.recipient}
                              onChange={handleNewMessageChange}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <option value="">Select recipient</option>
                              {availableRecipients.map(recipient => (
                                <option key={recipient._id} value={recipient._id}>
                                  {recipient.firstName} {recipient.lastName} ({recipient.role})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Subject (optional)
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="subject"
                              id="subject"
                              value={newMessageData.subject}
                              onChange={handleNewMessageChange}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Message
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="message"
                              name="message"
                              rows={5}
                              required
                              value={newMessageData.message}
                              onChange={handleNewMessageChange}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                          disabled={loading}
                        >
                          {loading ? 'Sending...' : 'Send'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                          onClick={() => setShowNewMessageModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageCenter;