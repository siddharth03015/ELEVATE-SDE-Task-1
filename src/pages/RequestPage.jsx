import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, Send, AlertCircle, Loader2 } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { useApp, INDIAN_STATES } from '../context/AppContext';
import './RequestPage.css';

export default function RequestPage() {
  const { submitApplication } = useApp();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    gender: '',
    city: '',
    state: '',
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone.trim()))
      errs.phone = 'Enter a valid 10-digit phone number';
    if (!form.gender) errs.gender = 'Gender is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state) errs.state = 'State is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      setSubmitting(true);
      const newApp = await submitApplication(form);
      setSubmitted(newApp);
    } catch (err) {
      setServerError(err.message || 'Failed to submit application. Please check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setSubmitted(null);
    setForm({ name: '', phone: '', gender: '', city: '', state: '' });
    setErrors({});
  };

  return (
    <PageWrapper
      icon={<FileText size={28} />}
      title="Request Certificate"
      subtitle="Fill out the form below to submit a new certificate application."
    >
      <div className="glass-card request-form-card">
        {serverError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '14px',
          }}>
            <AlertCircle size={18} />
            {serverError}
          </div>
        )}

        <form className="request-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className={`form-input${errors.name ? ' error' : ''}`}
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="request-form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={`form-input${errors.phone ? ' error' : ''}`}
                placeholder="10-digit number"
                value={form.phone}
                onChange={handleChange}
                maxLength={10}
              />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <div className="radio-group">
                {['Male', 'Female', 'Other'].map((g) => (
                  <label key={g} className="radio-option">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={form.gender === g}
                      onChange={handleChange}
                    />
                    {g}
                  </label>
                ))}
              </div>
              {errors.gender && <span className="form-error">{errors.gender}</span>}
            </div>
          </div>

          <div className="request-form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                className={`form-input${errors.city ? ' error' : ''}`}
                placeholder="Enter your city"
                value={form.city}
                onChange={handleChange}
              />
              {errors.city && <span className="form-error">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="state">State</label>
              <select
                id="state"
                name="state"
                className={`form-select${errors.state ? ' error' : ''}`}
                value={form.state}
                onChange={handleChange}
              >
                <option value="">Select a state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.state && <span className="form-error">{errors.state}</span>}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg request-submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Application
              </>
            )}
          </button>
        </form>
      </div>

      {submitted && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">
              <CheckCircle size={32} />
            </div>
            <h2 className="success-title">Application Submitted Successfully!</h2>
            <p className="success-message">
              Your certificate application has been saved in the database. Use the Application ID below to track your status.
            </p>
            <div className="success-app-id">
              {submitted.applicationId || submitted.id}
            </div>
            <br />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={handleCloseModal}>
                Done
              </button>
              <Link to="/track" className="btn btn-secondary">
                Track Application
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
