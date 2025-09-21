# AI Portfolio

<div align="center">
  <img src="public/logo.png" alt="AI Portfolio Logo" width="200" />
</div>

An interactive AI portfolio featuring a 3D VRM avatar with advanced look-at functionality. This portfolio showcases modern web technologies including Next.js, Three.js, and VRM (Virtual Reality Model) integration.

## Features

### 🎯 Interactive VRM Avatar
- **Mouse-following look-at**: The 3D avatar's eyes and head follow your cursor for natural interaction
- **Smooth animations**: Built-in idle animations and smooth eye movement transitions
- **VRM model support**: Full compatibility with VRM 1.0 specifications
- **Drag-and-drop**: Easy VRM model replacement via drag-and-drop functionality

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **3D Graphics**: Three.js
- **VRM Support**: @pixiv/three-vrm
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **TypeScript**: Full type safety

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## VRM Model Setup

### Default Models
The project includes several pre-loaded VRM models in the `public` directory:
- `model.vrm` - Primary avatar model
- `model2.vrm` - Secondary avatar model
- Various animation files (`.vrma`) for idle animations

### Adding Custom VRM Models
1. Place your `.vrm` file in the `public` directory
2. Update the model path in `src/components/vrm-viewer.tsx`
3. Or use the drag-and-drop feature to test models dynamically

### VRM Animation Support
The viewer supports VRM Animation (VRMA) files for:
- Idle loops
- Expression animations
- Custom gesture animations

## Architecture

### Core Components
- `src/features/vrmViewer/viewer.ts` - Main 3D viewer class with mouse tracking
- `src/features/vrmViewer/model.ts` - VRM model management
- `src/lib/VRMLookAtSmootherLoaderPlugin/` - Custom look-at implementation with smooth eye tracking
- `src/components/vrm-viewer.tsx` - React component wrapper

### Key Features Implementation
- **Mouse Tracking**: Real-time cursor position conversion to 3D world coordinates
- **Look-at Smoothing**: Advanced eye movement with saccade simulation for natural behavior
- **Head Rotation**: Combined eye and head movement for realistic avatar interaction
- **Performance Optimized**: Efficient rendering with frustum culling disabled for VRM models

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Development

### Project Structure
```
src/
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── vrm-viewer.tsx    # Main VRM viewer component
│   └── ui/               # shadcn/ui components
├── features/
│   └── vrmViewer/        # VRM viewer logic
│       ├── viewer.ts     # 3D viewer with mouse tracking
│       ├── model.ts      # VRM model management
│       └── viewerContext.ts
└── lib/
    ├── VRMAnimation/     # VRM animation utilities
    └── VRMLookAtSmootherLoaderPlugin/  # Custom look-at implementation
```

### Key Dependencies
- `three` - 3D graphics library
- `@pixiv/three-vrm` - VRM model support
- `three/examples/jsm/controls/OrbitControls` - Camera controls
- `@radix-ui/react-*` - UI primitives
