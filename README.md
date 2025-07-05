# APACG Site - Frontend React

## Configuración de Build

La configuración de Vite está optimizada para compilar directamente al directorio de Laravel.

### Comportamiento:
- **Siempre compila a**: `../apacg.com.py/public/react/`
- **Base path**: `/react/` para servir los assets correctamente

## Scripts disponibles

- `pnpm dev` - Servidor de desarrollo
- `pnpm build` - Build de producción
- `pnpm build:dev` - Build de desarrollo
- `pnpm preview` - Preview del build

## Configuración

La configuración es simple y funcional:
- Compila directamente al directorio público de Laravel
- Usa `/react/` como base para los assets
- Incluye `lovable-tagger` para desarrollo
