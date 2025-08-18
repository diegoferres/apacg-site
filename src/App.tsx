
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BenefitDetail from "./pages/BenefitDetail";
import Benefits from "./pages/Benefits";
import Commerces from "./pages/Commerces";
import CommerceDetail from "./pages/CommerceDetail";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Login from "./pages/Login";
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

const queryClient = new QueryClient();

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
          {/* Student Data Splash Screen */}
          <StudentDataSplash 
            isOpen={showStudentSplash}
            onDataComplete={handleStudentDataComplete}
            membershipStatus={membershipStatus}
            onRefreshMembershipStatus={fetchMembershipStatus}
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
