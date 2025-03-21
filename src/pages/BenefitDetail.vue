
<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />
    
    <main class="flex-1 pt-28 pb-16 px-4">
      <div class="container mx-auto max-w-4xl">
        <div class="mb-6 animate-fade-up">
          <Button variant="ghost" size="sm" tag="router-link" to="/" class="mb-4 flex items-center">
            <ArrowLeftIcon class="h-4 w-4 mr-2" /> Volver a Inicio
          </Button>
          
          <div v-if="benefit" class="flex items-center flex-wrap gap-2 mb-3">
            <Badge variant="outline" class="bg-primary/5">
              {{ benefit.category }}
            </Badge>
          </div>
          
          <h1 v-if="benefit" class="text-3xl md:text-4xl font-bold mb-4">
            {{ benefit.title }}
          </h1>
        </div>
        
        <div v-if="isLoading" class="flex-1 flex items-center justify-center">
          <p>Cargando...</p>
        </div>
        
        <div v-else-if="benefit" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="md:col-span-2 animate-fade-up" style="animation-delay: 0.1s">
            <div class="p-6 mb-8 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h2 class="text-xl font-semibold mb-4">Descripción</h2>
              <p class="text-muted-foreground whitespace-pre-line mb-4">
                {{ benefit.fullDescription }}
              </p>
            </div>
          </div>
          
          <div class="animate-fade-up" style="animation-delay: 0.2s">
            <div class="p-6 mb-8 rounded-lg border bg-card text-card-foreground shadow-sm">
              <h2 class="text-xl font-semibold mb-4">Información del Comercio</h2>
              <div class="space-y-4">
                <div>
                  <h3 class="font-medium mb-1">Ubicación</h3>
                  <p class="text-sm text-muted-foreground">{{ benefit.location }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';
import Navbar from '@/components/Navbar.vue';
import { Button } from '@/components/ui/button.vue';
import { Badge } from '@/components/ui/badge.vue';

const route = useRoute();
const isLoading = ref(true);
const benefit = ref(null);

// Mock benefit data
const mockBenefitDetails = {
  id: '1',
  title: 'Reintegro 20% en restaurantes y cafeterías los fines de semana',
  store: 'Café Milano',
  description: 'Obtén un reintegro del 20% en todas tus compras durante los fines de semana pagando con tarjeta de crédito asociada.',
  fullDescription: `
    Disfruta de un reintegro del 20% en todas tus consumiciones realizadas los fines de semana en Café Milano. 
    Este beneficio está disponible para todos los socios activos de A.P.A.C. GOETHE y aplica a consumiciones en el local.
    
    Para acceder al reintegro, deberás pagar con la tarjeta de crédito asociada a tu cuenta de socio. El monto será acreditado 
    automáticamente en tu próximo resumen de cuenta.
  `,
  category: 'Restaurantes',
  validFrom: '2023-09-01',
  validTo: '2023-12-31',
  usageCount: 128,
  location: 'Av. Principal 1234, Ciudad'
};

onMounted(() => {
  // Simulate loading data
  setTimeout(() => {
    benefit.value = mockBenefitDetails;
    isLoading.value = false;
  }, 800);
});
</script>
