import { useEffect, useState } from 'react';
import axios from 'axios';

// 1. Define the structure of your data
interface Checklist {
  id: number;
  name: string;
  items: any[]; // Replace 'any' with a specific type if items have a structure
}

export default function Compliance() {
  // 2. Tell useState to expect an array of Checklists
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/compliance')
      .then(res => {
        // Axios data is 'any' by default, so we cast it or let TS infer from setChecklists
        setChecklists(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  const addChecklist = async () => {
    if (!newItem.trim()) return; // Prevent adding empty names

    try {
      const res = await axios.post('http://localhost:3000/compliance', { 
        name: newItem, 
        items: [] 
      });
      
      // 3. Now TS knows res.data matches the Checklist interface
      setChecklists([...checklists, res.data]);
      setNewItem('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Compliance Checklists</h3>
      <div className="input-group mb-3">
        <input 
          type="text" 
          className="form-control" 
          placeholder="New checklist name" 
          value={newItem} 
          onChange={e => setNewItem(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && addChecklist()}
        />
        <button className="btn btn-primary" onClick={addChecklist}>Add</button>
      </div>

      <div className="accordion">
        {checklists.map((cl, index) => (
          // 4. TS now recognizes 'cl.id', 'cl.name', and 'cl.items'
          <div className="accordion-item" key={cl.id}>
            <h2 className="accordion-header">
              <button 
                className="accordion-button collapsed" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target={`#collapse${index}`}
              >
                {cl.name}
              </button>
            </h2>
            <div id={`collapse${index}`} className="accordion-collapse collapse">
              <div className="accordion-body">
                <p className="text-muted">
                  Total Items: {cl.items.length}
                </p>
                {/* Future: Map through cl.items here */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}