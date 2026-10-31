
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeeManagement from "./pages/EmployeeManagement";
import AddEmployee from "./pages/AddEmployee";
import ViewEmployee from "./pages/ViewEmployee";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login page */}
        <Route path="/" element={<Login />} />

     <Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<AdminDashboard />} />

  <Route path="/employees/add" element={<AddEmployee />} />

  <Route path="/employees" element={<EmployeeManagement />} />

  <Route path="/employees/:id" element={<ViewEmployee />} />
</Route>

        {/* Unknown paths return to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


