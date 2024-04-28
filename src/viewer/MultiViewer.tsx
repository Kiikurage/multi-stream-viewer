import { useCallback, useEffect, useState } from 'react';
import { notifySourceUpdate, registerExtensionTab } from '../rpc/application';
import { Source } from '../model/Source';
import { VideoTile } from './VideoTile';
import { GridLayoutView } from './GridLayoutView';

export const MultiViewer = () => {
    const [sources, setSources] = useState<Source[]>([]);
    const [rows, setRows] = useState<number>(2);
    const [columns, setColumns] = useState<number>(2);
    const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>();
    useEffect(() => {
        notifySourceUpdate.addHandler((sender, request) => {
            setSources(request.sources);
            setSelectedSourceId(request.sources[0]?.id);
        });
        registerExtensionTab();
    }, []);

    useEffect(() => {
        setSelectedSourceId((sourceId) => {
            if (sources.find((source) => source.id === sourceId) === undefined) {
                return undefined;
            } else {
                return sourceId;
            }
        });
    }, [sources]);

    const [activeSources, setActiveSources] = useState<(Source | null)[]>([]);
    useEffect(() => {
        setActiveSources((activeSources) => {
            return activeSources.map((source) => {
                if (source === null) return null;
                if (sources.some((s) => source.id === s.id)) {
                    return source;
                } else {
                    return null;
                }
            });
        });
    }, [sources]);
    useEffect(() => {
        setActiveSources((oldSources) => {
            const newSources = oldSources.slice(0, rows * columns);
            while (newSources.length < rows * columns) {
                newSources.push(null);
            }
            return newSources;
        });
    }, [rows, columns, sources]);

    const handleAddButtonClick = useCallback(() => {
        const selectedSource = sources.find((tab) => tab.id === selectedSourceId);
        if (selectedSource === undefined) return;

        setActiveSources((sources) => {
            const index = sources.findIndex((source) => source === null);
            if (index === -1) return sources;

            const newSources = [...sources];
            newSources[index] = selectedSource;
            return newSources;
        });
    }, [selectedSourceId, sources]);

    const handleCloseButtonClick = useCallback((sourceId: string) => {
        setActiveSources((activeSources) => activeSources.map((source) => (source?.id === sourceId ? null : source)));
        //TODO: Backendでもconnectionを削除する
    }, []);

    console.log(activeSources);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'grid',
                gridTemplate: '"header" auto\n"grid" 1fr / 1fr',
            }}
        >
            <header
                style={{
                    gridArea: 'header',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: '8px 16px',
                    gap: '16px',
                }}
            >
                <select value={selectedSourceId} onChange={(ev) => setSelectedSourceId(ev.currentTarget.value)}>
                    {sources.map((source) => (
                        <option key={source.id} value={source.id}>
                            {source.title}
                        </option>
                    ))}
                </select>
                <button onClick={handleAddButtonClick}>追加</button>

                <span>縦</span>
                <select value={rows} onChange={(ev) => setRows(+ev.currentTarget.value)}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>

                <span>横</span>
                <select value={columns} onChange={(ev) => setColumns(+ev.currentTarget.value)}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </header>
            <div
                style={{
                    gridArea: 'grid',
                }}
            >
                <GridLayoutView columns={columns} rows={rows}>
                    {activeSources.map((source, i) => {
                        if (source === null) return null;

                        const row = Math.floor(i / columns);
                        const col = i % columns;
                        return (
                            <div
                                key={i}
                                style={{
                                    gridRow: row + 1,
                                    gridColumn: col + 1,
                                }}
                            >
                                <VideoTile
                                    source={source}
                                    onCloseButtonClick={() => handleCloseButtonClick(source.id)}
                                />
                            </div>
                        );
                    })}
                </GridLayoutView>
            </div>
        </div>
    );
};
