import { createContext, useContext, useState, useCallback } from 'react';
import { sampleFiles, categories } from '../data/sampleFiles';

const FileSystemContext = createContext(null);

export function FileSystemProvider({ children }) {
    const [files, setFiles] = useState(sampleFiles);
    const [organizedFiles, setOrganizedFiles] = useState({});
    const [isOrganized, setIsOrganized] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentFileIndex, setCurrentFileIndex] = useState(-1);
    const [terminalLines, setTerminalLines] = useState([
        { type: 'output', text: 'File Organizer v1.0 - OS Project 2026' },
        { type: 'output', text: 'Ready to organize files...' },
    ]);
    const [history, setHistory] = useState([]);

    const addTerminalLine = useCallback((type, text) => {
        setTerminalLines(prev => [...prev, { type, text }]);
    }, []);

    const preview = useCallback(() => {
        addTerminalLine('prompt', '$ ./file_organizer preview');
        addTerminalLine('output', `Scanning directory...`);
        addTerminalLine('output', `Found ${files.length} files`);

        const counts = {};
        files.forEach(f => {
            counts[f.category] = (counts[f.category] || 0) + 1;
        });

        Object.entries(counts).forEach(([cat, count]) => {
            addTerminalLine('output', `  ${categories[cat].name}: ${count} files`);
        });

        addTerminalLine('success', '✅ Preview complete');
    }, [files, addTerminalLine]);

    const organize = useCallback(async () => {
        if (isAnimating || isOrganized) return;

        setIsAnimating(true);
        addTerminalLine('prompt', '$ ./file_organizer organize');
        addTerminalLine('output', 'Creating category directories...');

        // Save to history for undo
        setHistory(prev => [...prev, { files: [...files], organized: { ...organizedFiles } }]);

        const organized = {};
        Object.keys(categories).forEach(cat => {
            organized[cat] = [];
        });

        // Animate files one by one
        for (let i = 0; i < files.length; i++) {
            setCurrentFileIndex(i);
            const file = files[i];
            organized[file.category].push(file);
            setOrganizedFiles({ ...organized });

            addTerminalLine('output', `  Moving ${file.name} → ${categories[file.category].name}/`);

            await new Promise(resolve => setTimeout(resolve, 200));
        }

        setCurrentFileIndex(-1);
        setFiles([]);
        setOrganizedFiles(organized);
        setIsOrganized(true);
        setIsAnimating(false);

        addTerminalLine('success', `✅ Organized ${sampleFiles.length} files`);
        addTerminalLine('output', 'OS Concept: rename() provides atomic file move');
    }, [files, organizedFiles, isAnimating, isOrganized, addTerminalLine]);

    const undo = useCallback(async () => {
        if (isAnimating || !isOrganized || history.length === 0) return;

        setIsAnimating(true);
        addTerminalLine('prompt', '$ ./file_organizer undo');
        addTerminalLine('output', 'Reversing operations from journal...');

        const lastState = history[history.length - 1];

        // Animate undo
        const allFiles = Object.values(organizedFiles).flat();
        for (let i = allFiles.length - 1; i >= 0; i--) {
            setCurrentFileIndex(i);
            addTerminalLine('output', `  Restoring ${allFiles[i].name}`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        setFiles(lastState.files);
        setOrganizedFiles({});
        setIsOrganized(false);
        setHistory(prev => prev.slice(0, -1));
        setCurrentFileIndex(-1);
        setIsAnimating(false);

        addTerminalLine('success', '✅ Undo complete');
        addTerminalLine('output', 'OS Concept: Journal replay enables recovery');
    }, [isAnimating, isOrganized, history, organizedFiles, addTerminalLine]);

    const reset = useCallback(() => {
        setFiles(sampleFiles);
        setOrganizedFiles({});
        setIsOrganized(false);
        setHistory([]);
        setCurrentFileIndex(-1);
        setTerminalLines([
            { type: 'output', text: 'File Organizer v1.0 - OS Project 2026' },
            { type: 'output', text: 'Reset complete. Ready to organize files...' },
        ]);
    }, []);

    const getCategoryCounts = useCallback(() => {
        const counts = {};
        Object.keys(categories).forEach(cat => {
            counts[cat] = isOrganized
                ? (organizedFiles[cat]?.length || 0)
                : files.filter(f => f.category === cat).length;
        });
        return counts;
    }, [files, organizedFiles, isOrganized]);

    return (
        <FileSystemContext.Provider value={{
            files,
            organizedFiles,
            isOrganized,
            isAnimating,
            currentFileIndex,
            terminalLines,
            preview,
            organize,
            undo,
            reset,
            getCategoryCounts,
            categories,
        }}>
            {children}
        </FileSystemContext.Provider>
    );
}

export const useFileSystem = () => {
    const context = useContext(FileSystemContext);
    if (!context) {
        throw new Error('useFileSystem must be used within FileSystemProvider');
    }
    return context;
};
