import { Shield } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-icon">
            <Shield size={14} />
          </div>
          <span>CredVault</span>
        </div>
        <p className="footer-text">
          &copy; {new Date().getFullYear()} CredVault. Digital Certificate Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
