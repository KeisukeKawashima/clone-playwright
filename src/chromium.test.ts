import { chromium } from './index';

describe('Chromium', () => {
    test('should launch Chromium browser', async () => {
        const result = await chromium.launch()
        expect(result).toBeDefined()
    });
});
