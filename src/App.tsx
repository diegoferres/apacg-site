
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
  const { setIsLoading, setUser, setIsLoggedIn, user, isLoggedIn } = useStore();
  const [showStudentSplash, setShowStudentSplash] = useState(false);
  
  // Check if user needs to complete student data
  useEffect(() => {
    console.log('App.tsx - Checking student data:', { isLoggedIn, user: user?.name, member: !!user?.member, students: user?.member?.students });
    if (isLoggedIn && user && user.member) {
      const students = user.member.students || [];
      const hasStudents = students.length > 0;
      
      // Check if students have complete CI data
      const studentsWithCI = students.filter(student => student.ci && student.ci.trim() !== '');
      const allStudentsHaveCI = students.length > 0 && studentsWithCI.length === students.length;
      
      console.log('App.tsx - Students analysis:', {
        totalStudents: students.length,
        studentsWithCI: studentsWithCI.length,
        allStudentsHaveCI,
        students: students.map(s => ({ name: s.full_name, ci: s.ci }))
      });
      
      if (!hasStudents || !allStudentsHaveCI) {
        console.log('App.tsx - Showing student splash - missing students or missing CI');
        setShowStudentSplash(true);
      } else {
        console.log('App.tsx - Hiding student splash (all students have CI)');
        setShowStudentSplash(false);
      }
    } else {
      console.log('App.tsx - Hiding student splash (not logged in or no member)');
      setShowStudentSplash(false); // Close splash if not logged in
    }
  }, [isLoggedIn, user]);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('api/user');
        if (response.data && response.data) {
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
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* Student Data Splash Screen */}
        <StudentDataSplash 
          isOpen={showStudentSplash}
          onDataComplete={handleStudentDataComplete}
        />
        
        <BrowserRouter 
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
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
