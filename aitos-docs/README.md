# AITOS Documentation

This directory contains the documentation for the AITOS multi-agent framework, built with [Nextra](https://nextra.site/), a Next.js-based documentation site generator using the App Router.

## Getting Started

First, install the dependencies:

```bash
pnpm install
# or
npm install
# or
yarn install
```

Then, run the development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the documentation site.

## Documentation Structure

- `app/`: Contains the Next.js App Router structure with MDX documentation pages
- `app/framework-overview/`: Framework overview documentation
- `app/quick-start/`: Quick start guide documentation
- `app/event-task-system/`: Event-task system documentation
- `app/extensibility/`: Documentation about extensibility with modules and blueprints
- `app/multi-agent/`: Multi-agent communication documentation
- `app/code-examples/`: Documentation with code examples
- `app/api-reference/`: API reference documentation
- `public/images/`: Contains diagrams and visual assets
- `theme.config.tsx`: Nextra theme configuration

## Building for Production

```bash
pnpm build
# or
npm run build
# or
yarn build
```

The static output will be generated in the `out` directory.

The documentation covers:

1. **Framework Overview** - Core components and architecture of AITOS
2. **Quick Start Guide** - How to set up your first AITOS agent
3. **Event-Task System** - The event-task mechanism that drives AITOS
4. **Extensibility** - How to extend AITOS with modules and blueprints
5. **Multi-Agent Communication** - Group sensing mechanism for agent collaboration
6. **Code Examples** - Practical examples for common use cases
7. **API Reference** - Interfaces and types reference

## Building for Production

To build the documentation site for production:

```bash
pnpm build
pnpm start
```

To export as static HTML:

```bash
pnpm build
```

## Contributing

When contributing to the documentation, please follow the existing style and formatting, use clear language, and include code examples where appropriate.
