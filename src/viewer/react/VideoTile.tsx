import { useLayoutEffect, useRef } from 'react';
import { Source } from '../../model/Source';
import { useMessageClient } from './useMessageClient';
import { useToggleMaximizeCell } from './useAppState';

export const VideoTile = ({ source }: { source: Source }) => {
    const toggleMaximizeCell = useToggleMaximizeCell(source);
    const client = useMessageClient();

    const videoRef = useRef<HTMLVideoElement | null>(null);
    useLayoutEffect(() => {
        const stream = client.getStream(source.id);

        const video = videoRef.current;
        if (video === null) return;

        video.srcObject = stream;

        return () => {
            video.srcObject = null;
        };
    }, [client, source.id, videoRef]);

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
                    // controls
                    // muted
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
                }}
                onDoubleClick={() => toggleMaximizeCell()}
            >
                {/*    /!*    <footer*!/*/}
                {/*    /!*        css={css`*!/*/}
                {/*    /!*            position: absolute;*!/*/}
                {/*    /!*            bottom: 0;*!/*/}
                {/*    /!*            left: 0;*!/*/}
                {/*    /!*            right: 0;*!/*/}
                {/*    /!*            //background: rgba(0, 0, 0, 0.5);*!/*/}
                {/*    /!*            padding: 16px 16px;*!/*/}
                {/*    /!*            display: flex;*!/*/}
                {/*    /!*            flex-direction: row;*!/*/}
                {/*    /!*            align-items: center;*!/*/}
                {/*    /!*            justify-content: space-between;*!/*/}
                {/*    /!*            pointer-events: none;*!/*/}
                {/*    /!*        `}*!/*/}
                {/*    /!*    >*!/*/}
                {/*    /!*        <IconButton>*!/*/}
                {/*    /!*            <span className="material-icons">play_arrow</span>*!/*/}
                {/*    /!*        </IconButton>*!/*/}
                {/*    /!*        <div*!/*/}
                {/*    /!*            css={css`*!/*/}
                {/*    /!*                display: flex;*!/*/}
                {/*    /!*                flex-direction: row;*!/*/}
                {/*    /!*                align-items: center;*!/*/}
                {/*    /!*                gap: 16px;*!/*/}
                {/*    /!*            `}*!/*/}
                {/*    /!*        >*!/*/}
                {/*    /!*            <IconButton>*!/*/}
                {/*    /!*                <span className="material-icons">volume_up</span>*!/*/}
                {/*    /!*            </IconButton>*!/*/}
                {/*    /!*            /!*<IconButton>*!/*!/*/}
                {/*    /!*            /!*    <span className="material-icons">volume_off</span>*!/*!/*/}
                {/*    /!*            /!*</IconButton>*!/*!/*/}

                {/*    /!*            <IconButton>*!/*/}
                {/*    /!*                <span className="material-icons">fullscreen</span>*!/*/}
                {/*    /!*            </IconButton>*!/*/}
                {/*    /!*        </div>*!/*/}
                {/*    /!*    </footer>*!/*/}

                {/*    /!*    /!*<IconButton>*!/*!/*/}
                {/*    /!*    /!*    <span className="material-icons">pause</span>*!/*!/*/}
                {/*    /!*    /!*</IconButton>*!/*!/*/}
            </div>
        </div>
    );
};

// const IconButton = styled.button`
//     background: none;
//     border: none;
//     color: #fff;
//     width: 64px;
//     height: 64px;
//     cursor: pointer;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//
//     &:hover {
//         color: #ccc;
//     }
//
//     .material-icons {
//         font-size: 48px;
//     }
// `;
