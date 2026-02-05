/**
 * File Organizer - Scanner Module Implementation
 * OS Project 2026
 *
 * Directory traversal and file discovery using POSIX APIs
 *
 * OS Concepts Demonstrated:
 * - opendir()  : Opens a directory stream (uses file descriptor internally)
 * - readdir()  : Reads directory entries one by one
 * - closedir() : Closes directory stream and releases resources
 * - stat()     : System call to get file metadata from inode
 * - S_ISREG(), S_ISDIR() : Macros to check file type from mode
 */

#include "scanner.h"
#include <dirent.h>
#include <errno.h>
#include <unistd.h>

/**
 * Initialize a new scan result structure
 * Allocates memory for storing file information
 */
ScanResult *scanner_init(void) {
  ScanResult *result = malloc(sizeof(ScanResult));
  if (!result) {
    print_error("Failed to allocate memory for scan result");
    return NULL;
  }

  result->files = malloc(sizeof(FileInfo) * MAX_FILES);
  if (!result->files) {
    print_error("Failed to allocate memory for file list");
    free(result);
    return NULL;
  }

  result->count = 0;
  result->capacity = MAX_FILES;
  result->total_size = 0;

  // Initialize category counts
  for (int i = 0; i < CAT_COUNT; i++) {
    result->category_counts[i] = 0;
  }

  return result;
}

/**
 * Free scan result structure and all associated memory
 */
void scanner_free(ScanResult *result) {
  if (result) {
    if (result->files) {
      free(result->files);
    }
    free(result);
  }
}

/**
 * Add a file to the scan results
 * Internal function to handle adding files to the result set
 */
static int add_file_to_result(ScanResult *result, const char *path,
                              const char *filename, const struct stat *st) {
  if (result->count >= result->capacity) {
    print_warning("Maximum file limit reached");
    return -1;
  }

  FileInfo *file = &result->files[result->count];

  // Copy path and filename
  strncpy(file->path, path, MAX_PATH_LEN - 1);
  file->path[MAX_PATH_LEN - 1] = '\0';

  strncpy(file->filename, filename, MAX_FILENAME_LEN - 1);
  file->filename[MAX_FILENAME_LEN - 1] = '\0';

  // Get and copy extension
  const char *ext = get_file_extension(filename);
  strncpy(file->extension, ext, MAX_EXT_LEN - 1);
  file->extension[MAX_EXT_LEN - 1] = '\0';

  // Determine category from extension
  file->category = get_category_from_extension(ext);

  // Copy stat information
  file->size = st->st_size;
  file->mtime = st->st_mtime;
  file->mode = st->st_mode;
  file->is_directory = S_ISDIR(st->st_mode);

  // Update statistics
  result->category_counts[file->category]++;
  result->total_size += file->size;
  result->count++;

  return 0;
}

/**
 * Scan a directory and collect file information
 *
 * This function demonstrates key OS concepts:
 * 1. opendir() - Opens directory, returns DIR* stream
 *    Internally uses open() system call to get file descriptor
 *
 * 2. readdir() - Reads next directory entry
 *    Returns dirent structure with d_name (filename)
 *
 * 3. stat() - Gets file metadata from inode
 *    Returns struct stat with size, permissions, timestamps
 *
 * 4. closedir() - Closes directory stream
 *    Releases file descriptor and resources
 */
int scanner_scan_directory(const char *path, ScanResult *result,
                           int recursive) {
  DIR *dir;
  struct dirent *entry;
  struct stat file_stat;
  char full_path[MAX_PATH_LEN];

  // OS Concept: opendir() opens a directory stream
  // Returns NULL on error, sets errno
  dir = opendir(path);
  if (dir == NULL) {
    char error_msg[256];
    snprintf(error_msg, sizeof(error_msg), "Cannot open directory '%s': %s",
             path, strerror(errno));
    print_error(error_msg);
    return -1;
  }

  printf(COLOR_CYAN "📂 Scanning: %s" COLOR_RESET "\n", path);

  // OS Concept: readdir() reads directory entries one by one
  // Each entry contains d_name (filename) and d_type (file type)
  while ((entry = readdir(dir)) != NULL) {
    // Skip . and .. entries (current and parent directory)
    if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0) {
      continue;
    }

    // Skip hidden files (starting with .)
    if (entry->d_name[0] == '.') {
      continue;
    }

    // Build full path
    snprintf(full_path, MAX_PATH_LEN, "%s/%s", path, entry->d_name);

    // OS Concept: stat() system call
    // Gets file metadata from the inode:
    // - st_size: file size in bytes
    // - st_mode: file type and permissions
    // - st_mtime: last modification time
    // - st_uid, st_gid: owner user/group IDs
    if (stat(full_path, &file_stat) == -1) {
      char error_msg[256];
      snprintf(error_msg, sizeof(error_msg), "Cannot stat '%s': %s", full_path,
               strerror(errno));
      print_warning(error_msg);
      continue;
    }

    // Check if it's a directory
    // S_ISDIR() macro checks the st_mode field
    if (S_ISDIR(file_stat.st_mode)) {
      if (recursive) {
        // Recursively scan subdirectory
        scanner_scan_directory(full_path, result, recursive);
      }
    } else if (S_ISREG(file_stat.st_mode)) {
      // S_ISREG() checks if it's a regular file
      add_file_to_result(result, full_path, entry->d_name, &file_stat);
    }
  }

  // OS Concept: closedir() closes the directory stream
  // Releases the file descriptor allocated by opendir()
  closedir(dir);

  return 0;
}

/**
 * Print scan results in a formatted table
 */
void scanner_print_results(const ScanResult *result) {
  if (!result || result->count == 0) {
    print_info("No files found");
    return;
  }

  printf("\n" COLOR_BOLD "📋 SCAN RESULTS (%d files found)" COLOR_RESET "\n",
         result->count);
  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
         "━━━\n");
  printf(COLOR_BOLD "%-40s %-12s %-10s %s" COLOR_RESET "\n", "Filename",
         "Category", "Size", "Modified");
  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
         "━━━\n");

  for (int i = 0; i < result->count; i++) {
    const FileInfo *file = &result->files[i];
    char *size_str = format_size(file->size);
    char *time_str = format_time(file->mtime);

    // Truncate filename if too long
    char display_name[41];
    strncpy(display_name, file->filename, 40);
    display_name[40] = '\0';
    if (strlen(file->filename) > 40) {
      display_name[37] = '.';
      display_name[38] = '.';
      display_name[39] = '.';
    }

    printf("%s%-40s %-12s %-10s %s" COLOR_RESET "\n",
           get_category_color(file->category), display_name,
           get_category_name(file->category), size_str ? size_str : "N/A",
           time_str ? time_str : "N/A");

    if (size_str)
      free(size_str);
    if (time_str)
      free(time_str);
  }

  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
         "━━━\n");
}

/**
 * Print category summary with visual bars
 */
void scanner_print_summary(const ScanResult *result) {
  if (!result)
    return;

  char *total_size_str = format_size(result->total_size);

  printf("\n" COLOR_BOLD "📊 CATEGORY SUMMARY" COLOR_RESET "\n");
  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (int i = 0; i < CAT_COUNT; i++) {
    int count = result->category_counts[i];
    int bar_width = (count > 0) ? (count * 30 / result->count) : 0;
    if (bar_width < 1 && count > 0)
      bar_width = 1;

    printf("%s%-12s" COLOR_RESET " [", get_category_color(i),
           get_category_name(i));

    // Print bar
    printf("%s", get_category_color(i));
    for (int j = 0; j < bar_width; j++)
      printf("█");
    printf(COLOR_RESET);
    for (int j = bar_width; j < 30; j++)
      printf("░");

    printf("] %d files\n", count);
  }

  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  printf(COLOR_BOLD "Total: %d files, %s" COLOR_RESET "\n", result->count,
         total_size_str ? total_size_str : "N/A");

  if (total_size_str)
    free(total_size_str);
}

/**
 * Get files filtered by category
 */
int scanner_get_by_category(const ScanResult *result, FileCategory category,
                            FileInfo **out_files, int *out_count) {
  if (!result || !out_files || !out_count)
    return -1;

  *out_count = 0;

  // First pass: count files in category
  int count = result->category_counts[category];
  if (count == 0) {
    *out_files = NULL;
    return 0;
  }

  // Allocate array
  *out_files = malloc(sizeof(FileInfo) * count);
  if (!*out_files)
    return -1;

  // Second pass: copy files
  int idx = 0;
  for (int i = 0; i < result->count && idx < count; i++) {
    if (result->files[i].category == category) {
      (*out_files)[idx++] = result->files[i];
    }
  }

  *out_count = idx;
  return 0;
}
