---
name: "code_tester"
description: "Executes unit and integration tests on modified code. Invoke after code modifications and fixes to ensure functionality remains correct."
---

# Code Tester Skill

This skill executes unit and integration tests on PHP/JS code. It detects available test frameworks, runs tests, and handles failures by returning to error_fixer if needed.

## Input

- `file_path`: Path to modified file(s) to test
- `test_type`: "unit", "integration", or "all"

## Output

- `results`: Test results with pass/fail status
- `coverage`: Coverage information if available
- `report_path`: Path to test report file

## Workflow

1. Detect test framework (PHPUnit, Jest, Mocha, etc.)
2. If tests exist, run `phpunit` or `npm test`
3. If no test framework, generate temporary test scripts using assert/console.assert
4. Execute tests and capture results
5. Output pass/fail details and coverage
6. If tests fail, send failure info to error_fixer
7. Generate test report to `test_report.txt`

## Example Usage

User: "Test the changes in CourseTable/js/main.js"

Skill:
1. Detects Jest test framework
2. Runs npm test
3. Captures results
4. Generates test_report.txt
5. Returns: "3/3 tests passed, 100% coverage"