import { AppManager } from './background/AppManager';
import {
    disconnectToBackground,
    disconnectToSourceTab,
    shareICECandidateToBackground,
    shareICECandidateToExtensionTab,
    shareSDPToBackground,
    shareSDPToSourceTab,
} from './rpc/webRTC';

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'hello.html' });
});

chrome.tabs.onRemoved.addListener((tabId: number) => {
    app.removeExtensionTab(tabId);
    app.removeSourcesByTabId(tabId);
});

shareSDPToBackground.addListener(async (sender, request) => {
    const extensionTab = sender.tab;
    if (extensionTab === undefined) throw new Error('extensionTab is undefined');
    const sourceTabId = request.sourceTabId;

    const answer = await shareSDPToSourceTab(sourceTabId, {
        offer: request.offer,
        extensionTabId: extensionTab.id,
    });

    return answer;
});

shareICECandidateToBackground.addListener((sender, request) => {
    shareICECandidateToExtensionTab(request.extensionTabId, { candidate: request.candidate });

    app.addConnection(request.extensionTabId, request.sourceId);
});

disconnectToBackground.addListener((sender, request) => {
    const extensionTab = sender.tab;
    if (extensionTab === undefined) throw new Error('extensionTab is undefined');
    const source = app.getSource(request.sourceId);
    if (source === undefined) return;

    disconnectToSourceTab(source.tabId, { extensionTabId: extensionTab.id });

    app.removeConnection(extensionTab.id, source.id);
});

const app = new AppManager();
(global as any).app = app; // For Debug
