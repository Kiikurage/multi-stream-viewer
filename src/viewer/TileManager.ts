import { randomId } from '../lib/randomId';

export interface Tile {
    readonly id: string;
    readonly direction: 'horizontal' | 'vertical';
    readonly parent: Tile | null;
    readonly children: readonly Tile[];
    readonly width: number;
    readonly height: number;
}

export class TileManager {
    private root: Tile = {
        id: randomId(),
        direction: 'horizontal',
        parent: null,
        children: [],
        width: 1,
        height: 1,
    };

    constructor() {}
}
