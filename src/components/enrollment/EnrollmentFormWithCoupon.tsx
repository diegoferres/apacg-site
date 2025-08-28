import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CouponPersistenceService } from '../../services/CouponPersistenceService';
import CouponAppliedBanner from '../coupon/CouponAppliedBanner';
import CouponInput from '../coupon/CouponInput';
import PriceBreakdown from '../coupon/PriceBreakdown';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { AppliedCoupon } from '../../hooks/useUrlCoupon';
import { api } from '../../services/api';

interface Student {
  full_name: string;
  ci: string;
  email: string;
  phone: string;
  birth_date: string;
  notes?: string;
}

interface Course {
  id: number;
  title: string;
  price: number;
  slug: string;
}

// Componente de ejemplo para el proceso de enrollment con cupones
const EnrollmentFormWithCoupon: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Datos del estudiante
  const [studentData, setStudentData] = useState<Student>({
    full_name: '',
    ci: '',
    email: '',
    phone: '',
    birth_date: '',
    notes: ''
  });

  // Cargar curso y cupón persistido al montar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Simular carga de curso (reemplazar con API real)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const courseData: Course = {
          id: 1,
          title: "Mister Wiz - Formación de Líderes", 
          price: 150000,
          slug: slug || ''
        };
        
        setCourse(courseData);

        // Verificar si hay un cupón persistido para este curso
        const persistedCoupon = CouponPersistenceService.getCouponForItem('course', courseData.id);
        if (persistedCoupon) {
          setAppliedCoupon(persistedCoupon);
          console.log('Loaded persisted coupon:', persistedCoupon.coupon.code);
        }
        
      } catch (error) {
        console.error('Error loading enrollment data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadData();
    }
  }, [slug]);

  const handleApplyCoupon = async (code: string): Promise<boolean> => {
    if (!course) return false;

    setCouponError(null);
    
    try {
      const response = await api.get(`/api/client/coupons/preview/course/${course.id}/${code}`);
      
      if (response.data.valid) {
        const newCoupon: AppliedCoupon = {
          coupon: response.data.coupon,
          pricing: response.data.pricing,
          valid: true,
          timestamp: Date.now()
        };

        setAppliedCoupon(newCoupon);
        setShowCouponInput(false);
        
        // Persistir para checkout
        CouponPersistenceService.setCouponForItem('course', course.id, newCoupon);
        
        return true;
      } else {
        setCouponError(response.data.message || 'Cupón no válido');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al validar cupón';
      setCouponError(errorMessage);
      return false;
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    
    if (course) {
      CouponPersistenceService.clearCouponForItem('course', course.id);
    }
  };

  const handleInputChange = (field: keyof Student, value: string) => {
    setStudentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!course) return;

    setSubmitting(true);

    try {
      // Preparar datos del enrollment
      const enrollmentData = {
        course_id: course.id,
        student: studentData,
        coupon_code: appliedCoupon?.coupon.code || null
      };

      // Simular envío (reemplazar con API real)
      console.log('Enrollment data:', enrollmentData);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Transferir cupón al checkout si existe
      if (appliedCoupon) {
        CouponPersistenceService.transferToCheckout();
      }

      // Redirigir al checkout
      window.location.href = `/checkout?enrollment=${course.slug}`;
      
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      alert('Error al procesar la inscripción. Por favor intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando formulario...</p>
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Inscripción al Curso</h1>
        <h2 className="text-xl text-gray-600">{course.title}</h2>
      </div>

      {/* Banner de cupón aplicado */}
      {appliedCoupon && (
        <CouponAppliedBanner
          coupon={appliedCoupon}
          context="enrollment"
          onRemove={handleRemoveCoupon}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de inscripción */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Estudiante</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Nombre Completo *</Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={studentData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ci">Cédula de Identidad *</Label>
                    <Input
                      id="ci"
                      type="text"
                      value={studentData.ci}
                      onChange={(e) => handleInputChange('ci', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={studentData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={studentData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="birth_date">Fecha de Nacimiento *</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={studentData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas adicionales</Label>
                  <Textarea
                    id="notes"
                    value={studentData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Menciona cualquier requerimiento especial, alergias, etc."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-lg py-3"
                  size="lg"
                >
                  {submitting ? 'Procesando...' : 'Continuar al Pago'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar con precio y cupón */}
        <div className="space-y-4">
          {/* Resumen de precios */}
          <PriceBreakdown
            items={priceItems}
            appliedCoupon={appliedCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            title="Resumen"
          />

          {/* Aplicar cupón */}
          {!appliedCoupon && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cupón de Descuento</CardTitle>
              </CardHeader>
              <CardContent>
                {!showCouponInput ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowCouponInput(true)}
                    className="w-full"
                  >
                    ¿Tienes un cupón?
                  </Button>
                ) : (
                  <CouponInput
                    onCouponApplied={handleApplyCoupon}
                    error={couponError}
                    placeholder="Ej: SAVE20"
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Información adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p><strong>Duración:</strong> 12 semanas</p>
              <p><strong>Modalidad:</strong> Presencial y Online</p>
              <p><strong>Inicio:</strong> Próximo mes</p>
              <p><strong>Certificación:</strong> APACG</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Términos y condiciones */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              Al inscribirte aceptas nuestros{' '}
              <a href="/terms" className="text-blue-600 hover:underline">
                términos y condiciones
              </a>{' '}
              y{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                política de privacidad
              </a>.
            </p>
            <p>
              El pago se procesará de forma segura a través de Bancard.
              {appliedCoupon && !((appliedCoupon as any).coupon.is_recurring) && ' Tu cupón de descuento se aplicará en el checkout.'}
              {appliedCoupon && ((appliedCoupon as any).coupon.is_recurring) && (
                <span className="text-blue-600 font-medium">
                  {' '}Tu cupón recurrente se aplicará en el checkout y continuará aplicándose automáticamente cada mes durante todo el curso.
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentFormWithCoupon;