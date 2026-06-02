import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import logoImg from '/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';
import { useStore } from '@/stores/store';

interface InviteData {
  valid: true;
  inviter_name: string;
  invited_email: string;
  email_has_account: boolean;
  access_level: string;
  access_level_label: string;
  entity: {
    type: string;
    id: number;
    title: string;
  };
  expires_at: string | null;
}

interface InvalidInvite {
  valid: false;
  reason: 'not_found' | 'revoked' | 'expired' | 'already_accepted';
}

type ResolveResponse = { data: InviteData | InvalidInvite };

/**
 * Landing page del magic link de un invite de entity sharing.
 *
 * Flujo:
 *  1. Resolver token via GET /api/invites/{token} → muestra qué se compartió
 *  2. Según el estado del email del invite:
 *     - email ya tiene cuenta → form login (password)
 *     - email nuevo → form registro (name + password)
 *     - usuario ya logueado en otra sesión → botón "Aceptar"
 *  3. POST /api/invites/{token}/accept → backend hace Auth::login + vincula share
 *  4. Redirigir a /admin/{type}s/{id}/stats con sesión activa
 *
 * Patrón análogo a ResetPassword.tsx (mismo manejo de token/email en URL,
 * misma estética del Card centrado con logo).
 */
const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();
  const { user, setUser, setIsLoggedIn } = useStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state — cambia según el path (register/login/just-accept)
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // 1. Resolver el token al montar
  useEffect(() => {
    if (!token) {
      setError('Link inválido — falta el token.');
      setIsLoading(false);
      return;
    }
    api.get<ResolveResponse>(`api/invites/${token}`)
      .then((res) => {
        if (res.data.data.valid) {
          setInvite(res.data.data);
        } else {
          setError(reasonToMessage(res.data.data.reason));
        }
      })
      .catch((err) => {
        const status = err.response?.status;
        const body = err.response?.data?.data;
        if (body?.reason) {
          setError(reasonToMessage(body.reason));
        } else if (status === 404) {
          setError('Invitación no encontrada. El link puede estar mal copiado.');
        } else {
          setError('No pudimos cargar la invitación. Intentá de nuevo.');
        }
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setIsSubmitting(true);

    // Construir body según el path
    const body: Record<string, string> = {};
    if (!user && invite) {
      if (invite.email_has_account) {
        // Path 2: login con password
        if (password.length < 6) {
          toast({ title: 'La contraseña tiene al menos 6 caracteres', variant: 'destructive' });
          setIsSubmitting(false);
          return;
        }
        body.password = password;
      } else {
        // Path 3: registro
        if (name.trim().length < 2) {
          toast({ title: 'Ingresá tu nombre', variant: 'destructive' });
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          toast({ title: 'La contraseña tiene al menos 6 caracteres', variant: 'destructive' });
          setIsSubmitting(false);
          return;
        }
        body.name = name.trim();
        body.password = password;
      }
    }

    try {
      // CSRF cookie para que las path 2 y 3 puedan hacer Auth::login + session
      await api.get('sanctum/csrf-cookie');

      const res = await api.post(`api/invites/${token}/accept`, body);
      const data = res.data?.data;

      if (data?.user) {
        setUser(data.user);
        setIsLoggedIn(true);
      }

      toast({
        title: '¡Invitación aceptada!',
        description: `Te llevamos al panel del ${invite?.entity.type === 'event' ? 'evento' : 'recurso'}.`,
      });

      // El admin Vue Metronic vive en /admin/* (Laravel-served), redirigir con location.assign
      // para que el navegador haga full reload y el Vue admin lea la sesión nueva.
      const redirect = data?.redirect_to ?? '/admin/dashboard';
      window.location.assign(redirect);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'No pudimos aceptar la invitación. Intentá de nuevo.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------- Render --------

  if (isLoading) {
    return (
      <Centered>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">Cargando invitación...</p>
      </Centered>
    );
  }

  if (error || !invite) {
    return (
      <Centered>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-red-600" />
            </div>
            <CardTitle>Invitación no válida</CardTitle>
            <CardDescription>{error ?? 'No pudimos resolver la invitación.'}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="outline">
              <Link to="/">Volver al inicio</Link>
            </Button>
          </CardFooter>
        </Card>
      </Centered>
    );
  }

  // Texto del path actual
  const isLoggedInWithMatchingEmail = user && user.email?.toLowerCase() === invite.invited_email.toLowerCase();
  const isLoggedInWithDifferentEmail = user && !isLoggedInWithMatchingEmail;

  return (
    <Centered>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <MailCheck className="h-7 w-7 text-primary" />
          </div>
          <CardTitle>Te invitaron a APACG</CardTitle>
          <CardDescription>
            <strong>{invite.inviter_name}</strong> compartió{' '}
            <strong>"{invite.entity.title}"</strong> con vos.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/40 p-4 text-sm">
            <p className="font-medium mb-1">¿Qué vas a poder ver?</p>
            <p className="text-muted-foreground">{invite.access_level_label}</p>
            {invite.expires_at && (
              <p className="mt-2 text-xs text-amber-700">
                Vence: {new Date(invite.expires_at).toLocaleDateString('es-PY')}
              </p>
            )}
          </div>

          {isLoggedInWithDifferentEmail && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Esta invitación es para <strong>{invite.invited_email}</strong>, pero estás
              logueado como <strong>{user!.email}</strong>. Cerrá sesión y volvé al link, o pedile al
              que te invitó que la mande al email correcto.
            </div>
          )}

          {!user && !invite.email_has_account && (
            <>
              <p className="text-sm text-muted-foreground">
                Vamos a crear tu cuenta APACG con el email <strong>{invite.invited_email}</strong>.
              </p>
              <div>
                <Label htmlFor="name">Tu nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                  disabled={isSubmitting}
                  autoComplete="name"
                />
              </div>
              <div>
                <Label htmlFor="password">Elegí una contraseña (mín. 6 caracteres)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </div>
            </>
          )}

          {!user && invite.email_has_account && (
            <>
              <p className="text-sm text-muted-foreground">
                Ya tenés cuenta APACG con <strong>{invite.invited_email}</strong>. Ingresá tu contraseña para aceptar.
              </p>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </div>
            </>
          )}

          {isLoggedInWithMatchingEmail && (
            <p className="text-sm text-muted-foreground text-center">
              Estás logueado como <strong>{user!.email}</strong>. Tocá "Aceptar" para acceder.
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={handleAccept}
            disabled={isSubmitting || !!isLoggedInWithDifferentEmail}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Aceptando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aceptar invitación
              </>
            )}
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/">Cancelar</Link>
          </Button>
        </CardFooter>
      </Card>
    </Centered>
  );
};

const Centered = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
    <Link to="/" className="mb-6">
      <img src={logoImg} alt="APACG" className="h-14 w-auto" />
    </Link>
    {children}
  </div>
);

const reasonToMessage = (reason: string): string => {
  switch (reason) {
    case 'not_found': return 'La invitación no existe. El link puede estar mal copiado.';
    case 'revoked': return 'Esta invitación fue revocada por el creador. Pedile que te mande una nueva.';
    case 'expired': return 'Esta invitación venció. Pedile al creador que te mande una nueva.';
    case 'already_accepted': return 'Esta invitación ya fue aceptada. Iniciá sesión normalmente.';
    default: return 'Invitación inválida.';
  }
};

export default AcceptInvite;
