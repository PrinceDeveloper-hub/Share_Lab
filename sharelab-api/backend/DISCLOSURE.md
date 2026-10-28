# Disclosure

## Libraries and Frameworks

- **Laravel 11** - PHP web application framework
- **Laravel Sanctum** - API authentication (bearer tokens)
- **MariaDB** - Database management system
- **PHP 8.3** - Programming language runtime
- **Composer** - PHP dependency manager
- **Node.js / npm** - JavaScript runtime (for Vite build)
- **Pest PHP** - Testing framework (alternative to PHPUnit)
- **Ripgrep** - Content search (used by Grep tool)

## Starter Kits and Boilerplates

- Fresh Laravel 11 application scaffold
- Standard Laravel directory structure
- Default configuration files (cors.php, auth.php, etc.)

## AI Tools Used

- **Claude Code** - This project was built with assistance from Anthropic's Claude Code CLI tool
- Code generation, migration creation, and logic implementation were assisted by Claude Code
- All code has been reviewed, tested, and verified to be functional and correct

## Development Approach

- Phase-driven implementation (7 phases as specified in the master prompt)
- Test-driven development with unit and feature tests
- Convention-over-configuration following Laravel best practices
- PHP backed enums for all state types
- Response envelope pattern for all API responses
- HUMANS DECIDE principle: automation only recommends, every decision logged

## Assumptions

- MariaDB is available and accessible at 127.0.0.1:3306
- Database password is set by the user (not hardcoded)
- Vite dev server runs on localhost:5173
- All accounts use password "password" for demo accounts