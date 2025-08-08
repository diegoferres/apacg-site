import { useStore } from "@/stores/store";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface Props {
  children: React.ReactNode;
}

const ProtectedWithStudentsRequired = ({ children }: Props) => {
  const { user, isLoggedIn, isLoading } = useStore();

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
    // If user doesn't have member data, redirect to home
    if (!user.member) {
      console.log('ProtectedWithStudentsRequired - User has no member data, redirecting');
      return <Navigate to="/" replace />;
    }

    // Check if user has students with complete CI data
    const students = user.member.students || [];
    const hasStudents = students.length > 0;
    const studentsWithCI = students.filter(student => student.ci && student.ci.trim() !== '');
    const allStudentsHaveCI = students.length > 0 && studentsWithCI.length === students.length;
    
    console.log('ProtectedWithStudentsRequired - User:', user.name, 'Students analysis:', {
      totalStudents: students.length,
      studentsWithCI: studentsWithCI.length,
      allStudentsHaveCI,
      students: students.map(s => ({ name: s.full_name, ci: s.ci }))
    });
    
    if (!hasStudents || !allStudentsHaveCI) {
      console.log('ProtectedWithStudentsRequired - Redirecting to home - missing students or missing CI');
      return <Navigate to="/" replace />;
    }
    
    console.log('ProtectedWithStudentsRequired - User has students with CI, allowing access');
  }

  // If no user is logged in, allow access (guest)
  // If user has students, allow access
  return <>{children}</>;
};

export default ProtectedWithStudentsRequired;