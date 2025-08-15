import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import LoginPage from './pages/LoginPage.jsx'
import StudentDashboardPage from './pages/StudentDashboardPage.jsx'
import { LanguageProvider } from './utils/languageContext.jsx'
import ManagerDashboardPage from './pages/ManagerDashboardPage.jsx'
import DepartmentDashboardPage from './pages/DepartmentDashboardPage.jsx'
import AssignedTicketsPage from './pages/AssignedTicketsPage.jsx'
import ResourcesPage from './pages/ResourcesPage.jsx'
import LeadershipDashboardPage from './pages/LeadershipDashboardPage.jsx'
import LeadershipDepartmentsPage from './pages/LeadershipDepartmentsPage.jsx'
import LeadershipAnalyticsPage from './pages/LeadershipAnalyticsPage.jsx'
import LeadershipReportsPage from './pages/LeadershipReportsPage.jsx'
import MyQuestionsPage from './pages/MyQuestionsPage.jsx'
import FAQPage from './pages/FAQPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import AllTicketsPage from './pages/AllTicketsPage.jsx'
import DepartmentDebugPage from './pages/DepartmentDebugPage.jsx'
import { validateApiConnection } from './utils/apiHealth'

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('auth_token');
  
  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If no specific role is required, just allow access
  if (!requiredRole) {
    return children;
  }
  
  // Check if user has the required role
  try {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      const userRole = userData.role?.toLowerCase() || 'student';
      
      if (userRole === requiredRole.toLowerCase()) {
        return children;
      }
      
      // Redirect to appropriate dashboard if role doesn't match
      switch (userRole) {
        case 'manager':
          return <Navigate to="/manager" replace />;
        case 'leadership':
          return <Navigate to="/leadership" replace />;
        case 'department':
          return <Navigate to="/department" replace />;
        default:
          return <Navigate to="/student" replace />;
      }
    }
  } catch (err) {
    console.error('Lỗi khi kiểm tra vai trò người dùng:', err);
  }
  
  // Default fallback
  return <Navigate to="/login" replace />;
}

function App() {
  const [apiStatus, setApiStatus] = useState({
    checking: true,
    healthy: false,
    message: 'Checking API connection...'
  });

  useEffect(() => {
    // Check API health on component mount
    const checkApiStatus = async () => {
      try {
        const validationResult = await validateApiConnection();
        
        setApiStatus({
          checking: false,
          healthy: validationResult.success,
          message: validationResult.message,
          authError: validationResult.authError
        });
        
        // If auth error, we need to force logout
        if (validationResult.authError) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      } catch (error) {
        console.error('Không thể xác thực kết nối API:', error);
        setApiStatus({
          checking: false,
          healthy: false,
          message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'
        });
      }
    };

    checkApiStatus();
  }, []);

  // Display API status if still checking or unhealthy
  if (apiStatus.checking) {
    return (
      <div className="api-status-screen">
        <div className="api-status-container">
          <h2>Đang kết nối đến máy chủ...</h2>
          <p>{apiStatus.message}</p>
        </div>
      </div>
    );
  }

  if (!apiStatus.healthy) {
    return (
      <div className="api-status-screen">
        <div className="api-status-container">
          <h2>Lỗi Kết Nối</h2>
          <p>{apiStatus.message}</p>
          <button onClick={() => window.location.reload()}>Thử Lại</button>
        </div>
      </div>
    );
  }

  // If API is healthy, render the app
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Role-based protected routes */}
        <Route path="/student" element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/my-questions" element={
          <ProtectedRoute requiredRole="student">
            <MyQuestionsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/faq" element={
          <ProtectedRoute>
            <FAQPage />
          </ProtectedRoute>
        } />
        
        <Route path="/manager" element={
          <ProtectedRoute requiredRole="manager">
            <ManagerDashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/all-tickets" element={
          <ProtectedRoute requiredRole="manager">
            <AllTicketsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute requiredRole="manager">
            <AnalyticsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/department" element={
          <ProtectedRoute requiredRole="department">
            <DepartmentDashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/department/tickets" element={
          <ProtectedRoute requiredRole="department">
            <AssignedTicketsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/department/resources" element={
          <ProtectedRoute requiredRole="department">
            <ResourcesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/department/debug" element={
          <ProtectedRoute requiredRole="department">
            <DepartmentDebugPage />
          </ProtectedRoute>
        } />
        
        <Route path="/leadership" element={
          <ProtectedRoute requiredRole="leadership">
            <LeadershipDashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/leadership/departments" element={
          <ProtectedRoute requiredRole="leadership">
            <LeadershipDepartmentsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/leadership/analytics" element={
          <ProtectedRoute requiredRole="leadership">
            <LeadershipAnalyticsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/leadership/reports" element={
          <ProtectedRoute requiredRole="leadership">
            <LeadershipReportsPage />
          </ProtectedRoute>
        } />
        
        {/* Default route - redirect to login or appropriate dashboard */}
        <Route path="/" element={
          (() => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
              return <Navigate to="/login" replace />;
            }
            
            try {
              const userStr = localStorage.getItem('auth_user');
              if (userStr) {
                const userData = JSON.parse(userStr);
                const userRole = userData.role?.toLowerCase() || 'student';
                
                switch (userRole) {
                  case 'manager':
                    return <Navigate to="/manager" replace />;
                  case 'leadership':
                    return <Navigate to="/leadership" replace />;
                  case 'department':
                    return <Navigate to="/department" replace />;
                  default:
                    return <Navigate to="/student" replace />;
                }
              }
            } catch (err) {
              console.error('Lỗi khi định tuyến dựa trên vai trò:', err);
            }
            
            return <Navigate to="/login" replace />;
          })()
        } />
        
        {/* Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
