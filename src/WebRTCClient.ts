export class WebRTCClient {
    private readonly pc: RTCPeerConnection;

    constructor(
        private readonly onTrack: (stream: MediaStream) => void,
        private readonly onIceCandidate: (candidate: RTCIceCandidateInit) => void,
    ) {
        this.pc = new RTCPeerConnection();
        this.pc.addEventListener('track', (ev) => this.onTrack(ev.streams[0]));
        this.pc.addEventListener('icecandidate', (ev) => {
            console.log('on:icecandidate');
            const candidate: Partial<RTCIceCandidateInit> = { candidate: undefined };
            if (ev.candidate) {
                candidate.candidate = ev.candidate.candidate;
                candidate.sdpMid = ev.candidate.sdpMid;
                candidate.sdpMLineIndex = ev.candidate.sdpMLineIndex;
            }
            this.onIceCandidate(candidate);
        });
    }

    setMediaStream(stream: MediaStream) {
        setTimeout(() => {
            console.log('setMediaStream');
            stream.getTracks().forEach((track) => this.pc.addTrack(track, stream));
        }, 5000);
    }

    async createOffer() {
        const offer = await this.pc.createOffer();
        console.log('Offer:', offer);
        await this.pc.setLocalDescription(offer);
        console.log('createOffer.setLocalDescription:done');
        return offer;
    }

    async setOffer(offer: RTCSessionDescriptionInit) {
        this.pc.setRemoteDescription(offer);
        console.log('setOffer.setRemoteDescription:done');
        const answer = await this.pc.createAnswer();
        console.log('Answer:', answer);
        await this.pc.setLocalDescription(answer);
        console.log('setOffer.setLocalDescription:done');

        return answer;
    }

    async setAnswer(answer: RTCSessionDescriptionInit) {
        this.pc.setRemoteDescription(answer);
        console.log('setAnswer.setRemoteDescription:done');
    }

    async setIceCandidate(addIceCandidate: RTCIceCandidateInit) {
        this.pc.addIceCandidate(addIceCandidate);
        console.log('setIceCandidate.addIceCandidate:done');
    }
}
