/**
 * File Organizer - Metadata Module Header
 * OS Project 2026
 *
 * File metadata extraction using stat() system call
 *
 * OS Concepts:
 * - stat() system call to get inode information
 * - File permissions (mode_t)
 * - File timestamps (atime, mtime, ctime)
 */

#ifndef METADATA_H
#define METADATA_H

#include "scanner.h"
#include <sys/stat.h>
#include <sys/types.h>

// Detailed metadata structure
typedef struct {
  char path[MAX_PATH_LEN];
  char filename[MAX_FILENAME_LEN];
  off_t size;
  mode_t mode;
  uid_t uid;
  gid_t gid;
  time_t atime;         // Last access time
  time_t mtime;         // Last modification time
  time_t ctime;         // Last status change time
  nlink_t nlink;        // Number of hard links
  ino_t inode;          // Inode number
  dev_t dev;            // Device ID
  char permissions[11]; // rwxrwxrwx format
  char file_type[32];   // Human readable type
} FileMetadata;

/**
 * Get detailed metadata for a file
 * Uses stat() system call
 *
 * @param path Path to the file
 * @param metadata Output structure
 * @return 0 on success, -1 on error
 */
int metadata_get(const char *path, FileMetadata *metadata);

/**
 * Print metadata in formatted output
 * @param metadata Pointer to FileMetadata structure
 */
void metadata_print(const FileMetadata *metadata);

/**
 * Print metadata for multiple files
 * @param result ScanResult containing files
 */
void metadata_print_all(const ScanResult *result);

/**
 * Convert mode_t to permission string (rwxrwxrwx)
 * @param mode File mode
 * @param str Output string (must be at least 11 bytes)
 */
void metadata_mode_to_string(mode_t mode, char *str);

/**
 * Get file type string from mode
 * @param mode File mode
 * @return Human readable file type string
 */
const char *metadata_get_type_string(mode_t mode);

#endif // METADATA_H
