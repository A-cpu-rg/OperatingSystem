import { FileSystemProvider } from './context/FileSystemContext';
import FileExplorer from './components/FileExplorer';
import AnimationArea from './components/AnimationArea';
import StatsPanel from './components/StatsPanel';
import Terminal from './components/Terminal';
import './index.css';

function App() {
  return (
    <FileSystemProvider>
      <div className="app">
        <div className="app-container">
          {/* Header */}
          <header className="header">
            <div className="header-left">
              <div className="header-icon">🗂️</div>
              <div>
                <h1 className="header-title">File Organizer</h1>
                <p className="header-subtitle">Operating System Project 2026</p>
              </div>
            </div>
            <div className="header-badge">
              Ready
            </div>
          </header>

          {/* Main Layout */}
          <div className="main-layout">
            {/* Left - File Explorer */}
            <FileExplorer />

            {/* Center - Visualization */}
            <div className="viz-panel">
              <AnimationArea />
              <Terminal />
            </div>

            {/* Right - Stats */}
            <StatsPanel />
          </div>

          {/* Footer */}
          <footer className="footer">
            <p>
              <strong>Note:</strong> This visualization mirrors the C backend behavior.
              Real file operations use POSIX system calls: <code>opendir()</code>, <code>stat()</code>, <code>rename()</code>
            </p>
          </footer>
        </div>
      </div>
    </FileSystemProvider>
  );
}

export default App;
