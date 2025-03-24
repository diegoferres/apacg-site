
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, LogOut, User, CreditCard, Gift, Edit, Mail, Phone, Calendar, CheckCircle, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Mock user data - in a real app this would come from an API or context
const userData = {
  id: "12345",
  name: "Usuario Socio",
  email: "usuario_socio@apacgoethe.com",
  phone: "0981 123 456",
  memberCode: "APAC-2024-12345",
  status: "inactive", // active or inactive
  avatar: "",
  membership: {
    paymentDate: "2024-05-21",
    amount: "150.000 Gs.",
    status: "inactive" // active, inactive, expired
  },
  claimedBenefits: []
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState("membership");
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // In a real app, this would call an authentication logout function
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        {/* Breadcrumb */}
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
          {/* Sidebar Profile Panel */}
          <div className="md:col-span-1">
            <Card className="mb-6">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="text-2xl">{userData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  {userData.name}
                  {userData.status === "active" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Phone className="h-4 w-4" />
                    <span>{userData.phone}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-col items-center">
                <div className="mb-4 p-2 bg-white rounded-lg">
                  <QrCode className="h-32 w-32" />
                </div>
                <p className="text-sm font-medium mb-4">Código de Socio: {userData.memberCode}</p>
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
            
            {/* Profile Navigation Menu */}
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
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content Area */}
          <div className="md:col-span-2">
            {/* Membership Section */}
            {activeTab === "membership" && (
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
                      <span>{userData.membership.paymentDate}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Monto pagado:</span>
                      </div>
                      <span>{userData.membership.amount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Estado:</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        userData.membership.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {userData.membership.status === "active" ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Benefits Section */}
            {activeTab === "benefits" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="mr-2 h-5 w-5" />
                    Beneficios Reclamados
                  </CardTitle>
                  <CardDescription>
                    Listado de beneficios que has utilizado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userData.claimedBenefits.length > 0 ? (
                    <div className="space-y-4">
                      {userData.claimedBenefits.map((benefit, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          {/* Benefit details would go here */}
                          <p>Beneficio reclamado {index + 1}</p>
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
            
            {/* Edit Profile Section */}
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
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="name">Nombre</label>
                      <input 
                        id="name"
                        type="text" 
                        defaultValue={userData.name}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="email">Email</label>
                      <input 
                        id="email"
                        type="email" 
                        defaultValue={userData.email}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="phone">Teléfono</label>
                      <input 
                        id="phone"
                        type="tel" 
                        defaultValue={userData.phone}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">Guardar Cambios</Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
