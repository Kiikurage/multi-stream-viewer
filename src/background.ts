// import { AppManager } from './background/AppManager';
// import {
//     disconnectToBackground,
//     disconnectToSourceTab,
//     shareICECandidateToBackground,
//     shareICECandidateToExtensionTab,
//     shareSDPToBackground,
//     shareSDPToSourceTab,
// } from './rpc/webRTC';
// import Tab = chrome.tabs.Tab;
//
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'hello.html' });
});
//
// // chrome.tabs.onCreated.addListener((tab: Tab) => {
// //     injectSourcePageScript(tab);
// // });
//
// chrome.tabs.onRemoved.addListener((tabId: number) => {
//     app.removeExtensionTab(tabId);
//     app.removeSourcesByTabId(tabId);
// });
//
// shareSDPToBackground.addListener(async (sender, request) => {
//     console.log('shareSDPToBackground');
//     const extensionTab = sender.tab;
//     if (extensionTab === undefined) throw new Error('extensionTab is undefined');
//     const sourceTabId = request.sourceTabId;
//
//     const answer = await shareSDPToSourceTab(sourceTabId, {
//         offer: request.offer,
//         extensionTabId: extensionTab.id,
//     });
//
//     return answer;
// });
//
// shareICECandidateToBackground.addListener((sender, request) => {
//     console.log('shareICECandidateToBackground');
//     shareICECandidateToExtensionTab(request.extensionTabId, { candidate: request.candidate });
//
//     app.addConnection(request.extensionTabId, request.sourceId);
// });
//
// disconnectToBackground.addListener((sender, request) => {
//     console.log('disconnectToBackground');
//     const extensionTab = sender.tab;
//     if (extensionTab === undefined) throw new Error('extensionTab is undefined');
//     const source = app.getSource(request.sourceId);
//     if (source === undefined) return;
//
//     disconnectToSourceTab(source.tabId, { extensionTabId: extensionTab.id });
//
//     app.removeConnection(extensionTab.id, source.id);
// });
//
// const app = new AppManager();
// (global as any).app = app; // For Debug
//
// function injectSourcePageScript(tab: chrome.tabs.Tab) {
//     if (tab.url?.includes('live.nicovideo.jp')) {
//         chrome.scripting.executeScript({
//             files: ['./contentScriptForNicoLive.js'],
//             target: { tabId: tab.id, allFrames: true },
//         });
//     }
//     if (tab.url?.includes('www.youtube.com')) {
//         chrome.scripting.executeScript({
//             files: ['./contentScriptForYoutube.js'],
//             target: { tabId: tab.id },
//         });
//     }
//     if (tab.url?.includes('www.twitch.tv')) {
//         chrome.scripting.executeScript({
//             files: ['./contentScriptForTwitch.js'],
//             target: { tabId: tab.id },
//         });
//     }
// }
//
// async function bootstrap() {
//     const tabs = await chrome.tabs.query({});
//     for (const tab of tabs) {
//         injectSourcePageScript(tab);
//     }
// }
//
// // bootstrap();
