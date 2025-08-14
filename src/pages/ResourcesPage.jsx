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
      title: 'Student Support Handbook',
      description: 'Comprehensive guide for handling student inquiries and issues.',
      category: 'guidelines',
      documentUrl: '#',
      lastUpdated: '2023-07-15'
    },
    {
      id: 2,
      title: 'Academic Policies 2023-2024',
      description: 'Official academic policies for the current academic year.',
      category: 'policies',
      documentUrl: '#',
      lastUpdated: '2023-06-01'
    },
    {
      id: 3,
      title: 'Financial Aid FAQ',
      description: 'Common questions and answers about financial aid programs.',
      category: 'faq',
      documentUrl: '#',
      lastUpdated: '2023-07-20'
    },
    {
      id: 4,
      title: 'IT Systems Access Guide',
      description: 'Instructions for accessing and using university IT systems.',
      category: 'technical',
      documentUrl: '#',
      lastUpdated: '2023-08-05'
    },
    {
      id: 5,
      title: 'Course Registration Troubleshooting',
      description: 'Step-by-step guide to resolve common registration issues.',
      category: 'technical',
      documentUrl: '#',
      lastUpdated: '2023-08-01'
    },
    {
      id: 6,
      title: 'Disability Accommodation Procedures',
      description: 'Processes for handling disability accommodation requests.',
      category: 'guidelines',
      documentUrl: '#',
      lastUpdated: '2023-05-12'
    },
    {
      id: 7,
      title: 'Emergency Contact Information',
      description: 'Important contacts for various emergency situations.',
      category: 'contacts',
      documentUrl: '#',
      lastUpdated: '2023-06-30'
    },
    {
      id: 8,
      title: 'Department Response Templates',
      description: 'Standardized response templates for common inquiries.',
      category: 'templates',
      documentUrl: '#',
      lastUpdated: '2023-07-25'
    }
  ]);
  
  // Resource categories
  const categories = [
    { id: 'all', name: 'All Resources' },
    { id: 'guidelines', name: 'Guidelines & Procedures' },
    { id: 'policies', name: 'Policies' },
    { id: 'faq', name: 'FAQs' },
    { id: 'technical', name: 'Technical Guides' },
    { id: 'contacts', name: 'Contacts & Directory' },
    { id: 'templates', name: 'Response Templates' }
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
    alert(`Downloading: ${resource.title}`);
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">Support Portal</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item" onClick={() => navigate('/department')}>Dashboard</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/department/tickets')}>Assigned Tickets</li>
          <li className="sidebar-menu-item active">Resources</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Logout</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Department Resources</h1>
          <div>
            {user && <span>Welcome, {user.name || user.username}</span>}
          </div>
        </div>
        
        <div className="resource-search mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="resources-container">
          <div className="resources-sidebar">
            <h3>Resource Categories</h3>
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
              <h4>Need Help?</h4>
              <p>Contact the support team if you can't find what you're looking for.</p>
              <button className="btn btn-sm">Contact Support</button>
            </div>
          </div>
          
          <div className="resources-content">
            <div className="resources-header">
              <h2>{categories.find(c => c.id === activeCategory)?.name || 'All Resources'}</h2>
              <span className="resource-count-large">{filteredResources.length} resources available</span>
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
                          Updated: {resource.lastUpdated}
                        </span>
                      </div>
                    </div>
                    <div className="resource-actions">
                      <button 
                        className="btn resource-download"
                        onClick={() => handleDownload(resource)}
                      >
                        Download
                      </button>
                      <button className="btn resource-view">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-resources">
                <p>No resources found matching your search criteria.</p>
                <button 
                  className="btn"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                >
                  Clear Filters
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
