const socket = new WebSocket('ws://127.0.0.1:8080');

let playerId;
let currentGameId;

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
        // location.href = "1v1.html"; // Cambiar a la interfaz del juego
        // loadBoards(playerId);
    }
});

if(document.getElementById("create-game") !== null){
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
}

function sendBoardToServer(gameId, playerId) {
    const boardKey = `savedBoard-${playerId}`;
    const boardState = localStorage.getItem(boardKey);
    if (!boardState) {
        console.error('Board not found in local storage:', boardKey);
        return;
    }
    socket.send(JSON.stringify({ type: 'sendBoard', gameId, boardState, playerId }));
    
    console.log('Board sent to server:', boardKey);
}

// socket.addEventListener('message', event => {
//     const message = JSON.parse(event.data);

//     if(message.type === 'boards'){
//         const boards = message.boardState;

//         loadBoard(1, boards[0]);
//         loadBoard(2, boards[1]);
//     }
// });

// Función para cargar la tabla en el contenedor
// function loadBoard(playerId, boardState) {
//     const containerId = playerId === 1 ? 'battleship-container-p1' : 'battleship-container-p2';
//     const container = document.getElementById(containerId);

//     if (container) {
//         container.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevas celdas

//         // Crear la representación del tablero a partir del estado de la tabla
//         for (let row of boardState.split('\n')) {
//             const rowDiv = document.createElement('div');
//             rowDiv.className = 'row';
//             for (let cell of row.split('')) {
//                 const cellDiv = document.createElement('div');
//                 cellDiv.className = 'cell';
//                 cellDiv.innerText = cell; // Ajusta esto según tu representación del tablero
//                 rowDiv.appendChild(cellDiv);
//             }
//             container.appendChild(rowDiv);
//         }
//     }

//     console.log(container);
//     console.log()
// }

function loadBoards(playerId){

    let board = document.getElementById('battleship-board-p1');

    if(board){
        board.innerHTML = localStorage.getItem(`savedBoard-${playerId}`);
        console.log('Tablero 1 cargado');
    }
    else{
        console.log('No se encontraron los tableros');
    }
}

function shoot(event) {
    const classList = event.target.classList;
    if (classList == 'position') {
        event.target.classList.add('missed');
    } else if (
        classList.contains('acorazado') || classList.contains('submarino') || 
        classList.contains('portaaviones') || classList.contains('destructor') || 
        classList.contains('crucero')
    ) {
        event.target.appendChild(document.createElement('div')).className = 'hit';
    }
    // checkIfSink();
}

// Función para verificar si se hundió un barco
function checkIfSink() {
    const acorazado = document.querySelectorAll('.acorazado.hit');
    const submarino = document.querySelectorAll('.submarino.hit');
    const portaaviones = document.querySelectorAll('.portaaviones.hit');
    const destructor = document.querySelectorAll('.destructor.hit');
    const crucero = document.querySelectorAll('.crucero.hit');

    const ships = [acorazado, submarino, portaaviones, destructor, crucero];

    for (let ship of ships) {
        for(let position of ship){
            if(!position.classList.contains('hit')){
                break;
            }
        }
    }
}