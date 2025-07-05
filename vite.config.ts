import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
// import { componentTagger } from "lovable-tagger";

// Deshabilitar validación TLS en desarrollo local
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('TLS validation disabled for local development');
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';
  
  // Verificar si existe el certificado local solo en desarrollo
  const hasLocalCerts = isDevelopment && fs.existsSync('C:/Users/diego/.config/herd/config/valet/Certificates/180-apacg.test.key');
  
  // Configurar directorio de salida
  const getBuildOutDir = () => {
    if (process.env.VITE_BUILD_OUTPUT_DIR) {
      return process.env.VITE_BUILD_OUTPUT_DIR;
    }
    
    // Mantener el comportamiento original: siempre compilar a la ruta de Laravel
    return '../apacg.com.py/public/react';
  };
  
  return {
    base: '/react',
    server: {
      host: "0.0.0.0",
      port: 8080,
      // HTTPS solo para desarrollo local con certificados disponibles
      ...(hasLocalCerts && {
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
    },
    plugins: [
      react(),
      // mode === 'development' &&
      // componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: getBuildOutDir(),
      emptyOutDir: true,
      // Configuraciones adicionales para producción
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    }
  };
});
