<template>
  <nav>
    <SmartRouter>Home</SmartRouter>
    <SmartRouter>Test</SmartRouter>
  </nav>
</template>

<script>
export default {
  name: 'HelloWorld',
  mounted() {
    alert('This is a test, this website is under construction');
  }
}
</script>