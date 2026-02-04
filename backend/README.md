# File Organizer - C Backend

## OS Project 2026 - Team Alpha

A file organization tool demonstrating core Operating System concepts.

## OS Concepts Demonstrated

| Concept | System Call | Description |
|---------|-------------|-------------|
| Directory Traversal | `opendir()`, `readdir()`, `closedir()` | Open and read directory entries |
| File Metadata | `stat()` | Read inode information (size, permissions, timestamps) |
| Atomic File Move | `rename()` | Move files atomically (all-or-nothing) |
| Journaling | File I/O | Transaction logging for undo capability |
| Permissions | `mode_t`, `mkdir()` | Unix file permissions (rwxrwxrwx) |

## Build & Run

```bash
# Build
make

# Run
./file_organizer

# Or with directory
./file_organizer ~/Downloads
```

## Features

1. **Preview** - Scan and categorize files
2. **Organize** - Move files to category folders
3. **Undo** - Reverse last organization
4. **Metadata** - View detailed file information
5. **Journal** - View operation history

## File Categories

- Documents: pdf, doc, docx, txt, xls, ppt
- Images: jpg, png, gif, svg, webp
- Videos: mp4, mkv, avi, mov
- Music: mp3, wav, flac, aac
- Archives: zip, rar, 7z, tar
- Code: c, py, js, java, cpp
- Others: Everything else
