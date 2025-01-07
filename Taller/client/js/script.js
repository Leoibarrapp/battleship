// Crear tabla de posiciones dinámicamente
function crearTabla(i) {
    const board = document.getElementById(`battleship-board-p${i}`);

    if(!board) {
        return;
    }

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
            celdaDiv.addEventListener('click', shoot); // Agregar evento click aquí
            board.appendChild(celdaDiv);
        }
    });
}

function crearTablas(cant) {
    for (let i = 1; i <= cant; i++) {
        crearTabla(i);
    }
}

crearTablas(4);

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

window.addEventListener("DOMContentLoaded", (event)=>{
    const WEBSOCKET_SCHEME = 'ws';
    const WEBSOCKET_SERVER = '127.0.0.1';
    const WEBSOCKET_PORT = 8080;
    const WEBSOCKET_URL = `${WEBSOCKET_SCHEME}://${WEBSOCKET_SERVER}:${WEBSOCKET_PORT}`;
    const socket = new WebSocket(WEBSOCKET_URL); 

    socket.addEventListener('open', () => {
        // Nótese que es posible usar estilos CSS en la consola del navegador:
        console.log(`Conectado al servidor en ${WEBSOCKET_URL}`,  'color: #99ff00');
    });

    document.getElementById("create-game").addEventListener('click', () => {
        socket.send(JSON.stringify({ type: 'create' }));
    });

    document.getElementById('join-game').addEventListener('click', () => {
        const gameId = document.getElementById('game-id').value;
        socket.send(JSON.stringify({ type: 'join', gameId }));
    });

    document.getElementById('start-game').addEventListener('click', () => {
        const gameId = document.getElementById('game-id').value;
        socket.send(JSON.stringify({ type: 'start', gameId: gameId }));
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
        }cls
    });
})