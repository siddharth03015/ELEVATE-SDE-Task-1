import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Loader2, CheckCircle, Ban } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useApp } from '../context/AppContext';
import './TrackPage.css';

export default function VerifyPage() {
  const { verifyCertificate } = useApp();
  const [searchParams] = useSearchParams();

  const [certId, setCertId] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill from query parameters if present
  useEffect(() => {
    const idFromQuery = searchParams.get('id');
    if (idFromQuery) {
      setCertId(idFromQuery);
      performVerify(idFromQuery);
    }
  }, [searchParams]);

  const performVerify = async (idToSearch) => {
    const cleanId = idToSearch.trim();
    if (!cleanId) return;
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const found = await verifyCertificate(cleanId);
      setResult(found || null);
    } catch (err) {
      setError(err.message || 'Error verifying certificate');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    performVerify(certId);
  };

  return (
    <PageWrapper
      icon={<ShieldCheck size={28} />}
      title="Verify Certificate"
      subtitle="Enter a Certificate ID to check authenticity against the government registry."
    >
      <div className="search-section">
        <form className="search-box" onSubmit={handleVerify}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. CERT-0001"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} />}
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        {loading && (
          <div className="glass-card" style={{ padding: '30px', textAlign: 'center', marginTop: '20px' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 10px', color: 'var(--color-accent)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>Verifying {certId} with the database...</p>
          </div>
        )}

        {!loading && searched && result && (
          <div className="search-result">
            <div className="glass-card result-card" style={{
              borderColor: result.status === 'Valid' ? 'rgba(52, 211, 153, 0.4)' : 'rgba(239, 68, 68, 0.4)'
            }}>
              <div className="result-card-header">
                <span className="result-card-id">{result.certificateId || result.id}</span>
                <span className={`badge badge-${result.status.toLowerCase()}`} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: result.status === 'Valid' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: result.status === 'Valid' ? '#34d399' : '#f87171',
                  border: `1px solid ${result.status === 'Valid' ? 'rgba(52, 211, 153, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  fontSize: '13px',
                  padding: '4px 10px',
                }}>
                  {result.status === 'Valid' ? <CheckCircle size={14} /> : <Ban size={14} />}
                  {result.status}
                </span>
              </div>

              <div className="result-card-grid">
                <div className="result-field">
                  <span className="result-field-label">Recipient Name</span>
                  <span className="result-field-value">{result.name}</span>
                </div>
                <div className="result-field">
                  <span className="result-field-label">Phone</span>
                  <span className="result-field-value">{result.phone}</span>
                </div>
                <div className="result-field">
                  <span className="result-field-label">Location</span>
                  <span className="result-field-value">
                    {result.city && result.state ? `${result.city}, ${result.state}` : (result.city || result.state || 'Verified Registry')}
                  </span>
                </div>
                <div className="result-field">
                  <span className="result-field-label">Issued On</span>
                  <span className="result-field-value">{result.issuedOn}</span>
                </div>
                {result.applicationId && (
                  <div className="result-field">
                    <span className="result-field-label">Associated Application</span>
                    <span className="result-field-value">{result.applicationId}</span>
                  </div>
                )}
                <div className="result-field">
                  <span className="result-field-label">Registry Status</span>
                  <span className="result-field-value" style={{ color: result.status === 'Valid' ? '#34d399' : '#f87171' }}>
                    {result.status === 'Valid' ? 'Authentic & Valid' : 'Revoked by Issuing Authority'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && searched && !result && (
          <div className="search-error glass-card">
            <div className="search-error-icon">
              <AlertCircle size={24} />
            </div>
            <h3 className="search-error-title">Certificate Not Found</h3>
            <p className="search-error-message">
              {error || `No certificate record matching "${certId}" was found in the database. Please verify the ID.`}
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
