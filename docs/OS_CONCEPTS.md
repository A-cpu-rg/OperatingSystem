# OS Concepts Documentation

## For Faculty Evaluation

This document explains the Operating System concepts implemented in our File Organizer project.

---

## 1. Directory Traversal

**System Calls**: `opendir()`, `readdir()`, `closedir()`

```c
DIR *dir = opendir(path);     // Open directory stream
struct dirent *entry;
while ((entry = readdir(dir))) {
    // Process each file/directory entry
    printf("Found: %s\n", entry->d_name);
}
closedir(dir);                // Close directory stream
```

**OS Concept**: 
- `opendir()` returns a directory stream (internally uses file descriptor)
- `readdir()` reads directory entries from the stream
- Each entry contains `d_name` (filename) and `d_type` (file type)
- `closedir()` releases the file descriptor

---

## 2. File Metadata with stat()

**System Call**: `stat()`

```c
struct stat file_stat;
stat(filepath, &file_stat);

// Access inode information
file_stat.st_size    // File size in bytes
file_stat.st_mode    // File type and permissions
file_stat.st_mtime   // Last modification time
file_stat.st_uid     // Owner user ID
file_stat.st_ino     // Inode number
```

**OS Concept**:
- `stat()` reads file metadata from the **inode**
- Inodes store: type, permissions, size, timestamps, data block pointers
- Does NOT read file content, only metadata

---

## 3. Atomic File Operations with rename()

**System Call**: `rename()`

```c
rename(source_path, destination_path);
// File is EITHER at source OR destination
// Never in a partial/inconsistent state
```

**OS Concept**:
- `rename()` is **atomic** - it either fully succeeds or fails
- Only updates directory entries (metadata), not file data
- Same principle used in database transactions (ACID)
- Prevents corruption during crashes

---

## 4. Directory Creation

**System Call**: `mkdir()`

```c
mkdir(path, 0755);  // Create directory with permissions
// 0755 = rwxr-xr-x (owner: rwx, group/others: rx)
```

**OS Concept**:
- Creates new directory entry in parent directory
- Allocates new inode for the directory
- Sets permissions (modified by umask)

---

## 5. Journaling (Undo System)

**Concept**: Similar to ext4 filesystem journal

```
Before operation:
1. Log intent to journal file
2. Perform the actual operation
3. Mark as complete in journal

On crash/undo:
- Read journal, find incomplete operations
- Reverse them in order
```

**OS Concept**:
- Write-ahead logging (WAL)
- Enables crash recovery
- Used in ext4, NTFS, databases
- We implement simplified version for undo

---

## 6. File Permissions

**Mode Bits**: `mode_t`

```
-rwxrwxrwx
│└┬┘└┬┘└┬┘
│ │  │  └── Others (bits 0-2)
│ │  └───── Group (bits 3-5)
│ └──────── Owner (bits 6-8)
└────────── File type

Octal: 4=read, 2=write, 1=execute
Example: 0755 = rwxr-xr-x
```

**OS Concept**:
- Unix permission model
- Checked by kernel on every file access
- `S_IRUSR`, `S_IWUSR`, `S_IXUSR` macros

---

## Summary Table

| Feature | System Call | File |
|---------|-------------|------|
| Scan directories | `opendir/readdir` | scanner.c |
| Get file info | `stat()` | metadata.c |
| Move files atomically | `rename()` | organizer.c |
| Create folders | `mkdir()` | organizer.c |
| Undo operations | File I/O | journal.c |
