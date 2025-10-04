import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Password
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general messages
    if (message) {
      setMessage('');
    }
  };

  // Step 1: Validate email and send OTP
  const validateEmailForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2: Validate new password and OTP
  const validateResetForm = () => {
    const newErrors = {};
    
    if (!formData.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    } else if (!/^\d+$/.test(formData.otp)) {
      newErrors.otp = 'OTP must contain only numbers';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // API call to request password reset OTP
  const requestPasswordResetOtp = async (email) => {
    const API_URL = 'http://192.168.137.166:5000';
    
    const response = await fetch(`${API_URL}/api/users/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send password reset OTP');
    }

    return await response.json();
  };

  // API call to reset password with OTP verification
  const resetPassword = async (email, newPassword, otp) => {
    const API_URL = 'http://192.168.137.166:5000';
    
    const response = await fetch(`${API_URL}/api/users/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        newPassword,
        otp 
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Password reset failed');
    }

    return await response.json();
  };

  // Handle Step 1: Request Password Reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    
    if (!validateEmailForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await requestPasswordResetOtp(formData.email);
      setMessage(response.message || 'If an account with this email exists, a password reset OTP has been sent.');
      setStep(2); // Move to password reset step
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validateResetForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await resetPassword(formData.email, formData.newPassword, formData.otp);
      setMessage(response.message || 'Password has been reset successfully.');
      
      // Redirect to login after successful password reset
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    
    try {
      const response = await requestPasswordResetOtp(formData.email);
      setMessage('If an account with this email exists, a new password reset OTP has been sent.');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Progress Steps
  const getStepProgress = () => {
    return (
      <div className="d-flex justify-content-center align-items-center mb-4">
        <div className={`rounded-circle ${step >= 1 ? 'bg-primary' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center me-3`} 
             style={{ width: '35px', height: '35px', fontSize: '0.9rem' }}>
          1
        </div>
        <div className={`${step >= 2 ? 'bg-primary' : 'bg-secondary'}`} style={{ width: '60px', height: '2px' }}></div>
        <div className={`rounded-circle ${step >= 2 ? 'bg-primary' : 'bg-secondary'} text-white d-flex align-items-center justify-content-center ms-3`} 
             style={{ width: '35px', height: '35px', fontSize: '0.9rem' }}>
          2
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid vh-100" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    }}>
      <div className="row h-100 justify-content-center align-items-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4 p-md-5">
              
              {/* Header Section */}
              <div className="text-center mb-4">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <div 
                    className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: '50px', height: '50px' }}
                  >
                    <span className="text-white fs-4">🔒</span>
                  </div>
                  <h1 className="h3 fw-bold text-dark mb-0">ExpenseFlow</h1>
                </div>
                <p className="text-muted">Reset Your Password</p>
              </div>

              {/* Progress Steps */}
              {getStepProgress()}

              {/* Success Message */}
              {message && (
                <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-info'} d-flex align-items-center`} role="alert">
                  <div>{message}</div>
                </div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <div>{errors.submit}</div>
                </div>
              )}

              {/* Step 1: Email Input */}
              {step === 1 && (
                <form onSubmit={handleRequestOtp}>
                  <div className="text-center mb-4">
                    <p className="text-muted">
                      Enter your email address and we'll send you an OTP to reset your password.
                    </p>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="Enter your registered email"
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <div className="invalid-feedback d-block">
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className={`btn btn-primary w-100 py-2 fw-semibold ${isLoading ? 'disabled' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: Reset Password with OTP */}
              {step === 2 && (
                <form onSubmit={handleResetPassword}>
                  <div className="text-center mb-4">
                    <p className="text-muted">
                      We sent a 6-digit OTP to <strong>{formData.email}</strong>
                    </p>
                    <small className="text-muted">Enter the OTP and your new password below</small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="otp" className="form-label fw-semibold">
                      OTP Code
                    </label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      className={`form-control text-center ${errors.otp ? 'is-invalid' : ''}`}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      style={{ fontSize: '1.1rem', letterSpacing: '0.2rem' }}
                      disabled={isLoading}
                    />
                    {errors.otp && (
                      <div className="invalid-feedback d-block">
                        {errors.otp}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label fw-semibold">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                      placeholder="Enter new password (min. 6 characters)"
                      disabled={isLoading}
                    />
                    {errors.newPassword && (
                      <div className="invalid-feedback d-block">
                        {errors.newPassword}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Confirm new password"
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <div className="invalid-feedback d-block">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    className={`btn btn-primary w-100 py-2 fw-semibold ${isLoading ? 'disabled' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>

                  <div className="text-center mt-3">
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

              {/* Footer */}
              <div className="mt-4 text-center">
                <p className="text-muted mb-0">
                  Remember your password? <Link to="/login" className="text-decoration-none">Back to Login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;