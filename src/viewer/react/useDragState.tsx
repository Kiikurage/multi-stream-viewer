import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react';

export interface DragState {
    dragType: DragType;
    isDragging: boolean;
    sourceCellIndex: number | null;
    destinationCellIndex: number | null;
    onDragEnd: (dragType: DragType, sourceCellIndex: number, destinationCellIndex: number) => void;
}

const context = createContext<[DragState, Dispatch<SetStateAction<DragState>>]>(null as never);

export const DragContext = ({
    onDragEnd,
    children,
}: {
    onDragEnd: (dragType: DragType, sourceCellIndex: number, destinationCellIndex: number) => void;
    children?: ReactNode;
}) => {
    const [state, setState] = useState<DragState>({
        dragType: 'none',
        sourceCellIndex: null,
        destinationCellIndex: null,
        isDragging: false,
        onDragEnd: onDragEnd,
    });

    useEffect(() => {
        const handleMouseUp = (ev: MouseEvent) => {
            if (!state.isDragging) return;
            ev.stopPropagation();
            ev.preventDefault();
            document.removeEventListener('mouseup', handleMouseUp);

            if (state.sourceCellIndex !== null && state.destinationCellIndex !== null) {
                state.onDragEnd(state.dragType, state.sourceCellIndex, state.destinationCellIndex);
            }

            setState((oldState) => ({ ...oldState, isDragging: false }));
        };

        document.addEventListener('mouseup', handleMouseUp);

        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, [state]);

    return <context.Provider value={[state, setState]}>{children}</context.Provider>;
};

export function useDragState(cellIndex: number) {
    const [state, setState] = useContext(context);

    const handleDragStart = (dragType: DragType) => {
        setState((oldState) => ({ ...oldState, dragType, isDragging: true, sourceCellIndex: cellIndex }));
    };

    const handleDragEnter = () => {
        setState((oldState) => ({ ...oldState, destinationCellIndex: cellIndex }));
    };

    const handleDragLeave = () => {
        setState((oldState) => {
            if (oldState.destinationCellIndex !== cellIndex) return oldState;

            return { ...oldState, destinationCellIndex: null };
        });
    };

    return {
        isDragging: state.isDragging,
        isSourceCell: state.sourceCellIndex === cellIndex,
        isDestinationCell: state.destinationCellIndex === cellIndex,
        handleDragEnter,
        handleDragLeave,
        handleDragStart,
    };
}

export type DragType = 'none' | 'move' | 's-resize' | 'se-resize' | 'e-resize';
