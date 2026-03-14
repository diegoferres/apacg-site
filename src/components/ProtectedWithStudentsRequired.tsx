import { useStore } from "@/stores/store";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  children: React.ReactNode;
}

const ProtectedWithStudentsRequired = ({ children }: Props) => {
  const { user, isLoggedIn, isLoading } = useStore();
  const { toast } = useToast();



  // Show loading while auth is still loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Verificando permisos...</p>
      </div>
    );
  }

  // If user is logged in, check if they have students
  if (isLoggedIn && user) {
    
    // FIRST: If user is admin, allow access (admins bypass all validations)
    // Check Laravel Permissions structure: user.roles array with role objects
    const isAdmin = user.roles?.some((role: any) => role.name === 'admin' || role.name === 'Administrador');
    
    if (isAdmin) {
      return <>{children}</>;
    }
    
    // SECOND: If user doesn't have member data, redirect to home (only for non-admin users)
    if (!user.member) {
      return <Navigate to="/" replace />;
    }

    // Check if user has students with complete CI data
    const students = user.member.students || [];
    const hasStudents = students.length > 0;
    const studentsWithCI = students.filter(student => student.ci && student.ci.trim() !== '');
    const allStudentsHaveCI = students.length > 0 && studentsWithCI.length === students.length;
    
    
    if (!hasStudents || !allStudentsHaveCI) {
      
      // Show informative message to user
      toast({
        title: "Registro de estudiantes requerido",
        description: "Para acceder a esta sección, primero debes registrar a tus estudiantes.",
        variant: "default",
      });
      
      return <Navigate to="/" replace />;
    }
    
    
  }

  // If no user is logged in, allow access (guest)
  // If user has students, allow access
  return <>{children}</>;
};

export default ProtectedWithStudentsRequired;