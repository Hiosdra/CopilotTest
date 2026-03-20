# Installation

Welcome to CopilotTest! This guide will walk you through installing and setting up CopilotTest for your project.

## Prerequisites

Before installing CopilotTest, ensure you have:

- **Node.js** version 18 or higher
- **npm** or **yarn** package manager
- A **GitHub account** with access to GitHub Copilot SDK
- **GITHUB_TOKEN** environment variable set

## Quick Install

### Global Installation (Recommended)

Install CopilotTest globally to use the CLI from anywhere:

```bash
npm install -g copilot-test
```

Verify the installation:

```bash
copilot-test --version
```

### Project Installation

Install CopilotTest as a development dependency in your project:

```bash
npm install --save-dev copilot-test
```

Or with yarn:

```bash
yarn add --dev copilot-test
```

## Setting Up Your First Project

Use the interactive CLI to scaffold a new test project:

```bash
copilot-test init
```

The CLI will prompt you for:

- **Project name**: Name of your test project
- **Platforms**: Choose from web, API, mobile, or multiple
- **AI Model**: Select the model (gpt-4o, gpt-4o-mini, claude-sonnet)
- **Language**: TypeScript or JavaScript
- **Install dependencies**: Automatically install required packages

### What Gets Created

The `init` command creates:

```
your-project/
├── copilot-test.config.ts    # Main configuration file
├── tests/                     # Test directory
│   ├── example-web.spec.ts    # Web test example
│   ├── example-api.spec.ts    # API test example (if selected)
│   └── example-mobile.spec.ts # Mobile test example (if selected)
├── package.json               # Node.js dependencies
├── tsconfig.json              # TypeScript config (if TS selected)
├── .gitignore                 # Git ignore file
└── README.md                  # Project README
```

## Environment Setup

### GitHub Token

CopilotTest requires a GitHub token to use the Copilot SDK:

```bash
export GITHUB_TOKEN=your_github_token_here
```

For permanent setup, add it to your shell profile:

```bash
# ~/.bashrc or ~/.zshrc
export GITHUB_TOKEN=your_github_token_here
```

### Platform-Specific Requirements

#### Web Testing

No additional setup required. Playwright MCP server is included.

#### API Testing

No additional setup required. curl MCP server is included.

#### Mobile Testing

For Android testing, you need:

1. **Android SDK** installed
2. **Android Emulator** or physical device connected
3. **ADB** (Android Debug Bridge) in your PATH

Check if ADB is available:

```bash
adb devices
```

## Verifying Installation

Run the health check command:

```bash
copilot-test doctor
```

This checks:
- ✓ Node.js version compatibility
- ✓ Dependencies installed correctly
- ✓ Configuration file valid
- ✓ GitHub token configured
- ✓ Platform tools available

## Next Steps

- [Quick Start Guide](./quick-start.md) - Run your first test
- [Your First Test](./your-first-test.md) - Write a test from scratch
- [Configuration Guide](../guides/configuration.md) - Configure CopilotTest

## Troubleshooting

### Common Installation Issues

#### Permission Denied (Global Install)

If you get permission errors during global installation:

```bash
# Use npx instead
npx copilot-test init

# Or install with prefix
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
npm install -g copilot-test
```

#### Module Not Found

If you see "Cannot find module" errors:

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### GitHub Token Issues

If authentication fails:

1. Verify your token has the required scopes
2. Check the token is exported in your current shell session
3. Try refreshing the token

```bash
echo $GITHUB_TOKEN  # Should display your token
```

### Getting Help

- [Troubleshooting Guide](../troubleshooting/common-errors.md)
- [GitHub Issues](https://github.com/Hiosdra/CopilotTest/issues)
- [Documentation Home](../../README.md)
