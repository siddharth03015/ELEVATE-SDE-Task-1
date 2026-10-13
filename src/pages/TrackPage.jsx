import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, AlertCircle, Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useApp } from '../context/AppContext';
import './TrackPage.css';

export default function TrackPage() {
  const { trackApplication } = useApp();
  const [searchParams] = useSearchParams();

  const [appId, setAppId] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill from query parameter if present
  useEffect(() => {
    const idFromQuery = searchParams.get('id');
    if (idFromQuery) {
      setAppId(idFromQuery);
      performTrack(idFromQuery);
    }
  }, [searchParams]);

  const performTrack = async (idToSearch) => {
    const cleanId = idToSearch.trim();
    if (!cleanId) return;
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const found = await trackApplication(cleanId);
      setResult(found || null);
    } catch (err) {
      setError(err.message || 'Error tracking application');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    performTrack(appId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle2 size={16} />;
      case 'Rejected':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <PageWrapper
      icon={<Search size={28} />}
      title="Track Application"
      subtitle="Enter your Application ID to check live status from the database."
    >
      <div className="search-section">
        <form className="search-box" onSubmit={handleTrack}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. APP-0001"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {loading && (
          <div className="glass-card" style={{ padding: '30px', textAlign: 'center', marginTop: '20px' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 10px', color: 'var(--color-accent)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>Querying database for {appId}...</p>
          </div>
        )}

        {!loading && searched && result && (
          <div className="search-result">
            <div className="glass-card result-card">
              <div className="result-card-header">
                <span className="result-card-id">{result.applicationId || result.id}</span>
                <span className={`badge badge-${result.status.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  {getStatusIcon(result.status)}
                  {result.status}
                </span>
              </div>

              <div className="result-card-grid">
                <div className="result-field">
                  <span className="result-field-label">Name</span>
                  <span className="result-field-value">{result.name}</span>
                </div>
                <div className="result-field">
                  <span className="result-field-label">Phone</span>
                  <span className="result-field-value">{result.phone}</span>
                </div>
                <div className="result-field">
                  <span className="result-field-label">Location</span>
                  <span className="result-field-value">{result.city}, {result.state}</span>
                </div>
                <div className="result-field">
                  <span className="result-field-label">Submitted On</span>
                  <span className="result-field-value">{result.submittedAt}</span>
                </div>
                {result.gender && (
                  <div className="result-field">
                    <span className="result-field-label">Gender</span>
                    <span className="result-field-value">{result.gender}</span>
                  </div>
                )}
                {result.rejectReason && (
                  <div className="result-field" style={{ gridColumn: '1 / -1' }}>
                    <span className="result-field-label">Rejection Reason</span>
                    <span className="result-field-value" style={{ color: '#f87171' }}>{result.rejectReason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && searched && !result && (
          <div className="search-error glass-card">
            <div className="search-error-icon">
              <AlertCircle size={24} />
            </div>
            <h3 className="search-error-title">Application Not Found</h3>
            <p className="search-error-message">
              {error || `No application matching ID "${appId}" was found in the database. Please verify and try again.`}
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
