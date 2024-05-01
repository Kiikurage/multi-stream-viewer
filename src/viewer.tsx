import { createRoot } from 'react-dom/client';
import { MultiViewer } from './viewer/react/MultiViewer';

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root');
    if (container === null) {
        alert('Failed to initialize application');
        return;
    }

    const root = createRoot(container);
    root.render(<MultiViewer />);
});
