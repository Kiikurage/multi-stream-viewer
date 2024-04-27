import { Rpc } from './rpc';

Rpc.requestVideoUrlFromBackground.addHandler(() => {
    console.log('Receive message: requestVideoUrlFromBackground');
    const videoUrl = 'Dummy URL';
    return { videoUrl };
});

console.log('Ready');
