# Contributing to CopilotTest

Thank you for your interest in contributing to CopilotTest! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors. Please be kind, considerate, and constructive in your interactions.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally: `git clone https://github.com/YOUR_USERNAME/CopilotTest.git`
3. Add the upstream repository: `git remote add upstream https://github.com/Hiosdra/CopilotTest.git`
4. Create a new branch for your changes: `git checkout -b feature/your-feature-name`

## How to Contribute

There are many ways to contribute to CopilotTest:

- **Bug Reports**: Report bugs via [GitHub Issues](https://github.com/Hiosdra/CopilotTest/issues)
- **Feature Requests**: Suggest new features or improvements
- **Documentation**: Improve or add documentation
- **Code**: Fix bugs or implement new features
- **Examples**: Add new example test scenarios
- **Testing**: Add or improve tests

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- TypeScript knowledge

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Run tests:
   ```bash
   npm test
   ```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm test` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:all` - Run all example tests
- `npm run test:web` - Run web platform tests
- `npm run test:api` - Run API platform tests
- `npm run test:mobile` - Run mobile platform tests

## Project Structure

```
CopilotTest/
├── src/                    # Source code
│   ├── cli/               # CLI implementation
│   ├── platforms/         # Platform implementations (web, api, mobile)
│   ├── parser.ts         # Markdown/YAML parser
│   ├── runner.ts         # Test runner
│   ├── runtime.ts        # Test execution runtime
│   └── types.ts          # TypeScript types
├── tests/                 # Test files
│   ├── integration/      # Integration tests
│   └── *.feature.md      # Markdown test specs
├── examples/             # Example projects
├── docs/                 # Documentation
├── copilot-test.config.yaml  # Project configuration
└── dist/                 # Compiled output
```

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Provide type annotations for public APIs
- Avoid `any` types unless absolutely necessary

### Code Style

- Use 2 spaces for indentation
- Use double quotes for strings
- Add semicolons at the end of statements
- Keep lines under 120 characters when possible
- Use descriptive variable and function names
- Add comments for complex logic

### Naming Conventions

- Use `camelCase` for variables and functions
- Use `PascalCase` for classes and types
- Use `UPPER_CASE` for constants
- Use descriptive names that reflect purpose

### File Organization

- One main export per file when possible
- Group related functionality together
- Keep files focused and reasonably sized
- Use index files for clean exports

## Testing

### Writing Tests

- Write tests for all new features
- Update tests when modifying existing features
- Ensure tests are deterministic and isolated
- Use descriptive test names that explain what is being tested

### Test Structure

CopilotTest uses Markdown-based test files (`.feature.md`) with YAML frontmatter for configuration:

```markdown
---
platform: web
---

# Feature: Feature Name

## Scenario: Scenario Name

- Given A precondition
- When An action is performed
- Then An expected outcome occurs
```

Project-wide settings are defined in `copilot-test.config.yaml`.

### Running Tests

Before submitting a pull request:

1. Run unit tests: `npm test`
2. Run integration tests: `npm run test:integration`
3. Ensure all tests pass
4. Check that the build succeeds: `npm run build`

## Submitting Changes

### Pull Request Process

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Make your changes**:
   - Write clean, focused commits
   - Follow coding standards
   - Add or update tests
   - Update documentation if needed

3. **Test your changes**:
   ```bash
   npm run build
   npm test
   npm run test:integration
   ```

4. **Commit your changes**:
   - Use clear, descriptive commit messages
   - Reference issue numbers if applicable
   - Example: `fix: resolve CLI argument parsing issue (#123)`

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**:
   - Go to the [CopilotTest repository](https://github.com/Hiosdra/CopilotTest)
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template with:
     - Clear description of changes
     - Related issue numbers
     - Testing performed
     - Screenshots/examples if applicable

### Commit Message Format

We follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(api): add support for GraphQL testing
fix(web): resolve browser launch timeout issue
docs: update installation guide
```

### Pull Request Guidelines

- **Keep PRs focused**: One feature or fix per PR
- **Write good descriptions**: Explain what and why, not just how
- **Update documentation**: Keep docs in sync with code changes
- **Add tests**: Ensure adequate test coverage
- **Be responsive**: Address review feedback promptly
- **Be patient**: Maintainers will review as soon as possible

## Reporting Bugs

When reporting bugs, please include:

1. **Clear title**: Summarize the issue
2. **Description**: Detailed explanation of the bug
3. **Steps to reproduce**: How to trigger the bug
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens
6. **Environment**:
   - CopilotTest version
   - Node.js version
   - Operating system
   - Platform (web, api, mobile)
7. **Code sample**: Minimal reproducible example
8. **Screenshots**: If applicable
9. **Error messages**: Full error output

## Suggesting Enhancements

When suggesting enhancements:

1. **Check existing issues**: Avoid duplicates
2. **Clear use case**: Explain the problem you're solving
3. **Proposed solution**: Describe your idea
4. **Alternatives**: Other approaches considered
5. **Examples**: Show how it would work
6. **Impact**: Who would benefit and how

## Questions?

If you have questions about contributing:

- Open a [Discussion](https://github.com/Hiosdra/CopilotTest/discussions)
- Check existing [Issues](https://github.com/Hiosdra/CopilotTest/issues)
- Review the [Documentation](https://github.com/Hiosdra/CopilotTest/tree/main/docs)

## License

By contributing to CopilotTest, you agree that your contributions will be licensed under the MIT License.

## Recognition

We value all contributions! Contributors will be recognized in our release notes and documentation.

Thank you for contributing to CopilotTest! 🚀
