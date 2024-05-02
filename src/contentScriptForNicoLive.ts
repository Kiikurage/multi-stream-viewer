import { NicoLiveSourceAdapter } from './adapter/NicoLiveSourceAdapter'; // new NicoLiveSourceAdapter().checkUntilReady();

// new NicoLiveSourceAdapter().checkUntilReady();

const iframe = document.createElement('iframe');
iframe.src = chrome.runtime.getURL('trampoline.html');
(document.body || document.documentElement).appendChild(iframe);
