/**
 * File Organizer - Organizer Module Header
 * OS Project 2026
 *
 * File organization logic with atomic operations
 *
 * OS Concepts:
 * - mkdir() - Directory creation
 * - rename() - Atomic file move
 * - Atomic operations prevent partial/inconsistent state
 */

#ifndef ORGANIZER_H
#define ORGANIZER_H

#include "journal.h"
#include "scanner.h"

// Organization result structure
typedef struct {
  int files_moved;
  int files_skipped;
  int directories_created;
  int errors;
} OrganizeResult;

/**
 * Create category directories in target path
 * Uses mkdir() system call
 *
 * @param base_path Directory where category folders will be created
 * @param journal Journal for logging
 * @return 0 on success, -1 on error
 */
int organizer_create_directories(const char *base_path, Journal *journal);

/**
 * Organize files from scan result into categories
 * Uses rename() for atomic file moves
 *
 * @param result Scan result containing files to organize
 * @param base_path Target directory for organized folders
 * @param journal Journal for logging operations
 * @param out_result Output statistics
 * @return 0 on success, -1 on error
 */
int organizer_organize_files(const ScanResult *result, const char *base_path,
                             Journal *journal, OrganizeResult *out_result);

/**
 * Print organization results
 * @param result Pointer to OrganizeResult
 */
void organizer_print_result(const OrganizeResult *result);

/**
 * Check if a file already exists at destination
 * @param dest_path Destination path
 * @return 1 if exists, 0 if not
 */
int organizer_file_exists(const char *dest_path);

/**
 * Generate unique filename if file already exists
 * Appends _1, _2, etc. before extension
 *
 * @param dest_dir Destination directory
 * @param filename Original filename
 * @param out_path Output buffer for unique path
 * @param out_size Size of output buffer
 * @return 0 on success, -1 on error
 */
int organizer_get_unique_path(const char *dest_dir, const char *filename,
                              char *out_path, size_t out_size);

#endif // ORGANIZER_H
