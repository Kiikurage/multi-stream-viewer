import { Source } from './Source';

export type Message =
    | ListMessage
    | RegisterSourceMessage
    | RegisterViewerMessage
    | UnregisterSourceMessage
    | UnregisterViewerMessage
    | PullMessage
    | ChunkMessage;

/**
 * Register video source
 */
export interface RegisterSourceMessage {
    type: 'registerSource';
    source: Source;
    transfer: Transferable[];
}

/**
 * Register viewer
 */
export interface RegisterViewerMessage {
    type: 'registerViewer';
    viewerId: string;
    transfer: Transferable[];
}

/**
 * Register video source
 */
export interface UnregisterSourceMessage {
    type: 'unregisterSource';
    sourceId: string;
    transfer: Transferable[];
}

/**
 * Register viewer
 */
export interface UnregisterViewerMessage {
    type: 'unregisterViewer';
    viewerId: string;
    transfer: Transferable[];
}

/**
 * Push video source list to extension page
 */
export interface ListMessage {
    type: 'list';
    sources: Source[];
    transfer: Transferable[];
}

export interface PullMessage {
    type: 'pull';
    viewerId: string;
    sourceId: string;
    transfer: Transferable[];
}

export interface ChunkMessage {
    type: 'chunk';
    sourceId: string;
    viewerId: string;
    metadata: {
        format: VideoPixelFormat;
        codedWidth: number;
        codedHeight: number;
        timestamp: number;
        duration: number;
        visibleRect: DOMRectReadOnly;
        transfer: Transferable[];
    };
    transfer: Transferable[];
}
