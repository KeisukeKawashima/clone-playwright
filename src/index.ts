import { spawn } from "child_process";
import { WebSocket } from "ws";

export interface Browser {
  close: () => void;
  newPage: () => Promise<Page>;
}

export interface Page {
  goto: (url: string) => Promise<void>;
  title: () => Promise<string>;
  close: () => void;
  evaluate: (expression: string) => Promise<any>;
  click: (selector: string) => Promise<void>;
}

export const chromium = {
  async launch(): Promise<Browser> {
    const chromePath =
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    const chromeProcess = spawn(chromePath, [
      "--headless",
      "--remote-debugging-port=9222",
    ]);
    const wsUrl = `ws://localhost:9222/devtools/page/`;
    await new Promise((resolve) => setTimeout(resolve, 3000));

    return {
      close: () => chromeProcess.kill(),
      newPage: async () => {
        // 実際のWebSocket URLを取得
        const response = await fetch("http://localhost:9222/json");
        const tabs = (await response.json()) as any[];
        const pageTab = tabs.find((tab: any) => tab.type === "page");

        if (!pageTab) {
          throw new Error("No page tab found");
        }

        const page = new PageImpl(pageTab.webSocketDebuggerUrl);
        return page;
      },
    };
  },
};

class PageImpl implements Page {
  constructor(private wsUrl: string) {
    this.wsUrl = wsUrl;
  }

  async goto(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.wsUrl);
      ws.on("open", () => {
        const message = {
          id: 2,
          method: "Page.navigate",
          params: {
            url: url,
          },
        };
        ws.send(JSON.stringify(message));
      });

      ws.on("message", (data) => {
        const response = JSON.parse(data.toString());

        if (response.id === 2 && response.result) {
          ws.close();
          setTimeout(() => resolve(), 1000);
        }
      });

      ws.on("error", reject);
    });
  }

  async title(): Promise<string> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.wsUrl);
      ws.on("open", () => {
        const message = {
          id: 1,
          method: "Runtime.evaluate",
          params: {
            expression: "document.title",
            returnByValue: true,
          },
        };
        ws.send(JSON.stringify(message));
      });

      ws.on("message", (data) => {
        const response = JSON.parse(data.toString());

        if (response.id === 1 && response.result) {
          const title = response.result.result.value;
          ws.close();
          resolve(title);
        }
      });

      ws.on("error", reject);
    });
  }

  close(): void {
    // Implementation for closing the page
  }

    async evaluate(expression: string): Promise<any> {
      return new Promise((resolve, reject) => {
        const ws = new WebSocket(this.wsUrl);

        ws.on('open', () => {
          const message = {
            id:3,
            method: 'Runtime.evaluate',
            params: {
              expression: expression,
              returnByValue: true,
            }
          }
          ws.send(JSON.stringify(message));
        })

        ws.on('message', (data) => {
          const response = JSON.parse(data.toString());
          if (response.id === 3 && response.result) {
            const result = response.result.result.value;
            ws.close();
            resolve(result);
          }
        })

        ws.on('error', reject);
      })
    }

    async click(selector: string): Promise<void> {
      return new Promise((resolve, reject) => {
         const ws = new WebSocket(this.wsUrl);

          ws.on('open', () => {
              // 1. まずドキュメント取得
              const message = {
                  id: 4,
                  method: 'DOM.getDocument'
              };
              ws.send(JSON.stringify(message));
          });

          ws.on('message', (data) => {
              const response = JSON.parse(data.toString());

              if (response.id === 4 && response.result) {
                  // ドキュメント取得成功
                  console.log('Document obtained:', response.result.root.nodeId);

                  // 2. 要素検索
                  const searchMessage = {
                      id: 5,
                      method: 'DOM.querySelector',
                      params: {
                          nodeId: response.result.root.nodeId,
                          selector: selector
                      }
                  };
                  ws.send(JSON.stringify(searchMessage));
              }

              if (response.id === 5 && response.result) {
                  // 要素検索成功
                  console.log('Element found:', response.result.nodeId);

                  // とりあえず成功として resolve
                  ws.close();
                  resolve();
              }
          });

          ws.on('error', reject);
      })
    }
}
