
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import BenefitDetail from "./pages/BenefitDetail";
import Benefits from "./pages/Benefits";
import Commerces from "./pages/Commerces";
import CommerceDetail from "./pages/CommerceDetail";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import PaymentPage from "./pages/PaymentPage";
import Register from "./pages/Register";
import Raffles from "./pages/Raffles";
import RaffleDetail from "./pages/RaffleDetail";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";

import { ChildrenManager } from "./components/ChildrenManager";
import ProtectedWithStudents from "./components/ProtectedWithStudents";
import ChildrenEnrollment from "./pages/ChildrenEnrollment";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDataSplash from "./components/StudentDataSplash";
import ProtectedWithStudentsRequired from "./components/ProtectedWithStudentsRequired";
import { useStore } from "./stores/store";
import { useEffect, useState } from "react";
import api from "./services/api";
import analytics from "./services/analytics";

const queryClient = new QueryClient();

// Componente para rastrear cambios de ruta
const RouteTracker = () => {
  const location = useLocation();
  const { user } = useStore();

  useEffect(() => {
    // Rastrear página vista cada vez que cambia la ruta
    const pagePath = location.pathname + location.search;
    analytics.trackPageView(pagePath);
    
    // Si hay usuario logueado, configurar propiedades
    if (user) {
      analytics.setUserId(user.id);
      analytics.setUserProperties({
        user_type: user.member ? 'member' : 'guest',
        membership_status: user.member?.status,
        students_count: user.member?.students?.length || 0,
      });
    }
  }, [location, user]);

  return null;
};

// Componente para manejar StudentDataSplash con acceso a location
const StudentDataSplashController = ({ showStudentSplash, handleStudentDataComplete, membershipStatus, fetchMembershipStatus }) => {
  const location = useLocation();
  
  // Rutas donde NO debe aparecer el splash automáticamente
  const excludedPaths = ['/pago'];
  
  // Determinar si debemos mostrar el splash basado en la ubicación
  const shouldShowBasedOnLocation = !excludedPaths.includes(location.pathname);
  
  return (
    <StudentDataSplash 
      isOpen={showStudentSplash && shouldShowBasedOnLocation}
      onDataComplete={handleStudentDataComplete}
      membershipStatus={membershipStatus}
      onRefreshMembershipStatus={fetchMembershipStatus}
    />
  );
};

const App = () => {
  const { setIsLoading, setUser, setIsLoggedIn, user, isLoggedIn, isLoading } = useStore();
  const [showStudentSplash, setShowStudentSplash] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState(null);
  
  // Function to fetch membership status
  const fetchMembershipStatus = async () => {
    try {
      const statusResponse = await api.get('api/client/members/check-membership-status');
      setMembershipStatus(statusResponse.data);
      return statusResponse.data;
    } catch (error) {
      console.error('Error fetching membership status:', error);
      return null;
    }
  };
  
  // Check if user needs to complete student data or setup
  useEffect(() => {
    // Don't show splash while still loading user data
    if (isLoading) {
      console.log('App.tsx - Still loading user data, not showing splash');
      setShowStudentSplash(false);
      return;
    }
    
    // Only evaluate when we have complete user data (not loading and user exists)
    if (!isLoggedIn || !user) {
      console.log('App.tsx - Not logged in or no user data, hiding splash');
      setShowStudentSplash(false);
      return;
    }
    
    // Additional check: make sure we have complete user data including setup_completed field
    // This ensures we don't show splash prematurely after login
    if (user.setup_completed === undefined) {
      console.log('App.tsx - User data incomplete (missing setup_completed), not showing splash yet');
      setShowStudentSplash(false);
      return;
    }
    
    // Debug: Log full user structure to understand role data
    console.log('App.tsx - Full user data for role check:', {
      name: user.name,
      role: user.role,
      roles: user.roles,
      member: !!user.member,
      fullUser: user
    });
    
    // If user is admin, don't show splash (admins bypass this validation)
    // Check Laravel Permissions structure: user.roles array with role objects
    const isAdmin = user.roles?.some((role: any) => role.name === 'admin' || role.name === 'Administrador');
    console.log('App.tsx - Admin check:', { isAdmin, roles: user.roles });
    
    if (isAdmin) {
      console.log('App.tsx - User is admin, hiding splash');
      setShowStudentSplash(false);
      return;
    }
    
    // If user doesn't have member data, don't show splash
    if (!user.member) {
      console.log('App.tsx - User has no member data, hiding splash');
      setShowStudentSplash(false);
      return;
    }
    
    console.log('App.tsx - Checking student data and setup:', { 
      isLoggedIn, 
      user: user?.name, 
      role: user?.role,
      roles: user?.roles,
      member: !!user?.member, 
      students: user?.member?.students,
      setupCompleted: user?.setup_completed,
      isLoading 
    });
    
    const students = user.member.students || [];
    const hasStudents = students.length > 0;
    
    // Check if students have complete CI data
    const studentsWithoutCI = students.filter(student => !student.ci || student.ci.trim() === '');
    const allStudentsHaveCI = students.length > 0 && studentsWithoutCI.length === 0;
    const setupCompleted = !!user.setup_completed; // Convert to boolean (handles 1, true, etc.)
    
    console.log('App.tsx - Analysis:', {
      totalStudents: students.length,
      studentsWithoutCI: studentsWithoutCI.length,
      allStudentsHaveCI,
      setupCompleted,
      students: students.map(s => ({ name: s.full_name, ci: s.ci }))
    });
    
    // Check membership status asynchronously
    const checkAndShowSplash = async () => {
      // Debug logging
      console.log('App.tsx - checkAndShowSplash called:', {
        isLoggedIn,
        user: user?.name,
        member: !!user?.member,
        students: user?.member?.students?.length || 0,
        isLoading,
        membershipStatus: !!membershipStatus
      });
      
      // Verificar que tenemos los datos mínimos necesarios
      if (!isLoggedIn || !user?.member) {
        console.log('App.tsx - No user or member, skipping splash check');
        return;
      }
      
      if (isLoading) {
        console.log('App.tsx - Still loading, skipping splash check');
        return;
      }
      
      let currentMembershipStatus = membershipStatus;
      
      // If we don't have membership status yet, fetch it
      if (!currentMembershipStatus && hasStudents) {
        currentMembershipStatus = await fetchMembershipStatus();
      }
      
      // Show splash ONLY if:
      // 1. User has students without CI (at least 1 student missing CI)
      // 2. OR all students have CI but membership is inactive (!is_active_member)
      // 3. OR all students have CI, membership is active, but setup is not completed
      const hasStudentsWithoutCI = studentsWithoutCI.length > 0;
      const needsMembershipPayment = allStudentsHaveCI && hasStudents && currentMembershipStatus && !currentMembershipStatus.is_active_member;
      const needsSetup = allStudentsHaveCI && (!currentMembershipStatus || currentMembershipStatus.is_active_member) && !setupCompleted;
      
      const shouldShowSplash = hasStudentsWithoutCI || needsMembershipPayment || needsSetup;
      
      console.log('App.tsx - Decision:', {
        hasStudentsWithoutCI,
        needsMembershipPayment,
        needsSetup,
        shouldShowSplash,
        membershipActive: currentMembershipStatus?.is_active_member,
        membershipReason: currentMembershipStatus?.reason
      });
      
      if (shouldShowSplash) {
        console.log('App.tsx - Showing splash -', { hasStudentsWithoutCI, needsMembershipPayment, needsSetup });
        setShowStudentSplash(true);
      } else {
        console.log('App.tsx - Hiding splash (everything complete)');
        setShowStudentSplash(false);
      }
    };
    
    checkAndShowSplash();
  }, [isLoggedIn, user, isLoading, membershipStatus]);
  
  // Effect específico para post-login con delay para asegurar carga completa
  useEffect(() => {
    if (!isLoggedIn || !user?.member) return;
    
    // Delay específico después del login para asegurar que los datos estén cargados
    const timer = setTimeout(async () => {
      console.log('App.tsx - Post-login splash check with delay');
      if (!showStudentSplash) { // Solo si no se está mostrando ya
        // Recrear la lógica de checkAndShowSplash aquí para tener acceso al scope
        const students = user.member.students || [];
        const studentsWithoutCI = students.filter(student => !student.ci || student.ci.trim() === '');
        const hasStudentsWithoutCI = studentsWithoutCI.length > 0;
        const setupCompleted = !!user.setup_completed;
        
        // Verificar membresía si hay estudiantes
        let needsMembershipPayment = false;
        if (students.length > 0 && studentsWithoutCI.length === 0) {
          try {
            const statusResponse = await fetchMembershipStatus();
            needsMembershipPayment = !statusResponse?.is_active_member;
          } catch (error) {
            console.log('App.tsx - Error checking membership in delayed effect:', error);
          }
        }
        
        const shouldShowSplash = hasStudentsWithoutCI || needsMembershipPayment || (!setupCompleted && students.length > 0);
        
        console.log('App.tsx - Post-login delayed decision:', {
          hasStudentsWithoutCI,
          needsMembershipPayment,
          needsSetup: !setupCompleted,
          shouldShowSplash,
          totalStudents: students.length
        });
        
        if (shouldShowSplash) {
          setShowStudentSplash(true);
        }
      }
    }, 1000); // 1 segundo de delay
    
    return () => clearTimeout(timer);
  }, [isLoggedIn]);
  
  // Inicializar Google Analytics al cargar la app
  useEffect(() => {
    analytics.initialize();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use the client user endpoint that loads member, students and setup_completed
        const response = await api.get('api/user');
        if (response.data) {
          console.log('App.tsx - User loaded:', response.data);
          console.log('App.tsx - User roles:', response.data.roles);
          console.log('App.tsx - User roles type:', typeof response.data.roles);
          console.log('App.tsx - User roles length:', response.data.roles?.length);
          setUser(response.data);
          setIsLoggedIn(true);
        }
      } catch (error: any) {
        // No registrar error 401 (Unauthorized) ya que simplemente significa que no hay sesión activa
        if (error.response?.status !== 401) {
          console.log('Error verificando autenticación:', error);
        }
        // Para cualquier error (incluyendo 401), simplemente no hay sesión activa
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [setIsLoading, setUser, setIsLoggedIn]);

  const handleStudentDataComplete = () => {
    setShowStudentSplash(false);
    // Reset membership status to trigger a refresh on next evaluation
    setMembershipStatus(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        <BrowserRouter 
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          {/* Route Tracker para Google Analytics */}
          <RouteTracker />
          
          {/* Student Data Splash Controller con acceso a location */}
          <StudentDataSplashController 
            showStudentSplash={showStudentSplash}
            handleStudentDataComplete={handleStudentDataComplete}
            membershipStatus={membershipStatus}
            fetchMembershipStatus={fetchMembershipStatus}
          />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/beneficios" element={
              <ProtectedWithStudentsRequired>
                <Benefits />
              </ProtectedWithStudentsRequired>
            } />
            <Route path="/beneficio/:slug" element={
              <ProtectedWithStudentsRequired>
                <BenefitDetail />
              </ProtectedWithStudentsRequired>
            } />
            <Route path="/comercios" element={
              <ProtectedWithStudentsRequired>
                <Commerces />
              </ProtectedWithStudentsRequired>
            } />
            <Route path="/comercio/:slug" element={
              <ProtectedWithStudentsRequired>
                <CommerceDetail />
              </ProtectedWithStudentsRequired>
            } />
            <Route path="/eventos" element={<Events />} />
            <Route path="/evento/:slug" element={<EventDetail />} />
            <Route path="/rifas" element={
              <ProtectedWithStudentsRequired>
                <Raffles />
              </ProtectedWithStudentsRequired>
            } />
            <Route path="/rifa/:slug" element={
              <ProtectedWithStudentsRequired>
                <RaffleDetail />
              </ProtectedWithStudentsRequired>
            } />
            <Route path="/cursos" element={
              <ProtectedWithStudentsRequired>
                <Courses />
              </ProtectedWithStudentsRequired>
            } />
            <Route path="/curso/:slug" element={
              <ProtectedWithStudentsRequired>
                <CourseDetail />
              </ProtectedWithStudentsRequired>
            } />
            <Route path="/novedades" element={<News />} />
            <Route path="/novedad/:slug" element={<NewsDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/perfil" element={
              <ProtectedRoute>
                <ProtectedWithStudentsRequired>
                  <Profile />
                </ProtectedWithStudentsRequired>
              </ProtectedRoute>
            } />
            <Route path="/pago-membresia" element={
              <ProtectedRoute>
                <ProtectedWithStudentsRequired>
                  <PaymentPage />
                </ProtectedWithStudentsRequired>
              </ProtectedRoute>
            } />
            <Route path="/inscripcion-alumnos" element={<ChildrenEnrollment />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pago" element={<Payment />} />
            <Route path="/pago-exitoso" element={<PaymentSuccess />} />
                <Route path="/checkout/confirm/:paymentId" element={<PaymentConfirmation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
