export const socket = new WebSocket('ws://127.0.0.1:8080');

export let currentGameId;
export let currentPlayerId;
const clientMessage = document.getElementById("message");

socket.addEventListener( 'open', () => {
    console.log(`Conectado al servidor`);
});

socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    console.log('Mensaje recibido:', message);

    if(message.type === 'generatedPlayerId') {
        currentPlayerId = message.playerId;

    } else if (message.type === 'gameCreated') {
        currentGameId = message.gameId;
        document.getElementById("game-id").value = currentGameId;

        socket.send(JSON.stringify({ type: 'getPlayerId', gameId: currentGameId }));
        clientMessage.textContent = 'Unido a juego: ' + currentGameId;

    } else if (message.type === 'playerJoined') {
        currentGameId = message.gameId;
        socket.send(JSON.stringify({ type: 'getPlayerId', gameId: currentGameId }));
        clientMessage.textContent = 'Unido a juego: ' + currentGameId;

    } else if (message.type === 'gameStarted') {
        location.href = "selector-estrategia.html";
        
    } else if(message.type === 'leftGame') {
        clientMessage.textContent = 'Juego abandonado: ' + currentGameId;
        
        currentGameId = null;
        document.getElementById("game-id").value = currentGameId;
        clientMessage.textContent = 'Unido a juego: ' + currentGameId;
        location.href = "index.html";

    } else if(message.message === `No se encontró ningún juego bajo el ID "${document.getElementById("game-id").value}"`){
        clientMessage.textContent = `No se encontró ningún juego bajo el ID: "${document.getElementById("game-id").value}"`;

    } else if(message.message === 'No hay suficientes jugadores para iniciar la partida...'){
        clientMessage.textContent = `Aún no hay suficientes jugadores para iniciar la partida.`;
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("create-game").addEventListener('click', () => {
        const gameId = document.getElementById('game-id').value;
        socket.send(JSON.stringify({ type: 'create' }));
    });

    document.getElementById('join-game').addEventListener('click', () => {
        if(document.getElementById('game-id').value === ''){
            clientMessage.textContent = 'Por favor, ingrese un ID de juego válido.';
        }
        else{
            const gameId = document.getElementById('game-id').value;
            socket.send(JSON.stringify({ type: 'join', gameId }));
        }
        
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