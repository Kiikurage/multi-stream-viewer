import { Cell, GridState } from './GridState';
import { Source } from '../../model/Source';

export interface AppState {
    grid: GridState;
    sources: Source[];
}

export module AppState {
    export function setSources(oldState: AppState, sources: Source[]): AppState {
        return {
            ...oldState,
            sources,
            grid: GridState.filterCells(oldState.grid, (cell) => {
                const currentSource = cell.source;
                if (currentSource === null) return true;
                return sources.some((source) => currentSource.id === source.id);
            }),
        };
    }

    export function updateCell(oldState: AppState, cellIndex: number, updater: (cell: Cell) => Cell): AppState {
        return {
            ...oldState,
            grid: GridState.updateCell(oldState.grid, cellIndex, updater),
        };
    }

    export function setSourceToEmptyCell(oldState: AppState, source: Source): AppState {
        let emptyCellIndex = GridState.findEmptyCell(oldState.grid);
        if (emptyCellIndex === -1) {
            const rows = oldState.grid.rowHeights.length;
            const columns = oldState.grid.colWidths.length;

            if (rows < columns) {
                oldState = setGridSize(oldState, rows + 1, null);
            } else {
                oldState = setGridSize(oldState, null, columns + 1);
            }
            emptyCellIndex = GridState.findEmptyCell(oldState.grid);
            if (emptyCellIndex === -1) return oldState;
        }

        return updateCell(oldState, emptyCellIndex, () => ({ source }));
    }

    export function removeCellBySource(oldState: AppState, source: Source): AppState {
        return {
            ...oldState,
            grid: GridState.filterCells(oldState.grid, (cell) => cell.source?.id !== source.id),
        };
    }

    export function setGridSize(oldState: AppState, rows: number | null, columns: number | null): AppState {
        return {
            ...oldState,
            grid: GridState.setGridSize(
                oldState.grid,
                rows ?? oldState.grid.rowHeights.length,
                columns ?? oldState.grid.colWidths.length,
            ),
        };
    }
}
