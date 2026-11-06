import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TaskManagement.css";

const API_URL = "http://localhost:5000/api";

function TaskManagement() {
  const navigate = useNavigate();

  // Task states
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [employeeFilter, setEmployeeFilter] = useState("All Team Members");

  // View state
  const [view, setView] = useState("list");

  // FETCH TASKS FROM MONGODB
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication required. Please login again.");
        }

        const response = await fetch(`${API_URL}/tasks`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch tasks");
        }

        if (!Array.isArray(data.tasks)) {
          throw new Error("Invalid task data received from server");
        }

        // Convert MongoDB data into frontend format
        const formattedTasks = data.tasks.map((task) => ({
          _id: task._id,

          name: task.taskName,

          // Display ID generated from MongoDB ObjectId
          taskId: `TASK-${task._id.slice(-6).toUpperCase()}`,

          description: task.description || "",

          project: task.project?.projectName || "N/A",

          assignedTo: task.assignedTo?.name || "Unassigned",

          role: task.assignedTo?.designation || "Team Member",

          priority: task.priority || "Medium",
dueDate: task.dueDate
  ? new Date(task.dueDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  : "N/A",

dueDateValue: task.dueDate,

          status: task.status || "To Do",
        }));

        setTasks(formattedTasks);
      } catch (err) {
        console.error("Fetch Tasks Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // SEARCH AND FILTER TASKS
  const filteredTasks = tasks.filter((task) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      task.name.toLowerCase().includes(searchText) ||
      task.taskId.toLowerCase().includes(searchText) ||
      task.assignedTo.toLowerCase().includes(searchText) ||
      task.project.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All Statuses" ||
      task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All Priorities" ||
      task.priority === priorityFilter;

    const matchesProject =
      projectFilter === "All Projects" ||
      task.project === projectFilter;

    const matchesEmployee =
      employeeFilter === "All Team Members" ||
      task.assignedTo === employeeFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesProject &&
      matchesEmployee
    );
  });

  // DYNAMIC FILTER OPTIONS
  const projects = [
    ...new Set(tasks.map((task) => task.project)),
  ];

  const employees = [
    ...new Set(tasks.map((task) => task.assignedTo)),
  ];

  // SUMMARY COUNTS
  const completedCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;
  const todoCount = tasks.filter(
  (task) => task.status === "To Do"
).length;

// OVERDUE TASK COUNT
const overdueCount = tasks.filter((task) => {
  if (task.status === "Completed" || !task.dueDateValue) {
    return false;
  }

  const dueDate = new Date(task.dueDateValue);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}).length;

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/project-manager/login");
  };

  // STATUS CLASS
  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "completed";

      case "In Progress":
        return "in-progress";

      default:
        return "todo";
    }
  };

  // PRIORITY CLASS
  const getPriorityClass = (priority) => {
    return priority.toLowerCase();
  };

  // CLEAR FILTERS
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All Statuses");
    setPriorityFilter("All Priorities");
    setProjectFilter("All Projects");
    setEmployeeFilter("All Team Members");
  };

  return (
    <div className="tm-page">

      {/* SIDEBAR */}
      <aside className="tm-sidebar">

        <div className="tm-logo">
          <div className="tm-logo-icon">✦</div>

          <div>
            <h3>TechFlow ERP</h3>
            <p>Manage • Build • Grow</p>
          </div>
        </div>

        <nav className="tm-navigation">

          <button
            onClick={() =>
              navigate("/project-manager/dashboard")
            }
          >
            ▦ <span>Dashboard</span>
          </button>

          <button
            onClick={() =>
              navigate("/project-manager/projects")
            }
          >
            ▱ <span>My Projects</span>
          </button>

          <button
            onClick={() =>
              navigate("/project-manager/team")
            }
          >
            ♙ <span>Team Members</span>
          </button>

          <button className="active">
            ☷ <span>Task Management</span>
            <small>{tasks.length}</small>
          </button>

          <button>
            ▤ <span>Reports</span>
          </button>

          <button>
            ⚙ <span>Settings</span>
          </button>

        </nav>

        <div className="tm-sidebar-bottom">

          <div className="tm-help">
            <strong>✦ Better Teams</strong>
            <p>
              Manage projects and improve productivity.
            </p>
          </div>

          <button onClick={handleLogout}>
            ↪ Logout
          </button>

          <div className="tm-version">
            TechFlow ERP v1.0.0
            <span>● Online</span>
          </div>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="tm-main">

        {/* TOPBAR */}
        <header className="tm-topbar">

          <div className="tm-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search projects, tasks, team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="tm-user-profile">

            <button className="tm-notification">
              ♧
            </button>

            <div className="tm-avatar">
              PM
            </div>

            <div>
              <strong>Project Manager</strong>
              <small>Project Manager</small>
            </div>

          </div>

        </header>

        {/* CONTENT */}
        <section className="tm-content">

          {/* BREADCRUMB */}
          <div className="tm-breadcrumb">
            Dashboard / <span>Task Management</span>
          </div>

          {/* PAGE HEADING */}
          <div className="tm-heading">

            <div>
              <h1>Task Management</h1>

              <p>
                Create tasks, assign work to team members,
                and monitor progress.
              </p>
            </div>

            <button
              className="tm-create-btn"
              onClick={() =>
                navigate("/project-manager/tasks/create")
              }
            >
              + Create Task
            </button>

          </div>

          {/* SUMMARY CARDS */}
          <div className="tm-stats-grid">

            <div className="tm-stat-card">

              <div className="tm-stat-top">
                <span>TOTAL TASKS</span>

                <div className="tm-stat-icon blue">
                  ▣
                </div>
              </div>

              <h2>{tasks.length}</h2>

              <p>All project tasks</p>

            </div>

            <div className="tm-stat-card">

              <div className="tm-stat-top">
                <span>TO DO</span>

                <div className="tm-stat-icon orange">
                  ◷
                </div>
              </div>

              <h2>{todoCount}</h2>

              <p>Awaiting kickoff</p>

            </div>

            <div className="tm-stat-card">

              <div className="tm-stat-top">
                <span>IN PROGRESS</span>

                <div className="tm-stat-icon purple">
                  ⌁
                </div>
              </div>

              <h2>{inProgressCount}</h2>

              <p>Currently active</p>

            </div>

            <div className="tm-stat-card">

              <div className="tm-stat-top">
                <span>COMPLETED</span>

                <div className="tm-stat-icon green">
                  ✓
                </div>
              </div>

              <h2>{completedCount}</h2>

              <p>Delivered tasks</p>

            </div>

          </div>
{/* OVERDUE ALERT */}
{overdueCount > 0 && (
  <div className="tm-alert">
    <span>ⓘ</span>

    <strong>ATTENTION REQUIRED:</strong>

    <p>
      {overdueCount} task(s) are currently overdue.
    </p>

    <button
      onClick={() => {
        setStatusFilter("All Statuses");
        setPriorityFilter("All Priorities");
        setProjectFilter("All Projects");
        setEmployeeFilter("All Team Members");
        setSearch("");
      }}
    >
      Clear Filters
    </button>
  </div>
)}

          {/* FILTER SECTION */}
          <div className="tm-filter-card">

            <div className="tm-filter-top">

              {/* SEARCH */}
              <div className="tm-filter-search">

                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search tasks by name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

              </div>

              {/* PROJECT FILTER */}
              <select
                value={projectFilter}
                onChange={(e) =>
                  setProjectFilter(e.target.value)
                }
              >

                <option>All Projects</option>

                {projects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}

              </select>

              {/* EMPLOYEE FILTER */}
              <select
                value={employeeFilter}
                onChange={(e) =>
                  setEmployeeFilter(e.target.value)
                }
              >

                <option>All Team Members</option>

                {employees.map((employee) => (
                  <option key={employee} value={employee}>
                    {employee}
                  </option>
                ))}

              </select>

              {/* VIEW BUTTONS */}
              <div className="tm-view-buttons">

                <button
                  className={
                    view === "list" ? "selected" : ""
                  }
                  onClick={() => setView("list")}
                >
                  ☷ List View
                </button>

                <button
                  className={
                    view === "kanban" ? "selected" : ""
                  }
                  onClick={() => setView("kanban")}
                >
                  ▦ Kanban Board
                </button>

              </div>

            </div>

            <div className="tm-filter-bottom">

              {/* STATUS FILTER */}
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >

                <option>All Statuses</option>
                <option>To Do</option>
                <option>In Progress</option>
                <option>Completed</option>

              </select>

              {/* PRIORITY FILTER */}
              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value)
                }
              >

                <option>All Priorities</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>

              </select>

            </div>

          </div>

          {/* TASK LIST */}
          {loading ? (

            <div className="tm-table-card">
              <p className="tm-empty">
                Loading tasks...
              </p>
            </div>

          ) : error ? (

            <div className="tm-table-card">
              <p className="tm-empty">
                {error}
              </p>
            </div>

          ) : view === "list" ? (

            /* LIST VIEW */
            <div className="tm-table-card">

              <div className="tm-table-scroll">

                <table className="tm-table">

                  <thead>
                    <tr>
                      <th>TASK NAME</th>
                      <th>TASK ID</th>
                      <th>PROJECT</th>
                      <th>ASSIGNED TO</th>
                      <th>PRIORITY</th>
                      <th>DUE DATE</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredTasks.length > 0 ? (

                      filteredTasks.map((task) => (

                        <tr key={task._id}>

                          <td>
                            <strong>{task.name}</strong>

                            <small>
                              {task.description}
                            </small>
                          </td>

                          <td>
                            <span className="tm-task-id">
                              {task.taskId}
                            </span>
                          </td>

                          <td>
                            {task.project}
                          </td>

                          <td>
                            <strong>
                              {task.assignedTo}
                            </strong>

                            <small>
                              {task.role}
                            </small>
                          </td>

                          <td>

                            <span
                              className={`tm-priority ${getPriorityClass(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>

                          </td>

                          <td>
                            {task.dueDate}
                          </td>

                          <td>

                            <span
                              className={`tm-status ${getStatusClass(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>

                          </td>

                          <td>

                            <button
                              className="tm-more-btn"
                              onClick={() =>
                                window.alert(
                                  `Task: ${task.name}\nID: ${task.taskId}`
                                )
                              }
                            >
                              ⋮
                            </button>

                          </td>

                        </tr>

                      ))

                    ) : (

                      <tr>
                        <td colSpan="8" className="tm-empty">
                          No tasks found.
                        </td>
                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

              <div className="tm-pagination">

                Showing {filteredTasks.length} of {tasks.length} tasks

              </div>

            </div>

          ) : (

            /* KANBAN VIEW */
            <div className="tm-kanban">

              {["To Do", "In Progress", "Completed"].map(
                (status) => (

                  <div
                    className="tm-kanban-column"
                    key={status}
                  >

                    <h3>

                      {status}

                      <span>
                        {
                          filteredTasks.filter(
                            (task) => task.status === status
                          ).length
                        }
                      </span>

                    </h3>

                    {filteredTasks
                      .filter(
                        (task) => task.status === status
                      )
                      .map((task) => (

                        <div
                          className="tm-kanban-task"
                          key={task._id}
                        >

                          <strong>
                            {task.name}
                          </strong>

                          <p>
                            {task.description}
                          </p>

                          <small>
                            {task.project}
                          </small>

                          <div>
                            {task.assignedTo}
                          </div>

                          <span
                            className={`tm-priority ${getPriorityClass(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>

                        </div>

                      ))}

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default TaskManagement;