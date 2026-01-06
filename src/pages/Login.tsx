import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Define the User structure for type safety
interface User {
  name: string;
  email: string;
  password?: string;
  role: string;
}

// 2. Define credentials. Using 'DEMO_USERS' and actually calling it below
const DEMO_USERS: User[] = [
  { name: 'Junior Auditor', email: 'junior@priceandking.com', password: 'junior', role: 'Junior' },
  { name: 'Audit Manager', email: 'manager@priceandking.com', password: 'manager', role: 'Manager' },
  { name: 'Engagement Partner', email: 'partner@priceandking.com', password: 'partner', role: 'Partner' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Using DEMO_USERS here satisfies the compiler
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);

    if (user) {
      const { password, ...userToStore } = user;
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      navigate('/');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ width: '400px' }}>
        <div className="card-body p-5">
          <h3 className="text-center mb-4">Price & King Audit</h3>
          <p className="text-center text-muted mb-4">Sign in to continue</p>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
              />
            </div>
            
            <button type="submit" className="btn btn-primary w-100">
              Sign In
            </button>
          </form>

          <div className="mt-4 small text-muted">
            <p className="mb-1"><strong>Demo credentials:</strong></p>
            <ul className="ps-3">
              <li>junior@priceandking.com / junior</li>
              <li>manager@priceandking.com / manager</li>
              <li>partner@priceandking.com / partner</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}