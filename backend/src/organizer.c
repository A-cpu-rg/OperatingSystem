/**
 * File Organizer - Organizer Module Implementation
 * OS Project 2026
 *
 * File organization with atomic operations
 *
 * OS Concepts Demonstrated:
 * - mkdir()  : System call to create directories
 *              Creates new directory entry and inode
 *
 * - rename() : System call for atomic file move
 *              This is the KEY concept for safe file operations:
 *              - The operation is ATOMIC (all-or-nothing)
 *              - Either the file is at source OR destination
 *              - Never in a partial/inconsistent state
 *              - Same as database transactions
 *
 * - access() : Check file/directory existence and permissions
 */

#include "organizer.h"
#include <errno.h>
#include <sys/stat.h>
#include <unistd.h>

/**
 * Check if a file exists at the given path
 * Uses access() system call
 */
int organizer_file_exists(const char *dest_path) {
  return access(dest_path, F_OK) == 0;
}

/**
 * Generate unique filename if file already exists
 * Appends _1, _2, etc. before the extension
 */
int organizer_get_unique_path(const char *dest_dir, const char *filename,
                              char *out_path, size_t out_size) {
  // First, try the original name
  snprintf(out_path, out_size, "%s/%s", dest_dir, filename);

  if (!organizer_file_exists(out_path)) {
    return 0; // Original name is available
  }

  // Need to generate unique name
  char name_without_ext[MAX_FILENAME_LEN];
  const char *ext = get_file_extension(filename);

  // Get name without extension
  size_t name_len = strlen(filename);
  size_t ext_len = strlen(ext);

  if (ext_len > 0) {
    // Has extension
    size_t base_len = name_len - ext_len - 1; // -1 for the dot
    strncpy(name_without_ext, filename, base_len);
    name_without_ext[base_len] = '\0';
  } else {
    // No extension
    strncpy(name_without_ext, filename, MAX_FILENAME_LEN - 1);
    name_without_ext[MAX_FILENAME_LEN - 1] = '\0';
  }

  // Try with numbers
  for (int i = 1; i < 1000; i++) {
    if (ext_len > 0) {
      snprintf(out_path, out_size, "%s/%s_%d.%s", dest_dir, name_without_ext, i,
               ext);
    } else {
      snprintf(out_path, out_size, "%s/%s_%d", dest_dir, name_without_ext, i);
    }

    if (!organizer_file_exists(out_path)) {
      return 0; // Found unique name
    }
  }

  return -1; // Could not find unique name
}

/**
 * Create category directories
 *
 * OS Concept: mkdir() system call
 * - Creates a new directory entry in the parent directory
 * - Allocates a new inode for the directory
 * - Sets initial permissions (modified by umask)
 */
int organizer_create_directories(const char *base_path, Journal *journal) {
  char dir_path[MAX_PATH_LEN];
  int created = 0;

  printf("\n" COLOR_BOLD "📁 Creating Category Directories" COLOR_RESET "\n");
  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (int i = 0; i < CAT_COUNT; i++) {
    snprintf(dir_path, MAX_PATH_LEN, "%s/%s", base_path, CATEGORY_NAMES[i]);

    // Check if directory already exists
    if (access(dir_path, F_OK) == 0) {
      printf("  %s%-12s" COLOR_RESET " Already exists\n", get_category_color(i),
             get_category_name(i));
      continue;
    }

    // Log operation before executing (journaling concept)
    int entry_idx = -1;
    if (journal) {
      entry_idx = journal_log_operation(journal, OP_CREATE_DIR, dir_path, NULL);
    }

    // OS Concept: mkdir() system call
    // Creates directory with permissions 0755 (rwxr-xr-x)
    // 0755 means: owner can rwx, group and others can rx
    if (mkdir(dir_path, 0755) == 0) {
      printf("  %s%-12s" COLOR_RESET " ✅ Created\n", get_category_color(i),
             get_category_name(i));
      created++;

      // Mark operation complete in journal
      if (journal && entry_idx >= 0) {
        journal_mark_complete(journal, entry_idx);
      }
    } else {
      char error_msg[256];
      snprintf(error_msg, sizeof(error_msg), "Failed to create %s: %s",
               get_category_name(i), strerror(errno));
      print_error(error_msg);
    }
  }

  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (created > 0) {
    char msg[64];
    snprintf(msg, sizeof(msg), "Created %d directories", created);
    print_success(msg);
  }

  return 0;
}

/**
 * Organize files from scan result into category folders
 *
 * OS Concept: rename() for ATOMIC file moves
 *
 * Why rename() is atomic:
 * 1. It only updates directory entries (metadata)
 * 2. The actual file data is NOT copied
 * 3. The operation is a single system call to the kernel
 * 4. Either the old entry exists OR the new one - never both/neither
 *
 * This is the same concept used in:
 * - Database transactions
 * - Filesystem journaling
 * - Safe file updates (write temp, then rename)
 */
int organizer_organize_files(const ScanResult *result, const char *base_path,
                             Journal *journal, OrganizeResult *out_result) {
  if (!result || !base_path || !out_result) {
    return -1;
  }

  // Initialize result
  out_result->files_moved = 0;
  out_result->files_skipped = 0;
  out_result->directories_created = 0;
  out_result->errors = 0;

  // Create directories first
  organizer_create_directories(base_path, journal);

  printf("\n" COLOR_BOLD "✨ Organizing Files" COLOR_RESET "\n");
  printf(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (int i = 0; i < result->count; i++) {
    const FileInfo *file = &result->files[i];

    // Build destination path
    char dest_dir[MAX_PATH_LEN];
    char dest_path[MAX_PATH_LEN];

    snprintf(dest_dir, MAX_PATH_LEN, "%s/%s", base_path,
             get_category_name(file->category));

    // Get unique path if file exists
    if (organizer_get_unique_path(dest_dir, file->filename, dest_path,
                                  MAX_PATH_LEN) != 0) {
      print_warning("Could not generate unique filename");
      out_result->files_skipped++;
      continue;
    }

    // Check if source and destination are same
    if (strcmp(file->path, dest_path) == 0) {
      out_result->files_skipped++;
      continue;
    }

    // Log operation before executing (write-ahead journaling)
    int entry_idx = -1;
    if (journal) {
      entry_idx =
          journal_log_operation(journal, OP_MOVE, file->path, dest_path);
    }

    printf("  %s%-30s" COLOR_RESET " → %s/\n",
           get_category_color(file->category), file->filename,
           get_category_name(file->category));

    // OS Concept: rename() - ATOMIC file move
    // This is a SINGLE system call that:
    // 1. Removes the old directory entry
    // 2. Creates the new directory entry
    // Both happen atomically - no partial state possible
    if (rename(file->path, dest_path) == 0) {
      out_result->files_moved++;

      // Mark operation complete in journal
      if (journal && entry_idx >= 0) {
        journal_mark_complete(journal, entry_idx);
      }
    } else {
      char error_msg[256];
      snprintf(error_msg, sizeof(error_msg), "Failed to move %s: %s",
               file->filename, strerror(errno));
      print_error(error_msg);
      out_result->errors++;
    }
  }

  printf(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Print OS concept explanation
  printf("\n" COLOR_YELLOW
         "💡 OS Concept: Atomic File Move with rename()" COLOR_RESET "\n");
  printf("   The rename() system call ensures atomic file moves:\n");
  printf("   - Only updates directory entries (not file data)\n");
  printf("   - Single system call = atomic operation\n");
  printf("   - File is either at source OR destination, never both\n");
  printf("   - Same principle used in database transactions\n");

  return 0;
}

/**
 * Print organization results summary
 */
void organizer_print_result(const OrganizeResult *result) {
  if (!result)
    return;

  printf("\n" COLOR_BOLD "📊 ORGANIZATION SUMMARY" COLOR_RESET "\n");
  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  printf(COLOR_GREEN "  ✅ Files moved:     %d" COLOR_RESET "\n",
         result->files_moved);
  printf(COLOR_YELLOW "  ⏭️  Files skipped:   %d" COLOR_RESET "\n",
         result->files_skipped);
  printf(COLOR_RED "  ❌ Errors:          %d" COLOR_RESET "\n", result->errors);
  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (result->files_moved > 0 && result->errors == 0) {
    print_success("All files organized successfully!");
  } else if (result->errors > 0) {
    print_warning("Some files could not be moved");
  }
}
