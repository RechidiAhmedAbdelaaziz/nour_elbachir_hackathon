# Element Attribute Viewer - Browser Extension

A Chrome/Edge extension that lets you click on any element on a webpage to view its HTML attributes.

## Features

- Click any element on a webpage to see all its attributes
- Visual highlighting of selected elements
- Clean, floating info panel showing attribute names and values
- Works on all websites

## Installation Instructions

### For Chrome:

1. Build the extension (already done):
   ```bash
   npm run build
   ```

2. Open Chrome and go to: `chrome://extensions/`

3. Enable **Developer mode** (toggle in the top right)

4. Click **Load unpacked**

5. Select the `dist` folder from this project

6. The extension is now installed!

### For Edge:

1. Build the extension (already done):
   ```bash
   npm run build
   ```

2. Open Edge and go to: `edge://extensions/`

3. Enable **Developer mode** (toggle on the left)

4. Click **Load unpacked**

5. Select the `dist` folder from this project

6. The extension is now installed!

## How to Use

1. Navigate to any website
2. The extension automatically activates
3. Click on any element to see its attributes in a popup panel
4. The selected element will be highlighted with a green outline
5. Click the "Close" button to dismiss the info panel

## Development

- **Build**: `npm run build`
- **Watch mode**: `npm run watch` (auto-rebuilds on file changes)

## Files Structure

- `src/content.ts` - Main extension logic
- `manifest.json` - Extension configuration
- `icon.png` - Extension icon
- `dist/` - Built extension files (load this folder in browser)
