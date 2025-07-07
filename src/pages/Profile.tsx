import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QrCode, LogOut, User, CreditCard, Gift, Edit, Mail, Phone, Calendar, CheckCircle, XCircle, Receipt, ExternalLink, Ticket, Users, Copy, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStore } from "@/stores/store";
import { FaUserAlt } from 'react-icons/fa';
import api from "@/services/api";
import { ChildrenManager } from "@/components/ChildrenManager";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("membership");
  const [showEmptyBenefits, setShowEmptyBenefits] = useState(false);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const [payments, setPayments] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [raffles, setRaffles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedRaffleStudents, setSelectedRaffleStudents] = useState([]);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const navigate = useNavigate();
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const isPending = user?.member?.status === "En Mora";

  // Fetch user data when component mounts
  useEffect(() => {
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
  }, [setUser]);

  // Fetch raffles data
  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        const response = await api.get('api/client/profile/raffles');
        if (response.data.success) {
          setRaffles(response.data.data.map(raffle => ({
            id: raffle.id,
            title: raffle.title,
            draw_date: raffle.draw_date,
            location: "Sede Central APACG", // Mock location hasta que se agregue al backend
            price: raffle.price
          })));
        }
      } catch (error) {
        console.error('Error fetching raffles:', error);
        // Fallback a datos mock si hay error
        setRaffles([
          {
            id: 1,
            title: "Sorteo de Smartphone Samsung Galaxy S24",
            draw_date: "2025-08-15",
            location: "Sede Central APACG",
            price: "50000"
          },
          {
            id: 2,
            title: "Rifa de Notebook Dell Inspiron",
            draw_date: "2025-09-20", 
            location: "Online - Transmisión en vivo",
            price: "30000"
          },
          {
            id: 3,
            title: "Sorteo de Bicicleta Mountain Bike",
            draw_date: "2025-07-30",
            location: "Patio del Colegio",
            price: "25000"
          }
        ]);
      }
    };

    if (user?.member?.id) {
      fetchRaffles();
    }
  }, [user?.member?.id]);

  // Fetch payments, benefits and orders only after user data is loaded
  useEffect(() => {
    if (!user?.member?.id) return;
    
    const fetchData = async () => {
      try {
        // Fetch payments
        if (user.id) {
          const paymentsResponse = await api.get(`api/client/memberships/${user.id}`);
          setPayments(paymentsResponse.data.data.data || []);
        }
        
        // Fetch benefits
        const benefitsResponse = await api.get(`api/client/benefits/member/${user.member.id}`);
        setBenefits(benefitsResponse.data.data.data || []);
        
        // Fetch orders
        const ordersResponse = await api.get('api/client/profile/orders');
        if (ordersResponse.data.success) {
          setOrders(ordersResponse.data.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [user?.id, user?.member?.id]);

  const handleLogout = async () => {
    try {
      // Realizar una solicitud al backend para hacer logout
      await api.post('/logout');  // Asumiendo que tienes un endpoint /api/logout
  
      // Limpiar el estado y redirigir al login
      setUser(null);  // Limpiar estado global
      localStorage.removeItem('user');  // Limpiar almacenamiento local
      navigate("/login");  // Redirigir al login
    } catch (error) {
      console.error('Error en el logout:', error);
    }
  };

  const handlePayMembership = () => {
    navigate("/pago-membresia");
  };

  const toggleBenefitsView = () => {
    setShowEmptyBenefits(!showEmptyBenefits);
  };

  const { toast } = useToast();

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
      
      // Update local user state with new values
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
    
    try {
      const response = await api.get('api/client/profile/students');
      if (response.data.success) {
        setSelectedRaffleStudents(response.data.data);
      } else {
        // Fallback a datos mock si hay error
        setSelectedRaffleStudents([
          {
            id: 1,
            first_name: "María",
            last_name: "González",
            school_year: "5° Grado",
            student_number: "EST-2024-001"
          },
          {
            id: 2,
            first_name: "Carlos",
            last_name: "Rodríguez", 
            school_year: "3° Grado",
            student_number: "EST-2024-002"
          },
          {
            id: 3,
            first_name: "Ana",
            last_name: "López",
            school_year: "1° Grado",
            student_number: "EST-2024-003"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // Fallback a datos mock si hay error
      setSelectedRaffleStudents([
        {
          id: 1,
          first_name: "María",
          last_name: "González",
          school_year: "5° Grado",
          student_number: "EST-2024-001"
        },
        {
          id: 2,
          first_name: "Carlos",
          last_name: "Rodríguez", 
          school_year: "3° Grado",
          student_number: "EST-2024-002"
        },
        {
          id: 3,
          first_name: "Ana",
          last_name: "López",
          school_year: "1° Grado",
          student_number: "EST-2024-003"
        }
      ]);
    }
    
    setShowStudentsModal(true);
  };

  const copyReferralLink = (student, raffleName) => {
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}/rifa/${selectedRaffle?.id}?ref=${student.referrer_code}`;
    
    navigator.clipboard.writeText(referralLink).then(() => {
      toast({
        title: "Link copiado",
        description: `Link de referido para ${raffleName} copiado al portapapeles`,
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "No se pudo copiar el link al portapapeles",
        variant: "destructive",
      });
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-24 pb-12 flex justify-center items-center">
          <p>Cargando perfil...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
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
                <CardDescription>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    <span>{email || user?.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Phone className="h-4 w-4" />
                    <span>{phone || user?.member?.phone}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-col items-center">
                <div className="mb-4 p-2 bg-white rounded-lg">
                  <img 
                    src={user?.member?.image?.storage_path_full} 
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
                    className="w-full justify-start rounded-none h-12"
                    onClick={() => setActiveTab("children")}
                  >
                    Hijos Matriculados
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
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Fecha de pago:</span>
                        </div>
                        <span>{user?.member?.payment_date}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Monto pagado:</span>
                        </div>
                        <span>{formatPrice(90000)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Estado:</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          !isPending 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {!isPending ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                      
                      {isPending && (
                        <Button 
                          className="w-full mt-4"
                          onClick={handlePayMembership}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Realizar pago de membresía
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Receipt className="mr-2 h-5 w-5" />
                      Historial de Pagos
                    </CardTitle>
                    <CardDescription>
                      Registro de los pagos de membresía realizados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {payments.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{payment.payment_date}</TableCell>
                              <TableCell>{formatPrice(payment.amount)}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {payment.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4">
                        <p>No hay pagos registrados.</p>
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleBenefitsView}
                    className="ml-auto text-xs mt-2"
                    >
                      Demo: {showEmptyBenefits ? "Mostrar con datos" : "Mostrar vacío"}
                    </Button>
                </CardHeader>
                <CardContent>
                  {benefits.length > 0 && !showEmptyBenefits ? (
                    <div className="space-y-4">
                      {benefits.map((benefit) => (
                        <div key={benefit.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between mb-2">
                            <h3 className="font-medium">{benefit.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Comercio: {benefit.commerce?.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No hay beneficios reclamados</h3>
                      <p className="text-muted-foreground">
                        Aún no has reclamado ningún beneficio. Explora los beneficios disponibles para comenzar.
                      </p>
                      <Button className="mt-4" asChild>
                        <a href="/beneficios">Ver Beneficios Disponibles</a>
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
                        <div key={order.id} className={`border rounded-lg p-4 ${order.status === 'pending' ? 'opacity-75' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-3">
                              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                {order.items[0]?.type === 'Event' ? (
                                  <Calendar className="h-8 w-8 text-muted-foreground" />
                                ) : (
                                  <Ticket className="h-8 w-8 text-muted-foreground" />
                                )}
                              </div>
                          <div>
                                <h3 className="font-semibold">{order.items[0]?.name || 'Item'}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {order.items[0]?.type === 'Event' ? 'Entrada de Evento' : 
                                   order.items[0]?.type === 'Raffle' ? 'Números de Rifa' : 'Item'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {order.items.reduce((total, item) => total + item.quantity, 0)} {
                                    order.items[0]?.type === 'Event' ? 'entrada(s)' : 
                                    order.items[0]?.type === 'Raffle' ? 'número(s)' : 'item(s)'
                                  }
                                </p>
                          </div>
                        </div>
                        <div className="text-right">
                              <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status_label}
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
                      <h3 className="text-lg font-medium mb-2">No hay compras registradas</h3>
                      <p className="text-muted-foreground">
                        Aún no has realizado ninguna compra. Explora eventos y rifas disponibles.
                      </p>
                      <div className="flex gap-2 mt-4 justify-center">
                        <Button asChild variant="outline">
                          <a href="/eventos">Ver Eventos</a>
                        </Button>
                        <Button asChild>
                          <a href="/rifas">Ver Rifas</a>
                        </Button>
                      </div>
                    </div>
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
                      onClick={() => copyReferralLink(student, `${student.first_name} ${student.last_name}`)}
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
      
      <Footer />
    </div>
  );
};

export default Profile;
