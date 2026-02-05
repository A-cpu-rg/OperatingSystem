import { useFileSystem } from '../context/FileSystemContext';

export default function AnimationArea() {
    const {
        files,
        isOrganized,
        isAnimating,
        currentFileIndex,
        getCategoryCounts,
        categories,
        preview,
        organize,
        undo,
        reset
    } = useFileSystem();

    const counts = getCategoryCounts();
    const totalFiles = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <div className="viz-area">
            <div className="viz-header">
                <div className="viz-title">
                    <span>✨</span>
                    <span>Organization Visualization</span>
                </div>
                <div className={`viz-status ${isAnimating ? 'active' : ''}`}>
                    {isAnimating ? '⏳ Organizing...' : isOrganized ? '✅ Complete' : '⏸️ Ready'}
                </div>
            </div>

            <div className="viz-content">
                {/* Source Zone */}
                <div className="source-area">
                    <div className="source-title">
                        <span>📁</span>
                        <span>Source</span>
                    </div>

                    {!isOrganized && files.length > 0 ? (
                        <div className="source-files">
                            {files.slice(0, 6).map((file, idx) => (
                                <div
                                    key={file.id}
                                    className={`source-file ${currentFileIndex >= 0 && idx <= currentFileIndex ? 'moving' : ''}`}
                                >
                                    {file.name.length > 18 ? file.name.substring(0, 18) + '...' : file.name}
                                </div>
                            ))}
                            {files.length > 6 && (
                                <div style={{
                                    textAlign: 'center',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.75rem',
                                    padding: '8px'
                                }}>
                                    +{files.length - 6} more files
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="source-empty">
                            <div className="source-empty-icon">✅</div>
                            <div>All files organized!</div>
                        </div>
                    )}
                </div>

                {/* Target Grid */}
                <div className="target-grid">
                    {Object.entries(categories).map(([key, cat]) => (
                        <div
                            key={key}
                            className={`category-card ${isAnimating && files[currentFileIndex]?.category === key ? 'active' : ''
                                } ${counts[key] > 0 ? 'has-files' : ''}`}
                        >
                            <div className="category-icon">{cat.icon}</div>
                            <div className="category-name">{cat.name}</div>
                            <div className="category-count" style={{ color: cat.color }}>
                                {counts[key]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Progress */}
            {isAnimating && (
                <div className="progress-container">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${((currentFileIndex + 1) / totalFiles) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="controls">
                <button className="btn btn-secondary" onClick={preview} disabled={isAnimating}>
                    👁️ Preview
                </button>
                <button className="btn btn-primary" onClick={organize} disabled={isAnimating || isOrganized}>
                    ✨ Organize
                </button>
                <button className="btn btn-warning" onClick={undo} disabled={isAnimating || !isOrganized}>
                    ↩️ Undo
                </button>
                <button className="btn btn-secondary" onClick={reset} disabled={isAnimating}>
                    🔄 Reset
                </button>
            </div>
        </div>
    );
}
