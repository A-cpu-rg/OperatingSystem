# Final Evaluation Prep Guide (100% Marks Target)

This guide provides exactly what you need to say and show during your final evaluation to score full marks for **Documentation & GitHub (30 Marks)**.

---

## B1. Architecture & Workflow (6 Marks)
**Evaluation Standard**: Depth of Reasoning: Clear explanation of system design (e.g., why a specific kernel type or sync primitive was used). Measured via the report and interview.

**What to Say/Show:**
- **Architecture Separation**: Explain that the system is intentionally split into two components: a C backend and a React frontend. The C backend directly interacts with the monolithic OS kernel (like Linux/macOS) via POSIX. The React frontend is purely for visual modeling.
- **Why system calls directly?** "We used standard POSIX system calls (`opendir`, `readdir`, `stat`, `rename`, `mkdir`) directly in C instead of a high-level language script because we wanted to demonstrate the actual mechanics of how an Operating System manipulates inodes and directory entries."
- **Sync Primitive / Concurrency Alternative**: "While our file operations are sequential and don't use explicit threading sync primitives like mutexes, we rely heavily on the **atomic nature** of the `rename()` system call. `rename()` acts effectively as a synchronization mechanism at the kernel level. It guarantees that a file move is an all-or-nothing operation, preventing inconsistent states or file corruption if a crash occurs during a move."
- **Why a journaling system?** "We implemented a Write-Ahead Log (WAL) for our undo system, which mimics how modern journaled file systems (ext4, NTFS) recover from crashes by playing back operations."

---

## B2. Alignment & Kickoff (3 Marks)
**Evaluation Standard**: Validation: Direct proof that core features defined at kickoff are present. Verified against the initial proposal.

**What to Say/Show:**
- Open `docs/PROJECT_REPORT.md` (Section 2 - Objectives) and point out the original goals: POSIX operations, atomic moves, visualization, and inode metadata extraction.
- **Demonstrate Proof**: 
  - Show them the C files (`backend/src/organizer.c` for `rename()`, `backend/src/metadata.c` for `stat()`).
  - Run the `test.sh` script or the Backend application to prove the core operations actually happen.
  - Open the React frontend to prove the visualization component is present and fully functional.
- **Statement**: "Everything we proposed at kickoff—the atomic operations, directory scanning, and undo functionality—has been fully implemented and verified. We prioritized getting the low-level C kernel interactions working perfectly before building the React visualization on top of it."

---

## B3. GitHub History (3 Marks)
**Evaluation Standard**: Methodology: Commit history must reflect the "workflow" mentioned above. Shows incremental development rather than a final upload.

**What to Say/Show:**
- Open terminal and type: `git log --graph --oneline --all` or show your GitHub repository commits page.
- Focus on the fact that you used branching. Even if the history is short, point out:
  - "We used a workflow-based approach. As you can see by the `Merge pull request #1 from A-cpu-rg/development` commit, we didn't just dump all code into main."
  - "We built incrementally in the `development` branch, committing discrete features such as removing old docs, adding the detailed Project Report, and refining the C backend, before doing a final Pull Request into the `main` branch."
  - "This workflow matches industry standards, ensuring that `main` only contains stable, tested code."

---

## B4. Readability & Tools (3 Marks)
**Evaluation Standard**: Understanding of Tools: Use of industry-standard tools (Makefiles, GDB for debugging, shell scripts) documented in the README.

**What to Say/Show:**
- Point exactly to the updated `README.md` file, which has dedicated sections for:
  - **Makefile**: Show `backend/Makefile`. "We custom-wrote a Makefile to handle standard builds (`make`), cleanups (`make clean`), execution (`make run`), and a specific debug build (`make debug`)."
  - **GDB Debugging**: Point out the `make debug` target in the Makefile which uses the `-g` flag. Show the documentation in the README that explicitly instructs how to use `gdb ./file_organizer` to step through the system calls.
  - **Shell Scripting**: "To ensure our core logic was completely stable and verifiable outside the web UI, we wrote a shell script (`test.sh`)." Open `test.sh` and show how it automates the build process, generates mock data using `touch`, and runs the C program in one go.

---

### Final Tip for 100%
Speak confidently about **why** you made technical choices. Mentioning **"atomic operations (`rename` system call) functioning as kernel-level consistency guarantees"** directly answers their specific parameter about explaining the reasoning behind system design / primitives used.
