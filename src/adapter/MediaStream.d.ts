/* eslint-disable no-var */
export {};

declare global {
    var MediaStreamTrackProcessor: {
        new (track: MediaStreamTrack): MediaStreamTrackProcessor;
    };

    interface MediaStreamTrackProcessor {
        readonly readable: ReadableStream;
    }

    var MediaStreamTrackGenerator: {
        new (kind: 'video' | 'audio'): MediaStreamTrackGenerator;
    };

    interface MediaStreamTrackGenerator {
        readonly writable: WritableStream;
    }

    interface NewMediaStreamConstructor {
        new (tracks: MediaStreamTrackGenerator[]): MediaStream;
    }
}
