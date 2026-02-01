# Beam Brawlers - Development Plan

## Game Identity

| Field | Value |
|-------|-------|
| **Game Name** | Beam Brawlers |
| **Repo Slug** | beam-brawlers |
| **Storage Prefix** | beam-brawlers: |
| **Display Title** | Beam Brawlers |
| **Short ID** | beam-brawlers |

## Game Concept

**Gymnastics meets grappling**: Two fighters compete on a balance beam, executing wrestling moves (Pancake, Scissors, Guillotine) while managing balance and stamina. Score points with successful moves, then secure a **3-second pin** on the beam to win.

---

## Development Phases

### Phase 0: Project Setup
- [x] Select game name and repo slug
- [x] Create repo folder structure
- [x] Initialize git repository
- [ ] Create GitHub remote repository
- [x] Scaffold Vite + React + TypeScript
- [x] Create docs/beam-brawlers_creation.md
- [ ] Create docs/theme.md
- [ ] Set up LinkittyDo theme files
- [ ] Update package.json with correct name
- [ ] Initial commit and push

### Phase 1: Core Data Model
- [ ] Define game constants (moves, scoring, timers)
- [ ] Create FighterState type and state machine
- [ ] Create GameState type with match management
- [ ] Implement balance system
- [ ] Implement stamina system

### Phase 2: Game Logic (Pure Functions)
- [ ] Move prerequisites validation
- [ ] Pancake move implementation
- [ ] Scissors move implementation
- [ ] Guillotine move implementation
- [ ] Pin system logic
- [ ] Falling/reset logic
- [ ] Scoring with bonuses/penalties
- [ ] Counter/defense mechanics

### Phase 3: Game Engine
- [ ] Game loop with fixed timestep
- [ ] Input system (keyboard mappings)
- [ ] Collision detection (grapple range)
- [ ] State transitions and timers

### Phase 4: Rendering & UI
- [ ] Canvas-based arena renderer
- [ ] Balance beam visualization
- [ ] Fighter sprites/visuals
- [ ] HUD components (scores, meters, timers)
- [ ] Move callout animations
- [ ] Title screen scene
- [ ] Playing scene
- [ ] Game over/victory scene
- [ ] How to Play overlay

### Phase 5: AI Opponent
- [ ] AI decision loop (10-20Hz)
- [ ] Behavior tree / utility scoring
- [ ] Move selection logic
- [ ] Position management

### Phase 6: Polish & Testing
- [ ] Animation refinements
- [ ] Visual feedback (hit flash, shake)
- [ ] Sound hooks (optional)
- [ ] Unit tests for game logic
- [ ] Integration testing
- [ ] Final acceptance testing
- [ ] Documentation updates

---

## Technical Decisions

### Rendering Approach
**Canvas 2D** - Chosen for smooth real-time animations, fighter movement, and visual effects. React handles UI overlays and scene management.

### State Management
- Game state managed via useReducer for predictable updates
- Fighter state machines for clear behavior modeling
- Pure logic functions in src/game/logic/ for testability

### Controls
- Keyboard-primary (A/D movement, SPACE grapple, J/K/L moves)
- Mouse for UI interactions only

---

## Notes & Decisions

### 2026-02-01: Project Initialization
- Selected "Beam Brawlers" as game name (short, memorable, clear concept)
- Using Canvas 2D for rendering due to real-time animation needs
- Will implement AI opponent as default gameplay mode
