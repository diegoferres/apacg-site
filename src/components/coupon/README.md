# Sistema de Cupones - Componentes React

Este directorio contiene todos los componentes React para el sistema de cupones de descuento de APACG.

## Componentes Principales

### `useUrlCoupon` Hook

Hook principal para manejar cupones detectados en URL y persistencia entre páginas.

```tsx
import { useUrlCoupon } from '../../hooks/useUrlCoupon';

const CourseDetail = () => {
  const {
    appliedCoupon,
    status,
    error,
    removeCoupon,
    applyCoupon,
    isLoading
  } = useUrlCoupon({
    itemType: 'course',
    itemId: 1,
    autoApply: true
  });

  // Resto del componente...
};
```

### `CouponAppliedBanner`

Banner que muestra cuando un cupón está aplicado con opción de removerlo.

```tsx
import { CouponAppliedBanner } from '../coupon';

<CouponAppliedBanner
  coupon={appliedCoupon}
  context="course" // 'course' | 'enrollment' | 'checkout'
  onRemove={removeCoupon}
/>
```

### `CouponInput`

Input para aplicar cupones manualmente.

```tsx
import { CouponInput } from '../coupon';

<CouponInput
  onCouponApplied={handleApplyCoupon}
  isLoading={loading}
  error={error}
  placeholder="Ingresa tu código"
/>
```

### `PriceBreakdown`

Componente que muestra desglose de precios con descuentos aplicados.

```tsx
import { PriceBreakdown } from '../coupon';

const items = [
  { id: 1, name: "Curso de Liderazgo", price: 150000 }
];

<PriceBreakdown
  items={items}
  appliedCoupon={appliedCoupon}
  onRemoveCoupon={removeCoupon}
  title="Resumen de precios"
/>
```

## Servicios

### `CouponPersistenceService`

Servicio para manejar la persistencia de cupones en sessionStorage.

```tsx
import { CouponPersistenceService } from '../../services/CouponPersistenceService';

// Guardar cupón para un item
CouponPersistenceService.setCouponForItem('course', 1, couponData);

// Obtener cupón de un item
const coupon = CouponPersistenceService.getCouponForItem('course', 1);

// Transferir al checkout
const coupons = CouponPersistenceService.transferToCheckout();

// Limpiar todo
CouponPersistenceService.clearAll();
```

## Flujo de Uso

### 1. Página de Curso con URL Coupon

```
URL: /curso/liderazgo?coupon=SAVE20
```

1. `useUrlCoupon` detecta el cupón automáticamente
2. Valida con la API `/api/client/coupons/preview/course/1/SAVE20`
3. Muestra `CouponAppliedBanner` si es válido
4. Persiste el cupón para uso posterior

### 2. Proceso de Enrollment

1. Carga cupón persistido del curso
2. Muestra `PriceBreakdown` con descuento aplicado
3. Permite remover o agregar otros cupones
4. Transfiere cupón al checkout al completar

### 3. Checkout Final

1. Carga cupones transferidos desde enrollment
2. Permite validar cupones adicionales
3. Calcula totales finales con todos los descuentos
4. Integra con Bancard para procesamiento de pago

## API Endpoints

### Cliente (Frontend)

```
GET  /api/client/coupons/preview/{type}/{id}/{code}    # Pre-validación
POST /api/client/coupons/validate                     # Validación completa
POST /api/client/coupons/apply                        # Aplicar a orden
GET  /api/client/coupons/available/{type}/{id}        # Cupones disponibles
DEL  /api/client/coupons/remove/{type}/{id}           # Remover de sesión
```

## Tipos de Datos

### `AppliedCoupon`

```tsx
interface AppliedCoupon {
  coupon: {
    id: number;
    code: string;
    name: string;
    description?: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
  };
  pricing: {
    original_price: number;
    discount_amount: number;
    final_price: number;
    discount_percentage: number;
  };
  valid: boolean;
  timestamp: number;
}
```

## Ejemplos Completos

Ver los archivos de ejemplo:
- `CourseDetailWithCoupon.tsx` - Página de curso
- `EnrollmentFormWithCoupon.tsx` - Proceso de inscripción  
- `CheckoutWithCoupons.tsx` - Checkout con cupones

## Consideraciones

### Seguridad
- Validación siempre en backend
- No confiar en datos del frontend
- Verificar permisos por usuario

### UX
- Confirmación para remover cupones en checkout
- Loading states para validaciones
- Mensajes de error claros
- Persistencia entre navegación

### Performance  
- Debounce en validaciones
- Cleanup automático de cupones expirados
- Minimizar calls a API

### Testing
- Unit tests para components
- Integration tests para flujo completo
- E2E tests para URLs con cupones