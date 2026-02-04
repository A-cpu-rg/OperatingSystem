# File Organizer - C Backend Makefile
# OS Project 2026 - Team Alpha

CC = gcc
CFLAGS = -Wall -Wextra -g -std=c11
TARGET = file_organizer

# Source files
SRCS = src/main.c src/utils.c src/scanner.c src/metadata.c src/journal.c src/organizer.c
OBJS = $(SRCS:.c=.o)

# Default target
all: $(TARGET)

# Link executable
$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $(TARGET) $(OBJS)

# Compile source files
src/%.o: src/%.c
	$(CC) $(CFLAGS) -c $< -o $@

# Clean build artifacts
clean:
	rm -f $(TARGET) src/*.o

# Run the program
run: $(TARGET)
	./$(TARGET)

# Debug build
debug: CFLAGS += -DDEBUG
debug: clean all

# Help
help:
	@echo "File Organizer Build System"
	@echo "Usage:"
	@echo "  make        - Build the file organizer"
	@echo "  make run    - Build and run"
	@echo "  make clean  - Remove build artifacts"
	@echo "  make debug  - Build with debug symbols"

.PHONY: all clean run debug help
