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
    obtenerIdCasillaAdyacente(event.target.id).classList.add('highlight');
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
     var imagenBarco; switch(barcoId) { 
        case 'img-portaaviones': imagenBarco = 'url("../assets/portaaviones.png")'; 
            break; 
        case 'img-acorazado': imagenBarco = 'url("../assets/acorazado.png")'; 
            break; 
        case 'img-crucero': imagenBarco = 'url("../assets/crucero.png")'; 
            break; 
        case 'img-submarino': imagenBarco = 'url("../assets/submarino.png")'; 
            break; 
        case 'img-destructor': imagenBarco = 'url("../assets/destructor.png")'; 
        break; 
            default: imagenBarco = ''; 
    } 
    let casillaActual = document.getElementById(casilla); 
    if (casillaActual) { 
        casillaActual.style.backgroundImage = imagenBarco; 
        casillaActual.style.backgroundSize = "cover"; // Ajustar la imagen para cubrir la casilla 
    } 
}

// function obtenerIdCasillaAdyacente(casilla, offset) {
//     let letra = casilla.charAt(1);
//     let numero = parseInt(casilla.slice(2));
//     let nuevoNumero = numero + offset;

//     if (nuevoNumero > 10) return null;  // Verificar que no se salga del tablero

//     return `p${casilla.charAt(0)}-${letra}${nuevoNumero}`;
// }

function obtenerCasillasAdyacentes(casilla) {
}

// Llamar a la función para crear la tabla
crearTabla(1);

