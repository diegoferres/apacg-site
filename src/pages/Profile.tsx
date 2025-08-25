import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QrCode, LogOut, User, CreditCard, Gift, Edit, Mail, Phone, Calendar, CheckCircle, XCircle, Receipt, ExternalLink, Ticket, Users, Copy, MapPin, Store, Tag, GraduationCap, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import analytics from '@/services/analytics';

const Profile = () => {
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
  const [selectedRaffleStudents, setSelectedRaffleStudents] = useState([]);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const navigate = useNavigate();
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [studentsWithEnrollments, setStudentsWithEnrollments] = useState([]);
  const [showStudentSplash, setShowStudentSplash] = useState(false);

  const isPending = user?.member?.status === "En Mora";

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
        setFirstName(response.data.member?.first_name || "");
        setLastName(response.data.member?.last_name || "");
        
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
            draw_date: raffle.draw_date,
            location: null, // No hay campo de ubicación en el modelo actual
            price: raffle.price
          })));
        }
      } catch (error) {
        console.error('Error fetching raffles:', error);
        // Si hay error, mostrar array vacío en lugar de datos mock
        setRaffles([]);
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
      let unpaidStudents = [];

      // Si tenemos información de pagos, usar esa
      if (membershipStatus?.student_payment_status) {
        unpaidStudents = membershipStatus.student_payment_status
          .filter(student => !student.current_year_paid)
          .map(student => student.student_id);
        
        if (unpaidStudents.length === 0) {
          toast({
            title: "No hay pagos pendientes",
            description: "Todos los estudiantes tienen sus anualidades al día.",
            variant: "default",
          });
          return;
        }
      } else {
        // Si no tenemos información detallada, usar todos los estudiantes del user
        if (user?.member?.students && user.member.students.length > 0) {
          unpaidStudents = user.member.students.map(student => student.id);
        } else {
          toast({
            title: "No hay estudiantes",
            description: "No se encontraron estudiantes asociados a su cuenta.",
            variant: "destructive",
          });
          return;
        }
      }

      // Crear orden de pago de membresía
      const orderResponse = await api.post('/api/client/sales/create-membership-order', {
        student_ids: unpaidStudents,
        annual_payment_amount: 60000
      });

      if (orderResponse.data.success) {
        const { checkout_data, total_amount, student_count, order_number } = orderResponse.data.data;
        
        // Preparar datos para la página de pago
        const paymentData = {
          type: 'membership',
          totalAmount: total_amount,
          studentCount: student_count,
          orderNumber: order_number,
          membershipStatus: membershipStatus,
          unpaidStudents: membershipStatus?.student_payment_status
            ? membershipStatus.student_payment_status.filter(student => !student.current_year_paid)
            : user?.member?.students?.map(student => ({
                student_id: student.id,
                student_name: student.full_name,
                current_year_paid: false
              })) || [],
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

    try {
      const response = await api.put(`/api/client/members/${user.member.id}`, {
        first_name,
        last_name,
        phone,
        avatar: null
      });
      
      setUser({
        ...user,
        name: `${first_name} ${last_name}`,
        email,
        member: {
          ...user.member,
          first_name,
          last_name,
          phone
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleViewStudents = async (raffle) => {
    setSelectedRaffle(raffle);
    
    if (user?.member?.students?.length > 0) {
      setSelectedRaffleStudents(user.member.students.map(student => ({
        ...student,
        school_year: student.school_year || "N/A"
      })));
    } else {
      // Si no hay estudiantes reales, mostrar array vacío
      setSelectedRaffleStudents([]);
    }
    
    setShowStudentsModal(true);
  };

  const copyReferralLink = (student, raffleName) => {
    // Validar que tenemos todos los datos necesarios
    if (!selectedRaffle?.slug) {
      toast({
        title: "Error",
        description: "No se puede generar el link: información de rifa incompleta",
        variant: "destructive",
      });
      return;
    }

    if (!student?.referrer_code) {
      toast({
        title: "Error",
        description: "No se puede generar el link: código de referido no disponible",
        variant: "destructive",
      });
      return;
    }

    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}/rifa/${selectedRaffle.slug}?ref=${student.referrer_code}`;
    
    navigator.clipboard.writeText(referralLink).then(() => {
      toast({
        title: "Link copiado",
        description: `Link de referido para "${raffleName || 'la rifa'}" copiado al portapapeles`,
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
        <Breadcrumb className="mb-6">
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="mb-6">
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
                  {user?.name || `${first_name} ${last_name}`}
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
                <div className="mb-4 p-2 bg-white rounded-lg">
                  <img 
                    src={user?.member?.qr_code_base64 || user?.member?.image?.storage_path_full} 
                    alt="QR Code" 
                    className="h-32 w-32" 
                  />
                </div>
                <p className="text-sm font-medium mb-4">Código de Socio: {user?.member?.member_number}</p>
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
              <div className="space-y-6">
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
                            <span className="font-medium">Año actual:</span>
                          </div>
                          <span>{membershipStatus.current_year}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Monto pendiente:</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold">
                              {(() => {
                                const unpaidCount = membershipStatus.student_payment_status
                                  ? membershipStatus.student_payment_status.filter(s => !s.current_year_paid).length
                                  : membershipStatus.students_count;
                                return formatPrice(unpaidCount * 60000);
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

                        {/* Estado por estudiante - Mostrar todos los estudiantes */}
                        {membershipStatus.student_payment_status && 
                         membershipStatus.student_payment_status.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
                              Estado de Pagos Anuales {membershipStatus.current_year}
                            </h4>
                            {membershipStatus.student_payment_status
                              .map((student) => (
                              <div key={student.student_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${
                                    student.current_year_paid ? 'bg-green-500' : 'bg-orange-500'
                                  }`}></div>
                                  <span className="font-medium">{student.student_name}</span>
                                </div>
                                <div className="text-sm">
                                  {student.current_year_paid ? (
                                    <span className="text-green-700 flex items-center gap-1">
                                      <CheckCircle className="h-4 w-4" />
                                      Pagado {membershipStatus.current_year}
                                      {student.payment_date && (
                                        <span className="text-gray-500 ml-2">
                                          - {formatDate(student.payment_date)}
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-orange-700 flex items-center gap-1">
                                      <XCircle className="h-4 w-4" />
                                      Pendiente {membershipStatus.current_year}
                                    </span>
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

                        {/* Botón de pago si hay estudiantes pendientes */}
                        {(() => {
                          const hasUnpaidStudents = membershipStatus.student_payment_status && 
                            membershipStatus.student_payment_status.some(student => !student.current_year_paid);
                          console.log('Payment button debug:', {
                            membershipStatus: !!membershipStatus,
                            hasStudentStatus: !!membershipStatus.student_payment_status,
                            studentCount: membershipStatus.student_payment_status?.length,
                            hasUnpaidStudents,
                            students: membershipStatus.student_payment_status
                          });
                          return hasUnpaidStudents;
                        })() && (
                          <div className="pt-4 border-t">
                            <Button 
                              onClick={handlePayMembership}
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
                                  Pagar Anualidades Pendientes
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        {/* Botón de fallback si no se puede determinar el estado pero hay estudiantes */}
                        {!membershipStatus.is_active_member && 
                         (!membershipStatus.student_payment_status || membershipStatus.student_payment_status.length === 0) &&
                         user?.member?.students && user.member.students.length > 0 && (
                          <div className="pt-4 border-t">
                            <Button 
                              onClick={handlePayMembership}
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
                                  Verificar y Pagar Anualidades
                                </>
                              )}
                            </Button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="first_name">Nombre</label>
                        <input 
                          id="first_name"
                          type="text" 
                          value={first_name}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="last_name">Apellido</label>
                        <input 
                          id="last_name"
                          type="text" 
                          value={last_name}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="email">Email</label>
                      <input 
                        id="email"
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        disabled // Email usually requires special handling for updates
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
                    
                    <Button type="submit" className="w-full">Guardar Cambios</Button>
                  </form>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "raffles" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Ticket className="mr-2 h-5 w-5" />
                    Rifas Disponibles
                  </CardTitle>
                  <CardDescription>
                    Lista de rifas activas para generar links de referidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {raffles.length > 0 ? (
                    <div className="space-y-4">
                      {raffles.map((raffle) => (
                        <div key={raffle.id} className="p-6 border rounded-lg">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold">{raffle.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Sorteo: {raffle.draw_date}</span>
                              </div>
                              {raffle.location && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>{raffle.location}</span>
                                </div>
                              )}
                              <div className="text-lg font-semibold text-primary">
                                {formatPrice(raffle.price)}
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleViewStudents(raffle)}
                              className="md:w-auto w-full"
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Ver Alumnos
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
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Fecha de compra: {order.created_at_formatted} • Orden #{order.order_number}
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
              <Card>
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
      
      {/* Modal para mostrar alumnos y links de referido */}
      <Dialog open={showStudentsModal} onOpenChange={setShowStudentsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Alumnos para {selectedRaffle?.title}
            </DialogTitle>
            <DialogDescription>
              Genera links de referido para cada alumno matriculado
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedRaffleStudents.length > 0 ? (
              selectedRaffleStudents.map((student) => (
                <div key={student.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{student.first_name} {student.last_name}</h4>
                      <p className="text-sm text-muted-foreground">{student.school_year}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyReferralLink(student, selectedRaffle?.title)}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar Link
                    </Button>
                  </div>
                </div>
              ))
             ) : (
               <div className="text-center py-8">
                 <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                 <p className="text-sm text-muted-foreground">
                   No hay alumnos matriculados para generar links de referido.
                 </p>
               </div>
             )}
          </div>
        </DialogContent>
      </Dialog>
      
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
