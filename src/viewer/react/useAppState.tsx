import { createContext, Dispatch, ReactNode, SetStateAction, useContext } from 'react';
import { AppState } from '../model/AppState';
import { Source } from '../../model/Source';
import { useMessageClient } from './useMessageClient';

const context = createContext<[AppState, Dispatch<SetStateAction<AppState>>]>(null as never);

export const AppStateContext = ({
    children,
    state,
    setState,
}: {
    children: ReactNode;
    state: AppState;
    setState: Dispatch<SetStateAction<AppState>>;
}) => {
    return <context.Provider value={[state, setState]}>{children}</context.Provider>;
};

export function useAppState(): AppState {
    return useContext(context)[0];
}

export function useSetSourceToEmptyCell() {
    const [, setAppState] = useContext(context);
    const client = useMessageClient();

    return (source: Source) => {
        setAppState((oldState) => {
            return AppState.setSourceToEmptyCell(oldState, source);
        });
        client.pullVideoData(source.id);
    };
}

export function useRemoveCellBySource() {
    const [, setAppState] = useContext(context);

    return (source: Source) => {
        setAppState((oldState) => AppState.removeCellBySource(oldState, source));
    };
}

export function useToggleMaximizeCell(source: Source) {
    const [, setAppState] = useContext(context);

    return () => {
        setAppState((oldState) => {
            const index = oldState.grid.cells.findIndex((cell) => cell.source?.id === source.id);
            if (index === -1) return oldState;

            return {
                ...oldState,
                grid: {
                    ...oldState.grid,
                    maximizedCellIndex: oldState.grid.maximizedCellIndex === index ? null : index,
                },
            };
        });
    };
}

export function useUpdateGridSize() {
    const [, setAppState] = useContext(context);

    return (rows: number | null, columns: number | null) => {
        setAppState((oldState) => AppState.setGridSize(oldState, rows, columns));
    };
}

export function useSetSelectedSourceId() {
    const [, setAppState] = useContext(context);

    return (sourceId: string | undefined) => {
        setAppState((oldState) => ({
            ...oldState,
            selectedSourceId: sourceId,
        }));
    };
}

export function useToggleControlPanel() {
    const [, setAppState] = useContext(context);

    return () => {
        setAppState((oldState) => AppState.toggleControlPanel(oldState));
    };
}
