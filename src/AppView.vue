<template>
  <component :is="currentComponent" />
</template>

<script setup>
import { usePage } from './composables/usePage'
const { currentComponent } = usePage()
</script>
