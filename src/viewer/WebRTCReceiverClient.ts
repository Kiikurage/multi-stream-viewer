import { Source } from '../model/Source';
import { disconnectToBackground, shareICECandidateToExtensionTab, shareSDPToBackground } from '../rpc/webRTC';

export class WebRTCReceiverClient {
    readonly stream = new MediaStream();
    private readonly connection: RTCPeerConnection;

    constructor(private source: Source) {
        this.connection = new RTCPeerConnection();

        const videoTransceiver = this.connection.addTransceiver('video', { direction: 'recvonly' });
        const audioTransceiver = this.connection.addTransceiver('audio', { direction: 'recvonly' });
        this.stream.addTrack(videoTransceiver.receiver.track);
        this.stream.addTrack(audioTransceiver.receiver.track);
    }

    async connect() {
        shareICECandidateToExtensionTab.addListener(this.handleShareICECandidateToExtensionTab);

        const offer = await this.connection.createOffer();
        await this.connection.setLocalDescription(offer);
        const { answer } = await shareSDPToBackground({ offer, sourceTabId: this.source.tabId });
        await this.connection.setRemoteDescription(answer);
    }

    disconnect() {
        shareICECandidateToExtensionTab.removeListener(this.handleShareICECandidateToExtensionTab);
        disconnectToBackground({ sourceId: this.source.id });
        this.connection.close();
    }

    private readonly handleShareICECandidateToExtensionTab = (
        sender: chrome.runtime.MessageSender,
        request: { candidate: RTCIceCandidateInit },
    ) => {
        this.connection.addIceCandidate(request.candidate);
    };
}
