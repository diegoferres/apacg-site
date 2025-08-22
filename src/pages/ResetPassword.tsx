import { useState, useEffect } from 'react';
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
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '@/services/api';

const formSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Las contraseñas no coinciden",
  path: ["password_confirmation"],
});

const ResetPassword = () => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    // Validar que tengamos token y email
    if (!token || !email) {
      toast({
        title: "Enlace inválido",
        description: "El enlace de recuperación es inválido o está incompleto",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [token, email, navigate, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token || !email) {
      toast({
        title: "Error",
        description: "Faltan datos necesarios para restablecer la contraseña",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await api.get('sanctum/csrf-cookie');

      const response = await api.post('api/password/reset', {
        token,
        email,
        password: values.password,
        password_confirmation: values.password_confirmation
      });

      if (response.data.success) {
        setIsSuccess(true);
        toast({
          title: "¡Contraseña restablecida!",
          description: "Tu contraseña ha sido actualizada exitosamente",
        });

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "No se pudo restablecer la contraseña",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Ha ocurrido un error inesperado";
      
      toast({
        title: "Error al restablecer contraseña",
        description: errorMessage,
        variant: "destructive",
      });

      // Si el token expiró o es inválido, redirigir al login
      if (errorMessage.includes('expirado') || errorMessage.includes('inválido')) {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordConfirmVisibility = () => {
    setShowPasswordConfirm(!showPasswordConfirm);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
        <div className="w-full max-w-md animate-scale-in">
          <Card className="glass shadow-sm border-border/40">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">¡Contraseña Restablecida!</h2>
                <p className="text-muted-foreground mb-4">
                  Tu contraseña ha sido actualizada exitosamente.
                </p>
                <p className="text-sm text-muted-foreground">
                  Serás redirigido al login en unos segundos...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <CardTitle className="text-2xl font-bold text-center">Nueva Contraseña</CardTitle>
            <CardDescription className="text-center">
              Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta
            </CardDescription>
            {email && (
              <p className="text-sm text-center text-muted-foreground mt-2">
                Cuenta: <strong>{email}</strong>
              </p>
            )}
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mínimo 6 caracteres"
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

                <FormField
                  control={form.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showPasswordConfirm ? "text" : "password"}
                            placeholder="Repite tu contraseña"
                            className="pl-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                            onClick={togglePasswordConfirmVisibility}
                          >
                            {showPasswordConfirm ?
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
                  {isLoading ? "Restableciendo..." : "Restablecer Contraseña"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login" className="text-muted-foreground flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Volver al Login
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

export default ResetPassword;