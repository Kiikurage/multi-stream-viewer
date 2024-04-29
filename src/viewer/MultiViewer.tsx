import { ReactNode, useCallback, useEffect, useState } from 'react';
import { notifySourceUpdate, registerExtensionTab } from '../rpc/application';
import { Source } from '../model/Source';
import { VideoTile } from './VideoTile';
import { GridLayoutView } from './GridLayoutView';
import { GridState } from './GridState';
import { GridCellView } from './GridCellView';
import { CellDragState, CellDragStateContext } from './useCellDragState';

export const MultiViewer = () => {
    const [gridState, setGridState] = useState<GridState>(() => GridState.create());
    const [sources, setSources] = useState<Source[]>([]);

    const rows = gridState.rowHeights.length;
    const columns = gridState.colWidths.length;

    const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>();
    useEffect(() => {
        notifySourceUpdate.addListener((sender, request) => {
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

    useEffect(() => {
        setGridState((oldState) =>
            GridState.filterCells(oldState, (cell) => {
                const currentSource = cell.source;
                if (currentSource === null) return true;
                return sources.some((source) => currentSource.id === source.id);
            }),
        );
    }, [sources]);

    const handleAddButtonClick = useCallback(() => {
        const selectedSource = sources.find((tab) => tab.id === selectedSourceId);
        if (selectedSource === undefined) return;

        setGridState((oldState) => {
            const emptyCellIndex = GridState.findEmptyCell(oldState);
            if (emptyCellIndex === null) return oldState;

            return GridState.updateCell(oldState, emptyCellIndex, (cell) => ({ ...cell, source: selectedSource }));
        });
    }, [selectedSourceId, sources]);

    const handleCloseButtonClick = useCallback((cellIndex: number) => {
        setGridState((oldState) => {
            return GridState.updateCell(oldState, cellIndex, (cell) => ({ ...cell, source: null }));
        });
    }, []);

    const [cellDragState, setCellDragState] = useState<CellDragState>({
        sourceCellIndex: null,
        destinationCellIndex: null,
        isDragging: false,
        onDragEnd: (sourceCellIndex, destinationCellIndex) => {
            setGridState((oldState) => {
                return GridState.swapCells(oldState, sourceCellIndex, destinationCellIndex);
            });
        },
    });

    return (
        <CellDragStateContext value={[cellDragState, setCellDragState]}>
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
                    <select
                        value={rows}
                        onChange={(ev) => {
                            const newRows = +ev.currentTarget.value;

                            setGridState((oldState) =>
                                GridState.setGridSize(oldState, newRows, oldState.colWidths.length),
                            );
                        }}
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>

                    <span>横</span>
                    <select
                        value={columns}
                        onChange={(ev) => {
                            const newColumns = +ev.currentTarget.value;

                            setGridState((oldState) =>
                                GridState.setGridSize(oldState, oldState.rowHeights.length, newColumns),
                            );
                        }}
                    >
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
                        {gridState.cells.map((cell, cellIndex) => {
                            const [row, col] = GridState.index2pos(gridState, cellIndex);

                            let content: ReactNode = null;
                            if (cell.source !== null) {
                                content = (
                                    <VideoTile
                                        source={cell.source}
                                        onCloseButtonClick={() => handleCloseButtonClick(cellIndex)}
                                    />
                                );
                            }

                            return (
                                <GridCellView cellIndex={cellIndex} key={cellIndex} row={row + 1} col={col + 1}>
                                    {content}
                                </GridCellView>
                            );
                        })}
                    </GridLayoutView>
                </div>
            </div>
        </CellDragStateContext>
    );
};
