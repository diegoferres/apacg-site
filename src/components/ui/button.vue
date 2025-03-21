
<template>
  <component
    :is="tag"
    :class="[
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      variantClasses,
      sizeClasses,
      className
    ]"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value: string) => {
      return ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'].includes(value);
    }
  },
  size: {
    type: String,
    default: 'default',
    validator: (value: string) => {
      return ['default', 'sm', 'lg', 'icon'].includes(value);
    }
  },
  asChild: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  },
  tag: {
    type: String,
    default: 'button'
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'default':
      return 'bg-primary text-primary-foreground hover:bg-primary/90';
    case 'destructive':
      return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
    case 'outline':
      return 'border border-input bg-background hover:bg-accent hover:text-accent-foreground';
    case 'secondary':
      return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
    case 'ghost':
      return 'hover:bg-accent hover:text-accent-foreground';
    case 'link':
      return 'text-primary underline-offset-4 hover:underline';
    default:
      return 'bg-primary text-primary-foreground hover:bg-primary/90';
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'default':
      return 'h-10 px-4 py-2';
    case 'sm':
      return 'h-9 rounded-md px-3';
    case 'lg':
      return 'h-11 rounded-md px-8';
    case 'icon':
      return 'h-10 w-10';
    default:
      return 'h-10 px-4 py-2';
  }
});
</script>
