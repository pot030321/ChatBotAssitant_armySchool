import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreadDetail from '../components/ThreadDetail';
import { getAssignedThreads, updateThreadStatus, addThreadMessage } from '../utils/threadService';
import '../components/ThreadDetail.css';

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

const DepartmentDashboardPage = () => {
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Response state
  const [selectedThread, setSelectedThread] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  
  // Thread detail state
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  
  useEffect(() => {
    // Get user from localStorage using helper function
    const userData = getUserInfo();
    if (userData) {
      setUser(userData);
    }
    
    // Fetch assigned threads
    fetchThreads();
  }, []);
  
  const fetchThreads = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await getAssignedThreads();
      
      if (response.success) {
        setThreads(response.threads || []);
      } else {
        throw new Error('Failed to fetch assigned threads');
      }
    } catch (err) {
      setError('Error loading assigned tickets. Please try again.');
      console.error('Error fetching threads:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRespondClick = (thread) => {
    setSelectedThread(thread);
    setResponseText(''); // Reset response
  };
  
  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedThread || !responseText.trim()) {
      setError('Please enter a response');
      return;
    }
    
    setIsResponding(true);
    setError('');
    
    try {
      // Add response message
      const messageResponse = await addThreadMessage(selectedThread.id, {
        content: responseText,
        sender_type: 'staff',
        sender_name: user?.name || user?.username || 'Department Staff'
      });
      
      if (!messageResponse.success) {
        throw new Error('Failed to submit response');
      }
      
      // Update thread status to in_progress if not already
      if (selectedThread.status === 'assigned') {
        await updateThreadStatus(selectedThread.id, 'in_progress');
      }
      
      // Reset and refresh
      setSelectedThread(null);
      setResponseText('');
      fetchThreads();
    } catch (err) {
      setError('Error submitting response. Please try again.');
      console.error('Error submitting response:', err);
    } finally {
      setIsResponding(false);
    }
  };
  
  const handleMarkResolved = async (threadId) => {
    try {
      const response = await updateThreadStatus(threadId, 'resolved');
      
      if (!response.success) {
        throw new Error('Failed to mark as resolved');
      }
      
      fetchThreads();
    } catch (err) {
      setError('Error updating ticket status. Please try again.');
      console.error('Error marking thread as resolved:', err);
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
        <div className="sidebar-logo">Support Portal</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item active">Dashboard</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/department/tickets')}>Assigned Tickets</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/department/resources')}>Resources</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Logout</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Department Dashboard</h1>
          <div>
            {user && <span>Welcome, {user.name || user.username}</span>}
          </div>
        </div>
        
        <div className="row">
          <div className="stats-cards d-flex mb-3">
            <div className="card stat-card">
              <div className="stat-value">{threads.filter(t => t.status === 'assigned').length}</div>
              <div className="stat-label">New Assignments</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{threads.filter(t => t.status === 'in_progress').length}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{threads.filter(t => t.status === 'resolved').length}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
          
          {error && (
            <div className="alert alert-danger mb-3">
              {error}
            </div>
          )}
          
          {selectedThread && (
            <div className="card mb-3">
              <div className="card-header">
                <h2 className="card-title">Respond to Ticket</h2>
              </div>
              <div className="card-body">
                <p><strong>Title:</strong> {selectedThread.title}</p>
                <p><strong>Type:</strong> {selectedThread.issue_type}</p>
                <p><strong>Description:</strong> {selectedThread.description || 'No description provided'}</p>
                
                <form onSubmit={handleResponseSubmit}>
                  <div className="form-group">
                    <label htmlFor="response">Your Response:</label>
                    <textarea
                      id="response"
                      className="form-control"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Type your response here..."
                      rows="4"
                      disabled={isResponding}
                    ></textarea>
                  </div>
                  
                  <div className="d-flex">
                    <button 
                      type="submit" 
                      className="btn"
                      disabled={isResponding}
                    >
                      {isResponding ? 'Sending...' : 'Send Response'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary ms-2"
                      onClick={() => setSelectedThread(null)}
                      disabled={isResponding}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Assigned Tickets</h2>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {threads.map(thread => (
                    <tr key={thread.id}>
                      <td>{thread.id}</td>
                      <td>{thread.title}</td>
                      <td>{thread.issue_type}</td>
                      <td>
                        <span className={`status-badge status-${thread.status}`}>
                          {thread.status === 'resolved' ? 'Đã giải quyết' : 
                           thread.status === 'new' ? 'Mới' : 
                           thread.status === 'assigned' ? 'Đã phân công' :
                           thread.status === 'in_progress' ? 'Đang xử lý' :
                           thread.status === 'escalated' ? 'Đã chuyển cấp' : thread.status}
                        </span>
                      </td>
                      <td>{new Date(thread.created_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn btn-sm"
                          onClick={() => setSelectedThreadId(thread.id)}
                        >
                          View Details
                        </button>
                        <button 
                          className="btn btn-sm ms-2"
                          onClick={() => handleRespondClick(thread)}
                        >
                          Quick Respond
                        </button>
                        {(thread.status === 'in_progress' || thread.status === 'assigned') && (
                          <button 
                            className="btn btn-success btn-sm ms-2"
                            onClick={() => handleMarkResolved(thread.id)}
                          >
                            Mark Resolved
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-4">
                No assigned tickets found.
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
          canRespond={true}
          onRespond={handleRespondClick}
          onResolve={handleMarkResolved}
          userRole="department"
        />
      )}
    </div>
  );
};

export default DepartmentDashboardPage;
