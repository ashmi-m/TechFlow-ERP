
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ViewEmployee.css";

/* ---------- Helpers (outside the component on purpose) ---------- */

const ICONS = {
    back: "M19 12H5M12 19l-7-7 7-7",
    edit: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
    mail: "M4 6h16v12H4zM4 7l8 6 8-6",
    pin: "M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    briefcase: "M3 7h18v13H3zM8 7V4h8v3M3 13h18",
    building: "M4 21V4h10v17M14 9h6v12M8 8h2M8 12h2M8 16h2",
    shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
    badge: "M12 3l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z",
    lock: "M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4",
    clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
    check: "M5 12l5 5 9-10",
};

function Icon({ name, size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={ICONS[name]} />
        </svg>
    );
}

const show = (v) => (v === undefined || v === null || v === "" ? "—" : v);

function formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    return isNaN(d) ? "—" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function tenure(value) {
    if (!value) return "—";
    const start = new Date(value);
    if (isNaN(start)) return "—";
    const months = Math.max(0, (new Date().getFullYear() - start.getFullYear()) * 12 + (new Date().getMonth() - start.getMonth()));
    const y = Math.floor(months / 12);
    const m = months % 12;
    return y ? `${y}y ${m}m` : `${m} months`;
}

function initials(name = "") {
    return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
}

function Card({ icon, title, badge, children, className = "" }) {
    return (
        <section className={`view-employee-card ${className}`}>
            <header className="view-employee-card-head">
                <h2><Icon name={icon} size={15} /> {title}</h2>
                {badge && <span className="view-employee-badge">{badge}</span>}
            </header>
            <div className="view-employee-card-body">{children}</div>
        </section>
    );
}

function Row({ label, value }) {
    return (
        <div className="view-employee-row">
            <dt>{label}</dt>
            <dd>{show(value)}</dd>
        </div>
    );
}

const TABS = [
    ["overview", "Overview"],
    ["personal", "Personal Information"],
    ["employment", "Employment Details"],
    ["account", "Account & Access Control"],
    ["payroll", "Compensation & Payroll"],
];

/* ---------- Page ---------- */

export default function ViewEmployee() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tab, setTab] = useState("overview");

    useEffect(() => {
        let ignore = false;

        async function load() {
            setLoading(true);
            setError("");
            try {
const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

if (!token) {
    throw new Error("Authentication token not found. Please login again.");
}

const response = await fetch(
    `http://localhost:5000/api/employees/${id}`,
    {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
);
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.message || `Failed to load employee (status ${response.status}).`);
                // supports { ...employee } or { data: employee } or { employee }
                if (!ignore) setEmployee(result.data || result.employee || result);
            } catch (err) {
                if (!ignore) setError(err.message || "Unable to connect to the server.");
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        load();
        return () => { ignore = true; };
    }, [id]);

    async function handleDeactivate() {
        if (!window.confirm("Deactivate this employee?")) return;
        try {
           const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

if (!token) {
    throw new Error("Authentication token not found. Please login again.");
}

const response = await fetch(
    `http://localhost:5000/api/employees/${id}`,
    {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Inactive" }),
    }
);
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || "Failed to deactivate employee.");
            setEmployee((previous) => ({ ...previous, status: "Inactive" }));
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) return <main className="view-employee-page"><p className="view-employee-state">Loading employee...</p></main>;

    if (error && !employee) {
        return (
            <main className="view-employee-page">
                <div className="view-employee-container">
                    <div className="view-employee-error" role="alert">{error}</div>
                    <button type="button" className="view-employee-btn" onClick={() => navigate("/employees")}>Back to Employees</button>
                </div>
            </main>
        );
    }

    const e = employee;
    const name = e.name || e.fullName;
    const title = e.designation || e.jobPosition;
    const status = e.status || "Active";
    const isActive = status.toLowerCase() === "active";

    const personal = (
        <Card icon="user" title="Personal Information" badge="Verified Record">
            <dl className="view-employee-list">
                <Row label="Full Legal Name" value={name} />
                <Row label="Employee ID" value={e.employeeId} />
                <Row label="Work Email" value={e.email} />
                <Row label="Phone Number" value={e.phone} />
                <Row label="Date of Birth" value={e.dateOfBirth && formatDate(e.dateOfBirth)} />
                <Row label="Address" value={e.address} />
                <Row label="Emergency Contact" value={e.emergencyContact} />
            </dl>
        </Card>
    );

    const employment = (
        <Card icon="briefcase" title="Employment Information" badge="Tier 1 Core">
            <dl className="view-employee-list">
                <Row label="Department" value={e.department} />
                <Row label="Designation" value={title} />
                <Row label="Employment Type" value={e.employmentType} />
                <Row label="Joining Date" value={formatDate(e.joiningDate)} />
                <Row label="Reporting Manager" value={e.reportingManager} />
                <Row label="Work Location" value={e.location} />
                <Row label="Status" value={status} />
            </dl>
        </Card>
    );

    const account = (
        <Card icon="lock" title="Account & Access Control">
            <dl className="view-employee-list">
                <Row label="Username" value={e.username} />
                <Row label="System Access Role" value={e.systemRole} />
                <Row label="Invitation Email" value={e.sendInvite === undefined ? "—" : e.sendInvite ? "Sent" : "Not sent"} />
                <Row label="Password Reset at First Login" value={e.requirePasswordReset === undefined ? "—" : e.requirePasswordReset ? "Required" : "Not required"} />
            </dl>
        </Card>
    );

    const journey = (
        <Card icon="clock" title="Organizational Journey" badge={e.joiningDate ? "1 Milestone" : ""}>
            {e.joiningDate ? (
                <ol className="view-employee-timeline">
                    <li>
                        <span className="view-employee-dot"><Icon name="check" size={10} /></span>
                        <small>{formatDate(e.joiningDate)}</small>
                        <strong>Joined TechFlow{title ? ` as ${title}` : ""}</strong>
                        <p>{show(e.department)} · {show(e.employmentType)}</p>
                    </li>
                </ol>
            ) : <p className="view-employee-empty">No milestones recorded yet.</p>}
        </Card>
    );

    const logs = Array.isArray(e.logs) ? e.logs : [];

    return (
        <main className="view-employee-page">
            <div className="view-employee-container">

                {/* Breadcrumb + actions */}
                <div className="view-employee-topline">
                    <nav className="view-employee-crumbs" aria-label="Breadcrumb">
                        <a href="/dashboard">Dashboard</a> / <a href="/employees">Employees</a> / <strong>Employee Profile</strong>
                    </nav>
                </div>

                <header className="view-employee-header">
                    <div>
                        <h1>Employee Profile <span className="view-employee-chip">{show(e.employeeId)}</span></h1>
                        <p>Comprehensive employee details, reporting hierarchy, and verified employment records.</p>
                    </div>
                    <div className="view-employee-header-actions">
                        <button type="button" className="view-employee-btn" onClick={() => navigate("/employees")}>
                            <Icon name="back" size={14} /> Back to Employees
                        </button>
                        {/* <button type="button" className="view-employee-btn view-employee-btn-primary" onClick={() => navigate(`/employees/${id}/edit`)}>
                            <Icon name="edit" size={14} /> Edit Employee
                        </button> */}
                    </div>
                </header>

                {error && <div className="view-employee-error" role="alert">{error}</div>}

                {/* Profile summary */}
                <section className="view-employee-profile">
                    <div className="view-employee-identity">
                        {e.photo ? <img className="view-employee-avatar" src={e.photo} alt={name} /> : <span className="view-employee-avatar">{initials(name)}</span>}
                        <div>
                            <div className="view-employee-name">
                                <h2>{show(name)}</h2>
                                <span className={`view-employee-status ${isActive ? "is-active" : "is-inactive"}`}>● {status}</span>
                                <span className="view-employee-chip">{show(e.employeeId)}</span>
                            </div>
                            <p className="view-employee-title">{show(title)}</p>
                            <p className="view-employee-meta">
                                <span><Icon name="building" size={13} /> {show(e.department)}</span>
                                <span><Icon name="mail" size={13} /> {show(e.email)}</span>
                                {e.location && <span><Icon name="pin" size={13} /> {e.location}</span>}
                            </p>
                        </div>
                    </div>

                    <dl className="view-employee-stats">
                        <div><dt>Date Joined</dt><dd>{formatDate(e.joiningDate)}</dd></div>
                        <div><dt>Total Tenure</dt><dd>{tenure(e.joiningDate)}</dd></div>
                        <div><dt>Reports To</dt><dd>{show(e.reportingManager)}</dd></div>
                        <div><dt>Work Mode</dt><dd>{show(e.workMode)}</dd></div>
                    </dl>
                </section>

                {/* Summary tiles */}
                <section className="view-employee-tiles">
                    <div><Icon name="shield" /><span><small>Employment Status</small><strong>{show(status)}</strong><em>{show(e.employmentType)}</em></span></div>
                    <div><Icon name="building" /><span><small>Primary Department</small><strong>{show(e.department)}</strong></span></div>
                    <div><Icon name="badge" /><span><small>Designation</small><strong>{show(title)}</strong></span></div>
                    <div><Icon name="user" /><span><small>Direct Supervisor</small><strong>{show(e.reportingManager)}</strong></span></div>
                </section>

                {/* Tabs */}
                <div className="view-employee-tabs" role="tablist">
                    {TABS.map(([key, label]) => (
                        <button key={key} type="button" role="tab" aria-selected={tab === key}
                            className={tab === key ? "is-active" : ""} onClick={() => setTab(key)}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                {tab === "overview" && (
                    <div className="view-employee-columns">
                        <div className="view-employee-col">
                            {personal}
                            <Card icon="shield" title="Recent Administrative Logs">
                                {logs.length ? (
                                    <ul className="view-employee-logs">
                                        {logs.map((log, i) => (
                                            <li key={i}><strong>{log.title}</strong><small>{formatDate(log.date)}</small><p>{log.description}</p></li>
                                        ))}
                                    </ul>
                                ) : <p className="view-employee-empty">No administrative activity recorded yet.</p>}
                            </Card>
                        </div>
                        <div className="view-employee-col">
                            {employment}
                            {journey}
                        </div>
                    </div>
                )}
                {tab === "personal" && personal}
                {tab === "employment" && <div className="view-employee-col">{employment}{journey}</div>}
                {tab === "account" && account}
                {tab === "payroll" && (
                    <Card icon="lock" title="Compensation & Payroll">
                        <p className="view-employee-empty">Payroll details are restricted and not available yet.</p>
                    </Card>
                )}

                {/* Sticky action bar */}
                <div className="view-employee-bar" role="region" aria-label="Record actions">
                    <span><i /> Record Status: <strong>Locked (Read-Only)</strong></span>
                    <div>
                        <button type="button" className="view-employee-bar-btn" onClick={() => navigate("/employees")}>Back to Directory</button>
                        {isActive && <button type="button" className="view-employee-bar-btn is-danger" onClick={handleDeactivate}>Deactivate</button>}
                        <button type="button" className="view-employee-bar-btn is-primary" onClick={() => navigate(`/employees/${id}/edit`)}>Edit Profile</button>
                    </div>
                </div>

            </div>
        </main>
    );
}
