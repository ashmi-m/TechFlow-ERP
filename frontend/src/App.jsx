import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProjectManagerDashboard from "./pages/ProjectManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

import EmployeeManagement from "./pages/EmployeeManagement";
import AddEmployee from "./pages/AddEmployee";
import ViewEmployee from "./pages/ViewEmployee";
import DepartmentManagement from "./pages/DepartmentManagement";

import Projectmanagerlogin from "./pages/Projectmanagerlogin";
import MyProjects from "./pages/MyProjects";
import CreateProject from "./pages/CreateProject";
import CreateTask from "./pages/CreateTask";
import TaskManagement from "./pages/TaskManagement";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Common Login */}
        <Route path="/" element={<Login />} />

        {/* Project Manager Login */}
        <Route
          path="/project-manager/login"
          element={<Projectmanagerlogin />}
        />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/employees" element={<EmployeeManagement />} />
          <Route path="/employees/add" element={<AddEmployee />} />
          <Route path="/employees/:id" element={<ViewEmployee />} />
          <Route path="/departments" element={<DepartmentManagement />} />
        </Route>

        {/* Project Manager Routes */}
<Route element={<ProtectedRoute allowedRoles={["project_manager"]} />}>
  <Route
    path="/project-manager/dashboard"
    element={<ProjectManagerDashboard />}
  />

  <Route
    path="/project-manager/projects"
    element={<MyProjects />}
  />

  <Route
    path="/project-manager/create-project"
    element={<CreateProject />}
  />

  {/* Task Management */}
  <Route
    path="/project-manager/tasks"
    element={<TaskManagement />}
  />

  {/* Create Task */}
  <Route
    path="/project-manager/tasks/create"
    element={<CreateTask />}
  />
</Route>

        {/* Employee Routes */}
        <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
          <Route
            path="/employee/dashboard"
            element={<EmployeeDashboard />}
          />

        </Route>


        {/* Unknown Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;