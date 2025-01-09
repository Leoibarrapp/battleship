import { socket, currentGameId, currentPlayerId } from "./socket.js";

document.getElementById('limpiar-tablero').addEventListener('click', limpiarTablero);
document.getElementById('comenzar-juego').addEventListener('click', validarBarcos);
document.getElementById('cambiar-direccion').addEventListener('click', cambiarDireccion);

let newX = 0, newY = 0, startX = 0, startY = 0;
let initialX = 0, initialY = 0;  // Variables para almacenar la posición inicial

const cards = document.querySelectorAll('.card');
const board = document.getElementById('battleship-board-p1');

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
    const boardRect = board.getBoundingClientRect();
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
            ? `p1-${String.fromCharCode(96 + (gridY / cellSize) + i)}${gridX / cellSize}` 
            : `p1-${String.fromCharCode(96 + (gridY / cellSize))}${(gridX / cellSize) + i}`;
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.style.backgroundColor = '#FFFF33';
        }
    }
}

function isWithinBoard(card) {
    const cardRect = card.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();

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
    const boardRect = board.getBoundingClientRect();

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
            imageUrl = '../assets/portaaviones.png';
            size = 5;
            shipClass = 'portaaviones';
            break;
        case 'card-acorazado':
            imageUrl = '../assets/acorazado.png';
            size = 4;
            shipClass = 'acorazado';
            break;
        case 'card-submarino':
            imageUrl = '../assets/submarino.png';
            size = 3;
            shipClass = 'submarino';
            break;
        case 'card-crucero':
            imageUrl = '../assets/crucero.png';
            size = 3;
            shipClass = 'crucero';
            break;
        case 'card-destructor':
            imageUrl = '../assets/destructor.png';
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
            ? `p1-${String.fromCharCode(96 + y + i)}${x}` 
            : `p1-${String.fromCharCode(96 + y)}${x + i}`;
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
function crearTabla(i) {
    const board = document.getElementById(`battleship-board-p${i}`);

    // Crear encabezado de columnas
    const columnas = [''].concat(Array.from({ length: 10 }, (_, i) => i + 1));
    columnas.forEach(num => {
        const columnaDiv = document.createElement('div');
        columnaDiv.className = 'columna-ID';
        columnaDiv.innerText = num;
        board.appendChild(columnaDiv);
    });

    // Crear filas y celdas
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
}

crearTabla(1);

// Función para cambiar la dirección de las cards
export function cambiarDireccion() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.toggle('vertical');
    });
}

export function validarBarcos() {
    const barcos =  ['portaaviones', 'acorazado', 'submarino', 'crucero', 'destructor'];
    const cells = document.querySelectorAll('.battleship-board-p1 .position');

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
        window.location.href = '1v1.html';
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

export function limpiarTablero() {
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
    const cells = document.querySelectorAll('.battleship-board-p1 .position');
    cells.forEach(cell => {
        cell.style.backgroundImage = '';
        cell.className = 'position'; // Remover cualquier clase de barco
    });
}

function saveBoardAndSendToServer() {
    const boardState = document.getElementById('battleship-board-p1').innerHTML;

    if (!boardState) {
        console.error('Board not found in local storage:', boardKey);
        return;
    }

    //se guarda en el localstorage porque no se ha podido lograr que se carguen las tablas desde el websocket
    localStorage.setItem('board', boardState);
    
    socket.send(JSON.stringify({ type: 'sendBoard', gameId: currentGameId, boardState, playerId: currentPlayerId }));
    socket.send(JSON.stringify({ type: 'joinGame', gameId: currentGameId }));
}