

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditEmployee.css";
import Swal from "sweetalert2";

const API_URL = "http://localhost:5000/api/employees";

function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    reportingManager: "",
    employmentType: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        const response = await fetch(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load employee.");
        }

        const employee = result.employee || result.data || result;

        setFormData({
          name: employee.name || "",
          email: employee.email || "",
          phone: employee.phone || "",
          department: employee.department || "",
          designation: employee.designation || "",
          reportingManager: employee.reportingManager || "",
          employmentType: employee.employmentType || "",
          status: employee.status || "Active",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update employee.");
      }
await Swal.fire({
  icon: "success",
  title: "Employee Updated!",
  text: "Employee details have been updated successfully.",
  confirmButtonText: "Continue",
  confirmButtonColor: "#08785B",
  background: "#FFFCF6",
  color: "#192923",
});

navigate(`/employees/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading employee details...</p>;

  return (
    <div className="edit-employee-page">
      <div className="edit-employee-container">
        <button
          type="button"
          className="edit-back-button"
          onClick={() => navigate(`/employees/${id}`)}
        >
          ← Back to Employee
        </button>

        <h1>Edit Employee</h1>
        <p>Update employee information.</p>

        {error && <div className="edit-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {[
            ["name", "Full Name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["department", "Department"],
            ["designation", "Designation"],
            ["reportingManager", "Reporting Manager"],
            ["employmentType", "Employment Type"],
          ].map(([name, label]) => (
            <label className="edit-field" key={name}>
              {label}
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required={name === "name" || name === "email"}
              />
            </label>
          ))}

          <label className="edit-field">
            Status
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>

          <div className="edit-actions">
            <button
              type="button"
              onClick={() => navigate(`/employees/${id}`)}
            >
              Cancel
            </button>

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEmployee;