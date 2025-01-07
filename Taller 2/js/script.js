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

function arrastrar(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function permitirSoltar(event) {
    event.preventDefault();
}

function soltar(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    var elementoArrastrado = document.getElementById(data);
    var casillaDestino = event.target.id; // Obtener el ID de la casilla de destino

    // Aquí puedes añadir lógica para asegurar que el elemento ocupa 5 celdas
    console.log(`Imagen soltada en la casilla: ${casillaDestino}`); // Mostrar el ID de la casilla en la consola
    event.target.appendChild(elementoArrastrado);
}

function finArrastrar(event) {
    event.dataTransfer.clearData();
}
