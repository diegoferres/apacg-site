import { create } from 'zustand';

// Tu interfaz sigue igual
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  setup_completed?: boolean;
  member?: {
    id: number;
    status: string;
    member_number: string;
    phone: string;
    payment_date: string;
    first_name: string;
    last_name: string;
    students?: any[]; // Añadimos la propiedad students
    image?: {
      storage_path_full: string;
    };
  };
}

interface UserStore {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean; // Añadimos estado de carga
  setUser: (userData: User | null) => void;
  logout: () => void;
  setIsLoggedIn: (status: boolean) => void;
  setIsLoading: (status: boolean) => void; // Añadimos método para actualizar estado de carga
}

export const userStore = create<UserStore>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true, // Inicialmente está cargando
  setUser: (userData) => set({ user: userData }),
  logout: () => set({ user: null, isLoggedIn: false }),
  setIsLoggedIn: (status) => set({ isLoggedIn: status }),
  setIsLoading: (status) => set({ isLoading: status }),
}));

// Hook para usar dentro de componentes
export const useStore = userStore;