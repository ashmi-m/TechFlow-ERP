import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddEmployee.css";

/* ---------- Small helpers (kept OUTSIDE the page component) ----------
   Your old Field/SelectField were declared inside AddEmployee. React treats a
   component defined inside another as a brand-new component on every render,
   so the input was re-mounted on each keystroke and lost focus after 1 letter.
   Moving them outside fixes that bug. */

const ICONS = {
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  briefcase: "M3 7h18v13H3zM8 7V4h8v3M3 13h18",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  back: "M19 12H5M12 19l-7-7 7-7",
  camera: "M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  check: "M5 12l5 5 9-10",
  lock: "M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4",
};

function Icon({ name, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

function Section({ icon, title, subtitle, step, children }) {
  return (
    <section className="add-employee-section">
      <header className="add-employee-section-head">
        <span className="add-employee-section-icon"><Icon name={icon} /></span>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <small className="add-employee-step">Section {step} of 03</small>
      </header>
      <div className="add-employee-section-body">{children}</div>
    </section>
  );
}

function Label({ text, required }) {
  return (
    <span className="add-employee-label">
      {text}
      {required && <span className="add-employee-required"> *</span>}
    </span>
  );
}

function Field({ label, name, value, onChange, type = "text", required = false,
  placeholder, hint, readOnly = false, autoComplete, max, children }) {
  return (
    <label className="add-employee-field">
      <Label text={label} required={required} />
      <input
        className="add-employee-input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        required={required}
        readOnly={readOnly}
        autoComplete={autoComplete}
        max={max}
      />
      {children}
      {hint && <small className="add-employee-hint">{hint}</small>}
    </label>
  );
}

function SelectField({ label, name, value, onChange, options, required = false, hint }) {
  return (
    <label className="add-employee-field">
      <Label text={label} required={required} />
      <select
        className="add-employee-select"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {hint && <small className="add-employee-hint">{hint}</small>}
    </label>
  );
}

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0 - 4
}

const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  const bytes = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(bytes, (n) => chars[n % chars.length]).join("");
}

/* ---------- Page ---------- */

export default function AddEmployee() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    phone: "",
    department: "",
    jobPosition: "",
    systemRole: "Employee",
    employmentType: "Full-Time",
    joiningDate: "",
    reportingManager: "",
   
    password: "",
    confirmPassword: "",
    
  });

  const [photoPreview, setPhotoPreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => getStrength(formData.password), [formData.password]);
  const passwordsMatch =
    formData.confirmPassword !== "" && formData.password === formData.confirmPassword;

  // Handle input changes (text, select and checkbox)
  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  }

  function handleGeneratePassword() {
    const password = generatePassword();
    setFormData((previous) => ({ ...previous, password, confirmPassword: password }));
    setShowPassword(true);
  }

async function handleSubmit(event) {
  event.preventDefault();
  setError("");

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  if (formData.password.length < 8) {
    setError("Password must contain at least 8 characters.");
    return;
  }

  // Get Admin JWT token
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  if (!token) {
    setError("Admin session expired. Please login again.");
    return;
  }

  setLoading(true);

  try {
    const payload = {
      employeeId: formData.employeeId.trim(),
      name: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone,
      department: formData.department,
      designation: formData.jobPosition,
      joiningDate: formData.joiningDate,
      password: formData.password,
    };

    const response = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create employee.");
    }
window.alert("Employee and login account created successfully!");

    navigate("/employees");

  } catch (err) {
    setError(err.message || "Unable to create employee.");
  } finally {
    setLoading(false);
  }
}

  const shared = { onChange: handleChange };

  return (
    <main className="add-employee-page">
      <div className="add-employee-container">

        {/* Back Button */}
        <button type="button" className="add-employee-back" onClick={() => navigate("/employees")}>
          <Icon name="back" size={14} /> Back to Employees
        </button>

        {/* Page Heading */}
        <header className="add-employee-header">
          <h1>Add New Employee</h1>
          <p>Create a new employee profile, set up their workspace identity, and configure their account.</p>
        </header>

        <form onSubmit={handleSubmit}>

          {/* Personal Information */}
          <Section icon="user" step="01" title="Personal Information"
            subtitle="Basic identity and contact details used across the system.">
            <div className="add-employee-personal">
              <div className="add-employee-photo">
                <div className="add-employee-avatar">
                  {photoPreview ? <img src={photoPreview} alt="Employee preview" /> : <Icon name="user" size={34} />}
                </div>
                <strong>Employee Photograph</strong>
                <p>PNG, JPG or WebP up to 5MB.</p>
                <div className="add-employee-photo-actions">
                  <label className="add-employee-btn add-employee-btn-small add-employee-btn-cancel">
                    <Icon name="camera" size={14} /> Upload Photo
                    <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handlePhoto} />
                  </label>
                  {photoPreview && (
                    <button type="button" className="add-employee-link-danger" onClick={() => setPhotoPreview("")}>
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="add-employee-grid">
                <Field label="Full Name" name="fullName" value={formData.fullName} required
                  hint="First name followed by family name." {...shared} />
                <Field label="Employee ID" name="employeeId" value={formData.employeeId} required
                  hint="Unique identifier, for example EMP-006." {...shared} />
                <Field label="Email Address" name="email" type="email" value={formData.email} required
                  hint="Use the company email address." {...shared} />
                <Field label="Phone Number" name="phone" type="tel" value={formData.phone} required
                  hint="Used for SMS verification." {...shared} />
              </div>
            </div>
          </Section>

          {/* Employment Information */}
          <Section icon="briefcase" step="02" title="Employment & Organizational Structure"
            subtitle="Department, reporting line and access level.">
            <div className="add-employee-notice">
              <Icon name="shield" />
              <p>
                <strong>Role governance: </strong>
                Administrator rights cannot be given while adding an employee.
                Request them separately through your security team.
              </p>
            </div>

            <div className="add-employee-grid add-employee-grid-3">
              <SelectField label="Department" name="department" value={formData.department} required
                options={["Development", "Engineering", "Human Resources", "Finance", "Marketing", "Sales", "Design", "Operations"]}
                {...shared} />
              <Field label="Job Position" name="jobPosition" value={formData.jobPosition} required {...shared} />
      
      <Field
  label="System Access Role"
  name="systemRole"
  value="Employee"
  readOnly
  hint="Employee access is assigned automatically."
/>

              <Field label="Reporting Manager" name="reportingManager" value={formData.reportingManager} {...shared} />
              <Field label="Joining Date" name="joiningDate" type="date" max="9999-12-31" value={formData.joiningDate} required {...shared} />
              <SelectField label="Employment Type" name="employmentType" value={formData.employmentType} required
                options={["Full-Time", "Part-Time", "Contract", "Intern"]} {...shared} />
            </div>
          </Section>

          {/* Account Setup */}
          <Section icon="lock" step="03" title="Account Setup & Security"
            subtitle="Login credentials and the invitation email.">
            <div className="add-employee-grid add-employee-grid-3">
<p className="add-employee-security-note">
  Employees can sign in using their registered email address and temporary password.
</p>

              <Field label="Temporary Password" name="password" value={formData.password} required
                type={showPassword ? "text" : "password"} autoComplete="new-password" {...shared}>
                <div className="add-employee-strength" data-level={strength}>
                  <span style={{ width: `${(strength / 4) * 100}%` }} />
                </div>
                <small className="add-employee-hint">
                  {formData.password ? STRENGTH_LABELS[strength] : "Use 8+ characters with symbols and digits."}
                  {" · "}
                  <button type="button" className="add-employee-link" onClick={handleGeneratePassword}>Generate</button>
                  {" · "}
                  <button type="button" className="add-employee-link" onClick={() => setShowPassword((s) => !s)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </small>
              </Field>

              <Field label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} required
                type={showPassword ? "text" : "password"} autoComplete="new-password" {...shared}>
                {formData.confirmPassword && (
                  <small className={`add-employee-hint ${passwordsMatch ? "is-ok" : "is-bad"}`}>
                    {passwordsMatch ? "Passwords match." : "Passwords do not match."}
                  </small>
                )}
              </Field>
            </div>

            <label className="add-employee-check">
              <input type="checkbox" name="sendInvite" checked={formData.sendInvite} onChange={handleChange} />
              <span className="add-employee-box"><Icon name="check" size={12} /></span>
              <span>
                <strong>Send account invitation email</strong>
                <small>The employee receives a secure activation link and onboarding instructions.</small>
              </span>
            </label>

            <label className="add-employee-check">
              <input type="checkbox" name="requirePasswordReset" checked={formData.requirePasswordReset} onChange={handleChange} />
              <span className="add-employee-box"><Icon name="check" size={12} /></span>
              <span>
                <strong>Require a new password at first login</strong>
                <small>The employee must replace the temporary password before using the portal.</small>
              </span>
            </label>

            <p className="add-employee-security-note">
              Make sure your backend securely hashes passwords before storing them.
              Never save plain-text passwords.
            </p>
          </Section>

          {/* Error Message */}
          {error && <div className="add-employee-error" role="alert">{error}</div>}

          {/* Action Buttons */}
          <div className="add-employee-actions">
            <button type="button" className="add-employee-btn add-employee-btn-cancel" onClick={() => navigate("/employees")}>
              Cancel
            </button>
            <button type="submit" className="add-employee-btn add-employee-btn-submit" disabled={loading}>
              {loading ? "Creating..." : "Create Employee"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}