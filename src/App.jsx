import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import "./App.css";

const STORAGE_KEY = "cicco-career-tracker";

const emptyForm = {
  company: "",
  role: "",
  location: "",
  type: "Remote",
  status: "Wishlist",
  link: "",
  appliedDate: "",
  followUpDate: "",
  notes: "",
};

function loadApplications() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function getDaysSince(dateString) {
  if (!dateString) return null;

  const today = new Date();
  const date = new Date(dateString);
  const difference = today - date;

  return Math.floor(difference / (1000 * 60 * 60 * 24));
}

function getDaysUntil(dateString) {
  if (!dateString) return null;

  const today = new Date();
  const date = new Date(dateString);
  const difference = date - today;

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

export default function App() {
  const [applications, setApplications] = useState(loadApplications);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [editingId, setEditingId] = useState(null);
  const [collapsedColumns, setCollapsedColumns] = useState({});

  const companyInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }, [applications]);

  function updateForm(field, value) {
    setForm({ ...form, [field]: value });
  }
function celebrateOffer() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.65 },
  });
}

  function saveApplication() {
  if (!form.company.trim() || !form.role.trim()) return;

  if (editingId) {
    setApplications(
      applications.map((app) =>
        app.id === editingId ? { ...app, ...form } : app
      )
    );

    setEditingId(null);
  } else {
    const newApplication = {
      id: Date.now(),
      ...form,
    };

    setApplications([newApplication, ...applications]);
  }

  if (form.status === "Offer") {
    celebrateOffer();
  }

  setForm(emptyForm);
}

  function editApplication(app) {
    setForm({
      company: app.company,
      role: app.role,
      location: app.location,
      type: app.type,
      status: app.status,
      link: app.link,
      appliedDate: app.appliedDate,
      followUpDate: app.followUpDate,
      notes: app.notes,
    });

    setEditingId(app.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setTimeout(() => {
      const input = companyInputRef.current;

      if (input) {
        input.focus();
        const length = input.value.length;
        input.setSelectionRange(length, length);
      }
    }, 0);
  }

  function deleteApplication(id) {
    setApplications(applications.filter((app) => app.id !== id));
  }

  function cancelEdit() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleShortcut(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      saveApplication();
    }

    if (e.key === "Escape") {
      cancelEdit();
    }
  }

  function toggleColumn(status) {
    setCollapsedColumns({
      ...collapsedColumns,
      [status]: !collapsedColumns[status],
    });
  }

  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch =
        app.company.toLowerCase().includes(search.toLowerCase()) ||
        app.role.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.appliedDate || 0);
      const dateB = new Date(b.appliedDate || 0);

      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const stats = {
    total: applications.length,
    wishlist: applications.filter((app) => app.status === "Wishlist").length,
    applied: applications.filter((app) => app.status === "Applied").length,
    interview: applications.filter((app) => app.status === "Interview").length,
    offer: applications.filter((app) => app.status === "Offer").length,
    rejected: applications.filter((app) => app.status === "Rejected").length,
  };

  return (
    <main className="app">
      <section className="hero">
        <h1>Cicco Career Tracker 💼</h1>
        <p className="subtitle">Operation Frontend Job ✨</p>
      </section>

      <div className="container">
        <section className="stats">
          <Stat label="Total" value={stats.total} />
          <Stat label="Wishlist" value={stats.wishlist} />
          <Stat label="Applied" value={stats.applied} />
          <Stat label="Interview" value={stats.interview} />
          <Stat label="Offer" value={stats.offer} />
          <Stat label="Rejected" value={stats.rejected} />
        </section>

        <section className="panel">
          <h2>{editingId ? "Edit Application" : "Add New Application"}</h2>

          <div className="form-grid">
            <label>
              <span>Company *</span>
              <input
                ref={companyInputRef}
                placeholder="e.g. Spotify"
                value={form.company}
                onChange={(e) => updateForm("company", e.target.value)}
                onKeyDown={handleShortcut}
              />
            </label>

            <label>
              <span>Job Title *</span>
              <input
                placeholder="e.g. Frontend Developer"
                value={form.role}
                onChange={(e) => updateForm("role", e.target.value)}
                onKeyDown={handleShortcut}
              />
            </label>

            <label>
              <span>Location</span>
              <input
                placeholder="e.g. Remote, New York, Austin"
                value={form.location}
                onChange={(e) => updateForm("location", e.target.value)}
                onKeyDown={handleShortcut}
              />
            </label>

            <label>
              <span>Work Type</span>
              <select
                value={form.type}
                onChange={(e) => updateForm("type", e.target.value)}
                onKeyDown={handleShortcut}
              >
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
            </label>

            <label>
              <span>Status</span>
              <select
                value={form.status}
                onChange={(e) => updateForm("status", e.target.value)}
                onKeyDown={handleShortcut}
              >
                <option>Wishlist</option>
                <option>Applied</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </label>

            <label>
              <span>Application Link</span>
              <input
                placeholder="https://..."
                value={form.link}
                onChange={(e) => updateForm("link", e.target.value)}
                onKeyDown={handleShortcut}
              />
            </label>

            <label>
              <span>Applied Date</span>
              <input
                type="date"
                value={form.appliedDate}
                onChange={(e) => updateForm("appliedDate", e.target.value)}
                onKeyDown={handleShortcut}
              />
            </label>

            <label>
              <span>Follow-up Date</span>
              <input
                type="date"
                value={form.followUpDate}
                onChange={(e) => updateForm("followUpDate", e.target.value)}
                onKeyDown={handleShortcut}
              />
            </label>
          </div>

          <label className="notes-label">
            <span>Notes</span>
            <textarea
              placeholder="Requirements, next steps, interview notes..."
              value={form.notes}
              onChange={(e) => updateForm("notes", e.target.value)}
              onKeyDown={handleShortcut}
            />
          </label>

          <p className="shortcut-hint">
            Ctrl/Cmd + Enter to save · Esc to cancel
          </p>

          <div className="button-row">
            {editingId && (
              <button className="secondary" onClick={cancelEdit}>
                Cancel
              </button>
            )}

            <button onClick={saveApplication}>
              {editingId ? "Save Changes ✨" : "Add Application"}
            </button>
          </div>
        </section>

        <section className="filters">
          <input
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Wishlist</option>
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </section>

        <section className="board">
          {["Wishlist", "Applied", "Interview", "Offer", "Rejected"].map(
            (status) => (
              <StatusColumn
                key={status}
                status={status}
                applications={filteredApplications.filter(
                  (app) => app.status === status
                )}
                onEdit={editApplication}
                onDelete={deleteApplication}
                editingId={editingId}
                isCollapsed={collapsedColumns[status]}
                onToggle={() => toggleColumn(status)}
              />
            )
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function StatusColumn({
  status,
  applications,
  onEdit,
  onDelete,
  editingId,
  isCollapsed,
  onToggle,
}) {
  return (
    <section className="status-column">
      <button className="column-toggle" onClick={onToggle}>
        <span className={`status-title ${status.toLowerCase()}`}>
          {status} ({applications.length})
        </span>
        <span>{isCollapsed ? "▼" : "▲"}</span>
      </button>

      {!isCollapsed && (
        <>
          {applications.length === 0 && (
            <p className="empty">Nothing here yet.</p>
          )}

          {applications.map((app) => {
            const isEditing = editingId === app.id;
            const daysSinceApplied = getDaysSince(app.appliedDate);
            const daysUntilFollowUp = getDaysUntil(app.followUpDate);

            const followUpClass =
              daysUntilFollowUp === null
                ? ""
                : daysUntilFollowUp < 0
                ? "overdue"
                : daysUntilFollowUp === 0
                ? "due-today"
                : "";

            return (
              <article className={`job-card ${followUpClass}`} key={app.id}>
                <h3>{app.role}</h3>

                <p>
                  <strong>{app.company}</strong>
                </p>

                <p>{app.location || "No location added"}</p>

                <span className={`tag ${app.status.toLowerCase()}`}>
                  {app.status}
                </span>

                <span className="tag work-type">{app.type}</span>

                {app.appliedDate && (
                  <p>
                    Applied: {app.appliedDate}
                    {daysSinceApplied !== null &&
                      ` (${daysSinceApplied} days ago)`}
                  </p>
                )}

                {app.followUpDate && (
                  <p>
                    Follow up: {app.followUpDate}
                    {daysUntilFollowUp !== null &&
                      (daysUntilFollowUp > 0
                        ? ` (in ${daysUntilFollowUp} days)`
                        : daysUntilFollowUp === 0
                        ? " (today)"
                        : ` (${Math.abs(daysUntilFollowUp)} days overdue)`)}
                  </p>
                )}

                {app.notes && <p>{app.notes}</p>}

                <div className="card-actions">
                  {app.link && (
                    <a href={app.link} target="_blank">
                      Open Link
                    </a>
                  )}

                  <button onClick={() => onEdit(app)}>
                    {isEditing ? "Editing..." : "Edit"}
                  </button>

                  <button
                    className="danger"
                    disabled={isEditing}
                    onClick={() => onDelete(app.id)}
                  >
                    {isEditing ? "Editing..." : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </>
      )}
    </section>
  );
}