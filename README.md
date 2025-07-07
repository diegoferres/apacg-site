# APACG Site - Frontend React

## Configuración para Desarrollo y Producción

Esta aplicación está configurada para funcionar tanto en desarrollo local como en producción, con soporte para HTTPS local.

### 🚀 Desarrollo Local

#### Desarrollo con HTTPS (Herd/Valet)
Si tienes certificados SSL locales de Herd/Valet:

1. **Configuración automática:**
   - **HTTPS**: Automático con certificados de `C:/Users/diego/.config/herd/config/valet/Certificates/`
   - **Base URL**: `/` (root)
   - **Puerto**: `8080`
   - **Dominio**: `https://180-apacg.test:8080`

2. **Laravel configuración:**
   ```env
   APP_ENV=local
   APP_URL=https://180-apacg.test
   FRONTEND_URL=https://180-apacg.test:8080
   ```

#### Desarrollo sin HTTPS (Estándar)
Si no tienes certificados SSL locales:

1. **Configuración automática:**
   - **HTTP**: Sin certificados
   - **Base URL**: `/react/`
   - **Puerto**: `8080`
   - **CORS**: Habilitado
   - **Proxy API**: Configurado para `/api` → Laravel local

2. **Laravel configuración:**
   ```env
   APP_ENV=local
   FRONTEND_URL=http://localhost:8080
   ```

### 📦 Producción

1. **Build de producción:**
   ```bash
   pnpm build
   ```

2. **Configuración automática:**
   - **Base URL**: `/react/`
   - **Salida**: `../apacg.com.py/public/react/`
   - Laravel sirve los archivos compilados directamente

## Scripts disponibles

- `pnpm dev` - Servidor de desarrollo con hot reload
- `pnpm build` - Build de producción
- `pnpm build:dev` - Build de desarrollo
- `pnpm preview` - Preview del build

## Configuración de Laravel (Backend)

### Variables de entorno necesarias:

```env
# === DESARROLLO CON HTTPS LOCAL ===
APP_ENV=local
APP_URL=https://180-apacg.test
FRONTEND_URL=https://180-apacg.test:8080

# === DESARROLLO SIN HTTPS ===
APP_ENV=local
APP_URL=http://localhost
FRONTEND_URL=http://localhost:8080

# === PRODUCCIÓN ===
APP_ENV=production
```

### Funcionamiento por entorno:

- **Desarrollo con SSL**: Laravel redirige a `https://180-apacg.test:8080`
- **Desarrollo sin SSL**: Laravel redirige a `http://localhost:8080`
- **Producción**: Laravel sirve archivos desde `public/react/`

## Estructura de Desarrollo

```
180-APACG/
├── apacg-site/          # Frontend React
│   ├── src/             # Código fuente
│   ├── dist/            # Build de desarrollo (ignorar)
│   └── vite.config.ts   # Configuración Vite
└── 180-apacg/           # Backend Laravel
    ├── public/react/    # Build de producción
    └── routes/web.php   # Rutas configuradas
```

## Certificados SSL (Herd/Valet)

La aplicación detecta automáticamente si existen certificados SSL en:
```
C:/Users/diego/.config/herd/config/valet/Certificates/180-apacg.test.key
C:/Users/diego/.config/herd/config/valet/Certificates/180-apacg.test.crt
```

Si existen, se habilita HTTPS automáticamente.

## Solución de Problemas

### Pantalla en blanco:
1. Verificar que Laravel esté configurado con las variables correctas
2. En desarrollo: verificar que `pnpm dev` esté corriendo
3. En producción: verificar que `pnpm build` se ejecutó correctamente

### APIs no funcionan:
- **Con HTTPS local**: Las APIs van directamente a Laravel HTTPS
- **Sin HTTPS**: El proxy está configurado para `/api` → Laravel
- Verificar que Laravel esté corriendo en el puerto correcto

### Problemas de certificados:
- Verificar que los certificados de Herd/Valet estén instalados
- Si no los tienes, la aplicación funcionará sin HTTPS automáticamente
