/// <reference types="vite/client" />

// Allow JSON imports
declare module '*.json' {
  const value: any;
  export default value;
}
