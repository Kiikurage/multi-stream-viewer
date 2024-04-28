import { randomId } from '../lib/randomId';
import { registerSource } from '../rpc/application';
import { shareICECandidateToBackground, shareSDPToSourceTab } from '../rpc/webRTC';

declare global {
    interface HTMLMediaElement {
        captureStream(): MediaStream;
    }
}

const sourceId = randomId();

shareSDPToSourceTab.addHandler(async (sender, request) => {
    const video = document.querySelector('video');
    if (!video) throw new Error('Video element not found');

    const pc = new RTCPeerConnection();
    pc.addEventListener('icecandidate', (ev) => {
        if (ev.candidate === null) return;
        shareICECandidateToBackground({
            sourceId,
            candidate: ev.candidate,
            extensionTabId: request.extensionTabId,
        });
    });

    const stream = video.captureStream();
    stream.addEventListener('addtrack', (ev) => {
        const newTrack = ev.track;
        const sender = pc.getSenders().find((sender) => sender.track?.kind === newTrack.kind);

        if (sender) {
            sender.replaceTrack(newTrack);
        } else {
            pc.addTrack(newTrack, stream);
        }
    });

    await pc.setRemoteDescription(request.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    return { answer };
});

function isSourceReady(): boolean {
    const video = document.querySelector('video');
    if (video === null) return false;
    if (video.paused) return false;

    return true;
}

function registerSourceIfReady() {
    if (!isSourceReady()) {
        setTimeout(registerSourceIfReady, 1000);
        return;
    }

    registerSource({ sourceId, title: document.title });
}

registerSourceIfReady();
