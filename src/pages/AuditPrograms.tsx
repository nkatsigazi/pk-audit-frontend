import { useEffect, useState } from 'react';
import axios from 'axios';

interface AuditProgram {
  id: number;
  name: string;
  type: string;
  description: string;
  defaultItems: { description: string; section: string }[];
}

export default function AuditPrograms() {
  const [programs, setPrograms] = useState<AuditProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://pk-audit-frontend.onrender.com/audit-programs')
      .then(res => {
        setPrograms(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <h3 className="mb-4">Audit Programs</h3>
      <p>Select a program to view its procedures. In full version, assign to engagement to auto-load items.</p>

      {loading ? (
        <p>Loading programs...</p>
      ) : (
        <div className="row g-4">
          {programs.map(program => (
            <div key={program.id} className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5>{program.name}</h5>
                  <p className="text-muted small"><strong>Type:</strong> {program.type}</p>
                  <p>{program.description}</p>
                  <p><strong>Procedures:</strong> {program.defaultItems.length}</p>
                  <div className="mt-auto">
                    <button className="btn btn-outline-primary btn-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}