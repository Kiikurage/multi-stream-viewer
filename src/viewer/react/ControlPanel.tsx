import {
    useAppState,
    useRemoveCellBySource,
    useSetSourceToEmptyCell,
    useToggleControlPanel,
    useUpdateGridSize,
} from './useAppState';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const ControlPanel = () => {
    const {
        grid,
        sources,
        controlPanel: { expanded },
    } = useAppState();
    const setSourceToEmptyCell = useSetSourceToEmptyCell();
    const removeCellBySource = useRemoveCellBySource();
    const updateGridSize = useUpdateGridSize();
    const toggleControlPanel = useToggleControlPanel();

    return (
        <div
            className="controlPanel"
            css={css`
                position: relative;
                z-index: 1;
                width: ${expanded ? 400 : 0}px;
                color: #fff;
                transition: 0.1s ease-in-out;
            `}
        >
            <div
                css={css`
                    position: absolute;
                    inset: 0;
                    //background: rgba(10, 10, 18, 0.9);
                    z-index: 0;
                    border-radius: 4px;
                    box-shadow: rgba(0, 0, 0, 0.24) 0 3px 8px;
                    opacity: ${expanded ? 1 : 0};
                `}
            ></div>

            <div
                css={css`
                    position: relative;
                    z-index: 1;
                    min-width: 40px;
                `}
            >
                <header>
                    <button
                        style={{
                            display: 'flex',
                            position: 'relative',
                            width: 48,
                            height: 48,
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'none',
                            border: 'none',
                            color: '#aaa',
                            cursor: 'pointer',
                            marginBottom: 16,
                        }}
                        onClick={() => toggleControlPanel()}
                    >
                        <span className="material-icons-outlined">menu</span>
                    </button>
                </header>
                <div
                    style={{
                        width: 400,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 32,
                        padding: '0 16px',
                        boxSizing: 'border-box',
                        pointerEvents: expanded ? 'auto' : 'none',
                        opacity: expanded ? 1 : 0,
                        transition: 'opacity 0.1s ease-in',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                        }}
                    >
                        <header>グリッドの分割数</header>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 16,
                                marginLeft: '16px',
                            }}
                        >
                            <span className="material-icons-outlined">table_rows</span>
                            <span>縦</span>
                            <SizePicker value={grid.rows} onChange={(rows) => updateGridSize(rows, null)} />
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 16,
                                marginLeft: '16px',
                            }}
                        >
                            <span className="material-icons-outlined">view_week</span>
                            <span>横</span>
                            <SizePicker value={grid.columns} onChange={(columns) => updateGridSize(null, columns)} />
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                        }}
                    >
                        <header>再生中の動画</header>

                        {sources.map((source) => {
                            const isActive = grid.cells.some((cell) => cell.source?.id === source.id);

                            return (
                                <Button
                                    key={source.id}
                                    isActive={isActive}
                                    onClick={() => {
                                        if (isActive) {
                                            removeCellBySource(source);
                                        } else {
                                            setSourceToEmptyCell(source);
                                        }
                                    }}
                                >
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            flex: '0 0 auto',
                                        }}
                                        className="material-icons-outlined"
                                    >
                                        {isActive ? 'visibility' : 'visibility_off'}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 16,
                                            whiteSpace: 'nowrap',
                                            width: '100%',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            flex: '1 1 0',
                                        }}
                                    >
                                        {source.title}
                                    </span>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Button = styled.button<{
    isActive?: boolean;
}>`
    display: flex;
    flex-direction: row;
    align-items: center;
    border: none;
    background: ${(props) => (props.isActive ? '#fff' : '#131319')};
    width: 100%;
    color: ${(props) => (props.isActive ? '#666' : '#fff')};
    text-align: left;
    padding: 0 16px;
    min-height: 42px;
    box-sizing: border-box;
    cursor: pointer;
    border-radius: 8px;
    gap: 16px;

    &:hover {
        background: ${(props) => (props.isActive ? '#fff' : '#1f1f27')};
    }
`;

const SizePicker = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
    return (
        <div
            css={css`
                display: flex;
                flex-direction: row;
                align-content: stretch;

                ${Button} {
                    border-radius: 0;

                    &:first-of-type {
                        border-radius: 8px 0 0 8px;
                    }

                    &:last-of-type {
                        border-radius: 0 8px 8px 0;
                    }
                }
            `}
        >
            <Button isActive={value === 1} onClick={() => onChange(1)}>
                1
            </Button>
            <Button isActive={value === 2} onClick={() => onChange(2)}>
                2
            </Button>
            <Button isActive={value === 3} onClick={() => onChange(3)}>
                3
            </Button>
            <Button isActive={value === 4} onClick={() => onChange(4)}>
                4
            </Button>
            <Button isActive={value === 5} onClick={() => onChange(5)}>
                5
            </Button>
            <Button isActive={value === 6} onClick={() => onChange(6)}>
                6
            </Button>
            <Button isActive={value === 7} onClick={() => onChange(7)}>
                7
            </Button>
        </div>
    );
};
