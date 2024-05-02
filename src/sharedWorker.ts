import {
    ChunkMessage,
    Message,
    PullMessage,
    RegisterSourceMessage,
    RegisterViewerMessage,
    UnregisterSourceMessage,
    UnregisterViewerMessage,
} from './model/Message';
import { Source } from './model/Source';

class SharedWorkerController {
    private readonly sources = new Map<
        string,
        {
            source: Source;
            port: MessagePort;
        }
    >();
    private readonly viewerPortMap = new Map<string, MessagePort>();

    constructor() {
        self.addEventListener('connect', (e) => {
            const ev = e as MessageEvent;
            const port = ev.ports[0];

            port.addEventListener('message', (ev) => {
                const message = ev.data as Message;

                switch (message.type) {
                    case 'registerSource': {
                        this.handleRegisterSourceMessageFromTrampoline(message, port);
                        break;
                    }
                    case 'registerViewer': {
                        this.handleRegisterViewerMessageFromViewer(message, port);
                        break;
                    }
                    case 'unregisterSource': {
                        this.handleUnregisterSourceMessageFromTrampoline(message);
                        break;
                    }
                    case 'unregisterViewer': {
                        this.handleUnregisterViewerMessageFromViewer(message);
                        break;
                    }
                    case 'pull': {
                        this.handlePullMessageFromViewer(message);
                        break;
                    }
                    case 'chunk': {
                        this.handleChunkMessageFromTrampoline(message);
                        break;
                    }
                }
            });

            port.start();
        });
    }

    addSource(source: Source, port: MessagePort) {
        this.sources.set(source.id, { source, port });
        this.publishSourcesToAll();
    }

    removeSource(sourceId: string) {
        this.sources.delete(sourceId);
        this.publishSourcesToAll();
    }

    publishSourcesToAll() {
        for (const port of this.viewerPortMap.values()) {
            this.publishSources(port);
        }
    }

    publishSources(port: MessagePort) {
        const sources = [...this.sources.values()].map((v) => v.source);
        const message: Message = { type: 'list', sources, transfer: [] };
        port.postMessage(message, message.transfer);
    }

    addViewerPort(viewerId: string, port: MessagePort) {
        this.viewerPortMap.set(viewerId, port);
        this.publishSources(port);
    }

    removeViewerPort(viewerId: string) {
        this.viewerPortMap.delete(viewerId);
    }

    private handleRegisterSourceMessageFromTrampoline(message: RegisterSourceMessage, port: MessagePort) {
        this.addSource(message.source, port);
    }

    private handleRegisterViewerMessageFromViewer(message: RegisterViewerMessage, port: MessagePort) {
        this.addViewerPort(message.viewerId, port);
    }

    private handleUnregisterSourceMessageFromTrampoline(message: UnregisterSourceMessage) {
        this.removeSource(message.sourceId);
    }

    private handleUnregisterViewerMessageFromViewer(message: UnregisterViewerMessage) {
        this.removeViewerPort(message.viewerId);
    }

    private handlePullMessageFromViewer(message: PullMessage) {
        const sourcePort = this.sources.get(message.sourceId)?.port;
        if (sourcePort === undefined) return;

        sourcePort.postMessage(message, message.transfer);
    }

    private handleChunkMessageFromTrampoline(message: ChunkMessage) {
        const viewerPort = this.viewerPortMap.get(message.viewerId);
        if (viewerPort === undefined) return;

        viewerPort.postMessage(message, message.transfer);
    }
}
const controller = new SharedWorkerController();

(self as any).controller = controller;
