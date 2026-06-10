import React from 'react';

type Brand180Props = {
  /** Usa la versión blanca del logo (para fondos oscuros). */
  white?: boolean;
  /** Clases para el <img> (controlan la altura, ej. "h-5"). */
  className?: string;
  /** utm_medium para atribuir la superficie de origen del clic. */
  medium?: string;
};

/**
 * Marca "Plataforma desarrollada por 180softlab" reutilizable.
 * Usa <img> (no SVG inline) para evitar colisiones de IDs del SVG y
 * mantener una sola fuente de verdad del logo en /public/brand.
 */
const Brand180: React.FC<Brand180Props> = ({
  white = false,
  className = 'h-5',
  medium = 'web',
}) => (
  <a
    href={`https://180softlab.com/?utm_source=apacg&utm_medium=${medium}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="180softlab — desarrollo de software a medida"
    className="inline-flex items-center transition-opacity hover:opacity-80"
  >
    <img
      src={`${import.meta.env.BASE_URL}brand/${white ? '180softlab-wordmark-white.svg' : '180softlab-wordmark.svg'}`}
      alt="180softlab"
      className={className}
      width={193}
      height={40}
    />
  </a>
);

export default Brand180;
