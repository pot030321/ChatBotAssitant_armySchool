import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResourcesPage.css';

const ResourcesPage = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();
  
  // Mock resources data
  const [resources, setResources] = useState([
    {
      id: 1,
      title: 'Sổ tay hỗ trợ học viên',
      description: 'Hướng dẫn toàn diện về việc xử lý các yêu cầu và vấn đề của học viên.',
      category: 'guidelines',
      documentUrl: '#',
      lastUpdated: '2023-07-15'
    },
    {
      id: 2,
      title: 'Quy định học vụ 2023-2024',
      description: 'Quy định học vụ chính thức cho năm học hiện tại.',
      category: 'policies',
      documentUrl: '#',
      lastUpdated: '2023-06-01'
    },
    {
      id: 3,
      title: 'Câu hỏi thường gặp về hỗ trợ tài chính',
      description: 'Các câu hỏi và trả lời phổ biến về các chương trình hỗ trợ tài chính.',
      category: 'faq',
      documentUrl: '#',
      lastUpdated: '2023-07-20'
    },
    {
      id: 4,
      title: 'Hướng dẫn truy cập hệ thống CNTT',
      description: 'Hướng dẫn truy cập và sử dụng các hệ thống CNTT của nhà trường.',
      category: 'technical',
      documentUrl: '#',
      lastUpdated: '2023-08-05'
    },
    {
      id: 5,
      title: 'Xử lý sự cố đăng ký khóa học',
      description: 'Hướng dẫn từng bước để giải quyết các vấn đề đăng ký phổ biến.',
      category: 'technical',
      documentUrl: '#',
      lastUpdated: '2023-08-01'
    },
    {
      id: 6,
      title: 'Quy trình hỗ trợ người khuyết tật',
      description: 'Quy trình xử lý các yêu cầu hỗ trợ cho người khuyết tật.',
      category: 'guidelines',
      documentUrl: '#',
      lastUpdated: '2023-05-12'
    },
    {
      id: 7,
      title: 'Thông tin liên hệ khẩn cấp',
      description: 'Các liên hệ quan trọng cho các tình huống khẩn cấp.',
      category: 'contacts',
      documentUrl: '#',
      lastUpdated: '2023-06-30'
    },
    {
      id: 8,
      title: 'Mẫu phản hồi của phòng ban',
      description: 'Các mẫu phản hồi tiêu chuẩn cho các yêu cầu phổ biến.',
      category: 'templates',
      documentUrl: '#',
      lastUpdated: '2023-07-25'
    }
  ]);
  
  // Resource categories
  const categories = [
    { id: 'all', name: 'Tất cả tài liệu' },
    { id: 'guidelines', name: 'Hướng dẫn & Quy trình' },
    { id: 'policies', name: 'Quy định' },
    { id: 'faq', name: 'Câu hỏi thường gặp' },
    { id: 'technical', name: 'Hướng dẫn kỹ thuật' },
    { id: 'contacts', name: 'Liên hệ & Danh bạ' },
    { id: 'templates', name: 'Mẫu phản hồi' }
  ];

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
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };
  
  // Filter resources based on search and category
  const filteredResources = resources.filter(resource => {
    // Filter by category
    if (activeCategory !== 'all' && resource.category !== activeCategory) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        resource.title.toLowerCase().includes(query) || 
        resource.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Handle resource download (mock function)
  const handleDownload = (resource) => {
    // In a real app, this would download the document
    alert(`Đang tải xuống: ${resource.title}`);
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">Cổng Hỗ Trợ</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item" onClick={() => navigate('/department')}>Bảng điều khiển</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/department/tickets')}>Yêu cầu được phân công</li>
          <li className="sidebar-menu-item active">Tài liệu</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Đăng xuất</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Tài liệu phòng ban</h1>
          <div>
            {user && <span>Xin chào, {user.name || user.username}</span>}
          </div>
        </div>
        
        <div className="resource-search mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm tài liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="resources-container">
          <div className="resources-sidebar">
            <h3>Danh mục tài liệu</h3>
            <ul className="category-list">
              {categories.map(category => (
                <li 
                  key={category.id}
                  className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                  {category.id === 'all' ? (
                    <span className="badge resource-count">{resources.length}</span>
                  ) : (
                    <span className="badge resource-count">
                      {resources.filter(r => r.category === category.id).length}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            
            <div className="resources-help mt-3">
              <h4>Cần hỗ trợ?</h4>
              <p>Liên hệ đội ngũ hỗ trợ nếu bạn không tìm thấy thông tin cần thiết.</p>
              <button className="btn btn-sm">Liên hệ hỗ trợ</button>
            </div>
          </div>
          
          <div className="resources-content">
            <div className="resources-header">
              <h2>{categories.find(c => c.id === activeCategory)?.name || 'All Resources'}</h2>
              <span className="resource-count-large">{filteredResources.length} tài liệu có sẵn</span>
            </div>
            
            {filteredResources.length > 0 ? (
              <div className="resource-list">
                {filteredResources.map(resource => (
                  <div key={resource.id} className="resource-card">
                    <div className="resource-content">
                      <h3 className="resource-title">{resource.title}</h3>
                      <p className="resource-description">{resource.description}</p>
                      <div className="resource-meta">
                        <span className="resource-category">
                          {categories.find(c => c.id === resource.category)?.name || resource.category}
                        </span>
                        <span className="resource-updated">
                          Cập nhật: {resource.lastUpdated}
                        </span>
                      </div>
                    </div>
                    <div className="resource-actions">
                      <button 
                        className="btn resource-download"
                        onClick={() => handleDownload(resource)}
                      >
                        Tải xuống
                      </button>
                      <button className="btn resource-view">
                        Xem
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-resources">
                <p>Không tìm thấy tài liệu nào phù hợp với tiêu chí tìm kiếm.</p>
                <button 
                  className="btn"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
