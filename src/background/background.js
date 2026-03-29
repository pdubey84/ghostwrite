/**
 * Background service worker entry point.
 * Handles message routing between popup/content scripts and modules.
 */

import { getSettings, generateComment } from "./api.js";
import { getHistory } from "./history.js";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || !message.type) return;

    if (message.type === "GET_SETTINGS") {
        getSettings()
            .then((settings) => sendResponse({ ok: true, settings }))
            .catch((error) => sendResponse({ ok: false, error: error.message }));
        return true;
    }

    if (message.type === "GENERATE_COMMENT") {
        generateComment(message.payload || {})
            .then((result) => sendResponse({ ok: true, ...result }))
            .catch((error) => sendResponse({ ok: false, error: error.message }));
        return true;
    }

    if (message.type === "EXPORT_HISTORY") {
        getHistory()
            .then((history) => sendResponse({ ok: true, history }))
            .catch((error) => sendResponse({ ok: false, error: error.message }));
        return true;
    }

    if (message.type === "OPEN_POPUP") {
        // chrome.action.openPopup() requires Chrome 127+.
        // Fallback gracefully if the API is not available.
        if (chrome.action && chrome.action.openPopup) {
            chrome.action.openPopup().catch(() => { });
        }
        return false;
    }
});
