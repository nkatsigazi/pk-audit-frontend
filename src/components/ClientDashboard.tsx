import { useState, useEffect } from 'react'; // Fixed TS6133 by removing React
import axios from 'axios';

// 1. Define interfaces for your data structures
interface Expense {
  description: string;
  amount: number;
}

interface TimeLog {
  hours: number;
  date: string;
}

const Dashboard = () => {
  // 2. Explicitly type the state arrays to resolve 'never' errors
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);

  useEffect(() => {
    // It's good practice to handle potential errors in useEffect
    const fetchData = async () => {
      try {
        const [expensesRes, logsRes] = await Promise.all([
          axios.get('https://pk-audit-frontend.onrender.com/time-tracking/expenses'),
          axios.get('https://pk-audit-frontend.onrender.com/time-tracking/logs')
        ]);
        setExpenses(expensesRes.data);
        setTimeLogs(logsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Client Dashboard</h3>
      
      <div className="row">
        {/* Expenses Section */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0 h5">Expenses</h4>
            </div>
            <div className="card-body">
              {expenses.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {expenses.map((expense, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between">
                      <span>{expense.description}</span>
                      <strong>${expense.amount.toFixed(2)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No expenses recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Time Logs Section */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0 h5">Time Logs</h4>
            </div>
            <div className="card-body">
              {timeLogs.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {timeLogs.map((log, index) => (
                    <li key={index} className="list-group-item">
                      <span className="badge bg-light text-dark me-2">{log.date}</span>
                      <strong>{log.hours} hours</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No time logs recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;