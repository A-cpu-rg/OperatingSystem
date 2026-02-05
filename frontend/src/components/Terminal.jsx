import { useEffect, useRef } from 'react';
import { useFileSystem } from '../context/FileSystemContext';

export default function Terminal() {
    const { terminalLines } = useFileSystem();
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [terminalLines]);

    return (
        <div className="terminal">
            <div className="terminal-header">
                <div className="terminal-dots">
                    <div className="terminal-dot red"></div>
                    <div className="terminal-dot yellow"></div>
                    <div className="terminal-dot green"></div>
                </div>
                <span className="terminal-title">file_organizer — Terminal</span>
            </div>
            <div className="terminal-content" ref={contentRef}>
                {terminalLines.map((line, idx) => (
                    <div key={idx} className={`terminal-line terminal-${line.type}`}>
                        {line.type === 'prompt' ? (
                            <>
                                <span className="terminal-prompt">❯ </span>
                                <span className="terminal-command">{line.text.replace('$ ', '')}</span>
                            </>
                        ) : (
                            line.text
                        )}
                    </div>
                ))}
                <div className="terminal-line">
                    <span className="terminal-prompt">❯ </span>
                    <span style={{ opacity: 0.5 }}>_</span>
                </div>
            </div>
        </div>
    );
}
