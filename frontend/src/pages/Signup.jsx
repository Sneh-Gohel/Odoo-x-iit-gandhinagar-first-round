import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Signup() {
  const [formData, setFormData] = useState({
    companyName: '',
    defaultCurrencyCode: 'USD',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
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
    
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.adminName.trim()) newErrors.adminName = 'Admin name is required';
    if (!formData.adminEmail.trim()) newErrors.adminEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) newErrors.adminEmail = 'Invalid email format';
    if (!formData.adminPassword) newErrors.adminPassword = 'Password is required';
    else if (formData.adminPassword.length < 6) newErrors.adminPassword = 'Password must be at least 6 characters';
    if (formData.adminPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.defaultCurrencyCode) newErrors.defaultCurrencyCode = 'Currency is required';
    
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
    const API_URL = 'http://192.168.137.166:5000';
    const response = await fetch(`${API_URL}/api/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: formData.companyName,
        defaultCurrencyCode: formData.defaultCurrencyCode,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send OTP');
    }
    return await response.json();
  };

  const verifyOtpAndSignup = async () => {
    const API_URL = 'http://192.168.137.166:5000';
    const response = await fetch(`${API_URL}/api/users/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: formData.adminEmail,
        otp: otp
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }
    return await response.json();
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateSignupForm()) return;
    
    setIsLoading(true);
    try {
      const result = await sendOtp();
      setStep(2);
      // Show success message if needed
      console.log(result.message);
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
      // Note: The company data might be included in the user object or separately
      if (response.company) {
        localStorage.setItem('company', JSON.stringify(response.company));
      }
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Common currency codes
  const currencyCodes = [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'SGD',
    'MYR', 'IDR', 'THB', 'VND', 'PHP', 'KRW', 'AED', 'SAR', 'QAR', 'OMR'
  ];

  return (
    <div className="container-fluid vh-100" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    }}>
      <div className="row h-100 justify-content-center align-items-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
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
                    <p className="text-muted small mb-0">Create Company Account</p>
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

              {/* Step 1: Company Signup Form */}
              {step === 1 && (
                <form onSubmit={handleSendOtp}>
                  <div className="mb-3">
                    <label className="form-label fw-medium small">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={`form-control ${errors.companyName ? 'is-invalid' : ''}`}
                      placeholder="Enter your company name"
                    />
                    {errors.companyName && (
                      <div className="invalid-feedback small">{errors.companyName}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium small">Default Currency</label>
                    <select
                      name="defaultCurrencyCode"
                      value={formData.defaultCurrencyCode}
                      onChange={handleChange}
                      className={`form-select ${errors.defaultCurrencyCode ? 'is-invalid' : ''}`}
                    >
                      <option value="">Select currency</option>
                      {currencyCodes.map(currency => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                    {errors.defaultCurrencyCode && (
                      <div className="invalid-feedback small">{errors.defaultCurrencyCode}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium small">Admin Name</label>
                    <input
                      type="text"
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleChange}
                      className={`form-control ${errors.adminName ? 'is-invalid' : ''}`}
                      placeholder="Enter admin full name"
                    />
                    {errors.adminName && (
                      <div className="invalid-feedback small">{errors.adminName}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium small">Admin Email</label>
                    <input
                      type="email"
                      name="adminEmail"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      className={`form-control ${errors.adminEmail ? 'is-invalid' : ''}`}
                      placeholder="Enter admin email"
                    />
                    {errors.adminEmail && (
                      <div className="invalid-feedback small">{errors.adminEmail}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium small">Password</label>
                    <input
                      type="password"
                      name="adminPassword"
                      value={formData.adminPassword}
                      onChange={handleChange}
                      className={`form-control ${errors.adminPassword ? 'is-invalid' : ''}`}
                      placeholder="Create password"
                    />
                    {errors.adminPassword && (
                      <div className="invalid-feedback small">{errors.adminPassword}</div>
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
                      OTP sent to <strong>{formData.adminEmail}</strong>
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