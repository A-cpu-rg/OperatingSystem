import { useFileSystem, fmtBytes } from '../context/FileSystemContext';

export default function Sidebar() {
    const { currentView, setCurrentView, unreadCount, trash, totalUsedBytes, MAX_STORAGE, storagePercent } = useFileSystem();

    const navItems = [
        { id: 'Dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'All Files', icon: '📁', label: 'All Files' },
        { id: 'Favorites', icon: '⭐', label: 'Favorites' },
        { id: 'Trash', icon: '🗑️', label: 'Trash', badge: trash.length || null, badgeColor: 'var(--danger)' },
        { divider: true },
        { id: 'iNode Table', icon: '🗂️', label: 'iNode Table' },
        { id: 'Analytics', icon: '📈', label: 'Analytics' },
        { id: 'Notifications', icon: '🔔', label: 'Notifications', badge: unreadCount || null, badgeColor: 'var(--accent)' },
        { id: 'Help', icon: '❓', label: 'Help' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">FO</div>
                <span className="sidebar-logo-text">FileOrganizer</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item, i) => {
                    if (item.divider) return <div key={i} className="sidebar-divider" />;
                    return (
                        <button
                            key={item.id}
                            className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
                            onClick={() => setCurrentView(item.id)}
                        >
                            <span className="sidebar-item-icon">{item.icon}</span>
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.badge ? (
                                <span style={{
                                    background: item.badgeColor,
                                    color: 'white', fontSize: '.62rem', fontWeight: 700,
                                    padding: '1px 6px', borderRadius: '99px', lineHeight: '1.6',
                                }}>
                                    {item.badge}
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-storage">
                    <div className="sidebar-storage-header">
                        <span>Storage</span>
                        <span>{storagePercent.toFixed(1)}%</span>
                    </div>
                    <div className="sidebar-storage-track">
                        <div
                            className={`sidebar-storage-fill ${storagePercent > 90 ? 'danger' : storagePercent > 75 ? 'warning' : ''}`}
                            style={{ width: `${storagePercent}%` }}
                        />
                    </div>
                    <div className="sidebar-storage-text">
                        {fmtBytes(totalUsedBytes)} of {fmtBytes(MAX_STORAGE)} used
                    </div>
                </div>

                <div className="sidebar-user" style={{ marginTop: 16 }}>
                    <div className="sidebar-avatar">AM</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">Team : Alpha</div>
                        <div className="sidebar-user-role">OS Project 2026</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
