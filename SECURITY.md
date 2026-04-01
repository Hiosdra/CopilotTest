# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of CopilotTest seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Disclose Publicly

Please do **not** create a public GitHub issue for security vulnerabilities. Public disclosure could put the entire community at risk.

### 2. Report Privately

Send a detailed report to the project maintainers via:

- **GitHub Security Advisories**: [Report a vulnerability](https://github.com/Hiosdra/CopilotTest/security/advisories/new) (recommended)

### 3. Include Relevant Information

When reporting a vulnerability, please include:

- **Description**: Clear explanation of the vulnerability
- **Impact**: What could an attacker achieve?
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Affected Versions**: Which versions are affected?
- **Proof of Concept**: Code or commands that demonstrate the issue
- **Suggested Fix**: If you have ideas for remediation
- **Environment**:
  - CopilotTest version
  - Node.js version
  - Operating system
  - Platform (web, api, mobile)

### 4. What to Expect

After you submit a vulnerability report:

1. **Acknowledgment**: We'll acknowledge receipt within 48 hours
2. **Assessment**: We'll investigate and assess the severity
3. **Updates**: We'll keep you informed of our progress
4. **Timeline**: We aim to:
   - Initial response: Within 48 hours
   - Severity assessment: Within 5 business days
   - Patch development: Varies by complexity
   - Public disclosure: After patch is available

### 5. Coordinated Disclosure

We believe in coordinated disclosure:

- We'll work with you to understand and reproduce the issue
- We'll develop and test a fix
- We'll prepare a security advisory
- We'll release the fix and advisory together
- We'll credit you in the advisory (unless you prefer to remain anonymous)

## Security Best Practices

When using CopilotTest, follow these security best practices:

### Credential Management

- **Never commit secrets**: Use environment variables for sensitive data
- **Use .env files**: Store credentials in `.env` files (already in `.gitignore`)
- **Rotate credentials**: Regularly update API keys and passwords
- **Limit permissions**: Use least-privilege principles for test accounts

### Configuration Security

CopilotTest uses the GitHub Copilot SDK for AI-powered test execution. The SDK handles authentication automatically through your GitHub credentials - no API keys are required in your test configuration.

```yaml
# ✅ Good: copilot-test.config.yaml (no API keys needed)
platform: web
baseUrl: "https://example.com"
stepTimeout: 30000
# The GitHub Copilot SDK handles authentication automatically
```

> **❌ Bad**: Don't add API keys to configuration — CopilotTest doesn't use or require them.

### Test Data

- **Avoid PII**: Don't use real personal data in tests
- **Synthetic data**: Generate fake data for testing
- **Data cleanup**: Clean up test data after execution
- **Isolation**: Use separate test environments

### CI/CD Security

- **Secrets management**: Use GitHub Secrets or similar for CI/CD
- **Access control**: Limit who can modify CI/CD pipelines
- **Audit logs**: Review CI/CD execution logs
- **Dependency scanning**: Regularly scan dependencies

### MCP Server Security

- **Trusted sources**: Only use MCP servers from trusted sources
- **Sandbox testing**: Test MCP servers in isolated environments first
- **Version pinning**: Pin specific versions of MCP servers
- **Regular updates**: Keep MCP servers updated

### Network Security

- **HTTPS**: Always use HTTPS for API testing
- **Certificate validation**: Don't disable SSL verification
- **Network isolation**: Use isolated test networks when possible
- **Rate limiting**: Respect rate limits to avoid DoS

## Known Security Considerations

### AI-Powered Execution

CopilotTest uses AI to interpret and execute test steps:

- **Review AI actions**: Monitor what the AI does in test execution
- **Limit scope**: Use appropriate permissions for test accounts
- **Validate results**: Don't blindly trust AI-generated steps
- **Audit logs**: Review execution logs for unexpected behavior

### MCP Servers

MCP servers execute with system access:

- **Understand capabilities**: Know what each MCP server can do
- **Limit permissions**: Run with minimal required permissions
- **Monitor execution**: Watch for unexpected system calls
- **Sandbox when possible**: Use containers or VMs for isolation

### Dependencies

- **Regular updates**: Keep dependencies up to date
- **Vulnerability scanning**: Use tools like `npm audit`
- **Lock files**: Commit lock files for reproducible builds
- **Review changes**: Check changelogs before updating

## Security Updates

We'll announce security updates through:

1. **GitHub Security Advisories**: Official advisories on GitHub
2. **GitHub Releases**: Release notes on the [Releases](https://github.com/Hiosdra/CopilotTest/releases) page
3. **npm**: Security metadata in package registry

## Security-Related Configuration

### Timeouts

Configure appropriate timeouts to prevent resource exhaustion:

```yaml
# copilot-test.config.yaml
stepTimeout: 30000     # 30 seconds per step
workerTimeout: 60000   # 1 minute per worker
```

### Retry Limits

Limit retry attempts to prevent infinite loops:

```yaml
# copilot-test.config.yaml
retry:
  enabled: true
  stepRetries: 3
  strategy: exponential
  initialDelay: 1000
  backoffFactor: 2
```

### Debug Mode

Be cautious with debug mode in production:

```yaml
# copilot-test.config.yaml
# Enable debug mode only in development environments
debugMode: true
```

> **Note**: Ensure `debugMode` is set to `false` (or omitted) in production configurations.

## Questions?

If you have questions about security but haven't found a vulnerability:

- Open a [Discussion](https://github.com/Hiosdra/CopilotTest/discussions)
- Check the [Documentation](https://github.com/Hiosdra/CopilotTest/tree/main/docs)
- Review existing [Security Advisories](https://github.com/Hiosdra/CopilotTest/security/advisories)

## Acknowledgments

We appreciate security researchers and users who help keep CopilotTest secure. Responsible disclosure helps protect the entire community.

Thank you for helping keep CopilotTest and its users safe!
