import { Navigate } from "react-router-dom";
import { useStore } from "@/stores/store";
import { useEffect, useState } from "react";
import api from "@/services/api";

interface Props {
  children: React.ReactNode;
}

const ProtectedWithStudents = ({ children }: Props) => {
  const { user, setUser } = useStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Si el usuario ya está cargado, no necesitamos esperar
    if (user) {
      setIsInitializing(false);
      return;
    }

    // api.get('api/user').then(response => {
    //   setUser(response?.data);
    //   console.log(response.data);
    //   console.log('user', user);
    // });

    // console.log('user', user);

    // Si no hay usuario después de un tiempo, consideramos que no está autenticado
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [user, setUser]);

  // Mientras estamos inicializando, mostrar el indicador de carga
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Cargando tu sesión...</p>
      </div>
    );
  }

  // Verificamos solo si el usuario existe
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificamos si el usuario tiene estudiantes registrados
  const hasStudents = user?.member?.students && user.member.students.length > 0;
  
  // Si el usuario no tiene estudiantes, redirigir a la página de inscripción
  if (!hasStudents) {
    return <Navigate to="/inscripcion-alumnos" replace />;
  }

  // Si el usuario tiene estudiantes, mostramos el contenido protegido
  return children;
};

export default ProtectedWithStudents;