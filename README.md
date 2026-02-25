# 📂 FixYourFiles: File Organizer and System Analytics Web Manager

**Team Alpha - OS Project 2026**
- Abhijeet Kumar Shah (Enrollment No. 230036)
- Karthik Reddy (Enrollment No. 230035)
- Abhishek Meena (Enrollment No. 230137)

---

## 📌 About The Project
File management utilities expose how high-level software interacts with lower-level operating system constructs. This project aims to bring transparency to these operations by demonstrating core Operating System file management concepts through a multi-tier application. 

We developed **FixYourFiles**, a utility that relies on native OS tools and atomic operations, minimizing the chance of data inconsistency. The system comprises:
1. A **C-based backend** for native, atomic file operations.
2. An **NPM-published Node.js wrapper** written in TypeScript (`fixyourfiles`) providing interactive CLI functionality.
3. A **React frontend** simulating a full-featured file manager with file upload, live analytics, and system metadata visualization (iNodes).

---

## 🚀 Getting Started (How to Run)

You can interact with FixYourFiles in three different ways ranging from low-level C executions to a high-level web interface.

### 1. The C Kernel (Native Execution)
To run the raw, compiled C binary that interacts directly with the POSIX underlying filesystem:
```bash
# Navigate to the backend directory
cd backend

# Compile the C program
make

# Run the executable on a target directory
./file_organizer <path_to_target_directory>
```

### 2. The NPM CLI Wrapper (`fixyourfiles`)
To use the interactive TypeScript CLI that wraps our C backend:
```bash
# Navigate to the FixYourFiles npm package directory
cd backend/FixYourFiles

# Install dependencies and build
npm install
npm run build

# Link the package globally so you can use it anywhere
npm link

# Run the CLI tool on any messy directory
fixyourfiles organize <path_to_target_directory>
# OR run the interactive menu
fixyourfiles
```

### 3. The React Frontend Web Manager
To run the visual simulation of the OS behavior via a browser dashboard:
```bash
# Navigate to the frontend directory
cd frontend

# Install the React dependencies
npm install

# Start the development server
npm run dev
# The website will be available at http://localhost:5173
```

---

## 🏗️ System Architecture

The project is split into multiple distinct components that interact to provide utility across a terminal and web interface.

### A. Core C Application
The backend written in C is responsible for true file organization. When executed, it traverses a target directory. Using `readdir()`, the program evaluates the extensions of each file and maps them to predefined folders (e.g., Images, Documents, Code). The files are physically relocated utilizing the `rename()` system call.

Using `rename()` effectively ensures atomicity. During an operation, if the program fails, the file is never left in an incomplete state. A local `.file_organizer_journal` is maintained to log all paths prior to the movement. If an undo action is requested, the journal is parsed backwards, allowing the application to securely restore the file directory to its initial state.

### B. Npm Registry Wrapper
To distribute the utility, the C backend logic was complemented by an NPM TypeScript application that leverages libraries like `commander` and `@inquirer/prompts`. Available commands:
- `preview`: Logs what actions will be taken.
- `organize`: Executes the sorting.
- `watch`: A daemon-like execution continually monitoring a directory.
- `undo` & `history`: Provides logs and reverts past operations.

### C. React Frontend Simulation
The frontend provides a visualization of an OS file manager. Users upload files via the HTML input API, and the frontend replicates OS behavior dynamically:
- **Simulation**: Users uploaded files exist in a flat structure and can click an "Organize All" button to witness files being bucketed dynamically.
- **iNode Table**: Generates a mock iNode table for the uploaded files, demonstrating the relationship between metadata (permissions `rw-r--r--`, simulated IDs, and timestamps) and the filename directory entries.
- **Trash functionality**: Displays how `unlink()` calls isolate file data until fully purged, implementing a restore option modeled around soft deletions.
- **Analytics**: Graphical representations of storage usage parsed continuously using canvas charts to simulate disk partition monitoring tools.

---

## 💻 OS Concepts Demonstrated

| System Call | Demonstrated Use Case |
| :--- | :--- |
| `opendir()` / `readdir()` | Iterating directory entries safely. |
| `mkdir()` | Creating categorized folder structures. |
| `rename()` | Guaranteeing atomic process relocation. |
| `unlink()` | Modeled in the React TRASH view. |

*(A journal-based rollback mechanism also ensures operations can be cleanly reverted, mirroring advanced filesystem capabilities).*

---

## 📚 References
1. W. R. Stevens and S. A. Rago, *Advanced Programming in the UNIX Environment*, 3rd ed. Addison-Wesley Professional, 2013.
2. Node.js Foundation, "Node.js Documentation," [Online]. Available: https://nodejs.org/en/docs/
