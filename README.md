# SneakerStore - Tienda de Zapatillas

Tienda de zapatillas construida con **Astro**, siguiendo **Screaming Architecture** y **Atomic Design**.

## 🏗️ Arquitectura

Este proyecto sigue dos principios arquitectónicos principales:

### Screaming Architecture
La estructura de carpetas está organizada por **features** (características/funcionalidades) en lugar de por tipo de archivo:

```
src/
  features/
    products/          # Feature: Productos
      components/      # Componentes específicos de productos
      services/        # Lógica de negocio de productos
      types/           # Tipos específicos de productos
    cart/              # Feature: Carrito
      components/
      services/
      types/
  shared/              # Recursos compartidos
    components/        # Componentes reutilizables
    layouts/           # Layouts
    types/             # Tipos compartidos
    utils/             # Utilidades
```

### Atomic Design
Los componentes están organizados en tres niveles:

- **Atoms** (Átomos): Componentes básicos e indivisibles
  - Button, Input, Image, Text, Heading, Card

- **Molecules** (Moléculas): Combinaciones de átomos
  - ProductCard, SearchBar

- **Organisms** (Organismos): Combinaciones complejas de moléculas y átomos
  - Header, Footer, ProductGrid

## 📁 Estructura de Carpetas

```
src/
├── features/
│   ├── products/
│   │   ├── components/
│   │   │   ├── molecules/
│   │   │   │   ├── ProductCard/
│   │   │   │   └── SearchBar/
│   │   │   └── organisms/
│   │   │       └── ProductGrid/
│   │   └── services/
│   │       └── product.service.ts
│   └── cart/
│       └── services/
│           └── cart.service.ts
├── shared/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Heading/
│   │   │   ├── Image/
│   │   │   ├── Input/
│   │   │   └── Text/
│   │   └── organisms/
│   │       ├── Header/
│   │       └── Footer/
│   ├── layouts/
│   │   └── MainLayout.astro
│   └── types/
│       ├── product.types.ts
│       └── index.ts
├── pages/
│   ├── index.astro
│   ├── productos/
│   │   ├── index.astro
│   │   └── [id].astro
│   └── carrito.astro
└── styles/
    ├── app.scss
    ├── _breakpoints.scss
    ├── _global.scss
    └── _mixins.scss
```

## 🚀 Comenzar

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## 🎨 Sistema de Diseño

El proyecto utiliza un sistema de diseño basado en:

- **Variables CSS**: Colores, tipografías, espaciados definidos en `_global.scss`
- **Breakpoints**: Mixins responsive definidos en `_breakpoints.scss`
- **Mixins**: Utilidades reutilizables en `_mixins.scss`

## 📦 Características

- ✅ Arquitectura modular (Screaming Architecture)
- ✅ Diseño atómico (Atomic Design)
- ✅ TypeScript para type safety
- ✅ SCSS para estilos
- ✅ Responsive design
- ✅ Componentes reutilizables
- ✅ Servicios para lógica de negocio
- ✅ Páginas: Home, Productos, Detalle de Producto, Carrito

## 🛠️ Tecnologías

- **Astro**: Framework web
- **TypeScript**: Type safety
- **SCSS**: Estilos
- **HTML/CSS**: Markup y estilos

## 📝 Notas

- Los productos están definidos en `src/features/products/services/product.service.ts`
- El carrito es funcional pero necesita integración con estado global para persistencia
- Las imágenes utilizan URLs de Unsplash como placeholders

## 🔄 Próximos Pasos

- [ ] Integrar estado global para el carrito
- [ ] Agregar persistencia del carrito (localStorage)
- [ ] Implementar filtros y ordenamiento de productos
- [ ] Agregar más páginas (sobre nosotros, contacto, etc.)
- [ ] Integrar con API backend
- [ ] Agregar tests
- [ ] Optimizar imágenes
