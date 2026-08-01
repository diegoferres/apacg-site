import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export interface Crumb {
  /** Texto visible. El ultimo crumb se muestra como actual (sin enlace). */
  label: string;
  /** Destino. Si falta, el crumb no es navegable. */
  to?: string;
}

interface Props {
  crumbs: Crumb[];
  /** Que hace el boton volver. Por defecto, historial hacia atras. */
  onBack?: () => void;
  /** Texto del boton volver en pantallas medianas y grandes. */
  backLabel?: string;
  className?: string;
}

/**
 * Encabezado de pantalla: breadcrumb + volver, con el mismo espaciado en todo el sitio.
 *
 * Existe porque cada pantalla resolvia esto por su cuenta (margenes distintos, el volver a
 * veces arriba y a veces abajo del breadcrumb) y el resultado no era consistente.
 *
 * En mobile el volver es solo un icono en la misma fila del breadcrumb: ahi el alto es caro y
 * una fila entera para un boton de texto se nota. Desde md pasa a fila propia con texto.
 * El espacio con el navbar lo pone la clase `page-top` del contenedor de la pantalla.
 */
export const PageHeader = ({ crumbs, onBack, backLabel = 'Volver', className = '' }: Props) => {
  const navigate = useNavigate();
  const volver = onBack ?? (() => navigate(-1));

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center gap-2 md:block">
        <Button
          variant="ghost"
          size="icon"
          onClick={volver}
          aria-label={backLabel}
          className="-ml-2 h-8 w-8 shrink-0 md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground md:gap-2"
        >
          {crumbs.map((c, i) => {
            const ultimo = i === crumbs.length - 1;
            return (
              <span key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1.5 md:gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {ultimo || !c.to ? (
                  <span className="truncate font-medium text-foreground" aria-current={ultimo ? 'page' : undefined}>
                    {c.label}
                  </span>
                ) : (
                  <Link to={c.to} className="whitespace-nowrap transition-colors hover:text-foreground">
                    {c.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>

        <Button variant="ghost" onClick={volver} className="mt-4 hidden md:inline-flex">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
