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
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    category_id: '',
    original_amount: '',
    original_currency_code: 'USD',
    receipt_url: '',
    policy_id: 1
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

  const API_URL = 'http://192.168.137.166:5000';

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
        // Expecting categories in format: [{id: 1, name: 'Travel'}, {id: 2, name: 'Food'}, ...]
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories with IDs
      setCategories([
        { id: 1, name: 'Travel' },
        { id: 2, name: 'Food' },
        { id: 3, name: 'Office Supplies' },
        { id: 4, name: 'Entertainment' },
        { id: 5, name: 'Transport' },
        { id: 6, name: 'Other' }
      ]);
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
      
      // Format data for submission - already in correct format
      const expenseData = {
        ...newExpense,
        original_amount: parseFloat(newExpense.original_amount) || 0,
        category_id: parseInt(newExpense.category_id) || 1
      };

      const response = await fetch(`${API_URL}/api/employee/expenses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit expense');
      }

      await fetchDashboardData();
      
      setShowExpenseForm(false);
      setNewExpense({
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
        category_id: '',
        original_amount: '',
        original_currency_code: 'USD',
        receipt_url: '',
        policy_id: 1
      });
      
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form has data before closing
  const handleCloseExpenseForm = () => {
    const hasData = newExpense.description || newExpense.category_id || newExpense.original_amount;
    
    if (hasData) {
      setShowDraftAlert(true);
    } else {
      setShowExpenseForm(false);
    }
  };

  // Save as draft
  const handleSaveDraft = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Format data exactly as required by the API
      const draftData = {
        description: newExpense.description,
        expense_date: newExpense.expense_date,
        category_id: parseInt(newExpense.category_id) || 1,
        original_amount: parseFloat(newExpense.original_amount) || 0,
        original_currency_code: newExpense.original_currency_code,
        receipt_url: newExpense.receipt_url || '',
        policy_id: parseInt(newExpense.policy_id) || 1
      };

      console.log('Saving draft with data:', draftData);

      const response = await fetch(`${API_URL}/api/claims/draft`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(draftData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save draft');
      }

      const result = await response.json();
      
      // Close both modals and reset form
      setShowDraftAlert(false);
      setShowExpenseForm(false);
      setNewExpense({
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
        category_id: '',
        original_amount: '',
        original_currency_code: 'USD',
        receipt_url: '',
        policy_id: 1
      });
      
      alert('Expense saved as draft successfully!');
      
    } catch (error) {
      console.error('Error saving draft:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Discard without saving
  const handleDiscardDraft = () => {
    setShowDraftAlert(false);
    setShowExpenseForm(false);
    setNewExpense({
      description: '',
      expense_date: new Date().toISOString().split('T')[0],
      category_id: '',
      original_amount: '',
      original_currency_code: 'USD',
      receipt_url: '',
      policy_id: 1
    });
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
                      onClick={handleCloseExpenseForm}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleSubmitExpense}>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Description *</label>
                          <input
                            type="text"
                            name="description"
                            value={newExpense.description}
                            onChange={handleInputChange}
                            className="form-control border-1"
                            placeholder="Enter expense description"
                            style={{ 
                              borderColor: colors.columbiaBlue,
                              color: colors.charcoal
                            }}
                            required
                          />
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Expense Date *</label>
                          <input
                            type="date"
                            name="expense_date"
                            value={newExpense.expense_date}
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
                          <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Category *</label>
                          <select
                            name="category_id"
                            value={newExpense.category_id}
                            onChange={handleInputChange}
                            className="form-select border-1"
                            style={{ 
                              borderColor: colors.columbiaBlue,
                              color: colors.charcoal
                            }}
                            required
                          >
                            <option value="">Select Category</option>
                              <option value="flights">Flights</option>
                              <option value="hotels">Hotels</option>
                              <option value="meals">Meals</option>
                              <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Amount *</label>
                          <div className="input-group">
                            <input
                              type="number"
                              name="original_amount"
                              value={newExpense.original_amount}
                              onChange={handleInputChange}
                              className="form-control border-1"
                              placeholder="Enter amount"
                              style={{ 
                                borderColor: colors.columbiaBlue,
                                color: colors.charcoal
                              }}
                              required
                              step="0.01"
                              min="0"
                            />
                            <select
                              name="original_currency_code"
                              value={newExpense.original_currency_code}
                              onChange={handleInputChange}
                              className="form-select border-1"
                              style={{ 
                                borderColor: colors.columbiaBlue,
                                color: colors.charcoal,
                                width: '100px'
                              }}
                            >
                              <option key="usd" value="USD">USD</option>
                              <option key="eur" value="EUR">EUR</option>
                              <option key="jpy" value="JPY">JPY</option>
                              <option key="inr" value="INR">INR</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Policy ID</label>
                          <input
                            type="number"
                            name="policy_id"
                            value={newExpense.policy_id}
                            onChange={handleInputChange}
                            className="form-control border-1"
                            placeholder="Policy ID"
                            style={{ 
                              borderColor: colors.columbiaBlue,
                              color: colors.charcoal
                            }}
                            min="1"
                          />
                          <small className="text-muted">Leave as 1 for default policy</small>
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Receipt URL</label>
                          <input
                            type="url"
                            name="receipt_url"
                            value={newExpense.receipt_url}
                            onChange={handleInputChange}
                            className="form-control border-1"
                            placeholder="https://example.com/receipts/your-receipt.pdf"
                            style={{ 
                              borderColor: colors.columbiaBlue,
                              color: colors.charcoal
                            }}
                          />
                          <small className="text-muted">Optional: Link to receipt or document</small>
                        </div>
                      </div>

                      <div className="mt-4 d-flex gap-2 justify-content-end">
                        <button
                          type="button"
                          className="btn border-1"
                          onClick={handleCloseExpenseForm}
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

          {/* Draft Confirmation Modal */}
          {showDraftAlert && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0" style={{ 
                  backgroundColor: colors.white
                }}>
                  <div className="modal-header border-0" style={{ 
                    backgroundColor: colors.teaGreen
                  }}>
                    <h5 className="modal-title" style={{ color: colors.charcoal }}>Save as Draft?</h5>
                    <button 
                      type="button" 
                      className="btn-close"
                      onClick={handleDiscardDraft}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p style={{ color: colors.charcoal }}>
                      You have unsaved changes. Would you like to save this expense as a draft?
                    </p>
                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        type="button"
                        className="btn border-1"
                        onClick={handleDiscardDraft}
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
                        No, Discard
                      </button>
                      <button
                        type="button"
                        className="btn fw-medium border-0"
                        onClick={handleSaveDraft}
                        style={{ 
                          backgroundColor: colors.wine,
                          color: colors.white
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = colors.charcoal}
                        onMouseOut={(e) => e.target.style.backgroundColor = colors.wine}
                      >
                        Yes, Save as Draft
                      </button>
                    </div>
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
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Description</th>
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Date</th>
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Category</th>
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Amount</th>
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Currency</th>
                      <th style={{ color: colors.charcoal, borderColor: colors.columbiaBlue, fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(expense => (
                      <tr key={expense.id} style={{ backgroundColor: colors.white }}>
                        <td style={{ color: colors.charcoal, borderColor: colors.columbiaBlue }}>
                          <strong>{expense.description}</strong>
                          {expense.receipt_url && (
                            <div>
                              <small>
                                <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer" style={{ color: colors.wine }}>
                                  View Receipt
                                </a>
                              </small>
                            </div>
                          )}
                        </td>
                        <td style={{ color: colors.charcoal, borderColor: colors.columbiaBlue }}>
                          {new Date(expense.expense_date).toLocaleDateString('en-US', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td style={{ color: colors.charcoal, borderColor: colors.columbiaBlue }}>
                          {categories.find(cat => cat.id === expense.category_id)?.name || expense.category_id}
                        </td>
                        <td style={{ color: colors.charcoal, borderColor: colors.columbiaBlue }}>
                          <strong>{expense.original_amount}</strong>
                        </td>
                        <td style={{ color: colors.charcoal, borderColor: colors.columbiaBlue }}>
                          {expense.original_currency_code}
                        </td>
                        <td style={{ borderColor: colors.columbiaBlue }}>{getStatusBadge(expense.status)}</td>
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