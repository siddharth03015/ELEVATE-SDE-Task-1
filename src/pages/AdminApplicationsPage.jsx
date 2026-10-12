import { Link } from 'react-router-dom';
import { LayoutDashboard, CheckCircle, XCircle } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useApp } from '../context/AppContext';
import './AdminPages.css';

export default function AdminApplicationsPage() {
  const { applications, isAdmin, approveApplication, rejectApplication } = useApp();

  if (!isAdmin) {
    return (
      <PageWrapper
        icon={<LayoutDashboard size={28} />}
        title="Applications"
        subtitle="Admin access required."
      >
        <div className="admin-not-auth">
          <p>Please log in as admin to access this page.</p>
          <Link to="/admin/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      icon={<LayoutDashboard size={28} />}
      title="Applications"
      subtitle="Review, approve, or reject certificate applications."
    >
      <div className="admin-page">
        <div className="glass-card admin-table-card">
          <div className="admin-table-header">
            <span className="admin-table-title">All Applications</span>
            <span className="admin-table-count">{applications.length} total</span>
          </div>

          {applications.length === 0 ? (
            <div className="admin-empty">No applications yet.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td style={{ fontFamily: "'Courier New', monospace", fontWeight: 600, color: 'var(--color-accent)' }}>
                      {app.id}
                    </td>
                    <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                      {app.name}
                    </td>
                    <td>{app.phone}</td>
                    <td>{app.gender}</td>
                    <td>{app.city}</td>
                    <td>{app.state}</td>
                    <td>
                      <span className={`badge badge-${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      {app.status === 'Pending' ? (
                        <div className="actions">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => approveApplication(app.id)}
                            title="Approve & issue certificate"
                          >
                            <CheckCircle size={14} />
                            Issue
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => rejectApplication(app.id)}
                            title="Reject application"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
