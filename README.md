# APACG Site - Frontend React

## Configuración de Build

### Variables de Entorno

Para configurar el directorio de salida del build, puedes usar la variable de entorno `VITE_BUILD_OUTPUT_DIR`:

```bash
# Ejemplo para producción con ruta específica:
export VITE_BUILD_OUTPUT_DIR=/var/www/html/public/react
pnpm build

# O directamente en el comando:
VITE_BUILD_OUTPUT_DIR=/path/to/your/laravel/public/react pnpm build
```

### Comportamiento por defecto:
- **Desarrollo**: Compila a `../apacg.com.py/public/react`
- **Producción**: Compila a `dist/`

## Scripts disponibles

- `pnpm dev` - Servidor de desarrollo
- `pnpm build` - Build de producción
- `pnpm build:dev` - Build de desarrollo
- `pnpm preview` - Preview del build

## Configuración para producción

Si necesitas que el build compile directamente a un directorio específico en producción, crea un archivo `.env` con:

```
VITE_BUILD_OUTPUT_DIR=../tu-laravel-app/public/react
```
