import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ManagerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });

  const colors = {
    columbiaBlue: '#BFD7EA',
    teaGreen: '#CAFFB9',
    wine: '#653239',
    charcoal: '#383F51',
    white: '#FFFFFF',
    maize: '#FFF689'
  };

  const staticRequests = [
    {
      id: 1,
      subject: "Team Lunch at Barbeque Nation",
      owner: "Rajesh Kumar",
      category: "Meals & Entertainment",
      status: "Pending",
      total: 8500,
      timeAgo: "2 days ago",
      currency: "INR",
      description: "Team lunch with sales department",
      submittedDate: "2024-01-15"
    },
    {
      id: 2,
      subject: "Ola Cab to Client Office",
      owner: "Priya Sharma",
      category: "Transportation",
      status: "Pending",
      total: 1200,
      timeAgo: "6 hours ago",
      currency: "INR",
      description: "Round trip to client meeting in Andheri",
      submittedDate: "2024-01-16"
    },
    {
      id: 3,
      subject: "Printer Toner Cartridges",
      owner: "Amit Patel",
      category: "Office Supplies",
      status: "Approved",
      total: 4500,
      timeAgo: "1 week ago",
      currency: "INR",
      description: "Replacement toner for office printers",
      submittedDate: "2024-01-10"
    },
    {
      id: 4,
      subject: "Tech Conference Registration",
      owner: "Neha Gupta",
      category: "Professional Development",
      status: "Rejected",
      total: 15000,
      timeAgo: "3 days ago",
      currency: "INR",
      description: "India Tech Summit 2024 registration",
      submittedDate: "2024-01-13"
    },
    {
      id: 5,
      subject: "Hotel Stay - Bangalore Trip",
      owner: "Vikram Singh",
      category: "Travel",
      status: "Pending",
      total: 12000,
      timeAgo: "1 day ago",
      currency: "INR",
      description: "3-night stay for client presentation",
      submittedDate: "2024-01-15"
    },
    {
      id: 6,
      subject: "Software License Renewal",
      owner: "Anjali Mehta",
      category: "Technology",
      status: "Approved",
      total: 25000,
      timeAgo: "2 weeks ago",
      currency: "INR",
      description: "Annual subscription for accounting software",
      submittedDate: "2024-01-05"
    },
    {
      id: 7,
      subject: "Diwali Party Catering",
      owner: "Sanjay Reddy",
      category: "Meals & Entertainment",
      status: "Pending",
      total: 35000,
      timeAgo: "4 days ago",
      currency: "INR",
      description: "Office Diwali celebration catering",
      submittedDate: "2024-01-14"
    },
    {
      id: 8,
      subject: "Flight Tickets - Delhi Conference",
      owner: "Deepika Iyer",
      category: "Travel",
      status: "Approved",
      total: 18500,
      timeAgo: "5 days ago",
      currency: "INR",
      description: "Round trip flights for business conference",
      submittedDate: "2024-01-11"
    }
  ];

  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRequests(staticRequests);
        calculateStats(staticRequests);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch approval requests");
        setRequests(staticRequests);
        calculateStats(staticRequests);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const calculateStats = (requests) => {
    const pending = requests.filter(req => req.status === "Pending").length;
    const approved = requests.filter(req => req.status === "Approved").length;
    const rejected = requests.filter(req => req.status === "Rejected").length;
    const totalAmount = requests.reduce((sum, req) => sum + req.total, 0);
    
    setStats({
      pending,
      approved,
      rejected,
      totalAmount
    });
  };

  const handleApprove = async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRequests(prev =>
        prev.map(req => req.id === id ? { ...req, status: "Approved" } : req)
      );
      const updatedRequests = requests.map(req => 
        req.id === id ? { ...req, status: "Approved" } : req
      );
      calculateStats(updatedRequests);
    } catch {
      alert("Failed to approve request.");
    }
  };

  const handleReject = async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRequests(prev =>
        prev.map(req => req.id === id ? { ...req, status: "Rejected" } : req)
      );
      const updatedRequests = requests.map(req => 
        req.id === id ? { ...req, status: "Rejected" } : req
      );
      calculateStats(updatedRequests);
    } catch {
      alert("Failed to reject request.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    window.location.href = "/login";
  };

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return {
          class: 'bg-warning text-dark',
          icon: '⏳'
        };
      case 'approved':
        return {
          class: 'bg-success text-white',
          icon: '✅'
        };
      case 'rejected':
        return {
          class: 'bg-danger text-white',
          icon: '❌'
        };
      default:
        return {
          class: 'bg-secondary text-white',
          icon: '📝'
        };
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Meals & Entertainment': '🍽️',
      'Transportation': '🚗',
      'Office Supplies': '📦',
      'Professional Development': '🎓',
      'Travel': '✈️',
      'Technology': '💻'
    };
    return icons[category] || '📋';
  };

  const formatIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{ 
      backgroundColor: colors.columbiaBlue, 
      minHeight: '100vh' 
    }}>
      <nav className="navbar navbar-expand-lg shadow-sm" style={{ 
        backgroundColor: colors.charcoal 
      }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <div className="navbar-brand d-flex align-items-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                   style={{ 
                     width: '45px', 
                     
                     height: '45px',
                     backgroundColor: colors.wine,
                     color: colors.white
                   }}>
                <span style={{ fontSize: '1.2rem' }}>PR</span>
              </div>
              <div>
                <h5 className="mb-0 text-white fw-bold">Manager Dashboard</h5>
                <small className="text-light opacity-75">Expense Approval Center</small>
              </div>
            </div>
          </div>
          
          <div className="d-flex align-items-center">
            <div className="text-end me-3">
              <small className="text-white opacity-75 d-block">Logged in as</small>
              <strong className="text-white">Pramukh Prajapati</strong>
            </div>
            <button 
              className="btn border-0 fw-medium"
              style={{ 
                backgroundColor: colors.wine,
                color: colors.white
              }}
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row g-4">
          <div className="col-12">
            <div className="row g-3">
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.white }}>
                  <div className="card-body text-center">
                    <div className="mb-2" style={{ fontSize: '2rem' }}>📥</div>
                    <h3 className="fw-bold mb-1" style={{ color: colors.wine }}>{stats.pending}</h3>
                    <small style={{ color: colors.charcoal }}>Pending Requests</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.white }}>
                  <div className="card-body text-center">
                    <div className="mb-2" style={{ fontSize: '2rem' }}>✅</div>
                    <h3 className="fw-bold mb-1" style={{ color: colors.wine }}>{stats.approved}</h3>
                    <small style={{ color: colors.charcoal }}>Approved</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.white }}>
                  <div className="card-body text-center">
                    <div className="mb-2" style={{ fontSize: '2rem' }}>❌</div>
                    <h3 className="fw-bold mb-1" style={{ color: colors.wine }}>{stats.rejected}</h3>
                    <small style={{ color: colors.charcoal }}>Rejected</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: colors.white }}>
                  <div className="card-body text-center">
                    <div className="mb-2" style={{ fontSize: '2rem' }}>💰</div>
                    <h3 className="fw-bold mb-1" style={{ color: colors.wine }}>
                      {formatIndianCurrency(stats.totalAmount)}
                    </h3>
                    <small style={{ color: colors.charcoal }}>Total Amount</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header border-0 py-3" style={{ backgroundColor: colors.teaGreen }}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                  <div>
                    <h5 className="card-title mb-1 fw-bold" style={{ color: colors.charcoal }}>
                      <i className="bi bi-clipboard-check me-2"></i>
                      Expense Approval Requests
                    </h5>
                    <p className="mb-0 small" style={{ color: colors.charcoal }}>
                      Review and manage expense submissions from your team
                    </p>
                  </div>
                  <div className="p-2 rounded" style={{ backgroundColor: colors.maize }}>
                    <small style={{ color: '#7a6000', fontWeight: '500' }}>
                      💡 Showing latest requests in Indian Rupees (INR)
                    </small>
                  </div>
                </div>
              </div>
              
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: colors.wine }}></div>
                    <p className="mt-2 mb-0" style={{ color: colors.charcoal }}>Loading approval requests...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger text-center m-3">{error}</div>
                ) : (
                  <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <table className="table table-hover mb-0">
                      <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                        <tr>
                          <th style={{ color: colors.charcoal, fontWeight: '600' }}>Subject & Details</th>
                          <th style={{ color: colors.charcoal, fontWeight: '600' }}>Request Owner</th>
                          <th style={{ color: colors.charcoal, fontWeight: '600' }}>Category</th>
                          <th style={{ color: colors.charcoal, fontWeight: '600' }}>Status</th>
                          <th style={{ color: colors.charcoal, fontWeight: '600' }}>Amount</th>
                          <th style={{ color: colors.charcoal, fontWeight: '600' }}>Submitted</th>
                          <th style={{ color: colors.charcoal, fontWeight: '600' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((req) => {
                          const statusBadge = getStatusBadge(req.status);
                          return (
                            <tr key={req.id} style={{ cursor: 'pointer' }}>
                              <td>
                                <div className="d-flex align-items-start">
                                  <div className="flex-grow-1">
                                    <div style={{ color: colors.charcoal, fontWeight: '500' }}>
                                      {req.subject}
                                    </div>
                                    <small className="text-muted">
                                      {req.description}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ color: colors.charcoal, fontWeight: '500' }}>
                                  {req.owner}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <span className="me-2" style={{ fontSize: '1.1rem' }}>
                                    {getCategoryIcon(req.category)}
                                  </span>
                                  <small style={{ color: colors.charcoal }}>
                                    {req.category}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${statusBadge.class}`}>
                                  <span className="me-1">{statusBadge.icon}</span>
                                  {req.status}
                                </span>
                              </td>
                              <td>
                                <strong style={{ color: colors.wine }}>
                                  {formatIndianCurrency(req.total)}
                                </strong>
                                <br />
                                <small className="text-muted">{req.currency}</small>
                              </td>
                              <td>
                                <small style={{ color: colors.charcoal }}>
                                  {req.timeAgo}
                                </small>
                                <br />
                                <small className="text-muted">
                                  {req.submittedDate}
                                </small>
                              </td>
                              <td>
                                {req.status === "Pending" ? (
                                  <div className="d-flex flex-wrap gap-1">
                                    <button
                                      className="btn btn-sm border-0 fw-medium"
                                      style={{ 
                                        backgroundColor: colors.teaGreen,
                                        color: colors.charcoal
                                      }}
                                      onClick={() => handleApprove(req.id)}
                                    >
                                      ✅ Approve
                                    </button>
                                    <button
                                      className="btn btn-sm border-0 fw-medium"
                                      style={{ 
                                        backgroundColor: colors.wine,
                                        color: colors.white
                                      }}
                                      onClick={() => handleReject(req.id)}
                                    >
                                      ❌ Reject
                                    </button>
                                  </div>
                                ) : req.status === "Approved" ? (
                                  <button 
                                    className="btn btn-sm border-0 fw-medium"
                                    style={{ 
                                      backgroundColor: colors.teaGreen,
                                      color: colors.charcoal
                                    }}
                                    disabled
                                  >
                                    ✅ Approved
                                  </button>
                                ) : (
                                  <button 
                                    className="btn btn-sm border-0 fw-medium"
                                    style={{ 
                                      backgroundColor: colors.wine,
                                      color: colors.white
                                    }}
                                    disabled
                                  >
                                    ❌ Rejected
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {!loading && requests.length === 0 && (
                  <div className="text-center py-5" style={{ backgroundColor: colors.white }}>
                    <div style={{ fontSize: '3rem', color: colors.columbiaBlue }}>📭</div>
                    <h5 style={{ color: colors.charcoal }}>No Approval Requests</h5>
                    <p style={{ color: colors.wine }}>All caught up! No pending expenses to review.</p>
                  </div>
                )}
              </div>

              <div className="card-footer border-0 bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <small style={{ color: colors.charcoal }}>
                    📊 Showing {requests.length} requests
                  </small>
                  <small style={{ color: colors.charcoal }}>
                    ⏰ Sorted by most recent
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .table tbody tr:hover {
          background-color: ${colors.columbiaBlue} !important;
          transition: background-color 0.2s ease;
        }
        
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
          transition: transform 0.2s ease;
        }
      `}</style>
    </div>
  );
}