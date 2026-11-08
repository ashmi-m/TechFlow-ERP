


import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./EmployeeMyTasks.css";

const API_URL = "http://localhost:5000/api";

const EmployeeMyTasks = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [employee, setEmployee] = useState(null);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [dueFilter, setDueFilter] = useState("All Due Dates");

  const [selectedTask, setSelectedTask] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 8;

  // Get token from localStorage or sessionStorage
  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  // Get employee information
  const getEmployee = () => {
    try {
      const storedUser =
        localStorage.getItem("user") ||
        sessionStorage.getItem("user");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  };

  // Check whether task is overdue
  const isOverdue = (task) => {
    if (!task.dueDate || task.status === "Completed") {
      return false;
    }

    const dueDate = new Date(task.dueDate);
    const today = new Date();

    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return dueDate < today;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Fetch employee tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Login Required",
          text: "Please login to view your tasks.",
        });

        navigate("/employee/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/tasks/my-tasks`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch tasks");
      }

      setTasks(data.tasks || []);
      setEmployee(data.employee || getEmployee());
    } catch (error) {
      console.error("Fetch Tasks Error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Load Tasks",
        text: error.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEmployee(getEmployee());
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Summary cards
  const totalTasks = tasks.length;

  const todoTasks = tasks.filter(
    (task) => task.status === "To Do"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const overdueTasks = tasks.filter(isOverdue);

  // Unique project names
  const projects = useMemo(() => {
    return [
      ...new Set(
        tasks
          .map((task) => task.project?.projectName)
          .filter(Boolean)
      ),
    ];
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const taskName = task.taskName?.toLowerCase() || "";
      const projectName =
        task.project?.projectName?.toLowerCase() || "";

      const matchesSearch =
        taskName.includes(search.toLowerCase()) ||
        projectName.includes(search.toLowerCase());

      const matchesProject =
        projectFilter === "All Projects" ||
        task.project?.projectName === projectFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All Priorities" ||
        task.priority === priorityFilter;

      let matchesDueDate = true;

      if (dueFilter === "Overdue") {
        matchesDueDate = isOverdue(task);
      } else if (dueFilter === "Due Today") {
        if (!task.dueDate) {
          matchesDueDate = false;
        } else {
          const due = new Date(task.dueDate);
          const today = new Date();

          due.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          matchesDueDate = due.getTime() === today.getTime();
        }
      } else if (dueFilter === "Upcoming") {
        if (!task.dueDate || isOverdue(task)) {
          matchesDueDate = false;
        } else {
          const due = new Date(task.dueDate);
          const today = new Date();

          due.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          matchesDueDate = due > today;
        }
      }

      return (
        matchesSearch &&
        matchesProject &&
        matchesStatus &&
        matchesPriority &&
        matchesDueDate
      );
    });
  }, [
    tasks,
    search,
    projectFilter,
    statusFilter,
    priorityFilter,
    dueFilter,
  ]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTasks.length / tasksPerPage)
  );

  const startIndex = (currentPage - 1) * tasksPerPage;

  const displayedTasks = filteredTasks.slice(
    startIndex,
    startIndex + tasksPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    projectFilter,
    statusFilter,
    priorityFilter,
    dueFilter,
  ]);

  // Update task status
  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find((item) => item._id === taskId);

    if (!task || task.status === newStatus) return;

    const result = await Swal.fire({
      title: "Update Task Status?",
      text: `Change "${task.taskName}" to ${newStatus}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Update",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2864ef",
    });

    if (!result.isConfirmed) return;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/tasks/my-tasks/${taskId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update task status"
        );
      }

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item._id === taskId
            ? { ...item, status: data.task.status }
            : item
        )
      );

      setSelectedTask((previousTask) =>
        previousTask?._id === taskId
          ? { ...previousTask, status: data.task.status }
          : previousTask
      );

      Swal.fire({
        icon: "success",
        title: "Status Updated!",
        text: data.message,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Update Task Error:", error);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message,
      });
    }
  };

  // Logout
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2864ef",
      confirmButtonText: "Yes, Logout",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      navigate("/employee/login");
    }
  };

  const employeeName =
    employee?.name || employee?.email || "Employee";

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getStatusClass = (status) => {
    if (status === "Completed") return "emt-completed";
    if (status === "In Progress") return "emt-progress";
    return "emt-todo";
  };

  const getPriorityClass = (priority) => {
    if (priority === "High") return "emt-high";
    if (priority === "Medium") return "emt-medium";
    return "emt-low";
  };

  const clearFilters = () => {
    setSearch("");
    setProjectFilter("All Projects");
    setStatusFilter("All Status");
    setPriorityFilter("All Priorities");
    setDueFilter("All Due Dates");
  };

  return (
    <div className="emt-page">

      {/* SIDEBAR */}
      <aside className="emt-sidebar">

        <div className="emt-brand">
          <div className="emt-brand-icon">TF</div>

          <div>
            <h3>TechFlow ERP</h3>
            <span>Manage • Build • Grow</span>
          </div>
        </div>

        <div className="emt-sidebar-label">
          WORKSPACE
        </div>

        <nav className="emt-navigation">

          <button
            onClick={() => navigate("/employee/dashboard")}
            className="emt-nav-item"
          >
            <span>▦</span>
            Dashboard
          </button>

          <button className="emt-nav-item active">
            <span>☷</span>
            My Tasks
            <span className="emt-nav-count">{totalTasks}</span>
          </button>

          <button
            onClick={() => navigate("/employee/projects")}
            className="emt-nav-item"
          >
            <span>▣</span>
            My Projects
          </button>

          <button
            onClick={() => navigate("/employee/notifications")}
            className="emt-nav-item"
          >
            <span>♧</span>
            Notifications
          </button>

          <button
            onClick={() => navigate("/employee/profile")}
            className="emt-nav-item"
          >
            <span>♙</span>
            My Profile
          </button>

        </nav>

        <div className="emt-sidebar-bottom">

          <div className="emt-tip-box">
            <span className="emt-tip-icon">✦</span>

            <div>
              <strong>Better Teams</strong>
              <p>Progress happens when great work meets teamwork.</p>
            </div>
          </div>

          <button
            className="emt-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

          <div className="emt-sidebar-footer">
            <span>TechFlow ERP</span>
            <span className="emt-online">
              ● Online
            </span>
          </div>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="emt-main">

        {/* TOP HEADER */}
        <header className="emt-topbar">

          <div className="emt-top-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search my tasks and projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="emt-top-profile">

            <button
              className="emt-notification-button"
              onClick={() =>
                navigate("/employee/notifications")
              }
              title="Notifications"
            >
              ♧
            </button>

            <div className="emt-avatar">
              {getInitials(employeeName)}
            </div>

            <div className="emt-profile-details">
              <strong>{employeeName}</strong>
              <span>Employee</span>
            </div>

          </div>

        </header>

        {/* PAGE HEADING */}
        <section className="emt-heading">

          <div>
            <div className="emt-breadcrumb">
              Dashboard <span>›</span> My Tasks
            </div>

            <h1>My Tasks</h1>

            <p>
              Manage your assigned tasks and track your daily progress.
            </p>
          </div>

          <div className="emt-heading-actions">
            <span className="emt-date">
              ◷ {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>

            <button
              className="emt-refresh-button"
              onClick={fetchTasks}
            >
              ↻ Refresh
            </button>
          </div>

        </section>

        {/* SUMMARY CARDS */}
        <section className="emt-summary-grid">

          <div className="emt-summary-card">
            <div className="emt-summary-top">
              <span>TOTAL TASKS</span>
              <span className="emt-summary-icon blue">▣</span>
            </div>

            <h2>{totalTasks}</h2>
            <p>Tasks assigned to you</p>
            <small>✦ Across {projects.length} projects</small>
          </div>

          <div className="emt-summary-card">
            <div className="emt-summary-top">
              <span>TO DO</span>
              <span className="emt-summary-icon gray">◷</span>
            </div>

            <h2>{todoTasks}</h2>
            <p>Pending tasks</p>
            <small>• Ready to start</small>
          </div>

          <div className="emt-summary-card">
            <div className="emt-summary-top">
              <span>IN PROGRESS</span>
              <span className="emt-summary-icon purple">↗</span>
            </div>

            <h2>{inProgressTasks}</h2>
            <p>Tasks actively working on</p>
            <small>✦ Active sprint work</small>
          </div>

          <div className="emt-summary-card">
            <div className="emt-summary-top">
              <span>COMPLETED</span>
              <span className="emt-summary-icon green">✓</span>
            </div>

            <h2>{completedTasks}</h2>
            <p>Successfully finished</p>
            <small>✓ Verified by task updates</small>
          </div>

        </section>

        {/* OVERDUE ALERT */}
        {overdueTasks.length > 0 && (
          <div className="emt-overdue-alert">

            <div>
              <span className="emt-alert-icon">!</span>

              <span>
                <strong>{overdueTasks.length} Overdue Task(s)</strong>
                &nbsp; Some assigned tasks have passed their due date.
              </span>
            </div>

            <button
              onClick={() => {
                setDueFilter("Overdue");
                setCurrentPage(1);
              }}
            >
              View Tasks →
            </button>

          </div>
        )}

        {/* FILTER SECTION */}
        <section className="emt-filter-card">

          <div className="emt-filter-row">

            <div className="emt-search-field">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option>All Projects</option>

              {projects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option>All Priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <select
              value={dueFilter}
              onChange={(e) => setDueFilter(e.target.value)}
            >
              <option>All Due Dates</option>
              <option>Overdue</option>
              <option>Due Today</option>
              <option>Upcoming</option>
            </select>

          </div>

          <button
            className="emt-clear-filter"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </section>

        {/* TASK TABLE */}
        <section className="emt-task-section">

          <div className="emt-task-heading">

            <div>
              <h3>
                All My Tasks
                <span className="emt-task-count">
                  {filteredTasks.length} Tasks
                </span>
              </h3>
            </div>

            <div className="emt-task-heading-actions">
              <button
                className="emt-outline-button"
                onClick={fetchTasks}
              >
                ↻ Quick Status Update
              </button>

              <button
                className="emt-outline-button"
                onClick={() => {
                  if (filteredTasks.length > 0) {
                    setSelectedTask(filteredTasks[0]);
                  }
                }}
                disabled={filteredTasks.length === 0}
              >
                ◉ Preview Details
              </button>
            </div>

          </div>

          {loading ? (

            <div className="emt-loading">
              <div className="emt-spinner"></div>
              <p>Loading your tasks...</p>
            </div>

          ) : filteredTasks.length === 0 ? (

            <div className="emt-empty">
              <div>▤</div>
              <h3>No Tasks Found</h3>
              <p>
                No tasks match your search or filter.
              </p>

              <button onClick={clearFilters}>
                Clear Filters
              </button>
            </div>

          ) : (

            <div className="emt-table-wrapper">

              <table className="emt-table">

                <thead>
                  <tr>
                    <th>TASK NAME</th>
                    <th>PROJECT</th>
                    <th>PRIORITY</th>
                    <th>DUE DATE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedTasks.map((task) => (

                    <tr key={task._id}>

                      <td>
                        <div className="emt-task-name">

                          <span
                            className={`emt-task-dot ${
                              task.priority === "High"
                                ? "dot-red"
                                : task.priority === "Medium"
                                ? "dot-orange"
                                : "dot-blue"
                            }`}
                          ></span>

                          <div>
                            <strong>{task.taskName}</strong>

                            <p>
                              {task.description
                                ? task.description
                                : "No description available"}
                            </p>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="emt-project-name">
                          {task.project?.projectName || "No Project"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`emt-priority ${getPriorityClass(
                            task.priority
                          )}`}
                        >
                          {task.priority || "Medium"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            isOverdue(task)
                              ? "emt-due-date overdue"
                              : "emt-due-date"
                          }
                        >
                          {formatDate(task.dueDate)}

                          {isOverdue(task) && (
                            <small>Overdue</small>
                          )}
                        </span>
                      </td>

                      <td>
                        <select
                          className={`emt-status-select ${getStatusClass(
                            task.status
                          )}`}
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(
                              task._id,
                              e.target.value
                            )
                          }
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>

                      <td>
                        <button
                          className="emt-action-button"
                          title="View task details"
                          onClick={() => setSelectedTask(task)}
                        >
                          ⋯
                        </button>
                      </td>

                    </tr>

                  ))}
                </tbody>

              </table>

            </div>

          )}

          {/* PAGINATION */}
          {!loading && filteredTasks.length > 0 && (
            <div className="emt-pagination">

              <span>
                Showing {startIndex + 1}–
                {Math.min(
                  startIndex + tasksPerPage,
                  filteredTasks.length
                )}{" "}
                of {filteredTasks.length} tasks
              </span>

              <div className="emt-pagination-buttons">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                >
                  Previous
                </button>

                <button className="emt-current-page">
                  {currentPage}
                </button>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                >
                  Next
                </button>

              </div>

            </div>
          )}

        </section>

      </main>

      {/* TASK DETAILS MODAL */}
      {selectedTask && (

        <div
          className="emt-modal-overlay"
          onClick={() => setSelectedTask(null)}
        >

          <div
            className="emt-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="emt-modal-header">

              <div>
                <span>TASK DETAILS</span>
                <h2>{selectedTask.taskName}</h2>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
              >
                ×
              </button>

            </div>

            <div className="emt-modal-body">

              <div className="emt-modal-badges">

                <span
                  className={`emt-priority ${getPriorityClass(
                    selectedTask.priority
                  )}`}
                >
                  {selectedTask.priority || "Medium"} Priority
                </span>

                <span
                  className={`emt-status-select ${getStatusClass(
                    selectedTask.status
                  )}`}
                >
                  {selectedTask.status}
                </span>

              </div>

              <div className="emt-detail-item">
                <label>Project</label>
                <strong>
                  {selectedTask.project?.projectName || "No Project"}
                </strong>
              </div>

              <div className="emt-detail-item">
                <label>Project Code</label>
                <strong>
                  {selectedTask.project?.projectCode || "Not available"}
                </strong>
              </div>

              <div className="emt-detail-item">
                <label>Description</label>
                <p>
                  {selectedTask.description || "No description available"}
                </p>
              </div>

              <div className="emt-detail-grid">

                <div className="emt-detail-item">
                  <label>Due Date</label>
                  <strong>{formatDate(selectedTask.dueDate)}</strong>
                </div>

                <div className="emt-detail-item">
                  <label>Estimated Hours</label>
                  <strong>
                    {selectedTask.estimatedHours
                      ? `${selectedTask.estimatedHours} Hours`
                      : "Not specified"}
                  </strong>
                </div>

              </div>

              {isOverdue(selectedTask) && (
                <div className="emt-modal-overdue">
                  This task is overdue. Please update its status.
                </div>
              )}

              <div className="emt-detail-item">
                <label>Update Status</label>

                <select
                  className="emt-modal-status"
                  value={selectedTask.status}
                  onChange={(e) =>
                    handleStatusChange(
                      selectedTask._id,
                      e.target.value
                    )
                  }
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

            </div>

            <div className="emt-modal-footer">

              <button
                onClick={() => setSelectedTask(null)}
                className="emt-modal-close"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default EmployeeMyTasks;