import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/authService';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'student'
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Vui lòng nhập cả tên đăng nhập và mật khẩu');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Sử dụng dịch vụ xác thực thay vì gọi API thực
      const response = await login(username, password);
      
      if (!response.success) {
        throw new Error(response.error || 'Đăng nhập không thành công');
      }
      
      // Lưu token và dữ liệu người dùng
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      
      // Chuyển hướng dựa trên vai trò người dùng
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
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập của bạn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra dữ liệu đăng ký
    if (!registerData.username || !registerData.password || !registerData.fullName || !registerData.email) {
      setError('Vui lòng điền đầy đủ tất cả các trường bắt buộc');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Trong ứng dụng thực tế, đây sẽ gọi một API
      // Với mục đích demo, chúng ta sẽ giả lập thành công và quay lại màn hình đăng nhập
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hiển thị thông báo thành công và quay lại màn hình đăng nhập
      alert('Đăng ký thành công! Bạn có thể đăng nhập bằng thông tin tài khoản của mình.');
      setShowRegister(false);
    } catch (err) {
      setError(err.message || 'Đăng ký không thành công. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-logo">
          <h1>Hệ thống Hỗ trợ Học viên</h1>
          <p>Cổng thông tin hỗ trợ trực tuyến</p>
        </div>
        
        <div className="login-box">
          {!showRegister ? (
            <>
              <h2 className="login-title">Đăng nhập</h2>
              
              {error && (
                <div className="alert alert-danger mb-3">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="username">Tên đăng nhập</label>
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Mật khẩu</label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="Nhập mật khẩu"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="login-btn" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
              </form>
              
              <div className="login-options">
                <button className="register-link" onClick={() => setShowRegister(true)}>
                  Chưa có tài khoản? Đăng ký ngay
                </button>
              </div>
              
              <div className="login-help">
                <h3>Tài khoản demo:</h3>
                <div className="demo-accounts">
                  <div className="account-card">
                    <div className="account-type">Sinh viên</div>
                    <div className="account-credentials">
                      <strong>Tên đăng nhập:</strong> student1<br />
                      <strong>Mật khẩu:</strong> password123
                    </div>
                  </div>
                  
                  <div className="account-card">
                    <div className="account-type">Quản lý</div>
                    <div className="account-credentials">
                      <strong>Tên đăng nhập:</strong> manager1<br />
                      <strong>Mật khẩu:</strong> password123
                    </div>
                  </div>
                  
                  <div className="account-card">
                    <div className="account-type">Phòng CNTT</div>
                    <div className="account-credentials">
                      <strong>Tên đăng nhập:</strong> cntt<br />
                      <strong>Mật khẩu:</strong> password123
                    </div>
                  </div>
                  
                  <div className="account-card">
                    <div className="account-type">Phòng Đào Tạo</div>
                    <div className="account-credentials">
                      <strong>Tên đăng nhập:</strong> dept_academic<br />
                      <strong>Mật khẩu:</strong> password123
                    </div>
                  </div>
                  
                  <div className="account-card">
                    <div className="account-type">Lãnh đạo</div>
                    <div className="account-credentials">
                      <strong>Tên đăng nhập:</strong> leadership1<br />
                      <strong>Mật khẩu:</strong> password123
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="login-title">Đăng ký tài khoản</h2>
              
              {error && (
                <div className="alert alert-danger mb-3">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label htmlFor="reg-fullname">Họ và tên</label>
                  <input
                    type="text"
                    id="reg-fullname"
                    name="fullName"
                    className="form-control"
                    value={registerData.fullName}
                    onChange={handleRegisterInputChange}
                    disabled={isLoading}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reg-username">Tên đăng nhập</label>
                  <input
                    type="text"
                    id="reg-username"
                    name="username"
                    className="form-control"
                    value={registerData.username}
                    onChange={handleRegisterInputChange}
                    disabled={isLoading}
                    placeholder="Tạo tên đăng nhập"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reg-email">Email</label>
                  <input
                    type="email"
                    id="reg-email"
                    name="email"
                    className="form-control"
                    value={registerData.email}
                    onChange={handleRegisterInputChange}
                    disabled={isLoading}
                    placeholder="Nhập địa chỉ email"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reg-password">Mật khẩu</label>
                  <input
                    type="password"
                    id="reg-password"
                    name="password"
                    className="form-control"
                    value={registerData.password}
                    onChange={handleRegisterInputChange}
                    disabled={isLoading}
                    placeholder="Tạo mật khẩu"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reg-role">Vai trò</label>
                  <select
                    id="reg-role"
                    name="role"
                    className="form-control"
                    value={registerData.role}
                    onChange={handleRegisterInputChange}
                    disabled={isLoading}
                    required
                  >
                    <option value="student">Sinh viên</option>
                    <option value="staff">Nhân viên</option>
                  </select>
                </div>
                
                <div className="register-actions">
                  <button 
                    type="submit" 
                    className="login-btn" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                  </button>
                  
                  <button 
                    type="button"
                    className="back-btn"
                    onClick={() => setShowRegister(false)}
                    disabled={isLoading}
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
