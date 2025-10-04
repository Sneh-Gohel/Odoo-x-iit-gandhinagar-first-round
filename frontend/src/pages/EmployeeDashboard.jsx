import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function EmployeeDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    toSubmit: 0,
    waitingApproval: 0,
    approved: 0
  });
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: '',
    amount: '',
    currency: 'USD',
    expenseDate: new Date().toISOString().split('T')[0],
    paidBy: '',
    remarks: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // Color Palette
  const colors = {
    columbiaBlue: '#BFD7EA',
    teaGreen: '#CAFFB9',
    wine: '#653239',
    charcoal: '#383F51',
    white: '#FFFFFF'
  };

  const API_URL = 'http://localhost:3000';

  // Fetch initial data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardData();
    fetchCategories();
    fetchCurrencies();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/employee/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await response.json();
      setExpenses(data.expenses || []);
      setStats(data.stats || { toSubmit: 0, waitingApproval: 0, approved: 0 });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['Food', 'Travel', 'Office', 'Entertainment', 'Transport', 'Other']);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/currencies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrencies(data.currencies || []);
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
      setCurrencies(['USD', 'EUR', 'INR', 'GBP', 'JPY', 'CAD', 'AUD']);
    }
  };

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    
    // Navigate to login page
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/employee/expenses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newExpense)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit expense');
      }

      await fetchDashboardData();
      
      setShowExpenseForm(false);
      setNewExpense({
        description: '',
        category: '',
        amount: '',
        currency: 'USD',
        expenseDate: new Date().toISOString().split('T')[0],
        paidBy: '',
        remarks: ''
      });
      
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Draft': 'bg-secondary',
      'Draft Submitted': 'bg-secondary',
      'Waiting Approval': 'bg-warning text-dark',
      'Approved': 'bg-success',
      'Rejected': 'bg-danger',
      'Pending': 'bg-info'
    };
    
    return (
      <span className={`badge ${statusColors[status] || 'bg-info'}`}>
        {status}
      </span>
    );
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container-fluid" style={{ 
      backgroundColor: colors.columbiaBlue, 
      minHeight: '100vh'
    }}>
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 p-0">
          <div className="d-flex flex-column" style={{ 
            backgroundColor: colors.white,
            borderRight: `2px solid ${colors.teaGreen}`,
            height: '100vh',
          }}>
            <div className="p-3 flex-grow-1">
              <h4 className="mb-4" style={{ color: colors.charcoal }}>ExpenseFlow</h4>
              
              {/* User Info */}
              {user && (
                <div className="mb-4 p-3 rounded" style={{ backgroundColor: colors.columbiaBlue }}>
                  <h6 className="mb-1" style={{ color: colors.charcoal }}>Welcome,</h6>
                  <p className="mb-1 fw-bold" style={{ color: colors.wine }}>{user.name || user.username}</p>
                  <small style={{ color: colors.charcoal }}>{user.role}</small>
                </div>
              )}
              
              <div className="mb-4">
                <button 
                  className="btn w-100 mb-3 fw-medium border-0"
                  style={{ 
                    backgroundColor: colors.wine,
                    color: colors.white
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = colors.charcoal}
                  onMouseOut={(e) => e.target.style.backgroundColor = colors.wine}
                  onClick={() => setShowExpenseForm(true)}
                >
                  + New Expense
                </button>
              </div>
              
              <div className="mb-4">
                <h6 className="fw-bold" style={{ color: colors.charcoal }}>Upload</h6>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <small style={{ color: colors.wine }}>• New</small>
                  </li>
                </ul>
              </div>

              <div className="mb-4">
                <div className="p-3 rounded mb-3 border-0" style={{ 
                  backgroundColor: colors.teaGreen
                }}>
                  <h6 className="fw-bold mb-1" style={{ color: colors.charcoal }}>
                    {formatCurrency(stats.toSubmit, 'INR')}
                  </h6>
                  <small style={{ color: colors.wine }}>To submit</small>
                </div>
                
                
                <div className="p-3 rounded border-0" style={{ 
                  backgroundColor: colors.teaGreen
                }}>
                  <h6 className="fw-bold mb-1" style={{ color: colors.charcoal }}>
                    {formatCurrency(stats.waitingApproval, 'INR')}
                  </h6>
                  <small style={{ color: colors.wine }}>Waiting approval</small>
                </div>
                <div className="p-3 mt-3 rounded border-0" style={{ 
                  backgroundColor: colors.teaGreen
                }}>
                  <h6 className="fw-bold mb-1" style={{ color: colors.charcoal }}>
                    {formatCurrency(stats.waitingApproval, 'INR')}
                  </h6>
                  <small style={{ color: colors.wine }}>Approved</small>
                </div>
              </div>
            </div>

            {/* Logout Button at Bottom */}
            <div className="p-3 border-top" style={{ borderColor: colors.teaGreen }}>
              <button 
                className="btn w-100 fw-medium border-1"
                style={{ 
                  borderColor: colors.wine,
                  color: colors.wine,
                  backgroundColor: 'transparent'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = colors.wine;
                  e.target.style.color = colors.white;
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colors.wine;
                }}
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10 p-4">
          {/* Header with Logout for Mobile */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 style={{ color: colors.charcoal }}>Expense Management</h3>
            <div className="text-end">
              <h6 style={{ color: colors.charcoal }}>Employee Dashboard</h6>
              <small style={{ color: colors.wine }}>Track and submit your expenses</small>
              {/* Mobile Logout Button */}
              <div className="d-block d-md-none mt-2">
                <button 
                  className="btn btn-sm border-1"
                  style={{ 
                    borderColor: colors.wine,
                    color: colors.wine,
                    backgroundColor: 'transparent'
                  }}
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-1"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Expense Form Modal */}
          {showExpenseForm && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content border-0" style={{ 
                  backgroundColor: colors.white
                }}>
                  <div className="modal-header border-0" style={{ 
                    backgroundColor: colors.teaGreen
                  }}>
                    <h5 className="modal-title" style={{ color: colors.charcoal }}>New Expense</h5>
                    <button 
                      type="button" 
                      className="btn-close"
                      onClick={() => setShowExpenseForm(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleSubmitExpense}>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Description</label>
                          <input
                            type="text"
                            name="description"
                            value={newExpense.description}
                            onChange={handleInputChange}
                            className="form-control border-1"
                            placeholder="Enter description"
                            style={{ 
                              borderColor: colors.columbiaBlue,
                              color: colors.charcoal
                            }}
                            required
                          />
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Category</label>
                          <select
                            name="category"
                            value={newExpense.category}
                            onChange={handleInputChange}
                            className="form-select border-1"
                            style={{ 
                              borderColor: colors.columbiaBlue,
                              color: colors.charcoal
                            }}
                            required
                          >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Amount</label>
                          <div className="input-group">
                            <input
                              type="number"
                              name="amount"
                              value={newExpense.amount}
                              onChange={handleInputChange}
                              className="form-control border-1"
                              placeholder="Enter amount"
                              style={{ 
                                borderColor: colors.columbiaBlue,
                                color: colors.charcoal
                              }}
                              required
                            />
                            <select
                              name="currency"
                              value={newExpense.currency}
                              onChange={handleInputChange}
                              className="form-select border-1"
                              style={{ 
                                borderColor: colors.columbiaBlue,
                                color: colors.charcoal,
                                width: '100px'
                              }}
                            >
                              {currencies.map(curr => (
                                <option key={curr} value={curr}>{curr}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Expense Date</label>
                          <input
                            type="date"
                            name="expenseDate"
                            value={newExpense.expenseDate}
                            onChange={handleInputChange}
                            className="form-control border-1"
                            style={{ 
                              borderColor: colors.columbiaBlue,
                              color: colors.charcoal
                            }}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Paid By</label>
                          <input
                            type="text"
                            name="paidBy"
                            value={newExpense.paidBy}
                            onChange={handleInputChange}
                            className="form-control border-1"
                            placeholder="Who paid for this?"
                            style={{ 
                              borderColor: colors.columbiaBlue,
                              color: colors.charcoal
                            }}
                            required
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Remarks</label>
                          <textarea
                            name="remarks"
                            value={newExpense.remarks}
                            onChange={handleInputChange}
                            className="form-control border-1"
                            placeholder="Additional remarks"
                            rows="3"
                            style={{ 
                              borderColor: colors.columbiaBlue,
                              color: colors.charcoal
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 d-flex gap-2 justify-content-end">
                        <button
                          type="button"
                          className="btn border-1"
                          onClick={() => setShowExpenseForm(false)}
                          style={{ 
                            borderColor: colors.wine,
                            color: colors.wine,
                            backgroundColor: 'transparent'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = colors.wine;
                            e.target.style.color = colors.white;
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = colors.wine;
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn fw-medium border-0"
                          disabled={isLoading}
                          style={{ 
                            backgroundColor: colors.wine,
                            color: colors.white
                          }}
                          onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = colors.charcoal)}
                          onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = colors.wine)}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Submitting...
                            </>
                          ) : (
                            'Submit Expense'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expenses Table */}
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr style={{ backgroundColor: colors.teaGreen }}>
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Employee</th>
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Description</th>
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Date</th>
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Category</th>
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Paid By</th>
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Remarks</th>
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Amount</th>
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Status</th>
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Approver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(expense => (
                      <tr key={expense.id} style={{ backgroundColor: colors.white }}>
                        <td style={{ color: colors.charcoal, borderColor: colors.columbiaBlue }}>
                          <strong>{expense.employee}</strong>
                        </td>
                        <td style={{ color: colors.charcoal, borderColor: colors.columbiaBlue }}>{expense.description}</td>
                        <td style={{ color: colors.charcoal, borderColor: colors.columbiaBlue }}>
                          {new Date(expense.date).toLocaleDateString('en-US', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td style={{ color: colors.charcoal, borderColor: colors.columbiaBlue }}>{expense.category}</td>
                        <td style={{ color: colors.charcoal, borderColor: colors.columbiaBlue }}>{expense.paidBy}</td>
                        <td style={{ color: colors.charcoal, borderColor: colors.columbiaBlue }}>{expense.remarks}</td>
                        <td style={{ color: colors.charcoal, borderColor: colors.columbiaBlue }}>
                          <strong>{formatCurrency(expense.amount, expense.currency)}</strong>
                        </td>
                        <td style={{ borderColor: colors.columbiaBlue }}>{getStatusBadge(expense.status)}</td>
                        <td style={{ color: colors.wine, borderColor: colors.columbiaBlue }}>
                          <small>{expense.approver}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {expenses.length === 0 && (
                <div className="text-center py-4" style={{ backgroundColor: colors.white }}>
                  <p style={{ color: colors.wine }}>No expenses found. Create your first expense!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;