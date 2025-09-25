import { spawn } from 'child_process';

export interface Browser {
    close: () => void;
    newPage: () => Promise<Page>;
}

export interface Page {
    goto: (url: string) => Promise<void>;
    title: () => Promise<string>;
    close: () => void;
}



export const chromium = {
    async launch(): Promise<Browser> {
        const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        const chromeProcess = spawn(chromePath, [ "--headless", '--remote-debugging-port=9222']);
        const wsUrl = `ws://localhost:9222/devtools/page/`;

        return {
            close: () => chromeProcess.kill(),
            newPage: async () => {
                const page = new PageImpl(wsUrl);
                return page;
            },
        }
    },
}

class PageImpl implements Page {
    constructor( private wsUrl: string) {
        this.wsUrl = wsUrl;
    }

    async goto(url: string): Promise<void> {
        // Implementation for navigating to a URL
    }

    async title(): Promise<string> {
        // Implementation for getting the page title
        return "Mock Title";
    }

    close(): void {
        // Implementation for closing the page
    }
}

