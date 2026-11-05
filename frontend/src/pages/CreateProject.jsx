import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateProject.css";

const API_URL = "http://localhost:5000/api/projects";

function CreateProject() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectName: "",
    projectCode: "",
    description: "",
    teamMembers: [],
    startDate: "",
    deadline: "",
    priority: "Medium",
    status: "Planning",
    progress: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // Submit project to MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validate project name
    if (!formData.projectName.trim()) {
      setError("Please enter a project name.");
      return;
    }

    // Validate project code
    if (!formData.projectCode.trim()) {
      setError("Please enter a project code.");
      return;
    }

    // Validate dates
    if (!formData.startDate || !formData.deadline) {
      setError("Please select both start date and deadline.");
      return;
    }

    if (formData.deadline < formData.startDate) {
      setError("Deadline cannot be earlier than the start date.");
      return;
    }

    try {
      setLoading(true);

      // Get JWT token
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      // Prepare project data
      const projectData = {
        projectName: formData.projectName.trim(),
        projectCode: formData.projectCode.trim().toUpperCase(),
        description: formData.description.trim(),
        teamMembers: formData.teamMembers,
        startDate: formData.startDate,
        deadline: formData.deadline,
        priority: formData.priority,
        status: formData.status,
        progress: Number(formData.progress),
      };

      // Send POST request to backend
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create project."
        );
      }

      setSuccess("Project created successfully!");

      // Navigate to My Projects
      setTimeout(() => {
        navigate("/project-manager/projects", {
          replace: true,
        });
      }, 1000);

    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Cancel project creation
  const handleCancel = () => {
    if (!loading) {
      navigate("/project-manager/dashboard");
    }
  };

  return (
    <div className="create-project-page">
      <div className="create-project-container">

        {/* HEADER */}
        <div className="create-project-header">
          <div>
            <div className="create-project-breadcrumb">
              Dashboard <span>/</span> My Projects{" "}
              <span>/</span> New Project
            </div>

            <h1>Create New Project</h1>

            <p>
              Add project details, assign your team, and organize your
              project workflow.
            </p>
          </div>

          <button
            type="button"
            className="create-back-btn"
            onClick={handleCancel}
            disabled={loading}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="create-error" role="alert">
            {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="create-success" role="status">
            {success}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {/* BASIC INFORMATION */}
          <section className="create-form-card">

            <div className="create-section-heading">
              <div className="create-section-icon">▣</div>

              <div>
                <h3>Basic Information</h3>
                <p>Enter the main details of your project.</p>
              </div>
            </div>

            <div className="create-form-grid">

              <div className="create-form-group">
                <label>
                  Project Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="projectName"
                  placeholder="Enter project name"
                  value={formData.projectName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-form-group">
                <label>
                  Project Code <span>*</span>
                </label>

                <input
                  type="text"
                  name="projectCode"
                  placeholder="Example: PRJ001"
                  value={formData.projectCode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-form-group full-width">
                <label>Description</label>

                <textarea
                  name="description"
                  placeholder="Describe the purpose and objectives of this project..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

            </div>
          </section>

          {/* PROJECT TIMELINE */}
          <section className="create-form-card">

            <div className="create-section-heading">
              <div className="create-section-icon">▤</div>

              <div>
                <h3>Project Timeline</h3>
                <p>
                  Set the starting date and expected completion date.
                </p>
              </div>
            </div>

            <div className="create-form-grid">

              <div className="create-form-group">
                <label>
                  Start Date <span>*</span>
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-form-group">
                <label>
                  Deadline <span>*</span>
                </label>

                <input
                  type="date"
                  name="deadline"
                  min={formData.startDate || undefined}
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>
          </section>

          {/* PROJECT SETTINGS */}
          <section className="create-form-card">

            <div className="create-section-heading">
              <div className="create-section-icon">⚙</div>

              <div>
                <h3>Project Settings</h3>
                <p>
                  Configure the priority, status, and progress.
                </p>
              </div>
            </div>

            <div className="create-form-grid">

              <div className="create-form-group">
                <label>Priority</label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="create-form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="create-form-group full-width">

                <label>
                  Progress: {formData.progress}%
                </label>

                <input
                  type="range"
                  name="progress"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={handleChange}
                />

                <div className="create-range-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>

              </div>

            </div>
          </section>

          {/* FORM ACTIONS */}
          <div className="create-form-actions">

            <button
              type="button"
              className="create-cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-submit-btn"
              disabled={loading}
            >
              {loading
                ? "Creating Project..."
                : "+ Create Project"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateProject;