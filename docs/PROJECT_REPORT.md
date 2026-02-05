# File Organizer Project Report
## Operating System Project - Feb 2026

**Team Name:** Alpha  
**Project Name:** File Organizer App  
**Evaluation Date:** 6th Feb 2026

---

## 1. Introduction
The **File Organizer** is a dual-component application designed to demonstrate core Operating System concepts through a practical tool. It combines a robust **C-based backend** that performs real system operations with a modern **React-based frontend** for visualization.

## 2. Objectives
- To implement real file system operations using POSIX system calls.
- To demonstrate atomic file manipulation using `rename()`.
- To visualize low-level OS activities through a user-friendly interface.
- To implement extraction of file metadata directly from inodes.

## 3. System Architecture

### A. C Backend (The Core)
The backend is written in C and interacts directly with the OS Kernel.
- **Role**: Scans directories, categorizes files, and performs the actual organization.
- **Key System Calls**:
  - `opendir`, `readdir`: For directory traversal.
  - `stat`: For retrieving file metadata (size, permissions, timestamps).
  - `rename`: For atomic file movement.
  - `mkdir`: For creating category directories.

### B. React Frontend (The Visualization)
The frontend is a web-based UI built with React/Vite.
- **Role**: Provides a visual representation of the backend's logic.
- **Features**: 
  - Real-time animation of file sorting.
  - Dashboard with file statistics.
  - Educational panels explaining active OS concepts.

## 4. Key OS Concepts Implemented

### 🔹 Directory Traversal
We use `opendir()` to create a directory stream and `readdir()` to iteratively read entries. This simulates how file explorers works at a low level.

### 🔹 Inode Metadata
Using `stat()`, we access the inode information of each file to determine its type and size without opening the file content, ensuring efficiency.

### 🔹 Atomic Operations
File moves are performed using `rename()`, which is atomic. This guarantees that a file is never lost—it is either at the source or the destination, ensuring data integrity even during crashes, similar to ACID properties in databases.

### 🔹 Journaling (Undo System)
A custom journaling system records every operation before execution. This allows the system to reverse (undo) actions by reading the log, mimicking file system journaling (like in ext4 or NTFS).

## 5. Directory Structure
```
os_project/
├── backend/            # C Source Code (System Calls)
├── frontend/           # React Source Code (UI)
├── test_files/         # Sandbox for testing
├── docs/               # Project Documentation
└── README.md           # Quick Start Guide
```

## 6. Conclusion
This project successfully bridges the gap between low-level system programming and high-level user interface design, effectively demonstrating how Operating Systems manage files and directories under the hood.
