const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000, // Увеличиваем таймаут
  expect: {
    timeout: 10000 // Увеличиваем для медленных окружений
  },
  fullyParallel: false, // Запускаем последовательно для CI
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Один worker для стабильности
  
  reporter: 'html',
  
  use: {
    baseURL: 'http://todo-frontend:80',
    actionTimeout: 0,
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
  
  // Настройки веб-сервера
  webServer: {
    command: 'echo "Application should already be running in Docker"',
    url: 'http://todo-frontend:80',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});