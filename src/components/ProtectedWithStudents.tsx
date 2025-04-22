import { Navigate } from "react-router-dom";
import { useStore } from "@/stores/store";

interface Props {
  children: JSX.Element;
}

const ProtectedWithStudents = ({ children }: Props) => {
  const { user } = useStore();

  const hasStudents = user?.member?.students?.length > 0;

  // Si no tiene alumnos y no está en /inscripcion-alumnos, redirige
  if (user && user.member && !hasStudents) {
    return <Navigate to="/inscripcion-alumnos" replace />;
  }

  return children;
};

export default ProtectedWithStudents;
