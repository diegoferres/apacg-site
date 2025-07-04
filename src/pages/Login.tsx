
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
  const [isEmail, setIsEmail] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
    setGlobalLoading(true);

    try {
      await api.get('sanctum/csrf-cookie');

      const payload = isEmail
        ? { email: values.email, password: values.password }
        : { cedula: values.cedula, password: values.password };

      try {
        const response = await api.post('api/login', payload);
        console.log(response.data);

        const userData = response.data.user;
        const redirect_to = response.data.redirect_to;

        setUser(userData);
        setIsLoggedIn(true);
        setGlobalLoading(false);

        toast({
          title: `¡Bienvenido, ${userData.name}!`,
        });

        // Verificar si hay un parámetro de retorno
        const returnTo = searchParams.get('returnTo');
        
        setTimeout(() => {
          if (returnTo) {
            navigate(returnTo);
          } else {
            window.location = redirect_to;
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

  const toggleForm = () => {
    setIsEmail(!isEmail);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-6">
          <Link to="/">
            <div className="flex items-center justify-center gap-2 text-primary">
              <img src={import.meta.env.VITE_API_BASE_URL + "/react/logo.png"} alt="Logo" className="h-20 w-18" />
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
