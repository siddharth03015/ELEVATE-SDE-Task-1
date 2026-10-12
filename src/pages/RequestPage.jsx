import { useState } from 'react';
import { FileText, CheckCircle, Send } from 'lucide-react';
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const newApp = submitApplication(form);
    setSubmitted(newApp);
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

          <button type="submit" className="btn btn-primary btn-lg request-submit">
            <Send size={18} />
            Submit Application
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
              Your certificate application has been received. Use the ID below to track your application status.
            </p>
            <div className="success-app-id">
              {submitted.id}
            </div>
            <br />
            <button className="btn btn-primary" onClick={handleCloseModal}>
              Done
            </button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
