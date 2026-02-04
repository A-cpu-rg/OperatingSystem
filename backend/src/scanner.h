/**
 * File Organizer - Scanner Module Header
 * OS Project 2026
 *
 * Directory traversal and file discovery using POSIX APIs
 *
 * OS Concepts:
 * - opendir(), readdir(), closedir() - Directory operations
 * - stat() - File metadata retrieval
 * - Recursive directory traversal
 */

#ifndef SCANNER_H
#define SCANNER_H

#include "utils.h"
#include <sys/stat.h>
#include <sys/types.h>

// Maximum number of files we can track
#define MAX_FILES 10000

// File information structure
typedef struct {
  char path[MAX_PATH_LEN];         // Full file path
  char filename[MAX_FILENAME_LEN]; // Just the filename
  char extension[MAX_EXT_LEN];     // File extension
  FileCategory category;           // Assigned category
  off_t size;                      // File size in bytes
  time_t mtime;                    // Last modification time
  mode_t mode;                     // File permissions
  int is_directory;                // Is this a directory?
} FileInfo;

// Scan results structure
typedef struct {
  FileInfo *files;                // Array of file info
  int count;                      // Number of files found
  int capacity;                   // Allocated capacity
  int category_counts[CAT_COUNT]; // Count per category
  off_t total_size;               // Total size of all files
} ScanResult;

/**
 * Initialize a new scan result structure
 * @return Pointer to new ScanResult or NULL on failure
 */
ScanResult *scanner_init(void);

/**
 * Free scan result structure and all associated memory
 * @param result Pointer to ScanResult to free
 */
void scanner_free(ScanResult *result);

/**
 * Scan a directory and collect file information
 * Uses POSIX opendir(), readdir(), closedir() and stat()
 *
 * @param path Directory path to scan
 * @param result Pointer to ScanResult to store results
 * @param recursive If non-zero, scan subdirectories recursively
 * @return 0 on success, -1 on error
 */
int scanner_scan_directory(const char *path, ScanResult *result, int recursive);

/**
 * Print scan results in a formatted table
 * @param result Pointer to ScanResult to print
 */
void scanner_print_results(const ScanResult *result);

/**
 * Print category summary
 * @param result Pointer to ScanResult
 */
void scanner_print_summary(const ScanResult *result);

/**
 * Get files by category
 * @param result Pointer to ScanResult
 * @param category Category to filter
 * @param out_files Output array (must be pre-allocated)
 * @param out_count Output count
 * @return 0 on success, -1 on error
 */
int scanner_get_by_category(const ScanResult *result, FileCategory category,
                            FileInfo **out_files, int *out_count);

#endif // SCANNER_H
