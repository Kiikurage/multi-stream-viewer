import { notifySourceUpdate, registerExtensionTab, registerSource } from '../rpc/application';
import { Source } from '../model/Source';

export interface Connection {
    extensionTabId: number;
    sourceId: string;
}

export class AppManager {
    private readonly extensionTabIds: number[] = [];
    private sources: Source[] = [];
    private connections: Connection[] = [];

    constructor() {
        registerExtensionTab.addListener((sender) => {
            const tabId = sender.tab?.id;
            if (tabId === undefined) return;

            this.addExtensionTab(tabId);
        });
        registerSource.addListener((sender, request) => {
            const tabId = sender.tab?.id;
            if (tabId === undefined) return;

            this.addSource({
                tabId,
                id: request.sourceId,
                title: request.title,
            });
        });
    }

    addExtensionTab(tabId: number) {
        this.removeExtensionTab(tabId);
        this.extensionTabIds.push(tabId);
        this.notifySourceUpdate(tabId);
    }

    removeExtensionTab(tabId: number) {
        const index = this.extensionTabIds.indexOf(tabId);
        if (index === -1) return;

        this.extensionTabIds.splice(index, 1);
        this.connections
            .filter((connection) => connection.extensionTabId === tabId)
            .forEach((connection) => this.removeConnection(connection.extensionTabId, connection.sourceId));
        // TODO: Frontendへ伝える
    }

    addSource(source: Source) {
        this.sources.push(source);
        this.notifySourceUpdateToAllTab();
    }

    removeSourcesByTabId(tabId: number) {
        this.sources.filter((source) => source.tabId === tabId).forEach((source) => this.removeSource(source.id));
    }

    removeSource(sourceId: string) {
        const index = this.sources.findIndex((source) => source.id === sourceId);
        if (index === -1) return;

        this.sources.splice(index, 1);
        this.notifySourceUpdateToAllTab();

        this.connections
            .filter((connection) => connection.sourceId === sourceId)
            .forEach((connection) => this.removeConnection(connection.extensionTabId, connection.sourceId));
    }

    addConnection(extensionTabId: number, sourceId: string) {
        this.connections.push({
            extensionTabId,
            sourceId,
        });

        this.handleAfterConnectionUpdate();
    }

    removeConnection(extensionTabId: number, sourceId: string) {
        const index = this.connections.findIndex((connection) => {
            return connection.extensionTabId === extensionTabId && connection.sourceId === sourceId;
        });
        if (index === -1) return;
        this.connections.splice(index, 1);

        this.handleAfterConnectionUpdate();
    }

    private handleAfterConnectionUpdate = () => {
        for (const source of this.sources) {
            const refCount = this.connections.filter((connection) => connection.sourceId === source.id).length;

            if (refCount > 0) {
                this.muteSource(source);
            } else {
                this.unmuteSource(source);
            }
        }
    };

    private muteSource(source: Source) {
        chrome.tabs.update(source.tabId, { muted: true });
    }

    private unmuteSource(source: Source) {
        chrome.tabs.update(source.tabId, { muted: false });
    }

    private notifySourceUpdateToAllTab() {
        this.extensionTabIds.forEach((tabId) => {
            this.notifySourceUpdate(tabId);
        });
    }

    private notifySourceUpdate(tabId: number) {
        notifySourceUpdate(tabId, { sources: this.sources });
    }
}
