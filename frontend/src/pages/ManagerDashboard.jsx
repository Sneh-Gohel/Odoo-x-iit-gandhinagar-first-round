import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/ManagerDashboard.css";

export default function ManagerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch data from API
  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true);
        const res = await axios.get("https://api.example.com/approvals"); // Replace with your API endpoint
        setRequests(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch approval requests");
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  // Approve request
  const handleApprove = async (id) => {
    try {
      await axios.patch(`https://api.example.com/approvals/${id}`, {
        status: "Approved",
      });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
      );
    } catch {
      alert("Failed to approve request.");
    }
  };

  // Reject request
  const handleReject = async (id) => {
    try {
      await axios.patch(`https://api.example.com/approvals/${id}`, {
        status: "Rejected",
      });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r))
      );
    } catch {
      alert("Failed to reject request.");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="manager-dashboard">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-charcoal shadow-sm">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <h1 className="navbar-brand mb-0 fs-4 fw-bold">Manager Dashboard</h1>
          <div className="d-flex align-items-center gap-3">
            <span className="text-light small">
              Logged in as: <strong>Michael Scott</strong>
            </span>
            <button className="btn btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container my-4">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0 text-charcoal">
                Expense Approval Requests
              </h2>
            </div>

            <div className="highlight mb-3">
              Showing latest requests in company currency (USD)
            </div>

            {loading ? (
              <div className="text-center py-5 text-muted">Loading...</div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Approval Subject</th>
                      <th>Request Owner</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Total (USD)</th>
                      <th>Total Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length > 0 ? (
                      requests.map((req) => (
                        <tr key={req.id}>
                          <td>{req.subject}</td>
                          <td>{req.owner}</td>
                          <td>{req.category}</td>
                          <td>
                            <span
                              className={`status badge rounded-pill ${
                                req.status.toLowerCase()
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td>${req.total.toFixed(2)}</td>
                          <td>{req.timeAgo}</td>
                          <td>
                            {req.status === "Pending" ? (
                              <>
                                <button
                                  className="btn btn-sm btn-approve me-2"
                                  onClick={() => handleApprove(req.id)}
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-sm btn-reject"
                                  onClick={() => handleReject(req.id)}
                                >
                                  Reject
                                </button>
                              </>
                            ) : req.status === "Approved" ? (
                              <button
                                className="btn btn-sm btn-success"
                                disabled
                              >
                                Approved
                              </button>
                            ) : (
                              <button className="btn btn-sm btn-dark" disabled>
                                Rejected
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          No approval requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="table-footer text-end text-muted small mt-3">
              Showing {requests.length} requests • Sorted by most recent
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}