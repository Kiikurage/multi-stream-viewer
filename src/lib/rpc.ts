export function defineRpcToBackground<Request extends void | Record<string, unknown>, Response = void>(
    type: string,
): {
    (request: Request): Promise<Response>;
    addListener(
        handler: (sender: chrome.runtime.MessageSender, request: Request) => Response | Promise<Response>,
    ): void;
} {
    return Object.assign(
        (request: Request): Promise<Response> => {
            return chrome.runtime.sendMessage(undefined, { type, ...request });
        },
        {
            addListener: (
                handler: (sender: chrome.runtime.MessageSender, request: Request) => Response | Promise<Response>,
            ) => {
                chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                    if (message.type !== type) return;

                    const response = handler(sender, message as unknown as Request);
                    if (response === undefined) return;

                    if (response instanceof Promise) {
                        Promise.resolve(response).then(sendResponse);
                        return true;
                    } else {
                        sendResponse(response);
                    }
                });
            },
        },
    );
}

export function defineRpcToTab<Request extends void | Record<string, unknown>, Response = void>(
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

                    const response = handler(sender, message as unknown as Request);
                    if (response === undefined) return;

                    if (response instanceof Promise) {
                        Promise.resolve(response).then(sendResponse);
                        return true;
                    } else {
                        sendResponse(response);
                    }
                });
            },
        },
    );
}
