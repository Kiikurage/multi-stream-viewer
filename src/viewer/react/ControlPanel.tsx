import { useAppState, useRemoveCellBySource, useSetSourceToEmptyCell, useUpdateGridSize } from './useAppState';
import { useState } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

export const ControlPanel = () => {
    const appState = useAppState();
    const setSourceToEmptyCell = useSetSourceToEmptyCell();
    const removeCellBySource = useRemoveCellBySource();
    const updateGridSize = useUpdateGridSize();

    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            className="controlPanel"
            style={{
                width: collapsed ? 48 : 400,
                background: '#282828',
                color: '#fff',
                boxSizing: 'border-box',
                overflow: 'hidden',
                transition: 'width 0.1s ease-in',
            }}
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
                    onClick={() => setCollapsed((collapsed) => !collapsed)}
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
                    pointerEvents: collapsed ? 'none' : 'auto',
                    opacity: collapsed ? 0 : 1,
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
                    <header>セルの数</header>
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
                        <SizePicker
                            value={appState.grid.rowHeights.length}
                            onChange={(rows) => updateGridSize(rows, null)}
                        />
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
                        <SizePicker
                            value={appState.grid.colWidths.length}
                            onChange={(columns) => updateGridSize(null, columns)}
                        />
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

                    {appState.sources.map((source) => {
                        const isActive = appState.grid.cells.some((cell) => cell.source?.id === source.id);

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
    );
};

const Button = styled.button<{
    isActive?: boolean;
}>`
    display: flex;
    flex-direction: row;
    align-items: center;
    border: none;
    background: ${(props) => (props.isActive ? '#fff' : 'rgba(0,0,0,0.3)')};
    width: 100%;
    color: ${(props) => (props.isActive ? '#666' : '#fff')};
    text-align: left;
    padding: 0 16px;
    height: 42px;
    box-sizing: border-box;
    cursor: pointer;
    border-radius: 8px;
    gap: 16px;
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
        </div>
    );
};
