import { MediaElementSourceAdapter } from './MediaElementSourceAdapter';

export class NicoLiveSourceAdapter extends MediaElementSourceAdapter {
    constructor() {
        super();
    }

    getVideo(): HTMLVideoElement | null {
        return document.querySelector('video');
    }
}
