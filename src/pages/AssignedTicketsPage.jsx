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

const AssignedTicketsPage = () => {
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
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
  
  // Sort threads
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortDirection('desc');
    }
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
    
    // Filter by priority
    if (priorityFilter !== 'all' && thread.priority !== priorityFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return thread.title.toLowerCase().includes(query) || 
             (thread.description && thread.description.toLowerCase().includes(query)) ||
             (thread.student_name && thread.student_name.toLowerCase().includes(query));
    }
    
    return true;
  });
  
  // Sort filtered threads
  const sortedThreads = [...filteredThreads].sort((a, b) => {
    let fieldA = a[sortField];
    let fieldB = b[sortField];
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB) 
        : fieldB.localeCompare(fieldA);
    }
    
    // For dates and numbers
    return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
  });

  // Extract unique values for filters
  const statusOptions = ['all', ...new Set(threads.map(t => t.status))];
  const typeOptions = ['all', ...new Set(threads.map(t => t.issue_type))];
  const priorityOptions = ['all', 'high', 'medium', 'low'];

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">Support Portal</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item" onClick={() => navigate('/department')}>Dashboard</li>
          <li className="sidebar-menu-item active">Assigned Tickets</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/department/resources')}>Resources</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Logout</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Assigned Tickets</h1>
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
          
          <div className="card mb-3">
            <div className="card-header">
              <h2 className="card-title">Filter Tickets</h2>
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
                  {statusOptions.map(status => (
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
                  {typeOptions.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="priority-filter">Priority:</label>
                <select 
                  id="priority-filter" 
                  className="form-control"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  {priorityOptions.map(priority => (
                    <option key={priority} value={priority}>
                      {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
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
                  placeholder="Search in title, description or student name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setPriorityFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Assigned Tickets</h2>
              <span className="ticket-count">{sortedThreads.length} tickets</span>
            </div>
            
            {isLoading ? (
              <div className="text-center p-4">Loading...</div>
            ) : sortedThreads.length > 0 ? (
              <div className="table-responsive">
                <table className="table sortable-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('id')} className={sortField === 'id' ? `sorted-${sortDirection}` : ''}>
                        ID
                      </th>
                      <th onClick={() => handleSort('title')} className={sortField === 'title' ? `sorted-${sortDirection}` : ''}>
                        Title
                      </th>
                      <th onClick={() => handleSort('student_name')} className={sortField === 'student_name' ? `sorted-${sortDirection}` : ''}>
                        Student
                      </th>
                      <th onClick={() => handleSort('issue_type')} className={sortField === 'issue_type' ? `sorted-${sortDirection}` : ''}>
                        Type
                      </th>
                      <th onClick={() => handleSort('priority')} className={sortField === 'priority' ? `sorted-${sortDirection}` : ''}>
                        Priority
                      </th>
                      <th onClick={() => handleSort('status')} className={sortField === 'status' ? `sorted-${sortDirection}` : ''}>
                        Status
                      </th>
                      <th onClick={() => handleSort('created_at')} className={sortField === 'created_at' ? `sorted-${sortDirection}` : ''}>
                        Created
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedThreads.map(thread => (
                      <tr key={thread.id} className={`priority-${thread.priority || 'medium'}`}>
                        <td>{thread.id}</td>
                        <td className="ticket-title-cell">{thread.title}</td>
                        <td>{thread.student_name || 'Unknown'}</td>
                        <td>{thread.issue_type}</td>
                        <td>
                          <span className={`priority-indicator priority-${thread.priority || 'medium'}`}>
                            {thread.priority || 'Medium'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${thread.status}`}>
                            {thread.status}
                          </span>
                        </td>
                        <td>{new Date(thread.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
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
                              Respond
                            </button>
                            {(thread.status === 'in_progress' || thread.status === 'assigned') && (
                              <button 
                                className="btn btn-success btn-sm ms-2"
                                onClick={() => handleMarkResolved(thread.id)}
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-4">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all' ? 
                  'No tickets match your filters.' : 
                  'No assigned tickets found.'}
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

export default AssignedTicketsPage;
