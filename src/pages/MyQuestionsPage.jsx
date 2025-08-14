import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreadDetail from '../components/ThreadDetail';
import { getStudentThreads } from '../utils/threadService';
import '../components/ThreadDetail.css';

const MyQuestionsPage = () => {
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Thread detail state
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  
  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (err) {
        console.error('Error parsing user data', err);
      }
    }
    
    // Fetch student threads
    fetchThreads();
  }, []);
  
  const fetchThreads = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Using mock service instead of real API
      const data = await getStudentThreads();
      
      if (data.success) {
        setThreads(data.threads || []);
      } else {
        throw new Error('Failed to fetch threads');
      }
    } catch (err) {
      setError('Error loading your questions. Please try again.');
      console.error('Error fetching threads:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoToDashboard = () => {
    navigate('/student');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };
  
  // Apply filters to threads
  const filteredThreads = threads.filter(thread => {
    // Filter by status
    if (statusFilter !== 'all' && thread.status !== statusFilter) {
      return false;
    }
    
    // Filter by type
    if (typeFilter !== 'all' && thread.issue_type !== typeFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return thread.title.toLowerCase().includes(query) || 
             (thread.description && thread.description.toLowerCase().includes(query));
    }
    
    return true;
  });
  
  // Get unique statuses for filter
  const statuses = ['all', ...new Set(threads.map(thread => thread.status))];
  
  // Get unique types for filter
  const types = ['all', ...new Set(threads.map(thread => thread.issue_type))];
  
  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">Support Portal</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item" onClick={handleGoToDashboard}>Dashboard</li>
          <li className="sidebar-menu-item active">My Questions</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/faq')}>FAQ</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Logout</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">My Questions</h1>
          <div>
            {user && <span>Welcome, {user.name || user.username}</span>}
          </div>
        </div>
        
        <div className="card mb-3">
          <div className="card-header">
            <h2 className="card-title">Filter Questions</h2>
          </div>
          <div className="filter-container">
            <div className="filter-group">
              <label htmlFor="status-filter">Status:</label>
              <select 
                id="status-filter" 
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="type-filter">Type:</label>
              <select 
                id="type-filter" 
                className="form-control"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group search-group">
              <label htmlFor="search-filter">Search:</label>
              <input
                id="search-filter"
                type="text"
                className="form-control"
                placeholder="Search in title or description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">All My Questions</h2>
            <span className="question-count">{filteredThreads.length} questions</span>
          </div>
          
          {isLoading ? (
            <div className="text-center p-4">Loading...</div>
          ) : error ? (
            <div className="alert alert-danger m-3">{error}</div>
          ) : filteredThreads.length > 0 ? (
            <div className="thread-table-container">
              <table className="table thread-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Created</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredThreads.map(thread => (
                    <tr key={thread.id}>
                      <td className="thread-title-cell">{thread.title}</td>
                      <td>
                        <span className={`status-badge status-${thread.status}`}>
                          {thread.status}
                        </span>
                      </td>
                      <td>{thread.issue_type}</td>
                      <td>{new Date(thread.created_at).toLocaleDateString()}</td>
                      <td>{new Date(thread.updated_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedThreadId(thread.id)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-4">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? 
                'No questions match your filters.' : 
                'You haven\'t submitted any questions yet.'}
            </div>
          )}
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

export default MyQuestionsPage;
