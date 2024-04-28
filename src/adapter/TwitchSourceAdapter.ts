import { MediaElementSourceAdapter } from './MediaElementSourceAdapter';

export class TwitchSourceAdapter extends MediaElementSourceAdapter {
    constructor() {
        super();
    }

    getVideo(): HTMLVideoElement | null {
        return document.querySelector('video');
    }
}
