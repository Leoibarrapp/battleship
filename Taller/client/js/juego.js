const socket = new WebSocket('ws://127.0.0.1:8080');

let currentGameId;
let playerId;

socket.onopen = () => {
    socket.send(JSON.stringify({ type: 'getBoard', currentGameId, playerId }));
};

socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);

    if(message.type === 'boards'){
        const boards = message.boardState;

        loadBoard(1, boards[0]);
        loadBoard(2, boards[1]);
    }
});

// Función para cargar la tabla en el contenedor
function loadBoard(playerId, boardState) {
    const containerId = playerId === 1 ? 'battleship-container-p1' : 'battleship-container-p2';
    const container = document.getElementById(containerId);

    if (container) {
        container.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevas celdas

        // Crear la representación del tablero a partir del estado de la tabla
        for (let row of boardState.split('\n')) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'row';
            for (let cell of row.split('')) {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'cell';
                cellDiv.innerText = cell; // Ajusta esto según tu representación del tablero
                rowDiv.appendChild(cellDiv);
            }
            container.appendChild(rowDiv);
        }
    }

    console.log(container);
    console.log()
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