
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
import RouteTracker from "./components/RouteTracker";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

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
      setShowStudentSplash(false);
      return;
    }
    
    // Only evaluate when we have complete user data (not loading and user exists)
    if (!isLoggedIn || !user) {
      setShowStudentSplash(false);
      return;
    }
    
    // Additional check: make sure we have complete user data including setup_completed field
    // This ensures we don't show splash prematurely after login
    // Note: setup_completed can be false, null, or undefined - only undefined means data is still loading
    if (user.setup_completed === undefined && isLoading) {
      setShowStudentSplash(false);
      return;
    }
    
    
    // If user is admin, don't show splash (admins bypass this validation)
    // Check Laravel Permissions structure: user.roles array with role objects
    const isAdmin = user.roles?.some((role: any) => role.name === 'admin' || role.name === 'Administrador');
    
    if (isAdmin) {
      setShowStudentSplash(false);
      return;
    }
    
    // If user doesn't have member data, don't show splash
    if (!user.member) {
      setShowStudentSplash(false);
      return;
    }
    
    
    const students = user.member.students || [];
    const hasStudents = students.length > 0;
    
    // Check if students have complete CI data
    const studentsWithoutCI = students.filter(student => !student.ci || student.ci.trim() === '');
    const allStudentsHaveCI = students.length > 0 && studentsWithoutCI.length === 0;
    const setupCompleted = !!user.setup_completed; // Convert to boolean (handles 1, true, etc.)
    
    
    // Verificar que tenemos los datos mínimos necesarios
    if (!isLoggedIn || !user?.member) {
      setShowStudentSplash(false);
      return;
    }
    
    if (isLoading) {
      setShowStudentSplash(false);
      return;
    }
    
    // If user has students and all have CI, we need to wait for membershipStatus before deciding
    if (hasStudents && allStudentsHaveCI && !membershipStatus) {
      // Don't change splash state yet, wait for membership status to load
      console.log('App.tsx - Waiting for membershipStatus to load before evaluation');
      return;
    }
    
    // Show splash ONLY if:
    // 1. User has students without CI (at least 1 student missing CI)
    // 2. OR all students have CI but membership is inactive (!is_active_member)
    // 3. OR all students have CI, membership is active, but setup is not completed
    const hasStudentsWithoutCI = studentsWithoutCI.length > 0;
    const needsMembershipPayment = allStudentsHaveCI && hasStudents && membershipStatus && !membershipStatus.is_active_member;
    const needsSetup = allStudentsHaveCI && (!membershipStatus || membershipStatus.is_active_member) && !setupCompleted;
    
    const shouldShowSplash = hasStudentsWithoutCI || needsMembershipPayment || needsSetup;
    
    console.log('App.tsx - Splash evaluation:', {
      user_id: user.id,
      hasStudents,
      studentsWithoutCI: studentsWithoutCI.length,
      allStudentsHaveCI,
      setupCompleted,
      membershipActive: membershipStatus?.is_active_member,
      membershipStatusLoaded: !!membershipStatus,
      shouldShowSplash,
      hasStudentsWithoutCI,
      needsMembershipPayment,
      needsSetup
    });
    
    setShowStudentSplash(shouldShowSplash);
  }, [isLoggedIn, user, isLoading, membershipStatus]);
  
  
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
          setUser(response.data);
          setIsLoggedIn(true);
          
          // If user is a member with students, automatically load membership status
          if (response.data.member?.students?.length > 0) {
            try {
              const membershipStatusResponse = await fetchMembershipStatus();
              // membershipStatus state is already updated by fetchMembershipStatus
            } catch (error) {
              console.error('Error loading membership status during auth check:', error);
              // Continue anyway, membership status will be loaded later if needed
            }
          }
        }
      } catch (error: any) {
        // No registrar error 401 (Unauthorized) ya que simplemente significa que no hay sesión activa
        if (error.response?.status !== 401) {
          console.log('Error verificando autenticación:', error);
        }
        // Para cualquier error (incluyendo 401), simplemente no hay sesión activa
        setIsLoggedIn(false);
        setUser(null);
        setMembershipStatus(null);
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
          {/* Scroll to Top on Route Change */}
          <ScrollToTop />
          
          {/* Route Tracker para Google Analytics */}
          <RouteTracker 
            userType={user?.member ? 'member' : 'guest'}
          />
          
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
