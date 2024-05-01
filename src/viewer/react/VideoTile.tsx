import { useLayoutEffect, useRef } from 'react';
import { Source } from '../../model/Source';
import { useWebRTCClient } from './useWebRTCReceiver';
import { useRemoveCellBySource } from './useAppState';

export const VideoTile = ({ source }: { source: Source }) => {
    const removeCellBySource = useRemoveCellBySource();

    const client = useWebRTCClient(source);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    useLayoutEffect(() => {
        const video = videoRef.current;
        if (video === null) return;

        video.srcObject = client.stream;

        return () => {
            video.srcObject = null;
        };
    }, [client.stream, videoRef]);

    return (
        <div
            style={{
                zIndex: 0,
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
                    muted
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
                    onClick={() => removeCellBySource(source)}
                >
                    <span className="material-icons-outlined">close</span>
                </button>
            </div>
        </div>
    );
};
