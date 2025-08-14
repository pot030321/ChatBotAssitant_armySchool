import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage.jsx'
import StudentDashboardPage from './pages/StudentDashboardPage.jsx'
import { LanguageProvider } from './utils/languageContext.jsx'
import ManagerDashboardPage from './pages/ManagerDashboardPage.jsx'
import DepartmentDashboardPage from './pages/DepartmentDashboardPage.jsx'
import AssignedTicketsPage from './pages/AssignedTicketsPage.jsx'
import ResourcesPage from './pages/ResourcesPage.jsx'
import LeadershipDashboardPage from './pages/LeadershipDashboardPage.jsx'
import LeadershipAnalyticsPage from './pages/LeadershipAnalyticsPage.jsx'
import LeadershipReportsPage from './pages/LeadershipReportsPage.jsx'
import MyQuestionsPage from './pages/MyQuestionsPage.jsx'
import FAQPage from './pages/FAQPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import AllTicketsPage from './pages/AllTicketsPage.jsx'

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
    console.error('Error checking user role:', err);
  }
  
  // Default fallback
  return <Navigate to="/login" replace />;
}

function App() {
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
        
        <Route path="/leadership" element={
          <ProtectedRoute requiredRole="leadership">
            <LeadershipDashboardPage />
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
              console.error('Error routing based on role:', err);
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
