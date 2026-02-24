import { FileSystemProvider } from './context/FileSystemContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  return (
    <FileSystemProvider>
      <div className="app-layout">
        <div className="app-body">
          <Sidebar />
          <Dashboard />
        </div>
      </div>
    </FileSystemProvider>
  );
}

export default App;
