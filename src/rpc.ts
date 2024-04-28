import { Source } from './AppManager';

export module Rpc {
    export interface TabData {
        id: number;
        url?: string;
        title?: string;
    }

    export const registerExtensionTab = defineAPIToBackground<void, void>('registerViewer');

    export const registerSource = defineAPIToBackground<
        {
            sourceId: string;
            title: string;
        },
        void
    >('registerVideoSource');

    export const notifySourceUpdate = defineAPIToTab<
        {
            sources: Source[];
        },
        void
    >('notifySourceUpdate');

    // Session Description (SDP) in WebRTC
    export const shareSDPToBackground = defineAPIToBackground<
        { offer: RTCSessionDescriptionInit; sourceTabId: number },
        { answer: RTCSessionDescriptionInit }
    >('shareSDPToBackground');
    export const shareSDPToSourceTab = defineAPIToTab<
        { offer: RTCSessionDescriptionInit; extensionTabId: number },
        { answer: RTCSessionDescriptionInit }
    >('shareSDPToSourceTab');

    export const shareICECandidateToBackground = defineAPIToBackground<
        {
            sourceId: string;
            candidate: RTCIceCandidateInit;
            extensionTabId: number;
        },
        void
    >('shareICECandidateToBackground');

    export const shareICECandidateToExtensionTab = defineAPIToTab<{ candidate: RTCIceCandidateInit }, void>(
        'shareICECandidateToExtensionTab',
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

function defineAPIToTab<Request extends void | Record<string, unknown>, Response = void>(
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
