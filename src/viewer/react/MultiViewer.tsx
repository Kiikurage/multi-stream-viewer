import { ReactNode, useEffect, useState } from 'react';
import { notifySourceUpdate, registerExtensionTab } from '../../rpc/application';
import { VideoTile } from './VideoTile';
import { GridLayoutView } from './GridLayoutView';
import { GridState } from '../model/GridState';
import { GridCellView } from './GridCellView';
import { DragContext, DragType } from './useDragState';
import { WebRTCReceiverManagerContext } from './useWebRTCReceiver';
import { AppStateContext } from './useAppState';
import { AppState } from '../model/AppState';
import { ControlPanel } from './ControlPanel';
import { css } from '@emotion/react';
import { useMessageClient } from './useMessageClient';

export const MultiViewer = () => {
    const [appState, setAppState] = useState<AppState>(() => AppState.create());
    const client = useMessageClient();
    useEffect(() => {
        client.onSourceListChange = (sources) => {
            setAppState((oldState) => AppState.setSources(oldState, sources));
        };
    }, [client]);

    useEffect(() => {
        notifySourceUpdate.addListener((sender, request) => {
            setAppState((oldState) => AppState.setSources(oldState, request.sources));
        });
        registerExtensionTab();
    }, []);

    const handleDragEnd = (dragType: DragType, sourceCellIndex: number, destinationCellIndex: number) => {
        setAppState((oldState) => {
            const oldCell = oldState.grid.cells[sourceCellIndex];
            const [row0, col0] = GridState.index2pos(oldState.grid.columns, sourceCellIndex);
            const [row1, col1] = GridState.index2pos(oldState.grid.columns, destinationCellIndex);
            const dx = col1 - col0;
            const dy = row1 - row0;

            switch (dragType) {
                case 'move': {
                    // TODO: セルの途中からmoveした場合にバグる

                    const [top0, left0] = GridState.index2pos(oldState.grid.columns, sourceCellIndex);
                    const left1 = Math.min(Math.max(0, left0 + dx), oldState.grid.columns - oldCell.width);
                    const top1 = Math.min(Math.max(0, top0 + dy), oldState.grid.rows - oldCell.height);
                    const index1 = GridState.pos2index(oldState.grid.columns, top1, left1);

                    return {
                        ...oldState,
                        grid: GridState.swapCells(oldState.grid, sourceCellIndex, index1),
                    };
                }
                case 'e-resize': {
                    const width1 = oldCell.width + dx;

                    return {
                        ...oldState,
                        grid: GridState.updateCell(oldState.grid, sourceCellIndex, (oldCell) => ({
                            ...oldCell,
                            width: Math.max(1, width1),
                        })),
                    };
                }
                case 's-resize': {
                    const height1 = oldCell.height + dy;

                    return {
                        ...oldState,
                        grid: GridState.updateCell(oldState.grid, sourceCellIndex, (oldCell) => ({
                            ...oldCell,
                            height: Math.max(1, height1),
                        })),
                    };
                }
                case 'se-resize': {
                    const width1 = oldCell.width + dx;
                    const height1 = oldCell.height + dy;

                    return {
                        ...oldState,
                        grid: GridState.updateCell(oldState.grid, sourceCellIndex, (oldCell) => ({
                            ...oldCell,
                            width: Math.max(1, width1),
                            height: Math.max(1, height1),
                        })),
                    };
                }
            }

            return oldState;
        });
    };

    const maximizedCell =
        appState.grid.maximizedCellIndex === null ? null : appState.grid.cells[appState.grid.maximizedCellIndex];

    return (
        <AppStateContext state={appState} setState={setAppState}>
            <WebRTCReceiverManagerContext>
                <DragContext onDragEnd={handleDragEnd}>
                    <div
                        css={css`
                            position: fixed;
                            inset: 0;
                            background: #000;
                            display: flex;
                            flex-direction: row;
                        `}
                    >
                        <ControlPanel />
                        <div style={{ flex: '1 1 0' }}>
                            {maximizedCell === null ? (
                                <GridLayoutView columns={appState.grid.columns} rows={appState.grid.rows}>
                                    {appState.grid.cells.map((cell, cellIndex) => {
                                        const [row, col] = GridState.index2pos(appState.grid.columns, cellIndex);

                                        let content: ReactNode = null;
                                        if (cell.source !== null) {
                                            content = <VideoTile source={cell.source} />;
                                        }

                                        return (
                                            <GridCellView
                                                cellIndex={cellIndex}
                                                key={cellIndex}
                                                row={row + 1}
                                                col={col + 1}
                                                width={cell.width}
                                                height={cell.height}
                                            >
                                                {content}
                                            </GridCellView>
                                        );
                                    })}
                                </GridLayoutView>
                            ) : (
                                <GridCellView cellIndex={0} row={1} col={1} width={1} height={1}>
                                    {maximizedCell.source === null ? null : <VideoTile source={maximizedCell.source} />}
                                </GridCellView>
                            )}
                        </div>
                    </div>
                </DragContext>
            </WebRTCReceiverManagerContext>
        </AppStateContext>
    );
};
