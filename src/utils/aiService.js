// Dịch vụ AI để tương tác với API Gemini ở backend
import { apiRequest } from './api';

// Lấy phản hồi AI từ backend
export const getAIResponse = async (message) => {
  try {
    // Gọi API thực tế để lấy phản hồi AI
    const response = await apiRequest('/ai/chat', 'POST', { message });
    
    return {
      response: response.text || response.message || 'Không nhận được phản hồi từ AI.',
      needsHumanHelp: response.needs_human_help || false
    };
  } catch (error) {
    console.error('Lỗi trong dịch vụ AI:', error);
    return {
      response: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
      needsHumanHelp: true
    };
  }
};

// Nếu endpoint dịch vụ AI chưa có sẵn trong backend,
// hàm này sẽ sử dụng một số phản hồi cơ bản thay thế
export const fetchAIResponse = async (message) => {
  try {
    return await getAIResponse(message);
  } catch (error) {
    console.error('Dịch vụ AI không khả dụng, đang sử dụng phản hồi dự phòng:', error);
    
    // Fallback responses based on common keywords
    const lowerMessage = message.toLowerCase();
    
    // Mẫu dự phòng đơn giản
    if (lowerMessage.includes('học phí') || lowerMessage.includes('thanh toán')) {
      return {
        response: 'Thông tin về học phí có thể được tìm thấy trong cổng thông tin sinh viên tại mục "Tài chính".',
        needsHumanHelp: false
      };
    }
    
    if (lowerMessage.includes('lịch học') || lowerMessage.includes('thời khóa biểu')) {
      return {
        response: 'Lịch học của bạn có thể được tìm thấy trong hệ thống quản lý học tập.',
        needsHumanHelp: false
      };
    }
    
    // Phản hồi mặc định cho trường hợp dự phòng
    return {
      response: 'Tôi hiểu vấn đề của bạn, nhưng tôi nghĩ bạn nên trao đổi với nhân viên hỗ trợ để được giải đáp đầy đủ hơn.',
      needsHumanHelp: true
    };
  }
};

export default fetchAIResponse;
