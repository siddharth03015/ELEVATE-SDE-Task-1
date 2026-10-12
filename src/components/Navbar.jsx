import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Shield, FileText, Search, CheckCircle, LogIn, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const { isAdmin, adminLogout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/');
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMobile}>
          <div className="navbar-brand-icon">
            <Shield size={20} />
          </div>
          <span className="navbar-brand-text">CredVault</span>
        </Link>

        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`navbar-links${mobileOpen ? ' open' : ''}`}>
          <NavLink to="/request" className="navbar-link" onClick={closeMobile}>
            <FileText size={16} />
            Request
          </NavLink>
          <NavLink to="/track" className="navbar-link" onClick={closeMobile}>
            <Search size={16} />
            Track
          </NavLink>
          <NavLink to="/verify" className="navbar-link" onClick={closeMobile}>
            <CheckCircle size={16} />
            Verify
          </NavLink>

          {isAdmin ? (
            <>
              <NavLink to="/admin/applications" className="navbar-link" onClick={closeMobile}>
                <LayoutDashboard size={16} />
                Applications
              </NavLink>
              <NavLink to="/admin/certificates" className="navbar-link" onClick={closeMobile}>
                <Shield size={16} />
                Certificates
              </NavLink>
              <span className="navbar-admin-badge">
                <Shield size={12} />
                Admin
              </span>
              <button className="btn btn-sm btn-outline" onClick={handleLogout}>
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/admin/login" className="navbar-link" onClick={closeMobile}>
              <LogIn size={16} />
              Admin
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
