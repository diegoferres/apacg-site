import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// Deshabilitar validación TLS en desarrollo local
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('TLS validation disabled for local development');
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  // Verificar si existe el certificado local (Herd/Valet)
  const isLocalDevelopment = isDev && fs.existsSync('C:/Users/diego/.config/herd/config/valet/Certificates/180-apacg.test.key');
  
  return {
    // Base path condicional: desarrollo local usa /, resto usa /react/
    base: isLocalDevelopment ? '/' : '/react/',
    server: {
      host: "0.0.0.0",
      port: 8080,
      // Configuración para desarrollo con Laravel
      cors: true,
      // Historia de rutas para SPA
      historyApiFallback: true,
      // HTTPS solo para desarrollo local con certificados disponibles
      ...(isLocalDevelopment && {
        https: {
          key: fs.readFileSync('C:/Users/diego/.config/herd/config/valet/Certificates/180-apacg.test.key'),
          cert: fs.readFileSync('C:/Users/diego/.config/herd/config/valet/Certificates/180-apacg.test.crt'),
        },
      }),
      allowedHosts: [
        "180-apacg.test",
        "localhost",
        "127.0.0.1",
        "drugs-performs-delivering-curriculum.trycloudflare.com"
      ],
      // Proxy para APIs en desarrollo local (solo cuando no hay HTTPS local)
      proxy: (isDev && !isLocalDevelopment) ? {
        '/api': {
          target: 'http://localhost', // Tu backend Laravel local
          changeOrigin: true,
          secure: false,
        },
      } : undefined,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: '../apacg.com.py/public/react',  // compila directo al public de Laravel
      emptyOutDir: true,                // no borra los assets del backend
    }
  };
});