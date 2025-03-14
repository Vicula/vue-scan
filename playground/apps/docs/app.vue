<script setup lang="ts">
import { Page } from 'ui';
import { name } from './package.json';

useHead({
  title: 'Nuxt Playground',
  meta: [{ name: 'description', content: 'Nuxt playground for nuxt-scan' }],
});

defineExpose({
  name,
});
</script>

<template>
  <Page :app-name="name" />
</template>
