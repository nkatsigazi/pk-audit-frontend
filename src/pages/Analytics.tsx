import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 1. Define the interface for your analytics data
interface AnalyticsData {
  ratios?: Record<string, number>; // e.g., { "Current Ratio": 1.5, "Debt-to-Equity": 0.8 }
  benford?: string | number;       // e.g., "95%" or 0.95
}

export default function Analytics() {
  // 2. Pass the interface to useState
  const [data, setData] = useState<AnalyticsData>({});

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/analytics`)
      .then(res => setData(res.data))
      .catch(err => console.error("Failed to fetch analytics:", err));
  }, []);

  // 3. Recharts BarChart expects an array of objects, not an array of arrays.
  // We transform Object.entries into { name: key, value: val }
  const chartData = Object.entries(data.ratios || {}).map(([key, val]) => ({
    name: key,
    value: val,
  }));

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4">
        <h3 className="mb-4">Financial Analytics</h3>
        
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0d6efd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-3 bg-light rounded border">
          <h5>Audit Insights</h5>
          {/* Now TS knows 'benford' exists on 'data' */}
          <p className="mb-0">
            <strong>Benford's Law Compliance:</strong>{' '}
            <span className="badge bg-success">{data.benford || 'Calculating...'}</span>
          </p>
          <small className="text-muted">
            This indicates the mathematical probability that the transaction amounts are naturally occurring.
          </small>
        </div>
      </div>
    </div>
  );
}