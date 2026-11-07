import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css";

const sampleTasks = [
  {
    id: 1,
    name: "Design Homepage UI",
    description: "Design responsive homepage layout and sections.",
    project: "E-commerce Website",
    priority: "High",
    dueDate: "22 Oct 2026",
    status: "Completed",
  },
  {
    id: 2,
    name: "CRM Dashboard Design",
    description: "Create dashboard widgets and user interface.",
    project: "CRM Application",
    priority: "Medium",
    dueDate: "24 Oct 2026",
    status: "To Do",
  },
  {
    id: 3,
    name: "Update Product Page UI",
    description: "Improve product cards and layout structure.",
    project: "E-commerce Website",
    priority: "High",
    dueDate: "23 Oct 2026",
    status: "In Progress",
  },
  {
    id: 4,
    name: "Create Mobile UI Components",
    description: "Develop reusable mobile responsive components.",
    project: "Mobile Application",
    priority: "Medium",
    dueDate: "25 Oct 2026",
    status: "In Progress",
  },
  {
    id: 5,
    name: "Prepare Design Assets",
    description: "Prepare UI assets, icons and design resources.",
    project: "CRM Application",
    priority: "Low",
    dueDate: "20 Oct 2026",
    status: "Overdue",
  },
];

const projects = [
  {
    id: 1,
    name: "E-commerce Website",
    code: "PRJ001",
    priority: "High Priority",
    status: "In Progress",
    role: "UI/UX Designer",
    manager: "Rahul Sharma",
    tasks: "4 Tasks",
    progress: 60,
    deadline: "30 Nov 2026",
  },
  {
    id: 2,
    name: "CRM Application",
    code: "PRJ002",
    priority: "Medium Priority",
    status: "In Progress",
    role: "UI/UX Designer",
    manager: "Rahul Sharma",
    tasks: "4 Tasks",
    progress: 45,
    deadline: "15 Dec 2026",
  },
];

const deadlines = [
  {
    name: "Update Product Page UI",
    project: "E-commerce Website",
    priority: "High",
    time: "Tomorrow",
  },
  {
    name: "Create Mobile UI Components",
    project: "Mobile Application",
    priority: "Medium",
    time: "In 2 days",
  },
  {
    name: "CRM Dashboard Design",
    project: "CRM Application",
    priority: "Medium",
    time: "In 5 days",
  },
];

const activities = [
  {
    title: "You completed the Design Homepage UI task.",
    time: "Today, 10:30 AM",
    type: "success",
  },
  {
    title: "Rahul Sharma assigned you a new task: Update Product Page UI.",
    time: "Yesterday, 2:15 PM",
    type: "info",
  },
  {
    title: "You updated the progress of a project task to 75%.",
    time: "2 days ago",
    type: "info",
  },
  {
    title: "A project deadline is approaching: Update Product Page UI.",
    time: "3 days ago",
    type: "warning",
  },
];

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState(sampleTasks);
  const [showNotifications, setShowNotifications] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") ||
    sessionStorage.getItem("user") ||
    "{}"
  );

  const employeeName =
    user.name ||
    user.fullName ||
    user.username ||
    "Anjali Menon";

  const employeeInitials = employeeName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const overdueTasks = tasks.filter(
    (task) => task.status === "Overdue"
  ).length;

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText = search.toLowerCase();

      return (
        task.name.toLowerCase().includes(searchText) ||
        task.project.toLowerCase().includes(searchText) ||
        task.status.toLowerCase().includes(searchText)
      );
    });
  }, [tasks, search]);

  const scrollToSection = (sectionId, menuName) => {
    setActiveMenu(menuName);

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/", { replace: true });
  };

  const handleTaskStatus = (taskId, newStatus) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus }
          : task
      )
    );
  };

  return (
    <div className="ed-layout">

      {/* SIDEBAR */}
      <aside className="ed-sidebar">

        <div className="ed-brand">
          <div className="ed-brand-icon">✦</div>

          <div>
            <h2>TechFlow ERP</h2>
            <p>Manage · Build · Grow</p>
          </div>
        </div>

        <nav className="ed-navigation">

          <button
            className={activeMenu === "Dashboard" ? "active" : ""}
            onClick={() => scrollToSection("ed-dashboard", "Dashboard")}
          >
            <span>▦</span> Dashboard
          </button>

          <button
            onClick={() => scrollToSection("ed-tasks", "My Tasks")}
            className={activeMenu === "My Tasks" ? "active" : ""}
          >
            <span>▤</span> My Tasks
            <small>{tasks.length}</small>
          </button>

          <button
            onClick={() => scrollToSection("ed-projects", "My Projects")}
            className={activeMenu === "My Projects" ? "active" : ""}
          >
            <span>▱</span> My Projects
            <small>{projects.length}</small>
          </button>

          <button
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setActiveMenu("Notifications");
            }}
            className={activeMenu === "Notifications" ? "active" : ""}
          >
            <span>♧</span> Notifications
            <small className="ed-notification-count">3</small>
          </button>

          <button
            onClick={() => scrollToSection("ed-profile", "My Profile")}
            className={activeMenu === "My Profile" ? "active" : ""}
          >
            <span>♙</span> My Profile
          </button>

        </nav>

        <div className="ed-sidebar-bottom">

          <div className="ed-sidebar-promo">
            <span>◷</span>
            <h4>Better Teams</h4>
            <p>Organize activities and grow together.</p>
          </div>

          <button className="ed-logout" onClick={handleLogout}>
            <span>⇥</span> Logout
          </button>

          <div className="ed-sidebar-footer">
            <span>Version 1.0.0</span>
            <span className="ed-online">
              ● Online
            </span>
          </div>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ed-main" id="ed-dashboard">

        {/* TOP HEADER */}
        <header className="ed-topbar">

          <div className="ed-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search my tasks and projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="ed-topbar-right">

            <button
              className="ed-notification-button"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              ♧
              <span></span>
            </button>

            <div className="ed-user-info">
              <div className="ed-avatar">
                {employeeInitials}
              </div>

              <div>
                <h4>{employeeName}</h4>
                <p>Employee</p>
              </div>

              <span>⌄</span>
            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}
        <div className="ed-content">

          {/* PAGE TITLE */}
          <section className="ed-page-heading">

            <div>
              <div className="ed-breadcrumb">
                Dashboard <span>/</span> Employee
              </div>

              <h1>Employee Dashboard</h1>

              <p>
                Track your tasks, monitor project progress, and stay organized.
              </p>
            </div>

            <div className="ed-heading-actions">
              <button
                className="ed-secondary-button"
                onClick={() => scrollToSection("ed-projects", "My Projects")}
              >
                View My Projects
              </button>

              <button
                className="ed-secondary-button"
                onClick={() => scrollToSection("ed-profile", "My Profile")}
              >
                Update My Profile
              </button>

              <button
                className="ed-primary-button"
                onClick={() => scrollToSection("ed-tasks", "My Tasks")}
              >
                ▤ View My Tasks
              </button>
            </div>

          </section>

          {/* SUMMARY CARDS */}
          <section className="ed-summary-grid">

            <div className="ed-summary-card">
              <div className="ed-card-top">
                <span>MY TASKS</span>
                <span className="ed-card-icon blue">▤</span>
              </div>

              <h2>{tasks.length + 3}</h2>
              <p>Total tasks assigned to me</p>
              <small className="blue-text">↗ 2 tasks due this week</small>
            </div>

            <div className="ed-summary-card">
              <div className="ed-card-top">
                <span>IN PROGRESS</span>
                <span className="ed-card-icon purple">ϟ</span>
              </div>

              <h2>{inProgressTasks}</h2>
              <p>Tasks currently being worked on</p>
              <small className="green-text">● Active project activities</small>
            </div>

            <div className="ed-summary-card">
              <div className="ed-card-top">
                <span>COMPLETED</span>
                <span className="ed-card-icon green">✓</span>
              </div>

              <h2>{completedTasks + 3}</h2>
              <p>Tasks successfully completed</p>
              <small className="green-text">↗ 80% completion rate</small>
            </div>

            <div className="ed-summary-card">
              <div className="ed-card-top">
                <span>OVERDUE</span>
                <span className="ed-card-icon red">△</span>
              </div>

              <h2>{overdueTasks}</h2>
              <p>Task requiring immediate attention</p>
              <small className="red-text">Attention required</small>
            </div>

          </section>

          {/* TASK MANAGEMENT */}
          <section className="ed-panel ed-tasks-panel" id="ed-tasks">

            <div className="ed-section-heading">
              <h3>My Tasks</h3>

              <button onClick={() => setSearch("")}>
                View All Tasks →
              </button>
            </div>

            <div className="ed-table-wrapper">
              <table className="ed-task-table">

                <thead>
                  <tr>
                    <th>TASK NAME</th>
                    <th>PROJECT</th>
                    <th>PRIORITY</th>
                    <th>DUE DATE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.map((task) => (

                    <tr key={task.id}>

                      <td>
                        <div className="ed-task-name">
                          <span className="ed-task-dot"></span>

                          <div>
                            <strong>{task.name}</strong>
                            <p>{task.description}</p>
                          </div>
                        </div>
                      </td>

                      <td>{task.project}</td>

                      <td>
                        <span className={`ed-priority ${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </td>

                      <td>{task.dueDate}</td>

                      <td>
                        <span className={`ed-status ${task.status.toLowerCase().replace(" ", "-")}`}>
                          ● {task.status}
                        </span>
                      </td>

                      <td>
                        <select
                          className="ed-task-action"
                          value={task.status}
                          onChange={(e) =>
                            handleTaskStatus(task.id, e.target.value)
                          }
                          aria-label={`Update status for ${task.name}`}
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </td>

                    </tr>

                  ))}

                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan="6" className="ed-empty">
                        No tasks found.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>

            <div className="ed-table-footer">
              Showing {filteredTasks.length} of {tasks.length} assigned tasks
            </div>

          </section>

          {/* BOTTOM GRID */}
          <div className="ed-bottom-grid">

            {/* PROJECTS */}
            <section className="ed-panel ed-projects-panel" id="ed-projects">

              <div className="ed-section-heading">
                <h3>
                  My Projects <span className="ed-count-badge">2 Active</span>
                </h3>

                <button>View All Projects →</button>
              </div>

              <p className="ed-muted">
                Projects you are currently contributing to.
              </p>

              {projects.map((project) => (

                <div className="ed-project-card" key={project.id}>

                  <div className="ed-project-title">
                    <div>
                      <span className="ed-project-dot"></span>
                      <strong>{project.name}</strong>
                      <small>({project.code})</small>
                    </div>

                    <span className="ed-project-status">
                      {project.status}
                    </span>
                  </div>

                  <div className="ed-project-badges">
                    <span className="ed-project-priority">
                      {project.priority}
                    </span>
                    <span>{project.tasks}</span>
                  </div>

                  <div className="ed-project-details">
                    <div>
                      <small>Role</small>
                      <strong>{project.role}</strong>
                    </div>

                    <div>
                      <small>Project Manager</small>
                      <strong>{project.manager}</strong>
                    </div>
                  </div>

                  <div className="ed-progress-heading">
                    <span>Overall Project Progress</span>
                    <strong>{project.progress}%</strong>
                  </div>

                  <div className="ed-progress-track">
                    <div
                      className="ed-progress-value"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>

                  <div className="ed-project-footer">
                    <span>Deadline: {project.deadline}</span>
                    <button>View Project</button>
                  </div>

                </div>

              ))}

            </section>

            {/* RIGHT COLUMN */}
            <div className="ed-right-column">

              {/* UPCOMING DEADLINES */}
              <section className="ed-panel ed-deadlines-panel">

                <div className="ed-section-heading">
                  <h3>◷ Upcoming Deadlines</h3>
                  <button>View All</button>
                </div>

                {deadlines.map((deadline, index) => (

                  <div className="ed-deadline-item" key={index}>

                    <div>
                      <strong>{deadline.name}</strong>
                      <p>{deadline.project}</p>
                    </div>

                    <div className="ed-deadline-meta">
                      <span className={`ed-priority ${deadline.priority.toLowerCase()}`}>
                        {deadline.priority}
                      </span>
                      <small>{deadline.time}</small>
                    </div>

                  </div>

                ))}

              </section>

              {/* RECENT ACTIVITY */}
              <section className="ed-panel ed-activity-panel">

                <div className="ed-section-heading">
                  <h3>Recent Activity</h3>
                  <span>Past 3 days</span>
                </div>

                <div className="ed-activity-list">

                  {activities.map((activity, index) => (

                    <div className="ed-activity-item" key={index}>

                      <span className={`ed-activity-dot ${activity.type}`}></span>

                      <div>
                        <p>{activity.title}</p>
                        <small>{activity.time}</small>
                      </div>

                    </div>

                  ))}

                </div>

              </section>

            </div>

          </div>

          {/* PROFILE */}
          <section className="ed-panel ed-profile-panel" id="ed-profile">

            <div className="ed-section-heading">
              <h3>My Profile</h3>
              <span>Employee Information</span>
            </div>

            <div className="ed-profile-content">
              <div className="ed-avatar ed-profile-avatar">
                {employeeInitials}
              </div>

              <div>
                <h3>{employeeName}</h3>
                <p>{user.email || "Employee account"}</p>
                <span>Employee</span>
              </div>
            </div>

          </section>

          <footer className="ed-footer">
            © 2026 TechFlow ERP. All rights reserved.
          </footer>

        </div>

        {/* NOTIFICATIONS POPUP */}
        {showNotifications && (
          <div className="ed-notification-popup">
            <div className="ed-section-heading">
              <h3>Notifications</h3>

              <button onClick={() => setShowNotifications(false)}>
                ✕
              </button>
            </div>

            <p>New task assigned to you.</p>
            <p>Your project deadline is approaching.</p>
            <p>Task status updated successfully.</p>
          </div>
        )}

      </main>

    </div>
  );
}

export default EmployeeDashboard;