<div align="center">

# File Organizer App: Demonstrating Operating System Concepts through Practical Visualization

**Abhishek Meena (Team Alpha)**  
¹Department of Computer Science & Engineering, University Name, Country  
¹abhishek.meena@example.com

</div>

**Abstract**— This paper presents the design and implementation of the "File Organizer App," a dual-component application created to demonstrate core Operating System (OS) concepts. The system bridges the gap between low-level system programming and high-level user interface design. It combines a robust C-based backend that interacts directly with the OS kernel using POSIX system calls, and a modern React-based frontend for real-time visualization. The core objectives include implementing real file system operations, demonstrating atomic file manipulation, extracting inode metadata efficiently, and visualizing these low-level activities through a user-friendly interface. The backend utilizes essential system calls such as `opendir`, `readdir`, `stat`, `rename`, and `mkdir` to perform directory traversal, atomic operations, and metadata extraction. Additionally, a custom journaling system is implemented to provide crash recovery and allow operation rollback. The results demonstrate how complex kernel-level operations can be managed and visualized effectively, providing educational value and practical utility in file management.

**Keywords**— Operating Systems, POSIX, Atomic Operations, File System, Visualization.

## I. INTRODUCTION
The File Organizer is a dual-component application designed to demonstrate core Operating System concepts through a practical tool. It combines a robust C-based backend that performs real system operations with a modern React-based frontend for visualization. The primary goal of this research project is to bridge the gap between low-level system programming and high-level user interface design, effectively demonstrating how Operating Systems manage files and directories under the hood.

This project addresses the educational and practical need to visualize OS concepts that are typically abstracted away from the user. The rest of this paper is organized as follows: Section II discusses the related concepts. Section III details the methodology and system architecture. Section IV presents the implemented OS concepts as results, and Section V concludes the paper.

## II. LITERATURE REVIEW
Existing file management tools generally abstract the underlying system calls, making it difficult for students and developers to understand the interaction between the application and the OS kernel [1]. While command-line utilities provide direct interaction, they lack visual feedback. The proposed system builds upon fundamental POSIX compliant system interactions [2] and introduces a visualization layer, addressing the gap identified in educational OS tools.

## III. METHODOLOGY
The system architecture is divided into two main components: the C backend and the React frontend.

### A. C Backend (The Core)
The backend is written in C and interacts directly with the OS Kernel to ensure high performance and direct system call execution.
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

## IV. RESULTS AND DISCUSSION
The implementation successfully demonstrates several key OS concepts in action.

### A. Directory Traversal
The system uses `opendir()` to create a directory stream and `readdir()` to iteratively read entries. This simulates how file explorers work at a low level, successfully scanning target directories.

### B. Inode Metadata
Using `stat()`, the application accesses the inode information of each file to determine its type and size without opening the file content, ensuring high efficiency in file categorization.

### C. Atomic Operations
File moves are performed using `rename()`, which is atomic at the kernel level. This guarantees that a file is never lost—it is either at the source or the destination, ensuring data integrity even during crashes, similar to ACID properties in database systems [3].

### D. Journaling (Undo System)
A custom write-ahead journaling system records every operation before execution. This allows the system to reverse (undo) actions by reading the log, effectively mimicking file system journaling found in ext4 or NTFS [4].

## V. CONCLUSION
This project successfully bridges the gap between low-level system programming and high-level user interface design. By utilizing direct POSIX system calls and providing a real-time visualization, the application effectively demonstrates how Operating Systems manage files and directories under the hood. Future work may include supporting concurrent operations with explicit synchronization primitives and expanding the journaling system for complex recovery scenarios.

## REFERENCES
[1] A. Silberschatz, P. B. Galvin, and G. Gagne, *Operating System Concepts*, 10th ed. Hoboken, NJ: Wiley, 2018.
[2] "IEEE Standard for Information Technology--Portable Operating System Interface (POSIX(TM)) Base Specifications, Issue 7," *IEEE Std 1003.1-2017 (Revision of IEEE Std 1003.1-2008)*, pp. 1-3951, Jan. 2018.
[3] W. Stallings, *Operating Systems: Internals and Design Principles*, 9th ed. Pearson, 2017.
[4] M. McKusick, G. Neville-Neil, and R. Watson, *The Design and Implementation of the FreeBSD Operating System*, 2nd ed. Addison-Wesley Professional, 2014.
