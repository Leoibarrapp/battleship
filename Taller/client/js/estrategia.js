const socket = new WebSocket('ws://127.0.0.1:8080');

let generatedPlayerId;

// socket.addEventListener('open', () => {
//     socket.send(JSON.stringify({ type: 'getPlayerId', }));
//     console.log('Requesting Player ID...');
// });

// socket.addEventListener('message', event => {
//     const message = JSON.parse(event.data);
//     if (message.type === 'generatedPlayerId') {
//         generatedPlayerId = message.playerId;
//         console.log('Player ID generated:', generatedPlayerId);
//     }
//      else { 
//         console.error('Received unknown message type:', message.type); 
//     }
// });

function crearTabla(i) {
    const board = document.getElementById(`battleship-board-p${i}`);
    board.innerHTML = '';  // Limpiar cualquier contenido anterior

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
            celdaDiv.addEventListener('dragover', highlight);
            celdaDiv.addEventListener('dragleave', removeHighlight);
            celdaDiv.addEventListener('drop', soltar);
            board.appendChild(celdaDiv);
        }
    });
}

crearTabla(1);

function highlight(event) { 
    event.preventDefault(); 
    event.target.classList.add('highlight'); 
} // Función para quitar el resaltado al dejar de arrastrar  

function removeHighlight(event) { 
    event.target.classList.remove('highlight');
}

function arrastrar(event) {
    // Usar event.target.id para obtener el ID de la imagen arrastrada
    event.dataTransfer.setData("barcoId", event.target.id);
    //obtenerIdCasillaAdyacente(event.target.id).classList.add('highlight');
    console.log(`Iniciando arrastre del barco con ID: ${event.target.id}`);
}

function obtenerTamañoBarco(barcoId) {
    switch(barcoId) {
        case 'img-portaaviones':
            return 5;
        case 'img-acorazado':
            return 4;
        case 'img-crucero':
            return 3;
        case 'img-submarino':
            return 3;
        case 'img-destructor':
            return 2;
    }
}

function permitirSoltar(event) {
    event.preventDefault();
}

function soltar(event) {
    event.preventDefault();
    var barcoId = event.dataTransfer.getData("barcoId");
    var casillaDestino = event.target.id;

    console.log(`Barco ${barcoId} soltado en la casilla: ${casillaDestino}`);

    colocarBarco(casillaDestino, barcoId);
}

function colocarBarco(casilla, barcoId) {
     var className; 
     switch(barcoId) { 
        case 'img-portaaviones': 
            className = 'portaaviones adelante';
            break; 
        case 'img-acorazado': 
            className = 'acorazado adelante';
            break; 
        case 'img-crucero': 
            className = 'crucero adelante';
            break; 
        case 'img-submarino': 
            className = 'submarino adelante';
            break; 
        case 'img-destructor':
            className = 'destructor adelante';
        break; 
            default: className = 'position'; 
    } 

    let casillaActual = document.getElementById(casilla); 
    if (casillaActual) { 
        casillaActual.className = casillaActual.className + ' ' + className; 
    } 
}

// function obtenerIdCasillaAdyacente(casilla, offset) {
//     let letra = casilla.charAt(1);
//     let numero = parseInt(casilla.slice(2));
//     let nuevoNumero = numero + offset;

//     if (nuevoNumero > 10) return null;  // Verificar que no se salga del tabero

//     return `p${casilla.charAt(0)}-${letra}${nuevoNumero}`;
// }

function obtenerCasillasAdyacentes(casilla) {
}

function saveBoard(boardId) {
    const board = document.getElementById(boardId);
    board.querySelectorAll('.highlight').forEach(cell => cell.classList.remove('highlight'));
    if (board) {
        const boardState = board.innerHTML;
        localStorage.setItem(`savedBoard-${generatedPlayerId}`, boardState);
        // localStorage.setItem(`savedBoard`, boardState);
    } else {
        console.error('Board not found:', boardId);
    }
}

function clearBoard(boardID){
    const board = document.getElementById(boardID); 
    const cells = board.querySelectorAll('.position'); // Limpiar el contenido de cada celda 
    cells.forEach(cell => cell.className = 'position');
}