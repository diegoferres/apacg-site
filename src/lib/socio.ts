/**
 * Un socio "sin hijos" es el que no tiene alumnos que cargar ni anualidad que pagar: el socio
 * externo (sin relacion con el colegio) y el exalumno del Goethe. Los dos entran con la cuota
 * exonerada y su primer ingreso es contacto -> contrasenha, sin pasar por alumnos ni membresia.
 *
 * Vive aca y no repetido en cada pantalla porque la comparacion estaba escrita cuatro veces
 * contra 'external', y al dar de alta a los exalumnos como 'alumni' las cuatro los habrian
 * tratado como padres: les pedirian cargar hijos y quedarian bloqueados apenas entran.
 */
export const socioSinHijos = (origen?: string | null): boolean =>
  origen === 'external' || origen === 'alumni';
