// Crear tabla de posiciones dinámicamente
function crearTabla(i) {
    const board = document.getElementById('battleship-board-p'+i);

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

        for (let i = 1; i <= 10; i++) {
            const celdaDiv = document.createElement('div');
            celdaDiv.className = 'position';
            celdaDiv.id = `p1-${letra.toLowerCase()}${i}`;
            // celdaDiv.addEventListener('dragover', permitirSoltar);
            // celdaDiv.addEventListener('drop', soltar);
            board.appendChild(celdaDiv);
        }
    });
}

function crearTablas(cant){
    for( let i = 1; i<=cant; i++){
        crearTabla(i);
    }
}

// // Permitir el arrastre del barco
// function permitirArrastre(event) {
//     event.dataTransfer.setData('text', event.target.id);
// }

// // Permitir soltar en las celdas del tablero
// function permitirSoltar(event) {
//     event.preventDefault();
// }

// // Soltar el barco en la posición
// function soltar(event) {
//     event.preventDefault();
//     const barcoId = event.dataTransfer.getData('text');
//     const barco = document.getElementById(barcoId);

//     event.target.classList.add('acorazado');
//     event.target.appendChild(barco);
// }

// Llama a la función para crear la tabla
crearTablas(4);

// Añadir evento dragstart a la imagen del barco
//document.getElementById('acorazado').addEventListener('dragstart', permitirArrastre);

function shoot(event) { 
    const classList = event.target.classList; 
    if (classList == 'position') {
        event.target.className = event.target.className + ' missed'; 
    } 
    else if ( classList.contains('acorazado') || classList.contains('submarino') || classList.contains('portaaviones') || classList.contains('destructor') || classList.contains('crucero')) {
        event.target.className = event.target.className + ' hit'; 
    } 
    
    //checkIfSink();
}

// Selecciona todos los divs con la clase 'position'
const positions = document.querySelectorAll('.position');

// Agrega un listener de click a cada uno de los divs seleccionados
positions.forEach(position => {
    position.addEventListener('click', shoot);
});

// Función para verificar si se hundió un barco
function checkIfSink() {
    const acorazado = document.querySelectorAll('.acorazado.hit');
    const submarino = document.querySelectorAll('.submarino.hit');
    const portaaviones = document.querySelectorAll('.portaaviones.hit');
    const destructor = document.querySelectorAll('.destructor.hit');
    const crucero = document.querySelectorAll('.crucero.hit');

    const ships = [acorazado, submarino, portaaviones, destructor, crucero];

    for (let ship of ships) {
        const allHit = Array.from(ship).every(position => position.classList.contains('hit'));
        if (allHit) {
            ship.forEach(position => position.classList.add('sunk'));
        }
    }
}