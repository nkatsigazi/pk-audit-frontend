export default function Settings() {
  return (
    <div>
      <h3 className="mb-4">Settings</h3>
      <p className="lead">
        Configure firm-wide preferences, templates, and user access.
      </p>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>Firm Information</h5>
              <p className="text-muted">Update firm name, logo, contact details, and branding.</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>Audit Templates</h5>
              <p className="text-muted">Customize default checklists and audit programs for different engagement types.</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>User Management</h5>
              <p className="text-muted">Manage team members and permissions from the Users page.</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>Security & Backup</h5>
              <p className="text-muted">All data is securely stored in PostgreSQL with automatic backups.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 card border-info">
        <div className="card-body">
          <h5>Future Enhancements</h5>
          <ul>
            <li>Custom firm branding and logo</li>
            <li>Editable audit program templates</li>
            <li>Integration with accounting software</li>
            <li>Advanced reporting and analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}