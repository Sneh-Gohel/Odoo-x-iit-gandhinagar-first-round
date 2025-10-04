import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const validateSignupForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtpForm = () => {
    if (!otp.trim()) {
      setErrors({ otp: 'OTP is required' });
      return false;
    } else if (otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return false;
    }
    return true;
  };

  const sendOtp = async () => {
    const API_URL = 'http://localhost:3000';
    const response = await fetch(`${API_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        name: formData.name
      })
    });

    if (!response.ok) throw new Error('Failed to send OTP');
    return await response.json();
  };

  const verifyOtpAndSignup = async () => {
    const API_URL = 'http://localhost:3000';
    const response = await fetch(`${API_URL}/api/auth/verify-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: otp
      })
    });

    if (!response.ok) throw new Error('Signup failed');
    return await response.json();
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateSignupForm()) return;
    
    setIsLoading(true);
    try {
      await sendOtp();
      setStep(2);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!validateOtpForm()) return;
    
    setIsLoading(true);
    try {
      const response = await verifyOtpAndSignup();
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('company', JSON.stringify(response.company));
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    }}>
      <div className="row h-100 justify-content-center align-items-center">
        <div className="col-12 col-md-8 col-lg-5 col-xl-4">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4">
              
              {/* Header */}
              <div className="text-center mb-4">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: '50px', height: '50px' }}>
                    <span className="text-white fs-5">💰</span>
                  </div>
                  <div>
                    <h4 className="fw-bold text-dark mb-0">ExpenseFlow</h4>
                    <p className="text-muted small mb-0">Create Account</p>
                  </div>
                </div>
                
                {/* Progress Steps */}
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <div className={`rounded-circle ${step === 1 ? 'bg-primary' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center me-3`} 
                       style={{ width: '30px', height: '30px', fontSize: '0.9rem' }}>
                    1
                  </div>
                  <div className="text-muted" style={{ width: '40px', height: '2px', backgroundColor: '#dee2e6' }}></div>
                  <div className={`rounded-circle ${step === 2 ? 'bg-primary' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center ms-3`} 
                       style={{ width: '30px', height: '30px', fontSize: '0.9rem' }}>
                    2
                  </div>
                </div>
              </div>

              {/* Step 1: Signup Form */}
              {step === 1 && (
                <form onSubmit={handleSendOtp}>
                  <div className="mb-3">
                    <label className="form-label fw-medium small">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <div className="invalid-feedback small">{errors.name}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium small">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <div className="invalid-feedback small">{errors.email}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium small">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Create password"
                    />
                    {errors.password && (
                      <div className="invalid-feedback small">{errors.password}</div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium small">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Confirm password"
                    />
                    {errors.confirmPassword && (
                      <div className="invalid-feedback small">{errors.confirmPassword}</div>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="alert alert-danger small py-2">{errors.submit}</div>
                  )}

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-2 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </button>

                  <div className="text-center">
                    <small className="text-muted">
                      Have an account? <Link to="/login" className="text-decoration-none">Login</Link>
                    </small>
                  </div>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp}>
                  <div className="text-center mb-4">
                    <h6 className="fw-semibold">Verify Your Email</h6>
                    <p className="text-muted small mb-2">
                      OTP sent to <strong>{formData.email}</strong>
                    </p>
                    <small className="text-muted">Enter the 6-digit code we sent to your email</small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium small">OTP Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={handleOtpChange}
                      className={`form-control text-center ${errors.otp ? 'is-invalid' : ''}`}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      style={{ fontSize: '1.1rem', letterSpacing: '0.2rem' }}
                    />
                    {errors.otp && (
                      <div className="invalid-feedback small">{errors.otp}</div>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="alert alert-danger small py-2">{errors.submit}</div>
                  )}

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-2 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Verifying...
                      </>
                    ) : (
                      'Verify & Create Account'
                    )}
                  </button>

                  <div className="text-center">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                    >
                      ← Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;