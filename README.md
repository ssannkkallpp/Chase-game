# Chase Game

Browser-based game Chase, navigate the entire grid while avoiding your adversary, a red dot!!

## Tech Stack

- **Framework**: Next.js 15.1.0
- **Language**: TypeScript
- **UI**: React 19
- **Styling**: CSS

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

## Project Structure

```
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Main game page
│   │   └── rules/          # Rules page
│   └── components/         # React components
│       ├── GameCanvas.tsx  # Main game canvas
│       ├── GameControls.tsx # Game controls
│       ├── GameModal.tsx   # Game modals
│       ├── GameStats.tsx   # Game statistics
│       └── ParticleSystem.tsx # Visual effects
├── public/
│   └── assets/
│       └── audio/          # Game audio files
├── package.json
├── next.config.ts
└── tsconfig.json
```
