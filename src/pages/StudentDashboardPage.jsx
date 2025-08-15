import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreadDetail from '../components/ThreadDetail';
import ChatBox from '../components/ChatBox';
import { getStudentThreads, createThread } from '../utils/threadService';
import '../components/ThreadDetail.css';
import '../styles/StudentDashboard.css';

const API_BASE = 'http://localhost:8000'; // Keeping for reference

const StudentDashboardPage = () => {
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // New thread state
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadType, setNewThreadType] = useState('question');
  const [newThreadDescription, setNewThreadDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
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
        throw new Error('Không thể lấy danh sách câu hỏi');
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách câu hỏi của bạn. Vui lòng thử lại.');
      console.error('Lỗi khi lấy danh sách thread:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const createNewThread = async (e) => {
    e.preventDefault();
    
    if (!newThreadTitle.trim()) {
      setError('Vui lòng nhập tiêu đề cho câu hỏi của bạn');
      return;
    }
    
    setIsCreating(true);
    setError('');
    
    try {
      // Using mock service instead of real API
      const response = await createThread({
        title: newThreadTitle,
        issue_type: newThreadType,
        description: newThreadDescription
      });
      
      if (!response.success) {
        throw new Error('Không thể tạo câu hỏi mới');
      }
      
      // Reset form
      setNewThreadTitle('');
      setNewThreadType('question');
      setNewThreadDescription('');
      
      // Refresh threads list
      fetchThreads();
    } catch (err) {
      setError('Lỗi khi tạo câu hỏi mới. Vui lòng thử lại.');
      console.error('Lỗi khi tạo thread:', err);
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  const handleChatbotTicketCreation = (ticketData) => {
    setNewThreadTitle(ticketData.title);
    setNewThreadDescription(ticketData.description);
    setNewThreadType(ticketData.type);
    
    // Scroll to the form
    document.getElementById('thread-form').scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">Cổng Hỗ Trợ</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item active">Bảng điều khiển</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/my-questions')}>Câu hỏi của tôi</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/faq')}>Câu hỏi thường gặp</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Đăng xuất</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Bảng điều khiển sinh viên</h1>
          <div>
            {user && <span>Xin chào, {user.name || user.username}</span>}
          </div>
        </div>
        
        <div className="dashboard-layout">
          <div className="left-column">
            <div className="card mb-3" id="thread-form">
              <div className="card-header">
                <h2 className="card-title">Đặt câu hỏi mới</h2>
              </div>
              
              {error && (
                <div className="alert alert-danger mb-3">
                  {error}
                </div>
              )}
              
              <form onSubmit={createNewThread}>
                <div className="form-group">
                  <label htmlFor="thread-title">Tiêu đề câu hỏi</label>
                  <input
                    type="text"
                    id="thread-title"
                    className="form-control"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    placeholder="Câu hỏi của bạn về vấn đề gì?"
                    disabled={isCreating}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="thread-type">Loại câu hỏi</label>
                  <select
                    id="thread-type"
                    className="form-control"
                    value={newThreadType}
                    onChange={(e) => setNewThreadType(e.target.value)}
                    disabled={isCreating}
                  >
                    <option value="question">Câu hỏi chung</option>
                    <option value="technical">Hỗ trợ kỹ thuật</option>
                    <option value="billing">Câu hỏi về thanh toán</option>
                    <option value="feedback">Phản hồi</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="thread-description">Mô tả</label>
                  <textarea
                    id="thread-description"
                    className="form-control"
                    value={newThreadDescription}
                    onChange={(e) => setNewThreadDescription(e.target.value)}
                    placeholder="Cung cấp thêm chi tiết về câu hỏi của bạn"
                    rows="4"
                    disabled={isCreating}
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="btn"
                  disabled={isCreating}
                >
                  {isCreating ? 'Đang gửi...' : 'Gửi câu hỏi'}
                </button>
              </form>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Câu hỏi gần đây của tôi</h2>
              </div>
              
              {isLoading ? (
                <div className="text-center p-4">Đang tải...</div>
              ) : threads.length > 0 ? (
                <ul className="thread-list">
                  {threads.map(thread => (
                    <li key={thread.id} className="thread-item">
                      <div className="thread-title">{thread.title}</div>
                      <div className="thread-meta">
                        <span className="thread-type">{thread.issue_type}</span>
                        <span className="thread-status">Trạng thái: {
                          thread.status === 'resolved' ? 'Đã giải quyết' : 
                          thread.status === 'new' ? 'Mới' : 
                          thread.status === 'assigned' ? 'Đã phân công' :
                          thread.status === 'in_progress' ? 'Đang xử lý' :
                          thread.status === 'escalated' ? 'Đã chuyển cấp' : thread.status
                        }</span>
                        <span className="thread-date">
                          Ngày tạo: {new Date(thread.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {thread.description && (
                        <div className="thread-description-preview">
                          {thread.description.length > 100 
                            ? thread.description.substring(0, 100) + '...' 
                            : thread.description}
                        </div>
                      )}
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedThreadId(thread.id)}
                      >
                        Xem chi tiết
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center p-4">
                  Bạn chưa gửi câu hỏi nào.
                </div>
              )}
            </div>
          </div>
          
          <div className="right-column">
            <div className="card chatbox-card">
              <div className="card-header">
                <h2 className="card-title">Trợ lý ảo</h2>
              </div>
              <ChatBox onCreateTicket={handleChatbotTicketCreation} />
            </div>
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

export default StudentDashboardPage;
