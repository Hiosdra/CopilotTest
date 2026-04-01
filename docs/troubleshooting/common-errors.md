# Common Errors

Solutions to common errors you might encounter when using CopilotTest.

## Setup & Installation Errors

### Error: Cannot find module 'copilot-test'

**Symptoms:**
```
Error: Cannot find module 'copilot-test'
```

**Solutions:**

1. **Install CopilotTest:**
   ```bash
   npm install copilot-test
   ```

2. **Check package.json:**
   ```json
   {
     "dependencies": {
       "copilot-test": "^0.1.0"
     }
   }
   ```

3. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Error: GITHUB_TOKEN not set

**Symptoms:**
```
Error: GITHUB_TOKEN environment variable is required
```

**Solutions:**

1. **Set the environment variable:**
   ```bash
   export GITHUB_TOKEN=your_github_token_here
   ```

2. **Add to your shell profile:**
   ```bash
   # ~/.bashrc or ~/.zshrc
   export GITHUB_TOKEN=your_github_token_here
   ```

3. **Verify it's set:**
   ```bash
   echo $GITHUB_TOKEN
   ```

### Error: playwright not installed

**Symptoms:**
```
Error: Playwright browsers not installed
```

**Solutions:**

```bash
# Install Playwright browsers
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Or install all
npx playwright install
```

## Configuration Errors

### Error: Invalid configuration

**Symptoms:**
```
Error: Invalid configuration: platforms is required
```

**Solutions:**

**Ensure you have a valid configuration:**
```yaml
# copilot-test.config.yaml
model: gpt-4o
platforms:
  web:
    type: web
    browser: chromium
```

### Error: Unknown platform

**Symptoms:**
```
Error: Unknown platform: 'mobile'
```

**Solutions:**

**Import and configure the platform:**
```yaml
# copilot-test.config.yaml
platforms:
  mobile:
    type: mobile
    device: emulator-5554
    appPackage: com.example.app
```

## Runtime Errors

### Error: Step timeout

**Symptoms:**
```
✗ When I click the Submit button
Error: Step timed out after 30000ms
```

**Solutions:**

1. **Increase timeout:**
   ```yaml
   # copilot-test.config.yaml
   stepTimeout: 60000  # 60 seconds
   ```

2. **Add explicit waits:**
   ```markdown
   - When I wait for the page to load
   - And I click the Submit button
   ```

3. **Check if element exists:**
   - Run with `headless: false` to see what's happening
   - Verify the element selector is correct
   - Ensure the page has fully loaded

### Error: Element not found

**Symptoms:**
```
✗ When I click the "Login" button
Error: Element not found: button with text "Login"
```

**Solutions:**

1. **Check exact text:**
   ```markdown
   <!-- Wrong case -->
   - When I click the "login" button   <!-- ✗ -->

   <!-- Correct case -->
   - When I click the "Login" button   <!-- ✓ -->
   ```

2. **Use partial matching:**
   ```markdown
   - When I click the button containing "Login"
   ```

3. **Wait for element:**
   ```markdown
   - When I wait for the Login button to appear
   - And I click the Login button
   ```

4. **Check page loaded:**
   ```markdown
   - Given I am on https://example.com/login
   - And the page has finished loading
   - When I click the "Login" button
   ```

### Error: Connection refused

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Solutions:**

1. **Start your application:**
   ```bash
   # Ensure your app is running
   npm run dev
   # or
   npm start
   ```

2. **Check the URL:**
   ```yaml
   # copilot-test.config.yaml
   platforms:
     web:
       type: web
       baseUrl: http://localhost:3000  # Verify port
   ```

3. **Verify server is accessible:**
   ```bash
   curl http://localhost:3000
   ```

### Error: 401 Unauthorized

**Symptoms:**
```
✗ When I send a GET request to /api/users
Error: 401 Unauthorized
```

**Solutions:**

1. **Check authentication token:**
   ```yaml
   # copilot-test.config.yaml
   platforms:
     api:
       type: api
       baseUrl: https://api.example.com
       defaultHeaders:
         Authorization: "Bearer ${API_TOKEN}"
   ```

2. **Verify token is set:**
   ```bash
   echo $API_TOKEN
   ```

3. **Check token expiry:**
   - Generate a new token
   - Update environment variable

### Error: Failed to connect to MCP server

**Symptoms:**
```
Error: Failed to connect to MCP server: playwright
```

**Solutions:**

1. **Check MCP server installation:**
   ```bash
   npm list @playwright/mcp
   ```

2. **Reinstall MCP servers:**
   ```bash
   npm install @playwright/mcp
   ```

3. **Check MCP configuration:**
   ```yaml
   # copilot-test.config.yaml
   mcpServers:
     playwright:
       type: stdio
       command: npx
       args:
         - "@playwright/mcp"
         - "--browser"
         - chromium
   ```

## Mobile Testing Errors

### Error: No devices found

**Symptoms:**
```
Error: No Android devices found
```

**Solutions:**

1. **Check ADB:**
   ```bash
   adb devices
   ```

2. **Start emulator:**
   ```bash
   emulator -avd Pixel_6_API_33
   ```

3. **Connect physical device:**
   - Enable USB debugging on device
   - Connect via USB
   - Accept debugging prompt

### Error: App not installed

**Symptoms:**
```
Error: App package 'com.example.app' not found
```

**Solutions:**

1. **Install the app:**
   ```bash
   adb install path/to/app.apk
   ```

2. **Verify installation:**
   ```bash
   adb shell pm list packages | grep com.example.app
   ```

3. **Check package name:**
   ```yaml
   # copilot-test.config.yaml
   platforms:
     mobile:
       type: mobile
       appPackage: com.example.app    # Verify correct package
       appActivity: .MainActivity
   ```

## API Testing Errors

### Error: Invalid JSON

**Symptoms:**
```
✗ When I send a POST request to /users
Error: Invalid JSON in request body
```

**Solutions:**

**Ensure valid JSON syntax:**
```markdown
- When I send a POST request to /users
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```
```

**Check for:**
- Missing commas
- Unquoted keys
- Trailing commas
- Single quotes (use double quotes)

### Error: CORS error

**Symptoms:**
```
Error: Access to fetch at 'https://api.example.com' has been blocked by CORS policy
```

**Solutions:**

1. **Configure CORS on server:**
   ```javascript
   // Express example
   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true
   }));
   ```

2. **Use API platform instead of web:**
   ```typescript
   // Use API platform for API testing
   test(apiFeature, 'api');  // Not 'web'
   ```

## Report Errors

### Error: Cannot generate report

**Symptoms:**
```
Error: Failed to generate HTML report
```

**Solutions:**

1. **Check output directory exists:**
   ```bash
   mkdir -p copilot-test-results
   ```

2. **Check write permissions:**
   ```bash
   chmod -R 755 copilot-test-results
   ```

3. **Verify disk space:**
   ```bash
   df -h
   ```

## Parallel Execution Errors

### Error: Worker timeout

**Symptoms:**
```
Error: Worker timed out after 300000ms
```

**Solutions:**

1. **Increase worker timeout:**
   ```yaml
   # copilot-test.config.yaml
   parallel: true
   workerTimeout: 600000  # 10 minutes
   ```

2. **Reduce worker count:**
   ```yaml
   # copilot-test.config.yaml
   maxWorkers: 2  # Reduce from 4 to 2
   ```

### Error: Too many workers

**Symptoms:**
```
Error: Cannot spawn worker: Resource temporarily unavailable
```

**Solutions:**

**Reduce worker count:**
```yaml
# copilot-test.config.yaml
parallel: true
maxWorkers: 2  # Instead of 'auto' or high number
```

## Watch Mode Errors

### Error: ENOSPC - System limit for number of file watchers reached

**Symptoms:**
```
Error: ENOSPC: System limit for number of file watchers reached
```

**Solutions:**

**Increase file watcher limit (Linux):**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Debug Mode Errors

### Error: Cannot start debug session

**Symptoms:**
```
Error: Failed to start interactive debug session
```

**Solutions:**

1. **Ensure TTY available:**
   - Debug mode requires interactive terminal
   - Won't work in CI without TTY

2. **Disable interactive mode in CI:**
   ```yaml
   # copilot-test.config.yaml
   # Disable debug mode in CI by using environment-specific config
   # or set debugMode: false in CI overrides
   debugMode: false
   interactive: false
   ```

## Common Pitfalls

### 1. Using Relative Paths Without Base URL

❌ **Wrong:**
```markdown
- Given I am on /login   <!-- Will fail without baseUrl -->
```

✅ **Right:**
```yaml
# Option 1: Set baseUrl in copilot-test.config.yaml
platforms:
  web:
    type: web
    baseUrl: https://example.com
```
```markdown
- Given I am on /login   <!-- Now works -->
```

```markdown
<!-- Option 2: Use full URL -->
- Given I am on https://example.com/login
```

### 2. Missing Platform in Config

❌ **Wrong:**
```yaml
# copilot-test.config.yaml
# No platforms defined
model: gpt-4o
```

✅ **Right:**
```yaml
# copilot-test.config.yaml
model: gpt-4o
platforms:
  web:
    type: web
```

### 3. Missing Front Matter in Test File

❌ **Wrong:**
```markdown
# Feature: My Test
## Scenario: Test something
- Given a step
```

✅ **Right:**
```markdown
---
platform: web
---
# Feature: My Test
## Scenario: Test something
- Given a step
```

### 4. Platform Mismatch

❌ **Wrong:**
```yaml
# copilot-test.config.yaml
platforms:
  web:
    type: web
```
```markdown
<!-- tests/api-test.feature.md -->
---
platform: api   <!-- Error: platform 'api' not configured -->
---
```

✅ **Right:**
```yaml
# copilot-test.config.yaml
platforms:
  web:
    type: web
  api:
    type: api    # Configure the platform you're using
```
```markdown
<!-- tests/api-test.feature.md -->
---
platform: api   <!-- Now works -->
---
```

## Getting More Help

If you're still experiencing issues:

1. **Enable debug mode:**
   ```yaml
   # copilot-test.config.yaml
   debugMode: true
   ```

2. **Check the HTML report:**
   - Open `copilot-test-results/report.html`
   - Review AI reasoning
   - Check error messages

3. **Search existing issues:**
   - [GitHub Issues](https://github.com/Hiosdra/CopilotTest/issues)

4. **Create a minimal reproduction:**
   - Simplify your test to the smallest failing case
   - Share configuration and test code

5. **Report the bug:**
   - Include error message
   - Attach logs and screenshots
   - Mention CopilotTest version
   - Describe expected vs actual behavior

## Next Steps

- [AI Interpretation Issues](./ai-interpretation-issues.md)
- [Debugging Guide](../guides/debugging.md)
