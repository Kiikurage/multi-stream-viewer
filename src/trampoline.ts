import { ChunkMessage, Message, PullMessage, RegisterSourceMessage, UnregisterSourceMessage } from './model/Message';

window.addEventListener('message', (ev) => {
    const message = ev.data as Message;

    switch (message.type) {
        case 'chunk': {
            handleChunkMessageFromSourceSite(message);
            break;
        }
        case 'registerSource': {
            handleRegisterMessageFromSourceSite(message);
            break;
        }
        case 'unregisterSource': {
            handleUnregisterMessageFromSourceSite(message);
            break;
        }
        default: {
            console.error(message);
            throw new Error(`Unsupported message type: ${message.type}`);
        }
    }
});

const worker = new SharedWorker(chrome.runtime.getURL('sharedWorker.js'));
worker.port.addEventListener('message', (ev) => {
    const message = ev.data as Message;

    switch (message.type) {
        case 'pull': {
            handlePullMessageFromSharedWorker(message);
            break;
        }
        default: {
            console.error(message);
            throw new Error(`Unsupported message type: ${message.type}`);
        }
    }
});
worker.port.start();

const sourcePage = window.parent;

/**
 * Pull message from SharedWorker to source page.
 */
function handlePullMessageFromSharedWorker(message: PullMessage) {
    sourcePage.postMessage(message, '*');
}

function handleRegisterMessageFromSourceSite(message: RegisterSourceMessage) {
    worker.port.postMessage(message, message.transfer);
}

function handleUnregisterMessageFromSourceSite(message: UnregisterSourceMessage) {
    worker.port.postMessage(message, message.transfer);
}

/**
 * Chunk message from source page to SharedWorker.
 */
function handleChunkMessageFromSourceSite(message: ChunkMessage) {
    worker.port.postMessage(message, message.transfer);
}

console.log('Trampoline loaded.');
