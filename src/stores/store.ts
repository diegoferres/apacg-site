import { create } from 'zustand';

// Tu interfaz sigue igual
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  member?: {
    id: number;
    status: string;
    member_number: string;
    phone: string;
    payment_date: string;
    first_name: string;
    last_name: string;
    image?: {
      storage_path_full: string;
    };
  };
}

interface UserStore {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (userData: User | null) => void;
  logout: () => void;
  setIsLoggedIn: (status: boolean) => void;
}

export const userStore = create<UserStore>((set) => ({
  user: null,
  isLoggedIn: false,
  setUser: (userData) => set({ user: userData }),
  logout: () => set({ user: null, isLoggedIn: false }),
  setIsLoggedIn: (status) => set({ isLoggedIn: status }),
}));

// Hook para usar dentro de componentes
export const useStore = userStore;
