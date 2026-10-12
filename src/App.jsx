import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RequestPage from './pages/RequestPage';
import TrackPage from './pages/TrackPage';
import VerifyPage from './pages/VerifyPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import AdminCertificatesPage from './pages/AdminCertificatesPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/request" element={<RequestPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/applications" element={<AdminApplicationsPage />} />
          <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
        </Routes>
        <Footer />
      </AppProvider>
    </BrowserRouter>
  );
}
