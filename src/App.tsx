import { FC, useCallback, useState } from 'react';
import { Rpc } from './rpc';

export const App: FC = () => {
    const [tabs, setTabs] = useState<Rpc.TabData[]>([]);

    const handleClick = useCallback(async () => {
        const tabs = await Rpc.getTabList();
        setTabs(tabs);
    }, []);

    const handleDisplayButtonClick = useCallback(async (tabId: number) => {
        const videoUrl = await Rpc.requestVideoUrl({ tabId });
        console.log(videoUrl);
    }, []);

    return (
        <div>
            <button onClick={handleClick}>リロード</button>
            <ul>
                {tabs.map((tab) => (
                    <li key={tab.id}>
                        {tab.title} - {tab.url}
                        <button onClick={() => handleDisplayButtonClick(tab.id)}>表示</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
