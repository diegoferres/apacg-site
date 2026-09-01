import { useStore } from "@/stores/store";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface Props {
  children: React.ReactNode;
}

/**
 * Deja pasar a visitantes anonimos y a admins. A un socio logueado le exige tener sus alumnos
 * cargados y con cedula; si no, lo manda al inicio con un aviso.
 * Los socios externos (member_origin === 'external') no tienen hijos que cargar, asi que
 * quedan afuera de esta validacion.
 */
const ProtectedWithStudentsRequired = ({ children }: Props) => {
  const { user, isLoggedIn, isLoading } = useStore();

  // Los admins pasan por encima de todas las validaciones
  const isAdmin = user?.roles?.some((role: any) => role.name === 'admin' || role.name === 'Administrador') ?? false;

  const students = user?.member?.students ?? [];
  const faltanDatosDeAlumnos =
    !isLoading &&
    isLoggedIn &&
    !!user &&
    !isAdmin &&
    !!user.member &&
    user.member_origin !== 'external' &&
    (students.length === 0 || students.some((s: any) => !s.ci || s.ci.trim() === ''));

  // El aviso va en un efecto, no en el render: `toast` actualiza estado y llamarlo mientras se
  // renderiza disparaba un ciclo infinito ("Too many re-renders") que dejaba la pantalla en
  // blanco en vez de redirigir. El hook queda antes de cualquier return para no romper el orden.
  useEffect(() => {
    if (faltanDatosDeAlumnos) {
      toast({
        title: "Registro de estudiantes requerido",
        description: "Para acceder a esta sección, primero debes registrar a tus estudiantes.",
        variant: "default",
      });
    }
  }, [faltanDatosDeAlumnos]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Verificando permisos...</p>
      </div>
    );
  }

  if (isLoggedIn && user) {
    if (isAdmin) {
      return <>{children}</>;
    }

    // Sin datos de socio no hay nada que validar: al inicio
    if (!user.member) {
      return <Navigate to="/" replace />;
    }

    if (faltanDatosDeAlumnos) {
      return <Navigate to="/" replace />;
    }
  }

  // Invitados y socios con los alumnos completos
  return <>{children}</>;
};

export default ProtectedWithStudentsRequired;
