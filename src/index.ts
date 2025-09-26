import { spawn } from 'child_process';
import { WebSocket } from 'ws';

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
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(this.wsUrl);
            
            ws.on('open', ( )=> {
                const message = {
                    id: 1,
                    method: 'Runtime.evaluate',
                    params: {
                        expression: 'document.title',
                        returnByValue: true
                    }
                };
                ws.send(JSON.stringify(message));
            });

            ws.on('message', (data) => {
                const response = JSON.parse(data.toString());
                if (response.id === 1) {
                    if (response.result) {
                        resolve(response.result.value);
                    } else {
                        reject(new Error('Failed to get page title'));
                    }
                }
            });

            ws.on('error', (error) => {
                reject(error);
            });
        });
    }

    close(): void {
        // Implementation for closing the page
    }
}

