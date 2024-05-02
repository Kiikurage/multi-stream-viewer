import { ReactNode } from 'react';

export const GridLayoutView = ({
    rows,
    columns,
    children,
}: {
    rows: number;
    columns: number;
    children?: ReactNode;
}) => {
    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'grid',
                gridTemplateRows: generateGridTemplate(rows),
                gridTemplateColumns: generateGridTemplate(columns),
            }}
        >
            {children}
        </div>
    );
};

function generateGridTemplate(count: number) {
    const sizes: number[] = [];
    for (let i = 0; i < count; i++) {
        sizes.push(100 / count);
    }
    return sizes.map((s) => s + '%').join(' ');
}
