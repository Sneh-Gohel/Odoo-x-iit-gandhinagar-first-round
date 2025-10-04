import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login route */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/EmpDashboard" element={<EmployeeDashboard />} />
        <Route path="adminDashboard" element={<AdminDashboard />} />
        <Route path="forgotPassword" element={<ForgotPassword />} />
        <Route path="managerDashboard" element={<ManagerDashboard />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;