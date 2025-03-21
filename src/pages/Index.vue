
<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />
    
    <!-- Hero Section -->
    <section class="pt-28 pb-16 px-4 relative hero-gradient overflow-hidden">
      <div class="container mx-auto max-w-6xl relative z-10">
        <div class="text-center mb-12 animate-fade-up">
          <Badge variant="outline" class="mb-4 py-1 px-3 bg-primary/5">
            Asociación de Padres y Amigos del Colegio
          </Badge>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
            Encuentra los mejores <span class="text-primary">beneficios</span> para vos
          </h1>
          <p class="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Accedé a descuentos exclusivos y promociones especiales en diferentes comercios y servicios como miembro de A.P.A.C. GOETHE.
          </p>
        </div>
      </div>
    </section>
    
    <!-- Content placeholder -->
    <section class="py-16 px-4">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-2xl md:text-3xl font-bold animate-fade-up">
          Contenido en desarrollo
        </h2>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Navbar from '@/components/Navbar.vue';
import { Badge } from '@/components/ui/badge.vue';

// Placeholder for index page
</script>
