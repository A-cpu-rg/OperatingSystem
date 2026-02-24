import { useState } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import { getFileIcon, generateId } from '../data/sampleFiles';

export default function FileExplorer() {
    const { files, isOrganized, organizedFiles, categories, currentFileIndex, deleteFile, uploadFile } = useFileSystem();
    const [newFileName, setNewFileName] = useState('');

    const handleUpload = (e) => {
        e.preventDefault();
        if (!newFileName.trim()) return;

        // Give it a fake size between 1KB and 5MB
        const fakeSize = Math.floor(Math.random() * 5000) + 1;
        const sizeStr = fakeSize > 1000 ? `${(fakeSize / 1024).toFixed(1)} MB` : `${fakeSize} KB`;

        // Determine category based on extension (simple check)
        const ext = newFileName.split('.').pop().toLowerCase();
        let cat = 'others';
        if (['pdf', 'doc', 'docx', 'txt', 'xlsx', 'pptx'].includes(ext)) cat = 'documents';
        if (['jpg', 'png', 'svg', 'gif'].includes(ext)) cat = 'images';
        if (['mp4', 'mkv', 'mov'].includes(ext)) cat = 'videos';
        if (['mp3', 'wav'].includes(ext)) cat = 'music';
        if (['zip', 'rar'].includes(ext)) cat = 'archives';
        if (['js', 'jsx', 'py', 'c', 'cpp'].includes(ext)) cat = 'code';

        uploadFile({
            id: generateId(),
            name: newFileName,
            extension: ext,
            size: sizeStr,
            category: cat
        });
        setNewFileName('');
    };

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
                                            <button
                                                className="file-delete-btn"
                                                onClick={() => deleteFile(file.id, true, cat)}
                                                title="Delete file"
                                            >
                                                🗑️
                                            </button>
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
                <form className="upload-form" onSubmit={handleUpload}>
                    <input
                        className="upload-input"
                        type="text"
                        value={newFileName}
                        onChange={e => setNewFileName(e.target.value)}
                        placeholder="e.g. model_weights.pt"
                    />
                    <button type="submit" className="upload-btn" disabled={!newFileName.trim()}>
                        Upload
                    </button>
                </form>

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
                            <button
                                className="file-delete-btn"
                                onClick={() => deleteFile(file.id, false, null)}
                                title="Delete file"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
