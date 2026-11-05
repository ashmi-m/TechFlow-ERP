
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyProjects.css";

const API_URL = "http://localhost:5000/api/projects";

function MyProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");
  const [sortOrder, setSortOrder] = useState("Recently Updated");

  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch projects from MongoDB
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
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

  // Summary calculations
  const totalProjects = projects.length;

  const inProgressProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const planningProjects = projects.filter(
    (project) =>
      project.status === "Planning" ||
      project.status === "On Hold"
  ).length;

  // Search, filter and sort
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (search.trim()) {
      const searchValue = search.toLowerCase();

      result = result.filter(
        (project) =>
          project.projectName?.toLowerCase().includes(searchValue) ||
          project.projectCode?.toLowerCase().includes(searchValue)
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

    if (sortOrder === "Recently Updated") {
      result.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    } else if (sortOrder === "Oldest First") {
      result.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    } else if (sortOrder === "Deadline") {
      result.sort(
        (a, b) => new Date(a.deadline) - new Date(b.deadline)
      );
    }

    return result;
  }, [projects, search, statusFilter, priorityFilter, sortOrder]);

  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusClass = (status) => {
    return status?.toLowerCase().replace(/\s+/g, "-");
  };

  const getPriorityClass = (priority) => {
    return priority?.toLowerCase();
  };

  return (
    <div className="my-projects-page">

      {/* SIDEBAR */}
      <aside className="projects-sidebar">

        <div className="projects-brand">
          <div className="projects-brand-icon">✦</div>

          <div>
            <h3>TechFlow ERP</h3>
            <span>Manage • Build • Grow</span>
          </div>
        </div>

        <nav className="projects-navigation">

          <button
            onClick={() => navigate("/project-manager/dashboard")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button className="active">
            <span>▱</span>
            My Projects
            <small>{totalProjects}</small>
          </button>

          <button>
            <span>♙</span>
            Team Members
          </button>

          <button>
            <span>▣</span>
            Task Management
          </button>

          <button>
            <span>▤</span>
            Reports
          </button>

          <button>
            <span>⚙</span>
            Settings
          </button>

        </nav>

        <div className="projects-sidebar-bottom">

          <div className="projects-help-box">
            <strong>✦ Need help?</strong>
            <p>Contact support for assistance.</p>
          </div>

          <button
            className="projects-logout"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("user");
              navigate("/project-manager/login");
            }}
          >
            ↪ Logout
          </button>

          <div className="projects-version">
            Version 1.0.1 <span>● Online</span>
          </div>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="projects-main">

        {/* TOPBAR */}
        <header className="projects-topbar">

          <div className="projects-top-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search projects, tasks, team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="projects-top-user">
            <button className="projects-notification">♧</button>

            <div className="projects-user-avatar">PM</div>

            <div>
              <strong>Project Manager</strong>
              <span>Project Manager</span>
            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}
        <div className="projects-content">

          {/* PAGE HEADER */}
          <div className="projects-page-header">

            <div>
              <div className="projects-breadcrumb">
                Dashboard <span>/</span> My Projects
              </div>

              <h1>My Projects</h1>

              <p>
                Track and manage all projects assigned to you.
              </p>
            </div>

            <button
              className="projects-create-btn"
              onClick={() =>
                navigate("/project-manager/create-project")
              }
            >
              + Create Project
            </button>

          </div>

          {/* ERROR */}
          {error && (
            <div className="projects-error">
              {error}
              <button onClick={fetchProjects}>Retry</button>
            </div>
          )}

          {/* SUMMARY CARDS */}
          <section className="projects-summary-grid">

            <div className="projects-summary-card">
              <div className="summary-card-top">
                <span>TOTAL PROJECTS</span>
                <div className="summary-icon blue">▣</div>
              </div>

              <h2>{loading ? "..." : totalProjects}</h2>
              <p>All assigned projects</p>
            </div>

            <div className="projects-summary-card">
              <div className="summary-card-top">
                <span>IN PROGRESS</span>
                <div className="summary-icon green">↗</div>
              </div>

              <h2>{loading ? "..." : inProgressProjects}</h2>
              <p>Currently active projects</p>
            </div>

            <div className="projects-summary-card">
              <div className="summary-card-top">
                <span>COMPLETED</span>
                <div className="summary-icon purple">✓</div>
              </div>

              <h2>{loading ? "..." : completedProjects}</h2>
              <p>Successfully completed</p>
            </div>

            <div className="projects-summary-card">
              <div className="summary-card-top">
                <span>IN PLANNING / ON HOLD</span>
                <div className="summary-icon orange">◷</div>
              </div>

              <h2>{loading ? "..." : planningProjects}</h2>
              <p>Awaiting or paused projects</p>
            </div>

          </section>

          {/* FILTER BAR */}
          <section className="projects-filter-bar">

            <div className="projects-table-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search projects by name or code..."
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

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option>Recently Updated</option>
              <option>Oldest First</option>
              <option>Deadline</option>
            </select>

          </section>

          {/* PROJECT TABLE */}
          <section className="projects-table-card">

            <div className="projects-table-heading">
              <div>
                <h3>Project List</h3>
                <p>View and manage your assigned projects.</p>
              </div>

              <span>{filteredProjects.length} Projects</span>
            </div>

            <div className="projects-table-wrapper">

              <table className="projects-table">

                <thead>
                  <tr>
                    <th>PROJECT</th>
                    <th>TEAM</th>
                    <th>START DATE</th>
                    <th>DEADLINE</th>
                    <th>PRIORITY</th>
                    <th>STATUS</th>
                    <th>PROGRESS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td colSpan="8" className="projects-empty">
                        Loading projects...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="8" className="projects-empty">
                        Unable to load projects.
                      </td>
                    </tr>
                  ) : filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="projects-empty">
                        No projects found. Create your first project!
                      </td>
                    </tr>
                  ) : (

                    filteredProjects.map((project) => (

                      <tr key={project._id}>

                        <td>
                          <div className="project-name-cell">
                            <strong>{project.projectName}</strong>
                            <span>{project.projectCode}</span>
                          </div>
                        </td>

                        <td>
                          <div className="project-team-avatars">
                            {(project.teamMembers || [])
                              .slice(0, 4)
                              .map((member, index) => (
                                <span
                                  key={member._id || index}
                                  className={`project-team-avatar avatar-${index}`}
                                  title={member.name}
                                >
                                  {getInitials(member.name)}
                                </span>
                              ))}

                            {(project.teamMembers || []).length === 0 && (
                              <span className="no-team">Not assigned</span>
                            )}
                          </div>
                        </td>

                        <td>{formatDate(project.startDate)}</td>

                        <td>{formatDate(project.deadline)}</td>

                        <td>
                          <span
                            className={`project-priority ${getPriorityClass(
                              project.priority
                            )}`}
                          >
                            {project.priority}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`project-status ${getStatusClass(
                              project.status
                            )}`}
                          >
                            {project.status}
                          </span>
                        </td>

                        <td>
                          <div className="project-progress-cell">
                            <div className="project-progress-track">
                              <div
                                className={`project-progress-fill ${getPriorityClass(
                                  project.priority
                                )}`}
                                style={{
                                  width: `${project.progress || 0}%`,
                                }}
                              ></div>
                            </div>

                            <span>{project.progress || 0}%</span>
                          </div>
                        </td>

                        <td>
                          <button
                            className="project-view-btn"
                            onClick={() => setSelectedProject(project)}
                          >
                            View Details
                          </button>
                        </td>

                      </tr>

                    ))
                  )}

                </tbody>

              </table>

            </div>

            <div className="projects-table-footer">
              Showing {filteredProjects.length} of {totalProjects} projects

              <button onClick={fetchProjects}>
                ↻ Refresh
              </button>
            </div>

          </section>

        </div>
      </main>

      {/* PROJECT DETAILS MODAL */}
      {selectedProject && (
        <div
          className="project-modal-overlay"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="project-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="project-modal-header">
              <div>
                <h2>{selectedProject.projectName}</h2>
                <span>{selectedProject.projectCode}</span>
              </div>

              <button onClick={() => setSelectedProject(null)}>
                ×
              </button>
            </div>

            <div className="project-modal-body">

              <p>
                <strong>Description:</strong>{" "}
                {selectedProject.description || "No description provided."}
              </p>

              <p>
                <strong>Start Date:</strong>{" "}
                {formatDate(selectedProject.startDate)}
              </p>

              <p>
                <strong>Deadline:</strong>{" "}
                {formatDate(selectedProject.deadline)}
              </p>

              <p>
                <strong>Priority:</strong>{" "}
                {selectedProject.priority}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {selectedProject.status}
              </p>

              <p>
                <strong>Progress:</strong>{" "}
                {selectedProject.progress}%
              </p>

              <p>
                <strong>Team Members:</strong>{" "}
                {selectedProject.teamMembers?.length || 0}
              </p>

            </div>

            <button
              className="project-modal-close"
              onClick={() => setSelectedProject(null)}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default MyProjects;