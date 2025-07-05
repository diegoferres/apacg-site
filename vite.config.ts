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
  // Configuración condicional para desarrollo vs producción
  const isDevelopment = mode === 'development';
  const isLocalDevelopment = isDevelopment && fs.existsSync('C:/Users/diego/.config/herd/config/valet/Certificates/180-apacg.test.key');
  
  return {
    base: '/react', // 👈 importante para que los assets carguen desde la ruta correcta
    //base: '/', // 👈 importante para que los assets carguen desde la ruta correcta
    //base: !isLocalDevelopment ? '/react' : '/',
    server: {
      host: "0.0.0.0",
      port: 8080,
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
    outDir: '../apacg.com.py/public/react',  // compila directo al public de Laravel
    emptyOutDir: true,                // no borra los assets del backend
  }
  };
});
