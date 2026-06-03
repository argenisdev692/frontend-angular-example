# ③ Noise Grain Overlay — CSS Completo
> Multi-layer mesh + grain cinematográfico · El estándar de Vercel / Linear / Stripe

---

## Cómo funciona la técnica

```
┌─────────────────────────────────┐
│  Layer 4 → Tu contenido (z: 3)  │  .login-container
│  Layer 3 → Noise grain  (z: 2)  │  body::after   — feTurbulence SVG
│  Layer 2 → Glow orbs    (z: 1)  │  body::before  — radial blobs
│  Layer 1 → Base color   (z: 0)  │  body          — background-color
└─────────────────────────────────┘
```

El grain es un `feTurbulence` SVG inlinado como `data:image/svg+xml` en `background-image`.
Se aplica con `opacity: 0.04–0.06` y `mix-blend-mode: overlay` —
suficiente para romper la suavidad digital sin verse como arena.

---

## CSS Completo — Variante 1: Purple Midnight (recomendada)

```css
/* ═══════════════════════════════════════════════
   NOISE GRAIN OVERLAY — Purple Midnight
   Stack: mesh base → glow orbs → grain → contenido
   ═══════════════════════════════════════════════ */

/* ── Layer 1: Base + Mesh radial-gradients ── */
body {
  margin: 0;
  min-height: 100vh;
  background-color: #0d0030;
  background-image:
    radial-gradient(ellipse at 15% 20%, rgba(139,92,246,0.40)  0px, transparent 55%),
    radial-gradient(ellipse at 80% 10%, rgba(168,85,247,0.28)  0px, transparent 50%),
    radial-gradient(ellipse at 5%  65%, rgba(88,28,135,0.55)   0px, transparent 60%),
    radial-gradient(ellipse at 70% 70%, rgba(124,58,237,0.22)  0px, transparent 55%),
    radial-gradient(ellipse at 40% 40%, rgba(109,40,217,0.18)  0px, transparent 45%),
    radial-gradient(ellipse at 90% 80%, rgba(147,51,234,0.25)  0px, transparent 40%),
    radial-gradient(ellipse at 20% 85%, rgba(76,5,149,0.40)    0px, transparent 55%);
  background-size: 400% 400%;
  animation: mesh-drift 14s ease infinite;
}

@keyframes mesh-drift {
  0%   { background-position: 0%   50%; }
  33%  { background-position: 100% 30%; }
  66%  { background-position: 50%  80%; }
  100% { background-position: 0%   50%; }
}

/* ── Layer 2: Glow orbs animados ── */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(circle at 25% 35%,  rgba(139,92,246,0.35) 0px, transparent 38%),
    radial-gradient(circle at 75% 25%,  rgba(168,85,247,0.25) 0px, transparent 32%),
    radial-gradient(circle at 15% 75%,  rgba(109,40,217,0.30) 0px, transparent 35%),
    radial-gradient(circle at 80% 70%,  rgba(124,58,237,0.20) 0px, transparent 30%);
  animation: orbs-float 18s ease-in-out infinite alternate;
  filter: blur(40px);
}

@keyframes orbs-float {
  0%   { transform: translate(0px,   0px)   scale(1);    }
  25%  { transform: translate(20px, -15px)  scale(1.05); }
  50%  { transform: translate(-10px, 25px)  scale(0.97); }
  75%  { transform: translate(15px,  10px)  scale(1.03); }
  100% { transform: translate(-5px, -20px)  scale(1.01); }
}

/* ── Layer 3: Noise grain cinematográfico ── */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;

  /* SVG feTurbulence inlinado — sin archivos externos */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E");
  background-size: 180px 180px;  /* tile size — más pequeño = grano más fino */

  opacity: 0.045;                /* 0.03 = sutil · 0.06 = visible · nunca > 0.08 */
  mix-blend-mode: overlay;       /* overlay = efecto cinematográfico */
}

/* ── Layer 4: Tu contenido siempre encima ── */
.login-container {
  position: relative;
  z-index: 3;
}
```

---

## CSS Completo — Variante 2: Deep Navy (Stripe-style)

```css
/* ═══════════════════════════════════════════════
   NOISE GRAIN OVERLAY — Deep Navy
   Inspirado en Stripe, Linear, Resend
   ═══════════════════════════════════════════════ */

body {
  margin: 0;
  min-height: 100vh;
  background-color: #020617;
  background-image:
    radial-gradient(ellipse at 20% 25%, rgba(29,78,216,0.38)   0px, transparent 52%),
    radial-gradient(ellipse at 75% 15%, rgba(99,102,241,0.28)  0px, transparent 48%),
    radial-gradient(ellipse at 8%  60%, rgba(30,58,138,0.55)   0px, transparent 58%),
    radial-gradient(ellipse at 68% 65%, rgba(67,56,202,0.22)   0px, transparent 52%),
    radial-gradient(ellipse at 38% 45%, rgba(139,92,246,0.15)  0px, transparent 42%),
    radial-gradient(ellipse at 88% 78%, rgba(37,99,235,0.22)   0px, transparent 38%),
    radial-gradient(ellipse at 18% 82%, rgba(30,58,138,0.38)   0px, transparent 52%);
  background-size: 400% 400%;
  animation: navy-drift 16s ease infinite;
}

@keyframes navy-drift {
  0%   { background-position: 0%   0%;   }
  50%  { background-position: 100% 100%; }
  100% { background-position: 0%   0%;   }
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(circle at 20% 30%, rgba(59,130,246,0.28) 0px, transparent 35%),
    radial-gradient(circle at 78% 20%, rgba(99,102,241,0.22) 0px, transparent 30%),
    radial-gradient(circle at 12% 72%, rgba(37,99,235,0.25)  0px, transparent 33%),
    radial-gradient(circle at 82% 72%, rgba(67,56,202,0.18)  0px, transparent 28%);
  filter: blur(45px);
  animation: navy-orbs 20s ease-in-out infinite alternate;
}

@keyframes navy-orbs {
  0%   { transform: translate(0,   0)   scale(1);    }
  50%  { transform: translate(15px, -20px) scale(1.08); }
  100% { transform: translate(-10px, 15px) scale(0.95); }
}

/* Grain idéntico — solo cambia opacity a 0.04 para navy */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  opacity: 0.04;
  mix-blend-mode: overlay;
}

.login-container {
  position: relative;
  z-index: 3;
}
```

---

## Parámetros para tunear el grain

```css
/* Intensidad del grain */
opacity: 0.03;   /* casi invisible — Stripe usa aprox. esto */
opacity: 0.045;  /* sutil pero presente — recomendado para login */
opacity: 0.06;   /* claramente visible — para hero sections */
opacity: 0.08;   /* límite máximo — más parece degradación */

/* Tamaño del grano (tile del SVG) */
background-size: 100px 100px;   /* grano muy fino */
background-size: 180px 180px;   /* grano estándar ← recomendado */
background-size: 300px 300px;   /* grano grueso, más visible */

/* blend modes y su efecto */
mix-blend-mode: overlay;        /* cinematográfico ← recomendado */
mix-blend-mode: soft-light;     /* más sutil que overlay */
mix-blend-mode: multiply;       /* oscurece — evitar en fondos oscuros */
mix-blend-mode: screen;         /* aclara — útil en fondos muy oscuros */

/* baseFrequency del feTurbulence */
baseFrequency="0.65"  /* grano grueso */
baseFrequency="0.9"   /* grano estándar ← recomendado */
baseFrequency="1.2"   /* grano ultrafino */
```

---

## Integración en Angular 21

### Opción A — `styles.scss` global (recomendada)

Pega el CSS en `src/styles.scss`. Aplica a toda la app.

```scss
// src/styles.scss
@import url('https://fonts.googleapis.com/css2?family=Exo:wght@400;600;700&display=swap');

body {
  margin: 0;
  min-height: 100vh;
  background-color: #0d0030;
  background-image:
    radial-gradient(ellipse at 15% 20%, rgba(139,92,246,0.40) 0px, transparent 55%),
    // ... resto de blobs
  ;
  animation: mesh-drift 14s ease infinite;
}

body::before { /* orbs */ }
body::after  { /* grain */ }
```

### Opción B — Componente con `ViewEncapsulation.None`

```typescript
// login.component.ts
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent {}
```

```scss
// login.component.scss
// ViewEncapsulation.None permite estilar body desde el componente
body {
  background-color: #0d0030;
  // ...
}
body::before { /* orbs */ }
body::after  { /* grain */ }

.login-container {
  position: relative;
  z-index: 3;
  // Tu CSS existente aquí
}
```

### Opción C — Host binding (Angular 21 standalone)

```typescript
// login.component.ts
@Component({
  selector: 'app-login',
  standalone: true,
  host: {
    'style': 'display:block; min-height:100vh; position:relative;'
  },
  // El fondo va en styles.scss global
})
export class LoginComponent {}
```

---

## Compatibilidad

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| `radial-gradient` | ✅ | ✅ | ✅ | ✅ |
| `mix-blend-mode` | ✅ 79+ | ✅ 72+ | ✅ 13+ | ✅ 79+ |
| `feTurbulence` SVG | ✅ | ✅ | ✅ | ✅ |
| `position: fixed` pseudo | ✅ | ✅ | ⚠️* | ✅ |
| `filter: blur()` | ✅ | ✅ | ✅ | ✅ |

> ⚠️ Safari: `position: fixed` en `::before`/`::after` puede tener scroll artifacts.
> Solución: usar `position: absolute` + wrapper `min-height: 100vh` overflow hidden.

### Fix Safari

```css
/* Wrapper en lugar de body::before/after si necesitas Safari perfecto */
.bg-wrapper {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.bg-wrapper::before { /* orbs */ }
.bg-wrapper::after  { /* grain */ }
```

```html
<!-- index.html o app.component.html -->
<div class="bg-wrapper"></div>
<app-login></app-login>
```

---

## Performance

```css
/* Añadir a body para GPU acceleration */
body {
  will-change: background-position;
  transform: translateZ(0);          /* crea compositing layer */
  -webkit-transform: translateZ(0);
}

/* El grain no necesita will-change — es estático */
/* El blur en ::before sí se beneficia */
body::before {
  will-change: transform;
}
```

> El grain SVG inlinado no hace ningún request HTTP — es 100% CSS puro.
> El `filter: blur(40px)` en los orbs es la operación más costosa — reducir a `blur(25px)` si hay lag en dispositivos low-end.

---

*Noise Grain Overlay · Angular 21 · Mayo 2026*
