import { useState, useEffect, type ChangeEvent } from 'react'; // Removed unused React, added type import
import axios from 'axios';

// 1. Define interfaces to clear the 'never' type errors
interface Client {
  id: string | number;
  name: string;
}

interface Engagement {
  id: string | number;
  type: string;
  status: string;
}

const EngagementManagement = () => {
  // 2. Assign the interfaces to state hooks
  const [clients, setClients] = useState<Client[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | number | null>(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/clients`)
      .then((res) => setClients(res.data))
      .catch(err => console.error("Error fetching clients:", err));
  }, []);

  // 3. Explicitly type the event as ChangeEvent<HTMLSelectElement>
  const handleClientChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    if (!clientId) {
      setSelectedClient(null);
      setEngagements([]);
      return;
    }
    
    setSelectedClient(clientId);
    axios.get(`https://pk-audit-frontend.onrender.com/engagements?client=${clientId}`)
      .then((res) => setEngagements(res.data))
      .catch(err => console.error("Error fetching engagements:", err));
  };

  return (
    <div className="p-3">
      <label className="form-label">Client Selection</label>
      <select className="form-select mb-4" onChange={handleClientChange} value={selectedClient || ""}>
        <option value="">Select Client</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      {selectedClient && (
        <div className="card shadow-sm p-3">
          <h4 className="border-bottom pb-2">Engagements</h4>
          {engagements.length > 0 ? (
            <ul className="list-group list-group-flush">
              {engagements.map((engagement) => (
                <li key={engagement.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{engagement.type}</span>
                  <span className={`badge ${engagement.status === 'Completed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {engagement.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mt-2">No active engagements found for this client.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EngagementManagement;