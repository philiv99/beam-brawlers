# Beam Brawlers - Copilot Instructions

## Project Overview

**Beam Brawlers** is a browser-based 2D wrestling game on a balance beam. Built with React + TypeScript + Vite, fully client-side.

## Game Identity

- **Game Name:** Beam Brawlers
- **Repo Slug:** beam-brawlers
- **Storage Prefix:** beam-brawlers:

## Key Conventions

### File Structure
```
src/
  engine/       # Game loop, input, audio
  game/
    logic/      # Pure game rules (testable)
    scenes/     # Title, Playing, GameOver
    constants.ts
  theme/        # LinkittyDo styling
  ui/
    components/ # Reusable UI
    overlays/   # Modals, HUD
  utils/        # Helpers
```

### Code Style
- Functional components + hooks
- Pure functions for game logic
- State machine pattern for fighters
- Fixed timestep game loop (separate from React render)

### Naming
- Components: PascalCase
- Functions/hooks: camelCase
- Constants: UPPER_SNAKE_CASE
- Types: PascalCase with descriptive suffixes

### Testing
- Unit tests in `tests/`
- Focus on game logic (moves, scoring, validation)
- Use Vitest

### Theme
- Follow LinkittyDo palette (see docs/theme.md)
- Use CSS variables from theme/global.css
- Fonts: Bungee (headlines), Nunito (UI)

## Development Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview build
npm test         # Run tests
```

## Key Game Mechanics
- **Moves:** Pancake (J), Scissors (K), Guillotine (L)
- **Grapple:** SPACE when in range
- **Pin:** P when opponent is stunned/prone
- **Movement:** A/D along beam, W/S for balance
- **Defense:** SHIFT to brace/recover

## Win Condition
Pin opponent on the beam for 3 seconds.
