# Taller 3 y 4

Para ejecutar, se debe tener instalado Deno y correr el comando:
`deno run --allow-net --watch .\Taller\server\server.ts`

Los métodos del websocket funciona, sin embargo, el juego no está completo.
- Puedes crear partida y unirte a una partida creada mediante el websocket. 
- Se pueden colocar los barcos en el tablero, horizontal y verticalmente (aunque este último tiene un bug visual).
- Al darle click a una casilla enemiga, se mostrará en blanco si falla y rojo si le pega a un barco.

## Importante

Actualmente, tenemos un error que no hemos logrado resolver, y es que al pasar de la pantalla "selección", que es donde se crean, unen, e inician las partidas, el websocket se resetea y por lo tanto al entrar a la pantalla "1v1", se salen los jugadores de la partida. El juego no soporta los otros modos de juego que no sean 1v1 debido a este problema.