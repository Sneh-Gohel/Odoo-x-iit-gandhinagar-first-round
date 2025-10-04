import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real API call to your backend
  const loginUser = async (username, password) => {
    const API_URL = 'http://localhost:3000'; // Your backend URL
    
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return await response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // API call to your backend
      const response = await loginUser(formData.username, formData.password);
      
      if (response.success) {
        console.log('Login successful:', response);
        
        // Store JWT token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Store company info if available
        if (response.company) {
          localStorage.setItem('company', JSON.stringify(response.company));
        }
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: error.message || 'Login failed. Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    }}>
      <div className="row h-100 justify-content-center align-items-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-4">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4 p-md-5">
              
              {/* Header Section */}
              <div className="text-center mb-4">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <div 
                    className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: '50px', height: '50px' }}
                  >
                    <span className="text-white fs-4">💰</span>
                  </div>
                  <h1 className="h3 fw-bold text-dark mb-0">ExpenseFlow</h1>
                </div>
                <p className="text-muted">Smart Expense Management</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label htmlFor="username" className="form-label fw-semibold">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`form-control form-control-lg ${errors.username ? 'is-invalid' : ''}`}
                    placeholder="Enter your username"
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <div className="invalid-feedback d-block">
                      {errors.username}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-semibold">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <div className="invalid-feedback d-block">
                      {errors.password}
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="form-check-input"
                      id="rememberMe"
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <a href="/forgot-password" className="text-decoration-none">
                    Forgot password?
                  </a>
                </div>

                {errors.submit && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <div>{errors.submit}</div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className={`btn btn-primary btn-lg w-100 py-2 fw-semibold ${isLoading ? 'disabled' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-4 text-center">
                <p className="text-muted small mb-0">
                  First time user? <strong>Company will be auto-created</strong> on <Link to="/signup">signup</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;