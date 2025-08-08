// Utilidades de testing para simular diferentes estados de usuario
import { useStore } from '@/stores/store';

export const forceUserWithoutStudents = () => {
  const { user, setUser } = useStore.getState();
  
  if (user && user.member) {
    const modifiedUser = {
      ...user,
      member: {
        ...user.member,
        students: [] // Forzar array vacío
      }
    };
    
    console.log('TEST: Forcing user without students:', modifiedUser);
    setUser(modifiedUser);
  }
};

export const restoreOriginalUser = async () => {
  // Re-fetch user data from API to restore original state
  const api = (await import('@/services/api')).default;
  
  try {
    const response = await api.get('api/user');
    if (response.data) {
      const { setUser } = useStore.getState();
      setUser(response.data);
      console.log('TEST: Restored original user data');
    }
  } catch (error) {
    console.error('TEST: Error restoring user data:', error);
  }
};

// Hacer las funciones disponibles globalmente para testing
if (typeof window !== 'undefined') {
  (window as any).testUtils = {
    forceUserWithoutStudents,
    restoreOriginalUser
  };
}