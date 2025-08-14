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
    console.error('Error parsing user data:', error);
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
        <div className="sidebar-logo">Support Portal</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item active">Dashboard</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/leadership/analytics')}>Analytics</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/leadership/reports')}>Reports</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Logout</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Leadership Dashboard</h1>
          <div>
            {user && <span>Welcome, {user.name || user.username}</span>}
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
                <h2 className="card-title">Support Overview</h2>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total Tickets</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.new}</div>
                  <div className="stat-label">New</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.assigned}</div>
                  <div className="stat-label">Assigned</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.in_progress}</div>
                  <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.resolved}</div>
                  <div className="stat-label">Resolved</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                  </div>
                  <div className="stat-label">Resolution Rate</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Department Workload</h2>
                </div>
                <div className="card-body">
                  {Object.keys(stats.by_department).length > 0 ? (
                    <ul className="department-stats">
                      {Object.entries(stats.by_department).map(([dept, count]) => (
                        <li key={dept} className="dept-stat-item">
                          <span className="dept-name">{dept}</span>
                          <span className="dept-count">{count} tickets</span>
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
                    <p>No departments have assigned tickets yet.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Issue Types</h2>
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
                          <span className="issue-type">{type}</span>
                          <span className="issue-count">{count} tickets</span>
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
                    <p>No ticket data available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header d-flex justify-between align-center">
              <h2 className="card-title">Recent Tickets</h2>
              <div className="card-actions">
                <button className="btn btn-sm">Export Report</button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center p-4">Loading...</div>
            ) : threads.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Department</th>
                    <th>Response Time</th>
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
                      <td>{thread.issue_type}</td>
                      <td>
                        <span className={`status-badge status-${thread.status}`}>
                          {thread.status}
                        </span>
                      </td>
                      <td>{new Date(thread.created_at).toLocaleDateString()}</td>
                      <td>{thread.assigned_to || 'Unassigned'}</td>
                      <td>
                        {thread.first_response_time 
                          ? `${thread.first_response_time} hrs` 
                          : thread.status === 'new' 
                            ? 'Awaiting' 
                            : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-4">
                No ticket data available.
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
