import { createContext, useState, useContext, useEffect } from 'react';

// Định nghĩa ngữ cảnh ngôn ngữ
export const LanguageContext = createContext();

// Bản dịch tiếng Việt
export const vietnameseTranslations = {
  // Student Dashboard
  'dashboard': 'Bảng điều khiển',
  'my_questions': 'Câu hỏi của tôi',
  'faq': 'Câu hỏi thường gặp',
  'logout': 'Đăng xuất',
  'student_dashboard': 'Bảng điều khiển sinh viên',
  'welcome': 'Xin chào',
  'ask_new_question': 'Đặt câu hỏi mới',
  'question_title': 'Tiêu đề câu hỏi',
  'question_type': 'Loại câu hỏi',
  'general_question': 'Câu hỏi chung',
  'technical_support': 'Hỗ trợ kỹ thuật',
  'billing_query': 'Câu hỏi về thanh toán',
  'feedback': 'Phản hồi',
  'description': 'Mô tả',
  'submit_question': 'Gửi câu hỏi',
  'my_recent_questions': 'Câu hỏi gần đây của tôi',
  'loading': 'Đang tải...',
  'no_questions': 'Bạn chưa gửi câu hỏi nào.',
  'created': 'Ngày tạo',
  'view_details': 'Xem chi tiết',
  'virtual_assistant': 'Trợ lý ảo',
  
  // Thread Status
  'status': 'Trạng thái',
  'new': 'Mới',
  'assigned': 'Đã phân công',
  'in_progress': 'Đang xử lý',
  'resolved': 'Đã giải quyết',
  'escalated': 'Đã chuyển cấp',
  
  // ThreadDetail
  'loading_thread': 'Đang tải...',
  'error': 'Lỗi',
  'try_again': 'Thử lại',
  'type': 'Loại',
  'assigned_to': 'Phân công cho',
  'priority': 'Độ ưu tiên',
  'quick_respond': 'Phản hồi nhanh',
  'mark_resolved': 'Đánh dấu đã giải quyết',
  'messages': 'Tin nhắn',
  'no_messages': 'Chưa có tin nhắn.',
  'you': 'Bạn',
  'staff': 'Nhân viên',
  'send_message': 'Gửi tin nhắn',
  'sending': 'Đang gửi...',
  
  // ChatBox
  'send': 'Gửi',
  'scroll_down': 'Cuộn xuống',
  'your_question': 'Nhập câu hỏi của bạn...',
  'create_ticket': 'Tạo đơn yêu cầu',
  'continue_chat': 'Tiếp tục chat',
  
  // Language Toggle
  'toggle_language': 'EN / VI',
  'english': 'English',
  'vietnamese': 'Tiếng Việt',
};

// Provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return savedLanguage || 'vi'; // Default to Vietnamese
  });

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'en' ? 'vi' : 'en'));
  };

  // Translate function
  const t = (key) => {
    if (language === 'en') {
      return key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    } else {
      return vietnameseTranslations[key] || key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);
