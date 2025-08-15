import { useState, useEffect } from 'react';
import { getThreadById, getThreadMessages, addThreadMessage } from '../utils/threadService';
import { useLanguage } from '../utils/languageContext';

const API_BASE = 'http://localhost:8000'; // Keeping for reference

const ThreadDetail = ({ 
  threadId, 
  onClose, 
  canRespond = false, 
  onRespond = null,
  onResolve = null,
  userRole = 'student'
}) => {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Language context
  const { t, language, toggleLanguage } = useLanguage();

  useEffect(() => {
    if (!threadId) return;
    
    console.log('ThreadDetail mounted with threadId:', threadId);
    fetchThreadDetail();
  }, [threadId]);
  
  const fetchThreadDetail = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log("Fetching thread detail for ID:", threadId);
      
      // Using the thread service to fetch thread details
      const threadData = await getThreadById(threadId);
      console.log("Thread data response:", threadData);
      
      if (!threadData.success) {
        console.error("Thread fetch unsuccessful:", threadData.error);
        throw new Error(threadData.error || 'Failed to fetch thread details');
      }
      
      setThread(threadData);
      
      // Fetch thread messages
      console.log("Fetching messages for thread:", threadId);
      const messagesData = await getThreadMessages(threadId);
      console.log("Messages data response:", messagesData);
      
      if (!messagesData.success) {
        console.error("Messages fetch unsuccessful:", messagesData.error);
        throw new Error(messagesData.error || 'Failed to fetch thread messages');
      }
      
      setMessages(messagesData.messages || []);
      
    } catch (err) {
      setError('Error loading thread details. Please try again.');
      console.error('Error fetching thread details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }
    
    setSending(true);
    setError('');
    
    try {
      // Using mock service instead of real API
      const response = await addThreadMessage(threadId, {
        content: newMessage,
        sender_type: userRole === 'department' ? 'staff' : 'user',
        sender_name: userRole === 'department' ? 'Department Staff' : 'Student'
      });
      
      if (!response.success) {
        throw new Error('Failed to send message');
      }
      
      // Clear input and refresh messages
      setNewMessage('');
      fetchThreadDetail();
    } catch (err) {
      setError('Error sending message. Please try again.');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="thread-detail-modal">
        <div className="thread-detail-content">
          <div className="thread-detail-header">
            <h2>{t('loading_thread')}</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="thread-detail-loading">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="thread-detail-modal">
        <div className="thread-detail-content">
          <div className="thread-detail-header">
            <h2>{t('error')}</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="thread-detail-error">
            <p>{error}</p>
            <button className="btn" onClick={fetchThreadDetail}>{t('try_again')}</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!thread) return null;

  return (
    <div className="thread-detail-modal">
      <div className="thread-detail-content">
        <div className="thread-detail-header">
          <h2>{thread.title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {/* Language toggle button */}
        <div className="language-toggle">
          <button onClick={toggleLanguage} className="lang-btn">
            {language === 'en' ? 'VI' : 'EN'}
          </button>
        </div>

        <div className="thread-detail-info">
          <div className="info-item">
            <span className="info-label">{t('status')}:</span>
            <span className={`status-badge status-${thread.status}`}>
              {thread.status === 'resolved' ? t('resolved') : 
               thread.status === 'new' ? t('new') : 
               thread.status === 'assigned' ? t('assigned') :
               thread.status === 'in_progress' ? t('in_progress') :
               thread.status === 'escalated' ? t('escalated') : thread.status}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('type')}:</span>
            <span>{thread.issue_type}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('created')}:</span>
            <span>{formatDate(thread.created_at)}</span>
          </div>
          {thread.assigned_to && (
            <div className="info-item">
              <span className="info-label">{t('assigned_to')}:</span>
              <span>{thread.assigned_to}</span>
            </div>
          )}
          {thread.priority && (
            <div className="info-item">
              <span className="info-label">{t('priority')}:</span>
              <span className={`priority-indicator priority-${thread.priority}`}>{thread.priority}</span>
            </div>
          )}
        </div>
        
        {/* Department actions */}
        {canRespond && (thread.status === 'assigned' || thread.status === 'in_progress') && (
          <div className="thread-actions">
            {onRespond && (
              <button className="btn" onClick={() => onRespond(thread)}>
                {t('quick_respond')}
              </button>
            )}
            {onResolve && (
              <button className="btn btn-success ms-2" onClick={() => onResolve(thread.id)}>
                {t('mark_resolved')}
              </button>
            )}
          </div>
        )}
        
        {thread.description && (
          <div className="thread-description">
            <h3>{t('description')}</h3>
            <p>{thread.description}</p>
          </div>
        )}
        
        <div className="thread-messages">
          <h3>{t('messages')}</h3>
          
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>{t('no_messages')}</p>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((message) => (
                <div key={message.id} className={`message-item ${message.sender_type === 'user' ? 'user-message' : 'staff-message'}`}>
                  <div className="message-sender">
                    {message.sender_name || (message.sender_type === 'user' ? t('you') : t('staff'))}
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-time">
                    {formatDate(message.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="message-form">
            <form onSubmit={handleSendMessage}>
              <div className="form-group">
                <textarea
                  className="form-control"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('your_question')}
                  rows="3"
                  disabled={sending}
                ></textarea>
              </div>
              <button type="submit" className="btn" disabled={sending || !newMessage.trim()}>
                {sending ? t('sending') : t('send_message')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadDetail;
