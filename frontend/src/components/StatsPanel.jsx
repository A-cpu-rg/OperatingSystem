import { useFileSystem } from '../context/FileSystemContext';

export default function StatsPanel() {
    const { getCategoryCounts, categories, isOrganized } = useFileSystem();
    const counts = getCategoryCounts();
    const totalFiles = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <div className="panel">
            <div className="panel-header">
                <div className="panel-header-icon">📊</div>
                <h2>Statistics</h2>
            </div>
            <div className="panel-content">
                <div className="stats-list">
                    <div className="stat-item">
                        <span className="stat-label">
                            <span>📁</span> Total Files
                        </span>
                        <span className="stat-value">{totalFiles}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">
                            <span>📦</span> Status
                        </span>
                        <span
                            className="stat-value"
                            style={{ color: isOrganized ? 'var(--accent-success)' : 'var(--accent-warning)' }}
                        >
                            {isOrganized ? 'Done' : 'Pending'}
                        </span>
                    </div>
                </div>

                <div style={{ marginTop: 20 }}>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        marginBottom: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        By Category
                    </div>
                    <div className="stats-list">
                        {Object.entries(categories).map(([key, cat]) => (
                            <div key={key} className="stat-item">
                                <span className="stat-label">
                                    <span>{cat.icon}</span> {cat.name}
                                </span>
                                <span className="stat-value" style={{ color: cat.color }}>
                                    {counts[key]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* OS Concept */}
                <div className="concept-card">
                    <h4>💡 OS Concepts</h4>
                    <p>
                        <code>opendir()</code> opens directories<br />
                        <code>readdir()</code> reads entries<br />
                        <code>stat()</code> gets metadata<br />
                        <code>rename()</code> moves atomically<br />
                        <code>mkdir()</code> creates folders
                    </p>
                </div>
            </div>
        </div>
    );
}
