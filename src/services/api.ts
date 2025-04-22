
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

const API_URL = 'https://apacg.com.py/';

// axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('auth_token')}`;

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor para manejar tokens de autenticación
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('auth_token');
//         if (token) {
//             config.headers['Authorization'] = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// Interceptor para manejar errores comunes
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Manejar errores de autenticación (401)
            if (error.response && error.response.status === 401) {
            const protectedPaths = ['/perfil', '/pago-membresia'];
        
            if (protectedPaths.includes(window.location.pathname)) {
                localStorage.removeItem('auth_token');
                // Si estamos en una página protegida, redirigir a login
                // if (window.location.pathname !== '/login') {
                //     window.location.href = '/login';
                // }
            }
            return Promise.reject(error);
        }
    }
);

export default api;
