import { ReactNode, useEffect, useState } from 'react';
import { useCellDragState } from './useCellDragState';

export const GridLayoutView = ({
    rows,
    columns,
    children,
}: {
    rows: number;
    columns: number;
    children?: ReactNode;
}) => {
    const [rowHeights, setRowHeights] = useState<number[]>(() => [1]);
    const [colWidths, setColWidths] = useState<number[]>(() => [1]);

    useEffect(() => {
        setRowHeights((rowHeights) => adjustItemCount(rowHeights, rows));
    }, [rows]);

    useEffect(() => {
        setColWidths((colWidths) => adjustItemCount(colWidths, columns));
    }, [columns]);

    const [cellDragState, setCellDragState] = useCellDragState();

    useEffect(() => {
        const handleMouseUp = (ev: MouseEvent) => {
            ev.stopPropagation();
            ev.preventDefault();
            const { sourceCellIndex, destinationCellIndex } = cellDragState;

            if (sourceCellIndex !== null && destinationCellIndex !== null) {
                cellDragState.onDragEnd(sourceCellIndex, destinationCellIndex);
            }
            setCellDragState((oldState) => ({ ...oldState, isDragging: false }));
        };

        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [cellDragState, setCellDragState]);

    return (
        <div
            style={{
                position: 'relative',
                background: '#000',
                width: '100%',
                height: '100%',
                display: 'grid',
                gridTemplateRows: generateGridTemplate(rowHeights),
                gridTemplateColumns: generateGridTemplate(colWidths),
            }}
        >
            {children}
        </div>
    );
};

function generateGridTemplate(sizes: number[]) {
    return sizes.map((size) => `${size * 100}%`).join(' ');
}

function adjustItemCount(oldSizes: number[], count: number): number[] {
    if (oldSizes.length === count) return oldSizes;

    const newSizes = [...oldSizes];
    while (newSizes.length < count) {
        newSizes.push(1 / oldSizes.length);
    }
    while (newSizes.length > count) {
        newSizes.pop();
    }

    const totalSize = newSizes.reduce((x, y) => x + y);

    let accumulatedSize = 0;
    for (let i = 0; i < newSizes.length - 1; i++) {
        newSizes[i] /= totalSize;
        accumulatedSize += newSizes[i];
    }
    newSizes[newSizes.length - 1] = 1 - accumulatedSize;

    return newSizes;
}
