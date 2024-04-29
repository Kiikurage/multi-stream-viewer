import { ReactNode } from 'react';
import { useCellDragState } from './useCellDragState';

/**
 *
 * @param row 1-based row index
 * @param col 1-based column index
 */
export const GridCellView = ({
    cellIndex,
    row,
    col,
    children,
}: {
    cellIndex: number;
    row: number;
    col: number;
    children?: ReactNode;
}) => {
    const [cellDragState, setCellDragState] = useCellDragState();

    return (
        <div
            onMouseDown={(ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                setCellDragState((oldState) => ({ ...oldState, isDragging: true, sourceCellIndex: cellIndex }));
            }}
            onMouseEnter={() => setCellDragState((oldState) => ({ ...oldState, destinationCellIndex: cellIndex }))}
            onMouseLeave={() => setCellDragState((oldState) => ({ ...oldState, destinationCellIndex: null }))}
            style={{
                position: 'relative',
                gridRow: row,
                gridColumn: col,
                border: '1px solid #000',
            }}
        >
            <div style={{ zIndex: 0 }}>{children}</div>
            <div
                style={{
                    pointerEvents: 'none',
                    visibility: cellDragState.isDragging ? 'visible' : 'hidden',
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    background:
                        cellDragState.sourceCellIndex === cellIndex
                            ? 'rgba(255,151,0,0.2)'
                            : cellDragState.destinationCellIndex === cellIndex
                              ? 'rgba(255,151,0,0.5)'
                              : 'rgba(255,151,0,0.05)',
                }}
            ></div>
        </div>
    );
};
