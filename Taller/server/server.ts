interface Player {
    nombre? :string; //AGREGUE ESTO -MARIFES
    socket: WebSocket;
    id?: number;
    board?: string;
    isReady?: boolean;
    hasLost?: boolean;
}

interface Game {
    id: string;
    started: boolean;
    turn: number;
    players: Player[];

    powerupsDisabled?: boolean;
    winner?: Player;
}

interface Torneo {
    id: string;
    games: Game[]; 
    players: Player[];
    minPlayers: number;
    started: boolean;
    readyPlayers: number;

    roundGamesFinished?: boolean;
    leaderboard: string[]; //nombres de jugadores
}

const jugadoresValidados: Record<string, Player> = {}; //AGREGUE ESTO//
const games: Record<string, Game> = {};
const torneos: Record<string, Torneo> = {};

type InboundMessage = 'createGame' | 'joinGame' | 'startGame' | 'createTorneo'| 'joinTorneo'| 'getTorneoStatus' |
    'startTorneo' | 'leave' | 'boards' | 'sendBoard' | 'getBoards' | 'ready' | 'readyTorneo' | 'sendAttack' |
    'sendRemoveHit' | 'getTurn' | 'changeTurn' | 'loser' | 'sendMine' |'EMPAttack' | 'getLeaderboard' | 'identificacion'| 'sendProtectedCells'| 'sendRemoveProtectedCells';

type OutboundMessage = 'gameCreated' | 'playerJoined' | 'gameStarted' | 'torneoCreated'| 'playerJoinedTorneo' | 
    'torneoStatus' | 'torneoStarted' | 'torneoEnded' | 'playerLeft' | 'generatedPlayerId' | 'boardSent' | 'boardsObtained' |
    'isReady' | 'receiveAttack' | 'turnOf' | 'loserDetected'| 'winnerDetected' | 'gameEndedForfeit' | 'receiveRemoveHit'|
    'receiveMine'| 'sendMine' | 'powerUpsDisabled' | 'powerUpsEnabled' | 'errorIdentificando' | 'playerAdded' | 
    'mostrarLeaderboard' | 'error' | 'error1' | 'EMPAttack'| 'receiveProtectedCells'| 'receiveRemoveProtectedCells';

interface Message {
    type: InboundMessage | OutboundMessage;
    gameId?: string;
    move?: string;
    message?: string;
    playerCount?: number;
    playerId?: number;
    boards?: string[]; // Añadido para el envío de tablas
    boardState?: string; // Añadido para el envío de tablas
    target?: string;
    turn?: number;
    powerupsDisabled?: boolean; // Add this property to the Message interface

    torneoId?:string;
    rooms?: { id: string, playerCount: number }[];
    roundGamesFinished?: boolean;
    minPlayers?: number;
    started?: boolean;
    leaderboard?: string[];
    nombre?: string;
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
        case 'createGame':
            handleCreateGame(socket);
            break;
        case 'joinGame':
            handleJoinGame(socket, message.gameId, message.playerId);
            break;
        case 'startGame':
            handleStartGame(socket, message.gameId);
            break;
        case 'ready':
            handleReadyPlayer(socket, message.gameId, message.playerId);
            break;
        case 'createTorneo':
            handleCreateTorneo(socket);
            break;
        case 'joinTorneo':
            handleJoinTorneo(socket, message.torneoId);
            break;
        case 'getLeaderboard': //AGREGUE ESTO -MARIFES
            handleGetLeaderboard(socket, message.torneoId);
        break;
        case 'identificacion': //AGREGUE ESTO -MARIFES
            handleIdentificacionTorneo(socket, message.nombre);
            break;
        case 'getTorneoStatus':
            handleGetTorneoStatus(socket, message.torneoId);
            break;
        case 'startTorneo':
            handleStartTorneo(socket, message.torneoId);
            break;
        case 'readyTorneo':
            handleReadyTorneo(socket, message.torneoId);
            break;
        case 'leave':
            handleLeaveGame(socket, message.gameId, message.playerId, message.torneoId);
            break;
        case 'sendBoard': 
            handleSendBoard(socket, message.gameId, message.boardState, message.playerId); 
            break; 
        case 'getBoards': 
            handleGetBoards(socket, message.gameId); 
            break;
        case 'sendAttack':
            handleSendAttack(socket, message.gameId, message.target);
            break;
        case 'changeTurn':
            handleChangeTurn(socket, message.gameId);
            break;
        case 'loser':
            handleLoser(socket, message.gameId, message.playerId, message.torneoId);
            break;
        case 'sendRemoveHit':
            handleSendRemoveHit(socket, message.gameId, message.target);
            break;
        case 'sendMine':
            handleSendMine(socket, message.gameId, message.target);
            break;
        case 'EMPAttack':
            handleEMPAttack(socket, message.gameId);
            break;
        case 'sendProtectedCells':
            handleProtectedCells(socket, message.gameId, message.target);
            break;
        case 'sendRemoveProtectedCells':
            handleReceiveRemoveProtectedCells(socket, message.gameId, message.target);
            break;
        default:
            sendMessage(socket, { type: 'error', message: 'Unknown message type' });
    }
}

function handleCreateGame(socket: WebSocket) {
    const gameId = generateGameId();
    games[gameId] = { id: gameId, players: [], started: false, turn: 0 ,powerupsDisabled: false};
    sendMessage(socket, { type: 'gameCreated', gameId });
}

function handleJoinGame(socket: WebSocket, gameId?: string, playerId?: number) {
    if (!gameId) {
        sendMessage(socket, { type: 'error', message: 'No se especificó ningún ID de juego...' });
        return;
    }
    const game = games[gameId];
    if (!game) {
        sendMessage(socket, { type: 'error', message: `No se encontró ningún juego bajo el ID "${gameId}"` });
        return;
    }
    if(game.started) {
        sendMessage(socket, { type: 'error', message: `El juego con el ID "${gameId}" ya ha comenzado.` });
        return;
    }
    if (game.players.length >= 4) {
        sendMessage(socket, { type: 'error', message: 'El juego no admite más jugadores.' });
        return;
    }

    if(playerId && game.players.some(player => player.id === playerId)) {
        sendMessage(socket, { type: 'error', message: `Ya estás unido al juego con el ID "${gameId}".` });
        return;
    }

    game.players.push({ socket, nombre: '', id: game.players.length+1, isReady: false, hasLost: false });
    sendMessage(socket, { type: 'playerJoined', gameId, playerId: game.players.length });
}

function handleStartGame(socket: WebSocket, gameId?: string, torneoId?: string) {
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
        sendMessage(socket, { type: 'error', message: `El juego con el ID ${gameId} ya ha comenzado.` });
        return;
    }

    if (game.players.length < 2) {
        sendMessage(socket, { type: 'error', message: 'No hay suficientes jugadores para iniciar la partida...' });
        return;
    }

    game.turn = Math.floor(Math.random() * game.players.length) + 1;

    game.started = true;

    game.players.forEach(player => {
        sendMessage(player.socket, { type: 'gameStarted', gameId, playerCount: game.players.length });
        handleGetBoards(player.socket, gameId);
        sendMessage(player.socket, { type: 'turnOf', gameId, turn: game.turn, powerupsDisabled: game.powerupsDisabled});    
    });

    if(torneoId) {
        const torneo = torneos[torneoId];
        torneo.roundGamesFinished = false;
    }
}

//torneo

function handleCreateTorneo(socket: WebSocket) {
    const torneoId = generateGameId();

    let rooms: Game[] = [];
    for(let i = 0; i < 8; i++) {
        const gameId = generateGameId();
        const game: Game = { id: gameId, players: [], started: false, turn: 0 };
        games[gameId] = game;
        rooms.push(game);
    }

    torneos[torneoId] = { 
        id: torneoId, 
        games: rooms, 
        started: false,
        players: [],
        roundGamesFinished: false,
        leaderboard: [],
        minPlayers: 8,
        readyPlayers: 0
    };
    
    sendMessage(socket, { type: 'torneoCreated', torneoId}); 
}


function handleJoinTorneo(socket: WebSocket, torneoId?: string) {
    if (!torneoId) {
      sendMessage(socket, { type: 'error', message: 'No se especificó ningún ID del torneo...' });
      return;
    }
  
    const torneo = torneos[torneoId];
  
    if (!torneo) {
      sendMessage(socket, { type: 'error', message: `No se encontró ningún torneo bajo el ID "${torneoId}"` });
      return;
    }
  
    if (torneo.started) {
      sendMessage(socket, { type: 'error', message: `El torneo con el ID "${torneoId}" ya ha comenzado.` });
      return;
    }

    if (torneo.players.length >= 16) { 
      sendMessage(socket, { type: 'error', message: 'El torneo no admite más jugadores.' });
      return;
    }
  
    let rooms = torneo.games.map(room => { 
        return {
            id: room.id, 
            playerCount: room.players.length
        }
    });

    const jugadorValidado = Object.values(jugadoresValidados).find(player => player.socket === socket); 
    if (jugadorValidado) { 
        // console.log('registrado', jugadorValidado);
        jugadorValidado.id = torneo.players.length + 1; 
        torneo.players.push(jugadorValidado);
        sendMessage(socket, { type: 'playerJoinedTorneo', torneoId, rooms, minPlayers: torneo.minPlayers });
    } else {
        sendMessage(socket, { type: 'error', message: 'No se encontró ningún jugador validado para este socket.' }); 
    }
}

function handleIdentificacionTorneo(socket: WebSocket, nombre?: string) {
    if (!nombre) {
        sendMessage(socket, { type: 'errorIdentificando', message: 'No se especificó ningún nombre...' });
        return;
    }

    if (!validarNombre(nombre)) {
        sendMessage(socket, { type: 'errorIdentificando', message: 'El nombre debe tener entre 4 y 9 caracteres y contener al menos una letra' });
        return;
    }

    if (Object.values(torneos).some(torneo => torneo.players.some(player => player.nombre === nombre)) || jugadoresValidados[nombre]) { 
        sendMessage(socket, { type: 'errorIdentificando', message: 'Ya existe un jugador con ese nombre' }); 
    return;
    } else {
        const nuevoJugador: Player = { nombre, socket, id: undefined, isReady: false, hasLost: false };
        jugadoresValidados[nombre] = nuevoJugador;
        sendMessage(socket, { type: 'playerAdded', nombre });
    }
}

function validarNombre(nombre: string): boolean {
    const regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9]{4,9}$/;
    return regex.test(nombre);
}

function handleGetLeaderboard (socket: WebSocket, torneoId?: string){
    if (!torneoId) {
        sendMessage(socket, { type: 'error', message: 'No se especificó ningún ID del torneo...' });
        return;
      }
      const torneo = torneos[torneoId];
    
      if (!torneo) {
        sendMessage(socket, { type: 'error', message: `No se encontró ningún torneo bajo el ID "${torneoId}"` });
        return;
      }
    else {
        sendMessage(socket, { type: 'mostrarLeaderboard', torneoId, leaderboard: torneo.leaderboard });
    }
}

function handleGetTorneoStatus(socket: WebSocket, torneoId?: string){
    if (!torneoId) {
        sendMessage(socket, { type: 'error', message: 'No se especificó ningún ID del torneo...' });
        return;
    }
    
    const torneo = torneos[torneoId];
    
    if (!torneo) {
        sendMessage(socket, { type: 'error', message: `No se encontró ningún torneo bajo el ID "${torneoId}"` });
        return;
    }

    const rooms = torneo.games.map(room => {
        return {
            id: room.id,
            playerCount: room.players.length
        }
    });

    sendMessage(socket, { 
        type: 'torneoStatus', torneoId, rooms, started: torneo.started, playerCount: torneo.players.length,
        roundGamesFinished: torneo.roundGamesFinished, minPlayers: torneo.minPlayers 
    });
}

function handleStartTorneo(socket: WebSocket, torneoId?: string) {
    if (!torneoId) {
        sendMessage(socket, { type: 'error', message: 'No se especificó ningún ID de torneo...' });
        return;
    }

    const torneo = torneos[torneoId];

    if (!torneo) {
        sendMessage(socket, { type: 'error', message: `No se encontró ningún torneo bajo el ID "${torneoId}"` });
        return;
    }

    if (torneo.started) {
        sendMessage(socket, { type: 'error', message: `El torneo ya se ha iniciado.` });
        return;
    }

    // if (torneo.players.length < 8) {
    //     sendMessage(socket, { type: 'error', message: 'No hay suficientes jugadores para iniciar el torneo...' });
    //     return;
    // }

    torneo.games.forEach(game => {
        if (game.players.length < 2) {
            sendMessage(socket, { type: 'error', message: 'No se puede iniciar el torneo porque aún hay salas con menos de dos jugadores.' });
            return;
        }
    });

    torneo.started = true;
    torneo.players.forEach(player => {
        console.log(player.nombre);
        sendMessage(player.socket, { type: 'torneoStarted', torneoId, playerCount: torneo.players.length });
    });
}

function handleLeaveGame(socket: WebSocket, gameId?: string, playerId?: number, torneoId?: string) {
    if (!gameId || !playerId) {
        sendMessage(socket, { type: 'error', message: 'No se especificó ningún ID de juego...' });
        return;
    }

    const game = games[gameId];

    if (!game) {
        sendMessage(socket, { type: 'error', message: `No se encontró ningún juego bajo el ID "${gameId}"` });
        return;
    }

    game.players = game.players.filter(player => player.id !== playerId);

    if(torneoId) {
        const player = torneos[torneoId].players.find(player => player.id === playerId);
        torneos[torneoId].leaderboard.push(player!.nombre!);
    }

    // if(game.turn === playerId) {
    //     handleChangeTurn(socket, gameId);
    // }

    if(game.players.length < 2) {
        if(torneoId) {
            handleEndGame(socket, gameId, game.players[0].id, torneoId);
            return;
        }
        else{
            game.players.forEach(player => sendMessage(player.socket, { type: 'gameEndedForfeit', gameId }));
            return;
        }
    }
    else{
        game.players.forEach(player =>
            sendMessage(player.socket, { type: 'playerLeft', gameId, playerCount: game.players.length, playerId }),
        );
        return;
    }
}

function handleDisconnect(socket: WebSocket) {
    for (const gameId in games) {
        const game = games[gameId];

        if (game.players.includes({ socket })) {
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
    game.players[playerId-1].board = boardState;

    // Enviar la tabla al otro jugador
    sendMessage(socket, { type: 'boardSent', gameId, boardState: game.players[playerId-1].board, playerId });
}

function handleGetBoards(socket: WebSocket, gameId?: string) {
    if (gameId === undefined) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para obtener las tablas...' });
        return;
    }

    const game = games[gameId];
    if (!game) {
        sendMessage(socket, { type: 'error', message: `No se encontró ningún juego bajo el ID "${gameId}"` });
        return;
    }

    const boards = game.players.map(player => player.board);

    if(boards.every(board => board !== undefined)) {
        sendMessage(socket, { type: 'boardsObtained', boards: boards });
    }
    // Enviar las tablas de los jugadores al jugador que la solicitó
    
}

function handleReadyPlayer(socket: WebSocket, gameId?: string, playerId?: number, torneoId?: string) {
    if(gameId === undefined || playerId === undefined) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para alistarse...' });
        return;
    }

    const game = games[gameId];
    game.players[playerId-1].isReady = true;

    sendMessage(socket, { type: 'isReady', gameId, playerId });

    if(game.players.every(element => element.isReady === true)) {
        handleStartGame(socket, gameId, torneoId);
    }
}

function handleSendAttack(socket: WebSocket, gameId?: string, target?: string) {
    if (gameId === undefined || target === undefined) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para atacar...' });
        return;
    }

    const game = games[gameId];
    game.players.forEach(player =>
        sendMessage(player.socket, { type: 'receiveAttack', gameId, target })
    );
}

function handleChangeTurn(socket: WebSocket, gameId?: string) {
    if (gameId === undefined) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para cambiar el turno...' });
        return;
    }

    const game = games[gameId];

    // Incrementar el turno y asegurar que sea cíclico
    game.turn += 1;

    if(game.turn > game.players.length) {
        if(game.players[0].id){
            game.turn = game.players[0].id;
        }
    }

    // Verificar si ya perdió
    if(game.players[game.turn - 1].hasLost) {
        handleChangeTurn(socket, gameId);
        return;
    }

    // Enviar el mensaje a todos los jugadores indicando de quién es el turno
    game.players.forEach(player =>
        sendMessage(player.socket, { type: 'turnOf', gameId, turn: game.players.find(player => player.id === game.turn)?.id,   powerupsDisabled: game.powerupsDisabled, })
    );
    
    if (game.powerupsDisabled) {
        game.powerupsDisabled = false;
    }
}

function handleSendRemoveHit(socket: WebSocket, gameId?: string, target?: string) {
    if (gameId === undefined || target === undefined) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para reparar...' });
        return;
    }

    const game = games[gameId];
    game.players.forEach(player =>
        sendMessage(player.socket, { type: 'receiveRemoveHit', gameId, target })
    );
}

function handleSendMine(socket: WebSocket, gameId?: string, target?: string) {
    if (gameId === undefined || target === undefined) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para reparar...' });
        return;
    }

    const game = games[gameId];
    game.players.forEach(player =>
        sendMessage(player.socket, { type: 'receiveMine', gameId, target })
    );
}

function handleEMPAttack(socket: WebSocket, gameId?: string) {
    if (!gameId) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para ejecutar el ataque EMP...' });
        return;
    }

    const game = games[gameId];
    game.powerupsDisabled = true;

    game.players.forEach(player =>
        sendMessage(player.socket, { type: 'EMPAttack', gameId })
    );
}

function handleLoser(socket: WebSocket, gameId?: string, playerId?: number, torneoId?: string) {
    if (gameId === undefined || playerId === undefined) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para determinar al perdedor...' });
        return;
    }

    const game = games[gameId];

    if (!game) {
        sendMessage(socket, { type: 'error', message: `No se encontró ningún juego bajo el ID "${gameId}"` });
        return;
    }

    if(game.turn == playerId) {
        handleChangeTurn(socket, gameId);
    }

    game.players[playerId - 1].hasLost = true;

    if(torneoId) {
        const player = torneos[torneoId].players.find(player => player.id === playerId);
        torneos[torneoId].leaderboard.push(player!.nombre!);
    }

    let remaining = game.players.filter(player => player.hasLost === false);

    if(remaining.length < 2) {
        handleEndGame(socket, gameId, remaining[0].id, torneoId);
    }
    else {
        game.players.forEach(player => sendMessage(player.socket, { type: 'loserDetected', gameId, playerId }));
    }
}

function handleEndGame(socket: WebSocket, gameId?: string, winnerId?: number, torneoId?: string) {

    if(!gameId || !winnerId) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para determinar al ganador.' });
        return;
    }

    const game = games[gameId];
    game.winner = game.players.find(player => player.id === winnerId);

    if(torneoId){
        const torneo = torneos[torneoId];
        if(torneo.players.length <= 2) {
            torneo.players.forEach(player => {
                if(player.id !== winnerId && player.nombre) {
                    player.hasLost = true;
                    torneo.leaderboard.push(player.nombre);
                }
            });

            torneo.players.forEach( player =>
                sendMessage(player.socket, ({ type: 'torneoEnded', torneoId, playerId: winnerId, leaderboard: torneos[torneoId].leaderboard }))
            )

            return;
        }  
    }

    game.players.forEach(player => sendMessage(player.socket, { type: 'winnerDetected', gameId, playerId: winnerId, torneoId }));
    handleTorneoMatchNewGames(socket, torneoId, gameId, winnerId);
}

function handleTorneoMatchNewGames(socket: WebSocket, torneoId?: string, gameId?: string, winnerId?: number) {
    if (!torneoId || !gameId || !winnerId) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para emparejar nuevas partidas en el torneo.' });
        return;
    }

    const torneo = torneos[torneoId];
    if (!torneo) {
        sendMessage(socket, { type: 'error', message: `No se encontró ningún torneo bajo el ID "${torneoId}"` });
        return;
    }

    // Find the game and update the winner
    const game = torneo.games.find(g => g.id === gameId);
    if (game) {
        game.winner = game.players.find(player => player.id === winnerId);
    }

    // Check if all games in the current round have finished
    const validGames = torneo.games.filter(game => game.players.length > 0);
    const allGamesFinished = validGames.every(game => game.winner !== undefined);

    if (!allGamesFinished) {
        sendMessage(socket, { 
            type: 'torneoStatus', torneoId, started: torneo.started, playerCount: torneo.players.length,
            roundGamesFinished: torneo.roundGamesFinished, minPlayers: torneo.minPlayers 
        });
        return;
    }

    // Get winners of the current round
    const winners = validGames.map(game => game.winner).filter(winner => winner !== undefined);

    // Remove all players who lost
    torneo.players = torneo.players.filter(player => winners.includes(player));
    torneo.players.map(player => { player.isReady = false; player.hasLost = false; });

    // Create new games for the next round
    const newGames: Game[] = [];

    for (let i = 0; i < Math.floor(winners.length / 2); i++) {
        const newGameId = generateGameId();
        const newGame: Game = { id: newGameId, players: [], started: false, turn: 0 };
        games[newGameId] = newGame;
        newGames.push(newGame);
    }

    torneo.games = newGames;
    torneo.started = false;
    torneo.minPlayers = winners.length;
    torneo.roundGamesFinished = true;
    torneo.readyPlayers = 0;

    winners.forEach(winner => { 
        const originalPlayer = torneo.players.find(player => player.id === winner.id); 

        if (originalPlayer) { 
            originalPlayer.isReady = false; 
            originalPlayer.hasLost = false; 
            originalPlayer.board = undefined; 
        } 
        
        handleJoinTorneo(winner.socket, torneoId); 
    });
}

function handleReadyTorneo(socket: WebSocket, torneoId?: string) {
    if(torneoId === undefined) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para alistarse en el torneo...' });
        return;
    }

    const torneo = torneos[torneoId];
    torneo.readyPlayers += 1;

    if(torneo.readyPlayers >= torneo.minPlayers) {
        handleStartTorneo(socket, torneoId);
    }
}
function handleProtectedCells(socket: WebSocket, gameId?: string, target?: string) {
    if (gameId === undefined || target === undefined) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para reparar...' });
        return;
    }

    const game = games[gameId];
    game.players.forEach(player =>
        sendMessage(player.socket, { type: 'receiveProtectedCells', gameId, target })
    );
}


function handleReceiveRemoveProtectedCells(socket: WebSocket, gameId?: string, target?: string) {
    if (gameId === undefined || target === undefined) {
        sendMessage(socket, { type: 'error', message: 'Faltan datos para reparar...' });
        return;
    }

    const game = games[gameId];
    game.players.forEach(player =>
        sendMessage(player.socket, { type: 'receiveRemoveProtectedCells', gameId, target })
    );
}