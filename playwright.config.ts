import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },

  expect: {
    toHaveScreenshot: {
      // Allow up to 1% of pixels to differ before failing — guards
      // against subpixel antialiasing noise while still catching real
      // layout or colour regressions.
      maxDiffPixelRatio: 0.01,
      // Disable CSS animations/transitions so screenshots are stable.
      animations: 'disabled',
    },
  },
});
