import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, CheckCircle, XCircle, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useApp } from '../context/AppContext';
import './AdminPages.css';

export default function AdminApplicationsPage() {
  const {
    applications,
    isAdmin,
    approveApplication,
    rejectApplication,
    fetchApplications,
    loading: globalLoading,
  } = useApp();

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectModalApp, setRejectModalApp] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
    }
  }, [isAdmin, fetchApplications]);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleApprove = async (app) => {
    const appId = app.applicationId || app.id;
    setActionLoadingId(appId);
    try {
      const res = await approveApplication(appId);
      const certId = res.certificateId ? ` (${res.certificateId})` : '';
      showToast(`Application ${appId} approved! Certificate generated${certId}.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to approve application', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (app) => {
    setRejectModalApp(app);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalApp) return;
    const appId = rejectModalApp.applicationId || rejectModalApp.id;
    setActionLoadingId(appId);
    try {
      await rejectApplication(appId, rejectReason);
      showToast(`Application ${appId} has been rejected.`, 'info');
      setRejectModalApp(null);
    } catch (err) {
      showToast(err.message || 'Failed to reject application', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

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
      subtitle="Review incoming applications, issue certificates, or reject invalid requests."
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
            <span className="admin-table-title">Live Database Applications</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="admin-table-count">{applications.length} total</span>
              <button
                className="btn btn-sm btn-secondary"
                onClick={fetchApplications}
                disabled={globalLoading}
                title="Refresh from Database"
              >
                <RefreshCw size={14} className={globalLoading ? 'spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="admin-empty">
              {globalLoading ? 'Loading applications from database...' : 'No applications found in the database.'}
            </div>
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
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const appId = app.applicationId || app.id;
                  const isRowLoading = actionLoadingId === appId;

                  return (
                    <tr key={appId}>
                      <td style={{ fontFamily: "'Courier New', monospace", fontWeight: 600, color: 'var(--color-accent)' }}>
                        {appId}
                      </td>
                      <td style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        {app.name}
                      </td>
                      <td>{app.phone}</td>
                      <td>{app.gender}</td>
                      <td>{app.city}</td>
                      <td>{app.state}</td>
                      <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {app.submittedAt}
                      </td>
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
                              onClick={() => handleApprove(app)}
                              disabled={isRowLoading}
                              title="Approve & issue certificate"
                            >
                              {isRowLoading ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                              Issue
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => openRejectModal(app)}
                              disabled={isRowLoading}
                              title="Reject application"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                            {app.status === 'Approved' ? 'Issued' : 'Rejected'}
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

      {/* Reject Modal */}
      {rejectModalApp && (
        <div className="modal-overlay" onClick={() => setRejectModalApp(null)}>
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
              <XCircle size={32} />
            </div>
            <h2 className="success-title" style={{ color: '#f87171' }}>
              Reject Application {rejectModalApp.applicationId || rejectModalApp.id}
            </h2>
            <p className="success-message">
              Are you sure you want to reject the application for <strong>{rejectModalApp.name}</strong>?
            </p>
            <div style={{ textAlign: 'left', margin: '16px 0' }}>
              <label className="form-label" htmlFor="reject-reason">Rejection Reason (Optional):</label>
              <input
                id="reject-reason"
                type="text"
                className="form-input"
                placeholder="e.g. Incomplete proof of residence"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setRejectModalApp(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmReject}
                disabled={actionLoadingId === (rejectModalApp.applicationId || rejectModalApp.id)}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
