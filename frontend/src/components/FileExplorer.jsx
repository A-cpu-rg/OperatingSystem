import { useFileSystem } from '../context/FileSystemContext';
import { getFileIcon } from '../data/sampleFiles';

export default function FileExplorer() {
    const { files, isOrganized, organizedFiles, categories, currentFileIndex } = useFileSystem();

    if (isOrganized) {
        return (
            <div className="panel">
                <div className="panel-header">
                    <div className="panel-header-icon">📂</div>
                    <h2>Organized Files</h2>
                    <span className="panel-header-count">
                        {Object.values(organizedFiles).flat().length} files
                    </span>
                </div>
                <div className="panel-content">
                    <div className="file-list">
                        {Object.entries(organizedFiles).map(([cat, catFiles]) => (
                            catFiles.length > 0 && (
                                <div key={cat} style={{ marginBottom: 16 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginBottom: 8,
                                        paddingBottom: 8,
                                        borderBottom: '1px solid rgba(255,255,255,0.06)'
                                    }}>
                                        <span style={{ fontSize: '1.1rem' }}>{categories[cat].icon}</span>
                                        <span style={{ fontWeight: 600, color: categories[cat].color }}>
                                            {categories[cat].name}/
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            {catFiles.length}
                                        </span>
                                    </div>
                                    {catFiles.map(file => (
                                        <div key={file.id} className="file-item" style={{ marginLeft: 12 }}>
                                            <div className="file-icon">{getFileIcon(file.extension)}</div>
                                            <div className="file-info">
                                                <div className="file-name">{file.name}</div>
                                                <div className="file-meta">{file.size}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="panel-header">
                <div className="panel-header-icon">📁</div>
                <h2>Source Folder</h2>
                <span className="panel-header-count">{files.length} files</span>
            </div>
            <div className="panel-content">
                <div className="file-list">
                    {files.map((file, idx) => (
                        <div
                            key={file.id}
                            className={`file-item ${currentFileIndex >= 0 && idx <= currentFileIndex ? 'organizing' : ''}`}
                        >
                            <div className="file-icon">{getFileIcon(file.extension)}</div>
                            <div className="file-info">
                                <div className="file-name">{file.name}</div>
                                <div className="file-meta">{file.size}</div>
                            </div>
                            <span className={`file-badge badge-${file.category}`}>
                                {file.category}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
