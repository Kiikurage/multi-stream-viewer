import { ReactNode } from 'react';
import { useDragState } from './useDragState';
import { useAppState } from './useAppState';
import { css } from '@emotion/react';

/**
 *
 * @param row 1-based row index
 * @param col 1-based column index
 */
export const GridCellView = ({
    cellIndex,
    row,
    col,
    width,
    height,
    children,
}: {
    cellIndex: number;
    row: number;
    col: number;
    width: number;
    height: number;
    children?: ReactNode;
}) => {
    const { handleDragLeave, handleDragEnter, handleDragStart } = useDragState(cellIndex);
    const {
        controlPanel: { expanded },
    } = useAppState();

    return (
        <div
            onMouseDown={(ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                handleDragStart('move');
            }}
            onMouseEnter={handleDragEnter}
            onMouseLeave={handleDragLeave}
            css={css`
                position: relative;
                grid-row: ${row} / ${row + height};
                grid-column: ${col} / ${col + width};
                border-width: 1px;
                border-style: ${expanded ? 'dashed' : 'none'};
                border-color: rgba(15, 15, 28, 0.9);
            `}
        >
            <div style={{ zIndex: 0 }}>{children}</div>
            {/*<div*/}
            {/*    style={{*/}
            {/*        pointerEvents: 'none',*/}
            {/*        visibility: isDragging ? 'visible' : 'hidden',*/}
            {/*        position: 'absolute',*/}
            {/*        inset: 0,*/}
            {/*        zIndex: 1,*/}
            {/*        background: isSourceCell*/}
            {/*            ? 'rgba(255,151,0,0.2)'*/}
            {/*            : isDestinationCell*/}
            {/*              ? 'rgba(255,151,0,0.5)'*/}
            {/*              : 'rgba(255,151,0,0.05)',*/}
            {/*    }}*/}
            {/*></div>*/}
            <div
                aria-label="s-resize"
                css={css`
                    resize: both;
                    position: absolute;
                    left: 0;
                    right: 16px;
                    bottom: 0;
                    height: 16px;
                    cursor: s-resize;
                `}
                onMouseDown={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    handleDragStart('s-resize');
                }}
            ></div>
            <div
                aria-label="se-resize"
                css={css`
                    resize: both;
                    position: absolute;
                    right: 0;
                    bottom: 0;
                    width: 16px;
                    height: 16px;
                    cursor: se-resize;
                `}
                onMouseDown={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    handleDragStart('se-resize');
                }}
            ></div>
            <div
                aria-label="e-resize"
                css={css`
                    resize: both;
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 16px;
                    width: 16px;
                    cursor: e-resize;
                `}
                onMouseDown={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    handleDragStart('e-resize');
                }}
            ></div>
        </div>
    );
};
