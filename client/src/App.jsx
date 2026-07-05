import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import NotFound from "./pages/NotFound.jsx";
import ComplaintDetail from "./pages/ComplaintDetail.jsx";

import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import RaiseComplaint from "./pages/student/RaiseComplaint.jsx";
import MyComplaints from "./pages/student/MyComplaints.jsx";

import StaffDashboard from "./pages/staff/StaffDashboard.jsx";
import StaffComplaints from "./pages/staff/StaffComplaints.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminComplaints from "./pages/admin/AdminComplaints.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminDepartments from "./pages/admin/AdminDepartments.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student" element={<DashboardLayout title="Student Dashboard" />}>
          <Route index element={<StudentDashboard />} />
          <Route path="raise" element={<RaiseComplaint />} />
          <Route path="complaints" element={<MyComplaints />} />
          <Route path="complaints/:id" element={<ComplaintDetail />} />
        </Route>
      </Route>

      {/* Staff */}
      <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
        <Route path="/staff" element={<DashboardLayout title="Staff Dashboard" />}>
          <Route index element={<StaffDashboard />} />
          <Route path="complaints" element={<StaffComplaints />} />
          <Route path="complaints/:id" element={<ComplaintDetail />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<DashboardLayout title="Admin Dashboard" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="complaints/:id" element={<ComplaintDetail />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
