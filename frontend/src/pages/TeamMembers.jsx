
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeamMembers.css";

const API_URL = "http://localhost:5000/api/projects";

const TeamMembers = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Fetch employees assigned to the logged-in PM's projects
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Authentication token not found. Please log in again."
          );
        }

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
 
  console.log(
  "FULL TEAM MEMBERS DATA:",
  JSON.stringify(data.projects, null, 2)
);
        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load team members."
          );
        }

        // Collect unique employees from project team members
        const uniqueEmployees = new Map();

        (data.projects || []).forEach((project) => {
          (project.teamMembers || []).forEach((employee) => {
            if (employee && (employee._id || employee.id)) {
              const employeeId = employee._id || employee.id;
              uniqueEmployees.set(employeeId, employee);
            }
          });
        });

        setEmployees(Array.from(uniqueEmployees.values()));
      } catch (err) {
        console.error("Team members error:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // Get employee name
  const getEmployeeName = (employee) => {
    return employee.name || employee.fullName || "Unknown Employee";
  };

  // Search employees
  const filteredEmployees = employees.filter((employee) => {
    const searchValue = search.toLowerCase().trim();

    return (
      getEmployeeName(employee).toLowerCase().includes(searchValue) ||
      (employee.email || "").toLowerCase().includes(searchValue) ||
      (employee.designation || "").toLowerCase().includes(searchValue) ||
      (employee.employeeId || "").toLowerCase().includes(searchValue)
    );
  });

  // Statistics
  const activeCount = employees.filter(
    (employee) =>
      (employee.status || "").toLowerCase() === "active"
  ).length;

  const inactiveCount = employees.filter(
    (employee) =>
      (employee.status || "").toLowerCase() !== "active"
  ).length;

  // Employee initials
  const getInitials = (name) => {
    if (!name) return "EM";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const getStatus = (status) => {
    return (status || "").toLowerCase() === "active"
      ? "Active"
      : "Inactive";
  };

  return (
    <div className="tm-page">

      {/* Page Header */}
      <div className="tm-header">
        <div className="tm-header-content">

          <div className="tm-breadcrumb">
            <span>Project Manager</span>
            <span className="tm-breadcrumb-divider">/</span>
            <span className="tm-breadcrumb-current">
              Team Members
            </span>
          </div>

          <h1>Team Members</h1>

          <p>
            View and manage the employees assigned to your projects.
          </p>

        </div>

        <button
          type="button"
          className="tm-back-button"
          onClick={() => navigate("/project-manager/dashboard")}
        >
          <span>←</span>
          Back to Dashboard
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="tm-stats-grid">

        <div className="tm-stat-card tm-total-card">
          <div className="tm-stat-icon">
            <span>♟</span>
          </div>

          <div className="tm-stat-info">
            <p>Total Team Members</p>
            <h2>{loading ? "..." : employees.length}</h2>
            <span>Assigned to your projects</span>
          </div>
        </div>

        <div className="tm-stat-card tm-active-card">
          <div className="tm-stat-icon">
            <span>✓</span>
          </div>

          <div className="tm-stat-info">
            <p>Active Members</p>
            <h2>{loading ? "..." : activeCount}</h2>
            <span>Currently active employees</span>
          </div>
        </div>

        <div className="tm-stat-card tm-inactive-card">
          <div className="tm-stat-icon">
            <span>◷</span>
          </div>

          <div className="tm-stat-info">
            <p>Inactive Members</p>
            <h2>{loading ? "..." : inactiveCount}</h2>
            <span>Currently inactive employees</span>
          </div>
        </div>

      </div>

      {/* Team Directory */}
      <div className="tm-content-card">

        <div className="tm-content-header">
          <div>
            <h2>Team Directory</h2>
            <p>
              Your project team members and their details.
            </p>
          </div>

          <div className="tm-member-count">
            {filteredEmployees.length} Members
          </div>
        </div>

        {/* Search */}
        <div className="tm-search-wrapper">
          <span className="tm-search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search by name, email, designation or employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              className="tm-clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="tm-message">
            <div className="tm-spinner"></div>
            <p>Loading your team members...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="tm-error">
            <span>⚠</span>
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && employees.length === 0 && (
          <div className="tm-empty">
            <div className="tm-empty-icon">♟</div>
            <h3>No Team Members Yet</h3>
            <p>
              Employees assigned to your projects will appear here.
            </p>
          </div>
        )}

        {/* No Search Results */}
        {!loading &&
          !error &&
          employees.length > 0 &&
          filteredEmployees.length === 0 && (
            <div className="tm-empty">
              <div className="tm-empty-icon">⌕</div>
              <h3>No Employees Found</h3>
              <p>
                Try searching with another name or keyword.
              </p>
            </div>
          )}

        {/* Employee Table */}
        {!loading &&
          !error &&
          filteredEmployees.length > 0 && (
            <div className="tm-table-wrapper">
              <table className="tm-table">

                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>EMAIL ADDRESS</th>
                    <th>DESIGNATION</th>
                    <th>EMPLOYEE ID</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => {
                    const name = getEmployeeName(employee);
                    const status = getStatus(employee.status);

                    return (
                      <tr key={employee._id || employee.id}>
                        <td>
                          <div className="tm-employee">
                            <div className="tm-avatar">
                              {getInitials(name)}
                            </div>

                            <div className="tm-employee-details">
                              <h4>{name}</h4>
                              <span>Team Member</span>
                            </div>
                          </div>
                        </td>

                        <td className="tm-email">
                          {employee.email || "—"}
                        </td>

                        <td>
                          <span className="tm-designation">
                            {employee.designation || "Not specified"}
                          </span>
                        </td>

                        <td className="tm-employee-id">
                          {employee.employeeId || "—"}
                        </td>

                        <td>
                          <span
                            className={`tm-status ${
                              status === "Active" ? "active" : "inactive"
                            }`}
                          >
                            <span className="tm-status-dot"></span>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          )}

        {/* Footer */}
        {!loading && !error && filteredEmployees.length > 0 && (
          <div className="tm-table-footer">
            Showing <strong>{filteredEmployees.length}</strong> of{" "}
            <strong>{employees.length}</strong> team members
          </div>
        )}

      </div>
    </div>
  );
};

export default TeamMembers;
