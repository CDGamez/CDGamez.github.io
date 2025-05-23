<script setup>
import { ref } from 'vue'

const msg = ref('This is the Home Page!')
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg" />
</template>
