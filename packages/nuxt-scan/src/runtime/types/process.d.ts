// Type declarations for Nuxt-specific process extensions
declare namespace NodeJS {
  interface Process {
    client?: boolean;
    server?: boolean;
    static?: boolean;
  }
}
