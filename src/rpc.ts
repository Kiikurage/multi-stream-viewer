export module Rpc {
    export interface TabData {
        id: number;
        url: string;
        title: string;
    }
    export const getTabList = defineAPIToBackground<void, TabData[]>('getTabList');

    // 拡張機能ページからバックグラウンドへ動画URLをリクエスト
    export const requestVideoUrl = defineAPIToBackground<{ tabId: number }, { tabId: number; videoUrl: string }>(
        'requestVideoUrl',
    );

    // バックグラウンドから動画ページへ動画URLをリクエスト
    export const requestVideoUrlFromBackground = defineAPIFromBackground<void, { videoUrl: string }>(
        'requestVideoUrlFromBackground',
    );
}

function defineAPIToBackground<Request extends void | Record<string, unknown>, Response = void>(
    type: string,
): {
    (request: Request): Promise<Response>;
    addHandler(handler: (sender: chrome.runtime.MessageSender, request: Request) => Response | Promise<Response>): void;
} {
    return Object.assign(
        (request: Request): Promise<Response> => {
            return chrome.runtime.sendMessage(undefined, { type, ...request });
        },
        {
            addHandler: (
                handler: (sender: chrome.runtime.MessageSender, request: Request) => Response | Promise<Response>,
            ) => {
                chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                    if (message.type !== type) return;

                    Promise.resolve(handler(sender, message as unknown as Request)).then(sendResponse);
                    return true;
                });
            },
        },
    );
}

function defineAPIFromBackground<Request extends void | Record<string, unknown>, Response = void>(
    type: string,
): {
    (tabId: number, request: Request): Promise<Response>;
    addHandler(handler: (sender: chrome.runtime.MessageSender, request: Request) => Response | Promise<Response>): void;
} {
    return Object.assign(
        (tabId: number, request: Request): Promise<Response> => {
            return chrome.tabs.sendMessage(tabId, { type, ...request });
        },
        {
            addHandler: (
                handler: (sender: chrome.runtime.MessageSender, request: Request) => Response | Promise<Response>,
            ) => {
                chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                    if (message.type !== type) return;

                    Promise.resolve(handler(sender, message as unknown as Request)).then(sendResponse);
                    return true;
                });
            },
        },
    );
}
