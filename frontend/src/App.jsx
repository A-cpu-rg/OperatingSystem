import { FileSystemProvider, useFileSystem } from './context/FileSystemContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import './index.css';

function ToastContainer() {
  const { toasts, removeToast } = useFileSystem();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <div className="toast-icon">
            {t.type === 'success' ? '✅' : t.type === 'warning' ? '⚠️' : t.type === 'danger' ? '❌' : 'ℹ️'}
          </div>
          <div className="toast-content">
            <div className="toast-title">{t.title}</div>
            <div className="toast-desc">{t.desc}</div>
          </div>
          <button className="toast-close" onClick={() => removeToast(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

function AppContent() {
  return (
    <div className="app-layout">
      <div className="app-body">
        <Sidebar />
        <Dashboard />
      </div>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <FileSystemProvider>
      <AppContent />
    </FileSystemProvider>
  );
}

export default App;
