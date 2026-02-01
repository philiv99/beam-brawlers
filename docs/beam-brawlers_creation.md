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
- [x] Unit tests for game logic (84 tests passing)
- [ ] Integration testing
- [x] Final acceptance testing
- [x] Documentation updates

### Phase 7: Jump Mechanics (Added Feature)
- [x] Add jump constants (height, gravity, stamina cost)
- [x] Update Fighter type with y position and velocityY
- [x] Add jump physics logic (gravity, landing)
- [x] Add jump input (W key)
- [x] Add "Jump Over" ability (+50 bonus)
- [x] Add "Stomp" attack (+175 points, stuns opponent)
- [x] Update renderer for vertical movement
- [x] Update AI to use/react to jumps
- [x] Add tests for jump logic (16 new tests)
- [x] Update How to Play with jump controls

### Phase 8: Sound Effects & Fighter Names
- [x] Create AudioManager using Web Audio synthesis (no external files)
- [x] Add sound effects: jump, land, stomp, grapple, moves, pin, victory/defeat
- [x] Add mute toggle with localStorage persistence
- [x] Add mute button to Title screen
- [x] Create list of 30 Frank Zappa song titles for fighter names
- [x] Update Fighter type with name property
- [x] Assign random Zappa names to fighters each match
- [x] Display names in renderer and Game Over screen
- [x] Update tests (84 tests total passing)

---

## Technical Decisions

### Rendering Approach
**Canvas 2D** - Chosen for smooth real-time animations, fighter movement, and visual effects. React handles UI overlays and scene management.

### State Management
- Game state managed via useReducer for predictable updates
- Fighter state machines for clear behavior modeling
- Pure logic functions in src/game/logic/ for testability

### Controls
- Keyboard-primary (A/D movement, W jump, SPACE grapple, J/K/L moves)
- Mouse for UI interactions only

### Jump Mechanics
- W key initiates jump (costs 15 stamina)
- Gravity physics: JUMP_VELOCITY = -400, GRAVITY = 1200
- Landing costs 10 balance
- Stomp attack: Land on opponent for +175 points and stun
- Jump Over: Cross opponent at height for +50 bonus points
- Air movement: 60% speed control while jumping
- AI strategically uses jumps to approach or escape

### Audio System
- Web Audio API synthesis (no external sound files needed)
- Sounds: jump, land, stomp, grapple, pancake, scissors, guillotine, pin_start, pin_tick, victory, defeat, fall, countdown
- Mute toggle persisted in localStorage
- Audio initialized on first user interaction (browser policy compliance)

### Fighter Names
- Fighters get random names from Frank Zappa song titles
- 30 song titles in the pool (Peaches, Muffin Man, Cosmik Debris, etc.)
- Names displayed above fighters and in Game Over screen
- Each match gets fresh random names

---

## Notes & Decisions

### 2026-02-01: Project Initialization
- Selected "Beam Brawlers" as game name (short, memorable, clear concept)
- Using Canvas 2D for rendering due to real-time animation needs
- Will implement AI opponent as default gameplay mode

### 2026-02-01: Jump Feature Added
- Added jump mechanics allowing fighters to jump over or stomp on opponents
- W key changed from balance adjustment to jump
- Stomp is a powerful attack (+175 pts) but requires positioning
- Jump Over bonus encourages aggressive movement
- AI uses jumps strategically based on distance and situation

### 2026-02-01: Sound & Names Added
- Added Web Audio synthesis-based sound effects (no external files)
- Fighter names are now Frank Zappa song titles (adds personality and humor)
- Sound toggle persisted to localStorage for user preference
