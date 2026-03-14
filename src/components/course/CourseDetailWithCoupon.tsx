import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUrlCoupon } from '../../hooks/useUrlCoupon';
import CouponAppliedBanner from '../coupon/CouponAppliedBanner';
import CouponInput from '../coupon/CouponInput';
import PriceBreakdown from '../coupon/PriceBreakdown';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatPrice } from '../../utils/formatters';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  slug: string;
  image?: string;
}

// Este es un componente de ejemplo que muestra cómo integrar cupones en una página de curso
const CourseDetailWithCoupon: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Hook para manejar cupones con URL
  const {
    appliedCoupon,
    status: couponStatus,
    error: couponError,
    removeCoupon,
    applyCoupon,
    isLoading: couponLoading
  } = useUrlCoupon({
    itemType: 'course',
    itemId: course?.id || 0,
    autoApply: true
  });

  // Simular carga de curso (reemplazar con API call real)
  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        // Simular API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Datos de ejemplo (reemplazar con API real)
        setCourse({
          id: 1,
          title: "Mister Wiz - Formación de Líderes",
          description: "Curso completo de liderazgo y desarrollo personal",
          price: 150000,
          slug: slug || '',
          image: "/images/course-placeholder.jpg"
        });
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  const handleApplyCoupon = async (code: string): Promise<boolean> => {
    return await applyCoupon(code);
  };

  const handleEnroll = () => {
    // Aquí se manejaría la inscripción
    // Si hay cupón aplicado, se mantendría en el flujo
    console.log('Enrolling with coupon:', appliedCoupon?.coupon.code);
    
    // Redirigir al enrollment manteniendo el cupón
    if (appliedCoupon) {
      // El cupón ya está persistido por useUrlCoupon
      window.location.href = `/enrollment/${course?.slug}`;
    } else {
      window.location.href = `/enrollment/${course?.slug}`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Curso no encontrado</p>
      </div>
    );
  }

  const priceItems = [
    {
      id: course.id,
      name: course.title,
      price: course.price
    }
  ];

  const finalPrice = appliedCoupon 
    ? course.price - appliedCoupon.pricing.discount_amount 
    : course.price;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header del curso */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-lg text-gray-600">{course.description}</p>
      </div>

      {/* Banner de cupón aplicado (si hay uno) */}
      {appliedCoupon && (
        <CouponAppliedBanner
          coupon={appliedCoupon}
          context="course"
          onRemove={removeCoupon}
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del curso */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Curso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600">
                {course.description}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Duración</h3>
              <p className="text-gray-600">12 semanas</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Modalidad</h3>
              <p className="text-gray-600">Presencial y Online</p>
            </div>
          </CardContent>
        </Card>

        {/* Precio y cupones */}
        <div className="space-y-4">
          {/* Desglose de precios */}
          <PriceBreakdown
            items={priceItems}
            appliedCoupon={appliedCoupon}
            onRemoveCoupon={removeCoupon}
            title="Precio del curso"
            className="mb-4"
          />

          {/* Input de cupón (si no hay uno aplicado) */}
          {!appliedCoupon && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Tienes un cupón de descuento?</CardTitle>
              </CardHeader>
              <CardContent>
                {!showCouponInput ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowCouponInput(true)}
                    className="w-full"
                  >
                    Aplicar cupón de descuento
                  </Button>
                ) : (
                  <CouponInput
                    onCouponApplied={handleApplyCoupon}
                    isLoading={couponLoading}
                    error={couponError}
                    placeholder="Ej: SAVE20"
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Botón de inscripción */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-2xl font-bold text-green-600">
                  Gs. {formatPrice(finalPrice)}
                  {appliedCoupon && (
                    <div className="text-sm text-gray-500 line-through">
                      Gs. {formatPrice(course.price)}
                    </div>
                  )}
                  {/* Indicador de descuento recurrente */}
                  {appliedCoupon && (appliedCoupon.coupon as any).is_recurring && (
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      💫 Precio mensual con descuento recurrente
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleEnroll}
                  size="lg"
                  className="w-full text-lg py-3"
                >
                  Inscribirse Ahora
                </Button>
                
                <p className="text-xs text-gray-500">
                  🔒 Pago seguro con Bancard
                  {appliedCoupon && (appliedCoupon.coupon as any).is_recurring && (
                    <span className="block text-blue-600 font-medium mt-1">
                      ✨ El descuento se aplicará automáticamente cada mes
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>¿Por qué elegir este curso?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Instructores certificados con experiencia internacional</li>
            <li>Material de estudio actualizado y práctico</li>
            <li>Certificación reconocida por APACG</li>
            <li>Acceso a comunidad exclusiva de ex-alumnos</li>
            <li>Soporte técnico durante todo el curso</li>
          </ul>
        </CardContent>
      </Card>

      {/* Debug info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-700">
            <div>Coupon Status: {couponStatus}</div>
            <div>Applied Coupon: {appliedCoupon?.coupon.code || 'None'}</div>
            <div>Coupon Loading: {couponLoading ? 'Yes' : 'No'}</div>
            <div>Error: {couponError || 'None'}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseDetailWithCoupon;