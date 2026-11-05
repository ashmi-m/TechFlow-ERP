
import React from "react";
import "./ProjectManagerDashboard.css";

const projects = [
  {
    id: 1,
    name: "E-commerce Website",
    code: "PRJ001",
    priority: "High Priority",
    status: "In Progress",
    progress: 80,
    color: "blue",
    deadline: "30 Jun, 2026",
    tasks: "14/20",
    team: ["AM", "JD", "SK", "RK"],
  },
  {
    id: 2,
    name: "CRM Application",
    code: "PRJ002",
    priority: "Medium Priority",
    status: "In Progress",
    progress: 60,
    color: "orange",
    deadline: "15 Jul, 2026",
    tasks: "12/20",
    team: ["SK", "AM", "JD"],
  },
  {
    id: 3,
    name: "ERP Dashboard",
    code: "PRJ003",
    priority: "High Priority",
    status: "Planning",
    progress: 35,
    color: "purple",
    deadline: "28 Jul, 2026",
    tasks: "7/20",
    team: ["JD", "RK", "SK"],
  },
];

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

const deadlines = [
  {
    icon: "▣",
    name: "E-commerce Website",
    date: "10 Nov, 2026",
    task: "UI Design & Development",
    status: "In Progress",
    color: "blue",
  },
  {
    icon: "▤",
    name: "CRM Application",
    date: "15 Nov, 2026",
    task: "API Integration",
    status: "Upcoming",
    color: "orange",
  },
  {
    icon: "▧",
    name: "ERP Dashboard",
    date: "20 Nov, 2026",
    task: "Dashboard Development",
    status: "Planning",
    color: "purple",
  },
];

function ProjectManagerDashboard() {
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
          <button className="pm-nav-item active">
            <span>▦</span> Dashboard
          </button>

          <button className="pm-nav-item">
            <span>▱</span> My Projects
            <small>5</small>
          </button>

          <button className="pm-nav-item">
            <span>♙</span> Team Members
          </button>

          <button className="pm-nav-item">
            <span>▣</span> Task Management
            <small>24</small>
          </button>

          <button className="pm-nav-item">
            <span>▤</span> Reports
          </button>

          <button className="pm-nav-item">
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

          <button className="pm-logout">
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
            />
          </div>

          <div className="pm-top-actions">
            <button className="pm-notification">♧</button>

            <div className="pm-user">
              <div className="pm-avatar">RK</div>
              <div>
                <strong>Rahul Kumar</strong>
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
                ▣ &nbsp; Today, 04 Nov 2026
              </button>

              <button className="pm-outline-btn">
                + Create Task
              </button>

              <button className="pm-outline-btn">
                ▣ &nbsp; View Team
              </button>

              <button className="pm-primary-btn">
                + New Project
              </button>
            </div>

          </section>

          {/* STAT CARDS */}
          <section className="pm-stats-grid">

            <div className="pm-stat-card">
              <div className="pm-stat-top">
                <span>MY PROJECTS</span>
                <div className="pm-stat-icon blue-icon">▣</div>
              </div>
              <h2>5</h2>
              <p>Total assigned projects</p>
              <span className="pm-stat-footer blue-text">
                ↑ 2 This growing stage
              </span>
            </div>

            <div className="pm-stat-card">
              <div className="pm-stat-top">
                <span>ACTIVE PROJECTS</span>
                <div className="pm-stat-icon green-icon">↗</div>
              </div>
              <h2>3</h2>
              <p>Currently in progress</p>
              <span className="pm-stat-footer green-text">
                ● 60% of total projects
              </span>
            </div>

            <div className="pm-stat-card">
              <div className="pm-stat-top">
                <span>TOTAL TASKS</span>
                <div className="pm-stat-icon purple-icon">▤</div>
              </div>
              <h2>24</h2>
              <p>Tasks across all projects</p>
              <span className="pm-stat-footer purple-text">
                ↑ 12 completed this year
              </span>
            </div>

            <div className="pm-stat-card">
              <div className="pm-stat-top">
                <span>OVERDUE TASKS</span>
                <div className="pm-stat-icon orange-icon">◷</div>
              </div>
              <h2 className="pm-danger-number">4</h2>
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
                <button className="pm-view-all">View All →</button>
              </div>

              <div className="pm-project-list">

                {projects.map((project) => (
                  <div className="pm-project-item" key={project.id}>

                    <div className="pm-project-heading">
                      <div className="pm-project-name">
                        <span className={`pm-dot ${project.color}`}></span>
                        <strong>{project.name}</strong>
                        <small>({project.code})</small>
                      </div>

                      <div className="pm-project-badges">
                        <span className={`pm-priority ${project.color}`}>
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
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>

                    <div className="pm-project-footer">

                      <div className="pm-team-avatars">
                        <span>Team:</span>
                        {project.team.map((member, index) => (
                          <span
                            className={`pm-team-avatar avatar-${index}`}
                            key={member}
                          >
                            {member}
                          </span>
                        ))}
                      </div>

                      <div className="pm-project-meta">
                        <span>▣ Deadline: {project.deadline}</span>
                        <span>▤ Tasks: {project.tasks}</span>
                      </div>

                    </div>
                  </div>
                ))}

              </div>
            </div>

            {/* TASK OVERVIEW */}
            <div className="pm-panel pm-task-panel">

              <div className="pm-panel-header">
                <div>
                  <h3>Task Overview</h3>
                  <p>Total 24 tasks across projects</p>
                </div>
                <button className="pm-more-btn">⋮</button>
              </div>

              <div className="pm-chart-container">
                <div className="pm-donut">
                  <div className="pm-donut-center">
                    <strong>24</strong>
                    <span>TOTAL TASKS</span>
                  </div>
                </div>
              </div>

              <div className="pm-chart-legend">
                <div>
                  <span className="legend-dot todo"></span>
                  <span>To Do</span>
                  <strong>6 Tasks</strong>
                  <small>25%</small>
                </div>

                <div>
                  <span className="legend-dot progress"></span>
                  <span>In Progress</span>
                  <strong>8 Tasks</strong>
                  <small>33%</small>
                </div>

                <div>
                  <span className="legend-dot completed"></span>
                  <span>Completed</span>
                  <strong>6 Tasks</strong>
                  <small>25%</small>
                </div>

                <div>
                  <span className="legend-dot overdue"></span>
                  <span>Overdue</span>
                  <strong>4 Tasks</strong>
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
                  <p>Individual task progress and completion rate</p>
                </div>
                <button className="pm-export-btn">
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
                                style={{ width: `${member.progress}%` }}
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
                <button className="pm-view-all">View All →</button>
              </div>

              <div className="pm-deadline-list">

                {deadlines.map((item, index) => (
                  <div className="pm-deadline-item" key={index}>

                    <div className={`pm-deadline-icon ${item.color}`}>
                      {item.icon}
                    </div>

                    <div className="pm-deadline-details">
                      <div className="pm-deadline-heading">
                        <strong>{item.name}</strong>
                        <span className={`pm-deadline-status ${item.color}`}>
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

              </div>

            </div>

          </section>

        </div>
      </main>
    </div>
  );
}

export default ProjectManagerDashboard;
