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

const LeadershipAnalyticsPage = () => {
  const [user, setUser] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
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
          <li className="sidebar-menu-item" onClick={() => navigate('/leadership/departments')}>Theo phòng/khoa</li>
          <li className="sidebar-menu-item active">Phân tích</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/leadership/reports')}>Báo cáo</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Đăng xuất</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Analytics Dashboard</h1>
          <div>
            {user && <span>Welcome, {user.name || user.username}</span>}
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
            <p>Loading analytics data...</p>
          </div>
        ) : analyticsData ? (
          <div className="analytics-content">
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Tickets by Status</h2>
                  </div>
                  <div className="card-body">
                    <div className="status-chart">
                      {Object.entries(analyticsData.statusCounts).map(([status, count]) => (
                        <div key={status} className="status-bar">
                          <div className="status-label">{status}</div>
                          <div className="status-bar-container">
                            <div 
                              className={`status-bar-fill status-${status}`}
                              style={{ width: `${(count / analyticsData.totalTickets) * 100}%` }}
                            ></div>
                            <div className="status-count">{count}</div>
                          </div>
                          <div className="status-percent">
                            {Math.round((count / analyticsData.totalTickets) * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Tickets by Type</h2>
                  </div>
                  <div className="card-body">
                    <div className="type-chart">
                      {Object.entries(analyticsData.issueTypeCounts).map(([type, count]) => (
                        <div key={type} className="type-bar">
                          <div className="type-label">{type}</div>
                          <div className="type-bar-container">
                            <div 
                              className="type-bar-fill"
                              style={{ width: `${(count / analyticsData.totalTickets) * 100}%` }}
                            ></div>
                            <div className="type-count">{count}</div>
                          </div>
                          <div className="type-percent">
                            {Math.round((count / analyticsData.totalTickets) * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Department Performance</h2>
                  </div>
                  <div className="card-body">
                    <div className="department-stats">
                      {Object.entries(analyticsData.assignmentCounts).map(([dept, count]) => {
                        // Skip 'Unassigned' for this view
                        if (dept === 'Unassigned') return null;
                        
                        return (
                          <div key={dept} className="dept-row">
                            <div className="dept-name">{dept}</div>
                            <div className="dept-metrics">
                              <div className="metric">
                                <span className="metric-label">Tickets</span>
                                <span className="metric-value">{count}</span>
                              </div>
                              <div className="metric">
                                <span className="metric-label">% of Total</span>
                                <span className="metric-value">
                                  {Math.round((count / analyticsData.totalTickets) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Response Time</h2>
                  </div>
                  <div className="card-body">
                    <div className="response-stats">
                      <div className="avg-response-time">
                        <div className="big-stat">{Math.round(analyticsData.avgResponseTime)} mins</div>
                        <div className="stat-label">Average Response Time</div>
                      </div>
                      
                      <div className="response-time-distribution">
                        <h4>Response Time Distribution</h4>
                        {analyticsData.responseTimeData && analyticsData.responseTimeData.length > 0 ? (
                          <ul className="response-list">
                            {analyticsData.responseTimeData.slice(0, 5).map((item, index) => (
                              <li key={index} className="response-list-item">
                                <span>Ticket #{item.threadId}</span>
                                <span>{item.responseMinutes} mins</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No response time data available.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mb-4">
              <div className="card-header">
                <h2 className="card-title">Performance Summary</h2>
              </div>
              <div className="card-body">
                <div className="performance-metrics">
                  <div className="performance-metric">
                    <div className="metric-name">Resolution Rate</div>
                    <div className="metric-value">
                      {analyticsData.statusCounts.resolved && 
                       `${Math.round((analyticsData.statusCounts.resolved / analyticsData.totalTickets) * 100)}%`}
                    </div>
                  </div>
                  
                  <div className="performance-metric">
                    <div className="metric-name">Avg Time to Assign</div>
                    <div className="metric-value">1.2 days</div>
                  </div>
                  
                  <div className="performance-metric">
                    <div className="metric-name">Avg Time to Resolve</div>
                    <div className="metric-value">3.5 days</div>
                  </div>
                  
                  <div className="performance-metric">
                    <div className="metric-name">Customer Satisfaction</div>
                    <div className="metric-value">4.7/5</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h2 className="card-title">Recommendations</h2>
              </div>
              <div className="card-body">
                <div className="recommendations">
                  <div className="recommendation-item">
                    <div className="recommendation-icon">💡</div>
                    <div className="recommendation-content">
                      <h4>Improve Response Time</h4>
                      <p>The current average response time is {Math.round(analyticsData.avgResponseTime)} minutes. Consider adding more staff during peak hours.</p>
                    </div>
                  </div>
                  
                  <div className="recommendation-item">
                    <div className="recommendation-icon">📊</div>
                    <div className="recommendation-content">
                      <h4>Technical Issues Increasing</h4>
                      <p>Technical issues make up {analyticsData.issueTypeCounts.technical || 0} tickets. Consider proactive training for common issues.</p>
                    </div>
                  </div>
                  
                  <div className="recommendation-item">
                    <div className="recommendation-icon">🔄</div>
                    <div className="recommendation-content">
                      <h4>Workload Balancing</h4>
                      <p>Some departments have significantly more tickets than others. Consider rebalancing workloads or cross-training staff.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            No analytics data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadershipAnalyticsPage;
