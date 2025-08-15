// API health check utility

import { apiRequest } from './api';

// Function to check if the backend API is running
export const checkApiHealth = async () => {
  try {
    const response = await apiRequest('/health');
    return response.status === 'ok';
  } catch (error) {
    console.error('Kiểm tra sức khỏe API thất bại:', error);
    return false;
  }
};

// Function to validate API connection and token
export const validateApiConnection = async () => {
  try {
    // Check basic health
    const isHealthy = await checkApiHealth();
    if (!isHealthy) {
      return {
        success: false,
        message: 'API backend không phản hồi. Vui lòng kiểm tra xem máy chủ có đang chạy không.'
      };
    }
    
    // Check authentication if token exists
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        await apiRequest('/auth/me');
        return {
          success: true,
          message: 'Kết nối API và xác thực hợp lệ.'
        };
      } catch (authError) {
        console.error('Xác thực không thành công:', authError);
        // Clear invalid token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        return {
          success: false,
          message: 'Token xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
          authError: true
        };
      }
    }
    
    return {
      success: true,
      message: 'Kết nối API hợp lệ nhưng chưa được xác thực.'
    };
  } catch (error) {
    console.error('Xác thực API thất bại:', error);
    return {
      success: false,
      message: 'Không thể xác thực kết nối API. Vui lòng kiểm tra mạng của bạn.'
    };
  }
};

export default {
  checkApiHealth,
  validateApiConnection
};
