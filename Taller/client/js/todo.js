// const socket = new WebSocket('ws://127.0.0.1:8080');

// let currentGameId;
// let playerId;

// socket.addEventListener( 'open', () => {
//     console.log(`Conectado al servidor`);
// });

// socket.addEventListener('message', event => {
//     const message = JSON.parse(event.data);

//     if(message.type === 'generatedPlayerId') {
//         playerId = message.playerId;

//     } else if (message.type === 'gameCreated') {
//         currentGameId = message.gameId;
//         document.getElementById("game-id").value = currentGameId;

//         socket.send(JSON.stringify({ type: 'getPlayerId', gameId: currentGameId }));

//     } else if (message.type === 'playerJoined') {
//         currentGameId = message.gameId;
//         socket.send(JSON.stringify({ type: 'getPlayerId', gameId: currentGameId }));

//     } else if (message.type === 'gameStarted') {
//         sendBoardToServer(currentGameId, playerId);
//         location.href = "1v1.html"; // Cambiar a la interfaz del juego
//     }
// });

// window.addEventListener("DOMContentLoaded", (event) => {
//     document.getElementById("create-game").addEventListener('click', () => {
//         const gameId = document.getElementById('game-id').value;
//         socket.send(JSON.stringify({ type: 'create' }));
//     });

//     document.getElementById('join-game').addEventListener('click', () => {
//         const gameId = document.getElementById('game-id').value;
//         socket.send(JSON.stringify({ type: 'join', gameId }));
//     });

//     document.getElementById('start-game').addEventListener('click', () => {
//         const gameId = document.getElementById('game-id').value;
//         socket.send(JSON.stringify({ type: 'start', gameId }));
//     });

//     document.getElementById('send-move').addEventListener('click', () => {
//         const gameId = document.getElementById('game-id').value;
//         const move = document.getElementById('move').value;
//         socket.send(JSON.stringify({ type: 'move', gameId, move }));
//     });

//     document.getElementById('leave-game').addEventListener('click', () => {
//         const gameId = document.getElementById('game-id').value;
//         socket.send(JSON.stringify({ type: 'leave', gameId }));
//     });

//     document.getElementById('close-connection').addEventListener('click', () => {
//         const response = confirm('¿Estás seguro de que deseas cerrar la conexión con el servidor de WebSocket?\n\nSi la cierras, no podrás enviar ni recibir más mensajes y, de acuerdo a esta implementación, tendrás que recargar la página.');
//         if (response) {
//             socket.close();
//         }
//     });
// });

// function sendBoardToServer(game, player) {
//     const boardKey = `savedBoard`;
//     const boardState = localStorage.getItem(boardKey);
//     if (!boardState) {
//         console.error('Board not found in local storage:', boardKey);
//         return;
//     }
//     socket.send(JSON.stringify({ type: 'sendBoard', gameId: game, boardState: boardState, playerId: player }));
    
//     console.log('Board sent to server:', boardKey);
// }

// //JUEGO

// socket.addEventListener('open', () => {
//     loadBoards();
//     console.log(currentGameId)
//     console.log('Conexión establecida');
// });

// // socket.addEventListener('message', event => {
// //     const message = JSON.parse(event.data);

// //     if(message.type === 'boards'){
// //         const boards = message.boardState;

// //         loadBoard(1, boards[0]);
// //         loadBoard(2, boards[1]);
// //     }
// // });

// // Función para cargar la tabla en el contenedor
// // function loadBoard(playerId, boardState) {
// //     const containerId = playerId === 1 ? 'battleship-container-p1' : 'battleship-container-p2';
// //     const container = document.getElementById(containerId);

// //     if (container) {
// //         container.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevas celdas

// //         // Crear la representación del tablero a partir del estado de la tabla
// //         for (let row of boardState.split('\n')) {
// //             const rowDiv = document.createElement('div');
// //             rowDiv.className = 'row';
// //             for (let cell of row.split('')) {
// //                 const cellDiv = document.createElement('div');
// //                 cellDiv.className = 'cell';
// //                 cellDiv.innerText = cell; // Ajusta esto según tu representación del tablero
// //                 rowDiv.appendChild(cellDiv);
// //             }
// //             container.appendChild(rowDiv);
// //         }
// //     }

// //     console.log(container);
// //     console.log()
// // }

// function loadBoards(){
//     const board1 = document.getElementById('battleship-board-p1');
//     const board2 = document.getElementById('battleship-board-p2');

//     if(board1 && board2){
//         board1.innerHTML = localStorage.getItem(`savedBoard`);
//         board2.innerHTML = localStorage.getItem(`savedBoard`);
//     }
//     else{
//         console.log('No se encontraron los tableros');
//     }
// }

// function shoot(event) {
//     const classList = event.target.classList;
//     if (classList == 'position') {
//         event.target.classList.add('missed');
//     } else if (
//         classList.contains('acorazado') || classList.contains('submarino') || 
//         classList.contains('portaaviones') || classList.contains('destructor') || 
//         classList.contains('crucero')
//     ) {
//         event.target.appendChild(document.createElement('div')).className = 'hit';
//     }
//     // checkIfSink();
// }

// // Función para verificar si se hundió un barco
// function checkIfSink() {
//     const acorazado = document.querySelectorAll('.acorazado.hit');
//     const submarino = document.querySelectorAll('.submarino.hit');
//     const portaaviones = document.querySelectorAll('.portaaviones.hit');
//     const destructor = document.querySelectorAll('.destructor.hit');
//     const crucero = document.querySelectorAll('.crucero.hit');

//     const ships = [acorazado, submarino, portaaviones, destructor, crucero];

//     for (let ship of ships) {
//         for(let position of ship){
//             if(!position.classList.contains('hit')){
//                 break;
//             }
//         }
//     }
// }

// let generatedPlayerId;

// //ESTRATEGIA

// // socket.addEventListener('open', () => {
// //     socket.send(JSON.stringify({ type: 'getPlayerId', }));
// //     console.log('Requesting Player ID...');
// // });

// // socket.addEventListener('message', event => {
// //     const message = JSON.parse(event.data);
// //     if (message.type === 'generatedPlayerId') {
// //         generatedPlayerId = message.playerId;
// //         console.log('Player ID generated:', generatedPlayerId);
// //     }
// //      else { 
// //         console.error('Received unknown message type:', message.type); 
// //     }
// // });

// function crearTabla(i) {
//     const board = document.getElementById(`battleship-board-p${i}`);
//     board.innerHTML = '';  // Limpiar cualquier contenido anterior

//     // Crear encabezado de columnas
//     const columnas = [''].concat(Array.from({ length: 10 }, (_, i) => i + 1));
//     columnas.forEach(num => {
//         const columnaDiv = document.createElement('div');
//         columnaDiv.className = 'columna-ID';
//         columnaDiv.innerText = num;
//         board.appendChild(columnaDiv);
//     });

//     // Crear filas y celdas
//     const filas = 'ABCDEFGHIJ'.split('');
//     filas.forEach(letra => {
//         const filaDiv = document.createElement('div');
//         filaDiv.className = 'fila-ID';
//         filaDiv.innerText = letra;
//         board.appendChild(filaDiv);

//         for (let j = 1; j <= 10; j++) {
//             const celdaDiv = document.createElement('div');
//             celdaDiv.className = 'position';
//             celdaDiv.id = `p${i}-${letra.toLowerCase()}${j}`;
//             celdaDiv.addEventListener('dragover', highlight);
//             celdaDiv.addEventListener('dragleave', removeHighlight);
//             celdaDiv.addEventListener('drop', soltar);
//             board.appendChild(celdaDiv);
//         }
//     });
// }

// crearTabla(1);

// function highlight(event) { 
//     event.preventDefault(); 
//     event.target.classList.add('highlight'); 
// } // Función para quitar el resaltado al dejar de arrastrar  

// function removeHighlight(event) { 
//     event.target.classList.remove('highlight');
// }

// function arrastrar(event) {
//     // Usar event.target.id para obtener el ID de la imagen arrastrada
//     event.dataTransfer.setData("barcoId", event.target.id);
//     //obtenerIdCasillaAdyacente(event.target.id).classList.add('highlight');
//     console.log(`Iniciando arrastre del barco con ID: ${event.target.id}`);
// }

// function obtenerTamañoBarco(barcoId) {
//     switch(barcoId) {
//         case 'img-portaaviones':
//             return 5;
//         case 'img-acorazado':
//             return 4;
//         case 'img-crucero':
//             return 3;
//         case 'img-submarino':
//             return 3;
//         case 'img-destructor':
//             return 2;
//     }
// }

// function permitirSoltar(event) {
//     event.preventDefault();
// }

// function soltar(event) {
//     event.preventDefault();
//     var barcoId = event.dataTransfer.getData("barcoId");
//     var casillaDestino = event.target.id;

//     console.log(`Barco ${barcoId} soltado en la casilla: ${casillaDestino}`);

//     colocarBarco(casillaDestino, barcoId);
// }

// function colocarBarco(casilla, barcoId) {
//      var className; 
//      switch(barcoId) { 
//         case 'img-portaaviones': 
//             className = 'portaaviones adelante';
//             break; 
//         case 'img-acorazado': 
//             className = 'acorazado adelante';
//             break; 
//         case 'img-crucero': 
//             className = 'crucero adelante';
//             break; 
//         case 'img-submarino': 
//             className = 'submarino adelante';
//             break; 
//         case 'img-destructor':
//             className = 'destructor adelante';
//         break; 
//             default: className = 'position'; 
//     } 

//     let casillaActual = document.getElementById(casilla); 
//     if (casillaActual) { 
//         casillaActual.className = casillaActual.className + ' ' + className; 
//     } 
// }

// // function obtenerIdCasillaAdyacente(casilla, offset) {
// //     let letra = casilla.charAt(1);
// //     let numero = parseInt(casilla.slice(2));
// //     let nuevoNumero = numero + offset;

// //     if (nuevoNumero > 10) return null;  // Verificar que no se salga del tabero

// //     return `p${casilla.charAt(0)}-${letra}${nuevoNumero}`;
// // }

// function obtenerCasillasAdyacentes(casilla) {
// }

// function saveBoard(boardId) {
//     const board = document.getElementById(boardId);
//     board.querySelectorAll('.highlight').forEach(cell => cell.classList.remove('highlight'));
//     if (board) {
//         const boardState = board.innerHTML;
//         // localStorage.setItem(`savedBoard-${generatedPlayerId}`, boardState);
//         localStorage.setItem(`savedBoard`, boardState);
//     } else {
//         console.error('Board not found:', boardId);
//     }
// }

// function clearBoard(boardID){
//     const board = document.getElementById(boardID); 
//     const cells = board.querySelectorAll('.position'); // Limpiar el contenido de cada celda 
//     cells.forEach(cell => cell.className = 'position');
// }