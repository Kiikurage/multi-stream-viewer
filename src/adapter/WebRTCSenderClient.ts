import { shareICECandidateToBackground, shareSDPToSourceTab } from '../rpc/webRTC';

export class WebRTCSenderClient {
    private readonly connection: RTCPeerConnection;

    constructor(
        private readonly sourceId: string,
        private readonly extensionTabId: number,
        private readonly sourceStream: MediaStream,
    ) {
        this.connection = new RTCPeerConnection();
        this.connection.addEventListener('icecandidate', this.onIceCandidate);

        this.sourceStream.addEventListener('addtrack', this.onStreamAddTrack);
    }

    private readonly onIceCandidate = (ev: RTCPeerConnectionIceEvent) => {
        if (ev.candidate === null) return;

        shareICECandidateToBackground({
            sourceId: this.sourceId,
            candidate: ev.candidate,
            extensionTabId: this.extensionTabId,
        });
    };

    private readonly onStreamAddTrack = (ev: MediaStreamTrackEvent) => {
        const newTrack = ev.track;
        const sender = this.connection.getSenders().find((sender) => sender.track?.kind === newTrack.kind);

        if (sender) {
            sender.replaceTrack(newTrack);
        } else {
            this.connection.addTrack(newTrack, this.sourceStream);
        }
    };

    async acceptOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
        await this.connection.setRemoteDescription(offer);
        const answer = await this.connection.createAnswer();
        await this.connection.setLocalDescription(answer);

        return answer;
    }
}
