# Formateo de Precios en Guaraníes

Este documento explica cómo usar las funciones de formateo de precios en guaraníes paraguayos (PYG) implementadas en el sistema.

## Funciones Disponibles

### `formatPrice(amount: number): string`

Función principal para formatear precios usando el formato estándar del sistema.

**Parámetros:**
- `amount`: El monto numérico a formatear

**Retorna:** String con el precio formateado usando el símbolo ₲

**Ejemplo:**
```typescript
import { formatPrice } from '@/lib/utils';

const precio = formatPrice(150000);
console.log(precio); // "₲ 150.000"
```

### `formatGuaraniPrice(amount: number, options?: object): string`

Función avanzada con opciones personalizables para formatear precios en guaraníes.

**Parámetros:**
- `amount`: El monto numérico a formatear
- `options` (opcional): Objeto con las siguientes propiedades:
  - `symbol`: '₲' | 'Gs.' | 'Gs' (por defecto: '₲')
  - `showDecimals`: boolean (por defecto: false)
  - `locale`: string (por defecto: 'es-PY')

**Ejemplos:**
```typescript
import { formatGuaraniPrice } from '@/lib/utils';

// Formato estándar
const precio1 = formatGuaraniPrice(150000);
console.log(precio1); // "₲ 150.000"

// Con símbolo alternativo
const precio2 = formatGuaraniPrice(150000, { symbol: 'Gs.' });
console.log(precio2); // "Gs. 150.000"

// Con símbolo corto
const precio3 = formatGuaraniPrice(150000, { symbol: 'Gs' });
console.log(precio3); // "Gs 150.000"
```

## Características del Formato

### Símbolo de Moneda
- **Símbolo principal:** ₲ (símbolo Unicode del guaraní)
- **Símbolos alternativos:** Gs. o Gs
- **Posición:** Antes del monto con un espacio

### Decimales
- **Por defecto:** Sin decimales (debido a la inflación histórica)
- **Configuración:** Se puede habilitar con `showDecimals: true`
- **Comportamiento:** Los montos se redondean al entero más cercano

### Separadores
- **Miles:** Punto (.) según el estándar español
- **Locale:** es-PY (español de Paraguay)

## Uso en Componentes

### Importación
```typescript
import { formatPrice } from '@/lib/utils';
// o
import { formatGuaraniPrice } from '@/lib/utils';
```

### Ejemplo en React
```tsx
import { formatPrice } from '@/lib/utils';

const ProductCard = ({ product }) => {
  return (
    <div>
      <h3>{product.name}</h3>
      <p className="price">{formatPrice(product.price)}</p>
    </div>
  );
};
```

## Migración

Si tienes código existente que formatea precios manualmente, puedes reemplazarlo:

**Antes:**
```typescript
const formatPrice = (price: number) => {
  return `Gs. ${price.toLocaleString('es-ES')}`;
};
```

**Después:**
```typescript
import { formatPrice } from '@/lib/utils';
// La función ya está disponible globalmente
```

## Consideraciones

1. **Consistencia:** Usa siempre `formatPrice()` para mantener consistencia en toda la aplicación
2. **Rendimiento:** Las funciones están optimizadas y usan `Intl.NumberFormat` internamente
3. **Internacionalización:** El formato respeta las convenciones locales paraguayas
4. **Accesibilidad:** Los precios formateados son legibles por lectores de pantalla

## Archivos Actualizados

Las siguientes páginas y componentes han sido actualizados para usar el nuevo sistema:

- `src/pages/Index.tsx`
- `src/pages/Events.tsx`
- `src/pages/EventDetail.tsx`
- `src/pages/Raffles.tsx`
- `src/pages/RaffleDetail.tsx`
- `src/components/EventPurchaseModal.tsx`

Todos estos archivos ahora importan y usan `formatPrice` desde `@/lib/utils`.