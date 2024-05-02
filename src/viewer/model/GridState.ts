import { Source } from '../../model/Source';

export interface Cell {
    source: Source | null;
    width: number;
    height: number;
}

export interface GridState {
    rows: number;
    columns: number;
    cells: Cell[];
    maximizedCellIndex: number | null;
}

export module GridState {
    export function create(): GridState {
        return {
            rows: 1,
            columns: 1,
            cells: [Cell.create()],
            maximizedCellIndex: null,
        };
    }

    export function index2pos(columns: number, index: number): [row: number, column: number] {
        return [Math.floor(index / columns), index % columns];
    }

    export function pos2index(columns: number, row: number, column: number): number {
        return row * columns + column;
    }

    export function setGridSize(oldState: GridState, rows: number, columns: number): GridState {
        const newState = {
            ...oldState,
            rows,
            columns,
            cells: resizeCellArray(oldState.cells, oldState.columns, rows, columns),
        };

        if (newState.maximizedCellIndex !== null && newState.maximizedCellIndex >= newState.cells.length) {
            newState.maximizedCellIndex = null;
        }

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

    export function findEmptyCell(state: GridState): number {
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

function resizeCellArray(cells: Cell[], oldColumns: number, rows: number, columns: number): Cell[] {
    const oldRows = cells.length / oldColumns;
    if (Math.floor(oldRows) !== oldRows) throw new Error('Invalid cell count');

    const count = rows * columns;

    if (cells.length === count) return cells;

    const newCells = [...cells].filter((cell, index) => {
        const [row, column] = GridState.index2pos(oldColumns, index);
        return row < rows && column < columns;
    });
    for (let row = 0; row < oldRows; row++) {
        for (let column = oldColumns; column < columns; column++) {
            newCells.splice(pos2index(columns, row, column), 0, Cell.create());
        }
    }
    for (let row = oldRows; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            newCells.splice(pos2index(columns, row, column), 0, Cell.create());
        }
    }

    return newCells;
}

function pos2index(columns: number, row: number, column: number): number {
    return row * columns + column;
}

export module Cell {
    export function create(): Cell {
        return { source: null, width: 1, height: 1 };
    }
}
