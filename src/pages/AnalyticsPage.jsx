import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalyticsData } from '../utils/threadService';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState('week'); // week, month, year
  const navigate = useNavigate();
  
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
    
    // Fetch analytics data
    fetchAnalyticsData();
  }, []);
  
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await getAnalyticsData();
      
      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Error loading analytics. Please try again.');
      console.error('Error fetching analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };
  
  // Generate random data for demonstration purposes
  const generateRandomData = (count, min, max) => {
    return Array.from({ length: count }, () => 
      Math.floor(Math.random() * (max - min + 1)) + min
    );
  };
  
  const getChartData = () => {
    // Normally this would use actual data, but we're generating random data for demo
    let labels = [];
    let datasets = [];
    
    if (dateRange === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      datasets = [
        {
          name: 'New Tickets',
          data: generateRandomData(7, 1, 15)
        },
        {
          name: 'Resolved Tickets',
          data: generateRandomData(7, 1, 10)
        }
      ];
    } else if (dateRange === 'month') {
      labels = Array.from({ length: 30 }, (_, i) => `${i+1}`);
      datasets = [
        {
          name: 'New Tickets',
          data: generateRandomData(30, 0, 8)
        },
        {
          name: 'Resolved Tickets',
          data: generateRandomData(30, 0, 7)
        }
      ];
    } else {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      datasets = [
        {
          name: 'New Tickets',
          data: generateRandomData(12, 10, 50)
        },
        {
          name: 'Resolved Tickets',
          data: generateRandomData(12, 8, 45)
        }
      ];
    }
    
    return { labels, datasets };
  };
  
  const renderSampleChart = () => {
    // This is a placeholder for where an actual chart would be
    // In a real application, you would use a charting library like Chart.js or Recharts
    const { labels, datasets } = getChartData();
    
    // Create a simple "ASCII chart" just for demonstration
    return (
      <div className="sample-chart">
        <div className="chart-legend">
          {datasets.map((dataset, index) => (
            <div key={index} className={`legend-item legend-item-${index}`}>
              <div className={`legend-color color-${index}`}></div>
              <div className="legend-name">{dataset.name}</div>
            </div>
          ))}
        </div>
        <div className="chart-container">
          <div className="y-axis">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="y-label">
                {(5-i) * 20}%
              </div>
            ))}
          </div>
          <div className="chart-area">
            {datasets[0].data.map((_, i) => (
              <div key={i} className="chart-bar-group">
                {datasets.map((dataset, j) => {
                  const height = (dataset.data[i] / 20) * 100;
                  return (
                    <div 
                      key={`${i}-${j}`} 
                      className={`chart-bar bar-${j}`} 
                      style={{ height: `${height}%` }}
                      title={`${dataset.name}: ${dataset.data[i]}`}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="x-axis">
            {labels.map((label, i) => (
              <div key={i} className="x-label">
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Helper function to get percentage
  const getPercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };
  
  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-logo">Support Portal</div>
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item" onClick={() => navigate('/manager')}>Dashboard</li>
          <li className="sidebar-menu-item" onClick={() => navigate('/all-tickets')}>All Tickets</li>
          <li className="sidebar-menu-item active">Analytics</li>
          <li className="sidebar-menu-item" onClick={handleLogout}>Logout</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Analytics Dashboard</h1>
          <div>
            {user && <span>Welcome, {user.name || user.username}</span>}
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center p-4">Loading analytics data...</div>
        ) : error ? (
          <div className="alert alert-danger">
            {error}
          </div>
        ) : analyticsData && (
          <div className="analytics-container">
            <div className="row mb-3">
              <div className="stats-cards-large">
                <div className="card stat-card-large total-tickets">
                  <div className="stat-value-large">{analyticsData.totalTickets}</div>
                  <div className="stat-label-large">Total Tickets</div>
                </div>
                
                <div className="card stat-card-large avg-response">
                  <div className="stat-value-large">
                    {analyticsData.avgResponseTime.toFixed(1)} <span className="unit">min</span>
                  </div>
                  <div className="stat-label-large">Avg. Response Time</div>
                </div>
                
                <div className="card stat-card-large resolution-rate">
                  <div className="stat-value-large">
                    {getPercentage(analyticsData.statusCounts.resolved, analyticsData.totalTickets)}%
                  </div>
                  <div className="stat-label-large">Resolution Rate</div>
                </div>
                
                <div className="card stat-card-large unassigned">
                  <div className="stat-value-large">
                    {analyticsData.assignmentCounts.Unassigned || 0}
                  </div>
                  <div className="stat-label-large">Unassigned Tickets</div>
                </div>
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="card analytics-chart-card">
                <div className="card-header">
                  <h2 className="card-title">Ticket Volume Over Time</h2>
                  <div className="chart-controls">
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="form-control"
                    >
                      <option value="week">Last 7 days</option>
                      <option value="month">Last 30 days</option>
                      <option value="year">Last 12 months</option>
                    </select>
                  </div>
                </div>
                {renderSampleChart()}
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="card analytics-data-card">
                  <div className="card-header">
                    <h2 className="card-title">Ticket Status Distribution</h2>
                  </div>
                  <div className="data-list status-list">
                    {Object.entries(analyticsData.statusCounts).map(([status, count]) => (
                      <div key={status} className="data-item">
                        <div className="data-label">
                          <span className={`status-dot status-${status}`}></span>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </div>
                        <div className="data-count">{count}</div>
                        <div className="data-bar-container">
                          <div 
                            className={`data-bar status-${status}`} 
                            style={{ width: `${getPercentage(count, analyticsData.totalTickets)}%` }}
                          ></div>
                        </div>
                        <div className="data-percentage">
                          {getPercentage(count, analyticsData.totalTickets)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card analytics-data-card">
                  <div className="card-header">
                    <h2 className="card-title">Ticket Type Distribution</h2>
                  </div>
                  <div className="data-list type-list">
                    {Object.entries(analyticsData.issueTypeCounts).map(([type, count]) => (
                      <div key={type} className="data-item">
                        <div className="data-label">
                          <span className={`type-dot type-${type}`}></span>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </div>
                        <div className="data-count">{count}</div>
                        <div className="data-bar-container">
                          <div 
                            className={`data-bar type-${type}`} 
                            style={{ width: `${getPercentage(count, analyticsData.totalTickets)}%` }}
                          ></div>
                        </div>
                        <div className="data-percentage">
                          {getPercentage(count, analyticsData.totalTickets)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row mt-3">
              <div className="card analytics-data-card">
                <div className="card-header">
                  <h2 className="card-title">Department Workload</h2>
                </div>
                <div className="data-list assignment-list">
                  {Object.entries(analyticsData.assignmentCounts)
                    .sort((a, b) => b[1] - a[1]) // Sort by count descending
                    .map(([department, count]) => (
                      <div key={department} className="data-item">
                        <div className="data-label">
                          {department}
                        </div>
                        <div className="data-count">{count}</div>
                        <div className="data-bar-container">
                          <div 
                            className="data-bar" 
                            style={{ width: `${getPercentage(count, analyticsData.totalTickets)}%` }}
                          ></div>
                        </div>
                        <div className="data-percentage">
                          {getPercentage(count, analyticsData.totalTickets)}%
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
