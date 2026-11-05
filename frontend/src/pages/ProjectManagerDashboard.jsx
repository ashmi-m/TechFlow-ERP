import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectManagerDashboard.css";

const API_URL = "http://localhost:5000/api/projects";

function ProjectManagerDashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch projects from MongoDB
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in again.");
        }

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch projects."
          );
        }

        setProjects(data.projects || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Logout functionality
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/project-manager/login", { replace: true });
  };

  // Navigate to pages
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Export team details as CSV
  const handleExport = () => {
    const headers = [
      "Name",
      "Role",
      "Assigned",
      "Completed",
      "Pending",
      "Progress",
    ];

    const rows = teamMembers.map((member) => [
      member.name,
      member.role,
      member.assigned,
      member.completed,
      member.pending,
      `${member.progress}%`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${value}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "team-performance.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // Convert MongoDB project data into dashboard UI data
  const formattedProjects = projects.map((project) => {
    const priority = project.priority || "Medium";

    const color =
      priority === "High"
        ? "blue"
        : priority === "Medium"
        ? "orange"
        : "purple";

    const team = (project.teamMembers || []).map((member) => {
      const name = member.name || "";

      return name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    });

    return {
      _id: project._id,
      name: project.projectName,
      code: project.projectCode,
      priority: `${priority} Priority`,
      status: project.status,
      progress: project.progress ?? 0,
      color,
      deadline: project.deadline
        ? new Date(project.deadline).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Not assigned",
      tasks: "0/0",
      team,
    };
  });

  // Dashboard calculations
  const totalProjects = projects.length;

  const activeProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const activePercentage =
    totalProjects > 0
      ? Math.round((activeProjects / totalProjects) * 100)
      : 0;

  // Sample team data - connect to MongoDB later
  const teamMembers = [
    {
      initials: "AM",
      name: "Alex Morgan",
      role: "UI/UX Designer",
      assigned: 8,
      completed: 6,
      pending: 2,
      progress: 75,
    },
    {
      initials: "JD",
      name: "John Davis",
      role: "Frontend Developer",
      assigned: 6,
      completed: 4,
      pending: 2,
      progress: 67,
    },
    {
      initials: "SK",
      name: "Sarah Kim",
      role: "Backend Developer",
      assigned: 7,
      completed: 5,
      pending: 2,
      progress: 71,
    },
    {
      initials: "RK",
      name: "Ryan Kelly",
      role: "QA Engineer",
      assigned: 5,
      completed: 4,
      pending: 1,
      progress: 80,
    },
  ];

  // Temporary task statistics
  const taskStats = {
    total: 24,
    todo: 6,
    inProgress: 8,
    completed: 6,
    overdue: 4,
  };

  // Generate deadlines from actual projects
  const deadlines = [...projects]
    .filter((project) => project.deadline)
    .sort(
      (a, b) =>
        new Date(a.deadline) - new Date(b.deadline)
    )
    .slice(0, 3)
    .map((project, index) => ({
      icon: ["▣", "▤", "▧"][index],
      name: project.projectName,
      date: new Date(project.deadline).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),
      task: project.projectCode,
      status: project.status,
      color:
        project.priority === "High"
          ? "blue"
          : project.priority === "Medium"
          ? "orange"
          : "purple",
    }));

  return (
    <div className="pm-dashboard">

      {/* SIDEBAR */}
      <aside className="pm-sidebar">

        <div className="pm-brand">
          <div className="pm-brand-icon">✦</div>

          <div>
            <h3>TechFlow ERP</h3>
            <span>Manage • Build • Grow</span>
          </div>
        </div>

        <nav className="pm-navigation">

          <button
            className="pm-nav-item active"
            onClick={() =>
              handleNavigation("/project-manager/dashboard")
            }
          >
            <span>▦</span> Dashboard
          </button>

          <button
            className="pm-nav-item"
            onClick={() =>
              handleNavigation("/project-manager/projects")
            }
          >
            <span>▱</span> My Projects
            <small>{totalProjects}</small>
          </button>

          <button
            className="pm-nav-item"
            onClick={() =>
              handleNavigation("/project-manager/team")
            }
          >
            <span>♙</span> Team Members
          </button>

          <button
            className="pm-nav-item"
            onClick={() =>
              handleNavigation("/project-manager/tasks")
            }
          >
            <span>▣</span> Task Management
            <small>{taskStats.total}</small>
          </button>

          <button
            className="pm-nav-item"
            onClick={() =>
              handleNavigation("/project-manager/reports")
            }
          >
            <span>▤</span> Reports
          </button>

          <button
            className="pm-nav-item"
            onClick={() =>
              handleNavigation("/project-manager/settings")
            }
          >
            <span>⚙</span> Settings
          </button>

        </nav>

        <div className="pm-sidebar-bottom">

          <div className="pm-help-box">
            <div className="pm-help-icon">✦</div>

            <div>
              <strong>Need help?</strong>
              <p>Contact support for assistance.</p>
            </div>
          </div>

          <button
            className="pm-logout"
            onClick={handleLogout}
          >
            ↪ &nbsp; Logout
          </button>

          <div className="pm-version">
            Version 1.0.1 <span>● Online</span>
          </div>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="pm-main">

        {/* TOPBAR */}
        <header className="pm-topbar">

          <div className="pm-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search projects, tasks, team members..."
              onChange={(e) => {
                // Search functionality can be added later
              }}
            />
          </div>

          <div className="pm-top-actions">

            <button
              className="pm-notification"
              onClick={() =>
                window.alert("No new notifications.")
              }
              aria-label="Notifications"
            >
              ♧
            </button>

            <div className="pm-user">
              <div className="pm-avatar">PM</div>

              <div>
                <strong>Project Manager</strong>
                <span>Project Manager</span>
              </div>

              <span className="pm-dropdown">⌄</span>
            </div>

          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="pm-content">

          {/* PAGE HEADER */}
          <section className="pm-page-header">

            <div>
              <div className="pm-breadcrumb">
                Dashboard <span>/</span> Project Manager
              </div>

              <h1>Project Manager Dashboard</h1>

              <p>
                Monitor your projects, manage your team, and track
                progress in real-time.
              </p>
            </div>

            <div className="pm-header-actions">

              <button className="pm-outline-btn">
                ▣ &nbsp;
                {new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </button>

              <button
                className="pm-outline-btn"
                onClick={() =>
                  handleNavigation("/project-manager/tasks/create")
                }
              >
                + Create Task
              </button>

              <button
                className="pm-outline-btn"
                onClick={() =>
                  handleNavigation("/project-manager/team")
                }
              >
                ▣ &nbsp; View Team
              </button>

              <button
  className="pm-primary-btn"
  onClick={() => navigate("/project-manager/create-project")}
>
  + New Project
</button>

            </div>
          </section>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="pm-error-message" role="alert">
              {error}
            </div>
          )}

          {/* STAT CARDS */}
          <section className="pm-stats-grid">

            <div className="pm-stat-card">
              <div className="pm-stat-top">
                <span>MY PROJECTS</span>
                <div className="pm-stat-icon blue-icon">▣</div>
              </div>

              <h2>{loading ? "..." : totalProjects}</h2>

              <p>Total assigned projects</p>

              <span className="pm-stat-footer blue-text">
                Projects assigned to you
              </span>
            </div>

            <div className="pm-stat-card">
              <div className="pm-stat-top">
                <span>ACTIVE PROJECTS</span>
                <div className="pm-stat-icon green-icon">↗</div>
              </div>

              <h2>{loading ? "..." : activeProjects}</h2>

              <p>Currently in progress</p>

              <span className="pm-stat-footer green-text">
                ● {activePercentage}% of total projects
              </span>
            </div>

            <div className="pm-stat-card">
              <div className="pm-stat-top">
                <span>TOTAL TASKS</span>
                <div className="pm-stat-icon purple-icon">▤</div>
              </div>

              <h2>{taskStats.total}</h2>

              <p>Tasks across all projects</p>

              <span className="pm-stat-footer purple-text">
                Task statistics
              </span>
            </div>

            <div className="pm-stat-card">
              <div className="pm-stat-top">
                <span>OVERDUE TASKS</span>
                <div className="pm-stat-icon orange-icon">◷</div>
              </div>

              <h2 className="pm-danger-number">
                {taskStats.overdue}
              </h2>

              <p>Tasks requiring attention</p>

              <span className="pm-stat-footer danger-text">
                After assigned deadline
              </span>
            </div>

          </section>

          {/* PROJECTS AND TASK OVERVIEW */}
          <section className="pm-middle-grid">

            {/* MY PROJECTS */}
            <div className="pm-panel pm-projects-panel">

              <div className="pm-panel-header">

                <div>
                  <h3>My Projects</h3>
                  <p>Manage projects within your management</p>
                </div>

                <button
                  className="pm-view-all"
                  onClick={() =>
                    handleNavigation("/project-manager/projects")
                  }
                >
                  View All →
                </button>

              </div>

              <div className="pm-project-list">

                {loading ? (
                  <p>Loading projects...</p>
                ) : error ? (
                  <p>Unable to load projects.</p>
                ) : formattedProjects.length === 0 ? (
                  <p>No projects assigned to you yet.</p>
                ) : (
                  formattedProjects.map((project) => (

                    <div
                      className="pm-project-item"
                      key={project._id}
                    >

                      <div className="pm-project-heading">

                        <div className="pm-project-name">

                          <span
                            className={`pm-dot ${project.color}`}
                          ></span>

                          <strong>{project.name}</strong>

                          <small>({project.code})</small>

                        </div>

                        <div className="pm-project-badges">

                          <span
                            className={`pm-priority ${project.color}`}
                          >
                            {project.priority}
                          </span>

                          <span className="pm-status">
                            {project.status}
                          </span>

                        </div>
                      </div>

                      <div className="pm-progress-info">
                        <span>Progress</span>
                        <strong>{project.progress}%</strong>
                      </div>

                      <div className="pm-progress-track">
                        <div
                          className={`pm-progress-fill ${project.color}`}
                          style={{
                            width: `${project.progress}%`,
                          }}
                        ></div>
                      </div>

                      <div className="pm-project-footer">

                        <div className="pm-team-avatars">
                          <span>Team:</span>

                          {project.team.map((member, index) => (
                            <span
                              className={`pm-team-avatar avatar-${index}`}
                              key={`${project._id}-${index}`}
                            >
                              {member}
                            </span>
                          ))}
                        </div>

                        <div className="pm-project-meta">

                          <span>
                            ▣ Deadline: {project.deadline}
                          </span>

                          <span>
                            ▤ Tasks: {project.tasks}
                          </span>

                        </div>

                      </div>
                    </div>
                  ))
                )}

              </div>
            </div>

            {/* TASK OVERVIEW */}
            <div className="pm-panel pm-task-panel">

              <div className="pm-panel-header">

                <div>
                  <h3>Task Overview</h3>
                  <p>
                    Total {taskStats.total} tasks across projects
                  </p>
                </div>

                <button
                  className="pm-more-btn"
                  onClick={() =>
                    handleNavigation("/project-manager/tasks")
                  }
                >
                  ⋮
                </button>

              </div>

              <div className="pm-chart-container">

                <div className="pm-donut">
                  <div className="pm-donut-center">
                    <strong>{taskStats.total}</strong>
                    <span>TOTAL TASKS</span>
                  </div>
                </div>

              </div>

              <div className="pm-chart-legend">

                <div>
                  <span className="legend-dot todo"></span>
                  <span>To Do</span>
                  <strong>{taskStats.todo} Tasks</strong>
                  <small>25%</small>
                </div>

                <div>
                  <span className="legend-dot progress"></span>
                  <span>In Progress</span>
                  <strong>{taskStats.inProgress} Tasks</strong>
                  <small>33%</small>
                </div>

                <div>
                  <span className="legend-dot completed"></span>
                  <span>Completed</span>
                  <strong>{taskStats.completed} Tasks</strong>
                  <small>25%</small>
                </div>

                <div>
                  <span className="legend-dot overdue"></span>
                  <span>Overdue</span>
                  <strong>{taskStats.overdue} Tasks</strong>
                  <small>17%</small>
                </div>

              </div>
            </div>

          </section>

          {/* TEAM PERFORMANCE AND DEADLINES */}
          <section className="pm-bottom-grid">

            {/* TEAM PERFORMANCE */}
            <div className="pm-panel pm-team-panel">

              <div className="pm-panel-header">

                <div>
                  <h3>Team Performance</h3>
                  <p>
                    Individual task progress and completion rate
                  </p>
                </div>

                <button
                  className="pm-export-btn"
                  onClick={handleExport}
                >
                  Export Details
                </button>

              </div>

              <div className="pm-table-wrapper">

                <table className="pm-team-table">

                  <thead>
                    <tr>
                      <th>TEAM MEMBERS</th>
                      <th>ASSIGNED</th>
                      <th>COMPLETED</th>
                      <th>PENDING</th>
                      <th>PROGRESS</th>
                    </tr>
                  </thead>

                  <tbody>

                    {teamMembers.map((member) => (

                      <tr key={member.initials}>

                        <td>
                          <div className="pm-member-info">

                            <div className="pm-member-avatar">
                              {member.initials}
                            </div>

                            <div>
                              <strong>{member.name}</strong>
                              <span>{member.role}</span>
                            </div>

                          </div>
                        </td>

                        <td>{member.assigned}</td>

                        <td className="pm-completed-cell">
                          {member.completed}
                        </td>

                        <td className="pm-pending-cell">
                          {member.pending}
                        </td>

                        <td>
                          <div className="pm-member-progress">

                            <div className="pm-member-progress-track">
                              <div
                                style={{
                                  width: `${member.progress}%`,
                                }}
                              ></div>
                            </div>

                            <span>{member.progress}%</span>

                          </div>
                        </td>

                      </tr>
                    ))}

                  </tbody>
                </table>

              </div>
            </div>

            {/* UPCOMING DEADLINES */}
            <div className="pm-panel pm-deadlines-panel">

              <div className="pm-panel-header">

                <div>
                  <h3>Upcoming Deadlines</h3>
                  <p>Track your project commitments</p>
                </div>

                <button
                  className="pm-view-all"
                  onClick={() =>
                    handleNavigation("/project-manager/projects")
                  }
                >
                  View All →
                </button>

              </div>

              <div className="pm-deadline-list">

                {deadlines.map((item, index) => (

                  <div
                    className="pm-deadline-item"
                    key={`${item.name}-${index}`}
                  >

                    <div
                      className={`pm-deadline-icon ${item.color}`}
                    >
                      {item.icon}
                    </div>

                    <div className="pm-deadline-details">

                      <div className="pm-deadline-heading">

                        <strong>{item.name}</strong>

                        <span
                          className={`pm-deadline-status ${item.color}`}
                        >
                          {item.status}
                        </span>

                      </div>

                      <span>{item.date}</span>

                      <div className="pm-deadline-task">
                        {item.task}
                      </div>

                    </div>
                  </div>
                ))}

                {!loading && deadlines.length === 0 && (
                  <p>No upcoming project deadlines.</p>
                )}

              </div>
            </div>

          </section>

        </div>
      </main>
    </div>
  );
}

export default ProjectManagerDashboard;