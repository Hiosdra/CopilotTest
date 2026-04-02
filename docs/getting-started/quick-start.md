# Quick Start

Get up and running with CopilotTest in under 5 minutes!

## 1. Initialize a New Project

```bash
npx copilot-test init
```

Follow the prompts to set up your project. For this quick start, select:
- Platform: **web**
- Model: **gpt-5-mini** (0x multiplier — included in your Copilot plan at no extra cost)

> 💡 **Cost tip:** `gpt-5-mini` has a **0x multiplier**, meaning it doesn't consume premium requests. Always prefer 0x multiplier models for routine test runs. See the [Configuration Guide](../guides/configuration.md#recommended-0x-multiplier-models) for all available 0x models.

## 2. Set Your GitHub Token

```bash
export GITHUB_TOKEN=your_github_token_here
```

## 3. Run the Example Test

The `init` command creates an example test. Run it:

```bash
npx copilot-test run tests/login.feature.md
```

You should see output like:

```
🧪 CopilotTest - Test Execution
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature: Example Web Test
  Scenario: Basic navigation
    ✓ Given I am on https://example.com (1.2s)
    ✓ When I click the "More information" link (0.8s)
    ✓ Then I should see "IANA" in the page title (0.3s)

✨ Results: 1 feature, 1 scenario, 3 steps
   ✓ Passed: 1 scenario (3 steps)
   ✗ Failed: 0 scenarios

📊 Report: copilot-test-results/report.html
```

## 4. View the Test Report

Open the HTML report in your browser:

```bash
# On macOS
open copilot-test-results/report.html

# On Linux
xdg-open copilot-test-results/report.html

# Or use the CLI
npx copilot-test report
```

The report shows:
- Test execution summary
- Detailed step-by-step results
- Screenshots (for failures)
- AI reasoning for each step
- Performance metrics

## 5. Write Your First Custom Test

Create a new file `tests/my-first-test.feature.md`:

```markdown
---
platform: web
tags: [search]
---

# Feature: Google Search

## Scenario: Search for CopilotTest
- Given I am on https://www.google.com
- When I type "CopilotTest BDD framework" in the search box
- And I press Enter
- Then I should see search results
- And the results should contain "test"
```

Tests are plain Markdown files — no imports or build step needed.

Run your test:

```bash
npx copilot-test run tests/my-first-test.feature.md
```

## 6. Understanding the Test Structure

Let's break down the `.feature.md` format:

```markdown
---                                    # YAML frontmatter
platform: web                          # Target platform (web, api, mobile)
tags: [search]                         # Tags for filtering
---

# Feature: Google Search              # Feature name (H1 heading)

## Scenario: Search for CopilotTest   # Scenario name (H2 heading)
- Given I am on https://www.google.com         # Setup step
- When I type "..." in the search box           # Action step
- And I press Enter                             # Additional action
- Then I should see search results              # Assertion step
- And the results should contain "test"         # Additional assertion
```

**Key points:**
- **Frontmatter** (`---`): YAML metadata for platform and tags
- **`# Feature:`**: Declares the feature (one per file)
- **`## Scenario:`**: Declares a scenario (multiple allowed per file)
- **`- Given/When/Then/And`**: BDD steps as Markdown list items
- **Configuration** lives in `copilot-test.config.yaml`, not in the test file

## Key Concepts

### No Step Implementations Needed

Unlike traditional BDD frameworks, you don't write step definitions. The AI interprets your natural language steps and executes them automatically.

### Write What You Mean

Steps should be clear and specific:

✅ **Good:**
- "I am on https://example.com"
- "I click the 'Submit' button"
- "I should see an error message 'Invalid email'"

❌ **Avoid:**
- "I navigate" (missing URL)
- "I click" (which element?)
- "I should see an error" (what message?)

### Multiple Platforms

You can test web, API, and mobile apps with the same Markdown format. Just set the `platform` in the frontmatter:

```markdown
---
platform: web      # or: api, mobile
---
```

Each `.feature.md` file targets a single platform. Create separate files for different platforms (e.g., `login-web.feature.md`, `users-api.feature.md`).

## Next Steps

Now that you have CopilotTest running, explore more:

- [Your First Test](./your-first-test.md) - Detailed walkthrough
- [Running Tests](./running-tests.md) - CLI options and filtering
- [Best Practices](../guides/best-practices.md) - Write effective tests
- [Web Testing Guide](../guides/web-testing.md) - Deep dive into web testing

## Quick Tips

1. **Start simple**: Begin with basic navigation and assertions
2. **Be specific**: Clear steps help the AI understand your intent
3. **Use headless: false** initially to watch tests execute
4. **Check reports**: Review AI reasoning when tests fail
5. **Use tags**: Organize tests with `@smoke`, `@regression`, etc.

Tags can be set in the YAML frontmatter or inline with `@tag` annotations:

```markdown
---
platform: web
tags: [smoke, critical]
---

# Feature: Login

## Scenario: Admin login @auth
- Given I am on the login page
- When I enter valid admin credentials
- Then I should see the admin dashboard
```

**Note:** The CLI currently parses the `--tag` flag but doesn't apply filtering during execution. Tag-based filtering support is planned for future releases.

## Getting Help

- [Troubleshooting](../troubleshooting/common-errors.md)
- [AI Interpretation Issues](../troubleshooting/ai-interpretation-issues.md)
