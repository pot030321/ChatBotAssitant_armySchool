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
    console.error('Lỗi khi phân tích dữ liệu người dùng:', error);
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
      // Log thông tin người dùng để debug
      const userData = getUserInfo();
      if (userData) {
        console.log('[DepartmentDashboard] Current user department:', userData.department);
      }
      
      const response = await getAssignedThreads();
      
      if (response.success) {
        console.log(`[DepartmentDashboard] Received ${response.threads ? response.threads.length : 0} assigned threads`);
        if (response.threads && response.threads.length > 0) {
          // Log chi tiết thread đầu tiên để debug
          console.log('[DepartmentDashboard] First assigned thread:', {
            id: response.threads[0].id,
            title: response.threads[0].title,
            assigned_to: response.threads[0].assigned_to,
            status: response.threads[0].status
          });
        } else {
          console.log('[DepartmentDashboard] No assigned threads found');
        }
        
        setThreads(response.threads || []);
      } else {
        console.error('[DepartmentDashboard] Failed to fetch assigned threads:', response.error);
        throw new Error('Không thể lấy danh sách yêu cầu được phân công');
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách yêu cầu được phân công. Vui lòng thử lại.');
      console.error('[DepartmentDashboard] Lỗi khi lấy danh sách yêu cầu:', err);
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
      setError('Vui lòng nhập phản hồi');
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
        throw new Error('Không thể gửi phản hồi');
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
      setError('Lỗi khi gửi phản hồi. Vui lòng thử lại.');
      console.error('Lỗi khi gửi phản hồi:', err);
    } finally {
      setIsResponding(false);
    }
  };
  
  const handleMarkResolved = async (threadId) => {
    try {
      const response = await updateThreadStatus(threadId, 'resolved');
      
      if (!response.success) {
        throw new Error('Không thể đánh dấu đã giải quyết');
      }
      
      fetchThreads();
    } catch (err) {
      setError('Lỗi khi cập nhật trạng thái yêu cầu. Vui lòng thử lại.');
      console.error('Lỗi khi đánh dấu yêu cầu đã giải quyết:', err);
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
          <li className="sidebar-menu-item active">Bảng điều khiển</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/department/tickets')}>Yêu cầu được phân công</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/department/resources')}>Tài nguyên</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/department/debug')}>Debug Tools</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Đăng xuất</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Bảng điều khiển phòng ban</h1>
          <div>
            {user && <span>Xin chào, {user.name || user.username}</span>}
          </div>
        </div>
        
        <div className="row">
          <div className="stats-cards d-flex mb-3">
            <div className="card stat-card">
              <div className="stat-value">{threads.filter(t => t.status === 'assigned').length}</div>
              <div className="stat-label">Phân công mới</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{threads.filter(t => t.status === 'in_progress').length}</div>
              <div className="stat-label">Đang xử lý</div>
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
                <h2 className="card-title">Phản hồi yêu cầu</h2>
              </div>
              <div className="card-body">
                <p><strong>Tiêu đề:</strong> {selectedThread.title}</p>
                <p><strong>Loại:</strong> {selectedThread.issue_type}</p>
                <p><strong>Mô tả:</strong> {selectedThread.description || 'Không có mô tả'}</p>
                
                <form onSubmit={handleResponseSubmit}>
                  <div className="form-group">
                    <label htmlFor="response">Phản hồi của bạn:</label>
                    <textarea
                      id="response"
                      className="form-control"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Nhập phản hồi của bạn tại đây..."
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
                      {isResponding ? 'Đang gửi...' : 'Gửi phản hồi'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary ms-2"
                      onClick={() => setSelectedThread(null)}
                      disabled={isResponding}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Yêu cầu được phân công</h2>
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
                    <th>Hành động</th>
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
                          Xem chi tiết
                        </button>
                        <button 
                          className="btn btn-sm ms-2"
                          onClick={() => handleRespondClick(thread)}
                        >
                          Phản hồi nhanh
                        </button>
                        {(thread.status === 'in_progress' || thread.status === 'assigned') && (
                          <button 
                            className="btn btn-success btn-sm ms-2"
                            onClick={() => handleMarkResolved(thread.id)}
                          >
                            Đánh dấu đã giải quyết
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-4">
                Không tìm thấy yêu cầu nào được phân công.
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
