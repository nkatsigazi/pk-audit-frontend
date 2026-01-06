import { useState } from 'react';
import axios from 'axios';

// Define types for our data to avoid 'any' errors
interface ClientFile {
  name: string;
  url: string;
}

interface ClientMessage {
  id: number;
  text: string;
  sender: string;
}

export default function ClientPortal() {
  // 1. Fixed TS6133: Added types and we will render these below
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [currentMsg, setCurrentMsg] = useState('');

  // 2. Fixed TS7006: Explicitly typed 'file' as File
  const uploadDocument = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/client-portal/upload', formData);
      // Update state so 'setFiles' is used
      setFiles((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  // 2. Fixed TS7006: Explicitly typed 'msg' as string
  const sendMessage = async () => {
    if (!currentMsg.trim()) return;
    try {
      const res = await axios.post('/client-portal/messages', { msg: currentMsg });
      // Update state so 'setMessages' is used
      setMessages((prev) => [...prev, res.data]);
      setCurrentMsg('');
    } catch (err) {
      console.error("Message failed", err);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Client Portal</h3>
      
      <div className="mb-4 p-3 border rounded">
        <h5>Upload Document</h5>
        {/* 3. Fixed TS18047: Added a check to ensure e.target.files is not null */}
        <input 
          type="file" 
          className="form-control"
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) {
              uploadDocument(e.target.files[0]);
            }
          }} 
        />
      </div>

      <div className="mb-4 p-3 border rounded">
        <h5>Send a Message</h5>
        <textarea 
          className="form-control mb-2"
          placeholder="Type your message..." 
          value={currentMsg}
          onChange={e => setCurrentMsg(e.target.value)} 
        />
        <button className="btn btn-primary" onClick={sendMessage}>Send Message</button>
      </div>

      <div className="row">
        <div className="col-md-6">
          <h5>Your Files ({files.length})</h5>
          <ul className="list-group">
            {files.map((f, i) => (
              <li key={i} className="list-group-item">{f.name}</li>
            ))}
            {files.length === 0 && <p className="text-muted small">No files uploaded yet.</p>}
          </ul>
        </div>
        
        <div className="col-md-6">
          <h5>Messages ({messages.length})</h5>
          <div className="border p-2 bg-light" style={{ height: '200px', overflowY: 'auto' }}>
            {messages.map((m) => (
              <div key={m.id} className="mb-2 p-2 bg-white rounded shadow-sm">
                <strong>{m.sender}:</strong> {m.text}
              </div>
            ))}
            {messages.length === 0 && <p className="text-muted small">No messages yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}