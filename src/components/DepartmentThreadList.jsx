import React, { useState, useEffect } from 'react';
import ThreadDetail from './ThreadDetail';
import './ThreadDetail.css';
import './DepartmentThreadList.css';

const DepartmentThreadList = ({ department, threads = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle viewing thread details with error handling
  const handleViewThread = (threadId) => {
    console.log("Opening thread details for ID:", threadId);
    if (!threadId) {
      console.error("Invalid thread ID");
      setErrorMessage("Không thể mở chi tiết: ID không hợp lệ");
      return;
    }
    
    // Reset any previous error
    setErrorMessage('');
    
    // Log the ID in a way that makes it very clear in the console
    console.log("==============================");
    console.log("OPENING THREAD WITH ID:", threadId);
    console.log("==============================");
    
    // Set the selected thread ID to open the modal
    setSelectedThreadId(threadId);
  };

  // Status label formatter
  const getStatusLabel = (status) => {
    switch(status) {
      case 'new': return 'Mới';
      case 'assigned': return 'Đã phân công';
      case 'in_progress': return 'Đang xử lý';
      case 'resolved': return 'Đã giải quyết';
      case 'escalated': return 'Đã chuyển cấp';
      default: return status;
    }
  };

  // Sort threads by creation date (newest first)
  const sortedThreads = [...threads].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div className="department-threads-container">
      <div className="department-header" onClick={toggleExpand}>
        <div className="department-title">
          <h3>{department}</h3>
          <span className="thread-count">{threads.length} câu hỏi</span>
        </div>
        <span className="expand-icon">{isExpanded ? '▼' : '►'}</span>
      </div>

      {isExpanded && (
        <div className="thread-list">
          <table className="thread-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Sinh viên</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sortedThreads.map((thread) => (
                <tr key={thread.id}>
                  <td>{thread.title}</td>
                  <td>
                    <span className={`status-badge status-${thread.status}`}>
                      {getStatusLabel(thread.status)}
                    </span>
                  </td>
                  <td>{formatDate(thread.created_at)}</td>
                  <td>{thread.student ? thread.student.full_name : 'N/A'}</td>
                  <td>
                    <button 
                      className="view-detail-btn"
                      onClick={() => handleViewThread(thread.id)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Error message display */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
          <button onClick={() => setErrorMessage('')} className="close-error">×</button>
        </div>
      )}
      
      {/* Thread detail modal */}
      {selectedThreadId && (
        <ThreadDetail 
          threadId={selectedThreadId} 
          onClose={() => {
            setSelectedThreadId(null);
            setErrorMessage('');
          }}
        />
      )}
    </div>
  );
};

export default DepartmentThreadList;
