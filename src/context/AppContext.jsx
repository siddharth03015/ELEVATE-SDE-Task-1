import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const AppContext = createContext();

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export function AppProvider({ children }) {
  const [applications, setApplications] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [stats, setStats] = useState({ applications: 0, certificates: 0, verified: 0 });
  const [isAdmin, setIsAdmin] = useState(() => Boolean(localStorage.getItem('credvault_token')));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load public statistics from backend database
  const refreshStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      if (data && data.success) {
        setStats({
          applications: data.applications || 0,
          certificates: data.certificates || 0,
          verified: data.verified || 0,
        });
      }
    } catch {
      // Fallback stats gracefully
    }
  }, []);

  // Fetch all applications (Admin)
  const fetchApplications = useCallback(async () => {
    if (!localStorage.getItem('credvault_token')) return;
    try {
      setLoading(true);
      const res = await api.getAdminApplications();
      if (res && res.applications) {
        // Normalize item IDs
        const normalized = res.applications.map((app) => ({
          ...app,
          id: app.applicationId || app.id,
        }));
        setApplications(normalized);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all certificates (Admin)
  const fetchCertificates = useCallback(async () => {
    if (!localStorage.getItem('credvault_token')) return;
    try {
      setLoading(true);
      const res = await api.getAdminCertificates();
      if (res && res.certificates) {
        // Normalize item IDs
        const normalized = res.certificates.map((cert) => ({
          ...cert,
          id: cert.certificateId || cert.id,
        }));
        setCertificates(normalized);
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshStats();
    if (isAdmin) {
      fetchApplications();
      fetchCertificates();
    }
  }, [isAdmin, refreshStats, fetchApplications, fetchCertificates]);

  // Citizen: Submit application via real backend API
  const submitApplication = async (formData) => {
    try {
      setLoading(true);
      const res = await api.submitApplication(formData);
      await refreshStats();
      if (isAdmin) {
        await fetchApplications();
      }
      return {
        id: res.applicationId,
        applicationId: res.applicationId,
        status: res.status || 'Pending',
        ...formData,
      };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Citizen: Track application by ID via real backend API
  const trackApplication = async (appId) => {
    try {
      setLoading(true);
      const res = await api.trackApplication(appId);
      if (!res) return null;
      return {
        id: res.applicationId,
        applicationId: res.applicationId,
        name: res.name,
        phone: res.phone,
        city: res.city,
        state: res.state,
        gender: res.gender,
        status: res.status,
        submittedAt: res.submittedAt,
        rejectReason: res.rejectReason,
      };
    } catch (err) {
      if (err.status === 404) return null;
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Citizen: Verify certificate by ID via real backend API
  const verifyCertificate = async (certId) => {
    try {
      setLoading(true);
      const res = await api.verifyCertificate(certId);
      if (!res) return null;
      return {
        id: res.certificateId,
        certificateId: res.certificateId,
        name: res.name,
        phone: res.phone,
        city: res.city,
        state: res.state,
        status: res.status,
        issuedOn: res.issuedOn,
        applicationId: res.applicationId,
      };
    } catch (err) {
      if (err.status === 404) return null;
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin: Login via real backend API
  const adminLogin = async (username, password) => {
    try {
      setLoading(true);
      const res = await api.adminLogin(username, password);
      if (res.token) {
        setIsAdmin(true);
        await Promise.all([fetchApplications(), fetchCertificates(), refreshStats()]);
        return true;
      }
      return false;
    } catch (err) {
      setIsAdmin(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin: Logout
  const adminLogout = () => {
    api.adminLogout();
    setIsAdmin(false);
    setApplications([]);
    setCertificates([]);
  };

  // Admin: Approve application via real backend API
  const approveApplication = async (appId) => {
    try {
      setLoading(true);
      const res = await api.approveApplication(appId);
      await Promise.all([fetchApplications(), fetchCertificates(), refreshStats()]);
      return res;
    } catch (err) {
      console.error('Approve error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin: Reject application via real backend API
  const rejectApplication = async (appId, reason = '') => {
    try {
      setLoading(true);
      const res = await api.rejectApplication(appId, reason);
      await Promise.all([fetchApplications(), refreshStats()]);
      return res;
    } catch (err) {
      console.error('Reject error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin: Revoke certificate via real backend API
  const revokeCertificate = async (certId) => {
    try {
      setLoading(true);
      const res = await api.revokeCertificate(certId);
      await Promise.all([fetchCertificates(), refreshStats()]);
      return res;
    } catch (err) {
      console.error('Revoke error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    applications,
    certificates,
    stats,
    isAdmin,
    loading,
    error,
    fetchApplications,
    fetchCertificates,
    refreshStats,
    submitApplication,
    trackApplication,
    verifyCertificate,
    approveApplication,
    rejectApplication,
    revokeCertificate,
    adminLogin,
    adminLogout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
