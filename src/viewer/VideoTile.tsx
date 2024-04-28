import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { disconnectToBackground, shareICECandidateToExtensionTab, shareSDPToBackground } from '../rpc/webRTC';
import { Source } from '../model/Source';

class WebRTCReceiverClient {
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

export const VideoTile = ({ source, onCloseButtonClick }: { source: Source; onCloseButtonClick: () => void }) => {
    const handleCloseButtonClick = useCallback(() => {
        onCloseButtonClick();
    }, [onCloseButtonClick]);

    const clientRef = useRef<WebRTCReceiverClient>();
    if (clientRef.current === undefined) clientRef.current = new WebRTCReceiverClient(source);
    useEffect(() => {
        const client = clientRef.current;
        if (client === undefined) return;

        client.connect();

        return () => client.disconnect();
    }, []);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    useLayoutEffect(() => {
        const video = videoRef.current;
        if (video === null) return;

        const client = clientRef.current;
        if (client === undefined) return;

        video.srcObject = client.stream;

        return () => {
            video.srcObject = null;
        };
    }, [videoRef]);

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                background: '#000',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <video
                    autoPlay
                    controls
                    ref={videoRef}
                    style={{
                        inset: 0,
                        width: '100%',
                        height: '100%',
                    }}
                />
            </div>
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                }}
            >
                <button
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        font: 'inherit',
                        pointerEvents: 'all',
                    }}
                    onClick={handleCloseButtonClick}
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        </div>
    );
};
