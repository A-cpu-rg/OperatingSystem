// ─── ID Generator ───────────────────────────────────────────────
export const generateId = () => Math.random().toString(36).substr(2, 9);

// ─── Categories ──────────────────────────────────────────────────
export const categories = {
    documents: { name: 'Documents', icon: '📄', color: '#3B82F6' },
    images: { name: 'Images', icon: '🖼️', color: '#EC4899' },
    videos: { name: 'Videos', icon: '🎬', color: '#EF4444' },
    music: { name: 'Music', icon: '🎵', color: '#22C55E' },
    archives: { name: 'Archives', icon: '📦', color: '#F97316' },
    code: { name: 'Code', icon: '💻', color: '#06B6D4' },
    others: { name: 'Others', icon: '📁', color: '#6B7280' },
};

// ─── File Icons ───────────────────────────────────────────────────
export const fileIcons = {
    pdf: '📕', doc: '📘', docx: '📘', txt: '📝', xls: '📊', xlsx: '📊',
    ppt: '📙', pptx: '📙', odt: '📝',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🎞️', svg: '🎨', webp: '🖼️', bmp: '🖼️',
    mp4: '🎬', mkv: '🎬', avi: '🎬', mov: '🎬', webm: '🎬',
    mp3: '🎵', wav: '🎵', flac: '🎵', aac: '🎵', ogg: '🎵',
    zip: '📦', rar: '📦', '7z': '📦', tar: '📦', gz: '📦',
    js: '💛', jsx: '⚛️', ts: '🔷', tsx: '⚛️', py: '🐍',
    c: '🔵', cpp: '🔵', java: '☕', html: '🌐', css: '🎨',
    json: '📋', xml: '📋', sh: '🖥️', md: '📝',
    default: '📄',
};

export const getFileIcon = (ext) => fileIcons[ext?.toLowerCase()] || fileIcons.default;

// ─── Category Detector ───────────────────────────────────────────
export const getCategory = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['pdf', 'doc', 'docx', 'txt', 'xlsx', 'pptx', 'odt', 'xls', 'ppt'].includes(ext)) return 'documents';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) return 'images';
    if (['mp4', 'mkv', 'mov', 'avi', 'webm'].includes(ext)) return 'videos';
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) return 'music';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archives';
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'c', 'cpp', 'java', 'html', 'css', 'json', 'xml', 'sh', 'md'].includes(ext)) return 'code';
    return 'others';
};
