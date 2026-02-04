/**
 * File Organizer - Journal Module Implementation
 * OS Project 2026
 *
 * Transaction logging and undo functionality
 *
 * OS Concepts Demonstrated:
 * - Journaling: Similar to filesystem journals (ext4, NTFS)
 *   1. Write-ahead logging: Log operation BEFORE executing
 *   2. Execute the operation
 *   3. Mark as complete in journal
 *   4. On crash: Replay incomplete operations
 *
 * - File I/O: Using fopen, fprintf, fread, fclose
 * - Atomic operations: rename() for safe file updates
 */

#include "journal.h"
#include <errno.h>
#include <sys/stat.h>
#include <unistd.h>

/**
 * Get operation name string
 */
const char *journal_op_to_string(OperationType op) {
  switch (op) {
  case OP_MOVE:
    return "MOVE";
  case OP_CREATE_DIR:
    return "CREATE_DIR";
  case OP_DELETE:
    return "DELETE";
  default:
    return "UNKNOWN";
  }
}

/**
 * Initialize journal system
 *
 * Creates a new journal or loads existing one.
 * The journal file stores all operations for undo capability.
 */
Journal *journal_init(const char *base_path) {
  Journal *journal = malloc(sizeof(Journal));
  if (!journal) {
    print_error("Failed to allocate journal");
    return NULL;
  }

  // Set journal file path
  snprintf(journal->journal_path, MAX_PATH_LEN, "%s/%s", base_path,
           JOURNAL_FILE);

  // Allocate entries array
  journal->entries = malloc(sizeof(JournalEntry) * MAX_JOURNAL_ENTRIES);
  if (!journal->entries) {
    print_error("Failed to allocate journal entries");
    free(journal);
    return NULL;
  }

  journal->count = 0;
  journal->capacity = MAX_JOURNAL_ENTRIES;
  journal->session_start = 0;

  // Try to load existing journal
  if (access(journal->journal_path, F_OK) == 0) {
    journal_load(journal);
    journal->session_start = journal->count; // New session starts here
  }

  return journal;
}

/**
 * Free journal resources
 */
void journal_free(Journal *journal) {
  if (journal) {
    // Save before freeing
    journal_save(journal);

    if (journal->entries) {
      free(journal->entries);
    }
    free(journal);
  }
}

/**
 * Log a file operation before executing it
 *
 * This implements WRITE-AHEAD LOGGING:
 * We record what we're ABOUT to do before doing it.
 * If the program crashes, we can see incomplete operations.
 */
int journal_log_operation(Journal *journal, OperationType op,
                          const char *source, const char *dest) {
  if (!journal || journal->count >= journal->capacity) {
    return -1;
  }

  JournalEntry *entry = &journal->entries[journal->count];

  entry->timestamp = time(NULL);
  entry->operation = op;
  entry->completed = 0; // Not completed yet

  strncpy(entry->source_path, source ? source : "", MAX_PATH_LEN - 1);
  entry->source_path[MAX_PATH_LEN - 1] = '\0';

  strncpy(entry->dest_path, dest ? dest : "", MAX_PATH_LEN - 1);
  entry->dest_path[MAX_PATH_LEN - 1] = '\0';

  int index = journal->count;
  journal->count++;

  // Immediately save to disk (write-ahead)
  journal_save(journal);

  return index;
}

/**
 * Mark operation as completed
 *
 * Called after the actual file operation succeeds.
 * This completes the journaling cycle.
 */
int journal_mark_complete(Journal *journal, int entry_index) {
  if (!journal || entry_index < 0 || entry_index >= journal->count) {
    return -1;
  }

  journal->entries[entry_index].completed = 1;
  journal_save(journal);

  return 0;
}

/**
 * Undo operations from current session
 *
 * Reverses all operations in REVERSE order (LIFO).
 * This is how journaling enables recovery:
 * - Move operations are reversed (move file back)
 * - Directory creations are kept (no harm)
 */
int journal_undo_session(Journal *journal) {
  if (!journal)
    return -1;

  int undo_count = 0;

  printf("\n" COLOR_BOLD "↩️  UNDO OPERATIONS" COLOR_RESET "\n");
  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Work backwards from the last entry to session start
  for (int i = journal->count - 1; i >= journal->session_start; i--) {
    JournalEntry *entry = &journal->entries[i];

    // Only undo completed MOVE operations
    if (entry->operation == OP_MOVE && entry->completed) {
      printf(COLOR_YELLOW "  Undoing: " COLOR_RESET "%s\n",
             strrchr(entry->dest_path, '/') + 1);
      printf("    %s → %s\n", entry->dest_path, entry->source_path);

      // Reverse the move using rename()
      // OS Concept: rename() is atomic - either fully succeeds or fails
      if (rename(entry->dest_path, entry->source_path) == 0) {
        entry->completed = 0; // Mark as undone
        undo_count++;
        print_success("Reversed");
      } else {
        char error_msg[256];
        snprintf(error_msg, sizeof(error_msg), "Failed to undo: %s",
                 strerror(errno));
        print_error(error_msg);
      }
    }
  }

  printf("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (undo_count > 0) {
    char msg[64];
    snprintf(msg, sizeof(msg), "Undid %d operations", undo_count);
    print_success(msg);

    // Reset session start
    journal->session_start = journal->count;
    journal_save(journal);
  } else {
    print_info("No operations to undo in current session");
  }

  return undo_count;
}

/**
 * Save journal to disk
 *
 * Uses atomic write: write to temp file, then rename.
 * This prevents corruption if program crashes during write.
 */
int journal_save(const Journal *journal) {
  if (!journal)
    return -1;

  char temp_path[MAX_PATH_LEN];
  snprintf(temp_path, MAX_PATH_LEN, "%s.tmp", journal->journal_path);

  FILE *f = fopen(temp_path, "w");
  if (!f) {
    return -1;
  }

  // Write header
  fprintf(f, "# File Organizer Journal\n");
  fprintf(f, "# Format: timestamp|operation|completed|source|dest\n");
  fprintf(f, "SESSION_START=%d\n", journal->session_start);

  // Write entries
  for (int i = 0; i < journal->count; i++) {
    const JournalEntry *e = &journal->entries[i];
    fprintf(f, "%ld|%d|%d|%s|%s\n", (long)e->timestamp, e->operation,
            e->completed, e->source_path, e->dest_path);
  }

  fclose(f);

  // Atomic rename
  // OS Concept: rename() is atomic on POSIX systems
  // The journal file is either the old version or new version, never partial
  if (rename(temp_path, journal->journal_path) != 0) {
    unlink(temp_path);
    return -1;
  }

  return 0;
}

/**
 * Load journal from disk
 */
int journal_load(Journal *journal) {
  if (!journal)
    return -1;

  FILE *f = fopen(journal->journal_path, "r");
  if (!f) {
    return -1;
  }

  char line[MAX_PATH_LEN * 3];
  journal->count = 0;

  while (fgets(line, sizeof(line), f)) {
    // Skip comments
    if (line[0] == '#')
      continue;

    // Check for session start marker
    if (strncmp(line, "SESSION_START=", 14) == 0) {
      journal->session_start = atoi(line + 14);
      continue;
    }

    // Parse entry
    if (journal->count < journal->capacity) {
      JournalEntry *e = &journal->entries[journal->count];

      long ts;
      int op, comp;
      char src[MAX_PATH_LEN], dst[MAX_PATH_LEN];

      if (sscanf(line, "%ld|%d|%d|%[^|]|%[^\n]", &ts, &op, &comp, src, dst) >=
          4) {
        e->timestamp = (time_t)ts;
        e->operation = (OperationType)op;
        e->completed = comp;
        strncpy(e->source_path, src, MAX_PATH_LEN - 1);
        strncpy(e->dest_path, dst, MAX_PATH_LEN - 1);
        journal->count++;
      }
    }
  }

  fclose(f);
  return 0;
}

/**
 * Print journal history
 */
void journal_print_history(const Journal *journal) {
  if (!journal || journal->count == 0) {
    print_info("Journal is empty");
    return;
  }

  printf("\n" COLOR_BOLD "📜 JOURNAL HISTORY" COLOR_RESET "\n");
  printf(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  printf(COLOR_BOLD "%-20s %-12s %-8s %-30s" COLOR_RESET "\n", "Timestamp",
         "Operation", "Status", "File");
  printf(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (int i = 0; i < journal->count; i++) {
    const JournalEntry *e = &journal->entries[i];
    char *time_str = format_time(e->timestamp);

    const char *status =
        e->completed ? COLOR_GREEN "Done" : COLOR_YELLOW "Pending";
    const char *filename = strrchr(e->source_path, '/');
    filename = filename ? filename + 1 : e->source_path;

    printf("%-20s %-12s %s%-8s" COLOR_RESET " %-30s\n",
           time_str ? time_str : "N/A", journal_op_to_string(e->operation),
           e->completed ? COLOR_GREEN : COLOR_YELLOW,
           e->completed ? "Done" : "Pending", filename);

    if (time_str)
      free(time_str);
  }

  printf(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  printf("Total entries: %d | Session start: %d\n", journal->count,
         journal->session_start);

  // Explain journaling concept
  printf("\n" COLOR_YELLOW "💡 OS Concept: Journaling" COLOR_RESET "\n");
  printf("   Similar to ext4 filesystem journal:\n");
  printf("   1. Log operation BEFORE executing (write-ahead)\n");
  printf("   2. Execute the actual operation\n");
  printf("   3. Mark as complete in journal\n");
  printf("   4. On crash: Can detect and handle incomplete ops\n");
}

/**
 * Clear all journal entries
 */
void journal_clear(Journal *journal) {
  if (!journal)
    return;

  journal->count = 0;
  journal->session_start = 0;
  journal_save(journal);

  print_success("Journal cleared");
}
