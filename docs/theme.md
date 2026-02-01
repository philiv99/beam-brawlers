# Beam Brawlers - Theme Documentation

## LinkittyDo Brand Compliance

This game follows the LinkittyDo visual identity: playful mid-century/retro aesthetic with bold typography, geometric shapes, and high-contrast colors.

---

## Color Palette

### Primary Tokens
| Token | Hex | Usage |
|-------|-----|-------|
| `--ld-cream` | #FDEC92 | Primary backgrounds, beam surface |
| `--ld-mint` | #A9EAD2 | Geometric panels, health/stamina positive |
| `--ld-ink` | #161813 | Primary text, outlines |
| `--ld-pop` | #FB2B57 | CTAs, highlights, damage indicators |
| `--ld-paper` | #EEEDE5 | Secondary backgrounds, cards |

### Extended Palette (Wrestling Theme)
| Token | Hex | Usage |
|-------|-----|-------|
| `--bb-gold` | #FFD700 | Score highlights, winner effects |
| `--bb-blue` | #4A90D9 | Player 1 accent |
| `--bb-red` | #E74C3C | Player 2 / AI accent |
| `--bb-warning` | #F39C12 | Low balance/stamina warning |

---

## Typography

### Fonts
- **Headlines / Logo**: `Bungee` (Google Fonts) - Bold, chunky, retro
- **UI / Body**: `Nunito` (Google Fonts) - Clean, readable, friendly

### Scale
| Element | Size | Weight | Font |
|---------|------|--------|------|
| Game Title | 48-64px | 400 | Bungee |
| Move Callouts | 36-48px | 400 | Bungee |
| HUD Labels | 14-16px | 700 | Nunito |
| HUD Values | 18-24px | 800 | Nunito |
| Body Text | 16px | 400 | Nunito |
| Buttons | 18px | 700 | Nunito |

---

## UI Components

### Buttons
- Chunky, rounded corners (8-12px radius)
- Thick borders (3-4px)
- Soft drop shadows
- Hover: slight scale (1.05) + shadow increase
- Active: scale down (0.98)

### Meters (Balance/Stamina)
- Pill-shaped containers with ink border
- Fill gradient from warning → positive
- Animated fill transitions

### Score Display
- Large, bold numbers
- Gold highlight on score change
- Subtle pulse animation on update

### Move Callouts
- Full-screen overlay text
- Bungee font, large size
- Quick fade-in, hold, fade-out
- Optional screen shake

---

## Arena Styling

### Balance Beam
- Wood-textured appearance (cream/tan gradient)
- Thick ink outline
- Subtle shadow beneath
- Edge markers near ends (danger zones)

### Background
- Gradient from cream to mint
- Geometric shapes (circles, triangles) as decorative elements
- Gymnasium/arena feel

### Fall Zone
- Below beam, darker area
- Visual indicator of "out of bounds"

---

## Animation Guidelines

### Timing
- UI transitions: 200-300ms ease-out
- Move callouts: 150ms in, 500ms hold, 200ms out
- Meter updates: 300ms ease-in-out

### Motion Principles
- Respect `prefers-reduced-motion`
- Keep gameplay animations snappy
- Use easing for polish, not delay

---

## Screenshots

(To be added as development progresses)
