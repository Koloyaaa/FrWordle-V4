---
name: "error_checker"
description: "Performs static syntax checking and error detection for PHP/HTML/JS/CSS code. Invoke when user requests code validation or after file modifications to catch errors."
---

# Error Checker Skill

This skill performs static syntax checking and common error detection for PHP, HTML, JS, and CSS files. It uses appropriate tools based on file type and outputs structured error lists with suggested fixes.

## Input

- `file_path`: Absolute path to file(s) to check (single file or array)
- `code_snippet`: Optional code snippet to check

## Output

- `errors`: Array of structured errors with type, line number, description, and suggested fix
- `log_path`: Path to error log file created

## Workflow

1. Receive file path or code snippet
2. Determine file type by extension
3. Call appropriate checker:
   - PHP: `php -l` + phpstan/psalm if available
   - JS/CSS: eslint/stylelint
   - HTML: vnu.jar or built-in rules
4. Parse results and structure errors
5. Write errors to `error_log_{timestamp}.txt`
6. Return structured error list

## Example Usage

User: "Check all PHP files in includes/ directory"

Skill:
1. Runs `php -l` on each PHP file
2. Parses syntax errors
3. Writes to error_log_20260409_143025.txt
4. Returns structured errors array