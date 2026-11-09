
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateTask.css";
import Swal from "sweetalert2";
function CreateTask() {
  const API_URL = "http://localhost:5000/api";
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    taskName: "",
    project: "",
    description: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
    status: "To Do",
    estimatedHours: "",
  });

  // Fetch projects and employees from MongoDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in again.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [projectResponse, employeeResponse] = await Promise.all([
          fetch(`${API_URL}/projects`, { headers }),
          fetch(`${API_URL}/employees`, { headers }),
        ]);

        const projectData = await projectResponse.json();
        const employeeData = await employeeResponse.json();

        console.log("Project API Status:", projectResponse.status);
console.log("Project API Data:", projectData);

console.log("Employee API Status:", employeeResponse.status);
console.log("Employee API Data:", employeeData);

        if (!projectResponse.ok) {
          throw new Error(
            projectData.message || "Failed to load projects."
          );
        }

        if (!employeeResponse.ok) {
          throw new Error(
            employeeData.message || "Failed to load employees."
          );
        }

        setProjects(projectData.projects || []);

        setEmployees(
          employeeData.employees ||
          employeeData.data ||
          []
        );
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create task in MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          estimatedHours: Number(formData.estimatedHours) || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create task.");
      }

    await Swal.fire({
  icon: "success",
  title: "Task Created Successfully!",
  text: "Your new task has been created successfully.",
  confirmButtonText: "Great!",
  confirmButtonColor: "#2864ef",
});

      navigate("/project-manager/tasks");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-task-page">

      <aside className="task-sidebar">
        <div className="task-logo">
          <span className="logo-icon">T</span>
          <div>
            <h3>TechFlow ERP</h3>
            <p>Manage • Build • Grow</p>
          </div>
        </div>

        <nav className="task-navigation">
          <button onClick={() => navigate("/project-manager/dashboard")}>
            ▦ Dashboard
          </button>

          <button onClick={() => navigate("/project-manager/projects")}>
            ▣ My Projects
          </button>

          <button onClick={() => navigate("/project-manager/team")}>
            ♙ Team Members
          </button>

          <button
            className="active"
            onClick={() => navigate("/project-manager/tasks")}
          >
            ☷ Task Management
          </button>

          <button>▤ Reports</button>
          <button>⚙ Settings</button>
        </nav>

        <div className="task-sidebar-bottom">
          <p>✦ Better Teams</p>
          <small>
            Manage projects and improve productivity.
          </small>

          <button
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
        </div>
      </aside>

      <main className="create-task-main">

        <header className="create-task-topbar">
          <div className="task-search">
            🔍 Search projects, tasks, team members...
          </div>

          <div className="task-profile">
            <span>🔔</span>
            <div>
              <strong>Project Manager</strong>
              <small>Project Manager</small>
            </div>
          </div>
        </header>

        <section className="create-task-content">

          <div className="task-breadcrumb">
            Dashboard / Task Management / <span>Create Task</span>
          </div>

          <div className="create-task-heading">
            <div>
              <h1>Create New Task</h1>
              <p>
                Create, assign and manage tasks for your project team.
              </p>
            </div>

            <button
              className="task-back-btn"
              onClick={() => navigate("/project-manager/tasks")}
            >
              ← Back to Tasks
            </button>
          </div>

          {error && (
            <p className="task-error" role="alert">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>

            <div className="task-form-card">

              <div className="task-section-title">
                <div className="section-icon">▤</div>
                <div>
                  <h3>Task Information</h3>
                  <p>Enter the basic details of your task.</p>
                </div>
              </div>

              <div className="task-form-grid">

                <div className="task-field full-width">
                  <label>
                    Task Name <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="taskName"
                    placeholder="Enter task name"
                    value={formData.taskName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="task-field full-width">
                  <label>
                    Project <span>*</span>
                  </label>

                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Project</option>

                    {projects.map((project) => (
                      <option
                        key={project._id}
                        value={project._id}
                      >
                        {project.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="task-field full-width">
                  <label>Description</label>

                  <textarea
                    name="description"
                    placeholder="Describe the task and its requirements..."
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

              </div>
            </div>

            <div className="task-form-card">

              <div className="task-section-title">
                <div className="section-icon">♙</div>
                <div>
                  <h3>Assignment & Schedule</h3>
                  <p>Assign this task and set its deadline.</p>
                </div>
              </div>

              <div className="task-form-grid">

                <div className="task-field">
                  <label>
                    Assign To <span>*</span>
                  </label>

                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Team Member</option>

                    {employees.map((employee) => (
                      <option
                        key={employee._id}
                        value={employee._id}
                      >
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="task-field">
                  <label>
                    Due Date <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="task-field">
                  <label>Priority</label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="task-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="task-field">
                  <label>Estimated Hours</label>

                  <input
                    type="number"
                    name="estimatedHours"
                    min="1"
                    placeholder="e.g. 8 hours"
                    value={formData.estimatedHours}
                    onChange={handleChange}
                  />
                </div>

              </div>
            </div>

            <div className="task-form-actions">

              <button
                type="button"
                className="task-cancel-btn"
                onClick={() => navigate("/project-manager/tasks")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="task-submit-btn"
                disabled={loading}
              >
                {loading ? "Creating..." : "+ Create Task"}
              </button>

            </div>

          </form>
        </section>
      </main>
    </div>
  );
}

export default CreateTask;
