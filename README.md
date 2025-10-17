# Better Anki

A modern spaced repetition flashcard application built with Vue 3, Quasar Framework, TailwindCSS, and the ts-fsrs algorithm.

## Features

- 🎯 Spaced repetition learning using the FSRS algorithm
- 🎨 Modern UI with Quasar Framework and TailwindCSS
- 📱 Responsive design
- 💾 State management with Pinia
- 🔧 TypeScript for type safety

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Quasar Framework** - Vue.js-based framework for building apps
- **TailwindCSS** - Utility-first CSS framework
- **Pinia** - State management for Vue
- **ts-fsrs** - Free Spaced Repetition Scheduler algorithm
- **TypeScript** - Typed superset of JavaScript
- **Vite** - Next generation frontend tooling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

## Project Structure

```
better-anki/
├── src/
│   ├── components/     # Vue components
│   ├── stores/         # Pinia stores
│   │   ├── counter.ts  # Example counter store
│   │   ├── fsrs.ts     # FSRS card management store
│   │   └── index.ts    # Store exports
│   ├── pages/          # Page components
│   ├── layouts/        # Layout components
│   ├── css/            # Global styles
│   │   └── app.css     # TailwindCSS imports
│   ├── App.vue         # Root component
│   └── main.ts         # Application entry point
├── index.html
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── tailwind.config.js  # TailwindCSS configuration
```

## FSRS Store

The FSRS store provides card management with spaced repetition scheduling:

- `createCard(id, front, back)` - Create a new flashcard
- `reviewCard(cardId, grade)` - Review a card with a grade (1-4)
- `getCardsDue()` - Get all cards that are due for review
- `getCard(cardId)` - Get a specific card
- `deleteCard(cardId)` - Delete a card

## License

ISC
