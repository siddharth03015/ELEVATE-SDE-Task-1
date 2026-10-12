import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

// Indian states list
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Seed data
const SEED_APPLICATIONS = [
  {
    id: 'APP-0001',
    name: 'Aarav Sharma',
    phone: '9876543210',
    gender: 'Male',
    city: 'Mumbai',
    state: 'Maharashtra',
    status: 'Approved',
    submittedAt: '2026-10-01',
  },
  {
    id: 'APP-0002',
    name: 'Priya Patel',
    phone: '9123456789',
    gender: 'Female',
    city: 'Ahmedabad',
    state: 'Gujarat',
    status: 'Pending',
    submittedAt: '2026-10-05',
  },
  {
    id: 'APP-0003',
    name: 'Rohan Gupta',
    phone: '9988776655',
    gender: 'Male',
    city: 'Delhi',
    state: 'Delhi',
    status: 'Rejected',
    submittedAt: '2026-10-03',
  },
  {
    id: 'APP-0004',
    name: 'Sneha Reddy',
    phone: '9654321870',
    gender: 'Female',
    city: 'Hyderabad',
    state: 'Telangana',
    status: 'Approved',
    submittedAt: '2026-10-07',
  },
  {
    id: 'APP-0005',
    name: 'Vikram Singh',
    phone: '9012345678',
    gender: 'Male',
    city: 'Jaipur',
    state: 'Rajasthan',
    status: 'Pending',
    submittedAt: '2026-10-10',
  },
];

const SEED_CERTIFICATES = [
  {
    id: 'CERT-0001',
    applicationId: 'APP-0001',
    name: 'Aarav Sharma',
    phone: '9876543210',
    city: 'Mumbai',
    state: 'Maharashtra',
    status: 'Valid',
    issuedOn: '2026-10-02',
  },
  {
    id: 'CERT-0002',
    applicationId: 'APP-0004',
    name: 'Sneha Reddy',
    phone: '9654321870',
    city: 'Hyderabad',
    state: 'Telangana',
    status: 'Revoked',
    issuedOn: '2026-10-08',
  },
];

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }) {
  const [applications, setApplications] = useState(() =>
    loadFromStorage('credvault_applications', SEED_APPLICATIONS)
  );
  const [certificates, setCertificates] = useState(() =>
    loadFromStorage('credvault_certificates', SEED_CERTIFICATES)
  );
  const [isAdmin, setIsAdmin] = useState(() =>
    loadFromStorage('credvault_admin', false)
  );

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('credvault_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('credvault_certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('credvault_admin', JSON.stringify(isAdmin));
  }, [isAdmin]);

  // Generate next ID
  const getNextAppId = () => {
    const maxNum = applications.reduce((max, app) => {
      const num = parseInt(app.id.split('-')[1], 10);
      return num > max ? num : max;
    }, 0);
    return `APP-${String(maxNum + 1).padStart(4, '0')}`;
  };

  const getNextCertId = () => {
    const maxNum = certificates.reduce((max, cert) => {
      const num = parseInt(cert.id.split('-')[1], 10);
      return num > max ? num : max;
    }, 0);
    return `CERT-${String(maxNum + 1).padStart(4, '0')}`;
  };

  // Submit a new application
  const submitApplication = (formData) => {
    const newApp = {
      id: getNextAppId(),
      ...formData,
      status: 'Pending',
      submittedAt: new Date().toISOString().split('T')[0],
    };
    setApplications((prev) => [...prev, newApp]);
    return newApp;
  };

  // Track an application
  const trackApplication = (appId) => {
    return applications.find((app) => app.id.toUpperCase() === appId.toUpperCase());
  };

  // Verify a certificate
  const verifyCertificate = (certId) => {
    return certificates.find((cert) => cert.id.toUpperCase() === certId.toUpperCase());
  };

  // Admin: Approve an application (issue certificate)
  const approveApplication = (appId) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: 'Approved' } : a))
    );

    const newCert = {
      id: getNextCertId(),
      applicationId: appId,
      name: app.name,
      phone: app.phone,
      city: app.city,
      state: app.state,
      status: 'Valid',
      issuedOn: new Date().toISOString().split('T')[0],
    };
    setCertificates((prev) => [...prev, newCert]);
  };

  // Admin: Reject an application
  const rejectApplication = (appId) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: 'Rejected' } : a))
    );
  };

  // Admin: Revoke a certificate
  const revokeCertificate = (certId) => {
    setCertificates((prev) =>
      prev.map((c) => (c.id === certId ? { ...c, status: 'Revoked' } : c))
    );
  };

  // Admin login
  const adminLogin = (username, password) => {
    if (username === 'admin' && password === 'admin') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdmin(false);
  };

  const value = {
    applications,
    certificates,
    isAdmin,
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
