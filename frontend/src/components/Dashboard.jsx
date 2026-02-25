import { useRef, useState, useEffect, useCallback } from 'react';
import { useFileSystem, parseBytes, fmtBytes } from '../context/FileSystemContext';
import { getFileIcon, categories } from '../data/sampleFiles';

// ═══════════════════════════════════════════════
// PREVIEW MODAL
// ═══════════════════════════════════════════════
function PreviewModal({ file, onClose, onToggleFav, onDelete, isOrganized }) {
    const [text, setText] = useState(null);
    const [objUrl, setObjUrl] = useState(null);

    useEffect(() => {
        if (!file?.originalFile) return;
        const url = URL.createObjectURL(file.originalFile);
        setObjUrl(url);
        const textExts = ['txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'py', 'c', 'cpp', 'java', 'html', 'css', 'json', 'xml', 'sh', 'csv'];
        if (textExts.includes(file.extension?.toLowerCase())) {
            const r = new FileReader();
            r.onload = e => setText(e.target.result);
            r.readAsText(file.originalFile);
        }
        return () => URL.revokeObjectURL(url);
    }, [file]);

    if (!file) return null;
    const ext = file.extension?.toLowerCase();
    const isImg = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext);
    const isVid = ['mp4', 'mkv', 'mov', 'avi', 'webm'].includes(ext);
    const isAudio = ['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext);

    const handleDownload = () => {
        if (!file.originalFile) { alert('Demo files cannot be downloaded. Upload a real file to download it.'); return; }
        const a = document.createElement('a');
        a.href = objUrl; a.download = file.name;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-title">
                        <span className="modal-title-icon">{getFileIcon(file.extension)}</span>
                        <h3>{file.name}</h3>
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {isImg && objUrl ? (
                        <img src={objUrl} alt={file.name} className="preview-img" />
                    ) : isVid && objUrl ? (
                        <video src={objUrl} controls className="preview-video" />
                    ) : isAudio && objUrl ? (
                        <div className="preview-placeholder">
                            <div className="preview-placeholder-icon">🎵</div>
                            <audio src={objUrl} controls className="preview-audio" />
                        </div>
                    ) : text !== null ? (
                        <div className="preview-code">{text.slice(0, 3000)}{text.length > 3000 ? '\n\n... (truncated)' : ''}</div>
                    ) : (
                        <div className="preview-placeholder">
                            <div className="preview-placeholder-icon">{getFileIcon(file.extension)}</div>
                            <p style={{ fontSize: '.83rem', color: 'var(--text-muted)' }}>
                                {file.originalFile
                                    ? `Preview not available for .${ext} files.`
                                    : 'Demo file — upload a real file to preview it.'}
                            </p>
                        </div>
                    )}
                    <div className="modal-meta">
                        <span className="modal-meta-tag"><strong>Size:</strong> {file.size}</span>
                        <span className="modal-meta-tag"><strong>Modified:</strong> {file.modified}</span>
                        <span className="modal-meta-tag"><strong>Category:</strong> {categories[file.category]?.name}</span>
                        <span className="modal-meta-tag"><strong>iNode:</strong> #{file.inode}</span>
                        <span className="modal-meta-tag"><strong>Shared:</strong> {file.shared}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button
                        className={`btn btn-sm ${file.isFavorite ? 'btn-warning' : 'btn-primary'}`}
                        onClick={() => { onToggleFav(file.id); }}
                    >
                        {file.isFavorite ? '⭐ Unfavorite' : '☆ Favorite'}
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={handleDownload}>⬇️ Download</button>
                    <button
                        className="btn btn-sm"
                        style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,.3)', background: 'rgba(239,68,68,.08)' }}
                        onClick={() => { onDelete(file.id, isOrganized, file.category); onClose(); }}
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════
// ANALYTICS PAGE
// ═══════════════════════════════════════════════
function AnalyticsPage({ files }) {
    const counts = {}; const sizes = {}; let totalB = 0;
    files.forEach(f => {
        counts[f.category] = (counts[f.category] || 0) + 1;
        const b = parseBytes(f.size);
        sizes[f.category] = (sizes[f.category] || 0) + b;
        totalB += b;
    });

    const palette = {
        documents: '#3B82F6', images: '#EC4899', videos: '#EF4444',
        music: '#22C55E', archives: '#F97316', code: '#06B6D4', others: '#6B7280',
    };

    const cats = Object.entries(categories).map(([k, v]) => ({
        key: k, name: v.name, icon: v.icon, count: counts[k] || 0,
        size: sizes[k] || 0, color: palette[k],
    })).filter(c => c.count > 0);

    const maxCount = Math.max(...cats.map(c => c.count), 1);
    const R = 52, CX = 68, CY = 68, SW = 13, circ = 2 * Math.PI * R;
    let off = 0;
    const segs = cats.map(c => {
        const d = totalB > 0 ? (c.size / totalB) * circ : circ / cats.length;
        const s = { ...c, dash: d, offset: off };
        off += d; return s;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Analytics</div>
                    <div className="page-sub">{files.length} total files · {fmtBytes(totalB)} used</div>
                </div>
            </div>

            <div className="stats-row">
                {[
                    { icon: '📁', value: files.length, label: 'Total Files' },
                    { icon: '💾', value: fmtBytes(totalB), label: 'Total Size' },
                    { icon: '⭐', value: files.filter(f => f.isFavorite).length, label: 'Favorites' },
                    { icon: '📂', value: cats.length, label: 'Active Cats.' },
                ].map((s, i) => (
                    <div className="stat-card" key={i}>
                        <div className="stat-card-icon">{s.icon}</div>
                        <div className="stat-card-value">{s.value}</div>
                        <div className="stat-card-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="analytics-grid">
                {/* Bar chart */}
                <div className="a-card">
                    <div className="a-card-title">Files by Category</div>
                    {cats.map(c => (
                        <div className="bar-row" key={c.key}>
                            <div className="bar-label"><span>{c.icon}</span><span>{c.name}</span></div>
                            <div className="bar-track">
                                <div className="bar-fill" style={{ width: `${(c.count / maxCount) * 100}%`, background: c.color }} />
                            </div>
                            <div className="bar-count">{c.count}</div>
                        </div>
                    ))}
                </div>

                {/* Donut */}
                <div className="a-card">
                    <div className="a-card-title">Storage by Category</div>
                    <div className="donut-wrap">
                        <svg width={136} height={136}>
                            <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--border)" strokeWidth={SW} />
                            {segs.map((s, i) => (
                                <circle key={i} cx={CX} cy={CY} r={R} fill="none"
                                    stroke={s.color} strokeWidth={SW}
                                    strokeDasharray={`${s.dash} ${circ - s.dash}`}
                                    strokeDashoffset={-s.offset + circ * .25}
                                    strokeLinecap="round"
                                    style={{ transition: 'all .5s ease' }}
                                />
                            ))}
                            <text x={CX} y={CY - 5} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="700" fontFamily="Syne,sans-serif">
                                {fmtBytes(totalB)}
                            </text>
                            <text x={CX} y={CY + 9} textAnchor="middle" fill="var(--text-muted)" fontSize="8">Total</text>
                        </svg>
                        <div className="donut-legend">
                            {cats.map(c => (
                                <div className="donut-legend-item" key={c.key}>
                                    <div className="donut-dot" style={{ background: c.color }} />
                                    <span>{c.name}</span>
                                    <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '.72rem' }}>{fmtBytes(c.size)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Distribution strip */}
            <div className="a-card">
                <div className="a-card-title">Storage Distribution</div>
                <div className="dist-bar-wrap">
                    {segs.map((s, i) => (
                        <div key={i} title={`${s.name}: ${fmtBytes(s.size)}`}
                            style={{ flex: s.size || 1, background: s.color, minWidth: 4, transition: 'flex .5s ease' }} />
                    ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px 16px' }}>
                    {cats.map(c => (
                        <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.75rem', color: 'var(--text-secondary)' }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: c.color }} />
                            {c.name} — {fmtBytes(c.size)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════
// INODE TABLE PAGE
// ═══════════════════════════════════════════════
function InodeTablePage({ files, trash }) {
    const perms = (cat) => {
        if (cat === 'code') return 'rwxr-xr-x';
        return 'rw-r--r--';
    };
    const allEntries = [
        { inode: 1, name: '/', type: 'DIR', size: '4 KB', perm: 'rwxr-xr-x', links: files.length, modified: 'root', isRoot: true },
        ...files.map(f => ({ ...f, type: 'REG', perm: perms(f.category), links: 1, isRoot: false })),
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="page-header">
                <div>
                    <div className="page-title">iNode Table</div>
                    <div className="page-sub">OS Kernel metadata — every file's inode entry in the filesystem</div>
                </div>
            </div>

            <div className="upload-banner">
                <div>
                    <h2>📚 What is an iNode?</h2>
                    <p>Every file in a Unix/Linux filesystem has an iNode — a data structure storing metadata: permissions, owner, size, timestamps, and pointers to data blocks. The filename itself is just a directory entry pointing to an iNode number.</p>
                </div>
            </div>

            <div className="inode-table-wrap">
                <div className="inode-table-header">
                    <span>iNode Table — /home/user/files</span>
                    <div className="inode-live">
                        <div className="inode-live-dot" />
                        {files.length} entries
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="inode-table">
                        <thead>
                            <tr>
                                <th>iNode #</th>
                                <th>File Name</th>
                                <th>Type</th>
                                <th>Permissions</th>
                                <th>Size</th>
                                <th>Links</th>
                                <th>Modified</th>
                                <th>Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allEntries.map((f, i) => (
                                <tr key={i}>
                                    <td className="inode-num">{f.inode || 1}</td>
                                    <td className="inode-name">{f.name}</td>
                                    <td className={f.type === 'DIR' ? 'inode-type-dir' : 'inode-type-file'}>{f.type}</td>
                                    <td className="inode-perm">{f.perm}</td>
                                    <td>{f.size}</td>
                                    <td>{f.links}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{f.modified || '—'}</td>
                                    <td>
                                        {!f.isRoot && (
                                            <span className={`badge badge-${f.category}`}>{categories[f.category]?.name}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {trash.length > 0 && (
                <div className="inode-table-wrap">
                    <div className="inode-table-header">
                        <span>Unlinked inodes — /dev/null (Trash)</span>
                        <div className="inode-live">
                            <div className="inode-live-dot" style={{ background: 'var(--danger)' }} />
                            {trash.length} unlinked
                        </div>
                    </div>
                    <table className="inode-table">
                        <thead>
                            <tr><th>iNode #</th><th>File Name</th><th>Size</th><th>Deleted At</th></tr>
                        </thead>
                        <tbody>
                            {trash.map((f, i) => (
                                <tr key={i} style={{ opacity: .5 }}>
                                    <td className="inode-num" style={{ color: 'var(--danger)' }}>{f.inode}</td>
                                    <td style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{f.name}</td>
                                    <td>{f.size}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{f.deletedAt}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════
// TRASH PAGE
// ═══════════════════════════════════════════════
function TrashPage({ trash, restoreFile, emptyTrash }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Trash</div>
                    <div className="page-sub">{trash.length} deleted file(s) — restore or permanently delete</div>
                </div>
                {trash.length > 0 && (
                    <button className="btn btn-danger-soft btn-sm" onClick={emptyTrash}>🗑️ Empty Trash</button>
                )}
            </div>

            <div className="file-table-card">
                {trash.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🗑️</div>
                        <div className="empty-state-text">Trash is empty</div>
                    </div>
                ) : (
                    <table className="file-table">
                        <thead>
                            <tr>
                                <th>Name</th><th>Size</th><th>Category</th><th>Deleted At</th><th>Restore</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trash.map(file => (
                                <tr key={file.id}>
                                    <td>
                                        <div className="file-name-cell" style={{ cursor: 'default' }}>
                                            <div className="file-icon-big">{getFileIcon(file.extension)}</div>
                                            <span className="file-filename" style={{ opacity: .55 }}>{file.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{file.size}</td>
                                    <td><span className={`badge badge-${file.category}`}>{categories[file.category]?.name}</span></td>
                                    <td style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{file.deletedAt}</td>
                                    <td>
                                        <button className="btn btn-outline btn-xs" onClick={() => restoreFile(file.id)}>↩️ Restore</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════
// NOTIFICATIONS PAGE
// ═══════════════════════════════════════════════
function NotificationsPage({ notifications, markAllRead, clearNotif }) {
    const tc = { success: '#22C55E', info: '#3B82F6', warning: '#F59E0B', danger: '#EF4444' };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Notifications</div>
                    <div className="page-sub">{notifications.filter(n => n.unread).length} unread</div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={markAllRead}>✅ Mark all read</button>
            </div>
            <div className="notif-list">
                {notifications.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔔</div>
                        <div className="empty-state-text">No notifications yet</div>
                    </div>
                )}
                {notifications.map(n => (
                    <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                        <div className="notif-dot" style={{ background: tc[n.type] || tc.info, opacity: n.unread ? 1 : .3 }} />
                        <div className="notif-body">
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-desc">{n.desc}</div>
                        </div>
                        <span className="notif-time">{n.time}</span>
                        <button onClick={() => clearNotif(n.id)} className="icon-btn" title="Dismiss">×</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════
function SettingsPage({ reset }) {
    const [autoOrg, setAutoOrg] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [showHidden, setShowHidden] = useState(false);
    const [confirmDel, setConfirmDel] = useState(true);
    const [accent, setAccent] = useState('#4f8ef7');
    const [sortDef, setSortDef] = useState('name');
    const [name, setName] = useState('Abhishek Meena');
    const [role, setRole] = useState('OS Project 2026');

    const colors = ['#4f8ef7', '#22C55E', '#EC4899', '#F97316', '#06B6D4', '#7c3aed'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Settings</div>
                    <div className="page-sub">Customize your FileOrganizer experience</div>
                </div>
            </div>
            <div className="settings-grid">
                {/* General */}
                <div className="s-card">
                    <div className="s-card-title">General</div>
                    {[
                        { label: 'Auto-organize on upload', sub: 'Sort files immediately', val: autoOrg, set: setAutoOrg },
                        { label: 'Dark Mode', sub: 'Use dark theme', val: darkMode, set: setDarkMode },
                        { label: 'Show hidden files', sub: 'Files starting with .', val: showHidden, set: setShowHidden },
                        { label: 'Confirm before delete', sub: 'Ask before trash', val: confirmDel, set: setConfirmDel },
                    ].map((s, i) => (
                        <div className="s-row" key={i}>
                            <div>
                                <div className="s-row-label">{s.label}</div>
                                <div className="s-row-sub">{s.sub}</div>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" checked={s.val} onChange={e => s.set(e.target.checked)} />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                    ))}
                    <div className="s-row">
                        <div>
                            <div className="s-row-label">Default Sort</div>
                            <div className="s-row-sub">Sort files by default</div>
                        </div>
                        <select className="s-select" value={sortDef} onChange={e => setSortDef(e.target.value)}>
                            <option value="name">Name</option>
                            <option value="size">Size</option>
                            <option value="modified">Date Modified</option>
                            <option value="category">Category</option>
                        </select>
                    </div>
                    <div className="s-row">
                        <div>
                            <div className="s-row-label">Accent Color</div>
                            <div className="s-row-sub">UI highlight color</div>
                        </div>
                        <div className="color-dots">
                            {colors.map(c => (
                                <div key={c} className={`color-dot ${accent === c ? 'sel' : ''}`}
                                    style={{ background: c }} onClick={() => setAccent(c)} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Profile */}
                <div className="s-card">
                    <div className="s-card-title">Profile</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                        <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#7c3aed,var(--accent))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: 'white' }}>AM</div>
                        <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '.9rem' }}>{name}</div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{role}</div>
                        </div>
                    </div>
                    {[{ label: 'Full Name', val: name, set: setName }, { label: 'Role', val: role, set: setRole }].map((f, i) => (
                        <div className="s-profile-row" key={i}>
                            <span className="s-profile-label">{f.label}</span>
                            <input className="s-input" value={f.val} onChange={e => f.set(e.target.value)} />
                        </div>
                    ))}
                    <div style={{ marginTop: 14 }}>
                        <button className="btn btn-primary btn-sm">💾 Save Profile</button>
                    </div>
                </div>

                {/* Storage */}
                <div className="s-card">
                    <div className="s-card-title">Storage</div>
                    {[
                        { label: 'Auto-clear Trash', sub: 'Delete items after', type: 'select', opts: ['Never', '7 days', '30 days', '90 days'] },
                        { label: 'Duplicate detection', sub: 'Warn on duplicate file names', type: 'toggle', val: true },
                        { label: 'Max upload size', sub: 'Per file limit', type: 'select', opts: ['128 GB', '10 GB', '1 GB'] },
                    ].map((s, i) => (
                        <div className="s-row" key={i}>
                            <div>
                                <div className="s-row-label">{s.label}</div>
                                <div className="s-row-sub">{s.sub}</div>
                            </div>
                            {s.type === 'toggle' ? (
                                <label className="toggle">
                                    <input type="checkbox" defaultChecked={s.val} />
                                    <span className="toggle-slider" />
                                </label>
                            ) : (
                                <select className="s-select">
                                    {s.opts.map(o => <option key={o}>{o}</option>)}
                                </select>
                            )}
                        </div>
                    ))}
                </div>

                {/* Danger */}
                <div className="s-card danger">
                    <div className="s-card-title" style={{ color: 'var(--danger)' }}>Danger Zone</div>
                    {[
                        { label: 'Reset App Data', sub: 'Restore demo files & clear trash', action: reset, btn: '🔄 Reset' },
                        { label: 'Clear All Files', sub: 'Permanently remove all files', action: () => { }, btn: '🗑️ Clear All' },
                    ].map((s, i) => (
                        <div className="s-row" key={i}>
                            <div>
                                <div className="s-row-label">{s.label}</div>
                                <div className="s-row-sub">{s.sub}</div>
                            </div>
                            <button className="btn btn-danger-soft btn-sm" onClick={s.action}>{s.btn}</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════
// HELP PAGE
// ═══════════════════════════════════════════════
function HelpPage() {
    const faqs = [
        { q: 'How does the Organize All feature work?', a: 'It mimics an OS shell script using rename() syscalls. Files are moved from a flat directory into categorized subdirectories based on their file extension. The syscall terminal at the bottom shows every operation in real time.' },
        { q: 'What is the iNode Table?', a: 'In Unix/Linux filesystems, every file has an iNode — a kernel data structure storing metadata: permissions, owner UID, size, block pointers, and timestamps. The filename is just a directory entry pointing to an iNode number. Our iNode Table page visualizes this.' },
        { q: 'How does file deletion actually work?', a: 'Clicking delete calls unlink(), which removes the directory entry. The iNode and data blocks are freed only when no hard links remain. Here, deleted files move to Trash (a .trash folder concept), and emptyTrash() permanently unlinks them.' },
        { q: 'How does file preview work?', a: 'Uploaded files are held in memory as File blobs. We use URL.createObjectURL() to generate a temporary URL for images/video/audio. Text files use FileReader API. Demo files cannot preview since they have no blob.' },
        { q: 'What are the OS concepts demonstrated?', a: 'File System Tree, iNode Table, open()/read()/write()/close() syscalls, rename() for moves, unlink() for delete, mkdir() for organize, journal/history for undo rollback, directory entries, file metadata.' },
        { q: 'Can I undo the organization?', a: 'Yes — the Undo button replays the journal in reverse, calling rename() to move each file back to the root directory. This is similar to how journaling filesystems (ext4, APFS) rollback changes.' },
    ];

    const shortcuts = [
        { key: 'Upload File', action: '📎 Upload button or drag & drop' },
        { key: 'Organize All', action: '✨ Organize / Organize All button' },
        { key: 'Undo Organize', action: '↩️ Undo button (after organizing)' },
        { key: 'Preview File', action: 'Click on file name or icon' },
        { key: 'Favorite', action: '⭐ Star icon next to file' },
        { key: 'Delete → Trash', action: '🗑️ Trash icon — check Trash tab' },
        { key: 'Restore File', action: 'Trash tab → ↩️ Restore button' },
        { key: 'Empty Trash', action: 'Trash tab → 🗑️ Empty Trash' },
        { key: 'View iNodes', action: 'iNode Table in sidebar' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Help & Documentation</div>
                    <div className="page-sub">FileOrganizer — OS concepts visualized</div>
                </div>
            </div>

            <div className="upload-banner">
                <div>
                    <h2>🖥️ OS Concepts Demonstrated</h2>
                    <p>iNode Table · open() / read() / write() / close() · rename() · unlink() · mkdir() · Journal Rollback · Permissions · File Metadata · Virtual Filesystem</p>
                </div>
            </div>

            <div className="settings-grid">
                <div className="s-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="s-card-title">FAQ</div>
                    {faqs.map((f, i) => (
                        <div className="faq-item" key={i}>
                            <div className="faq-q">Q: {f.q}</div>
                            <div className="faq-a">{f.a}</div>
                        </div>
                    ))}
                </div>

                <div className="s-card">
                    <div className="s-card-title">Quick Actions</div>
                    {shortcuts.map((s, i) => (
                        <div className="s-row" key={i}>
                            <div className="s-row-label">{s.key}</div>
                            <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', textAlign: 'right' }}>{s.action}</div>
                        </div>
                    ))}
                </div>

                <div className="s-card">
                    <div className="s-card-title">Category Rules (Extension Mapping)</div>
                    {[
                        ['📄 Documents', 'pdf, doc, docx, txt, xlsx, pptx'],
                        ['🖼️ Images', 'jpg, png, gif, svg, webp, bmp'],
                        ['🎬 Videos', 'mp4, mkv, mov, avi, webm'],
                        ['🎵 Music', 'mp3, wav, flac, aac, ogg'],
                        ['📦 Archives', 'zip, rar, 7z, tar, gz'],
                        ['💻 Code', 'js, jsx, ts, py, c, cpp, html, css, json'],
                        ['📁 Others', 'Everything else'],
                    ].map(([cat, exts], i) => (
                        <div className="s-row" key={i} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                            <div className="s-row-label">{cat}</div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono,monospace' }}>{exts}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════
export default function Dashboard() {
    const {
        files, organizedFiles, isOrganized, isAnimating, currentFileIndex, currentView,
        getCategoryCounts, organize, undo, reset, deleteFile, uploadFile, toggleFavorite,
        trash, restoreFile, emptyTrash,
        notifications, markAllRead, clearNotif,
    } = useFileSystem();

    const fileInputRef = useRef(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // ── Drag & Drop ───────────────────────────────────────────────
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    }, [isDragging]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) uploadFile(e.dataTransfer.files);
    }, [uploadFile]);

    // ── Context Menu ──────────────────────────────────────────────
    const [contextMenu, setContextMenu] = useState(null);

    useEffect(() => {
        const hideContextMenu = () => setContextMenu(null);
        document.addEventListener('click', hideContextMenu);
        return () => document.removeEventListener('click', hideContextMenu);
    }, []);

    const handleContextMenu = (e, file, cat = null) => {
        e.preventDefault();
        setContextMenu({ x: e.pageX, y: e.pageY, file, cat });
    };

    const counts = getCategoryCounts();
    const totalFiles = Object.values(counts).reduce((a, b) => a + b, 0);

    const handleFileSelect = (e) => {
        if (e.target.files?.length) uploadFile(e.target.files);
        e.target.value = '';
    };

    const requestSort = (key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };
    const arrow = (key) => sortConfig.key === key ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : '';

    // Derived list
    let displayedFiles = currentView === 'Favorites' ? files.filter(f => f.isFavorite) : files;
    if (searchQuery) displayedFiles = displayedFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortConfig.key) {
        displayedFiles = [...displayedFiles].sort((a, b) => {
            let av = a[sortConfig.key], bv = b[sortConfig.key];
            if (sortConfig.key === 'size') { av = parseBytes(av); bv = parseBytes(bv); }
            if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
            if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Download helper
    const handleDownload = (file) => {
        if (!file.originalFile) { alert('Demo files cannot be downloaded. Upload a real file to download.'); return; }
        const url = URL.createObjectURL(file.originalFile);
        const a = document.createElement('a'); a.href = url; a.download = file.name;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // ── Route special views ───────────────────────────────────────
    if (currentView === 'Analytics') return <div className="main-content"><AnalyticsPage files={files} /></div>;
    if (currentView === 'iNode Table') return <div className="main-content"><InodeTablePage files={files} trash={trash} /></div>;
    if (currentView === 'Trash') return <div className="main-content"><TrashPage trash={trash} restoreFile={restoreFile} emptyTrash={emptyTrash} /></div>;
    if (currentView === 'Notifications') return <div className="main-content"><NotificationsPage notifications={notifications} markAllRead={markAllRead} clearNotif={clearNotif} /></div>;
    if (currentView === 'Settings') return <div className="main-content"><SettingsPage reset={reset} /></div>;
    if (currentView === 'Help') return <div className="main-content"><HelpPage /></div>;

    // ── Dashboard / All Files / Favorites ─────────────────────────
    return (
        <div
            className={`main-content ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragging && (
                <div className="drag-overlay">
                    <div className="drag-overlay-icon">📥</div>
                    <h2>Drop files here to upload</h2>
                </div>
            )}
            <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />

            {/* Dashboard only */}
            {currentView === 'Dashboard' && (
                <>
                    <div className="upload-banner">
                        <div>
                            <h2>Organize your files instantly ✨</h2>
                            <p>Upload files and auto-sort by category in one click — watch the syscall terminal log every OS operation.</p>
                        </div>
                        <div className="upload-banner-actions">
                            <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()} disabled={isAnimating}>📎 Upload</button>
                            <button className="btn btn-primary" onClick={organize} disabled={isAnimating || isOrganized || files.length === 0}>✨ Organize All</button>
                        </div>
                    </div>

                    <div className="stats-row">
                        {[
                            { icon: '📁', value: files.length, label: 'Total Files' },
                            { icon: '⭐', value: files.filter(f => f.isFavorite).length, label: 'Favorites' },
                            { icon: '🗑️', value: trash.length, label: 'In Trash' },
                            { icon: '📂', value: Object.keys(categories).filter(k => counts[k] > 0).length, label: 'Categories' },
                        ].map((s, i) => (
                            <div className="stat-card" key={i}>
                                <div className="stat-card-icon">{s.icon}</div>
                                <div className="stat-card-value">{s.value}</div>
                                <div className="stat-card-label">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <h3 className="section-title">Explore by Format</h3>
                    <div className="category-grid">
                        {Object.entries(categories).map(([key, cat]) => (
                            <div key={key} className={`cat-card ${counts[key] > 0 ? 'active' : ''}`}>
                                <div className={`cat-card-icon ${key}`}>{cat.icon}</div>
                                <div className="cat-card-info">
                                    <h4>{cat.name}</h4>
                                    <p>{counts[key]} files</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* File table card */}
            <div className="file-table-card" style={{ marginTop: currentView === 'Dashboard' ? 0 : 24 }}>
                <div className="file-table-header">
                    <h3>
                        {currentView === 'Favorites' ? '⭐ Favorites'
                            : isOrganized ? '📂 Organized Files'
                                : currentView === 'Dashboard' ? '📁 All Files'
                                    : '📁 All Files'}
                    </h3>
                    <div className="file-table-actions">
                        {(!isOrganized || currentView === 'Favorites') && (
                            <input type="text" placeholder="🔍 Search files..." className="search-input"
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        )}
                        {currentView !== 'Favorites' && (
                            <button className="btn btn-outline btn-sm" onClick={() => fileInputRef.current?.click()} disabled={isAnimating}>📎 Upload</button>
                        )}
                        {!isOrganized && currentView !== 'Favorites' && (
                            <button className="btn btn-primary btn-sm" onClick={organize} disabled={isAnimating || files.length === 0}>✨ Organize</button>
                        )}
                        {isOrganized && currentView !== 'Favorites' && (
                            <button className="btn btn-warning btn-sm" onClick={undo} disabled={isAnimating}>↩️ Undo</button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={reset} disabled={isAnimating}>🔄 Reset</button>
                    </div>
                </div>

                {/* Progress */}
                {isAnimating && (
                    <div className="progress-wrap">
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${((currentFileIndex + 1) / totalFiles) * 100}%` }} />
                        </div>
                    </div>
                )}

                {/* Organized view */}
                {isOrganized && currentView !== 'Favorites' ? (
                    <div className="organized-inner">
                        {Object.entries(organizedFiles).map(([cat, catFiles]) =>
                            catFiles.length > 0 && (
                                <div key={cat} className="organized-section">
                                    <div className="organized-section-header">
                                        <span>{categories[cat].icon}</span>
                                        <span style={{ color: categories[cat].color, fontWeight: 600 }}>{categories[cat].name}/</span>
                                        <span className="org-count">{catFiles.length}</span>
                                    </div>
                                    {catFiles.map(file => (
                                        <div key={file.id} className="organized-file-row" onContextMenu={(e) => handleContextMenu(e, file, cat)}>
                                            <span className="org-file-icon" onClick={() => setPreviewFile(file)}>{getFileIcon(file.extension)}</span>
                                            <span className="org-file-name" onClick={() => setPreviewFile(file)}>{file.name}</span>
                                            <span className="org-file-size">{file.size}</span>
                                            <div className="org-file-actions">
                                                <button className={`icon-btn ${file.isFavorite ? 'active' : ''}`} onClick={() => toggleFavorite(file.id)} title="Favorite">
                                                    {file.isFavorite ? '⭐' : '☆'}
                                                </button>
                                                <button className="icon-btn" onClick={() => handleDownload(file)} title="Download">⬇️</button>
                                                <button className="icon-btn" onClick={() => deleteFile(file.id, true, cat)} title="Delete">🗑️</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                        {Object.values(organizedFiles).flat().length === 0 && (
                            <div className="empty-state"><div className="empty-state-icon">📂</div><div className="empty-state-text">No organized files.</div></div>
                        )}
                    </div>
                ) : (
                    /* Table view */
                    <table className="file-table">
                        <thead>
                            <tr>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('name')}>Name{arrow('name')}</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('size')}>Size{arrow('size')}</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('modified')}>Modified{arrow('modified')}</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('category')}>Category{arrow('category')}</th>
                                <th>Shared By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedFiles.map((file, idx) => (
                                <tr key={file.id}
                                    onContextMenu={(e) => handleContextMenu(e, file, null)}
                                    style={currentFileIndex >= 0 && idx <= currentFileIndex ? { opacity: .28, transition: 'all .2s' } : {}}>
                                    <td>
                                        <div className="file-name-cell" onClick={() => setPreviewFile(file)}>
                                            <div className="file-icon-big">{getFileIcon(file.extension)}</div>
                                            <span className="file-filename">{file.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{file.size}</td>
                                    <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{file.modified}</td>
                                    <td><span className={`badge badge-${file.category}`}>{categories[file.category]?.name}</span></td>
                                    <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{file.shared}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                            <button className={`icon-btn ${file.isFavorite ? 'active' : ''}`}
                                                style={{ opacity: file.isFavorite ? 1 : .4, fontSize: '1rem' }}
                                                onClick={() => toggleFavorite(file.id)} title={file.isFavorite ? 'Unfavorite' : 'Favorite'}>
                                                {file.isFavorite ? '⭐' : '☆'}
                                            </button>
                                            <button className="icon-btn active" onClick={() => handleDownload(file)} title="Download">⬇️</button>
                                            <button className="icon-btn active" onClick={() => deleteFile(file.id, false, null)} title="Delete">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {displayedFiles.length === 0 && (
                                <tr>
                                    <td colSpan="6">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">
                                                {currentView === 'Favorites' ? '⭐' : '📁'}
                                            </div>
                                            <div className="empty-state-text">
                                                {currentView === 'Favorites'
                                                    ? 'No favorites yet. Star a file to see it here.'
                                                    : searchQuery
                                                        ? `No files matching "${searchQuery}"`
                                                        : 'No files. Upload some files to get started.'}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Preview Modal */}
            {previewFile && (
                <PreviewModal
                    file={previewFile}
                    onClose={() => setPreviewFile(null)}
                    onToggleFav={(id) => { toggleFavorite(id); setPreviewFile(f => ({ ...f, isFavorite: !f.isFavorite })); }}
                    onDelete={deleteFile}
                    isOrganized={isOrganized}
                />
            )}

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="cm-header">
                        <span className="cm-icon">{getFileIcon(contextMenu.file.extension)}</span>
                        <div className="cm-title">
                            <div className="cm-name">{contextMenu.file.name}</div>
                            <div className="cm-size">{contextMenu.file.size}</div>
                        </div>
                    </div>
                    <div className="cm-divider" />
                    <button className="cm-item" onClick={() => { setPreviewFile(contextMenu.file); setContextMenu(null); }}>
                        <span>👁️</span> Preview
                    </button>
                    <button className="cm-item" onClick={() => { toggleFavorite(contextMenu.file.id); setContextMenu(null); }}>
                        <span>{contextMenu.file.isFavorite ? '☆' : '⭐'}</span>
                        {contextMenu.file.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                    </button>
                    <button className="cm-item" onClick={() => { handleDownload(contextMenu.file); setContextMenu(null); }}>
                        <span>⬇️</span> Download
                    </button>
                    <div className="cm-divider" />
                    <button className="cm-item danger" onClick={() => { deleteFile(contextMenu.file.id, isOrganized, contextMenu.cat); setContextMenu(null); }}>
                        <span>🗑️</span> Move to Trash
                    </button>
                </div>
            )}
        </div>
    );
}
