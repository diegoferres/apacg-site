import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { ArrowLeft, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import api from '@/services/api';
import { useStore } from '@/stores/store';

const formSchema = z.object({
  email: z.string(),
  cedula: z.string(),
  password: z.string(),
});

const Login = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmail, setIsEmail] = useState(true); // Estado para alternar entre email y cédula
  const navigate = useNavigate();
  const { setUser, setIsLoggedIn, setIsLoading: setGlobalLoading } = useStore();
  const { user } = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      cedula: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setGlobalLoading(true); // Indicar que está cargando a nivel global

    try {
      // Primero, obtenemos el CSRF token necesario para las solicitudes
      await api.get('sanctum/csrf-cookie');

      // Preparamos el payload con los valores adecuados
      const payload = isEmail
        ? { email: values.email, password: values.password }
        : { cedula: values.cedula, password: values.password };

      // Realizamos la solicitud de login
      try {
        const response = await api.post('api/login', payload);
        console.log(response.data);

        // Manejar la respuesta de login
        const userData = response.data.user;
        const redirect_to = response.data.redirect_to;

        // Actualizar el estado global con la información del usuario
        setUser(userData);
        setIsLoggedIn(true);
        setGlobalLoading(false);

        // Mostrar un mensaje de éxito con el toast
        toast({
          title: `¡Bienvenido, ${userData.name}!`,
        });

        // Usar setTimeout para dar tiempo a que el estado se actualice
        setTimeout(() => {
          // Usar navigate en lugar de window.location para mantener el estado
          window.location = redirect_to;
        }, 500);
        console.log('user', user);
      } catch (error) {
        console.log('Error capturado');
        console.log(error.response?.data);

        // Mostrar mensaje de error específico si está disponible
        const errorMessage = error.response?.data?.message || "Correo o contraseña incorrectos";

        toast({
          title: "Error al iniciar sesión",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      // Manejo de error general
      toast({
        title: "Error al iniciar sesión",
        description: "Ha ocurrido un error inesperado. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setGlobalLoading(false); // Finalizar carga global
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleForm = () => {
    setIsEmail(!isEmail); // Cambiar entre email y cédula
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-6">
          <Link to="/">
            <div className="flex items-center justify-center gap-2 text-primary">
              {/* <School className="h-10 w-10" /> */}
              <img src={import.meta.env.VITE_BASE_URL + "/react/logo.png"} alt="Logo" className="h-20 w-18" />
              {/* <span className="font-bold text-2xl">A.P.A.C. GOETHE</span> */}
            </div>
          </Link>
        </div>

        <Card className="glass shadow-sm border-border/40">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {isEmail ? (
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="tu@email.com"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="cedula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cédula</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Tu cédula"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>
            </Form>

            <div className="mt-4 text-center">
              <Link
                to="/recuperar-contrasena"
                className="text-sm text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
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

        <Button
          onClick={toggleForm}
          variant="outline"
          className="mt-4 w-full"
        >
          {isEmail ? "Iniciar sesión con Cédula" : "Iniciar sesión con Correo"}
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          © {new Date().getFullYear()} A.P.A.C. GOETHE. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
