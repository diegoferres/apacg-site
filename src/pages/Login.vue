
<template>
  <div class="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
    <div class="w-full max-w-md animate-scale-in">
      <div class="text-center mb-6">
        <router-link to="/">
          <div class="flex items-center justify-center gap-2 text-primary">
            <SchoolIcon class="h-10 w-10" />
            <span class="font-bold text-2xl">A.P.A.C. GOETHE</span>
          </div>
        </router-link>
      </div>
      
      <div class="glass shadow-sm border-border/40 rounded-lg">
        <div class="flex flex-col space-y-1 p-6">
          <h3 class="text-2xl font-semibold leading-none tracking-tight text-center">Iniciar Sesión</h3>
          <p class="text-sm text-muted-foreground text-center">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>
        <div class="p-6 pt-0">
          <form @submit.prevent="onSubmit" class="space-y-4">
            <div>
              <label class="text-sm font-medium leading-none">Correo Electrónico</label>
              <div class="relative mt-2">
                <MailIcon class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input 
                  v-model="email"
                  type="email" 
                  placeholder="tu@email.com" 
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  :class="{ 'border-red-500': emailError }"
                />
              </div>
              <p v-if="emailError" class="text-sm text-red-500 mt-1">{{ emailError }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium leading-none">Contraseña</label>
              <div class="relative mt-2">
                <LockIcon class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input 
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="••••••••" 
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  :class="{ 'border-red-500': passwordError }"
                />
                <button
                  type="button"
                  class="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                  @click="togglePasswordVisibility"
                >
                  <EyeOffIcon v-if="showPassword" class="h-4 w-4" />
                  <EyeIcon v-else class="h-4 w-4" />
                </button>
              </div>
              <p v-if="passwordError" class="text-sm text-red-500 mt-1">{{ passwordError }}</p>
            </div>
            
            <Button 
              type="submit" 
              class="w-full" 
              :disabled="isLoading"
            >
              {{ isLoading ? "Iniciando sesión..." : "Iniciar Sesión" }}
            </Button>
          </form>
          
          <div class="mt-4 text-center">
            <router-link 
              to="/recuperar-contrasena" 
              class="text-sm text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </router-link>
          </div>
        </div>
        <div class="flex items-center p-6 pt-0 justify-center">
          <Button variant="ghost" size="sm" tag="router-link" to="/" class="text-muted-foreground flex items-center gap-1">
            <ArrowLeftIcon class="h-4 w-4" />
            Volver a Inicio
          </Button>
        </div>
      </div>
      
      <p class="text-center text-sm text-muted-foreground mt-4">
        © {{ new Date().getFullYear() }} A.P.A.C. GOETHE. Todos los derechos reservados.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeftIcon, LockIcon, MailIcon, EyeIcon, EyeOffIcon, SchoolIcon } from '@heroicons/vue/24/outline';
import { Button } from '@/components/ui/button.vue';

const router = useRouter();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const emailError = ref('');
const passwordError = ref('');

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const validateForm = () => {
  let isValid = true;
  emailError.value = '';
  passwordError.value = '';

  if (!email.value) {
    emailError.value = 'El correo electrónico es requerido';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Ingrese un correo electrónico válido';
    isValid = false;
  }

  if (!password.value) {
    passwordError.value = 'La contraseña es requerida';
    isValid = false;
  } else if (password.value.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres';
    isValid = false;
  }

  return isValid;
};

const onSubmit = async () => {
  if (!validateForm()) return;
  
  isLoading.value = true;
  
  // Simulate API call
  setTimeout(() => {
    isLoading.value = false;
    // In a real app, would redirect to dashboard or home after successful login
    router.push('/');
  }, 1500);
};
</script>
