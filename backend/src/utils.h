/**
 * File Organizer - Utility Functions Header
 * OS Project 2026
 * 
 * Common utility functions and definitions
 */

#ifndef UTILS_H
#define UTILS_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

// ANSI Color Codes for Terminal Output
#define COLOR_RESET   "\033[0m"
#define COLOR_RED     "\033[31m"
#define COLOR_GREEN   "\033[32m"
#define COLOR_YELLOW  "\033[33m"
#define COLOR_BLUE    "\033[34m"
#define COLOR_MAGENTA "\033[35m"
#define COLOR_CYAN    "\033[36m"
#define COLOR_WHITE   "\033[37m"
#define COLOR_BOLD    "\033[1m"

// Maximum path length
#define MAX_PATH_LEN 4096
#define MAX_FILENAME_LEN 256
#define MAX_EXT_LEN 32

// File categories
typedef enum {
    CAT_DOCUMENTS,
    CAT_IMAGES,
    CAT_VIDEOS,
    CAT_MUSIC,
    CAT_ARCHIVES,
    CAT_CODE,
    CAT_OTHERS,
    CAT_COUNT  // Number of categories
} FileCategory;

// Category names for folder creation
extern const char* CATEGORY_NAMES[];

// Category colors for display
extern const char* CATEGORY_COLORS[];

// Function prototypes
void print_header(void);
void print_menu(void);
void print_success(const char* message);
void print_error(const char* message);
void print_info(const char* message);
void print_warning(const char* message);
void clear_screen(void);
const char* get_file_extension(const char* filename);
FileCategory get_category_from_extension(const char* extension);
const char* get_category_name(FileCategory cat);
const char* get_category_color(FileCategory cat);
char* format_size(off_t size);
char* format_time(time_t time);
int string_to_lower(char* str);
void trim_newline(char* str);

#endif // UTILS_H
