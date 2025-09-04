import { chromium , Browser} from "./index";

describe('Chromium', () => {
    let browser: Browser | null = null;
    test('should launch Chromium browser', async () => {
        browser = await chromium.launch()
        expect(browser.close).toBeDefined()
    });

    test("should create new page", async () => {
        browser = await chromium.launch();
        const page = await browser.newPage();
        expect(page).toBeDefined();
    })

    test('should get WebSocket URL from CHrome', async () => {
        browser = await chromium.launch();
        const wsUrl = await browser.getWebSocketUrl();
        expect(wsUrl).toContain('ws://localhost:9222/devtools/page/')
    })

    test('should get real page title from Chrome', async () => {
        browser = await chromium.launch();
        const page = await browser.newPage();
        
        const title = await page.title();
        expect(title).not.toBe("Mock Title");
    })

    afterEach( async () => {
        browser?.close();
        browser = null;
    });
});
