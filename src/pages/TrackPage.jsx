import { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useApp } from '../context/AppContext';
import './TrackPage.css';

export default function TrackPage() {
  const { trackApplication } = useApp();
  const [appId, setAppId] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!appId.trim()) return;
    const found = trackApplication(appId.trim());
    setResult(found || null);
    setSearched(true);
  };

  return (
    <PageWrapper
      icon={<Search size={28} />}
      title="Track Application"
      subtitle="Enter your Application ID to check the current status of your certificate request."
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
          <button type="submit" className="btn btn-primary">
            <Search size={16} />
            Track
          </button>
        </form>

        {searched && result && (
          <div className="search-result">
            <div className="glass-card result-card">
              <div className="result-card-header">
                <span className="result-card-id">{result.id}</span>
                <span className={`badge badge-${result.status.toLowerCase()}`}>
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
              </div>
            </div>
          </div>
        )}

        {searched && !result && (
          <div className="search-error glass-card">
            <div className="search-error-icon">
              <AlertCircle size={24} />
            </div>
            <h3 className="search-error-title">Application Not Found</h3>
            <p className="search-error-message">
              No application matches the ID &ldquo;{appId}&rdquo;. Please check and try again.
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
