import { defineConfig, devices } from "@playwright/test";

const liveBaseUrl = process.env.DEMO_BASE_URL;
const normalizedBaseUrl = liveBaseUrl
  ? `${liveBaseUrl.replace(/\/$/, "")}/`
  : "http://127.0.0.1:4174/";

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: normalizedBaseUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: liveBaseUrl
    ? undefined
    : {
        command: "pnpm dev --host 127.0.0.1 --port 4174",
        url: "http://127.0.0.1:4174",
        reuseExistingServer: false,
        timeout: 30_000,
      },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
