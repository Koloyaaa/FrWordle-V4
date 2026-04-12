---
name: "code_editor"
description: "Safely edits PHP/HTML/JS/CSS files. Invoke when user requests file modifications, bug fixes, or feature additions to web project files."
---

# Code Editor Skill

This skill safely edits PHP, HTML, JS, and CSS files in the project. It follows project coding standards from command.txt, creates backups before modifications, and ensures proper indentation and syntax.

## Input

- `file_path`: Absolute path to the file to edit
- `modifications`: Detailed description of changes (diff format or natural language)

## Output

- `summary`: Modification summary including lines changed, affected functions/classes
- `backup_path`: Path to the backup file created

## Workflow

1. Receive file path and modification request from user
2. Read `command.txt` to understand coding standards
3. Read original file content using `read` tool
4. Generate modified code preserving indentation and comments
5. Write modified content to file using `write` tool
6. Create backup file with `.bak` extension
7. Return modification summary

## Example Usage

User: "Update the database connection in includes/db.php to use PDO"

Skill:
1. Reads command.txt for PHP coding standards
2. Reads includes/db.php
3. Generates modified code with PDO connection
4. Writes to includes/db.php
5. Creates includes/db.php.bak
6. Returns: "Modified 3 lines in includes/db.php. Changed mysqli_connect to PDO. Backup created at includes/db.php.bak"