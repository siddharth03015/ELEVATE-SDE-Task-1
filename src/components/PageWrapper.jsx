import './PageWrapper.css';

export default function PageWrapper({ icon, title, subtitle, children }) {
  return (
    <main className="page-wrapper">
      <div className="container">
        {title && (
          <div className="page-header">
            {icon && <div className="page-header-icon">{icon}</div>}
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </main>
  );
}
