import { ReactNode, useEffect, useState } from 'react';
import { notifySourceUpdate, registerExtensionTab } from '../../rpc/application';
import { VideoTile } from './VideoTile';
import { GridLayoutView } from './GridLayoutView';
import { GridState } from '../model/GridState';
import { GridCellView } from './GridCellView';
import { DragContext } from './useDragState';
import { WebRTCReceiverManagerContext } from './useWebRTCReceiver';
import { AppStateContext } from './useAppState';
import { AppState } from '../model/AppState';
import { ControlPanel } from './ControlPanel';

export const MultiViewer = () => {
    const [appState, setAppState] = useState<AppState>(() => ({
        grid: GridState.create(),
        sources: [],
        selectedSourceId: undefined,
    }));

    useEffect(() => {
        notifySourceUpdate.addListener((sender, request) => {
            setAppState((oldState) => AppState.setSources(oldState, request.sources));
        });
        registerExtensionTab();
    }, []);

    const handleDragEnd = (sourceCellIndex: number, destinationCellIndex: number) => {
        setAppState((oldState) => ({
            ...oldState,
            grid: GridState.swapCells(oldState.grid, sourceCellIndex, destinationCellIndex),
        }));
    };

    return (
        <AppStateContext state={appState} setState={setAppState}>
            <WebRTCReceiverManagerContext>
                <DragContext onDragEnd={handleDragEnd}>
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: '#000',
                            display: 'flex',
                            flexDirection: 'row',
                        }}
                    >
                        <ControlPanel />
                        <div style={{ flex: '1 1 0' }}>
                            <GridLayoutView
                                columns={appState.grid.colWidths.length}
                                rows={appState.grid.rowHeights.length}
                            >
                                {appState.grid.cells.map((cell, cellIndex) => {
                                    const [row, col] = GridState.index2pos(appState.grid, cellIndex);

                                    let content: ReactNode = null;
                                    if (cell.source !== null) {
                                        content = <VideoTile source={cell.source} />;
                                    }

                                    return (
                                        <GridCellView cellIndex={cellIndex} key={cellIndex} row={row + 1} col={col + 1}>
                                            {content}
                                        </GridCellView>
                                    );
                                })}
                            </GridLayoutView>
                        </div>{' '}
                    </div>
                </DragContext>
            </WebRTCReceiverManagerContext>
        </AppStateContext>
    );
};
