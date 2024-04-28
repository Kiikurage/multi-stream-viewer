import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { shareICECandidateToExtensionTab, shareSDPToBackground } from '../rpc/webRTC';
import { Source } from '../model/Source';

export const VideoTile = ({ source, onCloseButtonClick }: { source: Source; onCloseButtonClick: () => void }) => {
    const [stream] = useState<MediaStream>(() => new MediaStream());

    const handleCloseButtonClick = useCallback(() => {
        onCloseButtonClick();
    }, [onCloseButtonClick]);

    useEffect(() => {
        (async () => {
            const pc = new RTCPeerConnection();

            const videoTransceiver = pc.addTransceiver('video', { direction: 'recvonly' });
            const audioTransceiver = pc.addTransceiver('audio', { direction: 'recvonly' });
            stream.addTrack(videoTransceiver.receiver.track);
            stream.addTrack(audioTransceiver.receiver.track);

            shareICECandidateToExtensionTab.addHandler((sender, request) => {
                pc.addIceCandidate(request.candidate);
            });

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            const { answer } = await shareSDPToBackground({ offer, sourceTabId: source.tabId });
            await pc.setRemoteDescription(answer);
        })();
    }, [stream, source.tabId]);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    useLayoutEffect(() => {
        const video = videoRef.current;
        if (video === null) return;

        if (stream === null) return;
        video.srcObject = stream;

        return () => {
            video.srcObject = null;
        };
    }, [stream, videoRef]);

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
                    }}
                    onClick={handleCloseButtonClick}
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
        </div>
    );
};
