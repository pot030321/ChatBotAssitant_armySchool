import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreadDetail from '../components/ThreadDetail';
import { getManagerThreads, assignThread, updateThreadPriority } from '../utils/threadService';
import '../components/ThreadDetail.css';

const AllTicketsPage = () => {
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Assignment state
  const [selectedThread, setSelectedThread] = useState(null);
  const [assignmentDept, setAssignmentDept] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [departments, setDepartments] = useState([
    'Phòng Đào tạo', 'QLSV', 'CNTT', 
    'Phòng Tài chính', 'Thư viện', 'Phòng Tuyển sinh'
  ]);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Thread detail state
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
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
    
    // Fetch threads for manager
    fetchThreads();
  }, []);
  
  const fetchThreads = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Using mock service instead of real API
      const data = await getManagerThreads();
      
      if (data.success) {
        setThreads(data.threads || []);
      } else {
        throw new Error('Failed to fetch threads');
      }
    } catch (err) {
      setError('Error loading threads. Please try again.');
      console.error('Error fetching threads:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAssignClick = (thread) => {
    setSelectedThread(thread);
    setAssignmentDept(''); // Reset selection
  };
  
  const handlePriorityChange = async (threadId, priority) => {
    try {
      const response = await updateThreadPriority(threadId, priority);
      if (response.success) {
        fetchThreads();
      } else {
        setError('Failed to update priority');
      }
    } catch (err) {
      setError('Error updating priority. Please try again.');
      console.error('Error updating priority:', err);
    }
  };
  
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedThread || !assignmentDept) {
      setError('Vui lòng chọn phòng ban');
      return;
    }
    
    setIsAssigning(true);
    setError('');
    
    try {
      // Using mock service instead of real API
      const response = await assignThread(selectedThread.id, assignmentDept);
      
      if (!response.success) {
        throw new Error('Failed to assign thread');
      }
      
      // Reset and refresh
      setSelectedThread(null);
      fetchThreads();
    } catch (err) {
      setError('Error assigning thread. Please try again.');
      console.error('Error assigning thread:', err);
    } finally {
      setIsAssigning(false);
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
    
    // Filter by department
    if (departmentFilter !== 'all') {
      if (departmentFilter === 'unassigned' && thread.assigned_to) {
        return false;
      } else if (departmentFilter !== 'unassigned' && thread.assigned_to !== departmentFilter) {
        return false;
      }
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
    
    // Handle special cases
    if (sortField === 'assigned_to') {
      fieldA = fieldA || 'Unassigned';
      fieldB = fieldB || 'Unassigned';
    }
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB) 
        : fieldB.localeCompare(fieldA);
    }
    
    // For dates and numbers
    return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
  });
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentThreads = sortedThreads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedThreads.length / itemsPerPage);
  
  // Extract unique values for filters
  const statusOptions = ['all', ...new Set(threads.map(t => t.status))];
  const typeOptions = ['all', ...new Set(threads.map(t => t.issue_type))];
  const departmentOptions = ['all', 'unassigned', ...new Set(threads.filter(t => t.assigned_to).map(t => t.assigned_to))];
  const priorityOptions = ['all', 'high', 'medium', 'low'];
  
  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">Support Portal</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item" onClick={() => navigate('/manager')}>Dashboard</li>
          <li className="sidebar-menu-item active">All Tickets</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/analytics')}>Analytics</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Logout</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">All Tickets</h1>
          <div>
            {user && <span>Welcome, {user.name || user.username}</span>}
          </div>
        </div>
        
        <div className="row">
          {selectedThread && (
            <div className="card mb-3">
              <div className="card-header">
                <h2 className="card-title">Assign Ticket</h2>
              </div>
              <div className="card-body">
                <p><strong>Title:</strong> {selectedThread.title}</p>
                <p><strong>Type:</strong> {selectedThread.issue_type}</p>
                <p><strong>Status:</strong> {selectedThread.status}</p>
                
                <form onSubmit={handleAssignSubmit}>
                  <div className="form-group">
                    <label htmlFor="department">Phân công cho phòng ban:</label>
                    <select
                      id="department"
                      className="form-control"
                      value={assignmentDept}
                      onChange={(e) => setAssignmentDept(e.target.value)}
                      disabled={isAssigning}
                    >
                      <option value="">-- Chọn Phòng ban --</option>
                      {departments.map((dept, index) => (
                        <option key={index} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="d-flex">
                    <button 
                      type="submit" 
                      className="btn"
                      disabled={isAssigning}
                    >
                      {isAssigning ? 'Assigning...' : 'Assign Ticket'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary ms-2"
                      onClick={() => setSelectedThread(null)}
                      disabled={isAssigning}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger mb-3">
              {error}
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
                <label htmlFor="department-filter">Phòng ban:</label>
                <select 
                  id="department-filter" 
                  className="form-control"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  {departmentOptions.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'Tất cả phòng ban' : 
                       dept === 'unassigned' ? 'Chưa phân công' : dept}
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
                  setDepartmentFilter('all');
                  setPriorityFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header d-flex justify-between align-center">
              <div className="d-flex align-center">
                <h2 className="card-title mb-0">All Tickets</h2>
                <span className="ticket-count ms-2">{filteredThreads.length} tickets</span>
              </div>
              <div className="items-per-page">
                <label htmlFor="items-per-page">Show:</label>
                <select 
                  id="items-per-page" 
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center p-4">Loading...</div>
            ) : currentThreads.length > 0 ? (
              <>
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
                        <th onClick={() => handleSort('assigned_to')} className={sortField === 'assigned_to' ? `sorted-${sortDirection}` : ''}>
                          Assigned To
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentThreads.map(thread => (
                        <tr key={thread.id} className={`priority-${thread.priority || 'medium'}`}>
                          <td>{thread.id}</td>
                          <td className="ticket-title-cell">{thread.title}</td>
                          <td>{thread.student_name || 'Unknown'}</td>
                          <td>{thread.issue_type}</td>
                          <td>
                            <select 
                              className={`priority-select priority-${thread.priority || 'medium'}`}
                              value={thread.priority || 'medium'}
                              onChange={(e) => handlePriorityChange(thread.id, e.target.value)}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </td>
                          <td>
                            <span className={`status-badge status-${thread.status}`}>
                              {thread.status}
                            </span>
                          </td>
                          <td>{new Date(thread.created_at).toLocaleDateString()}</td>
                          <td>{thread.assigned_to || 'Chưa phân công'}</td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="btn btn-sm"
                                onClick={() => setSelectedThreadId(thread.id)}
                              >
                                View
                              </button>
                              {!thread.assigned_to && (
                                <button 
                                  className="btn btn-sm ms-2"
                                  onClick={() => handleAssignClick(thread)}
                                >
                                  Assign
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="pagination-container">
                  <div className="pagination">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="pagination-button"
                    >
                      &laquo;
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-button"
                    >
                      &lt;
                    </button>
                    
                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-button"
                    >
                      &gt;
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="pagination-button"
                    >
                      &raquo;
                    </button>
                  </div>
                  
                  <div className="pagination-summary">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedThreads.length)} of {sortedThreads.length} tickets
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || departmentFilter !== 'all' || priorityFilter !== 'all' ? 
                  'No tickets match your filters.' : 
                  'No tickets found.'}
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

export default AllTicketsPage;
