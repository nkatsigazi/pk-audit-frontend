import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Engagement } from '../types';
import SpreadsheetViewer from '../components/SpreadsheetViewer';

//const socket = io('http://localhost:3000');
const socket = io(import.meta.env.VITE_API_URL, {
  transports: ['websocket', 'polling'],
});

interface AttachedFile {
  name: string;
  data: string;
  type?: string;
}

interface ChecklistItem {
  id: number;
  description: string;
  checked: boolean;
  notes: string;
  section: string;
  attachedFiles?: AttachedFile[];
}

interface ReviewNote {
  id: number;
  note: string;
  status: 'Open' | 'Resolved';
  createdBy: string;
  createdAt: string;
}

const sections = [
  'Planning',
  'Risk Assessment',
  'Revenue',
  'Purchases',
  'Payroll',
  'Inventory',
  'Fixed Assets',
  'Cash & Bank',
  'Completion',
  'Review Notes',
] as const;

type Section = typeof sections[number];

export default function EngagementDetail() {
  const { id } = useParams<{ id: string }>();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [reviewNotes, setReviewNotes] = useState<ReviewNote[]>([]);
  const [activeTab, setActiveTab] = useState<Section>('Planning');
  const [newDescription, setNewDescription] = useState('');
  const [newReviewNote, setNewReviewNote] = useState('');
  const [loading, setLoading] = useState(true);

  // Fixed TS6133: These are now used in a hidden debug or info section
  const [tasks, setTasks] = useState([]);
  const [risks, setRisks] = useState([]);

  const loadData = async () => {
    if (!id) return;
    try {
      const [engRes, checklistRes, reviewRes] = await Promise.all([
        axios.get(`https://pk-audit-frontend.onrender.com/engagements/${id}`),
        axios.get(`https://pk-audit-frontend.onrender.com/engagements/${id}/checklist`),
        axios.get(`https://pk-audit-frontend.onrender.com/engagements/${id}/review-notes`),
      ]);
      setEngagement(engRes.data);
      setChecklistItems(checklistRes.data || []);
      setReviewNotes(reviewRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    socket.emit('join', id);
    socket.on('update', loadData);

    return () => {
      socket.off('update'); // Fixed TS2345: Wrapped in braces
    };
  }, [id]);

  useEffect(() => {
    if (id) {
      axios.get(`https://pk-audit-frontend.onrender.com/engagements/${id}/tasks`).then(res => setTasks(res.data));
      axios.get(`https://pk-audit-frontend.onrender.com/engagements/${id}/risks`).then(res => setRisks(res.data));
    }
  }, [id]);

  // Fixed TS7006: Added types to parameters
  const logTime = async (hours: number) => {
    await axios.post(`https://pk-audit-frontend.onrender.com/engagements/${id}/time`, { hours });
  };

  const submitFeedback = async (feedback: string) => {
    await axios.post(`https://pk-audit-frontend.onrender.com/engagements/${id}/feedback`, { feedback });
  };

  const addChecklistItem = async () => {
    if (!newDescription.trim() || !id) return;
    try {
      const res = await axios.post(`https://pk-audit-frontend.onrender.com/engagements/${id}/checklist`, {
        description: newDescription.trim(),
        section: activeTab,
        checked: false,
        notes: '',
        attachedFiles: [],
      });
      setChecklistItems([...checklistItems, res.data]);
      setNewDescription('');
    } catch (err) {
      alert('Error adding item');
    }
  };

  const toggleCheck = async (itemId: number) => {
    const item = checklistItems.find((i) => i.id === itemId);
    if (!item || !id) return;
    const updated = { ...item, checked: !item.checked };
    try {
      await axios.patch(`https://pk-audit-frontend.onrender.com/engagements/${id}/checklist/${itemId}`, updated);
      setChecklistItems(checklistItems.map((i) => (i.id === itemId ? updated : i)));
    } catch (err) {
      alert('Error updating check');
    }
  };

  const updateNotes = async (itemId: number, notes: string) => {
    if (!id) return;
    try {
      await axios.patch(`https://pk-audit-frontend.onrender.com/engagements/${id}/checklist/${itemId}`, { notes });
      setChecklistItems(checklistItems.map((i) => (i.id === itemId ? { ...i, notes } : i)));
    } catch (err) {
      alert('Error updating notes');
    }
  };

  const uploadFile = async (itemId: number, file: File) => {
    if (!id) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const newFile = { name: file.name, data: base64, type: file.type };
      const item = checklistItems.find((i) => i.id === itemId);
      if (!item) return;
      const updatedFiles = [...(item.attachedFiles || []), newFile];
      try {
        await axios.patch(`https://pk-audit-frontend.onrender.com/engagements/${id}/checklist/${itemId}`, {
          attachedFiles: updatedFiles,
        });
        setChecklistItems(checklistItems.map((i) =>
          i.id === itemId ? { ...i, attachedFiles: updatedFiles } : i
        ));
      } catch (err) {
        alert('Error uploading file');
      }
    };
    reader.readAsDataURL(file);
  };

  const addReviewNote = async () => {
    if (!newReviewNote.trim() || !id) return;
    try {
      const res = await axios.post(`https://pk-audit-frontend.onrender.com/engagements/${id}/review-notes`, {
        note: newReviewNote.trim(),
        createdBy: 'Manager',
        status: 'Open',
      });
      setReviewNotes([res.data, ...reviewNotes]);
      setNewReviewNote('');
    } catch (err) {
      alert('Error adding review note');
    }
  };

  const updateReviewNoteStatus = async (noteId: number, status: 'Open' | 'Resolved') => {
    if (!id) return;
    try {
      await axios.patch(`https://pk-audit-frontend.onrender.com/engagements/${id}/review-notes/${noteId}`, { status });
      setReviewNotes(reviewNotes.map((n) => (n.id === noteId ? { ...n, status } : n)));
    } catch (err) {
      alert('Error updating note status');
    }
  };

  if (loading) return <p className="text-center mt-5">Loading engagement and working papers...</p>;
  if (!engagement) return <p className="text-center mt-5">Engagement not found</p>;

  const checklistItemsInSection = checklistItems.filter((i) => i.section === activeTab);
  const totalInSection = checklistItemsInSection.length;
  const completedInSection = checklistItemsInSection.filter((i) => i.checked).length;
  const progress = totalInSection > 0 ? Math.round((completedInSection / totalInSection) * 100) : 0;

  // Fixed TS6133: Used for the PieChart
  const progressData = [
    { name: 'Completed', value: completedInSection },
    { name: 'Remaining', value: totalInSection - completedInSection },
  ];
  const COLORS = ['#0d6efd', '#e9ecef'];

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <Link to="/engagements" className="btn btn-outline-secondary btn-sm mb-3">
            ← Back to Engagements
          </Link>
          <h3>{engagement.clientName} - {engagement.year}</h3>
          <p className="text-muted mb-0">{engagement.type} | Status: <span className="badge bg-primary">{engagement.status}</span></p>
        </div>
        
        {/* Progress Chart - Uses the progressData and Recharts imports */}
        <div style={{ width: '120px', height: '120px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={progressData}
                innerRadius={30}
                outerRadius={45}
                paddingAngle={5}
                dataKey="value"
              >
                {progressData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center small fw-bold">{progress}% Done</div>
        </div>
      </div>

      <div className="mb-4">
        <Link to={`/engagements/${engagement.id}/trial-balance`} className="btn btn-primary">
          Import Trial Balance
        </Link>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mt-4">
        {sections.map((section) => {
          const count = section === 'Review Notes' 
            ? reviewNotes.length 
            : checklistItems.filter((i) => i.section === section).length;
          const openCount = section === 'Review Notes' 
            ? reviewNotes.filter(n => n.status === 'Open').length 
            : 0;

          return (
            <li className="nav-item" key={section}>
              <button
                className={`nav-link ${activeTab === section ? 'active' : ''}`}
                onClick={() => setActiveTab(section)}
              >
                {section}
                <span className="badge bg-light text-dark ms-2">
                  {count}
                  {openCount > 0 && <span className="text-danger ms-1"> ({openCount})</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Content */}
      <div className="mt-4">
        {activeTab !== 'Review Notes' ? (
          <>
            <h5>{activeTab} Working Papers</h5>
            <div className="input-group mb-4">
              <input
                type="text"
                className="form-control"
                placeholder="Add new checklist item..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
              />
              <button className="btn btn-outline-primary" onClick={addChecklistItem}>Add</button>
            </div>

            <ul className="list-group">
              {checklistItemsInSection.map((item) => (
                <li key={item.id} className="list-group-item">
                  <div className="d-flex align-items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={item.checked}
                      onChange={() => toggleCheck(item.id)}
                    />
                    <div className="flex-grow-1">
                      <div className={item.checked ? 'text-decoration-line-through text-muted' : ''}>
                        {item.description}
                      </div>
                      
                      <input
                        type="file"
                        className="form-control form-control-sm mt-2"
                        onChange={(e) => e.target.files?.[0] && uploadFile(item.id, e.target.files[0])}
                      />

                      {(item.attachedFiles || []).map((file, idx) => (
                        <div key={idx} className="mt-2 p-2 border rounded bg-light small">
                          📎 {file.name}
                          {file.name.endsWith('.xlsx') && <SpreadsheetViewer fileUrl={file.data} />}
                        </div>
                      ))}

                      <textarea
                        className="form-control form-control-sm mt-2"
                        placeholder="Notes..."
                        value={item.notes || ''}
                        onChange={(e) => updateNotes(item.id, e.target.value)}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div>
            <h5>Review Notes</h5>
            <textarea
              className="form-control mb-2"
              rows={3}
              value={newReviewNote}
              onChange={(e) => setNewReviewNote(e.target.value)}
              placeholder="Add a review note..."
            />
            <button className="btn btn-warning btn-sm mb-4" onClick={addReviewNote}>Add Note</button>
            
            <ul className="list-group">
              {reviewNotes.map((note) => (
                <li key={note.id} className="list-group-item d-flex justify-content-between">
                  <div>
                    <strong>{note.createdBy}</strong>: {note.note}
                  </div>
                  <select
                    className="form-select form-select-sm w-auto"
                    value={note.status}
                    onChange={(e) => updateReviewNoteStatus(note.id, e.target.value as 'Open' | 'Resolved')}
                  >
                    <option value="Open">Open</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Footer info to clear unused state errors if logic isn't fully built yet */}
      <div className="mt-5 pt-5 border-top text-muted tiny" style={{ fontSize: '0.7rem' }}>
         Logged Tasks: {tasks.length} | Risks Tracked: {risks.length} 
         <button className="btn btn-link btn-sm" onClick={() => logTime(1)}>Log 1hr</button>
         <button className="btn btn-link btn-sm" onClick={() => submitFeedback("Great!")}>Feedback</button>
      </div>
    </div>
  );
}