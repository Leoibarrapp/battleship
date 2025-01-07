interface Game {
    id: string;
    players: WebSocket[];
    started: boolean;
    turn: number;
}

const games: Record<string, Game> = {};

type InboundMessage = 'create' | 'join' | 'start' | 'move' | 'leave';

type OutboundMessage = 'gameCreated' | 'playerJoined' | 'gameStarted' | 'move' | 'playerLeft' | 'leftGame' | 'error';

interface Message {
    type: InboundMessage | OutboundMessage;
    gameId?: string;
    move?: string;
    message?: string;
    playerCount?: number;
}

/**
Genera un ID de sala aleatorio de 8 caracteres de longitud.
@returns {string} - Un ID de sala generado aleatoriamente.
*/
function generateGameId(): string {
    return Math.random().toString(36).substring(2, 10);
}

/**
 * Envía un mensaje a través de la conexión WebSocket a un cliente específico.
 *
 * @param {WebSocket} socket - El socket del cliente al que se enviará el mensaje.
 * @param {Message} message - El mensaje que se enviará al cliente.
 */
function sendMessage(socket: WebSocket, message: Message) {
    const messageString = JSON.stringify(message);

    socket.send(messageString);
    console.log(`c-> c${socket.url}: ${messageString}`, 'color: #ee0000', 'color: inherit');
}

const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 8080;

Deno.serve({ hostname: SERVER_HOST, port: SERVER_PORT }, (req) => {
    if (req.headers.get('upgrade') != 'websocket') {
        return new Response(null, { status: 501 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    // Manejadores de eventos de WebSocket. Cada evento se activa cuando se recibe un mensaje del cliente.
    socket.addEventListener('open', () => {
        console.log('¡Se ha conectado un nuevo cliente!');
    });

    // Los mensajes se analizan y se envían a la función correspondiente para su procesamiento.
    socket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);
        handleMessage(socket, message);
    });

    // Manejador de eventos de cierre de WebSocket. Se activa cuando el cliente se desconecta.
    socket.addEventListener('close', () => {
        handleDisconnect(socket);
    });

    return response;
});

/**
 * Maneja un mensaje recibido a través de la conexión WebSocket. Los mensajes se analizan y se envían a la función
 * correspondiente para su procesamiento.
 *
 * @param {WebSocket} socket - El socket del cliente que ha enviado el mensaje.
 * @param {Message} message - El mensaje recibido del cliente.
 */
function handleMessage(socket: WebSocket, message: Message) {
    switch (message.type) {
        case 'create':
            handleCreateGame(socket);
            break;
        case 'join':
            handleJoinGame(socket, message.gameId);
            break;
        case 'start':
            handleStartGame(socket, message.gameId);
            break;
        case 'move':
            handleMove(socket, message.gameId, message.move);
            break;
        case 'leave':
            handleLeaveGame(socket, message.gameId);
            break;
        default:
            sendMessage(socket, { type: 'error', message: 'Unknown message type' });
    }
}

/**
 * Maneja el evento de creación de un juego (tipo de mensaje recibido desde el cliente: create). Crea un nuevo juego con
 * un ID de sala único y agrega al cliente que ha creado el juego como el primer jugador.
 *
 * @param {WebSocket} socket - El socket del cliente que ha creado el juego.
 */
function handleCreateGame(socket: WebSocket) {
    const gameId = generateGameId();

    games[gameId] = { id: gameId, players: [socket], started: false, turn: 0 };
    sendMessage(socket, { type: 'gameCreated', gameId });
}

/**
 * Maneja el evento de unión a un juego
 *
 * @param {WebSocket} socket - El socket del cliente que se une al juego.
 * @param {string} [gameId] - El ID del juego al que se une el cliente.
 */
function handleJoinGame(socket: WebSocket, gameId?: string) {
    if (!gameId) {
        socket.send(JSON.stringify({ type: 'error', message: 'No se especificó ningún ID de juego...' }));
        return;
    }
    const game = games[gameId];

    if (!game) {
        socket.send(JSON.stringify({ type: 'error', message: `No se encontró ningún juego bajo el ID "${gameId}"` }));
        return;
    }

    if (game.players.length >= 4) {
        socket.send(JSON.stringify({ type: 'error', message: 'El juego no admite más jugadores...' }));
        return;
    }
    game.players.push(socket);

    game.players.forEach((player) => {
        if (player !== socket) {
            sendMessage(player, { type: 'playerJoined', gameId, playerCount: game.players.length });
        }
    });
    sendMessage(socket, { type: 'playerJoined', gameId, playerCount: game.players.length });
}

/**
 * Maneja el evento de inicio de un juego (tipo de mensaje recibido desde el cliente: start).
 *
 * @param {WebSocket} socket - El socket del cliente que ha iniciado el juego.
 * @param {string} [gameId] - El ID del juego que se va a iniciar.
 */
function handleStartGame(socket: WebSocket, gameId?: string) {
    if (!gameId) {
        socket.send(JSON.stringify({ type: 'error', message: 'No se especificó ningún ID de juego...' }));
        return;
    }

    const game = games[gameId];

    if (!game) {
        socket.send(JSON.stringify({ type: 'error', message: `No se encontró ningún juego bajo el ID "${gameId}"` }));
        return;
    }

    if (game.started) {
        socket.send(JSON.stringify({ type: 'error', message: 'El juego ya se ha iniciado...' }));
        return;
    }

    if (game.players.length < 2) {
        socket.send(
            JSON.stringify({ type: 'error', message: 'No hay suficientes jugadores para iniciar la partida...' }),
        );
        return;
    }

    game.started = true;
    game.players.forEach((player) => {
        if (player !== socket) {
            sendMessage(player, { type: 'gameStarted', gameId });
        }
    });

    sendMessage(socket, { type: 'gameStarted', gameId });
}
/**
 * Maneja el evento de movimiento de un jugador (tipo de mensaje recibido desde el cliente: move).
 *
 * @param {WebSocket} socket - El socket del cliente que ha realizado el movimiento.
 * @param {string} [gameId] - El ID del juego en el que se ha realizado el movimiento.
 * @param {string} [move] - El movimiento realizado por el jugador.
 */
function handleMove(socket: WebSocket, gameId?: string, move?: string) {
    if (!gameId) {
        sendMessage(socket, { type: 'error', message: 'No se especificó ningún ID de juego...' });
        return;
    }

    const game = games[gameId];

    if (!game) {
        sendMessage(socket, { type: 'error', message: `No se encontró ningún juego bajo el ID "${gameId}"` });
        return;
    }

    if (!game.started) {
        sendMessage(socket, { type: 'error', message: 'El juego aún no se ha iniciado...' });
        return;
    }

    if (game.players[game.turn] !== socket) {
        sendMessage(socket, { type: 'error', message: 'No es tu turno :@' });
        return;
    }

    if (move === undefined || move === null || move === '') {
        sendMessage(socket, { type: 'error', message: '¡Debe especificarse un movimiento!' });
        return;
    }

    game.players.forEach((player) => {
        if (player !== socket) {
            sendMessage(player, { type: 'move', gameId, move });
        }
    });

    sendMessage(socket, { type: 'move', gameId, move });
    game.turn = (game.turn + 1) % game.players.length;
}

/**
 * Maneja el evento de abandono de un jugador (tipo de mensaje recibido desde el cliente: leave).
 *
 * @param {WebSocket} socket - El socket del cliente que se ha desconectado.
 * @param {string} [gameId] - El ID del juego del que el jugador se está yendo.
 */
function handleLeaveGame(socket: WebSocket, gameId?: string) {
    if (!gameId) {
        sendMessage(socket, { type: 'error', message: 'No se especificó ningún ID de juego...' });
        return;
    }

    const game = games[gameId];

    if (!game) {
        sendMessage(socket, { type: 'error', message: `No se encontró ningún juego bajo el ID "${gameId}"` });
        return;
    }

    game.players = game.players.filter((player) => player !== socket);

    if (game.players.length === 0) {
        delete games[gameId];
    } else {
        game.players.forEach((player) =>
            sendMessage(player, { type: 'playerLeft', gameId, playerCount: game.players.length }),
        );
    }

    sendMessage(socket, { type: 'leftGame', gameId });
}

/**
 * Maneja el evento de desconexión de un jugador (evento de cierre de la conexión WebSocket).
 *
 * @param {WebSocket} socket - El socket del cliente que se ha desconectado.
 */
function handleDisconnect(socket: WebSocket) {
    for (const gameId in games) {
        const game = games[gameId];

        if (game.players.includes(socket)) {
            handleLeaveGame(socket, gameId);
            break;
        }
    }
}