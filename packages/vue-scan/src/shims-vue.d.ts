// Define Vue component typings
declare module 'vue' {
  export type App = any;
  export type Component = any;
  export type ComponentInternalInstance = any;
  export const getCurrentInstance: () => any;
  export const onMounted: (fn: () => void) => void;
  export const onUpdated: (fn: () => void) => void;
  export const onUnmounted: (fn: () => void) => void;
  export const onBeforeUnmount: (fn: () => void) => void;
  export const nextTick: (fn?: () => void) => Promise<void>;
  export const ref: <T>(value: T) => { value: T };
  export const reactive: <T>(obj: T) => T;
  export const inject: (key: string | Symbol, defaultValue?: any) => any;
  export const provide: (key: string | Symbol, value: any) => void;
}

// Define .vue file typings
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
