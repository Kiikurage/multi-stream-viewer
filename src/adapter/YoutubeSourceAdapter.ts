import { MediaElementSourceAdapter } from './MediaElementSourceAdapter';

export class YoutubeSourceAdapter extends MediaElementSourceAdapter {
    constructor() {
        super();
    }

    getVideo(): HTMLVideoElement | null {
        return document.querySelector('video');
    }
}
