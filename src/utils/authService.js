// Authentication service to interact with the backend API
import { loginRequest, apiRequest } from './api';

// Login function
export const login = async (username, password) => {
  try {
    // Call the real login API
    const response = await loginRequest(username, password);
    
    // Store token in localStorage for future requests
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token);
    }
    
    // Extract user data
    const userData = response.user || {};
    
    // Store user data separately
    if (userData) {
      localStorage.setItem('auth_user', JSON.stringify(userData));
    }
    
    return {
      success: true,
      access_token: response.access_token,
      user: userData
    };
  } catch (error) {
    console.error('Đăng nhập thất bại:', error);
    return {
      success: false,
      error: error.message || 'Tên đăng nhập hoặc mật khẩu không đúng'
    };
  }
};

// Get current user info
export const getCurrentUser = async () => {
  try {
    const response = await apiRequest('/auth/me');
    return {
      success: true,
      user: response.user
    };
  } catch (error) {
    console.error('Không thể lấy thông tin người dùng:', error);
    return {
      success: false,
      error: error.message || 'Không thể lấy thông tin người dùng'
    };
  }
};

// Logout function
export const logout = () => {
  // Clear stored auth data
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  
  return {
    success: true
  };
};

export default {
  login,
  logout,
  getCurrentUser
};
