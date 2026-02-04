// Sample files for demonstration
export const sampleFiles = [
    { id: 1, name: 'report_q4_2025.pdf', extension: 'pdf', size: '2.4 MB', category: 'documents' },
    { id: 2, name: 'project_presentation.pptx', extension: 'pptx', size: '5.1 MB', category: 'documents' },
    { id: 3, name: 'budget_analysis.xlsx', extension: 'xlsx', size: '890 KB', category: 'documents' },
    { id: 4, name: 'vacation_photo_001.jpg', extension: 'jpg', size: '3.2 MB', category: 'images' },
    { id: 5, name: 'screenshot_2025.png', extension: 'png', size: '1.1 MB', category: 'images' },
    { id: 6, name: 'logo_design.svg', extension: 'svg', size: '45 KB', category: 'images' },
    { id: 7, name: 'team_meeting.mp4', extension: 'mp4', size: '156 MB', category: 'videos' },
    { id: 8, name: 'tutorial_react.mkv', extension: 'mkv', size: '890 MB', category: 'videos' },
    { id: 9, name: 'podcast_episode_42.mp3', extension: 'mp3', size: '45 MB', category: 'music' },
    { id: 10, name: 'background_music.wav', extension: 'wav', size: '120 MB', category: 'music' },
    { id: 11, name: 'project_backup.zip', extension: 'zip', size: '234 MB', category: 'archives' },
    { id: 12, name: 'old_files.rar', extension: 'rar', size: '567 MB', category: 'archives' },
    { id: 13, name: 'app_component.jsx', extension: 'jsx', size: '12 KB', category: 'code' },
    { id: 14, name: 'server_main.py', extension: 'py', size: '8 KB', category: 'code' },
    { id: 15, name: 'random_file.dat', extension: 'dat', size: '2.3 MB', category: 'others' },
];

export const categories = {
    documents: { name: 'Documents', icon: '📄', color: 'var(--cat-documents)' },
    images: { name: 'Images', icon: '🖼️', color: 'var(--cat-images)' },
    videos: { name: 'Videos', icon: '🎬', color: 'var(--cat-videos)' },
    music: { name: 'Music', icon: '🎵', color: 'var(--cat-music)' },
    archives: { name: 'Archives', icon: '📦', color: 'var(--cat-archives)' },
    code: { name: 'Code', icon: '💻', color: 'var(--cat-code)' },
    others: { name: 'Others', icon: '📁', color: 'var(--cat-others)' },
};

export const fileIcons = {
    pdf: '📕', doc: '📘', docx: '📘', txt: '📝', xls: '📊', xlsx: '📊', ppt: '📙', pptx: '📙',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🎨', webp: '🖼️',
    mp4: '🎬', mkv: '🎬', avi: '🎬', mov: '🎬',
    mp3: '🎵', wav: '🎵', flac: '🎵', aac: '🎵',
    zip: '📦', rar: '📦', '7z': '📦', tar: '📦',
    js: '💛', jsx: '💛', py: '🐍', c: '🔷', cpp: '🔷', java: '☕',
    default: '📄'
};

export const getFileIcon = (extension) => {
    return fileIcons[extension?.toLowerCase()] || fileIcons.default;
};
