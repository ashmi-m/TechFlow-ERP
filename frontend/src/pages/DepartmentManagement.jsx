import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import "./DepartmentManagement.css";

const API_URL = "http://localhost:5000/api/departments";

const initialDepartments = [
  {
    id: 1,
    name: "Development",
    code: "DEPT001",
    head: "Rahul Sharma",
    employees: 20,
    status: "Active",
    icon: "</>",
    color: "blue",
  },
  {
    id: 2,
    name: "UI/UX Design",
    code: "DEPT002",
    head: "Anjali Menon",
    employees: 8,
    status: "Active",
    icon: "✿",
    color: "pink",
  },
  {
    id: 3,
    name: "Quality Assurance",
    code: "DEPT003",
    head: "Arjun Kumar",
    employees: 12,
    status: "Active",
    icon: "▣",
    color: "green",
  },
  {
    id: 4,
    name: "Human Resources",
    code: "DEPT004",
    head: "Sneha Nair",
    employees: 8,
    status: "Active",
    icon: "♙",
    color: "yellow",
  },
];

function DepartmentManagement() {
const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [headFilter, setHeadFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    head: "",
    employees: 0,
  });

  const totalEmployees = departments.reduce(
    (total, department) => total + Number(department.employees),
    0
  );

  const activeDepartments = departments.filter(
    (department) => department.status === "Active"
  ).length;

  const unassignedStaff = departments.reduce(
    (total, department) =>
      total + (department.head === "Not assigned" ? department.employees : 0),
    0
  );

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const matchesSearch =
        department.name.toLowerCase().includes(search.toLowerCase()) ||
        department.code.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || department.status === statusFilter;

      const matchesHead =
        headFilter === "All" || department.head === headFilter;

      return matchesSearch && matchesStatus && matchesHead;
    });
  }, [departments, search, statusFilter, headFilter]);

 const handleAddDepartment = async (event) => {
  event.preventDefault();

  if (
    !form.name.trim() ||
    !form.head.trim() ||
    form.employees === "" ||
    !Number.isFinite(Number(form.employees)) ||
    Number(form.employees) < 0
  ) {
    Swal.fire({
      icon: "warning",
      title: "Missing Information!",
      text: "Please enter valid department details.",
      confirmButtonColor: "#2864ef",
    });
    return;
  }

  const isDuplicate = departments.some(
    (department) =>
      department.name.toLowerCase() === form.name.trim().toLowerCase()
  );

  if (isDuplicate) {
    Swal.fire({
      icon: "warning",
      title: "Department Already Exists!",
      text: "Please enter a different department name.",
      confirmButtonColor: "#2864ef",
    });
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name.trim(),
        head: form.head.trim(),
        employees: Number(form.employees),
        status: "Active",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add department.");
    }

    const newDepartment = {
      ...data.department,
      id: data.department._id,
      icon: "▣",
      color: "blue",
    };

    setDepartments((previous) => [...previous, newDepartment]);

    setForm({ name: "", head: "", employees: 0 });
    setShowModal(false);

    await Swal.fire({
      icon: "success",
      title: "Department Added!",
      text: `${newDepartment.name} department has been added successfully.`,
      confirmButtonColor: "#2864ef",
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Adding Failed!",
      text: error.message,
      confirmButtonColor: "#2864ef",
    });
  }
};

    const handleDeleteDepartment = async (id) => {
  const department = departments.find((item) => item.id === id);

  if (!department) return;

  const result = await Swal.fire({
    title: "Are you sure?",
    text: `Do you want to delete ${department.name} department?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#64748b",
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete department.");
    }

    setDepartments((previous) =>
      previous.filter((item) => item.id !== id)
    );

    await Swal.fire({
      icon: "success",
      title: "Deleted Successfully!",
      text: `${department.name} department has been deleted.`,
      confirmButtonColor: "#2864ef",
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Deletion Failed!",
      text: error.message,
      confirmButtonColor: "#2864ef",
    });
  }
};

const handleEditDepartment = async (department) => {
  const { value: formValues } = await Swal.fire({
    title: "Edit Department",
    html: `
      <input id="edit-name" class="swal2-input" placeholder="Department Name" value="${department.name}">
      <input id="edit-head" class="swal2-input" placeholder="Department Head" value="${department.head}">
      <input id="edit-employees" type="number" min="0" class="swal2-input" placeholder="Total Employees" value="${department.employees}">
      <select id="edit-status" class="swal2-select">
        <option value="Active" ${department.status === "Active" ? "selected" : ""}>Active</option>
        <option value="Inactive" ${department.status === "Inactive" ? "selected" : ""}>Inactive</option>
      </select>
    `,
    showCancelButton: true,
    confirmButtonText: "Save Changes",
    confirmButtonColor: "#2864ef",
    preConfirm: () => {
      const name = document.getElementById("edit-name").value.trim();
      const head = document.getElementById("edit-head").value.trim();
      const employees = Number(
        document.getElementById("edit-employees").value
      );
      const status = document.getElementById("edit-status").value;

      if (!name || !head || !Number.isFinite(employees) || employees < 0) {
        Swal.showValidationMessage("Please enter valid department details.");
        return false;
      }

      return { name, head, employees, status };
    },
  });

  if (!formValues) return;

  try {
    const response = await fetch(`${API_URL}/${department.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formValues),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update department.");
    }

    setDepartments((previous) =>
      previous.map((item) =>
        item.id === department.id
          ? {
              ...item,
              ...data.department,
              id: data.department._id || department.id,
            }
          : item
      )
    );

    await Swal.fire({
      icon: "success",
      title: "Updated Successfully!",
      text: "Department details have been updated.",
      confirmButtonColor: "#2864ef",
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Update Failed!",
      text: error.message,
      confirmButtonColor: "#2864ef",
    });
  }
};






useEffect(() => {
  const fetchDepartments = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }

      const data = await response.json();

      setDepartments(
        data.map((department) => ({
          ...department,
          id: department._id,
          icon: "▣",
          color: "blue",
        }))
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Loading Failed!",
        text: error.message,
        confirmButtonColor: "#2864ef",
      });
    }
  };

  fetchDepartments();
}, []);

  const handleReset = () => {
    setSearch("");
    setStatusFilter("All");
    setHeadFilter("All");
  };

  return (
    <div className="department-layout">

      {/* SIDEBAR */}
      <aside className="department-sidebar">

        <div className="department-brand">
          <div className="brand-logo">✦</div>

          <div>
            <h3>TechFlow ERP</h3>
            <p>Manage • Build • Grow</p>
          </div>
        </div>

        <p className="sidebar-heading">MENU</p>

        <nav className="department-nav">
          <Link to="/dashboard" className="department-nav-link">
            <span>◉</span> Dashboard
          </Link>

          <Link to="/employees" className="department-nav-link">
            <span>♟</span> Employees
          </Link>

          <Link
            to="/departments"
            className="department-nav-link active"
          >
            <span>▦</span> Departments
            <small>{departments.length}</small>
          </Link>

          <Link to="/projects" className="department-nav-link">
            <span>▣</span> Projects
          </Link>

          <Link to="/project-managers" className="department-nav-link">
            <span>♙</span> Project Managers
          </Link>

          <Link to="/reports" className="department-nav-link">
            <span>▤</span> Reports
          </Link>
        </nav>

        <p className="sidebar-heading system-heading">SYSTEM</p>

        <Link to="/settings" className="department-nav-link">
          <span>⚙</span> Settings
        </Link>

        <div className="sidebar-bottom">

          <div className="sidebar-promo">
            <strong>✦ Better Teams</strong>
            <p>Build Better Products</p>
            <small>
              Organize departments and manage employee workflows smoothly.
            </small>
          </div>

          <Link to="/" className="logout-link">
            ⇥ &nbsp; Logout
          </Link>

          <p className="sidebar-version">
            TechFlow v2.4.1 <span>●</span>
          </p>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="department-main">

        {/* TOP HEADER */}
        <header className="department-topbar">

          <input
            type="search"
            placeholder="⌕  Search employees, departments, projects..."
            className="global-search"
          />

          <div className="topbar-profile">
            <button className="notification-button" type="button">
              ♧
            </button>

            <div className="profile-avatar">AM</div>

            <div>
              <strong>Alex Morgan</strong>
              <p>Administrator</p>
            </div>

            <span>⌄</span>
          </div>

        </header>

        {/* PAGE TITLE */}
        <section className="department-content">

          <div className="breadcrumb">
            Dashboard <span>›</span> <strong>Departments</strong>
          </div>

          <div className="department-title-row">
            <div>
              <h1>Department Management</h1>
              <p>
                Manage company departments, department heads, and employee
                distribution.
              </p>
            </div>

            <button
              className="add-department-button"
              onClick={() => setShowModal(true)}
              type="button"
            >
              + Add Department
            </button>
          </div>

          {/* SUMMARY CARDS */}
          <section className="department-stats">

            <div className="department-stat-card blue-stat">
              <div>
                <p>TOTAL DEPARTMENTS</p>
                <h2>{departments.length}</h2>
                <small>✓ 100% operational</small>
              </div>
              <div className="stat-icon">▤</div>
            </div>

            <div className="department-stat-card green-stat">
              <div>
                <p>TOTAL EMPLOYEES</p>
                <h2>{totalEmployees}</h2>
                <small>✓ Across all teams</small>
              </div>
              <div className="stat-icon">♟</div>
            </div>

            <div className="department-stat-card purple-stat">
              <div>
                <p>ACTIVE DEPARTMENTS</p>
                <h2>{activeDepartments}</h2>
                <small>● Active departments</small>
              </div>
              <div className="stat-icon">✦</div>
            </div>

            <div className="department-stat-card orange-stat">
              <div>
                <p>UNASSIGNED STAFF</p>
                <h2>{unassignedStaff}</h2>
                <small>● Staff without a head</small>
              </div>
              <div className="stat-icon">♟</div>
            </div>

          </section>

          {/* FILTER SECTION */}
          <section className="department-filters">

            <input
              type="search"
              placeholder="⌕  Search departments by name or code..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              value={headFilter}
              onChange={(event) => setHeadFilter(event.target.value)}
            >
              <option value="All">Head: All Leads</option>

              {departments.map((department) => (
                <option key={department.id} value={department.head}>
                  {department.head}
                </option>
              ))}
            </select>

            <button onClick={handleReset} type="button">
              ↻ Reset
            </button>

          </section>

          {/* DEPARTMENT TABLE */}
          <section className="department-table-container">

            <div className="department-table-scroll">
              <table className="department-table">

                <thead>
                  <tr>
                    <th>DEPARTMENT</th>
                    <th>DEPARTMENT CODE</th>
                    <th>DEPARTMENT HEAD</th>
                    <th>TOTAL EMPLOYEES</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDepartments.map((department) => (

                    <tr key={department.id}>

                      <td>
                        <div className="department-name-cell">
                          <div className={`department-icon ${department.color}`}>
                            {department.icon}
                          </div>

                          <div>
                            <strong>{department.name}</strong>
                            <p>
                              {department.name === "Development"
                                ? "Core engineering & development"
                                : department.name === "UI/UX Design"
                                ? "Product design & UX research"
                                : department.name === "Quality Assurance"
                                ? "Automated testing & reliability"
                                : "People operations & recruitment"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="department-code">
                          {department.code}
                        </span>
                      </td>

                      <td>
                        <div className="department-head-cell">
                          <div className="head-avatar">
                            {department.head
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <strong>{department.head}</strong>
                        </div>
                      </td>

                      <td>
                        <strong>{department.employees}</strong>
                        <span className="employee-percentage">
                          &nbsp; staff
                        </span>
                      </td>

                      <td>
                        <span
                          className={`department-status ${
                            department.status === "Active"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          ● {department.status}
                        </span>
                      </td>

                      <td>
                        <div className="department-actions">
                          <button
  type="button"
  title="View department"
  onClick={() =>
    Swal.fire({
      title: department.name,
      html: `
        <div style="text-align: left; line-height: 2;">
          <p><strong>Department Code:</strong> ${department.code}</p>
          <p><strong>Department Head:</strong> ${department.head}</p>
          <p><strong>Total Employees:</strong> ${department.employees}</p>
          <p><strong>Status:</strong> ${department.status}</p>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Close",
      confirmButtonColor: "#2864ef",
    })
  }
>
  ◉
</button>

                         <button
  type="button"
  title="Edit department"
  onClick={() => handleEditDepartment(department)}
>
  ✎
</button>

                          <button
                            type="button"
                            title="Delete department"
                            onClick={() =>
                              handleDeleteDepartment(department.id)
                            }
                          >
                            ⋮
                          </button>
                        </div>
                      </td>

                    </tr>

                  ))}

                  {filteredDepartments.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-departments">
                        No departments found.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>
            </div>

            <div className="department-table-footer">
              <p>
                Showing {filteredDepartments.length} of {departments.length}{" "}
                departments
              </p>

              <div className="pagination">
                <button type="button" disabled>Previous</button>
                <button type="button" className="current-page">1</button>
                <button type="button" disabled>Next</button>
              </div>
            </div>

          </section>

        </section>

      </main>

      {/* ADD DEPARTMENT MODAL */}
      {showModal && (

        <div
          className="department-modal-overlay"
          onClick={() => setShowModal(false)}
        >

          <div
            className="department-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="modal-header">
              <div>
                <h2>Add Department</h2>
                <p>Create a new company department.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddDepartment}>

              <label>Department Name</label>
              <input
                type="text"
                placeholder="Enter department name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />

              <label>Department Head</label>
              <input
                type="text"
                placeholder="Enter department head name"
                value={form.head}
                onChange={(event) =>
                  setForm({ ...form, head: event.target.value })
                }
                required
              />

              <label>Total Employees</label>
              <input
                type="number"
                min="0"
                value={form.employees}
                onChange={(event) =>
                  setForm({ ...form, employees: event.target.value })
                }
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-button">
                  Add Department
                </button>
              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default DepartmentManagement;