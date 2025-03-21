
<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />
    
    <main class="flex-1 pt-28 pb-16 px-4 flex items-center justify-center">
      <div class="container mx-auto max-w-4xl text-center">
        <h1 class="text-8xl font-bold mb-4 text-primary">404</h1>
        <h2 class="text-3xl md:text-4xl font-bold mb-4">Página no encontrada</h2>
        <p class="text-lg text-muted-foreground mb-8">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <Button tag="router-link" to="/" variant="default" size="lg">
          Volver al inicio
        </Button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import { Button } from '@/components/ui/button.vue';
</script>
