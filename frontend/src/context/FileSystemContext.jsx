import { createContext, useContext, useState, useCallback } from 'react';
import { categories, generateId, getCategory } from '../data/sampleFiles';

const FileSystemContext = createContext(null);

// ─── Size parser ─────────────────────────────────────────────────
export const parseBytes = (val = '') => {
    const n = parseFloat(val);
    if (val.includes('GB')) return n * 1024 ** 3;
    if (val.includes('MB')) return n * 1024 ** 2;
    if (val.includes('KB')) return n * 1024;
    return n;
};

export const fmtBytes = (b) => {
    if (b >= 1024 ** 3) return (b / 1024 ** 3).toFixed(1) + ' GB';
    if (b >= 1024 ** 2) return (b / 1024 ** 2).toFixed(1) + ' MB';
    if (b >= 1024) return (b / 1024).toFixed(1) + ' KB';
    return b + ' B';
};

// ─── Provider ─────────────────────────────────────────────────────
export function FileSystemProvider({ children }) {
    // ✅ Start with EMPTY — only real uploaded files will appear
    const [files, setFiles] = useState([]);
    const [organizedFiles, setOrganizedFiles] = useState({});
    const [isOrganized, setIsOrganized] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentFileIndex, setCurrentFileIndex] = useState(-1);
    const [currentView, setCurrentView] = useState('Dashboard');
    const [history, setHistory] = useState([]);
    const [trash, setTrash] = useState([]);
    const [syscallLogs, setSyscallLogs] = useState([
        { id: 'init1', time: '--:--:--', call: 'mount("/dev/sda1", "/home/user", "ext4", 0, NULL)', result: '0', type: 'ok' },
        { id: 'init2', time: '--:--:--', call: 'opendir("/home/user/files")', result: '0', type: 'ok' },
        { id: 'init3', time: '--:--:--', call: 'readdir() → 0 entries found (empty directory)', result: '0', type: 'ok' },
    ]);
    const [notifications, setNotifications] = useState([
        { id: generateId(), type: 'info', unread: true, title: 'Welcome to FileOrganizer!', desc: 'Upload files from your system to get started. Click "Upload" to select files.', time: 'Just now' },
    ]);
    const [toasts, setToasts] = useState([]); // ✅ Real-time floating toasts
    const MAX_STORAGE = 15 * (1024 ** 3); // 15 GB (demo limit)

    // ── syscall logger ───────────────────────────────────────────────
    const syslog = useCallback((call, result = '0', type = 'ok') => {
        const t = new Date().toLocaleTimeString('en-US', { hour12: false });
        setSyscallLogs(prev => [{ id: generateId(), time: t, call, result, type }, ...prev].slice(0, 120));
    }, []);

    // ── addNotification & Toast ──────────────────────────────────────
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addNotification = useCallback((type, title, desc) => {
        const id = generateId();
        setNotifications(prev => [
            { id, type, title, desc, time: 'Just now', unread: true },
            ...prev,
        ].slice(0, 25));

        // Spawn toast
        const toastId = generateId();
        setToasts(prev => [...prev, { id: toastId, type, title, desc }]);
        setTimeout(() => removeToast(toastId), 4000); // Auto-dismiss after 4s
    }, [removeToast]);

    // ── organize ─────────────────────────────────────────────────────
    const organize = useCallback(async () => {
        if (isAnimating || isOrganized || files.length === 0) return;
        setIsAnimating(true);
        setHistory(prev => [...prev, { files: [...files] }]);

        syslog(`opendir("/home/user/downloads")`, '0');
        syslog(`readdir() → ${files.length} entries`, '0');

        const organized = {};
        Object.keys(categories).forEach(cat => { organized[cat] = []; });

        for (let i = 0; i < files.length; i++) {
            setCurrentFileIndex(i);
            const f = files[i];
            organized[f.category] = [...(organized[f.category] || []), f];
            setOrganizedFiles({ ...organized });
            syslog(`rename("${f.name}", "${f.category}/${f.name}")`, '0');
            await new Promise(r => setTimeout(r, 100));
        }

        setCurrentFileIndex(-1);
        setOrganizedFiles(organized);
        setIsOrganized(true);
        setIsAnimating(false);
        syslog(`closedir()`, '0');
        addNotification('success', 'Files Organized!', `${files.length} files sorted into ${Object.keys(categories).length} categories.`);
    }, [files, isAnimating, isOrganized, syslog, addNotification]);

    // ── undo ─────────────────────────────────────────────────────────
    const undo = useCallback(async () => {
        if (isAnimating || !isOrganized) return;
        setIsAnimating(true);
        syslog('journal_replay() → rolling back rename() operations', '0');

        const all = Object.values(organizedFiles).flat();
        for (let i = all.length - 1; i >= 0; i--) {
            setCurrentFileIndex(i);
            syslog(`rename("${all[i].category}/${all[i].name}", "${all[i].name}")`, '0');
            await new Promise(r => setTimeout(r, 50));
        }

        setOrganizedFiles({});
        setIsOrganized(false);
        setHistory(prev => prev.slice(0, -1));
        setCurrentFileIndex(-1);
        setIsAnimating(false);
        syslog('undo complete — filesystem restored', '0');
    }, [isAnimating, isOrganized, organizedFiles, syslog]);

    // ── delete → trash ────────────────────────────────────────────────
    const deleteFile = useCallback((fileId, fromOrganized = false, category = null) => {
        if (isAnimating) return;
        const target = files.find(f => f.id === fileId);
        if (target) {
            syslog(`unlink("/home/user/${target.name}")`, '0');
            setTrash(prev => [{ ...target, deletedAt: new Date().toLocaleString() }, ...prev]);
        }
        if (fromOrganized && category) {
            setOrganizedFiles(prev => ({ ...prev, [category]: prev[category].filter(f => f.id !== fileId) }));
        }
        setFiles(prev => prev.filter(f => f.id !== fileId));
    }, [isAnimating, files, syslog]);

    // ── restore from trash ────────────────────────────────────────────
    const restoreFile = useCallback((fileId) => {
        const target = trash.find(f => f.id === fileId);
        if (!target) return;
        const { deletedAt, ...restored } = target;
        syslog(`link("${restored.name}") → restoring inode #${restored.inode}`, '0');
        setFiles(prev => [restored, ...prev]);
        setTrash(prev => prev.filter(f => f.id !== fileId));
        if (isOrganized) {
            setOrganizedFiles(prev => {
                const next = { ...prev };
                if (!next[restored.category]) next[restored.category] = [];
                next[restored.category] = [restored, ...next[restored.category]];
                return next;
            });
        }
    }, [trash, isOrganized, syslog]);

    const emptyTrash = useCallback(() => {
        trash.forEach(f => syslog(`unlink_permanent("${f.name}")`, '0'));
        setTrash([]);
        addNotification('warning', 'Trash Emptied', `${trash.length} files permanently deleted.`);
    }, [trash, syslog, addNotification]);

    // ── toggle favorite ───────────────────────────────────────────────
    const toggleFavorite = useCallback((fileId) => {
        const f = files.find(x => x.id === fileId);
        if (f) syslog(`setxattr("${f.name}", "user.favorite", "${!f.isFavorite}")`, '0');
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, isFavorite: !f.isFavorite } : f));
        setOrganizedFiles(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(cat => {
                next[cat] = next[cat].map(f => f.id === fileId ? { ...f, isFavorite: !f.isFavorite } : f);
            });
            return next;
        });
    }, [files, syslog]);

    // ── upload (with duplicate detection) ─────────────────────────────
    const uploadFile = useCallback((fileList) => {
        if (isAnimating) return;
        const arr = Array.from(fileList);

        // ✅ Duplicate detection — skip files with same name + same size
        const duplicates = [];
        const uniqueFiles = arr.filter(fileObj => {
            const isDuplicate = files.some(
                existing => existing.name === fileObj.name && parseBytes(existing.size) === fileObj.size
            );
            if (isDuplicate) duplicates.push(fileObj.name);
            return !isDuplicate;
        });

        if (duplicates.length > 0) {
            syslog(`EEXIST — duplicate(s) skipped: ${duplicates.join(', ')}`, '-1', 'warn');
            addNotification('warning', `${duplicates.length} duplicate(s) skipped`,
                `Already exists: ${duplicates.join(', ').slice(0, 100)}`);
        }

        if (uniqueFiles.length === 0) return;

        // ✅ Quota enforcement — block upload if it exceeds MAX_STORAGE
        const incomingBytes = uniqueFiles.reduce((acc, f) => acc + f.size, 0);
        if (totalUsedBytes + incomingBytes > MAX_STORAGE) {
            syslog(`ENOSPC — upload failed: quota exceeded`, '-1', 'error');
            addNotification('danger', `Upload Failed: Storage Full`,
                `You have exceeded the 15.0 GB storage limit. Please delete some files first.`);
            return;
        }

        const newFiles = uniqueFiles.map(fileObj => {
            const ext = fileObj.name.split('.').pop()?.toLowerCase() || 'dat';
            const cat = getCategory(fileObj.name);
            const ino = Math.floor(1000 + Math.random() * 8000);
            syslog(`open("${fileObj.name}", O_RDONLY | O_CREAT, 0644)`, '3');
            syslog(`write(3, buf, ${fileObj.size}) → inode #${ino}`, fileObj.size.toString());
            syslog(`close(3)`, '0');
            return {
                id: generateId(), name: fileObj.name, extension: ext,
                size: fmtBytes(fileObj.size), category: cat,
                modified: new Date(fileObj.lastModified).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                shared: 'Only Me', isFavorite: false, originalFile: fileObj, inode: ino,
            };
        });
        setFiles(prev => [...newFiles, ...prev]);
        if (isOrganized) {
            setOrganizedFiles(prev => {
                const next = { ...prev };
                newFiles.forEach(f => {
                    if (!next[f.category]) next[f.category] = [];
                    next[f.category] = [f, ...next[f.category]];
                });
                return next;
            });
        }
        addNotification('info', `${newFiles.length} file(s) uploaded`, newFiles.map(f => f.name).join(', ').slice(0, 80));
    }, [isAnimating, isOrganized, files, syslog, addNotification]);

    // ── reset (clears everything) ─────────────────────────────────────
    const reset = useCallback(() => {
        setFiles([]);
        setOrganizedFiles({});
        setIsOrganized(false);
        setHistory([]);
        setCurrentFileIndex(-1);
        setTrash([]);
        syslog('rm -rf /home/user/files/* → filesystem cleared', '0');
        addNotification('info', 'App Reset', 'All files cleared. Upload new files to get started.');
    }, [syslog, addNotification]);

    // ── category counts ───────────────────────────────────────────────
    const getCategoryCounts = useCallback(() => {
        const counts = {};
        Object.keys(categories).forEach(cat => {
            counts[cat] = isOrganized
                ? (organizedFiles[cat]?.length || 0)
                : files.filter(f => f.category === cat).length;
        });
        return counts;
    }, [files, organizedFiles, isOrganized]);

    // ── notifications & toasts helpers ────────────────────────────────
    const markAllRead = useCallback(() => setNotifications(prev => prev.map(n => ({ ...n, unread: false }))), []);
    const clearNotif = useCallback((id) => setNotifications(prev => prev.filter(n => n.id !== id)), []);
    const unreadCount = notifications.filter(n => n.unread).length;

    const totalUsedBytes = files.reduce((acc, f) => acc + parseBytes(f.size), 0);
    const storagePercent = Math.min(100, (totalUsedBytes / MAX_STORAGE) * 100);

    return (
        <FileSystemContext.Provider value={{
            files, organizedFiles, isOrganized, isAnimating, currentFileIndex,
            currentView, setCurrentView,
            organize, undo, reset,
            deleteFile, uploadFile,
            toggleFavorite, getCategoryCounts,
            trash, restoreFile, emptyTrash,
            syscallLogs,
            notifications, markAllRead, clearNotif, unreadCount, addNotification,
            toasts, removeToast, totalUsedBytes, MAX_STORAGE, storagePercent,
            categories,
        }}>
            {children}
        </FileSystemContext.Provider>
    );
}

export const useFileSystem = () => {
    const ctx = useContext(FileSystemContext);
    if (!ctx) throw new Error('useFileSystem must be used within FileSystemProvider');
    return ctx;
};
