import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"

import "./AdminDashboard.css";

const initialProjects = [
  { id: 1, name: "E-commerce Website", manager: "Rahul S.", deadline: "30 Oct 2026", status: "In Progress", progress: 60, color: "blue" },
  { id: 2, name: "CRM Application", manager: "Anjali P.", deadline: "05 Nov 2026", status: "Planning", progress: 20, color: "teal" },
  { id: 3, name: "ERP Dashboard", manager: "Arjun M.", deadline: "20 Nov 2026", status: "Completed", progress: 100, color: "green" },
  { id: 4, name: "Mobile App", manager: "Sneha K.", deadline: "10 Dec 2026", status: "In Progress", progress: 45, color: "blue" },
  { id: 5, name: "Website Redesign", manager: "Vishnu R.", deadline: "25 Dec 2026", status: "Not Started", progress: 0, color: "purple" },
  { id: 6, name: "Analytics Portal", manager: "Meera T.", deadline: "04 Jan 2027", status: "Planning", progress: 15, color: "teal" },
  { id: 7, name: "HR Management", manager: "Nikhil D.", deadline: "12 Jan 2027", status: "In Progress", progress: 72, color: "blue" },
  { id: 8, name: "Inventory System", manager: "Asha V.", deadline: "22 Jan 2027", status: "Completed", progress: 100, color: "green" },
];

const activities = [
  {
    icon: "+",
    tone: "mint",
    title: "New employee added",
    detail: "Rahul S. joined as Frontend Developer",
    time: "2h ago",
  },
  {
    icon: "▣",
    tone: "lavender",
    title: "Project updated",
    detail: "E-commerce Website moved to In Progress",
    time: "4h ago",
  },
  {
    icon: "▤",
    tone: "sky",
    title: "Department created",
    detail: "Design department was added",
    time: "6h ago",
  },
  {
    icon: "↗",
    tone: "pink",
    title: "New project assigned",
    detail: "CRM Application assigned to Anjali P.",
    time: "8h ago",
  },
  {
    icon: "✓",
    tone: "mint",
    title: "Task completed",
    detail: "Login page completed by John D.",
    time: "Yesterday",
  },
];

const deadlines = [
  {
    title: "API Integration",
    detail: "E-Commerce Website",
    date: "28 Oct 2026",
    priority: "High",
    tone: "purple",
  },
  {
    title: "UI Design",
    detail: "CRM Application",
    date: "30 Oct 2026",
    priority: "Medium",
    tone: "orange",
  },
  {
    title: "Testing",
    detail: "Mobile App",
    date: "02 Nov 2026",
    priority: "Medium",
    tone: "orange",
  },
  {
    title: "Deployment",
    detail: "ERP Dashboard",
    date: "05 Nov 2026",
    priority: "Low",
    tone: "green",
  },
];

const menuItems = [
  ["⌂", "Dashboard"],
  ["♙", "Employees"],
  ["▦", "Departments"],
  ["▱", "Projects"],
  ["♧", "Project Managers"],
  ["▥", "Reports"],
  ["⚙", "Settings"],
];

function Icon({ children }) {
  return (
    <span className="icon" aria-hidden="true">
      {children}
    </span>
  );
}

function SectionTitle({ icon, children, action }) {
  return (
    <div className="section-title">
      <div className="section-title-left">
        <span className="section-icon">{icon}</span>
        <h2>{children}</h2>
      </div>

      {action && (
        <button
          className="text-action"
          type="button"
          onClick={action.onClick}
        >
          {action.label} <span>→</span>
        </button>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const className = status.toLowerCase().replaceAll(" ", "-");

  return (
    <span className={`status-pill ${className}`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [projectPage, setProjectPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notice, setNotice] = useState("");


    const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeeError, setEmployeeError] = useState("");
useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        "http://localhost:5000/api/employees",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch employees");
      }

      setEmployees(data.employees);
    } catch (error) {
      setEmployeeError(error.message);
    } finally {
      setLoadingEmployees(false);
    }
  };

  fetchEmployees();
}, []);

  const totalEmployees = employees.length;

const activeEmployees = employees.filter(
  (employee) => employee.status === "Active"
).length;

const onLeaveEmployees = employees.filter(
  (employee) => employee.status === "On Leave"
).length;

const inactiveEmployees = employees.filter(
  (employee) => employee.status === "Inactive"
).length;

  const user = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") ||
          sessionStorage.getItem("user") ||
          "{}"
      );
    } catch {
      return {};
    }
  }, []);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialProjects.filter((project) => {
      return (
        !query ||
        [
          project.name,
          project.manager,
          project.status,
        ].some((value) =>
          value.toLowerCase().includes(query)
        )
      );
    });
  }, [search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / pageSize)
  );

  const safePage = Math.min(projectPage, totalPages);

  const visibleProjects = filteredProjects.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );


// function goToSection(label) {
//   setActiveMenu(label);
//   setNotice("");

//   if (label === "Employees") {
//     navigate("/employees");
//     return;
//   }

//   if (label !== "Dashboard") {
//     setNotice(`${label} page is ready to connect.`);
//   }
// }

function goToSection(label) {
  setActiveMenu(label);
  setNotice("");

  if (label === "Employees") {
    navigate("/employees");
    return;
  }

  if (label === "Departments") {
    navigate("/departments");
    return;
  }

  if (label !== "Dashboard") {
    setNotice(`${label} page is ready to connect.`);
  }
}

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    window.location.assign("/");
  }

  function showAllProjects() {
    document
      .getElementById("recent-projects")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    setProjectPage(1);
  }

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}

      <aside className="admin-sidebar">

        <div className="brand">
          <div className="brand-mark">TF</div>

          <div>
            <strong>TechFlow ERP</strong>
            <small>Manage • Build • Grow</small>
          </div>
        </div>

        <nav
          className="sidebar-nav"
          aria-label="Main navigation"
        >
          {menuItems.map(([icon, label]) => (
            <button
              key={label}
              type="button"
              className={`nav-item ${
                activeMenu === label ? "active" : ""
              }`}
              onClick={() => goToSection(label)}
            >
              <Icon>{icon}</Icon>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className="logout-button"
            type="button"
            onClick={logout}
          >
            <Icon>⇥</Icon>
            <span>Logout</span>
          </button>

          <div className="sidebar-promo">
            <div className="promo-mark">◆</div>
            <strong>Better Teams</strong>
            <span>Build Better Products</span>
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="admin-main">

        {/* TOPBAR */}

        <header className="topbar">

          <label className="search-box">
            <span>⌕</span>

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setProjectPage(1);
              }}
              placeholder="Search projects, managers..."
              aria-label="Search projects"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          <div className="topbar-actions">

            <button
              className="notification-button"
              type="button"
              aria-label="Notifications"
              onClick={() =>
                setNotice(
                  "You are all caught up on notifications."
                )
              }
            >
              ♧
              <span className="notification-dot">3</span>
            </button>

            <div className="profile-wrap">

              <button
                className="profile-button"
                type="button"
                onClick={() =>
                  setProfileOpen(!profileOpen)
                }
                aria-expanded={profileOpen}
              >
                <span className="avatar">
                  {(user.name || "Admin")
                    .slice(0, 1)
                    .toUpperCase()}
                </span>

                <span className="profile-copy">
                  <strong>{user.name || "Admin"}</strong>
                  <small>
                    {user.role || "Administrator"}
                  </small>
                </span>

                <span className="chevron">⌄</span>
              </button>

              {profileOpen && (
                <div className="profile-menu">
                  <strong>
                    {user.email || "admin@techflow.com"}
                  </strong>

                  <button
                    type="button"
                    onClick={logout}
                  >
                    Sign out
                  </button>
                </div>
              )}

            </div>
          </div>

        </header>

        {/* DASHBOARD */}

        <div className="dashboard-content">

          {notice && (
            <div
              className="notice-banner"
              role="status"
            >
              <span>{notice}</span>

              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {/* WELCOME */}

          <section className="welcome-row">
            <div>
              <h1>
                Welcome back, {user.name || "Admin"}!
                <span className="wave"> 👋</span>
              </h1>

              <p>
                Here's what's happening with your
                company today.
              </p>
            </div>

           <div className="date-chip">
  <span>▦</span>
  {new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</div>
          </section>

          {/* STATISTICS */}

          <section
            className="stats-grid"
            aria-label="Company statistics"
          >

            <article className="stat-card">
              <div className="stat-icon blue-bg">♟</div>
              <span className="stat-arrow blue-text">→</span>
              <p>Total Employees</p>
<strong className="stat-number">
  {loadingEmployees ? "..." : totalEmployees}
</strong>
              <small className="stat-change positive">
                ↗ 12% <span>vs last month</span>
              </small>
            </article>

            <article className="stat-card">
              <div className="stat-icon purple-bg">▰</div>
              <span className="stat-arrow purple-text">→</span>
              <p>Total Projects</p>
              <strong className="stat-number">12</strong>
              <small className="stat-change positive">
                ↗ 20% <span>vs last month</span>
              </small>
            </article>

            <article className="stat-card">
              <div className="stat-icon teal-bg">◉</div>
              <span className="stat-arrow teal-text">→</span>
              <p>Active Projects</p>
              <strong className="stat-number">7</strong>
              <small className="stat-change positive">
                ↗ 17% <span>vs last month</span>
              </small>
            </article>

            <article className="stat-card">
              <div className="stat-icon orange-bg">✓</div>
              <span className="stat-arrow orange-text">→</span>
              <p>Completed Projects</p>
              <strong className="stat-number">5</strong>
              <small className="stat-change positive">
                ↗ 25% <span>vs last month</span>
              </small>
            </article>

          </section>

          {/* MIDDLE SECTION */}

          <section className="middle-grid">

            {/* PROJECT PROGRESS */}

            <article className="panel progress-panel">

              <SectionTitle
                icon="▥"
                action={{
                  label: "View all",
                  onClick: () => goToSection("Reports"),
                }}
              >
                Project Progress
              </SectionTitle>

              <div className="progress-content">

                <div className="donut-wrap">
                  <div className="progress-donut">
                    <div>
                      <strong>70%</strong>
                      <span>Overall Progress</span>
                    </div>
                  </div>
                </div>

                <div className="progress-legend">

                  <div>
                    <i className="legend-dot green-dot" />
                    <span>Completed</span>
                    <strong>5 <small>42%</small></strong>
                  </div>

                  <div>
                    <i className="legend-dot blue-dot" />
                    <span>In Progress</span>
                    <strong>7 <small>58%</small></strong>
                  </div>

                  <div>
                    <i className="legend-dot orange-dot" />
                    <span>On Hold</span>
                    <strong>0 <small>0%</small></strong>
                  </div>

                  <div>
                    <i className="legend-dot red-dot" />
                    <span>Not Started</span>
                    <strong>0 <small>0%</small></strong>
                  </div>

                </div>
              </div>

            </article>

            {/* RECENT ACTIVITIES */}

            <article className="panel activity-panel">

              <SectionTitle
                icon="◷"
                action={{
                  label: "View all",
                  onClick: () => goToSection("Reports"),
                }}
              >
                Recent Activities
              </SectionTitle>

              <div className="activity-list">
                {activities.map((item) => (
                  <div
                    className="activity-item"
                    key={item.title}
                  >
                    <span
                      className={`activity-icon ${item.tone}`}
                    >
                      {item.icon}
                    </span>

                    <div className="activity-copy">
                      <strong>{item.title}</strong>
                      <p>{item.detail}</p>
                    </div>

                    <small>{item.time}</small>
                  </div>
                ))}
              </div>

            </article>

            {/* DEADLINES */}

            <article className="panel deadlines-panel">

              <SectionTitle
                icon="▣"
                action={{
                  label: "View all",
                  onClick: () => goToSection("Projects"),
                }}
              >
                Upcoming Deadlines
              </SectionTitle>

              <div className="deadline-list">
                {deadlines.map((item) => (
                  <div
                    className="deadline-item"
                    key={item.title}
                  >
                    <i
                      className={`deadline-dot ${item.tone}`}
                    />

                    <div className="deadline-copy">
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </div>

                    <div className="deadline-meta">
                      <small>{item.date}</small>

                      <span
                        className={`priority ${item.priority.toLowerCase()}`}
                      >
                        {item.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </article>

          </section>

          {/* BOTTOM SECTION */}

          <section className="bottom-grid">

            {/* RECENT PROJECTS */}

            <article
              className="panel projects-panel"
              id="recent-projects"
            >

              <SectionTitle
                icon="▱"
                action={{
                  label: "View all",
                  onClick: showAllProjects,
                }}
              >
                Recent Projects
              </SectionTitle>

              <div className="table-scroll">

                <table className="projects-table">

                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>Manager</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Progress</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleProjects.map((project) => (
                      <tr key={project.id}>

                        <td>
                          <span
                            className={`project-symbol ${project.color}`}
                          >
                            {project.name.slice(0, 1)}
                          </span>

                          <strong className="project-name">
                            {project.name}
                          </strong>
                        </td>

                        <td>
                          <span className="manager-avatar">
                            {project.manager.slice(0, 1)}
                          </span>

                          {project.manager}
                        </td>

                        <td>{project.deadline}</td>

                        <td>
                          <StatusPill status={project.status} />
                        </td>

                        <td>
                          <div className="table-progress">
                            <div className="table-progress-track">
                              <span
                                className={project.color}
                                style={{
                                  width: `${project.progress}%`,
                                }}
                              />
                            </div>

                            <small>{project.progress}%</small>
                          </div>
                        </td>

                      </tr>
                    ))}

                    {visibleProjects.length === 0 && (
                      <tr>
                        <td
                          className="empty-state"
                          colSpan="5"
                        >
                          No projects match "{search}".
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>

              </div>

              {/* PAGINATION */}

              <div className="pagination-bar">

                <span>
                  Showing{" "}
                  <strong>
                    {filteredProjects.length
                      ? (safePage - 1) * pageSize + 1
                      : 0}
                    –
                    {Math.min(
                      safePage * pageSize,
                      filteredProjects.length
                    )}
                  </strong>{" "}
                  of <strong>{filteredProjects.length}</strong>{" "}
                  projects
                </span>

                <div className="pagination-controls">

                  <label className="page-size-label">
                    Rows

                    <select
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setProjectPage(1);
                      }}
                      aria-label="Rows per page"
                    >
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="8">8</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    className="page-button"
                    disabled={safePage <= 1}
                    onClick={() =>
                      setProjectPage(safePage - 1)
                    }
                    aria-label="Previous page"
                  >
                    ‹
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      type="button"
                      key={page}
                      className={`page-button ${
                        safePage === page ? "selected" : ""
                      }`}
                      onClick={() => setProjectPage(page)}
                      aria-current={
                        safePage === page ? "page" : undefined
                      }
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="page-button"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      setProjectPage(safePage + 1)
                    }
                    aria-label="Next page"
                  >
                    ›
                  </button>

                </div>
              </div>

            </article>

            {/* EMPLOYEE OVERVIEW */}

            <article className="panel employee-panel">

              <SectionTitle
                icon="♟"
                action={{
                  label: "View all",
                  onClick: () => goToSection("Employees"),
                }}
              >
                Employee Overview
              </SectionTitle>

              <div className="employee-chart-row">

                <div className="employee-donut">
                  <div>
                    <strong>
  {loadingEmployees ? "..." : totalEmployees}
</strong>
                    <span>Total Employees</span>
                  </div>
                </div>

                <div className="department-legend">

                  <div>
                    <i className="legend-dot blue-dot" />
                    <span>Development</span>
                    <strong>22</strong>
                  </div>

                  <div>
                    <i className="legend-dot purple-dot" />
                    <span>Design</span>
                    <strong>8</strong>
                  </div>

                  <div>
                    <i className="legend-dot green-dot" />
                    <span>QA</span>
                    <strong>6</strong>
                  </div>

                  <div>
                    <i className="legend-dot orange-dot" />
                    <span>HR</span>
                    <strong>5</strong>
                  </div>

                  <div>
                    <i className="legend-dot gray-dot" />
                    <span>Others</span>
                    <strong>7</strong>
                  </div>

                </div>
              </div>

              <div className="employee-statuses">

                <div className="employee-status active-status">
                  <span>✓</span>
                  <small>Active</small>
                 <strong>{activeEmployees}</strong>
                </div>

                <div className="employee-status leave-status">
                  <span>◷</span>
                  <small>On Leave</small>
               <strong>{onLeaveEmployees}</strong>
                </div>

                <div className="employee-status inactive-status">
                  <span>×</span>
                  <small>Inactive</small>
                <strong>{inactiveEmployees}</strong>
                </div>

              </div>

            </article>

          </section>

          <footer className="dashboard-footer">
            <span>© 2026 TechFlow ERP</span>
            <span>Built for better teamwork.</span>
          </footer>

        </div>

      </main>

    </div>
  );
}