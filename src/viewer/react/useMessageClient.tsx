import { MessageClient } from '../MessageClient';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const context = createContext<MessageClient>(null as never);

export function useMessageClient(): MessageClient {
    return useContext(context);
}

export const MessageClientContext = ({ children }: { children?: ReactNode }) => {
    const [client] = useState(() => new MessageClient());

    useEffect(() => {
        return () => client.dispose();
    }, [client]);

    return <context.Provider value={client}>{children}</context.Provider>;
};
