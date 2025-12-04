const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:80',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  webServer: {
    command: 'echo "Using already running application"',
    url: 'http://localhost:80',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});