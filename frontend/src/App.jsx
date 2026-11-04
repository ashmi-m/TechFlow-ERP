
// import React from "react";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";

// import Login from "./pages/Login";
// import AdminDashboard from "./pages/AdminDashboard";
// import ProjectManagerDashboard from "./pages/ProjectManagerDashboard";
// import EmployeeDashboard from "./pages/EmployeeDashboard";

// import ProtectedRoute from "./components/ProtectedRoute";

// import EmployeeManagement from "./pages/EmployeeManagement";
// import AddEmployee from "./pages/AddEmployee";
// import ViewEmployee from "./pages/ViewEmployee";
// import DepartmentManagement from "./pages/DepartmentManagement";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Common Login */}
//         <Route path="/" element={<Login />} />

//         {/* Protected pages */}
//         <Route element={<ProtectedRoute />}>
//           {/* Admin */}
//           <Route path="/dashboard" element={<AdminDashboard />} />
//           <Route path="/employees" element={<EmployeeManagement />} />
//           <Route path="/employees/add" element={<AddEmployee />} />
//           <Route path="/employees/:id" element={<ViewEmployee />} />
//           <Route path="/departments" element={<DepartmentManagement />} />

//           {/* Project Manager */}
//           <Route
//             path="/project-manager/dashboard"
//             element={<ProjectManagerDashboard />}
//           />

//           {/* Employee */}
//           <Route
//             path="/employee/dashboard"
//             element={<EmployeeDashboard />}
//           />
//         </Route>

//         {/* Unknown routes */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Common Login */}
        <Route path="/" element={<Login />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/employees" element={<EmployeeManagement />} />
          <Route path="/employees/add" element={<AddEmployee />} />
          <Route path="/employees/:id" element={<ViewEmployee />} />
          <Route path="/departments" element={<DepartmentManagement />} />
        </Route>

        {/* Project Manager Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Project Manager"]} />}>
          <Route
            path="/project-manager/dashboard"
            element={<ProjectManagerDashboard />}
          />
        </Route>

        {/* Employee Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Employee"]} />}>
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

