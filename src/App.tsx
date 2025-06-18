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
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import PaymentPage from "./pages/PaymentPage";
import Register from "./pages/Register";
import { ChildrenManager } from "./components/ChildrenManager";
import ProtectedWithStudents from "./components/ProtectedWithStudents";
import ChildrenEnrollment from "./pages/ChildrenEnrollment";
import ProtectedRoute from "./components/ProtectedRoute";
import { useStore } from "./stores/store";
import { useEffect } from "react";
import api from "./services/api";

const queryClient = new QueryClient();

const App = () => {
  const { setIsLoading, setUser, setIsLoggedIn } = useStore();
  
  useEffect(() => {
    // Verificar si hay un token en localStorage o sessionStorage
    const checkAuth = async () => {
      try {
        // Verificar si hay un token o sesión activa
        const response = await api.get('api/user');
        if (response.data && response.data) {
          // Si hay un usuario autenticado, actualizar el store
          setUser(response.data);
          setIsLoggedIn(true);
        }
      } catch (error) {
        // Si hay un error, el usuario no está autenticado
        console.log('No hay sesión activa');
      } finally {
        // Finalmente, indicar que ya no está cargando
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
              // <ProtectedRoute>
                // <ProtectedWithStudents>
                  <Index />
                // </ProtectedWithStudents>
              // </ProtectedRoute>
          } />
          <Route path="/beneficios" element={
              // <ProtectedWithStudents>
                <Benefits />
              // {/* </ProtectedWithStudents> */}
          } />
          <Route path="/beneficio/:slug" element={
            // <ProtectedWithStudents>
              <BenefitDetail />
            // </ProtectedWithStudents>
          } />
          <Route path="/comercios" element={
            // <ProtectedWithStudents>
              <Commerces />
            // </ProtectedWithStudents>
          } />
          <Route path="/comercio/:slug" element={
            // <ProtectedWithStudents>
              <CommerceDetail />
            // </ProtectedWithStudents>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/perfil" element={
            // <ProtectedWithStudents>
              <Profile />
            // </ProtectedWithStudents>
          } />
          <Route path="/pago-membresia" element={
            // <ProtectedWithStudents>
              <PaymentPage />
            // </ProtectedWithStudents>
          } />
          {/* <Route path="/children-manager" element={<ChildrenManager />}></Route> */}
          <Route path="/inscripcion-alumnos" element={<ChildrenEnrollment />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  )

};

export default App;
