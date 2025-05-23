<template>
  <RouterLink to="/" @click.prevent="go">
    <span ref="el"><slot /></span>
  </RouterLink>
</template>

<script setup>
import { usePage } from '@/composables/usePage'
import { ref, onMounted } from 'vue'

const props = defineProps({ page: String })
const el = ref(null)
const { setPage } = usePage()

let target = props.page

onMounted(() => {
  if (!target && el.value) {
    target = el.value.textContent.trim()
  }
})

function go() {
  if (target) setPage(target)
}
</script>
