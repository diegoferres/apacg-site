
import axios from 'axios';
import { useStore } from '@/stores/store';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// Obtener la URL base desde las variables de entorno
const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://apacg.com.py/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor para manejar errores comunes
api.interceptors.response.use(
    (response) => {
        const user = useStore.getState().user;

        // Validar si el usuario está logueado y si el array students está vacío o no existe
        /* if (user?.member && (!('students' in user.member) || !(user.member as any).students?.length)) {
            const currentPath = window.location.pathname;
            if (currentPath !== '/inscripcion-alumnos') {
                window.location.href = '/inscripcion-alumnos';
            }
        } */

        return response;
    },
    (error) => {
        // Manejar errores de autenticación (401)
        if (error.response && error.response.status === 401) {
            const protectedPaths = ['/perfil', '/pago-membresia'];

            if (protectedPaths.includes(window.location.pathname)) {
                localStorage.removeItem('auth_token');
                // window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
