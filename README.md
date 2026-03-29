# Thoughtful Comment Ghostwriter

A Chrome extension that generates high-signal, thoughtful comments for LinkedIn and Reddit posts using OpenAI.

## Features

- **Platform Support**: LinkedIn and Reddit post extraction
- **Thought Leadership Modes**: Builder, Strategist, Operator, Contrarian, Teacher, Curious Connector
- **Voice Profile**: Customizable tone and style
- **History**: Auto-saved generation history with JSON export

## Project Structure

```
ghostwriter/
├── manifest.json                     Chrome extension manifest (MV3)
├── README.md
├── src/
│   ├── background/                   Service worker (ES modules)
│   │   ├── background.js             Message router entry point
│   │   ├── api.js                    OpenAI integration & comment generation
│   │   ├── history.js                Generation history persistence
│   │   └── prompt.js                 Prompt builder
│   ├── content/                      Content scripts (global scope)
│   │   ├── content.js                Message listener & platform router
│   │   ├── dom-utils.js              Shared DOM utilities
│   │   ├── linkedin.js               LinkedIn extractor
│   │   └── reddit.js                 Reddit extractor
│   ├── options/                      Settings page
│   │   ├── options.html
│   │   └── options.js
│   ├── popup/                        Extension popup
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   └── shared/                       Shared utilities
│       └── storage.js                Chrome storage helpers
└── icons/                            Extension icons (add your own)
```

## Local Development

1. Open `chrome://extensions/` in Chrome
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select this `ghostwriter` folder
4. Open the extension settings and add your OpenAI API key
5. Navigate to a LinkedIn or Reddit post and click the extension icon

To reload after changes, click the **refresh** icon on the extension card.

## Adding a New Platform

1. Create `src/content/<platform>.js` with an `extract<Platform>()` function
2. Add the platform's URL pattern to `manifest.json` (`host_permissions` + `content_scripts.matches`)
3. Add the new JS file to `manifest.json` → `content_scripts.js` (before `content.js`)
4. Update `extractPageData()` in `src/content/content.js` to route to your extractor
