export class VideoConnection {
    constructor(
        readonly extensionTabId: number,
        readonly sourceTabId: number,
    ) {}

    notifyTabRemoved() {
        // TODO: 拡張機能ページから該当する動画を削除する
    }

    muteSourceTab(): Promise<chrome.tabs.Tab | undefined> {
        return chrome.tabs.update(this.sourceTabId, { muted: true });
    }

    unmuteSourceTab(): Promise<chrome.tabs.Tab | undefined> {
        return chrome.tabs.update(this.sourceTabId, { muted: false });
    }
}
