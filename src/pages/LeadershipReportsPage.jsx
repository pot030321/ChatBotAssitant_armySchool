import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalyticsData } from '../utils/threadService';
import '../styles/LeadershipPages.css';

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

const LeadershipReportsPage = () => {
  const [user, setUser] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Report generation state
  const [selectedReport, setSelectedReport] = useState('weekly');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    // Get user from localStorage using helper function
    const userData = getUserInfo();
    if (userData) {
      setUser(userData);
    }
    
    // Fetch analytics data
    fetchAnalyticsData();
  }, []);
  
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await getAnalyticsData();
      
      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Error loading analytics data. Please try again.');
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">Support Portal</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item" onClick={() => navigate('/leadership')}>Dashboard</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/leadership/analytics')}>Analytics</li>
          <li className="sidebar-menu-item active">Reports</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Logout</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Report Generator</h1>
          <div>
            {user && <span>Welcome, {user.name || user.username}</span>}
          </div>
        </div>
        
        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading report data...</p>
          </div>
        ) : analyticsData ? (
          <div className="reports-content">
            <div className="card mb-4">
              <div className="card-header">
                <h2 className="card-title">Generate Reports</h2>
              </div>
              <div className="card-body">
                <div className="report-form">
                  <div className="form-group">
                    <label>Report Type</label>
                    <select 
                      className="form-control" 
                      value={selectedReport}
                      onChange={(e) => setSelectedReport(e.target.value)}
                    >
                      <option value="weekly">Weekly Summary</option>
                      <option value="monthly">Monthly Summary</option>
                      <option value="department">Department Performance</option>
                      <option value="response">Response Time Analysis</option>
                      <option value="custom">Custom Report</option>
                    </select>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input 
                        type="date" 
                        className="form-control"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>End Date</label>
                      <input 
                        type="date" 
                        className="form-control"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Include Sections</label>
                    <div className="checkbox-group">
                      <div className="checkbox-item">
                        <input type="checkbox" id="include-summary" defaultChecked />
                        <label htmlFor="include-summary">Executive Summary</label>
                      </div>
                      <div className="checkbox-item">
                        <input type="checkbox" id="include-metrics" defaultChecked />
                        <label htmlFor="include-metrics">Key Metrics</label>
                      </div>
                      <div className="checkbox-item">
                        <input type="checkbox" id="include-department" defaultChecked />
                        <label htmlFor="include-department">Department Breakdown</label>
                      </div>
                      <div className="checkbox-item">
                        <input type="checkbox" id="include-types" defaultChecked />
                        <label htmlFor="include-types">Issue Types</label>
                      </div>
                      <div className="checkbox-item">
                        <input type="checkbox" id="include-recommendations" defaultChecked />
                        <label htmlFor="include-recommendations">Recommendations</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Output Format</label>
                    <div className="radio-group">
                      <div className="radio-item">
                        <input type="radio" id="format-pdf" name="format" defaultChecked />
                        <label htmlFor="format-pdf">PDF</label>
                      </div>
                      <div className="radio-item">
                        <input type="radio" id="format-excel" name="format" />
                        <label htmlFor="format-excel">Excel</label>
                      </div>
                      <div className="radio-item">
                        <input type="radio" id="format-html" name="format" />
                        <label htmlFor="format-html">HTML</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="btn" 
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Report'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mb-4">
              <div className="card-header">
                <h2 className="card-title">Recent Reports</h2>
              </div>
              <div className="card-body">
                <div className="recent-reports">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Report Name</th>
                        <th>Type</th>
                        <th>Date Range</th>
                        <th>Generated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Weekly Summary</td>
                        <td>Weekly</td>
                        <td>08/05/2025 - 08/12/2025</td>
                        <td>08/12/2025</td>
                        <td>
                          <button className="btn btn-sm">View</button>
                          <button className="btn btn-sm ms-2">Download</button>
                        </td>
                      </tr>
                      <tr>
                        <td>July Monthly Report</td>
                        <td>Monthly</td>
                        <td>07/01/2025 - 07/31/2025</td>
                        <td>08/03/2025</td>
                        <td>
                          <button className="btn btn-sm">View</button>
                          <button className="btn btn-sm ms-2">Download</button>
                        </td>
                      </tr>
                      <tr>
                        <td>IT Department Performance</td>
                        <td>Department</td>
                        <td>07/15/2025 - 08/15/2025</td>
                        <td>08/15/2025</td>
                        <td>
                          <button className="btn btn-sm">View</button>
                          <button className="btn btn-sm ms-2">Download</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Scheduled Reports</h2>
              </div>
              <div className="card-body">
                <div className="scheduled-reports">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Report Name</th>
                        <th>Schedule</th>
                        <th>Recipients</th>
                        <th>Next Run</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Weekly Executive Summary</td>
                        <td>Every Monday at 8:00 AM</td>
                        <td>leadership@university.edu</td>
                        <td>08/19/2025</td>
                        <td>
                          <button className="btn btn-sm">Edit</button>
                          <button className="btn btn-sm btn-secondary ms-2">Delete</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Monthly Performance Report</td>
                        <td>1st of month at 9:00 AM</td>
                        <td>leadership@university.edu, departments@university.edu</td>
                        <td>09/01/2025</td>
                        <td>
                          <button className="btn btn-sm">Edit</button>
                          <button className="btn btn-sm btn-secondary ms-2">Delete</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-3">
                  <button className="btn">Schedule New Report</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            No report data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadershipReportsPage;
