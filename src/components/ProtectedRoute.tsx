import { Navigate } from "react-router-dom";
import { useStore } from "@/stores/store";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { user, isLoading, isLoggedIn } = useStore();

  // Mientras está cargando, no hacemos nada para evitar redirecciones prematuras
  if (isLoading) {
    return null; // O puedes mostrar un spinner/loader aquí
  }

  // Si no hay usuario autenticado o no está logueado, redirigir al login
  if (!user || !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado, mostrar el contenido protegido
  return children;
};

export default ProtectedRoute;