import { useEffect, useRef } from 'react';
import { useFileSystem } from '../context/FileSystemContext';

export default function Terminal() {
    const { terminalLines } = useFileSystem();
    const bodyRef = useRef(null);

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [terminalLines]);

    return (
        <div className="terminal-card">
            <div className="terminal-bar">
                <div className="terminal-dots">
                    <div className="terminal-dot r" />
                    <div className="terminal-dot y" />
                    <div className="terminal-dot g" />
                </div>
                <span className="terminal-bar-title">file_organizer — OS System Calls</span>
            </div>
            <div className="terminal-body" ref={bodyRef}>
                {terminalLines.map((line, idx) => (
                    <div key={idx}>
                        {line.type === 'prompt' ? (
                            <>
                                <span className="t-prompt">❯ </span>
                                <span className="t-cmd">{line.text.replace('$ ', '')}</span>
                            </>
                        ) : (
                            <span className={
                                line.type === 'success' ? 't-ok' :
                                    line.type === 'error' ? 't-err' : 't-out'
                            }>
                                {line.text}
                            </span>
                        )}
                    </div>
                ))}
                <div>
                    <span className="t-prompt">❯ </span>
                    <span style={{ opacity: 0.4 }}>_</span>
                </div>
            </div>
        </div>
    );
}
