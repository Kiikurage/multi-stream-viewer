import { Source } from '../model/Source';
import { defineRpcToBackground, defineRpcToTab } from '../lib/rpc';

export const registerExtensionTab = defineRpcToBackground<void, void>('registerViewer');

export const notifySourceUpdate = defineRpcToTab<
    {
        sources: Source[];
    },
    void
>('notifySourceUpdate');

export const registerSource = defineRpcToBackground<
    {
        sourceId: string;
        title: string;
    },
    void
>('registerVideoSource');
