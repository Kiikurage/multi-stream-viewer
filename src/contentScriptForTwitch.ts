import { ChunkMessage, Message, PullMessage, UnregisterSourceMessage } from './model/Message';
import { randomId } from './lib/randomId';

// new TwitchSourceAdapter().checkUntilReady();

export class MessageClient {
    readonly id = randomId();
    readonly trampoline: HTMLIFrameElement;

    constructor() {
        this.trampoline = document.createElement('iframe');
        this.trampoline.src = chrome.runtime.getURL('trampoline.html');
        this.trampoline.style.display = 'none';
        (document.body || document.documentElement).appendChild(this.trampoline);

        window.addEventListener('message', (ev) => {
            const message = ev.data as Message;

            switch (message.type) {
                case 'pull': {
                    this.handlePullMessage(message);
                    break;
                }
                default: {
                    console.error(message);
                    throw new Error(`Unsupported message type: ${message.type}`);
                }
            }
        });

        setTimeout(() => {
            this.register();
        }, 1000);
    }

    dispose() {
        this.unregister();
    }

    private register() {
        this.sendMessageToTrampoline({
            type: 'registerSource',
            source: {
                id: this.id,
                tabId: -1,
                title: document.title,
            },
            transfer: [],
        });
    }

    private unregister() {
        const message: UnregisterSourceMessage = {
            type: 'unregisterSource',
            sourceId: this.id,
            transfer: [],
        };

        this.sendMessageToTrampoline(message);
    }

    private async handlePullMessage(message: PullMessage) {
        const viewerId = message.viewerId;

        const video = document.querySelector('video');
        if (video === null) return;

        const stream = video.captureStream();
        const processor = new MediaStreamTrackProcessor(stream.getVideoTracks()[0]);
        const reader = processor.readable.getReader();

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;

            const frame = chunk.value as VideoFrame;
            const buffer = new ArrayBuffer(frame.allocationSize());
            await frame.copyTo(buffer);

            const message: ChunkMessage = {
                type: 'chunk',
                sourceId: this.id,
                viewerId,
                metadata: {
                    format: frame.format!,
                    codedWidth: frame.codedWidth,
                    codedHeight: frame.codedHeight,
                    timestamp: frame.timestamp,
                    duration: frame.duration!,
                    visibleRect: frame.visibleRect!,
                    transfer: [buffer],
                },
                transfer: [buffer],
            };
            this.sendMessageToTrampoline(message);
            frame.close();
        }
    }

    private sendMessageToTrampoline(message: Message) {
        const contentWindow = this.trampoline.contentWindow;
        if (contentWindow === null) return;

        contentWindow.postMessage(message, '*', message.transfer);
    }
}

const client = new MessageClient();
window.addEventListener('beforeunload', () => {
    client.dispose();
});
(window as any).client = client;
