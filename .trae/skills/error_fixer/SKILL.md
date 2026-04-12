---
name: "error_fixer"
description: "Automatically or semi-automatically fixes errors detected by error_checker. Invoke when error_checker reports issues that need correction."
---

# Error Fixer Skill

This skill automatically fixes errors reported by error_checker. It applies fixes based on command.txt standards and iteratively validates until errors are resolved or manual intervention is needed.

## Input

- `error_log_path`: Path to error log file (optional, uses latest if not provided)

## Output

- `report`: Fix report listing resolved errors and those requiring manual intervention
- `errors_remaining`: Count of unresolved errors

## Workflow

1. Read latest error log file
2. For each error, attempt automatic fix based on command.txt standards:
   - Syntax errors → Direct correction
   - Undefined variables → Add definition or check scope
   - Indentation/formatting → Use Prettier or equivalent
3. After each fix, call error_checker to validate
4. Repeat until all errors fixed or no progress
5. Generate fix report
6. Update projectdetail.txt with modified files

## Example Usage

User: "Fix errors in login.php"

Skill:
1. Reads error log for login.php
2. Fixes syntax errors automatically
3. Validates with error_checker
4. Reports: "Fixed 3 errors, 1 error requires manual intervention"