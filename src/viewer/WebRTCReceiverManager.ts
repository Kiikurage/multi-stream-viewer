import { Source } from '../model/Source';
import { WebRTCReceiverClient } from './WebRTCReceiverClient';

export class WebRTCReceiverManager {
    private clients: Map<string, WebRTCReceiverClient> = new Map();

    createClient(source: Source) {
        const client = new WebRTCReceiverClient(source);
        client.connect();
        this.clients.set(source.id, client);
        return client;
    }

    getClient(source: Source) {
        return this.clients.get(source.id);
    }

    dispose() {
        this.clients.forEach((client) => client.disconnect());
        this.clients.clear();
    }
}
