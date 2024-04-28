import { defineRpcToBackground, defineRpcToTab } from '../lib/rpc'; // Session Description (SDP) negotiation

// Session Description (SDP) negotiation
export const shareSDPToBackground = defineRpcToBackground<
    { offer: RTCSessionDescriptionInit; sourceTabId: number },
    { answer: RTCSessionDescriptionInit }
>('shareSDPToBackground');
export const shareSDPToSourceTab = defineRpcToTab<
    { offer: RTCSessionDescriptionInit; extensionTabId: number },
    { answer: RTCSessionDescriptionInit }
>('shareSDPToSourceTab');

// ICE negotiation
export const shareICECandidateToBackground = defineRpcToBackground<
    {
        sourceId: string;
        candidate: RTCIceCandidateInit;
        extensionTabId: number;
    },
    void
>('shareICECandidateToBackground');
export const shareICECandidateToExtensionTab = defineRpcToTab<{ candidate: RTCIceCandidateInit }, void>(
    'shareICECandidateToExtensionTab',
);

// Disconnect
export const disconnectToBackground = defineRpcToBackground<
    {
        sourceId: string;
    },
    void
>('disconnectToBackground');
export const disconnectToSourceTab = defineRpcToTab<
    {
        extensionTabId: number;
    },
    void
>('disconnectToSourceTab');
