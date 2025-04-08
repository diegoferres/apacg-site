import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

const API_URL = 'http://localhost:8000/';

// axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('auth_token')}`;

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});
