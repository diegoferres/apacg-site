# APACG Site - Frontend React

## Configuración de Build

### Variables de Entorno

Para configurar el directorio de salida del build, puedes usar la variable de entorno `VITE_BUILD_OUTPUT_DIR`:

```bash
# Ejemplo para compilar a un directorio específico:
export VITE_BUILD_OUTPUT_DIR=/var/www/html/public/react
pnpm build

# O directamente en el comando:
VITE_BUILD_OUTPUT_DIR=/path/to/your/custom/directory pnpm build
```

### Comportamiento por defecto:
- **Por defecto**: Siempre compila a `../apacg.com.py/public/react/`
- **Con variable de entorno**: Compila al directorio especificado en `VITE_BUILD_OUTPUT_DIR`

## Scripts disponibles

- `pnpm dev` - Servidor de desarrollo
- `pnpm build` - Build de producción
- `pnpm build:dev` - Build de desarrollo
- `pnpm preview` - Preview del build

## Configuración para producción

Por defecto, el build siempre compila a `../apacg.com.py/public/react/` para mantener la compatibilidad con el servidor.

Solo necesitas usar la variable de entorno si quieres compilar a un directorio diferente:

```
VITE_BUILD_OUTPUT_DIR=../tu-laravel-app/public/react
```
