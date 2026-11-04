

// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";

// function ProtectedRoute() {
//   const token =
//     localStorage.getItem("token") ||
//     sessionStorage.getItem("token");

//   if (!token) {
//     return <Navigate to="/" replace />;
//   }

//   return <Outlet />;
// }

// export default ProtectedRoute;


import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  if (!token || !storedUser) {
    return <Navigate to="/" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

