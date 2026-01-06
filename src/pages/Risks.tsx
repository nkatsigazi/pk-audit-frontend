import { useEffect, useState } from 'react';
import axios from 'axios';

// 1. Define the Risk interface
interface Risk {
  id?: number; // Optional because new risks don't have an ID yet
  description: string;
  severity: 'Low' | 'Medium' | 'High'; // String literal types for better safety
  mitigation: string;
}

export default function Risks() {
  // 2. Apply the interface to the array state
  const [risks, setRisks] = useState<Risk[]>([]);
  
  // 3. Apply the interface to the form object state
  const [newRisk, setNewRisk] = useState<Risk>({ 
    description: '', 
    severity: 'Low', 
    mitigation: '' 
  });

  useEffect(() => {
    // 4. Tell Axios what kind of data to expect
    axios.get<Risk[]>('http://localhost:3000/risks')
      .then(res => setRisks(res.data))
      .catch(err => console.error(err));
  }, []);

  const addRisk = async () => {
    try {
      const res = await axios.post<Risk>('http://localhost:3000/risks', newRisk);
      setRisks([...risks, res.data]);
      setNewRisk({ description: '', severity: 'Low', mitigation: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Risks</h3>
      <div className="mb-3">
        <input 
          type="text" 
          className="form-control mb-2" 
          placeholder="Description" 
          value={newRisk.description} 
          onChange={e => setNewRisk({...newRisk, description: e.target.value})} 
        />
        <select 
          className="form-select mb-2" 
          value={newRisk.severity} 
          // TypeScript will now check that value is one of 'Low', 'Medium', or 'High'
          onChange={e => setNewRisk({...newRisk, severity: e.target.value as Risk['severity']})}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input 
          type="text" 
          className="form-control mb-2" 
          placeholder="Mitigation" 
          value={newRisk.mitigation} 
          onChange={e => setNewRisk({...newRisk, mitigation: e.target.value})} 
        />
        <button className="btn btn-primary" onClick={addRisk}>Add Risk</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Severity</th>
            <th>Mitigation</th>
          </tr>
        </thead>
        <tbody>
          {risks.map((risk, index) => (
            // Use risk.id if available, fallback to index for safety
            <tr key={risk.id || index}>
              <td>{risk.description}</td>
              <td>{risk.severity}</td>
              <td>{risk.mitigation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}