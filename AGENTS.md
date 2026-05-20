# AGENTS.md

Guía para agentes que trabajen en este repositorio (`rick-and-morty-webc`).

## Objetivo del proyecto
- App didáctica de Web Components con TypeScript.
- Enfocada en comunicación **padre → hijo** (props/setters) y **hijo → padre** (CustomEvent).

## Stack y estructura
- Build/dev server: `vite`
- Lenguaje: `TypeScript`
- Estilos: `TailwindCSS`
- Código fuente en `src/`

## Reglas de trabajo
- Haz cambios mínimos y enfocados al requerimiento.
- Mantén nombres y eventos en español cuando ya existan (ej. `personaje-seleccionado`, `modal-cerrar`).
- No introduzcas dependencias nuevas salvo petición explícita.
- No cambies comportamiento público de componentes sin documentarlo en `README.md`.

## Convenciones para Web Components
- Mantener encapsulación por componente en su archivo (`rick-*.ts`).
- Comunicación:
  - Padre → hijo: usar setters (`character`, `open`).
  - Hijo → padre: usar `CustomEvent` con `bubbles: true` y `composed: true`.
- Limpiar listeners en `disconnectedCallback`.

## Validación antes de finalizar
- Ejecutar:
  - `npm run build`
- Si se toca comportamiento visual/UX del modal, validar también en `npm run dev`.

## Control de versiones
- Trabajar sobre la rama activa sin reescribir historial.
- No hacer `git commit`, `git push`, `git reset --hard` ni cambios de rama a menos que el usuario lo pida explícitamente.
- Mantener diffs pequeños y legibles.
- Si se modifica material didáctico, actualizar `README.md` en el mismo cambio.

## Checklist de entrega
- Código compila.
- No hay cambios no relacionados.
- README actualizado si cambia el flujo didáctico o la API de componentes.
