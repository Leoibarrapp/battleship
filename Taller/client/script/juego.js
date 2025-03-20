const socket = new WebSocket('ws://127.0.0.1:8080');

let currentTorneoId;
let currentGameId;
let currentPlayerId;
let turn;
let puntos = 0;
let losers = [];
let shieldUsed = false;

let misilCruceroClicked = false;
let empClicked = false;
let misilCoolDown = 0;
let ataqueEMPCoolDown = 0;

let playerBoard;

const selectTorneoGame = document.getElementById('select-torneo-game');

const versusGamemode = document.getElementById('versus-gamemode');
const torneoGamemode = document.getElementById('torneo-gamemode');

const selectStrategy = document.getElementById('select-strategy');
const selectStrategyButton = document.getElementById('select-strategy-button');

const clientMessage = document.getElementById('message-versus');
const clientMessageTorneo = document.getElementById('message-torneo');

const playGame = document.getElementById('play-game');

const leaderboard = document.getElementById('leaderboard-torneo'); //AGREGUE ESTO -MARIFES
const clientMessageNombre = document.getElementById('message-nombre'); //AGREGUE ESTO  -MA
const identificacion = document.getElementById('identificacion-torneo') //AGREGUE ESTO -MA

//select-torneo-game

socket.onopen = () => {
    console.log(`Conectado al servidor`);
};

socket.onclose = () => {
    clientMessage.style.color = 'red';
    clientMessageTorneo.style.color = 'red';
    clientMessageNombre.style.color = 'red';

    clientMessage.textContent = 'No se pudo conectar al servidor. Por favor, recargue la página.';
    clientMessageTorneo.textContent = 'No se pudo conectar al servidor. Por favor, recargue la página.';
    clientMessageNombre.textContent = 'No se pudo conectar al servidor. Por favor, recargue la página.';
}

window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("modo-torneo").addEventListener('click', () => {
        playGame.hidden = true;
        selectTorneoGame.hidden =true;
        selectStrategy.hidden = true;
        versusGamemode.hidden = true;
        torneoGamemode.hidden = true;
        identificacion.hidden = false; //AGREGUE ESTO -MARIFES
    });

    document.getElementById('modo-versus').addEventListener('click', () => {
        playGame.hidden = true;
        selectTorneoGame.hidden = true;
        selectStrategy.hidden = true; 
        identificacion.hidden = true; //AGREGUE ESTO -MARIFES
        versusGamemode.hidden = false; 
    });

    document.getElementById("identificacion-ready-button").addEventListener('click', () => {
        if(document.getElementById('nombre-torneo').value === ''){
            clientMessageNombre.style.color = 'red';
            clientMessageNombre.textContent = 'Por favor, ingrese un nombre válido.';
        }
        else{
            const nombre = document.getElementById('nombre-torneo').value;
            socket.send(JSON.stringify({ type: 'identificacion', nombre }));
           
        }
    });

});



//versus

socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);

    clientMessage.style.color = '#ff00ff';

    if (message.type === 'gameCreated') {
        currentGameId = message.gameId;
        document.getElementById("game-id").value = currentGameId;
        socket.send(JSON.stringify({ type: 'joinGame', gameId: currentGameId, torneoId: currentTorneoId }));

    } else if (message.type === 'playerJoined') {
        currentPlayerId = message.playerId;
        currentGameId = message.gameId;
        clientMessage.textContent = 'Unido a juego: ' + currentGameId;
        document.getElementById('select-strategy-button').classList.remove('disabled');
       
    } else if(message.type === 'error') {
        clientMessage.style.color = 'red';
        clientMessage.textContent = message.message;
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("create-game").addEventListener('click', () => {
        socket.send(JSON.stringify({ type: 'createGame' }));
    });

    document.getElementById('join-game').addEventListener('click', () => {
        if(document.getElementById('game-id').value === ''){
            clientMessage.style.color = 'red';
            clientMessage.textContent = 'Por favor, ingrese un ID de juego válido.';
        }
        else{
            const gameId = document.getElementById('game-id').value;
            socket.send(JSON.stringify({ type: 'joinGame', gameId }));
        }
    });

    document.getElementById('close-connection').addEventListener('click', () => {
        const response = confirm('¿Estás seguro de que deseas cerrar la conexión con el servidor de WebSocket?\n\nSi la cierras, no podrás enviar ni recibir más mensajes y, de acuerdo a esta implementación, tendrás que recargar la página.');
        if (response) {
            socket.close();
        }
    });
});



//torneo

//leaderboards && nombres
socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);

    if (message.type === 'playerAdded') { //AGREGUE ESTO
        playGame.hidden = true;
        selectTorneoGame.hidden =true;
        selectStrategy.hidden = true;
        versusGamemode.hidden = true;
        identificacion.hidden = true;
        leaderboard.hidden = true;
        torneoGamemode.hidden = false;

    } else if(message.type === 'mostrarLeaderboard') {
        playGame.hidden = true;
        selectTorneoGame.hidden =true;
        selectStrategy.hidden = true;
        versusGamemode.hidden = true;
        torneoGamemode.hidden = true;
        identificacion.hidden = true;
        leaderboard.hidden = false;

        mostrarLeaderboard(message.torneoId, message.leaderboard);

    } else if (message.type === 'errorIdentificando') { //AGREGUE ESTO
        clientMessageNombre.style.color = 'red';
        clientMessageNombre.textContent = message.message

    } 
});


//torneo
socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);

    clientMessageTorneo.style.color = '#ff00ff';

    if (message.type === 'torneoCreated') {
            currentTorneoId = message.torneoId;
            document.getElementById("torneo-id").value = currentTorneoId;
            socket.send(JSON.stringify({ type: 'joinTorneo', torneoId: currentTorneoId }));

    } else if (message.type === 'playerJoinedTorneo') {
        currentTorneoId = message.torneoId;
        clientMessageTorneo.textContent = 'Unido al torneo: ' + currentTorneoId; 

        const rooms = message.rooms;

        let buttonsHtml = rooms.map(room => {
            return `<button id="${room.id}" class="room-button">Cant: ${room.playerCount}</button>`;
        }).join(''); // Unir todos los botones en una sola cadena

        Swal.fire({
            title: 'Selecciona un juego para unirte',
            showCancelButton: false,
            showConfirmButton: false,
            background: '#2c2c2c',
            html: buttonsHtml
        });

        document.querySelectorAll('.room-button').forEach(button => {
            button.style.backgroundColor = '#FFFF33';
            button.style.fontFamily = 'Orbitron';
            button.style.color = 'black';
            button.style.margin = '6px';
            button.style.radius = '5px';

            const room = rooms.find(r => r.id === button.id)

            if(room.playerCount >= 4) {
                button.style.backgroundColor = 'red';
            } 
            else {
                button.addEventListener('click', () => {
                    currentGameId = button.id;

                    clientMessageTorneo.textContent = `Unido al torneo:  ${currentTorneoId}, en el juego: ${currentGameId}`;

                    socket.send(JSON.stringify({ type: 'joinGame', gameId: currentGameId, torneoId: currentTorneoId }));
                    socket.send(JSON.stringify({ type: 'getTorneoStatus', torneoId: currentTorneoId }));
                });
            }
        });

    } else if(message.type === 'torneoStatus') {
        
        if(message.roundGamesFinished === true && message.playerCount === message.minPlayers && currentGameId) {
            socket.send(JSON.stringify({ type: 'readyTorneo', torneoId: currentTorneoId }));
        }
        else{
            if(message.started === false) { //si es la primera iteracion del torneo
                Swal.fire({
                    title: 'Esperando a que hayan suficientes jugadores...',
                    text: `Jugadores actuales: ${message.playerCount}`,
                    icon: 'info',
                    showConfirmButton: false,
                    background: '#2c2c2c',
                    iconColor: '#ff00ff',
                    didOpen: () => {
                        Swal.showLoading();
                    }
                })
        
                if(message.playerCount >= message.minPlayers) {
                    document.getElementById('iniciar-torneo-button').classList.remove('disabled');
        
                    Swal.fire({
                        icon: 'success',
                        title: 'Ya pueden empezar el torneo. ¡Buena suerte!',
                        showCancelButton: false,
                        background: '#2c2c2c',
                        iconColor: '#ff00ff',
                        timer: 2000
                    })
                }
            }
        }
        
    } else if(message.type === 'torneoStarted') {
        Swal.fire({
            title: 'Torneo iniciado',
            text: 'El torneo ha comenzado. ¡Buena suerte!',
            icon: 'success',
            showCancelButton: false,
            background: '#2c2c2c',
            iconColor: '#ff00ff'
        });

        goSelectStrategy();

    } else if(message.type === 'torneoEnded') {
        Swal.close();
        Swal.fire({
            icon: 'success',
            title: '¡Felicidades! Has ganado el torneo.',
            text: 'Lograste vencer a todas las flotas enemigas. ¡Gracias por participar!',
            color: '#ff00ff',
            showConfirmButton: true,
            confirmButtonText: 'Ver leaderboard',
            showDenyButton: true,
            denyButtonText: 'Salir', 
            confirmButtonColor: '#1e1e1e',
            background: '#2c2c2c', 
            iconColor: '#ff00ff',
        }).then((response) => {
            if(response.isConfirmed) {
                socket.send(JSON.stringify({ type: 'getLeaderboard', torneoId: currentTorneoId }));
            } else if(response.isDenied) {
                location.href = 'index.html';
            }
        });
    } else if(message.type === 'error') {
        clientMessageTorneo.style.color = 'red';
        clientMessageTorneo.textContent = message.message;
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("create-torneo").addEventListener('click', () => {
        const torneoId = document.getElementById('torneo-id').value;
        socket.send(JSON.stringify({ type: 'createTorneo' }));
    });

    document.getElementById('join-torneo').addEventListener('click', () => {
        if(document.getElementById('torneo-id').value === ''){
            clientMessageTorneo.style.color = 'red';
            clientMessageTorneo.textContent = 'Por favor, ingrese el ID de un torneo válido.';
        }
        else{
            const torneoId = document.getElementById('torneo-id').value;
            socket.send(JSON.stringify({ type: 'joinTorneo', torneoId }));
        }
    });

    // document.getElementById('view-leaderboard').addEventListener('click', () => { 
    //     if(document.getElementById('torneo-id').value === ''){
    //         clientMessageTorneo.style.color = 'red';
    //         clientMessageTorneo.textContent = 'Por favor, ingrese el ID de un torneo válido.';
    //     }
    //     else{
    //         const torneoId = document.getElementById('torneo-id').value;
    //         socket.send(JSON.stringify({ type: 'leaderboard', torneoId }));
    //     }
    // });
});

document.getElementById('iniciar-torneo-button').addEventListener('click', (event) => {
    socket.send(JSON.stringify({ type: 'startTorneo', torneoId: currentTorneoId }));
   // document.getElementById('battleship-board-strategy').innerHTML = crearTabla(currentPlayerId);
});

//AGREGUE ESTO CON  DEPURACIONES 
function mostrarLeaderboard(torneoId, leaderboard) {
    const leaderboardTitle = document.getElementById('leaderboard-title');
    const leaderboardContainer = document.getElementById('leaderboard-body');

    leaderboardTitle.innerHTML = `<h2>Leaderboard del torneo: ${torneoId}</h2>`;

    // Limpiar el contenido existente del leaderboard
    leaderboardContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();

    // Agregar las filas de jugadores al fragmento

    for(let i = 1; i <= leaderboard.length; i++) {
        const tr = document.createElement('tr');
        
        const posicionTd = document.createElement('td');
        posicionTd.textContent = i.toString();
        tr.appendChild(posicionTd);

        const jugadorTd = document.createElement('td');
        jugadorTd.textContent = leaderboard[i-1];
        tr.appendChild(jugadorTd);

        fragment.appendChild(tr);
    }

    // Agregar el fragmento al DOM
    leaderboardContainer.appendChild(fragment);

    console.log('Leaderboard actualizado');
}




//select-strategy logic

document.getElementById('limpiar-tablero').addEventListener('click', (event) => {
    limpiarTablero();
});

document.getElementById('comenzar-juego').addEventListener('click', validarBarcos);

document.getElementById('cambiar-direccion').addEventListener('click', cambiarDireccion);




let newX = 0, newY = 0, startX = 0, startY = 0;
let initialX = 0, initialY = 0;  // Variables para almacenar la posición inicial

const cards = document.querySelectorAll('.card');
const strategyBoard = document.getElementById(`battleship-board-strategy`);

cards.forEach(card => {
    card.addEventListener('mousedown', (e) => mouseDown(e, card));
    // Guardar posición inicial al cargar la página
    card.dataset.initialPosition = `${card.offsetLeft},${card.offsetTop}`;
});

function mouseDown(e, card) {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;

    // Guardar la posición inicial
    initialX = card.offsetLeft;
    initialY = card.offsetTop;

    const mouseMoveHandler = (e) => mouseMove(e, card);
    const mouseUpHandler = () => mouseUp(card, mouseMoveHandler, mouseUpHandler);

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
}

function mouseMove(e, card) {
    newX = startX - e.clientX;
    newY = startY - e.clientY;

    startX = e.clientX;
    startY = e.clientY;

    card.style.top = (card.offsetTop - newY) + 'px';
    card.style.left = (card.offsetLeft - newX) + 'px';

    highlightPassingCells(card);
}

function mouseUp(card, mouseMoveHandler, mouseUpHandler) {
    if (isWithinBoard(card) && !isOverlapping(card)) {
        alignToGrid(card);
        card.style.display = 'none';
    } else {
        // Volver a la posición inicial si está fuera de los límites o se superpone
        card.style.top = initialY + 'px';
        card.style.left = initialX + 'px';
    }

    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
}

function highlightPassingCells(card) {
    const cardRect = card.getBoundingClientRect();
    const boardRect = strategyBoard.getBoundingClientRect();
    const cellSize = 44;  // Tamaño de cada celda en px
    const offsetX = cardRect.left - boardRect.left;
    const offsetY = cardRect.top - boardRect.top;
    const gridX = Math.round(offsetX / cellSize) * cellSize;
    const gridY = Math.round(offsetY / cellSize) * cellSize;
    const size = getSize(card);

    const cells = document.querySelectorAll('.position');
    cells.forEach(cell => {
        cell.style.backgroundColor = ''; // Restaurar color original
    });

    for (let i = 0; i < size; i++) {
        const cellId = card.classList.contains('vertical') 
            ? `p${currentPlayerId}-${String.fromCharCode(96 + (gridY / cellSize) + i)}${gridX / cellSize}` 
            : `p${currentPlayerId}-${String.fromCharCode(96 + (gridY / cellSize))}${(gridX / cellSize) + i}`;
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.style.backgroundColor = '#FFFF33';
        }
    }
}

function isWithinBoard(card) {
    const cardRect = card.getBoundingClientRect();
    const boardRect = strategyBoard.getBoundingClientRect();

    // Calculate the valid area excluding the first row and first column
    const validTop = boardRect.top + 44; // Exclude the first row
    const validLeft = boardRect.left + 44; // Exclude the first column
    const validBottom = boardRect.bottom;
    const validRight = boardRect.right;

    return (
        cardRect.top >= validTop &&
        cardRect.left >= validLeft &&
        cardRect.bottom <= validBottom &&
        cardRect.right <= validRight
    );
}

function isOverlapping(card) {
    const cardRect = card.getBoundingClientRect();
    const cells = document.querySelectorAll('.position');
    for (let cell of cells) {
        const cellRect = cell.getBoundingClientRect();
        if (
            cardRect.left < cellRect.right &&
            cardRect.right > cellRect.left &&
            cardRect.top < cellRect.bottom &&
            cardRect.bottom > cellRect.top &&
            cell.style.backgroundImage
        ) {
            return true;
        }
    }
    return false;
}

function alignToGrid(card) {
    const cardRect = card.getBoundingClientRect();
    const boardRect = strategyBoard.getBoundingClientRect();

    // Calcular la posición dentro del grid
    const cellSize = 44;  // Tamaño de cada celda en px
    const offsetX = cardRect.left - boardRect.left;
    const offsetY = cardRect.top - boardRect.top;
    const gridX = Math.round(offsetX / cellSize) * cellSize;
    const gridY = Math.round(offsetY / cellSize) * cellSize;

    // Ajustar la posición del card
    card.style.top = `${gridY}px`;
    card.style.left = `${gridX}px`;

    // Cambiar el fondo de las casillas correspondientes
    drop(card, gridX / cellSize, gridY / cellSize);
    
}

function drop(card, x, y) {
    const cellSize = 44;  // Tamaño de cada celda en px
    let imageUrl;
    let size;
    let shipClass;
    switch(card.id) {
        case 'card-portaaviones':
            imageUrl = '../images/portaaviones.png';
            size = 5;
            shipClass = 'portaaviones';
            break;
        case 'card-acorazado':
            imageUrl = '../images/acorazado.png';
            size = 4;
            shipClass = 'acorazado';
            break;
        case 'card-submarino':
            imageUrl = '../images/submarino.png';
            size = 3;
            shipClass = 'submarino';
            break;
        case 'card-crucero':
            imageUrl = '../images/crucero.png';
            size = 3;
            shipClass = 'crucero';
            break;
        case 'card-destructor':
            imageUrl = '../images/destructor.png';
            size = 2;
            shipClass = 'destructor';
            break;
        default:
            imageUrl = '';
            size = 1;
            shipClass = '';
    }

    for (let i = 0; i < size; i++) {
        const cellId = card.classList.contains('vertical') 
            ? `p${currentPlayerId}-${String.fromCharCode(96 + y + i)}${x}` 
            : `p${currentPlayerId}-${String.fromCharCode(96 + y)}${x + i}`;
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.style.backgroundImage = `url(${imageUrl})`;
            cell.style.backgroundSize = card.classList.contains('vertical') 
                ? `${cellSize}px ${cellSize * size}px` 
                : `${cellSize * size}px ${cellSize}px`;
            cell.style.backgroundPosition = card.classList.contains('vertical') 
                ? `0px -${i * cellSize}px` 
                : `-${i * cellSize}px 0px`;
            cell.style.backgroundRepeat = 'no-repeat';
            cell.classList.add(shipClass);
            cell.style.backgroundColor = '';
        }
    }
}

function getSize(card) {
    switch(card.id) {
        case 'card-portaaviones':
            return 5;
        case 'card-acorazado':
            return 4;
        case 'card-submarino':
            return 3;
        case 'card-crucero':
            return 3;
        case 'card-destructor':
            return 2;
        default:
            return 1;
    }
}

// Crear tabla de posiciones dinámicamente
// function crearTabla(i) {
//     const board = document.createElement('div');
//     board.id = `battleship-board-p${i}`;
//     board.class = `battleship-board-p${i}`;

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
//             board.appendChild(celdaDiv);
//         }
//     });

//     return board.innerHTML;
// }





function crearTabla(i) {
    const board = document.createElement('div');
    board.id = `battleship-board-p${i}`;
    board.className = `battleship-board-p${i}`;

    const columnas = [''].concat(Array.from({ length: 10 }, (_, i) => i + 1));
    columnas.forEach(num => {
        const columnaDiv = document.createElement('div');
        columnaDiv.className = 'columna-ID';
        columnaDiv.innerText = num;
        board.appendChild(columnaDiv);
    });

    const filas = 'ABCDEFGHIJ'.split('');
    filas.forEach(letra => {
        const filaDiv = document.createElement('div');
        filaDiv.className = 'fila-ID';
        filaDiv.innerText = letra;
        board.appendChild(filaDiv);

        for (let j = 1; j <= 10; j++) {
            const celdaDiv = document.createElement('div');
            celdaDiv.className = 'position';
            celdaDiv.id = `p${i}-${letra.toLowerCase()}${j}`;
            board.appendChild(celdaDiv);
        }
    });

    return board.innerHTML;
}



// Función para cambiar la dirección de las cards
function cambiarDireccion() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.toggle('vertical');
    });
}

function validarBarcos() {
    const barcos =  ['portaaviones', 'acorazado', 'submarino', 'crucero', 'destructor'];
    const cells = document.querySelectorAll(`.battleship-board-strategy .position`);

    const barcosEnTablero = barcos.map(barco => {
        for (let cell of cells) {
            if (cell.classList.contains(barco)) {
                return true;
            }
        }
        return false;
    });
    const todosEnTablero = barcosEnTablero.every(presente => presente);

    if (todosEnTablero) {
        saveBoardAndSendToServer();

        socket.send(JSON.stringify({ type: 'ready', gameId: currentGameId, playerId: currentPlayerId, torneoId: currentTorneoId }));
        Swal.fire({
            title: 'Esperando a los demás jugadores...',
            background: '#2c2c2c', 
            iconColor: '#ff00ff',
            showCancelButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
            
        });
        
    } else {
        Swal.fire({ 
            title: 'Aún faltan barcos por colocar en el tablero.', 
            icon: 'warning', 
            confirmButtonText: 'Entendido', 
            confirmButtonColor: '#1e1e1e',
            background: '#2c2c2c', 
            iconColor: '#ff00ff',
        });
    }

    return todosEnTablero;
}

function limpiarTablero() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        // Volver a la posición inicial
        const initialPosition = card.dataset.initialPosition.split(',');
        card.style.top = initialPosition[1] + 'px';
        card.style.left = initialPosition[0] + 'px';
        card.style.display = 'block';
        // Asegurarse de que todas las cards estén en posición horizontal
        card.classList.remove('vertical');
        
        // Forzar la recarga de la imagen
        const cardImage = card.querySelector('img');
        if (cardImage) {
            const imageSrc = cardImage.src;
            cardImage.src = '';
            cardImage.src = imageSrc;
        }
    });
    

    // Limpiar las celdas del tablero
    const cells = document.querySelectorAll('.battleship-board-strategy .position');
    cells.forEach(cell => {
        cell.style.backgroundImage = '';
        cell.className = 'position'; // Remover cualquier clase de barco
    });
}

function saveBoardAndSendToServer() {
    const boardState = document.getElementById('battleship-board-strategy').innerHTML;

    if (!boardState) {
        return;
    }

    socket.send(JSON.stringify({ type: 'sendBoard', gameId: currentGameId, boardState, playerId: currentPlayerId }));
}





//game logic

socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if(message.type === 'gameStarted') {
        Swal.close();

        playGame.hidden = false;
        selectStrategy.hidden = true;
        versusGamemode.hidden = true;

    } else if(message.type === 'boardsObtained') {
        loadBoards(message.boards);

    } else if(message.type === 'receiveAttack') {
        if(shoot(message.target)){
            document.getElementById(message.target).removeEventListener('click', handleClick);
        }
        
    } else if(message.type === 'receiveRemoveHit') {
        const cell = document.getElementById(message.target);
        console.log(cell)
        console.log(cell.classList)
        if (cell && cell.classList.contains('hit')) {
            cell.classList.remove('hit');
            cell.addEventListener('click', handleClick); // Volver a habilitar el click en la casilla
        }
    } 
    else if (message.type === 'receiveProtectedCells') {
        const cell = document.getElementById(message.target);
        cell.classList.add('protected');
    }
    else if (message.type === 'receiveRemoveProtectedCells') {
        const cell = document.getElementById(message.target);
        cell.classList.remove('protected');
    }

    else if (message.type === 'receiveMine') {
        const cell = document.getElementById(message.target);
        console.log(cell)
        cell.classList.add('mine');
        console.log(cell.classList)
        if (cell) {
            cell.classList.add('mine');
            if (message.playerId !== currentPlayerId) {
                cell.style.backgroundImage = '';
            } else {
                cell.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg viewBox=\'-20 0 190 190\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg id=\'SVGRepo_bgCarrier\' stroke-width=\'0\'%3E%3C/g%3E%3Cg id=\'SVGRepo_tracerCarrier\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3C/g%3E%3Cg id=\'SVGRepo_iconCarrier\'%3E %3Cpath fill-rule=\'evenodd\' clip-rule=\'evenodd\' d=\'M147.372 68.9677L138.418 71.8387L143.757 82.1247L129.914 76.3607L120.513 85.5567L120.152 70.1077L112.031 60.9387L123.295 61.7247L120.501 47.9277L130.479 59.2277L140.147 53.0197L137.461 62.7907L147.372 68.9677ZM115.81 71.1737L117.523 76.6337C114.659 76.9597 111.238 78.4207 108.487 80.4037C109.564 82.3787 110.276 84.5607 110.441 86.7717L106.04 90.3917L91.666 75.6067L96.706 72.4507C98.924 72.3537 101.144 73.1257 103.142 74.4607C106.323 72.5507 110.655 71.0737 115.81 71.1737ZM71.881 148.811C19.391 148.811 20.264 76.1527 70.883 76.1527C119.408 76.1527 119.51 148.811 71.881 148.811Z\' fill=\'%23FFFF33\'%3E%3C/path%3E%3C/g%3E%3C/svg%3E")';
                cell.style.backgroundSize = 'cover';
            }
        }
    }

    else if (message.type === 'turnOf') {
        if (misilCruceroClicked) { 
            misilCoolDown++; 
            console.log(misilCoolDown);
        }       
        if (empClicked) { 
            ataqueEMPCoolDown++; 
        }
        // Seleccionar todas las casillas de los tableros que no pertenecen al jugador actual
        const allBoards = document.querySelectorAll(`[id^="battleship-board-p"]`);
        let hitCount = 0;
    
     
        
    
        // Lógica existente para manejar el cambio de turno
        let overlayMessages = document.querySelectorAll('.overlay-board-message');
        overlayMessages.forEach(overlayMessage => {
            if (overlayMessage.innerHTML === '<h1 style="color: #00ffff;"> Esperando a que termine su turno... </h1>') {
                overlayMessage.innerHTML = '';
            }
        });
    
        if (message.turn == currentPlayerId) {
            document.getElementById('tableros').classList.remove('disabled'); // Habilitar controles
            validarCoolDowns();
            losers.forEach(loser => {
                document.getElementById(`player${loser}`).add('disabled');
            });
    
            // Restaurar power-ups si están habilitados
            if (!message.powerupsDisabled) {
                enablePowerUps();
                validarCoolDowns();
                validarPuntos(puntos);
            } else {
                disablePowerUps();
    
                Swal.fire({
                    title: '¡Rayos!',
                    text: 'Los power-ups están deshabilitados debido al ataque EMP.',
                    icon: 'error',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#1e1e1e',
                    background: '#2c2c2c',
                    iconColor: '#ff00ff',
                });
            }
        } else {
            let currentTurnBoard = document.getElementById(`battleship-board-p${message.turn}`);
            if (currentTurnBoard) {
                let messageDiv = currentTurnBoard.querySelector('.overlay-board-message');
                messageDiv.innerHTML =
                    '<h1 style="color: #00ffff;"> Esperando a que termine su turno... </h1>';
    
                document.getElementById('tableros').classList.add('disabled'); // Deshabilitar controles
            }
            disablePowerUps(); // Asegurarse de que estén deshabilitados para el próximo jugador
        }
        
            
        // allBoards.forEach(board => {
        //     const playerId = parseInt(board.id.match(/p(\d+)/)[1]); // Obtener el ID del jugador desde el ID del tablero
        //     if (playerId !== currentPlayerId) {
        //         const hits = board.querySelectorAll('.hit'); // Contar casillas con clase 'hit'
        //         hitCount += hits.length;
        //         hitCount = hitCount*5;
        //     }
        //     validarPuntos(hitCount-puntosGastados);
        // });

    }
    
    else if(message.type === 'loserDetected') {

        const playerDiv = document.getElementById(`player${message.playerId}`);
        let messageDiv = playerDiv.querySelector('.overlay-board-message');
        messageDiv.innerHTML = '<h1 style="color: red;"> PERDEDOR </h1>';
        messageDiv.classList.add('fire');
        playerDiv.classList.add('disabled');

        if(message.playerId == currentPlayerId){
            document.getElementById('tableros').classList.add('disabled');

            Swal.fire({ 
                icon: 'error', 
                title: '¡Has perdido!', 
                confirmButtonText: 'Seguir viendo', 
                confirmButtonColor: '#1e1e1e',
                showDenyButton: true,
                denyButtonText: 'Salir',
                confirmButtonColor: '#1e1e1e',
                background: '#2c2c2c', 
                iconColor: '#ff00ff',
            }).then((result) => {
                if(result.isDenied){
                    location.href = 'index.html';
                }
            });
        }
        else {
            Swal.fire({ 
                icon: 'info', 
                title: '¡Un jugador ha perdido!', 
                text: 'La partida continuará entre los jugadores restantes',
                color: '#ff00ff',
                confirmButtonText: 'Entendido', 
                confirmButtonColor: '#1e1e1e',
                background: '#2c2c2c', 
                iconColor: '#ff00ff',
            });
        }

        losers.push( Number(message.playerId) );
        
    } else if(message.type === 'playerLeft') {

        const playerDiv = document.getElementById(`player${message.playerId}`);
        let messageDiv = playerDiv.querySelector('.overlay-board-message');
        messageDiv.innerHTML = '<h1 style="color: red;"> Abandonó </h1>';
        playerDiv.classList.add('disabled');

        Swal.fire({ 
            icon: 'info', 
            title: 'Un jugador se ha desconectado', 
            text: 'La partida continuará entre los jugadores restantes',
            color: '#ff00ff',
            confirmButtonText: 'Entendido', 
            confirmButtonColor: '#1e1e1e',
            background: '#2c2c2c', 
            iconColor: '#ff00ff',
        });

    } else if (message.type === 'gameEndedForfeit') {
        console.log('received')
        Swal.fire({ 
            icon: 'success', 
            title: 'La partida ha terminado.', 
            text: 'Los jugadores enemigos se han rendido. ¡No pudieron contra ti!',
            color: '#ff00ff',
            showConfirmButton: false,
            showDenyButton: true,
            denyButtonText: 'Salir', 
            background: '#2c2c2c', 
            iconColor: '#ff00ff',
        }).then(() => {
            location.href = 'index.html';
        });

    } else if(message.type === 'winnerDetected') {
        if(message.playerId == currentPlayerId){
            if(message.torneoId) {
                Swal.fire({
                    icon: 'info',
                    title: 'Esperando a que los demás juegos terminen...',
                    text: 'Por favor, espera a que los juegos actuales terminen.',
                    showCancelButton: false,
                    background: '#2c2c2c',
                    iconColor: '#ff00ff',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            } 
            else {
                Swal.fire({ 
                    icon: 'success', 
                    title: '¡Has ganado!', 
                    text: 'Has vencido a todos tu oponentes, ¡Felicidades! Nadie ha podido contra tu flota.',
                    color: '#ff00ff',
                    showConfirmButton: false,
                    showDenyButton: true,
                    denyButtonText: 'Salir', 
                    confirmButtonColor: '#1e1e1e',
                    background: '#2c2c2c', 
                    iconColor: '#ff00ff',
                }).then(() => {
                    location.href = 'index.html';
                });
            }
            
        } else {
            if(losers.includes(currentPlayerId)){
                Swal.fire({ 
                    icon: 'success', 
                    title: `Ha ganado Jugador ${message.playerId}`,
                    color: '#ff00ff',
                    showConfirmButton: false,
                    showDenyButton: true,
                    denyButtonText: 'Salir',
                    confirmButtonColor: '#1e1e1e',
                    background: '#2c2c2c', 
                    iconColor: '#ff00ff',
                }).then(() => {
                    location.href = 'index.html';
                });
            }
            else {
                Swal.fire({ 
                    icon: 'error', 
                    title: '¡Has perdido!', 
                    text: `No pudiste contra la flota de tu oponente. El ganador es Jugador ${message.playerId}. `,
                    color: '#ff00ff',
                    showConfirmButton: false,
                    showDenyButton: true,
                    denyButtonText: 'Salir',
                    confirmButtonColor: '#1e1e1e',
                    background: '#2c2c2c', 
                    iconColor: '#ff00ff',
                }).then(() => {
                    location.href = 'index.html';
                });
            }
        }
        
        currentGameId = undefined;
        currentPlayerId = undefined;
        turn = 0;
        puntos = 100;
        losers = [];
    } 
});

function loadBoards(boards) {
    let enemies = document.querySelector('.enemies-wrapper');
    let player = document.querySelector('.player-wrapper');
    enemies.innerHTML = '';
    player.innerHTML = '';

    for (let i = 1; i <= boards.length; i++) {
        let board = document.createElement('div');
        board.id = `battleship-board-p${i}`;
        board.className = `battleship-board-p${i}`;
        board.innerHTML = boards[i - 1];

        let playerDiv = document.createElement('div');
        playerDiv.id = `player${i}`;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'overlay-board-message';
        messageDiv.classList.add('enabled');
        board.appendChild(messageDiv);

        if (i == currentPlayerId) {
            board.classList.add('player');

            playerDiv.innerHTML = `
                <br>
                <center><h1>Tu Flota</h1></center>
                <center><h2 style="margin-top: 0px;">Jugador ${i}</h2></center>
                <br>
            `;
            
            playerDiv.appendChild(board);
            player.appendChild(playerDiv);

        } else {
            board.classList.add('enemy');

            const positions = board.querySelectorAll('.position')
            positions.forEach(cell => {
                cell.style= '';
                cell.addEventListener('click', handleClick);
            });

            playerDiv.innerHTML += `
                <br>
                <center><h1>Flota Enemiga</h1></center>
                <center><h2 style="margin-top: 0px;">Jugador ${i}</h2></center>
                <br>
            `;
                
            playerDiv.appendChild(board);
            enemies.appendChild(playerDiv);
        }
    }

    playerBoard = document.getElementById(`battleship-board-p${currentPlayerId}`);
}


function shoot(id) {
    const playerId = id.charAt(1);
    const position = document.querySelector(`#battleship-board-p${playerId} #${id}`);

    console.log(`Atacando a la posición ${id} del jugador ${playerId}`);

    if(position){
        const classList = position.classList;

        if (classList.contains('mine')) {
            position.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg viewBox=\'-20 0 190 190\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg id=\'SVGRepo_bgCarrier\' stroke-width=\'0\'%3E%3C/g%3E%3Cg id=\'SVGRepo_tracerCarrier\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3C/g%3E%3Cg id=\'SVGRepo_iconCarrier\'%3E %3Cpath fill-rule=\'evenodd\' clip-rule=\'evenodd\' d=\'M147.372 68.9677L138.418 71.8387L143.757 82.1247L129.914 76.3607L120.513 85.5567L120.152 70.1077L112.031 60.9387L123.295 61.7247L120.501 47.9277L130.479 59.2277L140.147 53.0197L137.461 62.7907L147.372 68.9677ZM115.81 71.1737L117.523 76.6337C114.659 76.9597 111.238 78.4207 108.487 80.4037C109.564 82.3787 110.276 84.5607 110.441 86.7717L106.04 90.3917L91.666 75.6067L96.706 72.4507C98.924 72.3537 101.144 73.1257 103.142 74.4607C106.323 72.5507 110.655 71.0737 115.81 71.1737ZM71.881 148.811C19.391 148.811 20.264 76.1527 70.883 76.1527C119.408 76.1527 119.51 148.811 71.881 148.811Z\' fill=\'%23FFFF33\'%3E%3C/path%3E%3C/g%3E%3C/svg%3E")';
            position.style.backgroundSize = 'cover';
            position.removeEventListener('click', handleClick);
            handleMineHit(currentPlayerId);
        }

        if (classList == 'position') {
            position.classList.add('missed');
            return true; // ataque exitoso
        } if (!classList.contains('protected')) {
            let shipType = '';
            if (classList.contains('acorazado')){ shipType = 'acorazado'; }
            else if (classList.contains('submarino')){ shipType = 'submarino'; }
            else if (classList.contains('portaaviones')){ shipType = 'portaaviones'; }
            else if (classList.contains('destructor')){ shipType = 'destructor'; }
            else if (classList.contains('crucero')){ shipType = 'crucero'; }

            if (shipType && !classList.contains('hit')) {
                if(playerId == currentPlayerId){
                    position.appendChild(document.createElement('div')).className = 'fire';
                } else {
                    position.classList.add('hit');
                    puntos += 5;
                    document.getElementById('puntaje').textContent = puntos; 
                }

                checkIfSunk(playerId, shipType);
                return true; // ataque exitoso
            }
            else{
                return false; // ataque fallido: ya se había atacado esa posición
            }
        }
        if (classList.contains('protected')) {
            playerBoard = document.getElementById(`battleship-board-p${playerId}`);
            const protectedCells = playerBoard.querySelectorAll(`.position.protected`); 
            protectedCells.forEach(cell => {
                if (cell && cell.classList.contains('position')) {
                    cell.classList.remove('protected'); 
                    socket.send(JSON.stringify({ type: 'sendRemovedProtectedCell', gameId: currentGameId, target: cell.id }));
                }
            });
            if(playerId == currentPlayerId){
                protectedCells.forEach(cell => {
                    if (cell && cell.classList.contains('position')) {
                        cell.style.backgroundColor = ''; 
                    }
                })
                Swal.fire({
                    title: '¡Rayos!',
                    text: 'Destruyeron tu escudo protector.',
                    icon: 'warning',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#1e1e1e',
                    background: '#2c2c2c',
                    iconColor: '#ff00ff',
                });
            }
            else{
                Swal.fire({
                    title: '¡OYE!',
                    text: 'Has destruido el escudo protector de tu oponente.',
                    icon: 'warning',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#1e1e1e',
                    background: '#2c2c2c',
                    iconColor: '#ff00ff',
                });    
            }
                   
        }
    }
    else{
        console.log(`No se encontró la posición ${position}`);
        return false; // ataque fallido: posición no encontrada
    }
}

function checkIfSunk(playerId, shipType) {
    const ship = document.querySelectorAll(`#battleship-board-p${playerId} .${shipType}`);
    let allHit = true;

    ship.forEach(position => {
        if (!position.classList.contains('hit') && !position.querySelector('.fire')) {
            allHit = false;
        }
    });
    

    if (allHit) {
        ship.forEach(position => {
            position.classList.add('sunk');
            // position.appendChild(document.createElement('div')).className = 'sunk';
        });
        if (shipType === 'submarino') {
            const sonarButtons = document.querySelectorAll('.sonar.btn-power-ups');
            sonarButtons.forEach(button => {
                button.classList.add('disabled');
            });
        }
        if (shipType === 'portaaviones') {
            const avionesDeAtaqueButtons = document.querySelectorAll('.aviones-de-ataque.btn-power-ups');
            avionesDeAtaqueButtons.forEach(button => {
                button.classList.add('disabled');
            });
        }

        checkLoser(playerId);
    }

}

function checkLoser(playerId) {
    const acorazados = document.querySelectorAll(`#battleship-board-p${playerId} .acorazado`);
    const submarinos = document.querySelectorAll(`#battleship-board-p${playerId} .submarino`);
    const portaaviones = document.querySelectorAll(`#battleship-board-p${playerId} .portaaviones`);
    const destructores = document.querySelectorAll(`#battleship-board-p${playerId} .destructor`);
    const cruceros = document.querySelectorAll(`#battleship-board-p${playerId} .crucero`);
    
    const ships = [acorazados, submarinos, portaaviones, destructores, cruceros];
    let allSunk = true;

    ships.forEach(ship => {
        ship.forEach(position => {
            if (!position.classList.contains('sunk')) {
                allSunk = false;
            }
        });
    });

    if (allSunk == true && playerId == currentPlayerId) {
        socket.send(JSON.stringify({ type: 'loser', gameId: currentGameId, playerId, torneoId: currentTorneoId }));
    }
}

document.getElementById('leave-game').addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'leave', gameId: currentGameId, playerId: currentPlayerId, torneoId: currentTorneoId }));
    location.href = 'index.html';
});

selectStrategyButton.addEventListener('click', goSelectStrategy);

function goSelectStrategy() {
    selectStrategy.hidden = false;

    versusGamemode.hidden = true;
    torneoGamemode.hidden = true;
    playGame.hidden = true;

    document.getElementById('battleship-board-strategy').innerHTML = crearTabla(currentPlayerId);
    limpiarTablero();
}



function handleClick() {
    socket.send(JSON.stringify({ type: 'sendAttack', gameId: currentGameId, target: event.target.id }));
    socket.send(JSON.stringify({ type: 'changeTurn', gameId: currentGameId, playerId: currentPlayerId }));
}





//power upsis
document.querySelector('.sonar.btn-power-ups').addEventListener('click', sonar);

document.querySelector('.aviones-de-ataque.btn-power-ups').addEventListener('click', avionesDeAtaque);



function sonar() {
    const currentPlayerSubmarino = document.querySelector(`#battleship-board-p${currentPlayerId}  .submarino`);
    if (!currentPlayerSubmarino || currentPlayerSubmarino.classList.contains('sunk')) {
        Swal.fire({
            title: 'Error',
            text: 'No puedes usar sonar porque tu submarino está hundido.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#1e1e1e',
            background: '#2c2c2c',
            iconColor: '#ff00ff',
        });
        return; // Detener ejecución si el portaaviones está hundido
    }
    const shipClasses = ['portaaviones', 'acorazado', 'submarino', 'crucero', 'destructor'];
    const cells = document.querySelectorAll('.position');

    const eligibleCells = Array.from(cells).filter(cell => {
        return shipClasses.some(shipClass => cell.classList.contains(shipClass)) &&
               !cell.classList.contains('hit') &&
               !cell.classList.contains('missed') &&
               !cell.id.startsWith(`p${currentPlayerId}`);
    });

    if (eligibleCells.length > 0) {
        const randomCell = eligibleCells[Math.floor(Math.random() * eligibleCells.length)];
        randomCell.style.backgroundImage = 'url("../images/sonar.gif")';
        randomCell.style.backgroundSize = 'cover';

        // Remove the background after the player's turn is over
        socket.addEventListener('message', function removeSonarBackground(event) {
            const message = JSON.parse(event.data);
            if (message.type === 'turnOf' && message.turn !== currentPlayerId) {
                randomCell.style.backgroundImage = '';
                socket.removeEventListener('message', removeSonarBackground);
            }
        });
    }
}
function avionesDeAtaque() {
    // Validar si el portaaviones del jugador actual está hundido
    const currentPlayerPortaaviones = document.querySelector(`#battleship-board-p${currentPlayerId}  .portaaviones`);

    if (!currentPlayerPortaaviones || currentPlayerPortaaviones.classList.contains('sunk')) {
        Swal.fire({
            title: 'Error',
            text: 'No puedes usar el ataque de aviones porque tu portaaviones está hundido.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#1e1e1e',
            background: '#2c2c2c',
            iconColor: '#ff00ff',
        });
        return; // Detener ejecución si el portaaviones está hundido
    }

    // Seleccionar celdas elegibles
    const cells = document.querySelectorAll('.position');
    const eligibleCells = Array.from(cells).filter(cell => 
        !cell.id.startsWith(`p${currentPlayerId}`) &&
        !cell.classList.contains('hit') &&
        !cell.classList.contains('missed')
    );

    if (eligibleCells.length > 0) {
        const randomCells = [];
        for (let i = 0; i < 5; i++) {
            if (eligibleCells.length === 0) break;
            const randomIndex = Math.floor(Math.random() * eligibleCells.length);
            randomCells.push(eligibleCells[randomIndex]);
            eligibleCells.splice(randomIndex, 1);
        }

        const attackedCells = randomCells.map(cell => cell.id);

        randomCells.forEach(cell => {
            const cellId = cell.id;
            if (cellId) {
                cell.removeEventListener('click', handleClick);
                socket.send(JSON.stringify({ type: 'sendAttack', gameId: currentGameId, target: cellId }));
            }
        });

        // Mostrar mensaje de éxito con las casillas atacadas
        Swal.fire({
            icon: 'success',
            title: '¡Ataque de aviones realizado!',
            html: `Las casillas atacadas fueron:<br><strong>${attackedCells.join(', ')}</strong>`,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#1e1e1e',
            background: '#2c2c2c',
            iconColor: '#00ff00',
        });
    }
}






document.querySelector('.misil-crucero.btn-power-ups').addEventListener('click', function() {
    misilCruceroClicked = true; 
    this.classList.add('disabled');
    misilCrucero(); 
});

function misilCrucero() {
    document.querySelectorAll('.position').forEach(cell => {
        if (!cell.id.startsWith(`p${currentPlayerId}`) && !cell.classList.contains('hit') && !cell.classList.contains('missed')) {
            cell.addEventListener('mouseover', highlightAdjacentCells);
            cell.addEventListener('click', handleMisilCruceroClick);
        }
    });
}

function highlightAdjacentCells(event) {
    const cell = event.target;
    const playerId = cell.id.charAt(1);
    const board = document.getElementById(`battleship-board-p${playerId}`);
    const adjacentCellsId = getAdjacentCellsHighlight(cell, 44, board); // 44 es el tamaño de la celda en px

    const cells = document.querySelectorAll('.position');
    cells.forEach(cell => {
        cell.style.backgroundColor = ''; // Restaurar color original
    });

    

    adjacentCellsId.forEach(cellId => {
        const adjacentCell = document.getElementById(cellId);
        if (adjacentCell) {
            console.log(adjacentCell);
            adjacentCell.style.backgroundColor = '#FFFF33';
            adjacentCell.appendChild(document.createElement('div')).className = 'highlight';
        }
    });

    // console.log(adjacentCellsId);
}

function getAdjacentCellsHighlight(cell, cellSize, board) {
    const playerId = cell.id.charAt(1);

    const cellRect = cell.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    const offsetX = cellRect.left - boardRect.left;
    const offsetY = cellRect.top - boardRect.top;
    const gridX = Math.round(offsetX / cellSize) * cellSize;
    const gridY = Math.round(offsetY / cellSize) * cellSize;
    
    const positions = [
        { x: gridX - cellSize, y: gridY - cellSize }, // arriba izquierda
        { x: gridX, y: gridY - cellSize }, // arriba
        { x: gridX + cellSize, y: gridY - cellSize }, // arriba derecha
        { x: gridX - cellSize, y: gridY }, // izquierda
        { x: gridX + cellSize, y: gridY }, // derecha
        { x: gridX - cellSize, y: gridY + cellSize }, // abajo izquierda
        { x: gridX, y: gridY + cellSize }, // abajo
        { x: gridX + cellSize, y: gridY + cellSize } // abajo derecha
    ];

    const adjacentCells = []

    positions.forEach(pos => {
        adjacentCells.push( `p${playerId}-${String.fromCharCode(96 + (pos.y / 44))}${(pos.x / 44)}` );
    });
    
    return adjacentCells;
}

function handleMisilCruceroClick(event) {
    const targetCell = event.target;
    const targetId = targetCell.id;
    const targetX = parseInt(targetId.slice(-1));
    const targetY = targetId.charCodeAt(targetId.length - 2) - 96;

    for (let x = targetX - 1; x <= targetX + 1; x++) {
        for (let y = targetY - 1; y <= targetY + 1; y++) {
            const cellId = `p${targetId.charAt(1)}-${String.fromCharCode(96 + y)}${x}`;
            const cell = document.getElementById(cellId);
            if (cell && !cell.id.startsWith(`p${currentPlayerId}`)) {
                if (!cell.classList.contains('hit') || !cell.classList.contains('missed')) {
                    cell.removeEventListener('click', handleClick);

                    socket.send(JSON.stringify({ type: 'sendAttack', gameId: currentGameId, target: cellId }));
                }
            }
        }
    }

    // Remove the click event listener after the missile is fired
    document.querySelectorAll('.position').forEach(cell => {
        cell.removeEventListener('click', handleMisilCruceroClick);
        cell.removeEventListener('mouseover', highlightAdjacentCells);
        cell.style.backgroundColor = ''; 
    });
}







document.querySelector('.mina-marina.btn-power-ups').addEventListener('click', minaMarina);

function minaMarina() {
    document.querySelectorAll(`#battleship-board-p${currentPlayerId} .position`).forEach(cell => {
        cell.addEventListener('click', placeMine);
    });
}

function placeMine(event) {
    const cell = event.target;
    cell.classList.add('mine');
    cell.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg viewBox=\'-20 0 190 190\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg id=\'SVGRepo_bgCarrier\' stroke-width=\'0\'%3E%3C/g%3E%3Cg id=\'SVGRepo_tracerCarrier\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3C/g%3E%3Cg id=\'SVGRepo_iconCarrier\'%3E %3Cpath fill-rule=\'evenodd\' clip-rule=\'evenodd\' d=\'M147.372 68.9677L138.418 71.8387L143.757 82.1247L129.914 76.3607L120.513 85.5567L120.152 70.1077L112.031 60.9387L123.295 61.7247L120.501 47.9277L130.479 59.2277L140.147 53.0197L137.461 62.7907L147.372 68.9677ZM115.81 71.1737L117.523 76.6337C114.659 76.9597 111.238 78.4207 108.487 80.4037C109.564 82.3787 110.276 84.5607 110.441 86.7717L106.04 90.3917L91.666 75.6067L96.706 72.4507C98.924 72.3537 101.144 73.1257 103.142 74.4607C106.323 72.5507 110.655 71.0737 115.81 71.1737ZM71.881 148.811C19.391 148.811 20.264 76.1527 70.883 76.1527C119.408 76.1527 119.51 148.811 71.881 148.811Z\' fill=\'%23FFFF33\'%3E%3C/path%3E%3C/g%3E%3C/svg%3E")';
    cell.style.backgroundSize = 'cover';
    socket.send(JSON.stringify({ type: 'sendMine', gameId: currentGameId, target: cell.id }));
    document.querySelectorAll(`#battleship-board-p${currentPlayerId} .position`).forEach(cell => {
        cell.removeEventListener('click', placeMine);
    });
}


function handleMineHit(currentPlayerId) {
    const playerCells = document.querySelectorAll(`#battleship-board-p${currentPlayerId} .position .fire`);
    if (playerCells.length > 0) {
        const randomHitCell = playerCells[Math.floor(Math.random() * playerCells.length)].parentElement;
        const adjacentCells = getAdjacentCells(randomHitCell).filter(cell => cell.id.startsWith(`p${currentPlayerId}`));
        if (adjacentCells.length > 0) {
            const randomAdjacentCell = adjacentCells[Math.floor(Math.random() * adjacentCells.length)];
            socket.send(JSON.stringify({ type: 'sendAttack', gameId: currentGameId, target: randomAdjacentCell.id }));
            const shipType = Array.from(randomAdjacentCell.classList).find(cls => ['portaaviones', 'acorazado', 'submarino', 'crucero', 'destructor'].includes(cls));
            Swal.fire({
                title: '¡Rayos!',
                text: `Le diste a una mina y ha dañado tu ${shipType} en la posición ${randomAdjacentCell.id.slice(3)}.`,
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#1e1e1e',
                background: '#2c2c2c',
                iconColor: '#ff00ff',
            });
        }
    }
}

function getAdjacentCells(cell) {
    const cellId = cell.id;
    const playerId = cellId.charAt(1);
    const x = parseInt(cellId.slice(-1));
    const y = cellId.charCodeAt(cellId.length - 2) - 96;

    const adjacentCells = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx !== 0 || dy !== 0) {
                const adjacentCellId = `p${playerId}-${String.fromCharCode(96 + y + dy)}${x + dx}`;
                const adjacentCell = document.getElementById(adjacentCellId);
                if (adjacentCell && ['portaaviones', 'acorazado', 'submarino', 'crucero', 'destructor'].some(cls => adjacentCell.classList.contains(cls))) {
                    adjacentCells.push(adjacentCell);
                }
            }
        }
    }
    return adjacentCells;
}

document.querySelector('.reparacion.btn-power-ups').addEventListener('click', reparacionRapida);



function reparacionRapida() {
    const fireCells = document.querySelectorAll('.fire');

    if (fireCells.length === 0) {
        puntos += 10;
        Swal.fire({
            title: 'Error',
            text: 'No hay barcos para reparar',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#1e1e1e',
            background: '#2c2c2c',
            iconColor: '#ff00ff',
        });
        return; // Salir de la función si no hay .fire cells
    }

    fireCells.forEach(fireCell => {
        fireCell.addEventListener('click', handleRepairClick);
    });
}




const repairedShips = new Set();

function handleRepairClick(event) {
    const fireCell = event.target;
    if (!fireCell.classList.contains('fire')) return;

    const targetCell = fireCell.parentElement;
    const shipType = Array.from(targetCell.classList).find(cls => ['portaaviones', 'acorazado', 'submarino', 'crucero', 'destructor'].includes(cls));
    if (!shipType || targetCell.classList.contains('sunk') || repairedShips.has(shipType)) {
        Swal.fire({
            title: 'Error',
            text: 'Ya no puedes reparar este barco.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#1e1e1e',
            background: '#2c2c2c',
            iconColor: '#ff00ff',
        });
        return;
    }

    // Reparar la celda en la que se hizo clic
    fireCell.classList.remove('fire');
    socket.send(JSON.stringify({ type: 'sendRemoveHit', gameId: currentGameId, target: targetCell.id }));

    // Obtener todas las celdas dañadas del mismo tipo de barco, excluyendo la que se acaba de reparar
    const damagedCells = Array.from(document.querySelectorAll(`#battleship-board-p${currentPlayerId} .${shipType} .fire`))
        .filter(cell => cell !== fireCell); // Excluir la celda actual
    console.log('Celdas dañadas restantes:', damagedCells);

    if (damagedCells.length > 0) {
        // Reparar una celda dañada aleatoria del mismo tipo de barco
        const randomIndex = Math.floor(Math.random() * damagedCells.length);
        const cellToRepair = damagedCells[randomIndex];
        cellToRepair.classList.remove('fire');
        socket.send(JSON.stringify({ type: 'sendRemoveHit', gameId: currentGameId, target: cellToRepair.parentElement.id }));

        Swal.fire({
            title: 'Reparación Rápida',
            text: `Se han reparado dos casillas del ${shipType}.`,
            icon: 'success',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#1e1e1e',
            background: '#2c2c2c',
            iconColor: '#ff00ff',
        });
    } else {
        Swal.fire({
            title: 'Reparación Rápida',
            text: `Se ha reparado una casilla del ${shipType}.`,
            icon: 'success',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#1e1e1e',
            background: '#2c2c2c',
            iconColor: '#ff00ff',
        });
    }

    // Marcar el barco como reparado
    repairedShips.add(shipType);

    // Quitar el event listener después de la reparación
    document.querySelectorAll(`#battleship-board-p${currentPlayerId} .fire`).forEach(cell => {
        cell.removeEventListener('click', handleRepairClick);
    });
}






document.querySelector('.ataque-EMP.btn-power-ups').addEventListener('click', function() {
    empClicked = true; 
    this.classList.add('disabled');
    ataqueEMP(); 
});

function ataqueEMP() {
    socket.send(JSON.stringify({ type: 'EMPAttack', gameId: currentGameId }));
    Swal.fire({
        icon: 'success',
        title: '¡Ataque EMP lanzado!',
        text: 'Tus oponentes están en problemas, sus Power Ups han sido deshabilitados temporalmente.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#1e1e1e',
        background: '#2c2c2c',
        iconColor: '#00ff00',
    });
}




function disablePowerUps() {
    const powerUpButtons = document.querySelectorAll('.btn-power-ups');
    powerUpButtons.forEach(button => {
        button.classList.add('disabled');
    });
}

function enablePowerUps() {
    const powerUpButtons = document.querySelectorAll('.btn-power-ups');
    powerUpButtons.forEach(button => {
        button.classList.remove('disabled');
    });
}

function validarPuntos(cantidadPuntos) {
    // Seleccionamos todos los botones con la clase btn-power-ups
    const botones = document.querySelectorAll('.btn-power-ups');

    // Iteramos sobre cada botón para verificar su costo
    botones.forEach((boton) => {
        // Obtenemos el elemento que contiene el costo
        const costeTexto = boton.querySelector('.info-card p:nth-child(2)').innerText;
        const coste = parseInt(costeTexto.match(/\d+/)[0], 10); // Extraemos el número del texto
        // Validamos si el usuario tiene suficientes puntos
        if (cantidadPuntos >= coste) {
            boton.classList.remove('disabled'); // Removemos la clase .disabled
            validarCoolDowns();
        } 
        else {
            boton.classList.add('disabled'); // Agregamos la clase .disabled
        }
    });
}

document.querySelectorAll('.btn-power-ups').forEach((boton) => {
    boton.addEventListener('click', () => {
        const costeTexto = boton.querySelector('.info-card p:nth-child(2)').innerText;
        const coste = parseInt(costeTexto.match(/\d+/)[0], 10); // Extraemos el número del texto
        puntos = puntos - coste;
        document.getElementById('puntaje').textContent = puntos; 
        validarPuntos(puntos);
    });
   
});

document.getElementById('puntaje').textContent = puntos; 








document.querySelector('.escudo-defensivo.btn-power-ups').addEventListener('click', function() {
    this.classList.add('disabled'); 
    shieldUsed = true; 
    escudoDefensivo(); 
});

function escudoDefensivo() {
    playerBoard = document.getElementById(`battleship-board-p${currentPlayerId}`);
    playerBoard.querySelectorAll('.position').forEach(cell => {
        cell.addEventListener('mouseover', applyHoverColor);
        cell.addEventListener('mouseout', removeHoverColor);
        cell.addEventListener('click', applyClickColor);
    });
}

function applyHoverColor(event) {
    const hoveredCell = event.target;
    if (!hoveredCell.classList.contains('clicked')) {
        hoveredCell.style.backgroundColor = '#FFFF33'; // Color cuando se pasa el mouse
    }

    const [player, row, col] = getCellCoordinates(hoveredCell.id);

    const neighbors = getNeighbors(player, row, col);

    neighbors.forEach(cell => {
        if (cell && cell.classList.contains('position') && !cell.classList.contains('clicked')) {
            cell.style.backgroundColor = '#FFFF33'; // Color cuando se pasa el mouse
        }
    });
}

function removeHoverColor(event) {
    const hoveredCell = event.target;
    if (!hoveredCell.classList.contains('clicked')) {
        hoveredCell.style.backgroundColor = ''; // Restablecer color original
    }

    const [player, row, col] = getCellCoordinates(hoveredCell.id);

    const neighbors = getNeighbors(player, row, col);

    neighbors.forEach(cell => {
        if (cell && cell.classList.contains('position') && !cell.classList.contains('clicked')) {
            cell.style.backgroundColor = ''; // Restablecer color original
        }
    });
}

function applyClickColor(event) {
    const clickedCell = event.target;
    clickedCell.style.backgroundColor = '#FF00FF'; // Color permanente cuando se hace clic
    clickedCell.classList.add('clicked');
    clickedCell.classList.add('protected'); // Añadir clase .protected

    const [player, row, col] = getCellCoordinates(clickedCell.id);

    const neighbors = getNeighbors(player, row, col);

    neighbors.forEach(cell => {
        if (cell && cell.classList.contains('position')) {
            cell.style.backgroundColor = '#11ecae9a'; // Color permanente cuando se hace clic
            cell.classList.add('clicked');
            cell.classList.add('protected'); // Añadir clase .protected
            socket.send(JSON.stringify({ type: 'sendProtectedCells', gameId: currentGameId, target: cell.id }));
        }
    });

    // Desactivar todos los eventos después de un clic
    playerBoard.querySelectorAll('.position').forEach(cell => {
        cell.removeEventListener('mouseover', applyHoverColor);
        cell.removeEventListener('mouseout', removeHoverColor);
        cell.removeEventListener('click', applyClickColor);
    });
}

function getCellCoordinates(cellId) {
    const [playerPart, colPart] = cellId.split('-');
    const player = playerPart;
    const row = colPart.charAt(0);
    const col = colPart.slice(1);
    return [player, row, col];
}

function getNeighbors(player, row, col) {
    const neighbors = [];

    // Celdas adyacentes y esquinas (3x3)
    const rows = [String.fromCharCode(row.charCodeAt(0) - 1), row, String.fromCharCode(row.charCodeAt(0) + 1)];
    const cols = [parseInt(col) - 1, parseInt(col), parseInt(col) + 1];

    rows.forEach(r => {
        cols.forEach(c => {
            const cell = playerBoard.querySelector(`#${player}-${r}${c}`);
            if (cell) {
                neighbors.push(cell);
            }
        });
    });

    return neighbors;
}


//cooldowns


function validarCoolDowns(){
    if(misilCoolDown < 5 && misilCoolDown !== 0){
        const misiles = document.querySelectorAll('.misil-crucero.btn-power-ups'); 
        misiles.forEach(misil => {
            misil.classList.add('disabled'); 
        });
    }
    if(ataqueEMPCoolDown < 10 && ataqueEMPCoolDown !== 0){ 
        const EMPAttack = document.querySelectorAll('.ataque-EMP.btn-power-ups'); 
        EMPAttack.forEach(emp => {
            emp.classList.add('disabled'); 
        });
    }
    if(misilCoolDown > 5){
        misilCoolDown = 0;
        misilCruceroClicked = false;
    }
    if(ataqueEMPCoolDown > 10){
        ataqueEMPCoolDown = 0;
        empClicked = false;
    }

    if(shieldUsed === true) {
        const shields = document.querySelectorAll('.escudo-defensivo.btn-power-ups'); 
        shields.forEach(shield => {
            shield.classList.add('disabled');      
        });
    }

    checkIfSunk(currentPlayerId, 'submarino')
    
   checkIfSunk(currentPlayerId, 'portaaviones')
}
