# Rick & Morty - Web Components con TypeScript + Tailwind

Proyecto educativo que consume la [API de Rick and Morty](https://rickandmortyapi.com/) usando **Web Components nativos** con **TypeScript** y estilos **Tailwind CSS**.

## Arquitectura

```
rick-container (orquestador)
  ├── Página Characters
  │   ├── rick-list         → fetch + grid de tarjetas + filtros
  │   └── rick-card         → tarjeta individual (hijo → padre: evento)
  ├── Página Locations
  │   └── rick-location-list
  ├── Página Episodes
  │   └── rick-episode-list
  └── rick-modal            → modal con detalle de character
      └── rick-detail
```

## Flujo de datos

| Dirección | Mecanismo | Ejemplo |
|-----------|-----------|---------|
| Padre → Hijo | Propiedades (setter) | `rick-list` asigna `.character` a `rick-card` |
| Hijo → Padre | Custom Events | `rick-card` emite `personaje-seleccionado` y `rick-container` lo escucha |

---

## Paso 1: Inicializar proyecto

```bash
npm create vite@latest rick-and-morty-webc -- --template vanilla-ts
cd rick-and-morty-webc
npm install
npm install -D tailwindcss@3 postcss autoprefixer
```

**Archivos de configuración:**

- [tailwind.config.js](./tailwind.config.js) — rutas de contenido para Tailwind
- [postcss.config.js](./postcss.config.js) — plugins de PostCSS
- [src/style.css](./src/style.css) — directivas `@tailwind`

---

## Paso 2: Tipos compartidos → [`src/types.ts`](./src/types.ts)

Define las interfaces `Character` y `ApiResponse` que tipan la respuesta de la API.

```ts
export interface Character {
  id: number
  name: string
  status: 'Alive' | 'Dead' | 'unknown'
  species: string
  image: string
  // ...
}
```

---

## Paso 3: Componente hijo — [`src/rick-card.ts`](./src/rick-card.ts)

**Responsabilidad:** Renderiza la tarjeta de un personaje. Emite un evento al hacer clic.

**Comunicación hijo → padre:**
```ts
// rick-card recibe datos vía setter
set character(data: Character) { ... }

// Emite evento hacia arriba
this.dispatchEvent(new CustomEvent('personaje-seleccionado', {
  detail: this.characterData,
  bubbles: true,
  composed: true
}))
```

---

## Paso 4: Componente presentacional — [`src/rick-detail.ts`](./src/rick-detail.ts)

**Responsabilidad:** Muestra la ficha completa del personaje. Solo recibe datos.

**Comunicación padre → hijo:**
```ts
set character(data: Character | null) {
  this.characterData = data
  this.render()
}
```

---

## Paso 5: Componente modal — [`src/rick-modal.ts`](./src/rick-modal.ts)

**Responsabilidad:** Overlay + panel que contiene `<rick-detail>`. Maneja apertura/cierre.

**Eventos:**
- Recibe personaje vía `.character` y lo pasa a `rick-detail`
- Recibe orden de abrir/cerrar vía `.open = true/false`
- Emite `modal-cerrar` al hacer clic en ✕ o en el overlay

**Detalle enriquecido del modal (`rick-detail`):**
- Muestra lista de episodios concretos del personaje (código + nombre).
- Cada episodio funciona como enlace interno a la página `Episodes`.
- `Origin` y `Location` funcionan como enlaces internos a la página `Locations`.

---

## Paso 6: Componente lista — [`src/rick-list.ts`](./src/rick-list.ts)

**Responsabilidad:** Fetch paginado (20 por página), renderiza grid de `<rick-card>` y aplica búsqueda por nombre en cliente.

```ts
// Fetch tipado
const data: ApiResponse = await res.json()

// Crea cards y asigna datos
const card = new RickCard()
card.character = char
```

**Buscador (input + filtro):**
```ts
private onSearch = (e: Event) => {
  const term = (e.target as HTMLInputElement).value.trim().toLowerCase()
  this.filteredCharacters = this.characters.filter((character) =>
    character.name.toLowerCase().includes(term)
  )
  this.renderGrid()
}
```

**Paginación (20 en 20):**
```ts
const res = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`)
const data: ApiResponse = await res.json()
this.currentPage = page
this.totalPages = data.info.pages
```

---

## Paso 7: Orquestador — [`src/rick-container.ts`](./src/rick-container.ts)

**Responsabilidad:** Coordina `rick-list` y `rick-modal`. Escucha eventos y actualiza estado.

```ts
// Escucha click en una card → abre modal con ese personaje
this.addEventListener('personaje-seleccionado', (e) => {
  const selectedCharacter = (e as CustomEvent).detail
  modal.character = selectedCharacter
  modal.open = true
})

// Escucha cierre del modal
this.addEventListener('modal-cerrar', () => {
  modal.open = false
})
```

---

## Paso 8: Entry point — [`src/main.ts`](./src/main.ts) e [`index.html`](./index.html)

`main.ts` importa el CSS y el componente raíz, luego monta `<rick-container>` en el body.

---

## Paso 9: Ejecutar

```bash
npm run dev
```

Abre `http://localhost:5173`. Verás el grid de personajes. Haz clic en cualquier card para abrir el modal con los detalles.

---

## Paso 10: Crear buscador de personajes

1. Añade un `<input type="search">` en `rick-list` para capturar el texto.
2. Guarda dos estados:
   - `characters`: datos de la página actual.
   - `filteredCharacters`: resultado del filtro sobre esa página.
3. En el evento `input`, filtra por `character.name` con `includes`.
4. Re-renderiza el grid con `filteredCharacters`.
5. Muestra un estado vacío cuando no haya coincidencias.

---

## Paso 11: Crear paginación de 20 en 20

1. Añade estado de paginación en `rick-list`:
   - `currentPage` (página actual)
   - `totalPages` (total de páginas de la API)
2. Carga personajes con `?page=${page}` para traer 20 resultados por petición.
3. Añade controles `Anterior` y `Siguiente` en la UI.
4. Deshabilita botones en límites:
   - `Anterior` en página 1
   - `Siguiente` en la última página
5. Muestra el indicador `Página X de Y` usando `data.info.pages`.

---

## Paso 12: Feature — búsqueda global por nombre (dataset completo)

### Problema que resolvemos

Antes, el buscador filtraba solo los personajes de la página visible (20 elementos).  
Resultado: podías escribir un nombre existente en otra página y obtener “no encontrado”.

### Objetivo funcional

- Buscar por nombre en el **conjunto completo** de personajes.
- Mantener búsqueda inmediata al escribir.
- Mantener paginación de 20 en 20 sobre los resultados filtrados.

### Estrategia aplicada: carga progresiva + caché

1. Se carga página 1 para mostrar contenido rápido.
2. En segundo plano se cargan el resto de páginas (`page=2...N`).
3. Cada respuesta se añade a `allCharacters` evitando duplicados por `id`.
4. El buscador filtra sobre `allCharacters` (no sobre la página actual).

### Estado recomendado en `rick-list`

- `allCharacters`: caché acumulada de toda la API.
- `filteredCharacters`: resultado del filtro por nombre.
- `searchTerm`: texto del buscador.
- `currentPage` y `totalPages`: paginación sobre `filteredCharacters`.
- `nextPageToFetch`, `hasMorePages`, `loadingAllPages`: control de carga progresiva.

### Flujo de render

1. `onSearch` actualiza `searchTerm` y resetea a página 1.
2. `applySearchFilter` recalcula `filteredCharacters`.
3. `totalPages = ceil(filteredCharacters.length / 20)`.
4. `renderGrid` pinta solo el slice de la página actual.
5. `renderPagination` activa/desactiva `Anterior/Siguiente`.

### UX durante carga progresiva

- Si hay término de búsqueda activo y todavía se están cargando páginas,
  se muestra un aviso: “Cargando más personajes para completar la búsqueda global...”.
- Si una carga de fondo falla, se mantiene la data ya acumulada y se muestra error.

### Tradeoffs de esta estrategia

- **Pros:** búsqueda global rápida tras cacheo, menos llamadas al escribir, UX coherente.
- **Contras:** más complejidad de estado y mayor uso de memoria que búsqueda local.

---

## Paso 13: Feature — filtros por características con combos

### Objetivo funcional

Añadir filtros combinables para refinar resultados por:

- Estado (`status`)
- Especie (`species`)
- Género (`gender`)

### Diseño de UI

- Se añaden 3 combos (`<select>`) encima del grid.
- Cada combo incluye opción vacía inicial (`Todos` / `Todas`) para no filtrar ese campo.
- Los valores de cada combo se generan dinámicamente desde `allCharacters` (dataset cacheado).

### Comportamiento de filtrado

1. Cada cambio en un combo dispara `onFilterChange`.
2. Se actualizan `selectedStatus`, `selectedSpecies`, `selectedGender`.
3. Se recalcula `filteredCharacters` aplicando:
   - búsqueda por nombre (`searchTerm`)
   - filtro por estado (si hay valor)
   - filtro por especie (si hay valor)
   - filtro por género (si hay valor)
4. Se resetea `currentPage = 1`.
5. La paginación sigue siendo de 20 en 20 sobre resultados filtrados.

### Tradeoffs

- **Pros:** filtrado más preciso, UX más guiada que inputs libres, fácil combinar criterios.
- **Contras:** más estado interno y más lógica de sincronización de opciones con la caché.

---

## Paso 14: Feature — páginas separadas (Characters, Locations, Episodes) y navegación cruzada

### Objetivo funcional

Añadir navegación por páginas separadas dentro de la app:

- Página de `Characters`
- Página de `Locations`
- Página de `Episodes`

y mantener navegación cruzada entre entidades:

- Seleccionas un **character** y se abre su modal de detalle (sin activar filtros cruzados).
- Seleccionas una **location** y se filtran `characters` y `episodes` relacionados.
- Seleccionas un **episode** y se filtran `characters` y `locations` relacionados.

### Implementación

- `rick-container` incorpora barra superior con tabs:
  - `Personajes`
  - `Locations`
  - `Episodes`
- Cada página renderiza su propio componente:
  - `rick-list`
  - `rick-location-list`
  - `rick-episode-list`
- Los componentes de locations y episodes cargan su dataset completo paginado desde API.
- El contenedor orquesta filtros cruzados por URLs de relación y añade botón
  `Limpiar navegación entre listas`.

### Flujo de relación entre páginas

1. Click en una card de cualquier página.
2. Se emite un `CustomEvent` (`personaje-seleccionado`, `location-seleccionada`, `episode-seleccionado`).
3. `rick-container` traduce la selección a filtros de relación.
4. Cada lista aplica esos filtros sobre su dataset local.

### Tests añadidos para la feature

En `tests/rick-relations.test.ts`:

- Verifica que al seleccionar un character se filtran locations/episodes relacionados.

En `tests/rick-container.test.ts`:

- Verifica que se puede cambiar entre páginas separadas con tabs.

---

## Paso 15: Testing unitario completo con Vitest

### Objetivo pedagógico

Esta sección está pensada para aprender testing **desde cero** en frontend con Web Components:

1. Entender **por qué** testear.
2. Configurar Vitest paso a paso.
3. Escribir tests por tipo (render, eventos, integración entre componentes, async con API).
4. Ejecutar cobertura y saber leer resultados.

### 1) ¿Por qué testear esta app?

Porque aquí hay contratos de comportamiento que se rompen fácil:

- Contrato de render: una tarjeta debe mostrar datos correctos.
- Contrato de eventos: al hacer click, el hijo debe notificar al padre.
- Contrato de estado visual: el modal abre/cierra cambiando clases.
- Contrato async: la lista debe gestionar fetch, paginación y búsqueda.

Los tests hacen ese comportamiento verificable automáticamente, no manual.

### 2) Stack de testing usado

- Runner: `vitest`
- Cobertura: `@vitest/coverage-v8`
- DOM matchers: `@testing-library/jest-dom`
- Entorno DOM: `happy-dom` (estable para estos Web Components)

Instalación:

```bash
npm install -D vitest @vitest/coverage-v8 happy-dom @testing-library/dom @testing-library/jest-dom @testing-library/user-event
```

### 3) Scripts de test

En `package.json`:

- `npm run test` → modo desarrollo/watch.
- `npm run test:c` → ejecución única con cobertura.
- `npm run test:watch` → alias explícito de watch.

### 4) Configuración mínima explicada

En `vitest.config.ts`:

- `globals: true`: permite `describe/test/expect` sin imports en cada archivo.
- `environment: 'happy-dom'`: simula navegador para crear y manipular elementos.
- `setupFiles: ['./tests/setup.ts']`: ejecuta setup común antes de tests.
- `include: ['**/*.test.ts']`: convención clara de naming.
- `coverage.include: ['src/**/*.ts']`: cobertura enfocada al código de app.

### 5) Setup global y aislamiento

En `tests/setup.ts`:

- se carga `@testing-library/jest-dom`,
- se define un `fetch` mock por defecto para evitar salidas a red,
- en cada test se limpia `document.body`,
- se restauran mocks con `vi.restoreAllMocks()`.

Esto evita “contaminación” entre tests (flaky tests).

### 6) Estructura de la suite

```
tests/
  fixtures.ts
  setup.ts
  rick-card.test.ts
  rick-detail.test.ts
  rick-modal.test.ts
  rick-container.test.ts
  rick-list.test.ts
```

`tests/fixtures.ts` centraliza `makeCharacter()` para construir datos válidos y reutilizables.

### 7) Tipos de tests que usamos (con intención didáctica)

1. **Unitario de render (presentacional)**
   - Verifica texto, imagen, clases, valores visibles.
   - Ejemplo: `rick-card`, `rick-detail`.

2. **Unitario de evento (hijo → padre)**
   - Verifica que se emite `CustomEvent` correcto con `detail`.
   - Ejemplo: click en `rick-card`.

3. **Unitario de estado visual**
   - Verifica transiciones de clases CSS (open/close modal).
   - Ejemplo: `rick-modal`.

4. **Unitario de orquestación (padre ↔ hijos)**
   - Verifica que el contenedor coordina componentes por eventos.
   - Ejemplo: `rick-container`.

5. **Unitario async con mocks**
   - Verifica fetch, paginación, búsqueda y estados vacíos.
   - Ejemplo: `rick-list`.

### 8) Flujo recomendado para escribir tests desde 0

1. Define el contrato de comportamiento en una frase.
2. Monta el componente mínimo en `document.body`.
3. Actúa (setters, click, input, dispatchEvent).
4. Aserta resultado visible o evento emitido.
5. Aísla dependencias externas (mock de fetch).
6. Limpia entorno tras cada caso.

### 9) Cómo ejecutar y leer cobertura

Ejecutar todo:

```bash
npm run test:c
```

Interpretación rápida:

- **Statements/Lines**: cuánto código ejecutan los tests.
- **Branches**: cuántos caminos condicionales (`if/else`) cubres.
- **Functions**: cuántas funciones fueron invocadas.

Si baja cobertura o falla un test, revisa el contrato roto (render, evento, transición, async).

### 10) Errores típicos en frontend testing (y cómo evitarlos)

- No limpiar DOM entre tests → tests intermitentes.
- Usar API real en tests → lentitud e inestabilidad.
- Verificar implementación interna en vez de comportamiento visible.
- Meter demasiadas aserciones en un solo test con objetivo ambiguo.

### 11) Buenas prácticas aplicadas en este repo

- Naming BDD: `Given ...` / `Then ...`.
- Un test, una intención principal.
- Fixtures para no duplicar datos.
- Mock explícito de red.
- Cobertura útil centrada en `src/`.
