import { Link } from 'react-router-dom';
import { Shield, Ban } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useApp } from '../context/AppContext';
import './AdminPages.css';

export default function AdminCertificatesPage() {
  const { certificates, isAdmin, revokeCertificate } = useApp();

  if (!isAdmin) {
    return (
      <PageWrapper
        icon={<Shield size={28} />}
        title="Certificates"
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
      icon={<Shield size={28} />}
      title="Certificates"
      subtitle="Manage all issued certificates. Revoke if necessary."
    >
      <div className="admin-page">
        <div className="glass-card admin-table-card">
          <div className="admin-table-header">
            <span className="admin-table-title">Issued Certificates</span>
            <span className="admin-table-count">{certificates.length} total</span>
          </div>

          {certificates.length === 0 ? (
            <div className="admin-empty">No certificates issued yet.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cert ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Issued On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => (
                  <tr key={cert.id}>
                    <td style={{ fontFamily: "'Courier New', monospace", fontWeight: 600, color: 'var(--color-accent)' }}>
                      {cert.id}
                    </td>
                    <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                      {cert.name}
                    </td>
                    <td>{cert.phone}</td>
                    <td>{cert.city}</td>
                    <td>{cert.state}</td>
                    <td>{cert.issuedOn}</td>
                    <td>
                      <span className={`badge badge-${cert.status.toLowerCase()}`}>
                        {cert.status}
                      </span>
                    </td>
                    <td>
                      {cert.status === 'Valid' ? (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => revokeCertificate(cert.id)}
                          title="Revoke this certificate"
                        >
                          <Ban size={14} />
                          Revoke
                        </button>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                          Revoked
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
