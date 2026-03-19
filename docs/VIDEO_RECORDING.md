# Video Recording for Test Execution

## Overview

CopilotTest supports video recording of test execution to help with debugging, failure analysis, and documentation. Videos are automatically recorded during test runs and embedded in the HTML test report.

## Features

- **Flexible Recording Modes**: Record always, only on failure, or disable entirely
- **Multiple Formats**: Support for WebM and MP4 video formats
- **Quality Settings**: Configure video quality (low, medium, high) and FPS
- **Automatic Cleanup**: Retention policies for managing video storage
- **HTML Report Integration**: Videos are embedded in the HTML report with playback controls
- **CI/CD Ready**: Optimized for continuous integration environments

## Configuration

### Basic Setup

Add video configuration to your `copilot-test.config.ts`:

```typescript
import { configure } from "copilot-test";
import { webPlatform } from "copilot-test/platforms/web";

configure({
  platforms: {
    web: webPlatform(),
  },
  video: {
    enabled: true,
    mode: "on-failure", // Record only when tests fail
    format: "webm",
    quality: "medium",
    fps: 25,
    outputDir: "videos",
  },
  outputDir: "copilot-test-results",
});
```

### Configuration Options

#### `enabled` (boolean)
- **Default**: `false`
- Enable or disable video recording
- Must be explicitly set to `true` to enable recording

#### `mode` ("always" | "on-failure" | "off")
- **Default**: `"on-failure"`
- **always**: Record all scenarios regardless of pass/fail status
- **on-failure**: Only save videos when scenarios fail (recommended)
- **off**: Disable recording (same as `enabled: false`)

#### `format` ("webm" | "mp4")
- **Default**: `"webm"`
- **webm**: Better compression, smaller file sizes
- **mp4**: Wider browser support, slightly larger files

#### `quality` ("low" | "medium" | "high")
- **Default**: `"medium"`
- Affects video bitrate and file size
- **low**: Smallest files, lower quality (good for CI)
- **medium**: Balanced quality and size
- **high**: Best quality, larger files (good for demos)

#### `fps` (number)
- **Default**: `25`
- Frames per second for video recording
- Common values: 15, 25, 30, 60
- Higher FPS = smoother video but larger files

#### `outputDir` (string)
- **Default**: `"videos"`
- Directory to save videos (relative to `outputDir`)
- Videos are saved with scenario name and timestamp

#### `retention` (object)
- Optional retention policies for automatic cleanup

```typescript
retention: {
  maxDays: 7,          // Delete videos older than 7 days
  maxSize: 500,        // Delete oldest if total > 500 MB
  keepFailures: true,  // Always keep failure videos
}
```

## Recording Modes

### 1. On Failure (Recommended)

Best for CI/CD pipelines. Only saves videos when tests fail:

```typescript
video: {
  enabled: true,
  mode: "on-failure",
  format: "webm",
  quality: "medium",
}
```

**Use cases:**
- Continuous integration
- Automated testing
- Debugging production issues

### 2. Always Record

Records all test scenarios regardless of outcome:

```typescript
video: {
  enabled: true,
  mode: "always",
  format: "mp4",
  quality: "high",
}
```

**Use cases:**
- Creating test documentation
- Demo recordings
- Training materials
- Manual debugging sessions

### 3. Disabled

Completely disable video recording:

```typescript
video: {
  enabled: false,
}
```

## HTML Report Integration

Videos are automatically embedded in the HTML report when available:

```html
<!-- Example of video in report -->
<div class="video-container">
  <div class="video-header">
    <span>📹 Recorded Video</span>
  </div>
  <video controls preload="metadata">
    <source src="videos/login-failed-2024-01-15T10-30-00.webm" type="video/webm">
  </video>
  <div class="video-controls">
    <a href="videos/login-failed-2024-01-15T10-30-00.webm" download>Download</a>
  </div>
</div>
```

### Video Player Features

- **Playback Controls**: Play, pause, seek, volume
- **Download Option**: Download video for offline viewing
- **Responsive Design**: Adapts to screen size
- **Metadata Preload**: Fast initial load

## Platform Support

### Web (Playwright)

Video recording is supported for web tests using Playwright:

```typescript
import { webPlatform } from "copilot-test/platforms/web";

configure({
  platforms: {
    web: webPlatform({
      browser: "chromium",
      headless: true,
    }),
  },
  video: {
    enabled: true,
    mode: "on-failure",
  },
});
```

**How it works:**
- Playwright automatically records browser sessions
- Videos capture all browser interactions
- Recording starts when scenario begins
- Recording stops when scenario ends

### Mobile (Android)

Video recording for mobile tests is planned for future releases.

### API Tests

Video recording is not applicable for API-only tests. Consider using HAR (HTTP Archive) recording instead.

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests with Video Recording

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Run tests with video recording
        run: npm test
        env:
          VIDEO_ENABLED: "true"

      - name: Upload test videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-videos
          path: copilot-test-results/videos/
          retention-days: 7

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-report
          path: copilot-test-results/report.html
          retention-days: 30
```

### GitLab CI

```yaml
test:
  stage: test
  script:
    - npm install
    - npm test
  artifacts:
    when: on_failure
    paths:
      - copilot-test-results/videos/
    expire_in: 7 days
  artifacts:
    when: always
    paths:
      - copilot-test-results/report.html
    expire_in: 30 days
```

## Storage and Cleanup

### Manual Cleanup

```bash
# Remove all videos older than 7 days
find copilot-test-results/videos -name "*.webm" -mtime +7 -delete

# Remove videos if directory size > 500MB
du -sh copilot-test-results/videos
# Manually delete oldest videos if needed
```

### Automatic Cleanup

Configure retention policies in your config:

```typescript
video: {
  enabled: true,
  mode: "on-failure",
  retention: {
    maxDays: 7,          // Auto-delete after 7 days
    maxSize: 500,        // Keep total under 500 MB
    keepFailures: true,  // Never delete failure videos
  },
}
```

## Best Practices

### 1. Use "on-failure" Mode in CI/CD

Save storage and bandwidth by only recording failures:

```typescript
video: {
  enabled: true,
  mode: "on-failure",
  quality: "medium",
}
```

### 2. Choose Appropriate Quality

- **CI/CD**: Use `"medium"` or `"low"` quality
- **Local Development**: Use `"high"` quality
- **Demo/Documentation**: Use `"high"` quality with MP4 format

### 3. Set Retention Policies

Prevent storage issues with automatic cleanup:

```typescript
retention: {
  maxDays: 7,
  maxSize: 500,
  keepFailures: true,
}
```

### 4. Upload to Artifacts

In CI/CD, upload videos as artifacts:

```yaml
- uses: actions/upload-artifact@v3
  with:
    name: test-videos
    path: copilot-test-results/videos/
```

### 5. Git Ignore Videos

Add to `.gitignore`:

```
copilot-test-results/videos/
*.webm
*.mp4
```

## Troubleshooting

### Videos Not Recording

1. Check that `video.enabled` is set to `true`
2. Verify the output directory exists and is writable
3. Ensure Playwright is properly installed
4. Check browser permissions in headless mode

### Large Video Files

1. Reduce quality setting (`"low"` or `"medium"`)
2. Lower FPS (try 15 or 20)
3. Use WebM format instead of MP4
4. Enable retention policies for automatic cleanup

### Videos Not Playing in Report

1. Verify video files are in the correct output directory
2. Check video format is supported by your browser
3. Ensure video paths are relative to the report HTML
4. Try downloading and playing the video locally

## Examples

See `examples/video-recording-example.ts` for complete working examples.

## Limitations

- Video recording is currently only supported for web platform (Playwright)
- Mobile platform video recording is planned for future releases
- Video files can be large; use appropriate quality settings
- Recording may slightly slow down test execution

## Future Enhancements

- **Mobile Support**: Android screen recording via adb
- **Video Thumbnails**: Preview images in test reports
- **Video Comparison**: Compare videos across test runs
- **Slow Motion**: Built-in slow-motion playback
- **Annotated Videos**: Add markers for each test step
- **HAR Recording**: HTTP Archive for API tests
