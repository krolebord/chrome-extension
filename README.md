# untabber

A Chrome extension for efficient tab management, built with Vite + React, and Manifest v3.

## Features

- 🚀 Quick tab navigation with keyboard shortcuts
- 🔄 Tab preloading for faster switching
- 🪟 Merge tabs from multiple windows
- 📸 Tab snapshots with sync support

## Keyboard Shortcuts

- `Ctrl+X` - Close current tab and switch to next
- `Ctrl+A` - Switch to next tab
- `Ctrl+M` - Merge all tabs into current window

## Installation

1. Node.js version >= **14**
2. pnpm

```shell
pnpm install
```

## Development

1. Enable Chrome's Developer mode
2. Run the build command:
```shell
npm run build
```
3. Click "Load unpacked" in Chrome Extensions
4. Select the `build` folder
5. Run `pnpm run dev`

## Package for Distribution

Create a distributable zip file:

```shell
npm run package
```
