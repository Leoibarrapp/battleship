# Batalla Naval Multijugador Online

Un juego de batalla naval multijugador desarrollado con tecnologías web modernas, que permite a los jugadores competir en tiempo real a través de WebSockets.

## Instalación y Ejecución

### Prerrequisitos
- [Deno](https://deno.land/) instalado en tu sistema

### Pasos para Ejecutar

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd battleship
   ```

2. **Ejecutar el servidor**
   ```bash
   cd Taller
   deno run --allow-net --watch .\server\server.ts
   ```

3. **Abrir el juego**
   - Abre `Taller/client/html/index.html` en tu navegador web
   - O navega a `Taller/client/html/juego.html` para ir directamente al juego

### Acceso al Juego

- **Servidor**: `ws://127.0.0.1:8080`
- **Puerto**: 8080
- **Protocolo**: WebSocket

## Tecnologías Utilizadas

### Backend
- **Deno**: Runtime de JavaScript/TypeScript
- **WebSockets**: Comunicación en tiempo real
- **TypeScript**: Tipado estático para mayor robustez

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos avanzados con efectos cyberpunk
- **JavaScript**: Lógica del cliente y manejo de WebSockets
- **SweetAlert2**: Notificaciones elegantes

### Características Técnicas
- **Arquitectura Cliente-Servidor**: Separación clara de responsabilidades
- **Comunicación Bidireccional**: WebSockets para actualizaciones en tiempo real
- **Sistema de Estados**: Manejo robusto del estado del juego
- **Validación de Datos**: Verificación tanto en cliente como servidor

## Descripción del Proyecto

Este proyecto implementa un juego completo de **Batalla Naval** con las siguientes características principales:

### Características Principales

- **Juego Multijugador en Tiempo Real**: Hasta 4 jugadores simultáneos usando WebSockets
- **Dos Modos de Juego**:
  - **Modo Versus**: Partidas 1v1 tradicionales
  - **Modo Torneo**: Sistema de eliminación directa con hasta 16 participantes
- **Sistema de Power-Ups**: 7 habilidades especiales que añaden estrategia al juego
- **Interfaz Cyberpunk**: Diseño futurista con efectos visuales y animaciones
- **Sistema de Puntuación**: Los jugadores ganan puntos por impactos y pueden gastarlos en power-ups

### Objetivo del Juego

Hundir toda la flota enemiga antes que tu oponente hunda la tuya. Cada jugador coloca estratégicamente sus barcos en un tablero de 10x10 y luego se turnan para atacar las posiciones del enemigo.

### Flota de Barcos

Cada jugador tiene una flota compuesta por:
- **1 Portaaviones** (5 casillas)
- **1 Acorazado** (4 casillas) 
- **1 Crucero** (3 casillas)
- **1 Submarino** (3 casillas)
- **1 Destructor** (2 casillas)

### Power-Ups Disponibles

1. **Sonar** (5 pts) - Revela una casilla aleatoria de un barco enemigo
2. **Aviones de Ataque** (10 pts) - Lanza 5 misiles aleatorios
3. **Mina Marina** (5 pts) - Planta una mina defensiva
4. **Escudo Defensivo** (15 pts) - Protege un área 3x3 por 3 turnos
5. **Misil Crucero** (15 pts) - Ataque dirigido a área 3x3
6. **Reparación Rápida** (10 pts) - Restaura hasta 2 casillas dañadas
7. **Ataque EMP** (25 pts) - Desactiva power-ups enemigos por 3 turnos

## Modos de Juego

### Modo Versus (1v1)
- Crea una partida o únete con un ID
- Coloca tus barcos estratégicamente
- Combate directo contra otro jugador
- Sistema de turnos alternados

### Modo Torneo
- Hasta 16 participantes
- Sistema de eliminación directa
- Leaderboard en tiempo real
- Múltiples rondas hasta determinar el campeón

## Características de la Interfaz

- **Diseño Cyberpunk**: Estética futurista con efectos de glitch
- **Animaciones Fluidas**: Transiciones suaves entre estados
- **Responsive Design**: Adaptable a diferentes tamaños de pantalla
- **Feedback Visual**: Indicadores claros de estado del juego
- **Multilingual Elements**: Textos en español con elementos japoneses/árabes

## Estructura del Proyecto

```
battleship/
├── Taller/
│   ├── client/
│   │   ├── css/           # Estilos del juego
│   │   ├── html/          # Páginas web
│   │   ├── images/        # Assets gráficos
│   │   └── script/        # Lógica del cliente
│   └── server/
│       └── server.ts      # Servidor WebSocket
├── deno.lock             # Dependencias de Deno
└── README.md             # Este archivo
```

## Equipo de Desarrollo

- **Alejandro Cifuentes** - Desarrollo Frontend y Backend
- **Mariana Fes** - Desarrollo Backend y Sistema de Torneos  
- **Leonardo Ibarra** - Desarrollo Frontend y UX/UI, y conexión de Websockets

## Estado Actual del Proyecto

### Funcionalidades Completadas
- Sistema de creación y unión a partidas
- Colocación de barcos (horizontal y vertical)
- Sistema de turnos y ataques
- Power-ups básicos implementados
- Modo torneo con leaderboard
- Interfaz de usuario completa

### Problemas Conocidos
- Bug visual en colocación vertical de barcos
- El WebSocket se resetea al cambiar de pantalla (afecta modo 1v1)
- Los modos de 3-4 jugadores no están completamente soportados debido al problema del WebSocket

### Funcionalidades Futuras
- Corrección del bug del WebSocket
- Implementación completa de modos multijugador (3-4 jugadores)
- Sistema de chat en tiempo real
- Más power-ups y estrategias
- Modo espectador para torneos

## Notas de Desarrollo

Este proyecto fue desarrollado como parte de un taller académico, demostrando habilidades en:
- Desarrollo web full-stack
- Programación en tiempo real con WebSockets
- Diseño de interfaces de usuario
- Arquitectura de aplicaciones multijugador
- Manejo de estados complejos en aplicaciones web

---

