import { useState } from 'react';
import { CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useApp } from '../context/AppContext';
import './TrackPage.css'; /* Reuses same search/result styles */

export default function VerifyPage() {
  const { verifyCertificate } = useApp();
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!certId.trim()) return;
    const found = verifyCertificate(certId.trim());
    setResult(found || null);
    setSearched(true);
  };

  return (
    <PageWrapper
      icon={<ShieldCheck size={28} />}
      title="Verify Certificate"
      subtitle="Enter a Certificate ID to check its authenticity and current status."
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
          <button type="submit" className="btn btn-primary">
            <CheckCircle size={16} />
            Verify
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
                  <span className="result-field-label">Issued On</span>
                  <span className="result-field-value">{result.issuedOn}</span>
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
            <h3 className="search-error-title">Certificate Not Found</h3>
            <p className="search-error-message">
              No certificate matches the ID &ldquo;{certId}&rdquo;. Please check and try again.
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
