# 🌌 Gradient Mesh Backgrounds — Angular Login
> CSS puro · sin imágenes · 3 temas dark animados

---

## Tema 1 — Midnight Nebula 🌌
> Azul medianoche profundo con blobs violeta/púrpura. El más elegante.

```css
/* ── Midnight Nebula Mesh Background ── */
/* CSS puro · sin imágenes · animado     */

body {
  margin: 0;
  min-height: 100vh;
  background-color: #050714;
  background-image:
    radial-gradient(ellipse at 20% 15%, rgba(109,40,217,0.35)  0px, transparent 55%),
    radial-gradient(ellipse at 75% 10%, rgba(139,92,246,0.25)  0px, transparent 50%),
    radial-gradient(ellipse at 5%  60%, rgba(30,27,75,0.6)     0px, transparent 60%),
    radial-gradient(ellipse at 70% 65%, rgba(91,33,182,0.2)    0px, transparent 55%),
    radial-gradient(ellipse at 40% 45%, rgba(67,20,155,0.15)   0px, transparent 40%),
    radial-gradient(ellipse at 85% 80%, rgba(124,58,237,0.2)   0px, transparent 45%),
    radial-gradient(ellipse at 15% 85%, rgba(49,10,120,0.3)    0px, transparent 50%);
}

/* Capa shimmer animada */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    -45deg,
    #0d0630,
    #150a3d,
    #0d0630,
    #0a0520
  );
  background-size: 400% 400%;
  animation: gradient-shift 12s ease infinite;
  opacity: 0.7;
}

@keyframes gradient-shift {
  0%   { background-position: 0%   50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0%   50%; }
}

/* Partículas flotantes sutiles */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image:
    radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.08) 0, transparent 100%),
    radial-gradient(1px 1px at 75% 15%, rgba(255,255,255,0.06) 0, transparent 100%),
    radial-gradient(1px 1px at 50% 70%, rgba(255,255,255,0.05) 0, transparent 100%),
    radial-gradient(1px 1px at 90% 50%, rgba(255,255,255,0.07) 0, transparent 100%);
  pointer-events: none;
}

/* Tu contenido siempre encima */
.login-container {
  position: relative;
  z-index: 1;
}
```

---

## Tema 2 — Deep Space 🔮
> Azul marino / índigo. Efecto cinematográfico con scanlines sutiles.

```css
/* ── Deep Space Mesh Background ── */
/* Inspirado en fondos de productos SaaS premium 2025 */

body {
  margin: 0;
  min-height: 100vh;
  background-color: #020617;
  background-image:
    radial-gradient(ellipse at 15% 20%, rgba(29,78,216,0.3)   0px, transparent 55%),
    radial-gradient(ellipse at 80% 5%,  rgba(99,102,241,0.25) 0px, transparent 50%),
    radial-gradient(ellipse at 0%  55%, rgba(15,23,42,0.8)    0px, transparent 60%),
    radial-gradient(ellipse at 65% 60%, rgba(67,56,202,0.2)   0px, transparent 55%),
    radial-gradient(ellipse at 35% 40%, rgba(139,92,246,0.12) 0px, transparent 45%),
    radial-gradient(ellipse at 90% 75%, rgba(37,99,235,0.2)   0px, transparent 40%),
    radial-gradient(ellipse at 20% 80%, rgba(30,58,138,0.35)  0px, transparent 55%);
}

/* Capa shimmer animada con drift */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    -45deg,
    #080c1e,
    #0e1433,
    #080c1e,
    #060a18
  );
  background-size: 400% 400%;
  animation: space-drift 15s ease infinite;
  opacity: 0.65;
}

@keyframes space-drift {
  0%   { background-position: 0%   0%;   }
  33%  { background-position: 100% 50%;  }
  66%  { background-position: 50%  100%; }
  100% { background-position: 0%   0%;   }
}

/* Scanlines cinematográficas (muy sutiles) */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.03) 2px,
    rgba(0,0,0,0.03) 4px
  );
  pointer-events: none;
}

.login-container {
  position: relative;
  z-index: 1;
}
```

---

## Tema 3 — Aurora 💜
> Púrpura / magenta intenso. Efecto aurora boreal con vignette.

```css
/* ── Aurora Mesh Background ── */
/* Purple-pink aurora borealis effect */

body {
  margin: 0;
  min-height: 100vh;
  background-color: #0a0118;
  background-image:
    radial-gradient(ellipse at 10% 10%, rgba(168,85,247,0.35)  0px, transparent 55%),
    radial-gradient(ellipse at 80% 0%,  rgba(217,70,239,0.2)   0px, transparent 50%),
    radial-gradient(ellipse at 0%  50%, rgba(88,28,135,0.5)    0px, transparent 60%),
    radial-gradient(ellipse at 60% 55%, rgba(147,51,234,0.2)   0px, transparent 55%),
    radial-gradient(ellipse at 30% 40%, rgba(192,38,211,0.12)  0px, transparent 40%),
    radial-gradient(ellipse at 85% 70%, rgba(126,34,206,0.22)  0px, transparent 45%),
    radial-gradient(ellipse at 20% 75%, rgba(76,5,149,0.4)     0px, transparent 55%);
}

/* Capa shimmer con pulse */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    135deg,
    #130024 0%,
    #1e003a 35%,
    #130024 55%,
    #0e0020 100%
  );
  background-size: 400% 400%;
  animation: aurora-pulse 10s ease infinite;
  opacity: 0.8;
}

@keyframes aurora-pulse {
  0%   { background-position: 0%   50%; opacity: 0.8; }
  50%  { background-position: 100% 50%; opacity: 0.9; }
  100% { background-position: 0%   50%; opacity: 0.8; }
}

/* Vignette para profundidad */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 40%,
    rgba(0,0,0,0.45) 100%
  );
  pointer-events: none;
}

.login-container {
  position: relative;
  z-index: 1;
}
```

---

## Integración en Angular

### `styles.scss` global (recomendado)
Pega el tema elegido en tu `src/styles.scss` o `src/styles.css`.

### Por componente con `ViewEncapsulation.None`
```typescript
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None  // <-- permite estilar body
})
export class LoginComponent {}
```

### Si usas Angular con SSR (Angular 21)
Asegúrate de que el `body` tenga `min-height: 100vh` y que los `::before` / `::after` sean `position: fixed` (no `absolute`) para cubrir toda la ventana sin importar el scroll.

---

## Cómo ajustar los blobs

Cada línea de `radial-gradient` es un blob de luz. Puedes:

| Parámetro | Qué controla | Ejemplo |
|-----------|-------------|---------|
| `ellipse at X% Y%` | Posición del blob | `at 50% 50%` = centro |
| `rgba(R,G,B, opacity)` | Color e intensidad | Sube opacity para más brillo |
| `transparent 55%` | Tamaño del blob | Número mayor = blob más grande |

Para añadir más blobs, simplemente agrega más líneas `radial-gradient(...)` separadas por comas.

---

*Temas generados · Mayo 2026 · CSS puro compatible con todos los navegadores modernos*
