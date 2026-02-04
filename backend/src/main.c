/**
 * File Organizer - Main Program
 * OS Project 2026 - Team Alpha
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>

#include "journal.h"
#include "metadata.h"
#include "organizer.h"
#include "scanner.h"
#include "utils.h"

static char g_target_path[MAX_PATH_LEN] = "";
static ScanResult *g_scan_result = NULL;
static Journal *g_journal = NULL;

int get_target_directory(void) {
  printf(COLOR_CYAN "\n📂 Enter directory path: " COLOR_RESET);
  if (fgets(g_target_path, MAX_PATH_LEN, stdin) == NULL)
    return -1;
  trim_newline(g_target_path);

  if (g_target_path[0] == '~') {
    char *home = getenv("HOME");
    if (home) {
      char temp[MAX_PATH_LEN];
      snprintf(temp, MAX_PATH_LEN, "%s%s", home, g_target_path + 1);
      strncpy(g_target_path, temp, MAX_PATH_LEN - 1);
    }
  }

  struct stat st;
  if (stat(g_target_path, &st) != 0 || !S_ISDIR(st.st_mode)) {
    print_error("Invalid directory");
    return -1;
  }

  print_success("Directory validated");
  if (g_journal)
    journal_free(g_journal);
  g_journal = journal_init(g_target_path);
  return 0;
}

void preview_files(void) {
  if (strlen(g_target_path) == 0 && get_target_directory() != 0)
    return;

  printf("\n" COLOR_BOLD "👁️  PREVIEW MODE" COLOR_RESET "\n");
  if (g_scan_result)
    scanner_free(g_scan_result);
  g_scan_result = scanner_init();
  if (!g_scan_result)
    return;

  printf("\n" COLOR_YELLOW "💡 OS: opendir(), readdir(), stat()" COLOR_RESET
         "\n\n");
  scanner_scan_directory(g_target_path, g_scan_result, 0);
  scanner_print_results(g_scan_result);
  scanner_print_summary(g_scan_result);
}

void organize_files(void) {
  if (!g_scan_result || g_scan_result->count == 0) {
    print_warning("Preview files first (option 1)");
    return;
  }

  printf(COLOR_YELLOW "\nProceed? (y/n): " COLOR_RESET);
  char c[10];
  if (fgets(c, sizeof(c), stdin) == NULL || (c[0] != 'y' && c[0] != 'Y'))
    return;

  OrganizeResult result;
  organizer_organize_files(g_scan_result, g_target_path, g_journal, &result);
  organizer_print_result(&result);
  scanner_free(g_scan_result);
  g_scan_result = NULL;
}

void undo_organization(void) {
  if (!g_journal) {
    print_warning("Set directory first");
    return;
  }
  printf(COLOR_YELLOW "\nUndo? (y/n): " COLOR_RESET);
  char c[10];
  if (fgets(c, sizeof(c), stdin) == NULL || (c[0] != 'y' && c[0] != 'Y'))
    return;
  journal_undo_session(g_journal);
}

void view_metadata(void) {
  if (strlen(g_target_path) == 0 && get_target_directory() != 0)
    return;
  printf(COLOR_CYAN "\nFilename (or 'all'): " COLOR_RESET);
  char fn[MAX_FILENAME_LEN];
  if (fgets(fn, sizeof(fn), stdin) == NULL)
    return;
  trim_newline(fn);

  if (strcmp(fn, "all") == 0) {
    if (g_scan_result)
      metadata_print_all(g_scan_result);
    else
      print_warning("Preview first");
  } else {
    char path[MAX_PATH_LEN];
    snprintf(path, MAX_PATH_LEN, "%s/%s", g_target_path, fn);
    FileMetadata meta;
    if (metadata_get(path, &meta) == 0)
      metadata_print(&meta);
  }
}

int main(int argc, char *argv[]) {
  int running = 1;
  char choice[10];

  if (argc > 1) {
    strncpy(g_target_path, argv[1], MAX_PATH_LEN - 1);
    struct stat st;
    if (stat(g_target_path, &st) == 0 && S_ISDIR(st.st_mode))
      g_journal = journal_init(g_target_path);
    else
      g_target_path[0] = '\0';
  }

  while (running) {
    print_header();
    if (strlen(g_target_path) > 0)
      printf(COLOR_CYAN "📁 Target: " COLOR_RESET "%s\n", g_target_path);
    print_menu();

    if (fgets(choice, sizeof(choice), stdin) == NULL)
      break;
    trim_newline(choice);

    switch (choice[0]) {
    case '1':
      preview_files();
      break;
    case '2':
      organize_files();
      break;
    case '3':
      undo_organization();
      break;
    case '4':
      view_metadata();
      break;
    case '5':
      journal_print_history(g_journal);
      break;
    case '6':
      running = 0;
      break;
    default:
      print_error("Invalid choice");
    }
    if (running) {
      printf("\nPress Enter...");
      getchar();
    }
  }

  if (g_scan_result)
    scanner_free(g_scan_result);
  if (g_journal)
    journal_free(g_journal);
  printf("\n" COLOR_GREEN "👋 Goodbye!" COLOR_RESET "\n\n");
  return 0;
}
