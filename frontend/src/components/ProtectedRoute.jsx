import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles = [] }) {
  // Read token and user from the same storage
  const localToken = localStorage.getItem("token");
  const localUser = localStorage.getItem("user");

  const sessionToken = sessionStorage.getItem("token");
  const sessionUser = sessionStorage.getItem("user");

  const token = localToken && localUser
    ? localToken
    : sessionToken;

  const storedUser = localToken && localUser
    ? localUser
    : sessionUser;

  // No valid login session
  if (!token || !storedUser) {
    const loginRoutes = {
      admin: "/",
      project_manager: "/project-manager/login",
      employee: "/employee/login",
    };

    const loginPath = allowedRoles.length === 1
      ? loginRoutes[allowedRoles[0]]
      : "/";

    return <Navigate to={loginPath || "/"} replace />;
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

  // Check user permissions
  if (!allowedRoles.includes(user.role)) {
    const loginRoutes = {
      admin: "/",
      project_manager: "/project-manager/login",
      employee: "/employee/login",
    };

    return (
      <Navigate
        to={loginRoutes[user.role] || "/"}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;


// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";

// function ProtectedRoute({ allowedRoles }) {
//   const token =
//     localStorage.getItem("token") ||
//     sessionStorage.getItem("token");

//   const storedUser =
//     localStorage.getItem("user") ||
//     sessionStorage.getItem("user");

//   if (!token || !storedUser) {
//     return <Navigate to="/" replace />;
//   }

//   let user;

//   try {
//     user = JSON.parse(storedUser);
//   } catch {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     sessionStorage.removeItem("token");
//     sessionStorage.removeItem("user");

//     return <Navigate to="/" replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/" replace />;
//   }

//   return <Outlet />;
// }

// export default ProtectedRoute;

