import { Source } from '../model/Source';

export interface Cell {
    source: Source | null;
}

export interface GridState {
    rowHeights: number[]; // percentage of total height, (0, 1]
    colWidths: number[]; // percentage of total width, (0, 1]
    cells: Cell[];
}

export module GridState {
    export function create(): GridState {
        return {
            rowHeights: [1],
            colWidths: [1],
            cells: [Cell.create()],
        };
    }

    export function pos2index(state: GridState, row: number, column: number): number {
        return row * state.colWidths.length + column;
    }

    export function index2pos(state: GridState, index: number): [row: number, column: number] {
        return [Math.floor(index / state.colWidths.length), index % state.colWidths.length];
    }

    export function setGridSize(oldState: GridState, rows: number, columns: number): GridState {
        const newState = { ...oldState };
        newState.rowHeights = resizeSizeArray(newState.rowHeights, rows);
        newState.colWidths = resizeSizeArray(newState.colWidths, columns);
        newState.cells = resizeCellArray(newState.cells, rows * columns);
        return newState;
    }

    export function filterCells(oldState: GridState, predicate: (cell: Cell) => boolean): GridState {
        const newState = { ...oldState };
        newState.cells = newState.cells.map((cell) => {
            if (predicate(cell)) return cell;

            return Cell.create();
        });
        return newState;
    }

    export function findEmptyCell(state: GridState): number | null {
        return state.cells.findIndex((cell) => cell.source === null);
    }

    export function updateCell(oldState: GridState, index: number, updater: (oldCell: Cell) => Cell): GridState {
        const newState = { ...oldState };
        newState.cells = newState.cells.map((cell, i) => {
            if (i !== index) return cell;

            return updater(cell);
        });
        return newState;
    }

    export function swapCells(oldState: GridState, sourceIndex: number, destinationIndex: number): GridState {
        if (sourceIndex === destinationIndex) return oldState;

        const newState = { ...oldState };
        const sourceCell = newState.cells[sourceIndex];
        const destinationCell = newState.cells[destinationIndex];
        newState.cells = newState.cells.map((cell, i) => {
            if (i === sourceIndex) return destinationCell;
            if (i === destinationIndex) return sourceCell;
            return cell;
        });
        return newState;
    }
}

function resizeSizeArray(oldSizes: number[], count: number): number[] {
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

function resizeCellArray(cells: Cell[], count: number): Cell[] {
    if (cells.length === count) return cells;

    const newCells = [...cells];
    while (newCells.length < count) {
        newCells.push(Cell.create());
    }

    // Remove empty cells as much as possible, to keep video cells
    for (let i = newCells.length - 1; i >= 0; i--) {
        if (newCells.length === count) break;

        if (newCells[i].source === null) {
            newCells.splice(i, 1);
        }
    }
    while (newCells.length > count) {
        newCells.pop();
    }

    return newCells;
}

export module Cell {
    export function create(): Cell {
        return { source: null };
    }
}
