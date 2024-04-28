import { randomId } from '../lib/randomId';
import { registerSource } from '../rpc/application';
import { shareSDPToSourceTab } from '../rpc/webRTC';
import { WebRTCSenderClient } from './WebRTCSenderClient';

declare global {
    interface HTMLMediaElement {
        captureStream(): MediaStream;
    }
}

export abstract class MediaElementSourceAdapter {
    private readonly sourceId = randomId();
    private sourceStream: MediaStream | null = null;

    protected constructor() {
        shareSDPToSourceTab.addHandler(async (sender, request) => {
            const client = new WebRTCSenderClient(this.sourceId, request.extensionTabId, this.getStream());
            const answer = await client.acceptOffer(request.offer);

            return { answer };
        });
    }

    abstract getVideo(): HTMLVideoElement | null;

    isReady(): boolean {
        const video = this.getVideo();
        if (video === null) return false;
        if (video.paused) return false;

        return true;
    }

    checkUntilReady = () => {
        if (!this.isReady()) {
            setTimeout(this.checkUntilReady, 1000);
            return;
        }

        registerSource({ sourceId: this.sourceId, title: document.title });
    };

    private getStream() {
        if (this.sourceStream === null) {
            const video = this.getVideo();
            if (video === null) throw new Error('Video is not ready');

            this.sourceStream = video.captureStream();
        }

        return this.sourceStream!;
    }
}
