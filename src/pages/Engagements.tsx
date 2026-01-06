import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import type { Engagement } from '../types';

interface Client {
  id: number;
  name: string;
}

type Role = 'Junior' | 'Manager' | 'Partner';

export default function Engagements() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<Role>('Junior');
  const [showModal, setShowModal] = useState(false);
  const [editingEngagement, setEditingEngagement] = useState<Engagement | null>(null);
  const [formData, setFormData] = useState({
    clientId: 0,
    year: '',
    type: '',
  });

  const loadData = async () => {
    try {
      const [engRes, clientRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/engagements`),
        axios.get(`${import.meta.env.VITE_API_URL}/clients`),
      ]);
      setEngagements(engRes.data);
      setClients(clientRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setEngagements([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (eng?: Engagement) => {
    if (eng) {
      setEditingEngagement(eng);
      setFormData({
        clientId: eng.clientId || 0, // Fixed: This now matches the updated interface
        year: eng.year,
        type: eng.type,
      });
    } else {
      setEditingEngagement(null);
      setFormData({ clientId: 0, year: '', type: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent, action: 'save' | 'submit') => {
    e.preventDefault();

    if (formData.clientId === 0) {
      alert('Please select a client');
      return;
    }

    const payload = {
      clientId: formData.clientId,
      year: formData.year,
      type: formData.type,
      status: action === 'submit' ? 'Pending Review' : 'Draft',
    };

    try {
      if (editingEngagement) {
        await axios.patch(`${import.meta.env.VITE_API_URL}/engagements/${editingEngagement.id}`, payload);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/engagements`, payload);
      }
      setShowModal(false);
      loadData();
    } catch {
      alert('Error saving engagement');
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/engagements/${id}/status`, { status: newStatus });
      loadData();
    } catch {
      alert('Not allowed or error updating status');
    }
  };

  // Fixed: Removed unused parameter error by removing the argument
  const getAllowedStatuses = (): string[] => {
    if (currentRole === 'Junior') return [];
    if (currentRole === 'Manager') {
      return ['Pending Review', 'Under Review', 'Approved'];
    }
    if (currentRole === 'Partner') {
      return ['Pending Review', 'Under Review', 'Approved', 'Completed'];
    }
    return [];
  };

  const getBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      Draft: 'bg-secondary',
      'Pending Review': 'bg-warning text-dark',
      'Under Review': 'bg-info',
      Approved: 'bg-primary',
      Completed: 'bg-success',
    };
    return map[status] || 'bg-secondary';
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Audit Engagements</h3>
        <div className="d-flex align-items-center gap-3">
          <select
            className="form-select w-auto"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as Role)}
          >
            <option value="Junior">Junior Auditor</option>
            <option value="Manager">Manager</option>
            <option value="Partner">Partner</option>
          </select>

          {currentRole === 'Junior' && (
            <button className="btn btn-primary" onClick={() => openModal()}>
              + New Engagement
            </button>
          )}
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : engagements.length === 0 ? (
            <div className="p-4 text-center text-muted">No engagements yet — create one!</div>
          ) : (
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Client</th>
                  <th>Year</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {engagements.map((eng, index) => (
                  <tr key={eng.id}>
                    <td>{index + 1}</td>
                    <td>
                      <Link to={`/engagements/${eng.id}`} className="text-decoration-none text-dark">
                        <strong>{eng.clientName}</strong>
                      </Link>
                    </td>
                    <td>{eng.year}</td>
                    <td>{eng.type}</td>
                    <td>
                      <span className={`badge ${getBadgeClass(eng.status)}`}>
                        {eng.status}
                      </span>
                    </td>
                    <td>
                      {currentRole === 'Junior' && eng.status === 'Draft' && (
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => openModal(eng)}
                        >
                          Edit Draft
                        </button>
                      )}
                      {currentRole !== 'Junior' && getAllowedStatuses().length > 0 && (
                        <select
                          className="form-select form-select-sm"
                          style={{ width: 'auto' }}
                          value={eng.status}
                          onChange={(e) => updateStatus(eng.id, e.target.value)}
                        >
                          <option value={eng.status}>{eng.status} (current)</option>
                          {getAllowedStatuses()
                            .filter((s) => s !== eng.status)
                            .map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && currentRole === 'Junior' && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1} onClick={() => setShowModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingEngagement ? 'Edit Draft' : 'New Engagement'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={(e) => handleSubmit(e, 'submit')}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Client</label>
                    <select
                      className="form-select"
                      required
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: +e.target.value })}
                    >
                      <option value={0}>Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Year</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="">Select type</option>
                      <option>Statutory Audit</option>
                      <option>NGO Audit</option>
                      <option>Government Audit</option>
                      <option>Internal Audit</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-outline-primary" onClick={(e) => handleSubmit(e as any, 'save')}>
                    Save Draft
                  </button>
                  <button type="submit" className="btn btn-success">
                    Submit for Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}