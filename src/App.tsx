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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
              <ProtectedWithStudents>
                <Index />
              </ProtectedWithStudents>
          } />
          <Route path="/beneficios" element={
              <ProtectedWithStudents>
                <Benefits />
              </ProtectedWithStudents>
          } />
          <Route path="/beneficio/:slug" element={
            <ProtectedWithStudents>
              <BenefitDetail />
            </ProtectedWithStudents>
          } />
          <Route path="/comercios" element={
            <ProtectedWithStudents>
              <Commerces />
            </ProtectedWithStudents>
          } />
          <Route path="/comercio/:slug" element={
            <ProtectedWithStudents>
              <CommerceDetail />
            </ProtectedWithStudents>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/perfil" element={
            <ProtectedWithStudents>
              <Profile />
            </ProtectedWithStudents>
          } />
          <Route path="/pago-membresia" element={
            <ProtectedWithStudents>
              <PaymentPage />
            </ProtectedWithStudents>
          } />
          {/* <Route path="/children-manager" element={<ChildrenManager />}></Route> */}
          <Route path="/inscripcion-alumnos" element={<ChildrenEnrollment />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
