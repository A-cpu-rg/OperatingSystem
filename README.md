# File Organizer - OS Project 2026

## Team Alpha

A file organization tool demonstrating **Operating System concepts** through a C backend and React visualization.

---

## 📐 Architecture

```
Real Execution:     User → Terminal → C Program → OS Kernel → File System
Visualization:      User → Browser → React App → Animated Simulation
```

**Key Point**: Only the C program touches real files. React provides visualization only.

---

## 🔧 Quick Start

### C Backend (Terminal Demo)
```bash
cd backend
make
./file_organizer
```

### React Frontend (Visualization)
```bash
cd frontend
npm run dev
# Open http://localhost:5173
```

### Testing (Shell Script)
```bash
# Run the automated test script
chmod +x test.sh
./test.sh
```

### Debugging with GDB
```bash
cd backend
make debug
gdb ./file_organizer
# Example: break main, run, step
```

---

## 🎯 OS Concepts Demonstrated

| Concept | System Call | Purpose |
|---------|-------------|---------|
| Directory Traversal | `opendir()`, `readdir()` | Scan directory entries |
| File Metadata | `stat()` | Get size, permissions, timestamps |
| Atomic Move | `rename()` | Move files safely (all-or-nothing) |
| Directory Creation | `mkdir()` | Create category folders |
| Journaling | File I/O | Enable undo via transaction log |

---

## 📁 Project Structure

```
os_project/
├── backend/           # C Backend (Real OS Operations)
│   ├── src/
│   │   ├── main.c         # Entry point
│   │   ├── scanner.c/h    # Directory traversal
│   │   ├── metadata.c/h   # stat() operations
│   │   ├── organizer.c/h  # File organization
│   │   ├── journal.c/h    # Undo system
│   │   └── utils.c/h      # Utilities
│   └── Makefile
│
├── frontend/          # React Visualization
│   └── src/
│       ├── App.jsx
│       ├── components/
│       └── context/
│
└── test_files/        # Sample files for demo
```

---

## 🎬 Demo Flow

1. **Terminal Demo First**
   - Run `./file_organizer`
   - Preview → Organize → Undo
   - Show OS concepts in action

2. **Website Demo Second**
   - Open React app
   - Click Preview → Organize → Undo
   - Show animated visualization

---

## 👥 Team

- **Project**: File Organizer App
- **Team**: Alpha

