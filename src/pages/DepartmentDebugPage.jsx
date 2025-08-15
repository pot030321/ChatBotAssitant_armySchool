import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';

const DepartmentDebugPage = () => {
  const [user, setUser] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('auth_user');
    let userData = null;
    
    if (userStr) {
      try {
        userData = JSON.parse(userStr);
        setUser(userData);
        
        // Collect debug info
        fetchDebugInfo(userData);
      } catch (err) {
        console.error('Error parsing user data:', err);
        setError('Error parsing user data');
        setIsLoading(false);
      }
    } else {
      setError('User not logged in');
      setIsLoading(false);
    }
  }, []);
  
  const fetchDebugInfo = async (userData) => {
    setIsLoading(true);
    setError('');
    
    try {
      // 1. Get all threads (unfiltered)
      const allThreadsResponse = await apiRequest('/threads');
      
      // 2. Get user data
      let userResponse = {};
      try {
        userResponse = await apiRequest('/users/me');
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
      
      // 3. Create debug info object
      const debugData = {
        user: {
          clientSide: userData,
          serverSide: userResponse
        },
        threads: {
          total: allThreadsResponse.threads?.length || 0,
          assignedToThisDepartment: allThreadsResponse.threads?.filter(
            t => t.assigned_to === userData.department
          ).length || 0,
          allThreads: allThreadsResponse.threads?.map(t => ({
            id: t.id,
            title: t.title,
            assigned_to: t.assigned_to,
            status: t.status,
            priority: t.priority,
            created_at: t.created_at
          })) || []
        }
      };
      
      setDebugInfo(debugData);
    } catch (err) {
      setError('Error loading debug information');
      console.error('Error fetching debug info:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };
  
  const handleRefresh = () => {
    if (user) {
      fetchDebugInfo(user);
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">Support Portal</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item" onClick={() => navigate('/department')}>Dashboard</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/department/tickets')}>Assigned Tickets</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/department/resources')}>Resources</li>
          <li className="sidebar-menu-item active">Debug Info</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Logout</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Department Debug Information</h1>
          <div>
            {user && <span>Welcome, {user.name || user.username}</span>}
          </div>
        </div>
        
        <div className="row">
          {error && (
            <div className="alert alert-danger mb-3">
              {error}
            </div>
          )}
          
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="card-title">Debug Information</h2>
              <button className="btn" onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {isLoading ? (
              <div className="text-center p-4">Loading...</div>
            ) : (
              <div className="card-body">
                <h3>User Information</h3>
                <div className="mb-4">
                  <h4>Client-side (from localStorage)</h4>
                  <pre>{JSON.stringify(debugInfo.user?.clientSide || {}, null, 2)}</pre>
                  
                  <h4>Server-side (from API)</h4>
                  <pre>{JSON.stringify(debugInfo.user?.serverSide || {}, null, 2)}</pre>
                </div>
                
                <hr />
                
                <h3>Threads Information</h3>
                <div className="mb-4">
                  <p><strong>Total Threads:</strong> {debugInfo.threads?.total || 0}</p>
                  <p><strong>Threads Assigned To Department:</strong> {debugInfo.threads?.assignedToThisDepartment || 0}</p>
                  
                  <h4>All Threads (max 10 shown)</h4>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Assigned To</th>
                          <th>Status</th>
                          <th>Priority</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(debugInfo.threads?.allThreads || []).slice(0, 10).map(thread => (
                          <tr key={thread.id} className={thread.assigned_to === user?.department ? 'table-success' : ''}>
                            <td>{thread.id}</td>
                            <td>{thread.title}</td>
                            <td>{thread.assigned_to || 'Not assigned'}</td>
                            <td>{thread.status}</td>
                            <td>{thread.priority}</td>
                            <td>{new Date(thread.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-3">
                    <h4>Check for potential issues:</h4>
                    <ul>
                      {user && !user.department && (
                        <li className="text-danger">
                          <strong>Issue:</strong> Your user account doesn't have a department assigned
                        </li>
                      )}
                      {user && user.department && debugInfo.threads?.assignedToThisDepartment === 0 && (
                        <li className="text-warning">
                          <strong>Possible issue:</strong> No threads are assigned to your department ({user.department})
                        </li>
                      )}
                      {user && user.role !== 'department' && (
                        <li className="text-danger">
                          <strong>Issue:</strong> Your user account has role "{user.role}" instead of "department"
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDebugPage;
