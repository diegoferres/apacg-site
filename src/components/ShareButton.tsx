import { useState } from 'react';
import { Share2, Link2, MessageCircle, Facebook, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export type ShareEntityType = 'event' | 'raffle' | 'benefit' | 'product' | 'commerce';

interface ShareButtonProps {
  /** Tipo de entidad para construir la URL /share/{type}/{slug} */
  type: ShareEntityType;
  /** Slug del item */
  slug: string;
  /** Texto adicional al compartir (ej: "Mirá este evento") */
  text?: string;
  /** Título del item (usado por Web Share API) */
  title?: string;
  /** Variante visual del botón */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  /** Tamaño del botón */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Mostrar solo icono o icono + label */
  iconOnly?: boolean;
  className?: string;
}

/**
 * Botón compartir reusable.
 *
 * Usa Web Share API nativo en mobile (sheet de share del SO) y dropdown
 * con WhatsApp/Facebook/Email/Copiar link en desktop como fallback.
 *
 * La URL compartida es `/share/{type}/{slug}` que devuelve HTML con OG tags
 * específicos del item — WhatsApp/FB ven preview rico, humanos son redirigidos
 * a la SPA.
 */
export const ShareButton = ({
  type,
  slug,
  text,
  title,
  variant = 'outline',
  size = 'sm',
  iconOnly = false,
  className,
}: ShareButtonProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // URL canónica para que crawlers vean OG tags
  const shareUrl = `${window.location.origin}/share/${type}/${slug}`;
  const shareText = text ?? (title ? `Mirá: ${title}` : '¡Mirá esto!');

  const tryNativeShare = async (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: title ?? 'APACG',
          text: shareText,
          url: shareUrl,
        });
        return true;
      } catch (err) {
        // Usuario canceló — no mostrar error
        if ((err as Error)?.name === 'AbortError') return true;
      }
    }
    return false;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: 'Link copiado', description: 'Pegalo donde quieras compartirlo.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'No pudimos copiar', variant: 'destructive' });
    }
  };

  const buildExternalUrl = (target: 'whatsapp' | 'facebook' | 'email') => {
    const enc = encodeURIComponent(shareUrl);
    const encText = encodeURIComponent(`${shareText}\n${shareUrl}`);
    switch (target) {
      case 'whatsapp':
        return `https://wa.me/?text=${encText}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${enc}`;
      case 'email':
        return `mailto:?subject=${encodeURIComponent(title ?? 'APACG')}&body=${encText}`;
    }
  };

  const handleClick = async () => {
    // En mobile, intenta compartir nativo primero. Si está disponible (mayoría
    // de móviles modernos), no abre el dropdown.
    const ok = await tryNativeShare();
    if (ok) return;
    // En desktop sin Web Share API, el DropdownMenuTrigger maneja el click
    // y abre el menú. No hace falta hacer nada acá.
  };

  // Si Web Share API no está disponible, renderizar dropdown
  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  if (hasNativeShare) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={className}
        aria-label="Compartir"
      >
        <Share2 className="h-4 w-4" />
        {!iconOnly && <span className="ml-2">Compartir</span>}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} aria-label="Compartir">
          <Share2 className="h-4 w-4" />
          {!iconOnly && <span className="ml-2">Compartir</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <a href={buildExternalUrl('whatsapp')} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
            WhatsApp
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={buildExternalUrl('facebook')} target="_blank" rel="noopener noreferrer">
            <Facebook className="h-4 w-4 mr-2 text-blue-600" />
            Facebook
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={buildExternalUrl('email')}>
            <Mail className="h-4 w-4 mr-2 text-amber-600" />
            Email
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          {copied
            ? <Check className="h-4 w-4 mr-2 text-green-600" />
            : <Link2 className="h-4 w-4 mr-2" />}
          {copied ? 'Copiado' : 'Copiar link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
