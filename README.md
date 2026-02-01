# Beam Brawlers 🤼

**Gymnastics meets Grappling!** A browser-based 2D wrestling game where two fighters compete on a balance beam, executing wrestling moves while managing balance and stamina.

## 🎮 Game Concept

Fight for beam control, execute high-risk wrestling holds while balancing, rack up points, then secure a **3-second pin** on the beam for the win!

## 🏆 How to Win

- **Pin your opponent on the beam for 3 seconds** to win instantly
- If time runs out (90 seconds), highest score wins
- Score points by executing wrestling moves

## 🎯 Controls

| Key | Action |
|-----|--------|
| **A / D** | Move Left / Right |
| **W** | Jump |
| **SPACE** | Grapple (when close) |
| **SHIFT** | Defend / Brace |

### Jump Moves

| Action | Points | Description |
|--------|--------|-------------|
| **Stomp** | +175 | Land on opponent to stun them |
| **Jump Over** | +50 | Jump over opponent for bonus |

### Wrestling Moves (while grappling)

| Key | Move | Points |
|-----|------|--------|
| **J** | Pancake | +200 |
| **K** | Scissors | +150 |
| **L** | Guillotine | +250 |
| **P** | Pin Attempt | Win condition |

## 🎲 Scoring Bonuses

- **Balance Bonus (+20%)**: Execute moves with high balance
- **Edge Risk (+15%)**: Execute moves near beam edge
- **Combo Bonus (+10-30%)**: Chain different moves quickly

## 🛠️ Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

```bash
npm test
```

## 🎨 Theme

Built with the **LinkittyDo** visual identity:
- **Colors**: Cream (#FDEC92), Mint (#A9EAD2), Ink (#161813), Pop (#FB2B57)
- **Fonts**: Bungee (headlines), Nunito (UI)
- **Style**: Playful mid-century/retro aesthetic

## 📁 Project Structure

```
src/
├── engine/          # Game loop, input, renderer
├── game/
│   ├── logic/       # Pure game rules (testable)
│   ├── ai.ts        # AI opponent
│   ├── constants.ts # Game configuration
│   ├── types.ts     # TypeScript types
│   └── gameReducer.ts
├── hooks/           # React hooks
├── theme/           # LinkittyDo styling
└── ui/components/   # React UI components
```

## 📋 Game Identity

- **Game Name**: Beam Brawlers
- **Repo Slug**: beam-brawlers
- **Storage Prefix**: beam-brawlers:

---

*A LinkittyDo Game* 🐱
