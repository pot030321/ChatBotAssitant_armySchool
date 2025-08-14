import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/authService';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use our mock auth service instead of a real API call
      const response = await login(username, password);
      
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }
      
      // Store token and user data
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      
      // Redirect based on user role
      const role = response.user?.role?.toLowerCase() || 'student';
      switch (role) {
        case 'manager':
          navigate('/manager');
          break;
        case 'leadership':
          navigate('/leadership');
          break;
        case 'department':
          navigate('/department');
          break;
        case 'student':
        default:
          navigate('/student');
          break;
      }
      
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">University Support Portal</h2>
        
        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-help">
          <p>Tài khoản demo:</p>
          <ul>
            <li>Sinh viên: <strong>student1</strong>, mật khẩu: <strong>123456</strong></li>
            <li>Quản lý: <strong>manager</strong>, mật khẩu: <strong>123456</strong></li>
            <li>IT Department: <strong>cntt</strong>, mật khẩu: <strong>123456</strong></li>
            <li>Finance Office: <strong>finance</strong>, mật khẩu: <strong>123456</strong></li>
            <li>Academic Affairs: <strong>academic</strong>, mật khẩu: <strong>123456</strong></li>
            <li>Lãnh đạo: <strong>leadership</strong>, mật khẩu: <strong>123456</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
