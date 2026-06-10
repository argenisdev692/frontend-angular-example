// Ambient declarations for side-effect imports.
// TypeScript 6.0 type-checks side-effect imports (e.g. `import 'pkg/dist/style.css'`)
// and errors (TS2882) without a matching module declaration. Third-party CSS pulled
// into a component's TS (cropperjs) is declared here as a typeless side-effect module.
declare module '*.css';
