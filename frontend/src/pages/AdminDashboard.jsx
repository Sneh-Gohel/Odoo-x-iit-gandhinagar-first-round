import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    role: "Employee",
    manager_id: "",
    email: "",
    password: "defaultpassword123"
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: ""
  });
  const [categories, setCategories] = useState([]);

  // Color Palette
  const colors = {
    columbiaBlue: '#BFD7EA',
    teaGreen: '#CAFFB9',
    wine: '#653239',
    charcoal: '#383F51',
    white: '#FFFFFF'
  };

  const API_URL = 'http://192.168.137.166:5000';

  // Fetch all users and categories
  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users/company-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Transform API response to match our table structure
      const formattedUsers = response.data.users.map(user => ({
        id: user.id,
        name: user.name,
        role: user.role,
        manager: user.manager_name || "-",
        email: user.email,
        manager_id: user.manager_id,
        approvalRules: user.approval_rules || "Default Rules"
      }));
      
      setUsers(formattedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      // Fallback to mock data if API fails
      setUsers([
        { 
          id: 1, 
          name: "John Doe", 
          role: "Manager", 
          manager: "-", 
          email: "pramukhprajapati17@gmail.com",
          approvalRules: "Manager → Finance → Director"
        },
        { 
          id: 2, 
          name: "Sarah Smith", 
          role: "Employee", 
          manager: "John Doe", 
          email: "sarah@company.com",
          approvalRules: "Manager Only"
        },
        { 
          id: 3, 
          name: "Mike Johnson", 
          role: "Employee", 
          manager: "John Doe", 
          email: "mike@company.com",
          approvalRules: "Manager → Director"
        },
        { 
          id: 4, 
          name: "Lisa Brown", 
          role: "Admin", 
          manager: "-", 
          email: "lisa@company.com",
          approvalRules: "Finance Only"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Fallback categories
      setCategories([
        { id: 1, name: 'Travel', description: 'Travel related expenses' },
        { id: 2, name: 'Meals', description: 'Food and dining expenses' },
        { id: 3, name: 'Office Supplies', description: 'Office equipment and supplies' }
      ]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    window.location.href = '/login';
  };

  // Send Password
  const handleSendPassword = async (user) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/admin/users/${user.id}/send-password`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert(`Password sent to ${user.email}`);
    } catch (err) {
      alert("Failed to send password.");
      console.error(err);
    }
  };

  // Add New User
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Prepare the data according to your API
      const userData = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        manager_id: newUser.manager_id || null
      };

      const response = await axios.post(`${API_URL}/api/users/add-user`, userData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add the new user to the list with proper formatting
      const addedUser = response.data.user;
      const formattedUser = {
        id: addedUser.id,
        name: addedUser.name,
        role: addedUser.role,
        manager: addedUser.manager_name || "-",
        email: addedUser.email,
        manager_id: addedUser.manager_id,
        approvalRules: "Default Rules"
      };
      
      setUsers(prev => [...prev, formattedUser]);
      setShowAddUser(false);
      alert(`User ${newUser.name} added successfully!`);
      
      // Reset form
      setNewUser({ 
        name: "", 
        role: "Employee", 
        manager_id: "", 
        email: "", 
        password: "defaultpassword123" 
      });
    } catch (err) {
      console.error("Error adding user:", err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("Error adding user. Please try again.");
      }
    }
  };

  // Add New Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const categoryData = {
        name: newCategory.name,
        description: newCategory.description
      };

      const response = await axios.post(`${API_URL}/api/categories`, categoryData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Add the new category to the list
      const addedCategory = response.data.category;
      setCategories(prev => [...prev, addedCategory]);
      setShowAddCategory(false);
      alert(`Category "${newCategory.name}" added successfully!`);
      
      // Reset form
      setNewCategory({
        name: ""
      });
    } catch (err) {
      console.error("Error adding category:", err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("Error adding category. Please try again.");
      }
    }
  };

  // Show History
  const handleShowHistory = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/users/${user.id}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSelectedUser({ 
        ...user, 
        history: response.data.history || response.data 
      });
      setShowHistory(true);
    } catch (err) {
      console.error("Failed to load history:", err);
      // Fallback to mock data
      const mockHistory = [
        { date: "2025-01-15", description: "Office Supplies", amount: "$150", status: "Approved" },
        { date: "2025-01-10", description: "Client Dinner", amount: "$200", status: "Pending" },
        { date: "2025-01-05", description: "Travel Expense", amount: "$350", status: "Approved" },
        { date: "2024-12-20", description: "Software Subscription", amount: "$89", status: "Approved" }
      ];
      setSelectedUser({ ...user, history: mockHistory });
      setShowHistory(true);
    }
  };

  // Show Approval Rules
  const handleShowRules = (user) => {
    setSelectedUser(user);
    setShowRules(true);
  };

  // Save Approval Rule for specific user
  const handleSaveUserRule = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData(e.target);
      const ruleData = {
        userId: selectedUser.id,
        ruleName: formData.get('userRuleName'),
        minApprovalPercentage: parseInt(formData.get('userMinApproval')),
        isManagerApprover: formData.get('userManagerApprover') === 'on',
        sequence: formData.get('userApprovalSequence'),
        autoApproveLimit: parseFloat(formData.get('autoApproveLimit'))
      };

      // Update user's approval rules in the state
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, approvalRules: ruleData.ruleName }
          : user
      ));

      setShowRules(false);
      alert(`Approval rules updated for ${selectedUser.name}!`);
      
    } catch (err) {
      alert("Error saving user rules.");
      console.error(err);
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'Admin':
        return 'bg-danger';
      case 'Manager':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return 'bg-success';
      case 'Pending':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  };

  // Get available managers for dropdown
  const availableManagers = users.filter(user => user.role === 'Manager');

  return (
    <div style={{ backgroundColor: colors.columbiaBlue, minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg shadow-sm" style={{ backgroundColor: colors.white, borderBottom: `2px solid ${colors.teaGreen}` }}>
        <div className="container-fluid">
          <span className="navbar-brand fw-bold mb-0" style={{ color: colors.charcoal, fontSize: '1.5rem' }}>
            Admin Dashboard
          </span>
          
          <div className="d-flex align-items-center">
            <span className="me-3 d-none d-md-block" style={{ color: colors.charcoal }}>
              Welcome, <strong>Admin</strong>
            </span>
            <button 
              className="btn btn-outline-secondary btn-sm"
              style={{ 
                borderColor: colors.wine,
                color: colors.wine
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
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid py-4">
        <div className="row">
          {/* USERS SECTION - Full width without rules section */}
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header border-0 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 py-3"
                   style={{ backgroundColor: colors.teaGreen }}>
                <h5 className="card-title mb-0 fw-bold" style={{ color: colors.charcoal }}>
                  <i className="bi bi-people-fill me-2"></i>
                  User Management ({users.length} users)
                </h5>
                <button
                  className="btn border-0 fw-medium"
                  style={{ 
                    backgroundColor: colors.wine,
                    color: colors.white
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = colors.charcoal}
                  onMouseOut={(e) => e.target.style.backgroundColor = colors.wine}
                  onClick={() => setShowAddUser(true)}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Add New User
                </button>
              </div>
              
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: colors.wine }}></div>
                    <p className="mt-2 mb-0" style={{ color: colors.charcoal }}>Loading users...</p>
                  </div>
                ) : (
                  <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <table className="table table-hover mb-0">
                      <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                        <tr>
                          <th style={{ color: colors.charcoal }}>User</th>
                          <th style={{ color: colors.charcoal }}>Role</th>
                          <th className="d-none d-md-table-cell" style={{ color: colors.charcoal }}>Manager</th>
                          <th className="d-none d-lg-table-cell" style={{ color: colors.charcoal }}>Email</th>
                          <th style={{ color: colors.charcoal }}>Approval Rules</th>
                          <th style={{ color: colors.charcoal }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                     style={{ 
                                       width: '40px', 
                                       height: '40px',
                                       backgroundColor: colors.wine,
                                       color: colors.white,
                                       fontSize: '0.9rem',
                                       fontWeight: 'bold'
                                     }}>
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <div style={{ color: colors.charcoal, fontWeight: '500' }}>
                                    {user.name}
                                  </div>
                                  <small className="text-muted d-block d-lg-none">
                                    {user.email}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${getRoleBadge(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="d-none d-md-table-cell" style={{ color: colors.charcoal }}>
                              {user.manager || "-"}
                            </td>
                            <td className="d-none d-lg-table-cell" style={{ color: colors.charcoal }}>
                              {user.email}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm border-0 text-decoration-underline p-0"
                                style={{ 
                                  color: colors.wine,
                                  backgroundColor: 'transparent',
                                  fontSize: '0.8rem'
                                }}
                                onClick={() => handleShowRules(user)}
                                title="Click to view/edit approval rules"
                              >
                                {user.approvalRules}
                              </button>
                            </td>
                            <td>
                              <div className="d-flex flex-wrap gap-1">
                                <button
                                  className="btn btn-sm border-0"
                                  style={{ 
                                    backgroundColor: colors.teaGreen,
                                    color: colors.charcoal,
                                    fontSize: '0.75rem'
                                  }}
                                  onClick={() => handleSendPassword(user)}
                                >
                                  <i className="bi bi-send me-1"></i>
                                  <span className="d-none d-sm-inline">Password</span>
                                </button>
                                <button
                                  className="btn btn-sm border-0"
                                  style={{ 
                                    backgroundColor: colors.columbiaBlue,
                                    color: colors.charcoal,
                                    fontSize: '0.75rem'
                                  }}
                                  onClick={() => handleShowHistory(user)}
                                >
                                  <i className="bi bi-clock-history me-1"></i>
                                  <span className="d-none d-sm-inline">History</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats and Add Categories below the table */}
            <div className="row g-4 mt-4">
              {/* Quick Stats Card */}
              <div className="col-12 col-md-6">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-header border-0 py-3"
                       style={{ backgroundColor: colors.teaGreen }}>
                    <h5 className="card-title mb-0 fw-bold" style={{ color: colors.charcoal }}>
                      <i className="bi bi-graph-up me-2"></i>
                      Quick Stats
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row text-center g-2">
                      <div className="col-4">
                        <div className="border rounded p-2" style={{ borderColor: colors.columbiaBlue }}>
                          <h4 className="mb-0 fw-bold" style={{ color: colors.wine }}>{users.length}</h4>
                          <small style={{ color: colors.charcoal }}>Total Users</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="border rounded p-2" style={{ borderColor: colors.columbiaBlue }}>
                          <h4 className="mb-0 fw-bold" style={{ color: colors.wine }}>
                            {users.filter(u => u.role === 'Manager').length}
                          </h4>
                          <small style={{ color: colors.charcoal }}>Managers</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="border rounded p-2" style={{ borderColor: colors.columbiaBlue }}>
                          <h4 className="mb-0 fw-bold" style={{ color: colors.wine }}>
                            {users.filter(u => u.role === 'Admin').length}
                          </h4>
                          <small style={{ color: colors.charcoal }}>Admins</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Categories Card */}
              <div className="col-12 col-md-6">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-header border-0 py-3"
                       style={{ backgroundColor: colors.teaGreen }}>
                    <h5 className="card-title mb-0 fw-bold" style={{ color: colors.charcoal }}>
                      <i className="bi bi-tags me-2"></i>
                      Expense Categories
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <button
                        className="btn w-100 fw-medium border-0 mb-3"
                        style={{ 
                          backgroundColor: colors.wine,
                          color: colors.white
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = colors.charcoal}
                        onMouseOut={(e) => e.target.style.backgroundColor = colors.wine}
                        onClick={() => setShowAddCategory(true)}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add New Category
                      </button>
                    </div>
                    
                    <div className="list-group list-group-flush">
                      {categories.slice(0, 5).map(category => (
                        <div key={category.id} className="list-group-item px-0 border-0 d-flex align-items-center">
                          <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                               style={{ 
                                 width: '32px', 
                                 height: '32px',
                                 backgroundColor: colors.teaGreen,
                                 color: colors.charcoal,
                                 fontSize: '0.7rem'
                               }}>
                            <i className="bi bi-tag"></i>
                          </div>
                          <div className="flex-grow-1">
                            <small className="d-block fw-medium" style={{ color: colors.charcoal }}>
                              {category.name}
                            </small>
                            <small className="text-muted">
                              {category.description || 'No description'}
                            </small>
                          </div>
                        </div>
                      ))}
                      {categories.length === 0 && (
                        <div className="text-center py-3">
                          <small style={{ color: colors.wine }}>No categories found</small>
                        </div>
                      )}
                      {categories.length > 5 && (
                        <div className="text-center mt-2">
                          <small style={{ color: colors.wine }}>
                            +{categories.length - 5} more categories
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {showAddUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0" style={{ backgroundColor: colors.teaGreen }}>
                <h5 className="modal-title fw-bold" style={{ color: colors.charcoal }}>
                  <i className="bi bi-person-plus me-2"></i>
                  Add New User
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowAddUser(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddUser}>
                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      required
                      style={{ 
                        borderColor: colors.columbiaBlue,
                        color: colors.charcoal
                      }}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                      style={{ 
                        borderColor: colors.columbiaBlue,
                        color: colors.charcoal
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Role</label>
                    <select
                      className="form-select"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value, manager_id: e.target.value === 'Manager' ? '' : newUser.manager_id })}
                      style={{ 
                        borderColor: colors.columbiaBlue,
                        color: colors.charcoal
                      }}
                    >
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  
                  {newUser.role === 'Employee' && (
                    <div className="mb-3">
                      <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Manager</label>
                      <select
                        className="form-select"
                        value={newUser.manager_id}
                        onChange={(e) => setNewUser({ ...newUser, manager_id: e.target.value })}
                        style={{ 
                          borderColor: colors.columbiaBlue,
                          color: colors.charcoal
                        }}
                      >
                        <option value="">Select Manager</option>
                        {availableManagers.map(manager => (
                          <option key={manager.id} value={manager.id}>
                            {manager.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: colors.charcoal }}>
                      Password
                      <small className="text-muted ms-1">(Will be sent to user's email)</small>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                      style={{ 
                        borderColor: colors.columbiaBlue,
                        color: colors.charcoal
                      }}
                      placeholder="Enter temporary password"
                    />
                  </div>
                  
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn border-1"
                      style={{ 
                        borderColor: colors.wine,
                        color: colors.wine,
                        backgroundColor: 'transparent'
                      }}
                      onClick={() => setShowAddUser(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn border-0"
                      style={{
                        backgroundColor: colors.wine,
                        color: colors.white
                      }}
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Add User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {showAddCategory && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0" style={{ backgroundColor: colors.teaGreen }}>
                <h5 className="modal-title fw-bold" style={{ color: colors.charcoal }}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Add New Category
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowAddCategory(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddCategory}>
                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: colors.charcoal }}>Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      required
                      style={{ 
                        borderColor: colors.columbiaBlue,
                        color: colors.charcoal
                      }}
                      placeholder="Enter category name"
                    />
                  </div>
                  
                  
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn border-1"
                      style={{ 
                        borderColor: colors.wine,
                        color: colors.wine,
                        backgroundColor: 'transparent'
                      }}
                      onClick={() => setShowAddCategory(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn border-0"
                      style={{
                        backgroundColor: colors.wine,
                        color: colors.white
                      }}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL RULES MODAL */}
      {showRules && selectedUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0" style={{ backgroundColor: colors.teaGreen }}>
                <h5 className="modal-title fw-bold" style={{ color: colors.charcoal }}>
                  <i className="bi bi-diagram-3 me-2"></i>
                  Approval Rules for {selectedUser.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowRules(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveUserRule}>
                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: colors.charcoal }}>
                      Rule Name
                    </label>
                    <input 
                      type="text" 
                      name="userRuleName"
                      className="form-control"
                      placeholder="Manager → Finance → Director"
                      defaultValue={selectedUser.approvalRules}
                      style={{ 
                        borderColor: colors.columbiaBlue,
                        color: colors.charcoal
                      }}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: colors.charcoal }}>
                      Minimum Approval Percentage
                    </label>
                    <input 
                      type="number" 
                      name="userMinApproval"
                      className="form-control"
                      placeholder="60"
                      min="0"
                      max="100"
                      defaultValue="60"
                      style={{ 
                        borderColor: colors.columbiaBlue,
                        color: colors.charcoal
                      }}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: colors.charcoal }}>
                      Auto-approve Limit ($)
                    </label>
                    <input 
                      type="number" 
                      name="autoApproveLimit"
                      className="form-control"
                      placeholder="100"
                      min="0"
                      step="0.01"
                      defaultValue="100"
                      style={{ 
                        borderColor: colors.columbiaBlue,
                        color: colors.charcoal
                      }}
                    />
                    <small className="text-muted">Expenses below this amount will be auto-approved</small>
                  </div>

                  <div className="mb-3 form-check">
                    <input 
                      type="checkbox" 
                      name="userManagerApprover"
                      className="form-check-input"
                      id="userManagerApprover"
                      defaultChecked
                      style={{ 
                        borderColor: colors.columbiaBlue
                      }}
                    />
                    <label className="form-check-label" htmlFor="userManagerApprover" style={{ color: colors.charcoal }}>
                      Require Manager Approval
                    </label>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: colors.charcoal }}>
                      Approval Sequence
                    </label>
                    <select 
                      name="userApprovalSequence"
                      className="form-select"
                      defaultValue="Manager → Finance → Director"
                      style={{ 
                        borderColor: colors.columbiaBlue,
                        color: colors.charcoal
                      }}
                      required
                    >
                      <option value="Manager Only">Manager Only</option>
                      <option value="Manager → Finance">Manager → Finance</option>
                      <option value="Manager → Finance → Director">Manager → Finance → Director</option>
                      <option value="Finance Only">Finance Only</option>
                      <option value="Director Only">Director Only</option>
                    </select>
                  </div>

                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn border-1"
                      style={{ 
                        borderColor: colors.wine,
                        color: colors.wine,
                        backgroundColor: 'transparent'
                      }}
                      onClick={() => setShowRules(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn border-0"
                      style={{
                        backgroundColor: colors.wine,
                        color: colors.white
                      }}
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Save Rules
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistory && selectedUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0" style={{ backgroundColor: colors.teaGreen }}>
                <h5 className="modal-title fw-bold" style={{ color: colors.charcoal }}>
                  <i className="bi bi-clock-history me-2"></i>
                  {selectedUser.name}'s Expense History
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowHistory(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th style={{ color: colors.charcoal }}>Date</th>
                        <th style={{ color: colors.charcoal }}>Description</th>
                        <th style={{ color: colors.charcoal }}>Amount</th>
                        <th style={{ color: colors.charcoal }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.history?.length > 0 ? (
                        selectedUser.history.map((h, i) => (
                          <tr key={i}>
                            <td style={{ color: colors.charcoal }}>{h.date}</td>
                            <td style={{ color: colors.charcoal }}>{h.description}</td>
                            <td style={{ color: colors.charcoal, fontWeight: '500' }}>{h.amount}</td>
                            <td>
                              <span className={`badge ${getStatusBadge(h.status)}`}>
                                {h.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-4" style={{ color: colors.charcoal }}>
                            <i className="bi bi-inbox display-4 d-block mb-2" style={{ color: colors.columbiaBlue }}></i>
                            No history found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="d-flex justify-content-end mt-3">
                  <button
                    className="btn border-0"
                    style={{
                      backgroundColor: colors.wine,
                      color: colors.white,
                      padding: '0.5rem 1.5rem'
                    }}
                    onClick={() => setShowHistory(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}