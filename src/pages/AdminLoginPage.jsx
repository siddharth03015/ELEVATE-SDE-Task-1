import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, Lock, Loader2 } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useApp } from '../context/AppContext';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const { adminLogin, isAdmin } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/applications', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const success = await adminLogin(username.trim(), password);
      if (success) {
        navigate('/admin/applications');
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      icon={<Lock size={28} />}
      title="Admin Login"
      subtitle="Sign in to manage applications and certificates."
    >
      <div className="glass-card admin-login-card">
        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="admin-login-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg admin-login-submit"
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <LogIn size={18} />}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="admin-login-hint">
          Demo credentials — Username: <strong>admin</strong> &nbsp;|&nbsp; Password: <strong>admin</strong>
        </p>
      </div>
    </PageWrapper>
  );
}
