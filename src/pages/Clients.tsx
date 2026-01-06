import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Client {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  notes: string;
  engagements: any[];
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    industry: '',
    notes: '',
  });

  const loadClients = async () => {
    try {
      //const res = await axios.get(`${import.meta.env.VITE_API_URL}/clients`);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/clients`);
      setClients(res.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/clients`, formData);
      setShowForm(false);
      loadClients();
      setFormData({ name: '', contactPerson: '', email: '', phone: '', industry: '', notes: '' });
    } catch (err) {
      alert('Error creating client');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Clients</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New Client
        </button>
      </div>

      {loading ? (
        <p>Loading clients...</p>
      ) : (
        <div className="row">
          {clients.map(client => (
            <div key={client.id} className="col-md-4 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{client.name}</h5>
                  <p className="card-text">
                    <strong>Contact:</strong> {client.contactPerson || 'N/A'}<br />
                    <strong>Email:</strong> {client.email || 'N/A'}<br />
                    <strong>Phone:</strong> {client.phone || 'N/A'}<br />
                    <strong>Industry:</strong> {client.industry || 'N/A'}
                  </p>
                  <p><strong>Engagements:</strong> {client.engagements?.length || 0}</p>
                </div>
                <div className="card-footer">
                  <Link to={`/engagements?client=${client.id}`} className="btn btn-sm btn-outline-primary">
                    View Engagements
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Client Modal */}
      {showForm && (
        <div className="modal d-block bg-dark bg-opacity-50" onClick={() => setShowForm(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5>New Client</h5>
                <button className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Client Name</label>
                    <input type="text" className="form-control" required value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contact Person</label>
                    <input type="text" className="form-control" value={formData.contactPerson}
                      onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input type="text" className="form-control" value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Industry</label>
                    <input type="text" className="form-control" value={formData.industry}
                      onChange={e => setFormData({...formData, industry: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Client
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