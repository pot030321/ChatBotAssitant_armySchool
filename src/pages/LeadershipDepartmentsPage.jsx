import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DepartmentThreadList from '../components/DepartmentThreadList';
import { getManagerThreads, getAnalyticsData } from '../utils/threadService';
import '../styles/LeadershipPages.css';
import '../components/DepartmentThreadList.css';
import '../styles/DepartmentsList.css';

// Lấy thông tin người dùng từ localStorage
const getUserInfo = () => {
  try {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (error) {
    console.error('Lỗi khi phân tích dữ liệu người dùng:', error);
  }
  return null;
};

const LeadershipDepartmentsPage = () => {
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [departmentThreads, setDepartmentThreads] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    assigned: 0,
    in_progress: 0,
    resolved: 0,
    by_department: {}
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage using helper function
    const userData = getUserInfo();
    if (userData) {
      setUser(userData);
    }
    
    // Fetch all threads and organize by department
    fetchThreads();
  }, []);
  
  const fetchThreads = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Use the mock service for manager threads (leadership sees all threads too)
      const response = await getManagerThreads();
      
      if (response.success) {
        const allThreads = response.threads || [];
        setThreads(allThreads);
        
        // Organize threads by department
        const threadsByDepartment = organizeThreadsByDepartment(allThreads);
        setDepartmentThreads(threadsByDepartment);
        
        // Get analytics data for more detailed stats
        const analyticsResponse = await getAnalyticsData();
        if (analyticsResponse.success) {
          // Update stats with analytics data
          const analyticsData = analyticsResponse.data;
          setStats({
            total: analyticsData.totalTickets,
            ...analyticsData.statusCounts,
            by_department: analyticsData.assignmentCounts || {}
          });
        } else {
          // If analytics fails, calculate basic stats from threads
          calculateStats(allThreads);
        }
      } else {
        throw new Error('Failed to fetch threads');
      }
    } catch (err) {
      setError('Error loading data. Please try again.');
      console.error('Error fetching threads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const organizeThreadsByDepartment = (threads) => {
    // Group threads by department
    const result = {};
    
    // First add unassigned threads
    result['Chưa phân công'] = threads.filter(thread => !thread.assigned_to);
    
    // Then add threads for each department
    threads.forEach(thread => {
      if (thread.assigned_to) {
        if (!result[thread.assigned_to]) {
          result[thread.assigned_to] = [];
        }
        result[thread.assigned_to].push(thread);
      }
    });
    
    return result;
  };
  
  const calculateStats = (threads) => {
    const newStats = {
      total: threads.length,
      new: threads.filter(t => t.status === 'new').length,
      assigned: threads.filter(t => t.status === 'assigned').length,
      in_progress: threads.filter(t => t.status === 'in_progress').length,
      resolved: threads.filter(t => t.status === 'resolved').length,
      by_department: {}
    };
    
    // Count threads by department
    threads.forEach(thread => {
      const dept = thread.assigned_to || 'Chưa phân công';
      if (!newStats.by_department[dept]) {
        newStats.by_department[dept] = 0;
      }
      newStats.by_department[dept]++;
    });
    
    setStats(newStats);
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
          <li className="sidebar-menu-item active">Theo phòng/khoa</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/leadership/analytics')}>Phân tích</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/leadership/reports')}>Báo cáo</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Đăng xuất</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Câu hỏi theo phòng/khoa</h1>
          <div>
            {user && <span>Xin chào, {user.full_name || user.username}</span>}
          </div>
        </div>
        
        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}
        
        <div className="row">
          <div className="stats-overview mb-4">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Tổng quan hỗ trợ</h2>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Tổng số yêu cầu</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.new}</div>
                  <div className="stat-label">Mới</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.assigned}</div>
                  <div className="stat-label">Đã phân công</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.in_progress}</div>
                  <div className="stat-label">Đang xử lý</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.resolved}</div>
                  <div className="stat-label">Đã giải quyết</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                  </div>
                  <div className="stat-label">Tỷ lệ giải quyết</div>
                </div>
              </div>
            </div>
          </div>

          <div className="departments-section">
            <h2>Danh sách câu hỏi theo phòng/khoa</h2>

            {isLoading ? (
              <div className="loading-indicator">Đang tải dữ liệu...</div>
            ) : Object.keys(departmentThreads).length > 0 ? (
              <>
                {Object.entries(departmentThreads).map(([department, deptThreads]) => (
                  <DepartmentThreadList 
                    key={department} 
                    department={department} 
                    threads={deptThreads}
                  />
                ))}
              </>
            ) : (
              <div className="no-data">Không có dữ liệu câu hỏi nào.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadershipDepartmentsPage;
