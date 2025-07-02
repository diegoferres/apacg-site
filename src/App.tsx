
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
    const checkAuth = async () => {
      try {
        const response = await api.get('api/user');
        if (response.data && response.data) {
          setUser(response.data);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log('No hay sesión activa');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [setIsLoading, setUser, setIsLoggedIn]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/beneficios" element={
              /*<ProtectedWithStudents>*/
                <Benefits />
              /*</ProtectedWithStudents>*/
            } />
            <Route path="/beneficio/:slug" element={
              /*<ProtectedWithStudents>*/
                <BenefitDetail />
              /*</ProtectedWithStudents>*/
            } />
            <Route path="/comercios" element={
              /*<ProtectedWithStudents>*/
                <Commerces />
              /*</ProtectedWithStudents>*/
            } />
            <Route path="/comercio/:slug" element={
              /*<ProtectedWithStudents>*/
                <CommerceDetail />
              /*</ProtectedWithStudents>*/
            } />
            <Route path="/eventos" element={<Events />} />
            <Route path="/evento/:id" element={<EventDetail />} />
            <Route path="/rifas" element={<Raffles />} />
            <Route path="/rifa/:id" element={<RaffleDetail />} />
            <Route path="/novedades" element={<News />} />
            <Route path="/novedad/:slug" element={<NewsDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/perfil" element={
              /*<ProtectedWithStudents>*/
                <Profile />
              /*</ProtectedWithStudents>*/
            } />
            <Route path="/pago-membresia" element={
              /*<ProtectedWithStudents>*/
                <PaymentPage />
              /*</ProtectedWithStudents>*/
            } />
            <Route path="/inscripcion-alumnos" element={<ChildrenEnrollment />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
