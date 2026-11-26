import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./EmployeeDashboard.css";

const API = "http://localhost:5000/api";

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [search, setSearch] = useState("");

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const [error, setError] = useState("");
  const [projectsError, setProjectsError] = useState("");

  const [showNotifications, setShowNotifications] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(null);

  // AUTHENTICATED USER
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

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // EMPLOYEE DETAILS
  const employeeName =
    user.name ||
    user.fullName ||
    user.username ||
    "Employee";

  const employeeEmail = user.email || "Employee account";

  const employeeInitials = employeeName
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // DATE FORMATTER
  const formatDate = (date) => {
    if (!date) return "Not assigned";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not assigned";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // FETCH EMPLOYEE PROJECTS
  useEffect(() => {
    const fetchEmployeeProjects = async () => {
      try {
        setProjectsLoading(true);
        setProjectsError("");

        const response = await fetch(`${API}/projects/my-projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch projects.");
        }

        const formattedProjects = (data.projects || []).map((project) => ({
          id: project._id,
          name: project.projectName || "Untitled Project",
          code: project.projectCode || "N/A",
          priority: project.priority || "Medium",
          status: project.status || "Not Started",
          role: data.employee?.designation || "Team Member",
          manager: project.projectManager?.name || "Not assigned",
          teamMembers: project.teamMembers?.length || 0,
          progress: Math.min(
            100,
            Math.max(0, Number(project.progress) || 0)
          ),
          deadline: project.deadline,
        }));

        setProjects(formattedProjects);
      } catch (err) {
        setProjectsError(err.message);
      } finally {
        setProjectsLoading(false);
      }
    };

    if (token) {
      fetchEmployeeProjects();
    } else {
      setProjectsError("Please log in again.");
      setProjectsLoading(false);
    }
  }, [token]);

  // FETCH EMPLOYEE TASKS
  useEffect(() => {
    const fetchEmployeeTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API}/tasks/my-tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch tasks.");
        }

        const formattedTasks = (data.tasks || []).map((task) => ({
          id: task._id,
          name: task.taskName || "Untitled Task",
          description: task.description || "No description available",
          project: task.project?.projectName || "No project",
          priority: task.priority || "Medium",
          dueDate: formatDate(task.dueDate),
          dueDateRaw: task.dueDate,
          status: task.status || "To Do",
        }));

        setTasks(formattedTasks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEmployeeTasks();
    } else {
      setError("Please log in again.");
      setLoading(false);
    }
  }, [token]);

  // FETCH EMPLOYEE ACTIVITIES
  useEffect(() => {
    const fetchEmployeeActivities = async () => {
      try {
        setActivitiesLoading(true);

        const response = await fetch(`${API}/activities/my-activities`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch activities.");
        }

        setActivities(data.activities || []);
      } catch (err) {
        console.error("Recent Activities Error:", err);
      } finally {
        setActivitiesLoading(false);
      }
    };

    if (token) {
      fetchEmployeeActivities();
    } else {
      setActivitiesLoading(false);
    }
  }, [token]);

  // TASK STATISTICS
  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "To Do"
  ).length;

  const completionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  // DATE COMPARISON
  const getDateOnly = (date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate()
    );
  };

  const today = getDateOnly(new Date());

  // UPCOMING DEADLINES
  const upcomingDeadlines = tasks
    .filter((task) => {
      if (!task.dueDateRaw || task.status === "Completed") {
        return false;
      }

      const dueDate = getDateOnly(task.dueDateRaw);

      return dueDate && today && dueDate >= today;
    })
    .sort(
      (a, b) =>
        new Date(a.dueDateRaw) - new Date(b.dueDateRaw)
    );

  // OVERDUE TASKS
  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDateRaw || task.status === "Completed") {
      return false;
    }

    const dueDate = getDateOnly(task.dueDateRaw);

    return dueDate && today && dueDate < today;
  }).length;

  // SEARCH
  const filteredTasks = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return tasks;

    return tasks.filter((task) =>
      [
        task.name,
        task.project,
        task.status,
        task.priority,
        task.description,
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchText)
      )
    );
  }, [tasks, search]);

  // SCROLL TO SECTION
  const scrollToSection = (sectionId, menuName) => {
    setActiveMenu(menuName);

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // LOGOUT
  const handleLogout = () => {
    Swal.fire({
      title: "Sign out?",
      text: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2864ef",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        navigate("/employee/login", { replace: true });
      }
    });
  };

  // UPDATE TASK STATUS
  const handleTaskStatus = async (taskId, newStatus) => {
    const previousTask = tasks.find((task) => task.id === taskId);

    if (!previousTask || previousTask.status === newStatus) return;

    try {
      setUpdatingTask(taskId);

      const response = await fetch(
        `${API}/tasks/my-tasks/${taskId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update task status.");
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === taskId
            ? { ...task, status: data.task.status }
            : task
        )
      );

      // Refresh recent activities
      const activityResponse = await fetch(
        `${API}/activities/my-activities`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const activityData = await activityResponse.json();

      if (activityResponse.ok && activityData.success) {
        setActivities(activityData.activities || []);
      }

      Swal.fire({
        icon: "success",
        title: "Status updated",
        text: "Your task status has been updated successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err.message,
        confirmButtonColor: "#2864ef",
      });
    } finally {
      setUpdatingTask(null);
    }
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

        <div className="ed-nav-label">WORKSPACE</div>

        <nav className="ed-navigation">

          <button
            className={activeMenu === "Dashboard" ? "active" : ""}
            onClick={() => scrollToSection("ed-dashboard", "Dashboard")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className={activeMenu === "My Tasks" ? "active" : ""}
            onClick={() => scrollToSection("ed-tasks", "My Tasks")}
          >
            <span>▤</span>
            My Tasks
            <small>{tasks.length}</small>
          </button>

          <button
            className={activeMenu === "My Projects" ? "active" : ""}
            onClick={() => scrollToSection("ed-projects", "My Projects")}
          >
            <span>▱</span>
            My Projects
            <small>{projects.length}</small>
          </button>

          <button
            className={activeMenu === "Notifications" ? "active" : ""}
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setActiveMenu("Notifications");
            }}
          >
            <span>♧</span>
            Notifications
            {activities.length > 0 && (
              <small>{activities.length}</small>
            )}
          </button>

          <button
            className={activeMenu === "My Profile" ? "active" : ""}
            onClick={() => scrollToSection("ed-profile", "My Profile")}
          >
            <span>♙</span>
            My Profile
          </button>

        </nav>

        <div className="ed-sidebar-bottom">

          <div className="ed-sidebar-promo">
            <div className="ed-promo-icon">✧</div>
            <h4>Stay Productive</h4>
            <p>Small progress every day creates great results.</p>
          </div>

          <button className="ed-logout" onClick={handleLogout}>
            <span>⇥</span>
            Sign Out
          </button>

          <div className="ed-sidebar-footer">
            <span>TechFlow ERP</span>
            <span className="ed-online">● Online</span>
          </div>

        </div>
      </aside>

      {/* MAIN */}
      <main className="ed-main" id="ed-dashboard">

        {/* TOPBAR */}
        <header className="ed-topbar">

          <div className="ed-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search tasks, projects, priorities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          <div className="ed-topbar-right">

            <button
              className="ed-notification-button"
              onClick={() => setShowNotifications((prev) => !prev)}
              aria-label="Notifications"
            >
              ♧
              {activities.length > 0 && <span />}
            </button>

            <div className="ed-user-info">
              <div className="ed-avatar">{employeeInitials}</div>

              <div>
                <h4>{employeeName}</h4>
                <p>Employee</p>
              </div>

              <span>⌄</span>
            </div>

          </div>
        </header>

        {/* CONTENT */}
        <div className="ed-content">

          {/* PAGE HEADING */}
          <section className="ed-page-heading">

            <div>
              <div className="ed-breadcrumb">
                Workspace <span>/</span> Dashboard
              </div>

              <div className="ed-welcome-label">
                YOUR WORKSPACE
              </div>

              <h1>Welcome back, {employeeName.split(" ")[0]}.</h1>

              <p>
                Here's an overview of your work, projects and progress.
              </p>
            </div>

            <div className="ed-heading-actions">

              <button
                className="ed-secondary-button"
                onClick={() => scrollToSection("ed-projects", "My Projects")}
              >
                View Projects
              </button>

              <button
                className="ed-primary-button"
                onClick={() => scrollToSection("ed-tasks", "My Tasks")}
              >
                View My Tasks →
              </button>

            </div>
          </section>

          {/* SUMMARY */}
          <section className="ed-summary-grid">

            <div className="ed-summary-card">
              <div className="ed-card-top">
                <span>ASSIGNED TASKS</span>
                <span className="ed-card-icon blue">▤</span>
              </div>

              <h2>{loading ? "—" : tasks.length}</h2>

              <p>Total tasks assigned to you</p>

              <small className="blue-text">
                {pendingTasks} awaiting action
              </small>
            </div>

            <div className="ed-summary-card">
              <div className="ed-card-top">
                <span>IN PROGRESS</span>
                <span className="ed-card-icon purple">ϟ</span>
              </div>

              <h2>{loading ? "—" : inProgressTasks}</h2>

              <p>Tasks currently being worked on</p>

              <small className="purple-text">
                Active work
              </small>
            </div>

            <div className="ed-summary-card">
              <div className="ed-card-top">
                <span>COMPLETED</span>
                <span className="ed-card-icon green">✓</span>
              </div>

              <h2>{loading ? "—" : completedTasks}</h2>

              <p>Successfully completed tasks</p>

              <small className="green-text">
                {completionRate}% completion rate
              </small>
            </div>

            <div className="ed-summary-card">
              <div className="ed-card-top">
                <span>OVERDUE</span>
                <span className="ed-card-icon red">△</span>
              </div>

              <h2>{loading ? "—" : overdueTasks}</h2>

              <p>Tasks past their due date</p>

              <small className="red-text">
                {overdueTasks > 0 ? "Needs your attention" : "All on track"}
              </small>
            </div>

          </section>

          {/* PRODUCTIVITY */}
          <section className="ed-productivity-panel">

            <div className="ed-productivity-info">
              <div>
                <span className="ed-productivity-label">
                  YOUR PRODUCTIVITY
                </span>

                <h3>Task completion overview</h3>

                <p>
                  Keep moving forward. Every completed task counts.
                </p>
              </div>

              <div className="ed-productivity-rate">
                {loading ? "—" : `${completionRate}%`}
              </div>
            </div>

            <div className="ed-productivity-track">
              <div
                className="ed-productivity-value"
                style={{ width: `${completionRate}%` }}
              />
            </div>

            <div className="ed-productivity-footer">
              <span>{completedTasks} completed</span>
              <span>{tasks.length} total tasks</span>
            </div>

          </section>

          {/* TASKS */}
          <section className="ed-panel ed-tasks-panel" id="ed-tasks">

            <div className="ed-section-heading">
              <div>
                <span className="ed-section-eyebrow">WORK MANAGEMENT</span>
                <h3>My Tasks</h3>
                <p>Manage your assigned tasks and update their progress.</p>
              </div>

              <span className="ed-section-count">
                {tasks.length} Tasks
              </span>
            </div>

            <div className="ed-table-wrapper">

              <table className="ed-task-table">

                <thead>
                  <tr>
                    <th>TASK</th>
                    <th>PROJECT</th>
                    <th>PRIORITY</th>
                    <th>DUE DATE</th>
                    <th>STATUS</th>
                    <th>UPDATE</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td colSpan="6" className="ed-empty">
                        Loading your tasks...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="ed-empty ed-error">
                        {error}
                      </td>
                    </tr>
                  ) : filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <tr key={task.id}>

                        <td>
                          <div className="ed-task-name">
                            <span className="ed-task-dot" />

                            <div>
                              <strong>{task.name}</strong>
                              <p>{task.description}</p>
                            </div>
                          </div>
                        </td>

                        <td>{task.project}</td>

                        <td>
                          <span
                            className={`ed-priority ${String(
                              task.priority
                            ).toLowerCase()}`}
                          >
                            {task.priority}
                          </span>
                        </td>

                        <td>{task.dueDate}</td>

                        <td>
                          <span
                            className={`ed-status ${task.status
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {task.status}
                          </span>
                        </td>

                        <td>
                          <select
                            className="ed-task-action"
                            value={task.status}
                            disabled={updatingTask === task.id}
                            onChange={(e) =>
                              handleTaskStatus(task.id, e.target.value)
                            }
                            aria-label={`Update status for ${task.name}`}
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>

                          {updatingTask === task.id && (
                            <span className="ed-updating">
                              Updating...
                            </span>
                          )}
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="ed-empty">
                        {search
                          ? "No tasks match your search."
                          : "No tasks assigned yet."}
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

          {/* LOWER GRID */}
          <div className="ed-bottom-grid">

            {/* PROJECTS */}
            <section
              className="ed-panel ed-projects-panel"
              id="ed-projects"
            >

              <div className="ed-section-heading">
                <div>
                  <span className="ed-section-eyebrow">COLLABORATION</span>
                  <h3>My Projects</h3>
                  <p>Projects you are currently contributing to.</p>
                </div>

                <span className="ed-section-count">
                  {projects.length} Projects
                </span>
              </div>

              {projectsLoading ? (
                <p className="ed-empty">Loading projects...</p>
              ) : projectsError ? (
                <p className="ed-empty ed-error">{projectsError}</p>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <div className="ed-project-card" key={project.id}>

                    <div className="ed-project-title">
                      <div>
                        <span className="ed-project-dot" />

                        <div>
                          <strong>{project.name}</strong>
                          <small>{project.code}</small>
                        </div>
                      </div>

                      <span className="ed-project-status">
                        {project.status}
                      </span>
                    </div>

                    <div className="ed-project-badges">
                      <span className={`ed-project-priority ${project.priority.toLowerCase()}`}>
                        {project.priority} Priority
                      </span>

                      <span>
                        {project.teamMembers} Team Members
                      </span>
                    </div>

                    <div className="ed-project-details">

                      <div>
                        <small>Your Role</small>
                        <strong>{project.role}</strong>
                      </div>

                      <div>
                        <small>Project Manager</small>
                        <strong>{project.manager}</strong>
                      </div>

                    </div>

                    <div className="ed-progress-heading">
                      <span>Project Progress</span>
                      <strong>{project.progress}%</strong>
                    </div>

                    <div className="ed-progress-track">
                      <div
                        className="ed-progress-value"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>

                    <div className="ed-project-footer">
                      <span>
                        Deadline: {formatDate(project.deadline)}
                      </span>
                    </div>

                  </div>
                ))
              ) : (
                <p className="ed-empty">No projects assigned yet.</p>
              )}

            </section>

            {/* RIGHT COLUMN */}
            <div className="ed-right-column">

              {/* DEADLINES */}
              <section className="ed-panel ed-deadlines-panel">

                <div className="ed-section-heading">
                  <div>
                    <span className="ed-section-eyebrow">TIME MANAGEMENT</span>
                    <h3>Upcoming Deadlines</h3>
                  </div>

                  <span className="ed-section-count">
                    {upcomingDeadlines.length}
                  </span>
                </div>

                {loading ? (
                  <p className="ed-empty">Loading deadlines...</p>
                ) : upcomingDeadlines.length > 0 ? (
                  upcomingDeadlines.slice(0, 5).map((task) => (
                    <div className="ed-deadline-item" key={task.id}>

                      <div className="ed-deadline-icon">◷</div>

                      <div className="ed-deadline-content">
                        <strong>{task.name}</strong>
                        <p>{task.project}</p>
                      </div>

                      <div className="ed-deadline-meta">
                        <span>{formatDate(task.dueDateRaw)}</span>
                      </div>

                    </div>
                  ))
                ) : (
                  <p className="ed-empty">
                    No upcoming deadlines. You're all caught up!
                  </p>
                )}

              </section>

              {/* RECENT ACTIVITY */}
              <section className="ed-panel ed-activity-panel">

                <div className="ed-section-heading">
                  <div>
                    <span className="ed-section-eyebrow">YOUR WORKSPACE</span>
                    <h3>Recent Activity</h3>
                  </div>

                  <span className="ed-section-count">
                    {activities.length} Updates
                  </span>
                </div>

                <div className="ed-activity-list">

                  {activitiesLoading ? (
                    <p className="ed-empty">Loading activities...</p>
                  ) : activities.length > 0 ? (
                    activities.slice(0, 6).map((activity) => (
                      <div
                        className="ed-activity-item"
                        key={activity._id}
                      >

                        <span
                          className={`ed-activity-dot ${
                            activity.type || "info"
                          }`}
                        />

                        <div>
                          <p>{activity.title}</p>

                          <small>
                            {new Date(activity.createdAt).toLocaleString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </small>
                        </div>

                      </div>
                    ))
                  ) : (
                    <p className="ed-empty">No recent activities yet.</p>
                  )}

                </div>

              </section>

            </div>
          </div>

          {/* PROFILE */}
          <section
            className="ed-panel ed-profile-panel"
            id="ed-profile"
          >

            <div className="ed-section-heading">
              <div>
                <span className="ed-section-eyebrow">ACCOUNT</span>
                <h3>My Profile</h3>
                <p>Your employee account information.</p>
              </div>
            </div>

            <div className="ed-profile-content">

              <div className="ed-avatar ed-profile-avatar">
                {employeeInitials}
              </div>

              <div className="ed-profile-details">
                <h3>{employeeName}</h3>
                <p>{employeeEmail}</p>
                <span>Employee</span>
              </div>

            </div>

          </section>

          <footer className="ed-footer">
            © 2026 TechFlow ERP. All rights reserved.
            <span>Built for better teamwork.</span>
          </footer>

        </div>

        {/* NOTIFICATIONS */}
        {showNotifications && (
          <>
            <div
              className="ed-popup-backdrop"
              onClick={() => setShowNotifications(false)}
            />

            <div className="ed-notification-popup">

              <div className="ed-section-heading">
                <div>
                  <span className="ed-section-eyebrow">UPDATES</span>
                  <h3>Recent Activity</h3>
                </div>

                <button onClick={() => setShowNotifications(false)}>
                  ✕
                </button>
              </div>

              {activities.length > 0 ? (
                activities.slice(0, 5).map((activity) => (
                  <div className="ed-popup-activity" key={activity._id}>
                    <span className="ed-task-dot" />
                    <p>{activity.title}</p>
                  </div>
                ))
              ) : (
                <p className="ed-empty">No recent updates.</p>
              )}

            </div>
          </>
        )}

      </main>
    </div>
  );
}

export default EmployeeDashboard;