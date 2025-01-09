function loadBoards(playerId){

    let board = document.getElementById('battleship-board-p1');

    if(board){
        board.innerHTML = localStorage.getItem(`savedBoard-p${playerId}-${currentGameId}`);
        console.log('Tablero cargado');
    }
    else{
        console.log('No se encontraron los tableros');
    }
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

