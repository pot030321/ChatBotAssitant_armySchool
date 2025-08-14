import { useState, useEffect, useRef } from 'react';
import mockFetchAIResponse from '../utils/aiService';
import './ChatBox.css';
import { useLanguage } from '../utils/languageContext';

const ChatBox = ({ onCreateTicket }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Language context
  const { t, language, toggleLanguage } = useLanguage();
  
  // Add initial welcome message when component mounts
  useEffect(() => {
    // Get user role to customize the welcome message
    let userRole = 'student';
    try {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        userRole = userData.role?.toLowerCase() || 'student';
      }
    } catch (err) {
      console.error('Error getting user role:', err);
    }

    // Get current language
    const { language } = useLanguage();
    
    // Customize welcome message based on user role
    let welcomeMessage = '';
    
    if (language === 'en') {
      if (userRole === 'manager') {
        welcomeMessage = 'Hello! I am the management assistant. How can I help you?';
      } else if (userRole === 'department') {
        welcomeMessage = 'Hello! I am the department staff assistant. How can I help you?';
      } else if (userRole === 'leadership') {
        welcomeMessage = 'Hello! I am the leadership support assistant. How can I help you?';
      } else {
        welcomeMessage = 'Hello! I am the student support assistant. How can I help you?';
      }
    } else {
      if (userRole === 'manager') {
        welcomeMessage = 'Xin chào! Tôi là trợ lý ảo hỗ trợ quản lý. Bạn cần giúp đỡ gì?';
      } else if (userRole === 'department') {
        welcomeMessage = 'Xin chào! Tôi là trợ lý ảo hỗ trợ nhân viên khoa. Bạn cần giúp đỡ gì?';
      } else if (userRole === 'leadership') {
        welcomeMessage = 'Xin chào! Tôi là trợ lý ảo hỗ trợ lãnh đạo. Bạn cần giúp đỡ gì?';
      } else {
        welcomeMessage = 'Xin chào! Tôi là trợ lý ảo của hệ thống hỗ trợ sinh viên. Bạn cần giúp đỡ gì?';
      }
    }
    
    setMessages([
      {
        id: 1,
        text: welcomeMessage,
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Add a state to track if auto-scrolling should occur
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  // Auto scroll to bottom only when shouldAutoScroll is true
  useEffect(() => {
    if (shouldAutoScroll) {
      // Đặt timeout để đảm bảo DOM đã được cập nhật trước khi cuộn
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, shouldAutoScroll, language]); // Thêm phụ thuộc vào ngôn ngữ để cuộn khi ngôn ngữ thay đổi

  // Handle scroll events to detect if user has scrolled up
  const handleScroll = (e) => {
    if (!isTyping) { // Chỉ thay đổi auto-scroll khi không có tin nhắn đang nhập
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      // If user scrolls up (not at the bottom), disable auto-scrolling
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 30;
      setShouldAutoScroll(isAtBottom);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };
  
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Always enable auto-scroll when user sends a message
    setShouldAutoScroll(true);
    
    try {
      // Call mocked AI service
      const data = await mockFetchAIResponse(inputValue);
      
      // Add AI response to chat
      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        needsHumanHelp: data.needsHumanHelp || false
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      // If AI can't help, suggest creating a ticket
      if (data.needsHumanHelp) {
        setTimeout(() => {
          const suggestionMessage = {
            id: Date.now() + 2,
            text: 'Có vẻ như câu hỏi của bạn cần sự hỗ trợ từ nhân viên. Bạn có muốn tạo một đơn yêu cầu không?',
            sender: 'bot',
            timestamp: new Date(),
            showTicketButtons: true
          };
          
          setMessages(prevMessages => [...prevMessages, suggestionMessage]);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Xin lỗi, tôi đang gặp sự cố kết nối. Bạn có muốn tạo một đơn yêu cầu để được nhân viên hỗ trợ không?',
        sender: 'bot',
        timestamp: new Date(),
        showTicketButtons: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleCreateTicket = () => {
    // Get user's question from chat history
    const userMessages = messages.filter(msg => msg.sender === 'user');
    const botMessages = messages.filter(msg => msg.sender === 'bot');
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    if (lastUserMessage && onCreateTicket) {
      // Prepare ticket data with conversation history
      const conversationHistory = [];
      let messageIndex = 0;
      
      // Create a chronological conversation log
      while (messageIndex < messages.length) {
        const msg = messages[messageIndex];
        const sender = msg.sender === 'user' ? 'Student' : 'AI Assistant';
        conversationHistory.push(`${sender}: ${msg.text}`);
        messageIndex++;
      }
      
      onCreateTicket({
        title: lastUserMessage.text.length > 50 
          ? lastUserMessage.text.substring(0, 50) + '...' 
          : lastUserMessage.text,
        description: `Conversation with AI Assistant:\n\n${conversationHistory.join('\n\n')}`,
        type: 'question'
      });
    }
  };
  
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbox">
      <div className="chatbox-header">
        <h3>{t('virtual_assistant')}</h3>
        <button className="lang-toggle-btn" onClick={toggleLanguage}>
          {language === 'en' ? 'VI' : 'EN'}
        </button>
      </div>
      
      <div className="chatbox-messages" onScroll={handleScroll}>
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-time">{formatTimestamp(message.timestamp)}</div>
            </div>
            
            {message.showTicketButtons && (
              <div className="message-actions">
                <button 
                  className="create-ticket-btn"
                  onClick={handleCreateTicket}
                >
                  {t('create_ticket')}
                </button>
                <button className="continue-chat-btn">
                  {t('continue_chat')}
                </button>
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        {!shouldAutoScroll && (
          <button 
            className="scroll-bottom-btn" 
            onClick={() => {
              scrollToBottom();
              setShouldAutoScroll(true);
            }}
          >
            ↓ {t('scroll_down')}
          </button>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chatbox-input" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder={t('your_question')}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isTyping}
        />
        <button type="submit" disabled={!inputValue.trim() || isTyping}>
          {t('send')}
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
