type Listener<Request extends void | Record<string, unknown>, Response = void> = (
    sender: chrome.runtime.MessageSender,
    request: Request,
) => Response | Promise<Response>;

const listenerByType = new Map<string, Listener<never, unknown>>();

function handleMessage(
    message: { type: string },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
) {
    const listener = listenerByType.get(message.type);
    if (listener === undefined) return;

    const response = listener(sender, message as never);
    if (response === undefined) return;

    if (response instanceof Promise) {
        Promise.resolve(response).then(sendResponse);
        return true;
    } else {
        sendResponse(response);
    }
}

export function defineRpcToBackground<Request extends void | Record<string, unknown>, Response = void>(
    type: string,
): {
    (request: Request): Promise<Response>;
    addListener(listener: Listener<Request, Response>): void;
    removeListener(listener: Listener<Request, Response>): void;
} {
    return Object.assign(
        (request: Request): Promise<Response> => {
            return chrome.runtime.sendMessage(undefined, { type, ...request });
        },
        {
            addListener(listener: Listener<Request, Response>) {
                this.removeListener();

                if (listenerByType.size === 0) {
                    chrome.runtime.onMessage.addListener(handleMessage);
                }
                listenerByType.set(type, listener as unknown as Listener<never, never>);
            },
            removeListener() {
                listenerByType.delete(type);
                if (listenerByType.size === 0) {
                    chrome.runtime.onMessage.removeListener(handleMessage);
                }
            },
        },
    );
}

export function defineRpcToTab<Request extends void | Record<string, unknown>, Response = void>(
    type: string,
): {
    (tabId: number, request: Request): Promise<Response>;
    addListener(listener: Listener<Request, Response>): void;
    removeListener(listener: Listener<Request, Response>): void;
} {
    return Object.assign(
        (tabId: number, request: Request): Promise<Response> => {
            return chrome.tabs.sendMessage(tabId, { type, ...request });
        },
        {
            addListener(listener: Listener<Request, Response>) {
                this.removeListener();

                if (listenerByType.size === 0) {
                    chrome.runtime.onMessage.addListener(handleMessage);
                }
                listenerByType.set(type, listener as unknown as Listener<never, never>);
            },
            removeListener() {
                listenerByType.delete(type);
                if (listenerByType.size === 0) {
                    chrome.runtime.onMessage.removeListener(handleMessage);
                }
            },
        },
    );
}
