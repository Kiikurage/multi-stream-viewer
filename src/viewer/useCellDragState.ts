import { createContext, Dispatch, SetStateAction, useContext } from 'react';

export interface CellDragState {
    isDragging: boolean;
    sourceCellIndex: number | null;
    destinationCellIndex: number | null;
    onDragEnd: (sourceCellIndex: number, destinationCellIndex: number) => void;
}

const CellDragStateContext = createContext<[CellDragState, Dispatch<SetStateAction<CellDragState>>]>(null as never);

const CellDragStateContextProvider = CellDragStateContext.Provider;
export { CellDragStateContextProvider as CellDragStateContext };

export function useCellDragState() {
    const [state, setState] = useContext(CellDragStateContext);

    return [state, setState] as const;
}
