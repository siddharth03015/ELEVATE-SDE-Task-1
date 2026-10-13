import { Link } from 'react-router-dom';
import { FileText, Search, CheckCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './HomePage.css';

export default function HomePage() {
  const { stats } = useApp();

  return (
    <main className="page-wrapper">
      <div className="container">
        <section className="home-hero">
          <div className="home-hero-badge">
            <Sparkles size={14} />
            Digital Certificate Platform
          </div>
          <h1 className="home-title">
            <span className="home-title-gradient">CredVault</span>
          </h1>
          <p className="home-tagline">
            Certificate Issuing &amp; Verification Platform. Request, track,
            and verify digital certificates with ease and transparency.
          </p>

          <div className="home-cards stagger-children">
            <Link to="/request" className="glass-card home-card">
              <div className="home-card-icon blue">
                <FileText size={24} />
              </div>
              <h3 className="home-card-title">Request Certificate</h3>
              <p className="home-card-desc">
                Submit a new certificate application with your personal details.
              </p>
            </Link>

            <Link to="/track" className="glass-card home-card">
              <div className="home-card-icon purple">
                <Search size={24} />
              </div>
              <h3 className="home-card-title">Track Application</h3>
              <p className="home-card-desc">
                Monitor your application status using your unique Application ID.
              </p>
            </Link>

            <Link to="/verify" className="glass-card home-card">
              <div className="home-card-icon teal">
                <CheckCircle size={24} />
              </div>
              <h3 className="home-card-title">Verify Certificate</h3>
              <p className="home-card-desc">
                Validate the authenticity of any issued certificate instantly.
              </p>
            </Link>
          </div>

          <div className="home-stats stagger-children">
            <div className="home-stat">
              <div className="home-stat-value">{stats.applications}</div>
              <div className="home-stat-label">Applications</div>
            </div>
            <div className="home-stat">
              <div className="home-stat-value">{stats.certificates}</div>
              <div className="home-stat-label">Certificates</div>
            </div>
            <div className="home-stat">
              <div className="home-stat-value">{stats.verified}</div>
              <div className="home-stat-label">Verified</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
