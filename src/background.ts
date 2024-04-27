import { Rpc } from './rpc';

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: 'hello.html',
    });
});

chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [
        {
            id: 1,
            condition: {
                requestDomains: ['live.nicovideo.jp'], // (2) on specific domains
                // initiatorDomains: [chrome.runtime.id], // (3) loaded on your extension's pages
            },
            action: {
                type: 'modifyHeaders',
                responseHeaders: [
                    {
                        operation: 'remove',
                        header: 'X-Frame-Options',
                    },
                ],
            },
        },
    ],
});

Rpc.getTabList.addHandler(async () => {
    const tabs = (await chrome.tabs.query({})).filter((tab) => tab.url !== undefined);
    return tabs.map((tab) => ({
        id: tab.id,
        url: tab.url,
        title: tab.title,
    }));
});

Rpc.requestVideoUrl.addHandler(async (sender, request) => {
    const { videoUrl } = await Rpc.requestVideoUrlFromBackground(request.tabId);
    return { tabId: request.tabId, videoUrl };
});

// async function collectAllTabs() {
//     const tabs = await chrome.tabs.query({});
// }
