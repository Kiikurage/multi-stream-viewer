import { Rpc } from './rpc';
import { AppManager } from './AppManager';

const app = new AppManager();

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'hello.html' });
});

chrome.tabs.onRemoved.addListener((tabId: number) => {
    app.removeExtensionTab(tabId);
    app.removeSourcesByTabId(tabId);
});

Rpc.registerExtensionTab.addHandler((sender) => {
    const tabId = sender.tab?.id;
    if (tabId === undefined) return;

    app.addExtensionTab(tabId);
});

Rpc.registerSource.addHandler((sender, request) => {
    const tabId = sender.tab?.id;
    if (tabId === undefined) return;

    app.addSource({
        tabId,
        id: request.sourceId,
        title: request.title,
    });
});

Rpc.shareSDPToBackground.addHandler(async (sender, request) => {
    const extensionTab = sender.tab;
    if (extensionTab === undefined) throw new Error('extensionTab is undefined');
    const sourceTabId = request.sourceTabId;

    const answer = await Rpc.shareSDPToSourceTab(sourceTabId, {
        offer: request.offer,
        extensionTabId: extensionTab.id,
    });

    return answer;
});

Rpc.shareICECandidateToBackground.addHandler((sender, request) => {
    Rpc.shareICECandidateToExtensionTab(request.extensionTabId, { candidate: request.candidate });

    app.addConnection(request.extensionTabId, request.sourceId);
});

(global as any).app = app;
