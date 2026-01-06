export default function WorkingPapers() {
  return (
    <div>
      <h3 className="mb-4">Working Papers</h3>
      <p className="lead">
        Working papers are the foundation of every audit — all evidence, checklists, and conclusions are stored here.
      </p>

      <div className="row g-4">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>How to Use Working Papers</h5>
              <ol className="list-group list-group-numbered">
                <li className="list-group-item">Open an engagement from the Engagements page</li>
                <li className="list-group-item">Navigate through audit sections (Planning, Revenue, etc.)</li>
                <li className="list-group-item">Complete checklists, add notes, and attach supporting documents</li>
                <li className="list-group-item">Track progress with automatic completion percentage</li>
                <li className="list-group-item">Add review notes for QC and resolution</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm bg-light">
            <div className="card-body">
              <h5>Key Benefits</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Everything in one place</li>
                <li className="list-group-item">Real-time collaboration</li>
                <li className="list-group-item">Full audit trail</li>
                <li className="list-group-item">File attachments supported</li>
                <li className="list-group-item">Automatic backups</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}