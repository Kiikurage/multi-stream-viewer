import {
    ChunkMessage,
    ListMessage,
    Message,
    PullMessage,
    RegisterViewerMessage,
    UnregisterViewerMessage,
} from '../model/Message';
import { Source } from '../model/Source';
import { noop } from '../lib/noop';

export class MessageClient {
    readonly id = '' + Math.random();
    private worker: SharedWorker;
    private composerMap = new Map<string, VideoComposer>();

    onSourceListChange: (sources: Source[]) => void = noop;

    constructor() {
        this.worker = new SharedWorker(chrome.runtime.getURL('sharedWorker.js'));
        this.worker.port.addEventListener('message', (ev) => {
            const message = ev.data as Message;

            switch (message.type) {
                case 'chunk': {
                    this.handleChunkMessageFromSharedWorker(message);
                    break;
                }
                case 'list': {
                    this.handleListMessageFromSharedWorker(message);
                    break;
                }
                default: {
                    console.error(message);
                    throw new Error(`Unsupported message type: ${message.type}`);
                }
            }
        });
        this.worker.port.start();
        this.register();
    }

    getStream(sourceId: string): MediaStream {
        let composer = this.composerMap.get(sourceId);
        if (composer === undefined) {
            composer = new VideoComposer();
            this.composerMap.set(sourceId, composer);
        }
        return composer.stream;
    }

    pullVideoData(sourceId: string) {
        const message: PullMessage = { type: 'pull', viewerId: this.id, sourceId, transfer: [] };

        this.worker.port.postMessage(message, message.transfer);
    }

    dispose() {
        this.unregister();
        this.worker.port.close();
    }

    private register() {
        const message: RegisterViewerMessage = { type: 'registerViewer', viewerId: this.id, transfer: [] };
        this.worker.port.postMessage(message, message.transfer);
    }

    private unregister() {
        const message: UnregisterViewerMessage = { type: 'unregisterViewer', viewerId: this.id, transfer: [] };
        this.worker.port.postMessage(message, []);
    }

    private handleListMessageFromSharedWorker(message: ListMessage) {
        this.composerMap.forEach((composer, sourceId) => {
            if (!message.sources.some((source) => source.id === sourceId)) {
                this.composerMap.delete(sourceId);
            }
        });
        this.onSourceListChange(message.sources);
    }

    private handleChunkMessageFromSharedWorker(message: ChunkMessage) {
        const composer = this.composerMap.get(message.sourceId);
        if (composer === undefined) return;

        composer.pushChunk(message);
    }
}

class VideoComposer {
    private readonly writer: WritableStreamDefaultWriter<VideoFrame>;
    readonly stream: MediaStream;

    constructor() {
        const generator = new MediaStreamTrackGenerator('video');
        this.writer = generator.writable.getWriter();
        this.stream = new (MediaStream as NewMediaStreamConstructor)([generator]);
    }

    pushChunk(chunk: ChunkMessage) {
        const frame = new VideoFrame(chunk.metadata.transfer[0] as ArrayBuffer, chunk.metadata);
        this.writer.write(frame);
    }
}
