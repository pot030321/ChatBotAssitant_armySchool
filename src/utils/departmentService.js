// Department service to interact with the department-related API endpoints
import { apiRequest } from './api';

// Get all departments
export const getAllDepartments = async () => {
  try {
    const response = await apiRequest('/departments');
    
    return {
      success: true,
      departments: response.departments || []
    };
  } catch (error) {
    console.error('Không thể lấy danh sách phòng ban:', error);
    return {
      success: false,
      error: error.message || 'Không thể lấy danh sách phòng ban',
      departments: []
    };
  }
};

// Get a specific department by ID
export const getDepartmentById = async (departmentId) => {
  try {
    const department = await apiRequest(`/departments/${departmentId}`);
    
    return {
      success: true,
      ...department
    };
  } catch (error) {
    console.error(`Không thể lấy thông tin phòng ban ${departmentId}:`, error);
    return {
      success: false,
      error: error.message || 'Không tìm thấy phòng ban'
    };
  }
};

// Create a new department (for manager/leadership)
export const createDepartment = async (departmentData) => {
  try {
    const department = await apiRequest('/departments', 'POST', departmentData);
    
    return {
      success: true,
      department
    };
  } catch (error) {
    console.error('Không thể tạo phòng ban mới:', error);
    return {
      success: false,
      error: error.message || 'Không thể tạo phòng ban mới'
    };
  }
};

// Update department (for manager/leadership)
export const updateDepartment = async (departmentId, departmentData) => {
  try {
    const department = await apiRequest(`/departments/${departmentId}`, 'PATCH', departmentData);
    
    return {
      success: true,
      department
    };
  } catch (error) {
    console.error(`Không thể cập nhật phòng ban ${departmentId}:`, error);
    return {
      success: false,
      error: error.message || 'Không thể cập nhật phòng ban'
    };
  }
};

// Delete department (for manager/leadership)
export const deleteDepartment = async (departmentId) => {
  try {
    await apiRequest(`/departments/${departmentId}`, 'DELETE');
    
    return {
      success: true
    };
  } catch (error) {
    console.error(`Không thể xóa phòng ban ${departmentId}:`, error);
    return {
      success: false,
      error: error.message || 'Không thể xóa phòng ban'
    };
  }
};

export default {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
