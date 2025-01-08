const socket = new WebSocket('ws://127.0.0.1:8080');

let currentGameId;
let playerId;

socket.addEventListener( 'open', () => {
    console.log(`Conectado al servidor`);
});

socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);

    if(message.type === 'generatedPlayerId') {
        playerId = message.playerId;

    } else if (message.type === 'gameCreated') {
        currentGameId = message.gameId;
        document.getElementById("game-id").value = currentGameId;

        socket.send(JSON.stringify({ type: 'getPlayerId', gameId: currentGameId }));

    } else if (message.type === 'playerJoined') {
        currentGameId = message.gameId;
        socket.send(JSON.stringify({ type: 'getPlayerId', gameId: currentGameId }));

    } else if (message.type === 'gameStarted') {
        sendBoardToServer(currentGameId, playerId);
        location.href = "1v1.html"; // Cambiar a la interfaz del juego
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("create-game").addEventListener('click', () => {
        const gameId = document.getElementById('game-id').value;
        socket.send(JSON.stringify({ type: 'create' }));
    });

    document.getElementById('join-game').addEventListener('click', () => {
        const gameId = document.getElementById('game-id').value;
        socket.send(JSON.stringify({ type: 'join', gameId }));
    });

    document.getElementById('start-game').addEventListener('click', () => {
        const gameId = document.getElementById('game-id').value;
        socket.send(JSON.stringify({ type: 'start', gameId }));
    });

    document.getElementById('send-move').addEventListener('click', () => {
        const gameId = document.getElementById('game-id').value;
        const move = document.getElementById('move').value;
        socket.send(JSON.stringify({ type: 'move', gameId, move }));
    });

    document.getElementById('leave-game').addEventListener('click', () => {
        const gameId = document.getElementById('game-id').value;
        socket.send(JSON.stringify({ type: 'leave', gameId }));
    });

    document.getElementById('close-connection').addEventListener('click', () => {
        const response = confirm('¿Estás seguro de que deseas cerrar la conexión con el servidor de WebSocket?\n\nSi la cierras, no podrás enviar ni recibir más mensajes y, de acuerdo a esta implementación, tendrás que recargar la página.');
        if (response) {
            socket.close();
        }
    });
});

function sendBoardToServer(game, player) {
    const boardKey = `savedBoard`;
    const boardState = localStorage.getItem(boardKey);
    if (!boardState) {
        console.error('Board not found in local storage:', boardKey);
        return;
    }
    socket.send(JSON.stringify({ type: 'sendBoard', gameId: game, boardState: boardState, playerId: player }));
    
    console.log('Board sent to server:', boardKey);
}