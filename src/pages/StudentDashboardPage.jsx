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
        throw new Error('Failed to fetch threads');
      }
    } catch (err) {
      setError('Error loading your threads. Please try again.');
      console.error('Error fetching threads:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const createNewThread = async (e) => {
    e.preventDefault();
    
    if (!newThreadTitle.trim()) {
      setError('Please enter a title for your question');
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
        throw new Error('Failed to create new thread');
      }
      
      // Reset form
      setNewThreadTitle('');
      setNewThreadType('question');
      setNewThreadDescription('');
      
      // Refresh threads list
      fetchThreads();
    } catch (err) {
      setError('Error creating new thread. Please try again.');
      console.error('Error creating thread:', err);
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
        <div className="sidebar-logo">Support Portal</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item active">Dashboard</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/my-questions')}>My Questions</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/faq')}>FAQ</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Logout</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Student Dashboard</h1>
          <div>
            {user && <span>Welcome, {user.name || user.username}</span>}
          </div>
        </div>
        
        <div className="dashboard-layout">
          <div className="left-column">
            <div className="card mb-3" id="thread-form">
              <div className="card-header">
                <h2 className="card-title">Ask a New Question</h2>
              </div>
              
              {error && (
                <div className="alert alert-danger mb-3">
                  {error}
                </div>
              )}
              
              <form onSubmit={createNewThread}>
                <div className="form-group">
                  <label htmlFor="thread-title">Question Title</label>
                  <input
                    type="text"
                    id="thread-title"
                    className="form-control"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    placeholder="What's your question about?"
                    disabled={isCreating}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="thread-type">Question Type</label>
                  <select
                    id="thread-type"
                    className="form-control"
                    value={newThreadType}
                    onChange={(e) => setNewThreadType(e.target.value)}
                    disabled={isCreating}
                  >
                    <option value="question">General Question</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Query</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="thread-description">Description</label>
                  <textarea
                    id="thread-description"
                    className="form-control"
                    value={newThreadDescription}
                    onChange={(e) => setNewThreadDescription(e.target.value)}
                    placeholder="Provide more details about your question"
                    rows="4"
                    disabled={isCreating}
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="btn"
                  disabled={isCreating}
                >
                  {isCreating ? 'Submitting...' : 'Submit Question'}
                </button>
              </form>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">My Recent Questions</h2>
              </div>
              
              {isLoading ? (
                <div className="text-center p-4">Loading...</div>
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
                          Created: {new Date(thread.created_at).toLocaleDateString()}
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
                        View Details
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center p-4">
                  You haven't submitted any questions yet.
                </div>
              )}
            </div>
          </div>
          
          <div className="right-column">
            <div className="card chatbox-card">
              <div className="card-header">
                <h2 className="card-title">Virtual Assistant</h2>
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
