
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./EmployeeMyProjects.css";

const API_URL = "http://localhost:5000/api/projects/my-projects";

function EmployeeMyProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");

  const [selectedProject, setSelectedProject] = useState(null);

  const user = JSON.parse(
    localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "{}"
  );

  const employeeName = user.name || "Employee";

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // FETCH EMPLOYEE PROJECTS
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch projects.");
      }

      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // SUMMARY
  const totalProjects = projects.length;

  const inProgressProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const notStartedProjects = projects.filter(
    (project) => project.status === "Planning"
  ).length;

  // SEARCH AND FILTER
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (search.trim()) {
      const value = search.toLowerCase();

      result = result.filter(
        (project) =>
          project.projectName?.toLowerCase().includes(value) ||
          project.projectCode?.toLowerCase().includes(value) ||
          project.description?.toLowerCase().includes(value)
      );
    }

    if (statusFilter !== "All Status") {
      result = result.filter(
        (project) => project.status === statusFilter
      );
    }

    if (priorityFilter !== "All Priorities") {
      result = result.filter(
        (project) => project.priority === priorityFilter
      );
    }

    return result;
  }, [projects, search, statusFilter, priorityFilter]);

  // DATE FORMAT
  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // INITIALS
  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // LOGOUT
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2864ef",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      navigate("/employee/login");
    }
  };

  const getStatusClass = (status) =>
    status?.toLowerCase().replace(/\s+/g, "-");

  const getPriorityClass = (priority) =>
    priority?.toLowerCase();

  return (
    <div className="emp-project-page">

      {/* SIDEBAR */}
      <aside className="emp-project-sidebar">

        <div className="emp-project-brand">
          <div className="emp-project-brand-icon">✦</div>

          <div>
            <h2>TechFlow ERP</h2>
            <span>Manage • Build • Grow</span>
          </div>
        </div>

        <div className="emp-project-menu-title">
          WORKSPACE
        </div>

        <nav className="emp-project-navigation">

          <button onClick={() => navigate("/employee/dashboard")}>
            <span>▦</span>
            Dashboard
          </button>

          <button className="active">
            <span>▱</span>
            My Projects
          </button>

          <button onClick={() => navigate("/employee/tasks")}>
            <span>☷</span>
            My Tasks
          </button>

          <button onClick={() => navigate("/employee/attendance")}>
            <span>◷</span>
            My Attendance
          </button>

          <button onClick={() => navigate("/employee/profile")}>
            <span>♙</span>
            My Profile
          </button>

        </nav>

        <div className="emp-project-sidebar-bottom">

          <div className="emp-project-help">
            <span>✦</span>
            <strong>Need help?</strong>
            <p>Contact your administrator for assistance.</p>
          </div>

          <button
            className="emp-project-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

          <div className="emp-project-version">
            Version 1.0.1
            <span>● Online</span>
          </div>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="emp-project-main">

        {/* TOPBAR */}
        <header className="emp-project-topbar">

          <div className="emp-project-topbar-title">
            Employee Workspace
          </div>

          <div className="emp-project-user">

            <div className="emp-project-user-avatar">
              {getInitials(employeeName)}
            </div>

            <div>
              <strong>{employeeName}</strong>
              <span>Employee</span>
            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}
        <div className="emp-project-content">

          {/* PAGE HEADING */}
          <div className="emp-project-heading">

            <div>
              <div className="emp-project-breadcrumb">
                Dashboard <span>/</span> My Projects
              </div>

              <h1>My Projects</h1>

              <p>
                View and track all projects assigned to you.
              </p>
            </div>

            <button
              className="emp-project-refresh"
              onClick={fetchProjects}
              disabled={loading}
            >
              ↻ Refresh
            </button>

          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="emp-project-error">
              <span>{error}</span>

              <button onClick={fetchProjects}>
                Try Again
              </button>
            </div>
          )}

          {/* SUMMARY CARDS */}
          <section className="emp-project-summary">

            <div className="emp-project-stat-card">
              <div className="emp-project-stat-top">
                <span>Total Projects</span>
                <div className="emp-project-stat-icon blue">▣</div>
              </div>

              <h2>{loading ? "..." : totalProjects}</h2>
              <p>All assigned projects</p>
            </div>

            <div className="emp-project-stat-card">
              <div className="emp-project-stat-top">
                <span>In Progress</span>
                <div className="emp-project-stat-icon green">↗</div>
              </div>

              <h2>{loading ? "..." : inProgressProjects}</h2>
              <p>Currently active projects</p>
            </div>

            <div className="emp-project-stat-card">
              <div className="emp-project-stat-top">
                <span>Completed</span>
                <div className="emp-project-stat-icon purple">✓</div>
              </div>

              <h2>{loading ? "..." : completedProjects}</h2>
              <p>Successfully completed</p>
            </div>

            <div className="emp-project-stat-card">
              <div className="emp-project-stat-top">
                <span>Not Started</span>
                <div className="emp-project-stat-icon orange">◷</div>
              </div>

              <h2>{loading ? "..." : notStartedProjects}</h2>
              <p>Projects in planning</p>
            </div>

          </section>

          {/* SEARCH AND FILTER */}
          <section className="emp-project-filter">

            <div className="emp-project-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search projects by name, code or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Planning</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>On Hold</option>
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

          </section>

          {/* PROJECT LIST */}
          <section className="emp-project-list-section">

            <div className="emp-project-list-heading">
              <div>
                <h3>Assigned Projects</h3>
                <p>
                  Track your project details and progress.
                </p>
              </div>

              <span>
                {filteredProjects.length} Projects
              </span>
            </div>

            {loading ? (

              <div className="emp-project-message">
                <div className="emp-project-loader"></div>
                Loading your projects...
              </div>

            ) : filteredProjects.length === 0 ? (

              <div className="emp-project-message">
                <div className="emp-project-empty-icon">▱</div>

                <h3>No Projects Found</h3>

                <p>
                  {projects.length === 0
                    ? "You have not been assigned to any projects yet."
                    : "Try changing your search or filters."}
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All Status");
                    setPriorityFilter("All Priorities");
                  }}
                >
                  Clear Filters
                </button>
              </div>

            ) : (

              <div className="emp-project-grid">

                {filteredProjects.map((project) => {

                  const progress = Math.min(
                    100,
                    Math.max(0, Number(project.progress) || 0)
                  );

                  const manager =
                    typeof project.projectManager === "object"
                      ? project.projectManager?.name
                      : "Not assigned";

                  return (

                    <article
                      className="emp-project-card"
                      key={project._id}
                    >

                      {/* CARD HEADER */}
                      <div className="emp-project-card-top">

                        <div className="emp-project-card-icon">
                          {getInitials(project.projectName)}
                        </div>

                        <div className="emp-project-card-badges">

                          <span
                            className={`emp-project-status ${getStatusClass(
                              project.status
                            )}`}
                          >
                            {project.status}
                          </span>

                        </div>

                      </div>

                      {/* PROJECT DETAILS */}
                      <div className="emp-project-card-info">

                        <span className="emp-project-code">
                          {project.projectCode || "PROJECT"}
                        </span>

                        <h3>{project.projectName}</h3>

                        <p className="emp-project-description">
                          {project.description ||
                            "No project description available."}
                        </p>

                      </div>

                      {/* PRIORITY */}
                      <div className="emp-project-priority-row">
                        <span>Priority</span>

                        <span
                          className={`emp-project-priority ${getPriorityClass(
                            project.priority
                          )}`}
                        >
                          ● {project.priority || "Medium"}
                        </span>
                      </div>

                      {/* PROGRESS */}
                      <div className="emp-project-progress">

                        <div className="emp-project-progress-heading">
                          <strong>Project Progress</strong>
                          <span>{progress}%</span>
                        </div>

                        <div className="emp-project-progress-track">
                          <div
                            className="emp-project-progress-fill"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>

                      </div>

                      {/* DATES */}
                      <div className="emp-project-dates">

                        <div>
                          <span>Start Date</span>
                          <strong>
                            {formatDate(project.startDate)}
                          </strong>
                        </div>

                        <div>
                          <span>Deadline</span>
                          <strong>
                            {formatDate(project.deadline)}
                          </strong>
                        </div>

                      </div>

                      {/* MANAGER AND TEAM */}
                      <div className="emp-project-team">

                        <div className="emp-project-manager">
                          <span>Project Manager</span>
                          <strong>{manager || "Not assigned"}</strong>
                        </div>

                        <div className="emp-project-members">

                          {(project.teamMembers || [])
                            .slice(0, 3)
                            .map((member, index) => (
                              <div
                                className={`emp-project-member member-${index}`}
                                key={member._id || index}
                                title={member.name}
                              >
                                {getInitials(member.name)}
                              </div>
                            ))}

                          {(project.teamMembers || []).length > 3 && (
                            <div className="emp-project-member member-more">
                              +{project.teamMembers.length - 3}
                            </div>
                          )}

                        </div>

                      </div>

                      {/* ACTION */}
                      <button
                        className="emp-project-details-btn"
                        onClick={() => setSelectedProject(project)}
                      >
                        View Project Details
                        <span>→</span>
                      </button>

                    </article>

                  );
                })}

              </div>

            )}

          </section>

        </div>

      </main>
      {/* PROJECT DETAILS MODAL */}
      {selectedProject && (
        <div
          className="emp-project-modal-overlay"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="emp-project-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="emp-project-modal-title"
          >
            {/* MODAL HEADER */}
            <div className="emp-project-modal-header">
              <div className="emp-project-modal-heading">
                <div className="emp-project-modal-icon">
                  {getInitials(selectedProject.projectName)}
                </div>

                <div>
                  <span className="emp-project-modal-code">
                    {selectedProject.projectCode || "PROJECT"}
                  </span>

                  <h2 id="emp-project-modal-title">
                    {selectedProject.projectName}
                  </h2>

                  <p>Project Overview</p>
                </div>
              </div>

              <button
                className="emp-project-modal-close-icon"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="emp-project-modal-body">

              {/* STATUS AND PRIORITY */}
              <div className="emp-project-modal-badges">
                <div>
                  <span className="modal-label">PROJECT STATUS</span>

                  <span
                    className={`emp-project-status ${getStatusClass(
                      selectedProject.status
                    )}`}
                  >
                    {selectedProject.status}
                  </span>
                </div>

                <div>
                  <span className="modal-label">PRIORITY LEVEL</span>

                  <span
                    className={`emp-project-priority ${getPriorityClass(
                      selectedProject.priority
                    )}`}
                  >
                    ● {selectedProject.priority || "Medium"}
                  </span>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="emp-project-modal-section">
                <h3>Project Description</h3>

                <p className="emp-project-modal-description">
                  {selectedProject.description ||
                    "No project description available."}
                </p>
              </div>

              {/* OVERVIEW CARDS */}
              <div className="emp-project-modal-stats">

                <div className="emp-project-modal-stat">
                  <span className="modal-stat-icon blue">▣</span>

                  <div>
                    <span>Progress</span>
                    <strong>
                      {Math.min(
                        100,
                        Math.max(
                          0,
                          Number(selectedProject.progress) || 0
                        )
                      )}%
                    </strong>
                  </div>
                </div>

                <div className="emp-project-modal-stat">
                  <span className="modal-stat-icon green">♙</span>

                  <div>
                    <span>Team Members</span>
                    <strong>
                      {selectedProject.teamMembers?.length || 0}
                    </strong>
                  </div>
                </div>

                <div className="emp-project-modal-stat">
                  <span className="modal-stat-icon purple">◷</span>

                  <div>
                    <span>Start Date</span>
                    <strong>
                      {formatDate(selectedProject.startDate)}
                    </strong>
                  </div>
                </div>

                <div className="emp-project-modal-stat">
                  <span className="modal-stat-icon orange">◷</span>

                  <div>
                    <span>Deadline</span>
                    <strong>
                      {formatDate(selectedProject.deadline)}
                    </strong>
                  </div>
                </div>

              </div>

              {/* PROJECT PROGRESS */}
              <div className="emp-project-modal-section">
                <div className="emp-project-modal-progress-heading">
                  <h3>Project Progress</h3>

                  <strong>
                    {Math.min(
                      100,
                      Math.max(
                        0,
                        Number(selectedProject.progress) || 0
                      )
                    )}%
                  </strong>
                </div>

                <div className="emp-project-modal-progress-track">
                  <div
                    className="emp-project-modal-progress-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          Number(selectedProject.progress) || 0
                        )
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* PROJECT MANAGER */}
              <div className="emp-project-modal-section">
                <h3>Project Manager</h3>

                <div className="emp-project-modal-manager">
                  <div className="emp-project-modal-person-avatar">
                    {getInitials(
                      typeof selectedProject.projectManager === "object"
                        ? selectedProject.projectManager?.name || "PM"
                        : "PM"
                    )}
                  </div>

                  <div>
                    <strong>
                      {typeof selectedProject.projectManager === "object"
                        ? selectedProject.projectManager?.name ||
                          "Not assigned"
                        : "Not assigned"}
                    </strong>

                    <span>Project Manager</span>
                  </div>
                </div>
              </div>

              {/* TEAM MEMBERS */}
              <div className="emp-project-modal-section">
                <div className="emp-project-modal-team-heading">
                  <h3>Team Members</h3>

                  <span>
                    {selectedProject.teamMembers?.length || 0} Members
                  </span>
                </div>

                {selectedProject.teamMembers?.length > 0 ? (
                  <div className="emp-project-modal-team-list">
                    {selectedProject.teamMembers.map((member, index) => (
                      <div
                        className="emp-project-modal-team-member"
                        key={member._id || index}
                      >
                        <div className={`emp-project-modal-person-avatar team-avatar-${index % 3}`}>
                          {getInitials(member.name || "EM")}
                        </div>

                        <div>
                          <strong>
                            {member.name || "Team Member"}
                          </strong>

                          <span>Employee</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="emp-project-modal-empty">
                    No team members assigned.
                  </p>
                )}
              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="emp-project-modal-footer">
              <span>
                Project Code: {selectedProject.projectCode || "N/A"}
              </span>

              <button
                className="emp-project-modal-close"
                onClick={() => setSelectedProject(null)}
              >
                 Close Details
              </button>
            </div>

          </div>
        </div>
      )}
    

    </div>
  );
}

export default EmployeeMyProjects;