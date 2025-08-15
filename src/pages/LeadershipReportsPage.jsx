import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalyticsData } from '../utils/threadService';
import '../styles/LeadershipPages.css';

// Lấy thông tin người dùng từ localStorage
const getUserInfo = () => {
  try {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
  return null;
};

const LeadershipReportsPage = () => {
  const [user, setUser] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Report generation state
  const [selectedReport, setSelectedReport] = useState('weekly');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    // Get user from localStorage using helper function
    const userData = getUserInfo();
    if (userData) {
      setUser(userData);
    }
    
    // Fetch analytics data
    fetchAnalyticsData();
  }, []);
  
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await getAnalyticsData();
      
      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Error loading analytics data. Please try again.');
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">Cổng Hỗ Trợ</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item" onClick={() => navigate('/leadership')}>Bảng điều khiển</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/leadership/analytics')}>Phân tích</li>
          <li className="sidebar-menu-item active">Báo cáo</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Đăng xuất</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Tạo báo cáo</h1>
          <div>
            {user && <span>Xin chào, {user.name || user.username}</span>}
          </div>
        </div>
        
        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu báo cáo...</p>
          </div>
        ) : analyticsData ? (
          <div className="reports-content">
            <div className="card mb-4">
              <div className="card-header">
                <h2 className="card-title">Tạo báo cáo</h2>
              </div>
              <div className="card-body">
                <div className="report-form">
                  <div className="form-group">
                    <label>Loại báo cáo</label>
                    <select 
                      className="form-control" 
                      value={selectedReport}
                      onChange={(e) => setSelectedReport(e.target.value)}
                    >
                      <option value="weekly">Tổng kết tuần</option>
                      <option value="monthly">Tổng kết tháng</option>
                      <option value="department">Hiệu suất phòng ban</option>
                      <option value="response">Phân tích thời gian phản hồi</option>
                      <option value="custom">Báo cáo tùy chỉnh</option>
                    </select>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Ngày bắt đầu</label>
                      <input 
                        type="date" 
                        className="form-control"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Ngày kết thúc</label>
                      <input 
                        type="date" 
                        className="form-control"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Bao gồm các phần</label>
                    <div className="checkbox-group">
                      <div className="checkbox-item">
                        <input type="checkbox" id="include-summary" defaultChecked />
                        <label htmlFor="include-summary">Tóm tắt điều hành</label>
                      </div>
                      <div className="checkbox-item">
                        <input type="checkbox" id="include-metrics" defaultChecked />
                        <label htmlFor="include-metrics">Chỉ số quan trọng</label>
                      </div>
                      <div className="checkbox-item">
                        <input type="checkbox" id="include-department" defaultChecked />
                        <label htmlFor="include-department">Phân tích theo phòng ban</label>
                      </div>
                      <div className="checkbox-item">
                        <input type="checkbox" id="include-types" defaultChecked />
                        <label htmlFor="include-types">Loại yêu cầu</label>
                      </div>
                      <div className="checkbox-item">
                        <input type="checkbox" id="include-recommendations" defaultChecked />
                        <label htmlFor="include-recommendations">Khuyến nghị</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Định dạng đầu ra</label>
                    <div className="radio-group">
                      <div className="radio-item">
                        <input type="radio" id="format-pdf" name="format" defaultChecked />
                        <label htmlFor="format-pdf">PDF</label>
                      </div>
                      <div className="radio-item">
                        <input type="radio" id="format-excel" name="format" />
                        <label htmlFor="format-excel">Excel</label>
                      </div>
                      <div className="radio-item">
                        <input type="radio" id="format-html" name="format" />
                        <label htmlFor="format-html">HTML</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="btn" 
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Đang tạo...' : 'Tạo báo cáo'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mb-4">
              <div className="card-header">
                <h2 className="card-title">Báo cáo gần đây</h2>
              </div>
              <div className="card-body">
                <div className="recent-reports">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Tên báo cáo</th>
                        <th>Loại</th>
                        <th>Khoảng thời gian</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Tổng kết tuần</td>
                        <td>Hàng tuần</td>
                        <td>05/08/2025 - 12/08/2025</td>
                        <td>12/08/2025</td>
                        <td>
                          <button className="btn btn-sm">Xem</button>
                          <button className="btn btn-sm ms-2">Tải xuống</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Báo cáo tháng 7</td>
                        <td>Hàng tháng</td>
                        <td>01/07/2025 - 31/07/2025</td>
                        <td>03/08/2025</td>
                        <td>
                          <button className="btn btn-sm">Xem</button>
                          <button className="btn btn-sm ms-2">Tải xuống</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Hiệu suất Phòng CNTT</td>
                        <td>Phòng ban</td>
                        <td>15/07/2025 - 15/08/2025</td>
                        <td>15/08/2025</td>
                        <td>
                          <button className="btn btn-sm">Xem</button>
                          <button className="btn btn-sm ms-2">Tải xuống</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Báo cáo đã lên lịch</h2>
              </div>
              <div className="card-body">
                <div className="scheduled-reports">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Tên báo cáo</th>
                        <th>Lịch</th>
                        <th>Người nhận</th>
                        <th>Lần chạy tiếp theo</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Tóm tắt điều hành hàng tuần</td>
                        <td>Mỗi thứ Hai lúc 8:00 sáng</td>
                        <td>leadership@university.edu</td>
                        <td>19/08/2025</td>
                        <td>
                          <button className="btn btn-sm">Sửa</button>
                          <button className="btn btn-sm btn-secondary ms-2">Xóa</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Báo cáo hiệu suất hàng tháng</td>
                        <td>Ngày 1 hàng tháng lúc 9:00 sáng</td>
                        <td>leadership@university.edu, departments@university.edu</td>
                        <td>01/09/2025</td>
                        <td>
                          <button className="btn btn-sm">Sửa</button>
                          <button className="btn btn-sm btn-secondary ms-2">Xóa</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-3">
                  <button className="btn">Lên lịch báo cáo mới</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            Không có dữ liệu báo cáo nào.
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadershipReportsPage;
