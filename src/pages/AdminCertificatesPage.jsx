import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Ban, RefreshCw, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useApp } from '../context/AppContext';
import './AdminPages.css';

export default function AdminCertificatesPage() {
  const {
    certificates,
    isAdmin,
    revokeCertificate,
    fetchCertificates,
    loading: globalLoading,
  } = useApp();

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [revokeModalCert, setRevokeModalCert] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    if (isAdmin) {
      fetchCertificates();
    }
  }, [isAdmin, fetchCertificates]);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleConfirmRevoke = async () => {
    if (!revokeModalCert) return;
    const certId = revokeModalCert.certificateId || revokeModalCert.id;
    setActionLoadingId(certId);
    try {
      await revokeCertificate(certId);
      showToast(`Certificate ${certId} has been successfully revoked.`, 'info');
      setRevokeModalCert(null);
    } catch (err) {
      showToast(err.message || 'Failed to revoke certificate', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

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
      subtitle="Registry of all issued certificates. Revoke invalid or compromised credentials."
    >
      <div className="admin-page">
        {toastMessage && (
          <div style={{
            padding: '12px 18px',
            marginBottom: '16px',
            borderRadius: '8px',
            background: toastType === 'success' ? 'rgba(52, 211, 153, 0.15)' : toastType === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            border: `1px solid ${toastType === 'success' ? 'rgba(52, 211, 153, 0.3)' : toastType === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
            color: toastType === 'success' ? '#34d399' : toastType === 'error' ? '#f87171' : '#60a5fa',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            {toastType === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toastMessage}
          </div>
        )}

        <div className="glass-card admin-table-card">
          <div className="admin-table-header">
            <span className="admin-table-title">Live Certificate Registry</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="admin-table-count">{certificates.length} total</span>
              <button
                className="btn btn-sm btn-secondary"
                onClick={fetchCertificates}
                disabled={globalLoading}
                title="Refresh from Database"
              >
                <RefreshCw size={14} className={globalLoading ? 'spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {certificates.length === 0 ? (
            <div className="admin-empty">
              {globalLoading ? 'Loading certificates from database...' : 'No certificates issued yet in the database.'}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cert ID</th>
                  <th>Recipient</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Issued On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => {
                  const certId = cert.certificateId || cert.id;
                  const isRowLoading = actionLoadingId === certId;

                  return (
                    <tr key={certId}>
                      <td style={{ fontFamily: "'Courier New', monospace", fontWeight: 600, color: 'var(--color-accent)' }}>
                        {certId}
                      </td>
                      <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        {cert.name}
                      </td>
                      <td>{cert.phone}</td>
                      <td>
                        {cert.city && cert.state ? `${cert.city}, ${cert.state}` : (cert.city || cert.state || '—')}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {cert.issuedOn}
                      </td>
                      <td>
                        <span className={`badge badge-${cert.status.toLowerCase()}`}>
                          {cert.status}
                        </span>
                      </td>
                      <td>
                        {cert.status === 'Valid' ? (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => setRevokeModalCert(cert)}
                            disabled={isRowLoading}
                            title="Revoke this certificate"
                          >
                            {isRowLoading ? <Loader2 size={14} className="spin" /> : <Ban size={14} />}
                            Revoke
                          </button>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                            Revoked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Revoke Confirmation Modal */}
      {revokeModalCert && (
        <div className="modal-overlay" onClick={() => setRevokeModalCert(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Ban size={32} />
            </div>
            <h2 className="success-title" style={{ color: '#f87171' }}>
              Revoke Certificate {revokeModalCert.certificateId || revokeModalCert.id}
            </h2>
            <p className="success-message">
              Are you sure you want to revoke this certificate for <strong>{revokeModalCert.name}</strong>?
              <br /><br />
              <small style={{ color: 'var(--color-text-muted)' }}>
                This will mark the certificate as invalid in the registry. The original citizen application will remain intact.
              </small>
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setRevokeModalCert(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmRevoke}
                disabled={actionLoadingId === (revokeModalCert.certificateId || revokeModalCert.id)}
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
