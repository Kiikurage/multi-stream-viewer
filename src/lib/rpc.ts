type Listener<Request extends void | Record<string, unknown>, Response = void> = (
    sender: chrome.runtime.MessageSender,
    request: Request,
) => Response | Promise<Response>;

export function defineRpcToBackground<Request extends void | Record<string, unknown>, Response = void>(
    type: string,
): {
    (request: Request): Promise<Response>;
    addListener(handler: Listener<Request, Response>): void;
    removeListener(handler: Listener<Request, Response>): void;
} {
    type Wrapper = (
        message: { type: string },
        sender: chrome.runtime.MessageSender,
        sendResponse: (response: Response) => void,
    ) => void | boolean;

    function createWrapper(handler: Listener<Request, Response>) {
        const wrapper: Wrapper = (message, sender, sendResponse) => {
            if (message.type !== type) return;

            const response = handler(sender, message as unknown as Request);
            if (response === undefined) return;

            if (response instanceof Promise) {
                Promise.resolve(response).then(sendResponse);
                return true;
            } else {
                sendResponse(response);
            }
        };

        return wrapper;
    }

    const wrapperByListener = new Map<Listener<Request, Response>, Wrapper>();

    return Object.assign(
        (request: Request): Promise<Response> => {
            return chrome.runtime.sendMessage(undefined, { type, ...request });
        },
        {
            addListener(handler: Listener<Request, Response>) {
                this.removeListener(handler);

                const wrapper = createWrapper(handler);
                wrapperByListener.set(handler, wrapper);

                chrome.runtime.onMessage.addListener(wrapper);
            },
            removeListener(handler: Listener<Request, Response>) {
                const wrapper = wrapperByListener.get(handler);
                if (wrapper === undefined) return;

                chrome.runtime.onMessage.removeListener(wrapper);
                wrapperByListener.delete(handler);
            },
        },
    );
}

export function defineRpcToTab<Request extends void | Record<string, unknown>, Response = void>(
    type: string,
): {
    (tabId: number, request: Request): Promise<Response>;
    addListener(handler: Listener<Request, Response>): void;
    removeListener(handler: Listener<Request, Response>): void;
} {
    type Wrapper = (
        message: { type: string },
        sender: chrome.runtime.MessageSender,
        sendResponse: (response: Response) => void,
    ) => void | boolean;

    function createWrapper(handler: Listener<Request, Response>) {
        const wrapper: Wrapper = (message, sender, sendResponse) => {
            if (message.type !== type) return;

            const response = handler(sender, message as unknown as Request);
            if (response === undefined) return;

            if (response instanceof Promise) {
                Promise.resolve(response).then(sendResponse);
                return true;
            } else {
                sendResponse(response);
            }
        };

        return wrapper;
    }

    const wrapperByListener = new Map<Listener<Request, Response>, Wrapper>();

    return Object.assign(
        (tabId: number, request: Request): Promise<Response> => {
            return chrome.tabs.sendMessage(tabId, { type, ...request });
        },
        {
            addListener(handler: Listener<Request, Response>) {
                this.removeListener(handler);

                const wrapper = createWrapper(handler);
                wrapperByListener.set(handler, wrapper);

                chrome.runtime.onMessage.addListener(wrapper);
            },
            removeListener(handler: Listener<Request, Response>) {
                const wrapper = wrapperByListener.get(handler);
                if (wrapper === undefined) return;

                chrome.runtime.onMessage.removeListener(wrapper);
                wrapperByListener.delete(handler);
            },
        },
    );
}
