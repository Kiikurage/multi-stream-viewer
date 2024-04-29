import { ReactNode } from 'react';
import { useDragState } from './useDragState';

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
    const { handleDragLeave, handleDragEnter, handleDragStart, isDestinationCell, isDragging, isSourceCell } =
        useDragState(cellIndex);

    return (
        <div
            onMouseDown={(ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                handleDragStart();
            }}
            onMouseEnter={handleDragEnter}
            onMouseLeave={handleDragLeave}
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
                    visibility: isDragging ? 'visible' : 'hidden',
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    background: isSourceCell
                        ? 'rgba(255,151,0,0.2)'
                        : isDestinationCell
                          ? 'rgba(255,151,0,0.5)'
                          : 'rgba(255,151,0,0.05)',
                }}
            ></div>
        </div>
    );
};
