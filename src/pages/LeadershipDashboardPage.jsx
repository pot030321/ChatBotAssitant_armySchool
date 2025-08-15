import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreadDetail from '../components/ThreadDetail';
import { getManagerThreads, getAnalyticsData } from '../utils/threadService';
import '../components/ThreadDetail.css';
import '../styles/LeadershipPages.css';

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

const LeadershipDashboardPage = () => {
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
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
  
  // Thread detail state
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  
  useEffect(() => {
    // Get user from localStorage using helper function
    const userData = getUserInfo();
    if (userData) {
      setUser(userData);
    }
    
    // Fetch all threads for leadership view
    fetchThreads();
  }, []);
  
  const fetchThreads = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Use the mock service for manager threads (leadership sees all threads too)
      const response = await getManagerThreads();
      
      if (response.success) {
        setThreads(response.threads || []);
        
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
          calculateStats(response.threads);
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
      const dept = thread.assigned_to || 'Unassigned';
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
          <li className="sidebar-menu-item active">Bảng điều khiển</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/leadership/departments')}>Theo phòng/khoa</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/leadership/analytics')}>Phân tích</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/leadership/reports')}>Báo cáo</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Đăng xuất</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Bảng điều khiển lãnh đạo</h1>
          <div>
            {user && <span>Xin chào, {user.name || user.username}</span>}
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
          
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Khối lượng công việc theo phòng ban</h2>
                </div>
                <div className="card-body">
                  {Object.keys(stats.by_department).length > 0 ? (
                    <ul className="department-stats">
                      {Object.entries(stats.by_department).map(([dept, count]) => (
                        <li key={dept} className="dept-stat-item">
                          <span className="dept-name">{dept}</span>
                          <span className="dept-count">{count} yêu cầu</span>
                          <div className="progress-bar">
                            <div 
                              className="progress" 
                              style={{width: `${(count / stats.total) * 100}%`}}
                            ></div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Chưa có phòng ban nào được phân công yêu cầu.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Loại yêu cầu</h2>
                </div>
                <div className="card-body">
                  {threads.length > 0 ? (
                    <ul className="issue-type-stats">
                      {Object.entries(
                        threads.reduce((acc, thread) => {
                          const type = thread.issue_type || 'unknown';
                          if (!acc[type]) acc[type] = 0;
                          acc[type]++;
                          return acc;
                        }, {})
                      ).map(([type, count]) => (
                        <li key={type} className="issue-stat-item">
                          <span className="issue-type">
                            {type === 'question' ? 'Câu hỏi chung' :
                             type === 'technical' ? 'Hỗ trợ kỹ thuật' :
                             type === 'billing' ? 'Câu hỏi về thanh toán' :
                             type === 'feedback' ? 'Phản hồi' :
                             type === 'unknown' ? 'Không xác định' : type}
                          </span>
                          <span className="issue-count">{count} yêu cầu</span>
                          <div className="progress-bar">
                            <div 
                              className="progress" 
                              style={{width: `${(count / threads.length) * 100}%`}}
                            ></div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Không có dữ liệu yêu cầu nào.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header d-flex justify-between align-center">
              <h2 className="card-title">Yêu cầu gần đây</h2>
              <div className="card-actions">
                <button className="btn btn-sm">Xuất báo cáo</button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center p-4">Đang tải...</div>
            ) : threads.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Loại</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Phòng ban</th>
                    <th>Thời gian phản hồi</th>
                  </tr>
                </thead>
                <tbody>
                  {threads.slice(0, 10).map(thread => (
                    <tr key={thread.id}>
                      <td>{thread.id}</td>
                      <td>
                        <a href="#" onClick={(e) => { 
                          e.preventDefault();
                          setSelectedThreadId(thread.id);
                        }}>
                          {thread.title}
                        </a>
                      </td>
                      <td>
                        {thread.issue_type === 'question' ? 'Câu hỏi chung' :
                         thread.issue_type === 'technical' ? 'Hỗ trợ kỹ thuật' :
                         thread.issue_type === 'billing' ? 'Câu hỏi về thanh toán' :
                         thread.issue_type === 'feedback' ? 'Phản hồi' :
                         thread.issue_type === 'unknown' ? 'Không xác định' : thread.issue_type}
                      </td>
                      <td>
                        <span className={`status-badge status-${thread.status}`}>
                          {thread.status === 'Open' ? 'Đang mở' :
                           thread.status === 'Assigned' ? 'Đã phân công' :
                           thread.status === 'InProgress' ? 'Đang xử lý' :
                           thread.status === 'Resolved' ? 'Đã giải quyết' :
                           thread.status === 'Closed' ? 'Đã đóng' :
                           thread.status === 'new' ? 'Mới' : thread.status}
                        </span>
                      </td>
                      <td>{new Date(thread.created_at).toLocaleDateString()}</td>
                      <td>{thread.assigned_to || 'Chưa phân công'}</td>
                      <td>
                        {thread.first_response_time 
                          ? `${thread.first_response_time} giờ` 
                          : thread.status === 'new' 
                            ? 'Đang chờ' 
                            : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-4">
                Không có dữ liệu yêu cầu nào.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Thread detail modal */}
      {selectedThreadId && (
        <ThreadDetail 
          threadId={selectedThreadId} 
          onClose={() => setSelectedThreadId(null)} 
        />
      )}
    </div>
  );
};

export default LeadershipDashboardPage;
