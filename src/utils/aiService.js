// Mocked AI API Service - For demonstration purpose
// This file simulates AI responses from the server

// Questions the AI can handle itself
const knowledgeBase = [
  {
    keywords: ['thời gian', 'giờ', 'học', 'lịch học'],
    response: 'Lịch học của bạn có thể được tìm thấy trong hệ thống quản lý học tập. Bạn có thể truy cập vào đó bằng cách đăng nhập tại portal.school.edu/schedule.',
    canHandle: true
  },
  {
    keywords: ['học phí', 'tiền học', 'thanh toán', 'phí', 'học kỳ', 'kỳ học'],
    response: 'Thông tin về học phí cho học kỳ hiện tại có thể được tìm thấy trong cổng thông tin sinh viên tại mục "Tài chính". Bạn cũng có thể liên hệ phòng tài chính qua số 0123-456-789.',
    canHandle: true
  },
  {
    keywords: ['đăng ký', 'môn học', 'lớp học'],
    response: 'Bạn có thể đăng ký các môn học cho học kỳ tới thông qua cổng thông tin sinh viên. Thời gian đăng ký thường bắt đầu từ 2 tuần trước khi kết thúc học kỳ hiện tại.',
    canHandle: true
  },
  {
    keywords: ['xin nghỉ', 'vắng', 'phép', 'ốm', 'nghỉ học'],
    response: 'Để xin nghỉ học, bạn cần gửi đơn xin phép cho giảng viên môn học và trưởng khoa. Bạn có thể tải mẫu đơn tại website của trường hoặc liên hệ văn phòng khoa.',
    canHandle: true
  },
  {
    keywords: ['bằng', 'tốt nghiệp', 'graduation'],
    response: 'Các thủ tục liên quan đến bằng tốt nghiệp được xử lý bởi phòng Đào tạo. Sau khi hoàn thành tất cả các môn học và đủ điều kiện tốt nghiệp, bạn cần nộp đơn xin cấp bằng tại văn phòng đào tạo.',
    canHandle: true
  },
  {
    keywords: ['thư viện', 'sách', 'mượn sách'],
    response: 'Thư viện trường mở cửa từ 8:00 đến 20:00 các ngày trong tuần, và 8:00 đến 17:00 vào cuối tuần. Bạn có thể mượn tối đa 5 cuốn sách trong thời gian 2 tuần.',
    canHandle: true
  }
];

// Simulated AI response function
export const getAIResponse = async (message) => {
  // Delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase();
  
  // Check if the message contains any keywords in our knowledge base
  for (const item of knowledgeBase) {
    if (item.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        response: item.response,
        needsHumanHelp: !item.canHandle
      };
    }
  }
  
  // General responses for messages that don't match specific keywords
  if (lowerMessage.length < 10) {
    return {
      response: 'Vui lòng cung cấp thêm thông tin về vấn đề của bạn để tôi có thể giúp đỡ tốt hơn.',
      needsHumanHelp: false
    };
  }
  
  // Assume AI can't handle complex queries that didn't match our knowledge base
  return {
    response: 'Tôi hiểu vấn đề của bạn, nhưng đây là một câu hỏi phức tạp hơn. Tôi nghĩ bạn nên trao đổi với nhân viên hỗ trợ để được giải đáp đầy đủ hơn.',
    needsHumanHelp: true
  };
};

// This would be replaced by a real API call in a production environment
export const mockFetchAIResponse = async (message) => {
  try {
    const response = await getAIResponse(message);
    return response;
  } catch (error) {
    console.error('Error in AI service:', error);
    return {
      response: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
      needsHumanHelp: true
    };
  }
};

export default mockFetchAIResponse;
