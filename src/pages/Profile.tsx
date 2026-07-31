import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QrCode, LogOut, User, CreditCard, Gift, Edit, Mail, Phone, Calendar, CheckCircle, XCircle, Receipt, ExternalLink, Ticket, Users, Copy, MapPin, Store, Tag, GraduationCap, Clock, Download } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, formatDate, toNumber } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStore } from "@/stores/store";
import { FaUserAlt } from 'react-icons/fa';
import api from "@/services/api";
import { ChildrenManager, calculatePaymentStats } from "@/components/ChildrenManager";
import StudentDataSplash from "@/components/StudentDataSplash";
import { useTour } from '@/hooks/useTour';
import { profileTourSteps } from '@/config/tours';
import TourHelpButton from '@/components/TourHelpButton';
import analytics from '@/services/analytics';

const Profile = () => {
  const { startTour } = useTour({
    tourId: 'profile',
    steps: profileTourSteps,
    autoStart: true,
    delay: 1500,
  });

  const [activeTab, setActiveTab] = useState("membership");
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const user = useStore((state) => state.user);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const setUser = useStore((state) => state.setUser);
  const [payments, setPayments] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [currentBenefitsPage, setCurrentBenefitsPage] = useState(1);
  const [totalBenefitsPages, setTotalBenefitsPages] = useState(1);
  const [raffles, setRaffles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const [totalOrdersPages, setTotalOrdersPages] = useState(1);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [referralInfo, setReferralInfo] = useState<{
    referrer_code: string | null;
    motivo: string | null;
    ventas: Array<{ orden: string; fecha: string; rifa: string; numeros: number; por_numero: number; acumulado: number }>;
    total_numeros: number;
    total_acumulado: number;
    hijos: any[];
  } | null>(null);
  const [qrExpanded, setQrExpanded] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPaymentYears, setSelectedPaymentYears] = useState<number[]>([]);
  const [studentsWithEnrollments, setStudentsWithEnrollments] = useState([]);
  const [showStudentSplash, setShowStudentSplash] = useState(false);

  const isPending = user?.member?.status === "En Mora";

  // Validate password match in real time
  useEffect(() => {
    if (password || passwordConfirmation) {
      setPasswordsMatch(password === passwordConfirmation);
    } else {
      setPasswordsMatch(true); // Both empty is OK
    }
  }, [password, passwordConfirmation]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    // Track visualización de perfil
    analytics.trackEvent('view_profile', {
      user_type: user?.member ? 'member' : 'guest',
      membership_status: user?.member?.status
    });
  }, [isLoggedIn, navigate, user]);

  // Handle payment success/error parameters
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    const paymentError = searchParams.get('payment_error');
    const paymentId = searchParams.get('payment_id');
    const errorMessage = searchParams.get('message');
    
    if (paymentSuccess === 'membership') {
      // Show success toast with improved message
      toast({
        title: "✅ ¡Pago Exitoso!",
        description: "Las anualidades han sido pagadas correctamente. Su membresía está ahora activa. Los cambios se reflejarán en breve.",
        variant: "default",
        duration: 5000,
      });
      
      // Clean URL parameters to avoid showing the message on refresh
      setSearchParams({});
      
      // Set active tab to membership to show the updated status
      setActiveTab("membership");
      
      // Refresh membership status after a short delay
      setTimeout(async () => {
        try {
          // Fetch updated membership status
          const statusResponse = await api.get('api/client/members/check-membership-status');
          setMembershipStatus(statusResponse.data);
          // Pre-seleccionar todos los años pendientes
          const years = new Set<number>();
          statusResponse.data?.student_payment_status?.forEach((s: any) => {
            s.unpaid_years?.forEach((y: number) => years.add(y));
          });
          if (years.size > 0) setSelectedPaymentYears(Array.from(years).sort());
          
          // Fetch updated payments
          if (user?.id) {
            const paymentsResponse = await api.get(`api/client/memberships/${user.id}`);
            setPayments(paymentsResponse.data.data.data || []);
          }
        } catch (error) {
          console.error('Error refreshing membership data:', error);
        }
      }, 1500);
    } else if (paymentError === 'membership') {
      // Get additional Bancard parameters if available
      const responseCode = searchParams.get('response_code');
      const response = searchParams.get('response');
      
      // Build the error message
      let finalErrorMessage = errorMessage ? decodeURIComponent(errorMessage) : "No se pudo procesar el pago de las anualidades.";
      
      // Add response code info if available (helps identify specific Bancard errors)
      if (responseCode && responseCode !== '00') {
        // Common Bancard error codes
        const errorCodes: { [key: string]: string } = {
          '51': 'Fondos insuficientes',
          '54': 'Tarjeta vencida',
          '61': 'Límite de monto excedido',
          '65': 'Límite de transacciones excedido',
          '91': 'Procesador no disponible',
          '96': 'Error del sistema'
        };
        
        if (errorCodes[responseCode]) {
          finalErrorMessage = `${finalErrorMessage} (${errorCodes[responseCode]})`;
        } else if (responseCode) {
          finalErrorMessage = `${finalErrorMessage} (Código: ${responseCode})`;
        }
      }
      
      // Show error toast for failed membership payment
      toast({
        title: "❌ Error en el Pago",
        description: `${finalErrorMessage} Por favor, intente nuevamente.`,
        variant: "destructive",
        duration: 8000,
      });
      
      // Clean URL parameters
      setSearchParams({});
      
      // Set active tab to membership
      setActiveTab("membership");
    }
  }, [searchParams, setSearchParams, user?.id]);

  // Función para cargar órdenes con paginación
  const loadOrders = async (page = 1) => {
    try {
      const ordersResponse = await api.get(`api/client/profile/orders?page=${page}`);
      if (ordersResponse.data.success) {
        const ordersData = ordersResponse.data.data;
        setOrders(ordersData.data || []);
        setCurrentOrdersPage(ordersData.current_page || 1);
        setTotalOrdersPages(ordersData.last_page || 1);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const downloadTicketsPdf = async (orderId: number, orderNumber: string) => {
    try {
      const response = await api.get(`api/client/profile/orders/${orderId}/tickets-pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `entradas-apacg-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando entradas:', error);
    }
  };

  // Función para cargar beneficios con paginación
  const loadBenefits = async (page = 1) => {
    try {
      const benefitsResponse = await api.get(`api/client/benefits/member/${user.member.id}?page=${page}`);
      if (benefitsResponse.data.success) {
        const benefitsData = benefitsResponse.data.data;
        setBenefits(benefitsData.data || []);
        setCurrentBenefitsPage(benefitsData.current_page || 1);
        setTotalBenefitsPages(benefitsData.last_page || 1);
      }
    } catch (error) {
      console.error('Error loading benefits:', error);
    }
  };

  // Manejar cambio de página de órdenes
  const handleOrdersPageChange = (page) => {
    loadOrders(page);
  };

  // Manejar cambio de página de beneficios
  const handleBenefitsPageChange = (page) => {
    loadBenefits(page);
  };

  // Fetch user data when component mounts (only if logged in)
  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('api/user');
        setUser(response.data);
        
        // Set form values from response
        setEmail(response.data.email);
        setPhone(response.data.member?.phone || "");
        // Combinar first_name y last_name del member o usar el name del usuario
        const fullName = response.data.member?.first_name && response.data.member?.last_name 
          ? `${response.data.member.first_name} ${response.data.member.last_name}`.trim()
          : response.data.name || "";
        setName(fullName);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [setUser, isLoggedIn]);

  // Fetch students with enrollments for payment stats
  useEffect(() => {
    if (!isLoggedIn || !user?.member?.id) return;

    const fetchStudentsWithEnrollments = async () => {
      try {
        const response = await api.get('/api/client/students?include=course_enrollments');
        if (response.data && response.data.data) {
          setStudentsWithEnrollments(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching students with enrollments:', error);
        setStudentsWithEnrollments([]);
      }
    };

    fetchStudentsWithEnrollments();
  }, [isLoggedIn, user?.member?.id]);

  // Fetch additional data only for authenticated users
  useEffect(() => {
    if (!isLoggedIn || !user?.member?.id) return;
    
    const fetchRaffles = async () => {
      try {
        const response = await api.get('api/client/profile/raffles');
        if (response.data.success) {
          setRaffles(response.data.data.map(raffle => ({
            id: raffle.id,
            title: raffle.title,
            slug: raffle.slug,
            draw_date: raffle.draw_date_formatted ?? raffle.draw_date,
            location: null, // No hay campo de ubicación en el modelo actual
            // price viene ya formateado del backend ("10.000"); parseFloat lo leería como 10
            // por el punto. price_raw es el número real.
            price: raffle.price_raw ?? raffle.price
          })));
        }
      } catch (error) {
        console.error('Error fetching raffles:', error);
        // Si hay error, mostrar array vacío en lugar de datos mock
        setRaffles([]);
      }
    };

    const fetchReferralInfo = async () => {
      try {
        const response = await api.get('api/client/profile/referral');
        if (response.data.success) {
          setReferralInfo(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching referral info:', error);
        setReferralInfo(null);
      }
    };

    const fetchData = async () => {
      try {
        if (user.id) {
          const paymentsResponse = await api.get(`api/client/memberships/${user.id}`);
          setPayments(paymentsResponse.data.data.data || []);
        }
        
        // Fetch membership status
        try {
          const statusResponse = await api.get('api/client/members/check-membership-status');
          setMembershipStatus(statusResponse.data);
          // Pre-seleccionar todos los años pendientes
          const years = new Set<number>();
          statusResponse.data?.student_payment_status?.forEach((s: any) => {
            s.unpaid_years?.forEach((y: number) => years.add(y));
          });
          if (years.size > 0) setSelectedPaymentYears(Array.from(years).sort());
        } catch (error) {
          console.error('Error fetching membership status:', error);
        }
        
        await loadBenefits(1); // Cargar primera página de beneficios
        await loadOrders(1); // Cargar primera página de órdenes
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchRaffles();
    fetchReferralInfo();
    fetchData();
  }, [user?.id, user?.member?.id, isLoggedIn]);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      setUser(null);
      localStorage.removeItem('user');
      navigate("/login");
    } catch (error) {
      console.error('Error en el logout:', error);
    }
  };

  const handlePayMembership = async () => {
    setIsProcessingPayment(true);

    try {
      const yearsToPayFor = selectedPaymentYears.length > 0
        ? selectedPaymentYears
        : null;

      // Recopilar student_ids que deben alguno de los años seleccionados
      let unpaidStudents: number[] = [];

      if (membershipStatus?.student_payment_status && yearsToPayFor) {
        const studentSet = new Set<number>();
        membershipStatus.student_payment_status.forEach((student: any) => {
          if (student.unpaid_years?.some((y: number) => yearsToPayFor.includes(y))) {
            studentSet.add(student.student_id);
          }
        });
        unpaidStudents = Array.from(studentSet);
      } else if (membershipStatus?.student_payment_status) {
        unpaidStudents = membershipStatus.student_payment_status
          .filter((student: any) => !student.current_year_paid)
          .map((student: any) => student.student_id);
      } else if (user?.member?.students && user.member.students.length > 0) {
        unpaidStudents = user.member.students.map((student: any) => student.id);
      }

      if (unpaidStudents.length === 0) {
        toast({
          title: "No hay pagos pendientes",
          description: "Todos los estudiantes tienen sus anualidades al día.",
          variant: "default",
        });
        return;
      }

      // Crear orden de pago de membresía
      const orderResponse = await api.post('/api/client/sales/create-membership-order', {
        student_ids: unpaidStudents,
        annual_payment_amount: 60000,
        payment_years: yearsToPayFor || [new Date().getFullYear()],
      });

      if (orderResponse.data.success) {
        const { checkout_data, total_amount, student_count, order_number } = orderResponse.data.data;
        
        // Preparar datos para la página de pago
        // Construir detalle por estudiante-año para el resumen de pago
        const paymentItems: any[] = [];
        const paidYears = yearsToPayFor || [new Date().getFullYear()];
        membershipStatus?.student_payment_status?.forEach((student: any) => {
          paidYears.forEach((year: number) => {
            if (student.unpaid_years?.includes(year)) {
              paymentItems.push({
                student_id: student.student_id,
                student_name: student.student_name,
                payment_year: year,
              });
            }
          });
        });

        const paymentData = {
          type: 'membership',
          totalAmount: total_amount,
          studentCount: student_count,
          orderNumber: order_number,
          membershipStatus: membershipStatus,
          paymentYears: paidYears,
          paymentItems: paymentItems,
          unpaidStudents: paymentItems,
          customerData: {
            name: user?.member?.first_name + ' ' + user?.member?.last_name || user?.name,
            email: user?.email,
            phone: user?.member?.phone || '',
            cedula: user?.member?.document_number || ''
          }
        };

        // Guardar datos en localStorage y navegar a payment
        localStorage.setItem('payment_data', JSON.stringify({
          ...paymentData,
          checkout_data
        }));
        
        navigate('/pago');
      } else {
        throw new Error(orderResponse.data.message || 'Error creando orden de pago');
      }

    } catch (error) {
      console.error('Error creating membership payment:', error);
      toast({
        title: "Error",
        description: "Hubo un problema creando la orden de pago. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!user?.member?.id) {
      console.error('Cannot update profile: member ID not available');
      return;
    }

    // Validate password fields if provided
    if (password && password !== passwordConfirmation) {
      toast({
        title: "Error de validación",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }

    if (password && password.length < 6) {
      toast({
        title: "Error de validación",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (password) {
        // If password is provided, update everything through credentials endpoint
        const credentialsResponse = await api.post('/api/client/profile/update-credentials', {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation
        });
        
        // Also update member data 
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const memberResponse = await api.put(`/api/client/members/${user.member.id}`, {
          name,
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          avatar: null
        });
        
        toast({
          title: "Perfil y credenciales actualizados",
          description: "Tu perfil y contraseña se han actualizado correctamente.",
          variant: "default",
        });
      } else {
        // If no password, just update member data
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const memberResponse = await api.put(`/api/client/members/${user.member.id}`, {
          name,
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          avatar: null
        });
        
        toast({
          title: "Perfil actualizado",
          description: "Tu perfil se ha actualizado correctamente.",
          variant: "default",
        });
      }
      
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setUser({
        ...user,
        name,
        email,
        member: {
          ...user.member,
          first_name: firstName,
          last_name: lastName,
          phone
        }
      });
      
      // Clear password fields after successful update
      setPassword("");
      setPasswordConfirmation("");
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error al actualizar",
        description: error.response?.data?.message || "Ocurrió un error al actualizar el perfil.",
        variant: "destructive",
      });
    }
  };

  // Link de referido del SOCIO (no por hijo): un único código sirve para
  // cualquier rifa activa, solo cambia el slug de destino.
  const copyReferralLink = (raffle: { slug: string; title: string }) => {
    const code = referralInfo?.referrer_code;

    if (!code) {
      toast({
        title: "Sin link de referido disponible",
        description: referralInfo?.motivo || "No se encontró un código de referido para tu cuenta.",
        variant: "destructive",
      });
      return;
    }

    if (!raffle?.slug) {
      toast({
        title: "Error",
        description: "No se puede generar el link: información de rifa incompleta",
        variant: "destructive",
      });
      return;
    }

    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}/rifa/${raffle.slug}?ref=${code}`;

    navigator.clipboard.writeText(referralLink).then(() => {
      toast({
        title: "Link copiado",
        description: `Link de referido para "${raffle.title || 'la rifa'}" copiado al portapapeles`,
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "No se pudo copiar el link al portapapeles",
        variant: "destructive",
      });
    });
  };

  // Calcular estadísticas de pagos de cursos
  const coursePaymentStats = calculatePaymentStats(studentsWithEnrollments);
  const totalPendingPayments = coursePaymentStats.overdue + coursePaymentStats.upcoming;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-24 pb-12 flex justify-center items-center">
          <p>Cargando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Don't render anything if not logged in (will redirect)
  if (!isLoggedIn) {
    return null;
  }

  // Vista para usuarios autenticados
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Perfil</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
          <TourHelpButton onClick={startTour} label="Ver tutorial del perfil" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="mb-6" data-tour="profile-card">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    {user?.avatar ? (
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                    ) : (
                      <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  {user?.name || name}
                  {user?.member?.status === "Activo" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </CardTitle>
                <div className="text-sm text-muted-foreground text-center">
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    <span>{email || user?.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Phone className="h-4 w-4" />
                    <span>{phone || user?.member?.phone}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col items-center">
                {/* El QR es el carnet que el socio muestra en la puerta. A 128px y con el brillo
                    del celular al mínimo cuesta que lo lean, así que se puede tocar para verlo
                    a pantalla completa. */}
                <button
                  type="button"
                  onClick={() => setQrExpanded(true)}
                  className="mb-2 p-2 bg-white rounded-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="Ampliar código QR del carnet"
                >
                  <img
                    src={user?.member?.qr_code_base64 || user?.member?.image?.storage_path_full}
                    alt="Código QR del carnet de socio"
                    className="h-32 w-32"
                  />
                </button>
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                  <QrCode className="h-3 w-3" />
                  Tocá el código para ampliarlo
                </p>
                <p className="text-sm font-medium mb-4">CI: {user?.member?.document_number || user?.member?.member_number}</p>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </CardContent>
            </Card>

            {/* QR ampliado. Fondo blanco sólido y el código lo más grande que entre: se escanea
                desde el celular de otra persona, muchas veces con poca luz. */}
            <Dialog open={qrExpanded} onOpenChange={setQrExpanded}>
              <DialogContent className="sm:max-w-md bg-white p-6">
                <DialogTitle className="text-center text-lg">
                  {user?.name || name}
                </DialogTitle>
                <DialogDescription className="text-center -mt-1">
                  Carnet de socio · CI {user?.member?.document_number || user?.member?.member_number}
                </DialogDescription>
                <div className="flex justify-center py-2">
                  <img
                    src={user?.member?.qr_code_base64 || user?.member?.image?.storage_path_full}
                    alt="Código QR del carnet de socio, ampliado"
                    className="w-full max-w-[19rem] aspect-square object-contain"
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Mostrá este código para identificarte como socio.
                </p>
              </DialogContent>
            </Dialog>


            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  <Button 
                    variant={activeTab === "membership" ? "default" : "ghost"} 
                    className="w-full justify-start rounded-none h-12"
                    onClick={() => setActiveTab("membership")}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Ver Membresía
                  </Button>
                  <Button 
                    variant={activeTab === "benefits" ? "default" : "ghost"} 
                    className="w-full justify-start rounded-none h-12"
                    onClick={() => setActiveTab("benefits")}
                  >
                    <Gift className="mr-2 h-5 w-5" />
                    Beneficios Reclamados
                  </Button>
                  <Button 
                    variant={activeTab === "edit" ? "default" : "ghost"} 
                    className="w-full justify-start rounded-none h-12"
                    onClick={() => setActiveTab("edit")}
                  >
                    <Edit className="mr-2 h-5 w-5" />
                    Editar Perfil
                  </Button>
                  <Button 
                    variant={activeTab === "raffles" ? "default" : "ghost"} 
                    className="w-full justify-start rounded-none h-12"
                    onClick={() => setActiveTab("raffles")}
                  >
                    <Ticket className="mr-2 h-5 w-5" />
                    Rifas
                  </Button>
                  <Button 
                    variant={activeTab === "orders" ? "default" : "ghost"} 
                    className="w-full justify-start rounded-none h-12"
                    onClick={() => setActiveTab("orders")}
                  >
                    <Receipt className="mr-2 h-5 w-5" />
                    Mis Compras
                  </Button>
                  <Button 
                    variant={activeTab === "children" ? "default" : "ghost"} 
                    className="w-full justify-start rounded-none h-12 relative"
                    onClick={() => setActiveTab("children")}
                  >
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Hijos Matriculados
                    {totalPendingPayments > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                        {totalPendingPayments}
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            {activeTab === "membership" && (
              <div className="space-y-6" data-tour="profile-membership">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Detalles de Membresía
                    </CardTitle>
                    <CardDescription>
                      Información sobre el estado de tu membresía
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {membershipStatus ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Año de pago requerido:</span>
                          </div>
                          <span>{membershipStatus.required_year || membershipStatus.current_year}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Monto pendiente:</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold">
                              {(() => {
                                let totalUnpaid = 0;
                                if (membershipStatus.student_payment_status) {
                                  membershipStatus.student_payment_status.forEach((s: any) => {
                                    totalUnpaid += (s.unpaid_years?.length || (!s.current_year_paid ? 1 : 0));
                                  });
                                } else {
                                  totalUnpaid = membershipStatus.students_count;
                                }
                                return formatPrice(totalUnpaid * 60000);
                              })()}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {formatPrice(60000)} por estudiante
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Total de estudiantes:</span>
                          </div>
                          <span>{membershipStatus.students_count}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Estado de membresía:</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            membershipStatus.is_active_member
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {membershipStatus.is_active_member ? "Activa" : "Inactiva"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="animate-pulse">Cargando información de membresía...</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Estado de Membresía
                    </CardTitle>
                    <CardDescription>
                      Estado actual de los pagos anuales de estudiantes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {membershipStatus ? (
                      <div className="space-y-4">
                        {/* Estado general */}
                        <div className={`p-4 rounded-lg border ${membershipStatus.is_active_member 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-orange-50 border-orange-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            {membershipStatus.is_active_member ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                              <XCircle className="h-6 w-6 text-orange-600" />
                            )}
                            <div>
                              <h3 className={`font-medium ${membershipStatus.is_active_member 
                                ? 'text-green-800' 
                                : 'text-orange-800'
                              }`}>
                                {membershipStatus.is_active_member ? 'Socio Activo' : 'Membresía Inactiva'}
                              </h3>
                              <p className={`text-sm ${membershipStatus.is_active_member 
                                ? 'text-green-700' 
                                : 'text-orange-700'
                              }`}>
                                {membershipStatus.reason}
                              </p>
                            </div>
                          </div>
                          
                          {/* Botón para completar datos solo si hay estudiantes sin CI */}
                          {(() => {
                            const studentsWithoutCI = user?.member?.students?.filter(student => 
                              !student.ci || student.ci.trim() === ''
                            ) || [];
                            
                            return studentsWithoutCI.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setShowStudentSplash(true)}
                                  className="text-blue-700 border-blue-200 hover:bg-blue-50"
                                >
                                  <Users className="h-4 w-4 mr-2" />
                                  Completar cédulas de estudiantes ({studentsWithoutCI.length})
                                </Button>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Estado por estudiante con checkboxes de años pendientes */}
                        {membershipStatus.student_payment_status &&
                         membershipStatus.student_payment_status.length > 0 && (
                          <div className="space-y-3">
                            {membershipStatus.student_payment_status.map((student: any) => (
                              <div key={student.student_id} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`w-3 h-3 rounded-full ${
                                    !student.unpaid_years || student.unpaid_years.length === 0 ? 'bg-green-500' : 'bg-orange-500'
                                  }`}></div>
                                  <span className="font-semibold">{student.student_name}</span>
                                </div>
                                <div className="ml-6 space-y-2">
                                  {student.unpaid_years && student.unpaid_years.length > 0 ? (
                                    student.unpaid_years.map((year: number) => {
                                      const key = `${student.student_id}-${year}`;
                                      const isChecked = selectedPaymentYears.includes(year);
                                      return (
                                        <label key={key} className={`flex items-center justify-between p-2 rounded-md border cursor-pointer transition-colors ${isChecked ? 'bg-primary/5 border-primary/30' : 'bg-white border-gray-200'}`}>
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={() => {
                                                setSelectedPaymentYears(prev =>
                                                  prev.includes(year)
                                                    ? prev.filter(y => y !== year)
                                                    : [...prev, year].sort()
                                                );
                                              }}
                                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm font-medium">Anualidad {year}</span>
                                          </div>
                                          <span className="text-sm font-semibold">{formatPrice(60000)}</span>
                                        </label>
                                      );
                                    })
                                  ) : (
                                    <div className="text-sm text-green-700 flex items-center gap-1">
                                      <CheckCircle className="h-3.5 w-3.5" />
                                      Al día
                                      {student.payment_date && (
                                        <span className="text-gray-500 ml-1">
                                          - {formatDate(student.payment_date)}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {membershipStatus.students_count === 0 && (
                          <div className="text-center py-4">
                            <p className="text-gray-500">No hay estudiantes asociados a esta cuenta.</p>
                          </div>
                        )}

                        {/* Total y botón de pago */}
                        {selectedPaymentYears.length > 0 && (
                          <div className="pt-4 border-t">
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-medium">Total a pagar:</span>
                                <span className="text-xl font-bold text-primary">
                                  {formatPrice(selectedPaymentYears.reduce((total, year) => {
                                    const count = membershipStatus.student_payment_status
                                      ?.filter((s: any) => s.unpaid_years?.includes(year))?.length || 0;
                                    return total + count * 60000;
                                  }, 0))}
                                </span>
                              </div>
                              <Button
                                onClick={() => handlePayMembership()}
                                className="w-full bg-primary hover:bg-primary/90"
                                disabled={isProcessingPayment}
                              >
                                {isProcessingPayment ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Procesando...
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Pagar Anualidades Seleccionadas
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                        <p>Cargando estado de membresía...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Historial de pagos tradicionales (legacy) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Receipt className="mr-2 h-5 w-5" />
                      Historial de Pagos (Legacy)
                    </CardTitle>
                    <CardDescription>
                      Registro histórico de pagos realizados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {payments.filter(payment => payment.status === 'paid' || payment.status === 'completed').length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments
                            .filter(payment => payment.status === 'paid' || payment.status === 'completed')
                            .map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                {(() => {
                                  console.log('Payment date debug:', payment.payment_date, typeof payment.payment_date);
                                  if (!payment.payment_date || payment.payment_date === '' || payment.payment_date === null) {
                                    return 'Sin fecha';
                                  }
                                  try {
                                    // Try different date formats
                                    const date = new Date(payment.payment_date);
                                    if (isNaN(date.getTime())) {
                                      return 'Fecha inválida';
                                    }
                                    return date.toLocaleDateString('es-ES', {
                                      day: '2-digit',
                                      month: '2-digit', 
                                      year: 'numeric'
                                    });
                                  } catch (error) {
                                    console.error('Error parsing date:', payment.payment_date, error);
                                    return 'Error en fecha';
                                  }
                                })()}
                              </TableCell>
                              <TableCell>{formatPrice(payment.amount)}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Pagado
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4">
                        <p>No hay pagos completados registrados.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeTab === "benefits" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="mr-2 h-5 w-5" />
                    Beneficios Reclamados
                  </CardTitle>
                  <CardDescription>Listado de beneficios que has utilizado</CardDescription>
                </CardHeader>
                <CardContent>
                  {benefits.length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {benefits.map((benefit) => (
                          <div key={benefit.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1">
                                {/* Imagen del beneficio o logo del comercio */}
                                {benefit.benefit?.cover_image ? (
                                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                      src={benefit.benefit.cover_image}
                                      alt={benefit.benefit.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : benefit.benefit?.commerce?.logo_url ? (
                                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted/30 flex items-center justify-center">
                                    <img
                                      src={benefit.benefit.commerce.logo_url}
                                      alt={benefit.benefit.commerce.name}
                                      className="w-12 h-12 object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center flex-shrink-0">
                                    <Gift className="h-8 w-8 text-primary/60" />
                                  </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                    <h3 className="font-medium text-lg text-foreground">{benefit.benefit?.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      <span>{formatDate(benefit.verification_date, { format: 'long' })}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Información del comercio */}
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Store className="h-4 w-4" />
                                    <span>{benefit.benefit?.commerce?.name}</span>
                                  </div>
                                  
                                  {/* Categoría */}
                                  {benefit.benefit?.category?.name && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                      <Tag className="h-4 w-4" />
                                      <span>Categoría: {benefit.benefit.category.name}</span>
                                    </div>
                                  )}
                                  
                                  {/* Información del descuento */}
                                  {(benefit.benefit?.discount_type && benefit.benefit?.discount_value) && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {benefit.benefit.discount_type === 'percentage' 
                                          ? `${benefit.benefit.discount_value}% descuento`
                                          : `₲ ${benefit.benefit.discount_value} descuento`
                                        }
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Paginación para beneficios */}
                      {totalBenefitsPages > 1 && (
                        <div className="mt-6">
                          <Pagination className="justify-center">
                            <PaginationContent>
                              {currentBenefitsPage > 1 && (
                                <PaginationItem>
                                  <PaginationPrevious 
                                    onClick={() => handleBenefitsPageChange(currentBenefitsPage - 1)}
                                    className="cursor-pointer"
                                  />
                                </PaginationItem>
                              )}
                              
                              {[...Array(totalBenefitsPages)].map((_, i) => {
                                const page = i + 1;
                                if (
                                  page === 1 || 
                                  page === totalBenefitsPages || 
                                  (page >= currentBenefitsPage - 1 && page <= currentBenefitsPage + 1)
                                ) {
                                  return (
                                    <PaginationItem key={page}>
                                      <PaginationLink
                                        isActive={page === currentBenefitsPage}
                                        onClick={() => handleBenefitsPageChange(page)}
                                        className="cursor-pointer"
                                      >
                                        {page}
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                } else if (
                                  page === currentBenefitsPage - 2 || 
                                  page === currentBenefitsPage + 2
                                ) {
                                  return <PaginationItem key={page}>...</PaginationItem>;
                                }
                                return null;
                              })}
                              
                              {currentBenefitsPage < totalBenefitsPages && (
                                <PaginationItem>
                                  <PaginationNext 
                                    onClick={() => handleBenefitsPageChange(currentBenefitsPage + 1)}
                                    className="cursor-pointer"
                                  />
                                </PaginationItem>
                              )}
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No hay beneficios reclamados</h3>
                      <p className="text-muted-foreground">
                        Aún no has reclamado ningún beneficio. Explora los beneficios disponibles para comenzar.
                      </p>
                      <Button className="mt-4" asChild>
                        <Link to="/beneficios">Ver Beneficios Disponibles</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {activeTab === "edit" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Edit className="mr-2 h-5 w-5" />
                    Editar Perfil
                  </CardTitle>
                  <CardDescription>
                    Actualiza tu información personal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateProfile(e);
                  }}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="name">Nombre Completo</label>
                      <input 
                        id="name"
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        placeholder="Ej: Adriana Aranda"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="email">Email</label>
                      <input 
                        id="email"
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="phone">Teléfono</label>
                      <input 
                        id="phone"
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="password">Nueva Contraseña</label>
                        <input 
                          id="password"
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full p-2 border rounded-md ${
                            password && password.length < 6 
                              ? 'border-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder="Deja en blanco para mantener la actual"
                        />
                        {password && password.length < 6 && (
                          <p className="text-sm text-red-600">Mínimo 6 caracteres</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="password_confirmation">Confirmar Contraseña</label>
                        <input 
                          id="password_confirmation"
                          type="password" 
                          value={passwordConfirmation}
                          onChange={(e) => setPasswordConfirmation(e.target.value)}
                          className={`w-full p-2 border rounded-md ${
                            passwordConfirmation && !passwordsMatch 
                              ? 'border-red-500 focus:border-red-500' 
                              : passwordConfirmation && passwordsMatch && password
                              ? 'border-green-500 focus:border-green-500'
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder="Confirma la nueva contraseña"
                        />
                        {passwordConfirmation && !passwordsMatch && (
                          <p className="text-sm text-red-600">Las contraseñas no coinciden</p>
                        )}
                        {passwordConfirmation && passwordsMatch && password && (
                          <p className="text-sm text-green-600">Las contraseñas coinciden ✓</p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={password && (!passwordsMatch || password.length < 6)}
                    >
                      Guardar Cambios
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "raffles" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Copy className="mr-2 h-5 w-5" />
                      Tu Link de Referido
                    </CardTitle>
                    <CardDescription>
                      Compartilo y ganá por cada número de rifa vendido a través tuyo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {referralInfo?.referrer_code ? (
                      <div className="space-y-4">
                        {/* El código identifica al socio: sin esto el título de la card no se
                            entiende, porque el link se copia por rifa más abajo. */}
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Tu código:</span>
                          <code className="px-2 py-1 rounded bg-muted font-mono font-semibold tracking-wide">
                            {referralInfo.referrer_code}
                          </code>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="p-3 sm:p-4 bg-muted rounded-lg text-center">
                            <p className="text-xl sm:text-2xl font-bold text-primary">{referralInfo.total_numeros}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Números vendidos</p>
                          </div>
                          <div className="p-3 sm:p-4 bg-muted rounded-lg text-center">
                            <p className="text-xl sm:text-2xl font-bold text-primary break-words">
                              {formatPrice(referralInfo.total_acumulado)}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Acumulado</p>
                          </div>
                        </div>

                        {referralInfo.ventas && referralInfo.ventas.length > 0 ? (
                          <div>
                            <h4 className="font-medium mb-2">Detalle de ventas</h4>

                            {/* En celular la tabla de 6 columnas deja "Por número" y "Acumulado"
                                fuera de pantalla — justo lo que el socio quiere ver. Abajo de sm
                                se muestra una tarjeta por venta; de sm para arriba, la tabla. */}
                            <div className="space-y-3 sm:hidden">
                              {referralInfo.ventas.map((venta, index) => (
                                <div key={index} className="rounded-lg border p-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="font-medium leading-tight break-words">{venta.rifa}</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {formatDate(venta.fecha, { format: 'short' })} · {venta.orden}
                                      </p>
                                    </div>
                                    <p className="text-lg font-bold text-primary whitespace-nowrap">
                                      {formatPrice(venta.acumulado)}
                                    </p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {venta.numeros} {venta.numeros === 1 ? 'número' : 'números'} × {formatPrice(venta.por_numero)}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="hidden sm:block overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Orden</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Rifa</TableHead>
                                    <TableHead className="text-right">Números</TableHead>
                                    <TableHead className="text-right">Por número</TableHead>
                                    <TableHead className="text-right">Acumulado</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {referralInfo.ventas.map((venta, index) => (
                                    <TableRow key={index}>
                                      <TableCell className="whitespace-nowrap">{venta.orden}</TableCell>
                                      <TableCell className="whitespace-nowrap">{formatDate(venta.fecha, { format: 'short' })}</TableCell>
                                      <TableCell>{venta.rifa}</TableCell>
                                      <TableCell className="text-right">{venta.numeros}</TableCell>
                                      <TableCell className="text-right whitespace-nowrap">{formatPrice(venta.por_numero)}</TableCell>
                                      <TableCell className="text-right whitespace-nowrap font-medium">{formatPrice(venta.acumulado)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Todavía no tenés ventas registradas por tu link de referido.</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {referralInfo?.motivo || 'Cargando información de referidos...'}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Ticket className="mr-2 h-5 w-5" />
                      Rifas Disponibles
                    </CardTitle>
                    <CardDescription>
                      Lista de rifas activas para compartir tu link de referido
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {raffles.length > 0 ? (
                      <div className="space-y-4">
                        {raffles.map((raffle) => (
                          <div key={raffle.id} className="p-4 sm:p-6 border rounded-lg">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1.5 min-w-0">
                                <h3 className="text-base sm:text-lg font-semibold break-words">{raffle.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4 shrink-0" />
                                  <span>Sorteo: {raffle.draw_date}</span>
                                </div>
                                {raffle.location && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 shrink-0" />
                                    <span>{raffle.location}</span>
                                  </div>
                                )}
                                <div className="text-base sm:text-lg font-semibold text-primary">
                                  {formatPrice(raffle.price)} <span className="text-xs font-normal text-muted-foreground">por número</span>
                                </div>
                              </div>
                              <Button
                                onClick={() => copyReferralLink(raffle)}
                                className="md:w-auto w-full shrink-0"
                                disabled={!referralInfo?.referrer_code}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Copiar Link de Referido
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                     ) : (
                       <div className="text-center py-8">
                         <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                         <h3 className="text-lg font-medium mb-2">No hay rifas disponibles</h3>
                         <p className="text-muted-foreground">
                           Actualmente no hay rifas activas disponibles.
                         </p>
                       </div>
                     )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "orders" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Receipt className="mr-2 h-5 w-5" />
                    Mis Compras
                  </CardTitle>
                  <CardDescription>
                    Historial de todas las compras realizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex gap-3">
                              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                {order.items[0]?.type === 'Course' ? (
                                  <GraduationCap className="h-8 w-8 text-blue-600" />
                                ) : order.items[0]?.type === 'Event' ? (
                                  <Calendar className="h-8 w-8 text-green-600" />
                                ) : (
                                  <Ticket className="h-8 w-8 text-purple-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{order.items[0]?.name || 'Item'}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {order.items[0]?.type === 'Course' ? 'Inscripción al Curso' : 
                                   order.items[0]?.type === 'Event' ? 'Entrada de Evento' : 
                                   order.items[0]?.type === 'Raffle' ? 'Números de Rifa' : 'Item'}
                                </p>
                                
                                {/* Detalles específicos por tipo */}
                                {order.items.map((item, index) => (
                                  <div key={index} className="mt-2 space-y-1">
                                    {item.type === 'Course' && (
                                      <div className="space-y-1 text-sm text-muted-foreground">
                                        {item.enrollment_details && (
                                          <>
                                            <div className="flex items-center gap-1">
                                              <Users className="h-3 w-3" />
                                              <span>Estudiante: {item.enrollment_details.student_name}</span>
                                              {item.enrollment_details.student_ci && (
                                                <span className="text-xs">({item.enrollment_details.student_ci})</span>
                                              )}
                                            </div>
                                            {item.enrollment_details.group_name && (
                                              <div className="flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                <span>Grupo: {item.enrollment_details.group_name}</span>
                                              </div>
                                            )}
                                            {item.enrollment_details.group_schedule && (
                                              <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{item.enrollment_details.group_schedule}</span>
                                              </div>
                                            )}
                                            {item.enrollment_details.group_location && (
                                              <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span>{item.enrollment_details.group_location}</span>
                                              </div>
                                            )}
                                          </>
                                        )}
                                        {item.course_details && (
                                          <div className="flex items-center gap-1">
                                            <Store className="h-3 w-3" />
                                            <span>{item.course_details.commerce}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {item.type === 'Event' && (
                                      <div className="space-y-1 text-sm text-muted-foreground">
                                        {item.event_details && (
                                          <>
                                            {item.event_details.date && (
                                              <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                  {formatDate(item.event_details.date)}
                                                  {item.event_details.time && ` - ${item.event_details.time.slice(0, 5)}`}
                                                </span>
                                              </div>
                                            )}
                                            {item.event_details.location && (
                                              <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span>{item.event_details.location}</span>
                                              </div>
                                            )}
                                          </>
                                        )}
                                        {item.ticket_details && (
                                          <div className="flex items-center gap-1">
                                            <Ticket className="h-3 w-3" />
                                            <span>{item.ticket_details.ticket_type}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                          <span>{item.quantity} entrada(s)</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {item.type === 'Product' && (
                                      <div className="space-y-1 text-sm text-muted-foreground">
                                        {item.product_details?.variant_name && (
                                          <div className="flex items-center gap-1">
                                            <Tag className="h-3 w-3" />
                                            <span>{item.product_details.variant_name}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                          <span>{item.quantity} unidad(es)</span>
                                          {item.product_details?.is_pre_order && (
                                            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">Pre-venta</span>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {item.type === 'Raffle' && (
                                      <div className="space-y-1 text-sm text-muted-foreground">
                                        {item.raffle_details?.end_date && (
                                          <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>Sorteo: {formatDate(item.raffle_details.end_date)}</span>
                                          </div>
                                        )}
                                        {item.raffle_numbers && item.raffle_numbers.length > 0 && (
                                          <div className="flex items-center gap-1">
                                            <Ticket className="h-3 w-3" />
                                            <span>Números: {item.raffle_numbers.join(', ')}</span>
                                          </div>
                                        )}
                                        {item.student_name && (
                                          <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            <span>Estudiante: {item.student_name}</span>
                                          </div>
                                        )}
                                        {!item.raffle_numbers && (
                                          <div className="flex items-center gap-1">
                                            <span>{item.quantity} número(s)</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatPrice(toNumber(order.total_amount))}</p>
                              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completado
                              </span>
                              {order.fulfillment_status && (
                                <div className="mt-1">
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                    order.fulfillment_status === 'preparing' ? 'bg-amber-100 text-amber-800' :
                                    order.fulfillment_status === 'ready_for_pickup' ? 'bg-blue-100 text-blue-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {order.fulfillment_status === 'preparing' ? 'Preparando' :
                                     order.fulfillment_status === 'ready_for_pickup' ? '¡Listo para retirar!' :
                                     'Entregado'}
                                  </span>
                                  {order.fulfillment_status === 'ready_for_pickup' && order.ready_for_pickup_at && (
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                      Listo desde {order.ready_for_pickup_at}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="text-xs text-muted-foreground">
                              Fecha de compra: {order.created_at_formatted} • Orden #{order.order_number}
                            </div>
                            {order.items.some((item) => item.type === 'Event') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadTicketsPdf(order.id, order.order_number)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Descargar entradas
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No hay compras completadas</h3>
                      <p className="text-muted-foreground">
                        Aún no has completado ninguna compra. Explora eventos, cursos y rifas disponibles.
                      </p>
                      <div className="flex gap-2 mt-4 justify-center">
                        <Button asChild variant="outline">
                          <Link to="/eventos">Ver Eventos</Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link to="/cursos">Ver Cursos</Link>
                        </Button>
                        <Button asChild>
                          <Link to="/rifas">Ver Rifas</Link>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Paginación para órdenes */}
                  {totalOrdersPages > 1 && (
                    <Pagination className="mt-8">
                      <PaginationContent>
                        {currentOrdersPage > 1 && (
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handleOrdersPageChange(currentOrdersPage - 1)}
                              className="cursor-pointer"
                            />
                          </PaginationItem>
                        )}
                        
                        {[...Array(totalOrdersPages)].map((_, i) => {
                          const page = i + 1;
                          // Show current page, first, last, and pages around current
                          if (
                            page === 1 || 
                            page === totalOrdersPages || 
                            (page >= currentOrdersPage - 1 && page <= currentOrdersPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={page === currentOrdersPage}
                                  onClick={() => handleOrdersPageChange(page)}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            page === currentOrdersPage - 2 || 
                            page === currentOrdersPage + 2
                          ) {
                            return <PaginationItem key={page}><span className="px-3">...</span></PaginationItem>;
                          }
                          return null;
                        })}
                        
                        {currentOrdersPage < totalOrdersPages && (
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handleOrdersPageChange(currentOrdersPage + 1)}
                              className="cursor-pointer"
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "children" && (
              <Card data-tour="profile-children">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Hijos Matriculados
                  </CardTitle>
                  <CardDescription>
                    Gestiona los hijos matriculados asociados a tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChildrenManager />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Student Data Splash - Solo desde perfil manualmente */}
      <StudentDataSplash 
        isOpen={showStudentSplash}
        onClose={() => setShowStudentSplash(false)}
        onSaved={() => {
          setShowStudentSplash(false);
          // Refrescar datos del usuario después de guardar
          window.location.reload();
        }}
        skipAutoShow={true}
      />
      
      <Footer />
    </div>
  );
};

export default Profile;
