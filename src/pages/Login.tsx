
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { ArrowLeft, Lock, Mail, Eye, EyeOff, IdCard } from 'lucide-react';
import api from '@/services/api';
import { useStore } from '@/stores/store';
import analytics from '@/services/analytics';

const formSchema = z.object({
  identifier: z.string().min(1, "Este campo es requerido"),
  password: z.string().optional(),
});

const Login = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'email' | 'cedula'>('email');
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setIsLoggedIn, setIsLoading: setGlobalLoading } = useStore();
  const { user } = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validar formato según el modo
    const identifier = values.identifier.trim();
    
    // Validar password solo en modo login
    if (mode === 'login' && (!values.password || values.password.trim() === '')) {
      toast({
        title: "Error",
        description: "La contraseña es requerida",
        variant: "destructive",
      });
      return;
    }
    
    if (loginMode === 'email') {
      // Validar que sea un email válido (permite formatos como admin@apacg sin TLD)
      const emailRegex = /^[^\s@]+@[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        toast({
          title: "Error de validación",
          description: "Por favor ingrese un correo electrónico válido",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Validar que NO sea un email cuando está en modo cédula
      if (identifier.includes('@')) {
        toast({
          title: "Error de validación",
          description: "Por favor ingrese una cédula válida, no un correo electrónico",
          variant: "destructive",
        });
        return;
      }
    }

    // Si estamos en modo forgot, llamar a la API de recuperación
    if (mode === 'forgot') {
      setIsLoading(true);
      try {
        await api.get('sanctum/csrf-cookie');
        
        const payload = loginMode === 'email'
          ? { email: identifier }
          : { cedula: identifier };

        const response = await api.post('api/password/forgot', payload);
        
        toast({
          title: "Enlace enviado",
          description: response.data.message || "Se ha enviado un enlace de recuperación a tu correo",
        });
        
        // Volver al modo login después de enviar
        setTimeout(() => {
          setMode('login');
          form.reset();
        }, 2000);
        
      } catch (error) {
        const errorData = error.response?.data;
        
        if (errorData?.type === 'no_email') {
          toast({
            title: "Sin correo registrado",
            description: errorData.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorData?.message || "No se pudo procesar tu solicitud",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setGlobalLoading(true);

    try {
      await api.get('sanctum/csrf-cookie');

      const payload = loginMode === 'email'
        ? { email: identifier, password: values.password! }
        : { cedula: identifier, password: values.password! };

      try {
        const response = await api.post('api/login', payload);
        console.log(response.data);

        const userData = response.data.user;
        const redirect_to = response.data.redirect_to;

        setUser(userData);
        setIsLoggedIn(true);
        
        // Track login exitoso en GA4
        analytics.trackLogin(loginMode);
        setGlobalLoading(false);

        toast({
          title: `¡Bienvenido, ${userData.name}!`,
        });

        // Verificar si hay un parámetro de retorno
        const returnTo = searchParams.get('returnTo');
        
        // Debug logging
        console.log('Login.tsx - Redirect debug:', {
          returnTo,
          redirect_to,
          searchParams: searchParams.toString(),
          currentURL: window.location.href
        });
        
        setTimeout(() => {
          if (returnTo && returnTo.trim()) {
            console.log('Login.tsx - Navigating to returnTo:', returnTo);
            try {
              // Usar navigate para URLs internas, window.location para URLs externas
              if (returnTo.startsWith('/')) {
                navigate(returnTo);
              } else {
                window.location.href = returnTo;
              }
            } catch (error) {
              console.error('Login.tsx - Error navigating to returnTo:', error);
              // Fallback al redirect_to del backend si hay error
              window.location = redirect_to || '/';
            }
          } else if (redirect_to) {
            console.log('Login.tsx - Using backend redirect_to:', redirect_to);
            window.location = redirect_to;
          } else {
            console.log('Login.tsx - No redirect specified, going to home');
            navigate('/');
          }
        }, 500);
        console.log('user', userData);
      } catch (error) {
        console.log('Error capturado');
        console.log(error.response?.data);

        const errorMessage = error.response?.data?.message || "Correo o contraseña incorrectos";

        toast({
          title: "Error al iniciar sesión",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error al iniciar sesión",
        description: "Ha ocurrido un error inesperado. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setGlobalLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-6">
          <Link to="/">
            <div className="flex items-center justify-center gap-2 text-primary">
              <img src="/favicon-96x96.png" alt="Logo" className="h-20 w-18" />
            </div>
          </Link>
        </div>

        <Card className="glass shadow-sm border-border/40">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {mode === 'login' ? 'Iniciar Sesión' : 'Recuperar Contraseña'}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === 'login' 
                ? 'Ingresa tus credenciales para acceder a tu cuenta'
                : 'Ingresa tu correo o cédula para recuperar tu contraseña'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={loginMode} onValueChange={(value) => setLoginMode(value as 'email' | 'cedula')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Correo
                </TabsTrigger>
                <TabsTrigger value="cedula" className="flex items-center gap-2">
                  <IdCard className="h-4 w-4" />
                  Cédula
                </TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {loginMode === 'email' ? 'Correo Electrónico' : 'Número de Cédula'}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            {loginMode === 'email' ? (
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            ) : (
                              <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            )}
                            <Input
                              placeholder={loginMode === 'email' ? 'tu@email.com' : 'Tu número de cédula'}
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {mode === 'login' && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                                onClick={togglePasswordVisibility}
                              >
                                {showPassword ?
                                  <EyeOff className="h-4 w-4" /> :
                                  <Eye className="h-4 w-4" />
                                }
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading 
                      ? (mode === 'login' ? "Iniciando sesión..." : "Enviando enlace...")
                      : (mode === 'login' ? "Iniciar Sesión" : "Enviar enlace de recuperación")
                    }
                  </Button>

                  {mode === 'forgot' && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setMode('login');
                        form.clearErrors();
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver al login
                    </Button>
                  )}
                </form>
              </Form>
            </Tabs>

            {mode === 'login' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    form.clearErrors();
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="text-muted-foreground flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Volver a Inicio
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          © {new Date().getFullYear()} A.P.A.C. GOETHE. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
