# Ghostwriter Prompts

This directory contains all prompt-related code for the Ghostwriter Chrome extension, consolidated for easier management.

## Files

- **`prompt-builder.js`** - Contains the `buildPrompt` function that constructs user prompts from post data
- **`system-prompt.js`** - Contains the system prompt used for OpenAI chat completions
- **`index.js`** - Main export file that consolidates all prompt functions

## Usage

```javascript
import { buildPrompt, SYSTEM_PROMPT } from '../prompts/index.js';

// Use in API calls
const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildPrompt(payload) }
];
```

## Structure

All prompts are now centralized in this directory, making it easier to:
- Modify prompt content
- Add new prompt variations
- Maintain consistent prompt formatting
- Test prompt changes independently
