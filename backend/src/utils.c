/**
 * File Organizer - Utility Functions Implementation
 * OS Project 2026
 *
 * Common utility functions used across the application
 */

#include "utils.h"
#include <ctype.h>

// Category folder names
const char *CATEGORY_NAMES[] = {"Documents", "Images", "Videos", "Music",
                                "Archives",  "Code",   "Others"};

// Category colors for terminal display
const char *CATEGORY_COLORS[] = {
    COLOR_BLUE,    // Documents
    COLOR_MAGENTA, // Images
    COLOR_RED,     // Videos
    COLOR_GREEN,   // Music
    COLOR_YELLOW,  // Archives
    COLOR_CYAN,    // Code
    COLOR_WHITE    // Others
};

// File extension mappings
static const char *DOC_EXTENSIONS[] = {"pdf",  "doc", "docx", "txt", "xls",
                                       "xlsx", "ppt", "pptx", "odt", "ods",
                                       "odp",  "rtf", "csv",  NULL};

static const char *IMAGE_EXTENSIONS[] = {"jpg", "jpeg", "png", "gif",  "bmp",
                                         "svg", "webp", "ico", "tiff", "tif",
                                         "raw", "heic", NULL};

static const char *VIDEO_EXTENSIONS[] = {"mp4",  "mkv", "avi",  "mov",
                                         "wmv",  "flv", "webm", "m4v",
                                         "mpeg", "mpg", "3gp",  NULL};

static const char *MUSIC_EXTENSIONS[] = {"mp3", "wav", "flac", "aac", "ogg",
                                         "wma", "m4a", "opus", NULL};

static const char *ARCHIVE_EXTENSIONS[] = {"zip", "rar", "7z",  "tar",  "gz",
                                           "bz2", "xz",  "tgz", "tbz2", NULL};

static const char *CODE_EXTENSIONS[] = {
    "c",    "h",   "cpp", "hpp",  "py",  "js",   "jsx", "ts",   "tsx",
    "java", "go",  "rs",  "rb",   "php", "html", "css", "json", "xml",
    "yaml", "yml", "sh",  "bash", "sql", "md",   NULL};

/**
 * Print application header
 */
void print_header(void) {
  printf("\n");
  printf(COLOR_BOLD COLOR_CYAN);
  printf("╔══════════════════════════════════════════════════════════╗\n");
  printf("║           🗂️  FILE ORGANIZER - OS PROJECT 2026           ║\n");
  printf("║                     Team Alpha                            ║\n");
  printf("╚══════════════════════════════════════════════════════════╝\n");
  printf(COLOR_RESET);
  printf("\n");
}

/**
 * Print main menu
 */
void print_menu(void) {
  printf(COLOR_BOLD "\n📋 MAIN MENU\n" COLOR_RESET);
  printf("─────────────────────────────────────────\n");
  printf(COLOR_GREEN "  1." COLOR_RESET
                     " 👁️  Preview Files (Scan & Categorize)\n");
  printf(COLOR_GREEN "  2." COLOR_RESET
                     " ✨ Organize Files (Move to Folders)\n");
  printf(COLOR_GREEN "  3." COLOR_RESET " ↩️  Undo Last Organization\n");
  printf(COLOR_GREEN "  4." COLOR_RESET " 📊 View File Metadata\n");
  printf(COLOR_GREEN "  5." COLOR_RESET " 📜 View Journal History\n");
  printf(COLOR_GREEN "  6." COLOR_RESET " 🚪 Exit\n");
  printf("─────────────────────────────────────────\n");
  printf(COLOR_YELLOW "Enter choice (1-6): " COLOR_RESET);
}

/**
 * Print success message
 */
void print_success(const char *message) {
  printf(COLOR_GREEN "✅ %s" COLOR_RESET "\n", message);
}

/**
 * Print error message
 */
void print_error(const char *message) {
  printf(COLOR_RED "❌ Error: %s" COLOR_RESET "\n", message);
}

/**
 * Print info message
 */
void print_info(const char *message) {
  printf(COLOR_CYAN "ℹ️  %s" COLOR_RESET "\n", message);
}

/**
 * Print warning message
 */
void print_warning(const char *message) {
  printf(COLOR_YELLOW "⚠️  %s" COLOR_RESET "\n", message);
}

/**
 * Clear terminal screen
 */
void clear_screen(void) { printf("\033[2J\033[H"); }

/**
 * Get file extension from filename
 * Returns pointer to extension (without dot) or empty string
 */
const char *get_file_extension(const char *filename) {
  const char *dot = strrchr(filename, '.');
  if (!dot || dot == filename) {
    return "";
  }
  return dot + 1;
}

/**
 * Check if extension matches any in the list
 */
static int extension_in_list(const char *ext, const char *list[]) {
  char ext_lower[MAX_EXT_LEN];
  strncpy(ext_lower, ext, MAX_EXT_LEN - 1);
  ext_lower[MAX_EXT_LEN - 1] = '\0';

  // Convert to lowercase
  for (int i = 0; ext_lower[i]; i++) {
    ext_lower[i] = tolower((unsigned char)ext_lower[i]);
  }

  for (int i = 0; list[i] != NULL; i++) {
    if (strcmp(ext_lower, list[i]) == 0) {
      return 1;
    }
  }
  return 0;
}

/**
 * Get file category from extension
 */
FileCategory get_category_from_extension(const char *extension) {
  if (extension == NULL || strlen(extension) == 0) {
    return CAT_OTHERS;
  }

  if (extension_in_list(extension, DOC_EXTENSIONS))
    return CAT_DOCUMENTS;
  if (extension_in_list(extension, IMAGE_EXTENSIONS))
    return CAT_IMAGES;
  if (extension_in_list(extension, VIDEO_EXTENSIONS))
    return CAT_VIDEOS;
  if (extension_in_list(extension, MUSIC_EXTENSIONS))
    return CAT_MUSIC;
  if (extension_in_list(extension, ARCHIVE_EXTENSIONS))
    return CAT_ARCHIVES;
  if (extension_in_list(extension, CODE_EXTENSIONS))
    return CAT_CODE;

  return CAT_OTHERS;
}

/**
 * Get category name string
 */
const char *get_category_name(FileCategory cat) {
  if (cat >= 0 && cat < CAT_COUNT) {
    return CATEGORY_NAMES[cat];
  }
  return "Unknown";
}

/**
 * Get category color code
 */
const char *get_category_color(FileCategory cat) {
  if (cat >= 0 && cat < CAT_COUNT) {
    return CATEGORY_COLORS[cat];
  }
  return COLOR_WHITE;
}

/**
 * Format file size to human readable string
 * Caller must free the returned string
 */
char *format_size(off_t size) {
  char *result = malloc(32);
  if (!result)
    return NULL;

  const char *units[] = {"B", "KB", "MB", "GB", "TB"};
  int unit_index = 0;
  double size_d = (double)size;

  while (size_d >= 1024.0 && unit_index < 4) {
    size_d /= 1024.0;
    unit_index++;
  }

  if (unit_index == 0) {
    snprintf(result, 32, "%lld %s", (long long)size, units[unit_index]);
  } else {
    snprintf(result, 32, "%.2f %s", size_d, units[unit_index]);
  }

  return result;
}

/**
 * Format time to readable string
 * Caller must free the returned string
 */
char *format_time(time_t time) {
  char *result = malloc(64);
  if (!result)
    return NULL;

  struct tm *tm_info = localtime(&time);
  strftime(result, 64, "%Y-%m-%d %H:%M:%S", tm_info);

  return result;
}

/**
 * Convert string to lowercase in place
 */
int string_to_lower(char *str) {
  if (!str)
    return -1;

  for (int i = 0; str[i]; i++) {
    str[i] = tolower((unsigned char)str[i]);
  }
  return 0;
}

/**
 * Remove trailing newline from string
 */
void trim_newline(char *str) {
  if (!str)
    return;

  size_t len = strlen(str);
  while (len > 0 && (str[len - 1] == '\n' || str[len - 1] == '\r')) {
    str[--len] = '\0';
  }
}
