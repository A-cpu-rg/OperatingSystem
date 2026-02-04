/**
 * File Organizer - Metadata Module Implementation
 * OS Project 2026
 *
 * File metadata extraction using stat() system call
 *
 * OS Concepts Demonstrated:
 * - stat() : System call to read file inode information
 * - struct stat : Contains all file metadata
 *   - st_mode  : File type and permissions (rwxrwxrwx)
 *   - st_size  : File size in bytes
 *   - st_uid   : Owner user ID
 *   - st_gid   : Owner group ID
 *   - st_atime : Access time (when file was last read)
 *   - st_mtime : Modification time (when content changed)
 *   - st_ctime : Change time (when metadata changed)
 *   - st_nlink : Number of hard links
 *   - st_ino   : Inode number
 *   - st_dev   : Device ID
 */

#include "metadata.h"
#include <errno.h>
#include <grp.h>
#include <pwd.h>

/**
 * Convert mode_t to permission string (rwxrwxrwx format)
 *
 * This demonstrates how Unix permissions work:
 * - Bits 0-2: Other permissions (r=4, w=2, x=1)
 * - Bits 3-5: Group permissions
 * - Bits 6-8: Owner permissions
 */
void metadata_mode_to_string(mode_t mode, char *str) {
  // File type character
  if (S_ISREG(mode))
    str[0] = '-';
  else if (S_ISDIR(mode))
    str[0] = 'd';
  else if (S_ISLNK(mode))
    str[0] = 'l';
  else if (S_ISCHR(mode))
    str[0] = 'c';
  else if (S_ISBLK(mode))
    str[0] = 'b';
  else if (S_ISFIFO(mode))
    str[0] = 'p';
  else if (S_ISSOCK(mode))
    str[0] = 's';
  else
    str[0] = '?';

  // Owner permissions (bits 6-8)
  str[1] = (mode & S_IRUSR) ? 'r' : '-';
  str[2] = (mode & S_IWUSR) ? 'w' : '-';
  str[3] = (mode & S_IXUSR) ? 'x' : '-';

  // Group permissions (bits 3-5)
  str[4] = (mode & S_IRGRP) ? 'r' : '-';
  str[5] = (mode & S_IWGRP) ? 'w' : '-';
  str[6] = (mode & S_IXGRP) ? 'x' : '-';

  // Other permissions (bits 0-2)
  str[7] = (mode & S_IROTH) ? 'r' : '-';
  str[8] = (mode & S_IWOTH) ? 'w' : '-';
  str[9] = (mode & S_IXOTH) ? 'x' : '-';

  str[10] = '\0';
}

/**
 * Get human readable file type string
 */
const char *metadata_get_type_string(mode_t mode) {
  if (S_ISREG(mode))
    return "Regular File";
  if (S_ISDIR(mode))
    return "Directory";
  if (S_ISLNK(mode))
    return "Symbolic Link";
  if (S_ISCHR(mode))
    return "Character Device";
  if (S_ISBLK(mode))
    return "Block Device";
  if (S_ISFIFO(mode))
    return "FIFO/Pipe";
  if (S_ISSOCK(mode))
    return "Socket";
  return "Unknown";
}

/**
 * Get detailed metadata for a file using stat() system call
 *
 * The stat() function is a system call that reads file metadata
 * from the filesystem's inode structure. An inode contains:
 * - File type and permissions
 * - Owner and group IDs
 * - File size
 * - Timestamps
 * - Pointers to data blocks
 */
int metadata_get(const char *path, FileMetadata *metadata) {
  if (!path || !metadata)
    return -1;

  struct stat st;

  // OS Concept: stat() system call
  // Reads inode information from the filesystem
  // The kernel looks up the inode using the path and returns metadata
  if (stat(path, &st) == -1) {
    print_error(strerror(errno));
    return -1;
  }

  // Copy path and extract filename
  strncpy(metadata->path, path, MAX_PATH_LEN - 1);
  metadata->path[MAX_PATH_LEN - 1] = '\0';

  const char *filename = strrchr(path, '/');
  if (filename) {
    filename++; // Skip the '/'
  } else {
    filename = path;
  }
  strncpy(metadata->filename, filename, MAX_FILENAME_LEN - 1);
  metadata->filename[MAX_FILENAME_LEN - 1] = '\0';

  // Copy stat information
  metadata->size = st.st_size;
  metadata->mode = st.st_mode;
  metadata->uid = st.st_uid;
  metadata->gid = st.st_gid;
  metadata->atime = st.st_atime;
  metadata->mtime = st.st_mtime;
  metadata->ctime = st.st_ctime;
  metadata->nlink = st.st_nlink;
  metadata->inode = st.st_ino;
  metadata->dev = st.st_dev;

  // Generate human-readable strings
  metadata_mode_to_string(st.st_mode, metadata->permissions);
  strncpy(metadata->file_type, metadata_get_type_string(st.st_mode), 31);
  metadata->file_type[31] = '\0';

  return 0;
}

/**
 * Print detailed metadata in a formatted output
 */
void metadata_print(const FileMetadata *metadata) {
  if (!metadata)
    return;

  char *size_str = format_size(metadata->size);
  char *atime_str = format_time(metadata->atime);
  char *mtime_str = format_time(metadata->mtime);
  char *ctime_str = format_time(metadata->ctime);

  // Get username and group name
  struct passwd *pw = getpwuid(metadata->uid);
  struct group *gr = getgrgid(metadata->gid);

  printf("\n" COLOR_BOLD "📄 FILE METADATA" COLOR_RESET "\n");
  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  printf(COLOR_CYAN "  Filename:    " COLOR_RESET "%s\n", metadata->filename);
  printf(COLOR_CYAN "  Full Path:   " COLOR_RESET "%s\n", metadata->path);
  printf(COLOR_CYAN "  Type:        " COLOR_RESET "%s\n", metadata->file_type);
  printf(COLOR_CYAN "  Size:        " COLOR_RESET "%s (%lld bytes)\n",
         size_str ? size_str : "N/A", (long long)metadata->size);
  printf(COLOR_CYAN "  Permissions: " COLOR_RESET "%s (octal: %04o)\n",
         metadata->permissions, metadata->mode & 0777);
  printf(COLOR_CYAN "  Owner:       " COLOR_RESET "%s (UID: %d)\n",
         pw ? pw->pw_name : "Unknown", metadata->uid);
  printf(COLOR_CYAN "  Group:       " COLOR_RESET "%s (GID: %d)\n",
         gr ? gr->gr_name : "Unknown", metadata->gid);
  printf(COLOR_CYAN "  Inode:       " COLOR_RESET "%llu\n",
         (unsigned long long)metadata->inode);
  printf(COLOR_CYAN "  Hard Links:  " COLOR_RESET "%d\n", (int)metadata->nlink);
  printf(COLOR_CYAN "  Device ID:   " COLOR_RESET "%d\n", (int)metadata->dev);
  printf(COLOR_CYAN "  Access Time: " COLOR_RESET "%s\n",
         atime_str ? atime_str : "N/A");
  printf(COLOR_CYAN "  Modify Time: " COLOR_RESET "%s\n",
         mtime_str ? mtime_str : "N/A");
  printf(COLOR_CYAN "  Change Time: " COLOR_RESET "%s\n",
         ctime_str ? ctime_str : "N/A");
  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Explain OS concepts
  printf("\n" COLOR_YELLOW "💡 OS Concept: stat() System Call" COLOR_RESET
         "\n");
  printf("   The stat() function reads file metadata from the inode.\n");
  printf("   Inodes store: type, permissions, size, timestamps, and\n");
  printf("   pointers to data blocks on disk.\n");

  if (size_str)
    free(size_str);
  if (atime_str)
    free(atime_str);
  if (mtime_str)
    free(mtime_str);
  if (ctime_str)
    free(ctime_str);
}

/**
 * Print metadata for all files in scan result (summary view)
 */
void metadata_print_all(const ScanResult *result) {
  if (!result || result->count == 0) {
    print_info("No files to display");
    return;
  }

  printf("\n" COLOR_BOLD "📊 ALL FILES METADATA" COLOR_RESET "\n");
  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
         "━━━━━━━━━\n");
  printf(COLOR_BOLD "%-30s %-10s %-10s %-12s %-20s" COLOR_RESET "\n",
         "Filename", "Perms", "Size", "Links", "Modified");
  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
         "━━━━━━━━━\n");

  for (int i = 0; i < result->count; i++) {
    FileMetadata meta;
    if (metadata_get(result->files[i].path, &meta) == 0) {
      char *size_str = format_size(meta.size);
      char *time_str = format_time(meta.mtime);

      // Truncate filename
      char display_name[31];
      strncpy(display_name, meta.filename, 30);
      display_name[30] = '\0';
      if (strlen(meta.filename) > 30) {
        display_name[27] = '.';
        display_name[28] = '.';
        display_name[29] = '.';
      }

      printf("%-30s %-10s %-10s %-12d %-20s\n", display_name, meta.permissions,
             size_str ? size_str : "N/A", (int)meta.nlink,
             time_str ? time_str : "N/A");

      if (size_str)
        free(size_str);
      if (time_str)
        free(time_str);
    }
  }

  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
         "━━━━━━━━━\n");
}
