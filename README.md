# ORM · Frontend

Frontend en React + TypeScript (Vite) del sistema de despacho de viajes de la remisería.
Diseño _mobile first_: en el celular usa navegación inferior y paneles que suben desde abajo;
desde 1024 px de ancho pasa a menú lateral, tablero de viajes por columnas e historial en tabla.

## Cómo correrlo

1. Levantar el backend (`Backend/orm-backend`) en el puerto 3000: `npm run start:dev`
2. En esta carpeta:

```bash
npm install
npm run dev
```

3. Abrir http://localhost:5173

En desarrollo, las llamadas a `/api/*` se reenvían al backend (`vite.config.ts`), así que no hace
falta configurar CORS. Para apuntar a otro servidor se puede definir `VITE_API_URL` en un `.env.local`.

## Estructura

```
src/
  api/          cliente HTTP, tipos y endpoints del backend
  dominio/      estados, transiciones y formato de fechas (igual que el backend)
  hooks/        useCarga, useAccion, useMediaQuery, useDemorado
  sesion/       usuario con el que se opera (provisorio)
  componentes/  layout, modal, tarjetas, formularios y piezas de UI
  paginas/      una por pantalla
```

## Pendiente

- **Login (RF-2):** la pantalla de ingreso es provisoria (se elige el usuario de una lista) hasta
  que el backend tenga autenticación.
- **Firestore (RF-6, RB-5):** por ahora el panel de viajes activos se refresca cada 15 segundos.
