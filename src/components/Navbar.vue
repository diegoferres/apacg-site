
<template>
  <header 
    :class="[
      'fixed top-0 left-0 w-full z-40 transition-all duration-300',
      scrolled ? 'glass py-2 shadow-sm' : 'py-4'
    ]"
  >
    <div class="container mx-auto px-4 md:px-6">
      <div class="flex items-center justify-between">
        <router-link to="/" class="flex items-center space-x-2 animate-fade-in">
          <div class="flex items-center gap-2 text-primary">
            <SchoolIcon class="h-8 w-8" />
            <span class="font-bold text-xl hidden sm:inline">A.P.A.C. GOETHE</span>
          </div>
        </router-link>

        <!-- Desktop menu -->
        <nav class="hidden md:flex items-center space-x-6">
          <router-link 
            to="/" 
            class="text-foreground/90 hover:text-foreground font-medium transition-colors"
          >
            Inicio
          </router-link>
          <router-link 
            to="/beneficios" 
            class="text-foreground/90 hover:text-foreground font-medium transition-colors"
          >
            Beneficios
          </router-link>
          <router-link 
            to="/comercios" 
            class="text-foreground/90 hover:text-foreground font-medium transition-colors"
          >
            Comercios
          </router-link>
          <Button as-child variant="ghost" class="gap-1">
            <router-link to="/login">
              <UserCircleIcon class="h-5 w-5 mr-1" />
              Iniciar Sesión
            </router-link>
          </Button>
        </nav>

        <!-- Mobile menu button -->
        <button
          class="md:hidden text-foreground p-2 focus:outline-none"
          @click="toggleMenu"
          aria-label="Menu"
        >
          <XIcon v-if="isMenuOpen" class="h-6 w-6" />
          <MenuIcon v-else class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="isMenuOpen" class="md:hidden glass absolute top-full left-0 w-full py-4 animate-fade-in">
      <div class="container mx-auto px-4">
        <nav class="flex flex-col space-y-4">
          <router-link 
            to="/" 
            class="text-foreground/90 hover:text-foreground font-medium transition-colors py-2"
            @click="closeMenu"
          >
            Inicio
          </router-link>
          <router-link 
            to="/beneficios" 
            class="text-foreground/90 hover:text-foreground font-medium transition-colors py-2"
            @click="closeMenu"
          >
            Beneficios
          </router-link>
          <router-link 
            to="/comercios" 
            class="text-foreground/90 hover:text-foreground font-medium transition-colors py-2"
            @click="closeMenu"
          >
            Comercios
          </router-link>
          <Button as-child variant="default" class="w-full">
            <router-link to="/login" @click="closeMenu">
              <UserCircleIcon class="h-5 w-5 mr-2" />
              Iniciar Sesión
            </router-link>
          </Button>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { UserCircleIcon, MenuIcon, XIcon, SchoolIcon } from '@heroicons/vue/24/outline';
import { Button } from './ui/button.vue';

const scrolled = ref(false);
const isMenuOpen = ref(false);
const router = useRouter();

const handleScroll = () => {
  const isScrolled = window.scrollY > 20;
  if (isScrolled !== scrolled.value) {
    scrolled.value = isScrolled;
  }
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
