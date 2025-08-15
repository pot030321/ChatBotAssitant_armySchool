import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreadDetail from '../components/ThreadDetail';
import { getManagerThreads, assignThread, updateThreadPriority } from '../utils/threadService';
import { getAllDepartments } from '../utils/departmentService';
import '../components/ThreadDetail.css';

const ManagerDashboardPage = () => {
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Assignment state
  const [selectedThread, setSelectedThread] = useState(null);
  const [assignmentDept, setAssignmentDept] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
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
        console.error('Lỗi khi phân tích dữ liệu người dùng', err);
      }
    }
    
    // Fetch threads for manager
    fetchThreads();
    
    // Fetch departments from API
    fetchDepartments();
  }, []);
  
  const fetchDepartments = async () => {
    setIsLoadingDepartments(true);
    
    try {
      const response = await getAllDepartments();
      
      if (response.success && response.departments) {
        // Chuyển đổi từ dạng đối tượng sang mảng tên phòng ban
        setDepartments(response.departments);
        console.log(`Đã tải ${response.departments.length} phòng ban`);
      } else {
        console.error('Không thể tải danh sách phòng ban:', response.error);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách phòng ban:', err);
    } finally {
      setIsLoadingDepartments(false);
    }
  };
  
  const fetchThreads = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Using mock service instead of real API
      const data = await getManagerThreads();
      
      if (data.success) {
        setThreads(data.threads || []);
      } else {
        throw new Error('Không thể lấy danh sách yêu cầu');
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách yêu cầu. Vui lòng thử lại.');
      console.error('Lỗi khi lấy danh sách yêu cầu:', err);
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
        setError('Không thể cập nhật mức độ ưu tiên');
      }
    } catch (err) {
      setError('Lỗi khi cập nhật mức độ ưu tiên. Vui lòng thử lại.');
      console.error('Lỗi khi cập nhật mức độ ưu tiên:', err);
    }
  };
  
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedThread || !assignmentDept) {
      setError('Vui lòng chọn một phòng ban');
      return;
    }
    
    setIsAssigning(true);
    setError('');
    
    try {
      // Tìm thông tin department được chọn
      const selectedDepartment = departments.find(dept => dept.name === assignmentDept);
      
      if (!selectedDepartment) {
        throw new Error('Không tìm thấy thông tin phòng ban');
      }
      
      console.log(`Phân công thread ${selectedThread.id} cho phòng ban: ${selectedDepartment.name}`);
      
      // Gọi API với department name
      const response = await assignThread(selectedThread.id, selectedDepartment.name);
      
      if (!response.success) {
        throw new Error('Không thể phân công yêu cầu');
      }
      
      // Reset and refresh
      setSelectedThread(null);
      fetchThreads();
    } catch (err) {
      setError('Lỗi khi phân công yêu cầu. Vui lòng thử lại.');
      console.error('Lỗi khi phân công yêu cầu:', err);
    } finally {
      setIsAssigning(false);
    }
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
  
  // Extract unique values for filters
  const statusOptions = ['all', ...new Set(threads.map(t => t.status))];
  const typeOptions = ['all', ...new Set(threads.map(t => t.issue_type))];
  const departmentOptions = ['all', 'unassigned', ...new Set(threads.filter(t => t.assigned_to).map(t => t.assigned_to))];
  const priorityOptions = ['all', 'high', 'medium', 'low'];

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">Cổng Hỗ Trợ</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item active">Bảng điều khiển</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/all-tickets')}>Tất cả yêu cầu</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/analytics')}>Phân tích</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Đăng xuất</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Bảng điều khiển quản lý</h1>
          <div>
            {user && <span>Xin chào, {user.name || user.username}</span>}
          </div>
        </div>
        
        <div className="row">
          <div className="stats-cards d-flex mb-3">
            <div className="card stat-card">
              <div className="stat-value">{threads.filter(t => t.status === 'new').length}</div>
              <div className="stat-label">Yêu cầu mới</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{threads.filter(t => t.status === 'assigned').length}</div>
              <div className="stat-label">Yêu cầu đã phân công</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{threads.filter(t => t.status === 'resolved').length}</div>
              <div className="stat-label">Đã giải quyết</div>
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
                <h2 className="card-title">Phân công yêu cầu</h2>
              </div>
              <div className="card-body">
                <p><strong>Tiêu đề:</strong> {selectedThread.title}</p>
                <p><strong>Loại:</strong> {selectedThread.issue_type}</p>
                <p><strong>Trạng thái:</strong> {selectedThread.status}</p>
                
                <form onSubmit={handleAssignSubmit}>
                  <div className="form-group">
                    <label htmlFor="department">Phân công cho phòng ban:</label>
                    <select
                      id="department"
                      className="form-control"
                      value={assignmentDept}
                      onChange={(e) => setAssignmentDept(e.target.value)}
                      disabled={isAssigning || isLoadingDepartments}
                    >
                      <option value="">-- Chọn phòng ban --</option>
                      {isLoadingDepartments ? (
                        <option value="" disabled>Đang tải phòng ban...</option>
                      ) : departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="d-flex">
                    <button 
                      type="submit" 
                      className="btn"
                      disabled={isAssigning}
                    >
                      {isAssigning ? 'Đang phân công...' : 'Phân công yêu cầu'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary ms-2"
                      onClick={() => setSelectedThread(null)}
                      disabled={isAssigning}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          <div className="card mb-3">
            <div className="card-header">
              <h2 className="card-title">Lọc yêu cầu</h2>
            </div>
            <div className="filter-container">
              <div className="filter-group">
                <label htmlFor="status-filter">Trạng thái:</label>
                <select 
                  id="status-filter" 
                  className="form-control"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'Tất cả trạng thái' : 
                       status === 'new' ? 'Mới' :
                       status === 'assigned' ? 'Đã phân công' :
                       status === 'in_progress' ? 'Đang xử lý' :
                       status === 'resolved' ? 'Đã giải quyết' : 
                       status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="type-filter">Loại:</label>
                <select 
                  id="type-filter" 
                  className="form-control"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  {typeOptions.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'Tất cả loại' : 
                       type === 'question' ? 'Câu hỏi chung' :
                       type === 'technical' ? 'Hỗ trợ kỹ thuật' :
                       type === 'billing' ? 'Câu hỏi về thanh toán' :
                       type === 'feedback' ? 'Phản hồi' :
                       type.charAt(0).toUpperCase() + type.slice(1)}
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
                <label htmlFor="priority-filter">Mức độ ưu tiên:</label>
                <select 
                  id="priority-filter" 
                  className="form-control"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  {priorityOptions.map(priority => (
                    <option key={priority} value={priority}>
                      {priority === 'all' ? 'Tất cả mức độ ưu tiên' : 
                       priority === 'high' ? 'Cao' :
                       priority === 'medium' ? 'Trung bình' :
                       priority === 'low' ? 'Thấp' :
                       priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group search-group">
                <label htmlFor="search-filter">Tìm kiếm:</label>
                <input
                  id="search-filter"
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm theo tiêu đề, mô tả hoặc tên sinh viên"
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
                Xóa bộ lọc
              </button>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Yêu cầu</h2>
              <span className="ticket-count">{filteredThreads.length} yêu cầu</span>
            </div>
            
            {isLoading ? (
              <div className="text-center p-4">Đang tải...</div>
            ) : filteredThreads.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tiêu đề</th>
                      <th>Sinh viên</th>
                      <th>Loại</th>
                      <th>Ưu tiên</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Phân công cho</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredThreads.map(thread => (
                      <tr key={thread.id} className={`priority-${thread.priority || 'medium'}`}>
                        <td>{thread.id}</td>
                        <td className="ticket-title-cell">{thread.title}</td>
                        <td>{thread.student_name || 'Không xác định'}</td>
                        <td>{thread.issue_type}</td>
                        <td>
                          <select 
                            className={`priority-select priority-${thread.priority || 'medium'}`}
                            value={thread.priority || 'medium'}
                            onChange={(e) => handlePriorityChange(thread.id, e.target.value)}
                          >
                            <option value="low">Thấp</option>
                            <option value="medium">Trung bình</option>
                            <option value="high">Cao</option>
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
                              Xem
                            </button>
                            {!thread.assigned_to && (
                              <button 
                                className="btn btn-sm ms-2"
                                onClick={() => handleAssignClick(thread)}
                              >
                                Phân công
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
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || departmentFilter !== 'all' || priorityFilter !== 'all' ? 
                  'Không có yêu cầu nào khớp với bộ lọc của bạn.' : 
                  'Không tìm thấy yêu cầu nào.'}
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

export default ManagerDashboardPage;
