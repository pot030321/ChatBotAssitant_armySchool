// API utility functions for connecting to the backend

// Base API URL - adjust according to your backend server configuration
const API_URL = 'http://localhost:8000';

// Get the stored auth token
const getToken = () => {
  const tokenData = localStorage.getItem('auth_token');
  return tokenData || '';
};

// Helper function for making API requests
export const apiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const url = `${API_URL}${endpoint}`;
    const token = getToken();
    
    console.log(`Making ${method} request to: ${url}`);
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Using auth token for request');
    } else {
      console.warn('No auth token available for request');
    }
    
    const options = {
      method,
      headers,
      credentials: 'include',
    };
    
    // Add body for methods that need it
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(data);
      console.log('Request body:', data);
    }
    
    console.log('Making request with options:', { ...options, headers: { ...options.headers } });
    
    const response = await fetch(url, options);
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    // Handle non-JSON responses
    let result;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      // Handle non-JSON response
      const text = await response.text();
      console.warn('Non-JSON response received:', text);
      result = { text };
    }
    
    // Handle error responses
    if (!response.ok) {
      console.error('API error response:', result);
      throw new Error(result.detail || 'Đã xảy ra lỗi');
    }
    
    return result;
  } catch (error) {
    console.error('Yêu cầu API thất bại:', error);
    throw error;
  }
};

// Specialized helper for login which uses form data format
export const loginRequest = async (username, password) => {
  try {
    const url = `${API_URL}/auth/login`;
    
    // For login, we use application/x-www-form-urlencoded format as required by OAuth2
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
      credentials: 'include',
    });
    
    const result = await response.json();
    
    // Handle error responses
    if (!response.ok) {
      throw new Error(result.detail || 'Đăng nhập không thành công');
    }
    
    return result;
  } catch (error) {
    console.error('Yêu cầu đăng nhập thất bại:', error);
    throw error;
  }
};

export default {
  apiRequest,
  loginRequest,
};
