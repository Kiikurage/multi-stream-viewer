import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { WebRTCReceiverManager } from '../WebRTCReceiverManager';
import { Source } from '../../model/Source';

const context = createContext<WebRTCReceiverManager>(null as never);

export const WebRTCReceiverManagerContext = ({ children }: { children?: ReactNode }) => {
    const [manager] = useState(() => new WebRTCReceiverManager());

    useEffect(() => {
        return () => {
            manager.dispose();
        };
    }, [manager]);

    return <context.Provider value={manager}>{children}</context.Provider>;
};

export function useWebRTCReceiverManager() {
    return useContext(context);
}

export function useWebRTCClient(source: Source) {
    const manager = useWebRTCReceiverManager();

    return manager.getClient(source) ?? manager.createClient(source);
}
