/**
 * File Organizer - Journal Module Header
 * OS Project 2026
 *
 * Transaction logging and undo functionality
 *
 * OS Concepts:
 * - Journaling (similar to ext4 filesystem journal)
 * - File I/O operations
 * - Transaction logging for recovery
 */

#ifndef JOURNAL_H
#define JOURNAL_H

#include "utils.h"
#include <time.h>

// Journal file name
#define JOURNAL_FILE ".file_organizer_journal"
#define MAX_JOURNAL_ENTRIES 1000

// Operation types
typedef enum { OP_MOVE, OP_CREATE_DIR, OP_DELETE } OperationType;

// Journal entry structure
typedef struct {
  time_t timestamp;
  OperationType operation;
  char source_path[MAX_PATH_LEN];
  char dest_path[MAX_PATH_LEN];
  int completed; // 1 if operation completed successfully
} JournalEntry;

// Journal structure
typedef struct {
  char journal_path[MAX_PATH_LEN];
  JournalEntry *entries;
  int count;
  int capacity;
  int session_start; // Index where current session started
} Journal;

/**
 * Initialize journal system
 * Creates or loads existing journal file
 *
 * @param base_path Directory where journal file will be stored
 * @return Pointer to Journal or NULL on error
 */
Journal *journal_init(const char *base_path);

/**
 * Free journal resources
 * @param journal Pointer to Journal
 */
void journal_free(Journal *journal);

/**
 * Log a file operation before executing it
 * This implements the "write-ahead" part of journaling
 *
 * @param journal Pointer to Journal
 * @param op Operation type
 * @param source Source path
 * @param dest Destination path (can be NULL for delete)
 * @return Entry index on success, -1 on error
 */
int journal_log_operation(Journal *journal, OperationType op,
                          const char *source, const char *dest);

/**
 * Mark operation as completed
 * Call after successful operation
 *
 * @param journal Pointer to Journal
 * @param entry_index Index returned by journal_log_operation
 * @return 0 on success, -1 on error
 */
int journal_mark_complete(Journal *journal, int entry_index);

/**
 * Undo operations from current session
 * Reverses all operations in reverse order
 *
 * @param journal Pointer to Journal
 * @return Number of operations undone, -1 on error
 */
int journal_undo_session(Journal *journal);

/**
 * Save journal to disk
 * @param journal Pointer to Journal
 * @return 0 on success, -1 on error
 */
int journal_save(const Journal *journal);

/**
 * Load journal from disk
 * @param journal Pointer to Journal
 * @return 0 on success, -1 on error
 */
int journal_load(Journal *journal);

/**
 * Print journal history
 * @param journal Pointer to Journal
 */
void journal_print_history(const Journal *journal);

/**
 * Clear all journal entries
 * @param journal Pointer to Journal
 */
void journal_clear(Journal *journal);

/**
 * Get operation name string
 * @param op Operation type
 * @return String representation
 */
const char *journal_op_to_string(OperationType op);

#endif // JOURNAL_H
