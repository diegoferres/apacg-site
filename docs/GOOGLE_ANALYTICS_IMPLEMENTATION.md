# Google Analytics 4 - Guía de Implementación Completa

## 📊 Configuración Completada

### Measurement ID
- **ID de GA4**: `G-89V72T7N4S`
- **Configurado en**: `.env` como `VITE_GA4_MEASUREMENT_ID`

## 🎯 Eventos Implementados - TODAS LAS PÁGINAS

### 1. **Tracking Automático de Páginas (TODAS)**
- **Implementado en**: `App.tsx` con el componente `RouteTracker`
- **Cubre**: TODAS las 24 páginas de la aplicación automáticamente
- **Incluye**: título de página, URL completa, parámetros de búsqueda, propiedades de usuario

### 2. **Eventos de Conversión**

#### Login (`login`)
- **Archivo**: `Login.tsx`
- **Disparado cuando**: Usuario inicia sesión exitosamente
- **Parámetros**: método (email/cedula)

#### Registro (`sign_up`)
- **Archivo**: `Register.tsx`
- **Disparado cuando**: Usuario completa el registro
- **Parámetros**: método (email)

#### Inicio de Checkout (`begin_checkout`)
- **Archivo**: `Checkout.tsx`
- **Disparado cuando**: Usuario procede al pago
- **Parámetros**: valor, items detallados, currency

#### Compra Completada (`purchase`)
- **Archivo**: `PaymentSuccess.tsx`
- **Disparado cuando**: Pago procesado exitosamente
- **Parámetros**: transaction_id, valor, items detallados, currency

#### Inscripción a Curso (`course_enrollment`)
- **Archivo**: `CourseDetail.tsx`
- **Disparado cuando**: Usuario selecciona inscribirse
- **Parámetros**: course_id, course_name, group_id

#### Compra de Tickets (`ticket_purchase`)
- **Archivo**: `EventDetail.tsx`
- **Disparado cuando**: Usuario procede a comprar tickets
- **Parámetros**: event_id, event_name, quantity, value

#### Inscripción a Rifa (`raffle_entry`)
- **Archivo**: `RaffleDetail.tsx`
- **Disparado cuando**: Usuario procede a participar
- **Parámetros**: raffle_id, raffle_name

### 3. **Eventos de Interacción Completos**

#### Ver Item (`view_item`) - 6 Páginas
- **EventDetail.tsx** - Al ver detalles de evento
- **RaffleDetail.tsx** - Al ver detalles de rifa
- **CourseDetail.tsx** - Al ver detalles de curso
- **BenefitDetail.tsx** - Al ver detalles de beneficio
- **CommerceDetail.tsx** - Al ver detalles de comercio
- **NewsDetail.tsx** - Al ver detalles de noticia

#### Ver Lista de Items (`view_item_list`) - 6 Páginas
- **Events.tsx** - Lista de eventos con búsqueda
- **Raffles.tsx** - Lista de rifas con búsqueda
- **Benefits.tsx** - Lista de beneficios con filtros
- **Courses.tsx** - Lista de cursos con búsqueda
- **CommerceDetail.tsx** - Lista de beneficios/cursos del comercio
- **Commerces.tsx** - Lista de comercios

#### Búsqueda (`search`)
- **Events.tsx** - Búsqueda de eventos
- **Raffles.tsx** - Búsqueda de rifas
- **Benefits.tsx** - Búsqueda de beneficios
- **Courses.tsx** - Búsqueda de cursos

#### Agregar al Carrito (`add_to_cart`)
- **EventDetail.tsx** - Al seleccionar tickets
- **RaffleDetail.tsx** - Al aumentar cantidad
- **Checkout.tsx** - Al proceder con la compra

#### Uso de Beneficio (`benefit_use`)
- **BenefitDetail.tsx** - Al reclamar beneficio

### 4. **Eventos de Pago y Proceso**

#### Información de Pago (`add_payment_info`)
- **Payment.tsx** - Al cargar página de pago

#### Éxito de Pago (`payment_success`)
- **Payment.tsx** - Al completar pago exitosamente

#### Error de Pago (`payment_error`)
- **Payment.tsx** - Al fallar el pago

### 5. **Eventos de Perfil y Usuario**

#### Ver Perfil (`view_profile`)
- **Profile.tsx** - Al acceder al perfil

### 6. **Eventos del Home**

#### Ver Home - Noticias (`view_home_news`)
- **Index.tsx** - Al cargar noticias en home

#### Ver Home - Eventos (`view_home_events`)
- **Index.tsx** - Al cargar eventos en home

### 7. **Eventos de Filtros**

#### Filtro Aplicado (`filter_applied`)
- **Benefits.tsx** - Al aplicar filtros de categoría

### 8. **Propiedades de Usuario Automáticas**
Configuradas automáticamente en cada navegación:
- `user_type`: member/guest/student
- `membership_status`: Estado de membresía
- `students_count`: Cantidad de estudiantes registrados
- `user_id`: ID único para cross-device tracking

## 🔧 Archivos Clave

### Servicio de Analytics
**Archivo**: `src/services/analytics.ts`

Funciones disponibles:
- `initialize()` - Inicializa GA4
- `trackPageView(path)` - Rastrea vista de página
- `trackEvent(name, params)` - Evento personalizado
- `setUserProperties(props)` - Configura propiedades de usuario
- `setUserId(id)` - Establece ID de usuario para cross-device
- `trackSignUp()` - Registro de usuario
- `trackLogin()` - Login de usuario
- `trackBeginCheckout()` - Inicio de checkout
- `trackPurchase()` - Compra completada
- `trackViewItem()` - Ver item
- `trackBenefitUse()` - Uso de beneficio
- `trackCourseEnrollment()` - Inscripción a curso
- `trackTicketPurchase()` - Compra de tickets
- `trackRaffleEntry()` - Inscripción a sorteo

## 📈 Verificación y Testing

### 1. **DebugView en GA4**
1. Abre [Google Analytics](https://analytics.google.com)
2. Ve a Admin → DebugView
3. En desarrollo, los eventos aparecen en tiempo real

### 2. **Realtime Reports**
1. Ve a Reports → Realtime
2. Verifica usuarios activos y eventos en tiempo real

### 3. **Console del Navegador**
En desarrollo, verás mensajes como:
```
Google Analytics 4 initialized with ID: G-89V72T7N4S
```

### 4. **Verificar en Network Tab**
1. Abre DevTools → Network
2. Filtra por "google-analytics" o "gtag"
3. Deberías ver llamadas a `https://www.google-analytics.com/g/collect`

## 🚀 Próximos Pasos Recomendados

### Configurar Conversiones en GA4:
1. Ve a Admin → Events en GA4
2. Marca estos eventos como conversiones:
   - `sign_up`
   - `purchase`
   - `course_enrollment`
   - `ticket_purchase`

### Crear Audiencias:
1. Admin → Audiences
2. Sugerencias:
   - Usuarios con membresía activa
   - Usuarios con estudiantes registrados
   - Usuarios que completaron compras

### Configurar Objetivos:
1. Configure → Goals
2. Objetivos sugeridos:
   - Completar registro
   - Primera compra
   - Inscripción a curso

## 🔒 Consideraciones de Privacidad

- No se envía información personal sensible (PII)
- Respeta configuración de cookies del navegador
- En desarrollo usa modo debug
- Cumple con GDPR/LGPD si aplica

## 📊 Métricas Clave a Monitorear

1. **Adquisición**:
   - Fuentes de tráfico
   - Campañas más efectivas

2. **Comportamiento**:
   - Páginas más visitadas
   - Flujo de usuarios
   - Tasa de rebote

3. **Conversiones**:
   - Tasa de registro
   - Tasa de conversión de checkout
   - Valor promedio de transacción

4. **Retención**:
   - Usuarios recurrentes
   - Frecuencia de uso

## 🐛 Troubleshooting

### Eventos no aparecen:
1. Verifica que el Measurement ID sea correcto
2. Limpia caché del navegador
3. Verifica en DebugView primero
4. Los eventos pueden tardar hasta 24h en aparecer en reportes estándar

### Pageviews duplicados:
- Verifica que no tengas el script gtag.js en el HTML además del código React

### Eventos no se disparan:
- Abre la consola y busca errores
- Verifica que `analytics.initialize()` se ejecute al inicio

## 📝 Notas de Mantenimiento

- Al agregar nuevas páginas, el tracking es automático
- Para nuevos eventos de conversión, usa los métodos en `analytics.ts`
- Mantén actualizada la documentación al agregar eventos