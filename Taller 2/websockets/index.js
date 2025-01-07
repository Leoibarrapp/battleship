import { WebSocketServer } from "ws";

/**
 * Registro de juegos activos.
 * Cada juego se identifica por un ID de sala único y contiene una lista de jugadores, un indicador de si el juego ha
 * comenzado y un índice de turno.
 */
const games = {};

/**
 * Genera un ID de sala aleatorio de 8 caracteres de longitud.
 *
 * @returns {string} - Un ID de sala generado aleatoriamente.
 */
function generateGameId() {
    return Math.random().toString(36).substring(2, 10);
}

/**
 * Maneja los mensajes recibidos a través de la conexión WebSocket.
 *
 * @param {WebSocket} socket - La conexión WebSocket del jugador.
 * @param {Object} message - El mensaje recibido.
 */
function handleMessage(socket, message) {
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
 * Envía un mensaje a través de la conexión WebSocket y lo imprime en la consola.
 *
 * @param {WebSocket} socket - La conexión WebSocket del jugador.
 * @param {Object} message - El mensaje a enviar.
 */
function sendMessage(socket, message) {
    const messageString = JSON.stringify(message);
    socket.send(messageString);
    console.log(`Sent to ${socket.url}: ${messageString}`);
}

/**
 * Maneja la creación de un nuevo juego.
 *
 * @param {WebSocket} socket - La conexión WebSocket del jugador.
 */
function handleCreateGame(socket) {
    const gameId = generateGameId();
    games[gameId] = { id: gameId, players: [socket], started: false, turn: 0 };
    sendMessage(socket, { type: 'gameCreated', gameId });
}

/**
 * Maneja la unión a un juego existente.
 *
 * @param {WebSocket} socket - La conexión WebSocket del jugador.
 * @param {string} gameId - El ID del juego al que unirse.
 */
function handleJoinGame(socket, gameId) {
    const game = games[gameId];
    if (!game) {
        sendMessage(socket, { type: 'error', message: 'Game not found' });
        return;
    }
    if (game.players.length >= 4) {
        sendMessage(socket, { type: 'error', message: 'Game is full' });
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
 * Maneja el inicio de un juego.
 *
 * @param {WebSocket} socket - La conexión WebSocket del jugador.
 * @param {string} gameId - El ID del juego a iniciar.
 */
function handleStartGame(socket, gameId) {
    const game = games[gameId];
    if (!game) {
        sendMessage(socket, { type: 'error', message: 'Game not found' });
        return;
    }
    if (game.started) {
        sendMessage(socket, { type: 'error', message: 'Game already started' });
        return;
    }
    if (game.players.length < 2) {
        sendMessage(socket, { type: 'error', message: 'Not enough players to start' });
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
 * Maneja los movimientos de los jugadores.
 *
 * @param {WebSocket} socket - La conexión WebSocket del jugador.
 * @param {string} gameId - El ID del juego.
 * @param {string} move - El movimiento del jugador.
 */
function handleMove(socket, gameId, move) {
    const game = games[gameId];
    if (!game) {
        sendMessage(socket, { type: 'error', message: 'Game not found' });
        return;
    }
    if (!game.started) {
        sendMessage(socket, { type: 'error', message: 'Game not started' });
        return;
    }
    if (game.players[game.turn] !== socket) {
        sendMessage(socket, { type: 'error', message: 'Not your turn' });
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
 * Maneja el abandono de un juego.
 *
 * @param {WebSocket} socket - La conexión WebSocket del jugador.
 * @param {string} gameId - El ID del juego.
 */
function handleLeaveGame(socket, gameId) {
    const game = games[gameId];
    if (!game) {
        sendMessage(socket, { type: 'error', message: 'Game not found' });
        return;
    }
    game.players = game.players.filter((player) => player !== socket);
    if (game.players.length === 0) {
        delete games[gameId];
    } else {
        game.players.forEach((player) => {
            sendMessage(player, { type: 'playerLeft', gameId, playerCount: game.players.length });
        });
    }
    sendMessage(socket, { type: 'leftGame', gameId });
}

/**
 * Maneja la desconexión de un jugador.
 *
 * @param {WebSocket} socket - La conexión WebSocket del jugador.
 */
function handleDisconnect(socket) {
    for (const gameId in games) {
        const game = games[gameId];
        if (game.players.includes(socket)) {
            handleLeaveGame(socket, gameId);
            break;
        }
    }
}

// Inicia el servidor WebSocket
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
    console.log('A client connected!');
    socket.on('message', (data) => {
        const message = JSON.parse(data);
        handleMessage(socket, message);
    });
    socket.on('close', () => {
        handleDisconnect(socket);
    });
});
