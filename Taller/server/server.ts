interface Game {
    id: string;
    players: WebSocket[];
    started: boolean;
    turn: number;
    boards: string[];
}

const games: Record<string, Game> = {};

type InboundMessage = 'create' | 'join' | 'start' | 'move' | 'leave' | 'boards' | 'sendBoard' | 'getBoard' | 'getPlayerId';
type OutboundMessage = 'gameCreated' | 'playerJoined' | 'gameStarted' | 'move' | 'playerLeft' | 'leftGame' | 'generatedPlayerId' | 'error';

interface Message {
    type: InboundMessage | OutboundMessage;
    gameId?: string;
    move?: string;
    message?: string;
    playerCount?: number;
    playerId?: number;
    boardState?: string; // Añadido para el envío de tablas
}

function generateGameId(): string {
    return Math.random().toString(36).substring(2, 10);
}

function sendMessage(socket: WebSocket, message: Message) {
    const messageString = JSON.stringify(message);

    socket.send(messageString);
    console.log(`Sent: ${messageString}`);
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
        console.log('Client connected!');
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
        case 'sendBoard': 
            handleSendBoard(socket, message.gameId, message.boardState, message.playerId); 
            break; 
        case 'getBoard': 
            handleGetBoards(socket, message.gameId, message.playerId); 
            break;
        case 'getPlayerId':
            handleGetPlayerId(socket, message.gameId);
            break;
        default:
            console.log(message + ' - ' + message.type);
            sendMessage(socket, { type: 'error', message: 'Unknown message type' });
    }
}

function handleCreateGame(socket: WebSocket) {
    const gameId = generateGameId();

    games[gameId] = { id: gameId, players: [socket], started: false, turn: 0, boards: [] };
    sendMessage(socket, { type: 'gameCreated', gameId });
    sendMessage(socket, { type: 'generatedPlayerId', playerId: games[gameId].players.length });
}

function handleJoinGame(socket: WebSocket, gameId?: string) {
    if (!gameId) {
        sendMessage(socket, { type: 'error', message: 'No se especificó ningún ID de juego...' });
        return;
    }

    const game = games[gameId];

    if (!game) {
        sendMessage(socket, { type: 'error', message: `No se encontró ningún juego bajo el ID "${gameId}"` });
        return;
    }

    if (game.players.length >= 4) {
        sendMessage(socket, { type: 'error', message: 'El juego no admite más jugadores...' });
        return;
    }

    game.players.push(socket);
    game.boards.push(''); // Añadir un espacio para la tabla del nuevo jugador

    sendMessage(socket, { type: 'playerJoined', gameId, playerId: game.players.length, playerCount: game.players.length });
    sendMessage(socket, { type: 'generatedPlayerId', playerId: game.players.length });
}

function handleStartGame(socket: WebSocket, gameId?: string) {
    if (!gameId) {
        sendMessage(socket, { type: 'error', message: 'No se especificó ningún ID de juego...' });
        return;
    }

    const game = games[gameId];

    if (!game) {
        sendMessage(socket, { type: 'error', message: `No se encontró ningún juego bajo el ID "${gameId}"` });
        return;
    }

    if (game.started) {
        sendMessage(socket, { type: 'error', message: 'El juego ya se ha iniciado...' });
        return;
    }

    if (game.players.length < 2) {
        sendMessage(socket, { type: 'error', message: 'No hay suficientes jugadores para iniciar la partida...' });
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

function handleDisconnect(socket: WebSocket) {
    for (const gameId in games) {
        const game = games[gameId];

        if (game.players.includes(socket)) {
            handleLeaveGame(socket, gameId);
            break;
        }
    }
}

function handleSendBoard(socket: WebSocket, gameId?: string, boardState?: string, playerId?: number) {

    if (gameId === undefined || boardState === undefined || playerId === undefined) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para guardar la tabla...' });
        return;
    }

    const game = games[gameId];
    if (!game) {
        sendMessage(socket, { type: 'error', message: `No se encontró ningún juego bajo el ID "${gameId}"` });
        return;
    }

    // Almacenar el estado de la tabla para cada jugador
    game.boards[playerId - 1] = boardState;

    // Enviar la tabla al otro jugador
        sendMessage(socket, { type: 'boards', gameId, boardState: game.boards[playerId - 1], playerId });
}


function handleGetBoards(socket: WebSocket, gameId?: string, playerId?: number) {
    if (gameId === undefined || playerId === undefined) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para obtener la tabla...' });
        return;
    }

    const game = games[gameId];
    if (!game) {
        sendMessage(socket, { type: 'error', message: `No se encontró ningún juego bajo el ID "${gameId}"` });
        return;
    }

    // Enviar la tabla del oponente al jugador que la solicitó
    const opponentPlayerId = playerId === 1 ? 2 : 1;
    const boardState = game.boards[opponentPlayerId - 1];
    sendMessage(socket, { type: 'boards', gameId, boardState });
}

function handleGetPlayerId(socket: WebSocket, gameId?: string) {
    if(gameId === undefined) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para obtener el ID del jugador...' });
        return;
    }

    const game = games[gameId]; // Incrementar en 1 para obtener el nuevo ID de jugador
    const playerId = game.players.length;
    sendMessage(socket, { type: 'generatedPlayerId', playerId: playerId });
}
