import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeManagement.css";

const API_URL = "http://localhost:5000/api/employees";

export default function EmployeeManagement() {
    const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [positionFilter, setPositionFilter] = useState("All Positions");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);

  const [editingEmployee, setEditingEmployee] = useState(null);

const [editForm, setEditForm] = useState({
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  role: "Employee",
  status: "Active",
});

  const pageSize = 5;

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load employees.");
        }

        // Supports both { success: true, employees: [] }
        // and a direct array response.
        const employeeList = Array.isArray(data)
          ? data
          : data.employees;

        if (!Array.isArray(employeeList)) {
          throw new Error("Invalid employee data received from server.");
        }

        setEmployees(employeeList);
      } catch (err) {
        setError(
          err.message ||
            "Unable to connect to the server. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const normalizeStatus = (status) => {
    const value = String(status || "").trim().toLowerCase();

    if (value === "active") return "Active";
    if (value === "on leave" || value === "on-leave") return "On Leave";
    if (value === "inactive") return "Inactive";

    return status || "Unknown";
  };

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => normalizeStatus(employee.status) === "Active"
  ).length;

  const onLeaveEmployees = employees.filter(
    (employee) => normalizeStatus(employee.status) === "On Leave"
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) => normalizeStatus(employee.status) === "Inactive"
  ).length;

  const departments = useMemo(
    () => [
      ...new Set(
        employees
          .map((employee) => employee.department)
          .filter(Boolean)
      ),
    ],
    [employees]
  );

  const positions = useMemo(
    () => [
      ...new Set(
        employees
          .map((employee) => employee.designation)
          .filter(Boolean)
      ),
    ],
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const name = String(employee.name || "").toLowerCase();
      const email = String(employee.email || "").toLowerCase();
      const employeeId = String(employee.employeeId || "").toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        employeeId.includes(query);

      const matchesDepartment =
        departmentFilter === "All Departments" ||
        employee.department === departmentFilter;

      const matchesPosition =
        positionFilter === "All Positions" ||
        employee.designation === positionFilter;

      const matchesStatus =
        statusFilter === "All Statuses" ||
        normalizeStatus(employee.status) === statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesPosition &&
        matchesStatus
      );
    });
  }, [
    employees,
    search,
    departmentFilter,
    positionFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / pageSize)
  );

  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const resetFilters = () => {
    setSearch("");
    setDepartmentFilter("All Departments");
    setPositionFilter("All Positions");
    setStatusFilter("All Statuses");
    setCurrentPage(1);
  };

  const handleExport = () => {
    const headers = [
      "Employee ID",
      "Name",
      "Department",
      "Designation",
      "Email",
      "Status",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredEmployees.map((employee) => [
      employee.employeeId,
      employee.name,
      employee.department,
      employee.designation,
      employee.email,
      normalizeStatus(employee.status),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "employees.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

const handleAddEmployee = () => {
  navigate("/employees/add");
};

const handleViewEmployee = (employee) => {
  navigate(`/employees/${employee._id}`);
};

const handleEditEmployee = (employee) => {
  setEditingEmployee(employee);

  setEditForm({
    name: employee.name || "",
    email: employee.email || "",
    phone: employee.phone || "",
    department: employee.department || "",
    designation: employee.designation || "",
    role: employee.role || "Employee",
    status: employee.status || "Active",
  });
};

  const handleDeleteEmployee = (employee) => {
    alert(
      `Delete functionality for ${
        employee.name || "this employee"
      } will be implemented after adding the backend delete API.`
    );
  };

  return (
    <div className="employee-app">
      <aside className="employee-sidebar">
        <div className="brand">
          <div className="brand-logo">✦</div>

          <div>
            <h2>TechFlow ERP</h2>
            <p>Manage · Build · Grow</p>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <a href="/dashboard" className="sidebar-link">
            <span>⌂</span> Dashboard
          </a>

          <a href="/employees" className="sidebar-link active">
            <span>♙</span> Employees
          </a>

          <a
            href="/dashboard"
            className="sidebar-link"
            onClick={(event) => event.preventDefault()}
          >
            <span>▤</span> Departments
          </a>

          <a
            href="/dashboard"
            className="sidebar-link"
            onClick={(event) => event.preventDefault()}
          >
            <span>▱</span> Projects
          </a>

          <a
            href="/dashboard"
            className="sidebar-link"
            onClick={(event) => event.preventDefault()}
          >
            <span>♙</span> Project Managers
          </a>

          <a
            href="/dashboard"
            className="sidebar-link"
            onClick={(event) => event.preventDefault()}
          >
            <span>▥</span> Reports
          </a>

          <a
            href="/dashboard"
            className="sidebar-link"
            onClick={(event) => event.preventDefault()}
          >
            <span>⚙</span> Settings
          </a>
        </nav>

        <div className="sidebar-bottom">
          <button
            className="sidebar-link logout-button"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            <span>⇥</span> Logout
          </button>

          <div className="team-card">
            <div className="team-icon">◷</div>
            <strong>Better Teams</strong>
            <span>Build Better Products</span>
          </div>
        </div>
      </aside>

      <main className="employee-main">
        <header className="topbar">
          <label className="global-search">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search here..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
            />
          </label>

          <div className="topbar-right">
            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
            >
              ♧<span className="notification-dot"></span>
            </button>

            <div className="admin-profile">
              <div className="admin-avatar">A</div>

              <div>
                <strong>Admin</strong>
                <span>Administrator</span>
              </div>

              <span className="profile-arrow">⌄</span>
            </div>
          </div>
        </header>

        <section className="employee-content">
          <div className="page-heading">
            <div>
              <h1>Employee Management</h1>
              <p>
                Manage your company's employees, roles, and departments.
              </p>
            </div>

            <div className="heading-actions">
              <button
                className="button button-secondary"
                onClick={handleExport}
              >
                ⇩ &nbsp; Export CSV
              </button>

              <button
                className="button button-primary"
                onClick={handleAddEmployee}
              >
                + &nbsp; Add Employee
              </button>
            </div>
          </div>

          <section className="employee-stats">
            <article className="stat-card">
              <div className="stat-top">
                <div className="stat-icon blue-icon">♙</div>
                <span className="stat-symbol blue-text">↗</span>
              </div>

              <p>Total Employees</p>

              <h2>{loading ? "..." : totalEmployees}</h2>

              <span className="stat-caption blue-text">
                All registered employees
              </span>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <div className="stat-icon green-icon">♙</div>
                <span className="status-dot green-dot"></span>
              </div>

              <p>Active Employees</p>

              <h2>{loading ? "..." : activeEmployees}</h2>

              <span className="stat-caption green-text">
                Currently working
              </span>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <div className="stat-icon orange-icon">▣</div>
                <span className="scheduled-label">Scheduled</span>
              </div>

              <p>On Leave</p>

              <h2>{loading ? "..." : onLeaveEmployees}</h2>

              <span className="stat-caption orange-text">
                Currently on leave
              </span>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <div className="stat-icon red-icon">⊘</div>
                <span className="status-dot red-dot"></span>
              </div>

              <p>Inactive Employees</p>

              <h2>{loading ? "..." : inactiveEmployees}</h2>

              <span className="stat-caption red-text">
                Currently inactive
              </span>
            </article>
          </section>

          <section className="filter-bar">
            <label className="table-search">
              <span>⌕</span>

              <input
                type="search"
                placeholder="Search by employee name or email..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </label>

            <select
              value={departmentFilter}
              onChange={(event) => {
                setDepartmentFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by department"
            >
              <option>All Departments</option>

              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <select
              value={positionFilter}
              onChange={(event) => {
                setPositionFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by position"
            >
              <option>All Positions</option>

              {positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
            >
              <option>All Statuses</option>
              <option>Active</option>
              <option>On Leave</option>
              <option>Inactive</option>
            </select>

            <button className="reset-button" onClick={resetFilters}>
              ↻ &nbsp; Reset
            </button>
          </section>

          {error && (
            <div className="employee-error" role="alert">
              <strong>Unable to load employees.</strong>
              <p>{error}</p>
              <span>
                Check that your backend is running on port 5000.
              </span>
            </div>
          )}

          <section className="employee-table-card">
            <div className="table-scroll">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Job Position</th>
                    <th>Email Address</th>
                    <th>Status</th>
                    <th className="actions-heading">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="table-message">
                        Loading employees...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="table-message">
                        Employee data could not be loaded.
                      </td>
                    </tr>
                  ) : currentEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="table-message">
                        No employees found. Try changing your filters.
                      </td>
                    </tr>
                  ) : (
                    currentEmployees.map((employee) => {
                      const status = normalizeStatus(employee.status);

                      const initials = String(employee.name || "E")
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase();

                      return (
                        <tr key={employee._id || employee.employeeId}>
                          <td>
                            <div className="employee-person">
                              <div className="employee-avatar">
                                {initials}
                              </div>

                              <div className="employee-name">
                                <strong>
                                  {employee.name || "Unnamed Employee"}
                                </strong>

                                <span>
                                  {employee.department || "No department"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="employee-id">
                            {employee.employeeId || "—"}
                          </td>

                          <td>
                            <span
                              className={`department-badge ${String(
                                employee.department || ""
                              )
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")}`}
                            >
                              {employee.department || "—"}
                            </span>
                          </td>

                          <td className="job-position">
                            {employee.designation || "—"}
                          </td>

                          <td className="email-cell">
                            {employee.email || "—"}
                          </td>

                          <td>
                            <span
                              className={`status-badge ${
                                status === "Active"
                                  ? "status-active"
                                  : status === "On Leave"
                                  ? "status-leave"
                                  : status === "Inactive"
                                  ? "status-inactive"
                                  : "status-unknown"
                              }`}
                            >
                              <span className="badge-dot"></span>
                              {status}
                            </span>
                          </td>

                          <td>
                            <div className="row-actions">
                              <button
                                type="button"
                                title="View employee"
                                aria-label={`View ${employee.name}`}
                                onClick={() => handleViewEmployee(employee)}
                              >
                                ◎
                              </button>

                              <button
                                type="button"
                                title="Edit employee"
                                aria-label={`Edit ${employee.name}`}
                                onClick={() => handleEditEmployee(employee)}
                              >
                                ♢
                              </button>

                              <button
                                type="button"
                                title="Delete employee"
                                aria-label={`Delete ${employee.name}`}
                                onClick={() => handleDeleteEmployee(employee)}
                              >
                                ⋮
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <footer className="table-footer">
              <span className="showing-text">
                Showing{" "}
                {filteredEmployees.length === 0
                  ? 0
                  : (currentPage - 1) * pageSize + 1}
                –
                {Math.min(currentPage * pageSize, filteredEmployees.length)}{" "}
                of {filteredEmployees.length} employees
              </span>

              <div className="pagination">
                <button
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                >
                  ‹
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                )
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                  )
                  .map((page, index, pages) => (
                    <React.Fragment key={page}>
                      {index > 0 && page - pages[index - 1] > 1 && (
                        <span className="pagination-ellipsis">…</span>
                      )}

                      <button
                        className={
                          currentPage === page ? "current-page" : ""
                        }
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  aria-label="Next page"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                >
                  ›
                </button>
              </div>
            </footer>
          </section>

          <p className="page-footer">
            © 2026 TechFlow ERP. All rights reserved.
          </p>
        </section>
      </main>
    </div>
  );
}
