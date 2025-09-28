import { chromium, Browser } from "./index";

describe("Chromium", () => {
  let browser: Browser | null = null;
  test("should launch Chromium browser", async () => {
    browser = await chromium.launch();
    expect(browser.close).toBeDefined();
  });

  test("should create new page", async () => {
    browser = await chromium.launch();
    const page = await browser.newPage();
    expect(page).toBeDefined();
  });

  test("should get real page title from Chrome", async () => {
    browser = await chromium.launch();
    const page = await browser.newPage();

    const title = await page.title();
    expect(title).not.toBe("Mock Title");
  });

  test('should navigate to URL and get correct title', async () => {
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com');
    const title = await page.title();
    expect(title).toBe('Example Domain');
  });

  test('should click button and change text', async () => {
    browser = await chromium.launch();
    const page = await browser.newPage(); });

  afterEach(async () => {
    browser?.close();
    browser = null;
  });
});
