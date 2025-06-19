# Instrucciones para Agregar Imágenes de Eventos

## Imágenes Necesarias

Para que los eventos se muestren correctamente, necesitas agregar las siguientes imágenes al directorio `public/`:

### 1. Logo Goethe Lauf 5K/10K
- **Archivo:** `public/goethe-lauf-logo.png`
- **Descripción:** Logo deportivo con los colores de la bandera alemana (negro, rojo, amarillo)
- **Texto:** "GOETHE LAUF 5K/10K"
- **Usado en:** Corrida Goethe Lauf 5K/10K

### 2. Logo Intercolegial de Padres
- **Archivo:** `public/intercolegial-logo.png` 
- **Descripción:** Escudo/badge con fondo rojo-naranja
- **Texto:** "INTERCOLEGIAL DE PADRES" y "GOETHE 2025"
- **Usado en:** Intercolegial de Padres GOETHE 2025

## Cómo Agregar las Imágenes

1. Guarda las imágenes adjuntas con los nombres exactos mencionados arriba
2. Colócalas en el directorio `public/` del proyecto
3. Los eventos automáticamente mostrarán estas imágenes

## Eventos sin Imagen

Los eventos que no tienen imagen específica mostrarán:
- Un fondo degradado en colores del tema
- Un ícono de ticket (🎫) en lugar del ícono de usuario
- La fecha del evento en una badge

## Verificación

Para verificar que las imágenes se carguen correctamente:
1. Ejecuta `npm run dev`
2. Ve a la página de eventos
3. Confirma que los eventos "Corrida Goethe Lauf" e "Intercolegial de Padres" muestren sus respectivas imágenes 