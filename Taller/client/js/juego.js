import { socket, currentGameId, currentPlayerId } from "./socket.js";

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
            if(i != 1) {
                celdaDiv.addEventListener('click', shoot);
            }
            board.appendChild(celdaDiv);
        }
    });
}

crearTabla(1);
//no hemos podido lograr que se carguen las tablas desde el websocket
document.getElementById('battleship-board-p1').innerHTML = localStorage.getItem('board');
//cuando se logre, se cargarán las tablas desde el websocket y no se necesitará el localStorage
crearTabla(2);

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

document.getElementById('leave-game').addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'leave', currentGameId }));
});