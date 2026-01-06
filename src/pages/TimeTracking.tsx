import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TimeTracking() {
  const [hours, setHours] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [engagementId, setEngagementId] = useState('');

  useEffect(() => {
    let interval: number | undefined;

    if (isActive) {
      interval = window.setInterval(() => {
        setHours(prev => prev + 1 / 3600);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    // Cleanup: This runs when the component unmounts
    return () => clearInterval(interval);
  }, [isActive]);

  const startTimer = () => setIsActive(true);
  const stopTimer = () => setIsActive(false);

  const logTime = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/engagements/${engagementId}/time-tracking`, { 
        hours: parseFloat(hours.toFixed(4)) 
      });
      setHours(0);
      setIsActive(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-3">
      <h3>Time Tracking</h3>
      <input 
        type="text" 
        placeholder="Engagement ID" 
        value={engagementId} 
        onChange={e => setEngagementId(e.target.value)} 
        className="form-control mb-2" 
      />
      <button className="btn btn-success me-2" onClick={startTimer} disabled={isActive}>Start</button>
      <button className="btn btn-danger me-2" onClick={stopTimer} disabled={!isActive}>Stop</button>
      <span className="fw-bold">{hours.toFixed(4)} hours</span>
      <button className="btn btn-primary ms-2" onClick={logTime}>Log Time</button>
    </div>
  );
}