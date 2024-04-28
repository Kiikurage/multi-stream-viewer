import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { notifySourceUpdate, registerExtensionTab } from '../rpc/application';
import { shareICECandidateToExtensionTab, shareSDPToBackground } from '../rpc/webRTC';
import { Source } from '../model/Source';

export const MultiViewer = () => {
    const [sources, setSources] = useState<Source[]>([]);
    const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>();
    useEffect(() => {
        notifySourceUpdate.addHandler((sender, request) => {
            setSources(request.sources);
            setSelectedSourceId(request.sources[0]?.id);
        });
        registerExtensionTab();
    }, []);

    useEffect(() => {
        setSelectedSourceId((sourceId) => {
            if (sources.find((source) => source.id === sourceId) === undefined) {
                return undefined;
            } else {
                return sourceId;
            }
        });
    }, [sources]);

    const [activeSources, setActiveSources] = useState<Source[]>([]);
    useEffect(() => {
        setActiveSources((activeSources) => {
            return activeSources.filter((source) => sources.some((s) => source.id === s.id));
        });
    }, [sources]);

    const handleAddButtonClick = useCallback(() => {
        const selectedSource = sources.find((tab) => tab.id === selectedSourceId);
        if (selectedSource === undefined) return;

        setActiveSources((activeSources) => [...activeSources, selectedSource]);
    }, [selectedSourceId, sources]);

    return (
        <div style={{ position: 'fixed', inset: 0 }}>
            <header
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: '8px 16px',
                    gap: '16px',
                }}
            >
                <select value={selectedSourceId} onChange={(ev) => setSelectedSourceId(ev.currentTarget.value)}>
                    {sources.map((source) => (
                        <option key={source.id} value={source.id}>
                            {source.title}
                        </option>
                    ))}
                </select>
                <button onClick={handleAddButtonClick}>追加</button>
            </header>
            <div>
                {activeSources.map((source) => (
                    <VideoRow key={source.id} source={source} />
                ))}
            </div>
        </div>
    );
};

export const VideoRow = ({ source }: { source: Source }) => {
    const [stream] = useState<MediaStream>(() => new MediaStream());
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
        <div>
            <video autoPlay ref={videoRef} width={640} controls />
        </div>
    );
};
