import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface EngagementSummary {
  id: number;
  clientName: string;
  year: string;
  type: string;
  status: string;
  hasTrialBalance: boolean;
  rowCount: number;
}

export default function TrialBalances() {
  const [engagements, setEngagements] = useState<EngagementSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const engRes = await axios.get(`${import.meta.env.VITE_API_URL}/engagements`)
        const allEngagements = engRes.data;

        const summaries = await Promise.all(
          allEngagements.map(async (eng: any) => {
            try {
              const tbRes = await axios.get(`${import.meta.env.VITE_API_URL}/engagements/${eng.id}/trial-balance`);
              return {
                id: eng.id,
                clientName: eng.clientName,
                year: eng.year,
                type: eng.type,
                status: eng.status,
                hasTrialBalance: true,
                rowCount: tbRes.data.length,
              };
            } catch {
              return {
                id: eng.id,
                clientName: eng.clientName,
                year: eng.year,
                type: eng.type,
                status: eng.status,
                hasTrialBalance: false,
                rowCount: 0,
              };
            }
          })
        );

        setEngagements(summaries);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      <h3 className="mb-4">Trial Balances</h3>
      <p className="lead">
        Overview of all engagements and their imported trial balances.
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead className="table-light">
              <tr>
                <th>Engagement</th>
                <th>Year</th>
                <th>Type</th>
                <th>Status</th>
                <th>Trial Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {engagements.map((eng) => (
                <tr key={eng.id}>
                  <td>
                    <strong>{eng.clientName}</strong>
                  </td>
                  <td>{eng.year}</td>
                  <td>{eng.type}</td>
                  <td>
                    <span className={`badge ${eng.status === 'Completed' ? 'bg-success' : 'bg-primary'}`}>
                      {eng.status}
                    </span>
                  </td>
                  <td>
                    {eng.hasTrialBalance ? (
                      <span className="text-success">
                        ✓ Imported ({eng.rowCount} rows)
                      </span>
                    ) : (
                      <span className="text-muted">Not imported</span>
                    )}
                  </td>
                  <td>
                    <Link
                      to={`/engagements/${eng.id}/trial-balance`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      {eng.hasTrialBalance ? 'View / Update' : 'Import TB'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}