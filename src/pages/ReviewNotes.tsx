import { useEffect, useState } from 'react';
import axios from 'axios';

interface ReviewNote {
  id: number;
  note: string;
  status: 'Open' | 'Resolved';
  createdBy: string;
  createdAt: string;
  engagementId: number;
  engagement: {
    clientName: string;
    year: string;
  };
}

export default function ReviewNotes() {
  const [notes, setNotes] = useState<ReviewNote[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllNotes = async () => {
    try {
      // Get all engagements
      const engRes = await axios.get('https://pk-audit-frontend.onrender.com/engagements');
      const engagements = engRes.data;

      // Get review notes for each engagement
      const notesPromises = engagements.map((eng: any) =>
        axios.get(`https://pk-audit-frontend.onrender.com/engagements/${eng.id}/review-notes`)
          .then(res => res.data.map((note: any) => ({
            ...note,
            engagement: {
              clientName: eng.clientName,
              year: eng.year,
            },
            engagementId: eng.id,
          })))
          .catch(() => [])
      );

      const allNotesArrays = await Promise.all(notesPromises);
      const allNotes = allNotesArrays.flat();

      // Sort by date descending
      allNotes.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setNotes(allNotes);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllNotes();
  }, []);

  const openNotes = notes.filter(n => n.status === 'Open').length;

  return (
    <div>
      <h3 className="mb-4">Firm-Wide Review Notes</h3>
      <p className="lead mb-4">
        All review notes across engagements.{' '}
        <span className="badge bg-warning text-dark">{openNotes} Open</span>
      </p>

      {loading ? (
        <p className="text-center">Loading review notes...</p>
      ) : notes.length === 0 ? (
        <div className="text-center text-muted mt-5">
          <p>No review notes yet — excellent work!</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Engagement</th>
                <th>Note</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id}>
                  <td>
                    <strong>{note.engagement.clientName}</strong><br />
                    <small className="text-muted">{note.engagement.year} (ID: {note.engagementId})</small>
                  </td>
                  <td>{note.note}</td>
                  <td>
                    <span className={`badge ${note.status === 'Open' ? 'bg-warning text-dark' : 'bg-success'}`}>
                      {note.status}
                    </span>
                  </td>
                  <td>{note.createdBy}</td>
                  <td>{new Date(note.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}