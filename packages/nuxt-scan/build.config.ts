export default {
  declaration: true,
  entries: ['src/module'],
  externals: [
    '@nuxt/kit',
    '@nuxt/schema',
    'vue',
    'vue-router',
    'h3',
    '@unhead/vue',
    'defu',
  ],
  failOnWarn: false,
};
